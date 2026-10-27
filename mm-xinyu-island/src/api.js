import { createDomain } from './domain.mjs';
import { needsCare, templateLetter } from './companion.mjs';
import { storage } from './storage.js';
let pending=Promise.resolve();
export function api(method,path,body={}) {
  const task=pending.then(async()=>{
    const d=await createDomain({storage});
    const snapshot=()=>{const s=d.snapshot();return {...s,companion:{...s.companion,available:false,busy:{letter:false,chat:false,reply:false},chatLeft:0}}};
    if(method==='GET'&&path==='/api/state') return snapshot();
    let result=null, m;
    switch(`${method} ${path}`){
      case 'PUT /api/profile': result=await d.updateProfile(body); break;
      case 'POST /api/checkin': await d.checkin(body); result={care:needsCare(body.note)}; break;
      case 'POST /api/card/draw': result=await d.drawCard(body); break;
      case 'PUT /api/about': result=await d.setAbout(body); break;
      case 'POST /api/secrets': result=await d.discover(body); break;
      case 'POST /api/flags': result=await d.setFlag(body); break;
      case 'POST /api/joys': result=await d.addJoy(body); break;
      case 'POST /api/answers': result=await d.ask(body); break;
      case 'DELETE /api/answers': result=await d.clearAnswers(); break;
      case 'POST /api/quiz': result=await d.submitQuiz(body); break;
      case 'POST /api/reset': result=await d.resetAll(); break;
      case 'POST /api/companion/enable': await d.setCompanionEnabled({enabled:false}); if(!d.letterOf(d.snapshot().today)) await d.putLetter({date:d.snapshot().today,text:templateLetter(d.companionData()),by:'note'}); break;
      case 'POST /api/companion/letter': if(!d.letterOf(d.snapshot().today)) await d.putLetter({date:d.snapshot().today,text:templateLetter(d.companionData()),by:'note'}); break;
      default:
        if(method==='DELETE'&&(m=/^\/api\/checkin\/(\d{4}-\d{2}-\d{2})$/.exec(path))) await d.removeCheckin(m[1]);
        else if(method==='POST'&&(m=/^\/api\/card\/(\d{4}-\d{2}-\d{2})\/favorite$/.exec(path))) result=await d.toggleFavorite(m[1]);
        else if(method==='DELETE'&&(m=/^\/api\/joys\/([0-9a-f-]{36})$/.exec(path))) await d.removeJoy(m[1]);
        else if(method==='POST'&&(m=/^\/api\/companion\/letter\/(\d{4}-\d{2}-\d{2})\/read$/.exec(path))) await d.markLetterRead(m[1]);
        else throw new Error('操作不可用');
    }
    return {ok:true,result,state:snapshot()};
  });
  pending=task.catch(()=>{});
  return task;
}
