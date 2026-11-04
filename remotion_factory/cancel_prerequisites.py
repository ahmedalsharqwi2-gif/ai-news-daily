"""Cancel one explicitly selected stuck dependency-install run; never start any run."""
import json,os,time
from datetime import datetime,timezone
from pathlib import Path
from urllib.request import Request,urlopen
def safe_job(job,run_id,ledger,now):
 if job.get('run_id')!=run_id or job.get('status')!='in_progress':raise ValueError('Exact active job required')
 steps=job.get('steps',[])
 active=[s for s in steps if s.get('status')=='in_progress']
 if len(active)!=1 or active[0].get('name')!='Install planning prerequisites':raise ValueError('Only the dependency installation may be active')
 required=['Freeze original date; verify configured Cairo clock and existing queues','New topic → retained voice → Remotion → full decode → verified configured-time scheduling']
 for name in required:
  rows=[s for s in steps if s.get('name')==name]
  if len(rows)!=1 or rows[0].get('status') not in ('queued','pending'):raise ValueError('Production may already have started; no cancellation')
 for entry in ledger.get('episodes',{}).values():
  if any(entry.get(key)==run_id for key in ('source_run','writer_run','voice_request_run','render_run')):raise ValueError('A retained production request already exists; no cancellation')
 started=datetime.fromisoformat(active[0]['started_at'].replace('Z','+00:00'))
 if (now-started).total_seconds()<900:raise ValueError('Dependency step is not yet stuck')
 return True
def main():
 req=json.loads(Path('.github/remotion-cleanup-request.json').read_text())
 repo=os.environ['GITHUB_REPOSITORY'];run=req['run_id']
 if repo!='ahmedalsharqwi2-gif/ai-news-daily' or req.get('operation')!='cancel-stuck-prerequisites' or req.get('approved_by_owner') is not True or run!=41904681860 or req.get('expected_job_id')!=126836059952:raise ValueError('Only the exact documented dependency-only run is authorized')
 def gh(path,method='GET'):
  request=Request('https://api.github.com/repos/'+repo+path,method=method,headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json','User-Agent':'factory-dependency-cancellation'})
  with urlopen(request,timeout=30) as response:return json.loads(response.read() or '{}')
 info=gh('/actions/runs/'+str(run))
 proof={'run_id':run,'operation':'cancel-only','new_runs':0,'generation_calls':0,'publication_mutations':0}
 if info.get('status')=='completed':
  proof.update(cancel_not_needed=True,conclusion=info.get('conclusion'))
 else:
  if info.get('path')!='.github/workflows/remotion-daily.yml':raise ValueError('Wrong workflow')
  job=gh('/actions/jobs/'+str(req['expected_job_id']))
  ledger=json.loads(Path('state/remotion_registry.json').read_text())
  safe_job(job,run,ledger,datetime.now(timezone.utc))
  proof['verified_before']={'active_step':'Install planning prerequisites','no_retained_generation':True,'generation_steps_pending':True}
  gh('/actions/runs/'+str(run)+'/cancel','POST')
  proof['cancel_accepted']=True
  for _ in range(12):
   info=gh('/actions/runs/'+str(run))
   if info.get('status')=='completed':break
   time.sleep(5)
  proof['final_status']=info.get('status');proof['final_conclusion']=info.get('conclusion')
 Path('cleanup-output').mkdir(exist_ok=True)
 Path('cleanup-output/cancel-stuck-prerequisites.json').write_text(json.dumps(proof,indent=2)+'\n')
 print(json.dumps(proof))
if __name__=='__main__':main()
