import { supabase } from './supabase';
import { IS_CFG_BASE, setISCfg } from './constants';

/* ── Mapeamento app ↔ colunas reais do banco ───────────── */
export const taskToRow = t => ({
  id: t.id,
  Iniciativa: t.g || '',
  Card: t.c || '',
  Tarefa: t.t || '',
  Status: t.s || 'Nao Iniciado',
  Responsavel: t.r || '',
  Versao: t.v || '',
  Acompanhamento: t.a || '',
  'Link MR': t.mr || '',
  plan_data: t.plan || '',
});

export const rowToTask = r => ({
  id: r.id,
  g: r.Iniciativa || '',
  c: r.Card || '',
  t: r.Tarefa || '',
  s: r.Status || 'Nao Iniciado',
  r: r.Responsavel || '',
  v: r.Versao || r.versao || '',
  a: r.Acompanhamento || r.acompanhamento || '',
  mr: r['Link MR'] || r.mr_links || '',
  plan: r.plan_data || '',
});

/* Erros de RLS/sessão não podem morrer em silêncio: sem isso o app
   mostra "sem dados" quando na verdade o acesso foi negado. */
function check(label, error) {
  if (!error) return;
  if (error.code === 'PGRST301' || error.status === 401) {
    throw new Error('Sessão expirada ou sem permissão. Faça login novamente.');
  }
  console.error(label, error);
  throw new Error(`${label}: ${error.message}`);
}

export async function loadTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id', { ascending: true });
  check('loadTasks', error);
  return data?.length ? data.map(rowToTask) : null;
}

export async function saveTasks(tasks) {
  const rows = tasks.map(taskToRow);
  const { error: upErr } = await supabase
    .from('tasks')
    .upsert(rows, { onConflict: 'id' });
  check('saveTasks', upErr);

  const { data: all, error: selErr } = await supabase.from('tasks').select('id');
  check('saveTasks/select', selErr);

  const current = new Set(tasks.map(t => t.id));
  const toDelete = (all || []).filter(r => !current.has(r.id)).map(r => r.id);
  if (toDelete.length) {
    const { error } = await supabase.from('tasks').delete().in('id', toDelete);
    check('saveTasks/delete', error);
  }
}

export async function loadStatusProduto() {
  for (const tbl of ['status produto', 'status_produto']) {
    const { data, error } = await supabase
      .from(tbl)
      .select('id,nome')
      .order('id', { ascending: true });
    if (error || !data?.length) continue;

    const merged = {};
    data.forEach(r => {
      merged[r.nome] =
        IS_CFG_BASE[r.nome] || { c: '#6B7280', bg: 'rgba(107,114,128,.1)', dot: '#6B7280' };
    });
    setISCfg(merged); // antes isso ia para window._iscfg e nunca era aplicado
    return data.map(r => r.nome);
  }
  setISCfg({ ...IS_CFG_BASE });
  return Object.keys(IS_CFG_BASE);
}

export async function loadResps() {
  const { data, error } = await supabase
    .from('responsavel')
    .select('id,nome')
    .order('nome', { ascending: true });
  check('loadResps', error);
  return data?.length ? data.map(r => r.nome) : null;
}

export async function saveResp(nome) {
  const { error } = await supabase
    .from('responsavel')
    .upsert({ nome }, { onConflict: 'nome' });
  check('saveResp', error);
}

export async function deleteResp(nome) {
  const { error } = await supabase.from('responsavel').delete().eq('nome', nome);
  check('deleteResp', error);
}

export async function updateResp(oldNome, newNome) {
  const { error } = await supabase
    .from('responsavel')
    .update({ nome: newNome })
    .eq('nome', oldNome);
  check('updateResp', error);
}

export async function dbGet(key) {
  const { data, error } = await supabase
    .from('pm_data')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  check('dbGet:' + key, error);
  return data ? data.value : null;
}

export async function dbSet(key, value) {
  const { error } = await supabase
    .from('pm_data')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  check('dbSet:' + key, error);
}
