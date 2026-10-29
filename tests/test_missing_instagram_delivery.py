"""Adding Instagram must never create a second post on accepted destinations."""
import os,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from film_factory.buffer import ContentPublisher

class MissingInstagramTests(unittest.TestCase):
 def test_retry_submits_only_new_instagram_destination(self):
  env={'BUFFER_API_KEY':'test-only','BUFFER_CHANNEL_IDS':'youtube:yt,facebook:fb,instagram:ig','PUBLISH_CHANNELS':'youtube,facebook,instagram','PUBLICATION_RECEIPTS_ENABLED':'true','PUBLISH_IMMEDIATE':'true'}
  with tempfile.TemporaryDirectory() as td,patch.dict(os.environ,env,clear=True):
   video=Path(td)/'film.mp4';video.write_bytes(b'unchanged movie')
   with patch.object(ContentPublisher,'_release_asset_url',return_value='https://example.com/exact-approved-film.mp4'),patch.object(ContentPublisher,'_create_buffer_post',return_value={'id':'new-ig-post'}) as create,patch('scripts.publication_state.accepted_receipt',side_effect=lambda service:None if service=='instagram' else {'id':'existing-'+service}),patch('scripts.publication_state.require_services'),patch('scripts.publication_state.record_receipt') as record:
    self.assertTrue(ContentPublisher().publish_to_buffer(video,'title','caption',[]))
    self.assertEqual(create.call_count,1);self.assertEqual(create.call_args.args[0],'ig')
    self.assertEqual(record.call_count,1);self.assertEqual(record.call_args.args[:2],('instagram','new-ig-post'))
