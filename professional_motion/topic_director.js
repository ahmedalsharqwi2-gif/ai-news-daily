/** Source-addressed directing: worlds/actions are authored, never inferred from a title. */
import * as THREE from 'three';
export const WORLD_CATALOG={
 radio_signal_observatory:{settings:['observatory_desert','receiver_feed','control_room','signal_lab'],focal_objects:['radio_dish','receiver','wavefront','waterfall','rfi_filter','candidate_cards','review_console'],actions:['dish_survey','dish_point','signal_capture','frequency_sweep','rfi_reject','candidate_sort','human_review','followup_track'],shots:['array_establish','dish_low','feed_close','signal_follow','waterfall_top','filter_macro','review_over_shoulder','followup_wide']},
 cleanroom_fabrication:{settings:['cleanroom','lithography_bay','inspection_bench','packaging_line'],focal_objects:['wafer','robot_arm','lithography_mask','chip_layers','inspection_probe','package','reject_bin','finished_board'],actions:['wafer_transfer','mask_exposure','layer_separation','probe_scan','package_close','reject_route','board_insert','robot_pick'],shots:['room_establish','robot_follow','mask_macro','layer_orbit','probe_top','package_push','reject_track','board_hero']},
 egyptian_voice_cafe:{settings:['cairo_cafe','tabletop','voice_route','privacy_desk'],focal_objects:['speaker','phone','sound_waves','request_cards','privacy_shutter','reference_cards','receipt','cup'],actions:['person_speak','wave_capture','request_route','privacy_close','reference_compare','receipt_print','cup_deliver','answer_return'],shots:['cafe_establish','phone_over_shoulder','voice_follow','route_side','privacy_macro','reference_top','receipt_push','table_wide']}
};

export const COMPATIBLE_BEATS={
 cleanroom_fabrication:[
 ['cleanroom','wafer','wafer_transfer','room_establish'],['cleanroom','robot_arm','robot_pick','robot_follow'],
 ['lithography_bay','lithography_mask','mask_exposure','mask_macro'],['lithography_bay','chip_layers','layer_separation','layer_orbit'],
 ['inspection_bench','inspection_probe','probe_scan','probe_top'],['packaging_line','package','package_close','package_push'],
 ['inspection_bench','reject_bin','reject_route','reject_track'],['packaging_line','finished_board','board_insert','board_hero']],
 egyptian_voice_cafe:[
 ['cairo_cafe','speaker','person_speak','cafe_establish'],['tabletop','sound_waves','wave_capture','voice_follow'],
 ['voice_route','request_cards','request_route','route_side'],['privacy_desk','privacy_shutter','privacy_close','privacy_macro'],
 ['tabletop','reference_cards','reference_compare','reference_top'],['tabletop','receipt','receipt_print','receipt_push'],
 ['cairo_cafe','cup','cup_deliver','table_wide'],['voice_route','phone','answer_return','phone_over_shoulder']],
 radio_signal_observatory:[
 ['observatory_desert','radio_dish','dish_survey','array_establish'],['observatory_desert','radio_dish','dish_point','dish_low'],
 ['receiver_feed','receiver','signal_capture','feed_close'],['signal_lab','waterfall','frequency_sweep','waterfall_top'],
 ['signal_lab','rfi_filter','rfi_reject','filter_macro'],['control_room','candidate_cards','candidate_sort','review_over_shoulder'],
 ['control_room','review_console','human_review','review_over_shoulder'],['observatory_desert','radio_dish','followup_track','followup_wide']]
};

const clamp=p=>Math.max(0,Math.min(1,p)),smooth=p=>{p=clamp(p);return p*p*(3-2*p);};
export function validateVisualPlan(story){
 const p=story.visual_plan,catalog=WORLD_CATALOG[p?.world];
 if(!p||p.version!==1||!catalog)throw Error('News v2 requires an explicit supported topic visual_plan; no generic studio fallback');
 if(p.world==='radio_signal_observatory'&&story.visual_review_only!==true&&!String(story.source?.url||'').includes('ai-joins-the-search-for-extraterrestrial-signals'))throw Error('Radio-observatory reconstruction requires the documented signal-search source');
 if(story.profile!=='news'||!Array.isArray(p.scenes)||p.scenes.length!==8||story.scenes?.length!==8)throw Error('Director needs eight source-addressed news scenes');
 const fields={setting:'settings',focal_object:'focal_objects',action:'actions',shot:'shots'};
 p.scenes.forEach((row,i)=>{
  if(row.id!==story.scenes[i].id)throw Error('Directing plan scene identity differs from authored story');
  for(const [field,list] of Object.entries(fields))if(!catalog[list].includes(row[field]))throw Error('Unsupported '+field+' in '+p.world);
  if(!COMPATIBLE_BEATS[p.world].some(b=>['setting','focal_object','action','shot'].every((field,j)=>row[field]===b[j])))throw Error('Action/object/shot is not executable in this physical setting');
  if(typeof row.state_change!=='string'||row.state_change.trim().length<8)throw Error('Each shot needs an explicit observable state_change');
  if(story.visual_review_only===true){if(row.source_excerpt_id!=='synthetic-visual-comparison')throw Error('Synthetic review must be labeled as synthetic, never sourced news');}
  else if(!Number.isInteger(row.source_excerpt_id)||row.source_excerpt_id!==story.scenes[i].evidence_excerpt_id||!story.scenes[i].evidence_quote)throw Error('Every directing beat must point to its own authored source excerpt');
 });
 if(new Set(story.scenes.map(r=>r.id)).size!==8||new Set(p.scenes.map(r=>r.setting)).size<3||new Set(p.scenes.map(r=>r.focal_object)).size<4||new Set(p.scenes.map(r=>r.action)).size<4||new Set(p.scenes.map(r=>r.shot)).size<4)throw Error('Topic plan requires at least four different actions and shots');
 return p;
}
function material(color,roughness=.65,metalness=.05){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function add(parent,name,geometry,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,name,w,h,d,mat,x=0,y=0,z=0){return add(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
function sphere(parent,name,r,mat,x,y,z){return add(parent,name,new THREE.SphereGeometry(r,18,12),mat,x,y,z);}
function line(parent,name,points,color){const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color}));o.name=name;parent.add(o);return o;}
function ring(parent,name,r,mat,x,y,z){const o=add(parent,name,new THREE.TorusGeometry(r,.025,6,36),mat,x,y,z);o.rotation.x=Math.PI/2;return o;}
function person(parent,name,x,z,coat){const group=new THREE.Group();group.name=name;group.position.set(x,-.9,z);parent.add(group);box(group,'torso',.47,.85,.3,coat,0,.3);sphere(group,'head',.19,material(0xd6aa87),0,.99,0);box(group,'left-leg',.16,.65,.2,material(0x253143),-.13,-.43);box(group,'right-leg',.16,.65,.2,material(0x253143),.13,-.43);const arm=box(group,'gesturing-arm',.13,.6,.15,coat,.34,.35);arm.rotation.z=.5;return {group,arm};}
function cleanroom(root){
 const white=material(0xcddce3,.45,.12),steel=material(0x80969e,.38,.65),silicon=material(0x344773,.2,.7),gold=material(0xd3ad57,.38,.6),blue=material(0x46cfe5,.3,.18);
 box(root,'cleanroom-floor',18,.15,18,material(0x8aabb6,.75),0,-1.9,-1);box(root,'sterile-back-wall',18,7,.16,white,0,1.5,-5.5);box(root,'sterile-left-wall',.15,7,14,white,-6.2,1.5,-.8);
 for(let i=0;i<7;i++){box(root,'wall-rib-'+i,.1,6,.1,steel,-6+i*2,1.2,-5.35);box(root,'ceiling-light-'+i,1.3,.06,.28,new THREE.MeshBasicMaterial({color:0xe1ffff}),-5+i*1.7,4.5,-1.4);}
 box(root,'wafer-conveyor',7,.35,1.5,steel,0,-1.12,.1);for(let i=0;i<12;i++){const roller=add(root,'conveyor-roller-'+i,new THREE.CylinderGeometry(.09,.09,1.3,12),steel,-3.2+i*.58,-.9,.1);roller.rotation.x=Math.PI/2;}
 const wafer=add(root,'silicon-wafer',new THREE.CylinderGeometry(.66,.66,.05,48),silicon,-2,-.79,.1);for(let i=0;i<5;i++)for(let j=0;j<5;j++)if(Math.hypot(i-2,j-2)<2.7)box(wafer,'wafer-die-'+i+'-'+j,.16,.015,.16,blue,(i-2)*.22,.035,(j-2)*.22);
 const armBase=add(root,'robot-base',new THREE.CylinderGeometry(.3,.38,.45,24),gold,-2.8,-1.55,-1.3);const arm=new THREE.Group();arm.name='robot-arm';arm.position.set(-2.8,-1.25,-1.3);root.add(arm);box(arm,'robot-lower-link',.25,1.15,.27,white,0,.55);const elbow=new THREE.Group();elbow.name='robot-elbow';elbow.position.y=1.15;arm.add(elbow);box(elbow,'robot-upper-link',1.2,.2,.24,gold,.5,0);const gripper=box(elbow,'robot-gripper',.12,.4,.46,steel,1.1,-.2);box(gripper,'gripper-finger-left',.12,.22,.08,gold,0,-.22,-.18);box(gripper,'gripper-finger-right',.12,.22,.08,gold,0,-.22,.18);
 box(root,'lithography-machine',2.35,2.25,1.8,white,1.4,-.65,-1.9);box(root,'machine-dark-window',1.75,.8,.05,material(0x18374e,.2,.2),1.4,-.35,-.97);const mask=box(root,'lithography-mask',1.3,.08,1.2,steel,.8,1.35,.2);const exposure=add(root,'exposure-cone',new THREE.ConeGeometry(.55,1.2,24,1,true),new THREE.MeshBasicMaterial({color:0x78ddff,transparent:true,opacity:.18,side:THREE.DoubleSide}),.8,.5,.2);exposure.rotation.z=Math.PI;
 const layers=new THREE.Group();layers.name='exploded-chip';layers.position.set(.3,.1,.35);root.add(layers);const slabs=[];for(let i=0;i<4;i++)slabs.push(box(layers,'chip-layer-'+i,1.5-i*.08,.12,1.15-i*.06,[silicon,gold,blue,steel][i],0,i*.13));
 const probe=box(root,'inspection-probe',.1,.8,.1,gold,1.4,1.1,.15);const scan=box(root,'inspection-scan',1.3,.015,.025,new THREE.MeshBasicMaterial({color:0x61fbd9}),.3,.13,.2);
 const pack=new THREE.Group();pack.name='package-station';pack.position.set(1.8,-.65,.45);root.add(pack);box(pack,'package-base',1.4,.15,1.25,material(0x202837));const lid=box(pack,'package-lid',1.45,.13,1.3,steel,0,1);
 const reject=box(root,'quarantine-bin',.9,.75,1,material(0xa34439),3.5,-1.45,.2);const rejectPart=box(root,'rejected-die',.45,.12,.45,silicon,2.5,-.7,.2);
 const board=box(root,'finished-board',1.8,.08,1.35,material(0x2b765e),1.6,-.6,1.4);box(board,'packaged-processor',.65,.18,.65,silicon,0,.13);for(let i=0;i<7;i++)box(board,'board-contact-'+i,.09,.025,.18,gold,-.65+i*.2,.06,.59);
 const worker=person(root,'cleanroom-technician',-4.1,-1.4,white);box(worker.group,'protective-visor',.34,.17,.09,material(0x72bfd5,.2,.2),0,1.02,.17);
 return {wafer,arm,elbow,mask,exposure,layers,slabs,probe,scan,pack,lid,reject,rejectPart,board,worker,
  reset(){wafer.visible=true;wafer.position.set(-2,-.79,.1);layers.visible=false;mask.visible=false;exposure.visible=false;probe.visible=false;scan.visible=false;pack.visible=false;rejectPart.visible=false;board.visible=false;},
  act(action,p,t){this.reset();arm.rotation.y=.1;elbow.rotation.z=-.28;worker.arm.rotation.z=.35+Math.sin(t)*.08;
   if(action==='wafer_transfer'){wafer.position.x=-2+3*p;arm.rotation.y=-.2+.7*p;}
   if(action==='robot_pick'){wafer.position.set(-1.7,-.79+1.3*Math.sin(p*Math.PI),.1);elbow.rotation.z=-.4+.65*Math.sin(p*Math.PI);}
   if(action==='mask_exposure'){wafer.position.x=.8;mask.visible=true;exposure.visible=true;mask.position.y=1.45-.55*smooth(p);exposure.material.opacity=.08+.2*Math.sin(p*Math.PI);}
   if(action==='layer_separation'){wafer.visible=false;layers.visible=true;slabs.forEach((s,i)=>s.position.y=-.45+i*(.16+.45*smooth(p)));layers.rotation.y=.15+.4*p;}
   if(action==='probe_scan'){wafer.position.x=.3;probe.visible=true;scan.visible=true;probe.position.set(-.4+1.3*p,.45-.15*Math.sin(p*Math.PI),.2);scan.position.z=-.35+.9*p;}
   if(action==='package_close'){wafer.visible=false;pack.visible=true;lid.position.y=1.15*(1-smooth(p));}
   if(action==='reject_route'){wafer.visible=false;rejectPart.visible=true;rejectPart.position.set(2.4+1.1*smooth(p),-.65-.7*smooth(Math.max(0,(p-.6)/.4)),.2);}
   if(action==='board_insert'){wafer.visible=false;board.visible=true;board.position.set(1.6-1.6*smooth(p),-.6,.8);}
  }};
}
function cafe(root){
 const wood=material(0x8c5a37,.82),plaster=material(0xe5c8a4,.9),brass=material(0xb99552,.45,.55),teal=material(0x3b777a,.7),ink=material(0x263644,.55);
 box(root,'cafe-tile-floor',18,.12,18,material(0xc9ad82),0,-1.9,-.5);for(let x=-4;x<5;x++)for(let z=-3;z<4;z++)box(root,'tile-joint-'+x+'-'+z,1.45,.006,1.45,material((x+z)%2?0xbba27d:0xd8c398),x*1.5,-1.83,z*1.5);
 box(root,'cafe-back-wall',18,7,.2,plaster,0,1.5,-5);box(root,'cafe-side-wall',.15,7,14,plaster,-6,1.5,-1);
 for(let i=0;i<3;i++){const x=-3.6+i*3.2;box(root,'cairo-window-'+i,2.1,2.9,.09,material(0x75b6bf,.4),x,1.4,-4.86);for(let j=0;j<5;j++)box(root,'wood-window-lattice-'+i+'-'+j,.035,2.8,.05,wood,x-.8+j*.4,1.4,-4.77);for(let j=0;j<3;j++)box(root,'cairo-distant-building-'+i+'-'+j,.45,.6+j*.3,.07,material(0xad9b83),x-.65+j*.65,.4+j*.15,-4.7);}
 for(let i=0;i<3;i++){const bulb=add(root,'hanging-brass-lamp-'+i,new THREE.ConeGeometry(.42,.42,20,1,true),brass,-3+i*3,3.5,-1);line(root,'lamp-cord-'+i,[[-3+i*3,4.6,-1],[-3+i*3,3.7,-1]],0x3b3027);sphere(root,'lamp-bulb-'+i,.1,new THREE.MeshBasicMaterial({color:0xffdb9b}),-3+i*3,3.4,-1);}
 const table=add(root,'egyptian-cafe-table',new THREE.CylinderGeometry(2.4,2.4,.17,48),wood,0,-.5,.6);add(root,'table-pedestal',new THREE.CylinderGeometry(.22,.4,1.2,20),ink,0,-1.15,.6);
 const chair=box(root,'cafe-chair-seat',.8,.12,.8,teal,-2,-.9,-.5);box(root,'cafe-chair-back',.8,1,.13,teal,-2,-.45,-.9);const speaker=person(root,'cafe-speaker',-2,-.4,teal);speaker.group.position.y=-1.1;speaker.group.scale.setScalar(1.3);
 const phone=new THREE.Group();phone.name='voice-assistant-phone';phone.position.set(.45,-.17,.55);phone.rotation.y=-.2;root.add(phone);box(phone,'phone-body',.6,1.1,.1,ink,0,.45);box(phone,'phone-screen',.5,.93,.018,material(0x76cbd2,.25),0,.45,.064);const mic=sphere(phone,'microphone-icon',.08,brass,0,.25,.09);const shutter=box(phone,'privacy-shutter',.48,.15,.04,ink,0,1.1,.1);
 const cup=add(root,'egyptian-tea-glass',new THREE.CylinderGeometry(.2,.15,.43,24),material(0x8d4f25,.2),1.3,-.19,1.15);ring(root,'tea-glass-handle',.13,brass,1.53,-.17,1.15);add(root,'tea-saucer',new THREE.CylinderGeometry(.34,.34,.035,24),material(0xe6dbbc),1.3,-.4,1.15);
 const waves=new THREE.Group();waves.name='spoken-wavefronts';root.add(waves);for(let i=0;i<5;i++){const wave=add(waves,'voice-wave-'+i,new THREE.TorusGeometry(.2+i*.08,.022,6,32),new THREE.MeshBasicMaterial({color:0xe7aa55}),-1.15+i*.34,.25,.48);wave.rotation.y=Math.PI/2;}
 const cards=new THREE.Group();cards.name='request-routing-cards';root.add(cards);const requests=[];for(let i=0;i<5;i++)requests.push(box(cards,'request-card-'+i,.45,.3,.035,material(i%2?0x7caac0:0xeac88d),-.3+i*.5,.7,-.2));
 const references=new THREE.Group();references.name='source-reference-documents';references.position.set(0,-.24,1.05);root.add(references);const docs=[];for(let i=0;i<3;i++){const d=box(references,'reference-document-'+i,.65,.025,.95,material(0xf0e2bf),-.85+i*.85,0,0);for(let j=0;j<4;j++)box(d,'reference-text-line-'+j,.42,.007,.025,teal,0,.018,-.28+j*.14);docs.push(d);}
 const receipt=box(root,'printed-order-receipt',.62,.02,1,material(0xfff2ce),.6,-.18,.9);for(let j=0;j<5;j++)box(receipt,'receipt-line-'+j,.42,.008,.025,ink,0,.018,-.32+j*.13);
 const reply=sphere(root,'assistant-reply-signal',.14,new THREE.MeshBasicMaterial({color:0x6cdece}),.45,.6,.7);
 return {phone,speaker,cup,waves,cards,requests,shutter,references,docs,receipt,reply,
  reset(){waves.position.set(0,0,0);waves.scale.setScalar(1);waves.visible=false;cards.visible=false;references.visible=false;receipt.visible=false;reply.visible=false;shutter.position.x=.55;phone.rotation.y=-.2;cup.position.set(1.3,-.19,1.15);},
  act(action,p,t){this.reset();speaker.arm.rotation.z=.5+.6*Math.sin(p*Math.PI);mic.scale.setScalar(1+.15*Math.sin(t*6));
   if(action==='person_speak'){waves.visible=true;waves.scale.setScalar(.75+.3*p);speaker.arm.rotation.z=.5+smooth(p)*.6;}
   if(action==='wave_capture'){waves.visible=true;waves.position.x=.6*smooth(p);waves.scale.setScalar(1-.55*p);}
   if(action==='request_route'){cards.visible=true;requests.forEach((o,i)=>o.position.set(-1.5+((p+i*.15)%1)*3, .55+Math.sin(i+p*2)*.2,-.1-i*.08));}
   if(action==='privacy_close'){shutter.position.x=.55*(1-smooth(p));phone.rotation.y=-.2+.35*p;}
   if(action==='reference_compare'){references.visible=true;docs.forEach((d,i)=>{d.position.y=.03+Math.sin(p*Math.PI)*(i+1)*.18;d.rotation.y=(i-1)*p*.12;});}
   if(action==='receipt_print'){receipt.visible=true;receipt.scale.z=.12+.88*smooth(p);receipt.position.z=.8+.5*p;}
   if(action==='cup_deliver'){cup.position.x=2.7-1.4*smooth(p);speaker.arm.rotation.z=.7+.4*p;}
   if(action==='answer_return'){reply.visible=true;reply.position.set(.45-1.5*p,.6+.25*Math.sin(p*Math.PI),.7);phone.rotation.y=-.2+.2*p;}
  }};
}
function observatory(root){
 const silver=material(0xb9c8cf,.43,.55),structure=material(0x6e8894,.7,.35),dark=material(0x172b39,.6),cyan=material(0x56d6df,.35),red=material(0xd9785f,.55);
 box(root,'observatory-desert-ground',40,.15,40,material(0x626167,.95),0,-1.9,-4);
 for(let i=0;i<9;i++){const hill=add(root,'distant-mountain-'+i,new THREE.ConeGeometry(2.5+(i%3),2+(i%4)*.5,5),material(0x263748,.95),-16+i*4,-1,-14-(i%3));hill.rotation.y=i*.8;}
 const dishes=[];
 for(let i=0;i<4;i++){
  const station=new THREE.Group();station.name='radio-array-station-'+i;station.position.set((i%2?1:-1)*2.6,-1.65,-1.8-Math.floor(i/2)*3.5);root.add(station);
  box(station,'dish-pedestal-'+i,.65,1.2,.65,structure,0,.45);
  const mount=new THREE.Group();mount.name='dish-pointing-mount-'+i;mount.position.set(0,1.1,0);station.add(mount);
  const shape=[];for(let j=0;j<=16;j++){const r=j/16*1.1;shape.push(new THREE.Vector2(r,r*r*.28));}
  const bowl=add(mount,'radio-parabolic-dish-'+i,new THREE.LatheGeometry(shape,40),new THREE.MeshStandardMaterial({color:0xcadce2,roughness:.45,metalness:.5,side:THREE.DoubleSide}));
  ring(mount,'dish-rim-'+i,1.1,silver,0,.338,0);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;line(mount,'feed-support-'+i+'-'+k,[[Math.cos(a)*1.04,.3,Math.sin(a)*1.04],[0,1.35,0]],0x8eacba);}
  const feed=box(mount,'radio-feed-receiver-'+i,.16,.25,.16,dark,0,1.35,0);mount.rotation.x=.45;dishes.push({station,mount,bowl,feed});
 }
 // Illustrative wavefronts are not a claimed detection or a calibrated measurement.
 const wavefronts=new THREE.Group();wavefronts.name='incoming-radio-wavefronts';root.add(wavefronts);
 for(let i=0;i<6;i++){const wave=add(wavefronts,'radio-wavefront-'+i,new THREE.TorusGeometry(.65+i*.18,.018,5,36),new THREE.MeshBasicMaterial({color:0x89dbd5,transparent:true,opacity:.5}),-2.6,3+i*.42,-1.8);wave.rotation.x=Math.PI/2;}
 box(root,'control-room-building',3.9,2.7,2.5,material(0x7b8994),3.5,-.55,2.1);box(root,'control-room-cutaway',3.5,2.3,.12,dark,3.5,-.35,3.38);
 const consoleGroup=new THREE.Group();consoleGroup.name='signal-analysis-console';consoleGroup.position.set(3.5,-.55,3.5);root.add(consoleGroup);
 box(consoleGroup,'radio-review-desk',3.3,.15,1.1,structure,0,-.2,.2);box(consoleGroup,'waterfall-screen-back',3,1.65,.12,dark,0,.78,-.15);
 const bins=[];for(let x=0;x<18;x++)for(let y=0;y<8;y++){const b=box(consoleGroup,'waterfall-frequency-bin-'+x+'-'+y,.12,.12,.035,material((x+y)%5?0x30596e:0x62bdc5),-1.3+x*.153,.12+y*.18,-.06);b.userData.baseColor=b.material.color.getHex();bins.push(b);}
 const filter=box(consoleGroup,'terrestrial-rfi-filter',.18,1.6,.08,red,.55,.8,.08);const signal=sphere(root,'received-radio-packet',.12,new THREE.MeshBasicMaterial({color:0x8ee8dc}),-2.6,1.4,-1.8);
 const candidates=new THREE.Group();candidates.name='signal-candidate-trays';candidates.position.set(3.4,-.58,4.4);root.add(candidates);const cards=[];for(let i=0;i<5;i++)cards.push(box(candidates,'signal-candidate-card-'+i,.45,.035,.38,i%2?cyan:silver,-1.05+i*.5,0,0));
 const rejected=box(consoleGroup,'rfi-rejected-card',.45,.3,.04,red,.5,.6,.14);const scientist=person(root,'human-radio-reviewer',1.9,4.5,material(0x435e79));scientist.group.rotation.y=-.7;
 const pointer=box(consoleGroup,'human-review-pointer',.08,.08,.04,new THREE.MeshBasicMaterial({color:0xf1cc84}),-.6,.9,.14);
 for(let i=0;i<32;i++)sphere(root,'background-star-'+i,.018,new THREE.MeshBasicMaterial({color:i%3?0xbacbdb:0xe4d4ba}),-12+(i*5.37%24),3+(i*1.77%8),-18);
 return {dishes,wavefronts,bins,filter,signal,candidates,cards,rejected,scientist,pointer,
  reset(){wavefronts.position.set(0,0,0);wavefronts.scale.setScalar(1);bins.forEach(b=>b.material.color.setHex(b.userData.baseColor));cards.forEach((c,i)=>c.position.set(-1.05+i*.5,0,0));scientist.arm.rotation.z=.5;wavefronts.visible=false;signal.visible=false;candidates.visible=false;filter.visible=false;rejected.visible=false;pointer.visible=false;},
  act(action,p,t){this.reset();dishes.forEach((d,i)=>{d.mount.rotation.x=.4+i*.035;d.mount.rotation.z=-.15+i*.05;});
   if(action==='dish_survey'||action==='dish_point'||action==='followup_track'){dishes.forEach((d,i)=>{d.mount.rotation.z=-.25+.5*smooth(p)+(action==='followup_track'?i*.035:0);d.mount.rotation.x=.35+.2*Math.sin(p*Math.PI);});}
   if(action==='signal_capture'){wavefronts.visible=true;wavefronts.position.y=-2*smooth(p);wavefronts.scale.setScalar(1-.35*p);signal.visible=true;signal.position.set(-2.6+5.8*p,1.4-1.1*p,-1.8+5.3*p);}
   if(action==='frequency_sweep'){bins.forEach((b,i)=>{const x=i%18;b.material.color.setHex(Math.abs(x-p*17)<1?0x8be5d8:(i%5?0x30596e:0x417e96));});}
   if(action==='rfi_reject'){filter.visible=true;filter.position.x=-1.2+2.4*p;rejected.visible=true;rejected.position.set(.5+1.6*smooth(p),.6-.5*p,.14);rejected.material.transparent=true;rejected.material.opacity=1-.8*p;}
   if(action==='candidate_sort'){candidates.visible=true;cards.forEach((c,i)=>{c.position.x=-1.05+i*.5+(i%2?-.3:.3)*smooth(p);c.position.y=(i%2?.06:.3)*smooth(p);});}
   if(action==='human_review'){pointer.visible=true;pointer.position.x=-.9+1.7*p;scientist.arm.rotation.z=.4+.8*smooth(p);candidates.visible=true;}
  }};
}
const SHOTS={
 array_establish:{a:[-8,4.5,12],b:[-5,2.7,10],target:[0,.4,-2.8]},dish_low:{a:[-5.5,.6,5.4],b:[-3.8,.9,3.9],target:[-2.6,.8,-1.8]},feed_close:{a:[-2.1,3.4,2.1],b:[-1.2,2.5,1.5],target:[-2.6,1.1,-1.8]},signal_follow:{a:[-5,3,7],b:[3.5,2.8,9],target:[.3,.5,.4]},waterfall_top:{a:[4.7,3.3,8.7],b:[3.2,2.4,7.6],target:[3.5,.25,3.5]},filter_macro:{a:[4.5,1,7.8],b:[3.5,.8,7.2],target:[3.7,.3,3.5]},review_over_shoulder:{a:[.6,1.7,8.3],b:[2.2,1.3,8.5],target:[3.5,.2,3.6]},followup_wide:{a:[6,4.2,13],b:[-3,3.2,12],target:[0,.5,-2]},
 room_establish:{a:[-4,2.6,10.5],b:[-2.7,1.9,9],target:[0,-.1,-.4]},robot_follow:{a:[-3.9,1.4,6.7],b:[-1.8,.9,6],target:[-1.5,.2,-.2]},mask_macro:{a:[2.8,2.1,5.2],b:[1.5,1.3,4.8],target:[.8,.1,.1]},layer_orbit:{a:[-2.7,1.9,5.9],b:[2.1,2.4,5.6],target:[.3,.6,.35]},probe_top:{a:[.3,5.8,5],b:[1.6,4.7,4.5],target:[.3,-.1,.1]},package_push:{a:[3,1.1,6.5],b:[2.2,.4,4.8],target:[1.8,-.2,.45]},reject_track:{a:[1.8,.9,6.2],b:[4.2,.3,5.5],target:[3,-.7,.2]},board_hero:{a:[-2,1.2,6.4],b:[.8,1.5,5],target:[.2,-.5,.9]},
 cafe_establish:{a:[4,2.4,10.5],b:[2.5,1.4,9],target:[-.4,.1,-.8]},phone_over_shoulder:{a:[-2.8,1.5,4.6],b:[-1.7,1.1,4.4],target:[.2,.35,.5]},voice_follow:{a:[-2.5,.7,5.7],b:[.9,1.1,5],target:[-.4,.35,.4]},route_side:{a:[3,1.3,5.8],b:[1.4,1.8,5.2],target:[.2,.65,0]},privacy_macro:{a:[1.5,.8,3.6],b:[.6,.65,3],target:[.45,.72,.5]},reference_top:{a:[1.5,5.5,4.7],b:[-.7,4.6,4],target:[0,-.2,1]},receipt_push:{a:[1.7,1.5,5],b:[.5,1.1,3.7],target:[.6,-.15,1]},table_wide:{a:[-3,2.8,8],b:[3,2.1,8.8],target:[-.3,0,.4]}
};
export function shotCamera(shot,p){const row=SHOTS[shot];if(!row)throw Error('Unknown authored shot');const e=smooth(p);return {position:row.a.map((v,i)=>v+(row.b[i]-v)*e),target:row.target};}
export function topicDirector(scene,renderer,story){
 const plan=validateVisualPlan(story),root=new THREE.Group();root.name='topic-world-'+plan.world;scene.add(root);const objects=plan.world==='cleanroom_fabrication'?cleanroom(root):plan.world==='radio_signal_observatory'?observatory(root):cafe(root);
 renderer.toneMappingExposure=plan.world==='cleanroom_fabrication'?.88:1.05;
 // One world-specific area-light scheme; no universal plinth or chip backdrop.
 const key=new THREE.DirectionalLight(plan.world==='cleanroom_fabrication'?0xd7f5ff:0xffd6a3,2.6);key.position.set(-3,6,4);root.add(key);
 const fill=new THREE.HemisphereLight(plan.world==='cleanroom_fabrication'?0xa6e8ed:0xffe4b5,0x26303c,1.3);root.add(fill);const rim=new THREE.PointLight(plan.world==='cleanroom_fabrication'?0x60d7f5:0xf2ae68,25,22,1.6);rim.position.set(3,3,-3);root.add(rim);
 function update(camera,index,p,time){const row=plan.scenes[index];objects.act(row.action,p,time);const view=shotCamera(row.shot,p);camera.position.set(...view.position);camera.lookAt(...view.target);return {world:plan.world,scene_id:row.id,focal_object:row.focal_object,action:row.action,shot:row.shot,state_change:row.state_change};}
 return {root,objects,update,contract:{version:'news-topic-director-v1',world:plan.world,scene_actions:plan.scenes.map(r=>r.action),shots:plan.scenes.map(r=>r.shot),source_addressed:true,no_generic_fallback:true}};
}
export function drawDirectorOverlay(ctx,{story,timing,index,time,duration,logo}){
 const row=story.scenes[index],silent=story.visual_review_only===true;ctx.clearRect(0,0,1080,1920);ctx.save();
 const top=ctx.createLinearGradient(0,0,0,430);top.addColorStop(0,'rgba(4,12,19,.9)');top.addColorStop(1,'rgba(4,12,19,0)');ctx.fillStyle=top;ctx.fillRect(0,0,1080,430);
 const bottom=ctx.createLinearGradient(0,1420,0,1920);bottom.addColorStop(0,'rgba(4,12,19,0)');bottom.addColorStop(.55,'rgba(4,12,19,.85)');bottom.addColorStop(1,'rgba(4,12,19,.98)');ctx.fillStyle=bottom;ctx.fillRect(0,1420,1080,500);
 ctx.direction='rtl';ctx.textAlign='right';ctx.fillStyle='#f8f1df';ctx.font='700 43px Noto';ctx.fillText(story.series||'ai على السريع',980,107);ctx.font='700 24px Noto';ctx.fillStyle='#c7d9d8';ctx.fillText(silent?'مقارنة إخراجية صامتة • ليست خبرًا':'خبر من المصدر • إخراج مرتبط بالموضوع',980,162);
 ctx.textAlign='center';ctx.font='700 48px Noto';ctx.fillStyle='#fff4df';ctx.fillText(row.label,540,285,930);
 const caption=timing?.caption_groups?.find(g=>time>=g.start&&time<g.end);if(caption){ctx.font='700 43px Noto';ctx.fillStyle='#fff';ctx.fillText(caption.text,540,1530,920);}
 ctx.font='700 25px Noto';ctx.fillStyle='#e7d4a7';ctx.fillText(silent?'تجربة حركة بلا تعليق صوتي • لا تصلح للنشر':'المزاح موسوم منفصلًا عن الوقائع',540,1660);
 if(story.source?.published){ctx.font='700 22px Noto';ctx.fillStyle='#ccd4d7';ctx.fillText('تاريخ المصدر: '+story.source.published.slice(0,10),540,1710);}
 ctx.font='700 21px Noto';ctx.fillStyle='#c0cdd4';ctx.fillText(String(story.source?.publisher||'Visual comparison; not a news claim').slice(0,70),540,1760,940);
 ctx.fillStyle='#49616b';ctx.fillRect(75,1810,810,5);ctx.fillStyle='#f1bd69';ctx.fillRect(75,1810,810*clamp(time/duration),5);ctx.restore();
}
