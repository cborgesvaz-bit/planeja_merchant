import React, { useState } from 'react';
import { AppMain } from './AppMain';
import { BoardView } from './BoardView';
import { Timeline } from './Timeline';

export function HistoricoView({tasks,setTasks,openEdit,iStatus,setIStatus,statusProduto,openBulkCreate,canEdit}){
  const[sv,setSv]=useState('board');
  const done=tasks; // already filtered by AppMain (historicoTasks)
  return(
    <div>
      <div style={{padding:'11px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,background:'rgba(16,185,129,.03)'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <span style={{fontSize:10,fontWeight:700,color:'#34D399',textTransform:'uppercase',letterSpacing:.8}}>Historico de entregas</span>
          <span style={{fontSize:10,color:'var(--txt3)',background:'var(--bg2)',padding:'2px 8px',borderRadius:99}}>{done.length} tarefa{done.length!==1?'s':''}</span>
        </div>
        <div style={{display:'flex',gap:7}}>
          {[['board','Tarefas','📋'],['timeline','Linha do Tempo','📅']].map(([id,lbl,ico])=>(
            <button key={id} onClick={()=>setSv(id)} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:7,border:'1px solid '+(sv===id?'#34D39944':'var(--border)'),background:sv===id?'rgba(52,211,153,.1)':'transparent',color:sv===id?'#34D399':'var(--txt2)',fontSize:11,fontWeight:600,cursor:'pointer'}}>{ico} {lbl}</button>
          ))}
        </div>
      </div>
      {sv==='board'?<BoardView tasks={done} setTasks={setTasks} openCreate={null} openEdit={openEdit} iStatus={iStatus} setIStatus={setIStatus} statusProduto={statusProduto} openBulkCreate={openBulkCreate}/>:<Timeline tasks={done} setTasks={setTasks} iStatus={iStatus} setIStatus={setIStatus}/>}
    </div>
  );
}


