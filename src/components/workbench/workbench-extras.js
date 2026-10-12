// Ported verbatim from the reference deck's workbench script (deck-only code removed).

(function(){
'use strict';
const C=window.__core,{store,W,ships,shipById,cssVar,clamp,lerp,REDUCED,isMobile}=C;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const MOTION=!REDUCED;
const hex2rgba=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};

/* ===== gradient reveals when a slide comes into view ===== */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('[data-reveal]',e.target).forEach((el,i)=>setTimeout(()=>el.classList.add('go'),120+i*200));}}),{root:$('#deck'),threshold:.5});
$$('.slide').forEach(s=>rio.observe(s));

/* ===== slide 1: chain flow (a ship travelling the handoffs, time accumulating) ===== */
(function(){const cv=$('#chainFlow');if(!cv)return;const cx=cv.getContext('2d');let w=0,h=54,d=1,t0=performance.now();const stageCols=['--stg-anchor','--stg-anchor','--stg-berthwait','--stg-crane','--stg-yard','--stg-gate','--stg-customs','--ent-ship'];const weights=[.16,.05,.06,.34,.13,.11,.09,.06];
  function draw(now){const r=cv.getBoundingClientRect();if(r.width<10){requestAnimationFrame(draw);return;}d=Math.min(2,devicePixelRatio||1);if(cv.width!==r.width*d){cv.width=r.width*d;cv.height=h*d;w=r.width;}cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,w,h);
    const gap=8,n=8,cw=(w-gap*(n-1))/n;const line=cssVar('--line'),text3=cssVar('--text-3'),text=cssVar('--text');
    /* baseline segments weighted by where the hours go */
    let x=0;const segs=[];for(let i=0;i<n;i++){segs.push({x,w:cw,c:cssVar(stageCols[i])});x+=cw+gap;}
    segs.forEach(sg=>{cx.fillStyle=hex2rgba(sg.c,.22);cx.fillRect(sg.x,30,sg.w,3);});
    const period=14000;const p=MOTION?((now-t0)%period)/period:.62;
    /* accumulate: which segment the ship is in, weighted */
    let acc=0,idx=0,local=0;for(let i=0;i<n;i++){if(p<acc+weights[i]){idx=i;local=(p-acc)/weights[i];break;}acc+=weights[i];idx=i;local=1;}
    for(let i=0;i<idx;i++){cx.fillStyle=hex2rgba(segs[i].c,.9);cx.fillRect(segs[i].x,30,segs[i].w,3);}
    cx.fillStyle=hex2rgba(segs[idx].c,.9);cx.fillRect(segs[idx].x,30,segs[idx].w*local,3);
    const sx=segs[idx].x+segs[idx].w*local;
    /* wake */
    if(MOTION){for(let i=1;i<=6;i++){cx.fillStyle=hex2rgba(segs[idx].c,.25-i*.035);cx.beginPath();cx.arc(sx-i*9,31.5,3-i*.35,0,7);cx.fill();}}
    /* ship marker */
    cx.fillStyle=text;cx.beginPath();cx.moveTo(sx+9,31.5);cx.lineTo(sx-4,26);cx.lineTo(sx-1,31.5);cx.lineTo(sx-4,37);cx.closePath();cx.fill();
    /* elapsed label */
    const hours=(p*46).toFixed(1);cx.font='10px "Sometype Mono",ui-monospace,monospace';cx.fillStyle=text3;cx.textAlign='left';cx.textBaseline='middle';cx.fillText(('HOURS IN PORT SO FAR  '+hours).toUpperCase(),Math.min(sx+16,w-150),14);
    cx.textAlign='right';cx.fillText('SYNTHETIC PACE',w,47);
    requestAnimationFrame(draw);}
  requestAnimationFrame(draw);})();

/* ===== slide 2: positioning stack, particles flowing bottom to top, and layer detail ===== */
(function(){const stack=$('#stack'),cv=$('#stackCanvas');if(!cv)return;const cx=cv.getContext('2d');let parts=[];const N=isMobile()?18:44;
  const detail=[
    ['Trust','What it is: the governance layer. Every fact in the workbench carries the record it came from and the transformation it went through. Every decision carries the name of the person who signed it, the time, and the reason they typed. Access is decided by role, so a duty manager, a planner, and an auditor each see what their role permits.','What we do: design the lineage model so provenance travels with every fact; build the sign-off gates into every workflow that changes the real world; run schema change as a governed, versioned process that shows its impact before it ships; align agent guardrails to published agentic-security practice.','What you keep: an auditable decision log and a provenance trail your regulator, your operators, and your engineers can all read, plus the governance process itself, documented.'],
    ['Kinetic','What it is: governed agentic workflows. An agentic workflow is a sequence of defined steps that software carries out with judgment inside each step: read a change, walk the connected picture, retrieve the governed records, check the rules, draft the action with its reasoning shown, then stop. Predefined paths first; autonomy only where flexibility clearly beats predictability.','What we do: build the workflows on LangGraph with durable state, so a workflow survives interruptions and resumes where it stopped; define the human checkpoints with your duty managers; wire the assistant to your systems through the connected model, so every action it drafts is grounded in the same picture your people see; instrument evaluation and observability from the first day.','What you keep: the workflows, documented and running on your infrastructure, with a person approving anything that changes a berth, an appointment, or a customs status. Nothing acts without a signature.'],
    ['Ontology','What it is: the written-down meaning of your operation. What a ship visit, a berth window, a crane assignment, a container move, a truck appointment, and a customs declaration are, and how they relate to one another. The knowledge graph is that model filled with your real records, so a question about one ship, one alert, or one chain of events is answered by following the connections, with the source record on every hop.','What we do: model one narrow slice first with your operations people, in LinkML; materialize it as a knowledge graph in Neo4j; add retrieval the simplest way that works and bring in graph retrieval only where multi-hop questions demand it; grow the model only where real questions require it.','What you keep: the model itself, versioned like code, owned by your people, and reused by the duty manager today and the planning office tomorrow without re-deriving the meaning each time.'],
    ['Foundation','What it is: the data engineering, integration, and analytics underneath everything. Connecting to the terminal operating system, the port community platform, the ship position feed, the gate and appointment systems, and the customs platform, and reading records where they live. Then making those records usable: one timeline, consistent timestamps, and one record per real-world thing.','What we do: build the event pipelines; standardize and repair the timestamps that turnaround analysis depends on; run probabilistic record matching with Splink so one trucking company under two names, or one consignee spelled two ways, becomes one record with a confidence score; build the analytics floor: turnaround decomposed per ship visit, berth occupancy, crane pace, truck turn time, dwell time.','What you keep: canonical records, the pipelines, and a match-quality report on your own data slice, inside weeks, before anything larger is committed.']
  ];
  $$('.sb').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.sb;const on=b.getAttribute('aria-pressed')==='true';$$('.sb').forEach(x=>x.setAttribute('aria-pressed','false'));const box=$('#sbDetail');if(on){box.classList.remove('on');return;}b.setAttribute('aria-pressed','true');const d=detail[i];box.innerHTML=d.slice(1).map((v,j)=>`<div><div class="k">${['What it is','What we do','What you keep'][j]}</div><div class="v">${(x=>x.charAt(0).toUpperCase()+x.slice(1))(v.replace(/^What (it is|we do|you keep): /,''))}</div></div>`).join('');box.classList.add('on');}));
  function bands(){const r=stack.getBoundingClientRect();const b=$('.band.bottom').getBoundingClientRect(),m=$('.band.mid').getBoundingClientRect(),t=$('.band.top').getBoundingClientRect();return{r,b:{y0:b.top-r.top,y1:b.bottom-r.top},m:{y0:m.top-r.top,y1:m.bottom-r.top},t:{y0:t.top-r.top,y1:t.bottom-r.top}};}
  function seed(){const {r}=bands();parts=Array.from({length:N},(_,i)=>({x:.06+Math.random()*.88,p:Math.random(),sp:.0009+Math.random()*.0012,w:.4+Math.random()*.8,k:i%7}));}
  const cols=['--ent-ship','--ent-berth','--ent-crane','--ent-container','--ent-truck','--ent-customs','--ent-terminal'];
  function draw(){const bd=bands();const w=bd.r.width,h=bd.r.height;if(w<10){requestAnimationFrame(draw);return;}const d=Math.min(2,devicePixelRatio||1);if(cv.width!==w*d||cv.height!==h*d){cv.width=w*d;cv.height=h*d;}cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,w,h);
    if(!parts.length)seed();
    const lc=cssVar('--line');cx.strokeStyle=lc;cx.lineWidth=1;[[bd.b.y0,bd.m.y1],[bd.m.y0,bd.t.y1]].forEach(([a,z])=>{for(let i=1;i<6;i++){const x=w*i/6;cx.beginPath();cx.moveTo(x,z);cx.lineTo(x,a);cx.stroke();}});
    const yBottom=bd.b.y1-6,yTop=bd.t.y0+6;
    parts.forEach(pt=>{if(MOTION)pt.p+=pt.sp;if(pt.p>1){pt.p=0;pt.x=.06+Math.random()*.88;}
      const y=lerp(yBottom,yTop,pt.p);const inMid=y<bd.m.y1&&y>bd.m.y0;const col=cssVar(cols[pt.k]);
      /* particles slow and brighten inside the HLL band: the transformation moment */
      const a=inMid?.95:.45;const rad=inMid?2.4:1.6;
      cx.fillStyle=hex2rgba(col,a*pt.w);cx.beginPath();cx.arc(pt.x*w,y,rad,0,7);cx.fill();
      if(MOTION){cx.strokeStyle=hex2rgba(col,.18*pt.w);cx.lineWidth=1;cx.beginPath();cx.moveTo(pt.x*w,y);cx.lineTo(pt.x*w,y+14);cx.stroke();}});
    requestAnimationFrame(draw);}
  new ResizeObserver(()=>{parts=[];}).observe(stack);requestAnimationFrame(draw);})();

/* ===== workbench boot sequence ===== */
window.__boot=function(){const boot=$('#boot'),ul=$('#bootList');const src=[['ship','Ship position feed'],['terminal','Terminal operating system'],['berth','Berth plan'],['crane','Crane telemetry'],['truck','Gate and appointment systems'],['customs','Customs platform'],['container','Manifests and inspection notes']];
  ul.innerHTML=src.map(([k,n],i)=>`<li style="animation-delay:${MOTION?i*220:0}ms"><i style="background:var(--ent-${k})"></i><span>${n}</span><b>Connected</b></li>`).join('');boot.classList.add('on');
  const total=MOTION?src.length*220+900:300;setTimeout(()=>{boot.classList.add('out');setTimeout(()=>{boot.classList.remove('on','out');},650);},total);};

/* ===== instrument number tweens ===== */
(function(){let shown={};function step(){$$('.gauge .num').forEach(el=>{const t=parseFloat(el.dataset.t);if(isNaN(t))return;const id=el.closest('.gauge').dataset.g;let cur=shown[id];if(cur==null)cur=0;cur=MOTION?cur+(t-cur)*.14:t;if(Math.abs(t-cur)<.05)cur=t;shown[id]=cur;el.textContent=Number.isInteger(t)?Math.round(cur):cur.toFixed(0);});requestAnimationFrame(step);}requestAnimationFrame(step);})();

/* ===== map FX: water shimmer (desktop), conflict chain links, crane lifts, wakes, approval sweep ===== */
window.__fxWater=function(ctx,o){if(isMobile())return;const {X,Y,S,cw,ch,t,theme,hex2rgba}=o;ctx.save();ctx.strokeStyle=hex2rgba(theme.line,.28);ctx.lineWidth=1;for(let i=0;i<=16;i++){const x=X(i*.1);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ch);ctx.stroke();}for(let j=0;j<=10;j++){const y=Y(j*.1);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cw,y);ctx.stroke();}if(!MOTION){ctx.restore();return;}ctx.strokeStyle=hex2rgba(theme.ship,.07);ctx.lineWidth=1;for(let i=0;i<9;i++){const y=Y(.05+i*.11)+Math.sin(t*.9+i)*4;ctx.beginPath();for(let x=0;x<=X(W.quayX);x+=18){ctx.lineTo(x,y+Math.sin(x/70+t*1.4+i*.7)*3);}ctx.stroke();}ctx.restore();};
window.__fxOverlay=function(ctx,o){const {X,Y,S,t,theme,s,hex2rgba,shipPos,berthById,yardById,W:w,pulse}=o;
  /* conflict chain: the system sees the whole chain */
  if(s.conflict&&!s.appliedPlan&&s.decided!=='overruled'){const sh=shipById('S5');const p=shipPos(sh);const b2=berthById('B2');const y14=yardById('Y14');const pts=[[X(p.x),Y(p.y)],[X(w.quayX)-S(.03),Y((b2.y0+b2.y1)/2)],[X(y14.x)+S(y14.w)/2,Y(y14.y)+S(y14.h)/3.2],[X(w.gate.x+w.gate.w)+S(.045),Y(w.lanes[2].y)]];
    ctx.save();ctx.setLineDash([3,7]);ctx.lineDashOffset=MOTION?-(t*40)%10:0;ctx.shadowColor=hex2rgba(theme.conflict,.6);ctx.shadowBlur=8;ctx.strokeStyle=hex2rgba(theme.conflict,.8);ctx.lineWidth=1.6;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;
    if(MOTION){const seg=(t*.35)%3;const i=Math.floor(seg),f=seg-i;const a=pts[i],b=pts[Math.min(3,i+1)];const lx=lerp(a[0],b[0],f),ly=lerp(a[1],b[1],f);const g=ctx.createRadialGradient(lx,ly,0,lx,ly,14);g.addColorStop(0,hex2rgba(theme.conflict,.9));g.addColorStop(1,hex2rgba(theme.conflict,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,14,0,7);ctx.fill();}
    ctx.restore();}
  /* agent walk: light travels from the assistant's current highlight set */
  if(s.guided==='walking'&&s.highlight&&s.highlight.size&&MOTION){const keys=[...s.highlight];const pos=k=>{const [ty,id]=k.split(':');if(ty==='ship'){const q=shipPos(shipById(id));return q&&[X(q.x),Y(q.y)];}if(ty==='berth'){const b=berthById(id);return [X(w.quayX)-S(.02),Y((b.y0+b.y1)/2)];}if(ty==='yard'){const y=yardById(id);return [X(y.x)+S(y.w)/2,Y(y.y)+S(y.h)/3.2];}if(ty==='lane'){return [X(w.gate.x+w.gate.w)+S(.045),Y(w.lanes[+id.slice(1)-1].y)];}if(ty==='declaration'){const y=yardById('Y14');return [X(y.x)+S(y.w)/2,Y(y.y)+S(y.h)/3.2];}return null;};
    keys.forEach(k=>{const q=pos(k);if(!q)return;const r=18+10*pulse(t,1.2);ctx.strokeStyle=hex2rgba(theme.text,.9);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(q[0],q[1],r,0,7);ctx.stroke();ctx.strokeStyle=hex2rgba(theme.text,.25);ctx.beginPath();ctx.arc(q[0],q[1],r+10,0,7);ctx.stroke();});}
  if(MOTION){ships.forEach((sh,i)=>{if(sh.status!=='inbound'&&sh.status!=='outbound')return;const q=shipPos(sh);if(!q)return;const f=((t*.5)+i*.23)%1;ctx.strokeStyle=hex2rgba(theme.ship,.5*(1-f));ctx.lineWidth=1;ctx.beginPath();ctx.arc(X(q.x),Y(q.y),6+f*22,0,7);ctx.stroke();});}
  /* crane lifts: containers moving between crane and yard */
  if(MOTION){w.cranes.forEach((c,i)=>{const working=ships.some(sh=>sh.status==='berthed'&&sh.berth===c.berth&&sh.containersLeft>0);if(!working)return;const f=((t*1.1)+i*.37)%1;const x0=X(w.quayX+.028),y0=Y(c.y);const x1=X(.50+ (i%4)*.07)+S(.03),y1=Y(.20+Math.floor(i/2)*.104)+S(.04)/1.6;const x=lerp(x0,x1,f),y=lerp(y0,y1,f)-Math.sin(f*Math.PI)*10;ctx.fillStyle=hex2rgba(theme.container,.9);ctx.fillRect(x-3,y-2,6,4);});}
  /* approval sweep */
  if(s.approvedAt!=null&&t-s.approvedAt<3){const k=(t-s.approvedAt)/3;const b1=berthById('B1');const x=X(w.quayX)-S(.02),y=Y((b1.y0+b1.y1)/2);ctx.strokeStyle=hex2rgba(theme.resolved,1-k);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,20+k*160,0,7);ctx.stroke();}
};

/* ===== graph FX: particles along edges, node bloom ===== */
window.__graphFX=function(gx,o){if(!MOTION)return;const {nodes,links,gw,gh,now,s,cssVar}=o;links.forEach((l,i)=>{const a=nodes[l.a],b=nodes[l.b];if(a.mergedInto||b.mergedInto||now<a.born||now<b.born)return;const f=((now/2600)+i*.13)%1;const x=lerp(a.x,b.x,f)*gw,y=lerp(a.y,b.y,f)*gh;const hlk=s.highlight.has(a.id)||s.highlight.has(b.id);gx.fillStyle=hlk?cssVar('--text'):cssVar('--ent-'+b.type);gx.globalAlpha=hlk?.9:.45;gx.beginPath();gx.arc(x,y,1.6,0,7);gx.fill();});gx.globalAlpha=1;
  nodes.forEach(n=>{const age=now-n.born;if(age>0&&age<700&&!n.mergedInto){const k=age/700;gx.strokeStyle=cssVar('--ent-'+n.type);gx.globalAlpha=1-k;gx.lineWidth=1.5;gx.beginPath();gx.arc(n.x*gw,n.y*gh,6+k*22,0,7);gx.stroke();}});gx.globalAlpha=1;};


/* ===== Ripple / CornerRipple (skill component; canvas approximation of the p5.js sketch, MAX_RIPPLES 32, cursor-driven) ===== */
(function(){const MAX=32;const PAL={'hll-ontology':['#7455FF','#FFB26A'],'hll-ai':['#3773FF','#BCA6D6'],'hll-trust':['#129562','#7CBAAA'],'hll-foundation':['#FF5A1E','#CC8B93'],'hll-people':['#FF9042','#FFEEC7']};
  const mix=(a,b,t)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const A=p(a),B=p(b);return A.map((v,i)=>Math.round(lerp(v,B[i],t)));};
  $$('canvas.ripple').forEach(cv=>{const cx=cv.getContext('2d');const host=cv.parentElement;const stops=PAL[cv.dataset.variant]||PAL['hll-ontology'];const corner=cv.dataset.origin==='corner';let w=0,h=0,d=1,ripples=[],last=0;const mob=isMobile();
    const dark=()=>document.documentElement.dataset.theme==='dark';
    function spawn(x,y,amp){if(ripples.length>=MAX)ripples.shift();ripples.push({x,y,r:0,amp,born:performance.now()});}
    host.addEventListener('pointermove',e=>{if(mob||!MOTION)return;const now=performance.now();if(now-last<900)return;last=now;const r=cv.getBoundingClientRect();spawn(e.clientX-r.left,e.clientY-r.top,.42);});
    function draw(now){const r=cv.getBoundingClientRect();if(r.width<10){requestAnimationFrame(draw);return;}d=Math.min(1.5,devicePixelRatio||1);if(cv.width!==(r.width*d|0)){cv.width=r.width*d;cv.height=r.height*d;w=r.width;h=r.height;}cx.setTransform(d,0,0,d,0,0);cx.clearRect(0,0,w,h);
      const ox=corner?w*.98:w*.72,oy=corner?h*.02:h*.38;
      if(MOTION&&(ripples.length===0||now-ripples[ripples.length-1].born>(mob?7000:4200)))spawn(ox+(Math.random()-.5)*w*.18,oy+(Math.random()-.5)*h*.18,1);
      const bands=mob?5:9;cx.lineWidth=1.2;
      ripples=ripples.filter(rp=>now-rp.born<17000);
      ripples.forEach(rp=>{const age=(now-rp.born)/17000;const R=Math.pow(age,.72)*Math.max(w,h)*.95;for(let i=0;i<bands;i++){const rr=R-i*34;if(rr<=0)continue;const t=(i/(bands-1));const c=mix(stops[0],stops[1],(t+age*.35)%1);const a=Math.sin(Math.min(1,age)*Math.PI)*(1-i/bands)*(dark()?.2:.22)*rp.amp;cx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`;cx.beginPath();cx.arc(rp.x,rp.y,rr,0,7);cx.stroke();}});
      /* soft colour field at the origin (the ripple mesh's saturated core) */
      const g=cx.createRadialGradient(ox,oy,0,ox,oy,Math.max(w,h)*.55);const c0=mix(stops[0],stops[1],.2),c1=mix(stops[0],stops[1],.8);g.addColorStop(0,`rgba(${c0[0]},${c0[1]},${c0[2]},${dark()?.18:.2})`);g.addColorStop(.5,`rgba(${c1[0]},${c1[1]},${c1[2]},${dark()?.08:.1})`);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(0,0,w,h);
      requestAnimationFrame(draw);}
    requestAnimationFrame(draw);});})();

/* ===== cursor lens over the map (desktop only) ===== */
(function(){if(isMobile()||!MOTION)return;const wrap=$('#mapWrap');const lens=document.createElement('div');lens.className='lens';wrap.appendChild(lens);wrap.addEventListener('pointermove',e=>{const r=wrap.getBoundingClientRect();lens.style.left=(e.clientX-r.left)+'px';lens.style.top=(e.clientY-r.top)+'px';lens.classList.add('on');});wrap.addEventListener('pointerleave',()=>lens.classList.remove('on'));})();
})();
