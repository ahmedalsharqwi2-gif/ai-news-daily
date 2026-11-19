// hud-audio.mjs - the HUD template's sound layer (owner requirements
// 2026-11-19: background music bed, transition SFX, snappy feel).
// Everything is FFmpeg-synthesized (no licensed assets, no quota): a quiet
// two-tone ambient pad under the whole episode plus a short filtered noise
// sweep at each scene boundary. Levels are config-driven and deliberately
// low - the owner killed an annoying sound before; the voice stays on top.

import {rename} from 'node:fs/promises';
import {run} from './io.mjs';

// Rewrites audioPath in place with bed + sweeps mixed in. Duration and the
// voice track are unchanged (amix duration=first, voice is input 0).
export async function hudAudio(audioPath, segments, opts = {}) {
  const music = opts.music !== false, sfx = opts.sfx !== false;
  const mv = typeof opts.musicVolume === 'number' ? opts.musicVolume : 0.06;
  const sv = typeof opts.sfxVolume === 'number' ? opts.sfxVolume : 0.18;
  if (!music && !sfx) return {boundaries: []};
  const bounds = [];
  let t = 0;
  for (let i = 0; i < segments.length - 1; i++) { t += segments[i].duration; bounds.push(t); }
  const total = t + (segments.length ? segments[segments.length - 1].duration : 0);
  const inputs = ['-i', audioPath];
  const filters = [];
  const mixIns = ['[0:a]'];
  let inputCount = 1;
  if (music && total > 0) {
    inputs.push('-f', 'lavfi', '-i', `aevalsrc=sin(2*PI*110*t)*0.55+sin(2*PI*164.81*t)*0.3+sin(2*PI*220*t)*0.15:s=44100:d=${total.toFixed(3)}`);
    filters.push(`[${inputCount}:a]volume=${mv}[pad]`);
    inputCount++;
    mixIns.push('[pad]');
  }
  if (sfx && bounds.length) {
    const n = Math.min(bounds.length, 12);
    for (let i = 0; i < n; i++) {
      const idx = inputCount;
      inputs.push('-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.8:d=0.4:s=44100');
      inputCount++;
      filters.push(`[${idx}:a]highpass=f=900,lowpass=f=6000,volume=${sv},afade=t=in:st=0:d=0.05,afade=t=out:st=0.25:d=0.15,adelay=${Math.round(bounds[i] * 1000)}|${Math.round(bounds[i] * 1000)}[sfx${i}]`);
      mixIns.push(`[sfx${i}]`);
    }
  }
  filters.push(`${mixIns.join('')}amix=inputs=${mixIns.length}:duration=first:dropout_transition=0[aout]`);
  const tmp = audioPath + '.hud.wav';
  await run('ffmpeg', ['-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[aout]', tmp], {timeout: 120000});
  await rename(tmp, audioPath);
  return {boundaries: bounds};
}
