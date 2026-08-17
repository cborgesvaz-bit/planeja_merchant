import React from 'react';
import { Timeline } from '../components/Timeline';
import { PH } from './constants';

export function parseDate(s){if(!s||!s.includes('/'))return null;const[d,m]=s.split('/').map(Number);if(!d||!m)return null;return new Date(2026,m-1,d);}
export function weekStart(d){const x=new Date(d);const day=x.getDay();x.setDate(x.getDate()-day+(day===0?-6:1));x.setHours(0,0,0,0);return x;}
export function fmtDate(d){return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
export function detectPhase(text){const t=text.toLowerCase();if(/\[.+\]/.test(text))return'CUSTOM';if(t.includes('prd'))return'PRD';if(t.includes('q.a'))return'QA';if(t.includes('stg'))return'STG';if(t.includes('liberado mr')||t.includes('mr validado'))return'MR';if(t.includes('bloqueado'))return'BLOCKED';return'DEV';}
export function extractCustomLabel(text){const m=text.match(/\[([^\]]+)\]/);return m?m[1]:null;}
export function getTaskDayMap(task){
  const map={};
  // Read acompanhamento (Board) — read-only in timeline
  if(task.a){task.a.split('\n').forEach(line=>{const m=line.match(/^(\d{1,2}\/\d{1,2})/);if(!m)return;const date=parseDate(m[1]);if(!date)return;const dk=date.toISOString().slice(0,10);const ph=detectPhase(line);const cl=ph==='CUSTOM'?extractCustomLabel(line):null;const ex=map[dk];if(!ex||PH[ph].pr>PH[ex.ph].pr){map[dk]={ph,cl,lines:[line],src:'board'};}else if(ex.ph===ph){ex.lines.push(line);}});}
  // Read plan (Timeline-only) — overrides board for same day
  if(task.plan){task.plan.split('\n').forEach(line=>{const m=line.match(/^(\d{1,2}\/\d{1,2})/);if(!m)return;const date=parseDate(m[1]);if(!date)return;const dk=date.toISOString().slice(0,10);const ph=detectPhase(line);const cl=ph==='CUSTOM'?extractCustomLabel(line):null;map[dk]={ph,cl,lines:[line],src:'plan'};});}
  return map;
}
export function sortLog(lines){return[...lines].sort((a,b)=>{const p=s=>{const m=s.match(/^(\d{1,2})\/(\d{1,2})/);return m?(+m[2])*100+(+m[1]):0;};return p(b)-p(a);});}

