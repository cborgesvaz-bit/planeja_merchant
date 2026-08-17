import React, { useEffect, useRef, useState } from 'react';
import { SC, TIPO_CFG } from '../lib/constants';
import { sortLog } from '../lib/utils';

export function Drawer({open,onClose,onSave,grupos,allResp,editing,tipos={}}){
  const preGroup=editing&&editing._preGroup?editing._preGroup:null;
  const isEdit=Boolean(editing)&&!preGroup;
  const blank=()=>({t:'',c:'',v:'',s:'Nao Iniciado',r:'',g:preGroup||'',ng:'',tipo:'Tarefa'});
  const[form,setForm]=useState(blank());
  const[gmode,setGmode]=useState('ex');
  const[mrList,setMrList]=useState(['']);
  const[hist,setHist]=useState('');
  const[entry,setEntry]=useState('');
  const[errs,setErrs]=useState({});
  const[tab,setTab]=useState('d');
  const ref=useRef(null);
  const today=()=>new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});

  useEffect(()=>{
    if(!open)return;
    setErrs({});setTab('d');
    if(preGroup){
      setForm({t:'',c:'',v:'',s:'Nao Iniciado',r:'',g:preGroup,ng:'',tipo:'Tarefa'});
      setGmode('ex');setMrList(['']);setHist('');setEntry('');
    }else if(isEdit){
      setForm({t:editing.t,c:editing.c,v:editing.v,s:editing.s,r:editing.r,g:editing.g,ng:'',tipo:tipos[editing.id]||'Tarefa'});
      setGmode('ex');setMrList(editing.mr?editing.mr.split('\n').filter(Boolean):['']);
      setHist(editing.a||'');setEntry('');
    }else{setForm(blank());setGmode('ex');setMrList(['']);setHist('');setEntry('');}
    setTimeout(()=>ref.current&&ref.current.focus(),80);
  },[open,editing]);

  useEffect(()=>{
    const fn=e=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);
  },[onClose]);

  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrs(e=>({...e,[k]:undefined}));};
  const addMr=()=>setMrList(l=>[...l,'']);
  const setMr=(i,v)=>setMrList(l=>l.map((x,j)=>j===i?v:x));
  const rmMr=i=>setMrList(l=>l.filter((_,j)=>j!==i));

  const validate=()=>{
    const e={};
    if(!form.t.trim())e.t='Obrigatorio';
    if(!form.s)e.s='Obrigatorio';
    if(gmode==='ex'&&!form.g)e.g='Selecione';
    if(gmode==='new'&&!form.ng.trim())e.ng='Nome obrigatorio';
    return e;
  };

  const save=()=>{
    const e=validate();if(Object.keys(e).length){setErrs(e);return;}
    const gFinal=gmode==='new'?form.ng.trim():form.g;
    const mrFinal=mrList.filter(Boolean).join('\n');
    let aFinal;
    if(isEdit){
      const el=entry.trim();
      const line=el?(el.includes('-')?el:`${today()} - ${el}`):'';
      const base=hist.trim();
      aFinal=line?(line+(base?'\n'+base:'')):base;
    }else{
      const el=entry.trim()||hist.trim();
      aFinal=el&&!el.includes('-')?`${today()} - ${el}`:el;
    }
    onSave({...form,g:gFinal,mr:mrFinal,a:aFinal},isEdit?editing.id:null);
    onClose();
  };

  const ist={width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:13,padding:'8px 11px',outline:'none'};
  const Lbl=({c,req,err})=><div style={{marginBottom:5}}><span style={{fontSize:10,fontWeight:700,color:err?'#F87171':'var(--txt3)',textTransform:'uppercase',letterSpacing:.8}}>{c}{req&&<span style={{color:'#F87171'}}>*</span>}</span>{err&&<span style={{fontSize:10,color:'#F87171',marginLeft:6}}>{err}</span>}</div>;

  if(!open)return null;
  const tBtn=(id,lbl,icon)=>(
    <button onClick={()=>setTab(id)} style={{flex:1,padding:'8px 0',background:'transparent',border:'none',borderBottom:'2px solid '+(tab===id?'var(--cyan)':'transparent'),color:tab===id?'var(--cyan)':'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>
      {icon} {lbl}
    </button>
  );
  const hLines=hist.split('\n').filter(Boolean);

  return (
    <React.Fragment>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:90,animation:'fadeIn .15s ease'}}/>
      <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'min(560px,92vw)',maxHeight:'88vh',background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:'var(--radius)',zIndex:91,boxShadow:'var(--shadow-lg)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:5,height:20,background:isEdit?'linear-gradient(180deg,#FBBF24,#F97316)':'linear-gradient(180deg,var(--cyan),var(--accent))',borderRadius:3}}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'var(--txt1)'}}>{isEdit?'Editar Tarefa':'Nova Tarefa'}</div>
              {isEdit&&<div style={{fontSize:10,color:'var(--txt3)',fontFamily:'monospace'}}>{editing.c||editing.g}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt2)',fontSize:18,cursor:'pointer',lineHeight:1}}>x</button>
        </div>
        <div style={{display:'flex',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          {tBtn('d','Dados','📋')}{tBtn('l','Acompanhamento','📅')}{tBtn('m','MRs','🔀')}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px 22px'}}>
          {tab==='d'&&(
            <React.Fragment>
              <div style={{marginBottom:16}}>
                <Lbl c="Tipo"/>
                <div style={{display:'flex',gap:6}}>
                  {Object.keys(TIPO_CFG).map(tp=>{
                    const cfg=TIPO_CFG[tp];const active=form.tipo===tp;
                    return <button key={tp} type="button" onClick={()=>set('tipo',tp)} style={{flex:1,padding:'7px 0',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid '+(active?cfg.c+'55':'var(--border)'),background:active?cfg.bg:'transparent',color:active?cfg.c:'var(--txt2)'}}>{cfg.lb}</button>;
                  })}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <Lbl c="Iniciativa" req err={errs.g||errs.ng}/>
                {!isEdit&&<div style={{display:'flex',gap:6,marginBottom:7}}>
                  {['ex','new'].map(m=>(
                    <button key={m} onClick={()=>setGmode(m)} style={{flex:1,padding:'6px 0',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid '+(gmode===m?'rgba(34,211,238,.4)':'var(--border)'),background:gmode===m?'rgba(34,211,238,.1)':'transparent',color:gmode===m?'var(--cyan)':'var(--txt2)'}}>
                      {m==='ex'?'Existente':'+ Nova'}
                    </button>
                  ))}
                </div>}
                {(isEdit||gmode==='ex')
                  ?<select value={form.g} onChange={e=>set('g',e.target.value)} style={{...ist,borderColor:errs.g?'#F87171':'var(--border)'}}>
                     <option value="">Selecione...</option>
                     {grupos.map(g=><option key={g} value={g}>{g}</option>)}
                   </select>
                  :<input ref={ref} value={form.ng} onChange={e=>set('ng',e.target.value)} placeholder="Ex: Wallet - Fase 5" style={{...ist,borderColor:errs.ng?'#F87171':'var(--border)'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor=errs.ng?'#F87171':'var(--border)'}/>
                }
              </div>
              <div style={{marginBottom:16}}>
                <Lbl c="Tarefa" req err={errs.t}/>
                <input ref={(isEdit||gmode==='ex')?ref:undefined} value={form.t} onChange={e=>set('t',e.target.value)} placeholder="Ex: 23.1 - Implementar endpoint" style={{...ist,borderColor:errs.t?'#F87171':'var(--border)'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                <div><Lbl c="Card"/><input value={form.c} onChange={e=>set('c',e.target.value)} placeholder="STK-A1B2" style={ist} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
                <div><Lbl c="Versao"/><input value={form.v} onChange={e=>set('v',e.target.value)} placeholder="v0.11.0" style={ist} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <Lbl c="Status" req err={errs.s}/>
                  <select value={form.s} onChange={e=>set('s',e.target.value)} style={ist}>
                    {Object.keys(SC).sort((a,b)=>a.localeCompare(b,"pt-BR")).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Lbl c="Responsavel"/>
                  <select value={form.r} onChange={e=>set('r',e.target.value)} style={ist} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}>
                    <option value="">— Sem responsavel —</option>
                    {(allResp&&allResp.length?allResp:['Aleson','Camila','Diguinho','Islan','Lourene','Matheus']).map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </React.Fragment>
          )}
          {tab==='l'&&(
            <React.Fragment>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>{isEdit?'Nova entrada (ao topo)':'Registro inicial'}</div>
                <div style={{fontSize:10,color:'var(--txt3)',marginBottom:6}}>Formato: DD/MM - descricao</div>
                <textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder={today()+' - Inicio do desenvolvimento'} rows={3} style={{...ist,resize:'vertical',fontFamily:'inherit'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              </div>
              {isEdit&&(
                <div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                    <span style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8}}>Historico</span>
                    <span style={{fontSize:10,color:'var(--txt3)'}}>{hLines.length} entradas</span>
                  </div>
                  {hLines.length>0?<React.Fragment>
                    <div style={{background:'#F7F9FC',borderRadius:8,border:'1px solid var(--border)',padding:'10px 12px',marginBottom:8,maxHeight:160,overflowY:'auto'}}>
                      {sortLog(hLines).map((line,i)=>{const[d,...r]=line.split(' - ');return <div key={i} style={{display:'flex',gap:8,paddingBottom:5,marginBottom:5,borderBottom:i<hLines.length-1?'1px solid var(--border)':'none'}}><span style={{fontFamily:'monospace',fontSize:10,color:'var(--cyan)',opacity:.7,minWidth:38,flexShrink:0}}>{d}</span><span style={{fontSize:11,color:'var(--txt2)'}}>{r.join(' - ')}</span></div>;})}
                    </div>
                    <textarea value={hist} onChange={e=>setHist(e.target.value)} rows={4} style={{...ist,fontFamily:'monospace',fontSize:11,lineHeight:1.8,resize:'vertical'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  </React.Fragment>
                  :<div style={{padding:14,textAlign:'center',color:'var(--txt3)',fontSize:11,background:'var(--bg)',borderRadius:8,border:'1px dashed var(--border)'}}>Sem historico.</div>}
                </div>
              )}
            </React.Fragment>
          )}
          {tab==='m'&&(
            <React.Fragment>
              <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Links de Merge Request</div>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {mrList.map((link,i)=>(
                  <div key={i} style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:10,color:'var(--txt3)',fontFamily:'monospace',minWidth:16}}>#{i+1}</span>
                    <input value={link} onChange={e=>setMr(i,e.target.value)} placeholder="https://gitlab.luizalabs.com/..." style={{...ist,flex:1,fontFamily:'monospace',fontSize:11}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    {mrList.length>1&&<button onClick={()=>rmMr(i)} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',color:'#F87171',borderRadius:6,cursor:'pointer',padding:'0 9px',height:36,fontSize:13}}>x</button>}
                  </div>
                ))}
                <button onClick={addMr} style={{alignSelf:'flex-start',padding:'5px 12px',background:'transparent',border:'1px dashed var(--border)',borderRadius:6,color:'var(--txt3)',fontSize:11,cursor:'pointer'}}>+ Adicionar MR</button>
              </div>
            </React.Fragment>
          )}
        </div>
        <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',gap:9,flexShrink:0}}>
          <button onClick={onClose} style={{flex:1,padding:'9px 0',borderRadius:8,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button onClick={save} style={{flex:2,padding:'9px 0',borderRadius:8,background:isEdit?'linear-gradient(135deg,#92400E,#FBBF24)':'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            {isEdit?'Salvar alteracoes':'Criar tarefa'}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

