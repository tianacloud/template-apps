
window.addEventListener('error',function(e){var s=document.getElementById('status');if(s)s.textContent='出错了：'+(e.message||e.error);});
// ===== 离线识别引擎（纯规则，无外部依赖，预览/浏览器都能跑）=====
const VERB_LEX = new Set(("be is am are was were been being have has had do does did make makes made help helps take takes took get gets got give gives gave use uses used buy buys bought sell sells sold show shows showed need needs needed want wants like likes love loves know knows go goes went come comes came see sees saw find finds found keep keeps kept put push pull open opens close closes create creates build builds built run runs play plays work works start starts stop stops change changes grow grows become became feel feels felt think thinks say says said tell tells told ask asks answer hope wish believe learn learns learned teach teaches teach read reads write writes speak speaks talk talks listen listens hear hears watch watches look seem appear appears remain stay leave leaves join lead leads follow call turn move pay cost include offer provide receive accept choose chose decide expect explain suggest mention describe mean require allow belong contain produce deliver improve reduce increase develop design order orders ordered sleep sleeps sit sat eat ate drink drank drive drove fall fell feed fed fight fought fly flew forget forgot freeze froze bring brought break broke begin began bend bent bleed bled blow blew catch caught deal dealt dig dug draw drew dream dreamt dream feed fed feel felt fight fought find found fly flew forget forgot forgive forgave freeze froze get got give gave go went grow grew hang hung hear heard hide hid hit hit hold held hurt hurt keep kept know knew lead led learn learnt learned leave left lend lent let let lie lay light lit lose lost make made mean meant meet met pay paid read read ride rode ring rang rise rose run ran say said see saw sell sold send sent show showed shut shut sing sang sink sank sit sat sleep slept speak spoke spend spent stand stood steal stole stick stuck swim swam take took teach taught tear tore tell told think thought throw threw understand understood wake woke wear wore win won write wrote").split(" "));
const NOUN_LEX = new Set(("bracelet pack crystal stone order customer shop seller hand book word sentence story video film drama audience reader writer business price quality design color size weight material energy power system method plan problem solution result effect cause reason change growth speed level team user app website page content message signal sound light image friend family home world city country language skill habit pack product sleep night day water time money farmer mother boy cat apple banana pen mat book hand face eye head arm leg tree car dog food house room school teacher student child woman man person people place thing way fact number name letter line end start point side part top bottom front back ring mask girl parent village education cousin tribe honor luck custom center graduate society course life anxiety calm clasp wholesale necklace jewelry gemstone bead chain charm sister brother daughter son wife husband father grandfather grandmother uncle aunt baby daughter child kid student village town street road market store brand style shape texture scent fragrance wellness healing comfort peace mind body spirit soul heart handmade artisan gift present").split(" "));
const AUX = new Set(["is","am","are","was","were","been","being","be","has","have","had","do","does","did","will","would","can","could","should","may","might","must","shall"]);
const PRON = new Set(["i","he","she","it","we","you","they","me","him","her","us","them","my","your","our","their","his"]);
const ART = new Set(["the","a","an","this","that","these","those"]);
const CONJ = new Set(["because","if","when","although","though","since","that","which","who","whom","where","why","while","after","before","until","unless","as"]);
const QWORD = new Set(["what","who","whom","whose","which","where","when","why","how"]);
const COORD = new Set(["and","or","but","so"]);
const HELPVB = new Set(["help","make","let","have","watch","see","hear","feel","notice"]);
// help/make/let 类命中判断：兼容第三人称 helps / 过去式 made 等（HELPVB 存原形）
const helpBase = v=>{ if(!v) return false; if(HELPVB.has(v)) return true; let b=v; if(/(?:ches|shes|xes|zes|sses)$/.test(b)) b=b.slice(0,-2); else if(/s$/.test(b)) b=b.slice(0,-1); return HELPVB.has(b); };
const PREP = new Set(["at","in","on","during","for","by","of","to","from","with","about","into","over","under","after","before","between","through","across","against","among","around","without","within","upon","toward","along","behind","beside","beyond","near","off","up","down","out","inside","outside","alongside","besides","despite","except","towards","beneath","throughout","unlike","instead","amid"]);
const ADV_WORDS = new Set(["very","also","just","often","always","now","then","really","never","sometimes","usually","secretly","quietly","here","there","away","back","again","still","already","yet","soon","later","together","instead","however","therefore","thus","meanwhile","otherwise","almost","even","only","well","fast","hard","late","early","elsewhere","anywhere","everywhere","somehow","barely","hardly","nearly","scarcely","finally","suddenly","probably","simply","clearly","exactly","mostly"]);
const TIME_NOUN = new Set(["night","day","year","morning","evening","afternoon","week","month"]);
const TIME_DET = new Set(["every","each","last","next","this","that","these","those","one","all","most","some","any"]);
const DET_PRON = new Set(["my","your","our","their","his","her","its"]);
const ADJ_SET = new Set(("beautiful important good bad big small young old new happy sad red blue white black handmade healing quiet loud clean dirty rich poor safe dangerous free ready able smart kind warm cold hot bright dark strong weak soft hard fast slow easy difficult true false right wrong open closed full empty early late heavy light long short wide narrow tall").split(" "));
const NOUN_SUF = /(?:tion|ment|ness|ity|ship|ist|ance|ence|logy|age|dom)$/;
function nounBase(l){ if(NOUN_LEX.has(l))return true; if(/ies$/.test(l)){ if(NOUN_LEX.has(l.slice(0,-3)+"y")) return true; } if(/(?:ches|xes|ses|zes)$/.test(l)){ if(NOUN_LEX.has(l.slice(0,-2))) return true; } if(/s$/.test(l)&&!/ss$/.test(l)){ if(NOUN_LEX.has(l.slice(0,-1))) return true; } return false; }
function isNounLike(w){const l=w.toLowerCase();if(ART.has(l))return false;if(nounBase(l))return true;if(NOUN_SUF.test(l))return true;if(/^[A-Z]/.test(w)&&!QWORD.has(l)&&!AUX.has(l)&&!PRON.has(l))return true;return false;}
function isPron(w){return PRON.has(w.toLowerCase());}
function baseOf(l){if(VERB_LEX.has(l))return l;let b=l.replace(/^(.*?)ies$/,"$1y");if(VERB_LEX.has(b))return b;if(/ed$/.test(l)){b=l.slice(0,-2);if(VERB_LEX.has(b))return b;b=l.slice(0,-1);if(VERB_LEX.has(b))return b;}b=l.replace(/(.+[^s])s$/,"$1");if(VERB_LEX.has(b))return b;b=l.replace(/(.+[^s])es$/,"$1");if(VERB_LEX.has(b))return b;return null;}
function heuristicVerb(w){const l=w.toLowerCase();if(ADJ_SET.has(l))return false;if(/(?:ing|ed|en)$/.test(l)&&l.length>3&&!NOUN_LEX.has(l))return true;if(baseOf(l))return true;return false;}
// 缩写/所有格归一：isn't→is, girl's→girl, don't→do, 're→are ...
function normWord(t){let s=t.toLowerCase().replace(/^'/,"");if(s.endsWith("n't"))s=s.slice(0,-3);else if(s.endsWith("'s"))s=s.slice(0,-2);else if(s.endsWith("'re"))s="are";else if(s.endsWith("'m"))s="am";else if(s.endsWith("'ve"))s="have";else if(s.endsWith("'ll"))s="will";else if(s.endsWith("'d"))s="had";return s;}
// 纯助动词（永远不提升为主干谓语）；系词/拥有动词（满足条件才提升）
const AUX_NEVER_MAIN = new Set(["do","does","did","will","would","can","could","should","may","might","must","shall"]);
const BE_HAVE = new Set(["is","am","are","was","were","be","been","being","has","have","had"]);
const RELPRON = new Set(["who","which","that"]);
// -ing 结尾但其实是形容词的词（is interesting 是系表，不是进行时）
const ING_ADJ = new Set(["interesting","boring","exciting","tiring","amazing","charming","confusing","frightening","disappointing","satisfying","relaxing","amusing","willing","cunning","daring","striking","misleading"]);
const ABBR=new Set(["mr","mrs","ms","dr","prof","st","jr","sr","vs","etc","inc","ltd","no","phd","jr","sen"]);
// 软分句：整段文字若完全没有终止符（.!?;），按"小写收尾词 + 大写开头新词"的启发式插入句边界
// 纯规则方案，有少量误伤（专有名词紧挨时可能断错），故做成可关的总开关 autoSplit
function softSplit(block){
  if(!autoSplit) return [block];
  if(/[.!?;]/.test(block)) return [block];            // 已有硬终止符，交给硬切，不动
  const toks=block.split(/\s+/).filter(Boolean);
  if(toks.length<6) return [block];                    // 太短不软切，避免误伤
  const cuts=[];
  for(let i=1;i<toks.length;i++){
    const cur=toks[i].replace(/[^A-Za-z']/g,""), prev=toks[i-1].replace(/[^A-Za-z']/g,"");
    if(!cur||!prev) continue;
    // 当前词大写开头 + 不是 I + 不是缩写；前一词小写收尾（即前面是英文词、无标点）→ 视为新句起点
    if(/^[A-Z]/.test(cur) && cur!=="I" && !ABBR.has(cur.toLowerCase()) && /[a-z]$/.test(prev)) cuts.push(i);
  }
  if(!cuts.length) return [block];
  const out=[]; let last=0;
  cuts.forEach(i=>{ out.push(toks.slice(last,i).join(" ")); last=i; });
  out.push(toks.slice(last).join(" "));
  return out;
}
// 口语缩写还原（gonna/wanna 一家子）：引擎内展开成标准词再拆解；显示端标 (=还原) 提示
// disp=显示用的完整形式；zh=整块中文义；toks=展开后的标准词（第一个词带 origTok 标记，其余 hide 不再单独显示）
const SPOKEN_CONTRACTIONS={
  "gonna":{disp:"going to",zh:"将要",toks:["going","to"]},
  "wanna":{disp:"want to",zh:"想要",toks:["want","to"]},
  "gotta":{disp:"got to / have got to",zh:"必须",toks:["got","to"]},
  "kinda":{disp:"kind of",zh:"有点儿",toks:["kind","of"]},
  "sorta":{disp:"sort of",zh:"有点儿",toks:["sort","of"]},
  "outta":{disp:"out of",zh:"从…出来",toks:["out","of"]},
  "lotta":{disp:"lot of",zh:"很多",toks:["lot","of"]},
  "lotsa":{disp:"lots of",zh:"很多",toks:["lots","of"]},
  "lemme":{disp:"let me",zh:"让我",toks:["let","me"]},
  "gimme":{disp:"give me",zh:"给我",toks:["give","me"]},
  "dunno":{disp:"don't know",zh:"不知道",toks:["do","not","know"]},
  "ya":{disp:"you",zh:"你",toks:["you"]},
  "c'mon":{disp:"come on",zh:"来吧",toks:["come","on"]},
  "gotcha":{disp:"got you",zh:"明白了",toks:["got","you"]},
  "betcha":{disp:"bet you",zh:"肯定",toks:["bet","you"]},
  "'cause":{disp:"because",zh:"因为",toks:["because"]},
  "ain't":{disp:"am/is/are not",zh:"不是",toks:["are","not"]}
};
function analyzeLex(text){
  // 切句：常规"句号+空格"切分 + 修复"句号后没空格"（books.She → 两句）；排除 Mr./Dr./单字母缩写
  const sents = text.split(/(?<=[.!?])\s+/).filter(s=>s.trim()).flatMap(s=>{
    const out=[]; let last=0, m;
    const re=/[.!?](?=[A-Z])/g;
    while((m=re.exec(s))){
      const seg=s.slice(last,m.index);
      const prevWord=(seg.match(/([A-Za-z']+)\s*$/)||[])[1]||"";
      if(prevWord.length>1 && !/^(mr|mrs|ms|dr|prof|st|jr|sr|vs|etc|inc|ltd|no)$/i.test(prevWord)){
        out.push(s.slice(last,m.index+1)); last=m.index+1;
      }
    }
    out.push(s.slice(last));
    return out;
  }).filter(s=>s.trim()).flatMap(b=>b.split(';').map(s=>s.trim()).filter(Boolean)).flatMap(softSplit);
  return sents.map(s=>{
    const rawToks = s.match(/[\w']+|[^\w\s]/g)||[];
    const toks = [];
    for(const t of rawToks){
      // 口语缩写还原：gonna→going to 等，整块显示为 gonna(=going to)，展开词只译不显
      const SC=SPOKEN_CONTRACTIONS[t.toLowerCase()];
      if(SC){ SC.toks.forEach((et,k)=>{ toks.push(k===0?{w:et,origTok:t,disp:SC.disp,zf:SC.zh}:{w:et,hide:true}); }); continue; }
      // 缩略词展开：isn't→is not，won't→will not，he's→he is，they're→they are …
      if(/n't$/i.test(t)){ const h=t.slice(0,-3).toLowerCase(); toks.push(({wi:"will",ca:"can",wo:"will"}[h]||h), "not"); continue; }
      if(/'re$/i.test(t)){ toks.push(t.slice(0,-3).toLowerCase()==="a"?"are":t.slice(0,-3), "are"); continue; }
      if(/'ll$/i.test(t)){ toks.push(t.slice(0,-3).toLowerCase()==="wi"?"will":t.slice(0,-3), "will"); continue; }
      if(/'ve$/i.test(t)){ toks.push(t.slice(0,-3).toLowerCase()==="wo"?"would":t.slice(0,-3), "have"); continue; }
      if(/'d$/i.test(t)){ toks.push(t.slice(0,-3).toLowerCase()==="he"?"he":t.slice(0,-3), "would"); continue; }
      toks.push(t);
    }
    const words = toks.map(tk=>{
      const isObj=(typeof tk==="object");
      const t=isObj?tk.w:tk;
      let clean=t.replace(/[^\w']/g,"");
      let poss=false;
      if(/'s?$/.test(clean)){ clean=clean.replace(/'s?$/,""); poss=true; }   // girls' / boy's → 所有格，译文补「的」
      return {text:t,clean,poss,base:normWord(clean),
        orig:isObj&&tk.origTok?{tok:tk.origTok,disp:tk.disp}:null,
        expHide:!!(isObj&&tk.hide),
        zhForce:isObj?(tk.zf!=null?tk.zf:(tk.hide?"":null)):null,   // 口语缩写整块中文义；展开尾巴词置空
        role:"extra",sub:"",vnum:0,idx:0};
    }).filter(w=>w.clean);
    if(!words.length) return {raw:s, words};
    // 1) 收集本句所有主要动词：词库动词 + 系词/have（右侧无紧接实义动词时提升为主干）+ 启发式兜底
    let verbIdxs=[];
    words.forEach((w,i)=>{ const b=w.base;
      if(AUX_NEVER_MAIN.has(b)) return;                       // do/will/can 等纯助动词，永远不当谓语
      if(BE_HAVE.has(b)){                                     // is/are/was/have/had：系词/助词/拥有动词
        let j=i+1; while(j<words.length && (ART.has(words[j].base)||words[j].clean===","||words[j].base==="not"||ADV_WORDS.has(words[j].base))) j++;
        const nxt=j<words.length?words[j]:null;
        // 进行时：be + V-ing → be 是助动词，-ing 实义动词才是谓语
        if(nxt && /ing$/.test(nxt.base) && heuristicVerb(nxt.clean) && !NOUN_LEX.has(nxt.base) && !ADJ_SET.has(nxt.base) && !TIME_NOUN.has(nxt.base) && !ING_ADJ.has(nxt.base)){
          verbIdxs.push(j); return;
        }
        const hasRightVerb = nxt && (nxt.role==="verb"||nxt.role==="verb2"||VERB_LEX.has(nxt.base)||baseOf(nxt.base));
        if(hasRightVerb) return;                              // 进行/被动/疑问句里的助动词，不提升
        verbIdxs.push(i); return;
      }
      if(VERB_LEX.has(b)||baseOf(b)){
        if(nounBase(b)){
          let pj=i-1; while(pj>=0 && (words[pj].clean===","||ART.has(words[pj].base)||/^[();:]$/.test(words[pj].clean))) pj--; const prev = pj>=0?words[pj].base:"";
          if(ADJ_SET.has(prev)||prev==="better"||prev==="more"||prev==="less") return;   // better sleep 等：前接形容词 → 名
          // 冠词/所有格后的歧义词且其后紧跟另一个名词 → 复合名词（the sleep mask / our ring X），不当动词
          const immPrev=(i-1>=0)?words[i-1].base:"";
          if(ART.has(immPrev)||DET_PRON.has(immPrev)){ let nj=i+1; while(nj<words.length&&(ART.has(words[nj].base)||words[nj].clean===","))nj++; if(nj<words.length&&isNounLike(words[nj].clean)) return; }
        }
        verbIdxs.push(i);
      }
    });
    // 系词优先级：同一句存在 be/have 系词时，去掉兼类名词的动词候选（our ring is → ring 当名词，is 当谓语）
    if(verbIdxs.some(vi=>BE_HAVE.has(words[vi].base))){
      verbIdxs = verbIdxs.filter(vi=>BE_HAVE.has(words[vi].base) || !NOUN_LEX.has(words[vi].base));
    }
    if(!verbIdxs.length){ words.forEach((w,i)=>{ if(AUX_NEVER_MAIN.has(w.base)) return; if(heuristicVerb(w.clean)) verbIdxs.push(i); }); }
    if(!verbIdxs.length){ words.forEach((w,i)=>{ if(AUX_NEVER_MAIN.has(w.base)){ for(let j=i+1;j<Math.min(i+4,words.length);j++){ const c=words[j].clean; if((VERB_LEX.has(c.toLowerCase())||heuristicVerb(c))&&!AUX_NEVER_MAIN.has(c.toLowerCase())){ verbIdxs.push(j); break; } } } }); }
    if(!verbIdxs.length) return {raw:s, words};
    // 2) 编号：第 1 个 = 谓语（实线）；第 2 个及以后 = 动词（虚线）
    verbIdxs.forEach((vi,k)=>{ words[vi].role=(k===0)?"verb":"verb2"; words[vi].vnum=k+1; });
    // 3) 为每个动词在从句内独立找 主语（左）/ 宾语（右）；支持复合主谓宾（Tom and Jerry / apples and bananas）
    verbIdxs.forEach((vi,k)=>{
      const leftStart=(k===0)?0:verbIdxs[k-1]+1;
      const rightEnd=(k<verbIdxs.length-1)?verbIdxs[k+1]:words.length;
      const vnum=k+1;
      let subjCands=[], prepBreak=-1, verbBreak=-1, lastOf=-1;
      for(let i=vi-1;i>=leftStart;i--){
        const c=words[i].clean, cl=words[i].base;
        if(CONJ.has(cl)){
          if((cl==="who"||cl==="which"||cl==="that") && i>leftStart){   // 关系代词：前一个名词（先行词）作本动词主语
            let p=i-1; while(p>=leftStart && (words[p].clean===","||ART.has(words[p].base))) p--;
            if(p>=leftStart) subjCands.push(p);   // 关系代词前的名词即先行词（作从句主语）
          }
          break;
        }
        if(QWORD.has(cl)) break;
        if(PREP.has(cl)){
          if(cl==="to" && i+1<words.length && (VERB_LEX.has(words[i+1].base)||baseOf(words[i+1].base))) continue;  // 不定式 to：跳过继续找主语（are allowed to get 的主语还是 they）
          if(cl==="of"){ lastOf=i; continue; }               // of 短语是名词内部结构（the color of the ring → 主语是 color），可跨
          prepBreak=i; break;                                // 其他介词前不跨（among boys 不是主语）
        }
        if(c===";") break;                                 // 分号分段：不跨从句抢主语
        if(AUX.has(cl)||DET_PRON.has(cl)||COORD.has(cl)) continue;   // 助动词/所有格代词/并列连词 不抢主语位
        if(/^[();:]$/.test(c)) continue;
        if(words[i].role==="verb"||words[i].role==="verb2"){ if(verbBreak<0) verbBreak=i; continue; }  // 跨过前一个动词（继承其主语）
        if(cl==="there"||cl==="here") continue;            // there/here 是引导词/副词，不当主语
        if(isPron(c)||isNounLike(c)){ if(!ART.has(cl)) subjCands.push(i); }
      }
      // of 短语：候选里有 of 之前的名词（真正中心词）时，丢掉 of 之后的（of 的宾语）
      if(lastOf>=0 && subjCands.some(ix=>ix<lastOf)) subjCands=subjCands.filter(ix=>ix<lastOf);
      // 跨过前一个动词时：动词之前的候选只继承"已经是主语"的（likes coffee → coffee 不当 likes 的主语）
      if(verbBreak>=0){
        let coordAfterVerb=false;
        for(let q=verbBreak+1;q<vi;q++){ if(COORD.has(words[q].clean.toLowerCase())){ coordAfterVerb=true; break; } }
        subjCands=subjCands.filter(ix=> ix>verbBreak || (!coordAfterVerb && words[ix].role==="subj"));
      }
      // 左边界卡在介词上：介词后面的名词只是介词宾语，不配当主语（among boys, and is missing → 主语继承前句）
      if(prepBreak>=leftStart && subjCands.length && subjCands.every(ix=>ix>prepBreak)) subjCands.length=0;
      const objCands=[];
      for(let i=vi+1;i<rightEnd;i++){
        const c=words[i].clean, cl=words[i].base;
        if(CONJ.has(cl)) break;
        if(PREP.has(cl) && cl!=="by" && !/^(up|off|down|away|back|out|over|through|for|about)$/.test(cl)) break;  // 介词短语独立；短语动词小品词(by/up/for…)后名词仍作宾语
        if(c===";") break;                                 // 分号分段
        if(/^[();:]$/.test(c)) continue;
        if(isPron(c)||isNounLike(c)){
          if(DET_PRON.has(cl)){   // her female cousins：所有格代词后面跟着名词时是定语，不当宾语
            let det=false;
            for(let j=i+1;j<Math.min(i+4,words.length);j++){
              const nl=words[j].base;
              if(AUX.has(nl)||VERB_LEX.has(nl)||baseOf(nl)||PREP.has(nl)) break;
              if(isNounLike(words[j].clean)&&!ART.has(nl)){ det=true; break; }
            }
            if(det) continue;
          }
          if(!ART.has(cl)){
            let pj=i-1; while(pj>=leftStart && (words[pj].clean===","||ART.has(words[pj].base)||/^[();:]$/.test(words[pj].clean))) pj--;
            const prev = pj>=leftStart ? words[pj].base : "";
            const clBase = (/s$/.test(cl)&&!/ss$/.test(cl)) ? cl.slice(0,-1) : cl;
            if(!(TIME_NOUN.has(clBase) && (TIME_DET.has(prev)||PREP.has(prev)))) objCands.push(i);   // every night / at night 等时间状语不当宾语
          }
        }
      }
      subjCands.sort((a,b)=>a-b); objCands.sort((a,b)=>a-b);
      // 去掉名词修饰语：一个名词紧跟（无并列连词）另一个名词 → 它是修饰语，丢（crystal pack 只留 pack）
      const dropMods = arr=>{
        const keep=[];
        for(let p=0;p<arr.length;p++){
          const i=arr[p]; const isN=!isPron(words[i].clean);
          if(isN && p+1<arr.length){
            let hasCoord=false;
            for(let q=i+1;q<arr[p+1];q++){ if(COORD.has(words[q].clean.toLowerCase())){ hasCoord=true; break; } }
            const nextIsN=!isPron(words[arr[p+1]].clean);
            if(nextIsN && !hasCoord) continue;
          }
          keep.push(i);
        }
        return keep;
      };
      const prevVerb = (k>0)? words[verbIdxs[k-1]].clean.toLowerCase() : "";
      const isHelpPat = k>0 && helpBase(prevVerb);
      let keptSubj = dropMods(subjCands);
      // 左偏置话题（A girl child, ..., she is...）：最靠近动词的是人称代词、前面的名词是话题 → 话题让位
      for(let p=keptSubj.length-1;p>=0;p--){
        const wi=keptSubj[p];
        if(!isPron(words[wi].clean)) break;
        if(p>0){
          const pw=keptSubj[p-1];
          if(!isPron(words[pw].clean)){
            let hasCoord=false;
            for(let x=pw+1;x<wi;x++){   // 只有紧挨两个候选的 and/or（Tom and I）才算并列；隔了长修饰串（child, ... nine or ten ..., she）不算
              if(COORD.has(words[x].clean.toLowerCase()) && (x-pw<=2 || wi-x<=2)){ hasCoord=true; break; }
            }
            let q=wi-1; while(q>=0&&words[q].clean===",") q--;
            const lw=q>=0?words[q].clean.toLowerCase():"";
            const leftIsVerb = q>=0 && (words[q].role==="verb"||words[q].role==="verb2"||VERB_LEX.has(lw)||baseOf(lw)||heuristicVerb(lw));   // which I bought 从句内不动
            if(!hasCoord && !leftIsVerb) keptSubj=keptSubj.slice(p);
          }
        }
        break;
      }
      keptSubj.forEach(i=>{
        if(isHelpPat && words[i].role==="obj") return;   // help/make/let + 人 + 动词：人已是前一动词宾语，不抢当本动词主语
        if(words[i].role==="subj") return;               // 已被主句/其他动词认领，不重复抢（关系代词共用主语）
        if(words[i].role==="obj"){
          // 兼类：它已是前面动词的宾语，同时又被关系代词 who/which/that 引导的定语从句当作主语
          // → 两种身份都保留，不覆盖宾语位；从句主语身份用 relSubj 小字标注，避免单标丢失信息
          words[i].relSubj = true;
          words[i].relSubjVnum = vnum;
          return;
        }
        words[i].role="subj"; words[i].vnum=vnum;
      });
      dropMods(objCands).forEach(i=>{
        if(words[i].role==="subj"||words[i].role==="verb"||words[i].role==="verb2") return;
        words[i].role="obj"; words[i].vnum=vnum;
      });
    });
    // There be 句型：there 是引导词不占主语位，be 后面的名词才是真正主语
    if(words[0].base==="there" && verbIdxs.length && BE_HAVE.has(words[verbIdxs[0]].base) && (words[verbIdxs[0]].role==="verb"||words[verbIdxs[0]].role==="verb2")){
      words.forEach(w=>{ if(w.role==="obj" && w.vnum===1) w.role="subj"; });
    }
    // 4) 序号：同 vnum 内的主/宾，从左到右标 ①②③（只有 ≥2 个才显示）
    [["subj"],["obj"]].forEach(([role])=>{
      const groups={};
      words.forEach(w=>{ if(w.role===role && w.vnum){ (groups[w.vnum]=groups[w.vnum]||[]).push(w); } });
      Object.values(groups).forEach(list=>{ if(list.length>1) list.forEach((w,n)=>w.idx=n+1); });
    });
    // 5) 挂件细分（sub 子类型，纯展示，不影响主干 role 判定）
    words.forEach((w,i)=>{
      if(w.role!=="extra") return;
      const l=w.clean.toLowerCase();
      if(ART.has(l)) w.sub="art";
      else if(DET_PRON.has(l)) w.sub="adj";   // 所有格代词：定语（他的/她的…）
      else if(/^(every|each|some|any|no|all|both|either|neither|another)$/.test(l)) w.sub="art";  // 限定词
      else if(PREP.has(l)){
        if(l!=="by" && /^(up|off|down|away|back|out|over|through)$/.test(l)){   // by 永远不是小品词；仅典型副词性小品词标 part
          const left=i>0?words[i-1]:null;
          if(left && (left.role==="verb"||left.role==="verb2"||VERB_LEX.has(left.base))){ w.sub="part"; return; }  // 动词紧邻的小品词 = 短语动词
        }
        w.sub="prep"; return;
      }
      else if(COORD.has(l)) w.sub="coord";
      else if(CONJ.has(l)) w.sub="conj";
      else if(ADJ_SET.has(l)||l==="better"||l==="more"||l==="less") w.sub="adj";
      else if(ADV_WORDS.has(l)||(/ly$/.test(l)&&l.length>4)) w.sub="adv";
    });
    return {raw:s, words};
  });
}
function analyzeNLP(text){
  const doc = nlp(text); const sents = doc.sentences(); const res=[];
  sents.forEach(s=>{
    let terms=[];
    try{ terms = s.terms().data(); }catch(e){ try{ terms = s.json({terms:{tags:true}}); }catch(e2){ terms=[]; } }
    if(!terms||!terms.length){ res.push(null); return; }
    const words=[]; let mainVerbIdx=-1;
    terms.forEach((t,i)=>{
      const txt=(t.text||"").trim(); if(!txt) return;
      const tags=t.tags||{}; const isV=tags.Verb&&!tags.Auxiliary;
      const isN=tags.Noun||tags.ProperNoun||tags.Pronoun;
      if(isV&&mainVerbIdx<0) mainVerbIdx=i;
      words.push({text:txt,role:"extra",isN,isV});
    });
    words.forEach((w,i)=>{
      if(i===mainVerbIdx){w.role="verb";return;}
      if(w.isN){ w.role=(mainVerbIdx<0||i<mainVerbIdx)?"subj":"obj"; }
      else if(w.isV&&mainVerbIdx<0){ w.role="verb"; mainVerbIdx=i; }
    });
    if(mainVerbIdx<0) words.forEach(w=>{if(w.role==="subj")w.role="extra";});
    res.push({raw:s.text||s.out("text"), words});
  });
  return res;
}
function analyze(text){
  if(typeof nlp!=="undefined"){
    try{ const r=analyzeNLP(text); if(r.length&&r.some(x=>x&&x.words.length)) return {rows:r.filter(Boolean),engine:"compromise NLP（联网更准）"}; }catch(e){}
  }
  return {rows:analyzeLex(text), engine:"内置词典（离线）"};
}

function tenseOf(v){
  if(!v) return "（未识别到动词）";
  const l=v.toLowerCase();
  if(/(?:ed)$/.test(l)&&!/(?:red|led)$/.test(l)|| l==="was"||l==="were") return "一般过去时（动作已发生）";
  if(/(?:ing)$/.test(l)) return "进行时（be + 动词-ing）或动名词";
  if(/(?:s)$/.test(l)&&!/(?:ss)$/.test(l)) return "一般现在时·第三人称单数";
  return "一般现在时 / 动词原形";
}
function explain(row){
  const subj=row.words.filter(w=>w.role==="subj").map(w=>w.clean);
  const verb=row.words.filter(w=>w.role==="verb").map(w=>w.clean);
  const obj =row.words.filter(w=>w.role==="obj").map(w=>w.clean);
  const v2  =row.words.filter(w=>w.role==="verb2").map(w=>w.clean);
  const extras=row.words.filter(w=>w.role==="extra").map(w=>w.clean);
  const li=[];
  const v0=verb[0]||"";
  const isBe=AUX.has(v0)&&/^(is|am|are|was|were|be)$/.test(v0);
  // 系表
  if(isBe){
    const adjR=extras.find(w=>ADJ_SET.has(w.toLowerCase()));
    if(adjR) li.push(`<b>系表结构</b>：${v0} 是系动词（不是动作），后面的形容词 <b>${adjR}</b> 是<b>表语</b>（说明主语"怎么样"），不是宾语。这句没有宾语——结构是 主语 + 系动词 + 表语，不是 SVO。`);
  }
  // There be 句型
  const isThereBe = row.words[0] && row.words[0].base==="there" && verb.length && /^(is|am|are|was|were|be)$/.test(verb[0].toLowerCase().replace(/n't$/,""));
  if(isThereBe) li.push(`<b>There be 句型</b>：there 只是引导词（"有/存在着"），<b>不占主语位</b>。真正的主语是 be 后面的名词 <b style="color:var(--teal)">${subj.join("、")||"—"}</b>。`);
  // 被动：动词是 -ed/-en 分词 且其左边紧挨 was/were
  let passive=false;
  row.words.forEach((w,i)=>{ const c=w.clean.toLowerCase();
    if(!/(?:ed|en)$/.test(c) || ADJ_SET.has(c) || w.role==="subj") return;   // 只要 -ed/-en 分词，左邻是 be 即为被动（不要求它是谓语位）
    const prev=row.words[i-1]; if(prev && /^(is|are|was|were|am|be|been)$/i.test(prev.clean)) passive=true; });
  if(passive){
    li.push(`<b>被动语态</b>：主语（${subj.join("、")||"—"}）是动作的<b>承受者</b>，by 后面的词（${obj.join("、")||"—"}）才是动作发出者。主干仍是 承受者 + 动词 + (by 发出者)。`);
  }
  if(!isBe) li.push(`句型：英语靠<b>词序</b>定角色。主干 = <b style="color:var(--teal)">主语</b>(谁) + <b style="color:var(--amber)">谓语</b>(做啥) + <b style="color:var(--violet)">宾语</b>(对谁/对啥)。`);
  const voice = passive ? "被动语态" : "主动语态";
  li.push(`时态 / 语态：${tenseOf(v0)}（主动词 <b style="color:var(--amber)">${v0||"—"}</b>）· 本句为 <b>${voice}</b>。`);
  // 疑问
  if(row.words[0] && QWORD.has(row.words[0].clean.toLowerCase())){
    li.push(`<b>疑问句</b>：句首疑问词 <b>${row.words[0].clean}</b>（what/how…）是提前的成分，真正主语在助动词之后。主干看"主语 + 动词"即可。`);
  }
  // 从句
  const conj=extras.find(w=>CONJ.has(w.toLowerCase()));
  if(conj) li.push(`含从属连词 <b>${conj}</b>：后面带一个从句（原因/条件/时间等）。拆主干时先把整段从句括起来，只看主句（${subj.join("、")||"—"} + ${v0} + ${obj.join("、")||"—"}）就够了。`);
  // 多主谓宾 / 复合主谓宾
  const totalV = verb.length + v2.length;
  const subjN = subj.length, objN = obj.length;
  if(totalV>1) li.push(`本句有 <b>${totalV} 个主谓宾结构</b>：<b>结构①</b> = 实线<b>谓语</b>那组，先当主干；结构②及以后是<b>动词</b>（虚线，从句 / 补语），先当挂件看。`);
  if(subjN>1) li.push(`<b>复合主语</b>：${subj.join("、")} 用 ① ② 标出 —— 几个主语共同发出同一个动作（"和"连接）。`);
  if(objN>1) li.push(`<b>复合宾语</b>：${obj.join("、")} 用 ① ② 标出 —— 动作同时作用于几个对象（"和"连接）。`);
  if(helpBase(v0) && v2.length && obj.length) li.push(`<b>${v0} + 人 + 动词</b> 结构（help/make/let 类）：${v0} 后面先接<b>人</b>（<b style="color:var(--violet)">${obj.join("、")}</b>，是 ${v0} 的宾语），再接动词（${v2.join("、")}，虚线）。这个"人"既是 ${v0} 的宾语、又是后面动作的执行者——所以标成宾语，不当第二个结构的主语。`);
  const adjs=extras.filter(w=>ADJ_SET.has(w.toLowerCase())||/^(handmade|healing|young|old|new|good|bad|big|small|beautiful|important|red|blue|white|black)$/i.test(w));
  if(adjs.length && !isBe) li.push(`定语：灰色词 ${adjs.join("、")} 贴着名词，是修饰名词的形容词（"什么样的 X"）。`);
  const advs=extras.filter(w=>/^(better|secretly|very|also|just|often|always|now|then)$/i.test(w));
  if(advs.length) li.push(`状语：灰色词 ${advs.join("、")} 是副词，修饰动词或形容词（"怎么地 / 到什么程度"）。`);
  const prep=extras.filter(w=>/^(at|in|on|with|for|of|to|from|by|about|into)$/i.test(w));
  if(prep.length) li.push(`介词短语：以 ${prep.join("、")} 开头的灰色片段作状语或定语（"时间 / 方式 / 对象"）。`);
  li.push(`规律：动词左边是主语、右边是宾语。抓住动词，整句就立住了——灰色挂件先不管。`);
  li.push(`<b>成分中英对照</b>：主语=谁/什么（青）；谓语=动作（琥珀·实线）；宾语=动作承受者（紫）；定语=修饰名词的"…的"（形容词/名词，浅绿）；状语=修饰动词的"…地/时间/方式"（副词/介词短语，浅橙/浅青）；补语=对主/宾的补充（表语·被动 by 后·help 后的动词）。先抓「主+谓+宾」主干，定状补先括起来。`);
  return li;
}
// 结构速览（plaintext 代码块，配图例格式：结构①/② + 箭头注释）
function structPlain(row){
  const sup=n=>String.fromCharCode(0x2460+n-1);
  const groups={};
  row.words.forEach(w=>{ if(w.vnum && (w.role==="subj"||w.role==="verb"||w.role==="verb2"||w.role==="obj")){ (groups[w.vnum]=groups[w.vnum]||{subj:[],verb:[],obj:[]}); const g=groups[w.vnum]; if(w.role==="subj")g.subj.push(w); if(w.role==="verb"||w.role==="verb2")g.verb.push(w); if(w.role==="obj")g.obj.push(w); } });
  const v0=(row.words.find(w=>w.role==="verb")||{}).clean||"";
  const isHelp=helpBase(v0);
  const tag=w=> w.role==="subj" ? "主语"+(w.idx?sup(w.idx):"")
             : w.role==="verb" ? "谓语·实线"
             : w.role==="verb2" ? "动词·虚线"
             : "宾语"+(w.idx?sup(w.idx):"")+"·紫";
  const lines=[];
  lines.push({left:"▶ "+row.words.map(w=>w.text).join(" "), note:""});
  Object.keys(groups).sort((a,b)=>a-b).forEach(v=>{
    const g=groups[v];
    const parts=g.subj.map(w=>w.clean+"("+tag(w)+")")
      .concat(g.verb.map(w=>w.clean+"("+tag(w)+")"))
      .concat(g.obj.map(w=>w.clean+"("+tag(w)+")"));
    const note = v==="1" ? "← 主干"
      : (isHelp && !g.verb.some(w=>w.role==="verb") ? "← "+v0+" 后面的补语" : "← 从句/补语");
    lines.push({left:"  结构"+sup(+v)+": "+parts.join(" + "), note});
  });
  // 挂件行：只显示 介词短语 / 副词 / 从句（从属连词起），拒绝把 the/and 之类的散词平铺
  const ADV_SET=/^(secretly|quietly|very|also|just|often|always|now|then|really|never|sometimes|usually|better)$/i;
  const conjX=row.words.findIndex(w=>w.role==="extra"&&CONJ.has((w.clean||"").toLowerCase()));
  const stop=conjX>=0?conjX:row.words.length;
  let segs=[],cur=null;
  row.words.forEach((w,i)=>{
    if(w.role!=="extra"||i>=stop){ cur=null; return; }
    const c=(w.clean||"").toLowerCase();
    if(PREP.has(c)){ cur={type:"prep",items:[w]}; segs.push(cur); }
    else if(cur){ cur.items.push(w); }
    else if(ADV_SET.test(c)){ cur={type:"adv",items:[w]}; segs.push(cur); }
  });
  segs.forEach(s=>{
    const txt=s.items.map(w=>w.text||w.clean).join(" ");
    const last=(s.items[s.items.length-1].clean||"").toLowerCase().replace(/s$/,"");
    const label=s.type==="prep" ? (TIME_NOUN.has(last)?"时间状语":"状语") : "副词";
    lines.push({left:"  "+txt+" = "+label+"（挂件，灰色）", note:""});
  });
  if(conjX>=0){
    const txt=row.words.slice(conjX).map(w=>w.text).join(" ");
    lines.push({left:"  "+txt+" = 从句（先当挂件，拆主干不看）", note:""});
  }
  const wpx=s=>{let n=0;for(const ch of s)n+=ch.charCodeAt(0)>0x2e7f?2:1;return n;};
  const withNote=lines.filter(l=>l.note);
  const width=withNote.length?Math.max(...withNote.map(l=>wpx(l.left)))+2:0;
  return lines.map(l=>l.left+(l.note?" ".repeat(Math.max(1,width-wpx(l.left)))+l.note:"")).join("\n");
}
const PREP_ZH={in:"在",at:"在",on:"在",of:"的",with:"和",for:"给",from:"从",by:"被",about:"关于",into:"进入",over:"在",under:"在",after:"在",before:"在",between:"在",through:"穿过",across:"穿过",against:"靠着",among:"在",around:"在",without:"没有",within:"在",upon:"在",toward:"朝",along:"沿着",behind:"在",beside:"在",beyond:"在",near:"靠近",off:"离开",up:"向上",down:"向下",out:"向外"};
const REL_ZH={who:"（…的）",which:"（…的）",that:"（…的）"};
function buildToks(row){          // 把一句拆成「已定稿中文义」的词流（含 be/被动/there be/关系从句等结构处理），供 通顺 / 意群 两种渲染复用
  const ws=row.words.filter(w=>w.clean);
  if(!ws.length) return [];
  const toks=ws.map(w=>{
    const l=w.clean.toLowerCase(); const g=(typeof w.zhForce==="string")?w.zhForce:glossOf(l,w).zh;   // 多义词按成分取义项；口语缩写块用整块中文义
    const g0=g?g.split("/")[0]:"";                             // 通顺/意群只取首个义项，不把「/」漏进译文
    return {raw:w.clean,l,zh:(typeof w.zhForce==="string")?g0:(g0||w.clean),zhForce:(typeof w.zhForce==="string")?w.zhForce:null,poss:w.poss||false,role:w.role||"",sub:w.sub||"",
      isArt:ART.has(l)||/^(this|that|these|those|every|each|some|any|no|all|both|either|neither|another)$/.test(l),
      isBe:/^(be|is|are|was|were|been|am)$/.test(l),
      isRelpron:CONJ.has(l)&&/^(who|which|that)$/.test(l),
      isBy:l==="by",isThere:l==="there",isPrep:PREP.has(l),isCoord:COORD.has(l),isConj:CONJ.has(l),
      unk: !g0 && !(ART.has(l)||/^(this|that|these|those|every|each|some|any|no|all|both|either|neither|another)$/.test(l)||/^(be|is|are|was|were|been|am)$/.test(l)||PREP.has(l)||COORD.has(l)||CONJ.has(l)||/^(who|which|that)$/.test(l)||l==="to"||l==="not"),   // 无中文义的内容词 → 未收录标记（功能词/派生词不标）
      attached:false,skip:false};
  });
  toks.forEach((t,i)=>t.enIdx=i);   // 原始词序标记：英文意群按此排序还原原文顺序（不被被动/关系从句重排影响）
  // be 功能：passive(be+ed/en分词或动词) / prog(be+ing) / link(系词) / aux(there be 的 be)
  for(let i=0;i<toks.length;i++){
    if(!toks[i].isBe) continue;
    let j=i+1;
    while(j<toks.length){
      const tj=toks[j];
      if(tj.isArt || /ly$/.test(tj.l) || ADV_WORDS.has(tj.l) || tj.sub==="adv" || tj.l==="not") j++;
      else break;
    }
    const nx=toks[j];
    if(!nx){ toks[i].beFunc="link"; if(toks[i].zhForce==null) toks[i].zh="是"; continue; }
    if(nx.l==="born"){ toks[i].beFunc="aux"; continue; }       // was born → be 不出声，「出生」自成动词
    if(nx.l==="about"){ toks[i].beFunc="aux"; continue; }       // was about to → be 不出声，about 译「即将」
    const isIng=/ing$/.test(nx.l), isEd=/ed$/.test(nx.l)||/en$/.test(nx.l);
    const isVerb=nx.role==="verb"||nx.role==="verb2"||VERB_LEX.has(nx.l)||baseOf(nx.l);
    if(isIng){ toks[i].beFunc="prog"; nx.role="verb"; }
    else if(isEd||isVerb){ toks[i].beFunc="passive"; nx.role="verb"; }   // 被动/进行分词补 verb 角色，意群模式好当谓语锚点
    else { toks[i].beFunc="link"; if(toks[i].zhForce==null) toks[i].zh="是"; }
  }
  // 关系副词 where（前词是名词→「那里」）；be about to → about 译「即将」，后续 to 不出声
  for(let i=1;i<toks.length;i++){
    const t=toks[i];
    if(t.l==="where"){ const p=toks[i-1]; if(!p.isArt&&!p.isPrep&&(p.role==="subj"||p.role==="obj"||NOUN_LEX.has(p.l))) t.zh="那里"; }
    if(t.l==="about"&&toks[i-1].isBe){ t.zh="即将"; const n1=toks[i+1]; if(n1&&n1.l==="to"){ n1.zh=""; } }
  }
  // there：句首或连词之后 + 紧邻 be → 存在句「有/没有」；作动词地点宾语（如 sat there）→ 地点状语「那里」
  for(let i=0;i<toks.length;i++){ if(toks[i].isThere){
    let prevC=false;
    for(let k=i-1;k>=0;k--){ const tk=toks[k]; if(tk.skip) continue; if(tk.isCoord||tk.isConj||tk.isRelpron) prevC=true; break; }
    const existential = prevC || i===0;
    if(existential){
      let beIdx=-1, notFound=false;
      for(let j=i+1;j<toks.length;j++){ const tj=toks[j]; if(tj.isCoord||tj.isConj||tj.isRelpron) break; if(tj.l==="not"){ notFound=true; continue; } if(tj.isBe){ beIdx=j; break; } }
      if(beIdx>=0){ toks[beIdx].beFunc="aux"; if(notFound){ for(let j=i+1;j<toks.length;j++){ if(toks[j].l==="not") toks[j].zh=""; } } }
      toks[i].zh = notFound ? "没有" : "有";
    } else { toks[i].zh = "那里"; }
  } }
  // 被动：by + 施事 前移到紧邻的被动分词前 → "被…"（整块标记为 attached，意群模式随最近动词成块）
  for(let i=0;i<toks.length;i++){ if(toks[i].isBy){
    const prev=toks[i-1];
    let target;
    if(prev && (prev.role==="verb"||prev.role==="verb2"||/ed$/.test(prev.l)||/en$/.test(prev.l)||prev.sub==="part")) target=i-1;
    else { for(let k=i-1;k>=0;k--){ if(toks[k].role==="verb"||toks[k].role==="verb2"){ target=k; break; } } }
    if(target!==undefined){
      // 施事 = by 之后到动词/连词/介词为止；中间冠词/副词跳过
      let end=i+1;
      while(end<toks.length){
        const t=toks[end];
        if(t.isArt||t.sub==="adv"||ADV_WORDS.has(t.l)){ end++; continue; }
        if(t.isCoord||t.isConj||t.isThere||t.isBe||t.isPrep||t.role==="verb"||t.role==="verb2") break;
        end++;
      }
      const agent=toks.slice(i+1,end).filter(t=>!t.isArt && t.sub!=="adv" && !ADV_WORDS.has(t.l));
      const block=[{zh:"被",l:"by",attached:true,enIdx:toks[i].enIdx}, ...agent.map(a=>({...a,attached:true}))];   // 被 + 施事（英文保留 by，中文更顺；enIdx 取 by 原词位，英文意群按此落回原位）
      toks.splice(i, end-i);                   // 删掉 by + 施事短语
      toks.splice(target, 0, ...block);        // 把「被+施事」插到被动态动词之前
      let vIdx=-1; for(let k=target;k<toks.length;k++){ const t=toks[k]; if((t.role==="verb"||t.role==="verb2") || (t.l && (/ed$/.test(t.l)||/en$/.test(t.l)))){ vIdx=k; break; } }
      if(vIdx>=0){ const v=toks[vIdx]; if(v.zh.endsWith("的")) v.zh=v.zh.slice(0,-1)+"了"; else if(!/[了着过]$/.test(v.zh)) v.zh=v.zh+"了"; }   // 被动动词补「了」（已带「的」的形容词分词转成「了」）
    }
  } }
  // 关系从句前置到先行词前（边界：到下一个谓语 / 并列连词 / 从属连词为止）；整块标记为 attached，意群模式随最近主干（主/宾）成块
  for(let i=0;i<toks.length;i++){ if(toks[i].isRelpron){
    let end=i+1, seenPred=false;
    while(end<toks.length){
      const t=toks[end];
      if(t.isCoord||t.isConj) break;
      if(t.isBe||t.role==="verb"||t.role==="verb2"||/ing$/.test(t.l)||/ed$/.test(t.l)){ if(seenPred) break; seenPred=true; }
      end++;
    }
    const block=toks.splice(i,end-i); block[0].zh=""; block.push({zh:"的",isArt:false}); block.forEach(t=>t.attached=true);   // 关系代词不单独成词，定语尾补"的"
    let ant=-1; for(let k=i-1;k>=0;k--){ if(toks[k].role==="subj"||toks[k].role==="obj"){ ant=k; break; } }
    toks.splice(ant>=0?ant:i,0,...block);
  } }
  // 末处理：定冠词跳过 / be功能词跳过 / 介词短式 / 占位点 / every·instead·about 收口；并标 skip
  for(let i=0;i<toks.length;i++){ const t=toks[i];
    if(t.skip) continue;
    if(t.isArt && t.l!=="every"){ t.skip=true; continue; }                                       // 冠词跳过；every 要输出成「每」
    if(t.beFunc==="passive"||t.beFunc==="prog"||t.beFunc==="aux"){ t.skip=true; continue; }     // 进行/被动/there be 的 be 不输出
    if(t.isPrep && t.l!=="about" && t.zhForce==null) t.zh=PREP_ZH[t.l]||t.zh;    // about 在 be 之后译「即将」，不让 PREP_ZH 覆盖成「关于」；缩写块义不被覆盖
    if(t.zh && t.zh.indexOf("…")>=0) t.zh=t.zh.slice(0,t.zh.indexOf("…"));                       // 去「在…里」占位点，连写才像中文
    if(t.l==="every") t.zh="每";                                                                // 每夜/每天，不写「每个」
    if(t.l==="instead") t.zh="而不是";
    if(t.l==="about" && i>0 && toks[i-1].isBe) t.zh="即将";                                      // be about to → 即将
  }
  return toks;
}
function spacedZh(t){ return /^[A-Za-z']+$/.test(t.zh) ? " "+t.zh+" " : (t.poss ? t.zh+"的" : t.zh); }
const CLOTHING_NOUN=new Set(["shirt","dress","hat","coat","coats","jacket","jackets","glasses","shoe","shoes","pant","pants","skirt","skirts","suit","tie","scarf","gloves","glove","sock","socks","boot","boots","shorts","sweater","jeans","uniform","cap","helmet","clothes","cloth"]);
const COLOR_WORD=new Set(["red","blue","green","black","white","yellow","brown","pink","purple","orange","gray","grey"]);
const DEG_ZH=new Set(["更好","更多","更少","较好","较多","较少"]);
function isCN(t){ return !t.skip && t.zh && !/^[A-Za-z']+$/.test(t.zh); }
// 通顺译文中文语序重排：让英文直译顺序更贴近中文表达（仅作用于 通顺 模式，意群/逐词视图仍用英文原序）
function reorderZhForCN(src){
  let a=src.map(t=>({...t}));
  // 1) in + 衣物/颜色 → 前置定语「穿X的」，移到中心名词前（避免误译作地点状语「在…」）
  for(let i=0;i<a.length;i++){
    const t=a[i];
    if(!(t.isPrep && t.l==="in")) continue;
    let j=i+1; const obj=[];
    while(j<a.length){
      const x=a[j];
      if(x.isCoord||x.isConj||x.isRelpron||x.isPrep) break;
      if(x.role==="verb"||x.role==="verb2") break;
      if(x.skip && !isCN(x)){ obj.push(j); j++; continue; }
      if(!isCN(x)) break;
      obj.push(j); j++;
    }
    if(!obj.length) continue;
    const lastObj=a[obj[obj.length-1]];
    const isCloth=CLOTHING_NOUN.has(lastObj.l)||(obj.length===1&&COLOR_WORD.has(lastObj.l));
    if(!isCloth) continue;
    for(const idx of obj){ if(COLOR_WORD.has(a[idx].l) && /的$/.test(a[idx].zh)) a[idx].zh=a[idx].zh.slice(0,-1); } // 颜色+衣物：红色的衬衫→红衬衫
    let head=-1;
    for(let k=i-1;k>=0;k--){ const x=a[k]; if(x.skip) continue; if(x.role==="subj"||x.role==="obj"||isNounLike(x.l)||NOUN_LEX.has(x.l)){ head=k; break; } if(x.isPrep||x.isCoord||x.isConj) break; }
    if(head<0) continue;
    a[i].zh="穿";
    lastObj.zh=(lastObj.zh||lastObj.l)+"的";
    const end=obj[obj.length-1];
    const block=a.slice(i,end+1);
    const out=[]; for(let k=0;k<a.length;k++){ if(k>=i&&k<=end) continue; out.push(a[k]); }
    const hi=head<i?head:head-(end-i+1);
    out.splice(hi,0,...block);
    a=out; i=-1;
  }
  // 2) 程度副词(better/more/less) + 时间介词短语(at/in/on + 时间词) → 时间挪到动词前（睡觉更好在夜晚 → 在夜晚睡觉更好）
  for(let i=0;i<a.length;i++){
    const t=a[i];
    if(!isCN(t)||!DEG_ZH.has(t.zh)) continue;
    let p=-1,pEnd=-1;
    for(let k=i+1;k<a.length;k++){
      const x=a[k];
      if(x.isCoord||x.isConj) break;
      if(x.isPrep&&(x.l==="at"||x.l==="in"||x.l==="on")){
        let m=k+1; while(m<a.length&&a[m].skip) m++;
        if(m<a.length&&TIME_NOUN.has(a[m].l)){ p=k; pEnd=m; break; }
      }
      if(x.role==="verb"||x.role==="verb2") break;
    }
    if(p<0) continue;
    let v=-1;
    for(let k=i-1;k>=0;k--){ const x=a[k]; if(x.role==="verb"||x.role==="verb2"){ v=k; break; } if(x.isCoord||x.isConj) break; }
    if(v<0) continue;
    const block=a.slice(p,pEnd+1);
    const out=[]; for(let k=0;k<a.length;k++){ if(k>=p&&k<=pEnd) continue; out.push(a[k]); }
    const vi=v<p?v:v-(pEnd-p+1);
    out.splice(vi,0,...block);
    a=out; i=-1;
  }
  return a;
}
function translate(row){           // 通顺：按中文逻辑连写成一整句
  const toks=reorderZhForCN(buildToks(row));
  const out=[];
  for(const t of toks){
    if(t.skip) continue;
    if(t.unk){ out.push(' <span class="unk" title="未收录：词库暂无此词，可加入生词本">'+esc(t.l)+'</span> '); continue; }   // 未收录词：灰点线标出，不混进译文当错翻
    if(!t.zh) continue;
    out.push(spacedZh(t));
  }
  let txt=out.join("");                  // 中文连写，不再逐词空格
  txt=txt.replace(/ +/g," ").trim();     // 查不到的英文词所留空格合并、去首尾
  txt=txt.replace(/的+/g,"的");          // 合并相邻冗余的「的」
  if(txt.endsWith("的")) txt=txt.slice(0,-1);   // 去掉句尾孤立的「的」
  return txt;
}
function groupChunks(row){         // 意群分块核心：返回 [{idxs:[原词序号...], zh:"块中文"}]；英文按 enIdx 还原原文序，中文按流序连写。供 意群译文 与 全文概览英文行 复用
  const toks=buildToks(row);
  const clsOf=t=> t.isCoord?"C": t.isConj?"C": t.isPrep?"P": t.role==="subj"?"S": (t.role==="verb"||t.role==="verb2")?"V": t.role==="obj"?"O":"A";
  const chunks=[];                  // 每块 = piece 数组；piece={enIdx, zh}（enIdx=null 的 piece 只有中文，如关系从句尾的「的」）
  let cur=null;
  const flush=()=>{ if(cur && cur.length) chunks.push(cur); cur=null; };
  const ensure=()=>{ if(!cur) cur=[]; return cur; };
  let i=0;
  while(i<toks.length){
    const t=toks[i];
    if(t.attached){                 // 关系从句 / 被字块：整段当原子单元，连同紧接的主干（名/动）并入同一意群
      const run=[];
      while(i<toks.length && toks[i].attached){ run.push(toks[i]); i++; }
      const c=ensure();
      for(const x of run) c.push({enIdx:x.enIdx, zh:x.zh});
      continue;
    }
    const cls=clsOf(t);
    if(t.skip || (t.zh==="" && cls!=="C")){ ensure().push({enIdx:t.enIdx, zh:""}); i++; continue; }   // 冠词 / be功能词 / 空中文(如 to)：仅英文，归当前意群
    if(cls==="C"){ flush(); ensure().push({enIdx:t.enIdx, zh:t.zh}); flush(); i++; continue; }        // 并列/从属连词：单独成意群（和 / 但是 / 因为）
    ensure().push({enIdx:t.enIdx, zh:t.zh}); i++;   // S/V/O/A：顺流归入当前意群（粗粒度短语/从句级意群，介词亦随之并入）
  }
  flush();
  const wsc=row.words.filter(w=>w.clean);
  return chunks.map(c=>({
    idxs: c.filter(p=>p.enIdx!=null).map(p=>p.enIdx).sort((a,b)=>a-b),   // 英文：按原词序
    zh:   c.map(p=>p.zh||"").join("")                                    // 中文：按流序连写
  })).filter(c=>c.zh || c.idxs.some(i=>!(wsc[i]&&wsc[i].expHide)));   // 只剩隐藏的展开尾巴词 → 不输出空块
}
function translateGroup(row){    // 意群：双语视图——每个意群英文（按原文词序还原）在上、中文（按中文自然序）在下；块间以 ｜ 分隔
  const ws=row.words.filter(w=>w.clean);
  return groupChunks(row).map(c=>{
    const en=c.idxs.filter(i=>!ws[i].expHide).map(i=>{ const w=ws[i], t=w.clean.toLowerCase();
      const shown=w.orig?w.orig.tok.toLowerCase():t;   // 口语缩写：显示原词 gonna，不显展开词 going
      const ann=w.orig?`<sup class="expm" title="口语缩写：${esc(w.orig.tok.toLowerCase())} = ${esc(w.orig.disp)}">(=${esc(w.orig.disp)})</sup>`:"";
      return ((spellOn&&w.miss)?`<span class="gw msp"${w.missSplit?` title="词库查不到：似为「${esc(w.missSplit)}」两词连写"`:""}>${esc(shown)}</span>`:esc(shown))+ann;
    }).join(" ").trim();
    return `<span class="grp"><span class="gen">${en}</span><span class="gzh">${esc(c.zh)}</span></span>`;
  }).join('<span class="grp-sep">｜</span>');
}

function esc(s){ return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
// 形态兜底：词典没收录时，按词形推中文（复数/时态/比较级/副词），让逐词模式不留"看不懂"的空档
function guessZH(word){
  const w=String(word||"").toLowerCase();
  if(w.length<4) return "";
  const H=b=>DICT[b]||BIGDICT[b]||"", ADJ=g=>/的$/.test(g);   // 词形兜底也要查大词库：scientists→scientist、boats→boat 才推得出来
  const un2=b=>(b.length>2&&b.slice(-1)===b.slice(-2,-1))?b.slice(0,-1):b;   // bigger→bigg→big
  let b,g;
  if(/iest$/.test(w)){ g=H(w.slice(0,-4)+"y"); if(ADJ(g)) return "最"+g.slice(0,-1); }
  if(/ier$/.test(w)){  g=H(w.slice(0,-3)+"y"); if(ADJ(g)) return "更"+g.slice(0,-1); }
  if(/est$/.test(w)){  b=w.slice(0,-3); g=H(b)||H(b+"e")||H(un2(b)); if(ADJ(g)) return "最"+g.slice(0,-1); }
  if(/er$/.test(w)){   b=w.slice(0,-2); g=H(b)||H(b+"e")||H(un2(b)); if(ADJ(g)) return "更"+g.slice(0,-1); }
  if(/ily$/.test(w)){  g=H(w.slice(0,-3)+"y"); if(ADJ(g)) return g.slice(0,-1)+"地"; }
  if(/ly$/.test(w)){   g=H(w.slice(0,-2)); if(ADJ(g)) return g.slice(0,-1)+"地"; }
  if(/ing$/.test(w)){
    b=w.slice(0,-3); g=H(b)||H(b+"e");
    if(!g && b.length>2 && b.slice(-1)===b.slice(-2,-1)) g=H(b.slice(0,-1));   // running → run
    if(g) return "正在"+g;
  }
  if(/ed$/.test(w)){
    if(/ied$/.test(w)) g=H(w.slice(0,-3)+"y");
    b=w.slice(0,-2); g=g||H(b)||H(b+"e");
    if(!g && b.length>2 && b.slice(-1)===b.slice(-2,-1)) g=H(b.slice(0,-1));   // stopped → stop
    if(g) return g+"了";
  }
  if(/ies$/.test(w)){ g=H(w.slice(0,-3)+"y"); if(g) return g; }
  if(/es$/.test(w)){  g=H(w.slice(0,-2)); if(g) return g; }
  if(/s$/.test(w)){   g=H(w.slice(0,-1)); if(g) return g; }
  // 否定前缀：inactive→不活跃的 / unhappy→不快乐的 / impossible→不可能的 / dislike→不喜欢（底词是形容词才推，避免误伤）
  for(const p of ["un","in","im","dis"]){ if(w.startsWith(p)&&w.length>p.length+3){ const g2=H(w.slice(p.length)); if(g2&&ADJ(g2)) return "不"+g2.slice(0,-1)+"的"; } }
  return "";
}
// —— 内置拼写检查：拿内置词库（USERDICT+DICT+BIGDICT+多义词+词形推断）当词典，查不到的词标红波浪线 ——
// v8.31 曾用 spellcheck="false" 关掉浏览器拼写检查（它要异步加载系统词典所以弹得慢）；这套是纯内存查表，毫秒级，还能顺带查出「两词连写」（Likemany → like many）
function knownCore(l){   // 是否认识这个词形（含复数/时态/比较级/否定前缀等推断）
  return !!(USERDICT[l]||DICT[l]||BIGDICT[l]||(HOMO[l]&&HOMO[l].length)||guessZH(l));
}
function isKnownWord(l){ // 再兜一层缩写：don't/isn't/can't/it's/they'll 等
  if(knownCore(l)) return true;
  const m=l.match(/^(.+?)(?:'s|'re|'ve|'ll|'d)$/); if(m&&knownCore(m[1])) return true;
  const n=l.match(/^(.+)n't$/);   if(n&&(knownCore(n[1])||knownCore(n[1]+"n"))) return true;
  return false;
}
function markMisspells(rows){        // 拆解后逐词标记：w.miss=拼写可疑、w.missSplit=疑似连写的拆法
  rows.forEach(row=>{
    let first=true;                  // 该句第一个实词（决定首字母大写算不算人名）
    row.words.forEach(w=>{
      w.miss=false; w.missSplit="";
      if(!w.clean) return;
      first=false;                   // 只要处理过实词，后面的大写就不再算句首
      const raw=String(w.text||w.clean).replace(/^[^A-Za-z]+|[^A-Za-z]+$/g,"");   // 去首尾标点
      if(!raw||raw.length<2||/\d/.test(raw)) return;
      const l=raw.toLowerCase();
      const capped=/^[A-Z]/.test(raw);
      const midUpper=/[A-Z]/.test(raw.slice(1));       // 词中还有大写 / 全大写：缩写或专有（McDonald、USA），不查
      if(midUpper) return;
      if(isKnownWord(l)) return;
      const trySplit=()=>{ for(let k=2;k<l.length-1;k++){ const a=l.slice(0,k), b=l.slice(k); if(knownCore(a)&&knownCore(b)) return a+" "+b; } return ""; };
      if(capped&&!first){                              // 句中大写且查不到：先试连写探测，拆得出两个熟词=连写错误；拆不出=人名地名，不误报
        const sp=trySplit(); if(sp){ w.miss=true; w.missSplit=sp; }
        return;
      }
      w.miss=true;
      w.missSplit=trySplit();
    });
  });
}
// 逐词对照：每个英文词紧跟它自己的中文义，与英文句一一对应；并按主谓宾分色，便于边看词义边看成分
// 收录了 → 显示中文义；未收录 → 原词 + 虚线（提示待补词典）
function translateByWord(row){
  const parts=[];
  row.words.forEach(w=>{
    if(!w.clean){                                  // 标点：原样贴回，保持与英文句一一对应
      const t=(w.text||"").trim();
      if(t) parts.push(`<span class="pn">${esc(t)}</span>`);
      return;
    }
    if(w.expHide) return;                          // 口语缩写的展开尾巴词：不单独显示（义已并入 gonna(=going to)）
    const s=glossOf(w.clean.toLowerCase(), w);                  // 多义词：按句子成分为主
    const force=typeof w.zhForce==="string";
    const g=force?w.zhForce:(s.zh || guessZH(w.clean));         // 义项/词典优先，其次按词形推；缩写块用整块义
    const cls=w.role?(" lw-"+w.role):"";
    const alt=(!force&&s.others.length)?`<span class="alt">（另：${s.others.map(esc).join(" / ")}）</span>`:"";
    const zn=g?`<b>${esc(g)}</b>${alt}`:`<span class="miss" title="未收录：词库暂无此词，可加入生词本">${esc(w.clean)}</span>`;
    const enTxt=w.orig?w.orig.tok:(w.text||w.clean);            // 缩写块显示原词 gonna，不显 going
    const enAnn=w.orig?`<sup class="expm" title="口语缩写：${esc(w.orig.tok.toLowerCase())} = ${esc(w.orig.disp)}">(=${esc(w.orig.disp)})</sup>`:"";
    parts.push(`<span class="lw${cls}"><i${(spellOn&&w.miss)?' class="msw"'+(w.missSplit?` title="词库查不到：似为「${esc(w.missSplit)}」两词连写"`:""):""}>${esc(enTxt)}${enAnn}</i>${zn}</span>`);
  });
  return parts.join("");
}

const BIGDICT_RAW=window.learnerDictionary;
const BIGDICT=Object.fromEntries(BIGDICT_RAW.split("\n").map(function(x){var i=x.indexOf("\t");return i>0?[x.slice(0,i),x.slice(i+1)]:null;}).filter(Boolean));
const DICT = {
  ability:"能力",brain:"大脑",concentrate:"专注",connect:"连接",constantly:"不断地",improve:"提高",information:"信息",long:"长的",longer:"更长",meaning:"意思",media:"媒体",mental:"精神的",page:"页",period:"时期",post:"帖子",process:"过程",require:"需要",skill:"技能",social:"社交的",strengthen:"加强",
  the:"这/那",a:"一个",an:"一个",this:"这",that:"那",these:"这些",those:"那些",
  handmade:"手工的",healing:"疗愈的",crystal:"水晶",bracelet:"手链",helps:"帮助",
  help:"帮助",you:"你",sleep:"睡眠/睡",better:"更好",at:"在",night:"夜晚",nights:"夜晚",
  young:"年轻的",orange:"橙子/橙色的",farmer:"农民",secretly:"悄悄地",ordered:"订购了",
  order:"订购",pack:"包裹",because:"因为",his:"他的",her:"她的",mother:"母亲",needed:"需要",
  need:"需要",every:"每个",day:"白天",water:"水",time:"时间",money:"钱",
  product:"产品",customer:"顾客",shop:"商店",seller:"卖家",quality:"质量",design:"设计",
  color:"颜色",size:"尺寸",price:"价格",business:"生意",video:"视频",film:"电影",
  drama:"短剧",story:"故事",audience:"观众",reader:"读者",writer:"作者",
  naughty:"淘气的",nurse:"护士",food:"食物",window:"窗户",letter:"信",read:"读",reads:"读",own:"自己的",traditional:"传统的",custom:"习俗",children:"孩子们",library:"图书馆",opened:"打开",tom:"汤姆",picked:"捡起",year:"年",kid:"小孩",pen:"笔",black:"黑色",war:"战争",peace:"和平",write:"写",sit:"坐",kill:"杀死",open:"打开",married:"已婚的",alive:"活着的",brown:"棕色的",gray:"灰色的",again:"再次",quite:"相当",carefully:"小心地",whoever:"无论谁",few:"很少",which:"哪个",ok:"好的",hello:"你好",thanks:"谢谢",please:"请",sorry:"抱歉",
  broke:"打破",break:"打破",eaten:"吃了",eat:"吃",
  // —— 俾路支女孩故事段（截图暴露的词典缺口）——
  baloch:"俾路支的",conservative:"保守的",tribe:"部落",women:"妇女们",men:"男人们",
  honor:"荣誉",eldest:"最年长的",customary:"惯常的",university:"大学",graduate:"毕业生",
  opportunity:"机会",society:"社会",luckily:"幸运地",chance:"机会",raise:"养育/举起",
  uncle:"叔叔",aunt:"姑姑",baby:"婴儿",luck:"运气",give:"给",parent:"父母",
  "i":"我",he:"他",she:"她",it:"它",we:"我们",they:"他们",me:"我",him:"他",   /* her 取所有格义「她的」，见上行 */
  them:"他们",us:"我们",my:"我的",your:"你的",our:"我们的",their:"他们的",
  and:"和",or:"或",but:"但是",so:"所以",with:"带着",for:"为了",of:"的",on:"在…上",
  in:"在…里",to:"去/给",from:"从",by:"被/由",about:"关于",into:"进入",
  very:"非常",also:"也",just:"只是",now:"现在",then:"然后",often:"经常",always:"总是",
  make:"做",made:"做了",take:"拿",took:"拿了",get:"得到",got:"得到了",
  new:"新的",old:"旧的/…岁的",good:"好的",bad:"坏的",big:"大的",small:"小的",
  beautiful:"美丽的",important:"重要的",happy:"开心的",sad:"伤心的",
  boy:"男孩",cat:"猫",apple:"苹果",mat:"垫子",book:"书",eat:"吃",ate:"吃了",
  eats:"吃",sat:"坐",wrote:"写",was:"是",written:"写",
  gave:"给",what:"什么",who:"谁",where:"哪里",when:"何时",why:"为什么",how:"怎样",
  room:"房间",full:"满的",boys:"男孩们",books:"书",girls:"女孩们",child:"孩子",girl:"女孩",sitting:"坐",sits:"坐",
  only:"唯一的",among:"在…中",barely:"几乎不",missing:"想念",female:"女性的",cousins:"表亲们",
  friends:"朋友们",inside:"在…里",home:"家",school:"学校",years:"年",nine:"九",
  ten:"十",hardly:"几乎不",center:"中心",surrounded:"环绕",functional:"实用的",single:"单一的",
  education:"教育",allowed:"允许",village:"村庄",not:"不",alongside:"与…一起",
  // 高频功能词（逐词对照下最常对不上的一批，补齐后一眼可读）
  is:"是",are:"是",am:"是",be:"是",been:"是",were:"是",being:"是",
  have:"有",has:"有",had:"有",do:"做",does:"做",did:"做了",done:"做了",
  will:"将",would:"会",can:"能",could:"能",should:"应该",must:"必须",may:"可能",might:"可能",
  there:"那里",here:"这里",to:"去/给",too:"也",no:"没有",yes:"是的",
  // —— 介词 / 方位（挂件里最高频，缺了就读不懂）——
  above:"在…上方",across:"穿过",after:"在…之后",against:"靠着",along:"沿着",
  around:"在…周围",as:"作为",before:"在…之前",behind:"在…后面",below:"在…下面",
  beneath:"在…下方",beside:"在…旁边",between:"在…之间",beyond:"在…之外",
  despite:"尽管",down:"向下",during:"在…期间",except:"除了",like:"像",
  near:"靠近",off:"离开",onto:"到…上",opposite:"在…对面",out:"向外",
  outside:"在…外面",over:"在…上方",past:"经过",per:"每",since:"自从",
  than:"比",through:"穿过",throughout:"遍及",till:"直到",toward:"朝",
  towards:"朝",under:"在…下面",underneath:"在…下面",until:"直到",up:"向上",
  upon:"在…上",via:"经由",within:"在…之内",without:"没有",amid:"在…之中",
  amongst:"在…之中",unlike:"不像",versus:"对",
  // —— 副词 ——
  actually:"实际上",almost:"几乎",already:"已经",anyway:"无论如何",anywhere:"任何地方",
  away:"离开",back:"回来",certainly:"当然",completely:"完全",early:"早",
  elsewhere:"别处",enough:"足够",especially:"尤其",even:"甚至",ever:"曾经",
  everywhere:"到处",exactly:"正好",far:"远",fast:"快",finally:"终于",
  forever:"永远",forward:"向前",generally:"通常",hard:"努力地",
  however:"然而",indeed:"确实",instead:"而不是",late:"晚",later:"之后",yesterday:"昨天",tomorrow:"明天",today:"今天",
  least:"最少",less:"更少",long:"长久",maybe:"也许",meanwhile:"同时",
  more:"更多",most:"最",mostly:"大多",much:"很多",nearly:"将近",
  never:"从不",nowhere:"无处",obviously:"显然",once:"一次",otherwise:"否则",
  perhaps:"或许",probably:"大概",quickly:"快速地",quietly:"安静地",rather:"相当",
  really:"真的",simply:"只是",slowly:"缓慢地",sometimes:"有时",somewhere:"某处",
  soon:"很快",still:"仍然",suddenly:"突然",together:"一起",twice:"两次",
  usually:"通常",well:"好",yet:"还",truly:"真正地",totally:"完全",
  immediately:"立刻",eventually:"最终",recently:"最近",currently:"目前",
  previously:"先前",initially:"起初",originally:"最初",abroad:"在国外",
  apart:"分开",aside:"在一旁",aloud:"大声地",therefore:"因此",thus:"因此",
  nevertheless:"尽管如此",moreover:"此外",furthermore:"此外",besides:"此外",
  hence:"因此",accordingly:"相应地",upstairs:"楼上",downstairs:"楼下",
  // —— 形容词 ——
  able:"能够的",afraid:"害怕的",alone:"独自的",angry:"生气的",available:"可用的",
  aware:"意识到的",awful:"糟糕的",blue:"蓝色的",bright:"明亮的",busy:"忙碌的",
  careful:"小心的",certain:"确定的",cheap:"便宜的",clean:"干净的",clear:"清楚的",
  close:"近的",cold:"冷的",comfortable:"舒适的",common:"常见的",complete:"完整的",
  cool:"凉爽的",correct:"正确的",crazy:"疯狂的",curious:"好奇的",dark:"黑暗的",
  dead:"死的",deep:"深的",different:"不同的",difficult:"困难的",dirty:"脏的",
  dry:"干的",easy:"容易的",empty:"空的",entire:"整个的",evil:"邪恶的",
  exact:"精确的",fair:"公平的",false:"假的",famous:"著名的",favorite:"最喜欢的",
  fine:"好的",free:"自由的",fresh:"新鲜的",friendly:"友好的",funny:"有趣的",
  gentle:"温柔的",glad:"高兴的",global:"全球的",great:"伟大的",green:"绿色的",
  healthy:"健康的",heavy:"重的",high:"高的",hot:"热的",hungry:"饥饿的",
  ill:"生病的",interesting:"有趣的",kind:"善良的",large:"大的",last:"最后的",
  lazy:"懒惰的",light:"轻的",little:"小的",local:"当地的",lonely:"孤独的",
  loud:"大声的",low:"低的",lucky:"幸运的",mad:"疯狂的",main:"主要的",
  major:"主要的",modern:"现代的",narrow:"窄的",national:"国家的",natural:"自然的",
  necessary:"必要的",nervous:"紧张的",normal:"正常的",obvious:"明显的",odd:"奇怪的",
  ordinary:"普通的",original:"最初的",patient:"耐心的",perfect:"完美的",personal:"个人的",
  physical:"身体的",plain:"朴素的",pleasant:"愉快的",polite:"礼貌的",poor:"贫穷的",
  popular:"流行的",possible:"可能的",powerful:"强大的",practical:"实用的",present:"现在的",
  pretty:"漂亮的",private:"私人的",proper:"恰当的",proud:"自豪的",public:"公共的",
  pure:"纯净的",quick:"快的",quiet:"安静的",rare:"稀有的",ready:"准备好的",
  real:"真实的",red:"红色的",rich:"富有的",right:"正确的",rough:"粗糙的",
  round:"圆的",rude:"粗鲁的",safe:"安全的",same:"相同的",serious:"严肃的",
  sharp:"锋利的",short:"短的",shy:"害羞的",sick:"生病的",silent:"沉默的",
  silly:"愚蠢的",similar:"相似的",simple:"简单的",slow:"慢的",smart:"聪明的",
  smooth:"光滑的",soft:"柔软的",special:"特别的",strange:"奇怪的",strong:"强壮的",
  stupid:"愚蠢的",sudden:"突然的",sure:"确定的",sweet:"甜的",tall:"高的",
  terrible:"可怕的",thick:"厚的",thin:"薄的",thirsty:"口渴的",tight:"紧的",
  tiny:"微小的",tired:"疲倦的",true:"真的",typical:"典型的",ugly:"丑陋的",
  unhappy:"不快乐的",unusual:"不寻常的",useful:"有用的",usual:"通常的",warm:"温暖的",
  weak:"虚弱的",wet:"湿的",white:"白色的",whole:"整个的",wide:"宽的",
  wild:"野生的",wise:"明智的",wrong:"错误的",yellow:"黄色的",positive:"积极的",
  negative:"消极的",effective:"有效的",efficient:"高效的",expensive:"昂贵的",
  valuable:"有价值的",successful:"成功的",impossible:"不可能的",wonderful:"极好的",
  excellent:"优秀的",amazing:"惊人的",boring:"无聊的",exciting:"令人兴奋的",
  dangerous:"危险的",ancient:"古老的",scared:"害怕的",worried:"担心的",
  // —— 连词 / 从属词 ——
  although:"虽然",though:"虽然",unless:"除非",while:"当…时",whereas:"然而",
  whether:"是否",nor:"也不",if:"如果",whenever:"每当",wherever:"无论哪里",
  // —— 限定词 / 代词 ——
  each:"每个",some:"一些",any:"任何",all:"所有",both:"两个都",either:"任一",
  neither:"都不",another:"另一个",other:"其他的",others:"其他人",such:"这样的",
  many:"许多",someone:"某人",somebody:"某人",something:"某事",anyone:"任何人",
  anybody:"任何人",anything:"任何事",everyone:"每个人",everybody:"每个人",
  everything:"一切",nobody:"没有人",nothing:"没有东西",none:"没有",one:"一个",
  myself:"我自己",yourself:"你自己",himself:"他自己",herself:"她自己",itself:"它自己",
  ourselves:"我们自己",themselves:"他们自己",whose:"谁的",whom:"谁",
  // —— 数词 ——
  two:"二",three:"三",four:"四",five:"五",six:"六",seven:"七",eight:"八",
  eleven:"十一",twelve:"十二",twenty:"二十",thirty:"三十",forty:"四十",fifty:"五十",
  hundred:"百",thousand:"千",million:"百万",first:"第一",second:"第二",third:"第三",
  next:"下一个",half:"一半",double:"双倍",
  // —— 常用动词（原形 + 常见/不规则变形）——
  learn:"学习",learned:"学会了",learnt:"学会了",teach:"教",taught:"教了",study:"学习",studied:"学习了",
  go:"去",goes:"去",went:"去了",gone:"去了",come:"来",comes:"来",came:"来了",
  see:"看见",sees:"看见",saw:"看见了",seen:"看见",look:"看",looked:"看了",looking:"看着",
  say:"说",says:"说",said:"说了",tell:"告诉",told:"告诉了",speak:"说",spoke:"说了",spoken:"说过",
  talk:"谈话",talked:"谈了",know:"知道",knew:"知道",known:"知道的",think:"想",thought:"想了",
  want:"想要",wanted:"想要",like:"喜欢",loved:"爱过",love:"爱",hate:"讨厌",hated:"讨厌",
  feel:"感觉",felt:"感觉",find:"找到",found:"找到了",put:"放",keep:"保持",kept:"保持了",
  let:"让",seem:"似乎",seemed:"似乎",become:"变成",became:"变成了",leave:"离开",left:"离开了",
  bring:"带来",brought:"带来了",begin:"开始",began:"开始了",begun:"开始了",start:"开始",started:"开始了",
  stop:"停止",stopped:"停了",run:"跑",ran:"跑了",walk:"走",walked:"走了",
  stand:"站",stood:"站了",read:"读",sing:"唱",sang:"唱了",dance:"跳舞",danced:"跳舞",
  play:"玩",played:"玩了",work:"工作",worked:"工作了",buy:"买",bought:"买了",
  sell:"卖",sold:"卖了",pay:"付款",paid:"付了",send:"发送",sent:"发送了",
  receive:"收到",carry:"携带",carried:"携带了",drive:"驾驶",drove:"开车",fly:"飞",flew:"飞了",
  swim:"游泳",jump:"跳",jumped:"跳了",climb:"爬",wait:"等待",waited:"等了",watch:"观看",watched:"看了",
  listen:"听",hear:"听见",heard:"听见了",hold:"握住",held:"握住了",drop:"掉落",dropped:"掉了",
  throw:"扔",threw:"扔了",catch:"抓住",caught:"抓住了",win:"赢",won:"赢了",
  lose:"失去",lost:"失去了",fight:"战斗",build:"建造",built:"建造了",break:"打破",
  broke:"打破了",broken:"破碎的",fix:"修理",fixed:"修了",cut:"切",wash:"洗",cook:"烹饪",
  change:"改变",changed:"改变了",choose:"选择",chose:"选择了",chosen:"被选中的",decide:"决定",
  remember:"记得",forget:"忘记",forgot:"忘记了",understand:"理解",understood:"理解了",
  believe:"相信",hope:"希望",wish:"希望",try:"尝试",tried:"尝试了",use:"使用",
  used:"使用了",turn:"转",turned:"转了",move:"移动",moved:"移动了",live:"生活",lived:"生活了",
  die:"死",died:"死了",grow:"成长",grew:"成长了",grown:"长大的",stay:"停留",stayed:"停留了",
  return:"返回",returned:"返回了",arrive:"到达",arrived:"到达了",happen:"发生",happened:"发生了",
  appear:"出现",appeared:"出现了",continue:"继续",finish:"完成",finished:"完成了",allow:"允许",
  follow:"跟随",followed:"跟随了",join:"加入",joined:"加入了",show:"展示",showed:"展示了",
  call:"叫",called:"叫了",ask:"问",asked:"问了",answer:"回答",answered:"回答了",
  offer:"提供",offered:"提供了",pass:"通过",passed:"通过了",spend:"花费",spent:"花费了",
  cost:"花费",cover:"覆盖",covered:"覆盖了",reach:"到达",reached:"到达了",
  suppose:"假设",consider:"考虑",include:"包括",included:"包括了",produce:"生产",
  provide:"提供",provided:"提供了",manage:"管理",matter:"重要",mattered:"要紧",
  born:"出生",wear:"穿",wore:"穿了",worn:"磨损的",draw:"画",drew:"画了",drawn:"被画的",
  // —— 常用名词 ——
  family:"家庭",father:"父亲",brother:"兄弟",sister:"姐妹",son:"儿子",daughter:"女儿",
  friend:"朋友",people:"人们",person:"人",man:"男人",woman:"女人",teacher:"老师",
  student:"学生",doctor:"医生",worker:"工人",country:"国家",city:"城市",town:"城镇",
  street:"街道",road:"路",house:"房子",door:"门",window:"窗户",table:"桌子",
  chair:"椅子",bed:"床",floor:"地板",wall:"墙",garden:"花园",tree:"树",
  flower:"花",animal:"动物",dog:"狗",bird:"鸟",fish:"鱼",food:"食物",
  bread:"面包",milk:"牛奶",rice:"米饭",tea:"茶",coffee:"咖啡",fruit:"水果",
  hand:"手",head:"头",eye:"眼睛",ear:"耳朵",mouth:"嘴",nose:"鼻子",
  foot:"脚",leg:"腿",arm:"手臂",body:"身体",face:"脸",hair:"头发",
  heart:"心",mind:"头脑",idea:"想法",word:"单词",name:"名字",number:"数字",
  question:"问题",problem:"问题",reason:"原因",way:"方式",place:"地方",part:"部分",
  group:"小组",team:"团队",world:"世界",life:"生活",death:"死亡",fear:"恐惧",
  joy:"快乐",truth:"真相",lie:"谎言",dream:"梦想",future:"未来",nature:"自然",
  weather:"天气",rain:"雨",snow:"雪",wind:"风",sun:"太阳",moon:"月亮",
  star:"星星",sky:"天空",sea:"大海",river:"河",mountain:"山",forest:"森林",
  field:"田野",market:"市场",morning:"早晨",evening:"傍晚",week:"周",month:"月",
  hour:"小时",minute:"分钟",moment:"时刻",job:"工作",paper:"纸",letter:"信",
  news:"新闻",music:"音乐",song:"歌曲",picture:"图片",game:"游戏",sport:"运动",
  health:"健康",medicine:"药",hospital:"医院",office:"办公室",company:"公司",
  service:"服务",plan:"计划",point:"要点",side:"一边",top:"顶部",end:"结尾",
  case:"情况",fact:"事实",course:"课程",level:"水平",form:"形式",area:"区域",
  system:"系统",program:"节目",line:"线",sort:"种类",type:"类型",
  // —— 补充：不规则变形（形态兜底推不出的）——
  ring:"戒指",smile:"微笑",smiled:"微笑了",smiling:"正在微笑",laugh:"笑",laughed:"笑了",
  cry:"哭",cried:"哭了",meet:"遇见",met:"遇见了",mean:"意味着",meant:"意味着",
  ride:"骑",rode:"骑了",ridden:"骑过的",rise:"上升",rose:"上升了",risen:"升起的",
  slept:"睡了",wake:"醒来",woke:"醒了",woken:"醒着的",drink:"喝",drank:"喝了",drunk:"喝醉的",
  fall:"落下",fell:"落下了",fallen:"落下的",feed:"喂",fed:"喂了",
  forgive:"原谅",forgave:"原谅了",freeze:"冻结",froze:"冻结了",frozen:"冻住的",
  hide:"躲藏",hid:"躲藏了",hidden:"隐藏的",hit:"打",hurt:"伤害",set:"放置",
  shake:"摇动",shook:"摇了",shine:"照耀",shone:"照耀了",shoot:"射击",shot:"射击了",
  shut:"关闭",sink:"下沉",sank:"下沉了",sunk:"下沉的",steal:"偷",stole:"偷了",stolen:"被偷的",
  stick:"粘",stuck:"粘住了",strike:"打击",struck:"打击了",sweep:"打扫",swept:"打扫了",
  swim:"游泳",swam:"游泳了",tear:"撕",tore:"撕了",torn:"撕裂的",weep:"哭泣",wept:"哭泣了",
  lay:"放置",laid:"放置了",lead:"带领",led:"带领了",lend:"借出",lent:"借出了",
  hang:"悬挂",hung:"悬挂了",bend:"弯曲",bent:"弯曲的",bet:"打赌",bite:"咬",bit:"咬了",
  blow:"吹",blew:"吹了",blown:"被吹的",burn:"燃烧",burnt:"烧焦的",burst:"爆发",cast:"投掷",
  deal:"处理",dealt:"处理了",dig:"挖",dug:"挖了",flee:"逃跑",fled:"逃跑了",
  forbid:"禁止",forbade:"禁止了",kneel:"跪",knelt:"跪了",mistake:"弄错",mistook:"弄错了",
  overcome:"克服",overcame:"克服了",prove:"证明",proved:"证明了",quit:"退出",
  seek:"寻找",sought:"寻找了",sew:"缝",shed:"流下",shrink:"收缩",shrank:"收缩了",
  slide:"滑动",slid:"滑了",spell:"拼写",spelt:"拼写了",spit:"吐",split:"分裂",
  spread:"传播",spring:"跳跃",sting:"刺",stung:"刺了",swear:"发誓",swore:"发誓了",
  swell:"膨胀",swing:"摇摆",swung:"摇摆了",thrust:"猛推",tread:"踩",undergo:"经历",
  undertake:"承担",weave:"编织",wind:"缠绕",draw:"画",withdraw:"撤回",withdrew:"撤回了",
  // —— 补充：常用动词（原形，供形态兜底使用）——
  enjoy:"享受",hurry:"赶快",worry:"担心",marry:"结婚",travel:"旅行",visit:"拜访",
  invite:"邀请",reply:"回复",repeat:"重复",report:"报告",protect:"保护",prepare:"准备",
  prevent:"阻止",prefer:"更喜欢",practise:"练习",promise:"承诺",pronounce:"发音",
  publish:"出版",realize:"意识到",recognize:"认出",recommend:"推荐",recover:"恢复",
  reduce:"减少",refuse:"拒绝",regret:"后悔",relax:"放松",release:"释放",remain:"保持",
  remind:"提醒",remove:"移除",repair:"修理",replace:"替换",respect:"尊重",respond:"回应",
  rest:"休息",retire:"退休",reveal:"揭示",review:"复习",roar:"吼叫",roll:"滚动",
  rub:"摩擦",ruin:"毁坏",rush:"冲",sail:"航行",satisfy:"满足",save:"拯救",
  scare:"吓唬",scatter:"散布",scream:"尖叫",search:"搜索",seize:"抓住",select:"选择",
  separate:"分开",serve:"服务",settle:"定居",share:"分享",shave:"刮",shock:"震惊",
  shout:"喊",sigh:"叹气",sign:"签名",skip:"跳过",smell:"闻",smoke:"吸烟",sneeze:"打喷嚏",
  solve:"解决",sound:"听起来",spare:"抽出",spill:"洒",spin:"旋转",spoil:"糟蹋",
  spot:"发现",squeeze:"挤压",stare:"盯着",stir:"搅拌",stretch:"伸展",struggle:"挣扎",
  succeed:"成功",suffer:"受苦",suggest:"建议",supply:"供应",support:"支持",survive:"幸存",
  suspect:"怀疑",swallow:"吞咽",switch:"切换",taste:"品尝",test:"测试",thank:"感谢",
  threaten:"威胁",tie:"绑",touch:"触摸",trace:"追踪",train:"训练",transfer:"转移",
  translate:"翻译",transport:"运输",trap:"困住",treat:"对待",tremble:"颤抖",trick:"欺骗",
  trust:"信任",twist:"扭转",unite:"团结",unlock:"解锁",urge:"催促",vanish:"消失",
  vary:"变化",wander:"漫步",warn:"警告",waste:"浪费",wave:"挥手",weigh:"称重",
  welcome:"欢迎",whisper:"低语",wipe:"擦",wonder:"想知道",wrap:"包裹",yell:"大叫"
};

// ===== 同形异义词（多义）=====
// 同一个词在不同成分里意思不同（her: 她的/她；type: 类型/打字）。
// 每条按"最常用"排序；同词性多义用 / 并列。渲染时按句子成分自动挑最贴近的义项，其余用小字注明。
const HOMO = {
  her:[{pos:"det",zh:"她的"},{pos:"pron",zh:"她"}],
  his:[{pos:"det",zh:"他的"},{pos:"pron",zh:"他的东西"}],
  that:[{pos:"art",zh:"那"},{pos:"conj",zh:"（引导从句）"},{pos:"pron",zh:"那个"}],
  this:[{pos:"art",zh:"这"},{pos:"pron",zh:"这个"}],
  which:[{pos:"conj",zh:"（…的）"},{pos:"pron",zh:"哪一个"}],
  who:[{pos:"conj",zh:"（…的）"},{pos:"pron",zh:"谁"}],
  what:[{pos:"pron",zh:"什么"},{pos:"adj",zh:"怎样的"}],
  past:[{pos:"prep",zh:"经过"},{pos:"n",zh:"过去"},{pos:"adj",zh:"过去的"}],
  like:[{pos:"prep",zh:"像"},{pos:"v",zh:"喜欢"}],
  back:[{pos:"adv",zh:"回来"},{pos:"n",zh:"背部"}],
  still:[{pos:"adv",zh:"仍然"},{pos:"adj",zh:"静止的"}],
  hard:[{pos:"adj",zh:"困难的"},{pos:"adv",zh:"努力地"}],
  right:[{pos:"adj",zh:"对的"},{pos:"n",zh:"右边"},{pos:"adv",zh:"正好"}],
  well:[{pos:"adv",zh:"好"},{pos:"n",zh:"井"}],
  last:[{pos:"adj",zh:"最后的"},{pos:"v",zh:"持续"}],
  mean:[{pos:"v",zh:"意思是"},{pos:"adj",zh:"刻薄的"}],
  close:[{pos:"v",zh:"关闭"},{pos:"adj",zh:"近的"}],
  will:[{pos:"v",zh:"将"},{pos:"n",zh:"意志"}],
  can:[{pos:"v",zh:"能"},{pos:"n",zh:"罐头"}],
  may:[{pos:"v",zh:"可以"},{pos:"n",zh:"五月"}],
  type:[{pos:"n",zh:"类型"},{pos:"v",zh:"打字"}],
  book:[{pos:"n",zh:"书"},{pos:"v",zh:"预订"}],
  watch:[{pos:"v",zh:"看"},{pos:"n",zh:"手表"}],
  water:[{pos:"n",zh:"水"},{pos:"v",zh:"浇水"}],
  light:[{pos:"n",zh:"光"},{pos:"adj",zh:"轻的"},{pos:"v",zh:"点燃"}],
  ring:[{pos:"n",zh:"戒指"},{pos:"v",zh:"打电话"}],
  plant:[{pos:"n",zh:"植物"},{pos:"v",zh:"种植"}],
  orange:[{pos:"n",zh:"橙子"},{pos:"adj",zh:"橙色的"}],
  shop:[{pos:"n",zh:"商店"},{pos:"v",zh:"购物"}],
  store:[{pos:"n",zh:"商店"},{pos:"v",zh:"储存"}],
  order:[{pos:"n",zh:"订单"},{pos:"v",zh:"订购"}],
  sleep:[{pos:"n",zh:"睡眠"},{pos:"v",zh:"睡觉"}],
  color:[{pos:"n",zh:"颜色"},{pos:"v",zh:"上色"}],
  face:[{pos:"n",zh:"脸"},{pos:"v",zh:"面对"}],
  hand:[{pos:"n",zh:"手"},{pos:"v",zh:"递给"}],
  point:[{pos:"n",zh:"点"},{pos:"v",zh:"指"}],
  change:[{pos:"v",zh:"改变"},{pos:"n",zh:"零钱"}],
  kind:[{pos:"n",zh:"种类"},{pos:"adj",zh:"善良的"}],
  matter:[{pos:"n",zh:"事情"},{pos:"v",zh:"要紧"}],
  sound:[{pos:"n",zh:"声音"},{pos:"v",zh:"听起来"}],
  train:[{pos:"n",zh:"火车"},{pos:"v",zh:"训练"}],
  park:[{pos:"n",zh:"公园"},{pos:"v",zh:"停车"}],
  fish:[{pos:"n",zh:"鱼"},{pos:"v",zh:"钓鱼"}],
  cook:[{pos:"v",zh:"烹饪"},{pos:"n",zh:"厨师"}],
  spring:[{pos:"n",zh:"春天"},{pos:"v",zh:"跳跃"}],
  leave:[{pos:"v",zh:"离开"},{pos:"n",zh:"假期"}],
  wonder:[{pos:"v",zh:"想知道"},{pos:"n",zh:"奇迹"}],
  mind:[{pos:"n",zh:"头脑"},{pos:"v",zh:"介意"}],
  miss:[{pos:"v",zh:"想念"},{pos:"n",zh:"小姐"}],
  present:[{pos:"n",zh:"礼物"},{pos:"adj",zh:"现在的"},{pos:"v",zh:"呈现"}],
  fine:[{pos:"adj",zh:"好的"},{pos:"n",zh:"罚款"}],
  date:[{pos:"n",zh:"日期"},{pos:"v",zh:"约会"}],
  test:[{pos:"n",zh:"测试"},{pos:"v",zh:"检测"}],
  offer:[{pos:"v",zh:"提供"},{pos:"n",zh:"提议"}],
  report:[{pos:"n",zh:"报告"},{pos:"v",zh:"汇报"}],
  field:[{pos:"n",zh:"田野/领域"},{pos:"v",zh:"接球"}],
  bank:[{pos:"n",zh:"银行/河岸"}]
};
// 由句子成分推词性，用来在多义词里挑最贴近当前句子的义项
function posOf(l, w){
  if(!w) return "";
  const role=w.role||"", sub=w.sub||"";
  if(role==="verb"||role==="verb2") return "v";
  if(sub==="art") return "art";
  if(sub==="adj") return "adj";
  if(sub==="adv") return "adv";
  if(sub==="part") return "prep";
  if(sub==="prep") return "prep";
  if(sub==="conj"||sub==="coord") return "conj";
  if(role==="subj"||role==="obj") return PRON.has(l)?"pron":"n";
  return "";
}
// 取义项：{zh=结合句子选中的义, others=[其余义项]}；HOMO 优先 → DICT → 空（外层再用形态兜底）
function glossOf(l, w){
  if(USERDICT[l]) return {zh:USERDICT[l], others:[]};   // 用户手动加的词最高优先级（自己定的义最准）
  const h=HOMO[l];
  if(h&&h.length){
    const p=posOf(l,w);
    let hit=h[0]; if(p){ const f=h.find(x=>x.pos===p); if(f) hit=f; }
    return {zh:hit.zh, others:h.filter(x=>x!==hit).map(x=>x.zh)};
  }
  const d=DICT[l];
  if(d) return {zh:d, others:[]};
  const b=BIGDICT[l];                     // 内置大词库（ECDICT 词频前 1 万 + 中高考/四六级标签）
  if(b) return {zh:b, others:[]};
  const g=guessZH(l);          // 词典没收录时，再走形态兜底（复数/时态/比较级），减少通顺/逐词模式里的英文残留
  return g?{zh:g, others:[]}:{zh:"", others:[]};
}

function makeWordSpan(w){
  const span=document.createElement("span"); span.className="w "+(w.role||"extra")+(w.sub?(" "+w.sub):"");
  if(spellOn&&w.miss){ span.classList.add("misspell"); span.title=w.missSplit?("词库查不到：似为「"+w.missSplit+"」两词连写（少打了空格？）"):"词库查不到：可能拼写有误（右键可加入生词本）"; }
  const en=document.createElement("span"); en.className="en"; en.textContent=w.orig?w.orig.tok:w.text;   // 口语缩写显示原词
  if(w.orig){ const ex=document.createElement("sup"); ex.className="expm"; ex.title="口语缩写："+w.orig.tok.toLowerCase()+" = "+w.orig.disp; ex.textContent="(="+w.orig.disp+")"; en.appendChild(ex); }
  if((w.role==="subj"||w.role==="obj")&&w.idx){ const sp=document.createElement("sup"); sp.className="idx"; sp.textContent=String.fromCharCode(0x2460+w.idx-1); en.appendChild(sp); }
  const gl=document.createElement("span"); gl.className="gl";
  const force=typeof w.zhForce==="string";
  const g=force?w.zhForce:glossOf((w.clean||w.text).toLowerCase(), w).zh;   // 多义词按成分取义项；缩写块用整块义
  const subLabel={art:"冠词",adj:"形容词",adv:"副词",prep:"介词",conj:"连词",coord:"并列连词",part:"短语动词小品词"};
  const roleTag = w.role==="verb"?"谓语":w.role==="verb2"?"动词":w.role==="subj"?"主语":w.role==="obj"?"宾语":"";
  const subTag = (w.role==="extra"&&w.sub)?(subLabel[w.sub]||""):"";
  const idxTag = (w.role==="subj"||w.role==="obj")&&w.idx ? String.fromCharCode(0x2460+w.idx-1) : "";
  const relTag = w.relSubj ? "（兼"+String.fromCharCode(0x2460+w.relSubjVnum-1)+"从句主语）" : "";
  if(g){ const zs=document.createElement("span"); zs.className="wzh"; zs.textContent=g+((g&&roleTag)?" · ":""); gl.appendChild(zs); }   // 词义包一层，受「翻译」开关控制
  gl.appendChild(document.createTextNode(roleTag+idxTag+relTag));
  if(subTag){ const st=document.createElement("span"); st.className="stag"; st.textContent=(g?" · ":"")+subTag; gl.appendChild(st); }
  span.appendChild(en); span.appendChild(gl);
  span.dataset.role=w.role; span.dataset.sub=w.sub||""; span.dataset.word=(w.clean||w.text); span.dataset.idx=w.idx||0;
  span.dataset.vnum=w.vnum||0;   // 所属结构号：供结构速览行点击跳转用
  return span;
}

// —— 译文模式：三态循环 smooth=通顺 / word=逐词 / group=意群（全局 trMode，每句可用 sentMode[idx] 单独覆盖）——
const TR_MODES=["smooth","word","group"];
const TR_LABEL={smooth:"通顺",word:"逐词",group:"意群"};
function nextMode(m){ const i=TR_MODES.indexOf(m); return TR_MODES[(i+1)%TR_MODES.length]; }
let trMode="smooth";        // smooth=通顺（按中文逻辑排列）/ word=逐词（每词义标在词上）/ group=意群（按语义块断句）
let rowsCache=[];           // 最近一次拆解结果，供译文区重绘
let sentMode={};            // 句级覆盖：{句索引: "smooth"/"word"/"group"}，-1 = 全文概览
let trShow=true;            // 译文显示总开关（各框内「翻译」按钮可单独覆盖）
let sentShow={};            // 句级译文显示覆盖：{句索引: true/false}，-1 = 全文概览
let ovGrpOn=true;           // 全文概览「英文意群」开关：开=英文按意群分块（｜ 隔开）、句间 / 隐藏；关=恢复逐词 + 句间 /。只作用于全文概览，逐句拆解不受影响
let autoSplit=true;        // 自动分句开关（无标点长文也尽力切句；纯规则有少量误伤，可关）
let spellOn=true;          // 内置拼写检查开关（自研词库查表，毫秒级；偏好保存在数据库）
// 我的生词本（用户右键主动添加，存数据库持久化；加入的词直接反哺翻译查询，优先级最高）
// 内置补漏词根（高频但 ECDICT 精选集没收的词；加入即反哺翻译与拼写检查，优先级高于 BIGDICT）
let USERDICT={"seclude":"使隔离/使隐居","secluded":"与世隔绝的/隐居的","seclusion":"隐居/隔离","forbade":"禁止(过去)","forbidden":"被禁止的","wept":"哭泣(过去)","knelt":"跪下(过去)","arose":"起来/出现(过去)","awoken":"被唤醒的","forgave":"原谅(过去)","forgiven":"被原谅的","withdrew":"退出/撤回(过去)","underwent":"经历(过去)","dwelt":"居住(过去)","clung":"紧紧抓住(过去)","bliss":"极乐/幸福","fussy":"挑剔的/大惊小怪的","serene":"宁静的","itch":"发痒/渴望","behold":"看/目睹","contort":"扭曲","contorted":"扭曲的","contortion":"扭曲；扭体","contortionist":"柔术演员","slither":"蜿蜒滑行","smirk":"得意地笑；假笑","scowl":"皱眉；怒视","pout":"噘嘴","stutter":"口吃；结巴","rapport":"融洽；和睦","introspection":"内省；反省","resilience":"韧性；恢复力","fallacy":"谬误；错误观念","epiphany":"顿悟；突然领悟","whimsical":"异想天开的；古怪有趣的","meticulous":"一丝不苟的；极仔细的","succinct":"简洁的；简明的","apathetic":"冷漠的；无动于衷的"};
const baseUserDict={...USERDICT};
function loadMyWords(){ try{ return JSON.parse(window.learnerStorage.getItem("myWords")||"[]"); }catch(e){ return []; } }
async function saveMyWords(a){ return window.learnerStorage.setItem("myWords", JSON.stringify(a)); }
function loadUserDict(){ try{ const s=window.learnerStorage.getItem("myWords"); if(s){ JSON.parse(s).forEach(r=>{ if(r&&r.word) USERDICT[r.word.toLowerCase()]=r.zh; }); } }catch(e){} }
loadUserDict();
function modeOf(idx){ return (idx in sentMode) ? sentMode[idx] : trMode; }
function showOf(idx){ return (idx in sentShow) ? sentShow[idx] : trShow; }
function cnHeader(idx){     // 翻译开关 + （开关打开时才有）逐词/通顺/意群切换按钮 + 标签
  const on=showOf(idx), mode=modeOf(idx);
  const sw=`<button class="trsw" data-cnidx="${idx}" title="显示 / 隐藏这一处的译文（含这句拆解行里的词义小字）">翻译：${on?"显示":"隐藏"}</button>`;
  if(!on) return sw+`<b>${idx<0?"全文译文":"译文"}：</b><span class="toff">已关闭 · 点左侧「翻译」按钮才显示（关着时不能选 逐词 / 通顺 / 意群）</span>`;
  return sw
       + `<button class="trmode" data-cnidx="${idx}" title="只切换这一处的译文显示方式（通顺 → 逐词 → 意群 循环）">切→${TR_LABEL[nextMode(mode)]}</button>`
       + `<button class="trgsv" data-cnidx="${idx}" title="在本句框里切换「意群（英文在上、中文在下，上下对照）」与「主谓宾（逐词分色）」两种拆解法">${mode==="group"?"切主谓宾":"切意群"}</button>`
       + `<b>${idx<0?"全文译文":"译文"}（${TR_LABEL[mode]}）：</b>`;
}
function cnHtml(idx){
  if(!showOf(idx)) return cnHeader(idx);              // 翻译开关关着：只留开关，不输出译文
  const mode=modeOf(idx);
  if(idx<0){
    const SEP = ovGrpOn ? '<span class="grp-sep">｜</span>' : '<span class="ovsep">/</span>';   // 概览：英文意群开 → 句间也用 ｜；关 → 用 /
    return cnHeader(-1)+rowsCache.map(r=> renderTr(r,mode)).join(SEP);
  }
  const row=rowsCache[idx]; if(!row) return "";
  return cnHeader(idx)+renderTr(row,mode);
}
function renderTr(row,mode){          // 按当前模式选渲染器：word=逐词 / group=意群 / 其余=通顺
  if(mode==="word") return translateByWord(row);
  if(mode==="group") return translateGroup(row);
  return translate(row);
}
function applyCn(idx){      // 只重绘指定那一处译文，不整屏重排（保住滚动位置）
  const el=document.querySelector('.cn[data-cnidx="'+idx+'"]');
  if(!el) return;
  el.innerHTML=cnHtml(idx);
  el.classList.toggle("off",!showOf(idx));
  const box=el.closest(".sent"); if(box) box.classList.toggle("troff",!showOf(idx));   // 同步拆解行的词义小字显隐
}
function applyAllCn(){
  document.querySelectorAll(".cn[data-cnidx]").forEach(el=>{
    const i=+el.dataset.cnidx;
    el.innerHTML=cnHtml(i);
    el.classList.toggle("off",!showOf(i));
    const box=el.closest(".sent"); if(box) box.classList.toggle("troff",!showOf(i));   // 全体同步拆解行词义显隐
  });
}

function buildOverviewBody(ov){      // 重建概览英文行 + 译文行；初次渲染与「英文意群」开关切换都走这里，保证分块↔逐词真正重画
  const oldR=ov.querySelector(".overview-rendered"); if(oldR) oldR.remove();
  const oldC=ov.querySelector(".cn"); if(oldC) oldC.remove();
  // —— 英文行 ——
  const ovr=document.createElement("div"); ovr.className="rendered overview-rendered";
  rowsCache.forEach((row,idx)=>{
    const seg=document.createElement("span"); seg.className="seg";
    if(ovGrpOn){                        // 英文意群开：按块显示（英文在上、块中文在下，块间 ｜、句间也用 ｜）
      const ws=row.words.filter(w=>w.clean);
      const chunks=groupChunks(row);
      chunks.forEach((c,ci)=>{
        const g=document.createElement("span"); g.className="grp";
        const gen=document.createElement("span"); gen.className="gen";
        c.idxs.forEach(i=>{
          const w=ws[i];
          if(w.expHide) return;   // 口语缩写展开尾巴词：概览也不单独显示
          const sp=document.createElement("span"); sp.className="w "+(w.role||"extra")+(w.sub?(" "+w.sub):"");
          if(spellOn&&w.miss){ sp.classList.add("misspell"); sp.title=w.missSplit?("词库查不到：似为「"+w.missSplit+"」两词连写（少打了空格？）"):"词库查不到：可能拼写有误（右键可加入生词本）"; }
          const en=document.createElement("span"); en.className="en"; en.textContent=w.orig?w.orig.tok:w.text;   // 缩写块显示原词 gonna
          if(w.orig){ const ex=document.createElement("sup"); ex.className="expm"; ex.title="口语缩写："+w.orig.tok.toLowerCase()+" = "+w.orig.disp; ex.textContent="(="+w.orig.disp+")"; en.appendChild(ex); }
          if((w.role==="subj"||w.role==="obj")&&w.idx){ const sup=document.createElement("sup"); sup.className="idx"; sup.textContent=String.fromCharCode(0x2460+w.idx-1); en.appendChild(sup); }
          sp.appendChild(en); gen.appendChild(sp);
        });
        const gzh=document.createElement("span"); gzh.className="gzh"; gzh.textContent=c.zh;
        g.appendChild(gen); g.appendChild(gzh);
        seg.appendChild(g);
        if(ci<chunks.length-1){ const s=document.createElement("span"); s.className="grp-sep"; s.textContent="｜"; seg.appendChild(s); }
      });
    } else {                            // 英文意群关：传统逐词 + 句间 /（/ 由 CSS/渲染控制）
      row.words.forEach(w=>{ if(w.expHide) return; seg.appendChild(makeWordSpan(w)); });
    }
    ovr.appendChild(seg);
    if(idx<rowsCache.length-1){
      if(ovGrpOn){ const s=document.createElement("span"); s.className="grp-sep"; s.textContent="｜"; ovr.appendChild(s); }   // 意群开：句间也用 ｜
      else { const sep=document.createElement("span"); sep.className="ovsep"; sep.textContent="/"; ovr.appendChild(sep); }     // 关：用 /
    }
  });
  ov.appendChild(ovr);
  // —— 译文行 ——
  const ovc=document.createElement("div"); ovc.className="cn"+(showOf(-1)?"":" off"); ovc.dataset.cnidx="-1";
  ovc.innerHTML=cnHtml(-1);
  ov.appendChild(ovc);
}

function render(){
  const text=document.getElementById("input").value.trim();
  const out=document.getElementById("out"); const status=document.getElementById("status");
  if(!text){ status.textContent="先粘点东西进来"; return; }
  const {rows,engine}=analyze(text);
  rowsCache=rows; sentMode={}; sentShow={};   // 重新拆解后，各句译文模式/显示都回到跟随全局
  markMisspells(rows);                        // 内置拼写检查：词库查不到的词标 w.miss（渲染时画红波浪线）
  status.textContent="识别引擎："+engine+" · 共 "+rows.length+" 句";
  out.innerHTML="";

  // —— 全文概览（最前端）——
  const ov=document.createElement("div"); ov.className="sent overview";
  const ovh=document.createElement("div"); ovh.className="ovhead";
  ovh.innerHTML="📜 <b>全文概览</b> · 整篇主谓宾骨架（一眼看全篇主干）+ 整段译文";
  const ovSeg=document.createElement("button");     // 分段符总开关：同时控制概览的句间 / 与意群 ｜（一起开 / 一起关）
  ovSeg.type="button"; ovSeg.className="ovbtn";
  ovSeg.textContent="英文意群 ｜："+(ovGrpOn?"开":"关");
  ovSeg.title="开：英文按意群分块、块间竖线 ｜ 隔开、句间斜杠 / 隐藏（整段只剩意群边界，便于记忆）；关：恢复逐词 + 句间 /。只作用于全文概览，逐句拆解不受影响";
  ovSeg.addEventListener("click",e=>{
    e.stopPropagation();
    ovGrpOn=!ovGrpOn;
    buildOverviewBody(ov);   // 真正重建概览：分块↔逐词、句间 ｜/ 随开关切换
    ovSeg.textContent="英文意群 ｜："+(ovGrpOn?"开":"关");
    ovSeg.classList.toggle("seg-off",!ovGrpOn);
  });
  ovh.appendChild(ovSeg);
  const ovAll=document.createElement("button");     // 全部关闭：一键关掉 翻译+挂件，只剩英文（意群 ｜ 结构保留），背诵一键到位
  ovAll.type="button"; ovAll.className="ovbtn";
  ovAll.textContent="全部关闭";
  ovAll.title="一键关闭所有中文辅助：翻译（译文行+词义小字+意群块中文）和挂件标签全部关掉，只留英文（意群 ｜ 结构不动），适合背诵；要恢复点顶部「翻译」「挂件标签」按钮";
  ovAll.addEventListener("click",e=>{
    e.stopPropagation();
    trShow=false; sentShow={};                      // 翻译全局关（含各句单独覆盖清空）
    trswBtn.textContent="翻译：关";
    subOn=false;                                    // 挂件全局关
    subBtn.textContent="挂件标签：关";
    document.querySelectorAll(".sent").forEach(el=>el.classList.toggle("pendoff",true));   // 全体框挂件隐藏
    applyAllCn();                                   // 重绘全部译文区（troff/off 同步，概览块中文随之隐藏）
  });
  ovh.appendChild(ovAll);
  const ovPend=document.createElement("button");    // 概览内的挂件标签开关（只管这一块）
  ovPend.type="button"; ovPend.className="ovbtn pendbtn-inline";
  setPendBtn(ovPend,subOn);
  ovPend.title="只切换全文概览的挂件标签（冠词/形容词/介词等小字）";
  ovPend.addEventListener("click",e=>{
    e.stopPropagation();
    const on=ov.classList.contains("pendoff");      // 当前隐藏 → 点击后要显示
    ov.classList.toggle("pendoff",!on);
    setPendBtn(ovPend,on);
  });
  ovh.appendChild(ovPend);
  ov.classList.toggle("pendoff",!subOn);
  ovSeg.classList.toggle("seg-off",!ovGrpOn);   // 英文意群按钮置灰随状态
  ov.classList.toggle("troff",!showOf(-1));   // 概览拆解行词义小字跟随翻译开关
  ov.appendChild(ovh);
  buildOverviewBody(ov);     // 概览英文行 + 译文行（分块/逐词随 ovGrpOn；句间分隔符 ｜/ 随意群开关）
  out.appendChild(ov);

  // —— 逐句拆解 ——
  rows.forEach((row,i)=>{
    const sdiv=document.createElement("div"); sdiv.className="sent";
    const pend=document.createElement("button");    // 框内挂件标签开关（右上角，只管这一句）
    pend.type="button"; pend.className="pendbtn";
    setPendBtn(pend,subOn);
    pend.title="只切换这句的挂件标签（冠词/形容词/介词等小字）";
    pend.addEventListener("click",()=>{
      const on=sdiv.classList.contains("pendoff");  // 当前隐藏 → 点击后要显示
      sdiv.classList.toggle("pendoff",!on);
      setPendBtn(pend,on);
    });
    sdiv.appendChild(pend);
    sdiv.classList.toggle("pendoff",!subOn);
    sdiv.classList.toggle("troff",!showOf(i));   // 本句拆解行词义小字跟随翻译开关
    const r=document.createElement("div"); r.className="rendered";
    row.words.forEach(w=>{ if(w.expHide) return; r.appendChild(makeWordSpan(w)); });   // 拆解行：缩写展开尾巴词不单独显示
    sdiv.appendChild(r);
    const cn=document.createElement("div"); cn.className="cn"+(showOf(i)?"":" off"); cn.dataset.cnidx=i;
    cn.innerHTML=cnHtml(i);
    sdiv.appendChild(cn);
    const steps=document.createElement("div"); steps.className="steps";
    const sup=n=>String.fromCharCode(0x2460+n-1);
    const subjW=row.words.filter(w=>w.role==="subj");
    const verbW=row.words.filter(w=>w.role==="verb");
    const verb2W=row.words.filter(w=>w.role==="verb2");
    const objW=row.words.filter(w=>w.role==="obj");
    const extraW=row.words.filter(w=>w.role==="extra");
    const bSubj=w=>`<b class="subj">${w.clean}${w.idx?sup(w.idx):""}</b>`;
    const bVerb=w=>`<b class="${w.role==="verb2"?"verb2":"verb"}">${w.clean}${w.idx?sup(w.idx):""}</b>`;
    const bObj=w=>`<b class="obj">${w.clean}${w.idx?sup(w.idx):""}</b>`;
    // 主谓结构：按动词分组，一句多动词→多个结构（结构①/②）
    const groups={};
    row.words.forEach(w=>{ if(w.vnum && (w.role==="subj"||w.role==="verb"||w.role==="verb2"||w.role==="obj")){ (groups[w.vnum]=groups[w.vnum]||{subj:[],verb:[],obj:[]}); const g=groups[w.vnum]; if(w.role==="subj")g.subj.push(w); if(w.role==="verb"||w.role==="verb2")g.verb.push(w); if(w.role==="obj")g.obj.push(w); } });
    let structHtml="";
    Object.keys(groups).sort((a,b)=>a-b).forEach(v=>{ const g=groups[v]; structHtml+=`<div class="k kstruct" data-vnum="${v}" title="点击：跳到并高亮这句拆解行里属于该结构的词">结构${sup(+v)}</div><div class="v trunk kstruct" data-vnum="${v}" title="点击：跳到并高亮这句拆解行里属于该结构的词">${g.subj.map(bSubj).join("、")||"—"} + ${g.verb.map(bVerb).join("、")} + ${g.obj.map(bObj).join("、")||"—"}</div>`; });
    const trunk=(subjW[0]?(subjW[0].clean+(subjW[0].idx?sup(subjW[0].idx):"")):"__")+" + "+(verbW[0]?verbW[0].clean:"__")+" + "+(objW[0]?objW[0].clean:"__");
    let stepsHtml=
      structHtml+
      `<div class="k">步1 · 谓语</div><div class="v">${verbW.length?verbW.map(bVerb).join("、"):"—"}（主干动词·实线）</div>`+
      `<div class="k">步2 · 主语</div><div class="v">${subjW.length?subjW.map(bSubj).join("、"):"—"}${subjW.length>1?"（复合主语，共用谓语）":""}</div>`+
      `<div class="k">步3 · 宾语</div><div class="v">${objW.length?objW.map(bObj).join("、"):"—（无宾语 / 系表）"}${objW.length>1?"（复合宾语）":""}</div>`+
      `<div class="k">步4 · 主干</div><div class="v trunk">${trunk}</div>`+
      `<div class="k">步5 · 挂件</div><div class="v">${extraW.length?extraW.map(w=>w.clean).join("、"):"—（这句没有挂件）"}</div>`;
    if(verb2W.length) stepsHtml+=`<div class="k">步6 · 第二个动词</div><div class="v">${verb2W.map(bVerb).join("、")}（动词·虚线，从句/补语，主干先不计）</div>`;
    steps.innerHTML=stepsHtml;
    sdiv.appendChild(steps);
    const gram=document.createElement("div"); gram.className="gram";
    gram.innerHTML="<h4>语法解释</h4><ul>"+explain(row).map(x=>`<li>${x}</li>`).join("")+"</ul>";
    const pb=document.createElement("pre"); pb.className="plainbox";
    pb.textContent=structPlain(row);
    gram.appendChild(pb);
    sdiv.appendChild(gram);
    out.appendChild(sdiv);
  });
  refreshMirror();     // 输入框镜像红波浪线同步（载入样例/上传文档/开关切换后都刷）
}

const ROLE_TXT={subj:"主语（谁 / 什么）",verb:"谓语（主干动词·做了啥）",obj:"宾语（对谁 / 对啥）",verb2:"动词（第二个动词·从句或 help 类补语，虚线，主干先不计）",extra:"挂件（修饰语，先括起来不看）"};
const ROLE_SHORT={subj:"主语",verb:"谓语",verb2:"动词",obj:"宾语",extra:"挂件"};
const ROLE_CN={subj:"主语",verb:"谓语",verb2:"动词",obj:"宾语",extra:"挂件"};
document.getElementById("out").addEventListener("click",e=>{
  const ks=e.target.closest(".kstruct");
  if(ks){                                  // 结构速览行点击 → 滚动到该结构的词并依次高亮
    const v=+ks.dataset.vnum;
    const box=ks.closest(".sent");
    if(box&&v){
      box.querySelectorAll(".w.hit").forEach(x=>x.classList.remove("hit"));   // 清掉上次高亮
      const hits=[...box.querySelectorAll(".rendered .w")].filter(w=>+(w.dataset.vnum||0)===v);
      if(hits.length) hits[0].scrollIntoView({behavior:"smooth",block:"center"});
      hits.forEach((w,k)=>{ setTimeout(()=>{ w.classList.add("hit"); setTimeout(()=>w.classList.remove("hit"),1500); }, k*130); });
    }
    return;
  }
  const sw=e.target.closest(".trsw");
  if(sw){ const i=+sw.dataset.cnidx; sentShow[i]=!showOf(i); applyCn(i); return; }   // 翻译开关：只显示/隐藏这一处
  const bt=e.target.closest(".trmode");
  if(bt){ const i=+bt.dataset.cnidx; sentMode[i]=nextMode(modeOf(i)); applyCn(i); return; }   // 只切这一处：通顺→逐词→意群 循环
  const gs=e.target.closest(".trgsv");
  if(gs){ const i=+gs.dataset.cnidx; const m=modeOf(i); sentMode[i]=(m==="group"?"word":"group"); applyCn(i); return; }   // 本句框：意群 ↔ 主谓宾（逐词分色）切换
  const t=e.target.closest(".w"); if(!t)return;
  const d=document.getElementById("detail");
  const role=t.dataset.role, sub=t.dataset.sub, word=t.dataset.word, idx=parseInt(t.dataset.idx||"0",10);
  const col=role==='subj'?'teal':role==='verb'?'amber':role==='obj'?'violet': sub==='art'?'cArt':sub==='adj'?'cAdj':sub==='adv'?'cAdv':sub==='prep'?'cPrep':sub==='conj'||sub==='coord'?'cConj':sub==='part'?'cPart':'muted';
  const idxTag = (role==='subj'||role==='obj')&&idx ? String.fromCharCode(0x2460+idx-1) : "";
  const subLabel={art:"冠词",adj:"形容词",adv:"副词",prep:"介词",conj:"连词",coord:"并列连词",part:"短语动词小品词"};
  const mainTxt = ROLE_TXT[role]||role;
  const subTxt = (role==='extra'&&sub)?("挂件中的「"+subLabel[sub]+"」"):"挂件（修饰语）";
  d.innerHTML=`<b>${word}</b> → 角色：<b style="color:var(--${col})">${role==='extra'?subTxt:mainTxt}</b>${idxTag?(" "+idxTag):""}<br><span class="hint">${role==='extra'?'它是修饰主干的'+(subLabel[sub]||'挂件')+'，先括起来；主干抓到后回头再挂。':('它在主干里：'+ROLE_SHORT[role]+'。'+(idxTag?' 多个'+ROLE_SHORT[role]+'时用 '+idxTag+' 区分。':'')+' 中文叫：'+ROLE_CN[role])}</span>`;
  d.style.display="block"; setTimeout(()=>{d.style.display="none";},3500);
});
// —— 右键任意词 → 加入我的生词本（用户主动收集；加入的词直接进翻译查询）——
const ctxmenu=document.getElementById("ctxmenu"), ctxZh=document.getElementById("ctxZh");
let ctxWord="";
document.getElementById("out").addEventListener("contextmenu",e=>{
  const w=e.target.closest(".w"); if(!w) return;
  e.preventDefault();
  const word=(w.dataset.word||"").trim(); if(!word) return;
  ctxWord=word.toLowerCase();
  ctxmenu.querySelector(".ctitle").textContent="加入生词本："+word;
  ctxZh.value=glossOf(ctxWord,{}).zh||"";          // 预填已有义，空则手填
  ctxZh.placeholder="输入中文意思（如 树 / 跑 / 美丽的）";
  ctxmenu.style.display="block";
  const r=w.getBoundingClientRect();
  ctxmenu.style.left=Math.min(r.left, window.innerWidth-260)+"px";
  ctxmenu.style.top=(r.bottom+6)+"px";
  setTimeout(()=>ctxZh.focus(),30);
});
document.addEventListener("click",e=>{ if(ctxmenu.style.display==="block" && !e.target.closest("#ctxmenu") && !e.target.closest(".w")) ctxmenu.style.display="none"; });
document.getElementById("ctxAdd").addEventListener("click",async ()=>{
  const zh=(ctxZh.value||"").trim(); if(!ctxWord||!zh){ ctxZh.focus(); return; }
  let ex=""; for(const row of rowsCache){ if((row.words||[]).some(w=>(w.clean||"").toLowerCase()===ctxWord)){ ex=row.raw; break; } }
  const arr=loadMyWords(); const i=arr.findIndex(r=>r.word.toLowerCase()===ctxWord);
  if(i>=0) arr[i].zh=zh; else arr.push({word:ctxWord, zh, ex, ts:Date.now()});
  try { await saveMyWords(arr); } catch(e) { return; } USERDICT[ctxWord]=zh; ctxmenu.style.display="none"; render();
});
document.getElementById("ctxCancel").addEventListener("click",()=>{ ctxmenu.style.display="none"; });
document.getElementById("go").addEventListener("click",render);
// 挂件标签开关：默认关（只看主干+词意，不显示冠词/形容词等细分），点一下开
let subOn=false;            // 挂件标签全局默认（各框内「挂件」按钮可单独覆盖，重新拆解后回到全局）
function setPendBtn(btn,on){ btn.textContent="挂件："+(on?"开":"关"); }
const subBtn=document.getElementById("subBtn");
subBtn.addEventListener("click",()=>{
  subOn=!subOn;
  document.querySelectorAll(".sent").forEach(el=>el.classList.toggle("pendoff",!subOn));   // 全体跟随全局
  subBtn.textContent="挂件标签："+(subOn?"开":"关");
});
// 分句符开关已移入「全文概览」标题栏（见 render 内），只作用于概览的句间 /
const trBtn=document.getElementById("trBtn");
trBtn.title="全体切换 译文模式：通顺 → 逐词 → 意群（循环）；每句框里也有「切→…」按钮可只切那一句。译文的显示/隐藏用旁边的「翻译」总开关或各框内的「翻译」按钮";
trBtn.addEventListener("click",()=>{
  trMode=nextMode(trMode); sentMode={};               // 全局切换后，各句回到跟随全局
  trBtn.textContent="译文："+TR_LABEL[trMode];
  applyAllCn();                                       // 只重绘译文区，不整屏重排
});
// 翻译总开关：控制所有译文框的默认显示状态；切换后各框覆盖清空、全体跟随全局
const trswBtn=document.getElementById("trswBtn");
trswBtn.title="总开关：关闭后所有译文都隐藏（下方译文块 + 拆解行里每个词的中文小字），主谓宾成分标签仍显示。各框内的「翻译」按钮可单独再调";
trswBtn.addEventListener("click",()=>{
  trShow=!trShow; sentShow={};                        // 默认翻转 + 各句覆盖清空，全体跟随全局
  trswBtn.textContent="翻译："+(trShow?"开":"关");
  applyAllCn();
});
const autoBtn=document.getElementById("autoBtn");
autoBtn.title="无标点的长文也按「小写结尾词 + 大写开头新词」启发式自动切成多句（纯规则，可能有少量误伤，可关）";
autoBtn.addEventListener("click",()=>{
  autoSplit=!autoSplit;
  autoBtn.textContent="自动分句："+(autoSplit?"开":"关");
  render();                      // 重新切句，让开关立即生效
});
// 内置拼写检查开关：开=词库查不到的词画红波浪线（含两词连写探测）；关=干干净净只看拆解
const spellBtn=document.getElementById("spellBtn");
try{ if(window.learnerStorage.getItem("spellOn")==="0") spellOn=false; }catch(e){}
function setSpellBtn(){ spellBtn.textContent="拼写检查："+(spellOn?"开":"关"); spellBtn.style.opacity=spellOn?"":".55"; }
setSpellBtn();
spellBtn.title="内置拼写检查（自研，毫秒级）：词库里查不到的词画红色波浪线，两个词连写（如 Likemany）还会在悬停提示拆法。替代被关掉的浏览器拼写检查";
spellBtn.addEventListener("click",async ()=>{
  const next=!spellOn;
  try{ await window.learnerStorage.setItem("spellOn",next?"1":"0"); }catch(e){return;}
  spellOn=next;
  setSpellBtn();
  render();                      // 重画，让波浪线立即显/隐
});
// —— 输入框实时拼写检查：textarea 不能显示彩色下划线，垫一层同排版透明镜像，错词在镜像里画红波浪线 ——
// 与拆解侧同一套词库判断（isKnownWord），打字即查、毫秒级；句首大写照查，句中大写拆不出熟词按人名放行
function scanInputMisspells(text){    // 纯函数：返回输入文本里拼写可疑的词 [{raw,i,split}]
  const res=[]; const wordRe=/[A-Za-z]+(?:'[A-Za-z]+)?/g; let m;
  while((m=wordRe.exec(text))){
    const raw=m[0], i=m.index, l=raw.toLowerCase();
    if(raw.length<2) continue;
    const capped=/^[A-Z]/.test(raw), midUpper=/[A-Z]/.test(raw.slice(1));
    if(midUpper) continue;                        // 词中还有大写 / 全大写：缩写或专有（McDonald、USA），不查
    const SC=SPOKEN_CONTRACTIONS[l];
    if(SC){ res.push({raw,i,split:"",sc:SC}); continue; }   // 口语缩写：合法词，不当拼错，改标青色虚线
    if(isKnownWord(l)) continue;
    const sentStart=/(^|[.!?]|\n)\s*$/.test(text.slice(0,i));
    const trySplit=()=>{ for(let k=2;k<l.length-1;k++){ const a=l.slice(0,k), b=l.slice(k); if(knownCore(a)&&knownCore(b)) return a+" "+b; } return ""; };
    if(capped&&!sentStart){                       // 句中大写：拆得出两个熟词才算连写错，否则当人名
      const sp=trySplit(); if(sp) res.push({raw,i,split:sp});
      continue;
    }
    res.push({raw,i,split:trySplit()});
  }
  return res;
}
const inputEl=document.getElementById("input");
const mirror=document.getElementById("inputMirror");
const mirrorInner=document.getElementById("inputMirrorInner");
function syncMirror(){              // 宽度对齐 + 滚动位移补偿：transform 直接位移内容层，与输入框逐像素对齐，永不漂移
  if(!mirror||!mirrorInner) return;
  mirror.style.width=(inputEl.clientWidth+2)+"px";   // +2 补镜像自身左右 1px 边框，滚动条出现/消失都跟手
  mirrorInner.style.transform="translateY("+(-inputEl.scrollTop)+"px)";
}
function refreshMirror(){           // 把输入文本同步进镜像层，错词包 <b> 画波浪线
  if(!mirror||!mirrorInner) return;
  const text=inputEl.value;
  if(!spellOn||!text){ mirrorInner.innerHTML=""; syncMirror(); return; }
  const misses=scanInputMisspells(text);
  if(!misses.length){ mirrorInner.textContent=text; syncMirror(); return; }
  let html="", pos=0;
  for(const {raw,i,split,sc} of misses){
    html+=esc(text.slice(pos,i));
    if(sc) html+=`<b class="contr" title="口语缩写：${esc(raw.toLowerCase())} = ${esc(sc.disp)}（拆解时自动还原，不是拼写错误）">${esc(raw)}</b>`;
    else html+=`<b${split?` data-split="${esc(split)}"`:""}>${esc(raw)}</b>`;
    pos=i+raw.length;
  }
  html+=esc(text.slice(pos));
  mirrorInner.innerHTML=html;
  syncMirror();
}
inputEl.addEventListener("input",refreshMirror);           // 打字实时刷新
inputEl.addEventListener("scroll",syncMirror);             // 滚轮/拖滚动条跟手
inputEl.addEventListener("keyup",syncMirror);              // 方向键/PageUp 等键盘滚动兜底
inputEl.addEventListener("mouseup",syncMirror);            // 拖选时滚动兜底
if(typeof ResizeObserver!=="undefined"){ new ResizeObserver(refreshMirror).observe(inputEl); }   // 拖拽缩放输入框 / 滚动条增减时宽度实时对齐
addEventListener("resize",refreshMirror);                  // 窗口变宽窄同理
document.getElementById("sample").addEventListener("click",()=>{
  document.getElementById("input").value="The young orange farmer secretly ordered the healing crystal pack because his mother needed better sleep every night.";
  render();
});
document.getElementById("file").addEventListener("change",e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  const status=document.getElementById("status");
  try{
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        let txt=String(ev.target.result||"");
        if(/\.html?$/i.test(f.name)) txt=txt.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ");
        txt=txt.replace(/\s+/g," ").trim();
        document.getElementById("input").value=txt;
        status.textContent="已载入："+f.name+"（"+txt.length+" 字符）";
        render();
      }catch(err){ status.textContent="读取失败："+err.message; }
    };
    reader.onerror=()=>{ status.textContent="文件读取被环境拦截：用浏览器打开本文件后再上传，或直接把内容粘贴到输入框。"; };
    reader.readAsText(f);
  }catch(err){ status.textContent="无法读取："+err.message; }
});

// ===== 看词典 =====
// 词典本体 DICT + 同形异义 HOMO 合并展示；多义词标「多义」，各义项用 · 连接
function allDictEntries(){
  const m=new Map();
  Object.entries(DICT).forEach(([en,cn])=> m.set(en,{cn,homo:false}));
  Object.entries(HOMO).forEach(([en,senses])=> m.set(en,{cn:senses.map(s=>s.zh).join(" · "),homo:senses.length>1}));
  return [...m.entries()].map(([en,v])=>[en,v.cn,v.homo]).sort((a,b)=>a[0].localeCompare(b[0]));
}
function buildDictHTML(filter){
  const f=(filter||"").trim().toLowerCase();
  const entries=allDictEntries().filter(([en,cn])=> !f || en.includes(f) || cn.toLowerCase().includes(f));
  if(!entries.length) return '<div class="grp">没有匹配的单词，换个词试试。</div>';
  let html="", current="";
  entries.forEach(([en,cn,homo])=>{
    const first=en[0].toUpperCase();
    if(first!==current){
      if(current) html+="</table>";
      current=first; html+=`<div class="grp">${first}</div><table>`;
    }
    html+=`<tr><td class="en">${en}${homo?'<span class="homo">多义</span>':""}</td><td class="cn">${cn}</td></tr>`;
  });
  return html+"</table>";
}
function openDict(){
  const body=document.getElementById("dictBody");
  body.innerHTML=buildDictHTML("");
  document.getElementById("dictCount").textContent="共 "+allDictEntries().length+" 个词条（含 "+Object.keys(HOMO).length+" 个多义词，标「多义」；拆解时按句子成分自动选义项）";
  document.getElementById("dictOverlay").style.display="flex";
  document.getElementById("dictSearch").value="";
  document.getElementById("dictSearch").focus();
}
document.getElementById("dictBtn").addEventListener("click",openDict);
document.getElementById("dictClose").addEventListener("click",()=>{document.getElementById("dictOverlay").style.display="none";});
document.getElementById("dictOverlay").addEventListener("click",e=>{ if(e.target.id==="dictOverlay") e.target.style.display="none"; });
document.getElementById("dictSearch").addEventListener("input",e=>{
  const body=document.getElementById("dictBody");
  body.innerHTML=buildDictHTML(e.target.value);
  const f=e.target.value.trim().toLowerCase();
  const n=allDictEntries().filter(([en,cn])=>!f||en.includes(f)||cn.toLowerCase().includes(f)).length;
  document.getElementById("dictCount").textContent="匹配 "+n+" 个词条";
});

// ===== 生词本：把当前段落里「词典未收录」的词列出来，可复制 / 下载，便于批量入库 =====
let missList=[];
function collectMissing(){
  const map=new Map();
  rowsCache.forEach(row=>{
    (row.words||[]).forEach(w=>{
      const clean=(w.clean||"").trim();
      if(!clean || !/[A-Za-z]/.test(clean)) return;          // 纯标点 / 数字跳过
      const l=clean.toLowerCase();
      if(l.length<2 && l!=="i" && l!=="a") return;           // 单字母跳过
      if(HOMO[l]||DICT[l]||guessZH(clean)) return;           // 已能给出中文 → 不算生词
      const rec=map.get(l)||{word:clean,n:0,sent:""};
      rec.n++; if(!rec.sent) rec.sent=row.raw;
      map.set(l,rec);
    });
  });
  return [...map.values()].sort((a,b)=>b.n-a.n||a.word.localeCompare(b.word));
}
function openMyWords(){
  const arr=loadMyWords();
  const cnt=document.getElementById("missCount"), body=document.getElementById("missBody");
  const ovl=document.getElementById("missOverlay");
  if(!arr.length){
    cnt.textContent="你的生词本还是空的 —— 在任意句子的英文词上点右键，就能把它加进来；加进来的词会直接进词典，下次拆解自动翻译。";
    body.innerHTML='<div class="grp">还没有收藏的生词</div>';
  }else{
    cnt.innerHTML="共 <b>"+arr.length+"</b> 个（右键词即可加；这些词直接进词典，下次自动翻译）。";
    let html="<table>";
    arr.forEach((r,idx)=>{ html+='<tr class="myword"><td class="en">'+esc(r.word)+'</td><td class="zh">'+esc(r.zh||"")+'</td><td class="ex">'+esc((r.ex||"").slice(0,90))+'</td><td><button class="myword-del" data-i="'+idx+'">删</button></td></tr>'; });
    body.innerHTML=html+"</table>";
  }
  ovl.style.display="flex";
}
function missText(){ return missList.map(r=>r.word+"  ×"+r.n).join("\n"); }
function fallbackCopy(t,cb){
  const ta=document.createElement("textarea"); ta.value=t;
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); cb&&cb(); }catch(e){}
  document.body.removeChild(ta);
}
document.getElementById("missBtn").addEventListener("click",openMyWords);
document.getElementById("missClose").addEventListener("click",()=>{document.getElementById("missOverlay").style.display="none";});
document.getElementById("missOverlay").addEventListener("click",e=>{ if(e.target.id==="missOverlay") e.target.style.display="none"; });
document.getElementById("missBody").addEventListener("click",async e=>{
  const del=e.target.closest(".myword-del"); if(!del) return;
  const i=+del.dataset.i, arr=loadMyWords(); arr.splice(i,1); try { await saveMyWords(arr); } catch(e) { return; }
  USERDICT={...baseUserDict}; loadUserDict(); openMyWords();
});
document.getElementById("missScan").addEventListener("click",()=>{
  if(!rowsCache.length){ document.getElementById("missCount").textContent="先在上方粘一段英文、点「一键拆解」，再点这里扫描。"; return; }
  const ml=collectMissing();
  const cnt=document.getElementById("missCount"), body=document.getElementById("missBody");
  if(!ml.length){ cnt.textContent="这一段没有词典未收录的词 🎉"; body.innerHTML='<div class="grp">无生词</div>'; return; }
  const total=rowsCache.reduce((s,r)=>s+((r.words||[]).length),0);
  cnt.innerHTML="本段 <b>"+ml.length+"</b> 个词词典未收录（按出现次数排序；本段共 "+total+" 词）：";
  let html="<table>"; ml.forEach(r=>{ html+='<tr><td class="en">'+esc(r.word)+'</td><td class="n">×'+r.n+'</td><td class="ex">'+esc((r.sent||"").slice(0,110))+'</td></tr>'; });
  body.innerHTML=html+"</table>";
});
document.getElementById("missCopy").addEventListener("click",()=>{
  const arr=loadMyWords(); if(!arr.length) return;
  const t=arr.map(r=>r.word+" "+(r.zh||"")).join("\n");
  const btn=document.getElementById("missCopy");
  const done=()=>{ btn.textContent="已复制 ✓"; setTimeout(()=>{btn.textContent="复制清单";},1300); };
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,()=>fallbackCopy(t,done)); }
  else fallbackCopy(t,done);
});
document.getElementById("missDl").addEventListener("click",()=>{
  const arr=loadMyWords(); if(!arr.length) return;
  const rows=[["word","zh","example"]].concat(arr.map(r=>[r.word,r.zh||"",r.ex||""]));
  const csv="\ufeff"+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a"); a.href=url;
  a.download="我的生词本_"+(new Date().toISOString().slice(0,10))+".csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
});
render();
