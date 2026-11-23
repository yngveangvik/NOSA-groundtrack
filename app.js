(async function(){
  'use strict';
  const $=id=>document.getElementById(id),C=OrbitCore,D=C.D;
  const COLORS={LEO:'#A2A2ED',HEO:'#7DE0FF',GEO:'#F0F0F0',selected:'#FC8C30',gray:'#A8A8A8'};
  const TYPES={LEO:'Low Earth orbit',HEO:'Highly elliptical orbit',GEO:'Geostationary orbit'};
  const stations=[['Svalbard',78.2297,15.4078],['Troll',-72.0167,2.5333],['Tromsø',69.6623,18.9413],['Vardø',70.3705,31.1107],['Grimstad',58.3405,8.5934],['Nuuk',64.1814,-51.6941],['Nittedal',60.1439,10.805],['Eik',58.5384,6.4672]].map(([name,lat,lon])=>({name,lat,lon}));
  let language='en';
  try{if(localStorage.getItem('groundtrack-language')==='nb')language='nb';}catch{}
  const nb=()=>language==='nb';
  const locale=()=>nb()?'nb-NO':'en-GB';
  const norwegian={
    "Norway in Orbit": "Norge i bane",
    "Loading map and orbital elements …": "Laster kart og baneelementer …",
    "Day": "Dag",
    "Night": "Natt",
    "Past track": "Tidligere banespor",
    "Predicted track": "Beregnet banespor",
    "Satellites": "Satellitter",
    "All": "Alle",
    "Loading orbital elements": "Laster baneelementer",
    "Display": "Visning",
    "Sidebar fields": "Felt i venstremargen",
    "Predicted passes": "Beregnede passeringer",
    "CALCULATED POSITION": "BEREGNET POSISJON",
    "World ground tracks": "Banespor på verdenskartet",
    "World": "Verden",
    "Arctic": "Arktis",
    "Predicted": "Beregnet",
    "Stations": "Stasjoner",
    "Visibility footprint": "Synlighetsområde",
    "Now": "Nå",
    "Pause": "Pause",
    "Play": "Spill av",
    "REAL TIME": "SANNTID",
    "PAUSE": "PAUSE",
    "Time per satellite": "Tid per satellitt",
    "Pause switching": "Sett satellittbytte på pause",
    "Resume switching": "Gjenoppta satellittbytte",
    "Next": "Neste",
    "TV text": "TV-tekst",
    "Fullscreen": "Fullskjerm",
    "Exit fullscreen": "Avslutt fullskjerm",
    "About": "Om visningen",
    "Calculated from public orbital elements": "Beregnet fra offentlige baneelementer",
    "Restore defaults": "Gjenopprett standardvalg",
    "NEXT 6 HOURS (UTC)": "NESTE 6 TIMER (UTC)",
    "Calculating passes …": "Beregner passeringer …",
    "Selected satellite": "Valgt satellitt",
    "Loading satellites …": "Laster satellitter …",
    "Orbit": "Bane",
    "Ground station": "Bakkestasjon",
    "Mission": "Oppdrag",
    "Waiting for orbital elements": "Venter på baneelementer",
    "Calculated position": "Beregnet posisjon",
    "CelesTrak data (SGP4)": "CelesTrak-data (SGP4)",
    "Altitude": "Høyde",
    "Inertial speed": "Banehastighet",
    "Sub-satellite latitude": "Breddegrad under satellitten",
    "Sub-satellite longitude": "Lengdegrad under satellitten",
    "Inclination": "Banehelling",
    "Orbital period": "Omløpstid",
    "Perigee altitude": "Perigeumshøyde",
    "Apogee altitude": "Apogeumshøyde",
    "Perigee / apogee": "Perigeum / apogeum",
    "Mean motion": "Middelbevegelse",
    "NORAD ID": "NORAD-ID",
    "Orbital element epoch": "Baneelementenes epoke",
    "Orbital element age": "Baneelementenes alder",
    "Elevation": "Elevasjon",
    "Azimuth": "Asimut",
    "Geometric visibility above 10° elevation": "Geometrisk sikt over 10° elevasjon",
    "Owner": "Eier",
    "Operator": "Operatør",
    "Launch site": "Oppskytingssted",
    "Launch date": "Oppskytingsdato",
    "Mission information": "Om oppdraget",
    "Sub-satellite point": "Punkt på jorden under satellitten",
    "Capabilities": "Kapasiteter",
    "Orbit classification": "Banetype",
    "Position status": "Posisjonsstatus",
    "Station visibility": "Sikt fra stasjonen",
    "Station elevation": "Elevasjon fra stasjonen",
    "Station azimuth": "Asimut fra stasjonen",
    "Predicted pass": "Beregnet passering",
    "About this display": "Om denne visningen",
    "Close": "Lukk",
    "Positions and ground tracks are calculated with SGP4 using CelesTrak orbital elements. Speed is the magnitude of the SGP4 velocity in the TEME reference frame. The daylight boundary follows the Sun at the displayed UTC time.": "Posisjon og banespor beregnes med SGP4 og baneelementer fra CelesTrak. Banehastigheten er størrelsen på hastighetsvektoren i referansesystemet TEME. Grensen mellom dag og natt følger solens posisjon ved det viste UTC-tidspunktet.",
    "Predicted passes indicate geometric visibility above 10° elevation at the selected station. The display checks for updated orbital elements hourly. Cached elements support offline calculation.": "Beregnede passeringer viser når satellitten er synlig over 10° elevasjon fra valgt stasjon. Visningen ser etter nye baneelementer hver time. Lagrede baneelementer kan brukes uten nett.",
    "Orbital elements: CelesTrak": "Baneelementer: CelesTrak",
    "Propagation: satellite.js": "Baneberegning: satellite.js",
    "Coastlines: Natural Earth (public domain)": "Kystlinjer: Natural Earth (offentlig eiendom)",
    "Norwegian satellite ground tracks for desktop and TV.": "Banespor for norske satellitter på dataskjerm og TV.",
    "Featured satellite": "Satellitten som vises",
    "Map projection": "Kartprojeksjon",
    "Map settings pages": "Faner for kartinnstillinger",
    "Map settings": "Kartinnstillinger",
    "Orbit type": "Banetype",
    "Pause automatic switching": "Sett automatisk satellittbytte på pause",
    "Resume automatic switching": "Gjenoppta automatisk satellittbytte",
    "Playback speed": "Avspillingshastighet",
    "Satellite map. Open the control panel to select a spacecraft.": "Satellittkart. Åpne kontrollpanelet for å velge en satellitt.",
    "Satellite position map": "Kart over satellittposisjoner",
    "Select ground station": "Velg bakkestasjon",
    "Selected satellite pages": "Faner for valgt satellitt",
    "Show next satellite": "Vis neste satellitt",
    "Show panels": "Vis paneler",
    "Hide panels": "Skjul paneler",
    "Show panels (M)": "Vis paneler (M)",
    "Time offset in minutes": "Tidsforskyvning i minutter",
    "Language": "Språk",
    "English": "Engelsk",
    "Norwegian Bokmål": "Norsk bokmål",
    "Low Earth orbit": "Lav jordbane",
    "Highly elliptical orbit": "Høyelliptisk bane",
    "Geostationary orbit": "Geostasjonær bane",
    "Ended": "Avsluttet",
    "No elements": "Ingen baneelementer",
    "Unavailable": "Utilgjengelig",
    "Satellite icon": "Satellittikon",
    "Orbital elements unavailable": "Baneelementer utilgjengelige",
    "No ground track": "Ingen banespor",
    "Nearly stationary (±12 h)": "Tilnærmet stasjonær (±12 t)",
    "Day at sub-satellite point": "Dag under satellitten",
    "Night at sub-satellite point": "Natt under satellitten",
    "Mission ended": "Oppdraget er avsluttet",
    "Epoch in the future": "Epoke i fremtiden",
    "No prediction available": "Ingen beregning tilgjengelig",
    "Within station visibility": "Synlig fra stasjonen",
    "Outside station visibility": "Utenfor stasjonens synsfelt",
    "Older orbital elements": "Eldre baneelementer",
    "Orbital elements updated": "Baneelementer oppdatert",
    "Cached orbital elements": "Lagrede baneelementer",
    "Checking CelesTrak for updates": "Ser etter oppdateringer fra CelesTrak",
    "CelesTrak update unavailable": "Kunne ikke hente oppdatering fra CelesTrak",
    "Pass calculation failed.": "Kunne ikke beregne passeringer.",
    "Reload to retry.": "Last siden på nytt for å prøve igjen.",
    "Pass prediction requires Web Workers.": "Beregning av passeringer krever støtte for Web Workers.",
    "No predicted passes in the next six hours.": "Ingen beregnede passeringer de neste seks timene.",
    "Select another station or orbit type.": "Velg en annen stasjon eller banetype.",
    "In progress": "Pågår",
    "Peak in window": "Høyeste elevasjon i tidsrommet",
    "Peak elevation": "Høyeste elevasjon",
    "In view now": "Synlig nå",
    "Calculating …": "Beregner …",
    "None above 10° in the next 6 h": "Ingen over 10° de neste 6 timene",
    "Before window": "Før tidsrommet",
    "Fullscreen unavailable. Open this page in a separate window.": "Fullskjerm er utilgjengelig. Åpne siden i et eget vindu.",
    "Sidebar full. Clear a field to make room.": "Venstremargen er full. Fjern et felt for å få plass.",
    "World (Miller projection)": "Verden (Millers projeksjon)",
    "Arctic north of 30° N": "Polarkart nord for 30° N",
    "Display unavailable. Open via a web server and retry.": "Visningen er utilgjengelig. Åpne siden via en nettserver og prøv igjen.",
    "Loading failed": "Innlasting mislyktes",
    "Norwegian Space Agency": "Direktoratet for romvirksomhet",
    "Norwegian Coastal Administration": "Kystverket",
    "FFI / Netherlands Ministry of Defence": "FFI / Nederlands forsvarsdepartement",
    "Norwegian operations, joint Norwegian–Dutch mission": "Norsk drift, felles norsk-nederlandsk oppdrag",
    "Andøya, Norway": "Andøya, Norge",
    "Baikonur, Kazakhstan": "Bajkonur, Kasakhstan",
    "Kourou, French Guiana": "Kourou, Fransk Guyana",
    "Automatic Identification System (AIS)": "Automatisk identifikasjonssystem (AIS)",
    "Low-light camera": "Kamera for svakt lys",
    "AIS receiver": "AIS-mottaker",
    "Solar radiometer": "Solradiometer",
    "Langmuir probes": "Langmuir-sonder",
    "VHF Data Exchange System (VDES)": "VHF-datautvekslingssystem (VDES)",
    "Navigation radar detector": "Detektor for navigasjonsradar",
    "In-orbit payload testing": "Testing av nyttelast i bane",
    "Sun sensor": "Solsensor",
    "Radio link": "Radioforbindelse",
    "Hyperspectral camera": "Hyperspektralt kamera",
    "Camera and display": "Kamera og skjerm",
    "Passive radio-frequency sensing": "Passiv deteksjon av radiosignaler",
    "Satellite broadband": "Satellittbredbånd",
    "Television broadcasting": "TV-kringkasting",
    "Data communications": "Datakommunikasjon",
    "Maritime broadband": "Maritimt bredbånd",
    "Tracks ships and tests low-light imaging for maritime surveillance.": "Sporer skip og tester maritim overvåking med kamera i svakt lys.",
    "Illustration: SFL": "Illustrasjon: SFL",
    "Tracks ships and measures solar irradiance and ionospheric plasma.": "Sporer skip og måler solinnstråling og plasma i ionosfæren.",
    "Image: Norwegian Space Agency": "Bilde: Direktoratet for romvirksomhet",
    "Tracks ships and tests ship-to-satellite data exchange.": "Sporer skip og tester datautveksling mellom skip og satellitt.",
    "Illustration: NorSat-1 and -2": "Illustrasjon: NorSat-1 og -2",
    "Combines ship identification with passive detection of marine radar signals.": "Kombinerer skipsidentifikasjon med passiv deteksjon av signaler fra skipsradarer.",
    "Collects ship identification messages for the Norwegian Coastal Administration.": "Samler inn meldinger om skipsidentitet for Kystverket.",
    "Illustration: AISSat-4": "Illustrasjon: AISSat-4",
    "Provides an in-orbit laboratory for testing satellite technology.": "Fungerer som laboratorium for testing av satellitteknologi i bane.",
    "Illustration: Mimir-1": "Illustrasjon: Mimir-1",
    "Tests a student-built solar sensor for spacecraft attitude determination.": "Tester en studentbygd solsensor for å bestemme satellittens orientering.",
    "Satellite symbol": "Satellittsymbol",
    "Images coastal waters to study phytoplankton and water quality.": "Tar bilder av kystvann for å studere planteplankton og vannkvalitet.",
    "Student mission designed to photograph images displayed on an external screen.": "Studentoppdrag utviklet for å fotografere bilder på en utvendig skjerm.",
    "Measures the colour of coastal waters to study ocean ecosystems.": "Måler fargen på kystvann for å studere økosystemene i havet.",
    "Photo: NTNU SmallSat Lab": "Foto: NTNU SmallSat Lab",
    "Works with Huygens to locate radio-frequency emitters from orbit.": "Samarbeider med Huygens om å lokalisere radiosendere fra bane.",
    "Illustration: NanoAvionics": "Illustrasjon: NanoAvionics",
    "Works with Birkeland to locate radio-frequency emitters from orbit.": "Samarbeider med Birkeland om å lokalisere radiosendere fra bane.",
    "Illustration: MilSpace2": "Illustrasjon: MilSpace2",
    "Provides broadband connectivity across the Arctic.": "Gir bredbåndsdekning i Arktis.",
    "Illustration: ASBM 1 and 2": "Illustrasjon: ASBM 1 og 2",
    "Relays television and data signals from geostationary orbit.": "Formidler TV- og datasignaler fra geostasjonær bane.",
    "Illustration: THOR 5": "Illustrasjon: THOR 5",
    "Illustration: THOR 6": "Illustrasjon: THOR 6",
    "Delivers broadcast services and maritime broadband.": "Leverer kringkasting og bredbånd til sjøs.",
    "Illustration: THOR 7": "Illustrasjon: THOR 7",
    "10 seconds": "10 sekunder",
    "15 seconds": "15 sekunder",
    "20 seconds": "20 sekunder",
    "30 seconds": "30 sekunder",
    "45 seconds": "45 sekunder",
    "60 seconds": "60 sekunder"
};
  const tr=text=>nb()?(norwegian[text]??text):text;
  const staticLabels=[];
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode, key=node.data.trim();
    if(Object.hasOwn(norwegian,key)){
      const original=node.data;
      staticLabels.push(()=>{node.data=original.replace(key,tr(key));});
    }
  }
  for(const el of document.querySelectorAll('[aria-label],[alt],[title],meta[name="description"]')){
    for(const attr of ['aria-label','alt','title','content']){
      const key=el.getAttribute(attr);
      if(key&&Object.hasOwn(norwegian,key))staticLabels.push(()=>el.setAttribute(attr,tr(key)));
    }
  }
  function applyLanguage(){
    document.documentElement.lang=language;
    for(const apply of staticLabels)apply();
    document.querySelector('.brand img').src=nb()?'assets/romdirektoratet.png':'assets/agency-en.png';
    for(const btn of document.querySelectorAll('[data-language]'))btn.setAttribute('aria-pressed',String(btn.dataset.language===language));
  }
  applyLanguage();
  const fmt=(n,d=0)=>n.toLocaleString(locale(),{minimumFractionDigits:d,maximumFractionDigits:d});
  let timeFormat=new Intl.DateTimeFormat(locale(),{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  let dateFormat=new Intl.DateTimeFormat(locale(),{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
  const params=new URLSearchParams(location.search);
  const mill=lat=>1.25*Math.log(Math.tan(Math.PI/4+.4*lat*D)),millMax=mill(90);
  const inverseMill=y=>(Math.atan(Math.exp(.8*y))-Math.PI/4)*2.5/D;
  let fleet=[],coasts=[],active=null,filter='All',view=params.get('view')==='polar'?'polar':'world',station=stations.find(s=>s.name===params.get('station'))||stations[0];
  let live=true,paused=false,rate=1,time=Date.now(),anchorTime=time,anchorWall=Date.now(),tv=false;
  const intervals=[10,15,20,30,45,60];
  let rotationInterval=20000;
  try{const saved=Number(localStorage.getItem('norge-display-interval'));if(intervals.includes(saved))rotationInterval=saved*1000;}catch{}
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let outgoing=null,transitionStarted=-Infinity;
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
    autoRotate=enabled;resetRotation();$('rotation').setAttribute('aria-pressed',String(enabled));$('rotation').textContent=enabled?tr("Pause switching"):tr("Resume switching");$('rotation').setAttribute('aria-label',enabled?tr("Pause automatic switching"):tr("Resume automatic switching"));$('sat-strip').classList.toggle('rotation-off',!enabled);updateRotation(performance.now());
  }
  function setPanels(open){
    panelsOpen=open;document.body.classList.toggle('panels-open',open);
    for(const id of ['fleet-panel','detail-panel','controls-panel']){$(id).hidden=!open;$(id).inert=!open;}
    $('panel-toggle').setAttribute('aria-expanded',String(open));$('panel-toggle').setAttribute('aria-label',open?tr("Hide panels"):tr("Show panels"));$('panel-toggle').title=(open?tr("Hide panels"):tr("Show panels"))+' (M)';
    if(!open&&document.activeElement?.closest('.overlay'))$('panel-toggle').focus({preventScroll:true});
    updateLabelObstacles();
  }
  function updateLabelObstacles(){
    const origin=canvas.getBoundingClientRect();labelObstacles=[...document.querySelectorAll('.brand,.utc,.data-footer,.map-key,.map-caption,#panel-toggle,#sat-strip,.overlay:not([hidden])')].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>({x:r.left-origin.left-6,y:r.top-origin.top-6,w:r.width+12,h:r.height+12}));
  }
  function currentTime(){if(live)return Date.now();return paused?anchorTime:anchorTime+(Date.now()-anchorWall)*rate;}
  function setTime(ms,{isLive=false,isPaused=paused,newRate=rate}={}){time=ms;anchorTime=ms;anchorWall=Date.now();live=isLive;paused=isPaused;rate=newRate;pathsDirty=true;shadeDirty=true;syncTimeControls();schedulePasses();}
  function syncTimeControls(){
    $('pause').textContent=paused?tr("Play"):tr("Pause");$('pause').setAttribute('aria-pressed',String(paused));$('now').setAttribute('aria-pressed',String(live));$('rate').value=String(rate);
    const offset=Math.round((time-Date.now())/60000);$('time-offset').value=String(Math.max(-720,Math.min(720,offset)));$('time-offset').setAttribute('aria-valuetext',`${offset} minutes from now`);
    $('time-mode').textContent=live?tr("REAL TIME"):paused?tr("PAUSE"):`${nb()?'SIMULERT':'SIMULATED'} ${rate}×`;
    $('footer-summary').textContent=live?tr("Calculated from public orbital elements"):`${nb()?'Simulert tid':'Simulated time'}: ${dateFormat.format(time)} ${timeFormat.format(time)} UTC`;
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
      const section=document.createElement('section');section.className='fleet-group';const heading=document.createElement('h3');heading.textContent=type+' / '+tr(TYPES[type]);section.append(heading);
      for(const s of group){
        const b=document.createElement('button');b.className='sat-row'+(!s.record?' unavailable':'');b.style.setProperty('--sat-color',COLORS[s.type]);b.setAttribute('aria-pressed',String(s===active));b.dataset.satellite=String(s.id);
        const dot=document.createElement('i');dot.className='sat-dot';const name=document.createElement('span');name.textContent=s.name;b.append(dot,name);
        if(!s.record){const hint=document.createElement('small');hint.textContent=s.id===-2?tr("Ended"):tr("No elements");b.append(hint);}
        b.onclick=()=>select(s);section.append(b);
      }
      list.append(section);
    }
    $('fleet-count').textContent=String(fleet.filter(s=>s.record).length);
    if(focused)list.querySelector('[data-satellite="'+focused+'"]')?.focus({preventScroll:true});
  }
  function select(s,{automatic=false}={}){
    if(!s)return;
    const changed=active!==s;
    if(changed){
      outgoing=trackCache.get(active?.id);
      transitionStarted=performance.now();
      trackCache.clear();
      lastPathWall=-Infinity;
    }
    active=s;
    if(s.record)s.position=C.position(s.record,currentTime());
    pathsDirty=true;
    if(!automatic)resetRotation();
    renderFleet();describe();renderPasses();
    if(changed&&!reducedMotion.matches){
      for(const el of $('sat-strip').children){
        if(el.hidden)continue;
        for(const animation of el.getAnimations())animation.cancel();
        const delay=el.matches('.identity')?0:el.id==='strip-mission'?65:125;
        el.animate([{opacity:0},{opacity:1}],{duration:330,delay,fill:'backwards',easing:'ease-out'});
      }
    }
  }
  function launchLabel(value, includeAge=true){
    if(!value) return tr("Unavailable");
    const launched = new Date(value);
    const timestamp=dateFormat.format(launched)+(value.includes('T')?' '+timeFormat.format(launched)+' UTC':'');
    if(!includeAge)return timestamp;
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
    const elapsed = [[Math.floor(months/12),'year'],[months%12,'month'],[days,'day']].map(([n,u])=>n+' '+(nb()?({year:'år',month:n===1?'måned':'måneder',day:n===1?'dag':'dager'})[u]:u+(n===1?'':'s'))).join(', ');
    return timestamp+' ('+elapsed+(nb()?' siden)':' ago)');
  }
  function showProfile(s){
    const portrait=$('portrait');
    portrait.src=s.portrait || 'assets/satellite-alt.svg';
    portrait.alt=s.portrait ? s.name+', '+tr(s.portraitCredit) : tr("Satellite icon");
    portrait.title=portrait.alt;
    portrait.classList.toggle('fallback',!s.portrait);
    $('launch-date').textContent=launchLabel(s.launchDate);
    $('rail-launch-date').textContent=launchLabel(s.launchDate,false);
    $('launch-site').textContent=tr(s.launchSite);
    $('capabilities').replaceChildren(...s.capabilities.map(capability => {
      const row = document.createElement('li');
      row.textContent = tr(capability);
      return row;
    }));
  }
  function describe(){
    if(!active)return;
    const s=active;$('sat-name').textContent=s.name;$('sat-type').textContent=s.type+' / '+tr(TYPES[s.type]);$('sat-mission').textContent=tr(s.mission);
    $('strip-name').textContent=s.name;$('owner').textContent=tr(s.owner);$('operator').textContent=tr(s.operator);$('strip-mission').textContent=tr(s.benefit||s.mission);
    showProfile(s);
    $('sat-source').href=s.source;$('sat-source').title=`${tr('Owner')}: ${tr(s.owner)}. ${tr('Operator')}: ${tr(s.operator)}.`;
    $('norad').textContent=s.id>0?String(s.id):'–';
    $('inclination').textContent=s.omm?fmt(s.omm.INCLINATION,2)+'°':'–';$('period').textContent=s.omm?fmt(1440/s.omm.MEAN_MOTION,1)+' min':'–';
    for(const [id, earthRadii] of [['perigee',s.record?.altp],['apogee',s.record?.alta]]){
      $(id).textContent=Number.isFinite(earthRadii)?fmt(earthRadii*satellite.constants.earthRadius)+' km':'–';
    }
    $('mean-motion').textContent=s.omm?fmt(s.omm.MEAN_MOTION,4)+(nb()?' omløp/døgn':' rev/day'):'–';
    $('epoch').textContent=s.omm?dateFormat.format(C.epoch(s.omm))+' '+timeFormat.format(C.epoch(s.omm))+' UTC':tr("Orbital elements unavailable");
    const minutes=s.omm?1440/s.omm.MEAN_MOTION:0;
    $('track-window').textContent=!s.record?tr("No ground track"):s.type==='GEO'?tr("Nearly stationary (±12 h)"):`−${minutes>=120?fmt(minutes/60,1)+(nb()?' t':' h'):fmt(minutes)+' min'} / +${minutes>=120?fmt(minutes*2/60,1)+(nb()?' t':' h'):fmt(minutes*2)+' min'}`;
    updateReadout();
    updateLabelObstacles();
  }
  function syncRailValue(el){
    const value=$(el.dataset.source).textContent;
    if(!el.closest('.instrument-grid')){el.textContent=value;return;}
    const match=/^([\d.,\s]+)(°| km| min)$/.exec(value);
    if(!match){el.textContent=value;return;}
    const unit=document.createElement('small');
    unit.textContent=match[2];el.replaceChildren(match[1],unit);
  }
  function updateReadout(){
    if(!active)return;const s=active,p=s.position;
    $('height').innerHTML=p?fmt(p.height)+' <small>km</small>':'–';$('speed').innerHTML=p?fmt(p.speed,2)+' <small>km/s</small>':'–';
    $('latitude').textContent=p?fmt(Math.abs(p.lat),2)+'° '+(p.lat<0?'S':'N'):'–';$('longitude').textContent=p?fmt(Math.abs(p.lon),2)+'° '+(p.lon<0?(nb()?'V':'W'):(nb()?'Ø':'E')):'–';
    $('strip-height').innerHTML=$('height').innerHTML;$('strip-speed').innerHTML=$('speed').innerHTML;$('strip-latitude').textContent=$('latitude').textContent;$('strip-longitude').textContent=$('longitude').textContent;
    $('position-status').textContent=p?(C.lightAt(C.solar(time),p.lat,p.lon)>=0?tr("Day at sub-satellite point"):tr("Night at sub-satellite point")):s.id===-2?tr("Mission ended"):tr("Orbital elements unavailable");
    const age=s.omm?(Date.now()-C.epoch(s.omm))/3600000:0,simAge=s.omm?Math.abs(time-C.epoch(s.omm))/3600000:0;
    $('epoch-age').textContent=s.omm?(age>=0?`${age>=48?fmt(age/24,1)+(nb()?' døgn':' days'):fmt(age,1)+(nb()?' t':' hours')} ${nb()?'gamle':'old'}`:tr("Epoch in the future"))+(simAge>168?(nb()?' (langt fra epoken)':' (far from epoch)'):''):'–';
    $('strip-data').textContent=s.omm
      ? (nb()?'Baneelementenes alder: ':'Element age: ')+(age<0?tr("Epoch in the future"):age>=48?fmt(age/24,1)+(nb()?' døgn':' days'):fmt(age,1)+(nb()?' t':' hours'))
      : tr("Orbital elements unavailable");
    updatePassSummary();
    $('epoch-age').style.color=s.omm&&(age>168||simAge>168)?COLORS.selected:'';
    $('sidebar-station-name').textContent=tr('Ground station')+': '+station.name;
    const angles=C.look(p,station);$('elevation').textContent=angles?fmt(angles.elevation,1)+'°':'–';$('azimuth').textContent=angles?fmt(angles.azimuth,1)+'°':'–';
    const inView=angles&&angles.elevation>=10;$('visibility').textContent=!angles?tr("No prediction available"):inView?tr("Within station visibility"):tr("Outside station visibility");$('visibility').classList.toggle('in-view',!!inView);
    for(const el of mirrors)syncRailValue(el);
    sidebarFit();
    const old=fleet.filter(s=>s.omm&&(Date.now()-C.epoch(s.omm)>7*86400000));$('data-mark').className='live-mark'+(old.length?' stale':receivedOnline?' fresh':'');
    $('data-status').textContent=old.length?tr("Older orbital elements"):receivedOnline?tr("Orbital elements updated"):tr("Cached orbital elements");
    $('data-detail').textContent=receivedOnline?`${onlineCount}/${fleet.filter(s=>s.record).length} ${nb()?'hentet':'retrieved'} ${timeFormat.format(receivedOnline)} UTC`:tr("Checking CelesTrak for updates");
    if(networkAttempt&&!receivedOnline&&!networkBusy)$('data-detail').textContent=tr("CelesTrak update unavailable");
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
      bctx.textAlign='center';for(let lon=-150;lon<=150;lon+=30){const p=project(lon,-90);bctx.fillText(lon===0?'0°':Math.abs(lon)+'°'+(lon<0?(nb()?'V':'W'):(nb()?'Ø':'E')),p.x,h-14);bctx.beginPath();bctx.moveTo(p.x,h);bctx.lineTo(p.x,h-6);bctx.stroke();}
    }else{
      for(const lon of [0,90,180,-90]){const p=project(lon,25);bctx.fillText(lon===0?'0°':Math.abs(lon)+'°'+(lon<0?(nb()?'V':'W'):(nb()?'Ø':'E')),p.x,p.y+4);}
      bctx.textAlign='left';for(const lat of [45,60,75]){const p=project(0,lat);bctx.fillText(lat+'°N',p.x+5,p.y-4);}
    }
    bctx.globalAlpha=1;baseDirty=false;
  }
  function drawShade(now){
    const sw=view==='world'?540:320,sh=view==='world'?270:320;if(shade.width!==sw||shade.height!==sh){shade.width=sw;shade.height=sh;}
    const image=sctx.createImageData(sw,sh),sun=C.solar(time),p=image.data;
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      let lat,lon;if(view==='world'){lat=inverseMill(millMax-(y+.5)/sh*2*millMax);lon=(x+.5)/sw*360-180;}else{const dx=(x+.5-sw/2)/(sw/2),dy=(y+.5-sh/2)/(sh/2),r=Math.hypot(dx,dy);if(r>1)continue;lat=90-r*60;lon=Math.atan2(dx,dy)/D;}
      const light=C.lightAt(sun,lat,lon),i=(y*sw+x)*4,day=Math.max(0,Math.min(1,(light+.065)/.13));p[i]=240;p[i+1]=240;p[i+2]=240;p[i+3]=Math.round(15*day);
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
    const elapsed=reducedMotion.matches?Infinity:now-transitionStarted;
    function stroke(points,count,dashed,opacity){
      if(count<2)return;
      ctx.globalAlpha=opacity;ctx.setLineDash(dashed?[4,5]:[]);
      ctx.beginPath();trace(ctx,count>=points.length?points:points.slice(0,count));ctx.stroke();
    }
    ctx.save();clip(ctx);ctx.strokeStyle=COLORS.selected;ctx.lineWidth=1.55;
    if(outgoing&&elapsed<180){
      const fade=1-elapsed/180;
      stroke(outgoing.past,outgoing.past.length,false,.95*fade);
      stroke(outgoing.future,outgoing.future.length,true,.75*fade);
    }else outgoing=null;
    const track=trackCache.get(active?.id);
    if(track){
      const progress=Math.min(1,Math.max(0,elapsed/1200));
      const segments=Math.floor(progress*(track.past.length+track.future.length-2));
      stroke(track.past,segments+1,false,.95);
      stroke(track.future,segments-track.past.length+2,true,.75);
    }
    ctx.restore();
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
        occupied.push(box);ctx.strokeStyle='#000000';ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y);hitTargets.push({...box,entity});return true;
      }
    }
    const stationsToLabel=[];
    ctx.save();
    if(showStations){
      for(const s of stations){const p=project(s.lon,s.lat);if(!p.visible)continue;const selected=s===station;ctx.strokeStyle=selected?'#F0F0F0':'#A8A8A8';ctx.globalAlpha=selected?.95:.45;ctx.lineWidth=1;ctx.strokeRect(p.x-3,p.y-3,6,6);if(selected){ctx.strokeRect(p.x-6,p.y-6,12,12);stationsToLabel.push([s.name,p]);}hitTargets.push({x:p.x-8,y:p.y-8,w:16,h:16,station:s});}
    }
    const sats=visibleFleet().filter(s=>s.position).sort((a,b)=>(b===active)-(a===active));
    for(const s of sats){const p=project(s.position.lon,s.position.lat);if(!p.visible)continue;const selected=s===active,color=selected?COLORS.selected:"#F0F0F0",size=(selected?18:13)*fs;
      ctx.globalAlpha=1;if(selected){ctx.strokeStyle=color;ctx.globalAlpha=.8;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,size*.9,0,Math.PI*2);ctx.stroke();if(!reducedMotion.matches){const phase=(now%2400)/2400;ctx.globalAlpha=.65*(1-phase);ctx.beginPath();ctx.arc(p.x,p.y,size*(.9+phase*1.2),0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
      const im=getIcon(color);if(im)ctx.drawImage(im,p.x-size/2,p.y-size/2,size,size);else{ctx.fillStyle=color;ctx.fillRect(p.x-3,p.y-3,6,6);}
      hitTargets.push({x:p.x-12,y:p.y-12,w:24,h:24,entity:s});
    }
    const named=[];
    for(const sat of sats){
      const point=project(sat.position.lon,sat.position.lat);
      if(!point.visible||named.some(p=>Math.hypot(point.x-p.x,point.y-p.y)<24*fs))continue;
      if(label(sat.name,point,sat===active?COLORS.selected:"#F0F0F0",sat===active,sat))named.push(point);
    }
    for(const [name,point] of stationsToLabel)label(name,point,'#F0F0F0');
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
      passWorker.onerror=()=>{passBusy=false;$('passes').innerHTML=`<p class="empty-state">${tr("Pass calculation failed.")}<small>${tr("Reload to retry.")}</small></p>`;};
      const rows=visibleFleet().filter(s=>s.record).map(s=>s.omm),from=currentTime();passWorker.postMessage({requestId:rid,rows,station,from,to:from+21600000});
    }catch{passBusy=false;$('passes').innerHTML=`<p class="empty-state">${tr("Pass prediction requires Web Workers.")}</p>`;}
  }
  function renderPasses(){
    $('pass-station').textContent=station.name;const box=$('passes');box.replaceChildren();
    if(passBusy){box.innerHTML=`<p class="empty-state">${tr("Calculating passes …")}</p>`;return;}
    const rows=passEvents.filter(p=>p.end>time&&p.start<time+21600000).slice(0,4);
    if(!rows.length){box.innerHTML=`<p class="empty-state">${tr("No predicted passes in the next six hours.")}<small>${tr("Select another station or orbit type.")}</small></p>`;return;}
    for(const p of rows){const s=fleet.find(s=>s.id===p.id),b=document.createElement('button');b.className='pass-card'+(s===active?' selected':'');b.onclick=()=>select(s);b.title=`${nb()?'Velg':'Select'} ${s.name}. ${nb()?'Beregnet passering over':'Predicted pass over'} ${station.name}.`;
      const name=document.createElement('strong');name.textContent=s.name;const t=document.createElement('span');t.className='pass-time';t.textContent=(p.ongoing?tr("In progress"):timeFormat.format(p.start))+' – '+(p.continues?(nb()?'etter ':'after ')+timeFormat.format(p.end):timeFormat.format(p.end));
      const el=document.createElement('span');el.className='pass-elevation';el.textContent=(p.ongoing||p.continues?tr("Peak in window"):tr("Peak elevation"))+' '+fmt(p.max,0)+'°';
      const bar=document.createElement('span');bar.className='pass-bar';const fill=document.createElement('i');fill.style.left=Math.max(0,(p.start-time)/21600000*100)+'%';fill.style.width=Math.max(.6,Math.min(100,(p.end-p.start)/21600000*100))+'%';bar.append(fill);
      const countdown=document.createElement('span');countdown.className='pass-countdown';const delta=Math.max(0,Math.ceil((p.start-time)/60000));countdown.textContent=p.ongoing||p.start<=time?tr("In view now"):delta>=60?`${nb()?'Om':'In'} ${Math.floor(delta/60)} ${nb()?'t':'h'} ${delta%60} min`:`${nb()?'Om':'In'} ${delta} min`;
      b.append(name,t,el,bar,countdown);box.append(b);
    }
  }
  function updatePassSummary(){
    const label=$('strip-pass-label'),value=$('strip-pass');label.textContent=tr('Predicted pass')+': '+station.name;
    if(!active?.record){value.textContent=tr("Orbital elements unavailable");return;}
    if(passBusy){value.textContent=tr("Calculating …");return;}
    const pass=passEvents.find(p=>p.id===active.id&&p.end>time);
    if(!pass){value.textContent=tr("None above 10° in the next 6 h");return;}
    const start = pass.ongoing ? tr("Before window") : timeFormat.format(pass.start);
    const end = (pass.continues ? (nb()?'etter ':'after ') : '') + timeFormat.format(pass.end);
    const peakLabel = pass.ongoing || pass.continues ? tr("Peak in window") : tr("Peak elevation");
    value.textContent = start+' – '+end+' UTC\n'+peakLabel+' '+fmt(pass.max,0)+'°';
  }
  function setStation(s){station=s;$('observer').value=s.name;schedulePasses();updateReadout();}
  function setTV(enabled){tv=enabled;document.body.classList.toggle('tv',tv);$('tv').setAttribute('aria-pressed',String(tv));resize();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify(tr("Fullscreen unavailable. Open this page in a separate window."));}}
  const orbitCacheKey='norge-groundtrack-github-v1';
  function restoreOrbitCache(){
    try{
      const cache=JSON.parse(localStorage.getItem(orbitCacheKey));
      if(Array.isArray(cache?.rows))accept(cache.rows);
      receivedOnline=cache?.received||0;onlineCount=cache?.count||0;
    }catch{}
  }
  async function refresh(){
    if(networkBusy)return;
    networkBusy=true;
    networkAttempt=Date.now();
    let delay=5*60*1000;
    try{
      const response=await fetch('orbit-data.json',{cache:'no-store',signal:AbortSignal.timeout(35000)});
      if(!response.ok)throw Error('Orbit data unavailable');
      const data=await response.json();
      if(!Array.isArray(data.rows)||!data.rows.some(row=>row?.EPOCH&&row.MEAN_MOTION>0))throw Error('Invalid orbit data');
      accept(data.rows.filter(Boolean));
      if(data.onlineCount>0&&data.fetchedAt>=receivedOnline){
        receivedOnline=data.fetchedAt;onlineCount=data.onlineCount;
      }
      delay=60*60*1000;
      try{
        const rows=fleet.filter(s=>s.omm).map(s=>s.omm);
        localStorage.setItem(orbitCacheKey,JSON.stringify({received:receivedOnline,count:onlineCount,rows}));
      }catch{}
    }catch{}finally{
      networkBusy=false;setTimeout(refresh,delay);updateReadout();
    }
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
      const metrics=document.querySelector('#sat-strip > .instrument-grid');
      metrics.hidden=!metrics.querySelector('[data-field]:not([hidden])');
      $('sidebar-station').hidden=!$('sidebar-station').querySelector('[data-field]:not([hidden])');
      const facts=document.querySelector('.sat-facts');
      facts.hidden=!facts.querySelector('[data-field]:not([hidden])');
      const rail = $('sat-strip');
      const full = rail.scrollHeight > rail.clientHeight+1;
      if(full && chosen.size){
        chosen.delete(added || [...chosen].pop());
        apply(save);
        $('field-fit').textContent=tr("Sidebar full. Clear a field to make room.");
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
      label.dataset.fieldLabel=name;label.append(input,document.createTextNode(tr(name)));
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
    for(const button of document.querySelectorAll('[data-language]'))button.onclick=()=>{
      if(language===button.dataset.language)return;
      language=button.dataset.language;
      try{localStorage.setItem('groundtrack-language',language);}catch{}
      applyLanguage();
      timeFormat=new Intl.DateTimeFormat(locale(),{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
      dateFormat=new Intl.DateTimeFormat(locale(),{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
      for(const label of document.querySelectorAll('[data-field-label]'))label.lastChild.data=tr(label.dataset.fieldLabel);
      $('map-description').textContent=tr(view==='world'?'World (Miller projection)':'Arctic north of 30° N');
      $('rotation').textContent=tr(autoRotate?'Pause switching':'Resume switching');
      $('rotation').setAttribute('aria-label',tr(autoRotate?'Pause automatic switching':'Resume automatic switching'));
      $('fullscreen').textContent=tr(document.fullscreenElement?'Exit fullscreen':'Fullscreen');
      $('field-fit').textContent='';$('notice').hidden=true;
      setPanels(panelsOpen);renderFleet();renderPasses();describe();syncTimeControls();
      baseDirty=true;lastUI=-Infinity;
    };

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
    document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(filter!=='All'&&active?.type!==filter)select(visibleFleet().find(s=>s.record)||visibleFleet()[0]);resetRotation();pathsDirty=true;renderFleet();describe();schedulePasses();});
    document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.view===view));b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('map-description').textContent=view==='world'?tr("World (Miller projection)"):tr("Arctic north of 30° N");resize();};});
    for(const [id,get,set] of [['stations',()=>showStations,v=>showStations=v],['footprint',()=>showFootprint,v=>showFootprint=v]])$(id).onclick=()=>{const v=!get();set(v);$(id).setAttribute('aria-pressed',String(v));};
    $('now').onclick=()=>setTime(Date.now(),{isLive:true,isPaused:false,newRate:1});$('pause').onclick=()=>setTime(currentTime(),{isPaused:!paused});$('rate').onchange=e=>setTime(currentTime(),{newRate:Number(e.target.value),isPaused:false});$('time-offset').oninput=e=>setTime(Date.now()+Number(e.target.value)*60000,{isPaused:true});
    $('tv').onclick=()=>setTV(!tv);$('fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?tr("Exit fullscreen"):tr("Fullscreen");});
    $('panel-toggle').onclick=()=>setPanels(!panelsOpen);$('rotation').onclick=()=>setRotation(!autoRotate);$('next-satellite').onclick=()=>nextSatellite();
    $('info-open').onclick=()=>$('info').showModal();$('info-close').onclick=()=>$('info').close();$('info').addEventListener('click',e=>{if(e.target===$('info')){const r=$('info').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('info').close();}});
    document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||$('info').open)return;if(e.key.toLowerCase()==='t'){e.preventDefault();setTV(!tv);}if(e.key.toLowerCase()==='m'){e.preventDefault();setPanels(!panelsOpen);}if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();}if(e.key==='Escape'&&panelsOpen)setPanels(false);});
    canvas.onclick=e=>{const b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;const hit=hitTargets.findLast(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(hit?.entity)select(hit.entity);else if(hit?.station)setStation(hit.station);};
    new ResizeObserver(resize).observe($('map-wrap'));document.fonts.ready.then(()=>{baseDirty=true;resize();});
  }
  function frame(now){
    time=currentTime();if(now-lastDraw>=50){for(const s of fleet)s.position=s.record?C.position(s.record,time):null;updateRotation(now);draw(now);lastDraw=now;}
    if(now-lastUI>=1000){$('clock').textContent=new Date(time).toISOString().slice(11,19);$('date').textContent=dateFormat.format(time)+(live?'':paused?(nb()?' (PAUSET)':' (PAUSED)'):(nb()?' (SIMULERT)':' (SIMULATED)'));syncTimeControls();updateReadout();if(Math.floor(time/60000)!==lastPassTextMinute){renderPasses();lastPassTextMinute=Math.floor(time/60000);}lastUI=now;}
    if(!passBusy&&Date.now()-lastPassWall>1500&&(Math.abs(time-passFrom)>60000||time>=passTo)&&!passTimer){requestPasses();}
    requestAnimationFrame(frame);
  }
  try{
    if(typeof satellite==='undefined')throw new Error('Could not load calculations.');
    const results=await Promise.all([fetch('fleet.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('orbits.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('assets/coastline.geojson').then(r=>{if(!r.ok)throw Error();return r.json();})]);
    fleet=results[0];coasts=results[2].features.flatMap(f=>f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[]);active=fleet.find(s=>s.id===Number(params.get('sat')))||fleet[0];$('map-description').textContent=view==='world'?tr("World (Miller projection)"):tr("Arctic north of 30° N");
    accept(results[1]);bind();renderFleet();describe();resize();$('map-message').hidden=true;setTV(params.get('tv')==='1');setPanels(false);setRotation(true);schedulePasses();restoreOrbitCache();refresh();requestAnimationFrame(frame);
  }catch(e){$('map-message').textContent=tr("Display unavailable. Open via a web server and retry.");$('data-status').textContent=tr("Loading failed");console.error(e);}
})();
