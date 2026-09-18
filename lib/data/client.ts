import type {Collection,Metadata} from '@/types/data';
export const base='/data/mahakam/';
const cache=new Map<string,Promise<Collection>>();
let metadataPromise:Promise<Metadata>|null=null;
export function loadMetadata():Promise<Metadata>{if(!metadataPromise)metadataPromise=(async()=>{const r=await fetch(base+'metadata.json');if(!r.ok)throw Error('Metadata presentasi gagal dimuat.');const m=await r.json();if(m.gate?.status!=='PASS'||m.qa?.status!=='PASS'||m.gate.frontend_dashboard_consumption_authorized!==true)throw Error('Paket data ini tidak sah untuk digunakan.');return m as Metadata;})().catch(e=>{metadataPromise=null;throw e;});return metadataPromise;}
export function loadData(m:Metadata,scope:'targets'|'all'):Promise<Collection>{if(!cache.has(scope))cache.set(scope,new Promise<Collection>((resolve,reject)=>{const worker=new Worker('/workers/data-worker.mjs',{type:'module'});worker.onmessage=e=>{worker.terminate();e.data.ok?resolve(e.data.data as Collection):reject(Error(e.data.error));};worker.onerror=e=>{worker.terminate();reject(Error(e.message));};worker.postMessage({url:base+m.files[scope],metadata:m,scope});}).catch(e=>{cache.delete(scope);throw e;}));return cache.get(scope)!;}
export const colors:Record<number,string>={99:'#8b9aa7',1:'#922f58',2:'#cc6041',3:'#b28a22',4:'#258a87',5:'#497cb1'};
export const code=(n:number)=>n===99?'R0':`R${n}`;
export const human=(s:unknown)=>String(s??'Not supplied').replaceAll('_',' ').toLowerCase().replace(/^./,c=>c.toUpperCase());
