import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {validateCollection} from '../lib/validation/validate.mjs';
const source=path.resolve('../documentation/step54_web_delivery'), dest=path.resolve('public/data/mahakam');
const read=async n=>(await readFile(path.join(source,n),'utf8')).replace(/^\uFEFF/,'');
const json=async n=>JSON.parse(await read(n));
function csv(s){const rows=[];let row=[],v='',q=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++;}else q=!q;}else if(c===','&&!q){row.push(v);v='';}else if(c==='\n'&&!q){row.push(v.replace(/\r$/,''));rows.push(row);row=[];v='';}else v+=c;}if(v){row.push(v.replace(/\r$/,''));rows.push(row);}const keys=rows.shift();return rows.filter(r=>r.length===keys.length).map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]])));}
const files=await readdir(source), manifest=csv(await read('STEP54_WEB_DELIVERY_MANIFEST_SHA256.csv'));
for(const r of manifest){const b=await readFile(path.join(source,r.file_name));if(b.length!==+r.size_bytes||createHash('sha256').update(b).digest('hex')!==r.sha256)throw Error(`Integrity failure: ${r.file_name}`);}
const contract=await json('STEP54_WEB_PRESENTATION_CONTRACT.json'),gate=await json('STEP54_WEB_DELIVERY_GATE.json'),qa=await json('STEP54_WEB_DELIVERY_QA.json');
if(gate.status!=='PASS'||qa.status!=='PASS'||gate.frontend_dashboard_consumption_authorized!==true)throw Error('STEP54 is not authorized for consumption.');
const allName=files.find(n=>n.includes('ALL_NODES')&&n.endsWith('.geojson')),targetName=files.find(n=>n.includes('RECOMMENDATION_TARGETS')&&n.endsWith('.geojson'));
const all=await json(allName),targets=await json(targetName),levels={};
for(const f of all.features)levels[f.properties.recommendation_level]=(levels[f.properties.recommendation_level]||0)+1;
const counts={total:all.features.length,targets:all.features.filter(f=>f.properties.screening_target).length,reference:levels[99],levels};
if(counts.total!==qa.web_node_count||counts.targets!==qa.web_target_count)throw Error('QA count mismatch');
for(const r of csv(await read('STEP54_RECOMMENDATION_DISTRIBUTION_AUDIT.csv')))if(levels[r.recommendation_level]!==+r.web_step54||r.match!=='True')throw Error('Audit mismatch');
const aliases=Object.fromEntries(csv(await read('STEP54_FIELD_ALIASES.csv')).map(r=>[r.field,r.alias]));
const bounds=[Infinity,Infinity,-Infinity,-Infinity];function coordinates(a){if(typeof a[0]==='number'){bounds[0]=Math.min(bounds[0],a[0]);bounds[1]=Math.min(bounds[1],a[1]);bounds[2]=Math.max(bounds[2],a[0]);bounds[3]=Math.max(bounds[3],a[1]);}else a.forEach(coordinates);}all.features.forEach(f=>coordinates(f.geometry.coordinates));
const metadata={contract,gate,qa,aliases,counts,bounds,claims:csv(await read('STEP54_CLAIM_BOUNDARY_MATRIX.csv')),files:{all:allName,targets:targetName},options:Object.fromEntries(['admin_district_name','admin_province_name','coordination_scope'].map(k=>[k,[...new Set(all.features.map(f=>f.properties[k]).filter(Boolean))].sort()])),provenance:{source_step:53,presentation_step:54,web_crs:'EPSG:4326',scientific_recomputation:false},manifest};
validateCollection(all,metadata,'all');validateCollection(targets,metadata,'targets');
const canonical=new Map(all.features.map(f=>[f.properties.grid_id,JSON.stringify(f)]));for(const f of targets.features)if(canonical.get(f.properties.grid_id)!==JSON.stringify(f))throw Error('Target differs from canonical web record');
await mkdir(dest,{recursive:true});const copies=[];
for(const n of files){if(n.endsWith('.gpkg'))continue;await copyFile(path.join(source,n),path.join(dest,n));copies.push({source:`documentation/step54_web_delivery/${n}`,destination:`web-dashboard/public/data/mahakam/${n}`});}
await writeFile(path.join(dest,'metadata.json'),JSON.stringify(metadata));
await writeFile('COPY_MANIFEST.json',JSON.stringify(copies,null,2));
console.log(JSON.stringify({status:'PASS',counts,bounds,copied:copies.length,originalHashesVerified:manifest.length},null,2));
