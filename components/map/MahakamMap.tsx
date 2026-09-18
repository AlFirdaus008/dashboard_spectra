'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {ExpressionSpecification,GeoJSONSource,FilterSpecification} from 'maplibre-gl';
import type {Collection,Grid,Metadata} from '@/types/data';
import {colors,code} from '@/lib/data/client';
import {useTheme} from '@/components/theme/ThemeProvider';

maplibregl.setWorkerUrl('/vendor/maplibre/maplibre-gl-worker.mjs');

/**
 * Layer konteks = referensi visual saja (batas DAS, sungai, batas kabupaten,
 * poligon konsesi tambang/sawit). Tidak dipakai untuk skoring atau
 * reklasifikasi level R0-R5. Paket beku STEP54 tetap menjadi batas aplikasi
 * yang sah. Lihat public/data/context/context_manifest.json dan
 * context_manifest_concessions.json (sumber, hak redistribusi, keterbatasan
 * data konsesi tambang/sawit).
 */
const CONTEXT_BASE = '/data/context';

type LayerKey='basin'|'riversMajor'|'riversMinor'|'admin'|'policyOverlap'|'mining'|'palm';

const LAYER_MEMBERS:Record<LayerKey,string[]>={
  basin:['basin-fill','basin-outline'],
  riversMajor:['rivers-major','rivers-hit'],
  riversMinor:['rivers-minor'],
  admin:['admin-outline','admin-hit'],
  policyOverlap:['policy-overlap'],
  mining:['mining-fill','mining-outline'],
  palm:['palm-fill','palm-outline'],
};

const LAYER_TOGGLES:{key:LayerKey;label:string;hint:string}[]=[
  {key:'basin',label:'Batas DAS',hint:'Batas DAS Mahakam (BIG Atlas Wilayah Sungai)'},
  {key:'riversMajor',label:'Sungai utama',hint:'Sungai primer & sekunder (BIG RBI 1:250.000)'},
  {key:'riversMinor',label:'Anak sungai',hint:'Sungai tersier, dimuat saat dinyalakan'},
  {key:'admin',label:'Batas kabupaten',hint:'Batas kabupaten/kota yang beririsan dengan DAS'},
  {key:'policyOverlap',label:'Tumpang tindih kebijakan',hint:'Intensitas tumpang tindih izin tambang/sawit per grid (0-100% area grid). Evidence kontekstual, bukan jejak fisik di lapangan.'},
  {key:'mining',label:'Konsesi tambang',hint:'Poligon IUP (ESDM One Map), dimuat saat dinyalakan. Izin legal, bukan jejak fisik tambang di lapangan.'},
  {key:'palm',label:'Konsesi sawit',hint:'Poligon izin lokasi sawit (BIG KSP), dimuat saat dinyalakan. Izin legal, bukan jejak fisik perkebunan di lapangan.'},
];

// Layer opt-in yang datanya baru diambil (fetch) saat pertama kali dinyalakan,
// bukan pada muat awal peta, supaya payload awal tetap ringan.
const LAZY_SOURCE:Partial<Record<LayerKey,[string,string]>>={
  riversMinor:['rivers-minor','rivers_minor.geojson'],
  mining:['context-mining','mining_concessions.geojson'],
  palm:['context-palm','palm_concessions.geojson'],
};

const EMPTY:GeoJSON.FeatureCollection={type:'FeatureCollection',features:[]};

// Esri World Imagery: free, no API key, standard attribution. Optional
// basemap only -- never replaces the frozen web geometry, purely a visual
// reference for orientation (roads, tree cover, open-pit mining, rooftops).
const SATELLITE_TILE_URL='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTRIBUTION='Esri, Maxar, Earthstar Geographics';

type HoverInfo={title:string;sub:string};
export type FlyTo={bounds:[number,number,number,number];token:number};

export default function MahakamMap({data,selected,onSelect,metadata,reset,flyTo}:{data:Collection;selected:Grid|null;onSelect:(f:Grid)=>void;metadata:Metadata;reset:number;flyTo?:FlyTo|null}){
 const {isDark}=useTheme();
 const container=useRef<HTMLDivElement>(null);
 const map=useRef<maplibregl.Map|null>(null);
 const select=useRef(onSelect);select.current=onSelect;
 const markers=useRef<maplibregl.Marker[]>([]);
 const lazyLoaded=useRef<Record<string,boolean>>({});
 const frame=useRef<number|null>(null);

 const [ready,setReady]=useState(false);
 const [error,setError]=useState('');
 const [hover,setHover]=useState<HoverInfo|null>(null);
 const [contextState,setContextState]=useState<'loading'|'ready'|'partial'|'missing'>('loading');
 const [visible,setVisible]=useState<Record<LayerKey,boolean>>({
   basin:true,riversMajor:true,riversMinor:false,admin:true,policyOverlap:true,mining:false,palm:false,
 });
 const [basemap,setBasemap]=useState<'map'|'satellite'>('map');

 const setBasemapMode=(mode:'map'|'satellite')=>{
   setBasemap(mode);
   const m=map.current;if(!m)return;
   if(m.getLayer('satellite'))m.setLayoutProperty('satellite','visibility',mode==='satellite'?'visible':'none');
   if(m.getLayer('background'))m.setLayoutProperty('background','visibility',mode==='satellite'?'none':'visible');
 };

 const applyVisibility=useCallback((key:LayerKey,on:boolean)=>{
   const m=map.current;if(!m)return;
   LAYER_MEMBERS[key].forEach(id=>{
     if(m.getLayer(id))m.setLayoutProperty(id,'visibility',on?'visible':'none');
   });
   if(key==='admin'){
     markers.current.forEach(marker=>{
       const el=marker.getElement();
       el.style.display=on?'':'none';
     });
   }
 },[]);

 const loadLazyContext=useCallback(async(sourceId:string,file:string)=>{
   const m=map.current;
   if(!m||lazyLoaded.current[sourceId])return;
   const source=m.getSource(sourceId) as GeoJSONSource|undefined;
   if(!source)return;
   try{
     const response=await fetch(`${CONTEXT_BASE}/${file}`);
     if(!response.ok)throw new Error(String(response.status));
     await source.setData(await response.json());
     lazyLoaded.current[sourceId]=true;
   }catch{
     console.warn(`[map] ${file} gagal dimuat`);
   }
 },[]);

 const toggle=(key:LayerKey)=>{
   const next=!visible[key];
   setVisible(current=>({...current,[key]:next}));
   applyVisibility(key,next);
   const lazy=LAZY_SOURCE[key];
   if(lazy&&next)void loadLazyContext(lazy[0],lazy[1]);
 };

 useEffect(()=>{
   if(!container.current)return;
   let m:maplibregl.Map;
   try{
     m=new maplibregl.Map({
       container:container.current,
       style:{
         version:8,
         sources:{},
         layers:[{id:'background',type:'background',paint:{'background-color':isDark?'#0d181f':'#eaf0f3'}}],
       },
       bounds:metadata.bounds,
       fitBoundsOptions:{padding:35},
       attributionControl:false,
     });
     map.current=m;
     if(process.env.NODE_ENV!=='production'){(window as unknown as {__mahakamMap?:maplibregl.Map}).__mahakamMap=m;}
     m.addControl(new maplibregl.NavigationControl(),'top-right');
     m.addControl(new maplibregl.ScaleControl({unit:'metric'}));

     m.on('load',()=>{
       // ---- sumber ------------------------------------------------------
       m.addSource('grids',{type:'geojson',data,promoteId:'grid_id',tolerance:0});
       m.addSource('context-basin',{type:'geojson',data:EMPTY});
       m.addSource('context-admin',{type:'geojson',data:EMPTY});
       m.addSource('context-rivers-major',{type:'geojson',data:EMPTY});
       m.addSource('context-rivers-minor',{type:'geojson',data:EMPTY});
       m.addSource('context-mining',{type:'geojson',data:EMPTY});
       m.addSource('context-palm',{type:'geojson',data:EMPTY});
       m.addSource('satellite',{type:'raster',tiles:[SATELLITE_TILE_URL],tileSize:256,maxzoom:19,attribution:SATELLITE_ATTRIBUTION});

       // ---- urutan layer (bawah -> atas) --------------------------------
       // Satelit duduk langsung di atas background flat; keduanya saling
       // eksklusif lewat toggle visibility, tidak pernah tampil bersamaan.
       // Konteks diletakkan di atas fill grid agar sungai tetap terbaca,
       // tetapi di bawah outline/selection agar sorotan tetap dominan.
       // Wash tumpang tindih kebijakan duduk di antara fill tier dan outline,
       // supaya menimpa warna tier tapi tidak menutupi batas grid/sungai.
       m.addLayer({id:'satellite',type:'raster',source:'satellite',
         layout:{visibility:'none'},paint:{'raster-opacity':1}});
       m.addLayer({id:'basin-fill',type:'fill',source:'context-basin',
         paint:{'fill-color':'#126e72','fill-opacity':isDark?0.12:0.06}});
       m.addLayer({id:'basin-outline',type:'line',source:'context-basin',
         paint:{'line-color':isDark?'#2fa385':'#126e72','line-width':1.6,'line-opacity':0.75}});

       const expression=['match',['get','recommendation_level'],
         ...Object.entries(colors).flatMap(([k,v])=>[+k,v]),'#8b9aa7'] as unknown as ExpressionSpecification;
       m.addLayer({id:'grids',type:'fill',source:'grids',
         paint:{'fill-color':expression,'fill-opacity':0.8}});

       // Wash on top of the tier fill: opacity scales with max_policy_overlap_pct
       // (0-100, already authorized for dashboard use). No concession polygons are
       // shown here, only the per-grid overlap intensity already in the frozen data.
       m.addLayer({id:'policy-overlap',type:'fill',source:'grids',
         filter:['>',['coalesce',['get','max_policy_overlap_pct'],0],0],
         paint:{'fill-color':'#e2a83f',
           'fill-opacity':['interpolate',['linear'],['coalesce',['get','max_policy_overlap_pct'],0],0,0,100,isDark?0.6:0.5]}});

       m.addLayer({id:'outlines',type:'line',source:'grids',
         paint:{'line-color':isDark?'#0e1d27':'#ffffff','line-width':0.35,'line-opacity':isDark?0.6:0.45}});

       // Poligon konsesi (opt-in, dimuat saat dinyalakan): referensi visual
       // lokasi izin, bukan jejak fisik tambang/perkebunan di lapangan.
       m.addLayer({id:'mining-fill',type:'fill',source:'context-mining',
         layout:{visibility:'none'},
         paint:{'fill-color':'#e26c48','fill-opacity':0.22}});
       m.addLayer({id:'mining-outline',type:'line',source:'context-mining',
         layout:{visibility:'none'},
         paint:{'line-color':'#e26c48','line-width':1.2,'line-opacity':0.85}});
       m.addLayer({id:'palm-fill',type:'fill',source:'context-palm',
         layout:{visibility:'none'},
         paint:{'fill-color':'#d4a326','fill-opacity':0.22}});
       m.addLayer({id:'palm-outline',type:'line',source:'context-palm',
         layout:{visibility:'none'},
         paint:{'line-color':'#d4a326','line-width':1.2,'line-opacity':0.85}});

       m.addLayer({id:'rivers-minor',type:'line',source:'context-rivers-minor',
         layout:{visibility:'none'},
         paint:{
           'line-color':isDark?'#4f7d96':'#8fb8cc','line-width':['interpolate',['linear'],['zoom'],7,0.25,11,0.7],
           'line-opacity':0.7,
         }});
       m.addLayer({id:'rivers-major',type:'line',source:'context-rivers-major',
         layout:{'line-cap':'round','line-join':'round'},
         paint:{
           'line-color':['match',['get','cls'],'primary',isDark?'#3cb5dc':'#2f7f9e','secondary',isDark?'#5aa8ca':'#6aa7c0',isDark?'#6b9db8':'#8fb8cc'],
           'line-width':['interpolate',['linear'],['zoom'],
             7,['match',['get','cls'],'primary',1.1,'secondary',0.45,0.4],
             11,['match',['get','cls'],'primary',3.2,'secondary',1.5,0.4]],
           'line-opacity':0.9,
         }});

       // Layer tak terlihat untuk hit-test (hover nama wilayah / sungai).
       const hit:maplibregl.LayerSpecification[]=[
         {id:'rivers-hit',type:'line',source:'context-rivers-major',minzoom:0,
          paint:{'line-color':'#000000','line-width':9,'line-opacity':0.01}},
         {id:'admin-hit',type:'fill',source:'context-admin',
          paint:{'fill-color':'#000000','fill-opacity':0.01}},
       ];
       hit.forEach(layer=>m.addLayer(layer));

       m.addLayer({id:'admin-outline',type:'line',source:'context-admin',
         paint:{
           'line-color':isDark?'#c29d59':'#8a6d3b','line-width':1,'line-opacity':0.8,
           'line-dasharray':[2,1.6],
         }});
       m.addLayer({id:'selection',type:'line',source:'grids',
         filter:['==','grid_id',''],
         paint:{'line-color':isDark?'#52e3be':'#122d43','line-width':3}});

       // ---- interaksi ---------------------------------------------------
       m.on('click','grids',event=>{
         const id=event.features?.[0]?.properties?.grid_id;
         const source=m.getSource('grids') as GeoJSONSource;
         void source.getData().then(payload=>{
           const found=(payload as Collection).features.find(f=>f.properties.grid_id===id);
           if(found)select.current(found);
         });
       });

       m.on('mousemove',event=>{
         if(frame.current!==null)return;
         frame.current=requestAnimationFrame(()=>{
           frame.current=null;
           const point=event.point;
           const queryLayers=['grids','rivers-hit','admin-hit','mining-fill','palm-fill'].filter(id=>m.getLayer(id));
           if(!queryLayers.length)return;
           const found=m.queryRenderedFeatures(point,{layers:queryLayers});
           const grid=found.find(f=>f.layer?.id==='grids');
           const river=found.find(f=>f.layer?.id==='rivers-hit');
           const admin=found.find(f=>f.layer?.id==='admin-hit');
           const mining=found.find(f=>f.layer?.id==='mining-fill');
           const palm=found.find(f=>f.layer?.id==='palm-fill');

           const parts:string[]=[];
           const district=admin?.properties?.name;
           if(district)parts.push(String(district));
           const riverName=river?.properties?.name;
           if(riverName)parts.push(`Sungai ${String(riverName)}`);
           const miningName=mining?.properties?.nama_usaha;
           if(miningName)parts.push(`Tambang: ${String(miningName)}`);
           const palmName=palm?.properties?.nama_perusahaan;
           if(palmName)parts.push(`Sawit: ${String(palmName)}`);
           const sub=parts.join(' · ');

           if(grid){
             const p=grid.properties as Record<string,unknown>;
             setHover({title:`${String(p.grid_id)} · ${code(Number(p.recommendation_level))}`,sub});
             m.getCanvas().style.cursor='pointer';
           }else if(sub){
             setHover({title:sub,sub:''});
             m.getCanvas().style.cursor='';
           }else{
             setHover(null);
             m.getCanvas().style.cursor='';
           }
         });
       });

       m.on('mouseout',()=>{setHover(null);m.getCanvas().style.cursor='';});
       setReady(true);

       // ---- muat layer konteks (tidak fatal bila gagal) ------------------
       void (async()=>{
         const files:[string,string][]=[
           ['context-basin',`${CONTEXT_BASE}/basin.geojson`],
           ['context-rivers-major',`${CONTEXT_BASE}/rivers_major.geojson`],
           ['context-admin',`${CONTEXT_BASE}/admin_kabupaten.geojson`],
         ];
         const results=await Promise.allSettled(files.map(async([id,url])=>{
           const response=await fetch(url);
           if(!response.ok)throw new Error(`${url} ${response.status}`);
           const payload=await response.json();
           const source=m.getSource(id) as GeoJSONSource|undefined;
           if(source)await source.setData(payload);
           if(id==='context-admin')addDistrictLabels(m,payload,markers.current);
         }));
         const failed=results.filter(r=>r.status==='rejected').length;
         setContextState(failed===0?'ready':failed===files.length?'missing':'partial');
         if(failed)console.warn('[map] sebagian layer konteks gagal dimuat');
       })();
     });

     m.on('error',event=>setError(event.error.message));
   }catch(caught){setError(String(caught));}
   return()=>{
     markers.current.forEach(marker=>marker.remove());
     markers.current=[];
     if(frame.current!==null)cancelAnimationFrame(frame.current);
     m?.remove();
     map.current=null;
   };
 },[metadata,applyVisibility]);

 useEffect(()=>{
   if(!ready)return;
   const source=map.current?.getSource('grids') as GeoJSONSource|undefined;
   void source?.setData(data).catch(caught=>setError(String(caught)));
 },[data,ready]);

 useEffect(()=>{
   if(!ready)return;
   map.current?.setFilter('selection',['==','grid_id',selected?.properties.grid_id??''] as FilterSpecification);
   if(selected){
     const ring=selected.geometry.type==='Polygon'?selected.geometry.coordinates[0]:selected.geometry.coordinates[0][0];
     const bounds=new maplibregl.LngLatBounds();
     ring.forEach(point=>bounds.extend([point[0],point[1]]));
     map.current?.fitBounds(bounds,{padding:100,maxZoom:11,duration:600});
   }
 },[selected,ready]);

 useEffect(()=>{
   map.current?.fitBounds(metadata.bounds,{padding:35,duration:600});
 },[reset,metadata]);

 useEffect(()=>{
   if(!ready||!flyTo)return;
   map.current?.fitBounds(flyTo.bounds,{padding:60,maxZoom:13,duration:800});
 },[flyTo,ready]);

  useEffect(()=>{
    const m=map.current;
    if(!m||!ready)return;
    try{
      if(m.getLayer('background'))m.setPaintProperty('background','background-color',isDark?'#0d181f':'#eaf0f3');
      if(m.getLayer('basin-fill'))m.setPaintProperty('basin-fill','fill-opacity',isDark?0.12:0.06);
      if(m.getLayer('basin-outline'))m.setPaintProperty('basin-outline','line-color',isDark?'#2fa385':'#126e72');
      if(m.getLayer('outlines')){
        m.setPaintProperty('outlines','line-color',isDark?'#0e1d27':'#ffffff');
        m.setPaintProperty('outlines','line-opacity',isDark?0.6:0.45);
      }
      if(m.getLayer('policy-overlap'))m.setPaintProperty('policy-overlap','fill-opacity',
        ['interpolate',['linear'],['coalesce',['get','max_policy_overlap_pct'],0],0,0,100,isDark?0.6:0.5]);
      if(m.getLayer('rivers-major'))m.setPaintProperty('rivers-major','line-color',[
        'match',['get','cls'],
        'primary',isDark?'#3cb5dc':'#2f7f9e',
        'secondary',isDark?'#5aa8ca':'#6aa7c0',
        isDark?'#6b9db8':'#8fb8cc'
      ]);
      if(m.getLayer('rivers-minor'))m.setPaintProperty('rivers-minor','line-color',isDark?'#4f7d96':'#8fb8cc');
      if(m.getLayer('admin-outline'))m.setPaintProperty('admin-outline','line-color',isDark?'#c29d59':'#8a6d3b');
      if(m.getLayer('selection'))m.setPaintProperty('selection','line-color',isDark?'#52e3be':'#122d43');
    }catch(err){
      console.warn('[map] dynamic theme update error:',err);
    }
  },[isDark,ready]);

 return (
  <div className="map-wrap">
    <div ref={container} className="map-canvas" aria-label="Peta interaktif grid DAS Mahakam"/>
    <div className="map-note">DAS MAHAKAM <span>EPSG:4326 · frozen web geometry</span></div>

    <div className="map-layers" role="group" aria-label="Kendali layer peta">
      <div className="map-basemap-toggle" role="group" aria-label="Jenis latar peta">
        <button type="button" className={basemap==='map'?'is-active':''} onClick={()=>setBasemapMode('map')}>Peta</button>
        <button type="button" className={basemap==='satellite'?'is-active':''} onClick={()=>setBasemapMode('satellite')} title="Citra satelit (Esri World Imagery)">Satelit</button>
      </div>

      <span className="map-layers-title">Layer</span>
      {LAYER_TOGGLES.map(item=>(
        <button
          key={item.key}
          type="button"
          title={item.hint}
          aria-pressed={visible[item.key]}
          className={`map-layer${visible[item.key]?' is-on':''}`}
          onClick={()=>toggle(item.key)}
        >
          <span className="map-layer-dot" aria-hidden="true"/>
          {item.label}
        </button>
      ))}

      <div className="map-context-note">
        Layer tambahan: referensi visual &amp; evidence yang sudah ada, <strong>bukan skor atau rekomendasi baru</strong>
        {contextState==='loading'&&' · memuat…'}
        {contextState==='partial'&&' · sebagian gagal dimuat'}
        {contextState==='missing'&&' · tidak tersedia'}
      </div>
    </div>

    {hover&&(
      <div className="map-hover">
        <strong>{hover.title}</strong>
        {hover.sub&&<span>{hover.sub}</span>}
      </div>
    )}

    {error&&<div role="alert" className="map-error">Peta tidak tersedia: {error}</div>}

    <div className="map-credit">
      Grid hidrologi terverifikasi · Konteks: BIG (Atlas Wilayah Sungai, RBI 1:250.000, Batas Wilayah Administrasi, KSP Izin Lokasi Sawit), Kementerian ESDM (One Map WIUP)
      {basemap==='satellite'&&` · Citra satelit: ${SATELLITE_ATTRIBUTION}`}
    </div>
  </div>
 );
}

/** Label nama kabupaten sebagai marker HTML (peta tidak memuat glyph font). */
function addDistrictLabels(m:maplibregl.Map,payload:GeoJSON.FeatureCollection,store:maplibregl.Marker[]){
  payload.features.forEach(feature=>{
    const props=feature.properties as Record<string,unknown>|null;
    if(!props)return;
    const lng=props.lx,lat=props.ly,name=props.name;
    if(typeof lng!=='number'||typeof lat!=='number'||!name)return;
    const area=typeof props.km2==='number'?props.km2:0;
    const element=document.createElement('div');
    element.className=area<100?'map-label is-minor':'map-label';
    element.textContent=String(name);
    store.push(new maplibregl.Marker({element}).setLngLat([lng,lat]).addTo(m));
  });
}
