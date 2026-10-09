import * as XLSX from 'xlsx';
import { PH, tn } from './constants';
import { detectPhase, getTaskDayMap } from './utils';

export function exportXLSX(tasks){
  
  const wb=XLSX.utils.book_new();

  // ── Aba 1: Todas as Tarefas (unica aba) ──────────────────
  const taskRows=tasks
    .sort((a,b)=>{
      const ga=[...new Set(tasks.map(t=>t.g))].indexOf(a.g);
      const gb=[...new Set(tasks.map(t=>t.g))].indexOf(b.g);
      return ga!==gb?ga-gb:tn(a.t)-tn(b.t);
    })
    .map(t=>({
      'Iniciativa':t.g,
      'Card':t.c,
      'Tarefa':t.t,
      'Status':t.s,
      'Responsavel':t.r,
      'Versao':t.v,
      'Acompanhamento':t.a,
      'Link MR':t.mr,
    }));
  const wsTasks=XLSX.utils.json_to_sheet(taskRows);
  wsTasks['!cols']=[{wch:30},{wch:12},{wch:60},{wch:20},{wch:14},{wch:12},{wch:60},{wch:50}];
  XLSX.utils.book_append_sheet(wb,wsTasks,'Tarefas');

  // ── Aba 2: Linha do Tempo ─────────────────────────────────
  // Gera todas as datas encontradas no acompanhamento e monta uma linha por tarefa x data
  const timeRows=[];
  tasks.forEach(t=>{
    if(!t.a)return;
    t.a.split('\n').filter(Boolean).forEach(line=>{
      const m=line.match(/^(\d{1,2}\/\d{1,2})/);
      if(!m)return;
      const dateStr=m[1];
      const desc=line.slice(dateStr.length).replace(/^\s*[-\u2014]\s*/,'');
      const ph=detectPhase(line);
      const phLabels={DEV:'Desenvolvimento',MR:'Merge Request',STG:'STG / Homologacao',QA:'Q.A',PRD:'Deploy PRD',BLOCKED:'Bloqueado'};
      timeRows.push({
        'Data':dateStr,
        'Iniciativa':t.g,
        'Card':t.c,
        'Tarefa':t.t,
        'Fase':phLabels[ph]||ph,
        'Responsavel':t.r,
        'Status Atual':t.s,
        'Descricao':desc,
      });
    });
  });
  // Ordena por data (MM*100+DD) depois por iniciativa
  timeRows.sort((a,b)=>{
    const toN=s=>{const p=s.match(/^(\d{1,2})\/(\d{1,2})/);return p?(+p[2])*100+(+p[1]):0;};
    return toN(a.Data)-toN(b.Data)||a.Iniciativa.localeCompare(b.Iniciativa,'pt-BR');
  });
  const wsTime=XLSX.utils.json_to_sheet(timeRows);
  wsTime['!cols']=[{wch:8},{wch:28},{wch:12},{wch:55},{wch:20},{wch:14},{wch:20},{wch:55}];
  XLSX.utils.book_append_sheet(wb,wsTime,'Linha do Tempo');

  XLSX.writeFile(wb,'planeja-merchant.xlsx');
}


// Exporta a Linha do Tempo (Board + planejamento) como exibida na tela
export function exportTimelineXLSX(grouped,iStatus={}){
  const phName=(act,task)=>act.ph==='CUSTOM'&&act.cl?act.cl:act.ph==='DEV'?('Desenvolvimento'+(task.r?' ('+task.r+')':'')):(PH[act.ph]?.lb||act.ph);
  const fmt=dk=>dk.split('-').reverse().join('/');
  const wb=XLSX.utils.book_new();

  // ── Aba 1: Atividades (uma linha por tarefa x dia) ──
  const rows=[];const allDays=new Set();
  Object.entries(grouped).forEach(([g,gtasks])=>gtasks.forEach(task=>{
    const dmap=getTaskDayMap(task);
    Object.keys(dmap).sort().forEach(dk=>{
      const act=dmap[dk];allDays.add(dk);
      rows.push({
        'Data':fmt(dk),'Iniciativa':g,'Status Iniciativa':iStatus[g]||'','Card':task.c||'','Tarefa':task.t,
        'Fase':phName(act,task),'Origem':act.src==='plan'?'Planejamento':'Board','Responsavel':task.r||'',
        'Status Tarefa':task.s||'','Descricao':act.lines.map(l=>l.replace(/^\d{1,2}\/\d{1,2}\s*[-\u2014]?\s*/,'')).join(' | '),
        _k:dk,
      });
    });
  }));
  rows.sort((a,b)=>a._k.localeCompare(b._k)||a.Iniciativa.localeCompare(b.Iniciativa,'pt-BR'));
  const ws1=XLSX.utils.json_to_sheet(rows.map(({_k,...r})=>r));
  ws1['!cols']=[{wch:11},{wch:28},{wch:18},{wch:12},{wch:55},{wch:22},{wch:13},{wch:16},{wch:18},{wch:60}];
  XLSX.utils.book_append_sheet(wb,ws1,'Atividades');

  // ── Aba 2: Grade (tarefas x dias, estilo Gantt) ──
  const days=[...allDays].sort();
  if(days.length){
    const grid=[['Iniciativa','Card','Tarefa',...days.map(fmt)]];
    Object.entries(grouped).forEach(([g,gtasks])=>gtasks.forEach(task=>{
      const dmap=getTaskDayMap(task);
      grid.push([g,task.c||'',task.t,...days.map(dk=>dmap[dk]?phName(dmap[dk],task):'')]);
    }));
    const ws2=XLSX.utils.aoa_to_sheet(grid);
    ws2['!cols']=[{wch:28},{wch:12},{wch:50},...days.map(()=>({wch:12}))];
    XLSX.utils.book_append_sheet(wb,ws2,'Grade');
  }

  XLSX.writeFile(wb,'linha-do-tempo-'+new Date().toISOString().slice(0,10)+'.xlsx');
}
