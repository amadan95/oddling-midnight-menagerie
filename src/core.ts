export type CreatureRecipeV1 = { v: 1; seed: number; shape: number[]; energy: number; warmth: number };
export type SharePayloadV1 = { v: 1; kind: 'single'; creature: CreatureRecipeV1 } | { v: 1; kind: 'pair'; creatures: [CreatureRecipeV1, CreatureRecipeV1] };
export type Family = 'Coil' | 'Kite' | 'Ribbon' | 'Pebble';
export type CreatureParameters = {
  family: Family;
  palette: string[];
  name: string;
  description: string;
  wiggle: number;
  tilt: number;
  path: string;
  accents: Array<{x:number;y:number;r:number}>;
  primaryInk: '#4A183E';
  accentInk: '#E9A11B';
  textureSeed: number;
  pose: number;
};

const ARC = [24,150, 37,132, 55,112, 78,98, 104,91, 131,94, 157,108, 177,128, 191,151, 196,174, 190,194, 174,209, 150,218, 124,219, 98,212, 76,199, 59,181];
const prefixes = ['Velvet','Mossy','Little','Electric','Pale','Merry','Blue','Amber','Soft','Wandering','Honey','Paper','Satin','Quiet','Lunar','Brave','Gentle','Pocket','Ripe','Secret','Dancing','Silver','Blooming','Warm','Glass','Tiny','Lucky','Round','Golden','Sleepy','Coral','Wild'];
const suffixes = ['Detour','Thimble','Knot','Puddle','Comet','Tremor','Locket','Sprig','Whistle','Parade','Button','Satellite','Flicker','Morsel','Riddle','Crescent','Tangle','Lullaby','Pebble','Orbit','Ripple','Hush','Mittens','Current','Biscuit','Echo','Glimmer','Bend','Doodle','Pocket','Wobble','Flare'];
const descriptions = ['Moves as though it has remembered something pleasant.','Keeps a tiny weather system to itself.','Practices being brave in very small ways.','Would like to be near a window at dusk.','Wakes with an unreasonable amount of curiosity.','Folds neatly around good news.','Collects warm corners and forgets to leave.','Has never been late to an imaginary party.','Hums when it thinks no one is listening.','Carries its luck in a hidden pocket.','Prefers the scenic route through a quiet room.','Will make friends with almost anything.','Does not understand hurry, but means well.','Feels certain that a secret is nearby.','Dreams in several cheerful colors.','Is still deciding whether it is a creature or a ceremony.','Can tell when rain is thinking about starting.','Would like to share a sandwich, eventually.','Believes every table deserves a small dance.','Has a perfectly good reason for moving that way.','Will wait patiently for the right sort of afternoon.','Is learning to be less mysterious.','Makes a nest from whatever is already there.','Knows a shortcut to a very gentle feeling.'];
const palettes = [['#f06f5e','#ffba76','#251c30'],['#4c6fdf','#9eb8ff','#251c30'],['#9362bc','#f0acd2','#251c30'],['#41a98d','#b3e5bc','#251c30'],['#e0bd28','#f6e18b','#251c30']];
const n = (x:number) => Math.max(0,Math.min(255,Math.round(x)));
export const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
export function normalizeGesture(points: Array<{x:number;y:number}>): number[] { if (points.length < 2) return ARC; const out:number[]=[]; const count=16; for(let i=0;i<count;i++){ const p=points[Math.round((points.length-1)*i/(count-1))]; out.push(n(p.x),n(p.y)); } return out; }
export function deriveRecipe(input: {seed?:number; shape?:number[]; energy?:number; warmth?:number}): CreatureRecipeV1 { return {v:1,seed:input.seed ?? randomSeed(),shape:input.shape?.length===32?input.shape:ARC,energy:n(input.energy ?? 128),warmth:n(input.warmth ?? 128)}; }
function metrics(shape:number[]) { let length=0,turn=0,minX=255,maxX=0,minY=255,maxY=0; const pts=[] as Array<[number,number]>; for(let i=0;i<32;i+=2){const p:[number,number]=[shape[i],shape[i+1]];pts.push(p);minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);if(i>0) length+=Math.hypot(p[0]-shape[i-2],p[1]-shape[i-1]);} for(let i=1;i<pts.length-1;i++){const a=Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0]),b=Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0]);let d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;turn+=d;}return {pts,length,turn,end:Math.hypot(pts[0][0]-pts.at(-1)![0],pts[0][1]-pts.at(-1)![1]),aspect:(maxX-minX)/Math.max(1,maxY-minY)}; }
function rng(seed:number){let x=seed>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};}
export function describeCreature(recipe:CreatureRecipeV1){return deriveCreature(recipe).description;}
export function deriveCreature(recipe:CreatureRecipeV1): CreatureParameters { const m=metrics(recipe.shape),r=rng(recipe.seed); const family:Family=m.end<Math.max(18,m.length*.18)?'Coil':m.turn>Math.PI*2.5?'Kite':m.aspect>1.8?'Ribbon':'Pebble'; const p=palettes[Math.floor((recipe.warmth/256)*palettes.length)%palettes.length]; const name=`${prefixes[Math.floor(r()*prefixes.length)]} ${suffixes[Math.floor(r()*suffixes.length)]}`; const pts=m.pts.map(([x,y])=>`${70+x*.65},${80+y*.66}`); const path=family==='Ribbon'?`M ${pts.join(' L ')} L 190,250 L 80,220 Z`:family==='Coil'?`M 92 190 C 60 90 230 75 218 180 C 208 270 70 260 94 145 C 112 75 235 115 185 215`:family==='Kite'?`M 150 56 L 245 150 L 182 252 L 60 195 L 95 96 Z`:`M 82 142 C 48 99 106 57 147 93 C 186 46 247 98 219 141 C 272 170 226 239 179 222 C 142 271 79 233 98 190 C 44 188 46 150 82 142 Z`; return {family,palette:p,name,description:descriptions[Math.floor(r()*descriptions.length)],wiggle:.5+recipe.energy/255*1.4,tilt:(r()-.5)*18,path,accents:Array.from({length:4},()=>({x:90+r()*140,y:100+r()*120,r:5+r()*12})),primaryInk:'#4A183E',accentInk:'#E9A11B',textureSeed:recipe.seed % 997,pose:Math.round(r()*2)}; }
function b64(s:string){return btoa(unescape(encodeURIComponent(s))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function unb64(s:string){return decodeURIComponent(escape(atob(s.replaceAll('-','+').replaceAll('_','/').padEnd(Math.ceil(s.length/4)*4,'='))));}
function valid(r:any): r is CreatureRecipeV1{return r&&r.v===1&&Number.isInteger(r.seed)&&r.seed>=0&&r.seed<=4294967295&&Array.isArray(r.shape)&&r.shape.length===32&&r.shape.every((x:any)=>Number.isInteger(x)&&x>=0&&x<=255)&&Number.isInteger(r.energy)&&r.energy>=0&&r.energy<=255&&Number.isInteger(r.warmth)&&r.warmth>=0&&r.warmth<=255;}
export function encodeShare(payload:SharePayloadV1){return b64(JSON.stringify(payload));}
export function decodeShare(fragment:string): {ok:true;payload:SharePayloadV1}|{ok:false}{try{const s=fragment.replace(/^#?s=/,'');if(!s||s.length>2048)return{ok:false};const p=JSON.parse(unb64(s));if(p?.v!==1)return{ok:false};if(p.kind==='single'&&valid(p.creature))return{ok:true,payload:p};if(p.kind==='pair'&&Array.isArray(p.creatures)&&p.creatures.length===2&&valid(p.creatures[0])&&valid(p.creatures[1]))return{ok:true,payload:p};return{ok:false};}catch{return{ok:false};}}
export const presets={Loop:[65,150,75,104,113,78,155,80,188,110,198,150,185,192,145,218,104,214,70,182,58,143,65,150,75,104,113,78,155,80,188,110],Arc:ARC,Zigzag:[25,185,55,90,82,190,110,88,138,190,166,90,194,188,222,86,242,184,215,210,184,178,153,214,122,180,92,218,60,185,35,215],Spiral:[145,144,165,125,182,145,170,174,135,183,105,155,112,112,154,96,195,118,211,164,191,207,141,222,88,203,65,151,85,93,140,62]};
