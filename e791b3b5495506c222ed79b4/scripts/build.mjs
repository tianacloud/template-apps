import {readFile, mkdir, rm, writeFile, copyFile} from 'node:fs/promises';
const commit=process.argv[2];
if (!/^[a-f0-9]{40}$/.test(commit||'')) throw Error('需要完整 Git 提交号');
const src=JSON.parse(await readFile('source.json','utf8'));
if (process.env.TIANA_TEMPLATE_BUILD !== '1' && (!src.git_instance_id || src.git_instance_id.startsWith('__TIANA_'))) throw Error('请填写 Git 实例 ID');
const read = f => readFile('src/'+f,'utf8');
const [body,css,takeout,icons,app]=await Promise.all(['body.html','style.css','takeout.js','icons.js','app.js'].map(read));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await writeFile('dist/assets/app.js',`export async function mount(root, context) {
  document.title='速配一餐';
  const style=document.createElement('style'); style.textContent=${JSON.stringify(css)}; document.head.appendChild(style);
  let disposed=false;
  async function start() {
    root.innerHTML='<div style="padding:2rem;text-align:center">正在加载菜谱…</div>';
    try {
      const response=await context.files.get('template-assets/data/recipes.json');
      if (!response.ok) throw new Error('文件读取失败');
      const {CATS,INGREDIENTS,PANTRY,RECIPES}=await response.json();
      if (![CATS,INGREDIENTS,PANTRY,RECIPES].every(Array.isArray)) throw new Error('菜谱格式错误');
      if (disposed) return;
      root.innerHTML=${JSON.stringify(body)};
      ${takeout}
${icons}
${app}
    } catch (error) {
      if (disposed) return;
      root.innerHTML='<div style="padding:2rem;text-align:center" role="alert">菜谱加载失败，请检查网络后重试。 <button type="button" id="retryRecipes">重试</button></div>';
      root.querySelector('#retryRecipes').addEventListener('click', start, {once:true});
    }
  }
  await start();
  return () => { disposed=true; style.remove(); root.replaceChildren(); };
}`);
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...src}));
