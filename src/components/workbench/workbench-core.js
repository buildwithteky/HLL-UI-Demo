// Ported verbatim from the reference deck's workbench script (deck-only code removed).

(function(){
'use strict';
/* ============ utilities ============ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=()=>innerWidth<=900;
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R=rng(20260903);
const START_MIN=14*60+20; /* synthetic clock 14:20 */
const fmtClock=m=>{const t=(START_MIN+Math.floor(m))%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const cssVar=n=>getComputedStyle(document.querySelector('.wbx')).getPropertyValue(n).trim();

/* ============ single state store ============ */
const store={state:{},subs:new Set(),set(patch){Object.assign(this.state,patch);this.subs.forEach(f=>f(this.state));},sub(f){this.subs.add(f);return()=>this.subs.delete(f);}};
window.__wb=store; /* exposed for verification only */

/* ============ world (normalized map space, x right, y down) ============ */
const W={
  anchorage:{x:.14,y:.30,r:.10},
  pilot:{x:.245,y:.615},
  tug:{x:.405,y:.86},
  quayX:.42,
  berths:[
    {id:'B1',name:'Berth 1',y0:.20,y1:.35},
    {id:'B2',name:'Berth 2',y0:.36,y1:.51},
    {id:'B3',name:'Berth 3',y0:.52,y1:.67},
    {id:'B4',name:'Berth 4',y0:.68,y1:.83}
  ],
  cranes:[],yard:[],
  inspection:{x:.80,y:.62,w:.08,h:.18},
  gate:{x:.86,y:.30,w:.055,h:.20},
  lanes:[{id:'L1',y:.31},{id:'L2',y:.40},{id:'L3',y:.49}],
  channel:[{x:.02,y:.80},{x:.12,y:.72},{x:.22,y:.64},{x:.30,y:.56},{x:.36,y:.48},{x:.40,y:.42}],
  breakwater:[{x:.31,y:.09},{x:.24,y:.16},{x:.19,y:.28},{x:.17,y:.42},{x:.19,y:.53}]
};
W.berths.forEach((b,i)=>{W.cranes.push({id:'C'+(i*2+1),berth:b.id,y:lerp(b.y0,b.y1,.32)});W.cranes.push({id:'C'+(i*2+2),berth:b.id,y:lerp(b.y0,b.y1,.68)});});
(function(){let n=1;for(let r=0;r<6;r++)for(let c=0;c<4;c++){W.yard.push({id:'Y'+String(n).padStart(2,'0'),x:.50+c*.07,y:.20+r*.104,w:.058,h:.086,row:r,col:c});n++;}})();
const yardById=id=>W.yard.find(y=>y.id===id);
const berthById=id=>W.berths.find(b=>b.id===id);

/* ============ entities ============ */
/* ships: status one of berthed | waiting | inbound | outbound | departed ; times in sim minutes */
const ships=[
  {id:'S1',name:'Amber Reach',status:'berthed',berth:'B1',eta:-300,etd:70,teu:1800,line:'Red Sea Feeder Line',containersLeft:112},
  {id:'S2',name:'Marwa Star',status:'berthed',berth:'B2',eta:-540,etd:40,teu:3200,line:'Gulf Container Services',containersLeft:41},
  {id:'S3',name:'Northlight',status:'berthed',berth:'B3',eta:-120,etd:420,teu:6800,line:'Northern Ocean Carriers',containersLeft:1420},
  {id:'S4',name:'Sable Coast',status:'inbound',berth:'B4',eta:15,etd:180,teu:2400,line:'Red Sea Feeder Line',containersLeft:640,progress:.55},
  {id:'S5',name:'Cedar Horizon',status:'inbound',berth:'B2',eta:45,etd:200,teu:5200,line:'Levant Shipping',containersLeft:980,progress:.12,plannedYard:'Y14'},
  {id:'S6',name:'Dune Voyager',status:'inbound',berth:'B2',eta:190,etd:355,teu:4100,line:'Gulf Container Services',containersLeft:760,progress:-.6},
  {id:'S7',name:'Kestrel Bay',status:'inbound',berth:'B1',eta:400,etd:520,teu:2900,line:'Northern Ocean Carriers',containersLeft:530,progress:-1.6},
  {id:'S8',name:'Qamar Light',status:'waiting',eta:null,etd:null,teu:1500,line:'Levant Shipping',containersLeft:300,ax:-.03,ay:-.04},
  {id:'S9',name:'Hejaz Pearl',status:'waiting',eta:null,etd:null,teu:2100,line:'Red Sea Feeder Line',containersLeft:410,ax:.04,ay:.03}
];
const shipById=id=>ships.find(s=>s.id===id);
const shipByName=n=>ships.find(s=>s.name===n);

const declarations=[
  {id:'D-4471',consignee:'Alnoor Trading Company',yard:'Y14',status:'hold',containers:38,note:'Document check pending since 09:40'},
  {id:'D-4472',consignee:'Al Noor Trading Co',yard:'Y14',status:'cleared',containers:12,note:'Cleared 11:10'},
  {id:'D-4480',consignee:'Bayan Steel Works',yard:'Y07',status:'cleared',containers:22,note:'Cleared 08:55'},
  {id:'D-4485',consignee:'Hijaz Fresh Produce',yard:'Y03',status:'inspection',containers:9,note:'Physical inspection booked 15:30'}
];
const companies=[
  {id:'K1',name:'Red Sea Haulage',trucks:14,source:'Gate system'},
  {id:'K2',name:'Red Sea Hauling',trucks:6,source:'Appointment system'},
  {id:'K3',name:'Bayan Logistics',trucks:10,source:'Gate system'}
];
const trucks=[];for(let i=0;i<30;i++){trucks.push({id:'T'+(i+1),lane:i%3,t:R(),speed:.0009+R()*.0006,company:companies[i%3].id,target:i%3===2?'Y14':(i%2?'Y07':'Y03')});}

/* ============ live state ============ */
store.set({
  sim:0, running:true, conflict:false, agentOpen:false, agentStep:-1, planned:false, decided:null, lens:'map',
  awaiting:0, gatePerHour:62, craneRate:28, craneHist:Array.from({length:40},(_,i)=>26+Math.sin(i/4)*3+R()*2),
  holds:{Y14:true}, holdEscalated:false, laneQueue:[3,4,4], highlight:new Set(), zone:null, selected:null,
  ghosts:false, appliedPlan:false, watch:{}, resolvedFlash:{}, guided:'idle'
});

/* ============ feed ============ */
const feedList=$('#feedList');
const feedItems=[];
function feed(text,color,entity){
  const li=document.createElement('li');li.className='new';
  li.innerHTML=`<span class="t">${fmtClock(store.state.sim)}</span><span class="b" style="background:${color}"></span><span>${text}</span>`;
  if(entity){li.addEventListener('click',()=>selectEntity(entity));}
  feedList.prepend(li);feedItems.push(li);
  if(feedItems.length>60){const old=feedItems.shift();old.remove();}
}

/* ============ scenario (deterministic) ============ */
const ENT=k=>cssVar('--ent-'+k);
const ST=k=>cssVar('--st-'+k);
const scenario=[
  {t:0,fn:()=>feed('Shift handover complete. Three berths occupied, two ships in the waiting area.',ENT('terminal'))},
  {t:2,fn:()=>feed('Marwa Star: 41 containers remaining, both cranes working at 31 moves an hour.',ENT('crane'),{type:'ship',id:'S2'})},
  {t:4,fn:()=>{const s=shipById('S5');s.eta=225;s.etd=380;s.slipped=true;store.set({conflict:true,awaiting:1,guided:'callout'});
      feed('Cedar Horizon: arrival estimate revised by three hours, now 18:05.',ST('conflict'),{type:'ship',id:'S5'});
      feed('Berth 2: the window for Cedar Horizon now overlaps Dune Voyager.',ENT('berth'),{type:'berth',id:'B2'});}},
  {t:5,fn:()=>feed('Yard block Y14: customs hold in place since 09:40 on declaration D-4471.',ENT('customs'),{type:'yard',id:'Y14'})},
  {t:6,fn:()=>{store.state.laneQueue[2]=11;store.set({});feed('Gate lane 3: eleven trucks queued for containers held in Y14.',ENT('truck'),{type:'lane',id:'L3'})}},
  {t:10,fn:()=>{store.state.watch.S4=true;store.set({});feed('Sable Coast: pilot boarding delayed twenty minutes.',ST('watch'),{type:'ship',id:'S4'})}},
  {t:18,fn:()=>{feed('Northlight: crane 6 paused for a spreader check, twelve minutes. Quay and yard assistant opened a case.',ST('watch'),{type:'crane',id:'C6'});if(window.__renderQueue)window.__renderQueue();}},
  {t:25,fn:()=>{delete store.state.watch.S4;store.state.resolvedFlash.S4=store.state.sim;store.set({});feed('Sable Coast: pilot aboard, berthing at Berth 4 inside the existing window. Resolved within the existing plan; no action recommended.',ST('resolved'),{type:'ship',id:'S4'})}},
  {t:34,fn:()=>feed('Gate: 64 trucks through in the last hour.',ENT('truck'),{type:'gate',id:'G'})},
  {t:40,fn:()=>{const s=shipById('S2');s.status='outbound';s.progress=1;feed('Marwa Star departed Berth 2.',ENT('ship'),{type:'ship',id:'S2'})}},
  {t:52,fn:()=>feed('Northlight: 1,180 containers remaining.',ENT('crane'),{type:'ship',id:'S3'})},
  {t:70,fn:()=>{const s=shipById('S1');s.status='outbound';s.progress=1;feed('Amber Reach departed Berth 1.',ENT('ship'),{type:'ship',id:'S1'})}}
];
let scenarioIdx=0;
function runScenario(){while(scenarioIdx<scenario.length&&scenario[scenarioIdx].t<=store.state.sim){scenario[scenarioIdx].fn();scenarioIdx++;}}

/* ============ simulation tick ============ */
let last=performance.now(), acc=0;
const SIM_RATE=1; /* sim minutes per real second */
function tick(now){
  const dt=(now-last)/1000;last=now;
  const s=store.state;
  if(s.running){
    s.sim+=dt*SIM_RATE;
    ships.forEach(sh=>{
      if(sh.status==='inbound'){const total=Math.max(1,sh.eta-(sh.eta-40));/* arrival takes 40 sim min along the channel */
        sh.progress=clamp(1-(sh.eta-s.sim)/40,-3,1);
        if(s.sim>=sh.eta){sh.status='berthed';sh.arrived=s.sim;}
      }
      if(sh.status==='outbound'){sh.progress-=dt*SIM_RATE/25;if(sh.progress<=-.2)sh.status='departed';}
      if(sh.status==='waiting'){sh.ax+=Math.sin(s.sim/9+sh.id.length)*dt*.0008;sh.ay+=Math.cos(s.sim/11)*dt*.0006;}
      if(sh.status==='berthed'&&sh.containersLeft>0)sh.containersLeft=Math.max(0,sh.containersLeft-dt*SIM_RATE*(s.craneRate/60)*2);
    });
    trucks.forEach(tr=>{tr.t+=tr.speed*dt*60*(tr.lane===2&&s.laneQueue[2]>6&&!s.appliedPlan?.35:1);if(tr.t>1)tr.t-=1;});
    if(s.appliedPlan&&s.laneQueue[2]>4){s.laneQueue[2]=Math.max(4,s.laneQueue[2]-dt*.4);}
    acc+=dt;if(acc>1.2){acc=0;s.craneRate=clamp(s.craneRate+(R()-.5)*1.4,24,34);s.craneHist.push(s.craneRate);if(s.craneHist.length>40)s.craneHist.shift();s.gatePerHour=clamp(Math.round(s.gatePerHour+(R()-.5)*3),52,72);if(R()<.28)randomEvent();}
    runScenario();
    store.set({});
  }
  requestAnimationFrame(tick);
}
const randomPool=[
  ()=>feed('Crane '+(1+Math.floor(R()*8))+': hatch cover lift logged.',ENT('crane')),
  ()=>feed('Gate lane '+(1+Math.floor(R()*3))+': truck cleared in 6 minutes 40 seconds.',ENT('truck')),
  ()=>feed('Yard: block Y'+String(1+Math.floor(R()*24)).padStart(2,'0')+' restack complete.',ENT('container')),
  ()=>feed('Ship position feed: 14 vessels tracked inside 20 nautical miles.',ENT('ship')),
  ()=>feed('Customs: declaration D-'+(4490+Math.floor(R()*30))+' cleared.',ENT('customs'))
];
function randomEvent(){randomPool[Math.floor(R()*randomPool.length)]();}

/* ============ selection and highlights ============ */
function selectEntity(ref){store.set({selected:ref,highlight:new Set([ref.type+':'+ref.id])});if(window.__openRecord)window.__openRecord(ref);}
window.__select=selectEntity;

/* ============ time controls ============ */
$$('#timeSeg button').forEach(b=>b.addEventListener('click',()=>{
  const m=b.dataset.time;$$('#timeSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
  if(m==='live'){store.set({running:true});setLive(true);}
  if(m==='pause'){store.set({running:false});setLive(false);}
  if(m==='jump'){if(store.state.sim<6.2){store.state.sim=6.2;runScenario();}store.set({running:true});setLive(true);$$('#timeSeg button')[0].setAttribute('aria-pressed','true');b.setAttribute('aria-pressed','false');
    if(window.__focusConflict)window.__focusConflict();
    const f=$('#flash');if(f){f.innerHTML='Berth 2: Cedar Horizon and Dune Voyager now overlap. Yard block Y14 is held. <b>Open the assistants</b>';f.classList.add('on');clearTimeout(window.__flashT);window.__flashT=setTimeout(()=>f.classList.remove('on'),5200);f.onclick=()=>{f.classList.remove('on');window.__openLens('agent');if(window.__openCase)window.__openCase('c1');};f.style.cursor='pointer';}
    if(window.__renderQueue)window.__renderQueue();}
}));
function setLive(on){const el=$('#liveBadge');el.classList.toggle('paused',!on);$('#liveTxt').textContent=on?'Live':'Paused';}

/* ============ instruments ============ */
const inst=$('#inst'), mob=$('#mobStrip');
const gaugeDefs=[
  {id:'waiting',k:'Ships in the waiting area',v:s=>ships.filter(x=>x.status==='waiting').length,ref:{type:'zone',id:'anchorage'}},
  {id:'berths',k:'Berths occupied',v:s=>ships.filter(x=>x.status==='berthed').length,unit:'of 4',ref:{type:'zone',id:'quay'}},
  {id:'crane',k:'Crane moves per hour',v:s=>Math.round(s.craneRate),spark:true,ref:{type:'zone',id:'cranes'}},
  {id:'gate',k:'Trucks through the gate per hour',v:s=>s.gatePerHour,ref:{type:'gate',id:'G'}},
  {id:'await',k:'Actions awaiting signature',v:s=>s.awaiting,alert:s=>s.awaiting>0,ref:{type:'agent',id:'A'}}
];
inst.innerHTML=gaugeDefs.map(g=>`<button class="gauge" data-g="${g.id}"><div class="k">${g.k}</div><div class="v"><span class="num">0</span>${g.unit?`<small>${g.unit}</small>`:''}</div>${g.spark?'<canvas></canvas>':''}</button>`).join('');
mob.innerHTML=gaugeDefs.map(g=>`<button class="g" data-g="${g.id}">${g.k.replace('Ships in the waiting area','Waiting').replace('Trucks through the gate per hour','Gate per hour').replace('Crane moves per hour','Crane moves per hour').replace('Actions awaiting signature','Awaiting signature')} <b>0</b></button>`).join('');
$$('[data-g]').forEach(b=>b.addEventListener('click',()=>{const g=gaugeDefs.find(x=>x.id===b.dataset.g);if(g.ref.type==='agent'){window.__openLens('agent');}else if(g.ref.type==='zone'){store.set({zone:g.ref.id,highlight:new Set()});window.__openRecord({type:'zone',id:g.ref.id});}else selectEntity(g.ref);}));
function renderInst(s){
  gaugeDefs.forEach(g=>{const v=g.v(s);const el=inst.querySelector(`[data-g="${g.id}"]`);el.querySelector('.num').dataset.t=v;if(!el.querySelector('.num').textContent)el.querySelector('.num').textContent='0';el.classList.toggle('alert',!!(g.alert&&g.alert(s)));
    const m=mob.querySelector(`[data-g="${g.id}"]`);m.querySelector('b').textContent=v+(g.unit?' '+g.unit:'');m.classList.toggle('alert',!!(g.alert&&g.alert(s)));
    if(g.spark){const c=el.querySelector('canvas');const dpr=Math.min(2,devicePixelRatio||1);const w=c.clientWidth,h=28;if(c.width!==w*dpr){c.width=w*dpr;c.height=h*dpr;}const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);x.strokeStyle=cssVar('--ent-crane');x.lineWidth=1.5;x.beginPath();s.craneHist.forEach((v,i)=>{const px=i/(s.craneHist.length-1)*w,py=h-((v-22)/14)*h;i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();}
  });
  $('#clock').textContent=fmtClock(s.sim);
}
store.sub(renderInst);

/* ============ legend ============ */
const legendDefs=[['ship','Ships'],['berth','Berth windows'],['crane','Cranes'],['container','Containers and yard'],['truck','Trucks'],['customs','Customs'],['terminal','Terminal and gate']];
$('#legend').innerHTML=legendDefs.map(([k,l])=>`<span><i style="background:var(--ent-${k})"></i>${l}</span>`).join('');
const stageDefs=[['anchor','Anchor wait'],['berthwait','Berth wait'],['crane','Crane time'],['yard','Yard'],['gate','Gate'],['customs','Customs']];
$('#stgLegend').innerHTML=stageDefs.map(([k,l])=>`<span><i style="background:var(--stg-${k})"></i>${l}</span>`).join('');

/* ============ expose for later parts ============ */
window.__core={store,W,ships,declarations,companies,trucks,shipById,shipByName,yardById,berthById,feed,fmtClock,cssVar,clamp,lerp,REDUCED,isMobile,ENT,ST,tick,runScenario,setLive,selectEntity,stageDefs,legendDefs,R};
})();
