import path from 'node:path';import {readFile,mkdir,rename,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {chooseSources} from './topics.mjs';
export function assessActiveNews(active,config,{now=Date.now()}={}){
 if(config.profile!=='news')return {applicable:false};
 if(active.profile!=='news')throw Error('ACTIVE_REVIEW_CHANNEL_MISMATCH');
 let chosen;try{chosen=chooseSources(active.topic?.sources||[],config,{now});}catch{throw Error('ACTIVE_NEWS_SOURCE_NOT_ELIGIBLE');}
 const eligibleIds=new Set(chosen.sources.map(s=>s.id));if(!(active.episode?.scenes||[]).length||(active.episode.scenes||[]).some(s=>!eligibleIds.has(s.sourceId)))throw Error('ACTIVE_NEWS_CITES_INELIGIBLE_SOURCE');
 const declaredMode=active.topic.editorialMode||'daily';if(chosen.editorialMode!==declaredMode)throw Error('ACTIVE_NEWS_WINDOW_CHANGED');
 if(chosen.editorialMode==='weekly'&&(!active.episode.title?.startsWith('أهم أخبار الأسبوع')||active.episode.editorialLabel!=='أهم أخبار الأسبوع'))throw Error('ACTIVE_WEEKLY_NEWS_LABEL_REQUIRED');
 return {applicable:true,editorialMode:chosen.editorialMode,windowHours:chosen.windowHours,sourceIds:[...eligibleIds]};
}
export async function quarantineActive(root,active,code){
 const original=path.join(root,'state/active-review.json');const bytes=await readFile(original);const id=String(active.id||'unknown').replace(/[^A-Za-z0-9_-]/g,'_');const directory=path.join(root,'state/quarantine');await mkdir(directory,{recursive:true});const target=path.join(directory,id+'-'+Date.now()+'.json');await rename(original,target);
 const proof={code,run:active.id,original_sha256:createHash('sha256').update(bytes).digest('hex'),voiceCachesPreserved:true,topicHistoryPreserved:true};await writeFile(target+'.reason.json',JSON.stringify(proof,null,2)+'\n');return proof;
}
