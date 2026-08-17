import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Ic, SortIcon, TipoBadge } from './ui';
import { SC, SCY, avColor, getISCfg, tn } from '../lib/constants';
import { sortLog } from '../lib/utils';

export function BoardView({tasks,setTasks,openCreate,openEdit,iStatus={},setIStatus,openBulkCreate,statusProduto=[],tipos={}}){
  const[search,setSearch]=useState('');
  const[fStatus,setFStatus]=useState([]);
  const[fResp,setFResp]=useState([]);
  const[sortCol,setSortCol]=useState(null);
  const[sortDir,setSortDir]=useState(null);
  const[expanded,setExpanded]=useState(new Set());
  const[groupBy,setGroupBy]=useState(true);
  const[fGrupo,setFGrupo]=useState([]);
  const[selected,setSelected]=useState(new Set());
  const[bulkModal,setBulkModal]=useState(false);
  const[collapsedGroups,setCollapsedGroups]=useState(new Set());
  const toggleGroupCollapse=g=>setCollapsedGroups(prev=>{const s=new Set(prev);s.has(g)?s.delete(g):s.add(g);return s;});
  const[editGrupo,setEditGrupo]=useState(null);
  const[confDel,setConfDel]=useState(null);
  const grupoRef=useRef(null);

  const allResp=useMemo(()=>[...new Set(tasks.map(t=>t.r).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[tasks]);
  const allStatus=useMemo(()=>[...new Set(tasks.map(t=>t.s))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[tasks]);

  const toggleSort=col=>{if(sortCol!==col){setSortCol(col);setSortDir('asc');}else{const n=SCY[sortDir];if(!n){setSortCol(null);setSortDir(null);}else setSortDir(n);}};
  const toggleF=(arr,setArr,val)=>setArr(prev=>prev.includes(val)?prev.filter(v=>v!==val):[...prev,val]);
  const toggleRow=id=>setExpanded(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});
  const toggleSel=id=>setSelected(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});
  const selAll=ids=>{const all=ids.every(id=>selected.has(id));setSelected(prev=>{const s=new Set(prev);all?ids.forEach(id=>s.delete(id)):ids.forEach(id=>s.add(id));return s;});};
  const clearSel=()=>setSelected(new Set());

  const startRename=g=>setEditGrupo({orig:g,draft:g});
  const commitRename=()=>{
    if(!editGrupo)return;
    const{orig,draft}=editGrupo;
    if(draft.trim()&&draft.trim()!==orig)setTasks(prev=>prev.map(t=>t.g===orig?{...t,g:draft.trim()}:t));
    setEditGrupo(null);
  };
  const deleteTask=id=>{setTasks(prev=>prev.filter(t=>t.id!==id));setConfDel(null);};
  const deleteGroup=name=>{setTasks(prev=>prev.filter(t=>t.g!==name));setConfDel(null);};

  useEffect(()=>{if(editGrupo)grupoRef.current&&grupoRef.current.focus();},[editGrupo]);
  useEffect(()=>{const fn=e=>{if(e.key==='Escape'){setEditGrupo(null);setConfDel(null);}};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[]);

  const filtered=useMemo(()=>{
    let list=[...tasks];
    if(search){const q=search.toLowerCase();list=list.filter(t=>t.t.toLowerCase().includes(q)||t.c.toLowerCase().includes(q)||t.r.toLowerCase().includes(q)||t.g.toLowerCase().includes(q));}
    if(fStatus.length)list=list.filter(t=>fStatus.includes(t.s));
    if(fResp.length)list=list.filter(t=>fResp.includes(t.r));
    if(fGrupo.length)list=list.filter(t=>fGrupo.includes(t.g));
    if(sortCol&&sortDir)list.sort((a,b)=>{const va=a[sortCol]||'',vb=b[sortCol]||'';return sortDir==='asc'?va.localeCompare(vb,'pt-BR'):-va.localeCompare(vb,'pt-BR');});
    return list;
  },[tasks,search,fStatus,fResp,fGrupo,sortCol,sortDir]);

  const grouped=useMemo(()=>{
    if(!groupBy)return{'Todas as Tarefas':[...filtered].sort((a,b)=>tn(a.t)-tn(b.t))};
    const grp={};
    filtered.forEach(t=>{(grp[t.g]=grp[t.g]||[]).push(t);});
    Object.keys(grp).forEach(g=>{grp[g].sort((a,b)=>tn(a.t)-tn(b.t));});
    const keys=Object.keys(grp).sort((a,b)=>{
      const ma=Math.min(...grp[a].map(t=>tn(t.t)));
      const mb=Math.min(...grp[b].map(t=>tn(t.t)));
      return ma-mb;
    });
    const ord={};keys.forEach(k=>{ord[k]=grp[k];});return ord;
  },[filtered,groupBy]);

  const BulkEditModal=()=>{
    const[bStatus,setBStatus]=useState('');
    const[bResp,setBResp]=useState('');
    const[bGrupo,setBGrupo]=useState('');
    const[bConfDel,setBConfDel]=useState(false);
    const allResp2=[...new Set(tasks.map(t=>t.r).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const allG2=[...new Set(tasks.map(t=>t.g))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const ist={width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt1)',fontSize:13,padding:'7px 10px',outline:'none'};
    const applyBulk=()=>{
      setTasks(prev=>prev.map(t=>{
        if(!selected.has(t.id))return t;
        return{...t,...(bStatus?{s:bStatus}:{}),...(bResp?{r:bResp}:{}),...(bGrupo?{g:bGrupo}:{})};
      }));
      setBulkModal(false);clearSel();
    };
    const deleteBulk=()=>{setTasks(prev=>prev.filter(t=>!selected.has(t.id)));setBulkModal(false);clearSel();};
    return(
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:150,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,width:'min(460px,100%)',boxShadow:'0 12px 48px rgba(0,0,0,.15)'}}>
          <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--txt1)'}}>Editar em lote</div>
              <div style={{fontSize:11,color:'var(--txt3)',marginTop:2}}>{selected.size} tarefa{selected.size!==1?'s':''} selecionada{selected.size!==1?'s':''} — preencha apenas o que deseja alterar</div>
            </div>
            <button onClick={()=>setBulkModal(false)} style={{background:'none',border:'none',color:'var(--txt3)',fontSize:18,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Status</div>
              <select value={bStatus} onChange={e=>setBStatus(e.target.value)} style={ist}>
                <option value="">Manter atual</option>
                {Object.keys(SC).sort((a,b)=>a.localeCompare(b,"pt-BR")).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Responsavel</div>
              <select value={bResp} onChange={e=>setBResp(e.target.value)} style={ist}>
                <option value="">Manter atual</option>
                {allResp2.map(r=><option key={r} value={r}>{r}</option>)}
                <option value=" ">— Remover responsavel —</option>
              </select>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Iniciativa</div>
              <select value={bGrupo} onChange={e=>setBGrupo(e.target.value)} style={ist}>
                <option value="">Manter atual</option>
                {allG2.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',gap:8,justifyContent:'space-between'}}>
            {bConfDel
              ?<div style={{display:'flex',alignItems:'center',gap:8}}>
                 <span style={{fontSize:12,color:'#DC2626'}}>Confirmar exclusao de {selected.size} tarefa{selected.size!==1?'s':''}?</span>
                 <button onClick={deleteBulk} style={{padding:'6px 14px',background:'#DC2626',border:'none',borderRadius:7,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Excluir</button>
                 <button onClick={()=>setBConfDel(false)} style={{padding:'6px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt2)',fontSize:12,cursor:'pointer'}}>Cancelar</button>
               </div>
              :<button onClick={()=>setBConfDel(true)} style={{padding:'6px 14px',background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.2)',borderRadius:7,color:'#DC2626',fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}><Ic n="trash" s={13} c="currentColor"/> Excluir selecionadas</button>
            }
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setBulkModal(false)} style={{padding:'6px 16px',background:'transparent',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
              <button onClick={applyBulk} disabled={!bStatus&&!bResp&&!bGrupo} style={{padding:'6px 20px',background:bStatus||bResp||bGrupo?'linear-gradient(135deg,var(--accent),var(--cyan))':'var(--bg2)',border:'none',borderRadius:7,color:bStatus||bResp||bGrupo?'#fff':'var(--txt3)',fontSize:12,fontWeight:700,cursor:bStatus||bResp||bGrupo?'pointer':'default'}}>Aplicar alteracoes</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const thSt=col=>({padding:'10px 11px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:.8,textTransform:'uppercase',color:'var(--txt2)',borderBottom:'1px solid var(--border)',borderTop:'1px solid var(--border)',cursor:'pointer',userSelect:'none',whiteSpace:'nowrap',background:sortCol===col?'rgba(37,99,235,.06)':'#F1F4F8'});

  return (
    <React.Fragment>
      <div style={{padding:'14px 24px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg1)'}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
          <div style={{position:'relative',flex:'1 1 240px',minWidth:180}}>
            <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--txt3)',fontSize:14}}>S</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar tarefa, card, responsavel..." style={{width:'100%',padding:'8px 10px 8px 30px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:14,outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </div>
          <button onClick={()=>setGroupBy(g=>!g)} style={{padding:'7px 13px',borderRadius:7,fontSize:11,fontWeight:600,cursor:'pointer',border:'1px solid '+(groupBy?'rgba(34,211,238,.3)':'var(--border)'),background:groupBy?'rgba(34,211,238,.08)':'transparent',color:groupBy?'var(--cyan)':'var(--txt2)'}}>Agrupar</button>
          {(fStatus.length+fResp.length+fGrupo.length)>0&&<button onClick={()=>{setFStatus([]);setFResp([]);setFGrupo([]);}} style={{padding:'7px 13px',borderRadius:7,fontSize:11,fontWeight:600,cursor:'pointer',border:'1px solid rgba(248,113,113,.3)',background:'rgba(248,113,113,.08)',color:'#F87171'}}>✕ Limpar ({fStatus.length+fResp.length+fGrupo.length})</button>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {[
            {lbl:'Status',pills:allStatus.map(s=>({val:s,color:SC[s]&&SC[s].c,active:fStatus.includes(s),onClick:()=>toggleF(fStatus,setFStatus,s)}))},
            {lbl:'Responsavel',pills:allResp.map(r=>({val:r,color:null,active:fResp.includes(r),onClick:()=>toggleF(fResp,setFResp,r)}))},
            {lbl:'Iniciativa',pills:[...new Set(tasks.map(t=>t.g))].sort((a,b)=>{const ma=Math.min(...tasks.filter(t=>t.g===a).map(t=>tn(t.t)));const mb=Math.min(...tasks.filter(t=>t.g===b).map(t=>tn(t.t)));return ma-mb;}).map(g=>({val:g.length>24?g.slice(0,24)+'...':g,color:null,active:fGrupo.includes(g),onClick:()=>toggleF(fGrupo,setFGrupo,g)}))},
          ].map(({lbl,pills})=>(
            <div key={lbl} style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden',minHeight:34}}>
              <div style={{padding:'0 12px',borderRight:'1px solid var(--border)',background:'var(--bg2)',minWidth:90,display:'flex',alignItems:'center',justifyContent:'center',alignSelf:'stretch'}}>
                <span style={{fontSize:9,fontWeight:700,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:.8,whiteSpace:'nowrap'}}>{lbl}</span>
              </div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center',padding:'5px 10px',flex:1}}>
                {pills.map(p=>(
                  <button key={p.val} onClick={p.onClick} style={{padding:'3px 10px',borderRadius:5,fontSize:11,fontWeight:p.active?600:400,cursor:'pointer',border:'1px solid '+(p.active?(p.color||'var(--accent)'):'var(--border2)'),background:p.active?(p.color?p.color+'20':'rgba(37,99,235,.1)'):'transparent',color:p.active?(p.color||'var(--accent)'):'var(--txt2)',transition:'all .15s',whiteSpace:'nowrap'}}>
                    {p.val}{p.active&&<span style={{marginLeft:4,fontSize:9,opacity:.7}}>✕</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'16px 24px 48px',overflowX:'auto'}}>
        <div style={{fontSize:11,color:'var(--txt3)',marginBottom:12}}>{filtered.length} de {tasks.length} tarefas</div>
        {Object.entries(grouped).map(([grupo,gtasks])=>(
          <div key={grupo} style={{marginBottom:28}}>
            {groupBy&&(()=>{
              const isEd=editGrupo&&editGrupo.orig===grupo;
              const isCD=confDel&&confDel.type==='g'&&confDel.name===grupo;
              const cnt=tasks.filter(t=>t.g===grupo).length;
              return(
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,paddingBottom:6,borderBottom:'1px solid var(--border)',flexWrap:'nowrap',overflow:'hidden'}}>
                  {isCD
                    ?<div style={{display:'flex',alignItems:'center',gap:7,padding:'4px 12px',background:'rgba(220,38,38,.06)',border:'1px solid rgba(220,38,38,.2)',borderRadius:8}}>
                       <span style={{fontSize:12,color:'#DC2626'}}>Excluir {cnt} tarefa{cnt!==1?'s':''}?</span>
                       <button onClick={()=>deleteGroup(grupo)} style={{padding:'3px 10px',borderRadius:6,background:'#DC2626',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>Sim</button>
                       <button onClick={()=>setConfDel(null)} style={{padding:'3px 10px',borderRadius:6,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:11,cursor:'pointer'}}>Nao</button>
                     </div>
                    :isEd
                      ?<input ref={grupoRef} value={editGrupo.draft} onChange={e=>setEditGrupo(g=>({...g,draft:e.target.value}))} onBlur={commitRename} onKeyDown={e=>{if(e.key==='Enter')commitRename();if(e.key==='Escape')setEditGrupo(null);}} style={{fontSize:14,fontWeight:700,color:'var(--txt1)',background:'rgba(37,99,235,.06)',border:'1px solid rgba(37,99,235,.3)',borderRadius:7,padding:'3px 10px',outline:'none',minWidth:200}}/>
                      :<React.Fragment>
                         <button onClick={()=>toggleGroupCollapse(grupo)} title={collapsedGroups.has(grupo)?"Expandir":"Recolher"} style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'3px',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',transform:collapsedGroups.has(grupo)?'rotate(-90deg)':'rotate(0deg)'}} onMouseOver={e=>e.currentTarget.style.color='var(--accent)'} onMouseOut={e=>e.currentTarget.style.color='var(--txt3)'}><Ic n="chevron" s={15} c="currentColor"/></button>
                         <span style={{fontSize:13,fontWeight:700,color:'var(--txt1)',letterSpacing:-.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:300}}>{grupo}</span>
                         <span style={{fontSize:10,color:'var(--txt3)',background:'var(--bg2)',border:'1px solid var(--border)',padding:'1px 8px',borderRadius:99,flexShrink:0,fontWeight:500}}>{gtasks.length} tarefa{gtasks.length!==1?'s':''}</span>
                         <select value={iStatus[grupo]||''} onChange={e=>{if(setIStatus)setIStatus(prev=>({...prev,[grupo]:e.target.value}));}} style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:99,border:'1px solid '+(iStatus[grupo]?getISCfg(iStatus[grupo]).c+'55':'var(--border)'),background:iStatus[grupo]?getISCfg(iStatus[grupo]).bg:'var(--bg2)',color:iStatus[grupo]?getISCfg(iStatus[grupo]).c:'var(--txt3)',cursor:'pointer',outline:'none',flexShrink:0,maxWidth:180,minWidth:120}}>
                           <option value="">— Status —</option>
                           {statusProduto.map(s=><option key={s} value={s}>{s}</option>)}
                         </select>
                         <button onClick={()=>startRename(grupo)} title="Renomear" style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'3px',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',transition:'color .12s'}} onMouseOver={e=>e.currentTarget.style.color='#B45309'} onMouseOut={e=>e.currentTarget.style.color='var(--txt3)'}><Ic n="edit" s={13} c="currentColor"/></button>
                         <button onClick={()=>setConfDel({type:'g',name:grupo})} title="Excluir iniciativa" style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'3px',borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',transition:'color .12s'}} onMouseOver={e=>e.currentTarget.style.color='#DC2626'} onMouseOut={e=>e.currentTarget.style.color='var(--txt3)'}><Ic n="trash" s={13} c="currentColor"/></button>
                         {openCreate&&<button onClick={()=>openCreate(grupo)} title="Adicionar um card" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'3px 10px',borderRadius:6,background:'rgba(37,99,235,.08)',border:'1px solid rgba(37,99,235,.2)',color:'var(--accent)',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(37,99,235,.15)';e.currentTarget.style.borderColor='rgba(37,99,235,.4)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(37,99,235,.08)';e.currentTarget.style.borderColor='rgba(37,99,235,.2)';}}>
                           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                           Card
                         </button>}
                         {openBulkCreate&&<button onClick={()=>openBulkCreate(grupo)} title="Criar múltiplos cards" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'3px 10px',borderRadius:6,background:'rgba(8,145,178,.07)',border:'1px solid rgba(8,145,178,.2)',color:'var(--cyan)',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(8,145,178,.15)';e.currentTarget.style.borderColor='rgba(8,145,178,.4)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(8,145,178,.07)';e.currentTarget.style.borderColor='rgba(8,145,178,.2)';}}>
                           <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="10" height="13" rx="1"/><rect x="9" y="4" width="10" height="13" rx="1"/></svg>
                           Múltiplos
                         </button>}
                       </React.Fragment>
                  }
                </div>
              );
            })()}
            {!collapsedGroups.has(grupo)&&<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#F1F4F8'}}>
                  <th style={{padding:'10px 8px',width:36,borderBottom:'1px solid var(--border)',borderTop:'1px solid var(--border)',background:'#F1F4F8',textAlign:'center'}}>
                    <input type="checkbox" checked={gtasks.length>0&&gtasks.every(t=>selected.has(t.id))} onChange={()=>selAll(gtasks.map(t=>t.id))} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--accent)'}}/>
                  </th>
                  {[['c',<Ic n="card"/>,'Card',110],['t',<Ic n="task"/>,'Tarefa',null],['s',<Ic n="status"/>,'Status',175],['r',<Ic n="person"/>,'Responsavel',130],['v',<Ic n="tag"/>,'Versao',90]].map(([col,icon,lbl,w])=>(
                    <th key={col} style={{...thSt(col),...(w?{width:w}:{})}} onClick={()=>toggleSort(col)}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:5,color:'inherit'}}>{icon}<span>{lbl}</span> <SortIcon dir={sortCol===col?sortDir:null}/></span>
                    </th>
                  ))}
                  <th style={{padding:'10px 11px',width:90,borderBottom:'1px solid var(--border)',background:'#F1F4F8',textAlign:'center'}}><Ic n="dots" s={14} c="var(--txt3)"/></th>
                </tr>
              </thead>
              <tbody>
                {gtasks.map((task,idx)=>{
                  const exp=expanded.has(task.id);
                  const cfg=SC[task.s]||{};
                  const bg=idx%2===0?'var(--bg1)':'var(--bg2)';
                  const isCDTask=confDel&&confDel.type==='t'&&confDel.id===task.id;
                  return(
                    <React.Fragment key={task.id}>
                      <tr className="tr" style={{cursor:'pointer',background:selected.has(task.id)?'rgba(37,99,235,.06)':undefined}} onClick={()=>toggleRow(task.id)}>
                        <td style={{padding:'9px 8px',borderBottom:'1px solid var(--border)',textAlign:'center',width:36}} onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(task.id)} onChange={()=>toggleSel(task.id)} style={{cursor:'pointer',width:14,height:14,accentColor:'var(--accent)'}}/>
                        </td>
                        <td style={{padding:'9px 12px',borderBottom:'1px solid var(--border)',background:bg,borderLeft:'2px solid '+(exp?(cfg.c||'var(--cyan)'):'transparent'),width:110,minWidth:100,overflow:'hidden'}}>
                          {task.c?<span style={{fontFamily:'monospace',fontSize:11,color:'var(--txt2)',background:'var(--bg)',padding:'2px 5px',borderRadius:4,border:'1px solid var(--border)',fontWeight:500,whiteSpace:'nowrap',display:'inline-block'}}>{task.c}</span>:<span style={{color:'var(--txt3)',fontSize:10}}>-</span>}
                        </td>
                        <td style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',background:bg,fontSize:13,color:'var(--txt1)',lineHeight:1.4}}>
                          <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                            <TipoBadge tipo={tipos[task.id]}/><span>{task.t}</span>
                          </div>
                        </td>
                        <td style={{padding:'9px 11px',borderBottom:'1px solid var(--border)',background:bg}}><Badge s={task.s}/></td>
                        <td style={{padding:'11px 13px',borderBottom:'1px solid var(--border)',background:bg,fontSize:11}}>
                          {task.r?<div style={{display:'flex',alignItems:'center',gap:6}}>
                            <div style={{width:22,height:22,borderRadius:'50%',background:avColor(task.r),display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:800,color:'#fff',flexShrink:0}}>{task.r.slice(0,2).toUpperCase()}</div>
                            <span style={{color:'var(--txt1)',fontSize:13}}>{task.r}</span>
                          </div>:<span style={{color:'var(--txt3)'}}>-</span>}
                        </td>
                        <td style={{padding:'11px 13px',borderBottom:'1px solid var(--border)',background:bg,fontSize:12,color:'var(--txt2)'}}>{task.v||'-'}</td>
                        <td style={{padding:'7px 11px',borderBottom:'1px solid var(--border)',background:bg,minWidth:90}} onClick={e=>e.stopPropagation()}>
                          {isCDTask
                            ?<div style={{display:'flex',alignItems:'center',gap:5}}>
                               <button onClick={()=>deleteTask(task.id)} style={{padding:'3px 7px',borderRadius:5,background:'#F87171',border:'none',color:'#fff',fontSize:10,fontWeight:700,cursor:'pointer'}}>Sim</button>
                               <button onClick={()=>setConfDel(null)} style={{padding:'3px 7px',borderRadius:5,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:10,cursor:'pointer'}}>Nao</button>
                             </div>
                            :<div style={{display:'flex',gap:5}}>
                               <button className="eb" onClick={e=>openEdit(task,e)} title="Editar" style={{width:28,height:28,borderRadius:7,background:'rgba(180,83,9,.07)',border:'1px solid rgba(180,83,9,.18)',color:'#B45309',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(180,83,9,.14)';e.currentTarget.style.borderColor='rgba(180,83,9,.35)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(180,83,9,.07)';e.currentTarget.style.borderColor='rgba(180,83,9,.18)';}}><Ic n="edit" s={13} c="currentColor"/></button>
                               <button className="eb" onClick={e=>{e.stopPropagation();setConfDel({type:'t',id:task.id});}} title="Excluir" style={{width:28,height:28,borderRadius:7,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.18)',color:'#DC2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(220,38,38,.14)';e.currentTarget.style.borderColor='rgba(220,38,38,.35)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(220,38,38,.07)';e.currentTarget.style.borderColor='rgba(220,38,38,.18)';}}><Ic n="trash" s={13} c="currentColor"/></button>
                               <button onClick={e=>{e.stopPropagation();toggleRow(task.id);}} title="Detalhes" style={{width:28,height:28,borderRadius:7,background:'transparent',border:'1px solid var(--border)',color:'var(--txt3)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transform:exp?'rotate(90deg)':'none',transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.background='var(--bg2)';e.currentTarget.style.color='var(--txt1)';}} onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--txt3)';}}><Ic n="chevron" s={13} c="currentColor"/></button>
                             </div>
                          }
                        </td>
                      </tr>
                      {exp&&(
                        <tr>
                          <td colSpan={6} style={{padding:0,background:'#F7F9FF',borderBottom:'1px solid var(--border)',borderLeft:'3px solid '+(cfg.c||'var(--cyan)')}}>
                            <div style={{padding:'12px 18px 14px 24px',display:'flex',gap:28,flexWrap:'wrap'}}>
                              <div style={{flex:'1 1 280px'}}>
                                <div style={{fontSize:9,fontWeight:700,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:1.2,marginBottom:7,display:'flex',alignItems:'center',gap:5}}>
                                  <span style={{width:2,height:10,background:'var(--cyan)',borderRadius:2,display:'inline-block'}}/>Acompanhamento
                                </div>
                                {task.a?<div style={{display:'flex',flexDirection:'column',gap:4}}>
                                  {sortLog(task.a.split('\n').filter(Boolean)).map((line,i)=>{const[dt,...rest]=line.split(' - ');return(<div key={i} style={{display:'flex',gap:8}}><span style={{fontFamily:'monospace',fontSize:10,color:'var(--cyan)',opacity:.7,minWidth:36,flexShrink:0}}>{dt}</span><span style={{fontSize:11,color:'var(--txt2)'}}>{rest.join(' - ')}</span></div>);})}
                                </div>:<p style={{fontSize:11,color:'var(--txt3)'}}>Sem registros.</p>}
                              </div>
                              {task.mr&&<div style={{flex:'1 1 180px'}}>
                                <div style={{fontSize:9,fontWeight:700,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:1.2,marginBottom:7,display:'flex',alignItems:'center',gap:5}}>
                                  <span style={{width:2,height:10,background:'#A78BFA',borderRadius:2,display:'inline-block'}}/>Merge Request
                                </div>
                                {task.mr.split('\n').filter(Boolean).map((link,i)=>(
                                  <a key={i} href={link.trim()} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:'block',fontSize:10,color:'var(--cyan)',textDecoration:'none',fontFamily:'monospace',marginBottom:3}}>MR #{link.trim().split('/').pop()}</a>
                                ))}
                              </div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>}
          </div>
        ))}
      </div>
    {selected.size>0&&(
      <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'var(--txt1)',borderRadius:12,padding:'10px 18px',display:'flex',alignItems:'center',gap:14,zIndex:100,boxShadow:'0 8px 32px rgba(0,0,0,.25)',whiteSpace:'nowrap'}}>
        <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>{selected.size} tarefa{selected.size!==1?'s':''} selecionada{selected.size!==1?'s':''}</span>
        <button onClick={()=>setBulkModal(true)} style={{padding:'6px 16px',background:'var(--accent)',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>✏ Editar em lote</button>
        <button onClick={clearSel} style={{padding:'6px 12px',background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,color:'#fff',fontSize:12,cursor:'pointer'}}>✕ Desmarcar</button>
      </div>
    )}
    {bulkModal&&<BulkEditModal/>}
    </React.Fragment>
  );
}

