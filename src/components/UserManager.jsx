import React, { useState } from 'react';
import { ROLES } from '../lib/auth';

export function UserManager({currentUser,users,setUsers,onClose}){
  const setUsersState=u=>{setUsers(u);};
  const[form,setForm]=useState({name:'',email:'',role:'editor'});
  const[editing,setEditing]=useState(null);
  const[errs,setErrs]=useState({});
  const[confirmDel,setConfirmDel]=useState(null);

  const saveAll=u=>{setUsersState(u);};

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name='Obrigatório';
    if(!form.email.trim()||!form.email.includes('@'))e.email='Email inválido';
    const dup=users.find(u=>u.email.toLowerCase()===form.email.toLowerCase()&&u.id!==(editing?.id));
    if(dup)e.email='Email já cadastrado';
    return e;
  };

  const save=()=>{
    const e=validate();if(Object.keys(e).length){setErrs(e);return;}
    if(editing){
      saveAll(users.map(u=>u.id===editing.id?{...u,name:form.name,email:form.email,role:form.role}:u));
    }else{
      saveAll([...users,{id:Date.now(),name:form.name,email:form.email,role:form.role,active:true}]);
    }
    setForm({name:'',email:'',role:'editor'});setEditing(null);setErrs({});
  };

  const startEdit=u=>{setEditing(u);setForm({name:u.name,email:u.email,role:u.role});setErrs({});};
  const toggleActive=u=>saveAll(users.map(x=>x.id===u.id?{...x,active:!x.active}:x));
  const deleteUser=id=>{saveAll(users.filter(u=>u.id!==id));setConfirmDel(null);};

  const ist={width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--txt1)',fontSize:13,padding:'8px 11px',outline:'none'};
  const Lbl=({c,err})=><div style={{marginBottom:5}}><span style={{fontSize:10,fontWeight:700,color:err?'#DC2626':'var(--txt3)',textTransform:'uppercase',letterSpacing:.7}}>{c}</span>{err&&<span style={{fontSize:10,color:'#DC2626',marginLeft:6}}>{err}</span>}</div>;

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:14,width:'min(820px,100%)',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 16px 56px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'var(--txt1)'}}>Gerenciar Usuários</div>
            <div style={{fontSize:11,color:'var(--txt3)',marginTop:2}}>{users.length} usuário{users.length!==1?'s':''} cadastrado{users.length!==1?'s':''}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--txt2)',fontSize:18,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>

          {/* Form */}
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--txt1)',marginBottom:14}}>{editing?'Editar usuário':'Novo usuário'}</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><Lbl c="Nome" err={errs.name}/><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nome completo" style={ist} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
              <div><Lbl c="Email" err={errs.email}/><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemplo.com" style={ist} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
              <div>
                <Lbl c="Perfil"/>
                <div style={{display:'flex',gap:8}}>
                  {Object.entries(ROLES).map(([k,v])=>(
                    <button key={k} onClick={()=>setForm(f=>({...f,role:k}))} style={{flex:1,padding:'7px 0',borderRadius:7,border:'1px solid '+(form.role===k?v.color+'66':'var(--border)'),background:form.role===k?v.bg:'transparent',color:form.role===k?v.color:'var(--txt2)',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                {editing&&<button onClick={()=>{setEditing(null);setForm({name:'',email:'',role:'editor'});setErrs({});}} style={{flex:1,padding:'9px',borderRadius:8,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>}
                <button onClick={save} style={{flex:2,padding:'9px',borderRadius:8,background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  {editing?'Salvar alterações':'Criar usuário'}
                </button>
              </div>
            </div>
          </div>

          {/* User list */}
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--txt1)',marginBottom:14}}>Usuários cadastrados</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {users.map(u=>{
                const role=ROLES[u.role]||ROLES.viewer;
                return(
                  <div key={u.id} style={{background:u.active!==false?'var(--bg)':'rgba(0,0,0,.03)',border:'1px solid var(--border)',borderRadius:9,padding:'11px 13px',opacity:u.active===false?.6:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:34,height:34,borderRadius:9,background:role.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:role.color,flexShrink:0}}>
                        {u.name.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--txt1)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.name}</div>
                        <div style={{fontSize:11,color:'var(--txt3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.email}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:99,background:role.bg,color:role.color,flexShrink:0}}>{role.label}</span>
                    </div>
                    {confirmDel===u.id
                      ?<div style={{display:'flex',alignItems:'center',gap:7,marginTop:9,padding:'7px 10px',background:'rgba(220,38,38,.06)',borderRadius:7}}>
                         <span style={{fontSize:11,color:'#DC2626',flex:1}}>Confirmar exclusão?</span>
                         <button onClick={()=>deleteUser(u.id)} style={{padding:'3px 10px',borderRadius:5,background:'#DC2626',border:'none',color:'#fff',fontSize:11,cursor:'pointer'}}>Excluir</button>
                         <button onClick={()=>setConfirmDel(null)} style={{padding:'3px 10px',borderRadius:5,background:'transparent',border:'1px solid var(--border)',color:'var(--txt2)',fontSize:11,cursor:'pointer'}}>Cancelar</button>
                       </div>
                      :<div style={{display:'flex',gap:6,marginTop:9}}>
                         <button onClick={()=>startEdit(u)} style={{flex:1,padding:'4px 0',borderRadius:6,background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.2)',color:'#B45309',fontSize:11,cursor:'pointer'}}>Editar</button>
                         <button onClick={()=>toggleActive(u)} style={{flex:1,padding:'4px 0',borderRadius:6,background:u.active!==false?'rgba(107,114,128,.07)':'rgba(5,150,105,.07)',border:'1px solid '+(u.active!==false?'rgba(107,114,128,.2)':'rgba(5,150,105,.2)'),color:u.active!==false?'#6B7280':'#059669',fontSize:11,cursor:'pointer'}}>
                           {u.active!==false?'Desativar':'Ativar'}
                         </button>
                         {currentUser&&u.id!==currentUser.id&&<button onClick={()=>setConfirmDel(u.id)} style={{flex:1,padding:'4px 0',borderRadius:6,background:'rgba(220,38,38,.07)',border:'1px solid rgba(220,38,38,.2)',color:'#DC2626',fontSize:11,cursor:'pointer'}}>Excluir</button>}
                       </div>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

