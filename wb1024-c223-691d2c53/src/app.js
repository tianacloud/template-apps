
// ============================================================
//  四六级备考台 - 单文件应用
// ============================================================

// === SVG Icons ===
const ICONS = {
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  practice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  mistakes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  mine:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
  speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>'
};

// === 48 CET-4 High-Frequency Words ===
// === 版本（必须与 deploy/sw.js 的 CACHE 版本号一致，冒烟测试会校验）===
var APP_VERSION="v22";
var APP_BUILD="2026-09-01";

// === 词库数据（v20 拆包：数据移出 HTML，改为按需 fetch 加载）===
// 首屏体积从 2564KB 降到约 118KB；词库只在需要时拉取，之后驻留内存。
var CET4_WORDS=[];
var BOOKS={
  primary:{id:"primary",name:"小学",tag:"起步",desc:"课标二级 · 基础词汇",words:[]},
  junior:{id:"junior",name:"初中",tag:"进阶",desc:"课标三级 · 核心词汇",words:[]},
  senior:{id:"senior",name:"高中",tag:"提高",desc:"课标词汇 · 进阶核心",words:[]},
  cet4:{id:"cet4",name:"四级",tag:"冲刺",desc:"四级高频核心词",words:[]}
};
var _bookLoaded={};
function bookFile(id){return ASSET_BASE+"words_"+id+".json"}
function isBookLoaded(id){return !!_bookLoaded[id]}
function bookLoadingEl(){return document.getElementById("bookLoading")}
function showBookLoading(msg){
  var el=bookLoadingEl();if(!el)return;
  el.innerHTML='<div class="bl-box"><div class="bl-sp"></div><div class="bl-t">'+(msg||"正在加载词库")+'</div></div>';
  el.style.display="flex";
}
function hideBookLoading(){var el=bookLoadingEl();if(el)el.style.display="none"}
function bookLoadFail(id){
  var el=bookLoadingEl();if(!el)return;
  el.innerHTML='<div class="bl-box"><div class="bl-t">词库加载失败</div><div class="bl-d">首次使用需联网加载一次词库，<br>之后断网也能正常背单词。</div><button class="bl-btn" onclick="retryBookLoad()">重试</button></div>';
  el.style.display="flex";
}
function retryBookLoad(){
  showBookLoading("正在加载词库");
  ensureBook(curBookId(),function(){hideBookLoading();renderAll();});
}
function ensureBook(id,cb){
  if(!BOOKS[id]){if(cb)cb();return}
  if(_bookLoaded[id]){if(cb)cb();return}
  showBookLoading("正在加载"+BOOKS[id].name+"词库");
  var settled=false;
  var timer=setTimeout(function(){if(settled)return;settled=true;bookLoadFail(id);},10000);
  fetch(bookFile(id)).then(function(r){
    if(!r.ok)throw new Error("HTTP "+r.status);
    return r.json();
  }).then(function(arr){
    if(settled)return;settled=true;clearTimeout(timer);
    if(!Array.isArray(arr))arr=[];
    BOOKS[id].words=arr;
    if(id==="cet4")CET4_WORDS=arr;
    _bookLoaded[id]=true;
    hideBookLoading();
    if(cb)cb();
  }).catch(function(e){
    if(settled)return;settled=true;clearTimeout(timer);
    bookLoadFail(id);
  });
}
function curBookId(){return (S&&S.curBook&&BOOKS[S.curBook])?S.curBook:"cet4"}
function curBook(){return BOOKS[curBookId()]}
function curWords(){return curBook().words}
function B(){
  var b=S.books[curBookId()];
  if(!b){b=Store.newBookObj();S.books[curBookId()]=b}
  return b;
}

const INTERVALS=[1,2,4,7,15,30];

// === Daily Inspirational Quotes (learning-related) ===
const QUOTES=[
  {text:"不积跬步，无以至千里；不积小流，无以成江海。",author:"荀子"},
  {text:"学如逆水行舟，不进则退。",author:"古语"},
  {text:"书山有路勤为径，学海无涯苦作舟。",author:"韩愈"},
  {text:"业精于勤，荒于嬉；行成于思，毁于随。",author:"韩愈"},
  {text:"千里之行，始于足下。",author:"老子"},
  {text:"宝剑锋从磨砺出，梅花香自苦寒来。",author:"古语"},
  {text:"世上无难事，只怕有心人。",author:"袁枚"},
  {text:"温故而知新，可以为师矣。",author:"孔子"},
  {text:"学而不思则罔，思而不学则殆。",author:"孔子"},
  {text:"知之者不如好之者，好之者不如乐之者。",author:"孔子"},
  {text:"锲而舍之，朽木不折；锲而不舍，金石可镂。",author:"荀子"},
  {text:"绳锯木断，水滴石穿。",author:"班固"},
  {text:"路漫漫其修远兮，吾将上下而求索。",author:"屈原"},
  {text:"博学之，审问之，慎思之，明辨之，笃行之。",author:"礼记"},
  {text:"贵有恒何必三更眠五更起，最无益只怕一日曝十日寒。",author:"胡适"},
  {text:"天下事有难易乎？为之，则难者亦易矣。",author:"彭端淑"},
  {text:"不畏浮云遮望眼，自缘身在最高层。",author:"王安石"},
  {text:"你只管努力，剩下的交给时间。",author:"佚名"},
  {text:"今天的你，是昨天选择的结果。",author:"佚名"},
  {text:"种一棵树最好的时间是十年前，其次是现在。",author:"谚语"},
  {text:"每一条走过的路，都有它不得不跋涉的理由。",author:"佚名"},
  {text:"成功不是将来才有的，而是从决定去做的那一刻起持续累积。",author:"佚名"},
  {text:"努力到无能为力，拼搏到感动自己。",author:"佚名"},
  {text:"骐骥一跃，不能十步；驽马十驾，功在不舍。",author:"荀子"},
  {text:"读不在三更五鼓，功只怕一曝十寒。",author:"郭沫若"},
  {text:"百丈竿头须进步，十方世界是全身。",author:"释道原"},
  {text:"没有付出，就没有收获。",author:"谚语"},
  {text:"学习是终身的职业，在学习的道路上，只要坚持就是胜利。",author:"佚名"},
  {text:"不怕学不会，只怕不肯钻。",author:"谚语"},
  {text:"时间就像海绵里的水，只要愿挤，总还是有的。",author:"鲁迅"}
];
function getDailyQuote(){
  var now=new Date();
  var dayOfYear=Math.floor((now-new Date(now.getFullYear(),0,0))/86400000);
  return QUOTES[dayOfYear%QUOTES.length];
}

// === Date Utils ===
function pad2(n){return n<10?"0"+n:""+n}
function dateStr(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())}
function todayStr(){return dateStr(new Date())}
function parseDate(s){var p=s.split("-");return new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]))}
function addDays(s,n){var d=parseDate(s);d.setDate(d.getDate()+n);return dateStr(d)}
function daysDiff(s1,s2){var d1=parseDate(s1),d2=parseDate(s2);return Math.round((d2-d1)/86400000)}

// === Storage ===
var STORE_KEY="cet4_station_v1";
var Store={
  data:null,
  load:function(){
    try{var raw=localStorage.getItem(STORE_KEY);this.data=raw?JSON.parse(raw):null}catch(e){this.data=null}
    if(!this.data)this.data=this.defaultData();
    this.migrate();
    return this.data;
  },
  save:function(){try{localStorage.setItem(STORE_KEY,JSON.stringify(this.data))}catch(e){console.warn("Storage full")}},
  defaultData:function(){
    return{
      curBook:"cet4",
      books:{primary:this.newBookObj(),junior:this.newBookObj(),senior:this.newBookObj(),cet4:this.newBookObj()},
      newPerDay:20,
      dictSessions:{},checkIns:{},
      examDate:null,version:3
    };
  },
  newBookObj:function(){
    return{
      wordStates:{},nextNewIdx:0,lastPushDate:null,
      todayPushCount:0,todayQueueDate:null,todayQueueIds:[],
      mistakeBook:[],dictBook:[],pronBook:[],
      dictStats:{total:0,correct:0},pronStats:{total:0,pass:0},
      focusQueueDone:[]
    };
  },
  migrate:function(){
    var d=this.data;
    if(!d.books||d.version<3){
      // v2 -> v3: move all single-book data into books.cet4, keep global fields
      var b={
        wordStates:d.wordStates||{},
        nextNewIdx:d.nextNewIdx||0,
        lastPushDate:d.lastPushDate||null,
        todayPushCount:(d.todayPushCount===undefined||d.todayPushCount===null)?((d.lastPushDate===todayStr()&&d.newPerDay)?d.newPerDay:0):d.todayPushCount,
        todayQueueDate:(d.todayQueueDate===undefined||d.todayQueueDate===null)?null:d.todayQueueDate,
        todayQueueIds:d.todayQueueIds||[],
        mistakeBook:d.mistakeBook||[],
        dictBook:d.dictBook||[],
        pronBook:d.pronBook||[],
        dictStats:d.dictStats||{total:0,correct:0},
        pronStats:d.pronStats||{total:0,pass:0},
        focusQueueDone:d.focusQueueDone||[]
      };
      var d2={
        curBook:"cet4",
        books:{primary:this.newBookObj(),junior:this.newBookObj(),senior:this.newBookObj(),cet4:b},
        newPerDay:d.newPerDay||20,
        dictSessions:d.dictSessions||{},
        checkIns:d.checkIns||{},
        examDate:d.examDate||null,
        version:3
      };
      this.data=d2;d=d2;
    }
    // Ensure every book exists with all fields
    var ids=["primary","junior","senior","cet4"];
    for(var i=0;i<ids.length;i++){
      var bk=d.books[ids[i]];
      if(!bk)bk=d.books[ids[i]]=this.newBookObj();
      var nb=this.newBookObj();
      for(var k in nb){if(bk[k]===undefined)bk[k]=nb[k]}
    }
    if(!d.curBook||!d.books[d.curBook])d.curBook="cet4";
    if(!d.checkIns)d.checkIns={};
    if(!d.dictSessions)d.dictSessions={};
    if(!d.examDate)d.examDate=this.getDefaultExamDate();
    if(!d.newPerDay)d.newPerDay=20;
    // 旧默认值为 10，统一上调到 20 以稀释每日重复观感（仅影响遗留的旧值，手动设置过其他值不受影响）
    if(d.newPerDay===10)d.newPerDay=20;

    // ---- 词库大扩充迁移（v4）：进度从"词条id"改为"单词名"存储，一次性完成，之后扩库不丢进度 ----
    if(!d.wordMigrated){
      var OLD_MAP={"primary":["above","afraid","after","again","airport","always","animal","another","answer","apple","arm","around","art","aunt","baby","back","bad","bag","ball","banana","basketball","beautiful","because","become","before","begin","behind","below","beside","best","better","between","big","bike","bird","birthday","black","blue","boat","body","book","borrow","both","bottle","box","bread","breakfast","bright","bring","brother","brown","build","busy","buy","cake","call","can","careful","carry","catch","chair","cheap","check","child","Chinese","city","class","clean","clever","clock","close","clothes","cold","colour","come","cool","cousin","cow","cry","dance","daughter","delicious","desk","dinner","dog","draw","drink","easy","egg","elephant","evening","family","farm","father","favourite","fish","flower","food","football","friend","game","garden"],"junior":["achieve","active","advice","agree","ahead","almost","alone","although","among","appear","attention","average","avoid","balance","brave","breath","calm","cancel","cause","celebrate","certain","chance","character","choice","choose","citizen","climb","common","communicate","compare","competition","complete","consider","continue","control","correct","create","curious","danger","defeat","depend","describe","destroy","develop","difference","difficulty","discuss","disease","distance","double","doubt","effort","encourage","energy","environment","especially","examine","excellent","expect","experience","explain","express","fail","familiar","famous","figure","foreign","freedom","general","gentle","government","grateful","guide","habit","honest","honor","imagine","improve","include","increase","influence","introduce","journey","knowledge","law","leader","limit","manage","meaning","mention","method","moment","mystery","necessary","nervous","notice","obvious","offer","opinion","opposite","ordinary","patient","pattern","peaceful","perfect","perform","period","personal","physical","praise","prefer","prepare","present","prevent","pride","private","prize","process","produce","promise","proper","protect","proud","purpose","quality","realize","receive","recognize","reduce","refuse","regret","relax","remain","remind","repair","reply","require","research","respect","result","return","review","reward","risk","safety","satisfy","science","secret","seldom","sense"],"senior":["absurd","accelerate","acquire","advocate","ambitious","anonymous","applaud","artificial","ashamed","await","awkward","barrier","behalf","behave","betray","blame","boost","boundary","brilliant","calculate","campaign","candidate","capable","capacity","cautious","cease","characteristic","charity","circumstance","claim","clarify","collapse","commit","compensate","compete","complain","compromise","concentrate","concept","concrete","confess","confident","conflict","confront","consequence","considerable","consistent","convey","cope","critical","cultivate","deceive","declare","decline","dedicate","delicate","demonstrate","deny","derive","desperate","detect","devote","dignity","dilemma","diminish","dispute","distinct","diverse","dominate","eliminate","embrace","emerge","emphasis","enhance","enormous","ensure","essence","establish","estimate","evaluate","eventually","evident","evolve","exaggerate","exceed","exceptional","expand","expose","extend","facilitate","fatal","fatigue","feasible","flourish","formulate","foster","fragile","framework","fundamental","generate","genuine","guarantee","hesitate","highlight","implement","inevitable","initiative","insight","integrate","intense","involve","isolate","justify","launch","multiple","neglect","notion","obstacle","obtain","optimistic","outcome","overcome","overwhelm","paradox","perceive","persist","perspective","phenomenon","precise","preserve","prevail","profound","prohibit","prompt","provoke","pursue","relevant","reluctant","remarkable","render","restore","restrain","retain","reveal","rigid","sacrifice","significant","simultaneous","skeptical","sophisticated","statistics","strive","substantial","surpass","sustain","tackle","tedious","terminate","thrive","tolerate","transform","tremendous","trigger","trivial","undermine","utilize","vague","verbal","verify","vital","vulnerable","whereas","withdraw","withstand"],"cet4":["abandon","absolute","academic","accompany","accomplish","account","accumulate","accurate","adapt","adequate","adjust","admire","admit","adopt","advantage","affair","affect","afford","agency","agenda","aggressive","allocate","alter","alternative","ambiguous","analyze","ancient","announce","annual","anticipate","apparent","appeal","apply","approach","appropriate","approve","arrange","assemble","assess","assign","assist","associate","assume","assure","atmosphere","attach","attain","attempt"]};
      var bookIds=["primary","junior","senior","cet4"];
      for(var bi=0;bi<bookIds.length;bi++){
        var bk2=d.books[bookIds[bi]];
        if(!bk2)continue;
        var oldArr=OLD_MAP[bookIds[bi]]||[];
        var nw=(BOOKS[bookIds[bi]]&&BOOKS[bookIds[bi]].words)||[];
        var newSet={};
        for(var ni=0;ni<nw.length;ni++)newSet[nw[ni].word]=true;
        var ns={};
        for(var oid in bk2.wordStates){
          var ost=bk2.wordStates[oid];
          if(!ost)continue;
          var ow=oldArr[parseInt(oid)-1];
          if(ow&&newSet[ow])ns[ow]=ost;
        }
        bk2.wordStates=ns;
        bk2.nextNewIdx=0;
        for(var pi=0;pi<nw.length;pi++){
          var ps=ns[nw[pi].word];
          if(ps&&ps.introduced)bk2.nextNewIdx=pi+1;
          else{bk2.nextNewIdx=pi;break;}
        }
        var remapId=function(arr){
          var out=[];
          if(!arr)return out;
          for(var x=0;x<arr.length;x++){
            var ow2=oldArr[parseInt(arr[x])-1];
            if(ow2&&newSet[ow2]&&out.indexOf(ow2)<0)out.push(ow2);
          }
          return out;
        };
        bk2.todayQueueIds=remapId(bk2.todayQueueIds);
        bk2.focusQueueDone=remapId(bk2.focusQueueDone);
        bk2.mistakeBook=remapId(bk2.mistakeBook);
        var keepByWord=function(arr){
          if(!arr)return [];
          return arr.filter(function(e){return e&&e.word&&newSet[e.word]});
        };
        bk2.dictBook=keepByWord(bk2.dictBook);
        bk2.pronBook=keepByWord(bk2.pronBook);
      }
      d.wordMigrated=true;
    }
    d.version=3;
  },
  getDefaultExamDate:function(){
    var now=new Date();
    var y=now.getFullYear();
    var d=new Date(y,11,1);
    var sat=0;
    while(d.getMonth()===11){
      if(d.getDay()===6){sat++;if(sat===3)break}
      d.setDate(d.getDate()+1);
    }
    return dateStr(d);
  },
  exportJSON:function(){return JSON.stringify(this.data,null,2)},
  importJSON:function(json){try{this.data=JSON.parse(json);this.migrate();this.save();return true}catch(e){return false}},
  clearAll:function(){this.data=this.defaultData();this.data.examDate=this.getDefaultExamDate();this.save()},
  clearSamples:function(){
    var ids=["primary","junior","senior","cet4"];
    for(var i=0;i<ids.length;i++){
      var bk=this.data.books[ids[i]];
      if(!bk)continue;
      bk.dictBook=bk.dictBook.filter(function(r){return !r.isSample});
      bk.pronBook=bk.pronBook.filter(function(r){return !r.isSample});
      bk.wordStates={};bk.nextNewIdx=0;bk.lastPushDate=null;
      bk.todayPushCount=0;bk.todayQueueDate=null;bk.todayQueueIds=[];
      bk.mistakeBook=[];
      bk.focusQueueDone=[];
      bk.dictStats={total:0,correct:0};bk.pronStats={total:0,pass:0};
    }
    this.data.dictSessions={};
    this.save();
  },
  totalRecords:function(){
    var ids=["primary","junior","senior","cet4"];
    var n=0;
    for(var i=0;i<ids.length;i++){
      var bk=this.data.books?this.data.books[ids[i]]:null;
      if(!bk)continue;
      n+=bk.dictBook.length+bk.pronBook.length+bk.mistakeBook.length+Object.keys(bk.wordStates).length;
    }
    return n;
  }
};

// === State ===
var S=null;
function loadState(){S=Store.load()}

// === Word System ===
function getWordState(id){
  var b=B();
  if(!b.wordStates[id])b.wordStates[id]={level:0,nextReview:null,wrongToday:0,wrongDate:null,introduced:false,totalWrong:0,hardMode:false,fuzzyCount:0};
  return b.wordStates[id];
}
function getWordData(x){return curWords().find(function(w){return w.word===x})||curWords().find(function(w){return w.id===x})||null}

function pushNewWordsIfNeeded(){
  var t=todayStr();
  if(B().lastPushDate!==t){
    B().lastPushDate=t;
    B().todayPushCount=0;
  }
  // Top up new words immediately when newPerDay is raised mid-day
  if(B().todayPushCount>=S.newPerDay)return;
  while(B().nextNewIdx<curWords().length&&B().todayPushCount<S.newPerDay){
    var w=curWords()[B().nextNewIdx];
    var st=getWordState(w.word);
    if(!st.introduced){
      st.introduced=true;st.level=0;st.nextReview=t;
      B().todayPushCount++;
    }
    B().nextNewIdx++;
  }
  Store.save();
}

function getTodayQueue(){
  pushNewWordsIfNeeded();
  var t=todayStr();
  var queue=[];
  for(var i=0;i<curWords().length;i++){
    var w=curWords()[i];
    var st=B().wordStates[w.word];
    if(!st||!st.introduced)continue;
    // Skip postponed (wrong 3+ times today)
    if(st.wrongToday>=3&&st.wrongDate===t)continue;
    // Due?
    if(st.nextReview&&st.nextReview<=t){
      queue.push(w.word);
    }
  }
  // Snapshot today's full queue for the "restart" feature
  if(B().todayQueueDate!==t){
    B().todayQueueDate=t;
    B().todayQueueIds=queue.slice();
    // New day: yesterday's done-list must be cleared, otherwise words
    // due for review today would be wrongly skipped as "already done"
    B().focusQueueDone=[];
    Store.save();
  }else{
    for(var j=0;j<queue.length;j++){
      if(B().todayQueueIds.indexOf(queue[j])<0)B().todayQueueIds.push(queue[j]);
    }
  }
  return queue;
}

function getRemainingQueue(){
  var t=todayStr();
  var q=getTodayQueue();
  // Remove already done today
  return q.filter(function(id){return B().focusQueueDone.indexOf(id)<0});
}

// state: 'know' 已掌握 | 'fuzzy' 模糊 | 'dont' 未掌握
function markWord(word,state){
  var t=todayStr();
  var st=getWordState(word);
  // Hard mode uses shorter intervals for more frequent review
  var ivs=st.hardMode?[1,1,2,3,5,15]:INTERVALS;
  if(state==='know'){
    st.level=Math.min(st.level+1,ivs.length);
    st.nextReview=addDays(t,ivs[st.level-1]||30);
    st.wrongToday=0;
    st.fuzzyCount=0;
    // Recover from hard mode after 2 consecutive correct answers
    if(st.hardMode){
      st.recoverCount=(st.recoverCount||0)+1;
      if(st.recoverCount>=2){
        st.hardMode=false;st.recoverCount=0;
        // Restore normal level progression
        st.level=Math.max(1,Math.floor(st.level/2));
      }
    }
    B().focusQueueDone.push(word);
    // Remove from mistake book if mastered
    if(st.level>=ivs.length){
      var idx=B().mistakeBook.indexOf(word);
      if(idx>=0)B().mistakeBook.splice(idx,1);
    }
  }else if(state==='fuzzy'){
    // 模糊：等级不变，间隔取当前档的一半（最少1天），不进错本；连续3次自动降级
    st.fuzzyCount=(st.fuzzyCount||0)+1;
    var curIv=ivs[st.level-1]||30;
    var half=Math.max(1,Math.floor(curIv/2));
    st.nextReview=addDays(t,half);
    st.wrongToday=0;
    B().focusQueueDone.push(word);
    if(st.fuzzyCount>=3){
      st.level=Math.max(0,st.level-1);
      st.fuzzyCount=0;
    }
  }else{ // 'dont'
    st.level=Math.max(0,st.level-1);
    st.nextReview=t; // stays in queue today
    st.fuzzyCount=0;
    if(st.wrongDate!==t){st.wrongToday=0;st.wrongDate=t}
    st.wrongToday++;
    st.totalWrong=(st.totalWrong||0)+1;
    st.recoverCount=0;
    // Persistently wrong (3+ total) -> enter hard mode (lower difficulty)
    if(st.totalWrong>=3&&!st.hardMode){
      st.hardMode=true;st.level=0;
    }
    if(st.wrongToday>=3){st.nextReview=addDays(t,1)} // postpone to tomorrow
    // Add to mistake book
    if(B().mistakeBook.indexOf(word)<0)B().mistakeBook.push(word);
  }
  Store.save();
}

// === Dictation (默写自测) ===
var dictQueue=[];
var dictIdx=0;
var dictSession={asked:0,correct:0};

function getLearnedWordIds(){
  return curWords().filter(function(w){
    var st=B().wordStates[w.word];
    return st&&st.introduced;
  }).map(function(w){return w.word});
}

function startDictation(){
  var learned=getLearnedWordIds();
  if(learned.length===0){alert("还没有学过的单词，先去背词吧！");return}
  // Shuffle and take up to 10
  var pool=learned.slice();
  for(var i=pool.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;
  }
  dictQueue=pool.slice(0,10);
  dictIdx=0;
  dictSession={asked:0,correct:0};
  document.getElementById("dictIntroCard").style.display="none";
  document.getElementById("dictRunCard").style.display="block";
  renderDictCard();
}

function quitDictation(){
  document.getElementById("dictRunCard").style.display="none";
  document.getElementById("dictIntroCard").style.display="block";
  renderWordbook();
}

function renderDictCard(){
  if(dictIdx>=dictQueue.length){finishDictation();return}
  var w=getWordData(dictQueue[dictIdx]);
  if(!w){dictIdx++;renderDictCard();return}
  document.getElementById("dictProgress").textContent=(dictIdx+1)+" / "+dictQueue.length;
  document.getElementById("dictMeaning").textContent=w.meaning+"（"+w.pos+"）";
  document.getElementById("dictPhonetic").textContent=w.phonetic;
  var sb=document.getElementById("dictSpeakBtn");
  sb.style.display="inline-flex";
  sb.innerHTML=ICONS.speaker;
  sb.onclick=function(){speak(w.word)};
  document.getElementById("dictInput").value="";
  document.getElementById("dictInput").disabled=false;
  document.getElementById("dictInput").focus();
  document.getElementById("dictSubmitBtn").textContent="提交";
  document.getElementById("dictFeedback").className="dict-feedback";
  document.getElementById("dictFeedback").innerHTML="";
}

function submitDictation(){
  var input=document.getElementById("dictInput").value.trim().toLowerCase();
  if(!input)return;
  var w=getWordData(dictQueue[dictIdx]);
  if(!w){renderDictCard();return}
  dictSession.asked++;
  B().dictStats.total++;
  var fb=document.getElementById("dictFeedback");
  if(input===w.word.toLowerCase()){
    dictSession.correct++;
    B().dictStats.correct++;
    // If word in dictBook, count as re-passed -> remove
    B().dictBook=B().dictBook.filter(function(e){return e.word!==w.word});
    fb.className="dict-feedback ok";
    fb.innerHTML="正确！";
    Store.save();
    setTimeout(function(){dictIdx++;renderDictCard()},700);
  }else{
    fb.className="dict-feedback err";
    fb.innerHTML="答错：你写的 <span class=\"df-word\">"+escHtml(input)+"</span>，正确的是 <span class=\"df-word\">"+w.word+"</span>";
    addDictMistake(w.word,input);
    Store.save();
    document.getElementById("dictInput").disabled=true;
    document.getElementById("dictSubmitBtn").textContent="下一个";
    document.getElementById("dictSubmitBtn").onclick=nextDictation;
  }
  renderTopbar();
}

function nextDictation(){
  document.getElementById("dictSubmitBtn").onclick=submitDictation;
  dictIdx++;
  renderDictCard();
}

function addDictMistake(word,userSpell){
  var w=getWordData(word);
  var t=todayStr();
  // Update or create entry
  var entry=B().dictBook.find(function(e){return e.word===word});
  if(entry){
    entry.userSpell=userSpell;entry.date=t;entry.times=(entry.times||1)+1;
  }else{
    B().dictBook.push({id:"dm_"+Date.now(),wordId:w?w.id:null,word:word,userSpell:userSpell,date:t,times:1,isSample:false});
  }
  // Downgrade word one level to resurface sooner
  var st=getWordState(word);
  st.level=Math.max(0,st.level-1);
  st.nextReview=t;
}

function finishDictation(){
  var t=todayStr();
  S.dictSessions[t]=(S.dictSessions[t]||0)+1;
  Store.save();
  doCheckIn();
  document.getElementById("dictRunCard").style.display="none";
  document.getElementById("dictIntroCard").style.display="block";
  var rate=dictSession.asked>0?Math.round(dictSession.correct/dictSession.asked*100):0;
  renderWordbook();
  renderTopbar();
  renderToday();
  alert("本次默写完成！\n共 "+dictSession.asked+" 词，正确 "+dictSession.correct+" 词，正确率 "+rate+"%");
}

// === Pronunciation Recognition (发音验证) ===
// 发音评测（SpeechRecognition）已下线：国内安卓 WebView + 无 GMS 环境不可用，
// 且需麦克风授权，实测为死功能。置 false 后所有相关入口与触发逻辑自动失效。
var SRClass=null;
var srSupport=false;
var pronChecking=false;
var pronRec=null;
var pronTimer=null;
var pronCtx=null; // callback when finished

function levDistance(a,b){
  if(a===b)return 0;
  var m=a.length,n=b.length;
  if(m===0)return n;if(n===0)return m;
  var prev=[],cur=[];
  for(var j=0;j<=n;j++)prev[j]=j;
  for(var i=1;i<=m;i++){
    cur[0]=i;
    for(var j=1;j<=n;j++){
      var cost=a.charAt(i-1)===b.charAt(j-1)?0:1;
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
    }
    var tmp=prev;prev=cur;cur=tmp;
  }
  return prev[n];
}

function pronounceMatches(transcripts,word){
  var target=word.toLowerCase();
  var tolerance=Math.max(1,Math.floor(target.length/4));
  for(var i=0;i<transcripts.length;i++){
    var t=String(transcripts[i]||"").toLowerCase().replace(/[^a-z\s']/g,"").trim();
    if(!t)continue;
    if(t===target)return true;
    if(t.indexOf(target)>=0)return true;
    // Compare with each recognized token
    var tokens=t.split(/\s+/);
    for(var k=0;k<tokens.length;k++){
      if(levDistance(tokens[k],target)<=tolerance)return true;
    }
  }
  return false;
}

function startPronCheck(word,onDone,practice){
  pronCtx=onDone;
  var overlay=document.getElementById("pronOverlay");
  document.getElementById("pronWord").textContent=word;
  var status=document.getElementById("pronStatus");
  status.className="pron-status";
  status.textContent="正在聆听，请朗读上面的单词";
  overlay.classList.add("active");
  document.getElementById("focusActions").style.display="none";
  pronChecking=true;
  try{
    pronRec=new SRClass();
    pronRec.lang="en-US";
    pronRec.interimResults=false;
    pronRec.maxAlternatives=5;
    var gotResult=false;
    pronRec.onresult=function(ev){
      gotResult=true;
      var alts=[];
      for(var i=0;i<ev.results[0].length;i++)alts.push(ev.results[0][i].transcript);
      var pass=pronounceMatches(alts,word);
      if(!practice){
        B().pronStats.total++;
        if(pass){
          B().pronStats.pass++;
          status.className="pron-status ok";
          status.textContent="发音通过！";
        }else{
          status.textContent="听到的是「"+alts[0]+"」，未匹配 "+word+"，已收入发音错词本";
          status.className="pron-status err";
          addPronMistake(word);
        }
        Store.save();
      }else{
        if(pass){
          status.className="pron-status ok";
          status.textContent="发音通过！";
        }else{
          status.textContent="听到的是「"+alts[0]+"」，未匹配 "+word+"（练习模式不记录）";
          status.className="pron-status err";
        }
      }
      setTimeout(function(){endPronCheck(pass)},900);
    };
    pronRec.onerror=function(ev){
      // no-speech / not-allowed / network -> skip silently
      status.className="pron-status";
      status.textContent="录音不可用（"+(ev.error==="not-allowed"?"未授权麦克风":"未能识别语音")+"），已跳过";
      setTimeout(function(){endPronCheck(null)},900);
    };
    pronRec.onend=function(){
      if(!gotResult&&pronChecking){
        status.className="pron-status";
        status.textContent="未识别到语音，已跳过";
        setTimeout(function(){endPronCheck(null)},700);
      }
    };
    pronRec.start();
    // Safety timeout 10s
    pronTimer=setTimeout(function(){
      if(pronChecking){
        try{pronRec.stop()}catch(e){}
        status.className="pron-status";
        status.textContent="超时，已跳过录音验证";
        setTimeout(function(){endPronCheck(null)},700);
      }
    },10000);
  }catch(e){
    endPronCheck(null);
  }
}

function endPronCheck(pass){
  if(!pronChecking)return;
  pronChecking=false;
  if(pronTimer){clearTimeout(pronTimer);pronTimer=null}
  try{if(pronRec){pronRec.onresult=null;pronRec.onerror=null;pronRec.onend=null;pronRec.abort()}}catch(e){}
  pronRec=null;
  document.getElementById("pronOverlay").classList.remove("active");
  document.getElementById("focusActions").style.display="flex";
  var cb=pronCtx;pronCtx=null;
  if(cb)cb(pass);
}

function skipPronCheck(){
  if(pronTimer){clearTimeout(pronTimer);pronTimer=null}
  endPronCheck(null);
}

function addPronMistake(word){
  var w=curWords().find(function(x){return x.word===word});
  if(!w)return;
  var t=todayStr();
  var entry=B().pronBook.find(function(e){return e.word===word});
  if(entry){
    entry.fails=(entry.fails||0)+1;entry.lastFail=t;
  }else{
    B().pronBook.push({id:"pm_"+Date.now(),wordId:w.id,word:w.word,fails:1,lastFail:t,isSample:false});
  }
  renderTopbar();
}

// === Check-in ===
function doCheckIn(){
  S.checkIns[todayStr()]=true;
  Store.save();
}
function getConsecutiveDays(){
  var streak=0;
  var d=todayStr();
  // If today not checked in, start from yesterday
  if(!S.checkIns[d])d=addDays(d,-1);
  while(S.checkIns[d]){streak++;d=addDays(d,-1)}
  return streak;
}
function getHeatmapData(){
  var result=[];
  var t=todayStr();
  for(var i=29;i>=0;i--){
    var ds=addDays(t,-i);
    var active=S.checkIns[ds];
    var sessions=S.dictSessions[ds]||0;
    var level=0;
    if(active)level=1;
    if(active&&sessions>=1)level=2;
    if(sessions>=2)level=3;
    if(sessions>=3)level=4;
    result.push({date:ds,level:level});
  }
  return result;
}

// === Countdown ===
function getExamDate(){return S.examDate||Store.getDefaultExamDate()}
function getCountdown(){return daysDiff(todayStr(),getExamDate())}

// === Rendering ===
function renderAll(){renderNav();renderTopbar();renderToday();renderWordbook();renderMistakes();renderMine()}

function renderNav(){
  var navItems=[
    {view:"today",label:"今日",icon:ICONS.today},
    {view:"wordbook",label:"单词本",icon:ICONS.book},
    {view:"mistakes",label:"错本",icon:ICONS.mistakes},
    {view:"mine",label:"我的",icon:ICONS.mine}
  ];
  var activeView=S.currentView||"today";
  var html=navItems.map(function(n){
    return '<button class="nav-btn '+(n.view===activeView?"active":"")+'" data-view="'+n.view+'">'+n.icon+'<span>'+n.label+'</span></button>';
  }).join("");
  document.getElementById("bottomNav").innerHTML=html;
  document.getElementById("topNav").innerHTML='<div class="brand">'+ICONS.today+'四六级备考台</div>'+navItems.map(function(n){
    return '<button class="nav-btn '+(n.view===activeView?"active":"")+'" data-view="'+n.view+'">'+n.icon+'<span>'+n.label+'</span></button>';
  }).join("");
  document.getElementById("sidebarNav").innerHTML=navItems.map(function(n){
    return '<button class="nav-btn '+(n.view===activeView?"active":"")+'" data-view="'+n.view+'">'+n.icon+'<span>'+n.label+'</span></button>';
  }).join("");
  // Book switcher labels
  var cbk=curBook();
  var bsName=document.getElementById("bookSwitchName");if(bsName)bsName.textContent=cbk.name;
  var bsDesc=document.getElementById("bookSwitchDesc");if(bsDesc)bsDesc.textContent=cbk.desc;
  var tbTag=document.getElementById("todayBookTag");if(tbTag)tbTag.textContent=cbk.name+"词库";
  var bsBtnM=document.getElementById("bookSwitchBtnM");if(bsBtnM)bsBtnM.textContent=cbk.name+" · "+cbk.desc;
  var twInfo=document.getElementById("totalWordsInfo");
  if(twInfo){var tw=0;for(var bk in BOOKS){tw+=BOOKS[bk].words.length}twInfo.textContent="4个词库 · 共"+tw+"词"}

  // Sidebar daily quote（去掉倒计时，仅留寄语）
  var q=getDailyQuote();
  document.getElementById("sidebarCountdown").innerHTML='<div class="countdown-box"><div style="font-size:13px;color:var(--ink);line-height:1.7;margin-bottom:8px">'+q.text+'</div><div style="font-size:11px;color:var(--orange-d);margin-bottom:8px">—— '+q.author+'</div></div>';
  // Bind clicks
  document.querySelectorAll(".nav-btn").forEach(function(btn){
    btn.onclick=function(){switchView(btn.dataset.view)};
  });
}

function switchView(view){
  S.currentView=view;
  document.querySelectorAll(".view").forEach(function(v){v.classList.remove("active")});
  var el=document.getElementById("view-"+view);
  if(el)el.classList.add("active");
  renderNav();
  if(view==="today")renderToday();
  if(view==="wordbook")renderWordbook();
  if(view==="mistakes")renderMistakes();
  if(view==="mine")renderMine();
}

function renderTopbar(){
  var t=todayStr();
  var d=new Date();
  var weekdays=["日","一","二","三","四","五","六"];
  var remaining=getRemainingQueue();
  var cd=getCountdown();

  var chips=[];
  // Words chip
  if(remaining.length>0){
    chips.push('<button class="task-chip due" onclick="switchView(\'today\')">'+ICONS.book+'剩余单词 '+remaining.length+'</button>');
  }else{
    chips.push('<button class="task-chip done">'+ICONS.check+'单词已完成</button>');
  }
  // Pronunciation mistakes chip
  if(B().pronBook.length>0){
    chips.push('<button class="task-chip due" onclick="switchView(\'wordbook\')">'+ICONS.mistakes+'发音待练 '+B().pronBook.length+'</button>');
  }else{
    chips.push('<button class="task-chip done">'+ICONS.check+'无发音待练</button>');
  }
  // Dictation mistakes chip
  if(B().dictBook.length>0){
    chips.push('<button class="task-chip due" onclick="switchView(\'mistakes\')">'+ICONS.mistakes+'默写错词 '+B().dictBook.length+'</button>');
  }else{
    chips.push('<button class="task-chip done">'+ICONS.check+'无默写错词</button>');
  }

  document.getElementById("topbar").innerHTML=
    '<div class="topbar-row">'+
      '<span class="topbar-title">今天要处理</span>'+
      '<span class="countdown-inline">'+ICONS.clock+'距考试 '+cd+' 天</span>'+
    '</div>'+
    '<div class="topbar-date">'+d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 星期'+weekdays[d.getDay()]+'</div>'+
    '<div class="task-chips">'+chips.join("")+'</div>';
}

function renderToday(){
  // Mobile header date
  var md=document.getElementById("mobileDate");
  if(md){
    var d=new Date();
    var weekdays=["日","一","二","三","四","五","六"];
    md.textContent=d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" 周"+weekdays[d.getDay()];
  }

  // Ring progress — use today's FIXED snapshot as the total, so the total
  // never shrinks while studying or after finishing
  getTodayQueue();
  var total=B().todayQueueIds.length;
  var done=0;
  for(var i=0;i<total;i++){if(B().focusQueueDone.indexOf(B().todayQueueIds[i])>=0)done++}
  var pct=total>0?done/total:0;
  var circumference=2*Math.PI*50;
  document.getElementById("ringFg").setAttribute("stroke-dasharray",circumference);
  document.getElementById("ringFg").setAttribute("stroke-dashoffset",circumference*(1-pct));
  document.getElementById("ringNum").textContent=done+"/"+total;
  document.getElementById("ringLabel").textContent=(total>0&&done>=total)?"今日已完成":"已完成/今日总数";

  // Heatmap
  var hmData=getHeatmapData();
  var hmHtml=hmData.map(function(d){
    return '<div class="hm-cell '+(d.level>0?"l"+d.level:"")+'" title="'+d.date+'"></div>';
  }).join("");
  document.getElementById("heatmap").innerHTML=hmHtml;

  // Streak
  document.getElementById("streakNum").textContent=getConsecutiveDays();

  // Daily quote（仅显示寄语内容，不含倒计时）
  var q=getDailyQuote();
  document.getElementById("quoteDisplay").innerHTML=
    '<div style="font-size:18px;font-weight:600;color:var(--ink);line-height:1.8;margin-bottom:10px;padding:0 8px">'+q.text+'</div>'+
    '<div style="font-size:13px;color:var(--orange-d);font-weight:600;margin-bottom:14px">—— '+q.author+'</div>';
}

function renderWordbook(){
  // Dictation stats
  var ds=B().dictStats;
  var dRate=ds.total>0?Math.round(ds.correct/ds.total*100):0;
  var ps=B().pronStats;
  var pRate=ps.total>0?Math.round(ps.pass/ps.total*100):0;
  var dsHtml='<div class="acc-card"><div class="acc-type">默写正确率</div><div class="acc-rate">'+dRate+'%</div><div class="acc-detail">'+ds.correct+'/'+ds.total+'</div></div>'+
    '<div class="acc-card"><div class="acc-type">发音通过率</div><div class="acc-rate">'+pRate+'%</div><div class="acc-detail">'+ps.pass+'/'+ps.total+'</div></div>';
  var dsr=document.getElementById("dictStatsRow");
  if(dsr)dsr.innerHTML='<div class="accuracy-grid">'+dsHtml+'</div>';

  // Pronunciation practice list
  var ppList=document.getElementById("pronPracticeList");
  if(ppList){
    if(B().pronBook.length===0){
      ppList.innerHTML='<div class="empty-hint">暂无发音待练词，背词时点"已掌握"会自动验证发音</div>';
    }else{
      ppList.innerHTML=B().pronBook.map(function(e){
        var w=getWordData(e.word);
        var st=w?getWordState(e.word):null;
        return '<div class="bk-item">'+
          '<div><span class="bk-word">'+e.word+'</span>'+(w?'<span class="bk-phonetic">'+w.phonetic+'</span>':'')+'</div>'+
          '<div class="bk-meaning">'+(w?w.pos+' '+w.meaning:'')+'</div>'+
          '<div class="bk-meta"><span>失败 '+e.fails+' 次</span><span>最近：'+e.lastFail+'</span></div>'+
          '<div class="bk-actions">'+
            '<button class="bk-btn bk-btn-practice" onclick="speak(\''+jsStr(e.word)+'\')">'+ICONS.speaker+' 试听</button>'+
            (srSupport?'<button class="bk-btn bk-btn-review" onclick="retryPron(\''+jsStr(e.word)+'\')">重练发音</button>':'')+
            '<button class="bk-btn bk-btn-delete" onclick="removePronMistake(\''+e.id+'\')">移出</button>'+
          '</div></div>';
      }).join("");
    }
  }

  // Learned words list
  var lwList=document.getElementById("learnedWordList");
  if(lwList){
    var learned=curWords().filter(function(w){
      var st=B().wordStates[w.word];
      return st&&st.introduced;
    });
    if(learned.length===0){
      lwList.innerHTML='<div class="empty-hint">还没有学过的单词，先去今日页面背词吧</div>';
    }else{
      lwList.innerHTML=learned.map(function(w){
        var st=getWordState(w.word);
        var lvText=st.level>=INTERVALS.length?"已掌握":("L"+st.level);
        var lvClass=st.level>=INTERVALS.length?"bk-tag bk-tag-hard":"bk-tag";
        return '<div class="word-item"><div class="wi-left"><div class="wi-word">'+w.word+(st.hardMode?' <span class="'+lvClass+'">困难</span>':'')+' <span class="'+lvClass+'">'+lvText+'</span></div><div class="wi-phonetic">'+w.phonetic+'</div><div class="wi-meaning">'+w.pos+' '+w.meaning+'</div></div><div class="wi-actions">'+
          '<button class="wi-btn wi-speak" onclick="speak(\''+jsStr(w.word)+'\')">'+ICONS.speaker+'</button>'+
          '</div></div>';
      }).join("");
    }
  }
}

function retryPron(word){
  if(!srSupport){alert("当前浏览器不支持语音识别");return}
  startPronCheck(word,function(pass){
    if(pass){
      B().pronBook=B().pronBook.filter(function(e){return e.word!==word});
      Store.save();
      renderWordbook();
    }
  });
}

function removePronMistake(id){
  B().pronBook=B().pronBook.filter(function(e){return e.id!==id});
  Store.save();
  renderWordbook();
  renderTopbar();
}

function renderMistakes(){
  renderWordList();
  renderDictBookList();
  renderPronBookList();
}

function renderWordList(){
  var words=B().mistakeBook.map(function(wd){return getWordData(wd)}).filter(function(w){return w});
  if(words.length===0){
    document.getElementById("wordList").innerHTML='<div class="empty-hint">生词本为空，背词时标记"未掌握"会自动收入</div>';
    return;
  }
  document.getElementById("wordList").innerHTML=words.map(function(w){
    var st=getWordState(w.word);
    return '<div class="word-item"><div class="wi-left"><div class="wi-word">'+w.word+'</div><div class="wi-phonetic">'+w.phonetic+'</div><div class="wi-meaning">'+w.pos+' '+w.meaning+'</div></div><div class="wi-actions">'+
      '<button class="wi-btn wi-speak" onclick="speak(\''+jsStr(w.word)+'\')">'+ICONS.speaker+'</button>'+
      '<button class="wi-btn wi-remove" onclick="removeFromMistakeBook(\''+jsStr(w.word)+'\')">移出</button></div></div>';
  }).join("");
}

function removeFromMistakeBook(word){
  var idx=B().mistakeBook.indexOf(word);
  if(idx>=0)B().mistakeBook.splice(idx,1);
  Store.save();
  renderWordList();
  renderTopbar();
}

function renderDictBookList(){
  var el=document.getElementById("dictBookList");
  if(!el)return;
  if(B().dictBook.length===0){
    el.innerHTML='<div class="empty-hint">暂无默写错词，默写自测答错的词会自动收入</div>';
    return;
  }
  // Sort by date desc
  var items=B().dictBook.slice().sort(function(a,b){return b.date.localeCompare(a.date)});
  el.innerHTML=items.map(function(e){
    var w=getWordData(e.word);
    return '<div class="bk-item">'+
      '<div><span class="bk-word">'+e.word+'</span>'+(w?'<span class="bk-phonetic">'+w.phonetic+'</span>':'')+'</div>'+
      '<div class="bk-meaning">'+(w?w.pos+' '+w.meaning:'')+'</div>'+
      '<div class="bk-contrast"><span class="wrong">'+escHtml(e.userSpell)+'</span><span class="right">'+e.word+'</span></div>'+
      '<div class="bk-meta"><span>错误 '+e.times+' 次</span><span>'+e.date+'</span></div>'+
      '<div class="bk-actions">'+
        '<button class="bk-btn bk-btn-practice" onclick="speak(\''+jsStr(e.word)+'\')">'+ICONS.speaker+' 试听</button>'+
        '<button class="bk-btn bk-btn-delete" onclick="removeDictMistake(\''+e.id+'\')">移出</button>'+
      '</div></div>';
  }).join("");
}

function removeDictMistake(id){
  B().dictBook=B().dictBook.filter(function(e){return e.id!==id});
  Store.save();
  renderDictBookList();
  renderTopbar();
  renderMine();
}

function renderPronBookList(){
  var el=document.getElementById("pronBookList");
  if(!el)return;
  if(B().pronBook.length===0){
    el.innerHTML='<div class="empty-hint">暂无发音错词，背词时发音不匹配会自动收入</div>';
    return;
  }
  var items=B().pronBook.slice().sort(function(a,b){return b.lastFail.localeCompare(a.lastFail)});
  el.innerHTML=items.map(function(e){
    var w=getWordData(e.word);
    return '<div class="bk-item">'+
      '<div><span class="bk-word">'+e.word+'</span>'+(w?'<span class="bk-phonetic">'+w.phonetic+'</span>':'')+'</div>'+
      '<div class="bk-meaning">'+(w?w.pos+' '+w.meaning:'')+'</div>'+
      '<div class="bk-meta"><span>失败 '+e.fails+' 次</span><span>最近：'+e.lastFail+'</span></div>'+
      '<div class="bk-actions">'+
        '<button class="bk-btn bk-btn-practice" onclick="speak(\''+jsStr(e.word)+'\')">'+ICONS.speaker+' 试听</button>'+
        (srSupport?'<button class="bk-btn bk-btn-review" onclick="retryPron(\''+jsStr(e.word)+'\')">重练发音</button>':'')+
        '<button class="bk-btn bk-btn-delete" onclick="removePronMistake(\''+e.id+'\')">移出</button>'+
      '</div></div>';
  }).join("");
}



function renderMine(){
  var npdEl=document.getElementById("newPerDayInput");
  npdEl.value=S.newPerDay;
  npdEl.dataset.lastValue=String(S.newPerDay);
  // Backup alert
  document.getElementById("backupAlert").style.display=Store.totalRecords()>=20?"flex":"none";
  // TTS status
  document.getElementById("ttsStatus").textContent=ttsSupport?"已启用":"不支持";
  // Version + current book (便于确认手机跑的是哪一版)
  var vEl=document.getElementById("appVersionText");
  if(vEl)vEl.textContent=APP_VERSION+" · "+APP_BUILD;
  var bEl=document.getElementById("appBookText");
  if(bEl)bEl.textContent=curBook().name+"词库 · "+curWords().length+"词"+(isBookLoaded(curBookId())?"":"（加载中）");
}

// === Focus Mode ===
var focusQueue=[];
var focusIdx=0;
var focusFlipped=false;
var focusStats={known:0,unknown:0,fuzzy:0};
var focusPractice=false; // practice mode: review only, no progress/interval/mistake changes

function openFocus(){
  focusPractice=false;
  focusQueue=getRemainingQueue();
  focusIdx=0;
  focusStats={known:0,unknown:0,fuzzy:0};
  if(focusQueue.length===0){
    alert("今日单词已全部完成！");
    return;
  }
  document.getElementById("view-focus").classList.add("active");
  renderFocusCard();
}

function closeFocus(){
  stopAllSound();
  document.getElementById("view-focus").classList.remove("active");
  renderTopbar();
  renderToday();
}

function restartFocus(){
  // Practice mode: re-run today's full snapshot without recording anything
  if(!B().todayQueueIds||B().todayQueueIds.length===0){
    toast("今天还没有可背的单词");
    return;
  }
  confirmDialog("重新背词（练习模式）","将把今日的 "+B().todayQueueIds.length+" 个单词再刷一遍。\n\n练习模式下：\n· 不记进度、不影响记忆间隔\n· 不进任何错词本\n· 发音验证照常，但结果不记录\n· 未掌握的词会再出现（最多3次）",function(){
    focusPractice=true;
    focusQueue=B().todayQueueIds.slice();
    focusIdx=0;
    focusStats={known:0,unknown:0,fuzzy:0};
    document.getElementById("view-focus").classList.add("active");
    renderFocusCard();
    toast("已进入练习模式");
  });
}

// === Book Switcher ===
function openBookPicker(){
  var html="";
  var ids=["primary","junior","senior","cet4"];
  for(var i=0;i<ids.length;i++){
    var bk=BOOKS[ids[i]];
    var data=S.books[ids[i]];
    var learned=0;
    if(data&&data.wordStates){
      for(var wid in data.wordStates){if(data.wordStates[wid]&&data.wordStates[wid].introduced)learned++}
    }
    var cur=ids[i]===curBookId();
    html+='<div class="book-item'+(cur?" cur":"")+'" data-book="'+ids[i]+'">'+
      '<div class="bi-main"><div class="bi-name">'+bk.name+'<span class="bi-tag">'+bk.tag+'</span></div>'+
      '<div class="bi-desc">'+bk.desc+'</div>'+
      '<div class="bi-meta">共 '+bk.words.length+' 词 · 已学 '+learned+' 词</div></div>'+
      '<span class="bi-state">'+(cur?"使用中":"切换")+'</span></div>';
  }
  document.getElementById("bookList").innerHTML=html;
  document.querySelectorAll(".book-item").forEach(function(el){
    el.onclick=function(){pickBook(el.dataset.book)};
  });
  document.getElementById("bookOverlay").classList.add("active");
}
function closeBookPicker(){document.getElementById("bookOverlay").classList.remove("active")}
function pickBook(id){
  if(id===curBookId()){closeBookPicker();return}
  var bk=BOOKS[id];
  confirmDialog("切换词库","确定切换到「"+bk.name+"」词库吗？\n\n各词库进度相互独立：\n· 当前词库的进度完整保留\n· 新词库从第一词开始\n· 打卡与热力图全局累计",function(){
    S.curBook=id;Store.save();
    closeBookPicker();
    stopAllSound();
    document.getElementById("view-focus").classList.remove("active");
    ensureBook(id,function(){
      renderAll();
      toast("已切换到「"+bk.name+"」词库");
    });
  });
}

function escHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function jsStr(s){return String(s||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
var confirmCb=null;
var confirmCancelCb=null;
function confirmDialog(title,msg,onOk,onCancel){
  document.getElementById("confirmTitle").textContent=title;
  document.getElementById("confirmMsg").textContent=msg;
  document.getElementById("confirmOverlay").classList.add("active");
  confirmCb=onOk;
  confirmCancelCb=onCancel;
}
function closeConfirmDialog(ok){
  document.getElementById("confirmOverlay").classList.remove("active");
  var cb=confirmCb,ccb=confirmCancelCb;
  confirmCb=null;confirmCancelCb=null;
  if(ok){if(cb)cb()}else{if(ccb)ccb()}
}
function toast(msg){
  var t=document.getElementById("toastMsg");
  if(!t){
    t=document.createElement("div");
    t.id="toastMsg";
    t.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:rgba(40,40,40,.92);color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;line-height:1.5;z-index:99999;opacity:0;transition:opacity .25s;pointer-events:none;max-width:82vw;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.2)";
    document.body.appendChild(t);
  }
  t.textContent=msg;
  t.style.opacity="1";
  clearTimeout(t._tm);
  t._tm=setTimeout(function(){t.style.opacity="0"},2400);
}
// 喇叭点击反馈：按下态已由 :active 提供；这里补“播放中”脉冲 + 轻提示，
// 让用户在发音有网络/解码延迟时也能明确感知“点了且正在播”。
function flashSpeak(btn){
  if(!btn)return;
  btn.classList.add("speaking");
  try{toast("正在播放发音…");}catch(e){}
  clearTimeout(btn._spTm);
  btn._spTm=setTimeout(function(){btn.classList.remove("speaking");},1800);
}
function wordForms(w){
  // Common regular inflections so example sentences still highlight
  var forms=[w];
  if(/[^aeiou]y$/.test(w)){
    forms.push(w.slice(0,-1)+"ies",w.slice(0,-1)+"ied",w+"s",w+"ed");
  }else{
    forms.push(w+"s");
    if(/(s|x|z|ch|sh)$/.test(w))forms.push(w+"es");
  }
  if(/e$/.test(w)){
    forms.push(w+"d",w.slice(0,-1)+"ing");
  }else{
    forms.push(w+"ed",w+"ing");
    if(/^[a-z]*[aeiou][^aeiouwy]$/.test(w)){var d=w+w[w.length-1];forms.push(d+"ed",d+"ing")}
  }
  return forms;
}
function highlightWord(sentence,word){
  var safe=escHtml(sentence);
  var esc=wordForms(word).map(function(f){return f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|");
  var re=new RegExp("\\b("+esc+")\\b","gi");
  return safe.replace(re,'<span class="hl">$1</span>');
}
function renderFocusCard(){
  if(focusIdx>=focusQueue.length){
    showCelebration();
    return;
  }
  var w=getWordData(focusQueue[focusIdx]);
  if(!w){focusIdx++;renderFocusCard();return}
  var st=getWordState(w.word);
  document.getElementById("focusProgress").textContent=(focusPractice?"练习 ":"")+(focusIdx+1)+" / "+focusQueue.length;
  // Front: word (or hint in hard mode) + phonetic + speaker + Chinese meaning
  if(st.hardMode){
    var hint=w.word.substring(0,2);
    var dots="";
    for(var i=2;i<w.word.length;i++)dots+="•";
    document.getElementById("fcWord").innerHTML='<span style="font-size:12px;color:var(--orange-d);display:block;margin-bottom:4px">困难词·已降低难度</span><span style="color:var(--ink)">'+hint+'</span><span style="color:var(--ink-ll)">'+dots+'</span>';
  }else{
    document.getElementById("fcWord").textContent=w.word;
  }
  document.getElementById("fcPhonetic").textContent=w.phonetic;
  document.getElementById("fcMeaningFront").textContent=w.pos+" "+w.meaning;
  // Back: example sentence with word highlighted + phonetic + coll
  document.getElementById("fcEx").innerHTML=highlightWord(w.ex||w.word,w.word);
  document.getElementById("fcExTrans").textContent=w.exCn||"";
  document.getElementById("fcPhoneticBack").textContent=w.word+"  "+w.phonetic;
  var collEl=document.getElementById("fcCollBack");
  if(w.coll){collEl.style.display="block";collEl.textContent="搭配："+w.coll;}
  else{collEl.style.display="none";}
  // TTS button - front (word)
  var speakBtn=document.getElementById("fcSpeakBtn");
  speakBtn.style.display="flex";
  speakBtn.innerHTML=ICONS.speaker;
  speakBtn.onclick=function(e){e.stopPropagation();flashSpeak(this);speak(w.word)};
  // TTS button - back (read whole example sentence)
  var speakBackBtn=document.getElementById("fcSpeakBackBtn");
  speakBackBtn.style.display="flex";
  speakBackBtn.innerHTML=ICONS.speaker;
  speakBackBtn.onclick=function(e){e.stopPropagation();flashSpeak(this);speak(w.ex||w.word)};
  focusFlipped=false;
  document.getElementById("fcInner").classList.remove("flipped");
}

function flipCard(){
  stopAllSound();
  focusFlipped=!focusFlipped;
  document.getElementById("fcInner").classList.toggle("flipped",focusFlipped);
}

function answerCard(state){
  stopAllSound();
  var id=focusQueue[focusIdx];
  // Practice mode: nothing is recorded, just review
  if(focusPractice){
    if(state==='know')focusStats.known++;
    else if(state==='fuzzy')focusStats.fuzzy++;
    else focusStats.unknown++;
    if(state!=='know'){
      // 未掌握/模糊：练习模式下再出现（最多3次）
      var cnt=0;
      for(var k=0;k<focusQueue.length;k++)if(focusQueue[k]===id)cnt++;
      if(cnt<3)focusQueue.push(id);
    }
    focusIdx++;
    renderFocusCard();
    return;
  }
  // 正式模式：记入进度
  markWord(id,state);
  if(state==='know'){
    focusStats.known++;
  }else if(state==='fuzzy'){
    focusStats.fuzzy++;
  }else{
    focusStats.unknown++;
    var st=getWordState(id);
    if(st.wrongToday<3)focusQueue.push(id);
  }
  focusIdx++;
  renderFocusCard();
}

function showCelebration(){
  stopAllSound();
  document.getElementById("view-focus").classList.remove("active");
  // Confetti
  var cel=document.getElementById("celebration");
  cel.classList.add("active");
  document.getElementById("celebrationTitle").textContent=focusPractice?"练习完成！":"今日单词已清零！";
  document.getElementById("celebrationSub").textContent=focusPractice?"本次练习未计入进度，温故而知新！":"坚持就是胜利，继续保持！";
  // Clear old confetti
  var oldConfetti=cel.querySelectorAll(".confetti");
  oldConfetti.forEach(function(c){c.remove()});
  // Create confetti
  var colors=["#FF8C42","#4CAF50","#1B2845","#E53935","#FFB07A"];
  for(var i=0;i<30;i++){
    var c=document.createElement("div");
    c.className="confetti";
    c.style.left=Math.random()*100+"%";
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDelay=Math.random()*0.5+"s";
    c.style.animationDuration=(1.5+Math.random())+"s";
    cel.appendChild(c);
  }
  document.getElementById("celebrationStats").innerHTML=
    '<div class="stat"><div class="stat-num">'+focusStats.known+'</div><div class="stat-label">已掌握</div></div>'+
    '<div class="stat"><div class="stat-num">'+focusStats.fuzzy+'</div><div class="stat-label">模糊</div></div>'+
    '<div class="stat"><div class="stat-num">'+focusStats.unknown+'</div><div class="stat-label">未掌握</div></div>'+
    '<div class="stat"><div class="stat-num">'+(focusStats.known+focusStats.fuzzy+focusStats.unknown)+'</div><div class="stat-label">总计</div></div>';
  if(!focusPractice)doCheckIn();
  renderTopbar();
  renderToday();
}

function closeCelebration(){
  document.getElementById("celebration").classList.remove("active");
  renderTopbar();
  renderToday();
}

// === PNG Export ===
function exportPNG(){
  var canvas=document.createElement("canvas");
  var W=540,H=960;
  canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext("2d");
  // Background
  ctx.fillStyle="#FBF7F0";ctx.fillRect(0,0,W,H);
  // Header
  ctx.fillStyle="#1B2845";ctx.fillRect(0,0,W,120);
  ctx.fillStyle="#FF8C42";ctx.font="bold 28px sans-serif";ctx.textAlign="center";
  ctx.fillText("四六级备考台",W/2,50);
  ctx.fillStyle="#FFF";ctx.font="14px sans-serif";
  ctx.fillText("今日战绩报告",W/2,80);
  var now=new Date();
  ctx.fillText(now.getFullYear()+"年"+(now.getMonth()+1)+"月"+now.getDate()+"日",W/2,105);

  // Daily quote（PNG 导出仅含寄语，不含倒计时）
  var q=getDailyQuote();
  // Quote
  ctx.fillStyle="#1B2845";ctx.font="bold 15px sans-serif";ctx.textAlign="center";
  // Wrap quote text
  var quoteText=q.text;
  var maxWidth=W-80;
  var words=quoteText.split("");
  var line="",lineY=175;
  for(var ci=0;ci<words.length;ci++){
    var testLine=line+words[ci];
    if(ctx.measureText(testLine).width>maxWidth&&line){
      ctx.fillText(line,W/2,lineY);lineY+=22;
      line=words[ci];
    }else{line=testLine}
  }
  if(line){ctx.fillText(line,W/2,lineY);lineY+=22}
  ctx.fillStyle="#FF8C42";ctx.font="13px sans-serif";
  ctx.fillText("—— "+q.author,W/2,lineY);lineY+=20;
  // 去掉倒计时，仅保留寄语
  var yPos=lineY+30;

  // Word stats
  var queue=getTodayQueue();
  var remaining=getRemainingQueue();
  var done=queue.length-remaining.length;
  ctx.fillStyle="#1B2845";ctx.font="bold 20px sans-serif";
  ctx.fillText("背词进度",W/2,yPos);
  ctx.fillStyle="#6B7A96";ctx.font="14px sans-serif";
  ctx.fillText(done+" / "+queue.length+" 已完成",W/2,yPos+25);
  // Progress bar
  var barY=yPos+40;
  ctx.fillStyle="#E8DFD3";ctx.fillRect(60,barY,W-120,16);
  ctx.fillStyle="#FF8C42";
  var barW=queue.length>0?(W-120)*(done/queue.length):0;
  ctx.fillRect(60,barY,barW,16);

  // Streak
  yPos=barY+40;
  ctx.fillStyle="#1B2845";ctx.font="bold 20px sans-serif";
  ctx.fillText("连续打卡 "+getConsecutiveDays()+" 天",W/2,yPos);

  // Dictation & Pronunciation stats
  var ds=B().dictStats,ps=B().pronStats;
  var dRate=ds.total>0?Math.round(ds.correct/ds.total*100):0;
  var pRate=ps.total>0?Math.round(ps.pass/ps.total*100):0;
  ctx.fillStyle="#1B2845";ctx.font="bold 20px sans-serif";
  ctx.textAlign="left";
  ctx.fillText(curBook().name+" · 默写与发音",40,yPos+40);
  ctx.font="14px sans-serif";
  var py=yPos+70;
  ctx.fillStyle="#6B7A96";ctx.fillText("默写正确率",40,py);
  ctx.fillStyle=dRate>=80?"#4CAF50":(dRate>=60?"#FF8C42":"#E53935");
  ctx.fillText(dRate+"% ("+ds.correct+"/"+ds.total+")",120,py);py+=28;
  ctx.fillStyle="#6B7A96";ctx.fillText("发音通过率",40,py);
  ctx.fillStyle=pRate>=80?"#4CAF50":(pRate>=60?"#FF8C42":"#E53935");
  ctx.fillText(pRate+"% ("+ps.pass+"/"+ps.total+")",120,py);py+=28;
  ctx.fillStyle="#6B7A96";ctx.fillText("生词本",40,py);
  ctx.fillStyle="#1B2845";ctx.fillText(B().mistakeBook.length+" 词",120,py);py+=28;
  ctx.fillStyle="#6B7A96";ctx.fillText("默写错词",40,py);
  ctx.fillStyle="#1B2845";ctx.fillText(B().dictBook.length+" 词",120,py);py+=28;
  ctx.fillStyle="#6B7A96";ctx.fillText("发音错词",40,py);
  ctx.fillStyle="#1B2845";ctx.fillText(B().pronBook.length+" 词",120,py);py+=28;

  // Heatmap
  ctx.fillStyle="#1B2845";ctx.font="bold 20px sans-serif";ctx.textAlign="left";
  ctx.fillText("近30天打卡热力图",40,py+10);
  var hmY=py+30;
  var hmData=getHeatmapData();
  var cellSize=Math.floor((W-80)/7);
  for(var i=0;i<hmData.length;i++){
    var row=Math.floor(i/7),col=i%7;
    var x=40+col*(cellSize+4),y=hmY+row*(cellSize+4);
    var colors=["#E8DFD3","#FFE0B2","#FFCC80","#FFB07A","#FF8C42"];
    ctx.fillStyle=colors[hmData[i].level];
    ctx.beginPath();ctx.roundRect(x,y,cellSize,cellSize,4);ctx.fill();
  }

  // Footer
  ctx.fillStyle="#6B7A96";ctx.font="12px sans-serif";ctx.textAlign="center";
  ctx.fillText("四六级备考台 · 坚持就是胜利",W/2,H-30);

  // Download
  var link=document.createElement("a");
  link.download="cet4_record_"+todayStr()+".png";
  link.href=canvas.toDataURL("image/png");
  link.click();
}

// === TTS ===
var ttsSupport=typeof window!=="undefined"&&"speechSynthesis"in window;
// 全局音频互斥：同一时刻只允许一个声音在播，新播放前先停掉所有发声源（原生/浏览器/在线），杜绝“重音”（双声重叠）
var _curAudio=null;
// 串流令牌：stopAllSound 递增令牌，进行中的串流(speakLocalSentence/speakOnline)
// 推进前检查令牌是否仍是自己，不是就停——否则翻转/切词后串流会绕过停止继续播下一段
var _ttsToken=0;
function stopAllSound(){
  _ttsToken++;
  try{if(typeof plus!=="undefined"&&plus.speech&&plus.speech.stopSpeaking)plus.speech.stopSpeaking();}catch(e){}
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  if(_curAudio){try{_curAudio.pause();_curAudio.src="";}catch(e){}_curAudio=null;}
}
// 缓存 voices，解决部分机型异步加载 getVoices 为空的问题
var _ttsVoices=[];
function refreshVoices(){
  try{if(window.speechSynthesis&&window.speechSynthesis.getVoices){_ttsVoices=window.speechSynthesis.getVoices()||[];}}catch(e){}
}
if(typeof window!=="undefined"&&window.speechSynthesis&&window.speechSynthesis.onvoiceschanged!==undefined){
  window.speechSynthesis.onvoiceschanged=refreshVoices;
}
refreshVoices();

// 原生朗读（APK 壳内 plus.speech）。注意：调用 startSpeaking 后需等待 success/fail 回调，
// 不能认为“发起调用就算成功”，否则荣耀/华为等机型会出现已开启 TTS 却仍报“无引擎”的误报。
function speakNative(text,lang,onFail){
  try{
    if(typeof plus!=="undefined"&&plus.speech&&plus.speech.startSpeaking){
      var handled=false;
      var failOnce=function(){
        if(handled)return;
        handled=true;
        if(onFail)onFail();
      };
      var timer=setTimeout(failOnce,900);
      var opts={
        lang:(lang||"en-US").replace(/-/g,"_"),
        rate:0.85,
        success:function(){
          clearTimeout(timer);
          handled=true;
        },
        fail:function(e){
          clearTimeout(timer);
          failOnce();
        }
      };
      // 部分 5+ 版本把 success/fail 放在第 3、4 个参数
      plus.speech.startSpeaking(text,opts,function(){
        clearTimeout(timer);handled=true;
      },function(e){
        clearTimeout(timer);failOnce();
      });
      return true;
    }
  }catch(e){}
  return false;
}

// 浏览器 speechSynthesis：voices 可能异步加载；失败自动兜底原生
function speakViaBrowser(text,lang,rate,onFail){
  if(typeof window==="undefined"||!("speechSynthesis"in window)){if(onFail)onFail();return false;}
  try{
    refreshVoices();
    var vs=_ttsVoices&&_ttsVoices.length?_ttsVoices:(window.speechSynthesis.getVoices?window.speechSynthesis.getVoices():[])||[];
    if(!vs.length){if(onFail)onFail();return false;}
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang=lang||"en-US";u.rate=rate||0.8;
    var fell=false;
    u.onerror=function(){if(!fell){fell=true;if(onFail)onFail();}};
    u.onend=function(){fell=true;};
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){if(onFail)onFail();return false;}
}

// 发音文本清洗：去掉重音符号/中文括号注释/特殊符号（与离线音频包文件名规则完全一致）
function pronWord(word){
  return String(word||"")
    .replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i")
    .replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/ç/g,"c")
    .replace(/（[^）]*）/g,"")
    .replace(/\([^)]*\)/g,"")
    .replace(/[^A-Za-z0-9' .-]/g," ")
    .replace(/\s+/g," ").trim();
}
// 离线音频文件名（与打包脚本一致）：apple.mp3 / o_clock.mp3 / cafe.mp3
function audioFileName(word){
  return pronWord(word).replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"").toLowerCase()+".mp3";
}
// 本地离线发音（APK 内置音频包）：_www/audio/<word>.mp3 → dataURL 秒播，彻底断网可用；无文件则回调 onFail 走在线
function speakLocal(word,onFail){
  if(!word||typeof plus==="undefined"||!plus.io){if(onFail)onFail();return false;}
  try{
    var fn=audioFileName(word);
    plus.io.resolveLocalFileSystemURL("_www/audio/"+fn,function(entry){
      entry.file(function(file){
        var fr=new plus.io.FileReader();
        fr.onloadend=function(ev){
          if(ev.target.error){if(onFail)onFail();return;}
          // dataURL 已就绪，音频应可播。play() Promise 在部分 WebView 会误判 reject
          // （音频实际在播），不能靠它触发兜底（会叠加=重音）。
          // 仅当 Audio 元素抛 onerror（真实解码/加载失败）才走在线兜底。
          try{
            var a=_curAudio=new Audio();
            a.src=ev.target.result;
            a.onerror=function(){if(onFail)onFail();};
            a.play();
          }catch(e){if(onFail)onFail();}
        };
        fr.readAsDataURL(file);
      },function(){if(onFail)onFail();});
    },function(){if(onFail)onFail();});
    return true;
  }catch(e){if(onFail)onFail();return false;}
}

// 本地离线读句子：把例句拆成单词，依次播放每个单词的本地音频。
// 只要例句里的词大多在离线包内，就能在断网/无 TTS 时把整句"拼读"出来。
function speakLocalSentence(text,onFail){
  if(!text||typeof plus==="undefined"||!plus.io){if(onFail)onFail();return false;}
  try{
    var raw=String(text).replace(/[^\u4e00-\u9fa5A-Za-z0-9\s']/g," ").replace(/\s+/g," ").trim();
    if(!raw){if(onFail)onFail();return false;}
    raw=raw
      .replace(/(\w)'m\b/g,"$1 am")
      .replace(/(\w)'re\b/g,"$1 are")
      .replace(/(\w)'ll\b/g,"$1 will")
      .replace(/(\w)'ve\b/g,"$1 have")
      .replace(/(\w)n't\b/g,"$1 not")
      .replace(/(\w)'d\b/g,"$1 would")
      .replace(/(\w)'s\b/g,"$1 is");
    var words=raw.split(/\s+/).filter(Boolean).map(function(w){return w.toLowerCase();}).filter(function(w){return !/^\d+$/.test(w);});
    if(!words.length){if(onFail)onFail();return false;}

    // 词形还原候选，覆盖三单/过去式/ing/最高级/副词等常见变化
    var LEMMA_STOP={this:1,thus:1,yes:1,pass:1,miss:1,boss:1,cross:1,loss:1,grass:1,glass:1,class:1,press:1,stress:1,dress:1,address:1,illness:1,kindness:1,darkness:1,happiness:1,sadness:1,weakness:1,sickness:1,fitness:1,gentleness:1,softness:1,hardness:1,carelessness:1,kindness:1};
    var IRREGULAR={
      was:"be",were:"be",been:"be",being:"be",am:"be",are:"be",
      has:"have",had:"have",does:"do",did:"do",done:"do",
      made:"make",makes:"make",went:"go",goes:"go",gone:"go",
      said:"say",says:"say",took:"take",takes:"take",taken:"take",taking:"take",
      got:"get",gets:"get",gotten:"get",came:"come",comes:"come",
      ran:"run",runs:"run",began:"begin",begins:"begin",begun:"begin",
      lost:"lose",loses:"lose",felt:"feel",feels:"feel",
      brought:"bring",brings:"bring",ate:"eat",eaten:"eat",eats:"eat",
      saw:"see",seen:"see",sees:"see",knew:"know",knows:"know",known:"know",
      thought:"think",thinks:"think",gave:"give",gives:"give",given:"give",
      found:"find",finds:"find",told:"tell",tells:"tell",
      became:"become",becomes:"become",left:"leave",leaves:"leave",
      put:"put",puts:"put",let:"let",lets:"let",cut:"cut",cuts:"cut",
      hit:"hit",hits:"hit",hurt:"hurt",hurts:"hurt",cost:"cost",costs:"cost",
      set:"set",sets:"set",shut:"shut",shuts:"shut",spread:"spread",spreads:"spread",
      burst:"burst",bursts:"burst",cast:"cast",casts:"cast",read:"read",reads:"read",
      best:"good",better:"good",worst:"bad",worse:"bad",least:"little",less:"little",
      most:"many",more:"many",farthest:"far",furthest:"far",farther:"far",further:"far",
      won:"win",wins:"win",met:"meet",meets:"meet",fell:"fall",falls:"fall",fallen:"fall",
      heard:"hear",hears:"hear",kept:"keep",keeps:"keep",spent:"spend",spends:"spend",
      led:"lead",leads:"lead",held:"hold",holds:"hold",sits:"sit",sat:"sit",
      stands:"stand",stood:"stand",understands:"understand",understood:"understand",
      teaches:"teach",taught:"teach",catches:"catch",buys:"buy",bought:"buy",
      sells:"sell",sold:"sell",pays:"pay",paid:"pay",sends:"send",sent:"send",
      builds:"build",built:"build",sends:"send",sent:"send",
      wins:"win",won:"win",bets:"bet",wets:"wet",fits:"fit",quits:"quit",
      cannot:"can","can't":"can"
    };
    var LY_TO_ADJ={simply:"simple",quickly:"quick",slowly:"slow",carefully:"careful",carelessly:"careless",easily:"easy",happily:"happy",sadly:"sad",angrily:"angry",loudly:"loud",quietly:"quiet",finally:"final",usually:"usual",really:"real",truly:"true",probably:"probable",thoroughly:"thorough",completely:"complete",recently:"recent",frequently:"frequent",suddenly:"sudden",greatly:"great",deeply:"deep",highly:"high",nearly:"near",hardly:"hard",badly:"bad",warmly:"warm",coldly:"cold",friendly:"friend"};
    function lemmaVariants(w){
      var list=[w];
      if(IRREGULAR[w])list.unshift(IRREGULAR[w]);
      if(LY_TO_ADJ[w])list.push(LY_TO_ADJ[w]);
      if(w.length>3&&!LEMMA_STOP[w]){
        if(/ies$/.test(w))list.push(w.replace(/ies$/,"y"));
        if(/(ch|sh|s|x|o)es$/.test(w))list.push(w.slice(0,-2));
        if(/[^s]s$/.test(w))list.push(w.slice(0,-1));
      }
      if(w.length>4){
        if(/ied$/.test(w))list.push(w.replace(/ied$/,"y"));
        if(/ed$/.test(w)){list.push(w.slice(0,-2));list.push(w.slice(0,-1));}
      }
      if(w.length>4){
        if(/ing$/.test(w)){list.push(w.slice(0,-3));if(/(.)(.)\2ing$/.test(w))list.push(w.slice(0,-4));}
      }
      if(w==="having")list.push("have");
      return list;
    }

    var idx=0,failed=0,done=false;
    var myToken=_ttsToken;
    var maybeFail=function(){if(!done&&failed>=words.length){done=true;if(onFail)onFail();}};
    function playNext(){
      if(done||_ttsToken!==myToken)return;
      if(idx>=words.length){done=true;return;}
      var w=words[idx++];
      var variants=lemmaVariants(w);
      function tryVariant(vi){
        if(done)return;
        if(vi>=variants.length){failed++;maybeFail();playNext();return;}
        var fn=audioFileName(variants[vi]);
        plus.io.resolveLocalFileSystemURL("_www/audio/"+fn,function(entry){
          entry.file(function(file){
            var fr=new plus.io.FileReader();
            fr.onloadend=function(ev){
              if(ev.target.error||!ev.target.result){tryVariant(vi+1);return;}
              try{
                var a=_curAudio=new Audio();
                a.src=ev.target.result;
                var advanced=false;
                var goNext=function(){if(advanced)return;advanced=true;playNext();};
                a.onended=goNext;
                a.onerror=function(){if(advanced)return;advanced=true;failed++;maybeFail();playNext();};
                var pr=a.play&&a.play();
                if(pr&&pr.then){
                  // play() 在部分 WebView 会误 reject（音频实际在播）；
                  // 不立即推进（避免词叠词重音）。延迟后检测 currentTime：
                  // 在播(>0)就等 onended，没播(==0)才推进（防卡死）
                  pr.then(function(){},function(){
                    setTimeout(function(){
                      if(advanced)return;
                      try{if(a.currentTime>0&&!a.ended)return;}catch(e){}
                      goNext();
                    },800);
                  });
                }else{
                  // 无 Promise 老机型：靠 onended/onerror，加超时防卡死
                  setTimeout(function(){
                    if(advanced)return;
                    try{if(a.currentTime>0&&!a.ended)return;}catch(e){}
                    goNext();
                  },1500);
                }
              }catch(e){tryVariant(vi+1);}
            };
            fr.readAsDataURL(file);
          },function(){tryVariant(vi+1);});
        },function(){tryVariant(vi+1);});
      }
      tryVariant(0);
    }
    playNext();
    setTimeout(maybeFail, words.length*1500+500);
    return true;
  }catch(e){if(onFail)onFail();return false;}
}

// 在线发音兜底：完全不依赖系统 TTS，用网络播放标准发音（有道→百度→Google 轮换）。
// 只要手机有网就能响，是安卓 WebView TTS 地狱的最终方案。
// 2026-08-26 增强：支持长句/例句分段串流播放（句子拆成 ≤60 字符的片段依次播）。
function speakOnline(text,lang,onFail){
  if(!text){if(onFail)onFail();return false;}
  try{
    var isZh=(lang&&lang.indexOf("zh")>=0);
    var cleaned=String(text).replace(/[''’]/g,"").replace(/\s+/g," ").trim();
    if(!cleaned){if(onFail)onFail();return false;}
    // 中文直接整段播放；英文先按标点分句，再按 ≤60 字符分段
    var chunks=[];
    if(isZh){
      chunks.push(cleaned);
    }else{
      var raw=cleaned.split(/([.!?;]+)/).filter(Boolean);
      var sentences=[];
      for(var i=0;i<raw.length;i++){
        if(/^[.!?;]+$/.test(raw[i])){
          if(sentences.length)sentences[sentences.length-1]+=raw[i];
        }else{sentences.push(raw[i]);}
      }
      for(var s=0;s<sentences.length;s++){
        var words=sentences[s].split(/\s+/).filter(Boolean);
        var cur="";
        for(var i=0;i<words.length;i++){
          var w=words[i];
          if((cur?cur.length+1:0)+w.length>60){
            if(cur)chunks.push(cur);
            cur=w;
          }else{
            cur=cur?cur+" "+w:w;
          }
        }
        if(cur)chunks.push(cur);
      }
    }
    if(!chunks.length){if(onFail)onFail();return false;}

    var chunkIdx=0,srcIdx=0,done=false,everPlayed=false;
    var myToken=_ttsToken;
    var finalFail=function(){if(!done&&!everPlayed){done=true;if(onFail)onFail();}};

    function playNext(){
      if(done||_ttsToken!==myToken)return;
      if(chunkIdx>=chunks.length){done=true;return;}
      var chunk=chunks[chunkIdx];
      var srcs;
      if(isZh){
        srcs=["https://fanyi.baidu.com/gettts?lan=zh&text="+encodeURIComponent(chunk)+"&spd=4&source=web"];
      }else{
        srcs=[
          "https://dict.youdao.com/dictvoice?audio="+encodeURIComponent(chunk)+"&type=2",
          "https://fanyi.baidu.com/gettts?lan=en&text="+encodeURIComponent(chunk)+"&spd=3&source=web"
        ];
      }
      function trySrc(){
        if(done||_ttsToken!==myToken||srcIdx>=srcs.length){
          chunkIdx++;srcIdx=0;
          if(chunkIdx>=chunks.length){finalFail();return;}
          playNext();return;
        }
        var a=_curAudio=new Audio();
        var tid=setTimeout(function(){clearTimeout(tid);srcIdx++;trySrc();},6000);
        a.onended=function(){
          clearTimeout(tid);
          everPlayed=true;
          chunkIdx++;srcIdx=0;
          playNext();
        };
        a.onerror=function(){clearTimeout(tid);srcIdx++;trySrc();};
        try{
          a.src=srcs[srcIdx++];
          var pr=a.play&&a.play();
          if(pr&&pr.then){pr.then(function(){},function(){clearTimeout(tid);srcIdx++;trySrc();});}
        }catch(e){clearTimeout(tid);srcIdx++;trySrc();}
      }
      trySrc();
    }
    playNext();
    return true;
  }catch(e){if(onFail)onFail();return false;}
}

function speak(word){ stopAllSound(); speakViaBrowser(word,"en-US",0.8,function(){toast("当前浏览器没有可用的英文语音");}); }
function speakCN(text){ stopAllSound(); speakViaBrowser(text,"zh-CN",0.9,function(){toast("当前浏览器没有可用的中文语音");}); }

// === Event Bindings ===
function bindEvents(){
  // Start focus
  document.getElementById("startFocusBtn").onclick=openFocus;
  // Book switcher
  document.getElementById("bookSwitchBtn").onclick=openBookPicker;
  document.getElementById("bookSwitchBtnM").onclick=openBookPicker;
  document.getElementById("bookOverlay").onclick=function(e){if(e.target===this)closeBookPicker()};
  document.getElementById("restartFocusBtn").onclick=restartFocus;
  // Confirm dialog buttons
  document.getElementById("confirmOkBtn").onclick=function(){closeConfirmDialog(true)};
  document.getElementById("confirmCancelBtn").onclick=function(){closeConfirmDialog(false)};
  document.getElementById("confirmOverlay").onclick=function(e){if(e.target===this)closeConfirmDialog(false)};
  // Focus card flip
  document.getElementById("focusCard").onclick=flipCard;
  // Focus buttons
  document.getElementById("faKnow").onclick=function(){answerCard('know')};
  document.getElementById("faFuzzy").onclick=function(){answerCard('fuzzy')};
  document.getElementById("faDont").onclick=function(){answerCard('dont')};
  document.getElementById("focusCloseBtn").onclick=closeFocus;
  document.getElementById("celebrationClose").onclick=closeCelebration;
  // Pronunciation overlay skip
  document.getElementById("pronSkipBtn").onclick=function(e){e.preventDefault();e.stopPropagation();skipPronCheck()};
  // PNG export
  document.getElementById("exportPngBtn").onclick=exportPNG;
  // Dictation buttons
  document.getElementById("startDictBtn").onclick=startDictation;
  document.getElementById("dictQuitBtn").onclick=quitDictation;
  document.getElementById("dictSubmitBtn").onclick=submitDictation;
  document.getElementById("dictInput").addEventListener("keydown",function(e){
    if(e.key==="Enter"){e.preventDefault();submitDictation()}
  });
  // Mistake tabs (3 tabs: words/dict/pron)
  document.querySelectorAll(".mistake-tab").forEach(function(tab){
    tab.onclick=function(){
      document.querySelectorAll(".mistake-tab").forEach(function(t){t.classList.remove("active")});
      tab.classList.add("active");
      var tabName=tab.dataset.tab;
      document.getElementById("mistakeWordsPanel").style.display=tabName==="words"?"block":"none";
      document.getElementById("mistakeDictPanel").style.display=tabName==="dict"?"block":"none";
      document.getElementById("mistakePronPanel").style.display=tabName==="pron"?"block":"none";
    };
  });
  // Settings
  function onNewPerDayChange(){
    var el=this;
    var v=parseInt(el.value)||10;
    v=Math.max(1,Math.min(48,v));
    var old=S.newPerDay;
    if(v===old){el.value=old;return}
    el.value=old; // restore until confirmed
    confirmDialog("修改每日新词数","确定将每日新词数从 "+old+" 改为 "+v+" 吗？\n"+(v>old?"今日将立即补充新词。":"新数量从明天开始生效，今天已推出的词保留。"),function(){
      S.newPerDay=v;Store.save();
      document.getElementById("newPerDayInput").value=v;
      pushNewWordsIfNeeded();
      renderToday();
      if(v>old){toast("每日新词数已改为 "+v+"，今日已补充新词")}
      else{toast("每日新词数已改为 "+v+"，明天生效")}
    },function(){
      el.value=old;
    });
  }
  document.getElementById("newPerDayInput").onchange=onNewPerDayChange;
  document.getElementById("newPerDayInput").onblur=onNewPerDayChange;
  // Export
  document.getElementById("exportBtn").onclick=function(){
    var blob=new Blob([Store.exportJSON()],{type:"application/json"});
    var link=document.createElement("a");
    link.download="cet4_backup_"+todayStr()+".json";
    link.href=URL.createObjectURL(blob);
    link.click();
  };
  // Import
  document.getElementById("importBtn").onclick=function(){document.getElementById("importFile").click()};
  document.getElementById("importFile").onchange=function(e){
    var file=e.target.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(){
      if(Store.importJSON(reader.result)){
        loadState();renderAll();alert("导入成功！");
      }else{alert("导入失败，文件格式错误。")}
    };
    reader.readAsText(file);
  };
  // Clear samples
  document.getElementById("clearSamplesBtn").onclick=function(){
    if(confirm("确定仅清除示例数据？您的个人数据将保留。")){
      Store.clearSamples();loadState();renderAll();
    }
  };
  // Clear all
  document.getElementById("clearAllBtn").onclick=function(){
    document.getElementById("clearConfirm").classList.add("show");
    document.getElementById("clearInput").focus();
  };
  document.getElementById("clearCancelBtn").onclick=function(){
    document.getElementById("clearConfirm").classList.remove("show");
    document.getElementById("clearInput").value="";
  };
  document.getElementById("clearConfirmBtn").onclick=function(){
    if(document.getElementById("clearInput").value==="清空"){
      Store.clearAll();loadState();ensureBook(curBookId(),function(){renderAll()});
      document.getElementById("clearConfirm").classList.remove("show");
      document.getElementById("clearInput").value="";
      alert("数据已清空，示例数据已重置。");
    }else{
      alert('请输入"清空"以确认操作。');
    }
  };
  // Window resize
  window.addEventListener("resize",function(){});
}

// === Init ===
function init(){
  loadState();
  S.currentView="today";
  bindEvents();
  // 词库已拆包：先异步装载当前词库再渲染。
  // 首次需联网加载一次，之后 Service Worker 缓存命中，秒开且断网可用。
  // 注：不再自动播种示例数据——避免伪造打卡与错本污染真实学习进度。
  ensureBook(curBookId(),function(){
    renderAll();
  });
}

// roundRect polyfill
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    this.beginPath();
    this.moveTo(x+r,y);
    this.arcTo(x+w,y,x+w,y+h,r);
    this.arcTo(x+w,y+h,x,y+h,r);
    this.arcTo(x,y+h,x,y,r);
    this.arcTo(x,y,x+w,y,r);
    this.closePath();
    return this;
  };
}

// Start
init();
// PWA: register service worker for offline use


Object.assign(window,{retryBookLoad,switchView,speak,retryPron,removePronMistake,removeFromMistakeBook,removeDictMistake});
