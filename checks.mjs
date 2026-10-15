import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
const js=readFileSync('dist/app.js','utf8');
new vm.Script(js);
new vm.Script(readFileSync('dist/brand-home.js','utf8'));
assert(existsSync('dist/assets/telegram-avatar.jpg'),'Original brand image missing');
for(const m of js.matchAll(/(?:image|second|photo):'([^']+)'/g))assert(existsSync('dist/assets/'+m[1]),'Missing image: '+m[1]);
for(const m of readFileSync('dist/styles.css','utf8').matchAll(/url\(['"]?\/([^'"\)]+)['"]?\)/g))assert(existsSync('dist/'+m[1]),'Missing CSS asset: '+m[1]);
const walk=(d)=>readdirSync(d).flatMap(n=>{const f=path.join(d,n);return statSync(f).isDirectory()?walk(f):[f]});
const pages=walk('dist').filter(f=>path.basename(f)==='index.html');
assert(pages.length===33,'Expected 33 addressable pages');
assert(!js.includes('Тестовый объект'),'Test data must not be in source');
assert(js.includes('data-copy-request'),'Request review flow missing');
assert(js.includes('showModal()'),'Dialog interaction missing');
assert(readFileSync('dist/index.html','utf8').includes('brand-home.js'),'Brand homepage must load');
new vm.Script(readFileSync('dist/variants/landing.js','utf8'));
for(let i=1;i<=3;i++){
 const p=readFileSync(`dist/variants/${i}/index.html`,'utf8');
 assert((p.match(/data-seo="/g)||[]).length===6,'Each concept needs six SEO paragraphs');
 for(const m of p.matchAll(/(?:src|href)="(\/assets\/[^"#?]+)"/g))assert(existsSync('dist'+m[1]),'Missing concept asset: '+m[1]);
 const cms=readFileSync(`dist/variants/downloads/template-${i}.txt`,'utf8');
 for(const v of ['$ENTRY_TITLE$','$BRIEF$','$PRICE$','$PRICE_RAW$','$DESCRIPTION$','$GLOBAL_AHEADER$','$GLOBAL_BFOOTER$','$MFORM_5$','$OTHER18$','$OPTIONS$'])assert(cms.includes(v),'CMS field missing: '+v);
 assert((cms.match(/\$MFORM_5\$/g)||[]).length===1,'Duplicate form IDs');
 assert(cms.includes("add2Basket('$ID$','id')"),'Native checkout missing');
 let depth=0;
 for(const token of cms.matchAll(/<\?(if\(|else\?|endif\?)/g)){if(token[1]==='if(')depth++;if(token[1]==='endif?')depth--;assert(depth>=0,'Unbalanced CMS conditions');}
 assert(depth===0,'Unclosed CMS condition');
}
console.log(JSON.stringify({syntax:'passed',assets:'passed',pages:pages.length,requestFlow:'present'}));
