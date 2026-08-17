import React, { useEffect, useMemo, useState } from 'react';
import { BacklogView } from './BacklogView';
import { BoardView } from './BoardView';
import { BulkCreateModal } from './BulkCreateModal';
import { DashboardView } from './DashboardView';
import { DependenciasRiscosView } from './DependenciasRiscosView';
import { Drawer } from './Drawer';
import { HistoricoView } from './HistoricoView';
import { InitiativeManager } from './InitiativeManager';
import { DEFAULT_RESP, ResponsavelManager } from './ResponsavelManager';
import { Timeline } from './Timeline';
import { UserManager } from './UserManager';
import { LoadingScreen, Toast } from './ui';
import { dbGet, dbSet, loadResps, loadStatusProduto, loadTasks, saveTasks } from '../lib/api';
import { DEFAULT_USERS, ROLES } from '../lib/auth';
import { DONE, SC, initView } from '../lib/constants';
import { exportXLSX } from '../lib/export';
import { T0 } from '../lib/seed';

export function AppMain({currentUser,onLogout}){
  const canEdit=currentUser.role==='admin'||currentUser.role==='editor';
  const isAdmin=currentUser.role==='admin';
  const[showUserMgr,setShowUserMgr]=useState(false);
  const[showRespMgr,setShowRespMgr]=useState(false);
  const[resps,setRespsLocal]=useState(DEFAULT_RESP);
  const[users,setUsers]=useState(DEFAULT_USERS);
  const[statusProduto,setStatusProduto]=useState(['Backlog','Discovery Produto','Discovery Tecnico','Desenvolvimento','Homologacao','Pausado','Concluido']);
  const[theme,setTheme]=useState(()=>{try{return localStorage.getItem('pm_theme')||'light';}catch(e){return'light';}});
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
    try{localStorage.setItem('pm_theme',theme);}catch(e){}
  },[theme]);
  const toggleTheme=()=>setTheme(t=>t==='light'?'dark':'light');
  const handleLogout=()=>{onLogout();};

  const[tasks,setTasks]=useState([]);
  const[iStatus,setIStatus]=useState({});
  const[tipos,setTipos]=useState({});
  const[deps,setDeps]=useState([]);
  const[riscos,setRiscos]=useState([]);
  const[nextId,setNextId]=useState(1);
  const[loaded,setLoaded]=useState(false);
  const[view,setView]=useState('dashboard');
  const[drawerOpen,setDrawerOpen]=useState(false);
  const[editing,setEditing]=useState(null);
  const[toast,setToast]=useState(null);
  const[showIM,setShowIM]=useState(false);
  const[bulkCreate,setBulkCreate]=useState(null);
  const hasLocalData=true;
  const restoreDefaults=async()=>{if(window.confirm('Restaurar dados originais?')){await dbSet('tasks',T0);window.location.reload();}};

  // Load all data from Supabase on mount
  useEffect(()=>{
    (async()=>{
      try{
        const[t,r,is,u,sp,tp,dp,rk]=await Promise.all([loadTasks(),loadResps(),dbGet('istatus'),dbGet('users'),loadStatusProduto(),dbGet('tipos'),dbGet('dependencias'),dbGet('riscos')]);
        if(Array.isArray(sp)&&sp.length>0)setStatusProduto(sp);
        const td=Array.isArray(t)&&t.length>0?t:T0;
        setTasks(td);
        setNextId(Math.max(...td.map(x=>x.id||0),0)+1);
        if(Array.isArray(r)&&r.length>0)setRespsLocal(r);
        if(is&&typeof is==='object')setIStatus(is);
        if(u&&Array.isArray(u)&&u.length>0)setUsers(u);
        if(tp&&typeof tp==='object')setTipos(tp);
        if(Array.isArray(dp))setDeps(dp);
        if(Array.isArray(rk))setRiscos(rk);
      }catch(e){console.error('Load error:',e);setTasks(T0);setNextId(T0.length+1);}
      setLoaded(true);
    })();
  },[]);

  // Save to Supabase (debounced)
  useEffect(()=>{if(!loaded||!tasks.length)return;const t=setTimeout(()=>saveTasks(tasks),600);return()=>clearTimeout(t);},[tasks,loaded]);
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('istatus',iStatus),600);return()=>clearTimeout(t);},[iStatus,loaded]);
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('resps',resps),600);return()=>clearTimeout(t);},[resps,loaded]); // also syncs responsavel table
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('users',users),600);return()=>clearTimeout(t);},[users,loaded]);
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('tipos',tipos),600);return()=>clearTimeout(t);},[tipos,loaded]);
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('dependencias',deps),600);return()=>clearTimeout(t);},[deps,loaded]);
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>dbSet('riscos',riscos),600);return()=>clearTimeout(t);},[riscos,loaded]);
  const active=useMemo(()=>tasks.filter(t=>!DONE.includes(t.s)),[tasks]);
  // Tasks split by initiative status
  const boardTasks=useMemo(()=>active.filter(t=>initView(iStatus[t.g])==='board'),[active,iStatus]);
  const historicoTasks=useMemo(()=>tasks.filter(t=>DONE.includes(t.s)||initView(iStatus[t.g])==='historico'),[tasks,iStatus]);
  const allG=useMemo(()=>[...new Set(tasks.map(t=>t.g))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[tasks]);
  const sCounts=useMemo(()=>tasks.reduce((a,t)=>{a[t.s]=(a[t.s]||0)+1;return a;},{}),[tasks]);

  const openCreate=(group=null)=>{setEditing(group?{_preGroup:group}:null);setDrawerOpen(true);};
  const openEdit=(task,e)=>{e.stopPropagation();setEditing(task);setDrawerOpen(true);};
  const handleMultiSave=(items,startId)=>{
    const today=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const newTasks=items.map((data,i)=>({...data,id:startId+i,a:data.a||today+' - Card criado'}));
    setTasks(prev=>[...prev,...newTasks]);
    setNextId(n=>n+newTasks.length);
    setTipos(prev=>{const n={...prev};newTasks.forEach(t=>{n[t.id]=t.tipo||'Tarefa';});return n;});
    setToast(newTasks.length+' card'+(newTasks.length!==1?'s':'')+' criado'+(newTasks.length!==1?'s':'')+' em "'+items[0].g+'"');
  };
  const handleSave=(data,editId)=>{
    const{tipo,...rest}=data;
    if(editId!=null){
      setTasks(prev=>prev.map(t=>t.id===editId?{...t,...rest}:t));
      setTipos(prev=>({...prev,[editId]:tipo||'Tarefa'}));
      setToast('Tarefa atualizada!');
    }else{
      const today=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
      const a=rest.a||today+' - Card criado';
      const id=nextId;
      setTasks(prev=>[...prev,{...rest,id,a}]);setNextId(n=>n+1);
      setTipos(prev=>({...prev,[id]:tipo||'Tarefa'}));
      setToast('Tarefa criada em "'+rest.g+'"');
    }
  };

  const VIEWS=[
    ['dashboard','Dashboard','📊'],
    ['board','Board','🗂️'],
    ['timeline','Timeline','📅'],
    ['backlog','Backlog','🗒️'],
    ['depriscos','Dependências & Riscos','🔗'],
    ['historico','Histórico','✅'],
  ];
  const viewLbl=(VIEWS.find(v=>v[0]===view)||[,'Planeja Merchant'])[1];

  if(!loaded)return <LoadingScreen/>;
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',display:'flex'}}>
      {/* ══ Sidebar ══ */}
      <div style={{width:230,flexShrink:0,background:'var(--sidebar-bg)',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'20px 18px 18px'}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,var(--accent),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}}>🧭</div>
          <div style={{fontSize:14,fontWeight:800,color:'#fff',letterSpacing:-.3,lineHeight:1.2}}>Planeja<br/>Merchant</div>
        </div>
        <div style={{padding:'4px 12px',display:'flex',flexDirection:'column',gap:2,flex:1}}>
          {VIEWS.map(([id,lbl,ico])=>(
            <button key={id} className="sb-item" onClick={()=>setView(id)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:view===id?'rgba(255,255,255,.1)':'transparent',color:view===id?'var(--sidebar-txt-active)':'var(--sidebar-txt)',fontSize:13,fontWeight:view===id?700:500,cursor:'pointer',textAlign:'left',transition:'background .12s'}}>
              <span style={{fontSize:15,width:18,textAlign:'center',flexShrink:0}}>{ico}</span>
              <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{lbl}</span>
            </button>
          ))}
        </div>
        <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:10,color:'var(--sidebar-txt)',opacity:.7,padding:'0 12px 4px'}}>{boardTasks.length} ativas · {tasks.filter(t=>DONE.includes(t.s)).length} concluídas</div>
          {hasLocalData&&<div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,background:'rgba(16,185,129,.12)'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',flexShrink:0}}/>
            <span style={{fontSize:10,fontWeight:600,color:'#34D399',flex:1}}>Supabase conectado</span>
            <button onClick={restoreDefaults} title="Restaurar dados originais" style={{background:'none',border:'none',color:'#34D399',cursor:'pointer',fontSize:11,padding:0,lineHeight:1}}>&#8635;</button>
          </div>}
        </div>
      </div>

      {/* ══ Main column ══ */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{background:'var(--bg1)',borderBottom:'1px solid var(--border)',boxShadow:'var(--shadow-sm)',position:'sticky',top:0,zIndex:100}}>
          <div style={{padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:60,gap:12}}>
            <div style={{fontSize:15,fontWeight:700,color:'var(--txt1)',flexShrink:0}}>{viewLbl}</div>
            <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
              {Object.entries(sCounts).map(([s,n])=>{const cfg=SC[s]||{c:'#9CA3AF',bg:'rgba(156,163,175,.08)',d:'#9CA3AF'};return(
                <div key={s} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:99,background:cfg.bg,border:'1px solid '+cfg.c+'44',whiteSpace:'nowrap',boxShadow:'var(--shadow-sm)'}}>
                  <span style={{fontSize:14,fontWeight:700,color:cfg.c,lineHeight:1}}>{n}</span>
                  <span style={{fontSize:11,fontWeight:500,color:cfg.c,opacity:.9}}>{s}</span>
                </div>
              );})}
              <button onClick={toggleTheme} title={theme==='light'?'Modo escuro':'Modo claro'} style={{width:30,height:30,borderRadius:99,background:'var(--bg2)',border:'1px solid var(--border)',color:'var(--txt2)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{theme==='light'?'🌙':'☀️'}</button>
              <button onClick={()=>exportXLSX(tasks)} style={{padding:'5px 11px',background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.25)',borderRadius:99,color:'#34D399',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>Excel</button>
              <button onClick={()=>setShowIM(true)} style={{padding:'5px 11px',background:'rgba(167,139,250,.1)',border:'1px solid rgba(167,139,250,.25)',borderRadius:99,color:'#A78BFA',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>Iniciativas</button>
              {canEdit&&openCreate&&<button onClick={openCreate} style={{padding:'6px 18px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:99,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>+ Nova Tarefa</button>}
              {/* User menu */}
              <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 10px',borderRadius:99,background:'var(--bg2)',border:'1px solid var(--border)',flexShrink:0}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:ROLES[currentUser.role]?.bg||'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:ROLES[currentUser.role]?.color||'var(--txt2)',flexShrink:0}}>
                  {currentUser.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{lineHeight:1.2}}>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--txt1)',whiteSpace:'nowrap'}}>{currentUser.name}</div>
                  <div style={{fontSize:9,color:'var(--txt3)'}}>{ROLES[currentUser.role]?.label||currentUser.role}</div>
                </div>
                {isAdmin&&<button onClick={()=>setShowRespMgr(true)} title="Gerenciar responsáveis" style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'2px',fontSize:14,lineHeight:1}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 018 0v2"/><line x1="19" y1="11" x2="19" y2="17"/><line x1="16" y1="14" x2="22" y2="14"/></svg></button>}
                {isAdmin&&<button onClick={()=>setShowUserMgr(true)} title="Gerenciar usuários" style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'2px',fontSize:14,lineHeight:1}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </button>}
                <button onClick={handleLogout} title="Sair" style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',padding:'2px',fontSize:14,lineHeight:1}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          {view==='dashboard'?<DashboardView tasks={tasks} iStatus={iStatus} riscos={riscos} deps={deps}/>
            :view==='board'?<BoardView tasks={boardTasks} setTasks={setTasks} openCreate={canEdit?openCreate:null} openEdit={canEdit?openEdit:null} iStatus={iStatus} setIStatus={canEdit?setIStatus:null} openBulkCreate={canEdit?setBulkCreate:null} statusProduto={statusProduto} tipos={tipos}/>
            :view==='timeline'?<Timeline tasks={boardTasks} setTasks={setTasks} iStatus={iStatus} setIStatus={setIStatus}/>
            :view==='backlog'?<BacklogView tasks={tasks} iStatus={iStatus} statusProduto={statusProduto} setIStatus={canEdit?setIStatus:null} openCreate={canEdit?openCreate:null} openEdit={canEdit?openEdit:null}/>
            :view==='depriscos'?<DependenciasRiscosView tasks={tasks} deps={deps} setDeps={setDeps} riscos={riscos} setRiscos={setRiscos} allG={allG} canEdit={canEdit}/>
            :<HistoricoView tasks={historicoTasks} setTasks={setTasks} openEdit={openEdit} iStatus={iStatus} setIStatus={canEdit?setIStatus:null} statusProduto={statusProduto} openBulkCreate={canEdit?setBulkCreate:null} canEdit={canEdit}/>}
        </div>
      </div>
      <Drawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} onSave={handleSave} grupos={allG} allResp={[...new Set([...resps,...tasks.map(t=>t.r).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'pt-BR'))} editing={editing} tipos={tipos}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      {showIM&&<InitiativeManager tasks={tasks} setTasks={setTasks} iStatus={iStatus} setIStatus={setIStatus} onClose={()=>setShowIM(false)}/>}
      {showUserMgr&&<UserManager currentUser={currentUser} users={users} setUsers={setUsers} onClose={()=>setShowUserMgr(false)}/>}
      {showRespMgr&&<ResponsavelManager resps={resps} onSave={r=>{setRespsLocal(r);}} onClose={()=>setShowRespMgr(false)}/>}
      {bulkCreate&&<BulkCreateModal grupo={bulkCreate} onSave={handleMultiSave} onClose={()=>setBulkCreate(null)} nextId={nextId} allResp={resps}/>}
    </div>
  );
}


/* ── Responsavel Manager ──────────────────────────────── */
