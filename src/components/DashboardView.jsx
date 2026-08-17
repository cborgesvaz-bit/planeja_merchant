import React, { useMemo } from 'react';
import { DONE, RISK_SEV, SC, getISCfg } from '../lib/constants';

export function KpiCard({label,value,sub,color}){
  return(
    <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',flex:'1 1 180px',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--txt3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>{label}</div>
      <div style={{fontSize:28,fontWeight:800,color:color||'var(--txt1)',lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'var(--txt3)',marginTop:6}}>{sub}</div>}
    </div>
  );
}
export function BarRow({label,n,total,color}){
  const pct=total?Math.round(n/total*100):0;
  return(
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
      <div style={{width:150,flexShrink:0,fontSize:11,color:'var(--txt2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</div>
      <div style={{flex:1,height:8,background:'var(--bg2)',borderRadius:99,overflow:'hidden'}}>
        <div style={{width:pct+'%',height:'100%',background:color||'var(--accent)',borderRadius:99}}/>
      </div>
      <div style={{width:34,textAlign:'right',fontSize:11,fontWeight:700,color:'var(--txt1)',flexShrink:0}}>{n}</div>
    </div>
  );
}
export function DashboardView({tasks,iStatus={},riscos=[],deps=[]}){
  const total=tasks.length;
  const done=tasks.filter(t=>DONE.includes(t.s));
  const active=tasks.filter(t=>!DONE.includes(t.s));
  const bloqueadas=tasks.filter(t=>t.s==='Bloqueado').length;
  const statusCounts=useMemo(()=>{const m={};tasks.forEach(t=>{m[t.s]=(m[t.s]||0)+1;});return m;},[tasks]);
  const initStatusCounts=useMemo(()=>{
    const grupos=[...new Set(tasks.map(t=>t.g))];
    const m={};grupos.forEach(g=>{const s=iStatus[g]||'Backlog';m[s]=(m[s]||0)+1;});return m;
  },[tasks,iStatus]);
  const now=new Date();
  const entregasMes=useMemo(()=>{
    return done.filter(t=>{
      if(!t.a)return false;
      return t.a.split('\n').some(line=>{
        const m=line.match(/^(\d{1,2})\/(\d{1,2})/);
        if(!m)return false;
        if(!/deploy em prd/i.test(line))return false;
        return(+m[2]-1)===now.getMonth();
      });
    }).length;
  },[done]);
  const riscosAtivos=riscos.filter(r=>r.status==='Ativo');
  const riscosAltos=riscosAtivos.filter(r=>r.severidade==='Alta');
  const respCounts=useMemo(()=>{const m={};active.forEach(t=>{if(t.r)m[t.r]=(m[t.r]||0)+1;});return m;},[active]);

  return(
    <div style={{padding:'22px 24px 48px',maxWidth:1280,margin:'0 auto'}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:24}}>
        <KpiCard label="Tarefas ativas" value={active.length} sub={total+' no total'} color="var(--accent)"/>
        <KpiCard label="Concluídas" value={done.length} sub="Finalizado + Entregue" color="#059669"/>
        <KpiCard label="Bloqueadas" value={bloqueadas} sub="Requerem atenção" color="#DC2626"/>
        <KpiCard label="Entregas no mês" value={entregasMes} sub="Deploy em PRD" color="#0369A1"/>
        <KpiCard label="Riscos ativos" value={riscosAtivos.length} sub={riscosAltos.length+' de severidade alta'} color={riscosAltos.length?'#DC2626':'#6B7280'}/>
        <KpiCard label="Dependências mapeadas" value={deps.length} color="#7C3AED"/>
      </div>

      <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
        <div style={{flex:'1 1 380px',background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--txt1)',marginBottom:14}}>Tarefas por status</div>
          {Object.entries(statusCounts).sort((a,b)=>b[1]-a[1]).map(([s,n])=>(
            <BarRow key={s} label={s} n={n} total={total} color={(SC[s]&&SC[s].c)||'#9CA3AF'}/>
          ))}
        </div>
        <div style={{flex:'1 1 380px',background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--txt1)',marginBottom:14}}>Iniciativas por status</div>
          {Object.entries(initStatusCounts).sort((a,b)=>b[1]-a[1]).map(([s,n])=>(
            <BarRow key={s} label={s} n={n} total={Object.values(initStatusCounts).reduce((a,b)=>a+b,0)} color={getISCfg(s).c}/>
          ))}
        </div>
        <div style={{flex:'1 1 380px',background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--txt1)',marginBottom:14}}>Carga por responsável (ativas)</div>
          {Object.keys(respCounts).length===0
            ?<div style={{fontSize:11,color:'var(--txt3)'}}>Nenhuma tarefa atribuída.</div>
            :Object.entries(respCounts).sort((a,b)=>b[1]-a[1]).map(([r,n])=>(
              <BarRow key={r} label={r} n={n} total={active.length} color="var(--cyan)"/>
            ))}
        </div>
        <div style={{flex:'1 1 380px',background:'#fff',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--txt1)'}}>Riscos em aberto</div>
            <span style={{fontSize:10,color:'var(--txt3)'}}>{riscosAtivos.length} ativo{riscosAtivos.length!==1?'s':''}</span>
          </div>
          {riscosAtivos.length===0
            ?<div style={{fontSize:11,color:'var(--txt3)'}}>Nenhum risco ativo mapeado.</div>
            :riscosAtivos.slice(0,6).map(r=>(
              <div key={r.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:(RISK_SEV[r.severidade]||RISK_SEV.Media).c,flexShrink:0}}/>
                <span style={{fontSize:12,color:'var(--txt1)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.descricao}</span>
                <span style={{fontSize:10,fontWeight:700,color:(RISK_SEV[r.severidade]||RISK_SEV.Media).c}}>{r.severidade}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

