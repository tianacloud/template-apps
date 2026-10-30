import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useGym, Icon} from './ui.jsx';
import {startOriginalVideo} from './original-video.js';

// The pinned original MP4s for these IDs contain one frame (0.1 seconds).
// Keep their original pictures and present them as stills, without a play hint.
const STATIC_CLIPS = new Set(['0136','0715','0948','10663','10665','11451','3832','3833','3834','3835','3836','4365','4381','4387','4405','4410','4581','4811','5045','5159','5195','5376','5892','5894','6878','6879','6880','6902','9310','9311','9313','9317','9319','9320','9325']);

function useAsset(exercise, kind, enabled, attempt = 0) {
  const {media} = useGym();
  const key = exercise?.id + ':' + kind;
  const [state, setState] = useState({key: null, url: null, error: false});
  const [generation, setGeneration] = useState(0);
  useEffect(() => media?.subscribe(() => setGeneration(n => n + 1)), [media]);
  useEffect(() => {
    let alive = true, lease;
    setState({key, url: null, error: false});
    if (!enabled || !media || !exercise?.id || exercise.id.startsWith('custom-')) return;
    media.acquire(exercise.id, kind).then(value => {
      if (!alive) { value?.release(); return; }
      lease = value;
      setState({key, url: value?.url || null, bytes: value?.bytes || null, error: false, missing: !value});
    }, () => { if (alive) setState({key, url: null, error: true}); });
    return () => { alive = false; lease?.release(); };
  }, [media, exercise?.id, kind, enabled, attempt, generation]);
  return state.key === key && enabled ? state : {url: null, error: false};
}

export function ExerciseThumb({exercise}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined');
  const [broken, setBroken] = useState(null);
  useEffect(() => {
    if (!ref.current || visible) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, {rootMargin: '200px'});
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);
  const still = useAsset(exercise, 'still', visible);
  return <span ref={ref} className={`thumb exercise-thumb ${still.url ? '' : 'empty-thumb'}`}>
    {still.url && broken !== still.url ? <img src={still.url} alt="" decoding="async" draggable={false} onError={() => setBroken(still.url)}/> : <Icon name="workout" size={23}/>}
  </span>;
}

function OriginalClip({bytes, name, poster, onError}) {
  const ref = useRef(null);
  useEffect(() => startOriginalVideo(ref.current, bytes, onError), [bytes, onError]);
  return <canvas ref={ref} className="catvid" width={180} height={180} role="img" aria-label={`${name} 动作演示`} data-player="original-mp4" style={poster ? {backgroundImage: `url(${poster})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'} : undefined}/>;
}

export function ExerciseAnimation({exercise, minimizable = false}) {
  const {store, run, media, showMediaSetup} = useGym();
  const [playing, setPlaying] = useState(true), [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  const ref = useRef(null), [visible, setVisible] = useState(true);
  const size = minimizable ? store.setting('mediaSize', 'full') : 'full';
  const enabled = size !== 'off';
  const staticOnly = STATIC_CLIPS.has(exercise?.id);
  const still = useAsset(exercise, 'still', enabled, attempt);
  const clip = useAsset(exercise, 'clip', enabled && visible && playing && !failed && !staticOnly, attempt);
  useEffect(() => { setPlaying(true); setFailed(false); }, [exercise?.id]);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), {rootMargin: '100px'});
    observer.observe(ref.current); return () => observer.disconnect();
  }, [enabled, exercise?.id, still.missing]);
  const onError = useCallback(error => setFailed(error?.code === 'UNSUPPORTED' ? 'unsupported' : true), []);
  if (!enabled || !media || !exercise || exercise.id?.startsWith('custom-')) return null;
  if (still.missing) return <div className="media-unprepared"><Icon name="workout" size={30}/><p>准备素材后显示动作图示与演示</p><button type="button" className="button secondary" onClick={showMediaSetup}>准备图片与动画</button></div>;
  const retry = () => { setFailed(false); setAttempt(n => n + 1); setPlaying(true); };
  const onTap = () => (failed || clip.error) ? retry() : setPlaying(value => !value);
  const mini = size === 'mini';
  return <div ref={ref} className={`exmedia exercise-animation ${mini ? 'mini' : ''}`} data-exercise-id={exercise.id}>
    <button type="button" className="animation-surface" onClick={staticOnly ? still.error ? retry : undefined : onTap} disabled={staticOnly && !still.error} aria-label={staticOnly ? `${exercise.name} 静态动作图示` : `${playing ? '暂停' : '播放'} ${exercise.name} 动作演示`}>
      {playing && !failed && clip.bytes ? <OriginalClip bytes={clip.bytes} name={exercise.name} poster={still.url} onError={onError}/>
        : still.url ? <img src={still.url} alt={`${exercise.name} 动作图示`} draggable={false}/>
        : <span className="animation-placeholder"><Icon name="workout" size={38}/><small>{still.error || clip.error ? '暂时无法加载，点击重试' : '正在加载动作演示…'}</small></span>}
      {!mini && <span className="gifhint animation-hint">{staticOnly ? '静态图示' : <><Icon name={playing && !failed ? 'pause' : 'play'} size={13}/>{failed === 'unsupported' ? '当前浏览器仅显示图示' : failed || clip.error ? '点击重试' : playing ? '点击暂停' : '点击播放'}</>}</span>}
    </button>
    {minimizable && <button type="button" className="giftoggle animation-size" onClick={() => run(async () => { store.setSetting('mediaSize', mini ? 'full' : 'mini'); if (!await store.flush()) throw new Error(store.error); })}>{mini ? '展开' : '收起'}</button>}
  </div>;
}
