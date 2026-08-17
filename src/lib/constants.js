export const SC={"Em andamento":{c:"#0891B2",bg:"rgba(8,145,178,.1)",d:"#0891B2",p:true},"Bloqueado":{c:"#DC2626",bg:"rgba(220,38,38,.1)",d:"#DC2626",p:false},"Nao Iniciado":{c:"#6B7280",bg:"rgba(107,114,128,.1)",d:"#6B7280",p:false},"Aguard. Deploy PRD":{c:"#B45309",bg:"rgba(180,83,9,.1)",d:"#B45309",p:false},"Paralisado":{c:"#EA580C",bg:"rgba(234,88,12,.1)",d:"#EA580C",p:false},"Finalizado":{c:"#059669",bg:"rgba(5,150,105,.1)",d:"#059669",p:false},"Entregue":{c:"#047857",bg:"rgba(4,120,87,.1)",d:"#047857",p:false},"Pendente":{c:"#7C3AED",bg:"rgba(124,58,237,.1)",d:"#7C3AED",p:false},"Deploy PRD":{c:"#0369A1",bg:"rgba(3,105,161,.12)",d:"#0369A1",p:false}};
export const PH={PRD:{lb:"PRD",col:"#047857",sl:"rgba(4,120,87,.75)",pr:6},QA:{lb:"Q.A",col:"#2563EB",sl:"rgba(37,99,235,.75)",pr:5},STG:{lb:"STG",col:"#B45309",sl:"rgba(180,83,9,.75)",pr:4},MR:{lb:"MR",col:"#7C3AED",sl:"rgba(124,58,237,.75)",pr:3},DEV:{lb:"Dev",col:"#0891B2",sl:"rgba(8,145,178,.75)",pr:2},BLOCKED:{lb:"Bloq.",col:"#DC2626",sl:"rgba(220,38,38,.75)",pr:1},CUSTOM:{lb:"?",col:"#6366F1",sl:"rgba(99,102,241,.75)",pr:0}};
export const DONE=["Finalizado","Entregue"];

// Initiative status color config — names must match status_produto table exactly
export const IS_CFG_BASE={
  "Discovery Produto":{c:"#9333EA",bg:"rgba(147,51,234,.12)",dot:"#9333EA"},
  "Discovery Tecnico":{c:"#DB2777",bg:"rgba(219,39,119,.12)",dot:"#DB2777"},
  "Desenvolvimento":  {c:"#2563EB",bg:"rgba(37,99,235,.12)", dot:"#2563EB"},
  "Homologacao":      {c:"#D97706",bg:"rgba(217,119,6,.12)",  dot:"#D97706"},
  "Concluido":        {c:"#059669",bg:"rgba(5,150,105,.12)",  dot:"#059669"},
  "Pausado":          {c:"#EA580C",bg:"rgba(234,88,12,.12)",  dot:"#EA580C"},
  "Backlog":          {c:"#6B7280",bg:"rgba(107,114,128,.1)", dot:"#6B7280"},
};
// Routing rules — which tab shows which initiative statuses
export const INIT_BACKLOG_S=["Backlog","Discovery Produto","Discovery Tecnico"];
export const INIT_BOARD_S=["Desenvolvimento","Homologacao","Pausado"];
export const INIT_DONE_S=["Concluido"];
export function initView(status){
  if(!status||(!INIT_BACKLOG_S.includes(status)&&!INIT_BOARD_S.includes(status)&&!INIT_DONE_S.includes(status)))return'board';
  if(INIT_DONE_S.includes(status))return'historico';
  if(INIT_BACKLOG_S.includes(status))return'backlog';
  return'board';
}
// Dynamic IS_CFG that merges DB statuses with base colors
// Will be updated with DB data at runtime
export let IS_CFG={...IS_CFG_BASE};
export function getISCfg(name){
  return IS_CFG[name]||{c:"#6B7280",bg:"rgba(107,114,128,.1)",dot:"#6B7280"};
}
export const PD={DEV:"Seguindo com o desenvolvimento",MR:"Liberado MR para validacao",STG:"Deploy em STG",QA:"Q.A em andamento",PRD:"Deploy em PRD",BLOCKED:"Bloqueado"};
// Tipo do item de trabalho (Epico / Historia / Tarefa)
export const TIPO_CFG={
  "Epico":{c:"#7C3AED",bg:"rgba(124,58,237,.12)",lb:"Épico"},
  "Historia":{c:"#2563EB",bg:"rgba(37,99,235,.12)",lb:"História"},
  "Tarefa":{c:"#6B7280",bg:"rgba(107,114,128,.1)",lb:"Tarefa"},
};

export const RISK_SEV={"Baixa":{c:"#059669",bg:"rgba(5,150,105,.1)"},"Media":{c:"#B45309",bg:"rgba(180,83,9,.1)"},"Alta":{c:"#DC2626",bg:"rgba(220,38,38,.1)"}};
export const RISK_STATUS={"Ativo":{c:"#DC2626",bg:"rgba(220,38,38,.1)"},"Mitigado":{c:"#0891B2",bg:"rgba(8,145,178,.1)"},"Resolvido":{c:"#059669",bg:"rgba(5,150,105,.1)"}};
export const DEP_TIPO={"Bloqueia":{c:"#DC2626",bg:"rgba(220,38,38,.1)"},"Aguarda":{c:"#B45309",bg:"rgba(180,83,9,.1)"},"Relacionada":{c:"#6B7280",bg:"rgba(107,114,128,.1)"}};
export const SCY={asc:"desc",desc:null,null:"asc"};
export const avColor=n=>`hsl(${n.charCodeAt(0)*15%360},45%,32%)`;
export const tn=t=>{const m=t.match(/^(\d+)\.(\d+)/);return m?+m[1]*10000+ +m[2]:999999;};


export function setISCfg(cfg){ IS_CFG = cfg; }
