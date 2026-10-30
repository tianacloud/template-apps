import React, {useEffect, useState} from 'react';
import {useGym, Modal, Button, Icon} from './ui.jsx';

export function useMediaReady() {
  const {media} = useGym();
  const [state, setState] = useState({ready: false, loading: true});
  useEffect(() => {
    let alive = true;
    const check = () => {
      if (!media) { setState({ready: false, loading: false}); return; }
      media.manifest().then(index => { if (alive) setState({ready: !!index, loading: false}); },
        () => { if (alive) setState({ready: false, loading: false, error: true}); });
    };
    check(); const unsubscribe = media?.subscribe(check);
    return () => { alive = false; unsubscribe?.(); };
  }, [media]);
  return {...state, available: !!media?.files?.put};
}

export function MediaSetupStatus({always = false}) {
  const {media, showMediaSetup} = useGym(), state = useMediaReady();
  if (!media || state.loading || (!always && state.ready)) return null;
  return <section className="panel media-setup-card"><span className="media-setup-icon"><Icon name="workout" size={26}/></span><div className="grow"><h3>动作图片与动画</h3><p>{state.ready ? '5,632 套图示与演示已保存在本应用。' : state.error ? '暂时无法读取动作素材，可检查并继续准备。' : '首次准备后，5,632 套图示与演示会保存在本应用的云端空间。'}</p></div><Button variant="secondary" onClick={showMediaSetup}>{state.ready ? '检查素材' : '准备素材'}</Button></section>;
}

export function MediaSetupDialog({onClose}) {
  const {media} = useGym();
  const [preparation, setPreparation] = useState(null), [state, setState] = useState(null), [accepted, setAccepted] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    let alive = true, unsubscribe;
    media?.preparation().then(service => {
      if (!alive) return;
      setPreparation(service); setState(service.snapshot()); unsubscribe = service.subscribe(() => setState(service.snapshot()));
    }, () => { if (alive) setError('当前环境无法准备素材，请在安装后的完整应用中使用。'); });
    return () => { alive = false; unsubscribe?.(); };
  }, [media]);
  const busy = state?.status === 'preparing';
  const start = files => { setError(''); preparation.run({accepted, directoryFiles: files}).catch(() => {}); };
  const choose = event => { const files = Array.from(event.target.files || []); event.target.value = ''; if (files.length) start(files); };
  const percent = state ? Math.floor(state.assets * 100 / state.total) : 0;
  return <Modal title="准备动作图片与动画" onClose={onClose}>
    <p className="muted">首次需下载约 174 MB 素材，保存在本应用自己的云端文件中。支持暂停和继续；日常播放从云端读取。</p>
    <p className="small muted">5,632 张图示、5,597 个多帧演示；35 个原始单帧文件显示为静态图示。素材 © Aliaksandr Makatserchyk / Gym visual。</p>
    <label className="media-license-choice"><input type="checkbox" checked={accepted} disabled={busy} onChange={event => setAccepted(event.target.checked)}/><span>我仅将本应用用于个人非商业用途，并保留未修改素材及完整版权声明。</span></label>
    {state && <div className="media-preparation-progress" role="status"><progress max={state.total} value={state.assets}/><p>{state.status === 'done' ? '图片与动画已准备完成' : state.status === 'paused' ? '已暂停，可继续准备' : state.pausing ? '当前素材保存完成后暂停…' : state.phase || '可在线准备，或导入已有素材目录'}</p><small>{state.assets.toLocaleString()} / {state.total.toLocaleString()} 个图片和视频 · {percent}%</small></div>}
    {(error || state?.error) && <div className="error-banner" role="alert">{error || state.error}</div>}
    <div className="modal-actions media-preparation-actions">{busy ? <Button variant="secondary" disabled={state.pausing} onClick={() => preparation.pause()}>{state.pausing ? '正在暂停…' : '暂停准备'}</Button> : state?.status === 'done' ? <><Button variant="secondary" disabled={!accepted} onClick={() => start()}>重新检查</Button><Button onClick={onClose}>完成</Button></> : <>
      <Button disabled={!preparation || !accepted} onClick={() => start()}>{state?.pending ? '核对并继续' : state?.status === 'paused' || state?.status === 'error' ? '继续在线准备' : '在线准备全部素材'}</Button>
      <label className={`button secondary ${!preparation || !accepted ? 'disabled' : ''}`}>导入素材文件夹<input className="visually-hidden" aria-label="素材文件夹" type="file" webkitdirectory="" multiple disabled={!preparation || !accepted} onChange={choose}/></label>
    </>}</div>
    <p className="small muted">本地导入请选择包含 manifest.json、原始素材包和版权声明的完整文件夹。上传中断时会先确认已保存的内容，再继续准备；已有文件会保留。</p>
  </Modal>;
}
