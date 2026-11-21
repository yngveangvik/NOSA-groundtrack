(function(root){
  'use strict';
  const D=Math.PI/180,R=180/Math.PI;
  const wrap=x=>((x+180)%360+360)%360-180;
  const epoch=omm=>Date.parse(/Z$|[+-]\d\d:\d\d$/.test(omm.EPOCH)?omm.EPOCH:omm.EPOCH+'Z');
  function position(record,ms){
    const date=new Date(ms),state=satellite.propagate(record,date);
    if(!state?.position||!state.velocity||!Number.isFinite(state.position.x))return null;
    const gmst=satellite.gstime(date),geo=satellite.eciToGeodetic(state.position,gmst);
    if(!Number.isFinite(geo.height)||geo.height<0)return null;
    return {lat:geo.latitude*R,lon:wrap(geo.longitude*R),height:geo.height,speed:Math.hypot(state.velocity.x,state.velocity.y,state.velocity.z),ecf:satellite.eciToEcf(state.position,gmst)};
  }
  function solar(ms){
    const date=new Date(ms),[x,y,z]=satellite.sunPos(satellite.jday(date)).rsun;
    const v=satellite.eciToEcf({x,y,z},satellite.gstime(date)),n=Math.hypot(v.x,v.y,v.z);
    return {x:v.x/n,y:v.y/n,z:v.z/n,lat:Math.asin(v.z/n)*R,lon:Math.atan2(v.y,v.x)*R};
  }
  const lightAt=(s,lat,lon)=>Math.sin(lat*D)*s.z+Math.cos(lat*D)*(Math.cos(lon*D)*s.x+Math.sin(lon*D)*s.y);
  function look(p,s){if(!p)return null;const a=satellite.ecfToLookAngles({latitude:s.lat*D,longitude:s.lon*D,height:s.height||0},p.ecf);return {elevation:a.elevation*R,azimuth:(a.azimuth*R+360)%360,range:a.rangeSat};}
  function destination(lat,lon,bearing,angle){
    const a=lat*D,l=lon*D,b=bearing*D,c=angle*D;
    const phi=Math.asin(Math.sin(a)*Math.cos(c)+Math.cos(a)*Math.sin(c)*Math.cos(b));
    return [wrap((l+Math.atan2(Math.sin(b)*Math.sin(c)*Math.cos(a),Math.cos(c)-Math.sin(a)*Math.sin(phi)))*R),phi*R];
  }
  const footprint=(p,e=10)=>(Math.acos(6378.137/(6378.137+p.height)*Math.cos(e*D))-e*D)*R;
  function findPasses(record,station,from,to){
    const elevation=ms=>{const p=position(record,ms);return p?look(p,station).elevation:-90;};
    const step=20000,limit=10,first=elevation(from),events=[];
    let start=first>=limit?from:null,ongoing=first>=limit,peak=from,best=first,previous=from;
    const cross=(a,b,rising)=>{while(b-a>250){const m=(a+b)/2;if((elevation(m)>=limit)===rising)b=m;else a=m;}return (a+b)/2;};
    for(let ms=Math.min(from+step,to);previous<to;ms=Math.min(ms+step,to)){
      const el=elevation(ms);
      if(start===null&&el>=limit){start=cross(previous,ms,true);peak=ms;best=el;ongoing=false;}
      if(start!==null){
        if(el>best){best=el;peak=ms;}
        if(el<limit){
          const end=cross(previous,ms,false);let a=Math.max(start,peak-step),b=Math.min(end,peak+step);
          while(b-a>500){const l=(2*a+b)/3,r=(a+2*b)/3;if(elevation(l)<elevation(r))a=l;else b=r;}
          peak=(a+b)/2;events.push({start,end,peak,max:elevation(peak),ongoing,continues:false});start=null;best=-90;
        }
      }
      previous=ms;
    }
    if(start!==null)events.push({start,end:to,peak,max:best,ongoing,continues:true});
    return events;
  }
  root.OrbitCore={D,R,wrap,epoch,position,solar,lightAt,look,destination,footprint,findPasses};
  if(typeof module!=='undefined')module.exports=root.OrbitCore;
})(typeof self!=='undefined'?self:globalThis);
