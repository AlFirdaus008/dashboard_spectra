import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public/workers',{recursive:true});
for(const [src,name] of [['lib/validation/validate.mjs','validate.mjs'],['lib/data/data-worker.mjs','data-worker.mjs']])await copyFile(src,`public/workers/${name}`);
