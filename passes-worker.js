importScripts('satellite.js','orbit-core.js');
self.onmessage=({data})=>{
  const {requestId,rows,station,from,to}=data,events=[],errors=[];
  for(const omm of rows){try{const record=satellite.json2satrec(omm);for(const p of OrbitCore.findPasses(record,station,from,to))events.push({...p,id:Number(omm.NORAD_CAT_ID)});}catch{errors.push(Number(omm.NORAD_CAT_ID));}}
  events.sort((a,b)=>a.start-b.start||a.id-b.id);
  self.postMessage({requestId,events,from,to,errors});
};
