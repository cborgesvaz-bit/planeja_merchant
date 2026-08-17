import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from './supabase';
import { LoadingScreen } from '../components/ui';

export const ROLES = {
  admin:  { label: 'Administrador', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
  editor: { label: 'Editor',        color: '#0891B2', bg: 'rgba(8,145,178,.1)' },
  viewer: { label: 'Visualizador',  color: '#059669', bg: 'rgba(5,150,105,.1)' },
};

const DOMINIO = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '';
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/* O papel vem do app_metadata do JWT — só editável pelo service_role no
   servidor. Nunca de user_metadata, que o próprio usuário consegue alterar. */
function toUser(session) {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
    role: u.app_metadata?.role || 'viewer',
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    user: toUser(session),
    loading,
    logout: () => supabase.auth.signOut(),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const loginEmail = async () => {
    if (!email.trim() || !pass) { setErr('Preencha e-mail e senha'); return; }
    setLoading(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(), password: pass,
    });
    if (error) {
      setErr(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : error.message);
      setLoading(false);
    }
    // sucesso: onAuthStateChange no AuthProvider troca a tela
  };

  const loginGoogle = async () => {
    setLoading(true); setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: DOMINIO ? { hd: DOMINIO } : undefined,
      },
    });
    if (error) {
      setErr(error.message.includes('not enabled')
        ? 'Login com Google ainda não habilitado no Supabase'
        : error.message);
      setLoading(false);
    }
  };

  const ist = {width:'100%',background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:9,color:'#111827',fontSize:14,padding:'11px 14px',outline:'none',transition:'border-color .15s'};
  const lbl = {fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:.7,display:'block',marginBottom:6};

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#EEF2FF 0%,#F0F9FF 50%,#F0FDF4 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'min(420px,100%)',background:'#fff',borderRadius:16,boxShadow:'0 8px 48px rgba(0,0,0,.12)',overflow:'hidden'}}>
        <div style={{padding:'32px 36px 24px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',textAlign:'center'}}>
          <div style={{width:56,height:56,borderRadius:14,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:26}}>🧭</div>
          <div style={{fontSize:22,fontWeight:800,color:'#fff',letterSpacing:-.5}}>Planeja Merchant</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.75)',marginTop:4}}>Faça login para continuar</div>
        </div>
        <div style={{padding:'28px 36px 32px'}}>
          <div style={{marginBottom:16}}>
            <label style={lbl}>E-mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="seu@email.com" style={ist} autoComplete="username"
              onKeyDown={e=>{if(e.key==='Enter')loginEmail();}}
              onFocus={e=>e.target.style.borderColor='var(--accent)'}
              onBlur={e=>e.target.style.borderColor='#E5E7EB'}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={lbl}>Senha</label>
            <div style={{position:'relative'}}>
              <input type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••" style={{...ist,paddingRight:40}} autoComplete="current-password"
                onKeyDown={e=>{if(e.key==='Enter')loginEmail();}}
                onFocus={e=>e.target.style.borderColor='var(--accent)'}
                onBlur={e=>e.target.style.borderColor='#E5E7EB'}/>
              <button type="button" onClick={()=>setShowPass(v=>!v)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:16,lineHeight:1,padding:0}}>
                {showPass?'🙈':'👁'}
              </button>
            </div>
          </div>
          {err && <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.2)',borderRadius:8,padding:'9px 13px',color:'#DC2626',fontSize:12,marginBottom:16,display:'flex',alignItems:'center',gap:7}}>
            <span>⚠</span>{err}
          </div>}
          <button onClick={loginEmail} disabled={loading}
            style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',border:'none',borderRadius:9,color:'#fff',fontSize:14,fontWeight:700,cursor:loading?'default':'pointer',opacity:loading?.7:1}}>
            {loading?'Entrando...':'Entrar'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:10,margin:'18px 0 14px'}}>
            <div style={{flex:1,height:1,background:'#E5E7EB'}}/>
            <span style={{fontSize:10,color:'#9CA3AF',fontWeight:600,letterSpacing:.5}}>OU</span>
            <div style={{flex:1,height:1,background:'#E5E7EB'}}/>
          </div>

          <button onClick={loginGoogle} disabled={loading}
            style={{width:'100%',padding:'11px',background:'#fff',border:'1px solid #D1D5DB',borderRadius:9,color:'#111827',fontSize:13,fontWeight:600,cursor:loading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <span style={{fontWeight:800,color:'#4285F4'}}>G</span> Entrar com Google
          </button>
          {DOMINIO && <div style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:14}}>Somente contas @{DOMINIO}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthGate({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
  if (DOMINIO && !user.email.endsWith('@' + DOMINIO)) {
    return (
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',gap:12,alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <div style={{fontSize:15,fontWeight:600,color:'#DC2626'}}>Conta fora do domínio autorizado</div>
        <button onClick={() => supabase.auth.signOut()} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border2)',background:'var(--bg1)',cursor:'pointer',fontSize:12}}>Sair</button>
      </div>
    );
  }
  return children;
}

/* Registro de papéis exibido no UserManager. A lista é apenas informativa:
   a autorização real vem do app_metadata.role do JWT + das policies de RLS.
   Alterar alguém aqui NÃO concede permissão no banco. */
export const DEFAULT_USERS = [];
