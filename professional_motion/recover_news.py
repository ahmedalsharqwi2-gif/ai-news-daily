"""Recover a failed review without repeating its topic or billing another TTS."""
import json,subprocess
from pathlib import Path
from .editorial import registry,save
REF='refs/heads/codex/professional-review-run-40786180689'
subprocess.run(['git','fetch','origin',REF,'--depth=1'],check=True)
root=Path('professional_motion/delivery');root.mkdir(exist_ok=True)
for name in ('story.json','narration.wav','narration.source.json'):
    (root/name).write_bytes(subprocess.check_output(['git','show','FETCH_HEAD:professional_motion/delivery/'+name]))
s=json.loads((root/'story.json').read_text());s['title']='جيميني فور كاربون: إيه الجديد؟'
labels=['جيميني فور كاربون','مهام برمجية أطول','الأمن السيبراني','مقارنة بالإصدارات السابقة','طرح تدريجي للشركاء','تكلفة الرموز','المراجعة والمخاطر','تطوير بإجراءات سلامة']
for scene,label in zip(s['scenes'],labels):scene['label']=label;scene['labels']=[]
s['heading_revision']='Arabic topic-specific headings; original factual narration retained'
(root/'story.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
data=registry();episode=next(r for r in data['episodes'] if r['slot']=='review-40786180689');episode['story']=s;episode['title']=s['title'];save(data)
