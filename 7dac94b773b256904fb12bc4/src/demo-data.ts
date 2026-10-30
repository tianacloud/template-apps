import { emptyWorkspace, type Workspace, type Project, type Task } from './model';
import { businessDay, addDays } from './dates';
import { makeEntry, scheduleTask, complete } from './actions';
import { freezeToday } from './planning';

export function demoData(): Workspace {
  const s=emptyWorkspace(),today=businessDay(s.settings);
  const portfolio:Project={id:'demo-portfolio',name:'把作品集整理成喜欢的样子',color:'#6989b8',createdDate:addDays(today,-10),startDate:addDays(today,-10),deadline:addDays(today,14),bufferDays:3};
  const language:Project={id:'demo-language',name:'让英语成为日常',color:'#9aab46',createdDate:addDays(today,-14),startDate:addDays(today,-14),deadline:null,bufferDays:0};
  const weekend:Project={id:'demo-weekend',name:'准备一个舒心的周末',color:'#cf8470',createdDate:addDays(today,-3),startDate:addDays(today,-3),deadline:addDays(today,5),bufferDays:1};
  s.projects.push(portfolio,language,weekend);
  s.modules.push({id:'demo-m1',projectId:portfolio.id,name:'梳理与呈现'},{id:'demo-m2',projectId:weekend.id,name:'小小准备'});
  const titles=['梳理三个代表项目','整理案例中的设计过程','完善作品集首页','写一段简洁的个人介绍'];
  for(let i=0;i<4;i++)s.tasks.push({id:`demo-task-${i}`,projectId:portfolio.id,moduleId:'demo-m1',title:titles[i],minutes:[90,120,150,60][i],notes:'从一个具体的小步骤开始。'});
  const first=scheduleTask(s,'demo-task-0',addDays(today,-2))!;
  complete(s,first.id,105,false,addDays(today,-2));
  scheduleTask(s,'demo-task-1',today);
  scheduleTask(s,'demo-task-2',addDays(today,1));
  for(let i=0;i<2;i++){
    const task:Task={id:`demo-weekend-${i}`,projectId:weekend.id,moduleId:'demo-m2',title:['整理阳台上的植物','选一条周末散步路线'][i],minutes:[45,30][i],notes:''};
    s.tasks.push(task);scheduleTask(s,task.id,i===0?today:addDays(today,1));
  }
  for(let offset=-9;offset<=1;offset++){
    if(offset===-6)continue;
    const e=makeEntry({id:`demo-reading-${offset}`,title:offset<0?'英语阅读与摘录':'读一篇喜欢的英文文章',projectId:language.id,minutes:30,date:addDays(today,offset),notes:'不求快，保持一点日常的积累。'});
    s.entries.push(e);
    if(offset<0)complete(s,e.id,[25,35,30,40][(offset+12)%4],false,addDays(today,offset));
  }
  const walk=makeEntry({id:'demo-walk',title:'午后散步，让脑袋放空一会儿',minutes:25,date:today,start:'15:00',end:'15:25'});
  s.entries.push(walk);complete(s,walk.id,25,false,today);
  s.entries.push(makeEntry({id:'demo-overdue',title:'收集几张喜欢的版式参考',minutes:30,date:addDays(today,-1),notes:'在灵感积累中找到自己的方向。'}));
  s.notes[today]='今天想把注意力放在真正重要的小事上。\n先完成一个小步骤，再开始下一个。';
  s.notes[addDays(today,-1)]='读到一段喜欢的文字，也整理了一个项目的思路。';
  freezeToday(s,addDays(today,-1));freezeToday(s,today);
  return s;
}
