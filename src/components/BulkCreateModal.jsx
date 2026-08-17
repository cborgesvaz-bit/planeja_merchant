import React, { useState } from 'react';
import { SC } from '../lib/constants';

export function BulkCreateModal({grupo,onSave,onClose,nextId,allResp}){
  const mkRow=()=>({id:Date.now()+Math.random(),t:'',c:'',s:'Nao Iniciado',r:''});
  const[rows,setRows]=useState([mkRow()]);
  const allResp2=(allResp&&allResp.length?allResp:['Aleson','Camila','Diguinho','Islan','Lourene','Matheus']);

  const setRow=(id,key,val)=>setRows(prev=>prev.map(r=>r.id===id?{...r,[key]:val}:r));
  const addRow=()=>setRows(prev=>[...prev,mkRow()]);
  const rmRow=id=>setRows(prev=>prev.length>1?prev.filter(r=>r.id!==id):prev);

  const saveAll=()=>{
    const valid=rows.filter(r=>r.t.trim());
    if(!valid.length)return;
    const today=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const items=valid.map(row=>({t:row.t.trim(),c:row.c.trim(),v:'',s:row.s,r:row.r,g:grupo,ng:'',mr:'',a:today+' - Card criado'}));
    onSave(items,nextId);
    onClose();
  };

  const handleKeyDown=(e,rowId,idx)=>{
    if(e.key==='Enter'){e.preventDefault();if(idx===rows.length-1)addRow();else document.getElementById('bcr-'+(idx+1))&&document.getElementById('bcr-'+(idx+1)).focus();}
    if(e.key==='Escape')onClose();
  };

  const valid=rows.filter(r=>r.t.trim()).length;
  const ist={background:'#F9FAFB',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt1)',fontSize:13,padding:'7px 10px',outline:'none'};

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:160,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:14,width:'min(680px,100%)',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 16px 56px rgba(0,0,0,.18)'}}>

        {/* Header */}
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:'var(--txt1)'}}>Criar múltiplos cards</div>
              <div style={{fontSize:12,color:'var(--txt3)',marginTop:3,display:'flex',alignItems:'center',gap:6}}>
                <span style={{padding:'1px 8px',borderRadius:99,background:'rgba(37,99,235,.1)',color:'var(--accent)',fontSize:11,fontWeight:600}}>{grupo}</span>
                <span>· Enter para avançar linha · Esc para fechar</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt3)',fontSize:18,cursor:'pointer',lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Column labels */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 110px 160px 140px 36px',gap:8,padding:'8px 24px 4px',flexShrink:0}}>
          {['Tarefa *','Card','Status','Responsável',''].map((lbl,i)=>(
            <span key={i} style={{fontSize:9,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.7}}>{lbl}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{flex:1,overflowY:'auto',padding:'4px 24px 8px'}}>
          {rows.map((row,idx)=>(
            <div key={row.id} style={{display:'grid',gridTemplateColumns:'1fr 110px 160px 140px 36px',gap:8,marginBottom:7,alignItems:'center'}}>
              <input id={"bcr-"+idx} value={row.t} onChange={e=>setRow(row.id,'t',e.target.value)} onKeyDown={e=>handleKeyDown(e,row.id,idx)}
                placeholder={"Ex: "+idx+".1 - Descrição da tarefa"} autoFocus={idx===0}
                style={{...ist,borderColor:row.t.trim()?'var(--border)':'var(--border)'}}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <input value={row.c} onChange={e=>setRow(row.id,'c',e.target.value)} onKeyDown={e=>handleKeyDown(e,row.id,idx)}
                placeholder="STK-XXXX" style={{...ist,fontFamily:'monospace',fontSize:11}}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <select value={row.s} onChange={e=>setRow(row.id,'s',e.target.value)} style={{...ist,cursor:'pointer'}}>
                {Object.keys(SC).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select value={row.r} onChange={e=>setRow(row.id,'r',e.target.value)} style={{...ist,cursor:'pointer'}}>
                <option value="">— Sem responsável</option>
                {allResp2.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={()=>rmRow(row.id)} style={{width:32,height:32,borderRadius:7,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.18)',color:'#DC2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>×</button>
            </div>
          ))}
          <button onClick={addRow} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'transparent',border:'1px dashed var(--border)',color:'var(--txt2)',fontSize:12,cursor:'pointer',marginTop:4,width:'100%',justifyContent:'center',transition:'all .15s'}} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)';}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--txt2)';}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar linha
          </button>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'var(--bg2)',borderRadius:'0 0 14px 14px'}}>
          <span style={{fontSize:12,color:'var(--txt3)'}}>{valid} card{valid!==1?'s':''} pronto{valid!==1?'s':''} para criar</span>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onClose} style={{padding:'8px 18px',background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt2)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
            <button onClick={saveAll} disabled={!valid} style={{padding:'8px 22px',background:valid?'linear-gradient(135deg,var(--accent),var(--cyan))':'var(--bg)',border:'none',borderRadius:8,color:valid?'#fff':'var(--txt3)',fontSize:13,fontWeight:700,cursor:valid?'pointer':'default',transition:'all .2s'}}>
              Criar {valid>0?valid+' ':''}{valid===1?'card':'cards'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   AUTH — Login & User Management
   ══════════════════════════════════════════════════════ */
