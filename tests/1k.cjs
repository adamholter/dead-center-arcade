const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const bytes=fs.readFileSync('public/1k.html');assert.ok(bytes.length<1024);
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
 try{
 const page=await browser.newPage({viewport:{width:900,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Drive the shipped, unpacked interval deterministically. No substitute engine.
 await page.addInitScript(()=>{window.__deaths=0;history.go=()=>window.__deaths++;window.setInterval=code=>{window.__program=code;window.__tick=()=>typeof code==='function'?code():(0,eval)(code);return 1;}});
 const url=process.env.GAME_URL||'file://'+process.cwd()+'/public/1k.html';
 // CDP's text response drops the BOM. Fetch raw bytes for the file-size audit.
 if(url.startsWith('http'))assert.deepEqual(Buffer.from(await(await fetch(url)).arrayBuffer()),bytes);
 await page.goto(url);
 await page.waitForFunction(()=>window.__tick);await page.evaluate(()=>__tick());
 assert.equal(await page.evaluate(()=>document.characterSet),'UTF-8');
 const names=await page.evaluate(()=>{const m=__program.match(/d=hypot\((\w+),(\w+)\)/);return {x:m[1],y:m[2],score:__program.match(/(\w+)\+=100/)[1],wave:__program.match(/(\w+)\*=\.95/)[1],impact:__program.match(/cos\(i-(\w+)\)/)[1]};});
 const setup=async state=>page.evaluate(({state,names})=>{for(const [key,value]of Object.entries(state))window[names[key]||key]=value;}, {state,names});
 const tick=async n=>page.evaluate(n=>{for(let i=0;i<n;i++)__tick();},n);
 const read=async key=>page.evaluate(key=>window[key],names[key]||key);
 await setup({b:[]});await page.keyboard.down('ArrowDown');await tick(5);await page.keyboard.up('ArrowDown');assert.equal(await read('y'),5);
 await page.keyboard.down('d');await tick(3);await page.keyboard.up('d');assert.equal(await read('x'),47);
 await page.keyboard.down(' ');await tick(10);await page.keyboard.up(' ');assert.equal((await read('b')).length,1);
 await setup({x:0,y:40,b:[[0,53,2.5,0]]});await tick(2);assert.equal((await read('b'))[0][3],1,'First wall hit reflects the bullet');
 await tick(46);assert.equal((await read('b')).length,0,'Second wall hit removes the bullet');
 // Two overlapping targets must not both receive points from one round.
 await setup({x:44,y:0,score:0,b:[[1,30,0,-1],[1,30,0,-1],[1,30,0,0,30*Math.cos(1),30*Math.sin(1)]]});
 await tick(1);assert.equal(await read('score'),100);assert.equal((await read('b')).length,2,'Hit consumes ammunition and respawns one target');
 await setup({x:44,y:0,b:[[0,44,0,1]]});await tick(1);assert.ok(await read('__deaths'),'Returning bullets remain lethal');
 await setup({x:44,y:0,b:[[0,44,0,-1]],__deaths:0});await tick(1);assert.equal(await read('__deaths'),1,'Targets remain lethal');
 await setup({x:0,y:40,b:[],wave:0});
 await page.evaluate(()=>{const ctx=c.getContext('2d'),original=ctx.fillText;window.__text=[];ctx.fillText=function(text,...args){__text.push({text:String(text),matrix:[this.getTransform().a,this.getTransform().b]});return original.call(this,text,...args)}});
 await tick(1);const glyph=await page.evaluate(()=>__text.find(x=>x.text==='◁'));assert.ok(glyph);assert.ok(Math.abs(glyph.matrix[0])<.001&&Math.abs(glyph.matrix[1]-1)<.001,'Ship below center rotates toward it');
 await setup({wave:5,impact:0,t:1,score:1500});await tick(1);
 const edges=await page.evaluate(()=>{const d=c.getContext('2d').getImageData(0,0,128,128).data;let xs=[];for(let x=0;x<128;x++){const i=(64*128+x)*4;if(d[i]>240&&d[i+1]>220)xs.push(x)}return xs});
 assert.ok(edges.some(x=>x<12));assert.ok(edges.some(x=>x>110&&x<118),'Wave deforms impact side');assert.ok(!edges.some(x=>x>120),'Wave stays localized');
 await page.waitForTimeout(100);await page.screenshot({path:'output/1k.png'});assert.deepEqual(errors,[]);
 console.log(`PASS: ${bytes.length} bytes; arrows/WASD, center shooting, one bounce, second-hit removal, single-target scoring/ammo consumption, lethal collisions, inward ship rotation, localized wave, UTF-8 and rendering`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
