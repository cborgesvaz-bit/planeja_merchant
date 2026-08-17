import React, { useState } from 'react';
import { DEP_TIPO, RISK_SEV, RISK_STATUS } from '../lib/constants';

export function DependenciasRiscosView({tasks,deps,setDeps,riscos,setRiscos,allG=[],canEdit}){
  const[tab,setTab]=useState('dep');
  const[form,setForm]=useState(null); // {kind:'dep'|'risco', data:{...}} while editing/creating
  const ist={width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:13,padding:'8px 11px',outline:'none'};

  const newDep=()=>setForm({kind:'dep',data:{id:Date.now(),origem:allG[0]||'',destino:allG[0]||'',tipo:'Bloqueia',obs:''}});
  const newRisco=()=>setForm({kind:'risco',data:{id:Date.now(),descricao:'',iniciativa:allG[0]||'',severidade:'Media',status:'Ativo',mitigacao:''}});

  const save=()=>{
    if(!form)return;
    const{kind,data}=form;
    if(kind==='dep'){
      if(!data.origem||!data.destino)return;
      setDeps(prev=>{const ex=prev.some(d=>d.id===data.id);return ex?prev.map(d=>d.id===data.id?data:d):[...prev,data];});
    }else{
      if(!data.descricao.trim())return;
      setRiscos(prev=>{const ex=prev.some(r=>r.id===data.id);return ex?prev.map(r=>r.id===data.id?data:r):[...prev,data];});
    }
    setForm(null);
  };
  const delDep=id=>setDeps(prev=>prev.filter(d=>d.id!==id));
  const delRisco=id=>setRiscos(prev=>prev.filter(r=>r.id!==id));

  const Modal=()=>{
    if(!form)return null;
    const{kind,data}=form;
    const set=(k,v)=>setForm(f=>({...f,data:{...f.data,[k]:v}}));
    return(
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:150,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setForm(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,width:'min(460px,100%)',boxShadow:'0 12px 48px rgba(0,0,0,.15)'}}>
          <div style={{padding:'18px 22px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:15,fontWeight:700,color:'var(--txt1)'}}>{kind==='dep'?'Dependência entre iniciativas':'Risco'}</div>
          </div>
          <div style={{padding:'20px 22px',display:'flex',flexDirection:'column',gap:14}}>
            {kind==='dep'?(
              <React.Fragment>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Origem</div>
                  <select value={data.origem} onChange={e=>set('origem',e.target.value)} style={ist}>{allG.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Destino</div>
                  <select value={data.destino} onChange={e=>set('destino',e.target.value)} style={ist}>{allG.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Tipo</div>
                  <select value={data.tipo} onChange={e=>set('tipo',e.target.value)} style={ist}>{Object.keys(DEP_TIPO).map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Observação</div>
                  <textarea value={data.obs} onChange={e=>set('obs',e.target.value)} rows={3} style={{...ist,resize:'vertical'}}/></div>
              </React.Fragment>
            ):(
              <React.Fragment>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Descrição</div>
                  <textarea value={data.descricao} onChange={e=>set('descricao',e.target.value)} rows={2} style={{...ist,resize:'vertical'}}/></div>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Iniciativa relacionada</div>
                  <select value={data.iniciativa} onChange={e=>set('iniciativa',e.target.value)} style={ist}><option value="">—</option>{allG.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Severidade</div>
                    <select value={data.severidade} onChange={e=>set('severidade',e.target.value)} style={ist}>{Object.keys(RISK_SEV).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Status</div>
                    <select value={data.status} onChange={e=>set('status',e.target.value)} style={ist}>{Object.keys(RISK_STATUS).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div><div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:5}}>Mitigação</div>
                  <textarea value={data.mitigacao} onChange={e=>set('mitigacao',e.target.value)} rows={2} style={{...ist,resize:'vertical'}}/></div>
              </React.Fragment>
            )}
          </div>
          <div style={{padding:'14px 22px',borderTop:'1px solid var(--border)',display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button onClick={()=>setForm(null)} style={{padding:'7px 16px',background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
            <button onClick={save} style={{padding:'7px 20px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Salvar</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div style={{padding:'20px 24px 48px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',gap:6,background:'var(--bg)',border:'1px solid var(--border2)',borderRadius:9,padding:3}}>
          <button onClick={()=>setTab('dep')} style={{padding:'6px 14px',borderRadius:7,border:'none',fontSize:12,fontWeight:600,cursor:'pointer',background:tab==='dep'?'#EEF2FF':'transparent',color:tab==='dep'?'var(--accent)':'var(--txt2)'}}>Dependências ({deps.length})</button>
          <button onClick={()=>setTab('risco')} style={{padding:'6px 14px',borderRadius:7,border:'none',fontSize:12,fontWeight:600,cursor:'pointer',background:tab==='risco'?'#FEF2F2':'transparent',color:tab==='risco'?'#DC2626':'var(--txt2)'}}>Riscos ({riscos.length})</button>
        </div>
        {canEdit&&<button onClick={tab==='dep'?newDep:newRisco} style={{padding:'7px 16px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:99,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>{tab==='dep'?'+ Nova dependência':'+ Novo risco'}</button>}
      </div>

      {tab==='dep'?(
        deps.length===0
          ?<div style={{padding:'50px 20px',textAlign:'center',color:'var(--txt3)',fontSize:13}}>Nenhuma dependência mapeada entre iniciativas ainda.</div>
          :<div style={{display:'flex',flexDirection:'column',gap:8}}>
            {deps.map(d=>(
              <div key={d.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                <span style={{fontSize:13,fontWeight:600,color:'var(--txt1)'}}>{d.origem}</span>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:99,background:(DEP_TIPO[d.tipo]||DEP_TIPO.Relacionada).bg,color:(DEP_TIPO[d.tipo]||DEP_TIPO.Relacionada).c}}>{d.tipo}</span>
                <span style={{fontSize:13,fontWeight:600,color:'var(--txt1)'}}>{d.destino}</span>
                {d.obs&&<span style={{fontSize:12,color:'var(--txt3)',flex:1}}>{d.obs}</span>}
                {canEdit&&<div style={{display:'flex',gap:6,marginLeft:'auto'}}>
                  <button onClick={()=>setForm({kind:'dep',data:d})} style={{padding:'4px 9px',borderRadius:6,background:'rgba(180,83,9,.07)',border:'1px solid rgba(180,83,9,.2)',color:'#B45309',fontSize:11,cursor:'pointer'}}>Editar</button>
                  <button onClick={()=>delDep(d.id)} style={{padding:'4px 9px',borderRadius:6,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.2)',color:'#DC2626',fontSize:11,cursor:'pointer'}}>Excluir</button>
                </div>}
              </div>
            ))}
          </div>
      ):(
        riscos.length===0
          ?<div style={{padding:'50px 20px',textAlign:'center',color:'var(--txt3)',fontSize:13}}>Nenhum risco mapeado ainda.</div>
          :<div style={{display:'flex',flexDirection:'column',gap:8}}>
            {riscos.map(r=>(
              <div key={r.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:r.mitigacao?6:0}}>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:99,background:(RISK_SEV[r.severidade]||RISK_SEV.Media).bg,color:(RISK_SEV[r.severidade]||RISK_SEV.Media).c}}>{r.severidade}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:99,background:(RISK_STATUS[r.status]||RISK_STATUS.Ativo).bg,color:(RISK_STATUS[r.status]||RISK_STATUS.Ativo).c}}>{r.status}</span>
                  {r.iniciativa&&<span style={{fontSize:11,color:'var(--txt3)'}}>{r.iniciativa}</span>}
                  <span style={{fontSize:13,color:'var(--txt1)',fontWeight:600}}>{r.descricao}</span>
                  {canEdit&&<div style={{display:'flex',gap:6,marginLeft:'auto'}}>
                    <button onClick={()=>setForm({kind:'risco',data:r})} style={{padding:'4px 9px',borderRadius:6,background:'rgba(180,83,9,.07)',border:'1px solid rgba(180,83,9,.2)',color:'#B45309',fontSize:11,cursor:'pointer'}}>Editar</button>
                    <button onClick={()=>delRisco(r.id)} style={{padding:'4px 9px',borderRadius:6,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.2)',color:'#DC2626',fontSize:11,cursor:'pointer'}}>Excluir</button>
                  </div>}
                </div>
                {r.mitigacao&&<div style={{fontSize:12,color:'var(--txt2)',paddingLeft:2}}><span style={{color:'var(--txt3)'}}>Mitigação: </span>{r.mitigacao}</div>}
              </div>
            ))}
          </div>
      )}
      <Modal/>
    </div>
  );
}

