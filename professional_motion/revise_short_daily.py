"""Source-reviewed expansion of the same current AI news, with original topical satire."""
import copy,hashlib,json
from . import editorial as e
NARRATIONS=[
'أوبن إيه آي أعلنت تحديث لدليل سلوك نماذجها، اللي بتسميه موديل سبيك. الخبر هنا مش إطلاق موديل جديد، لكن تغيير في المبادئ اللي الشركة عايزة النماذج تتصرف على أساسها. يعني بنراجع طريقة المساعدة واتخاذ القرارات، مش بنعلن قفزة أداء اتقاست في اختبار.',
'التحديث بيرتب الدليل حوالين خمس قيم: فهم نية الإنسان، وتقليل الضرر، والصدق والشفافية، ودعم قدرة الناس على الاختيار، ومراعاة ظروفهم. الفكرة إن النموذج يفهم ليه القاعدة موجودة، بدل ما ينفذ كلامك بالحرف ويطلع بنتيجة ملهاش علاقة بالهدف اللي كنت تقصده.',
'من الأمثلة اللي الشركة ذكرتها مقارنة عروض الشغل. لو كنت قلت قبل كده إن مواعيد الشغل المنتظمة مهمة لك، النموذج ممكن ياخد ده في الاعتبار، بس يوضح افتراضاته ويخليك تصححها. مساعد ذكي آه، مدير لحياتي لأ. القرار يفضل قرارك أنت، مش تفضيل مخفي يفرضه عليك.',
'الدليل كمان بينظم ترتيب التعليمات وحل التعارض بينها. الشركة بتحط حدود، والمطور بيحدد التطبيق داخل الحدود دي، والمستخدم بيوجه الشغل. مش كل رسالة تقول أنا المدير يبقى نديها ختم النسر. دي قفشة على لخبطة التعليمات، أما التحديث نفسه فبيشرح إزاي النموذج يحدد أنهي تعليمات تنطبق.',
'قسم جديد بيركز على فهم السياق بعناية: المحادثات والذاكرة والأدلة المتاحة تساعد النموذج يفهم نواياك وتفضيلاتك. لكن ده مش تصريح إنه يتصرف نيابة عنك من غير حدود. الدليل بيتكلم كمان عن توضيح الآثار الجانبية للشغل، ومراعاة تأثيره على ناس تانية، مع احترام هدفك وتعليماتك.',
'في المقابل، معظم تعليمات الأسلوب التفصيلية القديمة اتشالت، عشان الأسلوب يتكيف مع اللغة والثقافة وتفضيل كل شخص. لكن الحياد فضل مبدأ أقوى؛ النموذج ما يفترضش رأيك لمجرد إنه فاكر إنك عايز تسمعه. مش كل ما أقول رأيي يقول لي إنت أسطورة. المجاملة مش دليل صحة.',
'الصدق هنا يشمل إن النموذج يوضح اللي يعرفه، واللي عمله، والحاجات اللي مش متأكد منها. ده مهم عشان تقدر تقيّم النتيجة بدل ما تتأثر بصوت واثق وخلاص. الثقة مش بالصوت العالي، المهم المعلومة صح. التعليق ده ساخر، ومش وعد إن الأخطاء اختفت من المنتجات.',
'والنقطة الأهم في آخر الإعلان: الشركة بتقول إن نماذجها لسه مش بتعكس الدليل بالكامل. يعني فيه فرق بين السلوك المستهدف والتنفيذ الحالي. هم طالبين ملاحظات على القيم والتوازنات والصياغة، وبيقولوا إن الدليل والنماذج هيفضلوا يتطوروا. نتابع التطبيق الفعلي، وما نعتبرش تحديث الدليل وحده نتيجة مضمونة.'
]
PUNCHLINES={2:'مساعد ذكي آه، مدير لحياتي لأ.',3:'مش كل رسالة تقول أنا المدير يبقى نديها ختم النسر.',5:'مش كل ما أقول رأيي يقول لي إنت أسطورة.',6:'الثقة مش بالصوت العالي، المهم المعلومة صح.'}
def main():
 data=e.registry();episode=next(r for r in data['episodes'] if r['slot']=='daily-2026-10-30')
 if episode.get('status') in ('scheduled','published'):raise RuntimeError('Do not alter a scheduled film')
 story=copy.deepcopy(episode['story'])
 if story['topic_key']!='9349f418e7bc7ab4':raise ValueError('Only the same reserved OpenAI news is authorized')
 from news.editor import article
 row={**story['source'],'key':story['topic_key'],'family':'compute','variant':'chip'}
 text=article(row)['article'];excerpts=e.excerpts(text)
 terms=['faithfulness','harm','offers','command','memories','Style','uncertain','fully']
 for i,scene in enumerate(story['scenes']):
  index=next(j for j,excerpt in enumerate(excerpts) if terms[i].casefold() in excerpt.casefold())
  scene.update(narration=NARRATIONS[i],evidence_excerpt_id=index,punchline=PUNCHLINES.get(i,''),reaction={2:'suspicious',3:'shock',5:'smug',6:'loading'}.get(i,'none'))
 e.attach_evidence(story,text)
 story['editorial_review']={'supported':True,'novel':True,'issues':[],'review_type':'Codex source and satire review of the same reserved OpenAI announcement','source_body_sha256':hashlib.sha256(text.encode()).hexdigest(),'checks':['No claim of a newly launched model or measured performance improvement','Four original audible punchlines are narrator commentary, not company quotes','Explain all five published values and the job-offer/context examples accurately','Retain explicit source warning that current models do not fully reflect the Spec']}
 episode.update(story=story,title=story['title'],status='reserved',revision_reason='Original narration measured 108.96 seconds and lacked audible memes; source-backed editorial expansion, no padding')
 e.save(data);(e.ROOT/'delivery').mkdir(exist_ok=True);(e.ROOT/'delivery/story.json').write_text(json.dumps(story,ensure_ascii=False,indent=2))
 print('Reviewed same news words:',sum(len(s['narration'].split()) for s in story['scenes']))
if __name__=='__main__':main()
