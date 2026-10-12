// Ported verbatim from the reference deck's workbench script (deck-only code removed).

(function(){
'use strict';
const C=window.__core,{store,W,ships,declarations,companies,trucks,shipById,yardById,berthById,feed,fmtClock,cssVar,clamp,lerp,REDUCED,isMobile,ENT,ST}=C;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const panels={graph:'graphPanel',hours:'hoursPanel',agent:'agentPanel',record:'recordPanel'};
function closeAll(except){Object.values(panels).forEach(id=>{if(id!==except)document.getElementById(id).classList.remove('on');});}
function openLens(l){const s=store.state;if(l==='map'){closeAll();store.set({lens:'map'});}
  else{const id=panels[l];closeAll(id);document.getElementById(id).classList.add('on');store.set({lens:l});if(l==='graph')startGraph();if(l==='agent')ensureAgent();}
  $$('#lensSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lens===l?'true':'false'));
  if(s.guided==='walking'&&l!=='agent'){document.getElementById('resumeBtn').classList.add('on');}
}
window.__openLens=openLens;
$$('#lensSeg button').forEach(b=>b.addEventListener('click',()=>openLens(b.dataset.lens)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{document.getElementById(b.dataset.close).classList.remove('on');if(b.dataset.close==='agentPanel'&&store.state.guided==='walking')document.getElementById('resumeBtn').classList.add('on');$$('#lensSeg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.lens==='map'?'true':'false'));store.set({lens:'map'});}));

/* ============ record pane ============ */
const ent=k=>`<i style="background:var(--ent-${k})"></i>`;
function row(k,v,src){return `<tr><td>${k}</td><td>${v}${src?`<small>Source: ${src}</small>`:''}</td></tr>`;}
function recordHTML(ref){const s=store.state;
  if(ref.type==='ship'){const sh=shipById(ref.id);const st={berthed:'Alongside '+(sh.berth?berthById(sh.berth).name:''),waiting:'Holding in the waiting area',inbound:'Inbound, arriving '+fmtClock(sh.eta),outbound:'Departing',departed:'Departed'}[sh.status];
    return `<div class="record"><div class="rn">${ent('ship')}${sh.name}</div><table>${row('Status',st,'Ship position feed')}${row('Shipping line',sh.line,'Booking records')}${row('Capacity',sh.teu.toLocaleString()+' standard container units','Vessel register')}${row('Berth window',sh.berth?berthById(sh.berth).name+', '+fmtClock(sh.eta)+' to '+fmtClock(sh.etd)+(sh.slipped?(s.appliedPlan?' (moved to Berth 1, signed)':' (slipped three hours)'):''):'Not yet assigned','Terminal operating system')}${row('Containers to work',Math.round(sh.containersLeft),'Terminal operating system')}${sh.plannedYard?row('Planned yard block',sh.plannedYard+(s.holds[sh.plannedYard]&&!s.holdEscalated?', under customs hold':''),'Terminal operating system yard module'):''}</table></div>`;}
  if(ref.type==='berth'){const b=berthById(ref.id);const occ=ships.find(x=>x.status==='berthed'&&x.berth===b.id);const next=ships.filter(x=>x.berth===b.id&&x.status==='inbound').sort((a,c)=>a.eta-c.eta)[0];
    return `<div class="record"><div class="rn">${ent('berth')}${b.name}</div><table>${row('Now',occ?occ.name+', '+Math.round(occ.containersLeft)+' containers to work':'Free','Terminal operating system')}${row('Next planned',next?next.name+' at '+fmtClock(next.eta):'None in the next 24 hours','Berth plan')}${row('Cranes',W.cranes.filter(c=>c.berth===b.id).map(c=>c.id).join(', '),'Crane telemetry')}${b.id==='B2'&&s.conflict&&!s.appliedPlan?row('Conflict','Cedar Horizon (18:05 to 20:40) overlaps Dune Voyager (17:40 to 20:15)','Berth plan against revised arrival estimate'):''}</table></div>`;}
  if(ref.type==='crane'){const c=W.cranes.find(x=>x.id===ref.id);return `<div class="record"><div class="rn">${ent('crane')}Crane ${c.id.slice(1)}</div><table>${row('Berth',berthById(c.berth).name)}${row('Pace',Math.round(s.craneRate)+' moves an hour','Crane telemetry')}${row('State',ships.some(x=>x.status==='berthed'&&x.berth===c.berth&&x.containersLeft>0)?'Working':'Idle','Terminal operating system')}</table></div>`;}
  if(ref.type==='yard'){const y=yardById(ref.id);const decs=declarations.filter(d=>d.yard===y.id);return `<div class="record"><div class="rn">${ent('container')}Yard block ${y.id}</div><table>${row('Occupancy',(60+((y.row*7+y.col*13)%35))+' percent','Yard module')}${decs.length?row('Declarations',decs.map(d=>d.id+' ('+d.status+(d.id==='D-4471'&&s.holdEscalated?', escalated':'')+')').join('; '),'Customs platform'):row('Declarations','None open')}${y.id==='Y14'?row('Planned for','Cedar Horizon discharge','Terminal operating system'):''}</table></div>`;}
  if(ref.type==='truck'){const tr=trucks.find(x=>x.id===ref.id);const k=companies.find(c=>c.id===tr.company);return `<div class="record"><div class="rn">${ent('truck')}Truck ${tr.id.slice(1)}</div><table>${row('Company',k.name,k.source)}${row('Lane','Lane '+(tr.lane+1))}${row('Collecting from',tr.target+(tr.target==='Y14'&&s.holds.Y14&&!s.holdEscalated?' (held; the truck will be refused at the gate)':''),'Appointment system')}</table></div>`;}
  if(ref.type==='lane'){const i=+ref.id.slice(1)-1;return `<div class="record"><div class="rn">${ent('truck')}Gate lane ${i+1}</div><table>${row('Queued',Math.round(s.laneQueue[i])+' trucks','Gate system')}${i===2?row('Why','Appointments booked against containers in Y14, which is under customs hold. The appointment system does not see the hold.','Appointment system joined to customs platform'):''}</table></div>`;}
  if(ref.type==='gate')return `<div class="record"><div class="rn">${ent('terminal')}Gate complex</div><table>${row('Throughput',s.gatePerHour+' trucks an hour','Gate system')}${row('Lanes','Three in, two out')}${row('Average turn','Not published for this terminal; synthetic figure withheld')}</table></div>`;
  if(ref.type==='inspection')return `<div class="record"><div class="rn">${ent('customs')}Customs inspection area</div><table>${row('Booked','D-4485, physical inspection at 15:30','Customs platform')}${row('Holds in yard','D-4471 on Y14'+(s.holdEscalated?' (escalated)':''),'Customs platform')}</table></div>`;
  if(ref.type==='declaration'){const d=declarations.find(x=>x.id===ref.id);return `<div class="record"><div class="rn">${ent('customs')}Declaration ${d.id}</div><table>${row('Consignee (the party receiving the goods)',d.consignee,'Customs platform')}${row('Yard block',d.yard)}${row('Status',d.status+(d.id==='D-4471'&&s.holdEscalated?', escalated for review':''),'Customs platform')}${row('Containers',d.containers)}${row('Note',d.note)}</table></div>`;}
  if(ref.type==='company'){const k=companies.find(x=>x.id===ref.id);return `<div class="record"><div class="rn">${ent('truck')}${k.name}</div><table>${row('Trucks on site',k.trucks,k.source)}</table></div>`;}
  if(ref.type==='zone'){const m={anchorage:['Waiting area',ships.filter(x=>x.status==='waiting').map(x=>x.name).join(', ')||'Empty','Ships hold here until a berth, a pilot, and tugs are all free at once.'],quay:['Quay',ships.filter(x=>x.status==='berthed').length+' of 4 berths occupied','The berth plan was made against yesterday\'s arrival estimates.'],cranes:['Quay cranes',Math.round(s.craneRate)+' moves an hour across working cranes','Crane pace sets the pace of the whole stay.']}[ref.id];return `<div class="record"><div class="rn">${ent('terminal')}${m[0]}</div><table>${row('Now',m[1])}${row('Why it matters',m[2])}</table></div>`;}
  return '';}
window.__openRecord=ref=>{const html=recordHTML(ref);if(!html)return;
  if(store.state.lens==='graph'){$('#graphRecord').innerHTML=html;return;}
  $('#recordTitle').textContent='Record';$('#recordBody').innerHTML=html+'<p class="sub" style="margin-top:12px">Every fact above names its source. Select the same record in the graph and it lights here too.</p>';closeAll('recordPanel');$('#recordPanel').classList.add('on');};

/* ============ graph (force-directed) ============ */
const gc=$('#graphCanvas'),gx=gc.getContext('2d');let nodes=[],links=[],graphStarted=false,graphBirth=0,merged=false,gw=0,gh=0,gd=1;
const NODE_DEFS=[
  {id:'terminal:T',type:'terminal',label:'Bayan Terminal',src:'Terminal operating system'},
  ...W.berths.map(b=>({id:'berth:'+b.id,type:'berth',label:b.name,src:'Terminal operating system',to:['terminal:T']})),
  ...W.cranes.filter((c,i)=>i%2===0).map(c=>({id:'crane:'+c.id,type:'crane',label:'Crane '+c.id.slice(1),src:'Crane telemetry',to:['berth:'+c.berth]})),
  ...ships.filter(s=>['S1','S2','S3','S4','S5','S6','S8'].includes(s.id)).map(s=>({id:'ship:'+s.id,type:'ship',label:s.name,src:'Ship position feed',to:s.berth?['berth:'+s.berth]:['terminal:T']})),
  {id:'yard:Y14',type:'container',label:'Yard block Y14',src:'Yard module',to:['ship:S5','terminal:T']},
  {id:'yard:Y07',type:'container',label:'Yard block Y07',src:'Yard module',to:['terminal:T']},
  {id:'cont:1',type:'container',label:'Container MSKU 48',src:'Stowage file',to:['ship:S5','yard:Y14']},
  {id:'cont:2',type:'container',label:'Container TGHU 91',src:'Stowage file',to:['ship:S5','yard:Y14']},
  {id:'cont:3',type:'container',label:'Container CMAU 27',src:'Stowage file',to:['ship:S3','yard:Y07']},
  {id:'declaration:D-4471',type:'customs',label:'Declaration D-4471',src:'Customs platform',to:['yard:Y14']},
  {id:'declaration:D-4472',type:'customs',label:'Declaration D-4472',src:'Customs platform',to:['yard:Y14']},
  {id:'declaration:D-4480',type:'customs',label:'Declaration D-4480',src:'Customs platform',to:['yard:Y07']},
  {id:'party:P1',type:'customs',label:'Alnoor Trading Company',src:'Customs platform',to:['declaration:D-4471'],party:true},
  {id:'party:P2',type:'customs',label:'Al Noor Trading Co',src:'Booking records',to:['declaration:D-4472','ship:S5'],party:true},
  {id:'company:K1',type:'truck',label:'Red Sea Haulage',src:'Gate system',to:['terminal:T']},
  {id:'company:K2',type:'truck',label:'Red Sea Hauling',src:'Appointment system',to:['terminal:T']},
  {id:'company:K3',type:'truck',label:'Bayan Logistics',src:'Gate system',to:['terminal:T']},
  ...trucks.slice(0,4).map((t,i)=>({id:'truck:'+t.id,type:'truck',label:'Truck '+t.id.slice(1),src:'Gate system',to:['company:'+t.company,i%2?'yard:Y14':'yard:Y07']})),
  {id:'lane:L3',type:'truck',label:'Gate lane 3',src:'Gate system',to:['terminal:T','yard:Y14']}
];
function startGraph(){if(graphStarted)return;graphStarted=true;graphBirth=performance.now();
  nodes=NODE_DEFS.map((d,i)=>({...d,x:.5+Math.cos(i)*.2,y:.5+Math.sin(i*1.7)*.2,vx:0,vy:0,born:i*140}));
  const idx=Object.fromEntries(nodes.map((n,i)=>[n.id,i]));
  nodes.forEach((n,i)=>(n.to||[]).forEach(t=>{if(idx[t]!=null)links.push({a:i,b:idx[t]});}));
  const src=$('#sources');src.innerHTML='';const seen=new Set();nodes.forEach((n,i)=>setTimeout(()=>{if(seen.has(n.src))return;seen.add(n.src);const d=document.createElement('div');d.innerHTML=`<i style="background:var(--ent-${n.type})"></i><span>${n.src}</span><b>${/feed|telemetry|system|module/i.test(n.src)?'structured':'documents'}</b>`;src.prepend(d);},n.born));
  setTimeout(()=>{merged=true;const p1=nodes.find(n=>n.id==='party:P1'),p2=nodes.find(n=>n.id==='party:P2');p1.mergedInto=p2;p2.label='Al Noor Trading Co (resolved)';links.push({a:nodes.indexOf(p2),b:nodes.indexOf(nodes.find(n=>n.id==='declaration:D-4471'))});renderER();},nodes.length*140+900);
  gc.addEventListener('click',graphClick);requestAnimationFrame(drawGraph);}
function renderER(){$('#erBox').innerHTML=`<div class="er match"><div class="k">Entity resolution, the hero match</div><div class="pair"><span>Alnoor Trading Company<br><small class="ui" style="color:var(--text-3)">Customs platform</small></span><span class="score">0.94 match</span><span>Al Noor Trading Co<br><small class="ui" style="color:var(--text-3)">Booking records</small></span></div><div class="why">Same registration number, same street address, one name variant. Merged into one consignee (the party receiving the goods). This is what connects the customs hold on Y14 to Cedar Horizon's other declarations.</div></div>
  <div class="er nomatch"><div class="k">Kept apart, on purpose</div><div class="pair"><span>Red Sea Haulage<br><small class="ui" style="color:var(--text-3)">Gate system</small></span><span class="score">0.41 no match</span><span>Red Sea Hauling<br><small class="ui" style="color:var(--text-3)">Appointment system</small></span></div><div class="why">Different registration numbers and different addresses. A similar name alone does not make one company. Both stay separate.</div></div>`;}
function drawGraph(){const r=gc.getBoundingClientRect();if(r.width<10){requestAnimationFrame(drawGraph);return;}gd=Math.min(2,devicePixelRatio||1);if(gc.width!==r.width*gd){gc.width=r.width*gd;gc.height=r.height*gd;gw=r.width;gh=r.height;}gx.setTransform(gd,0,0,gd,0,0);gx.clearRect(0,0,gw,gh);
  const now=performance.now()-graphBirth;const s=store.state;const alive=nodes.filter(n=>now>n.born&&!n.mergedInto);
  /* forces */
  for(const n of alive){for(const m of alive){if(n===m)continue;let dx=n.x-m.x,dy=n.y-m.y;let d2=dx*dx+dy*dy+.0009;const f=.0001/d2;n.vx+=dx*f;n.vy+=dy*f;}n.vx+=(.5-n.x)*.014;n.vy+=(.5-n.y)*.02;}
  for(const l of links){const a=nodes[l.a],b=nodes[l.b];if(a.mergedInto||b.mergedInto||now<a.born||now<b.born)continue;const dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||.001;const f=(d-.14)*.03;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
  for(const n of alive){n.vx*=.86;n.vy*=.86;n.x=clamp(n.x+n.vx,.08,.9);n.y=clamp(n.y+n.vy,.1,.9);}
  const ta=cssVar('--text'),t3=cssVar('--text-3'),ln=cssVar('--line');
  gx.lineWidth=1;for(const l of links){const a=nodes[l.a],b=nodes[l.b];if(a.mergedInto||b.mergedInto||now<a.born||now<b.born)continue;const hlk=s.highlight.has(a.id)||s.highlight.has(b.id);gx.strokeStyle=hlk?ta:ln;gx.beginPath();gx.moveTo(a.x*gw,a.y*gh);gx.lineTo(b.x*gw,b.y*gh);gx.stroke();}
  gx.font='9px "Sometype Mono",ui-monospace,monospace';gx.textBaseline='middle';
  for(const n of alive){const age=clamp((now-n.born)/500,0,1);const r0=n.type==='terminal'?9:n.party?7:5;const rr=r0*age;const hlk=s.highlight.has(n.id);gx.fillStyle=hlk?ta:cssVar('--ent-'+n.type);gx.globalAlpha=age;gx.beginPath();gx.arc(n.x*gw,n.y*gh,rr+(hlk?2:0),0,7);gx.fill();if(n.id==='party:P2'&&merged){gx.strokeStyle=cssVar('--st-resolved');gx.lineWidth=2;gx.beginPath();gx.arc(n.x*gw,n.y*gh,rr+5,0,7);gx.stroke();}if(n.id==='declaration:D-4471'&&s.holds.Y14&&!s.holdEscalated){gx.strokeStyle=cssVar('--st-conflict');gx.lineWidth=1.5;gx.beginPath();gx.arc(n.x*gw,n.y*gh,rr+4+3*(REDUCED?0:.5+.5*Math.sin(now/300)),0,7);gx.stroke();}
    if(gw>300||hlk||n.type==='ship'||n.party){gx.fillStyle=hlk?ta:t3;gx.textAlign='left';gx.fillText(n.label.toUpperCase(),n.x*gw+rr+4,n.y*gh);}gx.globalAlpha=1;}
  if(window.__graphFX)window.__graphFX(gx,{nodes,links,alive,gw,gh,now,s,cssVar});
  requestAnimationFrame(drawGraph);}
function graphClick(e){const r=gc.getBoundingClientRect();const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;let best=null,bd=1;for(const n of nodes){if(n.mergedInto)continue;const d=Math.hypot(n.x-px,n.y-py);if(d<bd&&d<.06){bd=d;best=n;}}if(!best)return;const [type,id]=best.id.split(':');store.set({highlight:new Set([best.id]),selected:{type,id}});const map={terminal:{type:'gate',id:'G'},party:{type:'declaration',id:best.id==='party:P2'?'D-4472':'D-4471'},cont:{type:'yard',id:'Y14'}};const ref=map[type]||{type,id};$('#graphRecord').innerHTML=recordHTML(ref);}
gc.style.cursor='pointer';

/* ============ hours drawer ============ */
const hoursData=[
  {ship:'Northlight',v:[70,25,880,160,120,40]},{ship:'Amber Reach',v:[140,60,420,90,110,35]},{ship:'Marwa Star',v:[35,20,560,130,95,60]},
  {ship:'Sable Coast',v:[220,45,0,0,0,0],note:'in progress'},{ship:'Qamar Light',v:[310,0,0,0,0,0],note:'waiting'},{ship:'Hejaz Pearl',v:[190,0,0,0,0,0],note:'waiting'}
];
const causes={
  anchor:['Held for a berth: Berth 2 occupied past plan by 55 minutes.','Pilot and berth were never free at the same time; three windows missed.','Arrived early against a first-come queue and waited.','Pilot boarding delayed twenty minutes (resolved within plan).','Waiting for Berth 4 to clear.','Waiting for any berth; none planned before 22:00.'],
  berthwait:['Tugs reassigned to a departing ship at the moment of arrival.','Lines crew late to the quay.','Mooring delayed by swell.','Berthing now.','',''],
  crane:['Two of six cranes paused for spreader checks; average 26 moves an hour.','Crane 2 idle for 40 minutes: yard block behind Berth 1 full.','Both cranes at 31 moves an hour; no idle logged.','Not started.','',''],
  yard:['Fourteen restacks caused by a held block behind Berth 3.','Detours around Y07 during inspection.','Clean run.','Not started.','',''],
  gate:['Import trucks arrived for containers not yet released; twenty-two refused.','Normal.','Normal.','Not started.','',''],
  customs:['Two declarations held for document checks.','One inspection booked and completed.','Six declarations cleared inside the two-hour standard.','Not started.','','']
};
function renderHours(){$('#hrows').innerHTML=hoursData.map((h,i)=>{const tot=h.v.reduce((a,b)=>a+b,0);return `<div class="hrow"><span class="nm">${h.ship}${h.note?` <span class="ui" style="color:var(--text-3)">${h.note}</span>`:''}</span><div class="bar">${h.v.map((v,j)=>v?`<button style="width:${v/1300*100}%;background:var(--stg-${C.stageDefs[j][0]})" data-s="${i}" data-j="${j}" aria-label="${C.stageDefs[j][1]}, ${v} minutes"></button>`:'').join('')}</div><span class="tot">${Math.floor(tot/60)}h ${String(tot%60).padStart(2,'0')}</span></div>`;}).join('');
  $$('#hrows button').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.s,j=+b.dataset.j;const k=C.stageDefs[j][0];const v=hoursData[i].v[j];$('#hcause').innerHTML=`<b>${hoursData[i].ship}, ${C.stageDefs[j][1].toLowerCase()}: ${Math.floor(v/60)}h ${String(v%60).padStart(2,'0')}.</b> ${causes[k][i]||''} <span class="ui" style="color:var(--text-3)">Source: port-call event log (synthetic)</span>`;store.set({zone:k,highlight:new Set()});}));}
renderHours();

/* ============ conflicts and assistants (a queue, one assistant per part of the port call) ============ */
const CONFLICTS=[
 {id:'c1',sev:'conflict',title:'Berth 2 window collides after an arrival estimate slips',assistant:'Berth and sequencing assistant',status:'awaiting',entity:{type:'ship',id:'S5'},
  steps:[
   {h:'Read the change',d:'Arrival estimate for Cedar Horizon moved from 15:05 to 18:05. Source: ship position feed.',hl:['ship:S5']},
   {h:'Walk the connected picture',d:'Berth 2 window 18:05 to 20:40 now overlaps Dune Voyager, 17:40 to 20:15. Source: berth plan, terminal operating system.',hl:['berth:B2','ship:S6']},
   {h:'Retrieve the governed records',d:'Yard block Y14, planned for the Cedar Horizon discharge, is under customs hold: declaration D-4471, consignee (the party receiving the goods) recorded as Alnoor Trading Company. Source: customs platform, yard module.',hl:['yard:Y14','declaration:D-4471']},
   {h:'Resolve the parties',d:'Alnoor Trading Company and Al Noor Trading Co are the same consignee: match score 0.94 on registration number, address, and name variant. Cedar Horizon carries four more declarations for this consignee, so the hold and the ship are one story.',hl:['declaration:D-4471','ship:S5']},
   {h:'Check the rules',d:'Berth 1 is free from 15:30 to 21:00. Lane 3 holds forty truck appointments against Y14 containers between 14:00 and 16:00. Crane rail on Berth 1 is clear. Source: berth plan, appointment system, crane telemetry.',hl:['berth:B1','lane:L3']},
   {h:'Draft the plan',d:'Three actions, drafted for a person to read and sign.',hl:['berth:B1','lane:L3','yard:Y14']},
   {h:'Human checkpoint',d:'The assistant waits. Nothing on the map changes until a person signs.',hl:[]}],
  plan:{items:['Move Cedar Horizon to Berth 1, 18:05 to 20:40. Dune Voyager keeps Berth 2 as planned.','Re-time forty lane 3 appointments from 14:00 to 16:00 into 17:00 to 19:00, to match the new discharge start.','Escalate the customs hold on declaration D-4471 for review, since the resolved consignee shows it belongs with Cedar Horizon\'s cleared declarations.'],proj:'Projected hours saved on the Cedar Horizon stay: 2.6'},
  apply:'primary'},
 {id:'c2',sev:'watch',title:'Crane pace on Northlight falling behind the discharge plan',assistant:'Quay and yard assistant',status:'awaiting',entity:{type:'ship',id:'S3'},
  steps:[
   {h:'Read the change',d:'Northlight is running at 26 moves an hour against a plan of 31. Crane 6 paused twelve minutes for a spreader check. Source: crane telemetry.',hl:['ship:S3','crane:C6']},
   {h:'Walk the connected picture',d:'Yard block Y07 behind Berth 3 is at 94 percent occupancy, so discharge moves are queueing for space. Source: yard module.',hl:['yard:Y07','berth:B3']},
   {h:'Check the rules',d:'Blocks Y21 and Y22 are open and on the same crane run. Restacking two rows clears space without crossing another ship\'s lane. Source: yard module, terminal operating system.',hl:['yard:Y21','yard:Y22']},
   {h:'Draft the plan',d:'Two actions, drafted for a person to read and sign.',hl:['yard:Y07','yard:Y21']},
   {h:'Human checkpoint',d:'The assistant waits. The yard plan changes only when a person signs.',hl:[]}],
  plan:{items:['Divert the next sixty Northlight discharge moves from Y07 to Y21 and Y22.','Bring crane 5 onto the Northlight run for the next two hours, released from Berth 4 after Sable Coast berths.'],proj:'Projected hours saved on the Northlight stay: 1.4'},
  apply:'secondary'},
 {id:'c3',sev:'ok',title:'Sable Coast pilot boarding delayed twenty minutes',assistant:'Approach and marine assistant',status:'noaction',entity:{type:'ship',id:'S4'},
  steps:[
   {h:'Read the change',d:'Pilot boarding for Sable Coast delayed twenty minutes. Source: ship position feed, pilot dispatch.',hl:['ship:S4']},
   {h:'Walk the connected picture',d:'Berth 4 is free until 22:10 and no other ship is waiting on it. The twenty minutes fit inside the existing window. Source: berth plan.',hl:['berth:B4']},
   {h:'Check the rules',d:'No downstream appointment, crane run, or declaration is affected. Source: appointment system, crane telemetry, customs platform.',hl:[]},
   {h:'Recommend no action',d:'Resolved within the existing plan. The assistant recommends no action and logs the reason. A system that knows when to do nothing is worth as much as one that acts.',hl:['ship:S4']}],
  plan:null,apply:'none'}
];
const conflictById=id=>CONFLICTS.find(c=>c.id===id);
let activeCase=null,agentBuilt=false,walkTimer=null;
function awaitingCount(){return CONFLICTS.filter(c=>c.status==='awaiting').length;}
function renderQueue(){const q=$('#queue');if(!q)return;
  q.innerHTML=CONFLICTS.map(c=>{const st={awaiting:['await','Waiting on a person'],noaction:['ok','No action recommended'],approved:['done','Signed'],overruled:['done','Overruled'],watching:['watch','Watching']}[c.status];
    return `<button class="qi" data-c="${c.id}" aria-current="${activeCase===c.id?'true':'false'}"><span class="sev" style="background:var(--st-${c.sev==='ok'?'resolved':c.sev==='watch'?'watch':'conflict'})"></span><span><span class="qt">${c.title}</span><span class="qa">${c.assistant}</span></span><span class="qs ${st[0]}">${st[1]}</span></button>`;}).join('');
  $$('#queue .qi').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.c)));
  $('#qCount').textContent=awaitingCount()+' of '+CONFLICTS.length+' waiting on a person';
  store.set({awaiting:awaitingCount()});}
function ensureAgent(){if(agentBuilt)return;agentBuilt=true;renderQueue();
  $('#approveBtn').addEventListener('click',approve);
  $('#overruleBtn').addEventListener('click',()=>{$('#sign').classList.add('overruling');$('#confirmOverrule').style.display='inline-block';$('#reason').focus();});
  $('#confirmOverrule').addEventListener('click',overrule);}
function openCase(id){ensureAgent();clearTimeout(walkTimer);const c=conflictById(id);activeCase=id;renderQueue();
  $('#caseTitle').textContent=c.title;$('#caseAssistant').textContent=c.assistant;
  $('#steps').innerHTML=c.steps.map((s,i)=>`<div class="step" data-i="${i}"><span class="i">${String(i+1).padStart(2,'0')}</span><div><div class="h">${s.h}</div><div class="d">${s.d}</div></div></div>`).join('');
  $('#plan').classList.remove('on');$('#sign').classList.remove('on','overruling');$('#logline').classList.remove('on');$('#agentClose').classList.remove('on');$('#confirmOverrule').style.display='none';$('#reason').value='';
  if(c.plan)$('#plan').innerHTML=`<div class="k">Drafted plan</div><ul>${c.plan.items.map(i=>`<li>${i}</li>`).join('')}</ul><div class="proj">${c.plan.proj}<small>Synthetic projection, from invented data. Shown to illustrate what the real system would report.</small></div>`;
  if(c.status==='approved'||c.status==='overruled'){$$('#steps .step').forEach(el=>el.classList.add('done'));if(c.plan)$('#plan').classList.add('on');$('#logline').innerHTML=c.log||'';$('#logline').classList.add('on');return;}
  store.set({guided:'walking'});runStep(0);}
function runStep(i){const c=conflictById(activeCase);if(!c||i>=c.steps.length)return;const st=c.steps[i];
  $$('#steps .step').forEach((el,j)=>{el.classList.toggle('active',j===i);el.classList.toggle('done',j<i);});
  store.set({agentStep:i,highlight:new Set(st.hl)});
  const isDraft=c.plan&&i===c.steps.length-2, isGate=i===c.steps.length-1;
  if(isDraft){$('#plan').classList.add('on');if(c.apply==='primary')store.set({ghosts:true});}
  if(isGate){if(c.plan){$('#sign').classList.add('on');}else{$$('#steps .step').forEach(el=>el.classList.add('done'));$('#logline').innerHTML='No action recommended. Logged at '+fmtClock(store.state.sim)+' with the reason above. The map is unchanged.';$('#logline').classList.add('on');c.status='noaction';renderQueue();}
    store.set({highlight:new Set(),guided:'done'});return;}
  walkTimer=setTimeout(()=>runStep(i+1),REDUCED?1100:2400);}
function startWalk(){ensureAgent();if(!activeCase)openCase(CONFLICTS[0].id);}
function finish(c,html,feedTxt,color){c.log=html;$('#logline').innerHTML=html;$('#logline').classList.add('on');$('#agentClose').classList.add('on');
  $$('#steps .step').forEach(el=>{el.classList.remove('active');el.classList.add('done');});$('#sign').classList.remove('on','overruling');$('#confirmOverrule').style.display='none';
  renderQueue();feed(feedTxt,color,c.entity);setTimeout(()=>$('#closeLine').classList.add('on'),4000);}
function approve(){const c=conflictById(activeCase);if(!c)return;const s=store.state;const name=($('#signer').value||'Duty manager').trim();
  if(c.apply==='primary'){const sh=shipById('S5');sh.berth='B1';store.set({appliedPlan:true,ghosts:false,decided:'approved',holdEscalated:true,approvedAt:s.sim});
    setTimeout(()=>{feed('Customs: declaration D-4471 review completed, hold lifted.',ENT('customs'),{type:'yard',id:'Y14'});store.state.holds.Y14=false;store.set({});},9000);}
  if(c.apply==='secondary'){store.state.craneRate=Math.max(store.state.craneRate,31);store.set({});}
  c.status='approved';store.set({highlight:new Set(),guided:'done'});
  finish(c,`Plan approved and signed by <b>${name}</b> at ${fmtClock(s.sim)}. Written back to the decision log.`,`Plan approved and signed by ${name}: ${c.title.toLowerCase()}.`,ST('resolved'));}
function overrule(){const c=conflictById(activeCase);if(!c)return;const reason=$('#reason').value.trim();
  if(!reason){$('#reason').placeholder='A reason is required to overrule.';$('#reason').focus();return;}
  const s=store.state;const name=($('#signer').value||'Duty manager').trim();c.status='overruled';
  if(c.apply==='primary')store.set({ghosts:false,decided:'overruled'});
  store.set({highlight:new Set(),guided:'done'});
  finish(c,`Plan overruled by <b>${name}</b> at ${fmtClock(s.sim)}. Reason: "${reason}". The map is unchanged.`,`Plan overruled by ${name}: "${reason}". No change applied.`,ST('watch'));}
window.__renderQueue=renderQueue;window.__openCase=openCase;

/* ============ guided path wiring ============ */
$('#calloutBtn').addEventListener('click',()=>{openLens('agent');openCase('c1');});
$('#resumeBtn').addEventListener('click',()=>{openLens('agent');$('#resumeBtn').classList.remove('on');});
$('#closeLineBtn').addEventListener('click',()=>$('#closeLine').classList.remove('on'));
store.sub(s=>{if(s.guided==='walking'&&s.lens!=='agent')$('#resumeBtn').classList.add('on');else $('#resumeBtn').classList.remove('on');});
$$('#lensSeg button').forEach(b=>{if(b.dataset.lens==='agent')b.addEventListener('click',()=>ensureAgent());});

/* ============ open and close the workbench ============ */
let started=false;
function setHd(){const h=$('.wb-hd').getBoundingClientRect().height;$('#wb').style.setProperty('--wbhd',h+'px');}
new ResizeObserver(setHd).observe($('.wb-hd'));
setHd();if(!started){started=true;window.__startMap();requestAnimationFrame(C.tick);if(window.__boot)window.__boot();}
})();
