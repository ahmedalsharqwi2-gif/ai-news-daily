// hud-audio.mjs - the HUD template's sound layer.
// 2026-11-24 owner direction: scene/sentence-boundary transition SFX
// (the filtered noise sweep) is permanently removed from all videos.
// What remains is the quiet FFmpeg-synthesized background pad under the
// whole episode (no licensed assets, no quota). Levels are config-driven
// and deliberately low; the voice stays on top.

import {rename} from 'node:fs/promises';
import {run} from './io.mjs';

// Rewrites audioPath in place with the music bed mixed in. Duration and the
// voice track are unchanged (amix duration=first, voice is input 0).
// No transition/sweep SFX is ever added (owner direction 2026-11-24); the
// sfx/sfxVolume options are accepted for compatibility and ignored.
export async function hudAudio(audioPath, segments, opts = {}) {
  const music = opts.music !== false;
  const mv = typeof opts.musicVolume === 'number' ? opts.musicVolume : 0.06;
  if (!music) return {boundaries: []};
  let total = 0;
  for (const s of segments) total += s.duration;
  if (!(total > 0)) return {boundaries: []};
  const filters = ['[1:a]volume=' + mv + '[pad]', '[0:a][pad]amix=inputs=2:duration=first:dropout_transition=0[aout]'];
  const tmp = audioPath + '.hud.wav';
  await run('ffmpeg', ['-y', '-i', audioPath,
    '-f', 'lavfi', '-i', `aevalsrc=sin(2*PI*110*t)*0.55+sin(2*PI*164.81*t)*0.3+sin(2*PI*220*t)*0.15:s=44100:d=${total.toFixed(3)}`,
    '-filter_complex', filters.join(';'), '-map', '[aout]', tmp], {timeout: 120000});
  await rename(tmp, audioPath);
  return {boundaries: []};
}
