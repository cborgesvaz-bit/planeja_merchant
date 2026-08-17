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
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const loginGoogle = async () => {
    setLoading(true); setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: DOMINIO ? { hd: DOMINIO } : undefined,
      },
    });
    if (error) { setErr(error.message); setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#EEF2FF 0%,#F0F9FF 50%,#F0FDF4 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'min(420px,100%)',background:'#fff',borderRadius:16,boxShadow:'0 8px 48px rgba(0,0,0,.12)',overflow:'hidden'}}>
        <div style={{padding:'32px 36px 24px',background:'linear-gradient(135deg,var(--accent),var(--cyan))',textAlign:'center'}}>
          <div style={{width:56,height:56,borderRadius:14,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:26}}>🧭</div>
          <div style={{fontSize:22,fontWeight:800,color:'#fff',letterSpacing:-.5}}>Planeja Merchant</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.75)',marginTop:4}}>Acesso restrito ao time</div>
        </div>
        <div style={{padding:'28px 36px 32px'}}>
          {err && <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.2)',borderRadius:8,padding:'9px 13px',color:'#DC2626',fontSize:12,marginBottom:16}}>⚠ {err}</div>}
          <button onClick={loginGoogle} disabled={loading} style={{width:'100%',padding:'12px',background:'#fff',border:'1px solid #D1D5DB',borderRadius:9,color:'#111827',fontSize:14,fontWeight:600,cursor:loading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <span style={{fontWeight:800,color:'#4285F4'}}>G</span>
            {loading ? 'Redirecionando...' : 'Entrar com Google'}
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
