import React, { useEffect, useRef, useState } from 'react';
import { PD, PH } from '../lib/constants';

export function CellEditor({ced,onSave,onDelete,onClose}){
  const[ph,setPh]=useState(ced.act?ced.act.ph:'DEV');
  const[customPh,setCustomPh]=useState(ced.act&&ced.act.ph==='CUSTOM'&&ced.act.cl?ced.act.cl:'');
  const[note,setNote]=useState(ced.act?ced.act.lines[0].split(' - ').slice(1).join(' - '):'');
  const[df,setDf]=useState(ced.df);
  const[dt,setDt]=useState('');
  const[err,setErr]=useState('');
  const ref=useRef(null);
  const today=()=>new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});

  useEffect(()=>{setTimeout(()=>ref.current&&ref.current.focus(),60);},[]);

  const wdBetween=(from,to)=>{
    const p=s=>{const[d,m]=s.split('/').map(Number);return new Date(2026,m-1,d);};
    const s=p(from),e=p(to||from);
    if(isNaN(s.getTime())||isNaN(e.getTime())||e<s)return null;
    const days=[];const cur=new Date(s);
    while(cur<=e){const dow=cur.getDay();if(dow>=1&&dow<=5){const dd=String(cur.getDate()).padStart(2,'0'),mm=String(cur.getMonth()+1).padStart(2,'0');days.push(dd+'/'+mm);}cur.setDate(cur.getDate()+1);}
    return days;
  };

  const save=()=>{
    const days=wdBetween(df.trim(),dt.trim()||df.trim());
    if(!days||days.length===0){setErr('Data invalida');return;}
    let finalPh=ph==='CUSTOM'?'CUSTOM':ph;
    let finalNote;
    if(ph==='CUSTOM'&&customPh.trim()){
      finalNote='['+customPh.trim()+']'+(note.trim()?' '+note.trim():'');
    }else{
      finalNote=note.trim()||PD[ph]||'Atividade planejada';
    }
    setErr('');onSave(ced.task.id,days,finalPh,finalNote);onClose();
  };

  const inpSt={background:'var(--bg)',border:'1px solid var(--border)',borderRadius:7,color:'var(--txt1)',fontSize:11,padding:'6px 9px',outline:'none',width:'100%'};
  const ex=Math.min(ced.x+8,window.innerWidth-275);
  const ey=Math.min(ced.y-10,window.innerHeight-310);

  return(
    <React.Fragment>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:70}}/>
      <div style={{position:'fixed',left:ex,top:ey,width:265,background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:10,padding:'13px',zIndex:71,boxShadow:'0 8px 32px rgba(0,0,0,.7)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9}}>
          <span style={{fontSize:12,fontWeight:700,color:'var(--txt1)'}}>{ced.act?'Editar':'Planejar atividade'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt2)',cursor:'pointer',fontSize:16,lineHeight:1}}>✕</button>
        </div>
        <div style={{marginBottom:9}}>
          <div style={{fontSize:9,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Intervalo</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            <div><div style={{fontSize:9,color:'var(--txt3)',marginBottom:2}}>De</div><input value={df} onChange={e=>{setDf(e.target.value);setErr('');}} placeholder="DD/MM" style={inpSt} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            <div><div style={{fontSize:9,color:'var(--txt3)',marginBottom:2}}>Ate (opcional)</div><input value={dt} onChange={e=>{setDt(e.target.value);setErr('');}} placeholder="DD/MM" style={inpSt} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
          </div>
          {dt.trim()&&!err&&(()=>{const d=wdBetween(df.trim(),dt.trim());return d&&<div style={{fontSize:9,color:'var(--cyan)',marginTop:3}}>{d.length} dia{d.length!==1?'s':''} util{d.length!==1?'is':''}</div>;})()}
          {err&&<div style={{fontSize:9,color:'#F87171',marginTop:3}}>{err}</div>}
        </div>
        <div style={{marginBottom:9}}>
          <div style={{fontSize:9,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Fase</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:5}}>{Object.entries(PH).map(([k,p])=><button key={k} onClick={()=>{setPh(k);setCustomPh('');}} style={{padding:'3px 7px',borderRadius:5,fontSize:9,fontWeight:700,cursor:'pointer',border:'1px solid '+(ph===k?p.col:'var(--border)'),background:ph===k?p.sl:'rgba(255,255,255,.03)',color:ph===k?'rgba(0,0,0,.8)':p.col}}>{k==='DEV'?'Dev':p.lb}</button>)}</div>
          <input value={customPh} onChange={e=>{setCustomPh(e.target.value);if(e.target.value.trim())setPh('CUSTOM');}} placeholder="Ou digitar fase personalizada..." style={{width:'100%',background:ph==='CUSTOM'&&customPh?'rgba(37,99,235,.08)':'var(--bg)',border:'1px solid '+(ph==='CUSTOM'&&customPh?'var(--accent)':'var(--border)'),borderRadius:6,color:'var(--txt1)',fontSize:11,padding:'5px 9px',outline:'none'}} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor=ph==='CUSTOM'&&customPh?'var(--accent)':'var(--border)'}/>
        </div>
        <div style={{marginBottom:9}}>
          <div style={{fontSize:9,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Descricao</div>
          <input ref={ref} value={note} onChange={e=>setNote(e.target.value)} placeholder={PD[ph]} onKeyDown={e=>{if(e.key==='Enter')save();if(e.key==='Escape')onClose();}} style={inpSt} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
        </div>
        <div style={{display:'flex',gap:6}}>
          {ced.act&&(ced.act.src==='board'
            ?<div style={{padding:'5px 9px',borderRadius:6,background:'rgba(107,114,128,.06)',border:'1px solid rgba(107,114,128,.15)',color:'var(--txt3)',fontSize:9,display:'flex',alignItems:'center',gap:4}} title="Registro do Board — edite pelo painel de tarefas">
               <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               Do Board
             </div>
            :<button onClick={()=>{onDelete(ced.task.id,ced.dk,ced.act.src);onClose();}} style={{padding:'5px 9px',borderRadius:6,background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',color:'#F87171',fontSize:10,cursor:'pointer',whiteSpace:'nowrap'}}>Remover</button>
          )}
          <button onClick={onClose} style={{flex:1,padding:'6px',borderRadius:6,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:10,cursor:'pointer'}}>Cancelar</button>
          <button onClick={save} style={{flex:1,padding:'6px',borderRadius:6,background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',color:'#fff',fontSize:10,fontWeight:700,cursor:'pointer'}}>Salvar</button>
        </div>
      </div>
    </React.Fragment>
  );
}

