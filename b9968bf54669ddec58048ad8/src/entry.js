import {start} from './main.js';
export async function mount(root, {files}) {
  root.id = 'app';
  root.textContent = '正在读取学习资料…';
  try {
    const load = async path => { const response = await files.get(path); if (!response.ok) throw new Error('学习资料读取失败，请重新打开应用'); return response.json(); };
    const [bank, material] = await Promise.all([load('template-assets/questions.json'), load('template-assets/materials.json')]);
    start(bank, material);
  } catch (error) { root.textContent = '学习资料读取失败，请检查连接后重新打开应用。'; throw error; }
}
