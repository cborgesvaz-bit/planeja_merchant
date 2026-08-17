import React, { useMemo } from 'react';
import { tn } from '../lib/constants';

export function BacklogView({tasks,iStatus,statusProduto,setIStatus,openCreate,openEdit}){
  const backlogGrupos=useMemo(()=>{
    const grupos=[...new Set(tasks.map(t=>t.g))];
    return grupos
      .filter(g=>!iStatus[g]||iStatus[g]==='Backlog')
      .sort((a,b)=>{
        const ta=tasks.find(t=>t.g===a),tb=tasks.find(t=>t.g===b);
        return(ta?tn(ta.t):0)-(tb?tn(tb.t):0);
      });
  },[tasks,iStatus]);

  const allTasks=tasks.filter(t=>backlogGrupos.includes(t.g));

  return(
    <div>
      <div style={{padding:'14px 24px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg1)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#6B7280'}}/>
          <span style={{fontSize:13,fontWeight:700,color:'var(--txt1)'}}>Backlog de Iniciativas</span>
          <span style={{fontSize:11,color:'var(--txt3)',background:'var(--bg2)',border:'1px solid var(--border)',padding:'1px 9px',borderRadius:99}}>{backlogGrupos.length} iniciativa{backlogGrupos.length!==1?'s':''} · {allTasks.length} tarefa{allTasks.length!==1?'s':''}</span>
        </div>
        {openCreate&&<button onClick={openCreate} style={{padding:'6px 16px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>+ Nova Tarefa</button>}
      </div>

      {backlogGrupos.length===0
        ?<div style={{padding:'60px 24px',textAlign:'center',color:'var(--txt3)'}}>
           <div style={{fontSize:32,marginBottom:12}}>✅</div>
           <div style={{fontSize:14,fontWeight:600,color:'var(--txt2)'}}>Nenhuma iniciativa em Backlog</div>
           <div style={{fontSize:12,marginTop:4}}>Todas as iniciativas têm status definido</div>
         </div>
        :<div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:14}}>
           {backlogGrupos.map(grupo=>{
             const gtasks=tasks.filter(t=>t.g===grupo);
             const smap={};
             gtasks.forEach(t=>{smap[t.s]=(smap[t.s]||0)+1;});
             const SCOL={"Em andamento":"#0891B2","Bloqueado":"#DC2626","Nao Iniciado":"#6B7280","Aguard. Deploy PRD":"#B45309","Paralisado":"#EA580C","Finalizado":"#059669","Entregue":"#047857","Deploy PRD":"#0369A1","Pendente":"#7C3AED"};
             return(
               <div key={grupo} style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
                 <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,background:'var(--bg2)'}}>
                   <div style={{flex:1}}>
                     <div style={{fontSize:14,fontWeight:700,color:'var(--txt1)'}}>{grupo}</div>
                     <div style={{display:'flex',height:4,borderRadius:4,overflow:'hidden',marginTop:6,gap:1,maxWidth:200}}>
                       {Object.entries(smap).map(([s,n])=><div key={s} title={s+': '+n} style={{flex:n,background:SCOL[s]||'#9CA3AF',minWidth:2}}/>)}
                     </div>
                   </div>
                   <span style={{fontSize:11,color:'var(--txt3)',background:'var(--bg)',border:'1px solid var(--border)',padding:'2px 9px',borderRadius:99}}>{gtasks.length} tarefa{gtasks.length!==1?'s':''}</span>
                   {setIStatus&&<select value={iStatus[grupo]||'Backlog'} onChange={e=>setIStatus(prev=>({...prev,[grupo]:e.target.value}))}
                     style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:7,border:'1px solid rgba(107,114,128,.3)',background:'rgba(107,114,128,.08)',color:'#6B7280',cursor:'pointer',outline:'none'}}>
                     {statusProduto.map(s=><option key={s} value={s}>{s}</option>)}
                   </select>}
                 </div>
                 <div style={{padding:'10px 18px',display:'flex',flexWrap:'wrap',gap:6}}>
                   {gtasks.slice(0,6).map(t=>(
                     <div key={t.id} onClick={()=>openEdit&&openEdit(t,{stopPropagation:()=>{}})} style={{padding:'5px 10px',borderRadius:6,background:'var(--bg)',border:'1px solid var(--border)',fontSize:11,color:'var(--txt2)',cursor:openEdit?'pointer':'default',display:'flex',alignItems:'center',gap:6,maxWidth:260}} title={t.t}>
                       <span style={{width:6,height:6,borderRadius:'50%',background:SCOL[t.s]||'#9CA3AF',flexShrink:0}}/>
                       <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.t}</span>
                     </div>
                   ))}
                   {gtasks.length>6&&<span style={{fontSize:11,color:'var(--txt3)',padding:'5px 0'}}>+{gtasks.length-6} mais...</span>}
                 </div>
               </div>
             );
           })}
         </div>
      }
    </div>
  );
}

