"""Fail closed before browser startup when production narration provenance is broken."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class V2RenderInputTests(unittest.TestCase):
    def rejected(self, *, duration=148.0, audio_hash=None, story_hash=None, topic='news-item'):
        with tempfile.TemporaryDirectory() as folder:
            delivery = Path(folder) / 'delivery'
            delivery.mkdir()
            story = b'{"profile":"news","topic_key":"news-item"}'
            audio = b'exact narration bytes'
            (delivery / 'story.json').write_bytes(story)
            (delivery / 'narration.wav').write_bytes(audio)
            (delivery / 'timing.json').write_text(json.dumps({
                'story_sha256': story_hash or hashlib.sha256(story).hexdigest(),
                'audio_sha256': audio_hash or hashlib.sha256(audio).hexdigest(),
                'duration': duration, 'topic_key': topic,
            }))
            result = subprocess.run(['node', 'professional_motion/render.mjs', '--pipeline', 'v2',
                '--delivery-dir', str(delivery), '--output-dir', str(Path(folder) / 'output')],
                cwd=ROOT, capture_output=True, text=True, timeout=10)
            self.assertNotEqual(result.returncode, 0)
            return result.stderr

    def test_changed_story_cannot_reuse_old_timing(self):
        self.assertIn('Story changed', self.rejected(story_hash='0'*64))

    def test_changed_voice_cannot_reuse_old_timing(self):
        self.assertIn('Narration changed', self.rejected(audio_hash='0'*64))

    def test_full_film_duration_bounds(self):
        for duration in (119.99, 180):
            with self.subTest(duration=duration):
                self.assertIn('120 <= duration < 180', self.rejected(duration=duration))

    def test_different_topic_cannot_reuse_voice_timing(self):
        self.assertIn('different topic', self.rejected(topic='other-news-item'))

    def test_invalid_json_timing_fails_closed(self):
        self.assertIn("requires measured timing", self.rejected(duration=float("nan")))
