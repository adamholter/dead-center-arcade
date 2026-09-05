const fs=require('node:fs');
const {cmdRegPack}=require('regpack');
const source=fs.readFileSync('compact/game.js','utf8');
const packed=cmdRegPack(source,{wrapInSetInterval:true,timeVariableName:'t',crushGainFactor:1,crushLengthFactor:0,crushCopiesFactor:0});
// BOM declares UTF-8 in three bytes, including when opened directly from disk.
const html='\ufeff<body bgcolor=0><canvas id=c style=width:90vmin;image-rendering:pixelated><script>'+packed+'</script>';
const bytes=Buffer.byteLength(html);
if(bytes>=1024)throw Error(`Byte budget exceeded: ${bytes}`);
fs.writeFileSync('public/1k.html',html);
console.log(`${bytes} bytes total, including HTML, CSS, UTF-8 BOM and unpacker.`);
