import http from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[3]||'dist');
const port=Number(process.argv[2]||4197);
const mount=(process.argv[4]||'').replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer((req,res)=>{try{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(mount){if(rel!==mount&&!rel.startsWith(mount+'/')){res.writeHead(404).end();return;}rel=rel.slice(mount.length)||'/';}let file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');if(!existsSync(file)){if(path.extname(file)){res.writeHead(404).end();return;}file=path.join(root,'index.html');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(readFileSync(file));}catch{res.writeHead(500).end();}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}${mount}/`));
