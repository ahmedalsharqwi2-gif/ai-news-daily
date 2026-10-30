"""Reuse today's exact 148-second Charon narration and independently measured ASR."""
import hashlib,json,subprocess
from pathlib import Path
from .alignment import measured_timing
from .editorial import registry
SOURCE='ca10b9423312c9944854c661a7d1da068e0b5a10'
AUDIO='e89de1fccf633c4202b4599fbae24ad53ba31f04c865756244f4b54df8978d25'
def main():
 subprocess.run(['git','fetch','origin','refs/heads/codex/professional-review-run-41055355463'],check=True)
 def blob(name):return subprocess.check_output(['git','show',SOURCE+':professional_motion/delivery/'+name])
 out=Path('professional_motion/delivery');out.mkdir(exist_ok=True)
 story_bytes=blob('story.json');story=json.loads(story_bytes);current=next(r for r in registry()['episodes'] if r['slot']=='daily-2026-10-30')
 if current.get('status') in ('scheduled','published') or current['story']['topic_key']!=story['topic_key']:raise ValueError('Wrong or already scheduled daily episode')
 script=lambda x:' '.join(s['narration'] for s in x['scenes'])
 if script(current['story'])!=script(story):raise ValueError('Reserved script differs from pinned narration')
 wav=blob('narration.wav')
 if hashlib.sha256(wav).hexdigest()!=AUDIO:raise ValueError('Original audio changed')
 transcripts=[]
 for name in ('medium','small','large-v3'):
  data=blob('asr-'+name+'.json');(out/('asr-'+name+'.json')).write_bytes(data);transcripts.append((name,json.loads(data)['recognized_words']))
 (out/'narration.wav').write_bytes(wav);(out/'narration.source.json').write_bytes(blob('narration.source.json'));(out/'story.json').write_bytes(story_bytes)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out/'narration.wav')]))
 if not 120<=duration<180:raise ValueError('Narration outside daily duration')
 timing=measured_timing(story,duration,transcripts);timing.update(profile='news',topic_key=story['topic_key'],audio_sha256=AUDIO,story_sha256=hashlib.sha256(story_bytes).hexdigest())
 (out/'timing.json').write_text(json.dumps(timing,ensure_ascii=False,indent=2));(out/'reused-current-voice.json').write_text(json.dumps({'source_run':'41055355463','audio_sha256':AUDIO,'audio_unchanged':True,'exact_token_coverage':timing['exact_token_coverage'],'scene_openings':'first available measured anchor within the opening eight script words; no invented timestamps'},indent=2))
 print('Original current news voice verified:',duration,'seconds; exact speech coverage',timing['exact_token_coverage'])
if __name__=='__main__':main()
