/** Opt-in news studio. All procedural surfaces are deterministic and locally authored.
 * Existing channel geometry and fact-bearing labels remain the source of truth.
 */
import * as THREE from 'three';
export const PIPELINE_VERSION='news-studio-v2';
export function cameraShot(index,progress,time){
 const p=Math.max(0,Math.min(1,progress)),e=p*p*(3-2*p);
 const shots=[[-1.2,.9,13.3,.8,1.2,11.7],[1.3,1.5,12.8,-.7,1.1,11.6],[-.9,1.1,11.9,.6,1.7,12.7],[-1.1,1,13.2,1,1.2,12.2],[1.4,1.3,13,-.6,1.1,11.9],[-.6,1.8,12.4,.8,1.1,12.8],[1,1.2,12.5,-1,1,13],[-.7,1.1,13.4,.3,1.2,12.3]];
 const a=shots[index%shots.length];
 return {position:[a[0]+(a[3]-a[0])*e,a[1]+(a[4]-a[1])*e,a[2]+(a[5]-a[2])*e],target:[Math.sin(time*.09)*.08,.25,0]};
}
function brushedMetal(){
 const side=64,data=new Uint8Array(side*side*4);
 for(let y=0;y<side;y++)for(let x=0;x<side;x++){
  const n=132+Math.round(12*Math.sin(y*2.93)+5*Math.sin(x*.67+y*.13)),i=(y*side+x)*4;
  data[i]=data[i+1]=data[i+2]=n;data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,side,side,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);texture.needsUpdate=true;return texture;
}
export function newsStudio(scene,renderer,channelRoot){
 const group=new THREE.Group();group.name='news-v2-studio';scene.add(group);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMappingExposure=.98;
 const metal=brushedMetal();
 channelRoot.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(m?.isMeshStandardMaterial&&m.metalness>.2){m.roughnessMap=metal;m.roughness=Math.max(.34,m.roughness);}
   if(m?.emissiveIntensity>1)m.emissiveIntensity=.58;
  }
 });
 const platform=new THREE.Mesh(new THREE.CylinderGeometry(4.5,4.7,.18,64),new THREE.MeshStandardMaterial({color:0x121525,roughness:.62,metalness:.28,roughnessMap:metal}));platform.position.set(0,-1.9,0);platform.receiveShadow=true;group.add(platform);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x090d18,roughness:.89,metalness:.05}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.02;ground.receiveShadow=true;group.add(ground);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(4.2,.018,6,80),new THREE.MeshStandardMaterial({color:0x7a67bc,emissive:0x45396c,emissiveIntensity:.35,roughness:.5}));rim.rotation.x=-Math.PI/2;rim.position.y=-1.8;group.add(rim);
 // Foreground and background pillars create optical parallax, never fake data.
 const pillars=[];
 for(let i=0;i<8;i++){
  const pillar=new THREE.Mesh(new THREE.BoxGeometry(.18,6,.22),new THREE.MeshStandardMaterial({color:0x1b2138,roughness:.72,metalness:.3}));
  pillar.position.set((i%2?1:-1)*(4.6+(i%3)*.55),.1,-5-Math.floor(i/2)*2);group.add(pillar);pillars.push(pillar);
 }
 const key=new THREE.SpotLight(0xece9ff,95,32,.75,.65,1.5);key.position.set(-4,7,6);key.target.position.set(0,-.2,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0008;key.shadow.normalBias=.025;group.add(key,key.target);
 const fill=new THREE.PointLight(0x80b8da,10,20,1.8);fill.position.set(5,1,5);group.add(fill);
 const edge=new THREE.SpotLight(0xac80ee,48,26,.8,.7,1.5);edge.position.set(3,5,-5);edge.target.position.set(0,0,0);group.add(edge,edge.target);
 return {update(camera,index,p,time){const view=cameraShot(index,p,time);camera.position.set(...view.position);camera.lookAt(...view.target);},dispose(){metal.dispose();},contract:{version:PIPELINE_VERSION,shadow_map:1024,camera:'deterministic eased dolly',geometry:'existing authored channel geometry',facts:'unchanged'}};
}
