import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';

const read=file=>readFileSync(file,'utf8');
const js=read('dist/app.js');
new vm.Script(js);
new vm.Script(read('dist/brand-home.js'));
new vm.Script(read('dist/variants/landing.js'));
new vm.Script(read('client-variants.js'));
assert(existsSync('dist/assets/telegram-avatar.jpg'),'Original brand image missing');
for(const m of js.matchAll(/(?:image|second|photo):'([^']+)'/g))assert(existsSync('dist/assets/'+m[1]),'Missing image: '+m[1]);
for(const m of read('dist/styles.css').matchAll(/url\(['"]?\/([^'"\)]+)['"]?\)/g))assert(existsSync('dist/'+m[1]),'Missing CSS asset: '+m[1]);
for(const name of ['71.png','71_1.jpg','71_2.png','71_3.png','97.jpg','97_1.jpg'])assert(existsSync('dist/assets/'+name),'Missing product preview image: '+name);

const walk=d=>readdirSync(d).flatMap(n=>{const f=path.join(d,n);return statSync(f).isDirectory()?walk(f):[f]});
const pages=walk('dist').filter(f=>path.basename(f)==='index.html');
assert.equal(pages.length,34,'Expected 34 addressable pages');
assert(!js.includes('Тестовый объект'),'Test data must not be in source');
assert(js.includes('data-copy-request'),'Request review flow missing');
assert(js.includes('showModal()'),'Dialog interaction missing');
assert(read('dist/index.html').includes('brand-home.js'),'Brand homepage must load');

const hub=read('dist/variants/index.html');
assert(hub.includes('stt-ucoz-4-templates-v2.zip'),'Four-layout archive link missing');
assert(hub.includes('/variants/4/'),'Fourth layout not linked');
for(let i=1;i<=4;i++){
 const p=read(`dist/variants/${i}/index.html`);
 assert.equal((p.match(/class="stt2-seo"/g)||[]).length,6,'Each concept needs six SEO sections');
 assert(p.includes('stt2-documents'),'Document and application module missing');
 assert(p.includes('stt2-form'),'Native form slot preview missing');
 assert(p.includes('data-stt2-gallery'),'Gallery interactions missing');
 for(const m of p.matchAll(/(?:src|href)="(\/assets\/[^"#?]+)"/g))assert(existsSync('dist'+m[1]),'Missing concept asset: '+m[1]);
}

const cms=read('dist/variants/downloads/global-STT_PAGE.txt');
for(const v of ['$ENTRY_TITLE$','$BRIEF$','$PRICE$','$PRICE_RAW$','$DESCRIPTION$','$SPEC$','$PHOTO_10$','$OTHER9$','$MFORM_5$','$OPTIONS$'])assert(cms.includes(v),'Expected uCoz field missing: '+v);
assert(!/\$OTHER(?:1[0-9]|20)\$/.test(cms),'Unsupported OTHER10–OTHER20 field remains');
assert(!cms.includes('$GLOBAL_DOGOVOR$')&&!cms.includes('$GLOBAL_OPLATA$')&&!cms.includes('$GLOBAL_DOSTAVKA$'),'Nested global blocks are unsupported');
assert(cms.includes('Product')&&cms.includes('Service')&&cms.includes('BreadcrumbList'),'Product, service and breadcrumb microdata missing');
assert(!cms.includes('AggregateOffer')&&!cms.includes('aggregateRating')&&!cms.includes('LocalBusiness'),'Unverified JSON-LD data remains');
assert(read('dist/variants/downloads/head-og.txt').includes('og:image'),'Open Graph image missing');
assert(existsSync('dist/variants/downloads/stt-ucoz-4-templates-v2.zip'),'Four-layout package missing');
assert(existsSync('dist/variants/downloads/README.txt'),'Installation README missing');
let depth=0;
for(const token of cms.matchAll(/<\?(if\(|else\?|endif\?)/g)){if(token[1]==='if(')depth++;if(token[1]==='endif?')depth--;assert(depth>=0,'Unbalanced uCoz conditions');}
assert.equal(depth,0,'Unclosed uCoz condition');
console.log(JSON.stringify({syntax:'passed',assets:'passed',pages:pages.length,layouts:4,dispatch:'passed',documents:'configured'}));
