import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraShot,PIPELINE_VERSION} from './studio_v2.js';
test('news camera movement remains deterministic and inside the safe portrait framing',()=>{
 assert.equal(PIPELINE_VERSION,'news-studio-v2');
 for(let scene=0;scene<8;scene++)for(let step=0;step<=20;step++){
  const p=step/20,time=scene*18+p*18,a=cameraShot(scene,p,time),b=cameraShot(scene,p,time);
  assert.deepEqual(a,b);
  assert.ok(a.position.every(Number.isFinite));assert.ok(Math.abs(a.position[0])<=1.4);assert.ok(a.position[2]>=11.6&&a.position[2]<=13.4);
  assert.ok(Math.abs(a.target[0])<=.08);assert.equal(a.target[1],.25);
 }
});
test('camera eases into authored endpoints instead of discontinuous time jitter',()=>{
 for(let scene=0;scene<8;scene++){
  const first=cameraShot(scene,0,0).position,last=cameraShot(scene,1,0).position;
  assert.notDeepEqual(first,last);
  const delta=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  assert.ok(delta(first,cameraShot(scene,.001,0).position)<.0001);
  assert.ok(delta(last,cameraShot(scene,.999,0).position)<.0001);
 }
});
