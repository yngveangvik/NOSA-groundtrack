(async function(){
  'use strict';
  const $=id=>document.getElementById(id),C=OrbitCore,D=C.D;
  const COLORS={LEO:'#A2A2ED',HEO:'#7DE0FF',GEO:'#F0F0F0',selected:'#FC8C30',gray:'#A8A8A8'};
  const TYPES={LEO:'Low Earth orbit',HEO:'Highly elliptical orbit',GEO:'Geostationary orbit'};
  const stations=[['Svalbard',78.2297,15.4078],['Troll',-72.0167,2.5333],['Tromsø',69.6623,18.9413],['Vardø',70.3705,31.1107],['Grimstad',58.3405,8.5934],['Nuuk',64.1814,-51.6941],['Nittedal',60.1439,10.805],['Eik',58.5384,6.4672]].map(([name,lat,lon])=>({name,lat,lon}));
  const fmt=(n,d=0)=>n.toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d});
  const timeFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const dateFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
  const params=new URLSearchParams(location.search);
  const mill=lat=>1.25*Math.log(Math.tan(Math.PI/4+.4*lat*D)),millMax=mill(90);
  const inverseMill=y=>(Math.atan(Math.exp(.8*y))-Math.PI/4)*2.5/D;
  let fleet=[],coasts=[],active=null,filter='All',view=params.get('view')==='polar'?'polar':'world',station=stations.find(s=>s.name===params.get('station'))||stations[0];
  let live=true,paused=false,rate=1,time=Date.now(),anchorTime=time,anchorWall=Date.now(),tv=false;
  const intervals=[10,15,20,30,45,60];
  let rotationInterval=20000;
  try{const saved=Number(localStorage.getItem('norge-display-interval'));if(intervals.includes(saved))rotationInterval=saved*1000;}catch{}
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let outgoing=null,transitionStarted=0;
  let panelsOpen=false,autoRotate=true,rotationDeadline=0,lastRotationText='',labelObstacles=[];
  let showStations=true,showFootprint=false,pathsDirty=true,lastPathWall=0,pathTime=0,trackCache=new Map();
  let passWorker=null,requestId=0,passEvents=[],passFrom=0,passTo=0,lastPassWall=0,passTimer=0,passBusy=false;
  let receivedOnline=0,onlineCount=0,networkAttempt=0,networkBusy=false;
  let w=0,h=0,dpr=1,unitScale=1,rect={},hitTargets=[],lastUI=0,lastDraw=0,lastPassTextMinute=-1;
  const canvas=$('map'),ctx=canvas.getContext('2d'),base=document.createElement('canvas'),bctx=base.getContext('2d'),shade=document.createElement('canvas'),sctx=shade.getContext('2d');
  let baseDirty=true,lastShadeTime=-Infinity,lastShadeWall=0,shadeDirty=true,noticeTimer;
  const icon=new Image();icon.src='assets/satellite-solid.svg';icon.onload=()=>{tintedIcons.clear();};
  const tintedIcons=new Map();
  function notify(message){clearTimeout(noticeTimer);$('notice').textContent=message;$('notice').hidden=false;noticeTimer=setTimeout(()=>$('notice').hidden=true,4500);}
  function visibleFleet(){return fleet.filter(s=>filter==='All'||s.type===filter);}
  function rotationFleet(){return visibleFleet().filter(s=>s.record);}
  function resetRotation(now=performance.now()){rotationDeadline=now+rotationInterval;}
  function nextSatellite(now=performance.now()){
    const rows=rotationFleet();if(!rows.length)return;
    const index=rows.indexOf(active);select(rows[(index+1)%rows.length],{automatic:true});resetRotation(now);
  }
  function updateRotation(now){
    if(autoRotate&&now>=rotationDeadline&&!$('info').open)nextSatellite(now);

  }
  function setRotation(enabled){
    autoRotate=enabled;resetRotation();$('rotation').setAttribute('aria-pressed',String(enabled));$('rotation').textContent=enabled?'Pause switching':'Resume switching';$('rotation').setAttribute('aria-label',enabled?'Pause automatic switching':'Resume automatic switching');$('sat-strip').classList.toggle('rotation-off',!enabled);updateRotation(performance.now());
  }
  function setPanels(open){
    panelsOpen=open;document.body.classList.toggle('panels-open',open);
    for(const id of ['fleet-panel','detail-panel','controls-panel']){$(id).hidden=!open;$(id).inert=!open;}
    $('panel-toggle').setAttribute('aria-expanded',String(open));$('panel-toggle').setAttribute('aria-label',open?'Hide panels':'Show panels');$('panel-toggle').title=(open?'Hide panels':'Show panels')+' (M)';
    if(!open&&document.activeElement?.closest('.overlay'))$('panel-toggle').focus({preventScroll:true});
    updateLabelObstacles();
  }
  function updateLabelObstacles(){
    const origin=canvas.getBoundingClientRect();labelObstacles=[...document.querySelectorAll('.brand,.utc,.map-caption,#panel-toggle,#sat-strip,.overlay:not([hidden])')].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>({x:r.left-origin.left-6,y:r.top-origin.top-6,w:r.width+12,h:r.height+12}));
  }
  function currentTime(){if(live)return Date.now();return paused?anchorTime:anchorTime+(Date.now()-anchorWall)*rate;}
  function setTime(ms,{isLive=false,isPaused=paused,newRate=rate}={}){time=ms;anchorTime=ms;anchorWall=Date.now();live=isLive;paused=isPaused;rate=newRate;pathsDirty=true;shadeDirty=true;syncTimeControls();schedulePasses();}
  function syncTimeControls(){
    $('pause').textContent=paused?'Play':'Pause';$('pause').setAttribute('aria-pressed',String(paused));$('now').setAttribute('aria-pressed',String(live));$('rate').value=String(rate);
    const offset=Math.round((time-Date.now())/60000);$('time-offset').value=String(Math.max(-720,Math.min(720,offset)));$('time-offset').setAttribute('aria-valuetext',`${offset} minutes from now`);
    $('time-mode').textContent=live?'REAL TIME':paused?'PAUSE':`SIMULATED ${rate}×`;
    $('footer-summary').textContent=live?'Calculated from public orbital elements':`Simulated time · ${dateFormat.format(time)} ${timeFormat.format(time)} UTC`;
  }
  function accept(rows){
    let changed=false;
    for(const omm of rows){
      const s=fleet.find(s=>s.id===Number(omm.NORAD_CAT_ID));
      if(!s||!omm.EPOCH||!(omm.MEAN_MOTION>0)||!Number.isFinite(C.epoch(omm))||s.omm&&C.epoch(s.omm)>=C.epoch(omm))continue;
      try{const record=satellite.json2satrec(omm);if(!C.position(record,time))continue;s.omm=omm;s.record=record;changed=true;}catch{}
    }
    if(changed){pathsDirty=true;renderFleet();describe();schedulePasses();}
    return changed;
  }
  function renderFleet(){
    const list=$('fleet-list'),focused=list.contains(document.activeElement)?document.activeElement.dataset.satellite:null;list.replaceChildren();
    for(const type of ['LEO','HEO','GEO']){
      const group=visibleFleet().filter(s=>s.type===type);if(!group.length)continue;
      const section=document.createElement('section');section.className='fleet-group';const heading=document.createElement('h3');heading.textContent=type+' / '+TYPES[type];section.append(heading);
      for(const s of group){
        const b=document.createElement('button');b.className='sat-row'+(!s.record?' unavailable':'');b.style.setProperty('--sat-color',COLORS[s.type]);b.setAttribute('aria-pressed',String(s===active));b.dataset.satellite=String(s.id);
        const dot=document.createElement('i');dot.className='sat-dot';const name=document.createElement('span');name.textContent=s.name;b.append(dot,name);
        if(!s.record){const hint=document.createElement('small');hint.textContent=s.id===-2?'Ended':'No elements';b.append(hint);}
        b.onclick=()=>select(s);section.append(b);
      }
      list.append(section);
    }
    $('fleet-count').textContent=String(fleet.filter(s=>s.record).length);
    if(focused)list.querySelector('[data-satellite="'+focused+'"]')?.focus({preventScroll:true});
  }
  function select(s,{automatic=false}={}){if(active&&active!==s){outgoing=null;transitionStarted=performance.now();trackCache.clear();lastPathWall=0;if(!reducedMotion.matches)$('sat-strip').animate([{opacity:.25},{opacity:1}],{duration:650,easing:'ease-out'});}active=s;if(s.record)s.position=C.position(s.record,currentTime());pathsDirty=true;if(!automatic)resetRotation();renderFleet();describe();renderPasses();}
  function launchLabel(value){
    if(!value) return 'Unavailable';
    const launched = new Date(value);
    const today = new Date();
    const start = new Date(Date.UTC(launched.getUTCFullYear(), launched.getUTCMonth(), launched.getUTCDate()));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    let months = (end.getUTCFullYear()-start.getUTCFullYear())*12 + end.getUTCMonth()-start.getUTCMonth();
    function anniversary(offset){
      const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth()+offset+1, 0));
      date.setUTCDate(Math.min(date.getUTCDate(),start.getUTCDate()));
      return date;
    }
    if(anniversary(months)>end) months--;
    const days = Math.round((end-anniversary(months))/86400000);
    const elapsed = [[Math.floor(months/12),'year'],[months%12,'month'],[days,'day']].map(([n,u])=>n+' '+u+(n===1?'':'s')).join(', ');
    return dateFormat.format(launched)+(value.includes('T')?' · '+timeFormat.format(launched)+' UTC':'')+' ('+elapsed+' ago)';
  }
  function showProfile(s){
    const portrait=$('portrait');
    portrait.src=s.portrait || 'assets/satellite-alt.svg';
    portrait.alt=s.portrait ? s.name+' · '+s.portraitCredit : 'Satellite icon';
    portrait.title=portrait.alt;
    portrait.classList.toggle('fallback',!s.portrait);
    $('launch-date').textContent=launchLabel(s.launchDate);
    $('launch-site').textContent=s.launchSite;
    $('capabilities').replaceChildren(...s.capabilities.map(capability => {
      const row = document.createElement('li');
      row.textContent = capability;
      return row;
    }));
  }
  function describe(){
    if(!active)return;
    const s=active;$('sat-name').textContent=s.name;$('sat-type').textContent=s.type+' / '+TYPES[s.type];$('sat-mission').textContent=s.mission;
    $('strip-name').textContent=s.name;$('owner').textContent=s.owner;$('operator').textContent=s.operator;$('strip-mission').textContent=s.benefit||s.mission;
    showProfile(s);
    $('sat-source').href=s.source;$('sat-source').title=`Owner: ${s.owner}. Operator: ${s.operator}.`;
    $('norad').textContent=s.id>0?String(s.id):'–';
    $('inclination').textContent=s.omm?fmt(s.omm.INCLINATION,2)+'°':'–';$('period').textContent=s.omm?fmt(1440/s.omm.MEAN_MOTION,1)+' min':'–';
    $('epoch').textContent=s.omm?dateFormat.format(C.epoch(s.omm))+' · '+timeFormat.format(C.epoch(s.omm))+' UTC':'Orbital elements unavailable';
    const minutes=s.omm?1440/s.omm.MEAN_MOTION:0;
    $('track-window').textContent=!s.record?'No ground track':s.type==='GEO'?'Nearly stationary · ±12 h':`−${minutes>=120?fmt(minutes/60,1)+' h':fmt(minutes)+' min'} / +${minutes>=120?fmt(minutes*2/60,1)+' h':fmt(minutes*2)+' min'}`;
    updateReadout();
    updateLabelObstacles();
  }
  function updateReadout(){
    if(!active)return;const s=active,p=s.position;
    $('height').innerHTML=p?fmt(p.height)+' <small>km</small>':'–';$('speed').innerHTML=p?fmt(p.speed,2)+' <small>km/s</small>':'–';
    $('latitude').textContent=p?fmt(Math.abs(p.lat),2)+'° '+(p.lat<0?'S':'N'):'–';$('longitude').textContent=p?fmt(Math.abs(p.lon),2)+'° '+(p.lon<0?'W':'E'):'–';
    $('strip-height').innerHTML=$('height').innerHTML;$('strip-speed').innerHTML=$('speed').innerHTML;$('strip-latitude').textContent=$('latitude').textContent;$('strip-longitude').textContent=$('longitude').textContent;
    $('position-status').textContent=p?'SGP4 · '+(C.lightAt(C.solar(time),p.lat,p.lon)>=0?'Day at sub-satellite point':'Night at sub-satellite point'):s.id===-2?'Mission ended · unavailable on map':'Orbital elements unavailable';
    const age=s.omm?(Date.now()-C.epoch(s.omm))/3600000:0,simAge=s.omm?Math.abs(time-C.epoch(s.omm))/3600000:0;
    $('epoch-age').textContent=s.omm?(age>=0?`${age>=48?fmt(age/24,1)+' days':fmt(age,1)+' hours'} old`:'Epoch in the future')+(simAge>168?' · far from epoch':''):'–';
    $('strip-data').textContent='Calculated position · public orbital elements '+(s.omm?(age>=0?(age>=48?fmt(age/24,1)+' days':fmt(age,1)+' hours')+' old':'with future epoch'):'unavailable')+(simAge>168?' · far from epoch':'');
    updatePassSummary();
    $('epoch-age').style.color=s.omm&&(age>168||simAge>168)?COLORS.selected:'';
    const angles=C.look(p,station);$('elevation').textContent=angles?fmt(angles.elevation,1)+'°':'–';$('azimuth').textContent=angles?fmt(angles.azimuth,1)+'°':'–';
    const inView=angles&&angles.elevation>=10;$('visibility').textContent=!angles?'No prediction available':inView?'Within station visibility':'Outside station visibility';$('visibility').classList.toggle('in-view',!!inView);
    for(const el of mirrors) el.textContent=$(el.dataset.source).textContent;
    sidebarFit();
    const old=fleet.filter(s=>s.omm&&(Date.now()-C.epoch(s.omm)>7*86400000));$('data-mark').className='live-mark'+(old.length?' stale':receivedOnline?' fresh':'');
    $('data-status').textContent=old.length?'Older orbital elements':receivedOnline?'Orbital elements updated':'Cached orbital elements';
    $('data-detail').textContent=receivedOnline?`${onlineCount}/${fleet.filter(s=>s.record).length} retrieved · ${timeFormat.format(receivedOnline)} UTC`:'CelesTrak · checking for updates';
    if(networkAttempt&&!receivedOnline&&!networkBusy)$('data-detail').textContent='CelesTrak · online update unavailable';
  }
  function resize(){
    const box=canvas.getBoundingClientRect();w=box.width;h=box.height;dpr=Math.min(devicePixelRatio||1,2);unitScale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    base.width=canvas.width;base.height=canvas.height;bctx.setTransform(dpr,0,0,dpr,0,0);
    if(view==='world')rect={x:0,y:0,w,h};
    else{const radius=Math.max(1,Math.min(w,h)/2-18);rect={cx:w/2,cy:h/2,r:radius};}
    baseDirty=shadeDirty=true;updateLabelObstacles();
  }
  function project(lon,lat){if(view==='world')return {x:rect.x+(lon+180)/360*rect.w,y:rect.y+(millMax-mill(lat))/(2*millMax)*rect.h,visible:true};const radius=(90-lat)/60*rect.r;return {x:rect.cx+radius*Math.sin(lon*D),y:rect.cy+radius*Math.cos(lon*D),visible:lat>=30};}
  function unproject(x,y){if(view==='world')return {lat:inverseMill(millMax-(y-rect.y)/rect.h*2*millMax),lon:(x-rect.x)/rect.w*360-180};const dx=x-rect.cx,dy=y-rect.cy;return {lat:90-Math.hypot(dx,dy)/rect.r*60,lon:Math.atan2(dx,dy)/D};}
  function clip(c){c.beginPath();if(view==='world')c.rect(rect.x,rect.y,rect.w,rect.h);else c.arc(rect.cx,rect.cy,rect.r,0,Math.PI*2);c.clip();}
  function trace(c,points){
    let prev=null;
    for(const [lon,lat] of points){const p=project(lon,lat);if(!p.visible){prev=null;continue;}
      if(!prev)c.moveTo(p.x,p.y);
      else if(view==='world'&&Math.abs(lon-prev.lon)>180){
        const adjusted=lon+(lon>prev.lon?-360:360),edge=adjusted>prev.lon?180:-180,t=(edge-prev.lon)/(adjusted-prev.lon),midlat=prev.lat+(lat-prev.lat)*t;
        const end=project(edge,midlat),start=project(-edge,midlat);c.lineTo(end.x,end.y);c.moveTo(start.x,start.y);c.lineTo(p.x,p.y);
      }else c.lineTo(p.x,p.y);
      prev={lon,lat};
    }
  }
  function font(c,size=12){c.font=`400 ${size*unitScale}px "Suisse Intl"`;}
  function drawBase(){
    bctx.clearRect(0,0,w,h);bctx.save();clip(bctx);bctx.strokeStyle='#A8A8A8';bctx.globalAlpha=.40;bctx.lineWidth=.75;
    if(view==='world'){
      for(let lon=-180;lon<=180;lon+=30){const a=project(lon,90),b=project(lon,-90);bctx.beginPath();bctx.moveTo(a.x,a.y);bctx.lineTo(b.x,b.y);bctx.stroke();}
      for(let lat=-60;lat<=60;lat+=30){const a=project(-180,lat),b=project(180,lat);bctx.beginPath();bctx.moveTo(a.x,a.y);bctx.lineTo(b.x,b.y);bctx.stroke();}
    }else{
      for(let lat=30;lat<90;lat+=15){bctx.beginPath();bctx.arc(rect.cx,rect.cy,(90-lat)/60*rect.r,0,Math.PI*2);bctx.stroke();}
      for(let lon=-180;lon<180;lon+=30){const p=project(lon,30);bctx.beginPath();bctx.moveTo(rect.cx,rect.cy);bctx.lineTo(p.x,p.y);bctx.stroke();}
    }
    bctx.strokeStyle='#A8A8A8';bctx.globalAlpha=.72;bctx.lineWidth=.9;bctx.beginPath();for(const line of coasts)trace(bctx,line);bctx.stroke();bctx.restore();
    bctx.strokeStyle='#515151';bctx.globalAlpha=.5;bctx.lineWidth=.75;bctx.beginPath();if(view==='world')bctx.rect(rect.x,rect.y,rect.w,rect.h);else bctx.arc(rect.cx,rect.cy,rect.r,0,Math.PI*2);bctx.stroke();bctx.globalAlpha=.95;font(bctx,13);bctx.fillStyle='#A8A8A8';bctx.textAlign='center';
    if(view==='world'){
      bctx.textAlign='left';for(let lat=-60;lat<=60;lat+=30){const p=project(-180,lat);bctx.fillText(lat===0?'0°':Math.abs(lat)+'°'+(lat<0?'S':'N'),rect.x+12,p.y-7);}
      bctx.textAlign='center';for(let lon=-150;lon<=150;lon+=30){const p=project(lon,-90);bctx.fillText(lon===0?'0°':Math.abs(lon)+'°'+(lon<0?'W':'E'),p.x,h-14);bctx.beginPath();bctx.moveTo(p.x,h);bctx.lineTo(p.x,h-6);bctx.stroke();}
    }else{
      for(const lon of [0,90,180,-90]){const p=project(lon,25);bctx.fillText(lon===0?'0°':Math.abs(lon)+'°'+(lon<0?'W':'E'),p.x,p.y+4);}
      bctx.textAlign='left';for(const lat of [45,60,75]){const p=project(0,lat);bctx.fillText(lat+'°N',p.x+5,p.y-4);}
    }
    bctx.globalAlpha=1;baseDirty=false;
  }
  function drawShade(now){
    const sw=view==='world'?540:320,sh=view==='world'?270:320;if(shade.width!==sw||shade.height!==sh){shade.width=sw;shade.height=sh;}
    const image=sctx.createImageData(sw,sh),sun=C.solar(time),p=image.data;
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      let lat,lon;if(view==='world'){lat=inverseMill(millMax-(y+.5)/sh*2*millMax);lon=(x+.5)/sw*360-180;}else{const dx=(x+.5-sw/2)/(sw/2),dy=(y+.5-sh/2)/(sh/2),r=Math.hypot(dx,dy);if(r>1)continue;lat=90-r*60;lon=Math.atan2(dx,dy)/D;}
      const light=C.lightAt(sun,lat,lon),i=(y*sw+x)*4,day=Math.max(0,Math.min(1,(light+.065)/.13));p[i]=240;p[i+1]=240;p[i+2]=240;p[i+3]=Math.round(37*day);
    }
    sctx.putImageData(image,0,0);shadeDirty=false;lastShadeTime=time;lastShadeWall=now;
  }
  function buildTracks(now){
    trackCache.clear();for(const s of visibleFleet().filter(s=>s.record&&s===active)){
      const period=86400000/s.omm.MEAN_MOTION,past=s.type==='GEO'?43200000:period,future=s.type==='GEO'?43200000:period*2;
      const sample=(from,to,n)=>Array.from({length:n+1},(_,i)=>{const p=C.position(s.record,time+from+(to-from)*i/n);return p?[p.lon,p.lat]:null;}).filter(Boolean);
      trackCache.set(s.id,{past:sample(-past,0,150),future:sample(0,future,300)});
    }
    pathsDirty=false;pathTime=time;lastPathWall=now;
  }
  function drawTracks(now){
    const t=reducedMotion.matches?1:Math.max(0,Math.min(1,(now-transitionStarted)/850));
    function paint(paths,selectedId,opacity){
      for(const [id,points] of paths){const sat=fleet.find(s=>s.id===id);if(!sat)continue;const selected=id===selectedId;
        ctx.strokeStyle=selected?COLORS.selected:COLORS[sat.type];ctx.lineWidth=selected?1.55:.7;ctx.globalAlpha=(selected?.95:.13)*opacity;ctx.setLineDash([]);ctx.beginPath();trace(ctx,points.past);ctx.stroke();
        ctx.globalAlpha=(selected?.75:.09)*opacity;ctx.setLineDash([4,5]);ctx.beginPath();trace(ctx,points.future);ctx.stroke();
      }
    }
    ctx.save();clip(ctx);if(outgoing&&t<1)paint(outgoing.paths,outgoing.id,1-t);else outgoing=null;paint(trackCache,active?.id,outgoing?t:1);ctx.restore();
  }
  function getIcon(color){
    if(!icon.complete||!icon.naturalWidth)return null;if(tintedIcons.has(color))return tintedIcons.get(color);
    const c=document.createElement('canvas');c.width=48;c.height=48;const x=c.getContext('2d');x.drawImage(icon,0,0,48,48);x.globalCompositeOperation='source-in';x.fillStyle=color;x.fillRect(0,0,48,48);tintedIcons.set(color,c);return c;
  }
  function drawFootprint(){
    if(!showFootprint||!active?.position)return;const p=active.position,angle=C.footprint(p),points=Array.from({length:181},(_,i)=>C.destination(p.lat,p.lon,i*2,angle));ctx.save();clip(ctx);ctx.strokeStyle=COLORS.selected;ctx.globalAlpha=.45;ctx.lineWidth=.9;ctx.setLineDash([2,4]);ctx.beginPath();trace(ctx,points);ctx.stroke();ctx.restore();
  }
  function drawMarkers(now){
    hitTargets=[];const occupied=[...labelObstacles];const fs=unitScale;
    function label(text,p,color,isActive=false,entity=null){
      font(ctx,isActive?14:12);const width=ctx.measureText(text).width,height=(isActive?18:16)*fs;
      for(const [dx,dy] of [[12,-12],[12,16],[12,-30],[12,34],[-width-12,-12],[-width-12,18],[12,-48],[12,52]]){
        const x=Math.max(8,Math.min(w-width-8,p.x+dx*fs)),y=Math.max(height,Math.min(h-8,p.y+dy*fs));const box={x,y:y-height,w:width+5,h:height+2};
        if(occupied.some(b=>box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y))continue;
        occupied.push(box);ctx.strokeStyle='#000000';ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y);hitTargets.push({...box,entity});return;
      }
    }
    ctx.save();
    if(showStations){
      for(const s of stations){const p=project(s.lon,s.lat);if(!p.visible)continue;const selected=s===station;ctx.strokeStyle=selected?'#F0F0F0':'#A8A8A8';ctx.globalAlpha=selected?.95:.45;ctx.lineWidth=1;ctx.strokeRect(p.x-3,p.y-3,6,6);if(selected){ctx.strokeRect(p.x-6,p.y-6,12,12);label(s.name,p,'#F0F0F0');}hitTargets.push({x:p.x-8,y:p.y-8,w:16,h:16,station:s});}
    }
    const sats=visibleFleet().filter(s=>s.position).sort((a,b)=>(b===active)-(a===active));
    for(const s of sats){const p=project(s.position.lon,s.position.lat);if(!p.visible)continue;const selected=s===active,color=selected?COLORS.selected:"#F0F0F0",size=(selected?18:13)*fs;
      ctx.globalAlpha=1;if(selected){ctx.strokeStyle=color;ctx.globalAlpha=.8;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,size*.9,0,Math.PI*2);ctx.stroke();if(!reducedMotion.matches){const phase=(now%2400)/2400;ctx.globalAlpha=.65*(1-phase);ctx.beginPath();ctx.arc(p.x,p.y,size*(.9+phase*1.2),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
      const im=getIcon(color);if(im)ctx.drawImage(im,p.x-size/2,p.y-size/2,size,size);else{ctx.fillStyle=color;ctx.fillRect(p.x-3,p.y-3,6,6);}
      label(s.name,p,color,selected,s);hitTargets.push({x:p.x-12,y:p.y-12,w:24,h:24,entity:s});
    }
    ctx.restore();
  }
  function draw(now){
    if(!w||!h)return;if(baseDirty)drawBase();if((shadeDirty||Math.abs(time-lastShadeTime)>10000)&&now-lastShadeWall>250)drawShade(now);
    if((pathsDirty||Math.abs(time-pathTime)>30000)&&now-lastPathWall>300)buildTracks(now);
    ctx.clearRect(0,0,w,h);ctx.save();clip(ctx);if(view==='world')ctx.drawImage(shade,rect.x,rect.y,rect.w,rect.h);else ctx.drawImage(shade,rect.cx-rect.r,rect.cy-rect.r,rect.r*2,rect.r*2);ctx.restore();ctx.drawImage(base,0,0,w,h);drawTracks(now);drawFootprint();drawMarkers(now);
  }
  function schedulePasses(){clearTimeout(passTimer);passTimer=setTimeout(()=>{passTimer=0;requestPasses();},250);}
  function requestPasses(){
    if(!fleet.length)return;if(passWorker)passWorker.terminate();passEvents=[];passBusy=true;renderPasses();const rid=++requestId;lastPassWall=Date.now();
    try{
      passWorker=new Worker('passes-worker.js');passWorker.onmessage=({data})=>{if(data.requestId!==requestId)return;passEvents=data.events;passFrom=data.from;passTo=data.to;passBusy=false;renderPasses();updatePassSummary();};
      passWorker.onerror=()=>{passBusy=false;$('passes').innerHTML='<p class="empty-state">Pass calculation failed.<small>Reload to retry.</small></p>';};
      const rows=visibleFleet().filter(s=>s.record).map(s=>s.omm),from=currentTime();passWorker.postMessage({requestId:rid,rows,station,from,to:from+21600000});
    }catch{passBusy=false;$('passes').innerHTML='<p class="empty-state">Pass prediction requires Web Workers.</p>';}
  }
  function renderPasses(){
    $('pass-station').textContent=station.name;const box=$('passes');box.replaceChildren();
    if(passBusy){box.innerHTML='<p class="empty-state">Calculating passes …</p>';return;}
    const rows=passEvents.filter(p=>p.end>time&&p.start<time+21600000).slice(0,4);
    if(!rows.length){box.innerHTML='<p class="empty-state">No predicted passes in the next six hours.<small>Select another station or orbit type.</small></p>';return;}
    for(const p of rows){const s=fleet.find(s=>s.id===p.id),b=document.createElement('button');b.className='pass-card'+(s===active?' selected':'');b.onclick=()=>select(s);b.title=`Select ${s.name}. Predicted pass over ${station.name}.`;
      const name=document.createElement('strong');name.textContent=s.name;const t=document.createElement('span');t.className='pass-time';t.textContent=(p.ongoing?'In progress':timeFormat.format(p.start))+' – '+(p.continues?'after '+timeFormat.format(p.end):timeFormat.format(p.end));
      const el=document.createElement('span');el.className='pass-elevation';el.textContent=(p.ongoing||p.continues?'Peak in window':'Peak elevation')+' '+fmt(p.max,0)+'°';
      const bar=document.createElement('span');bar.className='pass-bar';const fill=document.createElement('i');fill.style.left=Math.max(0,(p.start-time)/21600000*100)+'%';fill.style.width=Math.max(.6,Math.min(100,(p.end-p.start)/21600000*100))+'%';bar.append(fill);
      const countdown=document.createElement('span');countdown.className='pass-countdown';const delta=Math.max(0,Math.ceil((p.start-time)/60000));countdown.textContent=p.ongoing||p.start<=time?'In view now':delta>=60?`In ${Math.floor(delta/60)} h ${delta%60} min`:`In ${delta} min`;
      b.append(name,t,el,bar,countdown);box.append(b);
    }
  }
  function updatePassSummary(){
    const label=$('strip-pass-label'),value=$('strip-pass');label.textContent='Predicted pass · '+station.name;
    if(!active?.record){value.textContent='Orbital elements unavailable';return;}
    if(passBusy){value.textContent='Calculating …';return;}
    const pass=passEvents.find(p=>p.id===active.id&&p.end>time);
    if(!pass){value.textContent='None above 10° in the next 6 h';return;}
    const start = pass.ongoing ? 'Before window' : timeFormat.format(pass.start);
    const end = (pass.continues ? 'after ' : '') + timeFormat.format(pass.end);
    const peakLabel = pass.ongoing || pass.continues ? 'Peak in window' : 'Peak elevation';
    value.textContent = start+' – '+end+' UTC · '+peakLabel+' '+fmt(pass.max,0)+'°';
  }
  function setStation(s){station=s;$('observer').value=s.name;schedulePasses();updateReadout();}
  function setTV(enabled){tv=enabled;document.body.classList.toggle('tv',tv);$('tv').setAttribute('aria-pressed',String(tv));resize();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('Fullscreen unavailable. Open this page in a separate window.');}}
  async function refresh(){
    if(networkBusy)return;let cache;try{cache=JSON.parse(localStorage.getItem('norge-groundtrack-github-v1'));}catch{}
    if(cache?.rows)accept(cache.rows);if(cache?.attempt&&Date.now()-cache.attempt<7200000){networkAttempt=cache.attempt;receivedOnline=cache.received||0;onlineCount=cache.count||0;return;}
    networkBusy=true;networkAttempt=Date.now();try{localStorage.setItem('norge-groundtrack-github-v1',JSON.stringify({attempt:networkAttempt,received:cache?.received||0,count:cache?.count||0,rows:fleet.filter(s=>s.omm).map(s=>s.omm)}));}catch{}
    try{const res=await fetch('orbit-data.json',{signal:AbortSignal.timeout(35000)});if(res.ok){const data=await res.json();if(Array.isArray(data.rows)){accept(data.rows);if(data.onlineCount>0){receivedOnline=data.fetchedAt;onlineCount=data.onlineCount;}}}}catch{}
    networkBusy=false;
    try{localStorage.setItem('norge-groundtrack-github-v1',JSON.stringify({attempt:networkAttempt,received:receivedOnline,count:onlineCount,rows:fleet.filter(s=>s.omm).map(s=>s.omm)}));}catch{}
    updateReadout();
  }
  const railFields = [...document.querySelectorAll('#sat-strip [data-field]')];
  const mirrors = [...document.querySelectorAll('[data-source]')];
  let sidebarFit=()=>{};
  function configureSidebar(){
    const key = 'norway-sidebar-fields-v1';
    const defaults = railFields.filter(el=>!el.hasAttribute('data-extra')).map(el=>el.dataset.field);
    let chosen = new Set(defaults);
    try{
      const saved = JSON.parse(localStorage.getItem(key));
      if(Array.isArray(saved)) chosen = new Set(saved);
    }catch{}
    const inputs = new Map();
    function apply(save, added){
      for(const el of railFields){
        el.hidden = !chosen.has(el.dataset.field);
        inputs.get(el.dataset.field).checked = !el.hidden;
      }
      document.querySelector('.instrument-grid').hidden = !document.querySelector('.instrument-grid [data-field]:not([hidden])');
      const rail = $('sat-strip');
      const full = rail.scrollHeight > rail.clientHeight+1;
      if(full && chosen.size){
        chosen.delete(added || [...chosen].pop());
        apply(save);
        $('field-fit').textContent='Sidebar full. Clear a field to make room.';
        return;
      }
      if(save) $('field-fit').textContent='';
      if(save){try{localStorage.setItem(key,JSON.stringify([...chosen]));}catch{}}
    }
    for(const el of railFields){
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      const name = el.dataset.field;
      inputs.set(name,input);
      label.append(input,document.createTextNode(name));
      $('field-options').append(label);
      input.onchange = ()=>{if(input.checked) chosen.add(name);else chosen.delete(name);apply(true,input.checked ? name : null);};
    }
    $('restore-fields').onclick = ()=>{chosen=new Set(defaults);apply(true);};
    window.addEventListener('resize',()=>apply(false));
    new ResizeObserver(()=>apply(false)).observe($('sat-strip'));
    document.fonts.ready.then(()=>apply(false));
    sidebarFit=()=>apply(false);
    apply(false);
  }
  function bind(){
    configureSidebar();
    for(const nav of document.querySelectorAll('.pane-tabs')){
      nav.onclick=event=>{
        const button=event.target.closest('button');
        if(!button)return;
        for(const tab of nav.children){
          const active=tab===button;
          tab.setAttribute('aria-pressed',String(active));
          $(tab.getAttribute('aria-controls')).hidden=!active;
        }
      };
    }
    $('rotation-interval').value=String(rotationInterval/1000);$('rotation-interval').onchange=e=>{const seconds=Number(e.target.value);if(!intervals.includes(seconds))return;rotationInterval=seconds*1000;try{localStorage.setItem('norge-display-interval',String(seconds));}catch{}resetRotation();updateRotation(performance.now());};
    for(const s of stations){const o=document.createElement('option');o.value=s.name;o.textContent=s.name;$('observer').append(o);}$('observer').value=station.name;$('observer').onchange=e=>setStation(stations.find(s=>s.name===e.target.value));
    document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(filter!=='All'&&active?.type!==filter)active=visibleFleet().find(s=>s.record)||visibleFleet()[0];resetRotation();pathsDirty=true;renderFleet();describe();schedulePasses();});
    document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.view===view));b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('map-description').textContent=view==='world'?'World · Miller projection':'Polar · north of 30° N';resize();};});
    for(const [id,get,set] of [['stations',()=>showStations,v=>showStations=v],['footprint',()=>showFootprint,v=>showFootprint=v]])$(id).onclick=()=>{const v=!get();set(v);$(id).setAttribute('aria-pressed',String(v));};
    $('now').onclick=()=>setTime(Date.now(),{isLive:true,isPaused:false,newRate:1});$('pause').onclick=()=>setTime(currentTime(),{isPaused:!paused});$('rate').onchange=e=>setTime(currentTime(),{newRate:Number(e.target.value),isPaused:false});$('time-offset').oninput=e=>setTime(Date.now()+Number(e.target.value)*60000,{isPaused:true});
    $('tv').onclick=()=>setTV(!tv);$('fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';});
    $('panel-toggle').onclick=()=>setPanels(!panelsOpen);$('rotation').onclick=()=>setRotation(!autoRotate);$('next-satellite').onclick=()=>nextSatellite();
    $('info-open').onclick=()=>$('info').showModal();$('info-close').onclick=()=>$('info').close();$('info').addEventListener('click',e=>{if(e.target===$('info')){const r=$('info').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('info').close();}});
    document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||$('info').open)return;if(e.key.toLowerCase()==='t'){e.preventDefault();setTV(!tv);}if(e.key.toLowerCase()==='m'){e.preventDefault();setPanels(!panelsOpen);}if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();}if(e.key==='Escape'&&panelsOpen)setPanels(false);});
    canvas.onclick=e=>{const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;const hit=hitTargets.findLast(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(hit?.entity)select(hit.entity);else if(hit?.station)setStation(hit.station);};
    new ResizeObserver(resize).observe($('map-wrap'));document.fonts.ready.then(()=>{baseDirty=true;resize();});
  }
  function frame(now){
    time=currentTime();if(now-lastDraw>=50){for(const s of fleet)s.position=s.record?C.position(s.record,time):null;updateRotation(now);draw(now);lastDraw=now;}
    if(now-lastUI>=1000){$('clock').textContent=new Date(time).toISOString().slice(11,19);$('date').textContent=dateFormat.format(time)+(live?' · REAL TIME':paused?' · PAUSE':' · SIMULATED');syncTimeControls();updateReadout();if(Math.floor(time/60000)!==lastPassTextMinute){renderPasses();lastPassTextMinute=Math.floor(time/60000);}lastUI=now;}
    if(!passBusy&&Date.now()-lastPassWall>1500&&(Math.abs(time-passFrom)>60000||time>=passTo)&&!passTimer){requestPasses();}
    requestAnimationFrame(frame);
  }
  try{
    if(typeof satellite==='undefined')throw new Error('Could not load calculations.');
    const results=await Promise.all([fetch('fleet.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('orbits.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('assets/coastline.geojson').then(r=>{if(!r.ok)throw Error();return r.json();})]);
    fleet=results[0];coasts=results[2].features.flatMap(f=>f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[]);active=fleet.find(s=>s.id===Number(params.get('sat')))||fleet[0];$('map-description').textContent=view==='world'?'World · Miller projection':'Polar · north of 30° N';
    accept(results[1]);bind();renderFleet();describe();resize();$('map-message').hidden=true;setTV(params.get('tv')==='1');setPanels(false);setRotation(true);schedulePasses();refresh();setInterval(refresh,7200000);requestAnimationFrame(frame);
  }catch(e){$('map-message').textContent='Display unavailable. Open via a web server and retry.';$('data-status').textContent='Loading failed';console.error(e);}
})();
