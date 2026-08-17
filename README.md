# Planeja Merchant

Migração do `index.html` monolítico (2.246 linhas, Babel standalone via CDN) para um projeto Vite + React modular com autenticação real.

## Setup

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a chave publishable NOVAS
npm run dev
```

`.env.local` está no `.gitignore`. Nada sensível entra aqui — a anon key é pública por design; a proteção vem do RLS.

## Estrutura

```
index.html                 shell mínimo, sem chaves, sem CDN de runtime
src/main.jsx               entrypoint
src/App.jsx                AuthProvider → AuthGate → AppMain
src/index.css              CSS extraído do <style> original
src/lib/
  supabase.js              cliente SDK (persistSession + autoRefreshToken)
  api.js                   camada de dados; erros de RLS/401 agora propagam
  auth.jsx                 AuthProvider, AuthGate, LoginScreen (Google OAuth), ROLES
  constants.js             SC, PH, IS_CFG, TIPO_CFG, RISK_*, DEP_TIPO…
  utils.js                 parseDate, weekStart, detectPhase, getTaskDayMap…
  export.js                exportXLSX (agora importa `xlsx`, não window.XLSX)
  seed.js                  T0 (dados de restauração)
src/components/            15 componentes, um por arquivo
```

## O que mudou de segurança

| Antes | Depois |
|---|---|
| Chave hardcoded no HTML | `import.meta.env`, com validação de presença |
| `Authorization: Bearer <anon key>` | Bearer com o **access token do usuário**, gerenciado pelo SDK |
| Login em `localStorage` com **senhas em texto puro** (`pm_users`) | Google OAuth via Supabase Auth |
| Admin com senha fixa no código-fonte | Removido |
| Papel vindo do `localStorage` (editável pelo usuário no DevTools) | `app_metadata.role` do JWT, gravável só pelo `service_role` |
| Babel standalone compilando em runtime | Build Vite, sem `eval` em produção |
| Erros de banco engolidos em `catch` → tela "sem dados" | Erros propagam com mensagem de sessão expirada |

## Passo obrigatório antes de subir

1. **Rotacione as chaves.** A chave anterior está no histórico do Git.
2. Rode o SQL de RLS (ver seção anterior desta thread ou `sql/rls.sql`).
3. Supabase → Authentication → Providers → habilite Google, desabilite signup por e-mail.
4. Authentication → URL Configuration → restrinja os redirect URLs à origem real.
5. Atribua papéis via `service_role` (nunca pelo front):

```sql
-- rodar no SQL Editor, que já usa service_role
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'seu.email@magazineluiza.com.br';
```

Sem esse passo todo mundo entra como `viewer`.

## Pendências conhecidas

- **UserManager** virou um registro informativo (nome/e-mail/papel, sem senha). Ele **não concede permissão** — a autorização real é o `app_metadata.role` + as policies. Para unificar, o próximo passo é uma tabela `profiles` com trigger em `auth.users` e uma policy que leia o papel de lá.
- `canEdit` / `isAdmin` continuam sendo checagens de UI. São conveniência, não segurança: quem quiser burlar usa o DevTools. A regra que vale é a policy no Postgres — se um papel não pode escrever, isso precisa estar no `with check` da policy.
- `saveTasks` faz upsert de **todas** as tarefas a cada alteração e deleta o que sobrou. Funciona no volume atual (162 linhas), mas é uma condição de corrida com dois usuários simultâneos. Vale migrar para gravação por diff.
- Bundle de 786 kB (`xlsx` é a maior fatia). `import()` dinâmico no `exportXLSX` resolve.
- Corrigido no caminho: `IS_CFG` era escrito em `window._iscfg` e nunca aplicado — as cores de status vindas do banco eram ignoradas. Agora usa `setISCfg()`.
- Corrigido: atributo `style` duplicado no botão "Excluir selecionadas" (`BoardView`), que o Babel standalone aceitava em silêncio e descartava o primeiro.
