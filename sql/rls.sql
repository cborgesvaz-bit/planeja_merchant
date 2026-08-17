-- =====================================================================
-- Planeja Merchant — RLS (versão sem trava de domínio)
-- Acesso liberado a QUALQUER usuário autenticado, de qualquer domínio.
-- O controle de quem entra passa a ser feito no Supabase Auth, não aqui.
-- Idempotente: pode rodar de novo por cima da versão anterior.
-- =====================================================================

-- 1. Habilitar RLS
alter table public."tasks"          enable row level security;
alter table public."Iniciativas"    enable row level security;
alter table public."status"         enable row level security;
alter table public."status produto" enable row level security;
alter table public."responsavel"    enable row level security;
alter table public."pm_data"        enable row level security;

-- 2. Remover a policy antiga (presa ao domínio) e criar a nova
do $$
declare t text;
begin
  foreach t in array array[
    'tasks','Iniciativas','status','status produto','responsavel','pm_data'
  ] loop
    execute format('drop policy if exists "magalu_only" on public.%I', t);
    execute format('drop policy if exists "auth_all"    on public.%I', t);
    execute format(
      'create policy "auth_all" on public.%I
         for all to authenticated
         using (true) with check (true)', t);
  end loop;
end $$;

-- 3. Revogar privilégios residuais do role anônimo
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- 4. Verificação — deve listar "auth_all" para as 6 tabelas
select tablename, policyname, roles, cmd
from pg_policies where schemaname='public' order by tablename;
