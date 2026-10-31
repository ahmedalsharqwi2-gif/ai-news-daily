# News studio v2 candidate

The candidate is opt-in and does not change any daily trigger, approved release,
publication destination, subject registry, video fingerprint or provider receipt.
The existing production renderer is still the default.

The v2 studio uses a matte floor and raised platform, three-point lighting,
1024-pixel soft shadows, deterministic brushed metal roughness, eased dolly shots
and depth-separated studio ribs. Bloom and floating dust are omitted on this
path so factual diagrams, logo and Arabic captions remain readable. Authored
computing geometry and source evidence are retained. Measured meme beats are
rendered after the reference overlay with an explicit satire label; source date
and publisher remain separate.

Run from the repository root with Node dependencies installed:

```sh
node professional_motion/render.mjs --pipeline v2 \
  --delivery-dir /absolute/path/to/measured/delivery \
  --output-dir .work/news-v2/output --style reference --review
```

`delivery` must contain unchanged `story.json`, `timing.json` and `narration.wav`.
Story and narration SHA-256, topic identity and a measured duration of at least
120 and below 180 seconds are checked before Chromium starts. Output is isolated
by default in `.work/news-v2/output`; it never replaces the legacy output.
`--stills` produces `stills.json`, **not** a full-film completion record.
The full renderer supports existing time intervals and frame partitions. Joining
parts must preserve the v2 pipeline identity and all contiguous frame bounds.

Local verification:

```sh
node professional_motion/studio_v2.test.mjs
python -m pytest -q tests/test_news_v2_render.py
```

## Evidence and limits on 2026-10-31

The existing news logo is a readable PNG and was rendered successfully. Its
provenance is the repository's previous extraction from the user's reference
video; no newly supplied original logo file was available in this task.

Eight 1080x1920 review stills were rendered from exact archived delivery bytes at
commit `bbaf967f340b0ff2231a99fb61b95dbc9bf9c6a7` (run `41057377563`).
Beginning, middle and final-scene images were visually inspected. These cover
old news dated **2026-10-29**, retain the original measured Gemini Charon voice,
and are solely renderer regression inputs, not a fresh daily episode. Their
JSON hashes bind the archived story; they do not verify fresh-topic selection,
new narration generation, live Buffer status or cutover eligibility.

The old daily path must stay active until full films and migration guards satisfy
the shared cutover gate. No review media may be sent to social channels. Missing
Gemini/Buffer credentials cannot be replaced with synthetic success receipts.
