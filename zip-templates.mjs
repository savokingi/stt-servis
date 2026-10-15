import {readFileSync,writeFileSync} from 'node:fs';
import {deflateRawSync} from 'node:zlib';

// Minimal ZIP writer for this fixed, public set of UTF-8 template files.
// No credentials, local source paths or runtime data enter the package.
export function packageTemplates(directory){
 const names=['template-1.txt','template-2.txt','template-3.txt','stt-landing.css','stt-landing.js','description-7t.html','README.txt'];
 const table=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 const crc32=data=>{let crc=0xffffffff;for(const b of data)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;};
 const locals=[],central=[];let offset=0;
 for(const filename of names){
  const name=Buffer.from(filename),raw=readFileSync(directory+'/'+filename),compressed=deflateRawSync(raw),crc=crc32(raw);
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(((2026-1980)<<9)|(10<<5)|15,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(name.length,26);
  locals.push(header,name,compressed);
  const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50,0);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(((2026-1980)<<9)|(10<<5)|15,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(compressed.length,20);record.writeUInt32LE(raw.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);central.push(record,name);offset+=header.length+name.length+compressed.length;
 }
 const directoryBytes=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(directoryBytes.length,12);end.writeUInt32LE(offset,16);
 writeFileSync(directory+'/stt-product-templates.zip',Buffer.concat([...locals,directoryBytes,end]));
}
