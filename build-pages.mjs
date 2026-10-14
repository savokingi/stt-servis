import {cpSync,readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs';
import path from 'node:path';
let base=process.env.PAGES_BASE_PATH||'';
const baseFlag=process.argv.indexOf('--base');
if(baseFlag!==-1)base=process.argv[baseFlag+1]??'';
base=base==='/'?'':base.replace(/\/$/,'');
if(base&&!/^\/[a-zA-Z0-9._-]+$/.test(base))throw new Error('Base path must be empty or /repository-name');
const output=path.resolve('pages');
if(output!==path.join(process.cwd(),'pages'))throw new Error('Invalid build output');
mkdirSync(output,{recursive:true});
cpSync('dist',output,{recursive:true});
const walk=d=>readdirSync(d).flatMap(n=>{const f=path.join(d,n);return statSync(f).isDirectory()?walk(f):[f]});
for(const file of walk(output)){
  if(file.endsWith('.html')){let s=readFileSync(file,'utf8');s=s.replace('data-base=""',`data-base="${base}"`);s=s.replace(/(href|src)="\/(?!\/)/g,`$1="${base}/`);writeFileSync(file,s);}
  if(file.endsWith('.css')){let s=readFileSync(file,'utf8');s=s.replace(/url\(['"]?\/assets\//g,`url('${base}/assets/`);writeFileSync(file,s);}
}
writeFileSync(path.join(output,'.nojekyll'),'');
writeFileSync(path.join(output,'build-info.json'),JSON.stringify({host:'GitHub Pages',base,generated:new Date().toISOString()},null,2));
console.log(JSON.stringify({output,base,host:'GitHub Pages'}));
