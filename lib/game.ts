export const SIZE = 128;
export type Dot = { x: number; y: number; vx: number; vy: number; age: number; bounces: number };
export type Input = { x: number; y: number; fire: boolean };
export class Game {
  player = { x: 108, y: 64 };
  bullets: Dot[] = [];
  enemies: Dot[] = [];
  ripples: { angle: number; age: number; strength: number }[] = [];
  pops: { x: number; y: number; age: number }[] = [];
  particles: Dot[] = [];
  score = 0; time = 0; cooldown = 0; spawnClock = 0; dead = false;
  shots = 0; kills = 0; seed = 817;
  random() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
  constructor() { for (let i = 0; i < 3; i++) this.spawn(); }
  spawn() {
    let angle = this.random() * Math.PI * 2;
    for (let i = 0; i < 12; i++) { if (Math.hypot(64 + Math.cos(angle)*51-this.player.x,64+Math.sin(angle)*51-this.player.y)>22) break; angle+=0.7; }
    const speed=7+this.random()*5+Math.min(this.score/1200,5), dir=angle+Math.PI+(this.random()-.5)*1.3;
    this.enemies.push({x:64+Math.cos(angle)*51,y:64+Math.sin(angle)*51,vx:Math.cos(dir)*speed,vy:Math.sin(dir)*speed,age:0,bounces:0});
  }
  ripple(x:number,y:number,strength=5) { this.ripples.push({angle:Math.atan2(y-64,x-64),age:0,strength}); }
  shoot() {
    if(this.cooldown>0 || this.dead) return;
    const dx=64-this.player.x,dy=64-this.player.y,d=Math.hypot(dx,dy);
    const nx=d>0.1?dx/d:-1, ny=d>0.1?dy/d:0;
    this.bullets.push({x:this.player.x+nx*4,y:this.player.y+ny*4,vx:nx*77,vy:ny*77,age:0,bounces:0});
    this.cooldown=.32; this.shots++;
  }
  die() {
    this.dead=true;
    for(let i=0;i<18;i++) {const a=this.random()*Math.PI*2,s=8+this.random()*25;this.particles.push({x:this.player.x,y:this.player.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,age:0,bounces:0});}
  }
  step(dt:number,input:Input) {
    for(const r of this.ripples)r.age+=dt;
    this.ripples=this.ripples.filter(r=>r.age<2.4);
    for(const p of this.pops)p.age+=dt;
    this.pops=this.pops.filter(p=>p.age<.7);
    for(const p of this.particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    this.particles=this.particles.filter(p=>p.age<1);
    if(this.dead)return;
    this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);
    const norm=Math.max(1,Math.hypot(input.x,input.y));
    this.player.x+=input.x/norm*38*dt;this.player.y+=input.y/norm*38*dt;
    const px=this.player.x-64,py=this.player.y-64,pd=Math.hypot(px,py);
    if(pd>53){this.player.x=64+px/pd*53;this.player.y=64+py/pd*53;}
    if(input.fire)this.shoot();
    this.spawnClock+=dt;
    if(this.spawnClock>2.6 && this.enemies.length<Math.min(7,3+Math.floor(this.score/800))){this.spawn();this.spawnClock=0;}
    for(const e of this.enemies){e.age+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;this.bounce(e,54);if(Math.hypot(e.x-this.player.x,e.y-this.player.y)<4.5)this.die();}
    for(const b of this.bullets){
      b.age+=dt; b.x+=b.vx*dt;b.y+=b.vy*dt;this.bounce(b,57);
      if(b.bounces>=2){b.age=99;continue;}
      if(b.age>.13 && Math.hypot(b.x-this.player.x,b.y-this.player.y)<2.5){this.die();break;}
      const hit=this.enemies.findIndex(e=>Math.hypot(e.x-b.x,e.y-b.y)<3.8);
      if(hit>=0){const e=this.enemies.splice(hit,1)[0];this.score+=100;this.kills++;this.pops.push({x:e.x,y:e.y,age:0});b.age=99;this.ripple(e.x,e.y,1);}
    }
    this.bullets=this.bullets.filter(b=>b.age<5.5);
  }
  bounce(d:Dot,r:number) {
    const dx=d.x-64,dy=d.y-64,dist=Math.hypot(dx,dy);
    if(dist<r)return;
    const nx=dx/dist,ny=dy/dist,proj=d.vx*nx+d.vy*ny;
    if(proj>0){d.vx-=2*proj*nx;d.vy-=2*proj*ny;d.bounces++;this.ripple(d.x,d.y);}
    d.x=64+nx*(r-.1);d.y=64+ny*(r-.1);
  }
}
const digits:Record<string,string[]>={
 '0':['111','101','101','101','111'],'1':['110','010','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','001','001','001'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'+':['000','010','111','010','000']
};
function pixel(ctx:CanvasRenderingContext2D,x:number,y:number,color:string){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),1,1);}
function line(ctx:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,color:string){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(let n=0;n<300;n++){pixel(ctx,x0,y0,color);if(x0===x1&&y0===y1)break;const e=err*2;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}}
function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,scale:number,color:string){ctx.fillStyle=color;for(let i=0;i<value.length;i++){const glyph=digits[value[i]];if(!glyph)continue;glyph.forEach((row,j)=>[...row].forEach((v,k)=>{if(v==='1')ctx.fillRect(Math.round(x+i*4*scale+k*scale),Math.round(y+j*scale),scale,scale);}));}}
export function draw(ctx:CanvasRenderingContext2D,g:Game){
 ctx.fillStyle='#000';ctx.fillRect(0,0,128,128);
 const score=String(g.score);text(ctx,score,64-(score.length*8-2)/2,59,2,'#1d2b53');
 let prev:{x:number;y:number}|null=null;
 for(let i=0;i<=360;i++){
  const a=i/360*Math.PI*2;let r=57;
  for(const wave of g.ripples){const diff=Math.atan2(Math.sin(a-wave.angle),Math.cos(a-wave.angle));r+=Math.cos(diff*17-wave.age*14)*Math.exp(-diff*diff*13)*wave.strength*Math.exp(-wave.age*1.6);}
  r=Math.max(49,Math.min(62,r));
  const p={x:64+Math.cos(a)*r,y:64+Math.sin(a)*r};if(prev)line(ctx,prev.x,prev.y,p.x,p.y,'#fff1e8');prev=p;
 }
 for(const e of g.enemies){const ring=[[0,-3],[1,-3],[2,-2],[3,-1],[3,0],[3,1],[2,2],[1,3],[0,3],[-1,3],[-2,2],[-3,1],[-3,0],[-3,-1],[-2,-2],[-1,-3]];for(const [x,y]of ring)pixel(ctx,e.x+x,e.y+y,'#ff004d');}
 for(const b of g.bullets){const col=b.bounces?'#ff004d':'#fff1e8';pixel(ctx,b.x,b.y,col);pixel(ctx,b.x-1,b.y,col);pixel(ctx,b.x+1,b.y,col);pixel(ctx,b.x,b.y-1,col);pixel(ctx,b.x,b.y+1,col);}
 if(!g.dead){const a=Math.atan2(64-g.player.y,64-g.player.x),c=Math.cos(a),s=Math.sin(a);const points=[[3,0],[-3,-3],[-2,0],[-3,3],[3,0]].map(([x,y])=>({x:g.player.x+x*c-y*s,y:g.player.y+x*s+y*c}));for(let i=1;i<points.length;i++)line(ctx,points[i-1].x,points[i-1].y,points[i].x,points[i].y,'#fff1e8');}
 for(const p of g.pops)text(ctx,'+100',Math.min(109,Math.max(2,p.x-7)),p.y-5-p.age*8,1,'#fff1e8');
 for(const p of g.particles)pixel(ctx,p.x,p.y,p.age<.2?'#fff1e8':'#ff004d');
}
