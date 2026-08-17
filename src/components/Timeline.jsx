import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CellEditor } from './CellEditor';
import { Pill } from './ui';
import { IS_CFG, IS_CFG_BASE, PH, SC, getISCfg, tn } from '../lib/constants';
import { fmtDate, getTaskDayMap, parseDate, weekStart } from '../lib/utils';

export function Timeline({tasks,setTasks,iStatus={},setIStatus}){
  const[tooltip,setTooltip]=useState(null);
  const[cellEd,setCellEd]=useState(null);
  const[fGrupo,setFGrupo]=useState([]);
  const[collapsed,setCollapsed]=useState(new Set());
  const initRef=useRef(false);
  const scrollRef=useRef(null);
  const headerRef=useRef(null);
  const todayColRef=useRef(null);

  const{allDays,allWeeks,mSpans,grouped}=useMemo(()=>{
    const now=new Date();
    // Always show full 2026: Jan to Dec, plus ensure today is always visible
    let minD=new Date(2026,0,1);
    let maxD=new Date(2026,11,31); // Dec 31, 2026
    // Expand if tasks have entries beyond 2026
    tasks.forEach(t=>{if(!t.a)return;t.a.split('\n').forEach(line=>{const m=line.match(/^(\d{1,2}\/\d{1,2})/);if(!m)return;const d=parseDate(m[1]);if(!d)return;if(d<minD)minD=d;if(d>maxD)maxD=d;});});
    tasks.forEach(t=>{if(!t.plan)return;t.plan.split('\n').forEach(line=>{const m=line.match(/^(\d{1,2}\/\d{1,2})/);if(!m)return;const d=parseDate(m[1]);if(!d)return;if(d<minD)minD=d;if(d>maxD)maxD=d;});});
    tasks.forEach(t=>{if(!t.plan)return;t.plan.split('\n').forEach(line=>{const m=line.match(/^(\d{1,2}\/\d{1,2})/);if(!m)return;const d=parseDate(m[1]);if(!d)return;if(d<minD)minD=d;if(d>maxD)maxD=d;});});
    // Include today
    if(now<minD)minD=new Date(now.getFullYear(),now.getMonth(),1);
    const pStart=weekStart(new Date(minD.getTime()-7*86400000));
    const pEnd=new Date(Math.max(maxD.getTime(),now.getTime())+14*86400000);
    const days=[];let cur=new Date(pStart);
    while(cur<=pEnd){const dow=cur.getDay();if(dow>=1&&dow<=5)days.push(new Date(cur));cur=new Date(cur.getTime()+86400000);}
    const wkMap={},wkList=[];
    days.forEach(d=>{const wk=weekStart(d).toISOString().slice(0,10);if(!wkMap[wk]){wkMap[wk]={key:wk,days:[]};wkList.push(wkMap[wk]);}wkMap[wk].days.push(d);});
    wkList.forEach(w=>{const last=w.days[w.days.length-1];w.label=fmtDate(w.days[0])+' - '+fmtDate(last);});
    const ms=[];let curM=null,mDC=0,mSt=0;
    wkList.forEach((w,wi)=>{
      const mid=w.days[Math.floor(w.days.length/2)];
      const ml=mid.toLocaleDateString('pt-BR',{month:'long'}).replace(/^\w/,c=>c.toUpperCase())+' '+String(mid.getFullYear()).slice(2);
      if(ml!==curM){if(curM)ms.push({lb:curM,dc:mDC,wc:wi-mSt,si:mSt});curM=ml;mDC=0;mSt=wi;}
      mDC+=w.days.length;
    });
    if(curM)ms.push({lb:curM,dc:mDC,wc:wkList.length-mSt,si:mSt});
    const grp={};
    const grupos=[...new Set(tasks.map(t=>t.g))].sort((a,b)=>{const ta=tasks.find(x=>x.g===a),tb=tasks.find(x=>x.g===b);return (ta?tn(ta.t):0)-(tb?tn(tb.t):0);});
    grupos.forEach(g=>{grp[g]=tasks.filter(t=>t.g===g).sort((a,b)=>tn(a.t)-tn(b.t));});
    return{allDays:days,allWeeks:wkList,mSpans:ms,grouped:grp};
  },[tasks]);

  useEffect(()=>{
    if(initRef.current||mSpans.length===0)return;
    initRef.current=true;
    // Collapse all months except current
    const now=new Date();
    const curLabel=now.toLocaleDateString('pt-BR',{month:'long'}).replace(/^\w/,c=>c.toUpperCase())+' '+String(now.getFullYear()).slice(2);
    const last=mSpans[mSpans.length-1].lb;
    const keepOpen=mSpans.some(m=>m.lb===curLabel)?curLabel:last;
    setCollapsed(new Set(mSpans.map(m=>m.lb).filter(l=>l!==keepOpen)));
  },[mSpans]);

  // Scroll to today column after render
  useEffect(()=>{
    if(!scrollRef.current||!headerRef.current)return;
    // Use a small delay to ensure DOM is ready
    const timer=setTimeout(()=>{
      const container=scrollRef.current;
      const header=headerRef.current;
      if(!container||!header)return;
      // Find today's column by looking for the highlighted cell
      const todayCell=container.querySelector('[data-today="true"]')||headerRef.current.querySelector('[data-today="true"]');
      if(todayCell){
        const cellLeft=todayCell.offsetLeft;
        const offset=Math.max(0,cellLeft-(container.clientWidth/2));
        container.scrollLeft=offset;
        header.scrollLeft=offset;
      }
    },150);
    return()=>clearTimeout(timer);
  },[mSpans]);

  const toggleMonth=lb=>setCollapsed(prev=>{const n=new Set(prev);n.has(lb)?n.delete(lb):n.add(lb);return n;});

  const fGrp=fGrupo.length>0?Object.fromEntries(Object.entries(grouped).filter(([g])=>fGrupo.includes(g))):grouped;

  const DW=32,CW=28,NW=380,RH=34;
  const todayK=new Date().toISOString().slice(0,10);
  const totalCols=mSpans.reduce((s,ms)=>s+(collapsed.has(ms.lb)?CW:ms.dc*DW),0);
  const SBG='#FFFFFF';

  const saveCellDay=(taskId,days,ph,note)=>{
    setTasks(prev=>prev.map(t=>{
      if(t.id!==taskId)return t;
      // Write to task.plan — never touches task.a (Board acompanhamento)
      let lines=(t.plan||'').split('\n').filter(l=>{const m=l.match(/^(\d{1,2}\/\d{1,2})/);return !(m&&days.includes(m[1]));});
      const newLines=days.map(ds=>ds+' - '+note);
      return{...t,plan:[...newLines,...lines].filter(Boolean).join('\n')};
    }));
  };
  const delCellDay=(taskId,dk,src)=>{
    // NEVER modify task.a (Board acompanhamento) from the timeline
    if(src==='board')return;
    const[,mmS,ddS]=dk.split('-');const ds=ddS+'/'+mmS;
    setTasks(prev=>prev.map(t=>{
      if(t.id!==taskId)return t;
      const lines=(t.plan||'').split('\n').filter(l=>{const m=l.match(/^(\d{1,2}\/\d{1,2})/);return !(m&&m[1]===ds);});
      return{...t,plan:lines.join('\n')};
    }));
  };

  return(
    <div>
      <div style={{padding:'10px 24px',borderBottom:'1px solid var(--border)',display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',justifyContent:'space-between',background:'var(--bg2)'}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:9,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8}}>Fases</span>
          {Object.entries(PH).filter(([k])=>k!=='CUSTOM').map(([k,p])=><span key={k} style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:p.col}}><span style={{width:10,height:10,borderRadius:2,background:p.sl}}/>{k==='DEV'?'Desenvolvedor':p.lb}</span>)}<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:'#6366F1'}}><span style={{width:10,height:10,borderRadius:2,background:'rgba(99,102,241,.75)'}}/>Personalizada</span>
        </div>
        <div style={{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
          {Object.keys(grouped).map(g=><Pill key={g} val={g.length>18?g.slice(0,18)+'...':g} active={fGrupo.includes(g)} onClick={()=>setFGrupo(prev=>prev.includes(g)?prev.filter(x=>x!==g):[...prev,g])}/>)}
          {fGrupo.length>0&&<button onClick={()=>setFGrupo([])} style={{fontSize:10,color:'#F87171',background:'none',border:'none',cursor:'pointer'}}>x</button>}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 130px)',overflow:'hidden',borderTop:'1px solid var(--border)'}}>
        {/* ── Fixed header area (synced horizontally) ── */}
        <div ref={headerRef} style={{overflowX:'hidden',flexShrink:0,boxShadow:'0 2px 6px rgba(0,0,0,.07)',zIndex:20,position:'relative'}}>
          <div style={{display:'inline-block',minWidth:NW+totalCols+2}}>
          {/* Month row */}
          <div style={{display:'flex',background:SBG,borderBottom:'1px solid var(--border2)'}}>
            <div style={{width:NW,flexShrink:0,position:'sticky',left:0,zIndex:5,background:SBG,borderRight:'1px solid var(--border2)',borderBottom:'1px solid var(--border2)'}}/>
            {mSpans.map((ms,i)=>{
              const isC=collapsed.has(ms.lb);
              return <div key={i} onClick={()=>toggleMonth(ms.lb)} style={{width:isC?CW:ms.dc*DW,flexShrink:0,padding:isC?'2px 0':'5px 8px',background:'var(--bg2)',fontSize:isC?9:11,fontWeight:700,color:isC?'var(--txt3)':'var(--txt1)',textAlign:'center',borderBottom:'1px solid var(--border2)',borderLeft:'1px solid var(--border2)',overflow:'hidden',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {isC?<span style={{writingMode:'vertical-rl',fontSize:9,color:'var(--txt3)',transform:'rotate(180deg)',padding:'4px 0'}}>{'> '+ms.lb}</span>:<React.Fragment><span style={{fontSize:9,opacity:.5,marginRight:3}}>v</span>{ms.lb}</React.Fragment>}
              </div>;
            })}
          </div>
          {/* Week row */}
          <div style={{display:'flex',background:SBG}}>
            <div style={{width:NW,flexShrink:0,position:'sticky',left:0,zIndex:5,background:'#FFFFFF',borderRight:'1px solid var(--border2)',borderBottom:'1px solid var(--border)'}}/>
            {mSpans.map((ms,i)=>{
              if(collapsed.has(ms.lb))return <div key={i} style={{width:CW,flexShrink:0,borderLeft:'1px solid var(--border2)',borderBottom:'1px solid var(--border)',background:'var(--bg1)'}}/>;
              return allWeeks.slice(ms.si,ms.si+ms.wc).map((w,wi)=><div key={wi} style={{width:w.days.length*DW,flexShrink:0,padding:'3px 3px',background:'var(--bg1)',fontSize:8,fontWeight:600,color:'var(--txt3)',textAlign:'center',borderBottom:'1px solid var(--border)',borderLeft:'1px solid var(--border2)',overflow:'hidden',whiteSpace:'nowrap'}}>{w.label}</div>);
            })}
          </div>
          {/* Day row */}
          <div style={{display:'flex',background:SBG}}>
            <div style={{width:NW,flexShrink:0,position:'sticky',left:0,zIndex:5,padding:'3px 10px 3px 24px',fontSize:8,fontWeight:700,color:'var(--txt3)',background:SBG,borderRight:'1px solid var(--border2)',borderBottom:'1px solid var(--border)',letterSpacing:.5,textTransform:'uppercase',display:'flex',alignItems:'center'}}>Tarefa</div>
            {mSpans.map((ms,i)=>{
              if(collapsed.has(ms.lb))return <div key={i} style={{width:CW,flexShrink:0,borderLeft:'1px solid var(--border2)',borderBottom:'1px solid var(--border)',background:SBG}}/>;
              return allWeeks.slice(ms.si,ms.si+ms.wc).map((w,wi)=>(
                <React.Fragment key={wi}>{w.days.map(d=>{const dk=d.toISOString().slice(0,10);const isT=dk===todayK;const isM=d.getDay()===1;return <div key={dk} data-today={isT?"true":undefined} style={{width:DW,flexShrink:0,padding:'3px 1px',fontSize:8,fontWeight:isT?700:400,color:isT?'var(--cyan)':'var(--txt3)',textAlign:'center',background:isT?'rgba(34,211,238,.08)':SBG,borderBottom:'1px solid var(--border)',borderLeft:isM?'1px solid var(--border2)':'1px solid var(--border)',overflow:'hidden',whiteSpace:'nowrap'}}>{String(d.getDate()).padStart(2,'0')}/{String(d.getMonth()+1).padStart(2,'0')}</div>;})}</React.Fragment>
              ));
            })}
          </div>
          </div>{/* end header inner */}
        </div>{/* end headerRef */}
        {/* ── Scrollable content area ── */}
        <div ref={scrollRef} style={{flex:1,overflowX:'auto',overflowY:'auto'}}
          onScroll={e=>{if(headerRef.current)headerRef.current.scrollLeft=e.currentTarget.scrollLeft;}}>
          <div style={{display:'inline-block',minWidth:NW+totalCols+2}}>
          {/* Task rows */}
          {Object.entries(fGrp).map(([grupo,gtasks])=>(
            <React.Fragment key={grupo}>
              <div style={{display:'flex',alignItems:'stretch',marginTop:12,minHeight:28}}>
                <div style={{width:NW,flexShrink:0,position:'sticky',left:0,zIndex:10,padding:'0 8px 0 0',borderRight:'1px solid var(--border2)',background:'#FFFFFF',display:'flex',alignItems:'stretch',borderTop:`2px solid ${iStatus[grupo]?getISCfg(iStatus[grupo]).c:'var(--border2)'}`}}>
                  <div style={{width:4,background:iStatus[grupo]?getISCfg(iStatus[grupo]).c:'var(--border)',flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0,padding:'5px 8px',display:'flex',flexDirection:'column',justifyContent:'center',gap:3}}>
                    <span style={{fontSize:10,fontWeight:700,color:'var(--txt1)',lineHeight:1.4,wordBreak:'break-word',overflowWrap:'break-word'}}>{grupo}</span>
                    {setIStatus&&<select value={iStatus[grupo]||''} onChange={e=>setIStatus(prev=>({...prev,[grupo]:e.target.value}))} style={{alignSelf:'flex-start',fontSize:9,fontWeight:600,padding:'1px 7px 1px 4px',borderRadius:99,border:'1px solid '+(iStatus[grupo]?getISCfg(iStatus[grupo]).c+'55':'var(--border)'),background:iStatus[grupo]?getISCfg(iStatus[grupo]).bg:'transparent',color:iStatus[grupo]?getISCfg(iStatus[grupo]).c:'var(--txt3)',cursor:'pointer',outline:'none',appearance:'none',WebkitAppearance:'none'}}>
                      <option value="">+ status</option>
                      {Object.keys(IS_CFG).length?Object.keys(IS_CFG):Object.keys(IS_CFG_BASE).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>}
                  </div>
                </div>
                {mSpans.map((ms,mi)=>{
                  if(collapsed.has(ms.lb))return <div key={mi} style={{width:CW,flexShrink:0,borderLeft:'1px solid var(--border2)',background:'rgba(255,255,255,.012)'}}/>;
                  return allWeeks.slice(ms.si,ms.si+ms.wc).map((w,wi)=>w.days.map(d=><div key={d.toISOString().slice(0,10)} style={{width:DW,flexShrink:0,background:'rgba(255,255,255,.01)',borderLeft:d.getDay()===1?'1px solid var(--border2)':'1px solid var(--border)'}}/>));
                })}
              </div>
              {gtasks.map(task=>{
                const dmap=getTaskDayMap(task);
                const cfg=SC[task.s]||{};
                return(
                  <div key={task.id} style={{display:'flex',alignItems:'stretch',minHeight:RH,borderBottom:'1px solid var(--border)'}} onMouseLeave={()=>{if(!cellEd)setTooltip(null);}}>
                    <div style={{width:NW,flexShrink:0,position:'sticky',left:0,zIndex:10,padding:'5px 10px 5px 24px',display:'flex',alignItems:'flex-start',gap:5,borderRight:'1px solid var(--border2)',background:'#FFFFFF'}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:cfg.d||'#64748B',flexShrink:0,marginTop:3}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:12,color:'var(--txt1)',lineHeight:1.4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',display:'block'}}>{task.t}</span>
                        {task.c&&<span style={{fontFamily:'monospace',fontSize:8,color:'var(--txt3)',display:'block',marginTop:1}}>{task.c}</span>}
                      </div>
                    </div>
                    {mSpans.map((ms,mi)=>{
                      if(collapsed.has(ms.lb)){
                        const hasAct=allWeeks.slice(ms.si,ms.si+ms.wc).some(w=>w.days.some(d=>!!dmap[d.toISOString().slice(0,10)]));
                        return <div key={mi} style={{width:CW,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',borderLeft:'1px solid var(--border2)'}}>{hasAct&&<span style={{width:5,height:5,borderRadius:'50%',background:'rgba(34,211,238,.5)'}}/>}</div>;
                      }
                      return allWeeks.slice(ms.si,ms.si+ms.wc).map((w,wi)=>(
                        <React.Fragment key={wi}>{w.days.map(d=>{
                          const dk=d.toISOString().slice(0,10);
                          const act=dmap[dk];const isM=d.getDay()===1;const isT=dk===todayK;
                          const ph=act?PH[act.ph]:null;
                          const lbl=act?(act.ph==='CUSTOM'&&act.cl?act.cl.slice(0,7):act.ph==='DEV'&&task.r?task.r.split(' ')[0].slice(0,6):ph.lb):null;
                          return(
                            <div key={dk} ref={isT?todayColRef:null} className={act?'gc':''} style={{width:DW,flexShrink:0,position:'relative',background:act?ph.sl:isT?'rgba(34,211,238,.1)':'transparent',borderLeft:isM?'1px solid var(--border2)':'1px solid var(--border)',cursor:'pointer'}}
                              onMouseEnter={e=>{if(act&&!cellEd)setTooltip({task,dk,act,x:e.clientX,y:e.clientY});}}
                              onMouseLeave={()=>{if(!cellEd)setTooltip(null);}}
                              onClick={e=>{e.stopPropagation();setTooltip(null);const[,mmS,ddS]=dk.split('-');setCellEd({task,dk,act:act||null,x:e.clientX,y:e.clientY,df:ddS+'/'+mmS});}}>
                              {act&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',pointerEvents:'none'}}><span style={{fontSize:7,fontWeight:700,color:'rgba(0,0,0,.75)',whiteSpace:'nowrap',maxWidth:DW-2,overflow:'hidden',textAlign:'center'}}>{lbl}</span></div>}
                              {isT&&!act&&<div style={{position:'absolute',top:0,bottom:0,left:0,width:1,background:'rgba(34,211,238,.35)'}}/>}
                            </div>
                          );
                        })}</React.Fragment>
                      ));
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
          </div>{/* end content inner */}
        </div>{/* end scrollRef */}
      </div>{/* end outer flex column */}
      {tooltip&&!cellEd&&(
        <div style={{position:'fixed',left:Math.min(tooltip.x+12,window.innerWidth-280),top:Math.max(tooltip.y-100,8),background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:10,padding:'11px 14px',zIndex:60,maxWidth:270,boxShadow:'0 8px 32px rgba(0,0,0,.6)',pointerEvents:'none'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--txt1)',marginBottom:5,lineHeight:1.4}}>{tooltip.task.t}</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
            <span style={{width:7,height:7,borderRadius:2,background:PH[tooltip.act.ph].sl}}/>
            <span style={{fontSize:11,color:PH[tooltip.act.ph].col,fontWeight:600}}>{tooltip.act.ph==='CUSTOM'&&tooltip.act.cl?tooltip.act.cl:tooltip.act.ph==='DEV'&&tooltip.task.r?tooltip.task.r:PH[tooltip.act.ph].lb}</span>
            <span style={{fontSize:9,color:'var(--txt3)'}}>{tooltip.dk.split('-').slice(1).reverse().join('/')}</span>
          </div>
          {tooltip.act.lines.map((line,i)=>{const[dt,...rest]=line.split(' - ');return <div key={i} style={{display:'flex',gap:6,fontSize:10}}><span style={{color:'var(--cyan)',opacity:.7,fontFamily:'monospace',minWidth:32,flexShrink:0}}>{dt}</span><span style={{color:'var(--txt2)'}}>{rest.join(' - ')}</span></div>;})}
          <div style={{marginTop:6,fontSize:9,color:'var(--txt3)'}}>Clique para editar</div>
        </div>
      )}
      {cellEd&&<CellEditor ced={cellEd} onSave={saveCellDay} onDelete={delCellDay} onClose={()=>setCellEd(null)}/>}
    </div>
  );
}

