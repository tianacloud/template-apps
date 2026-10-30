import {readFile,writeFile} from 'node:fs/promises';
const css=await readFile('src/style.css','utf8');
let shell=await readFile('src/shell.html','utf8');
shell=shell.replace('周报保存在云端数据库','示例体验，数据仅保留在本页').replace('正在读取周报…','示例体验，数据仅保留在本页').replace('<div class="toolbar">','<div class="toolbar"><button class="btn btn-outline" onclick="resetDemo()">恢复示例</button>').replace('onclick="exportJson()"','disabled title="安装后可导出备份"');
const core=await readFile('src/core.js','utf8');
const demo=`
function bindUI(){}
function persistStore(){}
function exportJson(){toast('示例体验不提供下载，安装后可导出备份')}
function copyText(text,label){const box=document.createElement('textarea');box.value=text;box.setAttribute('aria-label',label);box.style.cssText='position:fixed;inset:15%;width:70%;height:60%;z-index:120';document.body.append(box);box.select();box.onkeydown=e=>{if(e.key==='Escape')box.remove()};box.onblur=()=>box.remove();toast('请选择文本复制，完成后点击其他位置')}
function resetDemo(){store={weeks:{}};baseDate=curBase();currentWeekKey=weekKeyOf(baseDate);document.querySelector('#histSearch').value='';loadTemplate('dev');closeDrawer()}
resetDemo();document.querySelector('#toast').classList.remove('show');
`;
await writeFile('showcase/preview.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>周报工坊</title><style>'+css+'</style><body>'+shell+'<script>'+core+demo+'</script></body></html>');
