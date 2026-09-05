const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const bytes=fs.readFileSync('public/1k.html');assert.ok(bytes.length<1024);
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
 try{
 const page=await browser.newPage({viewport:{width:900,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.GAME_URL||'file://'+process.cwd()+'/public/1k.html';
 const response=await page.goto(url);if(response&&url.startsWith('http'))assert.equal((await response.body()).length,bytes.length);
 await page.waitForFunction(()=>window.b?.length===3);
 await page.keyboard.down('ArrowDown');await page.waitForTimeout(150);await page.keyboard.up('ArrowDown');assert.ok(await page.evaluate(()=>q>64));
 await page.keyboard.down(' ');await page.waitForFunction(()=>b.some(v=>v[4]===0));await page.keyboard.up(' ');
 await page.evaluate(()=>{p=64;q=100;b=[[120,64,2,0,0]]});
 await page.waitForFunction(()=>b[0]?.[4]===1);await page.waitForFunction(()=>b.length===0,{},{timeout:3000});
 await page.evaluate(()=>{p=108;q=64;b=[[64,64,0,0,-1],[64,64,0,0,0]]});await page.waitForFunction(()=>s===100);
 await page.evaluate(()=>{w=4;b=[]});await page.screenshot({path:'output/1k.png'});
 assert.deepEqual(errors,[]);console.log(`PASS: ${bytes.length} bytes, movement, shooting, one bounce, second-hit removal, scoring, rendering`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
