import React, { useMemo, useState } from 'react';
import { IS_CFG } from '../lib/constants';

export function InitiativeManager({tasks,setTasks,iStatus={},setIStatus,onClose}){
  const[newN,setNewN]=useState('');
  const[ren,setRen]=useState(null);
  const[cdel,setCdel]=useState(null);
  const[mFrom,setMFrom]=useState('');
  const[mTo,setMTo]=useState('');
  const SCOL={"Em andamento":"#22D3EE","Bloqueado":"#F87171","Nao Iniciado":"#4A5568","Aguard. Deploy PRD":"#FBBF24","Paralisado":"#FB923C","Finalizado":"#34D399","Entregue":"#10B981","Pendente":"#A78BFA"};

  const grupos=useMemo(()=>{
    const map={};tasks.forEach(t=>{if(!map[t.g])map[t.g]={name:t.g,tasks:[]};map[t.g].tasks.push(t);});
    return Object.values(map).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  },[tasks]);

  const createG=()=>{const n=newN.trim();if(!n)return;setTasks(prev=>[...prev,{id:Date.now(),g:n,t:'Nova tarefa - edite ou exclua',c:'',v:'',s:'Nao Iniciado',r:'',mr:'',a:new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' - Card criado'}]);setNewN('');};
  const renameG=(orig,nw)=>{const t=nw.trim();if(!t||t===orig)return;setTasks(prev=>prev.map(x=>x.g===orig?{...x,g:t}:x));setRen(null);};
  const delG=name=>{setTasks(prev=>prev.filter(x=>x.g!==name));setCdel(null);};
  const mergeG=()=>{if(!mFrom||!mTo||mFrom===mTo)return;setTasks(prev=>prev.map(x=>x.g===mFrom?{...x,g:mTo}:x));setMFrom('');setMTo('');};

  const ist={background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:12,padding:'7px 11px',outline:'none',width:'100%'};

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:14,width:'min(740px,100%)',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,.7)'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--txt1)'}}>Gerenciar Iniciativas</div>
            <div style={{fontSize:10,color:'var(--txt3)',marginTop:1}}>{grupos.length} iniciativas - {tasks.length} tarefas</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt2)',fontSize:18,cursor:'pointer',lineHeight:1}}>x</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'18px 22px',display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>Nova Iniciativa</div>
            <div style={{display:'flex',gap:7}}>
              <input value={newN} onChange={e=>setNewN(e.target.value)} placeholder="Ex: Destrava PIX - Fase 3" onKeyDown={e=>{if(e.key==='Enter')createG();}} style={{...ist,flex:1}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <button onClick={createG} style={{padding:'7px 16px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>+ Criar</button>
            </div>
          </div>
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>Unificar Iniciativas</div>
            <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
              <select value={mFrom} onChange={e=>setMFrom(e.target.value)} style={{...ist,flex:1,minWidth:140}}><option value="">De (origem)...</option>{grupos.map(g=><option key={g.name} value={g.name}>{g.name}</option>)}</select>
              <span style={{color:'var(--txt3)',fontSize:14}}>to</span>
              <select value={mTo} onChange={e=>setMTo(e.target.value)} style={{...ist,flex:1,minWidth:140}}><option value="">Para (destino)...</option>{grupos.filter(g=>g.name!==mFrom).map(g=><option key={g.name} value={g.name}>{g.name}</option>)}</select>
              <button onClick={mergeG} disabled={!mFrom||!mTo} style={{padding:'7px 14px',background:mFrom&&mTo?'rgba(251,191,36,.15)':'rgba(255,255,255,.04)',border:'1px solid '+(mFrom&&mTo?'#FBBF24':'var(--border)'),borderRadius:8,color:mFrom&&mTo?'#FBBF24':'var(--txt3)',fontSize:11,fontWeight:600,cursor:mFrom&&mTo?'pointer':'default',whiteSpace:'nowrap'}}>Unificar</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:'var(--txt2)',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>Todas as Iniciativas</div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {grupos.map(g=>{
                const smap={};g.tasks.forEach(t=>{smap[t.s]=(smap[t.s]||0)+1;});
                const isR=ren&&ren.orig===g.name;const isD=cdel===g.name;
                return(
                  <div key={g.name} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'11px 13px',display:'flex',alignItems:'center',gap:11,flexWrap:'wrap'}}>
                    <div style={{flex:'1 1 220px',minWidth:180}}>
                      {isR?<input value={ren.draft} autoFocus onChange={e=>setRen(r=>({...r,draft:e.target.value}))} onBlur={()=>renameG(g.name,ren.draft)} onKeyDown={e=>{if(e.key==='Enter')renameG(g.name,ren.draft);if(e.key==='Escape')setRen(null);}} style={{...ist,padding:'3px 9px',fontSize:12,fontWeight:600}}/>
                      :<div style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{fontSize:12,fontWeight:600,color:'var(--txt1)'}}>{g.name}</span>
                      {iStatus[g.name]&&IS_CFG[iStatus[g.name]]&&<span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:99,background:IS_CFG[iStatus[g.name]].bg,color:IS_CFG[iStatus[g.name]].c,border:'1px solid '+IS_CFG[iStatus[g.name]].c+'33'}}>{iStatus[g.name]}</span>}
                    </div>}
                      <div style={{display:'flex',height:3,borderRadius:3,overflow:'hidden',marginTop:5,gap:1}}>{Object.entries(smap).map(([s,n])=><div key={s} title={s+': '+n} style={{flex:n,background:SCOL[s]||'#4A5568',minWidth:2}}/>)}</div>
                      <div style={{fontSize:9,color:'var(--txt3)',marginTop:3}}>{Object.entries(smap).map(([s,n])=>n+' '+s).join(' - ')}</div>
                    </div>
                    <div style={{textAlign:'center',flexShrink:0}}><div style={{fontSize:17,fontWeight:700,color:'var(--accent)'}}>{g.tasks.length}</div><div style={{fontSize:9,color:'var(--txt3)'}}>tarefas</div></div>
                    {isD?<div style={{display:'flex',gap:5,alignItems:'center'}}><span style={{fontSize:10,color:'#F87171'}}>Excluir {g.tasks.length} tarefas?</span><button onClick={()=>delG(g.name)} style={{padding:'3px 9px',borderRadius:5,background:'#F87171',border:'none',color:'#fff',fontSize:10,fontWeight:700,cursor:'pointer'}}>Sim</button><button onClick={()=>setCdel(null)} style={{padding:'3px 9px',borderRadius:5,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:10,cursor:'pointer'}}>Nao</button></div>
                    :<div style={{display:'flex',gap:5}}><button onClick={()=>setRen({orig:g.name,draft:g.name})} style={{padding:'4px 9px',borderRadius:6,background:'rgba(251,191,36,.08)',border:'1px solid rgba(251,191,36,.2)',color:'#FBBF24',fontSize:10,cursor:'pointer'}}>Renomear</button><button onClick={()=>setCdel(g.name)} style={{padding:'4px 9px',borderRadius:6,background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',color:'#F87171',fontSize:10,cursor:'pointer'}}>Excluir</button></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{padding:'12px 22px',borderTop:'1px solid var(--border)',flexShrink:0}}>
          <button onClick={onClose} style={{padding:'8px 22px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

