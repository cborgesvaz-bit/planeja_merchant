import React, { useEffect } from 'react';
import { SC, TIPO_CFG } from '../lib/constants';

export function LoadingScreen(){
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:16}}>
      <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,var(--accent),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🧭</div>
      <div style={{fontSize:15,fontWeight:600,color:'var(--txt2)'}}>Carregando Planeja Merchant...</div>
      <div style={{width:200,height:3,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
        <div style={{width:'60%',height:'100%',background:'linear-gradient(90deg,var(--accent),var(--cyan))',borderRadius:99,animation:'pulse 1.5s ease infinite'}}/>
      </div>
    </div>
  );
}



export function TipoBadge({tipo}){
  const cfg=TIPO_CFG[tipo]||TIPO_CFG.Tarefa;
  return <span style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:5,background:cfg.bg,color:cfg.c,fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,whiteSpace:'nowrap'}}>{cfg.lb}</span>;
}
// Riscos — severidade/status

export function Badge({s}){
  const cfg=SC[s]||{c:'#9CA3AF',bg:'rgba(156,163,175,.1)',d:'#9CA3AF',p:false};
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:7,background:cfg.bg,color:cfg.c,fontSize:12,fontWeight:600,border:'1px solid '+cfg.c+'33',whiteSpace:'nowrap'}}>
    <span style={{width:5,height:5,borderRadius:'50%',background:cfg.d,animation:cfg.p?'pulse 2s infinite':'none'}}/>
    {s}
  </span>;
}
export function SortIcon({dir}){
  if(!dir)return(
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{opacity:.3,display:'inline-block',verticalAlign:'middle'}}>
      <path d="M3 4l2-2 2 2M3 6l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return(
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{color:'var(--accent)',display:'inline-block',verticalAlign:'middle'}}>
      {dir==='asc'
        ?<path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        :<path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  );
}

export const Ic=({n,s=13,c='currentColor'})=>{
  const paths={
    card:    <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/></>,
    task:    <><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/></>,
    status:  <><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></>,
    person:  <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    tag:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></>,
    hash:    <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
    dots:    <><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>,
    edit:    <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    chevron: <path d="M9 18l6-6-6-6"/>,
    expand:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0}}>{paths[n]||null}</svg>;
};
export function Pill({val,active,onClick,color}){
  return <button onClick={onClick} style={{padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:500,cursor:'pointer',border:'1px solid '+(active?(color||'var(--accent)'):'var(--border2)'),background:active?(color?color+'20':'rgba(37,99,235,.1)'):'transparent',color:active?(color||'var(--cyan)'):'var(--txt2)',transition:'all .15s'}}>
    {val}{active?' x':''}
  </button>;
}
export function Toast({msg,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[onDone]);
  return <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:10,padding:'12px 22px',display:'flex',alignItems:'center',gap:10,zIndex:200,boxShadow:'0 8px 32px rgba(0,0,0,.5)',animation:'fadeSlideUp .3s ease',maxWidth:'90vw'}}>
    <span>ok</span><span style={{fontSize:13,color:'var(--txt1)'}}>{msg}</span>
  </div>;
}

