import React, { useRef, useState } from 'react';
import { deleteResp, saveResp, updateResp } from '../lib/api';

export const DEFAULT_RESP=['Aleson','Camila','Diguinho','Islan','Lourene','Matheus'];
export function getResps(){try{const r=localStorage.getItem('pm_resps');return r?JSON.parse(r):DEFAULT_RESP;}catch(e){return DEFAULT_RESP;}}
export function saveResps(r){try{localStorage.setItem('pm_resps',JSON.stringify(r));}catch(e){}}

export function ResponsavelManager({resps:initResps,onSave,onClose}){
  const[resps,setRespsState]=useState((initResps||getResps()).slice().sort((a,b)=>a.localeCompare(b,'pt-BR')));
  const[newName,setNewName]=useState('');
  const[editing,setEditing]=useState(null); // {idx, draft}
  const[confirmDel,setConfirmDel]=useState(null);
  const[err,setErr]=useState('');
  const inputRef=useRef(null);

  const persist=async(newList,{added,removed,updated}={})=>{
    const s=[...newList].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    setRespsState(s);if(onSave)onSave(s);
    try{
      if(added)await saveResp(added);
      if(removed)await deleteResp(removed);
      if(updated)await updateResp(updated.old,updated.new);
    }catch(e){console.error('persist resp',e);}
  };

  const add=()=>{
    const n=newName.trim();
    if(!n){setErr('Nome obrigatório');return;}
    if(resps.some(r=>r.toLowerCase()===n.toLowerCase())){setErr('Já cadastrado');return;}
    persist([...resps,n],{added:n});setNewName('');setErr('');
  };

  const commitEdit=()=>{
    if(!editing)return;
    const n=editing.draft.trim();
    if(!n){setEditing(null);return;}
    if(resps.some((r,i)=>r.toLowerCase()===n.toLowerCase()&&i!==editing.idx)){setEditing(e=>({...e,err:'Já cadastrado'}));return;}
    const upd=[...resps];upd[editing.idx]=n;persist(upd,{updated:{old:resps[editing.idx],new:n}});setEditing(null);
  };

  const del=idx=>{const nome=resps[idx];persist(resps.filter((_,i)=>i!==idx),{removed:nome});setConfirmDel(null);};

  const ist={background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:13,padding:'7px 11px',outline:'none',flex:1};

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:14,width:'min(480px,100%)',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 16px 56px rgba(0,0,0,.2)'}}>

        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--txt1)'}}>Gerenciar Responsáveis</div>
            <div style={{fontSize:11,color:'var(--txt3)',marginTop:2}}>{resps.length} cadastrado{resps.length!==1?'s':''}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt2)',fontSize:18,cursor:'pointer'}}>✕</button>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 22px',display:'flex',flexDirection:'column',gap:16}}>

          {/* Add new */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:7}}>Novo responsável</div>
            <div style={{display:'flex',gap:8}}>
              <input ref={inputRef} value={newName} onChange={e=>{setNewName(e.target.value);setErr('');}}
                placeholder="Ex: João Silva" style={ist}
                onKeyDown={e=>{if(e.key==='Enter')add();}}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <button onClick={add} style={{padding:'7px 18px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:8,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>+ Adicionar</button>
            </div>
            {err&&<div style={{fontSize:11,color:'#DC2626',marginTop:5}}>{err}</div>}
          </div>

          {/* List */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:7}}>Lista de responsáveis</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {resps.map((r,idx)=>{
                const isEd=editing&&editing.idx===idx;
                const isDel=confirmDel===idx;
                const initials=r.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                const hue=(r.charCodeAt(0)*47)%360;
                return(
                  <div key={idx} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 13px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:`hsl(${hue},40%,85%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:`hsl(${hue},40%,30%)`,flexShrink:0}}>
                      {initials}
                    </div>
                    {isEd
                      ?<input autoFocus value={editing.draft} onChange={e=>setEditing(ed=>({...ed,draft:e.target.value,err:''}))}
                          onBlur={commitEdit} onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditing(null);}}
                          style={{...ist,padding:'4px 9px',fontSize:13,fontWeight:600}}/>
                      :<span style={{flex:1,fontSize:13,fontWeight:500,color:'var(--txt1)'}}>{r}</span>
                    }
                    {editing&&editing.err&&isEd&&<span style={{fontSize:10,color:'#DC2626'}}>{editing.err}</span>}
                    {isDel
                      ?<div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                         <span style={{fontSize:11,color:'#DC2626'}}>Excluir?</span>
                         <button onClick={()=>del(idx)} style={{padding:'3px 9px',borderRadius:5,background:'#DC2626',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>Sim</button>
                         <button onClick={()=>setConfirmDel(null)} style={{padding:'3px 9px',borderRadius:5,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:11,cursor:'pointer'}}>Não</button>
                       </div>
                      :<div style={{display:'flex',gap:5,flexShrink:0}}>
                         <button onClick={()=>setEditing({idx,draft:r,err:''})} style={{padding:'4px 9px',borderRadius:6,background:'rgba(180,83,9,.07)',border:'1px solid rgba(180,83,9,.2)',color:'#B45309',fontSize:11,cursor:'pointer'}}>Editar</button>
                         <button onClick={()=>setConfirmDel(idx)} style={{padding:'4px 9px',borderRadius:6,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.2)',color:'#DC2626',fontSize:11,cursor:'pointer'}}>Excluir</button>
                       </div>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:'12px 22px',borderTop:'1px solid var(--border)',flexShrink:0,background:'var(--bg2)',borderRadius:'0 0 14px 14px'}}>
          <button onClick={onClose} style={{padding:'8px 22px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Fechar</button>
        </div>
      </div>
    </div>
  );
}


