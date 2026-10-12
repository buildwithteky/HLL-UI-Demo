// Ported verbatim from the reference deck's workbench script (deck-only code removed).

(function(){
'use strict';
const C=window.__core, {store,W,ships,trucks,shipById,berthById,yardById,cssVar,clamp,lerp,REDUCED,isMobile}=C;
const canvas=document.getElementById('mapCanvas'), wrap=document.getElementById('mapWrap');
const ctx=canvas.getContext('2d');
let cw=0,ch=0,dpr=1, hits=[], theme={}, frame=0;
function readTheme(){theme={yardA:parseFloat(cssVar('--yard-a'))||.3,water:cssVar('--water'),land:cssVar('--land'),apron:cssVar('--apron'),line:cssVar('--chart-line'),text:cssVar('--text'),text2:cssVar('--text-2'),text3:cssVar('--text-3'),bg:cssVar('--bg'),
  ship:cssVar('--ent-ship'),berth:cssVar('--ent-berth'),crane:cssVar('--ent-crane'),container:cssVar('--ent-container'),truck:cssVar('--ent-truck'),customs:cssVar('--ent-customs'),terminal:cssVar('--ent-terminal'),
  watch:cssVar('--st-watch'),conflict:cssVar('--st-conflict'),resolved:cssVar('--st-resolved'),
  stg:{anchor:cssVar('--stg-anchor'),berthwait:cssVar('--stg-berthwait'),crane:cssVar('--stg-crane'),yard:cssVar('--stg-yard'),gate:cssVar('--stg-gate'),customs:cssVar('--stg-customs')}};}
readTheme();
store.sub(s=>{if(s.theme!==theme._t){theme._t=s.theme;readTheme();}});
function resize(){const r=wrap.getBoundingClientRect();const w=Math.max(200,r.width|0),h=Math.max(160,r.height|0);if(w===cw&&h===ch)return;cw=w;ch=h;dpr=Math.min(2,devicePixelRatio||1);canvas.width=cw*dpr;canvas.height=ch*dpr;}
new ResizeObserver(resize).observe(wrap);resize();
/* map space is 1.6:1; letterbox into the canvas */
let sc=1,ox=0,oy=0;
function fit(){const aspect=1.6;let w=cw,h=cw/aspect;if(h>ch){h=ch;w=ch*aspect;}sc=w;ox=(cw-w)/2;oy=(ch-h)/2;}
const X=x=>ox+x*sc, Y=y=>oy+y*sc/1.6, S=v=>v*sc;
const hex2rgba=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;};
const pulse=(t,period=1.4)=>REDUCED?1:(.5+.5*Math.sin(t*Math.PI*2/period));
function label(txt,x,y,color,size=10,align='left'){ctx.font=`${size}px "Sometype Mono",ui-monospace,monospace`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(txt.toUpperCase(),x,y);}

function channelPoint(p,off=0){ /* p in 0..1 along the channel toward the quay; <0 places the ship in the offshore band, still on the map */
  const pts=W.channel;if(p<=0){const t=clamp(-p,0,3)/3;return{x:.045+t*.05+off*.5,y:.80-t*.22-off};}
  const f=clamp(p,0,1)*(pts.length-1);const i=Math.min(pts.length-2,Math.floor(f));const t=f-i;return{x:lerp(pts[i].x,pts[i+1].x,t),y:lerp(pts[i].y,pts[i+1].y,t)};
}
function shipPos(sh){
  if(sh.status==='berthed'){const b=berthById(sh.berth);return{x:W.quayX-.018,y:(b.y0+b.y1)/2};}
  if(sh.status==='waiting')return{x:W.anchorage.x+sh.ax,y:W.anchorage.y+sh.ay};
  if(sh.status==='inbound'||sh.status==='outbound'){const off=sh.status==='inbound'?((sh.id.charCodeAt(1)*7)%5)*.022:0;const p=channelPoint(sh.progress,off);if(sh.status==='inbound'&&sh.progress>.92&&sh.berth){const b=berthById(sh.berth);const t=(sh.progress-.92)/.08;return{x:lerp(p.x,W.quayX-.018,t),y:lerp(p.y,(b.y0+b.y1)/2,t)};}return p;}
  return null;
}
const zoneOf={anchorage:'anchor',quay:'berthwait',cranes:'crane',yard:'yard',gate:'gate',inspection:'customs'};
function zoneAlpha(zoneKey,s){if(!s.zone)return 1;const map={anchor:['anchorage'],berthwait:['quay'],crane:['cranes','quay'],yard:['yard'],gate:['gate','lanes'],customs:['inspection','Y14']};const on=map[s.zone]||[];return on.includes(zoneKey)?1:.28;}
function hl(key,s){return s.highlight&&s.highlight.has(key);}

function draw(){
  frame++;resize();fit();
  const s=store.state,t=s.sim;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,ch);
  ctx.fillStyle=theme.water;ctx.fillRect(0,0,cw,ch);
  if(window.__fxWater)window.__fxWater(ctx,{X,Y,S,cw,ch,sc,t,theme,s,hex2rgba});
  /* depth contours */
  ctx.strokeStyle=hex2rgba(theme.line,.35);ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(X(.42),Y(.5),S(.16+i*.09),Math.PI*.55,Math.PI*1.45);ctx.stroke();}
  /* land */
  ctx.fillStyle=theme.land;ctx.beginPath();ctx.moveTo(X(W.quayX),0);ctx.lineTo(cw,0);ctx.lineTo(cw,ch);ctx.lineTo(X(.30),ch);ctx.lineTo(X(.40),Y(.90));ctx.lineTo(X(W.quayX),Y(.86));ctx.closePath();ctx.fill();
  const dense=sc<640; /* narrow map: fewer minor labels */
  /* apron */
  ctx.globalAlpha=zoneAlpha('quay',s);ctx.fillStyle=theme.apron;ctx.fillRect(X(W.quayX),Y(.17),S(.06),S(.68)/1.6);ctx.globalAlpha=1;
  /* breakwater */
  ctx.strokeStyle=theme.terminal;ctx.lineWidth=Math.max(2,S(.006));ctx.lineCap='round';ctx.beginPath();W.breakwater.forEach((p,i)=>i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)));ctx.stroke();ctx.lineCap='butt';
  if(!dense)label('Breakwater',X(.20),Y(.14),theme.text3,9);
  /* channel */
  ctx.setLineDash([6,8]);ctx.strokeStyle=hex2rgba(theme.ship,.55);ctx.lineWidth=1.2;ctx.beginPath();W.channel.forEach((p,i)=>i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)));ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<W.channel.length-1;i++){const p=channelPoint(i/(W.channel.length-1));ctx.fillStyle=theme.ship;ctx.beginPath();ctx.arc(X(p.x)+7,Y(p.y),2,0,7);ctx.fill();ctx.beginPath();ctx.arc(X(p.x)-7,Y(p.y),2,0,7);ctx.fill();}
  if(!dense)label('Approach channel',X(.08),Y(.86),theme.text3,9);
  /* anchorage */
  ctx.globalAlpha=zoneAlpha('anchorage',s);ctx.setLineDash([4,6]);ctx.strokeStyle=hex2rgba(theme.stg.anchor,.9);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(X(W.anchorage.x),Y(W.anchorage.y),S(W.anchorage.r),0,7);ctx.stroke();ctx.setLineDash([]);
  if(!REDUCED){const sweep=(t*1.3)%(Math.PI*2);ctx.strokeStyle=hex2rgba(theme.stg.anchor,.35);ctx.beginPath();ctx.moveTo(X(W.anchorage.x),Y(W.anchorage.y));ctx.lineTo(X(W.anchorage.x)+Math.cos(sweep)*S(W.anchorage.r),Y(W.anchorage.y)+Math.sin(sweep)*S(W.anchorage.r));ctx.stroke();}
  label('Waiting area',X(W.anchorage.x),Y(W.anchorage.y-W.anchorage.r-.03),theme.text2,9,'center');ctx.globalAlpha=1;
  hits.length=0;hits.push({type:'zone',id:'anchorage',x:X(W.anchorage.x),y:Y(W.anchorage.y),r:S(W.anchorage.r),shape:'c'});
  /* pilot and tug base */
  ctx.fillStyle=theme.terminal;ctx.beginPath();ctx.moveTo(X(W.pilot.x),Y(W.pilot.y)-6);ctx.lineTo(X(W.pilot.x)+6,Y(W.pilot.y)+5);ctx.lineTo(X(W.pilot.x)-6,Y(W.pilot.y)+5);ctx.closePath();ctx.fill();if(!dense)label('Pilot boarding',X(W.pilot.x)+10,Y(W.pilot.y),theme.text3,9);
  ctx.fillRect(X(W.tug.x)-6,Y(W.tug.y)-4,12,8);if(!dense)label('Tug base',X(W.tug.x)+10,Y(W.tug.y),theme.text3,9);
  /* berths */
  W.berths.forEach(b=>{const y0=Y(b.y0),y1=Y(b.y1),x=X(W.quayX);const occ=ships.find(sh=>sh.status==='berthed'&&sh.berth===b.id);const conflict=s.conflict&&!s.appliedPlan&&b.id==='B2'&&s.decided!=='overruled'&&s.decided!=='approved';
    ctx.globalAlpha=zoneAlpha('quay',s);ctx.strokeStyle=hl('berth:'+b.id,s)?theme.text:theme.berth;ctx.lineWidth=hl('berth:'+b.id,s)?3:2;ctx.beginPath();ctx.moveTo(x,y0+3);ctx.lineTo(x,y1-3);ctx.stroke();
    if(conflict){ctx.fillStyle=hex2rgba(theme.watch,.25+.25*pulse(t));ctx.fillRect(x-S(.03),y0,S(.03),y1-y0);}
    if(s.ghosts&&!s.appliedPlan&&b.id==='B1'){ctx.setLineDash([5,5]);ctx.strokeStyle=theme.text;ctx.lineWidth=1.5;ctx.strokeRect(x-S(.03),y0+4,S(.028),y1-y0-8);ctx.setLineDash([]);label('Proposed: Cedar Horizon',x-S(.034),y0-8,theme.text,9,'right');}
    label(b.name,x+S(.012),y0+9,theme.text2,8);if(occ)label(occ.name,x-S(.03),(y0+y1)/2,theme.text2,9,'right');else label('Free',x+S(.012),y1-9,theme.text3,8);ctx.globalAlpha=1;
    hits.push({type:'berth',id:b.id,x:x-S(.035),y:y0,w:S(.04),h:y1-y0,shape:'r'});
  });
  if(!dense)label('Quay',X(W.quayX)+S(.012),Y(.16),theme.text3,9);
  /* cranes */
  W.cranes.forEach(c=>{const x=X(W.quayX+.028),y=Y(c.y);const working=ships.some(sh=>sh.status==='berthed'&&sh.berth===c.berth&&sh.containersLeft>0);ctx.globalAlpha=zoneAlpha('cranes',s);ctx.fillStyle=hl('crane:'+c.id,s)?theme.text:theme.crane;ctx.fillRect(x-4,y-4,8,8);ctx.strokeStyle=hex2rgba(theme.crane,.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-S(.03)+(working&&!REDUCED?Math.sin(t*3+c.y*40)*3:0),y);ctx.stroke();ctx.globalAlpha=1;hits.push({type:'crane',id:c.id,x,y,r:10,shape:'c'});});
  /* yard blocks */
  W.yard.forEach(b=>{const x=X(b.x),y=Y(b.y),w=S(b.w),h=S(b.h)/1.6;const held=!!s.holds[b.id]&&!s.holdEscalated;const esc=b.id==='Y14'&&s.holdEscalated;ctx.globalAlpha=zoneAlpha(b.id==='Y14'?'Y14':'yard',s);
    ctx.fillStyle=hex2rgba(theme.container,held?theme.yardA*.6:theme.yardA);ctx.fillRect(x,y,w,h);ctx.strokeStyle=hl('yard:'+b.id,s)?theme.text:hex2rgba(theme.container,.55);ctx.lineWidth=hl('yard:'+b.id,s)?2:1;ctx.strokeRect(x,y,w,h);
    for(let i=1;i<4;i++){ctx.strokeStyle=hex2rgba(theme.container,.25);ctx.beginPath();ctx.moveTo(x+w*i/4,y);ctx.lineTo(x+w*i/4,y+h);ctx.stroke();}
    if(held){ctx.strokeStyle=hex2rgba(theme.conflict,.5+.5*pulse(t));ctx.lineWidth=2;ctx.strokeRect(x-1,y-1,w+2,h+2);}
    if(esc){ctx.strokeStyle=hex2rgba(theme.watch,.8);ctx.lineWidth=2;ctx.strokeRect(x-1,y-1,w+2,h+2);}
    if(s.ghosts&&!s.appliedPlan&&b.id==='Y14'){ctx.setLineDash([4,4]);ctx.strokeStyle=theme.text;ctx.strokeRect(x-3,y-3,w+6,h+6);ctx.setLineDash([]);}
    if(!dense||held||esc)label(b.id,x+3,y+h-7,held||esc?theme.text:theme.text3,8);ctx.globalAlpha=1;hits.push({type:'yard',id:b.id,x,y,w,h,shape:'r'});});
  if(!dense)label('Container yard',X(.50),Y(.175),theme.text3,9);
  /* inspection */
  {const i=W.inspection,x=X(i.x),y=Y(i.y),w=S(i.w),h=S(i.h)/1.6;ctx.globalAlpha=zoneAlpha('inspection',s);ctx.strokeStyle=theme.customs;ctx.setLineDash([3,4]);ctx.lineWidth=1.2;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);if(!dense)label('Customs inspection',x,y-8,theme.text3,8);ctx.globalAlpha=1;hits.push({type:'inspection',id:'I',x,y,w,h,shape:'r'});}
  /* gate and lanes */
  {const g=W.gate,x=X(g.x),y=Y(g.y),w=S(g.w),h=S(g.h)/1.6;ctx.globalAlpha=zoneAlpha('gate',s);ctx.fillStyle=hex2rgba(theme.terminal,.25);ctx.fillRect(x,y,w,h);ctx.strokeStyle=hl('gate:G',s)?theme.text:theme.terminal;ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);label('Gate',x+w/2,y-8,theme.text2,9,'center');hits.push({type:'gate',id:'G',x,y,w,h,shape:'r'});
    W.lanes.forEach((ln,i)=>{const ly=Y(ln.y);ctx.strokeStyle=hex2rgba(theme.terminal,.6);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+w,ly);ctx.lineTo(X(1.0),ly);ctx.stroke();ctx.beginPath();ctx.moveTo(X(.78),ly);ctx.lineTo(x,ly);ctx.stroke();
      const q=s.laneQueue[i];const bunch=i===2&&q>6;if(bunch){ctx.fillStyle=hex2rgba(theme.conflict,.18+.2*pulse(t));ctx.fillRect(x+w,ly-9,S(.09),18);}
      if(s.ghosts&&!s.appliedPlan&&i===2){ctx.setLineDash([4,4]);ctx.strokeStyle=theme.text;ctx.strokeRect(x+w,ly-11,S(.09),22);ctx.setLineDash([]);}
      label('Lane '+(i+1)+(bunch?'  '+Math.round(q)+' queued':''),X(.945),ly-12,bunch?theme.conflict:theme.text3,8);
      hits.push({type:'lane',id:ln.id,x:x+w,y:ly-10,w:S(.09),h:20,shape:'r'});});
    /* trucks */
    trucks.forEach(tr=>{const ln=W.lanes[tr.lane];const ly=Y(ln.y);let px;if(tr.t<.5){px=lerp(X(1.0),x+w,tr.t*2);}else{px=lerp(x,X(.78),(tr.t-.5)*2);}
      const bunch=tr.lane===2&&s.laneQueue[2]>6&&!s.appliedPlan&&tr.t<.5;if(bunch){px=lerp(X(1.0),x+w,Math.min(tr.t*2,.9));}
      ctx.fillStyle=hl('truck:'+tr.id,s)?theme.text:theme.truck;ctx.fillRect(px-3,ly-2,6,4);hits.push({type:'truck',id:tr.id,x:px,y:ly,r:9,shape:'c'});});
    if(!dense)label('Road out',X(.955),Y(.25),theme.text3,9);ctx.globalAlpha=1;}
  /* ships */
  ships.forEach(sh=>{const p=shipPos(sh);if(!p)return;const x=X(p.x),y=Y(p.y);const key='ship:'+sh.id;const isHl=hl(key,s);
    const conflict=sh.slipped&&!s.appliedPlan&&s.decided!=='overruled';const watch=!!s.watch[sh.id];const res=s.resolvedFlash[sh.id]!=null&&t-s.resolvedFlash[sh.id]<40;
    ctx.globalAlpha=sh.status==='waiting'?zoneAlpha('anchorage',s):1;
    if(sh.status==='berthed'){const b=berthById(sh.berth);const len=(Y(b.y1)-Y(b.y0))*.78;ctx.fillStyle=isHl?theme.text:theme.ship;ctx.beginPath();ctx.roundRect(x-S(.011),y-len/2,S(.022),len,S(.008));ctx.fill();}
    else{ /* moving or waiting: chevron with trail */
      if(sh.status!=='waiting'&&!REDUCED&&sh.progress>0){for(let i=1;i<=5;i++){const q=channelPoint(sh.progress-(sh.status==='inbound'?.03:-.03)*i);ctx.fillStyle=hex2rgba(theme.ship,.35-.06*i);ctx.beginPath();ctx.arc(X(q.x),Y(q.y),3-i*.4,0,7);ctx.fill();}}
      ctx.fillStyle=isHl?theme.text:theme.ship;ctx.beginPath();ctx.moveTo(x+7,y);ctx.lineTo(x-5,y-5);ctx.lineTo(x-2,y);ctx.lineTo(x-5,y+5);ctx.closePath();ctx.fill();}
    if(conflict){ctx.strokeStyle=hex2rgba(theme.conflict,.9);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10+8*pulse(t),0,7);ctx.stroke();ctx.strokeStyle=hex2rgba(theme.conflict,.35);ctx.beginPath();ctx.arc(x,y,16+12*pulse(t,1.9),0,7);ctx.stroke();}
    else if(watch){ctx.strokeStyle=hex2rgba(theme.watch,.9);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10+5*pulse(t,2),0,7);ctx.stroke();}
    else if(res){ctx.strokeStyle=hex2rgba(theme.resolved,.8*(1-(t-s.resolvedFlash[sh.id])/40));ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,12,0,7);ctx.stroke();}
    if(sh.status!=='berthed'){label(sh.name+(sh.slipped&&!s.appliedPlan?'  +3H':''),x+12,y-10,conflict?theme.conflict:watch?theme.watch:theme.text2,9);}
    ctx.globalAlpha=1;hits.push({type:'ship',id:sh.id,x,y,r:14,shape:'c'});});
  if(window.__fxOverlay)window.__fxOverlay(ctx,{X,Y,S,cw,ch,sc,t,theme,s,hex2rgba,shipPos,berthById,yardById:C.yardById,W,pulse});
  /* compass and scale */
  {const cx=X(.06),cy=Y(.10);ctx.strokeStyle=theme.text3;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx.stroke();ctx.fillStyle=theme.text;ctx.beginPath();ctx.moveTo(cx,cy-12);ctx.lineTo(cx+4,cy);ctx.lineTo(cx-4,cy);ctx.closePath();ctx.fill();label('N',cx,cy-20,theme.text2,9,'center');
    const sx=X(.02),sy=Y(.96);ctx.strokeStyle=theme.text2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+S(.08),sy);ctx.stroke();ctx.beginPath();ctx.moveTo(sx,sy-4);ctx.lineTo(sx,sy+4);ctx.moveTo(sx+S(.08),sy-4);ctx.lineTo(sx+S(.08),sy+4);ctx.stroke();if(!dense)label('500 m (synthetic)',sx+S(.09),sy,theme.text3,8);}
  positionCallout(s);
  requestAnimationFrame(draw);
}
/* hit-testing with padding so mobile targets reach 44px */
function hitAt(px,py){const pad=isMobile()?14:8;let best=null,bd=1e9;for(const h of hits){let d;if(h.shape==='c'){d=Math.hypot(px-h.x,py-h.y)-h.r;}else{const dx=Math.max(h.x-px,0,px-(h.x+h.w)),dy=Math.max(h.y-py,0,py-(h.y+h.h));d=Math.hypot(dx,dy);}if(d<=pad&&d<bd){bd=d;best=h;}}return best;}
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();const h=hitAt(e.clientX-r.left,e.clientY-r.top);if(h){if(h.type==='zone'){store.set({zone:'anchor',highlight:new Set()});window.__openRecord({type:'zone',id:'anchorage'});}else C.selectEntity({type:h.type,id:h.id});}else{store.set({highlight:new Set(),zone:null});}});
canvas.style.cursor='crosshair';
/* callout for the guided path */
const callout=document.getElementById('callout');
function positionCallout(s){if(s.guided!=='callout'){callout.classList.remove('on');return;}const sh=shipById('S5');const p=shipPos(sh);if(!p){callout.classList.remove('on');return;}callout.classList.add('on');const cx=clamp(X(p.x),120,cw-120),cy=clamp(Y(p.y),110,ch-20);callout.style.left=cx+'px';callout.style.top=cy+'px';document.getElementById('calloutTxt').textContent='Cedar Horizon slipped three hours. Berth 2 now collides.';}
window.__focusConflict=()=>{store.set({highlight:new Set(['ship:S5','berth:B2','yard:Y14'])});setTimeout(()=>store.set({highlight:new Set()}),2600);};
window.__shipPos=shipPos;window.__mapXY=(x,y)=>[X(x),Y(y)];window.__mapCanvas=canvas;

/* ============ berth timeline (bottom strip) ============ */
const tl=document.getElementById('tlCanvas'), tctx=tl.getContext('2d');
function drawTL(){const r=tl.getBoundingClientRect();const w=r.width|0,h=r.height|0;if(w<10||h<10){requestAnimationFrame(drawTL);return;}const d=Math.min(2,devicePixelRatio||1);if(tl.width!==w*d||tl.height!==h*d){tl.width=w*d;tl.height=h*d;}tctx.setTransform(d,0,0,d,0,0);tctx.clearRect(0,0,w,h);
  const s=store.state,t=s.sim;const left=isMobile()?54:110,right=w-12;const span=24*60;const px=m=>left+(right-left)*clamp((m-t+60)/span,0,1);const rowH=(h-8)/4;
  tctx.font='9px "Sometype Mono",ui-monospace,monospace';tctx.textBaseline='middle';
  for(let hh=0;hh<=24;hh+=4){const m=t-60+hh*60;const x=px(m);tctx.strokeStyle=hex2rgba(theme.line,.6);tctx.beginPath();tctx.moveTo(x,0);tctx.lineTo(x,h);tctx.stroke();tctx.fillStyle=theme.text3;tctx.textAlign='left';tctx.fillText(C.fmtClock(m),x+3,6);}
  const now=px(t);tctx.strokeStyle=theme.text;tctx.lineWidth=1.5;tctx.beginPath();tctx.moveTo(now,0);tctx.lineTo(now,h);tctx.stroke();
  W.berths.forEach((b,i)=>{const y=10+i*rowH;tctx.fillStyle=theme.text2;tctx.textAlign='left';tctx.fillText(isMobile()?b.id:b.name.toUpperCase(),6,y+rowH/2);
    ships.filter(sh=>sh.berth===b.id&&sh.status!=='departed').forEach(sh=>{let b0=sh.status==='berthed'?Math.max(t-60,sh.eta):sh.eta,b1=sh.etd;let berth=b.id;
      if(sh.id==='S5'&&(s.appliedPlan||(s.ghosts&&!s.appliedPlan))){/* proposed or applied move to B1 */if(b.id==='B2'&&s.appliedPlan)return;}
      const x0=px(b0),x1=px(b1);if(x1<=left)return;const conflict=sh.id==='S5'&&s.conflict&&!s.appliedPlan&&s.decided!=='overruled'&&b.id==='B2';
      tctx.fillStyle=hex2rgba(conflict?theme.watch:theme.berth,conflict?.5+.3*pulse(t):.55);if(sh.id==='S5'&&s.ghosts&&!s.appliedPlan&&b.id==='B2'){tctx.fillStyle=hex2rgba(theme.watch,.25);}
      tctx.fillRect(x0,y+3,Math.max(2,x1-x0),rowH-6);if(x1-x0>(isMobile()?70:40)){tctx.fillStyle=theme.text;tctx.fillText(sh.name.toUpperCase(),x0+4,y+rowH/2);}});
    if(b.id==='B1'&&s.conflict&&(s.ghosts||s.appliedPlan)&&s.decided!=='overruled'){const sh=shipById('S5');const x0=px(sh.eta),x1=px(sh.etd);if(s.appliedPlan){tctx.fillStyle=hex2rgba(theme.berth,.55);tctx.fillRect(x0,y+3,x1-x0,rowH-6);if(x1-x0>(isMobile()?70:40)){tctx.fillStyle=theme.text;tctx.fillText(sh.name.toUpperCase(),x0+4,y+rowH/2);}}else{tctx.setLineDash([4,4]);tctx.strokeStyle=theme.text;tctx.strokeRect(x0,y+3,x1-x0,rowH-6);tctx.setLineDash([]);tctx.fillStyle=theme.text2;tctx.fillText('PROPOSED: '+sh.name.toUpperCase(),x0+4,y+rowH/2);}}
  });
  requestAnimationFrame(drawTL);}
tl.addEventListener('click',e=>{const r=tl.getBoundingClientRect();const row=Math.floor(((e.clientY-r.top)-10)/((r.height-8)/4));if(row>=0&&row<4)C.selectEntity({type:'berth',id:W.berths[row].id});});
tl.style.cursor='pointer';
window.__startMap=()=>{requestAnimationFrame(draw);requestAnimationFrame(drawTL);};
})();
