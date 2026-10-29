import json,tempfile,unittest
from datetime import datetime,timezone,timedelta
from pathlib import Path
from unittest.mock import patch
import requests
from news import editor
from professional_motion.news_policy import validate_memes,choose

BODY='The official announcement describes the new model, its available capabilities, access conditions, and limitations. '*24

class PublicArticleExtractionTests(unittest.TestCase):
 def test_full_jsonld_article_is_used_when_html_only_has_a_teaser(self):
  payload={'@type':'NewsArticle','headline':'A model announcement','articleBody':BODY,'relatedPosts':[{'@type':'Article','articleBody':'Unrelated story. '*500}]}
  html='<main><h1>A model announcement</h1><p>Read more.</p></main><script type="application/ld+json">'+json.dumps(payload)+'</script>'
  result=editor.extract_article_html(html)
  self.assertEqual(result['article'],BODY.strip());self.assertEqual(result['extraction_method'],'articleBody');self.assertNotIn('Unrelated',result['article'])
 def test_public_next_payload_supports_portable_rich_text(self):
  payload={'props':{'pageProps':{'post':{'_type':'post','title':'New AI tool','body':[{'_type':'block','children':[{'_type':'span','text':BODY}]}]},'relatedPosts':[{'body':'Not the source article. '*500}]}}}
  html='<main><p>Teaser only.</p></main><script id="__NEXT_DATA__" type="application/json">'+json.dumps(payload)+'</script>'
  result=editor.extract_article_html(html);self.assertEqual(result['article'],BODY.strip());self.assertEqual(result['extraction_method'],'embedded_article')
 def test_recommendations_cannot_substitute_for_a_missing_article(self):
  html='<main><p>Short teaser.</p><div class="related-posts"><div><p>'+BODY+'</p></div></div></main><script type="application/json">'+json.dumps({'relatedPosts':[{'@type':'Article','articleBody':BODY}]})+'</script>'
  with self.assertRaisesRegex(ValueError,'full-text evidence'):editor.extract_article_html(html)
 def test_generic_long_homepage_is_not_treated_as_article_evidence(self):
  with self.assertRaises(ValueError):editor.extract_article_html('<div><p>'+BODY+'</p></div>')
 def test_nested_paragraphs_are_not_counted_twice_and_caveats_remain(self):
  html='<article><h1>AI announcement</h1><ul><li><p>'+BODY+'</p></li></ul><p>Clinical claims still require independent validation.</p></article>'
  article=editor.extract_article_html(html)['article'];self.assertEqual(article.count('The official announcement'),24);self.assertIn('independent validation',article)
 def test_denied_response_never_uses_embedded_payload(self):
  response=type('Response',(),{'url':'https://deepmind.google/blog/new/','text':'<script type="application/ld+json">'+json.dumps({'@type':'Article','articleBody':BODY})+'</script>','raise_for_status':lambda self:(_ for _ in ()).throw(requests.HTTPError('403'))})()
  with patch.object(editor.requests,'get',return_value=response),patch.object(editor,'extract_article_html',side_effect=AssertionError('must not extract')):
   with self.assertRaises(requests.HTTPError):editor.article({'url':'https://deepmind.google/blog/new/'})
 def test_redirect_to_another_story_is_rejected(self):
  response=type('Response',(),{'url':'https://openai.com/index/other-story/','text':'<article><p>'+BODY+'</p></article>','raise_for_status':lambda self:None})()
  with patch.object(editor.requests,'get',return_value=response):
   with self.assertRaisesRegex(ValueError,'redirected away'):editor.article({'url':'https://openai.com/index/new-story/'})

class OfficialFeedTests(unittest.TestCase):
 def test_one_bad_dated_entry_does_not_discard_the_rest_of_a_feed(self):
  xml='<rss><channel><item><title>AI bad item</title><link>https://openai.com/index/bad</link><pubDate>invalid</pubDate></item><item><title>New AI model</title><link>https://openai.com/index/good</link><pubDate>Thu, 29 Oct 2026 07:00:00 GMT</pubDate><description>New public model capabilities.</description></item></channel></rss>'
  response=type('Response',(),{'content':xml.encode(),'raise_for_status':lambda self:None})()
  with tempfile.TemporaryDirectory() as td,patch.object(editor,'FEEDS',[('OpenAI','https://openai.com/news/rss.xml')]),patch.object(editor.requests,'get',return_value=response):
   import os
   previous=os.getcwd()
   try:
    os.chdir(td);rows=editor.candidates(datetime(2026,10,29,8,tzinfo=timezone.utc));self.assertEqual([r['url'] for r in rows],['https://openai.com/index/good']);status=json.loads(Path('output/feed-status.json').read_text());self.assertEqual(status['invalid_items'],1)
   finally:os.chdir(previous)
 def test_atom_prefers_the_public_article_over_a_self_feed_link(self):
  import xml.etree.ElementTree as ET
  item=ET.fromstring('<entry xmlns="http://www.w3.org/2005/Atom"><link rel="self" href="https://openai.com/feed/123"/><link rel="alternate" type="text/html" href="https://openai.com/index/release/"/></entry>')
  self.assertEqual(editor._entry_link(item),'https://openai.com/index/release/')
 def test_undated_or_timezone_free_values_are_not_invented(self):
  for raw in ('',None,'2026-10-29','2026-10-29T07:00:00'):
   with self.assertRaises(ValueError):editor.date(raw)
 def test_official_identity_normalizes_www_and_tracking_without_allowing_other_ports(self):
  self.assertEqual(editor.canonical('https://www.openai.com/index/new/?utm=x'),'https://openai.com/index/new')
  with self.assertRaises(ValueError):editor.canonical('https://openai.com:8443/index/new')

class MeasuredMemeContractTests(unittest.TestCase):
 def test_punchline_uses_actual_spoken_prefixed_words(self):
  jokes=['الكود طالب أجازة','المحفظة حضرت الاجتماع','البنشمارك محتاج حكم','السيرفر بيشرب قهوة']
  story={'scenes':[{'narration':'وده الخبر، و'+j,'punchline':j,'reaction':'shock'} for j in jokes]};validate_memes(story)
  self.assertEqual(story['scenes'][0]['punchline'],'والكود طالب أجازة')
 def test_word_substrings_cannot_be_presented_as_a_spoken_punchline(self):
  jokes=['كود طالب أجازة','المحفظة حضرت الاجتماع','البنشمارك محتاج حكم','السيرفر بيشرب قهوة']
  story={'scenes':[{'narration':('ده '+j if i else 'الكود طالب أجازة'),'punchline':j,'reaction':'shock'} for i,j in enumerate(jokes)]}
  with self.assertRaisesRegex(ValueError,'complete spoken words'):validate_memes(story)
 def test_ranked_rows_cannot_come_from_float_indices_or_scores(self):
  now=datetime(2026,10,29,8,tzinfo=timezone.utc);row={'title':'New model','publisher':'OpenAI','url':'https://openai.com/index/new','published':now.isoformat()}
  picks={'selected':[{'index':0.0,'importance':5,'reason':'bad index'},{'index':0,'importance':4.0,'reason':'bad score'}]}
  self.assertEqual(choose([row],lambda *args:picks,now),[])

if __name__=='__main__':unittest.main()


class ProfessionalArticleIntegrationTests(unittest.TestCase):
    def test_professional_editor_uses_full_official_article_extractor(self):
        from professional_motion import editorial as e
        from news import editor
        import tempfile
        from pathlib import Path
        row={'title':'Dated release','publisher':'OpenAI','url':'https://openai.com/index/release/','family':'compute'}
        text='A complete official body with actual source evidence. '*100
        with tempfile.TemporaryDirectory() as td,patch.object(e,'ROOT',Path(td)),patch.object(editor,'article',return_value={'article':text}) as extract,patch.object(e,'evidence',side_effect=AssertionError('generic teaser extraction must not run')),patch.object(e,'ask',return_value={'suitable':False}):
            with self.assertRaises(ValueError):e.write_sourced(row,'news',[])
            extract.assert_called_once_with(row)
