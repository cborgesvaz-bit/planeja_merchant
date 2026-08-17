import * as XLSX from 'xlsx';
import { tn } from './constants';
import { detectPhase } from './utils';

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

