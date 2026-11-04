import copy,json,unittest
from pathlib import Path
from remotion_factory.speech_lexicon import for_story,recognized_key
from remotion_factory.speech_characters import character_timing
class ContextualNameTiming(unittest.TestCase):
 def test_actual_retained_news_names_keep_independent_timestamps(self):
  data=json.loads((Path(__file__).parent/'fixtures/retained-news-name-timing.json').read_text())
  rows=[(n,[{'text':text,'start':a,'end':b} for text,a,b in words]) for n,words in data['transcripts'].items()];before=copy.deepcopy(rows)
  timing=character_timing(data['story'],data['duration'],rows,for_story(data['story']))
  self.assertGreaterEqual(timing['coverage'],.9);self.assertEqual(rows,before)
  self.assertLessEqual(timing['scenes'][-1]['end'],data['duration'])
 def test_unrelated_story_does_not_reinterpret_english_words(self):
  key=for_story({'scenes':[{'narration':'دي مقارنة لتغيير ملف واحد'}]})
  self.assertEqual(key('pair'),recognized_key('pair'))
  self.assertEqual(key('storage'),recognized_key('storage'))
 def test_source_names_only_are_normalized(self):
  key=for_story({'scenes':[{'narration':'أوبن إيه آي وكودكس وبيير'}]})
  self.assertEqual(key('OpenAI'),recognized_key('أوبن إيه آي'))
  self.assertEqual(key('Codex'),recognized_key('كودكس'))
  self.assertEqual(key('بالفعل'),recognized_key('بالفعل'))
