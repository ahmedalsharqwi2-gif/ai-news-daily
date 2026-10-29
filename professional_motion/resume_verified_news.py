"""Resume exact original news audio after repairing multilingual ASR matching."""
import hashlib,json,subprocess
from pathlib import Path
from .alignment import measured_timing
from .editorial import registry,save
from .news_policy import validate_memes,require_fresh
from .policy import require_duration
REF='refs/remotes/origin/original-news-audio'
COMMIT='dc49491848809acc26e9c84399bacbe89e3fd9c1'

def verify():
 p=Path('professional_motion/delivery');s=json.loads((p/'story.json').read_text());t=json.loads((p/'timing.json').read_text());source=json.loads((p/'narration.source.json').read_text())
 if t['story_sha256']!=hashlib.sha256((p/'story.json').read_bytes()).hexdigest() or t['audio_sha256']!=hashlib.sha256((p/'narration.wav').read_bytes()).hexdigest():raise ValueError('Saved media binding mismatch')
 if source['text']!=' '.join(x['narration'] for x in s['scenes']):raise ValueError('Supplied narration text differs from the existing complete voice')
 require_duration(t['duration'])
 if t['coverage']<.85:raise ValueError('Insufficient independently recognized speech evidence')
 print('Existing full original voice verified; NO synthesis request. Exact coverage',t['exact_token_coverage'],'normalized coverage',t['coverage'])

def main():
 subprocess.run(['git','fetch','origin','refs/heads/codex/professional-review-run-40925706170:'+REF],check=True)
 if subprocess.check_output(['git','rev-parse',REF]).decode().strip()!=COMMIT:raise ValueError('Audio evidence reference changed')
 p=Path('professional_motion/delivery');p.mkdir(exist_ok=True)
 for n in ['story.json','narration.wav','narration.source.json','asr-medium.json','asr-small.json','asr-large-v3.json']:(p/n).write_bytes(subprocess.check_output(['git','show',REF+':professional_motion/delivery/'+n]))
 s=json.loads((p/'story.json').read_text());require_fresh(s['source']);s['scenes'][4]['punchline']='برسالة صوتية عشر دقايق';validate_memes(s)
 (p/'story.json').write_text(json.dumps(s,ensure_ascii=False,indent=2));source=json.loads((p/'narration.source.json').read_text())
 actual=hashlib.sha256((p/'narration.wav').read_bytes()).hexdigest()
 if actual!=source['sha256']:raise ValueError('Original audio checksum mismatch')
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p/'narration.wav')]))
 require_duration(duration);transcripts=[(n,json.loads((p/('asr-'+n+'.json')).read_text())['recognized_words']) for n in ['medium','small','large-v3']]
 t=measured_timing(s,duration,transcripts);t.update(story_sha256=hashlib.sha256((p/'story.json').read_bytes()).hexdigest(),audio_sha256=actual,profile='news',topic_key=s['topic_key'])
 (p/'timing.json').write_text(json.dumps(t,ensure_ascii=False,indent=2));(p/'error.json').unlink(missing_ok=True)
 data=registry();row=next(r for r in data['episodes'] if r.get('topic_key')==s['topic_key'])
 if row.get('status') in ('publishing','scheduled','published'):raise ValueError('Do not rerender submitted news')
 row.update(story=s,title=s['title'],status='reserved');save(data);verify()
if __name__=='__main__':
 import sys
 verify() if '--verify-only' in sys.argv else main()
