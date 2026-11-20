import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {BrandLogo} from '../Logo';
import config from '../../config/channel.json';

// HUD-style episode renderer for AI على السريع (grammar matched to the
// owner's Manus-made reference reel, 2026-11-19): dark-navy grid + drifting
// particles, persistent branded header with orange keyword accent, ONE
// animated neon diagram card per news point, karaoke caption card, end recap.
// The card plan comes from pipeline/hudplan.mjs (deterministic, validated).

const P = {bg: '#010816', panel: '#0a1733', card: '#0d1c3a', cyan: '#3ae2ff', cyanDim: '#46a0bc', orange: '#ff9032', orangeDim: '#f08837', text: '#e8f1ff', sub: '#9fb3d1'};
const FONT = 'ChannelArabic, Cairo, sans-serif';
const ZONE = {top: 430, height: 900}; // diagram zone between header and caption card

const fadeIn = (f: number, start: number, dur = 12) => ({
  opacity: interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
});
const pop = (f: number, fps: number) => {
  const s = spring({fps, frame: f, config: {damping: 18, stiffness: 220, mass: 0.7}});
  return {opacity: s, transform: `scale(${0.9 + s * 0.1})`};
};
const glow = (c: string) => `0 0 18px ${c}55, 0 0 46px ${c}22`;

function Background({frame}: {frame: number}) {
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 50% 30%, ${P.panel}, ${P.bg})`}}>
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${P.cyanDim}14 1px, transparent 1px), linear-gradient(90deg, ${P.cyanDim}14 1px, transparent 1px)`, backgroundSize: '90px 90px'}}/>
      {Array.from({length: 18}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: (i * 151 + 40) % 1080, top: (i * 307 + frame * (0.25 + (i % 3) * 0.2)) % 1920, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: 99, background: i % 4 === 0 ? P.orange : P.cyan, opacity: 0.35}}/>
      ))}
      <div style={{position: 'absolute', top: 260, bottom: 260, left: 28, width: 3, background: `linear-gradient(${P.cyan}, transparent 30%, transparent 70%, ${P.orange})`, opacity: 0.5}}/>
      <div style={{position: 'absolute', top: 260, bottom: 260, right: 28, width: 3, background: `linear-gradient(${P.cyan}, transparent 30%, transparent 70%, ${P.orange})`, opacity: 0.5}}/>
    </AbsoluteFill>
  );
}

function Header({title, keyword, index, count, progress}: {title: string; keyword: string; index: number; count: number; progress: number}) {
  const sub = keyword && title.includes(keyword)
    ? <span>{title.split(keyword)[0]}<span style={{color: P.orange, borderBottom: `4px solid ${P.orange}`, paddingBottom: 4}}>{keyword}</span>{title.split(keyword).slice(1).join(keyword)}</span>
    : <span>{title}</span>;
  return (
    <div style={{position: 'absolute', top: 64, left: 60, right: 60}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <BrandLogo size={92}/>
        <div style={{flex: 1}}>
          <div data-text-box style={{fontSize: 34, fontWeight: 800, color: P.text, lineHeight: 1.3}}>{config.name}</div>
          <div data-text-box style={{fontSize: 30, fontWeight: 700, color: P.sub, lineHeight: 1.45, marginTop: 6}}>{sub}</div>
        </div>
        <div data-text-box style={{fontSize: 24, color: P.sub, whiteSpace: 'nowrap'}}>{config.counter} · {index + 1}/{count}</div>
      </div>
      <div style={{marginTop: 20, height: 6, borderRadius: 4, background: `${P.cyanDim}33`, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg, ${P.orange}, ${P.cyan})`, borderRadius: 4}}/>
      </div>
    </div>
  );
}

function ItemBox({text, accent, f, delay, width = 300}: {text: string; accent: string; f: number; delay: number; width?: number}) {
  return (
    <div data-text-box style={{...fadeIn(f, delay), width, padding: '14px 18px', borderRadius: 14, border: `2.5px solid ${accent}`, boxShadow: glow(accent), background: `${P.card}ee`, color: P.text, fontSize: 27, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, overflowWrap: 'anywhere'}}>{text}</div>
  );
}

function Card({card, index}: {card: any; index: number}) {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const acc = (i: number) => (i % 2 ? P.orange : P.cyan);
  const head = (
    <div data-text-box style={{...fadeIn(f, 0), fontSize: 44, fontWeight: 800, color: P.text, textAlign: 'center', lineHeight: 1.35, maxWidth: 900, marginBottom: 34, overflowWrap: 'anywhere'}}>{card.headline}</div>
  );
  let body: React.ReactNode = null;
  if (card.type === 'chip') {
    body = (
      <div style={{...pop(f, fps), position: 'relative', width: 460, height: 400, borderRadius: 40, border: `4px solid ${P.cyan}`, boxShadow: glow(P.cyan), background: `${P.card}f2`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
        {[-150, -50, 50, 150].map((dy, i) => (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', right: -14, top: 200 + dy, width: 14, height: 8, background: P.orange, borderRadius: 3}}/>
            <div style={{position: 'absolute', left: -14, top: 200 + dy, width: 14, height: 8, background: P.orange, borderRadius: 3}}/>
          </React.Fragment>
        ))}
        <div data-text-box style={{fontSize: 92, fontWeight: 900, color: P.cyan, textShadow: glow(P.cyan), direction: 'ltr'}}>{card.keyword}</div>
        {card.items[0] && <div data-text-box style={{fontSize: 30, color: P.sub, fontWeight: 700}}>{card.items[0]}</div>}
      </div>
    );
  } else if (card.type === 'stat') {
    body = (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div style={{...pop(f, fps), width: 250, height: 250, borderRadius: '50%', border: `5px solid ${P.orange}`, boxShadow: glow(P.orange), background: `${P.card}f2`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div data-text-box style={{fontSize: 100, fontWeight: 900, color: P.orange, textShadow: glow(P.orange)}}>{card.stat}</div>
        </div>
        {card.keyword && <div data-text-box style={{...fadeIn(f, 8), fontSize: 34, fontWeight: 800, color: P.orange}}>{card.keyword}</div>}
        {card.items.length >= 2 && (
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 880}}>
            {card.items.map((it: string, i: number) => <ItemBox key={i} text={it} accent={acc(i)} f={f} delay={12 + i * 4} width={card.items.length > 4 ? 260 : 340}/>)}
          </div>
        )}
      </div>
    );
  } else if (card.type === 'grid') {
    body = (
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', maxWidth: 920}}>
        {card.items.map((it: string, i: number) => <ItemBox key={i} text={it} accent={acc(i)} f={f} delay={6 + i * 4} width={card.items.length > 6 ? 270 : 360}/>)}
      </div>
    );
  } else if (card.type === 'flow') {
    body = (
      <div style={{display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center'}}>
        {card.items.map((it: string, i: number) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{...fadeIn(f, 8 + i * 8), fontSize: 46, color: P.orange, fontWeight: 900}}>←</div>}
            <ItemBox text={it} accent={acc(i)} f={f} delay={4 + i * 8} width={card.items.length > 3 ? 210 : 260}/>
          </React.Fragment>
        ))}
      </div>
    );
  } else if (card.type === 'list') {
    body = (
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
        {card.items.map((it: string, i: number) => (
          <div key={i} style={{...fadeIn(f, 6 + i * 7), display: 'flex', alignItems: 'center', gap: 18, width: 760}}>
            <div style={{width: 62, height: 62, borderRadius: '50%', border: `3px solid ${acc(i)}`, boxShadow: glow(acc(i)), color: acc(i), fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</div>
            <ItemBox text={it} accent={acc(i)} f={f} delay={6 + i * 7} width={660}/>
          </div>
        ))}
      </div>
    );
  } else if (card.type === 'chart') {
    const max = Math.max(...card.values, 1);
    body = (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 34, height: 480, justifyContent: 'center'}}>
        {card.values.map((v: number, i: number) => {
          const h = interpolate(f, [6 + i * 5, 26 + i * 5], [0, (v / max) * 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div data-text-box style={{...fadeIn(f, 20 + i * 5), fontSize: 30, fontWeight: 800, color: acc(i)}}>{v}</div>
              <div style={{width: 110, height: h, borderRadius: 14, background: `linear-gradient(${acc(i)}, ${P.card})`, border: `2px solid ${acc(i)}`, boxShadow: glow(acc(i))}}/>
              {card.items[i] && <div data-text-box style={{...fadeIn(f, 24 + i * 5), fontSize: 24, color: P.sub, maxWidth: 150, textAlign: 'center'}}>{card.items[i]}</div>}
            </div>
          );
        })}
      </div>
    );
  } else if (card.type === 'react') {
    // Humor-beat burst (script-driven only; planner never auto-emits it).
    body = (
      <div style={{...pop(f, fps), transform: `${pop(f, fps).transform} rotate(-4deg)`, padding: '40px 60px', borderRadius: 30, border: `4px dashed ${P.orange}`, background: `${P.card}f2`, boxShadow: glow(P.orange)}}>
        <div data-text-box style={{fontSize: 52, fontWeight: 900, color: P.orange, textAlign: 'center', lineHeight: 1.4, maxWidth: 800}}>{card.headline}</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', top: ZONE.top, left: 0, right: 0, height: ZONE.height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {head}
      {body}
    </div>
  );
}

function CaptionCard({scene}: {scene: any}) {
  const f = useCurrentFrame();
  const time = f / 30;
  const t5 = time + 0.05;
  const words = scene.words || [];
  let active = -1;
  for (let i = 0; i < words.length; i++) { if (t5 >= words[i].start && t5 < words[i].end) { active = i; break; } }
  if (active < 0) { for (let i = words.length - 1; i >= 0; i--) { if (words[i].start <= t5) { active = i; break; } } }
  const start = active < 0 ? 0 : Math.floor(active / 5) * 5;
  const visible = words.slice(start, start + 5);
  const len = visible.map((w: any) => w.text).join(' ').length;
  return (
    <div data-text-box style={{position: 'absolute', top: 1450, left: 90, right: 90, minHeight: 150, boxSizing: 'border-box', borderRadius: 22, padding: '24px 34px', background: `${P.card}f2`, border: `2.5px solid ${P.cyanDim}66`, boxShadow: '0 10px 30px #0006', fontSize: len > 65 ? 30 : 38, fontWeight: 800, textAlign: 'center', lineHeight: 1.4, color: P.text, overflowWrap: 'anywhere'}}>
      {visible.length ? visible.map((w: any, i: number) => <React.Fragment key={i}><span style={{color: start + i === active ? P.orange : P.text}}>{w.text}</span>{' '}</React.Fragment>) : scene.summary}
    </div>
  );
}

function EndRecap({plan, frame}: {plan: any; frame: number}) {
  const o = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o, background: `${P.bg}e8`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div data-text-box style={{fontSize: 46, fontWeight: 900, color: P.cyan}}>الخلاصة</div>
      {plan.summaryPoints.map((p: string, i: number) => (
        <div key={i} data-text-box style={{...fadeIn(frame, 8 + i * 8), fontSize: 34, fontWeight: 700, color: P.text, textAlign: 'center', maxWidth: 820}}>{p}</div>
      ))}
      <BrandLogo size={110}/>
    </AbsoluteFill>
  );
}

export function HudEpisode(props: any) {
  const plan = props.hud.plan;
  const count = props.scenes.length;
  let seconds = 0;
  const seqs = props.scenes.map((scene: any, i: number) => {
    const from = Math.round(seconds * 30);
    seconds += scene.duration;
    const end = i === count - 1 ? props.durationInFrames : Math.round(seconds * 30);
    return {scene, i, from, dur: end - from};
  });
  const recapStart = props.durationInFrames - 75;
  return (
    <AbsoluteFill style={{fontFamily: FONT, direction: 'rtl', overflow: 'hidden', background: P.bg}}>
      <style>{`@font-face{font-family:ChannelArabic;src:url('${staticFile('fonts/Arabic-Bold.ttf')}')} *{box-sizing:border-box}`}</style>
      {props.audio && <Audio src={staticFile(props.audio)}/>}
      <BgWrapper/>
      {seqs.map(({scene, i, from, dur}: any) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Header title={plan.title} keyword={scene.keyword || plan.keyword} index={i} count={count} progress={(i + 1) / count}/>
          <Card card={plan.cards[i]} index={i}/>
          <CaptionCard scene={scene}/>
          <div data-text-box style={{position: 'absolute', top: 1660, left: 90, right: 90, fontSize: 21, color: P.sub, textAlign: 'center'}}>{'المصدر: ' + (scene.sourceLabel || 'موثّق في بيانات الحلقة')}</div>
        </Sequence>
      ))}
      <Sequence from={recapStart} durationInFrames={75}>
        <EndRecapFrame plan={plan}/>
      </Sequence>
    </AbsoluteFill>
  );
}

function BgWrapper() {
  const f = useCurrentFrame();
  return <Background frame={f}/>;
}
function EndRecapFrame({plan}: {plan: any}) {
  const f = useCurrentFrame();
  return <EndRecap plan={plan} frame={f}/>;
}
