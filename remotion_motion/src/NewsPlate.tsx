import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import type {Scene} from './types';

const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const M = (f: number, a: number, b: number, x = 0, y = 1) => interpolate(f, [a, b], [x, y], C);

/* The AI-news channel's scenes arrive as workflow / product / comparison / takeaway / headline.
   None of those had a component -- only 'platform' did -- so two thirds of the film was a still frame.
   This is the broadcast graphic that fills the stage for every one of those kinds. */

const Bar: React.FC<{label: string; value: number; color: string; at: number; f: number; align: 'l' | 'r'}> =
  ({ label, value, color, at, f, align }) => {
    const grow = M(f, at, at + 26, 0, 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: align === 'l' ? 'flex-start' : 'flex-end', flex: 1 }}>
        <span style={{ fontSize: 26, color: '#a8bdc8' }}>{label}</span>
        <div style={{ width: '100%', height: 22, background: '#0d2233', borderRadius: 11, overflow: 'hidden' }}>
          <div style={{ width: `${grow * value * 100}%`, height: '100%', background: color, borderRadius: 11 }} />
        </div>
        <span style={{ fontSize: 40, fontWeight: 800, color }}>{Math.round(grow * value * 100)}%</span>
      </div>);
  };

const Stage: React.FC<{children: React.ReactNode; accent: string; f: number}> = ({ children, accent, f }) => {
  const sweep = (f % 90) / 90;
  return (
    <div style={{ position: 'absolute', top: 600, left: 52, right: 52, height: 700 }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 14, overflow: 'hidden',
        background: 'linear-gradient(160deg,#12283ae8,#0a1723f2)', border: '1px solid #ffffff18',
        boxShadow: '0 30px 90px #000a' }}>
        <div style={{ position: 'absolute', top: '-40%', bottom: '-40%', left: '-10%', right: '-10%',
          background: `linear-gradient(115deg,transparent ${32 + sweep * 22}%,${accent}22 ${46 + sweep * 22}%,transparent ${64 + sweep * 22}%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
          transform: `scale(${1 + ((f % 240) / 240) * 0.07})` }}>{children}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 130, top: `${(f * 7.5) % 760 - 70}px`,
          background: `linear-gradient(180deg,transparent,${accent}26,transparent)` }} />
      </div>
    </div>);
};

export const NewsPlate: React.FC<{scene: Scene; accent: string}> = ({ scene, accent }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const kind = scene.kicker || 'workflow';
  const labels = scene.labels || [];
  const p = M(f, 0, durationInFrames);

  const tickerItems = (labels.length ? labels : [scene.headline || scene.label || '']).concat(['خبر في السريع']);
  const ticker = (
    <div style={{ position: 'absolute', bottom: 232, left: 0, right: 0, height: 56, overflow: 'hidden',
      background: '#071320ee', borderTop: `2px solid ${accent}66`, borderBottom: `2px solid ${accent}33` }}>
      <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', direction: 'rtl',
        translate: `${-((f * 9) % 1200)}px 0`, padding: '10px 0' }}>
        {tickerItems.map((t, i) => (
          <span key={i} style={{ fontSize: 25, color: '#dce9ee', fontWeight: 700 }}>
            <span style={{ color: accent }}>◆</span> {t}
          </span>))}
      </div>
    </div>);

  if (kind === 'comparison') {
    return (
      <AbsoluteFill>
        <Stage accent={accent} f={f}>
          <div style={{ display: 'flex', gap: 46, padding: '70px 54px', alignItems: 'flex-end', height: '100%' }}>
            <Bar label="قبل" value={0.34} color="#7f93a0" at={Math.round(fps * 0.5)} f={f} align="l" />
            <Bar label="بعد" value={0.92} color={accent} at={Math.round(fps * 1.2)} f={f} align="r" />
          </div>
        </Stage>
        {ticker}
      </AbsoluteFill>);
  }

  if (kind === 'product' || kind === 'headline') {
    return (
      <AbsoluteFill>
        <Stage accent={accent} f={f}>
          <div style={{ position: 'absolute', top: 44, left: 44, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#e2564f', opacity: 0.5 + Math.sin(f / 9) * 0.5 }} />
            <span style={{ fontSize: 20, color: '#ff9a94' }}>مباشر</span>
          </div>
          {labels.slice(0, 4).map((text, i) => {
            const at = Math.round(f * 0 + 8 + i * 16);
            return (
              <div key={i} style={{ position: 'absolute', top: 110 + i * 132, left: 44, right: 44,
                display: 'flex', gap: 20, alignItems: 'center', direction: 'rtl',
                opacity: M(f, at, at + 14),
                translate: `${M(f, at, at + 20, 40, 0)}px 0` }}>
                <span style={{ width: 56, height: 56, borderRadius: 8, background: `${accent}22`, color: accent,
                  fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Arial', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 36, lineHeight: 1.5, color: '#eaf3f7', fontWeight: 700, flex: 1 }}>{text}</span>
              </div>);
          })}
        </Stage>
        {ticker}
      </AbsoluteFill>);
  }

  const n = Math.max(2, Math.min(4, labels.length || 3));
  return (
    <AbsoluteFill>
      <Stage accent={accent} f={f}>
        {Array.from({ length: n }).map((_, i) => {
          const x = 54 + (i * (860 - 108)) / Math.max(1, n - 1);
          const at = 10 + i * 18;
          const live = Math.floor((f / (fps * 1.1)) % n) === i;
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', top: 150, left: x, width: 108, height: 108, borderRadius: 54,
                background: live ? accent : '#123044', border: `3px solid ${live ? '#ffffff' : '#2a4a5e'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial',
                fontSize: 40, fontWeight: 800, color: live ? '#06131c' : '#7f9aa8',
                opacity: M(f, at, at + 12), scale: 0.85 + M(f, at, at + 18) * 0.15 }}>{i + 1}</div>
              {i < n - 1 ? (
                <div style={{ position: 'absolute', top: 200, left: x + 112, width: 118, height: 4,
                  background: '#24485c', overflow: 'hidden' }}>
                  <div style={{ width: `${M(f, at + 8, at + 30, 0, 1) * 100}%`, height: '100%', background: accent }} />
                </div>) : null}
              <div style={{ position: 'absolute', top: 292, left: Math.max(24, x - 40), width: 190, textAlign: 'center',
                fontSize: 27, lineHeight: 1.5, color: '#cfe0e8', opacity: M(f, at + 6, at + 20) }}>{labels[i] || ''}</div>
            </React.Fragment>);
        })}
        <div style={{ position: 'absolute', bottom: 96, left: 60, right: 60, height: 3, background: '#1d3a4c' }}>
          <div style={{ width: `${p * 100}%`, height: '100%', background: accent }} />
        </div>
      </Stage>
      {ticker}
    </AbsoluteFill>);
};
