import audioIndex from './audio-index.json';
import './style.css';
import markup from './markup.js';
import { sql } from './db.js';
import { start } from './play.js';
export async function mount(root, { files }) {
const link = document.createElement('link');
link.rel = 'stylesheet'; link.href = new URL('./app.css', import.meta.url).href; document.head.appendChild(link);
const response = await files.get('template-assets/audio/learning-audio.bin');
if (!response.ok) { root.textContent = '无法读取学习音频，请检查网络后重新打开。'; return; }
const audio = await response.arrayBuffer();
const audioContext = new AudioContext();
const playing = new Map();
const generations = new Map();
window.__audioFiles = files;
window.__playCustomAudio = async path => {
  if (!/^user-audio\/[a-f0-9-]+$/.test(path)) throw new Error('音频路径不正确');
  const response = await files.get(path);
  if (!response.ok) throw new Error('无法读取音频');
  const decoded = await audioContext.decodeAudioData(await response.arrayBuffer());
  await audioContext.resume();
  playing.get('speech')?.stop();
  const source = audioContext.createBufferSource(); source.buffer = decoded; source.connect(audioContext.destination);
  playing.set('speech', source); source.onended = () => { if (playing.get('speech') === source) playing.delete('speech'); }; source.start();
};
window.__playLearningAudio = async (name, channel = 'speech') => {
  const item = audioIndex[name];
  if (!item) throw new Error('音频不存在');
  const generation = (generations.get(channel) || 0) + 1;
  generations.set(channel, generation);
  await audioContext.resume();
  const decoded = await audioContext.decodeAudioData(audio.slice(item[0], item[0] + item[1]));
  if (generations.get(channel) !== generation) return;
  playing.get(channel)?.stop();
  const source = audioContext.createBufferSource();
  source.buffer = decoded;
  source.connect(audioContext.destination);
  playing.set(channel, source);
  source.onended = () => { if (playing.get(channel) === source) playing.delete(channel); };
  source.start();
};
root.textContent = '正在准备学习乐园…';
try {
  const rows = (await sql('SELECT value FROM learning_state WHERE id = ?', ['main'])).rows;
  window.__learningState = rows[0]?.value || '';
  let pending = null, writing = false, stopped = false;
  const persist = async () => {
    if (writing || stopped) return;
    writing = true;
    while (pending !== null) {
      const value = pending; pending = null;
      try {
        await sql('INSERT INTO learning_state (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', ['main', value]);
      } catch (error) {
        try { const current = (await sql('SELECT value FROM learning_state WHERE id = ?', ['main'])).rows[0]?.value; if (current === value) continue; } catch {}
        stopped = true;
        const notice = document.createElement('div'); notice.textContent = '保存状态未能确认，请检查网络后重新打开。';
        notice.style.cssText = 'position:fixed;z-index:99999;bottom:0;background:#fff0d1;color:#573;padding:12px;width:100%'; document.body.appendChild(notice);
      }
    }
    writing = false;
  };
  window.__saveLearningState = value => { pending = value; void persist(); };
  root.innerHTML = markup;
  start();
} catch (error) {
  root.textContent = '无法连接学习进度，请检查网络并重新打开。';
}

return () => { for (const source of playing.values()) source.stop(); void audioContext.close(); };
}
