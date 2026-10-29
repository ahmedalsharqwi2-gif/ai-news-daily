"""Editorial correction of the SAME reserved news story, without rewriting facts."""
import copy,hashlib,json,subprocess
from pathlib import Path
from .editorial import registry,save
from .news_policy import require_fresh
SOURCE_REF='refs/remotes/origin/news-review-source'

def revise(story):
 s=copy.deepcopy(story)
 if s.get('profile')!='news' or s.get('topic_key')!='6394645bd5105adc':raise ValueError('This editorial revision is scoped to the reviewed Apple speech-model story')
 replacements={'هاجين فايز':'هاجينج فيس','بيتڤلموا':'بيتكلموا','نڤس':'نفس','من ںير':'من غير','مأات':'مئات','علڭ':'على','سيليڤون':'سيليكون','الماڤ':'الماك','ستريمنڬ':'ستريمنج'}
 for scene in s['scenes']:
  for old,new in replacements.items():scene['narration']=scene['narration'].replace(old,new)
 # Source states local-model/system/storage requirements; omit an unclear model-name transliteration.
 s['scenes'][6]['narration']='التشغيل المحلي ليه متطلبات للنظام والجهاز ومساحة التخزين. يعني قبل التجربة، المطور لازم يراجع إصدار النظام وحجم النموذج المناسب لجهازه، مش يفترض إن أي جهاز هيشغّل أي نموذج بنفس الأداء.'
 additions={
  0:('يعني التليفون يدخل اجتماع العيلة ويفهم مين قال إيه، وإحنا لسه بنقول يا جماعة واحد واحد.','يا جماعة واحد واحد','loading'),
  2:('أربعة بيتكلموا فوق بعض؟ ده مش اختبار ذكاء اصطناعي، ده جروب العيلة لما حد يسأل مين جاب آخر حتة كنافة.','مين جاب آخر حتة كنافة','shock'),
  4:('نعم أو لا من غير محاضرة؟ ابعتوا النموذج ده لأي حد بنسأله سؤال بسيط ويرد علينا برسالة صوتية عشر دقايق.','رسالة صوتية عشر دقايق','suspicious'),
  6:('بس خليك صاحي لمساحة التخزين؛ قبل ما تفرح بالذكاء الجديد، ممكن الماك يطلب منك تمسح فولدر اسمه نسخة نهائية بجد.','نسخة نهائية بجد','loading')}
 for index,(line,phrase,reaction) in additions.items():
  scene=s['scenes'][index];scene['narration']+=' '+line;scene['punchline']=phrase;scene['reaction']=reaction
 s['title']='الماك بقى يسمع ويفرّق الأصوات.. إيه حكاية النماذج الجديدة؟'
 s['post_edit_review']={'reviewer':'Codex editorial review','scope':'Correct Arabic spelling and unclear transliteration; add explicitly satirical narrator commentary to the already source-reviewed reserved episode. No new source performance claims.','source_factual_review_preserved':True,'voice_must_be_regenerated':True,'silent_padding':False}
 return s

def main():
 subprocess.run(['git','fetch','origin','refs/heads/codex/professional-review-run-40897156479:'+SOURCE_REF],check=True)
 raw=subprocess.check_output(['git','show',SOURCE_REF+':professional_motion/delivery/story.json']);s=revise(json.loads(raw));require_fresh(s['source'])
 p=Path('professional_motion/delivery');p.mkdir(exist_ok=True)
 for name in ('narration.wav','narration.source.json','timing.json','error.json'):(p/name).unlink(missing_ok=True)
 s['post_edit_review']['source_story_sha256']=hashlib.sha256(raw).hexdigest();(p/'story.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
 data=registry();row=next(r for r in data['episodes'] if r.get('topic_key')==s['topic_key'])
 if row.get('status') in ('scheduled','published','publishing'):raise ValueError('Never revise a submitted episode')
 row.update(story=s,title=s['title'],status='reserved');save(data)
 print('Same sourced news episode revised:',sum(len(x['narration'].split()) for x in s['scenes']),'words; four original audible punchlines')
if __name__=='__main__':main()
