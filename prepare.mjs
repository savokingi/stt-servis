import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
const routes=['catalog','company','contact','conditions','work','privacy','equipment/mini-2','equipment/mini-35','equipment/mini-5','equipment/tracked','equipment/wheeled','equipment/auger','equipment/hammer','equipment/mower','tasks/trench','tasks/level','tasks/drill','tasks/demolition','tasks/loading','tasks/clean','services/transport','services/landscape','services/repair','services/parts','journal','journal/access','journal/shift','journal/choice'];
for(const route of routes){mkdirSync('dist/'+route,{recursive:true});copyFileSync('dist/index.html','dist/'+route+'/index.html');}
copyFileSync('dist/index.html','dist/404.html');
writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\n');
console.log(`Prepared ${routes.length+1} pages`);
