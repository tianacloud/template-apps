
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

const BIGDICT_RAW="abandon\t放弃/抛弃\nabandoned\t被抛弃的/无约束的\nabandonment\t放弃/抛弃\nabbey\t大修道院\nabbot\t男修道院院长/大寺院男住持\nabbreviation\t缩写词/缩写\nabdomen\t腹部\nabdominal\t腹部的/有腹鳍的\naberdeen\t亚伯丁/苏格兰粗毛猎狐狗\nabide\t停留/遵守\nability\t能力/才干\nable\t能干的/能够的\nabnormal\t反常的/不规则的\nabnormality\t反常/畸形\naboard\t在船上/在火车上\nabolish\t废止/革除\nabolition\t废除/废奴运动\nabortion\t流产/堕胎\nabound\t大量存在/富于\nabout\t在...周围/大约\nabove\t在上方/超出\nabraham\t亚伯拉罕\nabroad\t往国外/到室外\nabrupt\t突然的/唐突的\nabruptly\t突然地/唐突地\nabsence\t缺席/缺乏\nabsent\t缺席的/不在的\nabsolute\t绝对的/专制的\nabsolutely\t完全地/绝对地\nabsorb\t吸收/使全神贯注\nabsorption\t吸收/专心\nabstract\t抽象的/深奥的\nabstraction\t抽象化/心不在焉\nabsurd\t荒谬的/不合理的\nabu\t亚洲广播联盟\nabundance\t丰富/充足\nabundant\t丰富的/充分的\nabuse\t滥用/虐待\nabusive\t恶言谩骂的/被滥用的\nac\t公元前\nacademic\t学院的/学术的\nacademically\t学术上/学业上\nacademy\t学院/院校\naccelerate\t加速/促进\nacceleration\t加速/促进\naccent\t重音/口音\naccentuate\t以重音念/强调\naccept\t接受/承认\nacceptable\t可接受的/合意的\nacceptance\t接受/接纳\naccepted\t公认的/一般承认的\naccess\t通路/入口\naccessary\t附属的/附带的\naccessible\t易接近的/可进入的\naccession\t到达/即位\naccessory\t附件/零件\naccident\t意外事件/机遇\naccidental\t意外的/偶然的\naccidentally\t偶然地/意外地\naccommodate\t使适应/调和\naccommodation\t膳宿/预订铺位\naccompaniment\t伴随物/附加物\naccompany\t陪伴/伴随\naccompanying\t随同的/附见的\naccomplish\t完成/达到\naccomplished\t完成的/实现的\naccomplishment\t成就/完成\naccord\t一致/调和\naccordance\t一致/和谐\naccording\t相符的/根据...而定的\naccordingly\t相应地/因此\naccount\t报告/解释\naccountability\t负有责任/可说明性\naccountable\t负有责任的/可说明的\naccountancy\t会计工作/会计学\naccountant\t会计人员/会计师\naccounting\t会计学/帐单\naccrue\t自然增加/产生\naccumulate\t积聚/堆积\naccumulation\t积聚/累积\naccuracy\t精确/正确\naccurate\t正确的/精确的\naccurately\t正确地/精确地\naccusation\t控告/指控\naccuse\t指责/控告\naccused\t被告\naccustom\t使习惯于\naccustomed\t惯常的/习惯了的\nace\t幺点/好手\nache\t疼痛\nachieve\t完成/达到\nachievement\t完成/成就\nacid\t酸/酸类物质\nacknowledge\t承认/告知收悉\nacknowledgement\t承认/确认\nacknowledgment\t承认/答谢\nacoustic\t听觉的/声学的\nacquaint\t使认识/介绍\nacquaintance\t认识/相识者\nacquire\t获得/学到\nacquisition\t获得/获得物\nacquisitive\t渴望获得的/贪婪的\nacquit\t无罪释放/表现\nacre\t英亩\nacross\t越过/穿过\nact\t行动/行为\nacting\t演戏/装腔作势\naction\t行动/活动\nactivate\t使活动/使激活\nactivation\t活化/激活\nactive\t活跃的/起作用的\nactively\t活跃地/积极地\nactivism\t激进主义/行动主义\nactivist\t激进主义分子\nactivity\t活动/行动\nactor\t男演员/行动者\nactress\t女演员\nactual\t真实的/实际的\nactually\t事实上/竟然\nacute\t尖锐的/敏锐的\nacutely\t尖锐地/剧烈地\nad\t广告\nadam\t亚当\nadamant\t坚硬的东西\nadapt\t使适应/改编\nadaptation\t适应/改编\nadaptive\t适应的/能适应的\nadd\t增加/添加\nadded\t额外的/更多的\naddict\t使沉溺/使上瘾\naddicted\t沉溺于...的/无法摆脱的\naddiction\t入迷/瘾\naddictive\t上瘾的\naddition\t加法/增加的人\nadditional\t附加的/另外的\nadditionally\t另外/此外\naddress\t住址/演说\nadequate\t适当的/足够的\nadequately\t足够地/适当地\nadhere\t依附/粘着\nadherence\t依附/固执\nadjacent\t毗连的/邻近的\nadjective\t形容词\nadjoin\t邻接/毗连\nadjoining\t邻接的/毗连的\nadjourn\t休会/换地方\nadjust\t调整/使适应于\nadjustable\t可调节的\nadjustment\t调整/调节\nadminister\t管理/料理\nadministration\t行政/管理\nadministrative\t管理的/行政的\nadministrator\t管理人/行政官\nadmirable\t可钦佩的/极好的\nadmiral\t舰队司令/海军上将\nadmiration\t赞赏/钦佩\nadmire\t赞美/钦佩\nadmirer\t钦佩者/仰慕者\nadmission\t准许进入/入场费\nadmit\t承认/接受\nadmittedly\t公认地/诚然\nadolescence\t青春期\nadolescent\t青春期的/青少年的\nadopt\t采用/正式通过\nadoption\t采用/采纳\nadore\t崇拜/爱慕\nadorn\t装饰/使生色\nadrian\t艾德里安/艾德里安市\nadult\t成人/成虫\nadulthood\t成年\nadvance\t前进/进展\nadvanced\t在前的/高级的\nadvancement\t前进/进步\nadvantage\t优点/便利\nadvantageous\t有利的/有益的\nadvent\t来到/来临\nadventure\t冒险/冒险经历\nadventurer\t冒险家/投机者\nadventurous\t喜欢冒险的/有进取心的\nadverb\t副词\nadversary\t敌手/对手\nadverse\t不利的/敌对的\nadvert\t提出看法/引起注意\nadvertise\t做广告/通知\nadvertisement\t广告/启事\nadvertiser\t做广告者/广告客户\nadvertising\t广告业/广告\nadvice\t忠告/劝告\nadvisable\t适当的/明智的\nadvise\t劝告/给...出主意\nadviser\t顾问/劝告者\nadvisor\t顾问/劝告者\nadvisory\t顾问的/咨询的\nadvocacy\t拥护/支持\nadvocate\t提倡者/拥护者\naea\t原子能法/演员协会\naerial\t空中的/航空的\naerobic\t需氧的/需氧菌产生的\naeroplane\t飞机\naerospace\t航天空间/航天技术\naesthetic\t美学的/审美的\naesthetics\t美学\naffair\t事件/事务\naffect\t影响/感动\naffected\t假装的/做作的\naffection\t影响/病\naffective\t情感的/表达感情的\naffiliate\t使紧密联系/使附属\naffiliation\t联系/从属关系\naffinity\t吸引/姻亲关系\naffirm\t断言/确认\naffirmation\t肯定/断言\naffirmative\t肯定的/赞成的\nafflict\t使苦恼/折磨\naffluence\t富裕/丰富\naffluent\t丰富的/富裕的\nafford\t买得起/足以\nafghanistan\t阿富汗\nafield\t离开着/偏离着\nafraid\t害怕的/恐怕的\nafrica\t非洲\nafrican\t非洲人\nafter\t在...之后/由于\naftermath\t结果/后果\nafternoon\t午后/下午\nafterward\t然后/后来\nafterwards\t然后/后来\nagain\t再一次/又\nagainst\t反对/对着\nage\t年龄/老年\naged\t老的/陈的\nageing\t变老/成熟\nagency\t代理机构/经销商\nagenda\tpl.议程/日常工作事项\nagent\t代理商/政府代表\naggravate\t使恶化/使更严重\naggregate\t合计/总计\naggression\t侵犯/侵略\naggressive\t侵略的/挑畔的\naggressively\t侵略/侵犯\naging\t老化/变陈\nagitation\t激动/焦虑\nagnes\t艾格尼丝\nago\t以前\nagony\t极大的痛苦/挣扎\nagree\t同意/赞成\nagreeable\t令人愉快的/同意的\nagreed\t同意的/通过协议的\nagreement\t同意/合约\nagricultural\t农业的\nagriculture\t农业\nah\tinterj.啊/哈\naha\tinterj.啊哈\nahead\t领先的/预先的\nahmed\t艾哈迈德\naid\t帮助/外援\naide\t助手/副官\naids\t爱滋病\nailment\t病痛/疾病\naim\t目标/瞄准\nair\t空气/旋律\nairborne\t升空的/空运的\naircraft\t航空器/飞机\nairfield\t飞机场\nairline\t航线/航线的设备\nairmail\t航空邮件\nairplane\t飞机\nairport\t飞机场\nairspace\t空域/空间\nairway\t空中航线/风道\naisle\t走廊/侧廊\nakin\t同类的/同族的\nalain\t阿兰\nalan\t艾伦\nalarm\t惊恐/警报\nalarmed\t受惊的/焦虑的\nalarming\t使人惊恐的/引起惊恐的\nalas\tinterj.唉\nalbania\t阿尔巴尼亚\nalbeit\t尽管/虽然\nalbert\t艾伯特\nalbum\t粘贴簿/唱片套\nalcohol\t酒精/酒\nalcoholic\t酒鬼/酒精中毒者\nalcoholism\t酗酒/酒精中毒\nale\t麦芽酒\nalec\t亚历克\nalert\t警觉的/灵敏的\nalexander\t亚历山大\nalexandra\t亚历山德拉\nalexei\t人名/(捷\nalfred\t阿尔佛雷德\nalga\t藻类/海藻\nalgae\tpl.藻类/海藻\nalgebra\t代数学\nalgeria\t阿尔及利亚\nalgorithm\t算法\nalien\t外国人/外侨\nalienate\t使疏远/离间\nalienation\t疏远/离间\nalign\t排列/排成一行\nalignment\t队列/结盟\nalike\t相似的/同样的\nalison\t艾莉森\nalive\t活着的/活泼的\nall\t所有的/全部的\nallan\t艾伦\nallegation\t断言/主张\nallege\t宣称/主张\nalleged\t被断言的/所谓的\nallegedly\t依其申述\nallegiance\t忠贞/效忠\nallen\t艾伦\nallergic\t对...过敏的/极反感的\nallergy\t变应性/反感\nalleviate\t减轻/使缓和\nalley\t小路/巷\nalliance\t联盟/联合\nallied\t联盟的/联姻的\nalligator\t短吻鳄\nallocate\t分派/分配\nallocation\t配置/分配\nallotment\t分配/拨款\nallow\t允许/同意给予\nallowance\t津贴/零用钱\nalloy\t合金\nallude\t暗指/提及\nally\t同盟者/同盟国\nalmighty\t万能的/全能的\nalmond\t杏仁\nalmost\t几乎/差不多\nalone\t孤独的/单独的\nalong\t平行地/向前\nalongside\t在旁边/靠拢着\naloud\t出声地/大声地\nalpha\t希腊字母表的第一个字母/最初\nalphabet\t字母\nalpine\t高山的/高山生长的\nalps\t阿尔卑斯山脉\nalready\t已经/早已\nalright\t没问题的\nalso\t也/并且\naltar\t圣坛/祭坛\nalter\t改变\nalteration\t变更/改动\naltered\t改变的\nalternate\t交替的/轮流的\nalternative\t两者择一/供替代的选择\nalternatively\t非此即彼\nalthough\t虽然/尽管\naltitude\t高度/海拔\naltogether\t完全地/总而言之\nalton\t奥尔顿\naluminium\t铝\naluminum\t铝\nalumnus\t男毕业生/男校友\nalways\t总是/始终\nam\tbe的单数第一人称\namanda\t阿曼达\namass\t积聚/堆积\namateur\t业余爱好者/外行\namaze\t使吃惊\namazed\t吃惊的/惊奇的\namazement\t惊愕/惊异\namazing\t令人惊异的\namazingly\t令人惊讶地/惊奇地\nambassador\t大使\nambient\t周围的\nambiguity\t不明确/含糊\nambiguous\t不明确的/模棱两可的\nambition\t野心/志向\nambitious\t有野心的/抱负不凡的\nambivalence\t矛盾情绪\nambulance\t救护车\namend\t修改/改善\namendment\t修订/改善\namends\t赔偿\namenities\t令人愉快之事物\namenity\t便利设施/适意\namerica\t美洲/美国\namerican\t美国人\namericas\t美洲\namid\t在其间/在其中\namidst\t在...当中\namino\t氨基的\namiss\t有毛病的/出差错的\nammunition\t军火/弹药\namnesty\t大赦/赦免\namong\t在...之中\namongst\t在...当中/在...之间\namount\t总数/总额\namp\t安培\nampere\t安培\nample\t大量的/充足的\namplifier\t扩大的人/放大器\namplify\t增强/放大\namplitude\t广阔/充足\namsterdam\t阿姆斯特丹\namuse\t消遣/娱乐\namused\t愉快的/被逗乐的\namusement\t兴味/娱乐\namusing\t有趣的/引人发笑的\namy\t艾米\nan\t一\nanaesthetic\t麻醉剂/麻药\nanal\t肛门的/肛门附近的\nanalogous\t类似的/相似的\nanalogue\t类似物/相似情况\nanalogy\t相似/类似\nanalyse\t分析/细察\nanalysis\t分析\nanalyst\t分析者/精神分析学家\nanalytic\t分析的/善于分析的\nanalytical\t分析的/善于分析的\nanalyze\t分析/细察\nanatomy\t剖析/解剖学\nanc\t非洲民族会议/美国新闻社\nancestor\t祖先/祖宗\nancestral\t祖先的/祖传的\nanchor\t锚\nancient\t古代的/古老的\nand\t和/与\nanderson\t安德森市/安德森\nandrew\t安德鲁\nandrews\t安德鲁斯\nandy\t安迪\nanecdote\t轶事/奇闻\nangel\t天使/守护神\nangela\t安吉拉\nangeles\t安杰利斯/天使城\nanger\t忿怒\nangle\t角/角度\nangler\t钓鱼/攫取\nanglia\t英格兰的拉丁名称\nanglican\t盎格鲁人\nangrily\t愤怒地\nangry\t生气的/愤怒的\nanguish\t剧痛/痛苦\nangus\t安格斯\nanimal\t动物\nanimated\t活生生的/能活动的\nanimation\t活泼/生气\nankle\t踝\nann\t安\nanna\t安娜\nanne\t安妮\nannie\t安妮\nanniversary\t周年纪念\nannounce\t宣布/声称\nannouncement\t公告/发表\nannouncer\t节目报告员/宣告者\nannoy\t使恼怒/骚扰\nannoyance\t烦恼/打扰\nannoyed\t恼怒的/烦闷的\nannoying\t恼人的/讨厌的\nannual\t年刊/年报\nannually\t一年一次/每年\nanode\t阳极\nanomaly\t不规则/反常事物\nanonymity\t匿名/姓氏不明\nanonymous\t姓氏不详的/无名的\nanother\t另外的/再一的\nanswer\t答案/回答\nant\t蚂蚁\nantarctic\t南极的/南极地带的\nantarctica\t南极洲\nantenna\t天线/触须\nanthem\t圣歌/赞美诗\nanthony\t安东尼\nanthrax\t炭疽\nanthropologist\t人类学家\nanthropology\t人类学\nantibiotic\t抗生素\nantibody\t抗体\nanticipate\t预期/占先\nanticipated\t预期的/期望的\nanticipation\t预期/预料\nantigen\t抗原\nantique\t古董/古物\nantiquity\t古老/古代\nantisocial\t不爱社交的/反社会的\nantonio\t安东尼奥\nanxiety\t焦虑/忧虑\nanxious\t忧虑的/发愁的\nanxiously\t忧虑地/不安地\nany\t任何的\nanybody\t任何人\nanyhow\t无论如何/至少\nanymore\t再也不/不再\nanyone\t任何人\nanything\t任何事\nanyway\t无论如何/至少\nanywhere\t无论何处\napart\t成零碎/成距离\napartheid\t种族隔离\napartment\t房间/公寓\nape\t无尾猿\napiece\t就每个而论/各\napologise\t道歉\napologize\t道歉/辩解\napology\t道歉/辩护\napostle\t基督十二使徒之一/早期基督教传士\nappalled\t惊骇的/丧胆的\nappalling\t骇人的/令人震惊的\napparatus\t装置/器具\napparel\t衣服/外表\napparent\t清晰可见的/显然的\napparently\t表面上/清楚地\nappeal\t恳求/诉请\nappealing\t有感染力的/动人的\nappear\t出现/显得\nappearance\t出现/露面\nappellant\t上诉人\nappendix\t附录/附加物\nappetite\t食欲/欲望\nappetizer\t开胃食品/吊胃口的东西\napplaud\t拍手喝彩/称赞\napplause\t鼓掌/喝彩\napple\t苹果/家伙\nappliance\t器械/用具\napplicable\t合适的/可应用的\napplicant\t申请者\napplication\t应用/申请\napplied\t应用的\napply\t涂/应用\nappoint\t任命/指定\nappointment\t约会/委任的职位\nappraisal\t评价/估价\nappraise\t评价/估价\nappreciable\t可感知的/可评估的\nappreciate\t赏识/鉴别\nappreciation\t感激/赏识\napprehension\t理解/忧惧\napprentice\t学徒/生手\napprenticeship\t学徒身分/见习\napproach\t接近/入门\nappropriate\t适当的\nappropriately\t适当的/恰如其分的\nappropriation\t拨用/挪用\napproval\t赞成/批准\napprove\t赞同/核准\napproved\t被认可的/经过检验的\napproximate\t大约的/接近的\napproximately\t大约/大致\napril\t四月\napron\t围裙\napt\t有...倾向的/易于的\naquarium\t水族馆/养鱼池\naquatic\t水生动物/水生植物\naquitaine\t阿基坦\narab\t阿拉伯人/阿拉伯马\narabia\t阿拉伯半岛\narabian\t阿拉伯的/阿拉伯人的\narabic\t阿拉伯语\narbitrary\t任意的/武断的\narbitration\t仲裁/公断\narc\t弧/弧形\narcade\t拱廊/拱形建筑物\narch\t拱门/拱形\narchaeological\t考古学的/考古学上的\narchaeologist\t考古学家\narchaeology\t考古学\narchbishop\t大主教\narchitect\t建筑师/设计者\narchitectural\t有关建筑的/建筑学的\narchitecture\t建筑学/建筑式样\narchive\t把...存档\narctic\t北极的/极寒的\nare\tbe的现在时复数或第二人称单数\narea\t区域/面积\narena\t角斗场/舞台\nargentina\t阿根廷\narguably\t可论证地/可争辩地\nargue\t提出理由/争论\nargument\t争论/论证\narise\t站立/出现\naristocracy\t贵族/上层社会\naristocratic\t贵族的/主张贵族统绐的\narithmetic\t算术/算术知识\narm\t手臂/袖子\narmchair\t扶手椅\narmed\t有扶手的/武装的\narmor\t盔甲/潜水服\narmored\t装甲的\narmour\t甲胄/装甲\narmoured\t装甲的\narmy\t军队/陆军\narnold\t阿诺德\naroma\t浓香/香气\naround\t包围/在...周围\narousal\t奋发/激励\narouse\t唤醒/鼓励\narrange\t安排/排列\narrangement\t排列/整齐\narray\t排列/衣服\narrears\t逾期债款/欠帐\narrest\t逮捕/监禁\narrival\t到达/抵达\narrive\t到达/抵达\narrogance\t傲慢态度/自大\narrogant\t自大的/傲慢的\narrow\t箭/箭状物\narse\t屁股\narsenal\t兵工厂/军械库\nart\t艺术/人文科学\nartefact\t人工制品/制造物\nartery\t动脉/干道\narthritis\t关节炎\narthur\t亚瑟/亚瑟王（传说中六世纪前后英\narticle\t文章/冠词\narticulate\t发音清晰的/口才好的\nartifact\t人工制品\nartificial\t人造的/假的\nartillery\t火炮/炮兵\nartisan\t工匠/技工\nartist\t艺术家/画家\nartistic\t艺术的/艺术家的\nartwork\t插图/艺术作品\nas\t同样地/例如\nasbestos\t石棉\nascend\t上升/追溯\nascent\t上升/提高\nascertain\t确定/查明\nascii\t美国信息交换标准码\nascribe\t归因于/归咎于\nash\t灰/灰烬\nashamed\t惭愧的/羞耻的\nashdown\t人名/阿什当\nashley\t艾希莉\nashore\t向岸/在岸上\nashton\t阿什顿\nasia\t亚洲\nasian\t亚洲人\naside\t小声说的话/旁白\nask\t问/要求\nasleep\t睡着的/长眠的\nasparagus\t芦笋\naspect\t外观/方面\nasphalt\t柏油\naspiration\t热望/志向\naspire\t渴望/立志于\naspirin\t阿斯匹林\nass\t驴/傻瓜\nassassin\t暗杀者/刺客\nassassinate\t暗杀/行刺\nassassination\t暗杀\nassault\t攻击/袭击\nassay\t试验/化验\nassemblage\t集合/装配\nassemble\t集合/收集\nassembly\t与会者/集会\nassent\t赞成\nassert\t主张/坚称\nassertion\t断言/主张\nassertive\t武断的/过分自信的\nassess\t估定/对...征税\nassessment\t评估/估定\nassessor\t辅佐人/顾问\nasset\t资产/有益的东西\nasshole\t屁眼儿/肛门\nassign\t分配/指派\nassignment\t分配/功课\nassimilate\t使同化/吸收\nassimilation\t同化/同化作用\nassist\t帮助/协助\nassistance\t协助/援助\nassistant\t助手/助理\nassociate\t同伴/伙伴\nassociated\t联合的\nassociation\t协会\nassorted\t各种各样的/分类的\nassortment\t分类/各种各样\nassume\t假定/承担\nassumption\t假定/自负\nassurance\t保证/把握\nassure\t保证/使确信\nassured\t确定的/自信的\nasteroid\t小行星/海盘车\nasthma\t哮喘\naston\t阿斯顿\nastonish\t使惊讶\nastonished\t吃惊的\nastonishing\t令人惊讶的\nastonishment\t惊异/惊愕\nastronaut\t太空旅行者/宇航员\nastronomer\t天文学家\nastronomical\t天文学的/庞大的\nastronomy\t天文学\nasylum\t庇护/收容所\nat\t在/向\nathelstan\t阿瑟尔斯坦\nathens\t雅典\nathlete\t运动员/运动选手\nathletic\t运动的\nathletics\t体育运动\natkinson\t阿特金森\natlantic\t大西洋\natmosphere\t大气/空气\natmospheric\t大气的\natom\t原子/核能\natomic\t原子的/原子能的\natop\t在顶上\natrocity\t残暴/凶恶\nattach\t附上/使依附\nattachment\t连接/附属物\nattack\t攻击/抨击\nattacker\t攻击者\nattain\t达到/获得\nattainment\t达到\nattempt\t尝试/企图\nattempted\t企图的/未遂的\nattend\t参加/照料\nattendance\t出席/出席的人数\nattendant\t随从/侍者\nattention\t注意/注意力\nattentive\t注意的/留心的\nattentively\t注意地/留心地\nattest\t证明/表明\nattic\t阁楼/顶楼\nattitude\t态度/看法\nattorney\t代理人/律师\nattract\t吸引/诱惑\nattraction\t吸引/吸引人的事物\nattractive\t吸引人的/有魅力的\nattributable\t可归于...的\nattribute\t属性/标志\nattribution\t归因\nauckland\t奥克兰\nauction\t拍卖\naudience\t听众/观众\naudio\t音频的/声音的\naudit\t审计/查帐\nauditor\t审计员/听者\nauditorium\t听众席/礼堂\naug\t八月\naugment\t增加/增长\naugust\t八月\nauguste\t笨拙型马戏团小丑\naunt\t阿姨/姨妈\nauntie\t阿姨/姨妈\naura\t气氛/气味\naural\t耳的/听觉的\naustin\t奥斯丁/英国制汽车牌名\naustralia\t澳洲/澳大利亚\naustralian\t澳大利亚人\naustria\t奥地利\naustrian\t奥地利人\nauthentic\t可靠的/可信的\nauthenticity\t可靠性/真实性\nauthor\t作家/作家的著作\nauthorise\t授权/批准\nauthoritarian\t独裁的/独裁主义的\nauthoritative\t权威性的/官方的\nauthority\t权力/当权者\nauthorization\t授权/许可\nauthorize\t授权/批准\nautism\t孤独症\nauto\t汽车\nautobiography\t自传\nautograph\t亲笔/亲笔签名\nautomaker\t<美>汽车制造商\nautomate\tvi.自动化\nautomated\t自动化的/机械化的\nautomatic\t自动手枪/自动机械\nautomatically\t自动地/机械地\nautomation\t自动化/自动操作\nautomobile\t汽车\nautomotive\t汽车的\nautonomous\t自治的\nautonomy\t自治/自治权\nautopsy\t验尸\nautumn\t秋天/成熟期\nauxiliary\t辅助者/辅助物\navail\t有用/有利\navailability\t有效性/可利用性\navailable\t可利用的/可获得的\navenue\t大街/途径\naverage\t平均/平均数\navert\t转开/避免\naviation\t航空/航空学\navid\t渴望的/急切的\navoid\t避免/防止\navoidance\t避免/避开\navon\t埃文河/雅芳\nawait\t等候\nawake\t醒着的\nawaken\t唤醒/唤起\naward\t奖品/裁定\naware\t知道的/有觉悟的\nawareness\t意识/认识\naway\t离去\nawe\t敬畏\nawesome\t引起敬畏的/可怕的\nawful\t可怕的/庄严的\nawfully\t恶劣地/非常地\nawhile\t片刻/一会儿\nawkward\t笨拙的/棘手的\nax\t斧头\naxe\t斧/斧头\naxial\t轴的/成轴的\naxis\t轴\naxle\t轴/车轴\naye\t赞成票/投赞成票者\nba\t文学士\nbabe\t小孩/天真幼稚的人\nbaby\t婴孩\nbach\t单身汉\nbachelor\t单身汉/学士\nback\t后面的\nbackache\t背痛\nbackbone\t脊椎/志气\nbackdrop\t背景幕/背景\nbacker\t援助者/支持者\nbackground\t背景/背景资料\nbacking\t后退/衬背\nbacklash\t后冲/强烈反对\nbackpack\t远足用的背包/双肩背包\nbackup\t倒车/后退\nbackward\t向后地/相反地\nbackwards\t向后\nbackyard\t后院/后庭\nbacon\t熏猪肉\nbacteria\tpl.细菌\nbacterial\t细菌的\nbacterium\t细菌\nbad\t坏的\nbadge\t徽章/标记\nbadger\t獾/獾皮毛\nbadly\t严重地/恶劣地\nbadminton\t羽毛球运动\nbaffle\t困惑/为难\nbag\t袋子/袋状物\nbaggage\t行李\nbaghdad\t巴格达\nbail\t保释/拎环\nbailey\t城郭/外栅\nbait\t饵\nbake\t烘焙/烤\nbaked\t烘焙的/烤的\nbaker\t面包师\nbakery\t面包店\nbaking\t烘焙/一次烘焙的量\nbalance\t平衡/差额\nbalanced\t公平的/平衡的\nbalcony\t阳台/戏院楼厅\nbald\t秃头的/光秃的\nbaldwin\t鲍尔温苹果/鲍尔温\nball\t球/舞会\nballad\t歌谣\nballet\t芭蕾舞\nballistic\t弹道的\nballoon\t气球\nballot\t投票/投票用纸\nballpark\t棒球场/活动领域\nballpoint\t圆珠笔\nballroom\t舞厅/跳舞场\nbamboo\t竹子\nban\t禁令\nbanana\t香蕉\nband\t带子/队\nbandage\t绷带\nbandit\t强盗\nbang\t重击/突然巨响\nbangladesh\t孟加拉国\nbangor\t班格尔\nbanish\t驱逐/消除\nbank\t银行/堤\nbanker\t银行家/庄家\nbanking\t银行业务\nbankrupt\t破产者\nbankruptcy\t破产者\nbanner\t旗帜\nbanquet\t宴会\nbaptism\t浸礼/洗礼\nbaptist\t施洗礼者/浸礼会教友\nbar\t条/棒\nbarbara\t芭芭拉\nbarbecue\t烤肉\nbarber\t理发师\nbarbershop\t理发店\nbarcelona\t巴塞罗那\nbarclays\t巴克莱银行（公司名/财富500强\nbare\t赤裸的/缺少的\nbarefoot\t赤脚的\nbarely\t几乎不\nbargain\t交易/买卖协定\nbargaining\t讨价还价/谈判\nbarge\t驳船\nbark\t树皮/吠声\nbarley\t大麦\nbarn\t谷仓\nbarnes\t巴尔内斯\nbarnett\t巴奈特\nbarometer\t气压计\nbaron\t男爵\nbaroque\t巴罗克风格/巴罗克式\nbarracks\t兵营/营房\nbarrage\t弹幕/掩护炮火\nbarrel\t桶\nbarren\t不育的/贫瘠的\nbarrett\t巴雷特\nbarrier\t障碍/栅栏\nbarrister\t出庭律师/律师\nbarry\t巴里\nbartender\t酒保/酒吧侍者\nbarton\t庄园内的农场/农家庭院\nbasal\t基础的/基本的\nbase\t底部/垒\nbaseball\t棒球\nbaseline\t基线/基准\nbaseman\t守垒员\nbasement\t地下室/墙脚\nbash\t猛击/打坏\nbasic\t基本原理/要素\nbasically\t基本上/主要地\nbasics\t最简单但最重要的部分/基本\nbasil\t罗勒属植物\nbasin\t盆/盆地\nbasis\t基础/主要成分\nbasket\t篮/篮子\nbasketball\t篮球\nbass\t低沉的声音/男低音\nbastard\t私生子/劣货\nbat\t蝙蝠/球棒\nbatch\t一次所烘的面包/一次所制之量\nbates\t贝茨\nbath\t沐浴/浴室\nbathe\t沐浴/用水洗\nbathrobe\t浴衣\nbathroom\t浴室/厕所\nbathtub\t浴缸\nbatsman\t击球手\nbattalion\t营/军队\nbatter\t连续猛打/猛击\nbattered\t磨损的/弄垮的\nbattery\t电池/殴打\nbattle\t战役\nbattlefield\t战场/沙场\nbattleground\t战场/战地\nbaxter\t巴克斯特\nbay\t海湾/狗吠声\nbazaar\t集市/市场\nbbc\t英国广播公司\nbe\t是/表示\nbeach\t海滩\nbead\t珠子/滴\nbeam\t横梁/杆\nbean\t豆子\nbeancurd\t豆腐\nbear\t熊\nbeard\t胡须\nbearded\t有须的/有胡子的\nbearer\t带信人/票据持有人\nbearing\t举止/轴承\nbeast\t畜生/动物\nbeat\t心跳/打\nbeaten\t被打败了的/筋疲力竭的\nbeating\t打/挫败\nbeautiful\t美丽的\nbeautifully\t美好地/漂亮地\nbeauty\t美/美人\nbecause\t因为\nbeck\t点头示意/招手\nbeckon\t招手示意/召唤\nbecome\t变成/变得\nbed\t床/睡眠处\nbedclothes\t铺盖/床上用品\nbedding\t被褥/寝具\nbeddings\t寝具/[建]基床\nbedford\t贝德福德/贝德福德\nbedroom\t卧室\nbedside\t床边\nbedtime\t就寝时间\nbee\t蜜蜂/聚会\nbeech\t山毛榉\nbeef\t牛肉/肌肉\nbeehive\t蜂窝/蜂箱\nbeer\t啤酒\nbeet\t甜菜\nbeethoven\t贝多芬\nbeetle\t甲虫/大槌\nbefore\t在...之前\nbeforehand\t预先\nbeg\t乞求/乞讨\nbeggar\t乞丐\nbegin\t开始\nbeginner\t初学者\nbeginning\t开始\nbehalf\t利益/方面\nbehave\t举止端正/行为规矩\nbehavior\t行为/举止\nbehavioral\t行为的\nbehaviour\t行为/举止\nbehavioural\t行为的\nbehind\t在后地\nbeing\t存在/性质\nbeirut\t贝鲁特\nbelfast\t贝尔法斯特\nbelgian\t比利时人\nbelgium\t比利时\nbelief\t信念/相信\nbelieve\t相信\nbeliever\t信徒\nbelinda\t贝琳达\nbell\t铃/钟\nbella\t贝拉（女子名/等于Arabell\nbelly\t腹部/食欲\nbelong\t属于/合适\nbelongings\t财产/所有物\nbeloved\t心爱的\nbelow\t在下面\nbelt\t带子/地带\nben\t内室\nbench\t长椅子\nbend\t变弯曲/屈服\nbeneath\t在...下方\nbenedict\t新婚男人\nbeneficial\t有益的/受益的\nbeneficiary\t受惠者/受益人\nbenefit\t利益\nbenevolent\t善意的/慈善的\nbenign\t善良的/良性的\nbenn\t本\nbennett\t班尼特\nbenny\t安非他明\nbenson\t班森\nbent\t弯曲的/决心的\nbereavement\t丧亲/丧友\nberkeley\t伯克利/贝克莱\nberkshire\t巴克夏猪\nberlin\t柏林/柏林毛线\nbernard\t伯纳德\nbernice\t柏妮丝\nberry\t浆果\nbert\t伯特\nberth\t船岸之间的水区/锚地\nbeside\t在旁边\nbesides\t除...之外\nbest\t最好的\nbestow\t授予/使用\nbet\t打赌/赌注\nbeta\t希腊字母表的第二个字母\nbeth\t贝丝\nbetray\t出卖/背叛\nbetrayal\t背叛/辜负\nbetter\t较好的\nbetty\t贝蒂\nbetween\t在...之间\nbeverage\t饮料\nbeware\t小心/谨防\nbewilder\t使迷惑/使不知所措\nbewildered\t困惑的/晕眩的\nbeyond\t超过/在那一边\nbias\t偏见/斜纹\nbiased\t有偏见的\nbible\t圣经\nbiblical\t圣经的\nbibliography\t参考书目\nbicycle\t自行车\nbid\t出价\nbidder\t出价人/投标人\nbidding\t命令/邀请\nbig\t大的/重要的\nbike\t自行车/脚踏车\nbilateral\t有两边的/双边的\nbile\t胆汁/坏脾气\nbilingual\t双语的\nbill\t帐单/清单\nbillboard\t广告牌/布告板\nbilling\t节目次序/广告\nbillion\t十亿/十亿个\nbillionaire\t亿万富翁\nbilly\t警棍/伙伴\nbin\t容器/箱子\nbinary\t由两部分组成的/二进位的\nbind\t绑/约束\nbinding\t装订\nbingo\t宾戈/烈酒\nbinoculars\t双目镜/双筒镜\nbiochemistry\t生物化学\nbiodiversity\t生物多样性\nbiography\t传记\nbiological\t生物学的\nbiologist\t生物学家\nbiology\t生物学\nbiopsy\t活组织检查\nbiotech\t生物技术\nbiotechnology\t生物工艺学/生物技术\nbipartisan\t两党连立的\nbird\t鸟/羽毛球\nbirdcage\t鸟笼\nbirmingham\t伯明翰\nbirth\t出生/起源\nbirthday\t生日\nbirthplace\t诞生地\nbiscuit\t饼干\nbishop\t主教/象\nbit\t少量/马嚼子\nbitch\t母狗/母狼\nbite\t咬/一口\nbitten\tbite的过去分词\nbitter\t苦的/痛苦的\nbitterly\t怨恨地/悲痛地\nbitterness\t苦味/悲痛\nbizarre\t奇异的\nblack\t黑色/黑颜料\nblackboard\t黑板\nblackburn\t布莱克本/布力般流浪\nblackness\t黑/黑色\nblackpool\t黑潭\nblacksmith\t铁匠\nbladder\t膀胱/囊\nblade\t叶片/刀锋\nblake\t布莱克\nblame\t过失/责备\nblanche\t布兰奇\nbland\t温和的/乏味的\nblank\t空格/空白\nblanket\t毛毯/毯子\nblast\t一阵风/爆炸\nblaze\t火焰/烈火\nbleach\t漂白\nbleak\t萧瑟的/荒凉的\nbleed\t流血/悲痛\nbleeding\t出血/流血\nblend\t混合\nblender\t混合者/混合器\nbless\t祝福/祈佑\nblessed\t神圣的/受祝福的\nblessing\t祝福\nblind\t蒙蔽物/窗帘\nblindness\t盲目/失明\nblink\t眨眼/闪亮\nblizzard\t大风雪/暴风雪\nbloc\t集团\nblock\t街区/木块\nblockbuster\t巨型炸弹\nblog\t博客/部落格\nbloke\t小子/家伙\nblond\t金发的\nblonde\t亚麻色的/淡色的\nblood\t血/血统\nbloody\t血腥的/嗜杀的\nbloom\t花/开花\nblossom\t花/花开的状态\nblouse\t宽松的上衣\nblow\t吹/打击\nblue\t蓝色\nblueberry\t乌饭树\nblueprint\t蓝图/设计图\nbluff\t断崖/绝壁\nblunder\t大错/大失策\nblunt\t钝的/坦率的\nbluntly\t坦率地/率直地\nblur\t使模糊/弄脏\nblush\t脸红/羞愧\nbmw\t德国宝马汽车公司\nboard\t木板/甲板\nboarding\t木板\nboast\t吹牛\nboat\t船\nboating\t划船\nbob\t剪短/敲击\nbobby\t警察\nbodily\t身体的\nbody\t身体/人\nbodyguard\t保镖/护卫\nbog\t沼泽\nboil\t煮沸/沸腾\nboiler\t煮器/汽锅\nboiling\t沸腾的/激昂的\nbold\t大胆的\nboldly\t大胆地/显眼地\nbolster\t支持/长枕\nbolt\t门闩/螺钉\nbolton\t可用螺栓固定的\nbomb\t炸弹\nbomber\t轰炸机/投弹手\nbombing\t轰炸/投弹\nbond\t捆绑物/结合\nbonding\t结合/屏蔽接地\nbone\t骨头/骨\nbonfire\t大篝火/营火\nbonn\t波恩\nbonnet\t软帽\nbonus\t奖金/红利\nbony\t如骨的/多骨的\nbook\t书/书籍\nbookcase\t书架/书柜\nbooking\t预约演出合同\nbooklet\t小册子\nbookmark\t书签\nbookseller\t书商\nbookshelf\t书架\nbookshop\t书店\nbookstore\t书店\nboom\t繁荣/隆隆声\nboomer\t往来无定的临时工\nbooming\t急速发展的\nboost\t推进/吹捧\nbooster\t向前推的人/支持者\nboot\t长靴/踢\nbooth\t亭/摊棚\nboots\t擦靴的仆役/靴子\nborder\t边缘/边境\nbore\t令人讨厌的人/激浪\nbored\t无聊的/烦人的\nboredom\t厌烦/厌倦\nboring\t烦人的/无聊的\nboris\t鲍里斯\nborn\t天生的\nborough\t自治的市镇/区\nborrow\t借/借入\nborrower\t借用人/剽窃者\nbosnia\t波斯尼亚/波士尼亚\nbosnian\t波斯尼亚人\nbosom\t胸部/胸\nboss\t老板/上司\nboston\t波士顿\nboswell\t为好友或当代名人作传者\nbotanical\t植物学的\nbotany\t植物学\nboth\t两者的\nbother\t烦扰/迷惑\nbottle\t瓶子/酒瓶\nbottom\t底部\nbough\t大树枝\nboulder\t大圆石\nbounce\t跳/跳跃\nbound\t跃/回跳\nboundary\t边界/分界线\nbounty\t慷慨/宽大\nbouquet\t花束\nbourgeois\t中产阶级分子/商人\nbourgeoisie\t中产阶级/资产阶级\nbournemouth\t伯恩茅斯\nbout\t一回/回合\nboutique\t专卖流行衣服的小商店\nbow\t弓/眼睛框\nbowel\t肠/内脏\nbowl\t碗/木球\nbowler\t玩滚球的人/玩球戏的人\nbowling\t保龄球戏\nbox\t盒子/箱\nboxer\t拳师\nboxing\t拳击\nboy\t男孩\nboycott\t联合抵制\nboyfriend\t男朋友\nbra\t奶罩\nbrace\t支柱/曲柄\nbracelet\t手镯\nbracket\t支架/括弧\nbradford\t布拉德福德\nbrag\t吹牛\nbraid\t辫子/穗带\nbrain\t脑\nbrake\t刹车/阻碍\nbranch\t树枝/支店\nbrand\t商标/牌子\nbrandy\t白兰地酒\nbranson\t布兰森\nbrass\t黄铜/黄铜制品\nbrave\t勇敢的/美好的\nbravery\t勇敢\nbrazil\t巴西\nbrazilian\t巴西人\nbreach\t裂口/违背\nbread\t面包/生计\nbreadth\t宽度\nbreak\t休息/中断\nbreakdown\t崩溃/故障\nbreakfast\t早餐\nbreakthrough\t突破\nbreakup\t分裂/崩溃\nbreast\t胸部/乳房\nbreath\t呼吸/气息\nbreathe\t呼吸/生存\nbreathing\t呼吸/瞬间\nbreathless\t喘不过气来的/屏气的\nbreed\t种类/品种\nbreeder\t饲养员/养育员\nbreeding\t教养/生育\nbreeze\t微风/煤屑\nbrenda\t布伦达\nbrew\t酿造酒/酝酿\nbrewer\t制造者/泡制饮料的器皿\nbrewery\t啤酒厂/酿酒厂\nbrewing\t酿造/一次酿造的量\nbrian\t布莱恩\nbribe\t贿赂\nbrick\t砖块/积木\nbride\t新娘\nbridegroom\t新郎\nbridge\t桥/舰桥\nbridget\t布丽奇特/圣布里奇特（瑞典修女\nbridle\t马勒/约束\nbrief\t摘要/简报\nbriefcase\t公事包\nbriefing\t简报\nbriefly\t简短地/扼要地\nbrigade\t旅/队\nbright\t明亮的/聪明的\nbrighten\t变亮/活跃\nbrightly\t生辉地/明亮地\nbrightness\t光亮/明亮\nbrighton\t布赖顿\nbrilliance\t卓越/光辉\nbrilliant\t光辉的/灿烂的\nbrilliantly\t辉煌地/光亮地\nbrim\t边/边缘\nbring\t带来/产生\nbrink\t边缘/陡岸\nbrisk\t强烈的/寒冷而干燥的\nbriskly\t活泼地/精神勃勃地\nbristle\t刚毛/猪鬃\nbristol\t布里斯托尔\nbritain\t英国\nbritish\t英国的\nbriton\t大不列颠人/英国人\nbrittle\t易碎的/脆弱的\nbroad\t宽广的/辽阔的\nbroadcast\t广播/传播\nbroadcaster\t播送者/广播装置\nbroadcasting\t广播\nbroaden\t变宽/扩大\nbroadly\t宽广地/明白地\nbroadway\t百老汇大街\nbroccoli\t花椰菜\nbrochure\t小册子/小册\nbroken\t坏掉的/打破的\nbroker\t掮客/经纪人\nbrokerage\t经纪人/回扣\nbronze\t青铜/铜像\nbrood\t一窝/一伙\nbrook\t小溪\nbrooke\t布鲁克\nbroom\t扫帚/金雀花\nbroth\t原汁清汤/肉汤\nbrother\t兄弟\nbrotherhood\t手足情谊/兄弟关系\nbrow\t眉毛/额\nbrown\t褐色\nbrowning\t勃朗宁/勃朗宁自动手枪\nbrowse\t浏览/吃草\nbrowser\t吃嫩叶的动物/浏览书本的人\nbruce\t布鲁斯\nbruise\t青肿/挫伤\nbrunch\t早午餐\nbruno\t布鲁诺\nbrush\t刷子/毛笔\nbrussels\t布鲁塞尔\nbrutal\t残忍的/野蛮的\nbrutality\t残忍/无慈悲\nbrute\t畜生/残忍或好色之人\nbryan\t布赖恩\nbt\t英国电信\nbubble\t泡沫\nbuck\t元/雄鹿\nbucket\t桶\nbuckingham\t白金汉郡[英国英格兰郡名]\nbuckinghamshire\t白金汉郡[英国英格兰郡名]\nbuckle\t皮带扣/扣子\nbud\t芽/花蕾\nbuddhism\t佛教\nbuddhist\t佛教徒\nbuddy\t好朋友/伙伴\nbudget\t预算\nbudgetary\t预算的\nbuffalo\t水牛\nbuffer\t缓冲器/缓冲区\nbuffet\t自助餐/小卖部\nbug\t错误/虫\nbugger\t老兄/家伙\nbugle\t喇叭/号角\nbuild\t建立/建筑\nbuilder\t建立者\nbuilding\t建筑物/建筑\nbuildup\t发展/集结\nbulb\t球茎/电灯泡\nbulgaria\t保加利亚\nbulge\t胀/膨胀\nbulk\t大小/体积\nbulky\t庞大的\nbull\t公牛\nbullet\t子弹\nbulletin\t公告/布告\nbullshit\t胡说\nbully\t欺凌弱小者/土霸\nbum\t游荡者/懒鬼\nbump\t撞击/肿块\nbun\t小面包\nbunch\t串/束\nbundle\t捆/束\nbungalow\t平房\nbunk\t铺位/废话\nbunker\t煤仓/沙坑\nbuoyant\t有浮力的/心情愉快的\nburden\t负担/重载\nbureau\t局/办公处\nbureaucracy\t官僚/官吏\nbureaucrat\t官僚作风的人/官僚\nbureaucratic\t官僚的\nburger\t汉堡包\nburglar\t窃贼\nburglary\t夜盗行为/盗窃\nburial\t埋葬/葬礼\nburma\t缅甸\nburn\t烧/烧毁\nburner\t火炉/烧火的人\nburning\t燃烧的/象燃烧一样的\nburns\t络腮胡子\nburst\t破裂/突发\nburton\t复滑车\nburun\t人名/布伦\nbury\t埋葬/埋藏\nbus\t公共汽车\nbush\t矮树丛\nbushel\t蒲式耳\nbusiness\t生意/事情\nbusinessman\t商人/实业家\nbusinesswoman\t商人/办理实务的人\nbust\t半身像/胸部\nbusy\t忙碌的/热闹的\nbut\t除了\nbutcher\t屠夫/肉商\nbutler\t男管家/司膳总管\nbutt\t粗大的一头/烟头\nbutter\t奶油/黄油\nbutterfly\t蝴蝶\nbutton\t钮扣/按钮\nbuy\t买/获得\nbuyer\t买主/买方\nbuyout\t全部买下/买下\nbuzz\t嗡嗡声/流言\nby\t被/经\nbye\tinterj.再会/回头见\nbypass\t旁路\nbyrne\t伯恩\ncab\t出租车/出租汽车\ncabbage\t卷心菜\ncabin\t小屋/客舱\ncabinet\t橱柜/内阁\ncable\t电缆/海底电报\ncache\t隐藏所/隐藏的粮食或物资\ncactus\t仙人掌\ncadet\t军官学校学生\ncaesar\t恺撒/暴君\ncafe\t咖啡馆/酒店\ncafeteria\t自助餐厅\ncaffeine\t咖啡因/咖啡碱\ncage\t笼/牢房\ncairo\t开罗\ncake\t蛋糕/块\ncalcium\t钙\ncalculate\t计算/预测\ncalculation\t计算/考虑\ncalculator\t计算者/计算器\ncalculus\t结石/微积分学\ncalendar\t日历/日程表\ncalf\t小牛/小牛皮\ncalibration\t口径测定/刻度\ncalibre\t口径/才干\ncalifornia\t加利福尼亚\ncall\t呼叫/访问\ncalled\t被呼叫的\ncaller\t访客/召集员\ncalling\t职业/行业\ncalm\t平稳/风平浪静\ncalmly\t平静地/安静地\ncambodia\t柬埔寨\ncambridge\t剑桥\ncamel\t骆驼/打捞浮筒\ncamera\t照相机/摄影机\ncameron\t卡梅伦/隆\ncamp\t露营/帐篷\ncampaign\t战役/运动\ncampaigner\t从军者/老兵\ncampbell\t坎贝尔\ncamper\t露营者\ncamping\t野营/露营\ncampus\t校园/大学生活\ncan\t装罐\ncanada\t加拿大\ncanadian\t加拿大的\ncanal\t运河/水道\ncancel\t取消/撤消\ncancellation\t取消/作废\ncancer\t癌/恶性肿瘤\ncandid\t坦白的/率直的\ncandidacy\t候选人的地位/候选资格\ncandidate\t候选人/投考者\ncandle\t蜡烛\ncandy\t糖果/冰糖\ncane\t手杖/细长的茎\ncanned\t罐装的/录音的\ncannon\t大炮/加农炮\ncanoe\t独木舟/轻舟\ncanon\t教会法规/圣典\ncanopy\t天篷/遮篷\ncanteen\t水壶/军中俱乐部\ncanterbury\t坎特伯雷\ncanvas\t帆布/画布\ncanyon\t峡谷/海底悬崖\ncap\t盖子/帽子\ncapability\t能力/性能\ncapable\t有能力的/能的\ncapacitance\t电容\ncapacitor\t电容器\ncapacity\t容量/能力\ncape\t岬/海角\ncapital\t首都/大写字母\ncapitalism\t资本主义\ncapitalist\t资本家/资本主义者\ncapitalize\t以大写字母写/使资本化\ncapsule\t胶囊/蒴果\ncaptain\t船长/指挥官\ncaption\t说明/字幕\ncaptive\t俘虏/迷恋者\ncapture\t抓取/战利品\ncar\t汽车/客车\ncara\t卡拉\ncaravan\t旅行队/有篷顶的大车\ncarbohydrate\t碳水化合物/糖类\ncarbon\t碳/副本\ncarbonate\t碳酸盐\ncarcass\t尸体\ncarcinoma\t癌\ncard\t卡片/纸牌\ncardboard\t薄纸板\ncardiac\t心脏病患者/强心剂\ncardiff\t加的夫\ncardinal\t红衣主教/鲜红色\ncardiovascular\t心血管的\ncare\t小心/照料\ncareer\t事业/生涯\ncareful\t小心的/谨慎的\ncarefully\t小心地/谨慎地\ncaregiver\t照料者/护理者\ncareless\t粗心的/不关心的\ncarer\t负责照顾（老人/病人\ncaretaker\t照顾者/看管者\ncargo\t货物\ncaribbean\t加勒比海\ncaring\t有同情心的/表示或感到关怀或关心\ncarl\t卡尔\ncarlisle\t卡莱尔\ncarlos\t卡洛斯\ncarol\t颂歌/欢乐的歌\ncaroline\t凯若琳\ncarolyn\t卡洛琳\ncarpenter\t木匠\ncarpet\t地毯/地毯状物\ncarr\t凯尔\ncarriage\t马车/客车\ncarrie\t卡丽\ncarrier\t运送者/邮递员\ncarrot\t胡萝卜\ncarry\t进位/射程\ncarson\t卡尔森\ncart\t二轮运货马车\ncartel\t卡特尔/企业联合\ncarter\t运货马车夫\ncarton\t硬纸盒/纸板箱\ncartoon\t卡通画/漫画\ncartridge\t弹药筒/弹药\ncarve\t雕刻/切开\ncarved\t有雕刻的\ncarving\t雕刻品/雕刻\ncase\t情形/情况\ncash\t现金\ncasino\t卡西诺赌场/卡西诺牌戏\ncasket\t首饰盒/小箱\ncassette\t盒式磁带/珠宝箱\ncast\t演员阵容/投掷\ncasting\t投掷/铸成品\ncastle\t城堡/象棋中的车\ncasual\t偶然的/不经意的\ncasually\t偶然地/临时地\ncasualty\t意外事故/伤亡\ncat\t猫/恶妇\ncatalog\t目录/大学概况手册\ncatalogue\t目录/大学情况一览\ncatalyst\t触媒/接触剂\ncatastrophe\t大灾难/大祸\ncatastrophic\t悲惨的/灾难的\ncatch\t捕捉/陷阱\ncatcher\t捕手/捕捉器\ncategorize\t分类/归类\ncategory\t种类/类项\ncater\t提供饮食及服务/投合\ncatering\t给养/承办酒席\ncatfish\t鲶鱼\ncathedral\t大教堂\ncatherine\t轮圈外缘装有倒钩的车轮/侧翻筋斗\ncatholic\t天主教徒\ncatholicism\t天主教的信仰\ncathy\t凯茜\ncattle\t牛/家畜\ncaucus\t领导人会议/核心会议\ncausal\t原因的/因果关系的\ncause\t原因/目标\ncaution\t小心/慎重\ncautious\t谨慎的/小心的\ncautiously\t慎重地\ncavalry\t骑兵\ncave\t洞/穴\ncavity\t洞/空穴\ncd\t镭射碟/镭射唱片\ncease\t停止\nceasefire\t停火/停战\ncecil\t塞西尔\ncedar\t雪松/香椿\nceiling\t天花板\ncelebrate\t庆祝/祝贺\ncelebrated\t驰名的/有名的\ncelebration\t庆祝/庆典\ncelebrity\t名声/名人\ncelery\t芹菜\ncelestial\t天的/天国的\ncelia\t西莉亚\ncell\t单元/细胞\ncellar\t地窖/地下室\ncellular\t细胞的\ncement\t水泥/胶结剂\ncemetery\t墓地/公墓\ncensor\t检查员\ncensorship\t检查制度\ncensus\t户口普查\ncent\t分\ncentenary\t一百年\ncenter\t中心/中心点\ncenterpiece\t中心装饰品/放在餐桌中央的摆饰\ncentigrade\t百分度的/摄氏的\ncentimetre\t厘米/公分\ncentral\t中央的/重要的\ncentralize\t集聚/集中\ncentralized\t集中的/中央集权的\ncentrally\t在中心/在中央\ncentre\t中心/中心点\ncentury\t世纪/百年\nceo\t首席执行官/执行总裁\nceramic\t陶瓷的\nceramics\t制陶术\ncereal\t谷类食品/谷类植物\ncerebral\t脑的/大脑的\nceremonial\t仪式\nceremony\t典礼/仪式\ncertain\t确定的/某一个的\ncertainly\t确定地\ncertainty\t确定/确实的事情\ncertificate\t证书/证明书\ncertification\t证明\ncertified\t证明合格的\ncertify\t证明/保证\nchain\t链/枷锁\nchair\t椅子/显要的席位\nchairman\t主席/会长\nchairwoman\t女主席/女议长\nchalk\t粉笔/白垩\nchallenge\t挑战/盘问\nchallenger\t挑战者\nchallenging\t挑战的/引起争论的\nchamber\t室/房间\nchamberlain\t内侍/管家\nchambers\t钱伯斯\nchamp\t大声地嚼/格格地咬\nchampagne\t香槟酒/香槟酒色\nchampion\t冠军/拥护者\nchampionship\t冠军身份/冠军称号\nchance\t机会/意外\nchancellor\t大臣/总理\nchange\t变化/找回的零钱\nchangeable\t可改变的\nchanged\t变化的/改变的\nchanging\t交换/兑换\nchannel\t海峡/航道\nchant\t圣歌/赞美诗\nchaos\t大混乱/混沌\nchaotic\t混乱的/无秩序的\nchap\t小伙子/颌\nchapel\t小教堂/礼拜式\nchaplain\t牧师\nchapman\t流动商贩/小贩\nchapter\t章/篇\ncharacter\t个性/字符\ncharacterise\t表示...的特性/成为/是...\ncharacteristic\t特性/特征\ncharacterization\t特性描述/人物之塑造\ncharacterize\t描绘...的特性/刻划...的性\ncharcoal\t木炭\ncharge\t指控/费用\ncharismatic\t魅力/能吸引大众的非凡能力\ncharitable\t大慈大悲的/宽厚的\ncharity\t慈悲/博爱\ncharles\t查尔斯\ncharlie\t通讯中用以代表字母C的词\ncharlotte\t水果奶油布丁\ncharlton\t查尔顿/爵敦小学\ncharm\t吸引力/魔力\ncharming\t迷人的/有吸引力的\nchart\t图表/海图\ncharter\t特许状/执照\nchartered\t特许的\nchase\t追求/狩猎\nchasm\t陷窟/裂口\nchat\t闲谈\nchatter\t饶舌/啁啾\ncheap\t便宜的/不值钱的\ncheaply\t便宜地\ncheat\t欺骗/作弊\ncheck\t检查/支票\nchecklist\t清单/选举人名单\ncheckpoint\t检查站\ncheek\t颊/厚颜\ncheer\t愉快/振奋\ncheerful\t快活的/高兴的\ncheerfully\t高高兴兴地\ncheers\tinterj.干杯/再见\ncheese\t乳酪\nchef\t厨师\nchelmsford\t切姆斯福德\nchelsea\t切尔西\ncheltenham\t切尔滕纳姆[英国英格兰西南部城市\nchemical\t化学药品\nchemist\t化学家/药剂师\nchemistry\t化学/化学过程\nchemotherapy\t化学疗法\ncheque\t支票\ncherish\t珍爱/怀有\ncherokee\t彻罗基族人\ncherry\t樱桃/樱桃树\ncheshire\t柴郡\nchess\t国际象棋\nchest\t胸/胸部\nchester\t切斯特/切斯特\nchestnut\t栗子/栗树\nchew\t咀嚼/嚼碎\nchic\t漂亮/别致的款式\nchicago\t芝加哥\nchick\t小鸡/小鸟\nchicken\t小鸡/鸡肉\nchief\t领袖/酋长\nchiefly\t主要地\nchild\t孩子/产物\nchildbirth\t分娩\nchildhood\t孩童时期\nchildish\t天真的/孩子气的\nchile\t智利\nchili\t干辣椒/辣椒粉\nchill\t寒冷/寒意\nchilly\t寒冷的/冷淡的\nchimney\t烟囱/灯罩\nchin\t下巴/颏\nchina\t中国/瓷器\nchinese\t中文/中国话\nchip\t屑片/薄片\nchips\t炸土豆条/小木片\nchlorine\t氯\nchocolate\t巧克力\nchoice\t选择/精选品\nchoir\t唱诗班/唱诗班的席位\nchoke\t窒息/阻塞\ncholesterol\t胆固醇\nchoose\t选择/宁愿\nchop\t肋条肉/排骨\nchopped\t砍/斩碎\nchopper\t切物之人/斧头\nchopsticks\t筷子\nchord\t弦/和音\nchore\t零工/家务\nchorus\t合唱队/齐声\nchosen\tchoose的过去分词\nchris\t克里斯/克莉丝\nchrist\t基督/救世主\nchristian\t基督徒/正派人\nchristianity\t基督教/基督教精神\nchristie\t克里斯蒂/挪威首都奥斯陆的旧称\nchristina\t克里斯蒂娜\nchristine\t克莉丝汀\nchristmas\t圣诞节\nchristopher\t克里斯多夫\nchromosome\t染色体\nchronic\t慢性的/习惯性的\nchronicle\t年代记/记录\nchuck\t抚弄/赶走\nchuckle\t咯咯的笑声/轻笑\nchunk\t大块/矮胖的人\nchurch\t教堂/礼拜\nchurchill\t邱吉尔\nchurchyard\t教堂墓地/教堂庭院\nchurn\t搅乳器\ncia\t中央情报局\ncid\t首领/英国刑事调查局\ncider\t苹果汁/苹果酒\ncigar\t雪茄\ncigaret\t纸烟/卷烟\ncigarette\t香烟/纸烟\ncilantro\t芫荽叶\ncinema\t电影院/电影\ncinnamon\t肉桂/肉桂树皮\ncircle\t圆周/社交圈\ncircuit\t电路/环道\ncircular\t圆形的/循环的\ncirculate\t流通/循环\ncirculation\t流通/循环\ncircumference\t圆周/周缘\ncircumstance\t环境/状况\ncircus\t马戏团/马戏\ncitation\t引用/引证\ncite\t引用/引证\ncitizen\t市民/公民\ncitizenship\t国籍/市民权\ncitrus\t柑橘属果树\ncity\t城市/市\ncivic\t市的/市民的\ncivil\t市民的/公民的\ncivilian\t平民/民法专家\ncivilisation\t文明/文明世界\ncivilised\t文明的\ncivilization\t文明/教化\ncivilize\t使开化/使文明\ncivilized\t文明的/有礼的\nclaim\t要求/要求权\nclaimant\t提出要求者/原告\nclaire\t克莱儿\nclamp\t夹钳\nclan\t氏族/宗族\nclap\t拍手/拍手声\nclara\t克拉拉\nclare\t克莱尔\nclarification\t澄清/净化\nclarify\t澄清/阐明\nclarity\t清楚/明晰\nclark\t克拉克\nclarke\t克拉克\nclash\t冲突/撞击声\nclasp\t扣子/钩\nclass\t班级/阶级\nclassic\t古典作品/杰作\nclassical\t古典的/正统派的\nclassification\t分类/分级\nclassified\t分类的/被归入某类的\nclassify\t分类/归类\nclassmate\t同班同学\nclassroom\t教室\nclatter\t咔嗒声/哗啦声\nclaudia\t克劳迪娅\nclause\t子句/条款\nclaw\t爪/螯\nclay\t泥土/肉体\nclean\t干净的/清白的\ncleaner\t清洁工人/清洁剂\ncleaning\t清洁/扫除\ncleanliness\t清洁/干净\ncleanup\t清除/暴利\nclear\t清楚的/明确的\nclearance\t清除/间隙\nclearing\t清扫/空地\nclearly\t清楚地\nclench\t牢牢抓住/钉紧\nclergy\t牧师/僧侣\nclergyman\t牧师\ncleric\t牧师的/教士的\nclerical\t牧师\nclerk\t办事员/职员\ncleveland\t克利夫兰\nclever\t聪明的/精明的\ncliche\t陈腔滥调/凸印版\nclick\t咔哒声/啪嗒声\nclient\t客户/顾客\ncliff\t悬崖/绝壁\nclifford\t克利福德\nclimate\t气候/社会趋势\nclimax\t高潮/极点\nclimb\t攀登/上升\nclimber\t登山者\nclimbing\t攀缘而登的/上升的\nclinch\t钉牢\ncling\t粘紧/附着\nclinic\t诊所/临床教学\nclinical\t临床的/门诊部的\nclinton\t克林顿\nclip\t修剪/夹子\nclive\t克莱夫\ncloak\t斗蓬/大氅\nclock\t时钟/计时器\nclockwise\t顺时针方向的\nclog\t障碍/脚坠\nclone\t无性系\nclose\t结束/完结\nclosed\t关闭的/限于少数人的\nclosely\t接近地\ncloser\t关闭者/闭合器\nclosest\t最靠近的\ncloset\t壁橱/小室\nclosing\t结束\nclosure\t关闭\ncloth\t布料/织品\nclothe\t给...穿衣/盖上\nclothes\t衣服\nclothing\t衣服\ncloud\t云/阴暗\ncloudy\t多云的/有愁容的\nclough\t深谷/峡谷\nclout\t敲击/破布\nclove\t丁香\nclown\t小丑/乡下人\nclub\t俱乐部/木棍\nclubhouse\t俱乐部会所\nclue\t线索/暗示\nclump\t丛/块\nclumsy\t笨拙的/不雅观的\ncluster\t串/丛\nclutch\t抓紧/掌握\nclyde\t克莱德\ncnaa\t全国学术奖理事会\ncoach\t四轮大马车/教练\ncoaching\t辅导/教练技术\ncoal\t煤/木炭\ncoalition\t结合体/结合\ncoarse\t粗糙的/下等的\ncoast\t海岸/滑坡\ncoastal\t海岸的/沿海的\ncoaster\t沿海航行者/贸易者/沿海航船\ncoastline\t海岸线\ncoat\t外套\ncoating\t涂层/上衣衣料\ncoax\t哄/诱骗\ncocaine\t可卡因/古柯碱\ncock\t公鸡/雄禽\ncockpit\t驾驶员座舱/战场\ncocktail\t鸡尾酒/开味品\ncocoa\t可可粉/可可茶\ncoconut\t椰子\ncod\t鳕/欺骗\ncode\t代码/密码\ncoefficient\t系数\ncoercion\t强迫/威压\ncoexist\t共存\ncoffee\t咖啡/咖啡色\ncoffin\t棺材/灵柩\ncognitive\t认知的/认识的\ncohen\t科恩\ncoherent\t互相耦合的/清晰的\ncohesion\t结合/黏聚\ncohort\t一群/步兵大队\ncoil\t线圈/盘绕\ncoin\t硬币/金钱\ncoincide\t一致/符合\ncoincidence\t巧合/同时发生\ncoke\t可口可乐/焦炭\ncol\t出口/山坳\ncolchester\t科尔切斯特\ncold\t感冒/寒冷\ncoldly\t冷淡地\ncole\t芸苔属植物/海甘蓝\ncoleman\t科尔曼\ncoleridge\t姓氏\ncolin\t科林\ncolitis\t结肠炎\ncollaborate\t合作/勾结\ncollaboration\t合作/勾结\ncollaborative\t合作的/协作的\ncollaborator\t合干者/合作者\ncollapse\t崩溃/倒塌\ncollar\t衣领/颈圈\ncolleague\t同事/同僚\ncollect\t收集/聚集\ncollection\t收集/采集\ncollective\t集体的/聚集的\ncollectively\t集合/聚合性\ncollector\t收集家/收取款项的人\ncollege\t学院/大学\ncollegiate\t学院的\ncollide\t碰撞/互撞\ncolliery\t煤矿\ncollins\t柯林斯酒\ncollision\t碰撞/冲突\ncolombia\t哥伦比亚\ncolon\t冒号/结肠\ncolonel\t陆军上校/长官\ncolonial\t殖民的/殖民地的\ncolonic\t结肠的\ncolonist\t殖民地居民/移民\ncolony\t殖民地/移民队\ncolor\t颜色/面色\ncolored\t染色的\ncolorful\t华美的/富有色彩的\ncolour\t颜色/面色\ncoloured\t有色的/有...色的\ncolourful\t颜色丰富的/鲜艳的\ncolouring\t着色/色彩\ncolumn\t专栏/圆柱\ncolumnist\t专栏作家\ncoma\t昏迷/麻木\ncomb\t头梳/鸡冠\ncombat\t争斗/战斗\ncombination\t组合/合并\ncombine\t联合/结合\ncombined\t结合的/组合的\ncombustion\t燃烧/骚动\ncome\t过来/来\ncomeback\t复原/复辟\ncomedian\t喜剧演员\ncomedy\t喜剧/有趣的事情\ncomer\t来的人/新来者\ncomet\t彗星\ncomfort\t舒适/安慰\ncomfortable\t舒服的/轻松的\ncomfortably\t安乐地/舒服地\ncomforting\t安慰的/令人鼓舞的\ncomic\t连环漫画/喜剧演员\ncoming\t来临\ncomma\t逗点/逗号\ncommand\t命令/指挥\ncommander\t司令官/指挥官\ncommanding\t指挥的/威风凛凛的\ncommando\t突击队/突击队员\ncommemorate\t纪念\ncommence\t开始/得学位\ncommend\t嘉奖/委托给\ncomment\t注解/批评\ncommentary\t注释/评论\ncommentator\t评论员/实况广播员\ncommerce\t商业/商务\ncommercial\t商业的/商用的\ncommercially\t商业上/通商上\ncommission\t委任状/任官令\ncommissioner\t委员/理事\ncommit\t委托/犯罪\ncommitment\t委托/交押\ncommitted\t献身于某种事业的\ncommittee\t委员会\ncommodity\t农产品/商品\ncommon\t通常的/共同的\ncommonly\t一般/普通\ncommonplace\t寻常事/老生常谈\ncommons\t平民/下议院\ncommonsense\t有常识的/一望而知的\ncommonwealth\t共和国/联邦\ncommunal\t公有的/公社的\ncommunicate\t显露/传达\ncommunication\t交流/交通\ncommunicative\t健谈的/爱说话的\ncommunion\t共享/交流\ncommunism\t共产主义\ncommunist\t共产主义者/共产党员\ncommunity\t社区/公众\ncommute\t交换/折偿\ncommuter\t乘公共车辆上下班者/月季票乘客\ncompact\t紧凑的/紧密的\ncompanion\t朋友/陪伴\ncompany\t公司/友伴\ncomparable\t可比较的/比得上的\ncomparative\t比较的/相对的\ncomparatively\t比较地/相对地\ncompare\t比较/比喻\ncomparison\t比较/对照\ncompartment\t分隔间/卧车包房\ncompass\t指南针/范围\ncompassion\t同情/怜悯\ncompassionate\t慈悲的/富于同情心的\ncompatibility\t兼容性\ncompatible\t能共处的/可并立的\ncompatriot\t同国人\ncompel\t强迫/迫使\ncompelling\t强制的/强迫性的\ncompensate\t偿还/补偿\ncompensation\t补偿/赔偿金\ncompete\t竞争/对抗\ncompetence\t胜任/职称\ncompetency\t足以使人过舒适生活的富裕收入/充\ncompetent\t能干的/胜任的\ncompeting\t相互矛盾的/抵触的\ncompetition\t竞争/竞赛\ncompetitive\t竞争的\ncompetitor\t竞争者\ncompile\t编译/编辑\ncompiler\t编辑者\ncomplacency\t满足/自鸣得意\ncomplain\t抱怨/抗议\ncomplaint\t诉苦/抱怨\ncomplement\t补足物/补语\ncomplementary\t补充的/补足的\ncomplete\t完全的/十足的\ncompleted\t完整的/完全的\ncompletely\t完全地/十分地\ncompletion\t完成\ncomplex\t综合体/情结\ncomplexion\t肤色/情况\ncomplexity\t复杂/复杂性\ncompliance\t遵从/顺从\ncomplicate\t弄复杂/使错综\ncomplicated\t复杂的\ncomplication\t复杂化/复杂情况\ncompliment\t称赞/恭维\ncomply\t顺从/依从\ncomponent\t元件/组件\ncompose\t组成/写作\ncomposer\t作曲家/作家\ncomposite\t合成的/混合成的\ncomposition\t作文/创作\ncompost\t混合物/堆肥\ncompound\t混合物/复合词\ncomprehend\t理解/包括\ncomprehension\t理解/包含\ncomprehensive\t广泛的/有理解力的\ncompress\t压缩/压紧\ncompression\t压缩/压紧\ncomprise\t包含/构成\ncompromise\t妥协/折中\ncompulsion\t强迫/强制\ncompulsory\t被强制的/强迫的\ncompute\t计算/估算\ncomputer\t电脑/电子计算机\ncomputerized\t电脑的/用电脑处理的\ncomrade\t同志/伙伴\ncon\t精读/仔细研究\nconceal\t隐藏/掩盖\nconcede\t承认/退让\nconceit\t自负/空想\nconceivable\t想得到的/可想象的\nconceive\t构思/认为\nconcentrate\t浓缩/精选\nconcentrated\t集中的/浓缩的\nconcentration\t集中/专心\nconcept\t观念/概念\nconception\t观念/概念\nconceptual\t概念的\nconcern\t关心/忧虑\nconcerned\t关心的/有关的\nconcerning\t关于\nconcert\t音乐会/和声\nconcerto\t协奏曲\nconcession\t特许/让步\nconcise\t简洁的/简明的\nconclude\t结束/作结论\nconclusion\t结论/结尾\nconclusive\t决定性的/确定性的\nconcrete\t凝结物/混凝土\nconcur\t同意/一致\ncondemn\t判刑/责备\ncondemnation\t非难/宣告有罪\ncondense\t使浓缩/使压缩\ncondition\t情况/条件\nconditional\t有条件的/有前提的\nconditioner\t调节器/土壤团粒结构促进剂\nconditioning\t调节/条件作用\ncondo\t共同统治/共管下的政府\ncondom\t避孕套\ncondominium\t共同统治\nconduct\t行为/举动\nconductor\t领导者/指挥者\ncone\t圆锥体/球果\nconfederation\t同盟/联盟\nconfer\t授予/带来\nconference\t会议\nconfess\t承认/坦白\nconfession\t承认/坦白\nconfide\t吐露/委托\nconfidence\t信心\nconfident\t有信心的/有把握的\nconfidential\t机密的/获他人信赖的\nconfidently\t自信地/安心地\nconfiguration\t结构/表面配置\nconfine\t限制/使不外出\nconfirm\t证实/确定\nconfirmation\t证实/证明\nconflict\t战斗/冲突\nconflicting\t冲突的/不一致的\nconform\t使一致/使遵守\nconformity\t遵照/适合\nconfront\t使面对/对抗\nconfrontation\t对抗/对质\nconfuse\t使混乱/使狼狈\nconfused\t困惑的/混乱的\nconfusing\t令人困惑的/混淆的\nconfusion\t混乱/混淆\ncongest\t使充满/使拥塞\ncongestion\t拥挤/充血\nconglomerate\t聚成球形的/砾岩性的\ncongratulate\t祝贺/庆贺\ncongratulation\t祝贺/恭喜\ncongratulations\t祝贺词/祝贺语\ncongregation\t集合/聚集\ncongress\t国会/会议\ncongressional\t会议的/议会的\ncongressman\t国会议员/众议院议员\nconjunction\t连接词/联合\nconjure\t念咒文召唤/变戏法\nconnect\t连接/联合\nconnected\t连接的/连贯的\nconnection\t连接/关系\nconnor\t康纳\nconnotation\t含蓄/内涵\nconquer\t克服/征服\nconqueror\t征服者/胜利者\nconquest\t战胜/征服\nconscience\t良心\nconscious\t有意识的/知觉的\nconsciously\t自觉地/有意识地\nconsciousness\t意识/知觉\nconsecutive\t连续的/联贯的\nconsensus\t合意/一致\nconsent\t同意/许可\nconsequence\t结果/重要性\nconsequent\t随后发生的事情/结果\nconsequently\t所以\nconservation\t保护/保存\nconservatism\t保守/守旧性\nconservative\t保守的/守旧的\nconservatory\t保存性的/有保存力的\nconserve\t蜜饯/果酱\nconsider\t考虑/思考\nconsiderable\t相当的/可观的\nconsiderably\t非常地/很\nconsiderate\t体贴的/体谅的\nconsideration\t考虑/原因\nconsidering\t就...而论\nconsist\t组成/存在于\nconsistency\t坚硬性/黏稠度\nconsistent\t一致的/坚持的\nconsistently\t坚固/坚实\nconsolation\t安慰/令人安慰的事物\nconsole\t安慰/藉慰\nconsolidate\t巩固/使联合\nconsolidation\t巩固/团结\nconsortium\t协会/合伙\nconspicuous\t显著的/显眼的\nconspiracy\t同谋/阴谋\nconspire\t阴谋/协力\nconstable\t治安官/警官\nconstance\t康士坦茨湖\nconstant\t常数/恒量\nconstantly\t不变地/不断地\nconstellation\t星座/荟萃\nconstituency\t选民/顾客\nconstituent\t成分/选民\nconstitute\t构成/组成\nconstitution\t构成/宪法\nconstitutional\t宪法的/立宪的\nconstrain\t强迫/限制\nconstraint\t强制/约束\nconstruct\t构造/建造\nconstruction\t建筑/构造\nconstructive\t建设性的/构造上的\nconstrue\t解释/分析\nconsul\t领事/执政官\nconsult\t商讨/商量\nconsultancy\t商量/协商\nconsultant\t顾问/征询意见者\nconsultation\t请教/咨询\nconsultative\t商议的/协议的\nconsulting\t商议的/咨询的\nconsume\t消耗/消费\nconsumer\t消费者\nconsumption\t消费/消费量\ncontact\t联系/交际\ncontain\t包含/容纳\ncontainer\t容器/集装箱\ncontainment\t抑制/牵制\ncontaminant\t污染物/沾染物\ncontaminate\t弄污/弄脏\ncontamination\t污染/污物\ncontemplate\t注视/沉思\ncontemporary\t同时代的人\ncontempt\t轻视/轻蔑\ncontemptuous\t轻蔑的/鄙视的\ncontend\t奋斗/斗争\ncontender\t参赛者/争论者\ncontent\t内容/满足\ncontention\t争论/争辩\ncontentious\t好争吵的/爱争论的\ncontest\t竞赛/争论\ncontestant\t竞争者\ncontext\t上下文/背景\ncontinent\t大陆/洲\ncontinental\t大陆的/洲的\ncontingency\t偶然性/可能性\ncontingent\t或许发生的/附随的\ncontinual\t持续不断的/继续的\ncontinually\t不断地/频繁地\ncontinuation\t继续/续集\ncontinue\t继续/延续\ncontinued\t继续的/延续的\ncontinuing\t继续的/持续的\ncontinuity\t连续性\ncontinuous\t连续的/继续的\ncontinuously\t不断地/连续地\ncontinuum\t连续统一体/连续统\ncontour\t轮廓\ncontract\t合约/婚约\ncontraction\t收缩/缩写式\ncontractor\t立契约的人/承包商\ncontractual\t契约的\ncontradict\t反驳/与...抵触\ncontradiction\t反驳/矛盾\ncontradictory\t反驳的/反对的\ncontrary\t相反的/矛盾的\ncontrast\t差别/对比\ncontrasting\t显出明显的差异/形成对比\ncontribute\t有助于/捐助\ncontribution\t捐助/捐助之物\ncontributor\t贡献者/捐助者\ncontrive\t发明/设计\ncontrived\t人造的/勉强的\ncontrol\t控制/管理\ncontrolled\t受约束的/克制的\ncontroller\t控制器/管理者\ncontroversial\t争论的/论争的\ncontroversy\t论争/辩论\nconvene\t集合/召集\nconvenience\t方便/便利的事物\nconvenient\t方便的/合宜的\nconveniently\t方便/合宜\nconvent\t女修道会\nconvention\t大会/协定\nconventional\t传统的/习惯的\nconverge\t聚合/集中于一点\nconvergence\t集中/收敛\nconversation\t会话/说话\nconverse\t相反的事物/倒\nconversely\t相反/逆\nconversion\t转变/转换\nconvert\t皈依者/改变宗教信仰者\nconvey\t传达/运输\nconvict\t囚犯/罪犯\nconvicted\t宣判有罪\nconviction\t定罪/信服\nconvince\t说服/使相信\nconvinced\t确信的/深信的\nconvincing\t使人信服的/有力的\nconvoy\t护送/护卫\ncook\t厨子/厨师\ncookbook\t食谱\ncooked\t精疲力竭的/被揍得昏厥的\ncooker\t炊事用具/炉灶\ncookery\t烹调法/烹调术\ncookie\t饼干/小甜点\ncooking\t烹饪\ncool\t凉爽/凉爽的空气\ncooler\t冷却器\ncooper\t制桶工人\ncooperate\t合作/协力\ncooperation\t合作/协力\ncooperative\t合作的/合作社的\ncoordinate\t同等的人/坐标\ncoordination\t同等/协调\ncoordinator\t协调者/同等的人或物\ncop\t警官\ncope\t竞争/应付\ncoping\t墙压顶/顶部\ncopper\t铜/警察\ncopy\t副本/摹仿\ncopyright\t版权/著作权\ncoral\t珊瑚/珊瑚色\ncorbett\t科比特\ncord\t绳索/束缚\ncordial\t兴奋剂/补品\ncordless\t无绳索的/交直流两用的\ncore\t核心/果心\ncork\t软木塞/软木树\ncorn\t玉蜀黍/谷类\ncorneliu\t人名/科尔内留\ncorner\t角落/转角\ncornerstone\t奠基石/基础\ncornwall\t康沃尔\ncoronary\t冠的/花冠的\ncoronation\t加冕礼\ncoroner\t验尸官\ncorporal\t下士\ncorporate\t社团的/合伙的\ncorporation\t公司/合作\ncorps\t军/队\ncorpse\t尸体\ncorpus\t主体/文集\ncorrect\t正确的/合适的\ncorrection\t订正/改正\ncorrectly\t对/正确\ncorrelate\t有相互关系的东西/相关物\ncorrelation\t相互关系/相关\ncorrespond\t符合/通信\ncorrespondence\t相符/通信\ncorrespondent\t通讯记者/通信者\ncorresponding\t相当的/一致的\ncorridor\t走廊/回廊\ncorrode\t使腐蚀/侵蚀\ncorrosion\t腐蚀/侵蚀\ncorrupt\t腐败的/贪污的\ncorruption\t腐败/堕落\ncos\t余弦\ncosmetic\t化妆品\ncosmic\t宇宙的/宇宙航行的\ncosmos\t宇宙/秩序\ncost\t代价/价值\ncosta\t肋骨/肋脉\ncostly\t昂贵的/奢华的\ncostume\t装束/服装\ncosy\t温暖舒适的\ncot\t行军床/小屋\ncottage\t小屋/茅舍\ncotton\t棉花\ncouch\t长沙发/睡椅\ncough\t咳嗽\ncould\t可以/能\ncoun\tcouncillor顾问/参赞\ncouncil\t会议/委员会\ncouncillor\t地方议会成员/议会委员\ncounsel\t商议/忠告\ncounseling\t咨询服务\ncounsellor\t顾问/辅导员\ncounselor\t顾问/参事\ncount\t计算/视为\ncounter\t计算器/计算者\ncounteract\t抵消/阻碍\ncounterpart\t副本/复本\ncounting\t计算\ncountless\t数不尽的/无数的\ncountry\t国家/乡村\ncountryman\t同胞/乡下人\ncountryside\t乡下地方/乡下居民\ncounty\t县/郡\ncoup\t砰然的一击/妙计\ncouple\t对/夫妇\ncoupon\t息票/赠券\ncourage\t勇气/胆量\ncourageous\t勇敢的/大胆的\ncourse\t课程/路线\ncourt\t法院/庭院\ncourteous\t彬彬有礼/谦恭的\ncourtesy\t礼貌/谦恭\ncourthouse\t法院/郡政府所在地\ncourtroom\t法庭/审判室\ncourtyard\t庭院/天井\ncousin\t堂兄弟姊妹/表兄弟姊妹\ncovenant\t契约/盟约\ncoventry\t考文垂\ncover\t盖子/封面\ncoverage\t覆盖的范围/保险总额\ncovered\t隐蔽着的/掩藏着的\ncovering\t覆盖物/掩蔽物\ncovert\t隐蔽的/偷偷摸摸的\ncow\t母牛/母兽\ncoward\t懦弱的人/胆小的人\ncowboy\t牛仔/牛郎\ncowley\t考利\ncox\t舵手\ncoyote\t丛林狼/讨厌的家伙\ncozy\t舒适的/安逸的\ncrab\t螃蟹/偏航\ncrack\t裂缝/爆裂声\ncrackdown\t制裁/镇压\ncracked\t破碎的/破裂的\ncracker\t饼干/爆竹\ncradle\t摇篮/发祥地\ncraft\t技艺/手艺\ncraftsman\t工匠/技工\ncraig\t克雷格\ncram\t塞满/填满\ncramped\t狭窄的/难懂的\ncranberry\t越橘\ncrane\t鹤/起重机\ncrank\t不稳的/脾气暴燥的\ncranston\t克兰斯敦\ncrap\t废物/废话\ncrash\t哗啦声/猛撞\ncrate\t板条箱/装货箱\ncrater\t火山口/环行山\ncrave\t渴望/热望\ncrawford\t克劳福德\ncrawl\t爬行/匍匐而行\ncrayon\t蜡笔/蜡笔画\ncrazy\t发狂的/狂热的\ncream\t乳酪/奶油\ncreamy\t含乳脂的/乳脂状的\ncreate\t创造/建造\ncreation\t创造/创作物\ncreative\t有创造力的/创作的\ncreativity\t创造力/创造性\ncreator\t上帝/创造者\ncreature\t人/动物\ncredential\t国书/凭据\ncredentials\t信任状/国书\ncredibility\t可信用/确实性\ncredible\t可信的/可靠的\ncredit\t信用/信任\ncreditor\t债权人\ncreed\t宗教信条/教义\ncreek\t小溪/小河\ncreep\t爬/徐行\ncrescent\t新月/新月形\ncrest\t冠/饰毛\ncrew\t全体人员/一群人\ncrib\t婴儿小床/食槽\ncricket\t蟋蟀/板球\ncricketer\t板球队员/玩板球者\ncrime\t犯罪/罪行\ncriminal\t罪犯/犯人\ncripple\t跛者/残废\ncrippling\t曲折/断裂\ncrisis\t危机/危险期\ncrisp\t脆的/新鲜的\ncriteria\tpl.标准\ncriterion\t标准/准则\ncritic\t批评家/鉴定家\ncritical\t批评的/决定性的\ncritically\t批评性地/审慎地\ncriticise\t批评/吹毛求疵\ncriticism\t批评/评论\ncriticize\t批评/吹毛求疵\ncritique\t评论文章/评论\ncroatia\t克罗地亚\ncroatian\t克罗地亚的/克罗地亚语的\ncrocodile\t鳄鱼\ncrohn\t克罗恩病/克隆病\ncrook\t钩/弯曲部分\ncrooked\t弯曲的/歪的\ncrop\t农作物/产量\ncross\t十字架/十字架形物件\ncrossing\t横越/横渡\ncrossroads\t十字路口/交叉路口\ncrouch\t蹲伏/蜷缩\ncrow\t啼叫/乌鸦\ncrowd\t群众/一伙人\ncrowded\t拥挤的/塞满的\ncrown\t王冠/王权\ncroydon\t克里登\ncrucial\t决定性的/重要的\ncrude\t天然的/未成熟的\ncruel\t残酷的/令人极痛苦的\ncruelty\t残酷/野蛮\ncruise\t巡航/巡弋\ncruiser\t巡洋舰/巡航飞机\ncrumb\t碎屑/面包屑\ncrumble\t粉碎/成为碎屑\ncrunch\t嘎吱嘎吱的咬嚼/压碎\ncrusade\t改革运动/十字军东侵\ncrush\t压碎/粉碎\ncrushed\t压碎的/倒碎的\ncrust\t外壳/坚硬外皮\ncruz\t克鲁兹\ncry\t叫声/哭声\ncrying\t叫喊的/嚎哭的\ncrypt\t土窖/地穴\ncrystal\t水晶/水晶装饰品\ncuba\t古巴\ncuban\t古巴的/古巴人的\ncube\t立方体/立方\ncubic\t立方体的/立方的\ncuckoo\t杜鹃鸟/布谷鸟\ncucumber\t黄瓜\ncue\t提示/线索\ncuff\t袖口/一巴掌\ncuisine\t烹调风格/烹调法\nculinary\t厨房的/烹调用的\nculminate\t到绝顶/达于极点\nculprit\t犯人/罪犯\ncult\t膜拜/礼拜式\ncultivate\t培养/耕作\ncultivation\t教化/培养\ncultural\t文化的/教养的\nculturally\t从文化角度/文化意义上\nculture\t文化/修养\ncumbria\t坎布里亚郡[英国英格兰郡名]\ncumulative\t累积的\ncunning\t狡猾的/巧妙的\ncunningham\t坎宁安\ncup\t杯子/茶杯\ncupboard\t食橱/碗柜\ncurative\t治病的/有疗效的\ncurator\t管理者/经理\ncurb\t抑制/勒马绳\ncure\t治疗/治愈\ncuriosity\t好奇心/新奇的事物\ncurious\t好奇的/求知的\ncuriously\t好奇地\ncurl\t拳曲/鬈发\ncurly\t拳曲的/卷毛的\ncurrency\t货币/通货\ncurrent\t涌流/趋势\ncurrently\t现在/当前\ncurriculum\t课程\ncurry\t咖哩粉/咖哩饭菜\ncurse\t咒骂/诅咒\ncurt\t简略的/简短的\ncurtail\t缩减/剥夺\ncurtain\t帐/幕\ncurtis\t柯蒂斯\ncurve\t曲线/弯曲\ncurved\t弯曲的/弄弯的\ncushion\t垫子/橡皮软垫\ncustody\t监护/拘留\ncustom\t习惯/风俗\ncustomary\t习惯的/惯常的\ncustomer\t消费者\ncustoms\t海关/关卡\ncut\t切口/割伤\ncute\t可爱的/聪明的\ncutter\t裁剪者/切割者\ncutting\t切断/切下\ncycle\t周期/循环\ncycling\t骑脚踏车兜风/骑脚踏车消遣\ncyclist\t骑脚踏车的人\ncylinder\t圆筒/圆筒状物\ncynical\t愤世嫉俗的/讽刺的\ncynicism\t犬儒主义\ncyprus\t塞浦路斯\nczech\t捷克人/捷克语\nczechoslovakia\t捷克斯洛伐克\nda\t美国地方检察官\ndad\t爸爸/爹爹\ndaddy\t爸爸\ndaft\t愚笨的/癫狂的\ndaily\t每日的/日常的\ndairy\t牛奶公司/乳品店\ndaisy\t雏菊/一流人物\ndale\t小谷/溪谷\ndam\t水坝/障碍\ndamage\t损害/伤害\ndamaged\t被损坏的\ndamaging\t破坏性的/损害的\ndame\t夫人\ndamian\t达米安\ndamn\t一点/诅咒\ndamned\t可恶的/该死的\ndamp\t潮湿/湿气\ndan\t段\ndana\t美国德纳\ndance\t跳舞/舞蹈\ndancer\t舞蹈演员/跳舞者\ndancing\t舞蹈\ndane\t丹麦人\ndanger\t危险/威胁\ndangerous\t危险的\ndangerously\t危险/不安全\ndangle\t摇晃地悬挂着/追求\ndaniel\t丹尼尔\ndanish\t丹麦文\ndanny\t丹尼\ndare\t挑战/挑动\ndaring\t大胆的\ndark\t黑暗/夜\ndarken\t弄暗/使模糊\ndarkened\t变暗/转黑\ndarkness\t黑暗/暗\ndarling\t亲爱的/可爱的人\ndarren\t达伦\ndart\t飞镖/投射\ndarwin\t达尔文\ndash\t冲撞/破折号\ndata\tpl.资料/数据\ndatabase\t数据库\ndate\t日期/约会\ndatum\t论据/材料\ndaughter\t女儿\ndaunting\t使人畏缩的\ndave\t戴夫\ndavid\t大卫/戴维\ndavidson\t戴维森\ndavies\t戴维斯\ndavis\t戴维斯\ndawn\t破晓/黎明\ndawson\t道森\nday\t天/日子\ndaylight\t白昼/日光\ndaytime\t白天/日间\ndazzle\t眼花/炫耀\ndazzling\t眼花缭乱的/耀眼的\ndc\t直流电\ndead\t死的/不活泼的\ndeadline\t最后期限/截止期限\ndeadly\t致命的/致死的\ndeaf\t聋的\ndeafen\t使聋\ndeal\t交易/协定\ndealer\t经销商/商人\ndealership\t代理权/经销权\ndealing\t经营行为/行为\ndealings\t来往/交易\ndean\t院长/主持牧师\ndear\t亲爱的人\ndearly\t深深地/昂贵地\ndeath\t死亡\ndebate\t辩论/讨论\ndebbie\t黛比\ndeborah\t黛博拉\ndebris\t碎片/残骸\ndebt\t债务/罪过\ndebtor\t债务人/借主\ndebut\t初次登台/开张\ndec\t美国数字电子公司\ndecade\t十年/十\ndecay\t衰退/腐败\ndeceased\t已故的\ndeceit\t欺骗/谎言\ndeceive\t欺骗/行骗\ndecember\t十二月\ndecency\t得体/礼貌\ndecent\t有分寸的/得体的\ndeception\t欺骗/诡计\ndeceptive\t迷惑的/虚伪的\ndecide\t决定/判决\ndecidedly\t决定了/坚决\ndecimal\t十进位的/小数的\ndecision\t决定/决心\ndecisive\t决定性的/坚定的\ndeck\t甲板/行李仓\ndeclaration\t宣告/说明\ndeclare\t宣布/声明\ndecline\t衰退/跌落\ndeclining\t倾斜的/衰退中的\ndecompose\t分解/腐烂\ndecor\t装饰/布置\ndecorate\t装饰\ndecoration\t装饰/装饰品\ndecorative\t装饰性的\ndecrease\t减少/减少量\ndecree\t法令/判决\ndedicate\t献出/贡献\ndedicated\t专注的/献身的\ndedication\t奉献/献身\ndeduce\t推论/演绎出\ndeduct\t扣除/减去\ndeduction\t减除/扣除\ndee\tD字形马具\ndeed\t行为/实行\ndeem\t认为/相信\ndeep\t深的\ndeepen\t深化\ndeeper\t更深\ndeepest\t深的/严重的\ndeeply\t深刻地/在深处\ndeer\t鹿\ndefault\t违约/不履行责任\ndefeat\t败北/失败\ndefect\t缺点\ndefective\t有缺陷的/欠缺的\ndefence\t防卫/防卫设备\ndefend\t防护/辩护\ndefendant\t被告\ndefender\t防卫者/防护者\ndefense\t防卫/防卫物\ndefensive\t防卫的/防备用的\ndefer\t推迟/延期\ndeferential\t恭敬的\ndefiance\t蔑视/挑战\ndefiant\t挑衅的/目中无人的\ndeficiency\t缺乏/不足\ndeficient\t不足的/不充分的\ndeficit\t赤字/不足额\ndefine\t定义/规定\ndefined\t清晰的/轮廓分明的\ndefinite\t明确的/一定的\ndefinitely\t明确无疑地/清楚地\ndefinition\t定义/精确度\ndefinitive\t限定词\ndeflect\t转移/使偏斜\ndeflection\t歪斜/偏\ndeform\t使残缺/使变形\ndeformation\t损形/变丑\ndefy\t藐视/挑衅\ndegenerate\t堕落的\ndegradation\t降格/堕落\ndegrade\t降级/退化\ndegree\t程度/度数\ndeity\t神/神性\ndelay\t耽搁/迟滞\ndelegate\t代表\ndelegation\t代表团/派遣代表团\ndelete\t删除\ndeletion\t删除/删除部分\ndelhi\t德里\ndeliberate\t深思熟虑的/故意的\ndeliberately\t故意地\ndeliberation\t熟虑/熟思\ndelicacy\t细软/精致\ndelicate\t细致优雅的/微妙的\ndelicious\t美味的\ndelight\t高兴/愉快\ndelighted\t高兴的/快乐的\ndelightful\t令人愉快的/可爱的\ndeliver\t递送/陈述\ndelivery\t递送/交付\ndelta\t三角洲/希腊字母的第四个字\ndelusion\t迷惑/欺瞒\ndemand\t要求/需求\ndemanding\t要求高的/费力的\ndemeanor\t行为/品行\ndementia\t痴呆\ndemise\t崩/薨\ndemocracy\t民主政治/民主主义\ndemocrat\t民主人士/民主主义者\ndemocratic\t民主的\ndemocratization\t民主化\ndemographic\t人口统计的\ndemographics\t人口统计资料\ndemography\t人口统计学\ndemolish\t毁坏/破坏\ndemolition\t破坏/毁坏\ndemon\t魔鬼\ndemonstrate\t示范/证明\ndemonstration\t示范/实证\ndemonstrator\t论证者/证明者\nden\t兽穴/洞穴\ndenial\t否认\ndenis\t丹尼斯\ndenmark\t丹麦\ndennis\t丹尼斯\ndenomination\t名称/教派\ndenote\t指示/表示\ndenounce\t告发/抨击\ndense\t密集的/浓厚的\ndensity\t密度\ndent\t凹痕\ndental\t牙齿的\ndentist\t牙科医生\ndeny\t否认/拒绝\ndepart\t离开/出发\ndepartment\t部门/系\ndepartmental\t部门的/各部的\ndeparture\t离开/出发\ndepend\t靠/视...而定\ndependant\t家眷/侍从\ndependence\t依赖/依存\ndependency\t属国/保护地\ndependent\t依赖他人者\ndepict\t描述/描写\ndepiction\t描写/叙述\ndeplore\t悲悼/哀叹\ndeploy\t展开/配置\ndeportation\t驱逐出境/放逐\ndeposit\t存款/定金\ndeposition\t免职/作证\ndepot\t停车场/车站\ndepreciation\t价值减低/减价\ndepress\t使沮丧/压低\ndepressed\t沮丧的/降低的\ndepressing\t抑压的/沉闷的\ndepression\t不景气/消沉\ndeprivation\t剥夺/剥夺官职\ndeprive\t剥夺/使丧失\ndeprived\t穷困的/丧失了受良好教育权利的\ndepth\t深度/深处\ndeputy\t副手/代理人\nderby\t德比/德比赛马\nderbyshire\t德比郡\nderegulation\t撤消管制规定/解除控制\nderek\t德里克\nderelict\t被抛弃了的/无主的\nderivation\t推论/推导\nderivative\t引出的/派生的\nderive\t得自\nderry\t民谣/歌谣\ndescend\t下降/世代相传\ndescendant\t后裔/子孙\ndescent\t降落/家系\ndescribe\t描述/描绘\ndescription\t描述/说明\ndescriptive\t描述的/叙述的\ndesert\t沙漠/应得的赏罚\ndeserted\t被遗弃的/废弃的\ndeserve\t该得到/值得\ndesign\t设计/图样\ndesignate\t指定/指明\ndesignated\t特指的/指定的\ndesignation\t指示/指定\ndesigner\t设计者/谋划者\ndesirable\t令人想望的/可取的\ndesire\t欲望/要求\ndesired\t渴望的/想得到的\ndesk\t书桌/办公桌\ndesktop\t桌面\ndesolate\t荒凉的\ndespair\t绝望/失望\ndespatch\t派遣\ndesperate\t不顾一切的/危急的\ndesperately\t拼命地/绝望地\ndesperation\t绝望\ndespise\t轻视\ndespite\t轻视/憎恨\ndessert\t餐后甜点\ndestination\t目的地/目标\ndestine\t注定/预定\ndestiny\t命运/定数\ndestroy\t破坏/毁坏\ndestruction\t破坏/毁灭\ndestructive\t毁灭性的/破坏的\ndetach\t使分离/分遣\ndetached\t超然的/分离的\ndetachment\t分离/分遣\ndetail\t细节/详情\ndetailed\t详细的/复杂的\ndetain\t扣留/扣押\ndetainee\t被拘留者/被扣押者\ndetect\t发现/察觉\ndetection\t发现/察觉\ndetective\t侦探\ndetector\t发现者/检验器\ndetention\t阻止/监禁\ndeter\t制止/吓住\ndeteriorate\t恶化\ndeterioration\t恶化/衰退\ndeterminant\t决定物/决定因素\ndetermination\t决心/果断\ndetermine\t决定/决心\ndetermined\t坚决的/已下决心的\ndeterrent\t制止的/威慑的\ndetrimental\t有害的\ndevaluation\t降低价值/贬值\ndevastate\t毁坏\ndevastating\t毁灭性的/很好的\ndevastation\t毁坏\ndevelop\t发展/使发达\ndeveloped\t发达的/成熟的\ndeveloper\t开发者\ndeveloping\t发展中的\ndevelopment\t发展\ndevelopmental\t发展的/进化的\ndeviate\t脱离/偏离\ndeviation\t背离\ndevice\t装置/设计\ndevil\t魔鬼\ndevise\t设计/发明\ndevlin\t德夫林\ndevoid\t全无的/缺乏的\ndevolution\t相传/转让\ndevon\t德文郡\ndevote\t投入于/献身\ndevoted\t投入的/深爱的\ndevotion\t热爱/投入\ndevour\t吞食/挥霍\ndew\t露珠/露水\ndexter\t右侧的/右边的\ndiabetes\t糖尿病/多尿症\ndiabetic\t糖尿病的\ndiagnose\t诊断\ndiagnosis\t诊断\ndiagnostic\t诊断的/有助于诊断的\ndiagram\t图表/图解\ndial\t刻度盘/钟面\ndialect\t方言/同源语\ndialog\t会话/对话\ndialogue\t对话\ndiameter\t直径\ndiamond\t钻石/菱形\ndiana\t狄安娜/独身女子\ndiane\t黛安\ndiaper\t尿布\ndiarrhoea\t腹泻\ndiary\t日记\ndice\t骰子\ndick\t家伙/词典\ndickens\t魔鬼\ndictate\t听写/口述\ndictation\t听写/口述\ndictator\t命令者/独裁者\ndictatorship\t独裁者之职位/独裁\ndictionary\t字典/词典\ndie\t死亡/消逝\ndiesel\t内燃机/柴油机\ndiet\t日常饮食/议会\ndietary\t饮食的\ndiffer\t不一致/不同\ndifference\t不同/差异\ndifferent\t不同的\ndifferential\t差别的/特异的\ndifferentiate\t区别/区分\ndifferentiation\t区别/分化\ndifferently\t差异/不同\ndiffering\t不同/有异\ndifficult\t困难的\ndifficulty\t困难/难点\ndiffuse\t散播/传播\ndig\t挖/翻土\ndigest\t文摘\ndigestion\t消化力/领悟\ndigit\t数字/位数\ndigital\t数字显示的/数字的\ndignified\t有尊严的/高尚的\ndignity\t尊严/高贵\ndilemma\t困境/窘境\ndiligence\t勤奋\ndiligent\t勤勉的/用功的\ndilute\t冲淡/稀释\ndim\t暗淡的/模糊的\ndime\t10分硬币\ndimension\t尺寸/次元\ndiminish\t减少/变小\ndine\t用正餐/进餐\ndiner\t用餐者\ndinghy\t小船/橡皮筏\ndining\t正餐/宴会\ndinner\t晚餐/正餐\ndinosaur\t恐龙\ndiocese\t主教教区\ndioxide\t二氧化物\ndip\t浸/降下\ndiploma\t文凭/毕业证书\ndiplomacy\t外交/外交手腕\ndiplomat\t外交官/有外交手腕的人\ndiplomatic\t外交的/老练的\ndire\t可怕的/悲惨的\ndirect\t直接的/坦白的\ndirection\t方向/指导\ndirective\t指导的/指挥的\ndirectly\t径直地/直接地\ndirector\t主管/导演\ndirectory\t目录/工商名录\ndirt\t污垢/泥土\ndirty\t肮脏的/卑鄙的\ndisability\t无力/无能\ndisable\t使失去能力/使残废\ndisabled\t残废的/有缺陷的\ndisadvantage\t缺点/不利\ndisadvantaged\t社会地位低下的/生活条件差的\ndisagree\t不一致/不适宜\ndisagreement\t不合/争论\ndisappear\t消失/不见\ndisappearance\t看不见/失踪\ndisappoint\t使失望\ndisappointed\t失望的\ndisappointing\t使失望的/期待落空的\ndisappointment\t失望\ndisapproval\t不赞成\ndisapprove\t不赞成\ndisarm\t解除武装/裁军\ndisaster\t灾祸/不幸\ndisastrous\t损失惨重的/悲伤的\ndisbelief\t不信/怀疑\ndisc\t圆盘/唱片\ndiscard\t丢弃/抛弃\ndiscern\t辨别/看清楚\ndischarge\t卸下/放出\ndisciple\t弟子/门徒\ndisciplinary\t训练的/纪律的\ndiscipline\t训练/纪律\ndisclose\t揭露/透露\ndisclosure\t揭发/泄露\ndisco\t夜总会/迪斯科\ndiscomfort\t困苦/不适\ndisconnect\t使分离/使不相连\ndiscontent\t不满\ndiscontented\t不满意的\ndiscount\t折扣/贴现率\ndiscourage\t使气馁/阻碍\ndiscourse\t谈话/演讲\ndiscover\t发现/找到\ndiscovery\t发现/被发现的事物\ndiscredit\t无信用/丢脸\ndiscreet\t小心的/慎重的\ndiscrepancy\t不符合/差异\ndiscrete\t不连续的/离散的\ndiscretion\t慎重/辨别力\ndiscriminate\t区别/差别待遇\ndiscrimination\t差别/岐视\ndiscuss\t讨论/论述\ndiscussion\t讨论\ndisdain\t蔑视\ndisease\t疾病/弊病\ndisgrace\t耻辱/不名誉\ndisguise\t假面目/假装\ndisgust\t厌恶/嫌恶\ndisgusting\t令人厌恶的\ndish\t盘子/碟\ndishonest\t不诚实的\ndishonour\t不名誉/使人丢脸的人/事\ndisillusion\t觉醒/幻灭\ndisillusioned\t幻想破灭了的/大失所望的\ndisk\t圆盘/磁盘\ndislike\t嫌恶\ndismal\t阴沉的/凄凉的\ndismantle\t拆除...的设备/分解\ndismay\t沮丧\ndismiss\t解散/开除\ndismissal\t免职/解雇\ndisney\t迪斯尼\ndisobedience\t不服从/不孝\ndisobey\t违反/不服从\ndisorder\t杂乱/混乱\ndisorient\t使失去方向/使迷惑\ndisparate\t根本不同的/全异的\ndisparity\t不一致\ndispatch\t派遣\ndispel\t驱散/驱逐\ndispense\t分发/分配\ndisperse\t分散/传播\ndisplace\t移置/替换\ndisplacement\t换置/移位\ndisplay\t显示/陈列\ndisplease\t使不愉快/使生气\ndisposable\t可任意处理的\ndisposal\t丢掉/处理\ndispose\t处理/排列\ndisposition\t性情/处置\ndisproportionate\t不成比例的\ndispute\t争论\ndisregard\t忽视/漠视\ndisrupt\t分裂的/中断的\ndisruption\t分裂/崩溃\ndisruptive\t分裂的/破坏的\ndissatisfaction\t不满/不平\ndissatisfied\t不满的/显出不满的\ndissatisfy\t使感觉不满/不满足\ndisseminate\t散播/传播\ndissent\t异议\ndissertation\t论文\ndisservice\t伤害/帮倒忙的行为\ndissident\t意见不同的/持不同政见的\ndissipate\t散失/驱散\ndissolution\t分解/溶解\ndissolve\t溶解/解散\ndistal\t末梢的\ndistance\t距离/远方\ndistant\t远的/疏远的\ndistil\tvi.蒸馏/提取...的精华\ndistinct\t清楚的/显著的\ndistinction\t区别\ndistinctive\t有特色的/出众的\ndistinctly\t显然地/明显地\ndistinguish\t区别/辨别\ndistinguished\t卓著的/著名的\ndistort\t扭曲/歪曲\ndistorted\t歪曲的/受到曲解的\ndistortion\t扭曲/变形\ndistract\t转移/分心\ndistraction\t娱乐/分心的事物\ndistress\t苦恼/贫困\ndistressed\t痛苦的/哀伤的\ndistressing\t使痛苦的/使烦恼的\ndistribute\t分配/散布\ndistributed\t分布式的\ndistribution\t分配\ndistributor\t分发者/分布者\ndistrict\t区域/地方\ndisturb\t扰乱/妨碍\ndisturbance\t扰乱/不安\ndisturbed\t混乱的\ndisturbing\t引起烦恼的/令人不安的\ndisused\t不用/废弃\nditch\t沟渠\ndive\t潜水/跳水\ndiver\t潜水者\ndiverge\t分歧/岔开\ndiverse\t不同的/变化多的\ndiversify\t使多样化/使变化\ndiversion\t转移\ndiversity\t差异/多样性\ndivert\t转移/使欢娱\ndivide\t分开/分配\ndivided\t分开的\ndividend\t被除数/股利\ndivine\t神的/神圣的\ndivision\t分/分开\ndivisional\t部门的/部分的\ndivisive\t区分的/制造分裂的\ndivorce\t离婚\ndivorced\t离婚的\ndixon\t狄克逊\ndizzy\t晕眩的/眼花缭乱的\ndna\t脱氧核糖核酸\ndo\t做/进行\ndock\t码头/船坞\ndoctor\t医生/博士\ndoctoral\t博士的\ndoctorate\t博士头衔\ndoctrine\t教条/学说\ndocument\t文件/公文\ndocumentary\t记录片\ndocumentation\t文件\ndodge\t避开/躲避\ndoe\t母鹿/雌兔\ndoes\t做/工作\ndog\t狗/坏蛋\ndoing\t行为/活动\ndole\t救济品/失业救济金\ndoll\t洋娃娃/无头脑的美丽女人\ndollar\t美元/元(加\ndolly\t洋娃娃/捣棒\ndolphin\t海豚\ndomain\t领域/领土\ndome\t圆顶\ndomestic\t家庭的/国内的\ndominance\t优势/显性\ndominant\t占优势的/支配的\ndominate\t支配/占优势\ndomination\t支配/控制\ndominican\t多明尼加共和国的\ndon\t西班牙贵族/先生\ndonald\t唐纳德\ndonaldson\t唐纳森\ndonate\t捐赠\ndonation\t捐赠物/捐款\ndonkey\t驴子/笨蛋\ndonna\t女士\ndonor\t捐赠人\ndoo\t豆儿\ndoom\t厄运/不幸\ndoor\t门\ndoorstep\t门阶\ndoorway\t门口/途径\ndoreen\t多琳\ndorm\t宿舍\ndormant\t睡眠状态的/静止的\ndormitory\t宿舍\ndorothy\t桃乐茜\ndorset\t多塞特/多尔塞特棉粗平布\ndos\t磁盘操作系统\ndose\t剂量/服用量\ndot\t点/圆点\ndouble\t两倍\ndoubly\t加倍地/双重地\ndoubt\t怀疑/疑惑\ndoubtful\t可疑的/疑心的\ndoubtless\t无疑的/确定的\ndoug\t道格\ndough\t生面团\ndoughnut\t油炸圈饼/环状物\ndouglas\t道格拉斯/道格拉斯\ndove\t鸽子\ndover\t多佛\ndown\t向下的\ndownhill\t下坡的\ndowning\t唐宁\ndownplay\t不予重视\ndownside\t底侧/下降趋势\ndownstairs\t楼下\ndowntown\t市中心区\ndownturn\t衰退/下降趋势\ndownward\t向下的\ndownwards\t向下\ndoyle\t柯南道尔（英国医师/小说家\ndozen\t打/十二个\ndr\t博士/医生\ndraft\t气流/草稿\ndrag\t拖/拖累\ndragon\t龙/凶暴的人\ndrain\t排水沟/消耗\ndrainage\t排水\ndrama\t戏剧/戏剧艺术\ndramatic\t戏剧性的/生动的\ndramatically\t戏剧地/引人注目地\ndrape\t布帘/褶皱\ndrastic\t激烈的\ndrastically\t激烈地/彻底地\ndraught\t气流/草稿\ndraw\t拉/拖\ndrawback\t缺点/退税\ndrawer\t抽屉/开票人\ndrawing\t图画/制图\ndread\t恐惧/可怕的人\ndreadful\t可怕的\ndream\t梦/空想\ndress\t服装/覆盖物\ndresser\t化妆台/服装师\ndressing\t调味品/穿衣\ndrew\tdraw的过去式\ndried\t弄干了的\ndrier\t干燥机/干燥剂\ndrift\t漂流物/漂流\ndrill\t钻孔机/钻子\ndrink\t饮料/酒\ndrinker\t饮者/酒徒\ndrinking\t喝/喝酒\ndrip\t水滴\ndrive\t驾车/快车道\ndriven\t有紧迫感的\ndriver\t驾驶员/驱动器\ndriveway\t车道\ndriving\t赶/操纵\ndrizzle\t细雨\ndrop\t滴/微量\ndropout\t退学学生/中途退学\ndrought\t干旱/缺乏\ndrown\t淹死\ndrug\t药/麻药\ndrugstore\t药房/杂货店\ndrum\t鼓/鼓声\ndrummer\t鼓手/旅行推销员\ndrunk\t喝醉了的\ndrunken\t酒醉的\ndry\t干的/无酒的\ndryer\t干衣机/干燥剂\ndti\t贸易工业部\ndual\t双重的/双的\ndub\t配音/轻点\ndubious\t可疑的/不确定的\ndublin\t都柏林\nduchess\t公爵夫人\nduchy\t公爵领地/公国\nduck\t鸭子\nduct\t管/输送管\ndude\t<美国/加拿大>纨绔子弟\ndudley\t达德利\ndue\t应得的东西/应付款\nduke\t公爵\ndull\t钝的/无趣的\ndully\t钝地/迟钝地\nduly\t恰当地/充分地\ndumb\t哑的/不说话的\ndummy\t傀儡/假人\ndump\t垃圾场\ndumpling\t面团布丁/团子\nduncan\t邓肯\ndundee\t敦提[英国苏格兰东部港市]\ndune\t沙丘\nduo\t二重唱\nduodenal\t十二指肠的\nduplicate\t副本/复本\ndurable\t持久的/耐用的\nduration\t持续时间/持续\ndurham\t达勒姆郡/短角肉牛\nduring\t在...的时候\ndusk\t薄暮/傍晚\ndust\t灰尘/尘埃\ndustbin\t垃圾箱\ndusty\t灰尘多的/无聊的\ndutch\t荷兰人/荷兰语\nduty\t责任/关税\ndvd\t数字化视频光盘\ndwarf\t矮子/侏儒\ndwell\t居住/居住\ndwelling\t住处\ndye\t颜料/染料\ndying\t垂死的\ndynamic\t动态的/有活力的\ndynamical\t动力的/动态的\ndynamics\t动力学\ndynamo\t发电机\ndynasty\t朝代/王朝\ndysfunction\t机能不良/机能障碍\ndysfunctional\t功能失调的\neach\t每个/每一\neager\t热心的/渴望的\neagerly\t渴望/热衷于\neagle\t鹰/鹰状标饰\near\t耳朵/倾听\nearl\t伯爵\nearlier\t早的/初期的\nearly\t早的/早熟的\nearmark\t耳上记号/特征\nearn\t赚得/获得\nearner\t赚钱的人\nearnest\t定金/诚挚\nearnings\t所赚的钱/工资\nearring\t耳环/耳饰\nearth\t地球/泥土\nearthenware\t陶器\nearthquake\t地震\nease\t安乐/安逸\neasier\t更简单/较早的\neasily\t容易地/轻易地\neast\t东方/东\neaster\t复活节\neastern\t东方人/东正教徒\neastward\t朝东方向\neastwards\t向东方地\neasy\t容易的/缓缓的\neat\t吃/腐蚀\neating\t吃/食物\neccentric\t怪人/偏心圆\necclesiastical\t教会的/神职的\necho\t回声/回音\neclectic\t折衷主义者\neclipse\t日食/月食\necological\t生态学的/主张生态保护的\necology\t生态学/社会生态学\neconomic\t经济上的/实用的\neconomical\t节俭的/经济的\neconomically\t节约地/不浪费地\neconomics\t经济学\neconomist\t经济学者/经济家\neconomy\t经济/理财\necosystem\t生态系统\necstasy\t狂喜/心醉神迷\neddie\t埃迪\neden\t伊甸园/乐园\nedgar\t埃德加\nedge\t边缘/尖锐\nedible\t食品/食物\nedinburgh\t爱丁堡\nedit\t编辑/编校\nedith\t伊迪丝\nediting\t编辑的\nedition\t版本/版\neditor\t编者/编辑\neditorial\t社论/评论\nedmund\t艾德蒙\nedouard\t人名/爱德华\neducate\t教育/培养\neducated\t受过教育的/有教养的\neducation\t教育/训练\neducational\t教育的/教育性的\neducator\t教育家\nedward\t爱德华\nedwardian\t英王爱德华时代的\nedwards\t爱德华兹\nedwin\t爱德温（男子名/义为繁荣\nee\t电机工程师\neec\t欧洲经济共同体\neerie\t怪诞的/可怕的\neffect\t结果/影响\neffective\t有效的/有力的\neffectively\t有效地/有力地\neffectiveness\t效力\nefficacy\t功效/效力\nefficiency\t效率/效能\nefficient\t有效率的/能干的\nefficiently\t生效/能胜任\neffort\t努力/成就\neg\t例如/[网络用语]邪恶的笑\negg\t蛋/卵\neggplant\t茄子\nego\t自我\negypt\t埃及\negyptian\t埃及人\neh\tinterj.啊!嗯!是吗?好吗\neight\t八/八个\neighteen\t十八/十八个\neighteenth\t第十八/十八分之一\neighth\t第八/八分之一\neighty\t八十/八十个\neileen\t艾琳\neither\t任一的/各一的\neject\t逐放/放逐\nel\t预期损失\nelaborate\t精细的/详尽的\nelaine\t伊莱恩\nelapse\t逝去/过去\nelastic\t松紧带/橡皮筋\nelbow\t手肘/弯头\nelder\t年长者/老人\nelderly\t过了中年的/稍老的\neldest\t最年长的/排行中第一的\neleanor\t埃莉诺\nelect\t当选人/被选的人\nelected\t选举/推选\nelection\t选举/当选\nelector\t有选举权的人/选举人\nelectoral\t选举人的/选举的\nelectorate\t选民/有选举权者\nelectric\t电的/导电的\nelectrical\t电的/有关电的\nelectrician\t电学家/电气技师\nelectricity\t电/电流\nelectrode\t电极\nelectron\t电子\nelectronic\t电子的\nelectronics\t电子学\nelegance\t高雅/典雅\nelegant\t优雅的/端庄的\nelement\t元件/元素\nelemental\t元素的/基本的\nelementary\t初步的/基本的\nelephant\t象\nelevate\t举起/提拔\nelevated\t提高的\nelevation\t海拔/提高\nelevator\t电梯/升降机\neleven\t十一/十一个\neleventh\t第十一/十一分之一\nelf\t小精灵/矮人\nelicit\t引出/推导出\neligibility\t适任/合格\neligible\t有资格当选的/合格的\neliminate\t除去/排除\nelimination\t除去/消除\neliot\t艾略特\nelite\t精华/精锐\nelizabeth\t伊丽莎白\nelk\t麋鹿\nellen\t埃伦\nellie\t埃莉\nelliott\t艾略特\nelliptical\t椭圆的\nellis\t埃利斯\neloquence\t口才/雄辩术\neloquent\t雄辩的/有口才的\nelse\t别的/其他的\nelsewhere\t在别处\nelude\t逃避/规避\nelusive\t难懂的/易忘的\nemail\t电子信函\nemanate\t散发/发出\nemancipation\t释放/解放\nembargo\t封港令/禁运\nembark\t乘船/着手\nembarrass\t使困窘/使局促不安\nembarrassed\t尴尬的/窘迫的\nembarrassing\t令人为难的/麻烦的\nembarrassment\t困难/阻碍\nembassy\t大使馆/大使馆全体人员\nembed\t使插入/使嵌入\nembody\t具体表达/使具体化\nembrace\t拥抱\nembroidery\t刺绣品/粉饰\nembryo\t胚胎/胎儿\nemerge\t浮现/形成\nemergence\t出现/浮现\nemergency\t紧急状况/紧急事件\nemigrate\t移居/移民\nemily\t埃米莉\neminent\t显赫的/杰出的\nemission\t发射/射出\nemit\t发出/放射\nemma\t艾玛\nemmy\t埃米奖\nemotion\t情绪/激动\nemotional\t情绪的/情感的\nemotionally\t在情绪上\nempathy\t移情作用/共鸣\nemperor\t皇帝/君主\nemphasis\t强调/加强\nemphasise\t强调/重读\nemphasize\t强调/加强语气\nempire\t帝国/帝权\nempirical\t完全跟据经验的/经验主义的\nemploy\t雇用\nemployee\t职员/员工\nemployer\t雇主/老板\nemployment\t雇用/职业\nempower\t授予权力/允许\nempowerment\t授权/许可\nemptiness\t空虚/无知\nempty\t空的/空虚的\nemulate\t效法/尽力赶上\nen\t字母N/半方\nenable\t使能够\nenact\t制定法律/扮演\nenchant\t施魔法/使入迷\nenclave\t被包围的领土\nenclose\t围绕/圈起\nenclosed\t被附上的\nenclosure\t附件/围墙\nencode\t把译成密码\nencompass\t围绕/完成\nencounter\t相会/相遇\nencourage\t鼓励/支持\nencouragement\t鼓励/激励\nencouraging\t鼓励的/促进的\nend\t结束/终点\nendanger\t危及\nendangered\t有生命危险的/濒临灭绝的\nendeavor\t努力/尽力\nendeavour\t努力/力图\nending\t终止/终了\nendless\t不停的/无穷尽的\nendlessly\t不断地/无穷尽地\nendorse\t支持/赞同\nendorsement\t支持/认可\nendoscopic\t内窥镜的/用内窥镜检查的\nendow\t捐赠/捐助\nendowment\t捐助/天赋\nendurance\t忍耐/忍耐力\nendure\t忍受/忍耐\nenduring\t持久的/忍耐的\nenemy\t敌人/仇敌\nenergetic\t精力充沛的/积极的\nenergize\t使活跃/激励\nenergy\t精力/精神\nenforce\t强迫/执行\nenforcement\t执行/强制\nengage\t答应/从事\nengagement\t诺言/约会\nengender\t产生/引起\nengine\t引擎/发动机\nengineer\t工程师/工兵\nengineering\t工程学/工程\nengland\t英格兰\nenglish\t英语\nenglishman\t英国人\nengulf\t卷入/吸进\nenhance\t提高/加强\nenhanced\t增大的/加强的\nenhancement\t提高/美化\nenjoy\t享受/喜欢\nenjoyable\t可从中得到乐趣的/令人愉快的\nenjoyment\t享乐/快乐\nenlarge\t扩大/增大\nenlarged\t扩大/扩展\nenlighten\t教育/启发\nenlightened\t有知识的/进步的\nenlightenment\t启迪/教化\nenlist\t征募/参与\nenormous\t巨大的/庞大的\nenormously\t非常地/巨大地\nenough\t充足/够\nenquire\t询问\nenquiry\t询问\nenrich\t使富足/使肥沃\nenrol\t登记/使加入\nenroll\t登记/使加入\nenrollment\t登记/注册\nensemble\t全体/合唱曲\nensue\t跟着发生/继起\nensuing\t接著发生的\nensure\t确定/保证\nentail\t使成为必需/需要\nenter\t进入/参加\nenterprise\t企业/事业心\nentertain\t娱乐/招待\nentertainer\t表演娱乐节目的人/演艺人员\nentertaining\t使人愉快的/有趣的\nentertainment\t娱乐/款待\nenthusiasm\t巨大的热情/热心\nenthusiast\t热心家/狂热者\nenthusiastic\t狂热的/热心的\nenthusiastically\t热心地/狂热地\nentice\t诱骗/引诱\nentire\t整个/全部\nentirely\t完全/全然\nentitle\t给...权利/取名为\nentitled\t有资格的/给与名称的\nentitlement\t权利\nentity\t实体/实存物\nentrance\t入口/进入点\nentrant\t新会员/新成员\nentreat\t恳求/乞求\nentree\t入场许可/主菜\nentrepreneur\t企业家/主办人\nentrepreneurial\t创业的/具有企业精神的\nentrust\t信托/交托\nentry\t登录/条目\nenvelope\t信封/封套\nenvious\t嫉妒的/羡慕的\nenvironment\t环境/外界\nenvironmental\t周围的/环境的\nenvironmentalist\t环保人士\nenvironmentally\t有关环境方面\nenvisage\t面对/正视\nenvision\t想象/预想\nenvoy\t外交使节/特使\nenvy\t羡慕/嫉妒\nenzyme\t酶\nepic\t史诗/叙事诗\nepidemic\t传染病/流行病\nepiscopal\t主教的/主教制度的\nepisode\t插曲/插话\nepoch\t新纪元/时代\neqn\tequation方程式/等式\nequal\t对手/匹敌\nequality\t平等/均匀\nequally\t相等地/同样地\nequate\t使相等/视为平等\nequation\t相等/等式\nequator\t赤道\nequilibrium\t平衡/平静\nequip\t装备/配备\nequipe\t<法>运动队及其装备\nequipment\t装备/设备\nequitable\t公平的/公正的\nequity\t公平/公正\nequivalent\t同等物/等价物\nera\t时代/纪元\neradicate\t根除/扑灭\nerase\t抹去/擦掉\neraser\t擦子\nerect\t直立的/竖立的\nerection\t直立/竖起\neric\t科教资源信息中心/电子遥控与独立\nerika\t埃里卡\nerm\termine貂/erythrom\nernest\t欧内斯特\nerode\t腐蚀/侵蚀\nerosion\t腐蚀/冲蚀\nerotic\t性爱的/性欲的\nerrand\t任务/差使\nerratic\t古怪的人/漂泊无定的人\nerroneous\t错误的/不正确的\nerror\t错误/过失\nerupt\t爆发\neruption\t爆发/喷出物\nescalate\t逐步扩大/逐步升高\nescape\t逃亡/避难设备\nescort\t护送者/护卫者\nespecially\t尤其/特别\nespouse\t支持/赞成\nessay\t随笔/短文\nessence\t实质/本质\nessential\t要素/要点\nessentially\t本质上/本来\nessex\t艾塞克斯郡\nest\t东部时间\nestablish\t建立/确立\nestablished\t建立的/固定的\nestablishment\t确立/制定\nestate\t不动产/阶段\nesteem\t尊敬/尊重\nesthetic\t审美的\nestimate\t估计/判断\nestimated\t估算的/估计的\nestrogen\t雌激素\nestuary\t河口/港湾\netc\t及其他/等等\netcetera\t等等/额外的人\netch\t蚀刻/蚀镂\neternal\t永恒的/永远的\neternity\t永远/来世\nethanol\t乙醇/酒精\nethic\t道德规范/伦理\nethical\t伦理的/民族的\nethics\t道德规范\nethiopia\t埃塞俄比亚\nethnic\t人种的/种族的\nethnicity\t种族划分\nethnographic\t人种志的\nethos\t气质/民族精神\neuro\t欧元\neurope\t欧洲\neuropean\t欧洲人\neva\t伊娃\nevacuate\t疏散/撤出\nevacuation\t撤退/疏散\nevade\t逃脱/规避\nevaluate\t评估/评价\nevaluation\t评估/估价\nevangelical\t福音派教会的\nevans\t埃文斯\nevaporate\t蒸发/失去水分\nevaporation\t蒸发/脱水\neve\t前夕/前夜\nevelyn\t伊夫林\neven\t平坦的/相等的\nevening\t傍晚/晚间\nevenly\t平衡地/平坦地\nevent\t事件/结果\neventual\t最后的/终于的\neventually\t最后/终于\never\t曾经/究竟\neverlasting\t永恒的/持久的\neverton\t埃弗顿\nevery\t每一/所有的\neverybody\t每个人/人人\neveryday\t每天的/日常的\neveryone\t每个人/人人\neverything\t每件事物/所有事物\neverywhere\t各处/到处\nevidence\t根据/证据\nevident\t显然的/明显的\nevidently\t明显地/根据现有证据来看\nevil\t邪恶/不幸\nevoke\t唤起/引起\nevolution\t进化/发展\nevolutionary\t展开的/进化论的\nevolve\t进展/进化\nexacerbate\t使恶化/使增剧\nexact\t精确的/准确的\nexactly\t确切地/精确地\nexaggerate\t夸大/夸张\nexaggerated\t夸大的/夸张的\nexaggeration\t夸张/夸大的事物\nexam\t考试/测验\nexamination\t考试/测验\nexamine\t检查/调查\nexaminer\t检查人/审查人\nexample\t例子/样本\nexcavation\t挖掘/发掘\nexceed\t超过/超越\nexceedingly\t极端地/极度地\nexcel\t胜过/优于\nexcellence\t优秀/卓越\nexcellent\t优良的/杰出的\nexcept\t除/除外\nexception\t例外/除外\nexceptional\t例外的/异常的\nexceptionally\t特殊地/异常地\nexcerpt\t摘录\nexcess\t过度/剩于\nexcessive\t过度的/过多的\nexcessively\t过多/极度\nexchange\t交换/交换局\nexchequer\t财政部/国库\nexcise\t消费税\nexcite\t刺激/使兴奋\nexcited\t兴奋的/已励磁的\nexcitement\t刺激/兴奋\nexciting\t令人兴奋的/刺激的\nexclaim\t大叫/呼喊\nexclamation\t惊呼/激烈言词\nexclude\t除外/排除\nexcluding\t把...排除在外/不包括...\nexclusion\t排除/除外\nexclusive\t排外的/独占的\nexclusively\t排他地/仅仅\nexcrete\t排泄/分泌\nexcursion\t远足/游览圆\nexcuse\t原谅/申辩\nexecute\t执行/实行\nexecution\t实行/完成\nexecutive\t执行部门/执行委员会\nexemplify\t例证/例示\nexempt\t免税者/被免除义务者\nexemption\t解除/免除\nexercise\t行使/执行\nexert\t发挥/运用\nexeter\t埃克塞特\nexhaust\t排气/排气装置\nexhausted\t耗尽的/疲惫的\nexhaustion\t抽空/耗尽\nexhibit\t显示/显现\nexhibition\t表现/展览会\nexile\t放逐/流放\nexist\t存在/生存\nexistence\t存在/生存\nexisting\t存在的/目前的\nexit\t出口/退场\nexotic\t异国的/外来的\nexpand\t使膨胀/详述\nexpanded\t扩充的/展开的\nexpanse\t宽阔区域/宽阔\nexpansion\t扩充/开展\nexpansive\t扩张性的/使扩大的\nexpect\t预期/盼望\nexpectancy\t期待/期望的事物\nexpectation\t期待/指望\nexpected\t预期的/预料的\nexpedition\t远征/探险队\nexpel\t驱逐/逐出\nexpend\t花费/消耗\nexpenditure\t开支/费用\nexpense\t费用/代价\nexpensive\t贵的/奢华的\nexperience\t经历/经验\nexperienced\t富有经验的/老练的\nexperiment\t实验/试验\nexperimental\t实验的/根据实验的\nexperimentally\t实验式地/在实验上\nexperimentation\t实验/试验\nexpert\t专家/行家\nexpertise\t专家意见/专门技术\nexpire\t期满/呼气\nexplain\t解释/说明\nexplanation\t解释/说明\nexplanatory\t说明的/解释的\nexplicit\t详述的/清楚的\nexplicitly\t明确地/明白地\nexplode\t爆炸/爆发\nexploit\t功绩/勋绩\nexploitation\t开发/开采\nexploration\t探险/踏勘\nexplore\t探险/探测\nexplorer\t探险家/探测者\nexplosion\t爆发/激增\nexplosive\t炸药/爆破音\nexplosives\t爆炸物/炸药\nexport\t输出品/输出\nexporter\t出口商/输出者\nexpose\t使暴露/使曝光\nexposed\t暴露的/无掩蔽的\nexposition\t阐述/讲解\nexposure\t暴露/揭发\nexpress\t快车/快递\nexpression\t表达/表现\nexpressive\t表达的/富于表情的\nexpressly\t明白地/清楚地\nexquisite\t精致的/细腻的\nextend\t扩充/延伸\nextended\t延续的/伸出的\nextension\t延长/扩充\nextensive\t广的/广泛的\nextensively\t广大/广延\nextent\t范围/程度\nexterior\t外部/表面\nexternal\t外部/外面\nextinct\t熄灭的/灭绝的\nextinction\t消失/消灭\nextinguish\t熄灭/使消亡\nextra\t额外的事物/另外的收费\nextract\t榨出物/精汁\nextraction\t抽出/取出\nextracurricular\t课外的/业余的\nextraordinarily\t非凡/破例\nextraordinary\t非常的/特别的\nextravagant\t奢侈的/挥霍无度的\nextreme\t极端/末端\nextremely\t极端地/非常地\neye\t眼睛/视力\neyebrow\t眉毛\neyelid\t眼皮/眼睑\neyesight\t视力/目力\neyewitness\t目击者/见证人\nfa\t足球协会/战地救护车\nfable\t寓言/神话\nfabric\t织物/布\nfabricate\t制造/建造\nfabrication\t制造/建造\nfabulous\t传说的/寓言般的\nfacade\t建筑物的正面/外观\nface\t脸/面容\nfacet\t面/方面\nfacial\t美颜/脸部按摩\nfacilitate\t使容易/促进\nfacility\t容易/灵巧\nfact\t事实/真实性\nfaction\t小派系/内讧\nfactor\t因素/因数\nfactory\t工厂/产生地\nfactual\t事实的/实际的\nfaculty\t才能/能力\nfade\t褪色/消失\nfaded\t已褪色的/已凋谢的\nfaecal\t排泄物的/渣滓的\nfahrenheit\t华氏温度计的\nfail\t失败/缺乏\nfailed\t已失败的\nfailure\t失败/失败者\nfaint\t昏厥/昏倒\nfaintly\t微弱地/模糊地\nfair\t展览会/市集\nfairly\t美观地/公平地\nfairness\t晴朗/光明正大\nfairway\t航路\nfairy\t仙女/精灵\nfaith\t信心/信任\nfaithful\t忠实的/详确的\nfaithfully\t忠实地/诚心诚意地\nfake\t假货/欺骗\nfalklands\t福克兰群岛\nfall\t落下/瀑布\nfallen\t堕落的/落下来的\nfallon\t法隆\nfallout\t原子尘的降下/辐射性微尘\nfalse\t错误的/虚伪的\nfalter\t支吾地说\nfame\t名望/名声\nfamed\t著名的/闻名的\nfamiliar\t熟悉的/常见的\nfamiliarity\t熟悉/精通\nfamily\t家庭/家人\nfamine\t饥荒/缺乏\nfamous\t出名的/极好的\nfamously\t极好地/非常令人满意地\nfan\t风扇/迷\nfancy\t想象力/幻想\nfantastic\t奇妙的/稀奇的\nfantasy\t幻想/想象的产物\nfar\t远的/久远的\nfare\t费用/旅客\nfarewell\t辞别/再见\nfarm\t农场/农田\nfarmer\t农夫/农场主\nfarmhouse\t农舍\nfarming\t农业/耕作\nfarmland\t农田\nfarther\t更远的/进一步的\nfascinate\t令人入神/使着迷\nfascinating\t迷人的/吸引人的\nfascination\t令人着迷的事物/入迷\nfascism\t法西斯主义/极端国家主义\nfascist\t法西斯主义者/法西斯党员\nfashion\t流行/风尚\nfashionable\t时髦的/上流社会的\nfast\t快速的/紧的\nfasten\t拴紧/使固定\nfastener\t结扎工/使系牢之物\nfastest\t最快速的\nfat\t脂肪/脂油\nfatal\t致命的/重大的\nfatality\t不幸/厄运\nfate\t命运/运气\nfather\t父亲/祖先\nfatigue\t疲乏/疲劳\nfatty\t肥胖的/脂肪的\nfault\t过错/故障\nfaultless\t完美的/无缺点的\nfaulty\t有过失的/有缺点的\nfauna\t动物群\nfavor\t好意/喜爱\nfavorable\t有利的/赞许的\nfavored\t有利的/受惠的\nfavorite\t喜欢的事物/幸运儿\nfavour\t好感/偏爱\nfavourable\t有用的/良好的\nfavourably\t顺利地/有利地\nfavoured\t受到优待的/优惠的\nfavourite\t喜欢的事物\nfax\t传真\nfaye\t法耶\nfear\t恐怖/害怕\nfearful\t可怕的/恐怕的\nfearless\t大胆的/勇敢的\nfeasibility\t可行性/可能性\nfeasible\t能实行的/可行的\nfeast\t宴会/酒席\nfeat\t壮举/功绩\nfeather\t羽毛\nfeature\t面孔的一部分\nfeb\t二月\nfebruary\t二月\nfederal\t联邦的/联合的\nfederally\t同盟地/联邦地\nfederation\t联邦/联合\nfee\t费用/小费\nfeeble\t微弱的/衰弱的\nfeed\t饲料/一餐\nfeedback\t反馈/反应\nfeel\t感觉/觉得\nfeeling\t摸/触觉\nfelipe\t人名/(西\nfell\t击倒\nfellow\t男人/朋友\nfellowship\t伙伴关系/共同参与\nfelony\t重罪\nfemale\t女性/女人\nfeminine\t女性的/阴性的\nfeminism\t女权主义/男女平等主义\nfeminist\t男女平等主义者\nfen\t沼泽/沼池\nfence\t围墙/栅栏\nfencing\t围墙/剑术\nfend\t击退/保护\nfender\t防卫物/挡泥板\nfergie\t菲姬\nfergus\t费格斯\nferguson\t弗格森/弗格森\nfern\t蕨类植物\nfernando\t费尔南多\nferret\t白鼬/雪貂\nferrous\t铁的/含铁的\nferry\t渡船/渡口\nfertile\t可繁殖的/肥沃的\nfertility\t肥沃/丰饶\nfertilizer\t肥料/促进发展者\nfestival\t节日的/喜庆的\nfetal\t胎儿的/胎的\nfetch\t取得/拿\nfetus\t胎儿\nfeudal\t封建制度的/封地的\nfever\t发烧/发热\nfew\t很少的/不多的\nfewer\t较少的\nfiber\t纤维/构造\nfibre\t纤维/构造\nfiction\t小说/虚构故事\nfictional\t虚构的/编造的\nfiddle\t小提琴/提琴类乐器\nfield\t领域/田地\nfierce\t凶猛的/猛烈的\nfiercely\t猛烈地/厉害地\nfiery\t炽热的/热烈的\nfifteen\t十五/十五个\nfifteenth\t第十五/十五分之一\nfifth\t第五/五分之一\nfifty\t五十/五十个\nfig\t无花果/无价值的东西\nfight\t打架/争吵\nfighter\t斗士/战士\nfighting\t战斗的/容易引起争斗的\nfigure\t数字/价格\nfilament\t细丝/细线\nfile\t档案/公文箱\nfiling\t锉/琢磨\nfill\t装满/填充\nfilling\t充填物/填料\nfilm\t软片/薄膜\nfilmmaker\t电影制作人\nfilter\t滤波器/过滤器\nfilth\t污秽/不洁\nfilthy\t污秽的/丑恶的\nfin\t鳍/鱼翅\nfinal\t期末考试/结局\nfinale\t结局/最后乐章\nfinally\t最后/终于\nfinance\t财政/财务\nfinancial\t财政的/金融的\nfinancially\t金融上/财政上\nfinancing\t融资/理财\nfind\t发现/感到\nfinding\t发现/发现物\nfine\t罚款/罚金\nfinely\t雅致地/仔细地\nfines\t细骨料/粉末\nfinger\t手指/指状物\nfingernail\t手指甲\nfingerprint\t指纹\nfingertip\t指尖/指套\nfinish\t完成/结束\nfinished\t完成的/完结的\nfinishing\t最后的/终点的\nfinite\t有限的/有穷的\nfinland\t芬兰\nfinn\t芬兰人\nfiona\t菲奥纳\nfire\t火/炉火\nfirearm\t火器/枪炮\nfirefighter\t<美>消防队员\nfireman\t救火队员/消防队员\nfireplace\t壁炉\nfirewood\t木柴\nfirework\t烟火具/烟火\nfireworks\t烟火/激烈争论\nfiring\t烧毁/焚烧\nfirm\t公司/商号\nfirmly\t坚固/坚定\nfirmness\t坚固/坚牢\nfirst\t首先/第一\nfirsthand\t直接的/直接得来的\nfirstly\t第一/首先\nfiscal\t财政的/国库的\nfish\t鱼/鱼肉\nfisher\t渔夫/食鱼动物\nfisherman\t渔夫/钓鱼者\nfishery\t渔业\nfishing\t钓鱼/鱼业\nfission\t裂开/分裂\nfist\t拳头/手\nfit\t适宜/合身\nfitness\t适合/合宜\nfitting\t适宜的\nfive\t五/五个\nfiver\t五镑/票面为五镑的钞票\nfix\t使固定/修理\nfixed\t固定的/不变的\nfixture\t固定/固定物\nflag\t标志/旗标\nflair\t鉴别力/才能\nflake\t小薄片/扁薄的一层\nflame\t火焰/火舌\nflaming\t燃烧的/热烈的\nflank\t侧面/侧腹\nflannel\t法兰绒/法兰绒衣服\nflap\t飘/摆动\nflare\t闪光/闪耀\nflash\t闪光/闪现\nflashlight\t手电筒/闪光信号灯\nflask\t细颈瓶/烧瓶\nflat\t平坦的/单调的\nflatten\t使...不活跃/变平\nflatter\t奉承/阿谀\nflavor\t滋味/调味品\nflavour\t味/调味香料\nflaw\t缺点/裂纹\nflawed\t有缺陷的/有裂纹的\nflea\t跳蚤\nflee\t逃避/逃跑\nfleet\t舰队/港湾\nfleming\t佛兰芒人/说佛兰芒语的比利时人\nflesh\t肉/肉体\nfletcher\t弗莱彻\nflex\t弯曲/伸缩\nflexibility\t弹性/适应性\nflexible\t易曲的/灵活的\nflick\t快速的轻打/轻打声\nflicker\t闪烁/闪光\nflier\t飞行者/快船\nflight\t飞行/射程\nflinch\t畏缩/退缩\nfling\t投掷/急冲\nflip\t掷/弹\nflirt\t卖弄风骚的人/急动\nfloat\t漂流物/浮舟\nfloating\t漂浮的/浮动的\nflock\t兽群/鸟群\nflood\t洪水/大量之水\nflooding\t充溢/泛滥\nfloor\t地板/楼层\nflop\t砰然落下/拍击声\nfloppy\t叭嗒叭嗒响的/松软的\nflora\t植物群\nfloral\t花似的/花的\nflorence\t佛罗伦萨\nflorida\t佛罗里达州\nflour\t面粉/粉沫\nflourish\t繁荣/茂盛\nflow\t流程/流动\nflower\t花/开花植物\nflowing\t流动的/如流的\nflu\t流感/流行性感冒\nfluctuate\t变动/起伏\nfluctuation\t变动/波动\nfluency\t流畅/雄辩\nfluent\t流利的/流畅的\nfluid\t液体/分泌液\nfluorescent\t荧光\nflurry\t疾风/飓风\nflush\t流溢/面红\nflute\t笛/横笛\nflutter\t摆动/鼓翼\nflux\t流出/涨潮\nfly\t苍蝇/两翼昆虫\nflying\t飞的/飘扬的\nfoam\t泡沫/水沫\nfocal\t焦点的/在焦点上的\nfocus\t焦点/焦距\nfoe\t仇敌/反对者\nfog\t雾/迷惑\nfoggy\t雾深的/模糊的\nfoil\t箔/烘托\nfold\t折层/折\nfolder\t文件夹/折纸机\nfoliage\t树叶/植物\nfolk\t人们/家人\nfollow\t跟随/沿行\nfollower\t从者/属下\nfollowing\t下列各项/部下\nfolly\t愚蠢/荒唐事\nfond\t喜欢的/宠爱的\nfont\t字体/字形\nfood\t食物/养料\nfool\t愚人/受骗者\nfoolish\t愚蠢的/傻的\nfoot\t脚/步调\nfootage\t英尺长度/英板尺\nfootball\t足球/橄榄球\nfootballer\t足球员/足球选手\nfooting\t站稳/立足点\nfootpath\t步道/人行道\nfootprint\t足迹\nfootstep\t脚步/脚步声\nfor\t为/因为\nforbid\t禁止/不准\nforce\t力量/武力\nforced\t被迫的/强迫的\nforceful\t有力的/强烈的\nforcibly\t强制地/用力地\nford\t浅滩/福特汽车\nfore\t在前的/以前的\nforearm\t前臂\nforecast\t预想/预测\nforefront\t最前部/最前线\nforeground\t前景/最显著的位置\nforehead\t额/前额\nforeign\t外国的/外交的\nforeigner\t外国人/外地人\nforeman\t领班/工头\nforemost\t最初的/最重要的\nforensic\t辩论的/法院的\nforesee\t预见/预知\nforeseeable\t可预知的/能预测的\nforest\t森林/林区\nforestry\t林学/森林地\nforever\t永远\nforge\t熔炉/铁工厂\nforget\t忘记/忽略\nforgetful\t健忘的/易忘的\nforgive\t原谅/宽恕\nforgiveness\t宽恕/宽仁之心\nforgotten\tforget的过去分词\nfork\t叉子/叉状物\nform\t形状/形体\nformal\t正式的/形式的\nformality\t礼节/拘谨\nformally\t正式地/形式上\nformat\t开本/版式\nformation\t形成/构造\nformer\t从前的/前者的\nformerly\t从前/以前\nformidable\t巨大的/优秀的\nformula\t客套语/公式\nformulate\t用公式表示/明确叙述\nformulation\t系统陈述/公式化\nforsake\t放弃/断念\nforster\t福斯特\nfort\t堡垒/要塞\nforth\t往前/以后\nforthcoming\t即将来临的\nfortnight\t两星期\nfortress\t城堡/要塞\nfortunate\t幸运的/幸福的\nfortunately\t幸运地/幸亏\nfortune\t财富/运气\nforty\t四十/四十个\nforum\t论坛/公开讨论的广场\nforward\t向前的/早的\nforwards\t向前/今后\nfossil\t化石/古物\nfoster\t收养的/养育的\nfoul\t污秽的/邪恶的\nfound\t建立/创立\nfoundation\t基础/根据\nfounder\t创立者/建立者\nfountain\t水源/源\nfour\t四/四个\nfourteen\t十四/十四个\nfourteenth\t第十四/十四分之一\nfourth\t第四/四分之一\nfowl\t鸟/飞禽\nfox\t狐狸/狡猾的人\nfoyer\t门厅/入门大堂\nfraction\t小部分/破片\nfracture\t破碎/骨折\nfragile\t易碎的/脆的\nfragment\t碎片/破片\nfragmented\t成碎片的/片断的\nfragrance\t芬芳/香味\nfragrant\t芬香的/馥郁的\nfrail\t脆弱的/虚弱的\nframe\t框/结构\nframed\t遭到陷害的/有构架的\nframework\t结构/骨架\nfran\t弗兰\nfranc\t法郎\nfrance\t法国\nfrances\t弗朗西丝\nfranchise\t公民权/特权\nfrancis\t弗朗西斯\nfrancisco\t弗朗西斯科\nfranco\t免费的\nfrank\t坦白的/率直的\nfrankfurt\t牛肉香肠/猪牛肉混合香肠\nfrankie\t弗兰基\nfrankly\t坦白地\nfrantic\t狂乱的/疯狂的\nfrantically\t狂暴地/疯狂似地\nfraser\t弗雷则河/弗雷泽\nfraternity\t友爱/互助会\nfraud\t欺骗/欺诈\nfreak\t畸形人/畸形物\nfred\t佛瑞德\nfreddie\t弗雷迪\nfrederick\t弗雷德里克\nfree\t自由的/享受政治权力的\nfreedom\t自由/坦率\nfreelance\t自由作家/自由投稿\nfreely\t自由地/随意地\nfreeman\t自由民/公民\nfreeway\t高速公路\nfreeze\t冻结/冷冻\nfreezer\t冰库/冰箱\nfreezing\t冰冻的/冷冻用的\nfreight\t船货/运费\nfrench\t法国人/法文\nfrenchman\t法国人\nfrenzy\t疯狂/狂暴\nfrequency\t频率/频数\nfrequent\t时常发生的/频繁的\nfrequently\t频繁/经常地\nfresh\t新鲜的/新奇的\nfreshen\t显得新鲜/精神饱满\nfreshly\t新/新近\nfreshman\t新手/生手\nfreshwater\t江河湖泊的/淡水的\nfret\t烦躁/磨损\nfreud\t佛洛伊德\nfriar\t修道士\nfriction\t摩擦/摩擦治疗\nfriday\t星期五\nfridge\t电冰箱\nfried\t油炸的\nfriend\t朋友/支持者\nfriendly\t友好的/亲切的\nfriendship\t友谊/友爱\nfright\t惊骇/吃惊\nfrighten\t使惊吓\nfrightened\t受惊吓的/受惊的\nfrightening\t令人恐惧的/引起突然惊恐的\nfrightful\t可怕的/惊人的\nfringe\t边缘/端\nfro\t向那边/向后\nfrock\t女礼服/连衣裙\nfrog\t青蛙\nfrom\t从/来自\nfront\t前面/开头\nfrontier\t边界/边境\nfrost\t霜/冰冻\nfrown\t皱眉\nfrozen\t冻结的/冰冷的\nfruit\t水果/果类\nfruitful\t结果实的/多实的\nfrustrate\t挫败/击败\nfrustrated\t失意的/挫败的\nfrustrating\t令人沮丧的\nfrustration\t挫折/顿挫\nfry\t油炸食物/鱼苗\nfrying\t油炸/油煎\nft\t英尺\nftse\tfailedtosustaine\nfuck\t与...性交/欺骗\nfucking\t该死的/难完成的\nfuel\t燃料/木炭\nfugitive\t逃亡的/短暂的\nfulfil\t实践/履行\nfulfill\t实践/履行\nfulfillment\t履行/结束\nfulfilment\t履行/结束\nfull\t全部/完整\nfully\t十分地/完全地\nfumble\t摸索/笨拙的行动\nfume\t臭气/烟\nfun\t乐趣/玩笑\nfunction\t官能/职务\nfunctional\t功能的\nfunctioning\t运行/运作\nfund\t基金/资金\nfundamental\t基本原理/原则\nfundamentalist\t基要主义者\nfundamentally\t基础/首要\nfuneral\t葬礼/出殡\nfungus\t真菌/真菌类植物\nfunny\t好笑的/有趣的\nfur\t毛皮\nfurious\t狂怒的/激烈的\nfuriously\t狂暴地/猛烈地\nfurnace\t火炉/熔炉\nfurnish\t供给/提供\nfurnished\t家具/有家具的\nfurnishing\t家具/服饰品\nfurnishings\t家具/供应\nfurniture\t家具/帆具\nfurther\t更远的/此外的\nfurthermore\t此外/而且\nfury\t愤怒/狂暴\nfuse\t保险丝/导火线\nfusion\t熔合物/结合\nfuss\t大惊小怪/小题大作\nfutile\t无用的/琐细的\nfuture\t未来/将来\nfuzzy\t有微毛的/模糊的\ngabriel\t加百利\ngadget\t小配件/小玩意\ngain\t增益/获得\ngala\t节日/祝贺\ngalaxy\t银河/星系\ngale\t狂风/大风\ngall\t胆汁/五倍子\ngallery\t走廊/最高楼座\ngallon\t加仑\ngamble\t赌博/冒险\ngambling\t赌博\ngame\t比赛/玩耍\ngaming\t赌博/赌胜负\ngandhi\t甘地\ngang\t队/群\ngangster\t流氓/歹徒\ngaol\t监禁/监狱\ngap\t缝隙/缺口\ngarage\t车库/汽车修理厂\ngarbage\t垃圾/废物\ngarden\t花园/果园\ngardener\t园丁/花匠\ngardening\t园艺\ngarlic\t大蒜\ngarment\t衣服/衣装\ngarnish\t装饰/装饰品\ngarrison\t守备队/驻军\ngary\t盖理\ngas\t气体/汽油\ngaseous\t气体的/气态的\ngasoline\t汽油\ngasp\t喘气\ngastric\t胃的\ngastrointestinal\t胃肠的/肠胃的\ngate\t门/牌楼\ngateway\t门/通路\ngather\t集合/聚集\ngathering\t聚集/集中\ngatt\t关贸总协定\ngauge\t标准度量/计量器\ngaulle\t高尔\ngavin\t加文\ngay\t欢快的/艳丽的\ngaze\t注视/凝视\ngcse\t普通中等教育证书\ngear\t齿轮/工具\ngee\t马/家伙\ngel\t胶化体/凝胶\ngem\t珠宝/宝石\ngen\t消息/真相\ngender\t性\ngene\t基因\ngeneral\t一般/将军\ngeneralization\t一般化/普遍化\ngeneralize\t一般化/概括\ngenerally\t通常/逐渐地\ngenerate\t产生/发生\ngenerating\t产生的/生成的\ngeneration\t一代/一世\ngenerator\t产生器/发电机\ngeneric\t属类的/一般的\ngenerosity\t慷慨/宽大\ngenerous\t慷慨的/有雅量的\ngenerously\t宽大地/慷慨地\ngenesis\t发生/起源\ngenetic\t创始的/遗传的\ngenetically\t创始/遗传学\ngenetics\t遗传学\ngeneva\t日内瓦/杜松子酒\ngenius\t天才/天赋\ngenocide\t种族灭绝/灭绝整个种族的大屠杀\ngenre\t类型/流派\ngentle\t温和的/文雅的\ngentleman\t绅士/先生\ngently\t温和地/温柔地\ngentry\t贵族们\ngenuine\t真正的/真实的\ngenuinely\t真诚地/诚实地\ngenus\t种/类\ngeoff\t杰夫\ngeoffrey\t杰弗里\ngeographic\t地理的/地区的\ngeographical\t地理学的/地理的\ngeography\t地理学/地理\ngeological\t地质学的/地质的\ngeologist\t地质学家/地质学者\ngeology\t地质学/地质情况\ngeometric\t几何学的/几何学上的\ngeometrical\t几何学的/几何的\ngeometry\t几何学\ngeorge\t乔治/自动操纵装置\ngeorgia\t乔治亚州\ngeorgian\t乔治亚州人/乔治亚人\ngerald\t杰拉尔德\ngerard\t杰勒德\ngerm\t细菌/种子\ngerman\t德国人/德语\ngermany\t德国\ngerry\t格里\ngesture\t手势/姿态\nget\t得到/获得\nghastly\t可怕的/惨白的\nghetto\t犹太人区\nghost\t鬼/灵魂\ngi\t军用的/美国军人的\ngiant\t巨人/大力士\ngift\t礼物/赠予\ngifted\t有天才的\ngig\t旋转物/轻便双轮马车\ngigantic\t巨人般的/巨大的\ngiggle\t吃吃地笑/咯咯地笑\ngilbert\t吉尔伯特\ngiles\t贾尔斯/圣伊莱斯（7世纪在法兰西\ngill\t鳃/菌褶\ngillian\t吉莉安\ngilt\t镀金/眩目的外表\ngin\t杜松子酒/轧棉机\ngina\t吉娜\nginger\t姜/精力\ngiraffe\t长颈鹿/鹿豹座\ngirl\t女孩/少女\ngirlfriend\t女朋友\ngive\t弹性/适应性\ngiven\t赠予的/沉溺的\nglacier\t冰川\nglad\t高兴的/喜欢的\nglamor\t魅力/迷人的美\nglamorous\t富有魅力的/迷人的\nglamour\t魅力/迷人的美\nglance\t一瞥/闪光\ngland\t腺/密封套\nglare\t闪耀光/刺眼\nglasgow\t格拉斯哥\nglass\t玻璃/玻璃杯\nglasshouse\t温室/玻璃工场\nglaze\t釉/上光\ngleam\t光束/微光\ngleaming\t闪闪发光的\nglen\t峡谷/幽谷\nglide\t滑动/滑过\nglider\t滑翔员/滑翔机\nglimpse\t一瞥/一闪\nglitter\t灿烂/闪烁\nglittering\t闪闪发光的/光辉灿烂的\nglobal\t通用的/全球的\nglobe\t球/球状物\ngloom\t忧郁/暗处\ngloomy\t抑沉的/忧闷的\ngloria\t地质用远程斜向[指示]声纳\nglorify\t赞美/美化\nglorious\t光荣的\nglory\t光荣/荣耀\ngloss\t光彩/假象\nglossary\t专业词典/术语集\nglossy\t平滑的/有光泽的\ngloucester\t格洛斯特/格洛斯特硬干酪\ngloucestershire\t格洛斯特郡[英国英格兰郡名]\nglove\t手套\nglow\t赤热/光辉\nglowing\t白热的/灼热的\nglucose\t葡萄糖\nglue\t胶/粘性物\ngmt\t格林威治平均时\ngnaw\t咬/啃\ngnp\t国民生产总值\ngo\t去/走\ngoal\t目标/终点\ngoalkeeper\t守门员\ngoat\t山羊/替罪羊\ngoblin\t小妖精\ngod\t上帝/神像\ngoddamn\t该死的/完全的\ngoddess\t女神/美女\ngoing\t去/离去\ngold\t黄金/钱财\ngolden\t金的/含金的\ngoldfish\t金鱼\ngoldsmith\t金匠\ngolf\t高尔夫球\ngolfer\t打高尔夫球的人\ngooch\t古氏\ngood\t善行/好处\ngoodbye\tinterj.再见\ngoodness\t仁慈/善良\ngoodnight\t晚安/再见\ngoods\t货物\ngoodwill\t友好/好意\ngoose\t鹅/雌鹅\ngop\t大老党/地面观测站\ngorgeous\t华丽的/灿烂的\ngorilla\t大猩猩/残暴的男人\ngosh\tinterj.唉/天啊\ngospel\t福音/信仰\ngossip\t闲聊/随笔\ngothic\t哥特风格\ngould\t古尔德\ngourmet\t美食家\ngovern\t统治/支配\ngovernance\t统治/统辖\ngovernment\t政府/内阁\ngovernmental\t政治的/统治上的\ngovernor\t州长/总督\ngown\t睡衣/法衣\ngp\t普通医师/普通医生开业医生\ngrab\t抓握/掠夺\ngrace\t优雅/风度\ngraceful\t优美的\ngracious\t亲切的/慈善的\ngrade\t等级/年级\ngrader\t把东西分类别的人/机器/平路机\ngradient\t倾斜度/梯度\ngradual\t逐渐的/渐增的\ngradually\t逐渐地\ngraduate\t毕业生/量杯\ngraduation\t毕业/得学位\ngraeme\t格雷姆\ngraffiti\t墙上乱写乱画的东西\ngraham\t全麦的/粗面粉的\ngrain\t谷粒/颗粒\ngram\t克/绿豆\ngrammar\t语法学/入门书\ngrammatical\t语法的/合乎语法的\ngramme\t克\ngramophone\t留声机\ngran\t外祖母/祖母\ngrand\t庄重的/壮观的\ngrandchild\t孙/外孙女\ngrandchildren\t孙子/孙辈\ngranddaughter\t孙女/外孙女\ngrandfather\t祖父/始祖\ngrandma\t奶奶/外婆\ngrandmother\t祖母/女祖先\ngrandpa\t爷爷/老太爷\ngrandparent\t祖父母\ngrandparents\t外祖父母/祖父母\ngrandson\t孙子/外孙\ngranite\t花岗岩\ngranny\t奶奶/老奶奶\ngrant\t授予/授予物\ngrape\t葡萄/葡萄树\ngraph\t曲线图/图表\ngraphic\t生动的/轮廓分明的\ngraphical\t图的/记录的\ngraphics\t制图法/制图学\ngraphite\t石墨\ngrapple\t抓住/掌握\ngrasp\t把握/抓紧\ngrass\t草/草原\ngrasshopper\t蚱蜢/蝗虫\ngrassy\t草绿色的/象草的\ngrate\t炉格/炉篦\ngrateful\t感谢的/感激的\ngratitude\t感激之情\ngrave\t墓穴/坟墓\ngravel\t砂砾/碎石\ngraveyard\t墓地\ngravitational\t重力的\ngravity\t地心引力/重力\ngravy\t肉汁/外快\ngray\t灰色/暗淡\ngraze\t吃草/放牧\ngrease\t脂肪/兽脂\ngreasy\t油腻的/含脂肪多的\ngreat\t大的/非常的\ngreatly\t很/非常\ngreatness\t大/巨大\ngreece\t希腊\ngreed\t贪欲/贪婪\ngreedy\t贪婪的/贪得的\ngreek\t希腊人/希腊语\ngreen\t绿色/绿色颜料\ngreenbelt\t绿色地带\ngreengrocer\t蔬菜水果商/菜贩\ngreenhouse\t温室\ngreenpeace\t绿色和平组织\ngreet\t问候/致敬\ngreeting\t祝贺/问候\ngreg\t格雷格\ngregory\t格雷戈里\ngrenade\t手榴弹\ngrey\t灰色\ngrid\t格子/栅格\ngrief\t伤心/忧愁\ngrievance\t委屈/冤情\ngrieve\t使悲伤\ngriffiths\t格里菲思\ngrill\t烤架/铁格子\ngrilled\t烤的/炙过的\ngrim\t冷酷的/坚强的\ngrimly\t严格地/冷酷地\ngrin\t露齿笑\ngrind\t磨/碾\ngrip\t紧握/柄\ngrit\t砂砾/粗砂石\ngroan\t呻吟/叹息\ngrocer\t食品商\ngrocery\t食品杂货店/食品杂货业\ngroom\t马夫/新郎\ngroove\t凹槽/惯例\ngrope\t摸索\ngross\t总数/总量\ngrossly\t非常/很\nground\t土地/战场\ngroundwater\t地下水\ngroup\t团体/组\ngrouping\t分组\ngrove\t小树林\ngrow\t种植/使长满\ngrower\t栽培者/生长物\ngrowing\t成长的\ngrowl\t吠声/咆哮声\ngrowth\t生长/栽培\ngruel\t稀粥\ngrumble\t怨言/满腹牢骚\ngrunt\t作呼噜声\nguarantee\t担保/抵押品\nguaranteed\t有保证的/有人担保的\nguard\t守卫者/警戒\nguardian\t看守者/监护人\nguerrilla\t游击队\nguess\t猜测/臆测\nguest\t客人/来宾\nguidance\t指导/领导\nguide\t引导者/导游\nguided\t有指导的/有向导的\nguideline\t指导路线/方针\nguido\t<美>太空飞行工程师/导航控制中\nguil\t人名/(西\nguild\t团体/协会\nguilt\t罪行/内疚\nguilty\t犯罪的/有过失的\nguinea\t几内亚\nguinness\t吉尼斯黑啤酒\nguise\t相似/外观\nguitar\t吉他\nguitarist\t吉他弹奏者\ngulf\t海湾/深渊\ngull\t鸥/易受骗之人\ngum\t树胶/橡皮\ngun\t枪\ngunfire\t炮火/号炮报时\ngunman\t枪手/持枪的歹徒\ngunpowder\t火药\ngunshot\t枪弹/射击\nguru\t古鲁\ngust\t突然一阵/趣味\ngut\t剧情/内容\nguts\t飞碟游戏（比赛双方每组5人/相距\ngutter\t排水沟/槽\nguy\t家伙/支索\ngym\t+体育馆/体育训练\ngymnasium\t健身房/体育馆\ngymnastics\t体操/体育\ngypsy\t吉卜赛人/吉卜赛语\nha\tinterj.嘿/哈\nhabit\t习惯/嗜好\nhabitat\t栖息地/居留地\nhabitual\t习惯的/惯常的\nhack\t劈/砍\nhail\t冰雹/致敬\nhair\t头发/毛发\nhaircut\t理发/发式\nhairdresser\t美发师/理发师\nhairy\t多毛的/毛状的\nhaitian\t海地的\nhalf\t一半/半场\nhalfway\t中途的/不彻底的\nhalifax\t哈里法克斯（财富500强公司之一\nhall\t门厅/走廊\nhallmark\t纯度检验证明/品质证明\nhalloween\t万圣节前夕\nhallway\t门厅/玄关\nhalo\t晕轮/光圈\nhalt\t停止/立定\nhalve\t二等分/对半分享\nham\t火腿/后腿\nhamburger\t汉堡/肉饼\nhamilton\t汉密尔顿/哈密尔顿\nhamlet\t小村/部落\nhammer\t锤/铁锤\nhammond\t哈蒙德\nhamper\t食篮/阻碍物\nhampshire\t汉普郡\nhand\t手/爪\nhandbag\t手提包\nhandbook\t手册\nhandful\t少数/一把\nhandgun\t手枪\nhandicap\t障碍/困难\nhandicapped\t残疾的\nhandkerchief\t手帕/头巾\nhandle\t柄/把手\nhandler\t处理者/操作者\nhandling\t处理\nhandout\t施舍物/救济品\nhandsome\t英俊的/大方的\nhandtruck\t手推车/手推运货车\nhandwriting\t笔迹\nhandy\t便利的/敏捷的\nhang\t悬挂/诀窍\nhanging\t绞死/绞杀\nhannah\t汉娜\nhans\t德国人或荷兰人的绰号/汉斯\nhappen\t发生/发生\nhappening\t事件/意外发生的事\nhappily\t幸福地/快乐地\nhappiness\t快乐/幸运\nhappy\t快乐的/幸福的\nharass\t使困扰/使烦恼\nharassment\t困扰/烦扰\nharbor\t港/避难所\nharbour\t港/避难所\nhard\t坚硬的/硬的\nharden\t使变硬/使坚强\nharder\t更难的/更努力的\nhardly\t刚刚/几乎不\nhardship\t艰难/辛苦\nhardware\t硬件/五金器具\nhardwood\t硬木/硬木材\nhardworking\t苦干的/不辞辛劳的\nhardy\t难的/艰苦的\nhare\t野兔\nhari\t哈里\nharlow\t哈洛\nharm\t伤害/害处\nharmful\t有害的/伤害的\nharmless\t无害处的/未受损害的\nharmonious\t和睦的/调和的\nharmony\t协调/和睦\nharness\t马具/挽具状带子\nharold\t哈罗德\nharp\t竖琴\nharper\t哈珀\nharriet\t哈里特\nharris\t哈里斯/哈里斯\nharrison\t哈里森\nharrogate\t哈罗盖特\nharry\t掠夺/使苦恼\nharsh\t粗糙的/刺耳的\nhart\t雄赤鹿/雄鹿\nhartlepool\t哈特尔普尔[英国英格兰东北部港市\nharvard\t哈佛大学\nharvest\t收获/成果\nharvey\t哈维\nhassle\t激烈而持久的争论\nhaste\t匆忙/急忙\nhasten\t催促/加紧\nhastily\t匆忙地/急速地\nhastings\t黑斯廷斯\nhasty\t匆匆的/轻率的\nhat\t帽子\nhatch\t孵化/舱口\nhate\t憎恨/恨\nhateful\t憎恨的/可恨的\nhatred\t憎恨/仇恨\nhaughty\t傲慢的/骄傲的\nhaul\t用力拖拉/拖运\nhaunt\t常到的地方/生息地\nhave\t有/怀有\nhaven\t港/避难所\nhavoc\t大破坏/蹂躏\nhawaiian\t夏威夷人/夏威夷语\nhawk\t鹰/掠夺者\nhay\t干草\nhazard\t冒险/危险\nhazardous\t危险的/冒险的\nhaze\t薄雾/阴霾\nhazel\t榛子/榛树\nhe\t他\nhead\t头/头脑\nheadache\t头痛/令人头痛之事\nheader\t收割台\nheading\t标题/起始字\nheadlight\t前灯/桅灯\nheadline\t大标题/新闻摘要\nheadlong\t头向前的/仓猝而用力的\nheadmaster\t校长/监工\nheadmistress\t女校长\nheadquarters\t总部/司令部\nheadteacher\t中小学的校长\nheal\t痊愈\nhealer\t医治者/治疗物\nhealing\t治愈的/恢复健康的\nhealth\t健康/卫生\nhealthy\t健康的/有益健康的\nheap\t堆/许多\nhear\t听到/倾听\nhearing\t听/听觉\nheart\t心/心脏\nheartbeat\t心跳\nhearth\t炉床/灶台\nhearty\t诚恳的/健壮的\nheat\t热/热度\nheated\t热的/激昂的\nheater\t加热器/灯丝\nheath\t石南荒原/低矮灌木\nheather\t石南花\nheathrow\t希思罗机场\nheating\t加热/供热\nheave\t举/抛\nheaven\t天堂/上帝\nheavenly\t天上的/神圣的\nheavily\t很重地/严重地\nheavy\t重的/巨大的\nheavyweight\t重量级拳击运动员/有影响的要人\nhebrew\t希伯来人/希伯来语\nheck\t真见鬼\nhectare\t公顷\nhectic\t脸上发红/发热的\nhector\t威吓者/虚张声势的人\nhedge\t树篱/障碍\nheed\t注意/留心\nheel\t脚后跟/踵\nhefty\t重的/肌肉发达的\nheight\t高度/海拔\nheighten\t增高/提高\nheightened\t变高/增大\nheir\t继承人/嗣子\nhelen\t海伦（女子名/火把\nhelicopter\t直升机\nhell\t地狱/邪恶势力\nhello\tinterj.喂/嘿\nhelm\t舵/驾驶盘\nhelmet\t钢盔/盔\nhelp\t帮忙/帮助者\nhelper\t帮忙者/有益的东西\nhelpful\t有帮助的/有益的\nhelping\t帮助/协助\nhelpless\t无助的/无能为力的\nhemisphere\t半球/地球的半面\nhen\t母鸡/雌禽\nhence\t因此/从此\nhenceforth\t自此以后/今后\nhenderson\t亨德森\nhenley\t亨利/亨里\nhenry\t亨利\nhepatitis\t肝炎\nher\t她的/她\nherald\t使者/传令官\nherb\t药草/香草\nherbal\t草药的\nherbert\t赫伯特\nherd\t兽群/人群\nhere\t在这里/此时\nhereditary\t世袭的/遗传的\nhereford\t赫里福德食用牛\nheritage\t遗产/祖先遗留物\nhero\t英雄/超越常人者\nheroic\t英勇的/英雄式的\nheroin\t海洛因/吗啡\nheroine\t巾帼英雄/烈妇\nherr\t先生/德国绅士\nherring\t青鱼/鲱\nhers\t她的\nherself\t她自己/她亲自\nhertfordshire\t赫特福德郡\nheseltine\t人名/赫塞尔廷\nhesitant\t迟疑的/踌躇的\nhesitate\t犹豫/迟疑\nhesitation\t犹豫/踌躇\nheterosexual\t异性的/异性爱的\nhey\tinterj.嗨\nhi\tinterj.喂\nhibernate\t过冬/冬眠\nhibernation\t过冬/冬眠\nhidden\t隐藏的\nhide\t兽皮/迹象\nhideous\t丑恶的/可憎的\nhierarchy\t等级制度/僧侣统治\nhiggins\t希金斯\nhigh\t高度/高处\nhighland\t高地/苏格兰高地\nhighlight\t加亮区/精彩场面\nhighly\t非常/非常赞许地\nhighway\t公路/大道\nhike\t徒步旅行/远足\nhiker\t徒步旅行者\nhilary\t希拉里/即Hilarius\nhilda\t希尔达\nhill\t小山/丘陵\nhillside\t山坡/山腹\nhilly\t多丘陵的/多山岗的\nhilton\t希尔顿/希尔顿集团\nhim\t他\nhimself\t他自己/他亲自\nhinder\t后面的\nhindrance\t妨害/障碍\nhindsight\t枪的表尺/事后聪明\nhindu\t印度教教徒的\nhinge\t铰链/关键\nhint\t暗示/提示\nhip\t臀部/蔷薇果\nhippie\t嬉皮士\nhire\t租金/租用\nhired\t租用/雇用\nhis\t他的\nhispanic\t西班牙的\nhiss\t嘘声/嘶嘶声\nhistorian\t历史学家/记事者\nhistoric\t历史上著名的/有历史性的\nhistorical\t历史的/史实的\nhistorically\t历史上地/从历史观点上说\nhistory\t历史/过去\nhit\t打击/打\nhitherto\t迄今/至今\nhitler\t希特勒\nhitter\t打手/打击的人\nhiv\t艾滋病病毒\nhive\t蜂房/闹区\nhmm\t隐马尔可夫模型/Hardware\nho\tinterj.嗬\nhoarse\t沙哑的/嘶哑的\nhobby\t嗜好/癖好\nhockey\t冰球/曲棍球\nhoe\t锄头\nhog\t猪/贪婪者\nhoist\t升高/起重机\nhold\t把握/把持力\nholder\t持有人/所有人\nholding\t把持/支持\nhole\t孔/洞\nholiday\t假日/假期\nholland\t荷兰\nhollow\t洞/窟窿\nholly\t冬青树\nhollywood\t好莱坞/美国电影界\nholmes\t福尔摩斯\nholy\t神圣的/圣洁的\nhomage\t尊崇/尊敬\nhome\t家/避难所\nhomeland\t本国/故国\nhomeless\t无家的/无养主的\nhomely\t家常的/平凡的\nhomemade\t自制的/国产的\nhomeowner\t私房屋主/自己拥有住房者\nhometown\t故乡/家乡\nhomework\t家庭作业/家里做的工作\nhomicide\t杀人/杀人者\nhomogeneous\t同种的/同质的\nhomosexual\t同性恋的\nhomosexuality\t同性恋\nhone\t磨刀石/抱怨\nhonest\t诚实的/坦直的\nhonestly\t真诚地/公正地\nhonesty\t诚实/公正\nhoney\t蜂蜜/甜蜜\nhoneymoon\t蜜月/蜜月假期\nhong\t行\nhonor\t荣誉/头衔\nhonorable\t值得尊敬的/荣耀的\nhonorary\t荣誉的/无报酬的\nhonour\t荣誉/头衔\nhonourable\t值得尊敬的/荣耀的\nhood\t头巾/兜帽\nhook\t钩/钩状\nhooligan\t小流氓\nhoop\t箍/铁环\nhooray\tinterj.万岁\nhop\t单脚跳/跳跃\nhope\t希望/信心\nhopeful\t有希望之人/有前途之人\nhopefully\t有希望地/如果希望能实现的话\nhopeless\t无希望的/绝望的\nhopelessly\t绝望地/无可奈何地\nhopkins\t霍普金\nhorizon\t地平线/眼界\nhorizontal\t水平线/水平面\nhormone\t荷尔蒙\nhorn\t角/角质\nhorrible\t可怕的/遭透的\nhorrific\t令人毛骨悚然的/感到恐惧的\nhorrified\t惊骇的/带有恐怖感的\nhorrify\t使恐惧/使震惊\nhorror\t惊骇/恐怖\nhorse\t马/骑兵\nhorseback\t马背\nhorsepower\t马力\nhose\t水管/橡皮软管\nhospital\t医院\nhospitality\t款待/亲切\nhost\t主人/旅馆老板\nhostage\t人质/抵押品\nhostel\t青年招待所/宿舍\nhostess\t女主人/女房东\nhostile\t敌人的/怀敌意的\nhostility\t敌意/敌对\nhot\t热的/热心的\nhotdog\t卖弄\nhotel\t旅馆/客栈\nhound\t猎犬\nhour\t小时/钟头\nhouse\t房子/住宅\nhousehold\t一家人/家庭\nhouseholder\t一家之主/家长\nhousekeeper\t主妇/女管家\nhousekeeping\t家事/家政\nhousewife\t主妇/家庭妇女\nhousework\t家事/家务\nhousing\t遮盖/住房供给\nhover\t盘旋/翱翔\nhow\t如何/怎样\nhoward\t霍华德\nhowe\t洞/洼地\nhowever\t然而/无论如何\nhowl\t嗥叫/吠声\nhp\t马力/分期付款购买法\nhq\t司令部/指挥部\nhub\t毂/木片\nhuddle\t杂乱一团/混乱\nhudson\t哈得孙河\nhue\t样子/色度\nhug\t紧抱/拥抱\nhuge\t极大的/巨大的\nhugely\t巨大地/非常地\nhugh\t休\nhugo\t雨果\nhuh\tinterj.哼/哈\nhull\t壳/皮\nhum\t嗡嗡声/哼声\nhuman\t人/人类\nhumane\t有人情的/人道的\nhumanitarian\t人道主义者/博爱者\nhumanities\t人文学科\nhumanity\t人性/人类\nhumble\t低下的/谦逊的\nhumid\t潮湿的/湿润的\nhumidity\t湿气/潮湿\nhumiliate\t使丢脸/使蒙羞\nhumiliation\t耻辱/丢脸\nhumility\t谦逊/谦虚\nhumor\t幽默/诙谐\nhumorous\t富幽默感的/滑稽的\nhumour\t幽默/诙谐\nhunch\t肉峰/预感\nhundred\t百/百个东西\nhungarian\t匈牙利的/匈牙利人的\nhungary\t匈牙利\nhunger\t饥饿/渴望\nhungry\t饥饿的/荒年的\nhunt\t狩猎/追捕\nhunter\t猎人/猎犬\nhunting\t狩猎/猎狐\nhurd\t胡日德乐队/赫德\nhurdle\t障碍/跳栏\nhurl\t用力的投掷\nhurrah\t欢呼声/骚动\nhurricane\t飓风/暴风\nhurriedly\t仓促地/匆忙地\nhurry\t匆忙/急忙\nhurt\t伤害/创伤\nhusband\t丈夫/管理人\nhush\t肃静/安静\nhussein\t侯赛因\nhustle\t心碌/挤\nhut\t小屋/茅舍\nhybrid\t混血儿/杂种\nhyde\t海德\nhydraulic\t与水有关的/水力的\nhydrocarbon\t碳氢化合物\nhydrogen\t氢\nhygiene\t卫生保健/卫生学\nhymn\t赞美诗/圣歌\nhype\t大肆宣传/皮下注射\nhypocrisy\t伪善\nhypotheses\tpl.假说/前提\nhypothesis\t假设\nhypothesize\t假设/假定\nhypothetical\t假设的/有待证实的\nhysteria\t歇斯底里症/不正常的兴奋\nhysterical\t歇斯底里的/异常兴奋的\nian\t伊恩\nibid\t如上/同前\nibm\t美国国际商用机器公司\nice\t冰/冰淇淋\niceberg\t冰山/冷冰冰的人\niceland\t冰岛\nici\t英国化学工业公司\nicing\t糖衣/结冰\nicon\t画像/肖像\nicy\t冰的/冰冷的\nid\t遗传素质/本能冲动\nidea\t主意/办法\nideal\t理想/典范\nidealism\t唯心主义/观念论\nideally\t完美地/理想地\nidentical\t同一的/恒等的\nidentifiable\t可辨认的\nidentification\t识别/身份证明\nidentifier\t检验人/标识符\nidentify\t识别/认为...等同于\nidentity\t身份/相同\nideological\t意识形态的/空想的\nideology\t思想体系/意识形态\nidiom\t习语/成语\nidiot\t白痴/极蠢之人\nidle\t懒惰的/闲散的\nidleness\t懒惰/闲散\nidol\t偶像/崇拜物\nif\t如果/是否\nignite\t点燃/使灼热\nignorance\t无知/愚味\nignorant\t无知识的/不知道的\nignore\t不理睬/忽视\nii\t微光\niii\t罗马数字3\nill\t疾病/坏事\nillegal\t违法的/不合规定的\nillegitimate\t不法的/私生的\nillicit\t不法的/不正当的\nilliterate\t文盲\nillness\t疾病/恶意\nilluminate\t照明/用灯装饰\nillusion\t幻影/错觉\nillustrate\t举例说明/作图解\nillustration\t例证/插图\nimage\t影像/肖像\nimagery\t肖像/比喻\nimaginary\t想像的/虚构的\nimagination\t想像/听觉\nimaginative\t想像的/虚构的\nimagine\t想像/设想\nimbalance\t不平衡/不均衡\nimf\t国际货币基金组织\nimitate\t模仿/效法\nimitation\t模仿/效法\nimmaculate\t无污点的/纯洁的\nimmature\t不成熟的/未完全发育的\nimmediate\t立即的/直接的\nimmediately\t直接地/立刻\nimmense\t极广大的/无边的\nimmensely\t无限地/广大地\nimmerse\t沉浸/使陷入\nimmigrant\t移民\nimmigrate\t使移居入境\nimmigration\t移民/移居\nimminent\t即将来临的/逼近的\nimmoral\t不道德的/邪恶的\nimmortal\t不朽人物/神仙\nimmune\t免疫的/免除的\nimmunity\t免疫/免疫性\nimpact\t冲击/冲突\nimpair\t损害/减少\nimpaired\t受损的\nimpairment\t削弱/减少\nimpart\t给予/传授\nimpartial\t公平的/不偏不倚的\nimpatience\t性急/难耐\nimpatient\t不耐烦的/着急的\nimpatiently\t不耐烦/忍受不了\nimpede\t妨碍/阻碍\nimpending\t即将发生的/迫切的\nimperative\t命令/必要的事\nimperial\t帝王的/宗主国的\nimpersonal\t客观的/和个人无关的\nimpetus\t动力/推动力\nimplant\t深植/灌输\nimplement\t工具/器具\nimplementation\t安装启用/实行\nimplicate\t涉及/含意\nimplication\t牵连/含义\nimplicit\t暗示的/含蓄的\nimplicitly\t含蓄/不言明\nimplied\t暗指的/含蓄的\nimplore\t恳求/哀求\nimply\t暗示/意味\nimport\t进口货/进口\nimportance\t重要/重要性\nimportant\t重要的/有地位的\nimportantly\t重要地/大量地\nimported\t输入/进口\nimpose\t征/把...强加于\nimposing\t令人难忘的/壮丽的\nimposition\t征收/课税\nimpossibility\t不可能之事/不可能\nimpossible\t不可能的/难以置信的\nimpoverish\t使贫穷/耗尽...的力气\nimpoverished\t穷困的/无力的\nimpress\t印象/特征\nimpressed\t外加的/印象深刻的\nimpression\t印象/意念\nimpressive\t给人深刻印象的/威严的\nimprison\t使下狱/关闭\nimprisonment\t监禁/下狱\nimprobable\t不大可能的/不象发生的\nimproper\t不合适的/错误的\nimprove\t改良/提高...的价值\nimproved\t改良的\nimprovement\t进步/改善\nimproving\t有启发的/有教育意义的\nimprovisation\t即兴而作/即席演奏\nimprovise\t即席创作/临时做\nimpulse\t冲动/驱使\nimpurity\t杂质/不洁\nin\t在...期间/在...之内\ninability\t无能/无力\ninaccessible\t难得到的/难接近的\ninaccurate\t错误的/不准确的\ninadequacy\t不适当/不足之处\ninadequate\t不充分的/不适当的\ninadvertently\t漫不经心地/疏忽地\ninappropriate\t不适当的/不相称的\ninasmuch\t因...之故/在...范围内\ninaudible\t听不见的\ninaugural\t就任的/开幕的\ninaugurate\t开始/举行...就职典礼\ninauguration\t总统就职/开幕仪式\ninc\t根据法律组成的公司/公司\nincandescent\t白热的/闪闪发光的\nincapable\t无能力的/不能的\nincarnation\t典型/特殊阶段\nincense\t香/香气\nincentive\t动机\ninch\t英寸/身高\nincidence\t发生/发生率\nincident\t事件/事变\nincidental\t附带的/偶然的\nincidentally\t伴随地/偶然\ninclination\t倾向/趋向\nincline\t倾斜/斜坡\ninclined\t倾向于...的/想要...的\ninclude\t包括/把...算入\nincluding\t包含/包括\ninclusion\t包含/内含物\ninclusive\t包含的/包括的\nincome\t收入/收益\nincoming\t进来的/刚开始的\nincompatible\t不相容的/不能并存的\nincompetence\t不胜任/不够格\nincompetent\t无能力的/无资格的\nincomplete\t不完全的/未完成的\nincomprehensible\t不能理解的/费解的\ninconsistency\t不一致/易变\ninconsistent\t不一致的/易变的\ninconvenience\t不便/困难\nincorporate\t合并的/组成公司的\nincorporation\t包含/结合\nincorrect\t不正确的\nincrease\t增加/增进\nincreased\t增强的\nincreasingly\t逐渐地/渐增地\nincredible\t难以置信的\nincredibly\t不能相信地\nincumbent\t现任的/依靠的\nincur\t招致/蒙受\nindeed\t的确/实在\nindefinite\t模糊的/不确定的\nindefinitely\t无期限地\nindemnity\t赔偿/保障\nindependence\t独立/自立\nindependent\t独立自主者/无党派者\nindependently\t独立地/自立地\nindex\t索引/指针\nindia\t印度\nindian\t印度人/印第安人\nindicate\t显示/象征\nindication\t指示/象征\nindicative\t指示的/象征的\nindicator\t指示器/指示剂\nindict\t起诉/控告\nindictment\t起诉/控告\nindies\t印度地方/西印度群岛\nindifference\t不重视/无兴趣\nindifferent\t漠不关心的/无重要性的\nindigenous\t本土的/国产的\nindignant\t愤怒的/愤慨的\nindignation\t愤怒/愤慨\nindirect\t间接的/非直截了当的\nindirectly\t间接/曲折\nindiscriminately\t无差别/任意地\nindispensable\t不可缺少之物\nindividual\t人/个人\nindividuality\t个性/个人\nindividually\t以个人身分/各个地\nindonesia\t印尼\nindonesian\t印尼的\nindoor\t户内的/室内的\nindoors\t在户内\ninduce\t引诱/招致\ninduction\t归纳法/感应\nindulge\t纵情于/使高兴\nindustrial\t工业的/供工业用的\nindustrialist\t企业家/实业家\nindustrialize\t使工业化\nindustrialized\t工业化的\nindustrious\t勤勉的/刻苦的\nindustry\t勤劳/工业\nineffective\t无效的\ninefficient\t无效率的/无能的\ninequality\t不平等/不同\ninertia\t惯性/惰性\ninevitable\t不可避免的/必然的\ninevitably\t不可避免地\ninexpensive\t便宜的/不贵重的\ninexperienced\t无经验的/不熟练的\ninfamous\t无耻的/不名誉的\ninfancy\t幼年/初期\ninfant\t婴儿/儿童\ninfantry\t步兵/步兵团\ninfect\t传染/感染\ninfected\t被感染的\ninfection\t传染/影响\ninfectious\t有传染性的/易传染的\ninfer\t推论出/推断\ninference\t推论\ninferior\t次等的/较差的\ninferiority\t自卑/次等\ninfinite\t无限/神\ninfinitely\t无限地/无数地\ninfinitive\t不定式\ninfinity\t无限大/无限\ninfirmary\t医院/养老院\ninflammation\t怒火/发火\ninflammatory\t激动的/煽动的\ninflate\t使膨胀/使得意\ninflation\t胀大/夸张\ninflict\t施以/加害\ninfluence\t影响力/权力\ninfluential\t有影响的/有势力的\ninflux\t流入/河口\ninform\t通知/使了解\ninformal\t非正式的/不拘礼的\ninformant\t提供消息者/密告者\ninformation\t消息/知识\ninformative\t提供消息的/见闻广博的\ninformed\t见多识广的\ninfrared\t红外线的\ninfrastructure\t基础结构/基础设施\ninfringement\t违犯/侵害\ninfuse\t注入/使充满\ninfusion\t注入/泡制\ningenious\t灵敏的/精巧的\ningenuity\t心灵手巧/精巧\ningredient\t成分/因素\ninhabit\t居住于/占据\ninhabitant\t居民/居住者\ninhale\t吸入\ninherent\t固有的/与生俱来的\ninherently\t内在地/生来地\ninherit\t继承/遗传\ninheritance\t遗传/遗产\ninhibit\t禁止/抑制\ninhibition\t禁止/抑制\ninitial\t字首/首字母\ninitially\t最初/开头\ninitiate\t入会/开始\ninitiation\t开始/指引\ninitiative\t主动行动/首创精神\ninject\t注射/注入\ninjection\t注射/注射剂\ninjunction\t命令/禁令\ninjure\t伤害/损害\ninjured\t受伤的/受损害的\ninjury\t伤害/侮辱\ninjustice\t不公平/非正义的行为\nink\t墨水/墨汁\ninland\t内陆的/国内的\ninlet\t进口/插入物\ninmate\t同住者/被收容者\ninn\t旅馆/客栈\ninnate\t先天的/天生的\ninner\t内部的/内心的\ninning\t一局/挨次轮换\ninnings\t局/回合\ninnocence\t无罪/无知\ninnocent\t无罪的/不懂事的\ninnovation\t改革/创新\ninnovative\t革新的/创新的\ninnumerable\t无数的/数不清的\ninorganic\t无机的/无生物的\ninput\t输入/输入电路\ninquest\t审讯/讯问\ninquire\t询问/问明\ninquiry\t质询/探索\ninsane\t患精神病的/极愚蠢的\ninsanity\t疯狂/愚顽\ninscribe\t登记/铭记于\ninscription\t题字/碑铭\ninsect\t昆虫/卑鄙的人\ninsecurity\t不安全/不安全感\ninsert\t插入物\ninsertion\t插入/刊载\ninset\t嵌入\ninside\t内部/内脏\ninsider\t内部的人/权威人士\ninsidious\t隐伏的/阴险的\ninsight\t察看/洞察力\ninsignificant\t无关紧要的/无意义的\ninsist\t坚持/坚决主张\ninsistence\t坚持/坚决主张\ninsistent\t坚持的/迫切的\ninsofar\t在...的范围\ninsolvency\t无力偿还/破产\ninsp\t情报/消息\ninspect\t检查/检阅\ninspection\t检验/检查\ninspector\t检查员/巡视员\ninspiration\t灵感/鼓舞人心的人或物\ninspire\t使感动/激发\ninspired\t得到灵感的/有灵感的\ninstability\t不安定/不稳定\ninstall\t安装/安置\ninstallation\t安装/装置\ninstallment\t就职/装设\ninstalment\t就职/装设\ninstance\t建议/情况\ninstant\t立即/瞬间\ninstantaneous\t即时的/瞬间的\ninstantly\t立即地/即刻地\ninstead\t作为替代/反而\ninstinct\t本能/直觉\ninstinctive\t本能的/天生的\ninstinctively\t本能地/直觉地\ninstitute\t学会/学院\ninstitution\t机构/惯例\ninstitutional\t制度的/公共机构的\ninstruct\t教/教育\ninstruction\t指令/教导\ninstructional\t教学的/教育的\ninstructor\t教员/讲师\ninstrument\t工具/手段\ninstrumental\t仪器的/器具的\ninsufficient\t不够的/不能胜任的\ninsulate\t使绝缘/隔离\ninsulation\t绝缘/隔离\ninsulator\t绝缘体/从事绝缘工作的工人\ninsulin\t胰岛素\ninsult\t侮辱/无礼\ninsulting\t侮辱的/损害人体的\ninsurance\t保险/保险业\ninsure\t保险/确保\ninsurer\t保险公司\ninsurgency\t叛乱状态/发生暴动\ninsurgent\t谋叛的/起义的\nintact\t尚未被人碰过的/原封不动的\nintake\t入口/吸入\nintegral\t整体/积分\nintegrate\t综合/使完整\nintegrated\t综合的/完整的\nintegration\t综合/与环境协调的行为\nintegrity\t正直/廉正\nintel\t美国英特尔公司\nintellect\t智力/出众的才华\nintellectual\t有知识者/知识分子\nintellectually\t智力上/知性上\nintelligence\t智力/情报\nintelligent\t聪明的/智能的\nintelligible\t可理解的/易理解的\nintend\t计划/打算\nintended\t有意的/故意的\nintense\t非常的/强烈的\nintensely\t强烈地/极度\nintensify\t加强\nintensity\t强烈/紧张\nintensive\t加强的/内涵的\nintent\t意图/含义\nintention\t意图/目的\nintentional\t故意的/与目的有关的\nintentionally\t故意地/有意地\nintently\t一心一意地/心无旁物地\ninteract\t互相影响/交互作用\ninteraction\t交互作用/交感\ninteractive\t相互作用的/相互影响的\nintercept\t截取/妨碍\ninterception\t拦截/截断\ninterconnect\t使互相连接\nintercourse\t交往/交流\ninterest\t兴趣/嗜好\ninterested\t感兴趣的\ninteresting\t有趣的\ninterestingly\t有趣地\ninterface\t分界面/接触面\ninterfere\t妨碍/冲突\ninterference\t冲突/干涉\ninterim\t暂时的/临时的\ninterior\t内部/内政\nintermediary\t仲裁者/调解者\nintermediate\t中间物/调停者\nintermittent\t间歇的/断断续续的\nintern\t实习生/被拘留者\ninternal\t内在的/国内的\ninternational\t国际的\ninternationally\t国际性地/在国际间\ninterpersonal\t人与人之间的/人际的\ninterpret\t解释/演出\ninterpretation\t解释/演出\ninterpreter\t直译程序/解释者\ninterrogation\t审问/疑问句\ninterrupt\t中断/妨碍\ninterruption\t打扰/中断\nintersection\t交集/十字路口\ninterstate\t州际的\ninterval\t间隔/距离\nintervene\t插入/调停\nintervention\t插入/介入\ninterview\t面谈/访问\ninterviewer\t会见者/面谈者\nintestinal\t肠的/肠内的\nintestine\t内部的/国内的\nintimacy\t亲密/熟悉\nintimate\t亲密的/私人的\nintimately\t亲切地/亲密地\nintimidate\t威胁/恐吓\nintimidating\t恐吓/威胁\nintimidation\t恐吓/威胁\ninto\t进入...之内/朝...\nintolerable\t无法忍受的/难耐的\nintonation\t朗诵/语调\nintricacy\t纷乱/复杂\nintricate\t复杂的/错综的\nintrigue\t阴谋/复杂的事\nintriguing\t吸引人的/有趣的\nintrinsic\t本质的/原有的\nintroduce\t介绍/引入\nintroduction\t介绍/传入\nintroductory\t介绍的/引导的\nintrude\t闯入/侵入\nintruder\t侵入者/干扰者\nintrusion\t闯入/侵扰\nintuition\t直觉/直觉的知识\nintuitive\t直觉的\ninvade\t侵入/拥入\ninvader\t侵略者\ninvalid\t病人/残废者\ninvaluable\t无价的/价值无法衡量的\ninvariably\t不变化地/恒定地\ninvasion\t侵犯/侵入\ninvasive\t侵入的/侵略性的\ninvent\t发明/创作\ninvention\t发明/创作能力\ninventor\t发明家\ninventory\t详细目录/存货清单\ninverse\t倒转的/相反的\ninversely\t相反地\ninvert\t转化的\ninverted\t倒转的/反向的\ninvest\t投资/花费\ninvestigate\t调查/审查\ninvestigation\t调查/审查\ninvestigative\t审查的/调查的\ninvestigator\t调查者/审查者\ninvestment\t投资\ninvestor\t投资者\ninvisible\t看不见的/无形的\ninvitation\t邀请/请柬\ninvite\t邀请/请求\ninviting\t引人动心的/有魅力的\ninvoice\t发票/发货单\ninvoke\t祈求/恳求\ninvoluntary\t自然而然的/无意识的\ninvolve\t包括/使陷于\ninvolved\t难懂的/复杂的\ninvolvement\t卷入/牵连\ninward\t内心的/向内的\nion\t离子\nipswich\t伊普斯威奇\niq\t智商/智力商数\nira\t爱尔兰共和军/个人退休帐户\niran\t伊朗\niranian\t伊朗的/伊朗语系的\niraq\t伊拉克\niraqi\t伊拉克人/伊拉克阿拉伯语\nireland\t爱尔兰\nirene\t和平女神\niris\t虹膜/鸢尾属植物\nirish\t爱尔兰人/爱尔兰语\nirishman\t爱尔兰人\niron\t铁/熨斗\nironic\t冷嘲的/挖苦的\nironically\t冷嘲地/挖苦地\nirony\t反语/讽刺\nirrational\t无理数\nirregular\t不规则物/不合规格之物\nirregularity\t不规则/例外\nirrelevant\t不恰当的/无关系的\nirresistible\t不可抵抗的/不能压制的\nirrespective\t不顾的/无关的\nirresponsible\t不负责任的/不可靠的\nirrigate\t灌溉/冲洗伤口\nirrigation\t灌溉/冲洗\nirritate\t激怒/使发怒\nirritating\t刺激的/使愤怒的\nirritation\t刺激/烦恼\nisaac\t艾萨克/以撒（希伯来族长\nisabel\t伊莎贝尔\nislam\t伊斯兰教\nislamic\t伊斯兰教的/穆斯林的\nisland\t岛/岛屿\nisle\t小岛/群岛\nisolate\t使隔离/使孤立\nisolated\t孤立的/孤零零的\nisolation\t隔绝/孤立\nisrael\t以色列/以色列后裔\nisraeli\t以色列的/以色列人的\nissue\t发行/问题\nit\t它\nitalian\t意大利人/意大利语\nitaly\t意大利\nitem\t项目/条款\nits\t它的\nitself\t它本身/它自己\nitv\t独立电视/工业电视\niv\t输入阀/交互式视讯\nivan\t伊凡\nivory\t象牙/乳白色\nivy\t常春藤\njack\t插座/千斤顶\njacket\t夹克/外套\njackie\t杰基\njackson\t杰克逊/杰克逊\njacob\t雅各/雅各布\njacques\t雅克\njagged\t锯齿状的\njaguar\t美洲虎\njail\t监牢/监狱\njake\t满意的/上等的\njam\t果酱/拥塞之物\njamaica\t牙买加\njames\t詹姆斯\njamie\t杰米\njan\t一月\njane\t简\njanuary\t一月\njapan\t日本\njapanese\t日本人/日语\njar\t广口瓶/震动\njargon\t专门术语/行话\njason\t詹森\njaw\t颚/颌\njay\t鸟/喋喋不休的人\njazz\t爵士乐/喧闹\njealous\t嫉妒的/羡慕的\njealousy\t妒忌/猜忌\njean\t牛仔裤/牛仔布\njeans\t工装裤/牛仔裤\njeep\t吉普车\njeff\t杰夫\njeffrey\t杰弗里\njelly\t果冻/果冻甜食\njenkins\t詹金斯\njenna\t詹娜\njennifer\t詹尼弗\njenny\t纺纱机/移动吊车\njeopardize\t危害/使受危困\njeopardy\t危难/危险\njeremy\t杰里米\njerk\t性情古怪的人/急拉\njerry\t草率的/偷工减料的\njersey\t运动衫\njerusalem\t耶路撒冷\njess\t鹰的脚带\njessica\t杰西卡\njesus\t耶稣\njet\t喷射流/喷嘴\njew\t犹太人/守财奴\njewel\t珠宝/贵重物\njewellery\t宝石/贵重饰物\njewelry\t珠宝/珠宝类\njewish\t犹太人的/犹太族的\njill\t吉尔\njim\t吉姆\njimmy\t铁撬\njingle\t叮当声\njo\t乔（女子名/等于Joseph\njoan\t琼\njoanna\t乔安娜\njoanne\t乔安妮\njob\t工作/零活\njockey\t赛马骑师/驾驶员\njoe\t乔\njog\t轻推/轻撞\njohn\t盥洗室/厕所\njohnny\t男人/家伙\njohnson\t约翰逊\njohnston\t约翰斯顿\njoin\t参加/结合\njoint\t连接处/接合\njointly\t共同地/连带地\njoke\t笑话/玩笑\njolly\t愉快的/高兴的\njon\t乔恩\njonathan\t乔纳森\njones\t琼斯\njordan\t约旦/约旦河\njoseph\t约瑟夫/约瑟\njournal\t日记/杂志\njournalism\t新闻业/报章杂志\njournalist\t新闻记者/从事新闻杂志业的人\njournalistic\t新闻业的/新闻工作者的\njourney\t旅程/旅行\njoy\t欢喜/乐事\njoyce\t乔伊斯\njoyful\t欢喜的/高兴的\njuan\t胡安\njubilee\t五十周年纪念/庆祝/二十五周年纪\njudaism\t犹太教/犹太文明\njudge\t法官/裁判员\njudgement\t审判/判决\njudgment\t裁判/宣告\njudicial\t法庭的/公正的\njudiciary\t司法的/法院的\njudith\t朱迪思\njudy\t朱迪/朱迪\njug\t水壶/监牢\njuggle\t玩戏法/行骗\njuice\t汁/活力\njuicy\t多汁液的/生动的\njulia\t朱莉娅\njulian\t尤利乌斯恺撒的\njulie\t朱莉\njuliet\t朱丽叶\njulius\t朱利叶斯\njuly\t七月\njumble\t搀杂/混杂\njump\t跳跃/跳动\njumper\t跳跃者/工作服\njunction\t连接/会合处\njune\t六月\njungle\t丛林/杂乱的一堆\njunior\t年少者/地位较低者\njunk\t垃圾/乌七八糟的东西\njupiter\t朱庇物/木星\njurisdiction\t司法权/审判权\njuror\t陪审员/审查委员\njury\t陪审团/评判委员会\njust\t正直的/合理的\njustice\t正义/公平\njustification\t辩护/证明正当\njustify\t替...辩护/证明\njuvenile\t少年/少年读物\nkangaroo\t袋鼠\nkaren\t凯伦/克伦邦\nkarl\t卡尔\nkate\t凯特\nkatherine\t凯瑟琳\nkathleen\t凯思琳\nkatie\t卡蒂\nkay\t字母K/K字形物\nkeen\t锋利的/敏锐的\nkeep\t生计/维持\nkeeper\t监护人/管理人\nkeith\t基思\nkelly\t凯利/[古]战士\nkemp\t冠军\nken\t视野范围/知识范围\nkennedy\t肯尼迪\nkenneth\t肯尼思/[古]英俊的领导者\nkenny\t肯尼\nkensington\t肯辛通/肯辛顿\nkent\t肯特郡\nkenya\t肯尼亚\nkernel\t核心/中心\nkettle\t茶壶/罐\nkevin\t凯文\nkey\t钥匙/键\nkeyboard\t键盘\nkeynes\t凯恩斯\nkg\t千克/公斤\nkgb\t克格勃/苏联国家安全委员会\nkhan\t可汗/商队宿店\nkhmer\t高棉人/高棉语\nkick\t踢/反冲\nkid\t小山羊/小山羊肉\nkidnap\t绑架/诱拐\nkidnapping\t绑架/诱拐\nkidney\t肾/个性\nkill\t杀/杀戮\nkiller\t杀人者/屠杀者\nkilling\t谋杀/杀戮\nkilo\t千\nkilogram\t千克/公斤\nkilometer\t千米/公里\nkilometre\t公里/千米\nkilowatt\t千瓦\nkim\t金姆\nkin\t亲戚/同族\nkind\t种类/性质\nkinda\t有几分/有一点\nkindergarten\t幼稚园\nkindle\t点燃/使着火\nkindly\t和蔼的/温和的\nkindness\t仁慈/亲切\nkinetic\t运动的/运动引起的\nking\t国王/君主\nkingdom\t王国/领域\nkinnock\t人名/金诺克\nkinship\t亲属关系\nkiss\t吻\nkit\t装备/工具箱\nkitchen\t厨房/全套炊具\nkite\t风筝/筝帆\nkitten\t小猫/淘气姑娘\nklerk\t人名/克勒克\nknee\t膝/膝盖\nkneel\t跪下\nknife\t小刀/匕首\nknight\t骑士/爵士\nknit\t编织/结合\nknitting\t编结/针织法\nknob\t把手/瘤\nknock\t敲/敲打\nknot\t结/群\nknow\t知道/了解\nknowledge\t知识/学问\nknowledgeable\t聪明的/有知识的\nknown\t已知的/有名的\nknuckle\t指节/蹄爪\nkohl\t化妆墨/眼影粉\nkong\t含锡砾石下的无矿基岩/钢\nkorea\t朝鲜/韩国\nkorean\t朝鲜人/朝鲜语\nkurd\t库尔德人\nkurdish\t库尔德人的\nkuwait\t科威特\nkylie\t回飞棒的一种\nlab\t实验室/研究室\nlabel\t标签/称号\nlabor\t劳动/努力\nlaboratory\t实验室/研究室\nlaborer\t体力劳动者/辅助工\nlabour\t劳动/努力\nlabourer\t劳动者/干体力工作的工人\nlace\t饰带/花边\nlack\t缺乏/无\nlad\t青年/家伙\nladder\t梯/梯状物\nlady\t淑女/夫人\nlag\t落后/囚犯\nlager\t贮陈啤酒\nlagoon\t环礁湖/近海岸的浅水区\nlake\t湖/池\nlamb\t小羊/羔羊\nlame\t跛足的/僵痛的\nlament\t悲叹/悔恨\nlamentation\t悲叹/哀悼\nlamont\t拉蒙特\nlamp\t灯\nlancashire\t兰开夏郡\nlancaster\t兰开斯特\nland\t陆地/地面\nlanded\t拥有土地的/有田地的\nlandfill\t垃圾堆/垃圾填埋地\nlanding\t登陆/码头\nlandlady\t女房东/女地主\nlandlord\t房东/地主\nlandmark\t陆标/划时代的事\nlandowner\t地主\nlandscape\t风景/山水\nlane\t小路/巷\nlang\t语言\nlanguage\t语言/文字\nlanka\t兰卡/楞伽\nlantern\t灯笼/提灯\nlap\t膝盖/舔\nlapse\t过失/流逝\nlarge\t大的/大量的\nlargely\t大量地/很多地\nlarry\t拉里\nlarva\t幼虫\nlaser\t激光\nlash\t鞭子/鞭打\nlass\t少女/爱人\nlast\t最后的/末尾的\nlasting\t永久的/永恒的\nlastly\t最后/终于\nlate\t迟的/晚的\nlately\t近来/最近\nlatent\t潜伏性的/隐藏的\nlater\t以后/随后\nlateral\t侧部/支线\nlatest\t最近的\nlathe\t车床\nlatin\t拉丁人/拉丁语\nlatino\t拉丁美洲人\nlatitude\t纬度/范围\nlatter\t后者的/较后的\nlattice\t格子/组合格子\nlaugh\t笑/笑声\nlaughter\t笑/笑声\nlaunch\t下水/汽艇\nlaundry\t洗衣店/洗好的衣服\nlaura\t劳拉\nlava\t熔岩/火山岩\nlavatory\t洗脸盆/厕所\nlavender\t熏衣草/淡紫色\nlavish\t大方的/丰富的\nlaw\t法律/法则\nlawful\t法律许可的/守法的\nlawmaker\t立法者\nlawn\t草地/草坪\nlawrence\t劳伦斯\nlawson\t劳森\nlawsuit\t诉讼\nlawyer\t律师\nlay\t放置/产\nlayer\t层/产卵鸡\nlayman\t俗人/门外汉\nlayoff\t临时解雇/操作停止\nlayout\t布局/陈列\nlazy\t懒惰的/怠惰的\nlb\t磅/文学士\nlea\t草地\nlead\t铅/铅条\nleader\t领导者/社论\nleadership\t领导能力/领导阶层\nleading\t领导/指挥\nleaf\t叶/树叶\nleaflet\t小叶/传单\nleague\t同盟/联盟\nleak\t漏洞/漏处\nleakage\t漏/漏出物\nlean\t瘦肉/倾斜\nleap\t跳跃/剧增\nlearn\t学习/认识到\nlearned\t有学问的/学术上的\nlearner\t学习者/初学者\nlearning\t学问/学识\nlease\t租约/租期\nleast\t最少/最小\nleather\t皮革/皮制品\nleave\t许可/告别\nlebanese\t黎巴嫩的\nlebanon\t黎巴嫩\nlecture\t演讲/谴责\nlecturer\t演讲者/讲师\nledge\t突出部分/暗礁\nlee\t背风处/避风处\nleeds\t利兹市\nleft\t左边的/左倾的\nleftist\t左翼的人/左派\nleftover\t剩货/残留物\nleg\t腿/假腿\nlegacy\t祖先传下来之物/遗赠物\nlegal\t法律的/法定的\nlegally\t法律上/合法地\nlegend\t传说/传奇文学\nlegendary\t传说的/传奇中说的\nlegion\t军团/军队\nlegislation\t立法/法律\nlegislative\t立法机构\nlegislator\t立法者/立法官\nlegislature\t立法机关/议会\nlegitimacy\t合法/正统\nlegitimate\t合法的/正当的\nleicester\t莱斯特\nleicestershire\t英国爱尔兰东部的郡\nleigh\t利\nleisure\t空闲/闲暇\nleith\t利思\nlemon\t柠檬/柠檬树\nlemonade\t柠檬水\nlen\t伦恩\nlend\t借/贷款给\nlender\t出借人/贷方\nlending\t出借/出借物\nlength\t长度/长\nlengthen\t加长/使延长\nlengthy\t冗长的/漫长的\nlenin\t列宁\nlens\t透镜/镜头\nlense\t人名/伦泽\nleo\t狮子/狮子座\nleon\t利昂\nleonard\t伦纳德\nleonora\t利奥诺拉\nleopard\t豹/美洲豹\nles\t发射脱离系统\nlesbian\t女同性恋的\nlesion\t损害/身体上的伤害\nleslie\t莱斯利\nless\t较少/较小\nlessen\t减少/缩小\nlesser\t较少的/较小的\nlesson\t课/课业\nlest\t以免/唯恐\nlet\t让/假设\nlethal\t致命的\nletter\t信/字母\nlettuce\t莴苣/生菜\nleukaemia\t白血病\nlevee\t早朝/大堤\nlevel\t水平/水准\nlever\t杠杆/似杠杆之工具\nleverage\t杠杆作用/杠杆装置\nlevy\t税款/所征的人数\nlewis\t吊楔\nlexical\t字典的/词汇的\nlexicon\t词汇/词典\nliability\t责任/债务\nliable\t有义务的/应负责的\nliaison\t联络\nliar\t说谎者\nlibel\t以文字损害名誉/诽谤罪\nliberal\t自由主义者\nliberalism\t自由主义\nliberalization\t自由主义化/宽大\nliberate\t解放/释放\nliberation\t释放/解放\nliberty\t自由/特权\nlibrarian\t图书馆员/图书管理员\nlibrary\t图书馆/藏书\nlibya\t利比亚\nlicence\t执照/许可证\nlicense\t执照/许可证\nlicensed\t得到许可的\nlicensing\t许可/批准\nlick\t舔/少许\nlid\t盖子/限制\nlie\t谎言/假象\nlieutenant\t中尉/助理人员\nlife\t生活/生命\nlifeboat\t救生艇\nlifelong\t终身的/毕生的\nlifespan\t预期生命期限/寿命\nlifestyle\t生活方式\nlifetime\t一生/终生\nlift\t举起/帮助\nlight\t光/光亮\nlighten\t照亮/点亮\nlighter\t点火者/点灯工人\nlighthouse\t灯塔\nlighting\t照明/照明设备\nlightly\t轻轻地/少许\nlightning\t闪电\nlightweight\t不到平均重量的人/物/轻量级\nlike\t相似的/同样的\nlikelihood\t可能/可能性\nlikely\t有可能的/合适的\nliken\t比喻/比拟\nlikeness\t相象/相似物\nlikewise\t同样地/也\nlili\t莉莉\nlily\t百合/百合花\nlimb\t四肢/枝干\nlime\t石灰/粘鸟胶\nlimestone\t石灰石\nlimit\t界限/边界\nlimitation\t限制/缺陷\nlimited\t有限制的/有限的\nlimiting\t限制的\nlimousine\t轿车\nlimp\t跛行\nlincoln\t林肯\nlincolnshire\t林肯郡\nlinda\t琳达\nlindsey\t林德赛\nline\t列/线\nlineage\t血统/直系\nlinear\t线的/直线的\nlinebacker\t中后卫球员\nlineman\t线务员/线路工人\nlinen\t亚麻布/亚麻线\nliner\t班机/划线者\nlineup\t阵容/阵形\nlinger\t逗留/消磨\nlingering\t拖延的\nlinguist\t语言学家\nlinguistic\t语言的/语言学的\nlinguistics\t语言学\nlining\t衬里/内层\nlink\t环/连结物\nlinkage\t联合/连锁\nlinked\t连接的/显示连环遗传的\nlion\t狮子/狮子座\nlip\t唇/口缘\nlipstick\t口红/唇膏\nliquid\t液体/流体\nliquidation\t偿还/偿付\nliquidity\t流动性/流畅\nliquor\t酒/液体\nlisa\t丽莎\nlist\t目录/名单\nlisted\t列出的\nlisten\t听/倾听\nlistener\t收听者/听众\nlistening\t听/监听\nliter\t公升\nliteracy\t读写能力/识字\nliteral\t逐字的/字面上的\nliterally\t逐字地/按照字面上地\nliterary\t文学的/文艺的\nliterature\t文学/文艺\nlithuania\t立陶宛\nlitigation\t诉讼/起诉\nlitre\t升/公升\nlitter\t垃圾/杂乱\nlittle\t一点点/少许\nlive\t活的/生动的\nlivelihood\t生计/营生\nlively\t活泼的/鲜明的\nliver\t肝脏/生活者\nliverpool\t利物浦\nlivestock\t家畜\nliving\t生活/生计\nliz\t莉斯\nlizard\t蜥蜴\nlj\t救生短上衣/上诉法院法官\nlloyd\t劳埃德\nload\t负荷/担子\nloaded\t有负载的/有含蓄的\nloading\t装载/装填\nloaf\t一条面包/块\nloan\t贷款/借出\nlobby\t大厅/休息室\nlobbying\t为了支持或抵制某项特定目标游说\nlobbyist\t说客\nlobster\t龙虾\nlocal\t地方性的/当地的\nlocale\t现场/场所\nlocality\t地方/所在\nlocally\t地方性地/局部性地\nlocate\t找出/设于\nlocation\t位置/场所\nloch\t湖/海湾\nlock\t锁/刹车\nlocke\t洛克\nlocked\t上锁的/不灵活的\nlocker\t抽屉/小柜\nlocomotive\t火车头/机车\nlocus\t轨迹/地点\nlocust\t蝗虫/蚱蜢\nlodge\t小屋/门房\nlodging\t寄宿处/寄宿\nloft\t阁楼/鸽房\nlofty\t高的/傲慢的\nlog\t记录/圆木\nlogging\t采运作业/记录\nlogic\t逻辑/逻辑学\nlogical\t合乎逻辑的/合理的\nlogically\t逻辑/合乎逻辑\nlogistics\t后勤学/后勤\nlogo\t连合活字/商标\nlondon\t伦敦\nlondoner\t伦敦人\nlone\t孤单的/孤立的\nloneliness\t寂寞/孤独\nlonely\t孤单的/孤寂的\nlong\t长的/长久的\nlonger\t比较久\nlongevity\t长命/长寿\nlonging\t渴望/热望\nlongitude\t经度/经线\nlongitudinal\t经度的/经线的\nlongtime\t长时间的/为时甚久的\nloo\t卢牌戏\nlook\t一看/神色\nloom\t织布机/若隐若现的景象\nloop\t环/圈\nloophole\t枪眼/小窗\nloose\t发射/放任\nloosely\t松弛地/宽松地\nloosen\t放松/松开\nlord\t统治者/阁下\nlords\t上议院/上院议员\nlordship\t贵族身分/主权\nloretta\t洛雷塔\nlorry\t卡车/货车\nlos\t月球轨道航天器/视线\nlose\t遗失/损失\nloser\t失败者/遗失者\nlosing\t损失的/输的\nloss\t损失/遗失\nlost\t失去的/遗失的\nlot\t运气/签\nlothian\t洛锡安区[英国苏格兰行政区名]\nlots\t大量/许多\nlottery\t奖券/彩票\nlotus\t莲/莲花\nlou\t卢\nloud\t大声的/不断的\nloudly\t高声地/大声地\nloudspeaker\t扩音器/喇叭\nlouis\t路易斯\nlouise\t路易丝\nlounge\t闲逛/休闲室\nlousy\t污秽的/恶心的\nlove\t爱/恋爱\nloved\t热爱\nlovely\t可爱的/有趣的\nlover\t爱人/爱好者\nloving\t亲爱的/钟情的\nlow\t低点/低价\nlowe\t劳氏/灵狮\nlower\t低的/下级的\nlowland\t低地/苏格兰低地\nloyal\t忠诚的/忠实的\nloyalist\t忠诚的人/反对独立者\nloyalty\t忠贞/忠诚\nlp\t密纹唱片\nltd\t有限的\nlubricate\t使润滑/涂油\nlucas\t卢卡斯\nluce\t白斑狗鱼\nluck\t运气/幸运\nluckily\t幸运地/幸亏\nlucky\t幸运的/吉祥的\nlucrative\t有利益的/获利的\nlucy\t露西\nludicrous\t可笑的/滑稽的\nluggage\t行李/皮箱\nluke\t卢克/路加\nlumber\t木材/破旧家俱\nluminous\t发光的/明亮的\nlump\t块/瘤\nlunar\t阴历的/月的\nlunch\t午餐\nluncheon\t午宴/午餐会\nlunchtime\t午餐时间\nlung\t肺/肺脏\nlunge\t刺/刺进\nlurch\t惨败/倾斜\nlure\t饵/诱惑\nlurk\t潜伏/潜行\nlush\t苍翠繁茂的/多青草的\nlust\t贪欲/欲望\nlutheran\t路德教会的\nluxembourg\t卢森堡公国/卢森堡\nluxurious\t豪华的/奢侈的\nluxury\t奢侈/豪华\nlydia\t吕底亚\nlynn\t林恩\nlyons\t里昂\nlyric\t抒情诗/歌词\nlyrics\t歌词\nma\t妈\nmaastricht\t马斯特里赫特\nmac\t防水胶布/雨衣\nmacdonald\t麦克唐纳/麦当劳快餐店\nmacgregor\t马基高/麦基嘉\nmachine\t机器/机械装置\nmachinery\t机器/机械装置\nmacmillan\t麦克米伦\nmad\t疯狂的/发疯的\nmadam\t女士/夫人\nmadame\t夫人/小姐\nmadeleine\t马德琳\nmadness\t疯狂/愚蠢的行为\nmadonna\t圣母玛利亚/圣母像\nmadrid\t马德里\nmafia\t黑手党/秘密政党\nmagazine\t杂志/仓库\nmaggie\t马吉\nmagic\t魔术/魔法\nmagical\t魔术的/有魔力的\nmagician\t魔术家/幻术家\nmagistrate\t长官/法官\nmagnet\t磁铁/有吸引力之人\nmagnetic\t有磁性的/有吸引力的\nmagnetism\t磁性/吸引力\nmagnificent\t华丽的/高尚的\nmagnify\t放大/扩大\nmagnitude\t巨大/重大\nmahogany\t桃花心木/红褐色\nmaid\t少女/未婚女子\nmaiden\t年轻未婚女子/少女\nmail\t邮件/邮政\nmailbox\t邮筒/邮箱\nmailing\t邮寄/投递\nmain\t主要部分/干线\nmainframe\t主机\nmainland\t大陆/本土\nmainly\t主要地/大抵\nmains\t电源/网路\nmainstream\t主流\nmaintain\t维持/维修\nmaintenance\t维护/保持\nmajesty\t最高权威/威严\nmajor\t主修课/成年人\nmajority\t多数/大半\nmake\t制造/安排\nmaker\t制造者/上帝\nmakeshift\t权宜之计/临时代用品\nmakeup\t组成/性格\nmaking\t制造/制造业\nmalaria\t疟疾/瘴气\nmalaysia\t马来西亚\nmalcolm\t马尔科姆\nmale\t男人/雄性动物\nmalice\t恶意/蓄意害人\nmalicious\t怀恶意的/恶毒的\nmall\t林荫路\nmalpractice\t不当治疗/不端行为\nmalta\t马尔他\nmam\t妈\nmama\t妈妈\nmammal\t哺乳动物\nman\t男人/人类\nmanage\t处理\nmanageable\t易办的/易管理的\nmanaged\t与中央化计划及管制有关的/托管的\nmanagement\t经营/支配\nmanager\t经理/管理员\nmanagerial\t管理的\nmanaging\t管理的/节约的\nmanchester\t曼彻斯特\nmandate\t命令/指令\nmandatory\t命令的/托管的\nmandela\t纳尔逊曼德拉Nelson/[19\nmandy\t曼蒂/[药]镇静片\nmaneuver\t演习/调遣\nmango\t芒果\nmanifest\t载货单/运货单\nmanifestation\t显示/证明\nmanifesto\t宣言/声明\nmanipulate\t操纵/利用\nmanipulation\t操作/处理\nmankind\t人类/男性\nmanly\t象男人的/强壮的\nmann\t曼/曼恩法案（美国国会1910年\nmanner\t样子/礼貌\nmanoeuvre\t调遣/演习\nmanor\t庄园\nmanpower\t人力\nmansell\t人名/曼塞尔\nmansion\t大厦/宅邸\nmanslaughter\t杀人/过失杀人罪\nmantle\t斗篷/罩子\nmanual\t手册/指南\nmanufacture\t产品/制造\nmanufacturer\t制造业者/厂商\nmanufacturing\t制造业\nmanure\t肥料/粪肥\nmanuscript\t手稿/原稿\nmany\t多数/多数人\nmap\t地图/天体图\nmaple\t枫/枫木\nmar\t损毁/损伤\nmarathon\t马拉松/耐力的考验\nmarble\t大理石/石弹\nmarc\t榨渣\nmarch\t三月/进行\nmarco\t马尔科/显示地图\nmarcus\t马库斯\nmare\t母马/母驴\nmargaret\t玛格利特\nmargin\t页边的空白/边缘\nmarginal\t边缘的/最低限度的\nmarginally\t记在页边/有旁注\nmaria\t玛丽亚\nmarian\t圣母马利亚的\nmarie\t玛丽\nmarijuana\t大麻\nmarine\t舰队/水兵\nmario\t马里奥\nmarion\t马里恩\nmarital\t丈夫的/婚姻的\nmaritime\t海的/海上的\nmarjorie\t马乔里\nmark\t标志/分数\nmarked\t有记号的/显著的\nmarkedly\t显著地/醒目地\nmarker\t作记号的人/记分员\nmarket\t市场/交易\nmarketer\t赶集者/市场商人\nmarketing\t行销/买卖\nmarketplace\t市场\nmarking\t印记/印\nmarks\t标记/记号\nmarriage\t婚姻/结婚\nmarried\t已婚的/婚姻的\nmarrow\t髓/骨髓\nmarry\t与...结婚/娶\nmars\t火星/战神\nmarsh\t沼泽/湿地\nmarshal\t元帅/陆空军高级将官\nmarshall\t马歇尔（姓氏/男子名\nmartha\t马大\nmartial\t战争的/军事的\nmartian\t火星人\nmartin\t马丁/圣马丁鸟\nmartyr\t烈士/受苦者\nmarvel\t奇异事物/罕见例子\nmarvellous\t奇异的/神奇的\nmarvelous\t令人惊异的/了不起的\nmarx\t马克思\nmarxism\t马克思主义\nmarxist\t马克思主义的\nmary\t玛丽\nmasculine\t阳性/男性\nmasculinity\t男子气/刚毅\nmask\t面具/假面具\nmason\t泥瓦匠/共济会会员\nmass\t块/大多数\nmassacre\t大屠杀\nmassage\t按摩/揉\nmassive\t大而重的/宽大的\nmast\t桅/桅杆\nmaster\t主人/硕士\nmasterpiece\t杰作/名著\nmastery\t征服/统治权\nmat\t垫/丛\nmatch\t比赛/火柴\nmatching\t相同的/协调的\nmate\t配偶/对手\nmaterial\t材料/物资\nmaterialism\t唯物主义\nmaterialize\t赋予实质/使体现\nmaternal\t母亲的/母系的\nmaternity\t母性/怀孕\nmath\t数学\nmathematical\t数学的/精确的\nmathematics\t数学\nmaths\t数学\nmatilda\t<澳口>行囊\nmatrix\t母体/子宫\nmatt\t表面暗淡的/无光泽的\nmatter\t事件/物质\nmatthew\t马太/马太福音\nmattress\t床垫/空气垫\nmaturation\t化脓/成熟\nmature\t成熟的/到期的\nmaturity\t成熟/完备\nmaureen\t莫林\nmaurice\t莫里斯\nmaximise\t把...增加到最大限度/把...\nmaximize\t取...最大值/使增加到最大限度\nmaximum\t极点/最大量\nmaxwell\t麦克斯韦\nmay\t五月\nmaybe\t也许/大概\nmayor\t市长\nmaze\t迷宫/迷惘\nmcallister\t人名/麦卡利斯特\nmcdonald\t麦克唐纳/麦当劳\nmclaren\t麦克拉伦\nme\t我\nmeadow\t草地/牧场\nmeager\t质量差的/贫乏的\nmeagre\t瘦的/不毛的\nmeal\t一餐/膳食\nmean\t低劣的/卑贱的\nmeaning\t意义/含义\nmeaningful\t意味深长的\nmeaningless\t无意义的\nmeans\t方法/手段\nmeantime\t间隔时间/其时\nmeanwhile\t其时/其间\nmeasurable\t可测量的/不久的\nmeasure\t尺寸/量度器\nmeasurement\t尺寸/度量\nmeat\t肉/餐\nmechanic\t机械工/技工\nmechanical\t机械的/机械性的\nmechanically\t机械/用机械\nmechanics\t机械学/结构\nmechanism\t机械/机构\nmedal\t奖牌/勋章\nmedia\t媒体\nmedian\t中央的/中间的\nmediate\t居间的/间接的\nmediation\t调停/调解\nmediator\t调停者/传递者\nmedical\t医生/体格检查\nmedication\t药物治疗/药物处理\nmedicine\t药/医学\nmedieval\t中古的/中世纪的\nmeditate\t想/考虑\nmeditation\t沉思/冥想\nmediterranean\t地中海/地中海民族\nmedium\t媒体/方法\nmeet\t会/集会\nmeeting\t会议/会面\nmeg\t梅格\nmelancholy\t忧郁/悲哀\nmelanie\t梅勒妮\nmellor\t梅勒\nmelody\t曲子/美妙音乐\nmelon\t瓜/甜瓜\nmelt\t熔化/熔化物\nmember\t成员/会员\nmembership\t会员的资格/全体会员\nmembrane\t薄膜/膜\nmemo\t备忘录\nmemoir\t传记/实录\nmemorable\t值得纪念的/难忘的\nmemorandum\t备忘录/外交备忘录\nmemorial\t纪念物/请愿书\nmemorize\t记住/熟记\nmemory\t记忆/记忆力\nmenace\t威胁/胁迫\nmend\t改进/修补\nmental\t心智的/精神病的\nmentality\t精神力/智力\nmentally\t心理上/精神上\nmention\t提到/言及\nmentor\t指导者/良师益友\nmenu\t菜单/选择单\nmercedes\t梅塞德斯/梅赛德斯\nmerchandise\t商品/货物\nmerchant\t商人/店主\nmerciful\t仁慈的/慈悲的\nmercury\t水银/汞\nmercy\t仁慈/宽恕\nmere\t小湖/池塘\nmeredith\t梅雷迪思/梅瑞狄斯\nmerely\t只\nmerge\t使合并/使消失\nmerger\t合并/归并\nmerit\t优点/功绩\nmerrill\t美林/美林\nmerry\t快乐的/愉快的\nmerseyside\t默西赛德郡\nmesh\t网孔/网丝\nmess\t食堂/伙食\nmessage\t消息/通讯\nmessenger\t报信者/使者\nmessy\t散乱的/污秽的\nmetabolic\t变化的/变形的\nmetabolism\t新陈代谢/变态\nmetal\t金属/金属制品\nmetallic\t金属的/含金属的\nmetallurgy\t冶金学/冶金术\nmetaphor\t隐喻\nmeteor\t流星/大气现象\nmeteorite\t陨星\nmeter\t米/公尺\nmethod\t方法/办法\nmethodist\t墨守成规者\nmethodological\t方法的\nmethodology\t方法学/方法论\nmetre\t公尺/格律\nmetric\t公尺的/公制的\nmetro\t地铁\nmetropolitan\t大都市居民/都主教\nmexican\t墨西哥人/墨西哥语\nmexico\t墨西哥\nmhm\t哦/嗯\nmichael\t迈克尔\nmichel\t米歇尔\nmichelle\t米歇尔\nmick\t爱尔兰人\nmickey\t精神/骄气\nmicrocomputer\t微电脑/微机\nmicrophone\t扩音器/麦克风\nmicroprocessor\t微处理器\nmicroscope\t显微镜\nmicroscopic\t显微镜的/用显微镜可见的\nmicrosoft\t微软公司\nmicrowave\t微波\nmid\t中间的/中央的\nmidday\t正午/中午\nmiddle\t中央/中间\nmiddlesbrough\t米德尔斯布勒[英国英格兰东北部港\nmiddlesex\t米德尔塞克斯/米都塞克斯大学（M\nmidfield\t球场中央部分\nmidfielder\t中场队员\nmidland\t中部地方/内地\nmidlands\t英国中部\nmidnight\t午夜/子夜\nmidst\t中间\nmidtown\t商业区与住宅区之间的地区\nmidwestern\t美国中西部的\nmight\t力量/权力\nmighty\t有势力的人\nmigrant\t候鸟/移居者\nmigrate\t移动/移往\nmigration\t移民/移往\nmiguel\t米格尔\nmike\t偷懒/游手好闲\nmilan\t米兰\nmild\t温和的/温柔的\nmildly\t柔和地/和善地\nmile\t英里/很大距离\nmileage\t英里数\nmiles\t英里\nmilestone\t里程碑/里程石\nmilitant\t好战的\nmilitary\t军队\nmilitia\t义勇军/民兵组织\nmilk\t奶/乳状物\nmilky\t乳状的/乳白色的\nmill\t压榨机/磨坊\nmillennium\t千禧年/一千年\nmiller\t厂主/蛾\nmillimetre\t毫米\nmillion\t百万/无数\nmillionaire\t百万富翁/大富豪\nmills\t米尔斯\nmilton\t米尔顿\nmimic\t模仿的/摹拟的\nmin\t部长/部\nmince\t切碎物\nmind\t思想/愿望\nmine\t矿/矿藏\nminer\t矿工/开矿机\nmineral\t矿物/无机物\nmingle\t混合\nmini\t同类中的极小者/微型汽车\nminiature\t缩图/小画像\nminibus\t中客车/小型公共汽车\nminimal\t最小的/极微的\nminimise\t使减到最少/最小/使降到最低限度\nminimize\t将...减到最少\nminimum\t最小的/最低的\nmining\t采矿\nminiskirt\t超短裙\nminister\t部长/牧师\nministerial\t部长的/内阁的\nministry\t部/内阁\nminivan\t小型货车\nminor\t未成年人/副修科目\nminority\t少数/未成年\nmint\t薄荷/造币厂\nminton\t明顿\nminus\t负号/不足\nminute\t分/分钟\nmiracle\t奇迹/奇事\nmiraculous\t奇迹的/不可思议的\nmiranda\t米兰达\nmirror\t镜子/写真\nmischief\t损害/伤害\nmisconception\t误解\nmisconduct\t办错/使行为不端\nmiser\t守财奴/吝啬鬼\nmiserable\t悲惨的/痛苦的\nmisery\t痛苦/悲惨\nmisfortune\t不幸/灾祸\nmisguided\t被误导的\nmislead\t误导\nmisleading\t引入歧途的/使人误解的\nmiss\t失误/避免\nmissile\t发射物/导弹\nmissing\t不见的/缺少的\nmission\t任务/代表团\nmissionary\t传教士/负有任务者\nmist\t雾/迷蒙\nmistake\t错误/误会\nmistaken\t犯错的/错误的\nmister\t先生\nmistress\t主妇/女主人\nmisunderstand\t误解/误会\nmisunderstanding\t误会/误解\nmisuse\t误用/滥用\nmitchell\t米切尔\nmitigate\t温和/缓和\nmitten\t连指手套/拳击手套\nmix\t混合物/混乱\nmixed\t混合的/形形色色的\nmixer\t混合者/混合器\nmixing\t混合/混频\nmixture\t混合/混淆\nml\t法学硕士/摩托艇\nmm\t毫米\nmoan\t呻吟/悲叹\nmob\t暴民/民众\nmobile\t移动的/易变的\nmobility\t可动性/流动性\nmobilize\t动员/调动\nmock\t嘲笑/戏弄\nmode\t模态/调式\nmodel\t模型/模范\nmodeling\t模特儿职业/立体感\nmodelling\t模特儿职业/立体感\nmodem\t调制解调器\nmoderate\t适度的/稳健的\nmoderately\t适当地/适度地\nmodern\t现代人/有思想的人\nmodernist\t现代主义者/现代人\nmodernity\t现代性/现代状态\nmodernization\t现代化\nmodest\t谦逊的/羞怯的\nmodesty\t谦逊/质朴\nmodification\t修正/修饰\nmodified\t改良的/改进的\nmodify\t修正/变更\nmodigliani\t人名/(意\nmodular\t模数的/有标准组件的\nmodulate\t调整/使转调\nmodule\t组件/模数\nmogul\t大人物/有权势的人\nmohammed\t穆罕默德\nmoira\t莫伊拉\nmoist\t潮湿的/多雨的\nmoisture\t湿气/水分\nmold\t模子/模型\nmole\t痣/鼹鼠\nmolecular\t分子的/由分子组成的\nmolecule\t分子/些微\nmolest\t妨碍/干扰\nmolla\t人名/(法\nmolly\t懦夫/娘娘腔的男人\nmom\t妈妈\nmoment\t片刻/瞬间\nmomentarily\t暂时地/立刻\nmomentary\t瞬间的/刹那间的\nmomentum\t动力/动量\nmommy\t妈咪\nmon\t发动机辛烷值/星期一\nmonarch\t帝王/统治者\nmonarchy\t君主政体/君主国\nmonastery\t修道院/僧侣\nmonday\t星期一\nmonetary\t货币的/金钱的\nmoney\t金钱/一笔款\nmonitor\t监督器/级长\nmonk\t修道士/僧侣\nmonkey\t猴子/猿\nmonopoly\t垄断/专卖权\nmonsieur\t先生/绅士\nmonster\t怪物/恶人\nmonstrous\t巨大的/畸形的\nmontgomery\t蒙哥马利/蒙哥马利\nmonth\t月\nmonthly\t月刊\nmonument\t纪念碑/纪念物\nmonumental\t纪念碑的/做为纪念的\nmood\t心情/气氛\nmoon\t月亮/月球\nmoonlight\t月光\nmoor\t荒野/旷野\nmoore\t摩尔\nmoorland\t高沼地\nmoose\t麋/驼鹿\nmop\t拖把/鬼脸\nmoral\t道德/品行\nmorale\t士气/道德\nmorality\t道德/教训\nmorally\t道德上/德性上\nmore\t更多\nmoreover\t而且/此外\nmorgan\t摩根马\nmorning\t早晨/早上\nmorocco\t摩洛哥/摩洛哥皮革\nmorris\t莫里斯舞\nmorrison\t莫里森\nmorrissey\t莫里西\nmorse\t摩尔斯电码\nmortal\t生物/人类\nmortality\t必死的命运/死亡数目\nmortar\t臼/研钵\nmortgage\t抵押/约束性义务\nmortimer\t莫蒂默\nmorton\t莫顿\nmosaic\t马赛克/镶嵌细工\nmoscow\t莫斯科\nmoses\t摩西/领导者\nmoslem\t穆斯林\nmosque\t清真寺\nmosquito\t蚊子\nmoss\t苔藓/泥沼\nmost\t最多/最大\nmostly\t大概/大部分\nmotel\t汽车旅馆\nmoth\t蛾害/蛾\nmother\t母亲/修女院长\nmotherhood\t母道/母性\nmotherland\t祖国\nmotif\t主题/基调\nmotion\t移动/手势\nmotionless\t不动的/静止的\nmotivate\t给与动机/刺激\nmotivated\t有动机的/目的明确的\nmotivation\t动机/刺激\nmotivational\t激发性的\nmotive\t动机/目的\nmotor\t马达/发动机\nmotorbike\t机动脚踏两用车/摩托车\nmotorcycle\t摩托车\nmotorist\t开汽车者/驾车旅行的人\nmotorway\t高速公路\nmotto\t箴言/座右铭\nmould\t模子/模制品\nmound\t土墩/堤\nmount\t乘骑用马/框\nmountain\t山/山脉\nmountainous\t多山的/如山的\nmourn\t哀悼/忧伤\nmourning\t哀痛/居丧\nmouse\t老鼠/胆小羞怯的人\nmoustache\t髭/小胡子\nmouth\t嘴/口\nmouthful\t一口/满口\nmove\t移动/迁居\nmovement\t运动/动作\nmovie\t电影\nmoving\t动人的/令人感动的\nmow\t草堆/皱眉\nmower\t刈草的人/刈草机\nmozart\t莫扎特\nmp\t国会议员/下院议员\nmph\t每小时...英里/哩/时\nmr\t先生\nmrs\t太太\nms\t美国微软公司\nmuch\t大量/许多\nmucosa\t粘膜\nmud\t泥/诽谤\nmuddy\t泥泞的/浑浊的\nmuffin\t松饼\nmug\t有柄大杯/脸\nmule\t骡/倔强之人\nmulticultural\t融合或具有多种文化的/多种文化的\nmultilateral\t多边的/多国的\nmultimedia\t多媒体\nmultinational\t多国的/跨国公司的\nmultiparty\t多党的/包括多党的\nmultiple\t倍数/并联\nmultiplication\t乘法/增加\nmultiply\t繁殖/乘\nmultitude\t多数/群众\nmum\t菊花/沉默\nmumble\t喃喃而语/咕哝\nmummy\t木乃伊/瘦而干瘪之人\nmundane\t现世的/世俗的\nmungo\t短弹毛\nmunich\t慕尼黑\nmunicipal\t市政的/自治区的\nmunicipality\t自治区/市当局\nmural\t壁的/壁上的\nmurder\t谋杀\nmurderer\t凶手/杀人者\nmurky\t黝暗的/阴沉的\nmurmur\t低语/低声的怨言\nmurphy\t马铃薯\nmurray\t默里/墨累河\nmuscle\t肌肉/臂力\nmuscular\t强壮的/肌肉发达的\nmuse\t沉思/冥想\nmuseum\t博物馆\nmushroom\t蘑菇形物/蘑菇\nmusic\t音乐/乐曲\nmusical\t音乐片/音乐舞台剧\nmusician\t音乐家/乐师\nmuslim\t伊斯兰教/伊斯兰教教徒\nmust\t必须/未发酵葡萄汁\nmustache\t髭/胡子\nmustard\t芥末/芥菜\nmuster\t召集/集合\nmutant\t突变体\nmutation\t变化/突变\nmute\t哑子/哑音字母\nmuted\t变弱了的/变柔和了的\nmutter\t喃喃低语\nmutton\t羊肉\nmutual\t相互的/共有的\nmutually\t互相地/互助\nmy\t我的\nmyriad\t无数/无数的人\nmyself\t我自己/我亲自\nmysterious\t神秘的/难解的\nmystery\t秘密/神秘\nmystical\t神秘的/奥秘的\nmyth\t神话/虚构的事\nmythology\t神话\nnafta\t北美自由贸易协定\nnail\t钉子/指甲\nnaive\t天真的/纯真的\nnaked\t裸体的/无装饰的\nname\t名字/名称\nnamely\t即/就是\nnan\t奶奶/印度\nnancy\t女性化的男人\nnanny\t保姆/母山羊\nnap\t小睡/稍睡\nnapkin\t餐巾/餐巾纸\nnapoleon\t拿破仑\nnarcotic\t麻醉药/镇静剂\nnarration\t叙述/故事\nnarrative\t叙述/故事\nnarrator\t讲述者/叙述者\nnarrow\t狭窄部分/隘路\nnarrowly\t狭窄地/严密地\nnasal\t鼻的/鼻声的\nnasty\t污秽的/下流的\nnathan\t南森\nnation\t国家/民族\nnational\t国家的/国立的\nnationalism\t民族主义/民族特性\nnationalist\t国家主义者/民族主义者\nnationality\t国籍/国家\nnationally\t作为整个民族/举国一致地\nnationwide\t全国性的\nnative\t本地人/土产\nnato\t北大西洋公约组织/北约组织\nnatural\t白痴\nnaturally\t自然地/以自然力\nnature\t自然/大自然\nnaughty\t顽皮的/没规矩的\nnausea\t反胃/晕船\nnavajo\t纳瓦霍人\nnaval\t海军的/军舰的\nnave\t中殿/中央广场\nnavigate\t航行\nnavigation\t航行/航海\nnavy\t海军/海军人员\nnazi\t纳粹党人\nnear\t近的/近亲的\nnearby\t附近的/近旁的\nnearer\t较近\nnearest\t最近的\nnearly\t几乎/密切地\nneat\t整洁的/巧妙的\nneatly\t整洁地/干净地\nnebula\t星云/角膜云翳\nnec\t日本电气公司\nnecessarily\t必然地/必须地\nnecessary\t必要的/必然的\nnecessitate\t迫使/使成为必需\nnecessity\t需要/必需品\nneck\t脖子/衣领\nnecklace\t项链\nnecktie\t领带\nneed\t需要/必须\nneedle\t针/尖\nneedless\t不需要的/不必要的\nneedy\t贫穷的/贫困的\nnegative\t否定/否定语\nnegatively\t否定地/消极地\nneglect\t疏忽/忽略\nneglected\t被忽视的/未被好好照管的\nnegligence\t疏忽/粗心大意\nnegligible\t可以忽略的/不足取的\nnegotiate\t商议/谈判\nnegotiating\t谈判\nnegotiation\t谈判/磋商\nnegotiator\t磋商者/交涉者\nnegro\t黑人\nneighbor\t邻居\nneighborhood\t附近/邻近\nneighboring\t附近的/邻近的\nneighbour\t邻居/邻接的东西\nneighbourhood\t邻接/周围\nneighbouring\t邻近的/接壤的\nneil\t尼尔\nneither\t皆不/两个都不\nnelson\t肩下握颈\nneon\t氖\nnephew\t侄子/外甥\nnerve\t精神/勇气\nnervous\t神经紧张的/不安的\nnervously\t焦急地/神经质地\nnest\t巢/窝\nnestle\t舒适地坐定/挨靠\nnet\t网/网状物\nnetherlands\t荷兰\nnetwork\t网络/广播网\nneural\t神经的/神经系统的\nneuron\t神经原/轴索\nneutral\t中立者/中立国\nneutrality\t中立/不偏不倚\nneutron\t中子\nnever\t从不/决不\nnevertheless\t然而/虽然如此\nneville\t内维尔\nnew\t新的/陌生的\nnewborn\t婴儿\nnewcastle\t纽卡斯尔\nnewcomer\t新来者\nnewfound\t新发现的\nnewly\t重新/最近\nnews\t新闻/消息\nnewsletter\t时事通讯/业务通讯\nnewspaper\t报纸\nnewton\t牛顿\nnext\t下一个\nnhs\t国家医疗保健机构\nnice\t美好的/和蔼的\nnicely\t漂亮地/谨慎地\nniche\t壁龛\nnicholas\t尼古拉斯\nnicholson\t尼科尔森\nnick\t刻痕/缺口\nnickel\t镍/镍币\nnickname\t绰号/昵称\nnicky\t尼基\nnicola\t尼古拉\nniece\t侄女/甥女\nnigel\t奈杰尔\nnigeria\t尼日利亚\nnight\t夜/夜晚\nnightclub\t夜总会\nnightly\t每夜的/夜间的\nnightmare\t梦魇/恶梦\nnighttime\t夜间\nnil\t无/全无\nnina\t尼娜\nnine\t九/九个\nnineteen\t十九/十九个\nnineteenth\t第十九/十九分之一\nninety\t九十/九十个\nninth\t第九/九分之一\nnip\t捏/夹\nnipple\t乳头/奶头\nnitrate\t硝酸盐\nnitrogen\t氮\nnme\t国立军事研究院\nno\t不/拒绝\nnobility\t贵族/高尚\nnoble\t贵族\nnobody\t小人物/无名小卒\nnod\t点头/打盹\nnode\t节/结节\nnoel\t圣诞节/圣诞颂歌\nnoise\t噪音/杂音\nnoisily\t吵闹地\nnoisy\t嘈杂的/喧闹的\nnome\t省/州\nnominal\t名义上的/名字的\nnominate\t提名/任命\nnomination\t提名/任命\nnominee\t被提名者/被任命者\nnon\t非/不\nnone\t一点也不/毫不\nnonetheless\t然而/尽管\nnonexistent\t不存在的\nnonprofit\t非赢利的/无利可图的\nnonsense\t无意义的事/荒谬言行\nnontraditional\t不符合传统的/非传统的\nnoodle\t面条/笨蛋\nnoon\t正午/中午\nnope\t不/不是\nnor\t也不/也没有\nnora\t诺拉\nnorfolk\t诺福克\nnorm\t基准/模范\nnormal\t常态/标准\nnormalization\t常态化/正常化\nnormally\t正规地/合规则\nnorman\t诺曼第语的/诺曼第人的\nnormandy\t诺曼底\nnormative\t合乎规范的/标准的\nnorth\t北方/北\nnorthampton\t北安普敦\nnorthamptonshire\t北安普敦郡[英国英格兰郡名]\nnortheast\t东北\nnortheastern\t东北方的/在东北的\nnorthern\t北方人\nnorthumberland\t诺森伯兰郡[英国英格兰郡名]\nnorthward\t北方/北\nnorthwards\t向北方\nnorthwest\t西北/西北方\nnorthwestern\t在西北部的/西北方的\nnorton\t诺顿/诺顿公司\nnorway\t挪威\nnorwegian\t挪威人/挪威语\nnorwich\t诺威奇\nnose\t鼻子/突出部分\nnostalgia\t乡愁/向往过去\nnostril\t鼻孔\nnot\t不/非\nnotable\t著名人士/值得注意之事物\nnotably\t显著地/著名地\nnotation\t记号/符号表示法\nnotch\t刻痕/等级\nnote\t笔记/记录\nnotebook\t笔记本/手册\nnoted\t著名的/显著的\nnoteworthy\t值得注目的/显著的\nnothing\t无/不关紧要之事\nnotice\t注意/布告\nnoticeable\t显而易见的/显著的\nnotification\t通知/通告\nnotify\t通知/通告\nnotion\t概念/观念\nnotorious\t声名狼藉的/臭名昭著的\nnotoriously\t臭名昭著的/声名狼藉的\nnottingham\t诺丁汉郡/诺丁汉市\nnottinghamshire\t诺丁汉郡\nnotwithstanding\t虽然/尽管\nnought\t没有/零\nnoun\t名词\nnourish\t滋养/使健壮\nnourishment\t滋养品/养料\nnov\t十一月\nnovel\t小说/长篇故事\nnovelist\t小说家\nnovell\t美国网络产品公司名称\nnovelty\t新奇/新鲜\nnovember\t十一月\nnovice\t新手/初学者\nnow\t现在/刚才\nnowadays\t现在/现时\nnowhere\t无处/到处都无\nnuance\t细微差别\nnuclear\t核子的/原子能的\nnucleus\t核心/核子\nnude\t裸的/肉色的\nnudge\t用肘轻推/推动\nnuisance\t讨厌的东西/讨厌的人\nnumb\t麻木的/失去知觉的\nnumber\t数/数字\nnumerical\t数字的/数值的\nnumerous\t很多的/数目众多的\nnun\t修女/尼姑\nnurse\t护士/保姆\nnursery\t托儿所/苗圃\nnursing\t看护/养育\nnurture\t养育/营养物\nnut\t坚果/核心\nnutrient\t营养的/滋养的\nnutrition\t营养/营养学\nnutritional\t营养的/滋养的\nnylon\t尼龙\noak\t橡树/橡木\noar\t桨/桨手\noath\t誓约/誓言\nobedience\t服从/顺从\nobedient\t服从的/顺从的\nobese\t肥胖的\nobesity\t肥胖\nobey\t服从/遵从\nobject\t物体/目标\nobjection\t异议/反对\nobjective\t目的/目标\nobjectivity\t客观/客观现实\nobligation\t义务/责任\noblige\t强制/施恩惠于\nobliged\t感激的/有责任的\noblivious\t遗忘的/健忘的\nobscene\t淫秽的/猥亵的\nobscure\t模糊的/昏暗的\nobservation\t观察/注意\nobservatory\t天文台/气象台\nobserve\t觉察到/遵守\nobserved\t观测的/观察的\nobserver\t观察者/遵守者\nobsessed\t着迷的/无法摆脱的\nobsession\t困扰/困扰人的情绪\nobsolete\t荒废的/成废物的\nobstacle\t障碍/妨害物\nobstinate\t倔强的/顽固的\nobstruct\t阻隔/妨碍\nobstruction\t障碍/妨碍\nobtain\t获得/达到\nobvious\t明显的/明白的\nobviously\t显而易见地/明显地\noccasion\t场合/时机\noccasional\t偶然的/临时的\noccasionally\t有时候/偶而\noccupant\t占有者/居住者\noccupation\t职业/占有\noccupational\t职业的/军事占领的\noccupied\t已占用的/使用中的\noccupier\t占用者/居住者\noccupy\t占领/占(时间\noccur\t发生/被想到\noccurrence\t发生/事件\nocean\t海洋/广阔\noceania\t大洋洲\noct\t十月\noctober\t十月\nodd\t奇数的/古怪的\noddly\t奇怪地\nodds\t可能性/几率\nodor\t气味/香味\nodour\t气味/臭气\noesophageal\t食道\noesophagus\t食道\nof\t的/属于\noff\t关着的/不再生效的\noffence\t犯罪/冒犯\noffend\t犯罪/冒犯\noffender\t罪犯/无礼的人\noffending\t不愉快的/厌恶的\noffense\t犯罪/伤感情\noffensive\t令人不快的/侮辱的\noffer\t给予/出价\noffering\t提供/奉献物\noffice\t办公室/部\nofficer\t军官/主管\nofficial\t官员/公务员\nofficially\t作为公务员/职务上\noffseason\t淡季\noffset\t抵消/把...并列\noffshore\t海面的/吹向海面的\noffspring\t子孙/后代\noften\t时常/常常\noh\tinterj.(表示惊讶/恐怖\nohm\t欧姆\noil\t油/石油\noilfield\t油田\nok\t好/不错\nokay\t好/可以\nold\t以前/往昔\noldham\t奥尔德姆\nolive\t橄榄/橄榄树\noliver\t脚踏铁锤\nolympic\t奥林匹亚的/奥林匹斯山的\nolympics\t奥林匹克运动会\nomelette\t煎蛋卷/炒蛋\nominous\t恶兆的/不吉利的\nomission\t省略/遗漏\nomit\t省略/删除\non\t在...之上\nonce\t一次/曾经\none\t一\noneself\t自己/亲自\nongoing\t前进的/进行的\nonion\t洋葱\nonly\t唯一的/仅有的\nonset\t开始/攻击\nonstage\t在前台\nonto\t在...之上\nonward\t向前的/前进的\nonwards\t向前/在前面\nooh\t（表示惊异/热心\nop\t观测所\nopaque\t不透明物\nopen\t公开/户外\nopener\t开...的人/开局人\nopening\t开始/口子\nopenly\t公开地/坦率地\nopenness\t公开/宽阔\nopera\t歌剧\noperate\t操作/运转\noperating\t操作的/工作的\noperation\t操作/动作\noperational\t操作的/运作的\noperator\t操作员/行家\nopinion\t意见/评价\nopium\t鸦片\nopponent\t对手/敌手\nopportunity\t机会/时机\noppose\t反对/以...对抗\nopposed\t反对的/敌对的\nopposing\t对面的/反对的\nopposite\t相对的/相反的\nopposition\t反对/敌对\noppress\t压迫/压抑\noppression\t压抑/沉闷\noppressive\t压制性的/压迫的\nopt\t选择\noptical\t眼睛的/视觉的\noptics\t光学\noptimal\t最佳的/最理想的\noptimism\t乐观主义/乐观\noptimistic\t乐观的/乐观主义的\noptimum\t最适条件/最佳效果\noption\t选择权/挑选\noptional\t可选择的/随意的\nor\t或/或者\noracle\t神谕/神谕处\noral\t口试\norange\t柑橘/桔子\norbit\t轨道/常轨\norbital\t轨道的/眼眶的\norchard\t果园/果树林\norchestra\t管弦乐队/乐队演奏处\norchestrate\t编管弦乐曲\norchid\t兰花/淡紫色\nord\t研究与开发处/运筹学部（Oper\nordeal\t严酷考验/痛苦经历\norder\t次序/规则\nordering\t有序化\norderly\t有秩序的/整齐的\nordinance\t法令/条例\nordinarily\t通常/普通\nordinary\t平常的/普通的\nordnance\t大炮/军械\nore\t矿石\norgan\t风琴/器官\norganic\t器官的/有机的\norganisation\t组织/团体\norganisational\torganise的变形\norganise\t组织/有机化\norganised\t有组织的/组织起来的\norganism\t生物/有机体\norganization\t组织/结构\norganizational\t组织的\norganize\t组织/有机化\norganized\t有组织的/组织起来的\norganizer\t组织者/编制者\norient\t东方/东方诸国\noriental\t东方人/亚洲人\norientation\t定方位/适应\norigin\t起源/起因\noriginal\t最初的/原始的\noriginally\t本来/原来\noriginate\t创始/发明\norkney\t奥克尼群岛/奥克尼\nornament\t装饰/点缀品\nornamental\t装饰物/观赏植物\norphan\t孤儿\norphanage\t孤儿院/孤儿身份\northodox\t正统的/传统的\noscar\t奥斯卡金像奖/钱\nostensibly\t可公开/显然\nother\t其他的/另外的\nothers\t其他人\notherwise\t否则/不同地\nottawa\t渥太华\notto\t玫瑰油\nouch\tinterj.哎唷\nought\t应该/大概\nounce\t盎司/少量\nour\t我们的\nours\t我们的\nourselves\t我们自己\noust\t逐出/罢黜\nout\t外面的/熄灭的\noutbreak\t爆发/暴动\noutburst\t爆发/突发\noutcome\t结果/出口\noutcry\t尖叫/倒彩\noutdoor\t户外的/屋外的\noutdoors\t户外/野外活动\nouter\t外部的/外面的\noutermost\t最外面的/最远离中心的\noutfit\t用具/配备\noutgoing\t外出/开支\nouting\t郊游/远足\noutlaw\t被剥夺法律保护的人/罪犯\noutlet\t出口/发泄方法\noutline\t大纲/轮廓\noutlook\t观点/景色\noutnumber\t数目超过/比...多\noutpost\t前哨/前哨部队\noutput\t输出/产品\noutrage\t暴行/侮辱\noutraged\t义愤填膺的/愤慨的\noutrageous\t暴虐的/极无礼的\noutreach\t超出...的范围/作超出能力所及\noutright\t率直的/完全的\noutset\t着手/开头\noutside\t外面/外表\noutsider\t外人/局外人\noutskirt\t边缘/郊外\noutskirts\t近郊/市郊\noutspoken\t直言无讳的/坦率的\noutstanding\t杰出的/突出的\noutward\t向外的/表面的\noutwards\t向外地\noutweigh\t比...重/比...重要\noval\t椭圆形\noven\t烤箱/灶\nover\t结束/越过\noverall\t全部的/全体的\novercoat\t外套大衣\novercome\t战胜/克服\noverdraft\t透支/透支额\noverdue\t过期的/未兑的\noverestimate\t评价过高/过高估价\noverflow\t溢值/超值\noverhang\t突出部份/悬垂部份\noverhead\t经常开支/普通用费\noverhear\t无意中听到/偷听\noverlap\t重叠/重复\noverload\t超载/过载\noverlook\t俯瞰/远眺\noverly\t过度地/极度地\novernight\t前一天晚上/一夜的逗留\noverride\t推翻/无视\noverseas\t海外的/国外的\noversee\t向下看/了望\novershadow\t遮阴/使阴暗\noversight\t勘漏/失察\novert\t明显的/公然的\novertake\t赶上/突然降临于\noverthrow\t推翻/瓦解\novertime\t超时/加班\noverturn\t倾覆/破灭\noverview\t概述/概观\noverweight\t超过重量/过重\noverwhelm\t淹没/受打击\noverwhelming\t压倒性的/无法抵抗的\noverwhelmingly\t压倒性地/不可抵抗地\nowe\t亏欠/负...债\nowen\t欧文\nowing\t未付的/亏欠的\nowl\t猫头鹰\nown\t自己的\nowner\t拥有者/物主\nownership\t所有权/物主身份\nox\t牛\noxford\t牛津/牛津大学\noxfordshire\t牛津郡\noxide\t氧化物\noxidize\t使氧化/使生锈\noxygen\t氧\noyster\t牡蛎/蚝\noz\t盎司\nozone\t新鲜的空气/臭氧\npace\t速度/步调\npacific\t太平洋\npack\t包裹/一伙\npackage\t包裹/套装软件\npackaging\t包装/包装业\npacked\t充满...的/满座的\npacket\t小包/一批信件\npacking\t包装/填垫材料\npact\t契约/协定\npad\t填补/衬垫\npaddle\t桨/划桨\npaddy\t稻/谷\npage\t页/记录\npageant\t盛会/游行\npaid\t受雇的/付清的\npail\t桶/提桶\npain\t痛苦/疼痛\npainful\t痛苦的/困难的\npainfully\t痛苦地/苦恼地\npaint\t油漆/颜料\npainted\t描画的/着色的\npainter\t画家/油漆匠\npainting\t画/绘画\npair\t一双/一对\npaisley\t佩斯利涡纹旋花呢\npajamas\t睡衣/宽松裤\npakistan\t巴基斯坦\npakistani\t巴基斯坦的\npal\t朋友/伙伴\npalace\t宫/宫殿\npale\t栅栏/界线\npalestine\t巴勒斯坦\npalette\t调色板/颜料\npalm\t手掌/棕榈\npalmer\t朝圣者/变戏法的人\npamela\t帕梅拉\npamphlet\t小册子/活页文选\npan\t平锅/浅盘\npanama\t巴拿马/巴拿马城\npancake\t薄烤饼/薄煎饼\npancreatic\t胰腺的\npanda\t大熊猫/小熊猫\npane\t窗玻璃/方框\npanel\t嵌板/仪表板\npanic\t恐慌/惊慌\npant\t喘息/悸动\npanther\t豹/黑豹\npantry\t餐具室/食品室\npants\t裤子/长裤\npapa\t爸爸\npapal\t罗马教皇的/教皇制度的\npaper\t纸/文件\npaperback\t平装本/纸面本\npaperwork\t文书工作\npar\t标准/票面价值\nparachute\t降落伞\nparade\t游行/炫耀\nparadigm\t范例/式样\nparadise\t天堂/乐园\nparadox\t似非而是的论点/自相矛盾的话\nparadoxically\t反论/荒谬\nparagraph\t段落/短评\nparallel\t平行/对比\nparalyse\t使麻痹/使瘫痪\nparalysis\t麻痹/停顿\nparalyze\t使瘫痪/使麻痹\nparameter\t参变数/参变量\nparamount\t首长/最高当局\nparanoid\t患妄想狂的/患偏执狂的\nparasite\t寄生生物/寄生虫\nparcel\t包裹/部分\npardon\t原谅/赦免\nparent\t父母/父母亲\nparental\t父母亲的/做双亲的\nparenting\t父母对子女的养育\nparis\t巴黎\nparish\t教区/堂区\npark\t公园/停车处\nparker\t停放车辆的人\nparking\t停车\nparkinson\t帕金森/帕金森（全名詹姆士?帕金\nparliament\t国会/议会\nparliamentary\t国会的/议会的\nparlor\t客厅/会客室\nparlour\t客厅/会客室\nparole\t假释/誓言\nparrot\t鹦鹉/应声虫\nparsley\t皱叶欧芹/荷兰芹\nparsons\t帕森斯\npart\t部分/局部\npartial\t部分的/偏袒的\npartially\t部分地/一部分地\nparticipant\t参加者/参与者\nparticipate\t参加/分享\nparticipating\t由多人一起参加的/由多方一起参加\nparticipation\t参与/分享\nparticle\t颗粒/粒子\nparticular\t一项\nparticularly\t特别/格外\nparticulars\t细节/详细情况\nparting\t告别/分歧处\npartisan\t党羽/虔诚信徒\npartition\t分割/隔离物\npartly\t部分地/在一定程度上\npartner\t合伙人/股东\npartnership\t合伙/合股\nparty\t宴会/党\npascoe\t人名/帕斯科埃\npass\t经过/要隘\npassage\t通道/通过\npassenger\t乘客/旅客\npassing\t通过/逝去\npassion\t激情/酷爱\npassionate\t热情的/热烈的\npassionately\t热情地/激昂地\npassive\t消极的/被动的\npassport\t护照/手段\npast\t过去/昔时\npasta\t意大利面食\npaste\t面团/面食\npastel\t粉蜡笔/粉蜡笔画\npastime\t消遣/娱乐\npastor\t牧师\npastoral\t牧歌/田园诗\npastry\t油酥点心/面粉糕饼\npasture\t牧场/草地\npat\t轻拍\npatch\t片/补缀\npatent\t专利权/许可证\npath\t路径/小路\npathetic\t悲哀的/可怜的\npathogen\t病原体\npathway\t路径/途径\npatience\t耐性/忍耐\npatient\t病人/承受者\npatiently\t耐心地/有毅力地\npatio\t屋子与花园之间的一片供晴天休息用\npatricia\t帕特丽夏\npatrick\t帕特里克\npatriot\t爱国者/爱国主义者\npatriotic\t爱国的/有爱国心的\npatriotism\t爱国心/爱国精神\npatrol\t巡逻/巡逻员\npatron\t赞助人/顾客\npatronage\t赞助/恩赐态度\npatten\t木套鞋/木底鞋\npattern\t模范/典型\npaul\t保罗\npaula\t保拉\npauline\t保罗的/使徒保罗写的\npause\t暂停/中止\npave\t铺设/安排\npavement\t路面/人行道\npavilion\t楼阁/亭子\npaw\t爪\npay\t薪资/付款\npayable\t可付的/到期的\npaycheck\t付薪水的支票/薪水\npayer\t支付者/付款人\npayment\t付款/支付的款项\npayoff\t发工资/分赃\npayroll\t工资名单/饷金名单\npc\t个人计算机\npea\t豌豆/似豌豆的东西\npeace\t和平/和约\npeaceful\t平静的/和平的\npeacefully\t平静地\npeach\t桃子/桃树\npeacock\t孔雀/好炫耀的人\npeak\t山峰/巅\npeanut\t花生/小人物\npear\t梨子/梨树\npearce\t皮尔斯\npearl\t珍珠/珠灰色\npearson\t皮尔森\npeasant\t农夫/乡下人\npeasantry\t农民/小农地位\npeat\t泥煤/泥炭色\npebble\t小圆石/小鹅卵石\npecan\t美洲山核桃\npeck\t配克/啄痕\npeculiar\t奇特的/罕见的\npeculiarity\t特质/特性\npedal\t踏板/脚蹬子\npedestrian\t行人/步行者\npediatrician\t儿科医生/儿科专家\npedigree\t血统/家谱\npedlar\t沿街叫卖的小贩/传播者\npeek\t偷看/窥视\npeel\t皮/外壳\npeep\t一瞥/偷看\npeer\t同等的人/匹敌\npeg\t钉/桩\npeggy\t佩吉\npellet\t颗粒状物/小子弹\npen\t钢笔/笔\npenal\t有关处罚的/刑的\npenalty\t处罚/刑罚\npence\tpl.copper便士/分\npencil\t铅笔/色笔\npending\t未决定的/待决的\npendulum\t钟摆/摇锤\npenetrate\t穿透/刺穿\npenetration\t穿透/渗透\npeninsula\t半岛/突出的地方\npenis\t阳物/阴茎\npenny\t便士/一分\npension\t养老金/退休金\npensioner\t领取抚恤金者/自费生\npentagon\t五角形/五边形\npeople\t人/人民\npepper\t胡椒粉/胡椒\npeptide\t肽/缩氨酸\nper\t每一/通过\nperceive\t感觉/认知\nperceived\t感觉/视为\npercent\t百分比/百分数\npercentage\t百分比/比率\nperception\t知觉/感觉\nperch\t栖木/高位\nperennial\t常年的/长期的\nperfect\t完成时\nperfection\t完美/完成\nperfectly\t完全地/无瑕疵地\nperform\t进行/履行\nperformance\t施行/工作情况\nperformer\t表演者/执行者\nperforming\t表演的/履行的\nperfume\t香水/香气\nperhaps\t也许/大概\nperil\t危险/冒...之险\nperimeter\t周长/周界\nperiod\t时期/节段\nperiodic\t周期的/定期的\nperiodical\t期刊\nperiodically\t定期/循环\nperipheral\t周边的/周围的\nperish\t毁灭/丧生\nperk\t昂首/振作\npermanent\t永久的/不变的\npermanently\t永久/不变\npermeate\t弥漫/渗透\npermissible\t可允许的/可容许程度的\npermission\t许可/允许\npermit\t许可证/许可\nperpendicular\t垂直线/垂直的位置\nperpetrator\t作恶者/犯罪者\nperpetual\t永久的/不断的\nperpetuate\t使永存/使不朽\nperplex\t使困惑/使复杂化\nperry\t梨子酒\npersecute\t迫害/虐待\npersecution\t虐待/迫害运动\npersevere\t坚持/孜孜不倦\npersian\t波斯人/波斯语\npersist\t坚持/固执\npersistence\t固执/坚持不懈\npersistent\t固执的/坚持的\nperson\t人/人身\npersona\t人/人物\npersonal\t私人的/涉及隐私的\npersonality\t个性/人格\npersonally\t亲自地/个别地\npersonnel\t人员/人事部门\nperspective\t远景/透视感\nperspiration\t汗/流汗\npersuade\t劝/使相信\npersuasion\t说服/信念\npersuasive\t有说服力的/劝诱的\nperth\t珀斯/佩斯\npertinent\t相关的/中肯的\nperu\t秘鲁\npervasive\t普遍的/流行的\nperverse\t乖张的/故意作对的\npessimistic\t悲观的/厌世的\npest\t令人讨厌之物/有害之物\npesticide\t杀虫剂\npet\t宠物/受宠爱的人\npetal\t花瓣\npete\t皮特\npeter\t逐渐消失/逐渐减少\npeterborough\t彼得伯勒\npetersburg\t彼得斯堡/彼得堡\npetition\t请愿/诉状\npetrol\t汽油\npetroleum\t石油\npetty\t琐碎的/小规模的\nph\t氢离子指数\npharmaceutical\t药学的/制药的\npharmacy\t药房/配药学\nphase\t时期/局面\nphd\t哲学博士学位\nphenomenal\t现象的/能知觉的\nphenomenon\t现象/迹象\nphil\t哲学\nphilanthropic\t慈善的/博爱的\nphilanthropy\t慈善/仁慈\nphilip\t菲利普\nphilippines\t菲律宾\nphilips\t飞利浦\nphillips\t飞利浦/菲利普斯\nphilosopher\t哲学家/哲人\nphilosophical\t哲学的/冷静的\nphilosophy\t哲学/人生观\nphoenix\t凤凰/不死鸟\nphone\t电话/受话器\nphony\t假货/假冒者\nphosphate\t磷酸盐/磷酸酯\nphoto\t相片/照片\nphotoelectric\t光电的/灯光摄影装置的\nphotograph\t相片/照片\nphotographer\t摄影师/摄影者\nphotographic\t照相的/摄影用的\nphotography\t摄影/摄影术\nphoton\t光子/光量子\nphrase\t惯用语/词组\nphysical\t身体的/物质的\nphysically\t按自然规律/完全地\nphysician\t医师/内科医师\nphysicist\t物理学家/机械唯物论者\nphysics\t物理学/物理过程\nphysiological\t生理学的/生理学上的\npi\t圆周率\npianist\t钢琴家/钢琴演奏者\npiano\t钢琴\npicasso\t毕加索\npick\t精选/选择\npickle\t盐卤/腌汁\npickup\t拾起/加速\npicnic\t野餐/远足\npicture\t图画/照片\npicturesque\t生动的/如画的\npie\t馅饼/财富\npiece\t块/片\npier\t码头/桥墩\npierce\t刺穿/穿透\npierre\t皮埃尔\npig\t猪/猪肉\npigeon\t鸽子/易上当受骗的人\npigment\t色素/色质\npike\t长矛/尖头\npile\t堆/大堆\npilgrim\t旅行者/朝圣者\npilgrimage\t朝圣/漫游\npill\t药丸/弹丸\npillar\t柱子/栋梁\npillow\t枕头/靠垫\npilot\t飞行员/领航员\npin\t大头针/针\npinch\t捏/拧\npine\t松树/松木\npineapple\t凤梨/菠萝\npink\t粉红色/石竹花\npinpoint\t极小之物/针尖\npint\t品脱\npioneer\t先锋/拓荒者\npioneering\t首创的/先驱的\npious\t虔诚的/敬神的\npipe\t管/导管\npipeline\t管道/传递途径\npiper\t吹笛者/风笛手\npirate\t海盗/盗印者\npiss\t小便/下大雨\npistol\t手枪/信号枪\npiston\t活塞/活塞阀键\npit\t深坑/矿井\npitch\t程度/坡度\npitcher\t有把的大罐/瓶状体\npitfall\t陷阱/诱惑\npity\t遗憾/同情\npivotal\t枢轴的/关键的\npizza\t比萨饼\nplace\t地方/地点\nplacebo\t晚祷歌/安慰剂\nplacement\t放置/布置\nplacing\t出盘/出售\nplague\t瘟疫/天罚\nplain\t平原/草原\nplainly\t清楚地/明白地\nplaintiff\t原告/起诉人\nplan\t计划/方案\nplane\t平面/扁平物\nplanet\t行星/命运星辰\nplanetary\t行星的/流浪的\nplank\t厚木板/支架\nplanned\t计划了的/预定的\nplanner\t计划者/设计者\nplanning\t计划的制订/策划\nplant\t植物/作物\nplantation\t种植园/大农场\nplanting\t种植/栽培\nplaque\t匾/饰板\nplasma\t血浆/淋巴液\nplaster\t石膏/灰泥\nplastic\t塑料/可塑体\nplate\t碟/盘子\nplateau\t高地/高原\nplatelet\t血小板/小盘\nplatform\t站台/月台\nplatinum\t白金/铂\nplatoon\t排/一组\nplatter\t大浅盘/主菜盘\nplausible\t貌似真实的/貌似合理的\nplay\t游戏/游玩\nplayer\t竞赛者/上场队员\nplayful\t爱打趣的/多趣的\nplayground\t运动场/操场\nplaying\t游戏/玩耍\nplaymate\t玩伴/游伴\nplayoff\t双方得分相等时的最后决赛/复赛\nplayroom\t游戏室/娱乐室\nplaywright\t剧作家\nplaza\t广场/市场\nplea\t恳求/辩解\nplead\t辩护/恳求\npleasant\t愉快的/可爱的\npleasantly\t和蔼地/亲切地\nplease\t请\npleased\t高兴的/喜欢的\npleasing\t令人喜爱的/愉快的\npleasure\t快乐/愉快\npledge\t诺言/保证\nplentiful\t许多的/丰富的\nplenty\t充分/很多\nplight\t困境/窘境\nplo\t巴勒斯坦解放组织\nplot\t小块土地/地区图\nplough\t犁/犁过的地\nplow\t犁\nploy\t手段/活动\npluck\t勇气/猛拉\nplug\t塞子/栓\nplum\t李子\nplumbing\t测深/管子工行业\nplume\t羽毛/羽毛装饰\nplummet\t测深锤/铅坠\nplump\t圆胖的/丰满的\nplunder\t抢夺/掠夺品\nplunge\t钻进/跳进\nplural\t复数\npluralism\t多数状态/多重性\nplus\t加上/加\nplutocrat\t富豪/财阀\nplutonium\t钚\nplymouth\t普利茅斯\nplywood\t夹板/合板\npm\t出纳员/军需官\npneumatic\t充气的/空气的\npneumonia\t肺炎\npocket\t口袋/钱袋\npod\t豆荚/保护性外壳\npodium\t墩座/矮隔墙\npoem\t诗/诗般美的事物\npoet\t诗人\npoetic\t诗的/诗意的\npoetry\t诗/韵文\npoignant\t辛酸的/尖锐的\npoint\t点/小数点\npointed\t尖的/有尖顶的\npointer\t指示物/教鞭\npointless\t不尖的/钝的\npoise\t平衡/均衡\npoison\t毒药/毒\npoisoning\t中毒\npoisonous\t有毒的/恶毒的\npoke\t刺/戳\npoker\t戳的人/拨火棍\npoland\t波兰\npolar\t两极的/极地的\npolarity\t极性/截然相反\npole\t波兰人/极点\npolice\t警察/警察当局\npoliceman\t警察\npolicing\t巡查\npolicy\t政策/方针\npolicymaker\t政策制定者/决策人\npolish\t波兰的\npolished\t擦亮的/优雅的\npolite\t有礼貌的/文雅的\npolitely\t有礼貌地/文雅地\npolitical\t政治的/政治上的\npolitically\t政治上\npolitician\t政客/政治家\npolitics\t政治/政治学\npoll\t投票/民意测验\npollen\t花粉\npolling\t选举投票\npollster\t民意调查人/民意测验经办人\npollutant\t污染物质\npollute\t污染/弄脏\npollution\t污染/玷污\npolly\t波莉\npolo\t马球/水球\npolymer\t聚合物/聚合体\npolymerase\t聚合酶\npolytechnic\t各种工艺的/工艺教育的\npond\t池塘\nponder\t沉思/考虑\npony\t矮种马\npool\t池/水塘\npoole\t普尔\npoor\t贫穷的/贫乏的\npoorly\t贫穷地/不充分地\npop\t砰然声/枪击\npopcorn\t爆米花\npope\t罗马教皇/主教\npopular\t通俗的/流行的\npopularity\t名声/受大众欢迎\npopulate\t使人口聚居在...中/殖民于\npopulation\t人口/人口数\npopulist\t民粹派的成员\nporcelain\t瓷器/瓷\nporch\t门廊/走廊\npore\t毛孔/小孔\npork\t猪肉\npornography\t色情描写/黄色书刊\nporridge\t粥/糊\nport\t港口/埠\nportable\t可携带的/可搬运的\nportal\t入口/大门\nporter\t大楼管理员/门房\nportfolio\t皮包/公文包\nportion\t部分/一份\nportrait\t肖像/人像\nportray\t描绘/描写\nportrayal\t描绘/描写\nportsmouth\t朴茨茅斯\nportugal\t葡萄牙\nportuguese\t葡萄牙人/葡萄牙语\npose\t姿势/姿态\nposh\t豪华的/漂亮的\nposit\t假设/安置\nposition\t位置/地位\npositive\t肯定的/积极的\npositively\t明确地/肯定地\npossess\t持有/占有\npossession\t拥有/占有\npossibility\t可能性/可能的事\npossible\t可能的/潜在的\npossibly\t可能/也许\npost\t柱/杆\npostage\t邮资\npostal\t邮政的/邮局的\npostbox\t邮筒\npostcard\t明信片\npostcode\t邮政编码\nposter\t海报/招贴\npostgraduate\t大学毕业后的/大学研究院的\npostman\t邮递员\npostmodern\t后现代的\npostpone\t延迟/使延期\npostseason\t赛季后\npostulate\t假定/基本条件\nposture\t姿势/态度\npostwar\t战后的\npot\t盆/罐\npotato\t马铃薯\npotency\t力量/权力\npotent\t有力的/有说服力的\npotential\t潜在性/可能性\npotentially\t可能地/潜在地\npotter\t陶工/制陶工人\npottery\t陶器/陶器厂\npouch\t小袋/小包\npoultry\t家禽\npound\t磅/英镑\npounding\t重击/重击声\npour\t流出/倾泻\npoverty\t贫穷/贫困\npowder\t粉/粉末\npowdered\t弄成粉末的/粉状的\npowell\t鲍威尔\npower\t力/体力\npowerful\t有力的/有权力的\npowerfully\t强有力/强大\npowerless\t无力的/无权的\npp\t包裹邮递/包裹邮件\npr\t与公众的关系/公关\npracticable\t可实行的/可做的\npractical\t实际的/现实的\npractically\t几乎/差不多\npractice\t实践/练习\npractise\t实践/实行\npractising\t在从事职业的/在从事活动的\npractitioner\t从业者/开业者\npragmatic\t忙碌的/爱管闲事的\nprague\t布拉格\nprairie\t大草原/草甸\npraise\t赞美/称赞\npray\t祈祷/恳求\nprayer\t祈祷/恳求\npreach\t传道/讲道\npreacher\t传道士/讲道者\nprecarious\t不稳定的/不安的\nprecaution\t预防/留心\nprecede\t在...之前/优于\nprecedence\t优先/居先\nprecedent\t先例/前例\npreceding\t在前的/前面的\nprecinct\t区域/管理区\nprecious\t宝贵的/珍贵的\nprecipitate\t沉淀物/凝结物\nprecise\t精确的/严谨的\nprecisely\t精确地/明确地\nprecision\t精密/精确\npreclude\t预先排除/预防\nprecursor\t先驱者/前导\npredator\t食肉动物/掠夺者\npredecessor\t前任/先辈\npredestine\t预定/注定\npredicament\t处境/穷境\npredict\t预知/预言\npredictable\t可预言的\nprediction\t预言/预报\npredictor\t预言者\npredominant\t占主导地位的/卓越的\npredominantly\t主要地/显著地\npredominate\t掌握/控制\npreface\t序/绪言\nprefer\t宁可/较喜欢\npreferable\t更可取的/更好的\npreferably\t更可取地/更好地\npreference\t偏爱/优先\npreferred\t首选的\npregnancy\t怀孕/丰富\npregnant\t怀孕的/充满的\npreheat\t预热\nprejudice\t偏见/成见\npreliminary\t初步做法/初步措施\nprelude\t前奏/序幕\npremature\t早产的/过早的\npremier\t总理/首相\npremiere\t初次公演/首次露面\npremise\t前提/房屋连地基\npremium\t额外补贴/奖金\npreoccupation\t抢先占据/先人之见\npreoccupied\t被先占的/入神的\npreparation\t准备/预备\npreparatory\t预备性的/准备性的\nprepare\t准备/筹备\nprepared\t准备好的/特制的\npreposition\t前置词/介词\nprerequisite\t先决条件的/必要的\nprerogative\t特权/君权\npresbyterian\t长老派的/长老宗的\npreschool\t就学前的\nprescribe\t规定/指定\nprescribed\t规定的\nprescription\t处方/命令\npresence\t出席/面前\npresent\t现在/礼品\npresentation\t赠与/描述\npresenter\t节目主持人/奉献者\npresently\t目前/不久\npreservation\t保存/保藏\npreserve\t保护/保持\npreset\t事先调整\npreside\t统辖/当主人\npresidency\t总统职权/总裁职位\npresident\t总统/总裁\npresidential\t总统制的/总统的\npress\t压/揿\npressing\t紧迫的/迫切的\npressure\t压/榨\nprestige\t声望/威望\nprestigious\t享有声望的\npreston\t普勒斯顿\npresumably\t推测上/大概\npresume\t假定/推测\npresumption\t专横/放肆\npretence\t假装/虚伪\npretend\t假装/伪称\npretext\t借口/托词\npretty\t漂亮的/优美的\nprevail\t获胜/流行\nprevailing\t盛行很广的/优势的\nprevalence\t普遍/流行\nprevalent\t普遍的/流行的\nprevent\t预防/防止\nprevention\t阻止/妨碍\npreventive\t预防的/防止的\npreview\t事先查看/预览\nprevious\t早先的/前面的\npreviously\t先/先前\nprey\t被掠食者/牺牲者\nprice\t价格/代价\nprick\t刺/戳\npride\t骄傲/自尊心\npriest\t祭司/牧师\nprimarily\t主要地/首先地\nprimary\t最主要者/原色\nprimate\t大主教/灵长目动物\nprime\t最佳部分/初期\nprimitive\t原始人/早期艺术家\nprince\t王子/亲王\nprincess\t公主/王妃\nprincipal\t校长/首长\nprincipally\t主要地/大部分\nprinciple\t原则/原理\nprint\t打印/版\nprinted\t印刷的/印好的\nprinter\t印刷工/打印机\nprinting\t印刷/印刷术\nprior\t更重要的/较早的\npriority\t优先权/优先\nprism\t棱镜/棱柱\nprison\t监狱/监禁\nprisoner\t囚犯/犯人\npristine\t太古的/原来的\nprivacy\t隐私/隐居\nprivate\t私人的/秘密的\nprivately\t秘密地/私下地\nprivatisation\t私有化/非国营化\nprivilege\t特权/特别恩典\nprivileged\t有特权的/有特别恩典的\nprivy\t个人的/私人的\nprize\t奖赏/奖金\npro\t正面地\nprobability\t可能性/或然率\nprobable\t很可能的/大概的\nprobably\t大概/或许\nprobation\t鉴定/查验\nprobe\t探索/调查\nproblem\t问题/难题\nproblematic\t成问题的/未定的\nprocedural\t程序上的\nprocedure\t程序/过程\nproceed\t继续进行/进行\nproceeding\t进行/程序\nproceedings\t诉讼/事项\nproceeds\tpl.收益\nprocess\t程序/进行\nprocession\t队伍/连续\nprocessor\t信息处理机/加工者\nproclaim\t宣布/公告\nprocure\t获得/取得\nprod\t刺针/刺棒\nproduce\t生产品/物产\nproducer\t生产者/制作者\nproduct\t产品/结果\nproduction\t制造/生产\nproductive\t能生产的/有生产价值的\nproductivity\t生产力\nprof\t教授\nprofession\t职业/表白\nprofessional\t专业人才\nprofessionalism\t职业特性/专业技巧\nprofessionally\t专业地/内行地\nprofessor\t教授\nproficiency\t精通/熟练\nproficient\t高手/专家\nprofile\t侧面/轮廓\nprofit\t利润/赢利\nprofitability\t收益性/利益率\nprofitable\t有利润的/有利益的\nprofound\t极深的/深厚的\nprofoundly\t深深地/深切地\nprogram\t节目/节目单\nprogramme\t节目/节目单\nprogrammer\t程序员\nprogramming\t节目的计划/编制程序\nprogress\t进步/发展\nprogression\t前进/连续\nprogressive\t改革论者/进步论者\nprogressively\t进步/先进\nprohibit\t禁止/阻止\nprohibition\t禁令/禁止\nproject\t计划/设计\nprojected\t投影的/投射\nprojecting\t突出的/伸出的\nprojection\t发射/计划\nprojector\t计划人/发起人\nproliferation\t增殖/激增\nprolong\t延长/拖延\nprolonged\t延续的/长时间的\nprom\t音乐会/舞会\nprominence\t突起/突出\nprominent\t卓越的/显著的\nprominently\t显著地\npromise\t诺言/约定的事情\npromised\t&vi./承诺\npromising\t有希望的/前途有望的\npromote\t促进/晋升\npromoter\t促进者/助长者\npromotion\t晋级/创建\npromotional\t增进的\nprompt\t激励/提示\npromptly\t敏捷地/迅速地\nprone\t俯伏的/面向下的\npronoun\t代词\npronounce\t发音/宣告\npronounced\t发出音的/读出来的\npronunciation\t发音/读法\nproof\t证据/证明\nprop\t支柱/支持者\npropaganda\t宣传/宣传活动\npropagate\t繁殖/传播\npropagation\t增殖/繁殖\npropel\t推进/驱使\npropeller\t螺旋桨/推进器\nproper\t适当的/固有的\nproperly\t适当地/相当地\nproperty\t财产/所有权\nprophecy\t预言/预言能力\nprophet\t预言者/先知\nproponent\t建议者/支持者\nproportion\t比例/比率\nproportional\t比例的/相称的\nproposal\t提议/计划\npropose\t计划/打算\nproposed\t被提议的/所推荐的\nproposition\t建议/命题\nproprietary\t所有者的/所有权的\nproprietor\t所有者\npropulsion\t推进/推进力\nprose\t散文\nprosecute\t告发/起诉\nprosecution\t执行/经营\nprosecutor\t实行者/告发者\nprospect\t景色/展望\nprospective\t预期的/将来的\nprosper\t繁荣/兴隆\nprosperity\t繁荣/茂盛\nprosperous\t成功的/繁盛的\nprostate\t前列腺的\nprostitute\t妓女/男娼\nprostitution\t卖淫/糟蹋\nprotagonist\t主人公/主角\nprotect\t防卫/保护\nprotected\t受保护的\nprotection\t保护/防卫\nprotective\t给予保护的/保护的\nprotector\t保护者/保护物\nprotein\t蛋白质\nprotend\t伸出/伸展\nprotest\t抗议/反对\nprotestant\t新教徒\nprotester\t抗议者/持异议者\nprotocol\t草案/礼仪\nproton\t质子\nprototype\t原型\nproud\t骄傲的/自大的\nproudly\t傲慢地/自大地\nprove\t证明/查验\nproven\tprove的过去分词\nproverb\t谚语/格言\nprovide\t提供/供应\nprovided\t倘若/以...为条件\nprovider\t供应者/供养人\nprovince\t省/地方\nprovincial\t外地人/粗野的人\nprovision\t钱和设备/准备\nprovisional\t暂时的/暂定的\nprovocation\t激怒/刺激\nprovocative\t激发感情的/挑拨的\nprovoke\t激怒/惹起\nprovost\t教务长/监督员\nproximal\t最接近的/近中心的\nproximity\t接近/亲近\nproxy\t代理/代理人\nprudent\t审慎的/三思而后行的\npry\t杠杆/窥探\npsyche\t灵魂/精神\npsychiatric\t精神病学的/医精神病的\npsychiatrist\t精神病医生/精神病学家\npsychiatry\t精神病学/精神病治疗\npsychic\t灵魂的/精神的\npsychoanalysis\t心理分析\npsychological\t心理学的/精神上的\npsychologically\t心理上/从心理学角度\npsychologist\t心理学家\npsychology\t心理学/心理状态\npub\t酒馆/客栈\npublic\t公众/民众\npublication\t出版物/出版\npublicity\t名声/宣传\npublicize\t宣传\npublicly\t公然地/以公众名义\npublish\t出版/发行\npublished\t已发布的\npublisher\t出版者/发行人\npublishing\t出版/刊印\npudding\t布丁\npuddle\t小池/水坑\npuff\t一阵喷烟/肿块\npull\t拉/拖\npulley\t滑车/滑轮\npulp\t果肉/纸浆\npulpit\t讲道坛\npulse\t脉冲/脉搏\npump\t抽水机/打气筒\npumpkin\t南瓜\npunch\t打洞器/钻孔机\npunctual\t准时的/守时的\npunctuate\tvi.给文章加标点/加标点符号\npunctuation\t标点/标点符号\npundit\t学者/梵文学者\npunish\t处罚/惩罚\npunishment\t处罚/刑罚\npunitive\t刑罚的/惩罚性的\npunk\t废物/小阿飞\npunter\t用篙撑船的人/船夫\npup\t小狗/幼畜\npupil\t学生/门生\npuppet\t傀儡/木偶\npuppy\t小狗/小动物\npurchase\t购买/购买品\npurchaser\t买方/购买者\npure\t纯的/纯净的\npurely\t纯粹地/清白地\npurify\t变纯净\npurity\t纯净/纯正\npurple\t紫色/帝位\npurport\t意义/要旨\npurpose\t目的/意向\npurse\t钱包/小钱袋\npursue\t追赶/追踪\npursuit\t追踪/追求\npush\t推/推动\nput\t放/摆\nputt\t击球入洞\npuzzle\t难题/迷惑\npuzzled\t困惑的/迷惑的\npyjamas\t睡衣裤/宽松裤\npylorus\t幽门\npyramid\t角锥/金字塔\nqb\t定量电池battery）\nquake\t颤抖/地震\nqualification\t资格/条件\nqualified\t有资格的\nqualify\t取得资格/有资格\nqualitative\t性质的/质的\nquality\t品质/特性\nquantify\t定量/用数量表示\nquantitative\t数量的/定量的\nquantity\t量/数量\nquantum\t量/量子\nquarrel\t吵架/反目\nquarry\t采石场/方形石\nquart\t夸脱\nquarter\t四分之一/一刻钟\nquarterback\t四分卫\nquarterly\t季度的/按季度的\nquartet\t四重奏\nquartz\t石英\nquay\t码头/驳岸\nqueen\t王后/女王\nqueer\t怪人/同性恋者\nquench\t熄灭/结束\nquery\t疑问/疑问号\nquest\t探索/寻求\nquestion\t问题/询问\nquestionable\t可疑的\nquestionnaire\t调查表/问卷\nqueue\t辫子/一队人\nquick\t快的/迅速的\nquicken\t加快/激发\nquicker\t快些\nquickly\t很快地\nquid\t一镑金币/一镑\nquiet\t安静/闲适\nquietly\t安静地/沉着地\nquilt\t棉被\nquinn\t奎恩\nquit\t离开/辞职\nquite\t相当/完全\nquiver\t震动/颤抖\nquiz\t考查/课堂测验\nquota\t配额/限额\nquotation\t引用语/语录\nquote\t引用\nqv\tquivering颤抖/quod\nrabbi\t拉比/大师\nrabbit\t兔子\nrace\t种族/人种\nracer\t比赛者/游蛇属黑蛇\nrachel\t雷切尔\nracial\t人种的/种族的\nracially\t按人种/人种上\nracing\t赛马/赛车\nracism\t种族主义/种族偏见\nracist\t种族主义者\nrack\t架/行李架\nracket\t球拍/喧闹\nradar\t雷达/无线电探测器\nradial\t光线的/光线状的\nradiant\t发光的/明亮的\nradiate\t放射/散发\nradiation\t辐射\nradiator\t暖气装置/散热器\nradical\t激进分子/词根\nradically\t根本地/完全地\nradio\t无线电/收音机\nradioactive\t放射性的/有放射能的\nradioactivity\t放射性\nradish\t小萝卜\nradium\t镭\nradius\t半径/范围\nraf\t英国皇家空军\nraft\t筏/救生筏\nrag\t碎布/抹布\nrage\t愤怒/情绪激动\nragged\t衣衫褴褛的/参差不齐的\nraid\t袭击/突袭\nraider\t奇袭者/侵入者\nrail\t横杆/围栏\nrailing\t扶手/栏杆\nrailroad\t铁路/铁路公司\nrailway\t铁路/轨道\nrain\t雨/下雨\nrainbow\t彩虹\nraincoat\t雨衣\nrainfall\t降雨/降雨量\nrainy\t下雨的/多雨的\nraise\t上升/高地\nraised\t凸起的/浮雕的\nraisin\t葡萄干\nrake\t耙子/钱耙\nrally\t重振旗鼓/集合\nralph\t拉尔夫\nram\t公羊/撞锤\nramble\t漫步/随笔\nramp\t斜坡/坡道\nrampant\t猖獗的/蔓生的\nramsay\t拉姆齐(①姓氏②SirWilli\nranch\t大牧场\nrancher\t大农场经营者/牧场工人\nrandom\t随意/随机\nrandomly\t偶然/胡乱\nrange\t排/行\nranger\t王室守林人/骑警\nrank\t等级/排\nranking\t等级/地位\nrap\t轻敲/拍击\nrape\t抢夺/掠夺\nrapid\t迅速的/飞快的\nrapidity\t迅速/急速\nrapidly\t飞快地/迅速地\nrapist\t强奸犯\nrapper\t敲门人/控告人\nrapture\t兴高采烈/着迷\nrare\t稀罕的/罕有的\nrarely\t很少地/罕有地\nrarity\t稀罕/罕有\nrascal\t流氓/无赖\nrash\t轻率的/匆忙的\nraspberry\t悬钩子/呸声\nrat\t鼠/卑鄙的人\nrate\t比率/率\nrather\t宁可/稍微\nratify\t批准/认可\nrating\t等级/额定功率\nratio\t比/比率\nration\t定额/定量\nrational\t理性的/合理的\nrationale\t基本原理\nrationality\t合理性/纯理性\nrattle\t使嘎嘎响/喋喋不休地说\nraw\t擦伤处/半成品\nray\t光线/射线\nraymond\t雷蒙德\nrazor\t剃刀\nre\t关于\nreach\t伸出/延伸\nreact\t起反应/起作用\nreaction\t反应/反作用\nreactor\t反应者/反应器\nread\t读/阅读\nreader\t读者/读物\nreadily\t迅速地/轻易地\nreadiness\t预备/准备\nreading\t阅读/知识\nready\t预备好的状态/现款\nreaffirm\t重申/再确认\nreagan\t里根\nreal\t真的/真实的\nrealisation\t实现/完成\nrealise\t实现/认识到\nrealism\t写实主义/现实\nrealist\t现实主义者/写实主义者\nrealistic\t现实的/逼真的\nrealistically\t写实地/逼真地\nreality\t实在/事实\nrealization\t实现/领悟\nrealize\t了解/实现\nreally\t实际上/真实地\nrealm\t王国/领土\nreap\t收割/收获\nreappear\t再出现\nrear\t后面/背后\nrearrange\t再排列/重新整理\nreason\t理由/原因\nreasonable\t合理的/明理的\nreasonably\t适度地/相当地\nreasoning\t推论/推理\nreassurance\t安心/放心\nreassure\t使...安心/向...再保证\nreassuring\t安心的/可靠的\nrebecca\t丽贝卡\nrebel\t叛徒/反叛者\nrebellion\t谋反/叛乱\nrebound\t弹回/返回\nrebuild\t改建/重建\nrebuke\t指责/谴责\nrecall\t回忆/召回\nrecede\t向后退/退却\nreceipt\t收据/收入\nreceive\t收到/接到\nreceiver\t接收器/接受者\nrecent\t最近的/近代的\nrecently\t最近\nreception\t接待/接受\nreceptionist\t接待员\nreceptive\t能接纳的\nreceptor\t受体/感觉器官\nrecess\t休息/休会\nrecession\t后退/凹处\nrecipe\t食谱/处方\nrecipient\t领受的/容易接受的\nreciprocal\t互惠的/相互的\nrecite\t背诵/朗读\nreckless\t不介意的/大意的\nreckon\t计算/总计\nreclaim\t开垦/改造\nrecognisable\t可辨认的/可认识的\nrecognise\t认识/辩认\nrecognised\t承认/认出\nrecognition\t赞誉/认得\nrecognizable\t可认识的/可承认的\nrecognize\t认出/认可\nrecollect\t回忆/回想\nrecollection\t记忆/回想\nrecommend\t推荐/介绍\nrecommendation\t推荐/介绍\nrecommended\t被推荐的\nreconcile\t使和解/调停\nreconciliation\t和解/和好\nreconsider\t再考虑/重新考虑\nreconstruct\t重建/改造\nreconstruction\t改造/再建\nrecord\t记录/履历\nrecorded\t记录的\nrecorder\t记录员/录音机\nrecording\t记录的/记录用的\nrecount\t详述/叙述\nrecourse\t求援/求助\nrecover\t重新获得/恢复\nrecovery\t恢复/复原\nrecreation\t娱乐/消遣\nrecreational\t消遣的/娱乐的\nrecruit\t新兵/新手\nrecruiting\t招聘/吸收某人为新成员\nrecruitment\t新兵征召\nrectangle\t长方形/矩形\nrectangular\t成直角的\nrectify\t订正/矫正\nrector\t教区长/校长\nrecur\t复发/回到\nrecurrence\t再现/再发生\nrecurrent\t再发生的/定期重复的\nrecycle\t使再循环/重新利用\nrecycled\t回收利用/再利用\nred\t红的/红色的\nredeem\t赎回/挽回\nredefine\t重新定义\nredemption\t赎回/赎身\nredirect\t重新寄送/使改道\nreduce\t减少/分解\nreduced\t减少的/简化的\nreduction\t减少/缩影\nredundancy\t过多/冗长\nredundant\t多余的/过多的\nreed\t芦苇/芦笛\nreef\t暗礁/礁\nreel\t卷轴/一卷\nref\t裁判员\nrefer\t提交/归诸于\nreferee\t仲裁人/调解人\nreference\t参考/索引\nreferendum\t全民公决/全民投票\nreferral\t参照/介绍\nrefine\t精炼/净化\nrefined\t精炼的/优雅的\nrefinement\t精致/高尚\nrefinery\t精炼厂\nreflect\t反射/反映\nreflection\t反映/沉思\nreflective\t反射的/反映的\nreflux\t逆流/退潮\nreform\t改革/改正\nreformer\t改革家/改革运动者\nrefrain\t重复的话/叠句\nrefresh\t使清新/使恢复\nrefreshing\t使清爽的/有精神的\nrefreshment\t点心/起提神作用的事物\nrefreshments\t茶点/点心\nrefrigerate\t使冷却/使清凉\nrefrigerator\t电冰箱/冷藏库\nrefuge\t避难所/安全地带\nrefugee\t难民/流亡者\nrefusal\t拒绝/推却\nrefuse\t拒绝/谢绝\nrefute\t反驳/驳斥\nreg\t注册表文件/寄存器\nregain\t取回/恢复\nregard\t关心/注意\nregarding\t关于\nregardless\t不管/不注意\nregards\t问候/致意\nregenerate\t使再生/重建\nregeneration\t再生/重建\nregenerative\t再生的/更生的\nregent\t摄政者/摄政王\nregime\t政权/当权期间\nregimen\t养生法/常规强化训练课\nregiment\t团/大量\nregion\t区域/地带\nregional\t地方的/地域性的\nregister\t寄存器/记录\nregistered\t注册的/登记过的\nregistrar\t记录者/登记者\nregistration\t登记/挂号\nregistry\t登记处/登记名册\nregression\t退步/回归\nregret\t遗憾/后悔\nregular\t规则的/常例的\nregularity\t规则性/匀整\nregularly\t有规则地/一丝不苟地\nregulate\t管理/控制\nregulation\t规则/管理\nregulator\t调整者/校准者\nregulatory\t受控制的/统制的\nrehab\t修复\nrehabilitation\t复原\nrehearsal\t预演/排演\nrehearse\t预演/排演\nreich\t德国/德意志帝国\nreid\t里德\nreign\t为王/为君\nreimburse\t付还/偿还\nreimbursement\t付还/退还\nrein\t缰绳/统治\nreinforce\t加强/增援\nreinforcement\t加强/增援\nreinstate\t使复原/使恢复\nreinvent\t重新使用/彻底改造\nreiterate\t反复地说/重申\nreject\t被拒之人/被弃之物\nrejection\t拒绝/抛弃\nrejoice\t使欢喜\nrejoin\t使再结合/再加入\nrejuvenate\t使年轻/使复原\nrelate\t讲/叙述\nrelated\t讲述的/叙述的\nrelation\t关系/联系\nrelational\t有关系的/有联系的\nrelationship\t关系/关联\nrelative\t亲戚/关系词\nrelatively\t相对地/比较地\nrelativity\t有关系/相关性\nrelax\t放松/松懈\nrelaxation\t松弛/放松\nrelaxed\t松懈的/不严密的\nrelaxing\t令人轻松的\nrelay\t驿马/替班\nrelease\t释放/发泄\nrelegate\t驱逐/使降低地位\nrelegation\t驱逐/调职\nrelentless\t无情的/冷酷的\nrelevance\t中肯/关联\nrelevant\t有关联的/有关系的\nreliability\t信度/可靠性\nreliable\t可靠的/可信赖的\nreliance\t信任/信赖\nrelic\t遗物/遗迹\nrelief\t减轻/解除\nrelieve\t减轻/救济\nrelieved\t宽慰的/解除的\nreligion\t宗教/信仰\nreligious\t宗教性的/虔诚的\nrelinquish\t放弃/撤回\nrelish\t滋味/风味\nrelocate\t重新安置/再配置\nrelocation\t再布置/变换布置\nreluctance\t不情愿/勉强\nreluctant\t不情愿的/勉强的\nreluctantly\t不情愿地/勉强地\nrely\t信赖/依赖\nremain\t保持/逗留\nremainder\t剩余物/其他人\nremains\t剩余物/废墟\nremand\t遣回/还押\nremark\t评论/注意\nremarkable\t不平常的/值得注意的\nremarkably\t显著地/引人注目地\nremedy\t药物/治疗法\nremember\t记得/回忆起\nremind\t提醒/使想起\nreminder\t提醒的人/暗示\nreminiscent\t回忆的/怀旧的\nremnant\t剩余/零料\nremote\t遥远的/偏僻的\nremotely\t极小地/极细微地\nremoval\t移动/移居\nremove\t移动/调动\nremuneration\t报酬\nrenaissance\t复活/复兴\nrenal\t肾脏的/肾的\nrename\t重新命名/再命名\nrenault\t法国雷诺公司/雷诺\nrender\t回报/给于\nrenew\t使更新/使恢复\nrenewable\t可更新的/可恢复的\nrenewal\t更新/革新\nrenewed\t复兴的/更新的\nrenounce\t拒绝/放弃\nrenovate\t更新/革新\nrenovation\t革新/刷新\nrenowned\t有名的/有声誉的\nrent\t租金/房租\nrental\t租费/租金收入\nrented\t租用的\nreopen\t重开/再开始\nreorganisation\t重组\nrep\t棱纹平布/浪荡子\nrepair\t修理/补救\nrepairs\t备件/修理\nrepay\t偿还/报答\nrepayment\t付还/偿还\nrepeal\t废止/撤消\nrepeat\t重复/反复\nrepeated\t重复的/再三的\nrepeatedly\t重复地/再三地\nrepel\t逐退/抵制\nrepent\t后悔/懊悔\nrepertoire\t全部剧目/全部技能\nrepetition\t重复/背诵\nrepetitive\t重复的/反复性的\nreplace\t代替/替换\nreplacement\t归还/更换\nreplay\t重新比赛/重演\nreplica\t复制品\nreplicate\t折叠/折转\nreply\t答复/回答\nreport\t报告/报道\nreported\t报告的/据报道的\nreportedly\t根据传说/根据传闻\nreporter\t记者/报告者\nreporting\t报道\nrepresent\t表现/表示\nrepresentation\t表示法/表现\nrepresentative\t代表/众议员\nrepression\t抑制/压抑\nreprint\t再版/翻版\nreproach\t责备/耻辱\nreproduce\t繁殖/再生\nreproduction\t再现/复制\nreproductive\t生殖的/再生的\nreptile\t爬行动物/爬虫\nrepublic\t共和国/共和政体\nrepublican\t共和主义者/共和党员\nreputation\t名誉/名声\nrequest\t请求/需要\nrequire\t需要/命令\nrequired\t必需的\nrequirement\t需求/必要条件\nrequisite\t必需品/要素\nrescue\t援救/解救\nresearch\t研究/调查\nresearcher\t研究人员\nresemblance\t相似处/类似\nresemble\t相似/类似\nresent\t愤恨/憎恶\nresentment\t怨恨/愤恨\nreservation\t保留/预定\nreserve\t储备品/贮量\nreserved\t保留的/预备的\nreservior\t贮水池/贮藏处\nreservoir\t贮水池/贮藏处\nreshape\t改造/使成新的形状\nreshuffle\t重新洗牌/改组\nreside\t住/居留\nresidence\t住宅/居留\nresidency\t住处\nresident\t居民/常驻程序\nresidential\t住宅的/与居住有关的\nresidual\t残渣的/剩余的\nresidue\t残渣/剩余\nresign\t辞职/放弃\nresignation\t辞职/辞呈\nresist\t抵抗/耐得住\nresistance\t抵抗力/反抗\nresistant\t抵抗者/反抗者\nresolute\t果断的人\nresolution\t解析/决心\nresolve\t决定/分解\nresonance\t共鸣/回声\nresonate\t共鸣/共振\nresort\t度假胜地/手段\nresource\t资源/财力\nrespect\t尊敬/尊重\nrespectable\t值得尊重的/人格高尚的\nrespected\t受尊敬的\nrespectful\t表示尊敬的/有礼貌的\nrespective\t分别的/各自的\nrespectively\t各自地/独自地\nrespiratory\t呼吸的\nrespond\t以...回答\nrespondent\t回答的/应答的\nresponse\t反应/回答\nresponsibility\t责任/职责\nresponsible\t有责任的/负责的\nresponsive\t回答的/应答的\nrest\t休息/睡眠\nrestaurant\t餐馆/饭店\nrestless\t不安静的/慌张的\nrestoration\t恢复/归还\nrestore\t回复/恢复\nrestrain\t抑制/阻止\nrestraint\t抑制/克制\nrestrict\t限制/限定\nrestricted\t受限制的/有限的\nrestriction\t限制/限定\nrestrictive\t限制的/约束的\nrestructure\t更改结构/重建\nresult\t结果/成绩\nresultant\t结果的/合成的\nresume\t重新开始/取回\nresurrection\t复活/复兴\nretail\t零售\nretailer\t零售商人/传播的人\nretain\t保持/保有\nretaliation\t报复\nretard\t阻止/延迟\nretell\t再讲/重复\nretention\t保持/留置\nrethink\t再想/重想\nretire\t隐居\nretired\t隐退的/退休的\nretiree\t退休人员/退休者\nretirement\t退休/隐居\nretort\t反驳/顶嘴\nretreat\t休息寓所/撤退\nretrieval\t取回/恢复\nretrieve\t取回/挽回\nretrospect\t回顾/追忆\nretrospective\t回顾的/怀旧的\nreturn\t回来/返回\nreunion\t团圆/重聚\nreunite\t再联合\nreuse\t再使用\nreuter\t路透社/路透通讯社\nrev\t一次回转\nreveal\t露出/显示\nrevealing\t暴露的/显露的\nrevel\t作乐/狂欢\nrevelation\t揭露/泄露\nrevenge\t报仇/复仇\nrevenue\t收入/岁入\nreverend\t教士/大人\nreversal\t翻转/颠倒\nreverse\t相反/背面\nrevert\t恢复/复归\nreview\t检讨/复习\nreviewer\t评论者/书评作者\nrevise\t校订/修正\nrevised\t改进的\nrevision\t校订/修正\nrevisit\t再访/重游\nrevival\t复兴/复活\nrevive\t使苏醒/使复兴\nrevolt\t叛乱/反抗\nrevolution\t革命/大变革\nrevolutionary\t革命者/革命党人\nrevolve\t旋转/反复考虑\nreward\t报酬/酬谢\nrewarding\t有益的/有报酬的\nrewind\t重绕\nrewrite\t重写/改写\nrex\t雷克斯/国王\nreynolds\t雷诺兹\nrhetoric\t修辞/修辞学\nrhetorical\t修辞学的/符合修辞学的\nrhodes\t罗兹岛/罗兹市\nrhyme\t韵/押韵\nrhythm\t旋律/节奏\nrhythmic\t有韵律的/有节奏的\nrib\t肋骨/肋状物\nribbon\t缎带/色带\nrice\t米/米饭\nrich\t富裕的/富饶的\nrichard\t理查德\nrichards\t理查兹\nrichardson\t理查森\nriches\tpl.财富/财产\nrichly\t富裕地/丰富地\nrichmond\t里士满\nrichness\t富裕/丰富\nrick\t草堆\nricky\t里基（男子名/等于Rick\nrid\t免除/以...清除\nriddle\t谜/谜语\nride\t骑马/乘坐\nrider\t骑手/附件\nridge\t脊/山脊\nridicule\t嘲笑/愚弄\nridiculous\t荒谬的/可笑的\nrifle\t来复枪/步枪\nrift\t裂口/空隙\nrig\t装备/帆装\nright\t权利/右边\nrightly\t合适地/正当地\nrigid\t坚硬的/刚性的\nrigor\t严格/严厉\nrigorous\t严厉的/严酷的\nrigour\t严格/严厉\nrim\t边/轮缘\nring\t环/环形物\nrinse\t清洗/染发\nrio\t里约\nriot\t暴动/喧闹\nrip\t裂痕/破绽\nripe\t成熟的/熟练的\nripen\t使成熟\nripple\t涟波/涟漪\nrise\t上升/增加\nrising\t上升/造反\nrisk\t冒险/危险\nrisky\t危险的\nrite\t仪式/典礼\nritual\t仪式/典礼\nrival\t对手/竞争者\nrivalry\t竞争/对抗\nriver\t河/江\nroad\t路/道路\nroadside\t路旁/路边\nroam\t漫游/闲逛\nroar\t吼/咆哮\nroast\t烤肉/烘烤\nroasted\t烤的\nrob\t抢夺/抢掠\nrobber\t强盗/盗贼\nrobbery\t抢掠/抢夺\nrobbie\t罗比\nrobe\t宽松长袍/礼服\nroberts\t罗伯茨\nrobertson\t罗伯森\nrobin\t旅鸫\nrobinson\t罗宾逊\nrobot\t机械人/自动机械\nrobson\t罗布森街/罗伯森\nrobust\t健康的/强健的\nrobyn\t人名/罗宾\nrochester\t罗契斯特市/罗契斯特市\nrock\t岩石/岩礁\nrocker\t摇的人/摇杆\nrocket\t火箭/烟火\nrocky\t岩石的/多石的\nrod\t竿/笞鞭\nrodent\t咬的/啮齿类的\nroger\tinterj.对!/行!\nrogers\t罗杰斯/乐爵士\nrogue\t恶棍/流氓\nroland\t罗兰\nrole\t角色/职责\nroll\t卷/滚动\nroller\t滚筒/滚轴\nrolling\t旋转的/波动的\nrolls\t面包卷/捆\nroman\t罗马人\nromance\t冒险故事/浪漫史\nromania\t罗马尼亚\nromanian\t罗马尼亚人/罗马尼亚语\nromantic\t浪漫的/风流的\nrome\t罗马\nron\t研究法辛烷值\nronald\t罗纳德\nronni\t人名/(西\nronnie\t罗尼/罗妮\nroof\t屋顶/室顶\nrooftop\t屋顶\nrookie\t新手\nroom\t房间/空位\nroommate\t住在同室的人\nrooster\t公鸡/栖息的鸟\nroot\t根/根本\nrope\t绳/索\nrory\t罗里\nros\t只读存储器/活性氧\nrose\t玫瑰/蔷薇\nrosemary\t迷迭香\nrosie\t罗西\nross\t罗丝\nroster\t花名册\nrot\t腐烂/腐蚀\nrotary\t旋转的/轮流的\nrotate\t辐状的\nrotation\t旋转/循环\nrotor\t转子/旋筒\nrotten\t腐烂的/恶臭的\nrouble\t卢布\nrouge\t口红/胭脂\nrough\t粗糙的东西/毛坯\nroughly\t概略地/粗糙地\nround\t圆/圆形物\nroundabout\t迂回的/委婉的\nrounded\t圆形的/滚圆的\nrouse\t觉醒/奋起\nroute\t路径/途径\nroutine\t常规/日常工作\nroutinely\t日常/乏味\nrove\t徘徊/粗纺\nrover\t漂泊者/流浪者\nrow\t排/行\nroy\t罗伊\nroyal\t王室/皇族\nroyalty\t皇室/王族成员\nrub\t摩擦/困难\nrubber\t橡皮/橡胶\nrubbish\t废物/垃圾\nrubble\t粗石/碎砖\nruby\t红宝石/深红色\nruc\t北爱尔兰皇家骑警队\nrude\t粗鲁无礼的/粗陋的\nrug\t小块地毯/揭露某人\nrugby\t橄榄球/橄榄球赛\nrugged\t高低不平的/崎岖的\nruin\t毁灭/推翻\nrule\t规则/统治\nruler\t统治者/管理者\nruling\t判决/裁定\nrum\t朗姆酒\nrumble\t隆隆声/辘辘声\nrumor\t谣言/传闻\nrumour\t谣言/传闻\nrun\t跑/赛跑\nrunaway\t逃跑/逃走的人\nrunner\t跑步者/赛跑者\nrunning\t赛跑/流出\nrunoff\t径流/决赛\nrunway\t跑道/河床\nrupert\t鲁珀特\nrupture\t破裂/断裂\nrural\t乡下的/田园的\nrush\t匆促/冲进\nrussell\t拉塞尔\nrussia\t俄国/俄罗斯\nrussian\t俄国人/俄语\nrust\t锈/生锈\nrustic\t乡下人/乡巴佬\nrusty\t生锈的/腐蚀的\nruth\t怜悯/悲哀\nruthless\t无情的/残忍的\nryan\t赖安\nsa\t救世军/南非\nsabine\t萨宾人\nsack\t麻布袋/洗劫\nsacred\t神圣的/献给上帝的\nsacrifice\t牺牲/供奉\nsad\t忧愁的/悲哀的\nsaddam\t萨达姆\nsaddle\t鞍/马鞍\nsadly\t悲痛地/悲惨地\nsadness\t悲哀/悲伤\nsafe\t保险箱/冷藏室\nsafeguard\t保卫/保护措施\nsafely\t安全地/确实地\nsafety\t安全/保险\nsag\t下垂/倾斜\nsaga\t传说/英雄传奇\nsage\t圣人/哲人\nsaid\t上述的\nsail\t帆/篷\nsailing\t航行/航海术\nsailor\t水手/船员\nsainsbury\t塞恩斯伯里\nsaint\t圣徒/圣人\nsake\t目的/缘故\nsalad\t色拉\nsalary\t薪水\nsale\t出售/卖\nsales\t销售的\nsalesgirl\t女店员\nsalesman\t售货员/推销员\nsaleswoman\t女售货员/女店员\nsalient\t显著的/突出的\nsalisbury\t索尔兹伯里市\nsally\t突击/出击\nsalmon\t鲑鱼/大麻哈鱼\nsalon\t大会客室/大厅\nsaloon\t大厅/沙龙\nsalsa\t洋葱做的辣调味汁/萨尔萨舞曲\nsalt\t盐/风趣\nsalty\t有盐分的/咸味浓的\nsalute\t行礼/致意\nsalvage\t海上救助/抢救\nsalvation\t拯救/救助\nsame\t相同的/同样的\nsample\t样品/范例\nsamuel\t撒母耳/塞缪尔\nsan\t存储区域网\nsanction\t核准/制裁\nsanctuary\t圣所\nsand\t沙/沙子\nsandal\t凉鞋/拖鞋\nsandra\t桑德拉\nsandstone\t沙岩\nsandwich\t三明治/夹心面包\nsandy\t沙的/沙地的\nsane\t神智健全的/稳健的\nsanta\t圣诞老人\nsara\t萨拉族/萨拉人\nsarah\t萨拉\nsarajevo\t萨拉热窝\nsardine\t沙丁鱼\nsatellite\t人造卫星\nsatin\t缎子\nsatisfaction\t满足/满意\nsatisfactorily\t令人满意地\nsatisfactory\t满意的/赎罪的\nsatisfied\t感到满意的\nsatisfy\t使满意/满足\nsatisfying\t满意的/充分的\nsaturate\t使渗透/浸透\nsaturated\t饱和的/渗透的\nsaturation\t饱和/渗透\nsaturday\t星期六\nsaturn\t土星\nsauce\t酱油/调味汁\nsaucepan\t深平底锅/炖锅\nsaucer\t茶碟/茶托\nsaudi\t沙乌地阿拉伯的\nsausage\t香肠/腊肠\nsaut\t<法>n.跳[字面意义：leap\nsavage\t未开化的/野蛮的\nsave\t救球\nsaving\t存款/挽救\nsavior\t救助者/救世主\nsavor\t滋味/气味\nsavour\t滋味/气味\nsavvy\t理解/领悟\nsaw\t锯子/谚语\nsay\t说/讲\nsaying\t叙述/话\nscale\t刻度/衡量\nscalp\t剥头皮\nscam\t骗局/诡计\nscan\t审视/浏览\nscandal\t丑闻/中伤\nscandinavian\t斯堪的纳维亚人/斯堪的纳维亚语\nscanner\t扫描仪/扫描盘\nscant\t不充分的/不足的\nscar\t疤痕/伤痕\nscarborough\t士嘉堡/斯卡伯勒\nscarce\t难得的/稀罕的\nscarcely\t简直不/一定不\nscarcity\t缺乏/不足\nscare\t惊吓/恐慌\nscared\t害怕的/担惊受怕的\nscarf\t围巾/头巾\nscarlet\t猩红色/绯红色\nscary\t容易受惊的/胆小的\nscatter\t消散/分散\nscattered\t分散的/散乱的\nscenario\t剧本提纲/情节\nscene\t场/情景\nscenery\t风景/景色\nscenic\t风景好的/戏剧性的\nscent\t气味/香味\nsceptical\t怀疑论的/怀疑的\nscepticism\t怀疑论/怀疑主义\nschedule\t时间表/一览表\nscheduled\t预定的\nschema\t概要/图解\nscheme\t方案/计划\nscholar\t学者/奖学金获得者\nscholarly\t学者派头的/学者风度的\nscholarship\t学问/学术成就\nschool\t学校/鱼群\nschoolbag\t书包\nschoolboy\t男学生\nschooling\t学校教育/学费\nschoolmate\t同窗/同学\nscience\t科学/学科\nscientific\t科学的/系统的\nscientifically\t合乎科学地/学问上\nscientist\t科学家\nscissors\tpl.剪刀\nsco\t位置时间计数器/[计]一个常用的\nscoff\t嘲笑/愚弄\nscold\t好骂街的人/责骂\nscoop\t铲子/勺子\nscope\t范围/机会\nscorch\t烧焦/枯萎\nscore\t得分/抓痕\nscorer\t记录员/刻痕者\nscores\t大量/众多\nscorn\t轻蔑/藐视\nscot\t摊派的款项/税赋\nscotland\t苏格兰\nscots\t苏格兰的/苏格兰式的\nscotsman\t苏格兰人\nscott\t斯科特\nscottish\t苏格兰的/苏格兰人的\nscour\t擦亮/洗涤\nscout\t守候/侦察\nscramble\t攀缘/爬行\nscrap\t碎片/残余物\nscrape\t刮/擦\nscratch\t抓痕/搔\nscream\t尖叫声\nscreen\t幕/银幕\nscreenplay\t电影剧本\nscrew\t螺旋/螺杆\nscribble\t潦草的写法/潦草写成的东西\nscript\t手迹/手稿\nscripture\t圣经/圣经的一节\nscrub\t用力擦洗/矮树\nscrutinize\tvi.细看/仔细检查\nscrutiny\t细看/仔细检查\nsculptor\t雕刻家\nsculpture\t雕刻/雕塑\nscum\t浮渣/糟粕\nscurry\t急赶/急跑\nsea\t海/海洋\nseafood\t海味/海鲜\nseagull\t鸥\nseal\t印章/封条\nsealed\t未知的/密封的\nseam\t缝合线/衔接口\nseaman\t船员/海员\nsean\t肖恩\nseaport\t海港/港口城市\nsearch\t搜寻/查究\nseashell\t海贝壳\nseaside\t海边的/海滨的\nseason\t季节/时节\nseasonal\t季节的/依照季节的\nseasoned\t经验丰富的/老练的\nseasoning\t调味品/作料\nseat\t座/座位\nseating\t使就座/就座\nseaweed\t海草/海藻\nseb\t特警队/赛博\nsecond\t秒/瞬间\nsecondary\t中级的/中等的\nsecondhand\t间接获得的/旧的\nsecondly\t第二/其次\nsecrecy\t秘密/保密\nsecret\t秘密/机密\nsecretary\t秘书/书记\nsecretion\t分泌/分泌物\nsecretly\t秘密地/背地里\nsection\t区段/部分\nsector\t扇形/部门\nsecular\t修道院外的教士\nsecure\t无虑的/安心的\nsecurely\t安全地/安心地\nsecurity\t安全/安全性\nsedan\t轿车/轿子\nsedentary\t久坐的/坐惯的\nsediment\t沉淀物/沉积\nseduce\t唆使/怂恿\nseductive\t诱惑的/引人注意的\nsee\t看见/查看\nseed\t种子/籽\nseek\t寻求/寻找\nseeker\t搜索者/探求者\nseem\t象是/似乎\nseemingly\t看来似乎/表面上看来\nseep\t渗出/渗流\nsegment\t片段/部分\nsegregate\t分离的/被隔离的\nsegregation\t隔离/偏析\nseize\t抓住/逮捕\nseizure\t捕获/夺取\nseldom\t不常的/稀少的\nselect\t挑选出来的/极好的\nselected\t挑选出来的/精选的\nselection\t选择/选文\nselective\t选择的/选择性的\nselector\t选择者/选择器\nself\t自己/自我\nselfish\t自私的/利己主义的\nsell\t卖/背叛\nseller\t销售者\nselling\t卖的/销路好的\nsemantic\t语义的\nsemester\t学期\nsemicircle\t半圆形\nsemiconductor\t半导体\nsemifinal\t半决赛\nseminar\t研究班/专题讨论会\nseminary\t神学院/发源地\nseminate\t播种于/传播\nsenate\t参议院/立法机构\nsenator\t参议员/理事\nsend\t发送/使进入\nsenior\t年长者/资深者\nsensation\t感觉/轰动\nsensational\t使人感动的/非常好的\nsense\t感应/感觉\nsenseless\t无感觉的/无意识的\nsensibility\t感性/感觉\nsensible\t有感觉的/敏感的\nsensibly\t容易感知地/聪明地\nsensitive\t敏感的/易感的\nsensitivity\t敏感/灵敏度\nsensor\t传感器\nsensory\t知觉的/感觉的\nsentence\t句子/命题\nsentiment\t感情/感伤\nsentimental\t感伤的/感情用事的\nseparate\t独立件/抽印本\nseparately\t分开/不相连\nseparation\t分离/分居\nsept\t氏族\nseptember\t九月\nsequel\t继续/续集\nsequence\t序列/续发事件\nserbia\t塞尔维亚\nserbian\t塞尔维亚人的/塞尔维亚的\nserbs\t塞尔维亚人\nsergeant\t警察小队长/军士\nserial\t分期连载作品/连载小说\nseries\t串联/序列\nserious\t严肃的/认真的\nseriously\t严肃地/认真地\nseriousness\t严肃/认真\nsermon\t说教/启示\nserpent\t巨蛇座/蛇\nserum\t浆液/血清\nservant\t仆人/有用物\nserve\t可作...用/服务\nserver\t服伺者/上菜用具\nservice\t服务/贡献\nserving\t服务/招待\nsession\t期间/开庭期\nset\t日落/同伙\nsetback\t挫折/退步\nsetting\t环境/背景\nsettle\t有背长椅\nsettlement\t安顿/解决\nsettler\t移民者/解决者\nsetup\t装备/组织\nseven\t七/七个\nseventeen\t十七/十七个\nseventeenth\t第十七/十七分之一\nseventh\t第七/七分之一\nseventy\t七十/七十个\nsever\t切断/脱离\nseveral\t几个的/一些的\nsevere\t严格的/尖锐的\nseverely\t严格/尖锐\nseverity\t严格/朴素\nsevern\t塞汶河\nsew\t缝纫/缝合\nsewage\t脏水/污水\nsewer\t下水道/阴沟\nsewing\t缝制品/缝纫\nsex\t性别/性欲\nsexual\t性的/性别的\nsexuality\t性征/性行为\nsexually\t性别地/两性之间地\nsexy\t有性感的/色情的\nsh\tinterj.嘘\nshabby\t衣衫褴褛的/低劣的\nshack\t陋屋/棚屋\nshade\t荫/阴暗\nshadow\t阴影/荫\nshadowy\t有影的/暗黑的\nshady\t荫凉的/成荫的\nshaft\t轴/箭杆\nshah\t沙\nshake\t摇动/震动\nshakespeare\t莎士比亚\nshaky\t震动的/摇晃的\nshall\t将\nshallow\t水浅的地方/浅滩\nsham\t假/赝品\nshame\t羞耻/羞愧\nshameful\t可耻的/丢脸的\nshampoo\t洗头/洗发剂\nshanghai\t上海/浦东鸡\nshape\t形状/形态\nshaped\t成某种形状的/制成一定形状的\nshare\t部分/参与\nshared\t共享的\nshareholder\t股东\nshark\t鲨鱼/骗子\nsharon\t莎伦\nsharp\t半升音调/利刃\nsharpe\t夏普指数/夏普指标\nsharpen\t使尖锐/使敏捷\nsharpener\t研磨者/卷笔刀\nsharply\t锐利地/严厉地\nshatter\t碎片/粉碎\nshattered\t极度疲劳的/破碎的\nshave\t修面/刮胡子\nshaver\t修面的人/电动剃刀\nshaw\t杂木林\nshe\t她\nshear\t修剪/剪下的东西\nshed\t车棚/小屋\nsheep\t羊/胆小者\nsheer\t绝对的/全然的\nsheet\t床单/张\nsheffield\t谢菲尔德\nsheila\t姑娘/小姐\nshelf\t架子/搁板\nshell\t贝壳/壳\nshelley\t谢莉\nshelter\t庇护所/避难所\nsheltered\t受庇护的/受保护的\nshepherd\t牧羊人/牧羊犬\nsheriff\t郡治安官/县治安官\nsherry\t雪利酒/葡萄酒\nshetland\t设得兰群岛\nshield\t盾/防卫物\nshift\t变化/移动\nshiite\t什叶派教徒\nshilling\t先令\nshimmering\t闪闪发光/发微光\nshine\t光泽/阳光\nshining\t光亮的/华丽的\nshiny\t有光泽的/发光的\nship\t船/舰\nshipbuilding\t造船\nshipment\t装船/出货\nshipping\t装运/航行\nshipwreck\t遇难船/海难\nshirley\t雪莉\nshirt\t衬衫/内衣\nshit\t拉屎\nshiver\t颤抖/哆嗦\nshock\t震动/冲突\nshocked\t震撼的/震惊的\nshocking\t令人震惊的/极坏的\nshoe\t鞋/靴\nshoot\t射击/狩猎\nshooter\t射手/狩猎者\nshooting\t发射/猎场\nshop\t商店/工厂\nshopkeeper\t零售商/店主\nshopper\t购物者\nshopping\t买东西/购物\nshore\t海岸/海滨\nshoreline\t海岸线\nshort\t短的/近的\nshortage\t不足/缺乏\nshortcoming\t缺点/短处\nshortcut\t捷径/最短路线\nshorten\t弄短/缩短\nshortfall\t不足/不足量\nshorthand\t速记\nshortly\t不久/简短\nshorts\t短裤/男人的短衬裤\nshot\t发射/炮弹\nshotgun\t散弹猎枪/媒人\nshould\t应该/将要\nshoulder\t肩/肩膀\nshout\t呼喊/喊声\nshove\t推/挤\nshovel\t铲/铁铲\nshow\t显示/表现\nshowcase\t陈列橱\nshowdown\t摊牌/暴露\nshower\t阵雨/淋浴\nshowing\t显示/陈列\nshred\t碎布条/细片\nshrewd\t精明的/锐利的\nshrewsbury\t什鲁斯伯里[英国英格兰西部城市]\nshriek\t尖锐的响声\nshrill\t尖声\nshrimp\t虾/小虾\nshrine\t圣地/神龛\nshrink\t收缩/萎缩\nshropshire\t肉用羊/萨罗普羊\nshrub\t矮树/灌木\nshrug\t耸肩\nshudder\t战栗/发抖\nshuffle\t拖着脚走/曳步\nshun\t避开/规避\nshut\t关闭\nshutter\t百叶窗/关闭物\nshuttle\t穿梭/梭子\nshy\t惊跳/惊避\nsibling\t兄弟/同胞\nsic\t原文如此\nsick\t病人\nsickness\t疾病/不健康\nside\t旁边/侧\nsidebar\t其他选项/工具条\nsideline\t副业/旁线\nsidewalk\t人行道\nsideway\t小路/人行道\nsideways\t向旁边/向侧面地\nsiege\t包围/围攻\nsiemens\t西门子（财富500强公司之一/总\nsierra\t呈齿状起伏的山脉\nsift\t筛/过滤\nsigh\t叹息\nsight\t景观/视力\nsighting\t照准/瞄准\nsightseeing\t观光/游览\nsign\t符号/招牌\nsignal\t信号/暗号\nsignature\t签字/识别标志\nsignificance\t重要性/意义\nsignificant\t重要的/有效的\nsignificantly\t值得注目地/意味深长地\nsignify\t象征/预示\nsilas\t赛拉斯\nsilence\t沉默/无声\nsilent\t沉默的/安静的\nsilently\t默默地/静静地\nsilhouette\t黑色半身侧面影/影子\nsilicon\t硅\nsilk\t丝/绸\nsilly\t愚蠢的/糊涂的\nsilver\t银/银币\nsimilar\t相似的/类似的\nsimilarity\t类似/类似处\nsimilarly\t相像地/类似于\nsimmer\t煨\nsimon\t西蒙\nsimple\t简单的/普通的\nsimplicity\t单纯/简朴\nsimplify\t单一化/简单化\nsimplistic\t过分简单化的\nsimply\t简单地/只是\nsimpson\t辛普森\nsimulate\t模拟/假装\nsimulation\t模拟/假冒物\nsimultaneous\t同时的/同时发生的\nsimultaneously\t同时发生/一齐\nsin\t罪/犯罪\nsince\t自...以后/自...以来\nsincere\t诚实的/正直的\nsincerely\t真诚地\nsincerity\t诚实/真实\nsing\t唱/唱歌\nsingapore\t新加坡\nsinger\t歌手\nsingh\t辛格/查理·拉杰\nsinging\t歌唱/歌声\nsingle\t单身的/单程的\nsingular\t单数\nsinister\t不吉利的/凶恶的\nsink\t藏垢的场所/沟渠\nsinus\t窦/静脉窦\nsip\t啜饮/小口喝\nsir\t先生/阁下\nsiren\t女海妖/妖女\nsister\t姐妹/姐\nsit\t坐/就座\nsitcom\t情景喜剧\nsite\t位置/场所\nsitting\t入席/就坐\nsituate\t使位于/使处于\nsituated\t位于...的/坐落在...的\nsituation\t情形/境遇\nsix\t六/六个\nsixteen\t十六/十六个\nsixteenth\t第十六/十六分之一\nsixth\t第六/六分之一\nsixty\t六十/六十个\nsizable\t相当大的/大小相当的\nsize\t大小/尺寸\nsizeable\t相当大的/可观的\nskate\t溜冰/冰鞋\nskateboard\t溜冰板\nskater\t溜冰者\nskeleton\t骨骼/骨瘦如柴的人\nskeptic\t怀疑者/怀疑论者\nskeptical\t怀疑论的/怀疑的\nskepticism\t怀疑论\nsketch\t素描/草图\nski\t滑雪橇\nskier\t滑雪的人\nskiing\t滑雪运动/滑雪术\nskilful\t灵巧的/熟练的\nskill\t技术/技巧\nskilled\t熟练的\nskillet\t煮锅/长柄浅锅\nskillful\t熟练的/巧妙的\nskillfully\t巧妙地/精巧地\nskim\t撇取浮沫/略读\nskin\t皮肤/皮\nskinner\t皮商/剥皮工人\nskinny\t似皮的/极瘦的\nskip\t跳跃/跳读\nskipper\t船长/机长\nskirt\t裙子/下摆\nskull\t头盖骨/头脑\nsky\t天空/天色\nskyline\t天涯/地平线\nskyscraper\t摩天楼/三角形天帆\nslab\t平板/厚片\nslack\t松弛/松懈\nslam\t砰然声/猛然\nslander\t中伤/诽谤\nslang\t俚语\nslap\t掴/掌击\nslash\t猛砍/乱砍\nslate\t板岩/页岩\nslaughter\t残杀/屠杀\nslave\t奴隶/从动装置\nslavery\t奴隶的身分/奴隶状态\nsleek\t光滑的/油嘴滑舌的\nsleep\t睡眠/静止\nsleeping\t睡眠\nsleepy\t困乏的/欲睡的\nsleeve\t袖子/套管\nslender\t苗条的/纤弱的\nslice\t薄的切片/一部分\nsliced\t刨切的\nslick\t光滑的/熟练的\nslide\t滑/滑道\nsliding\t滑行的/变化的\nslight\t轻蔑/怠慢\nslightly\t些微地/苗条地\nslim\t瘦的/苗条的\nsling\t投石器/抛掷\nslip\t滑/滑行\nslipper\t拖鞋/制轮器\nslippery\t滑的/光滑的\nslit\t裂缝/投币口\nslogan\t呐喊声/标语\nslope\t倾斜/斜坡\nsloppy\t泥泞的/潮湿的\nslot\t水沟/细长孔\nslow\t慢的/缓慢的\nslowly\t慢慢地/迟缓地\nslum\t贫民窟\nslumber\t睡眠/麻木状态\nslump\t暴跌/垂头弯腰的姿态\nsly\t狡猾的/诡密的\nsmack\t风味/滋味\nsmall\t小的/少的\nsmart\t聪明的/漂亮的\nsmash\t打碎/粉碎\nsmear\t涂/擦上\nsmell\t味道/气味\nsmelly\t发臭的/有臭味的\nsmile\t微笑/喜色\nsmiling\t微笑的/欢快的\nsmith\t铁匠/金属品工匠\nsmog\t烟雾\nsmoke\t烟/雾气\nsmoker\t吸烟者/吸烟的人\nsmoking\t抽烟/冒烟\nsmoky\t冒烟的/满是烟的\nsmooth\t平滑的/平稳的\nsmoothly\t平滑地/流畅地\nsmuggle\t偷运/走私\nsnack\t小吃/点心\nsnag\t突出物/戳破处\nsnail\t蜗牛/行动迟缓的人\nsnake\t蛇/阴险的人\nsnap\t使突然中断/猛咬\nsnapshot\t快照/抽点打印\nsnatch\t抢夺/攫取\nsneak\t鬼鬼祟祟做事\nsneaker\t鬼鬼祟祟做事的人/卑鄙者\nsneakers\t胶底运动鞋\nsneer\t冷笑/嘲笑\nsneeze\t喷嚏\nsniff\t以鼻吸气/嗅\nsniper\t狙击兵\nsnob\t势利的人/假内行\nsnobbish\t自命不凡的/势利的\nsnooker\t彩色台球\nsnore\t鼾声/打鼾\nsnort\t喷着气弄响鼻子/轻蔑地哼\nsnow\t雪/积雪\nsnowball\t雪球/果味冰霜卷\nsnowman\t雪人\nsnowstorm\t暴风雪\nsnowy\t多雪的/雪的\nso\t如此/如是\nsoak\t浸/湿透\nsoap\t肥皂/阿谀\nsoar\t高扬/翱翔\nsoaring\t高飞的/翱翔的\nsob\t啜泣/呜咽\nsober\t未醉的/稳重的\nsoccer\t英式足球\nsocial\t社会的/群居的\nsocialism\t社会主义/社会主义运动\nsocialist\t社会主义者/社会党党员\nsocialization\t社会化/社会主义化\nsocialize\t使社会化/使社会主义化\nsocially\t在社会上/在社交上\nsocietal\t社会的\nsociety\t社会/社交界\nsocioeconomic\t社会经济学的\nsociological\t社会的/社会学的\nsociologist\t社会学家\nsociology\t社会学\nsock\t短袜/鞋垫\nsocket\t窝/穴\nsocks\t短袜/袜子\nsoda\t苏打/碳酸水\nsodium\t钠\nsofa\t沙发\nsoft\t软的/温和的\nsoftball\t垒球运动/垒球\nsoften\t变柔软/变柔和\nsoftly\t柔和地/静静地\nsoftness\t柔和/温柔\nsoftware\t软件\nsoil\t土壤/土地\nsolar\t太阳的/日光的\nsoldier\t军人/士兵\nsole\t脚掌/鞋底\nsolely\t仅仅/单独地\nsolemn\t严肃的/郑重的\nsolicit\t请求/乞求\nsolicitor\t律师/初级律师\nsolid\t固体\nsolidarity\t团结/团结一致\nsolidify\t凝固/团结\nsolitary\t独居者\nsolitude\t孤独/单独\nsolo\t独奏/独唱\nsoluble\t溶解的/可溶解的\nsolution\t解决/解答\nsolvable\t可以解的/可以解决的\nsolve\t解决/付给\nsolvent\t溶剂\nsolving\t解决\nsomalia\t索马里\nsomber\t昏暗的/阴天的\nsombre\t昏暗的/阴沉的\nsome\t一些/一部分\nsomebody\t了不起的人/大人物\nsomeday\t有一天\nsomehow\t不知何故\nsomeone\t有人/某人\nsomeplace\t在某处\nsomerset\t有衬垫的马鞍\nsomething\t某事/某物\nsometime\t以前的/某一时间的\nsometimes\t有时/时常\nsomewhat\t某物/几分\nsomewhere\t到某处/在某处\nson\t儿子/女婿\nsong\t歌/曲\nsony\t索尼\nsoon\t不久/早\nsooner\t抢先占有土地者/抢先而获得不正当\nsoothe\t缓和/使安静\nsoothing\t抚慰的/使人宽心的\nsophie\t索菲\nsophisticate\t久经世故的人/精于...之道的人\nsophisticated\t复杂的/久经世故的\nsophistication\t诡辩/老于世故\nsophomore\t二年级生\nsore\t悲伤的/痛的\nsorrow\t悲伤/哀惜\nsorrowful\t悲伤的\nsorry\t难过的/悲哀的\nsort\t种类/方式\nsotheby\t苏富比/索斯比（拍卖公司名\nsoul\t灵魂/心灵\nsound\t声音/语音\nsoundtrack\t声迹/声槽\nsoup\t汤/马力\nsour\t酸的/酸臭的\nsource\t来源/水源\nsouth\t南方/南\nsouthampton\t南安普敦\nsoutheast\t东南/东南地区\nsoutheastern\t东南方的\nsouthern\t南方人/男风\nsouthwards\t在南方\nsouthwest\t西南/西南方\nsouthwestern\t西南的/向西南的\nsouvenir\t纪念品\nsouvenirs\t纪念品\nsovereign\t元首/独立国\nsovereignty\t主权/独立国\nsoviet\t代表会议/苏维埃\nsow\t母猪/懒胖女人\nsoy\t酱油/大豆\nsoybean\t大豆\nspa\t矿泉/温泉浴场\nspace\t位置/空间\nspacecraft\t航天飞船\nspaceship\t宇宙飞船\nspacious\t广大的/宽广的\nspade\t铲子/锄\nspaghetti\t意大利面条\nspain\t西班牙\nspan\t指距/全长\nspaniard\t西班牙人\nspanish\t西班牙人/西班牙语\nsparc\tSUN公司的工作站系统\nspare\t剩余/备用品\nspark\t火花/火星\nsparkle\t闪耀/火花\nsparkling\t闪闪发光的/闪烁的\nsparrow\t麻雀\nsparse\t稀疏的/稀稀落落的\nspatial\t空间的/受空间条件限制的\nspawn\t卵/产物\nspeak\t说/说话\nspeaker\t说话人/讲演者\nspear\t矛/枪\nspecial\t专辑/专车\nspecialise\t特加指明/列举\nspecialised\t专门的/特别的\nspecialist\t专门医师/专家\nspeciality\t专长/擅长\nspecialize\t使特殊化/列举\nspecialized\t专门的/特别的\nspecially\t特别地/专门地\nspecialty\t专业/专长\nspecies\t种/类\nspecific\t特效药/特性\nspecifically\t特定地/明确地\nspecification\t规格/详述\nspecificity\t特异性/专一性\nspecified\t规定的/详细说明的\nspecify\t详列/指定\nspecimen\t样品/标本\nspectacle\t引人羡慕的东西/景象\nspectacular\t公开展示的/惊人的\nspectator\t观众/目击者\nspectrum\t光谱/范围\nspeculate\t深思/推测\nspeculation\t沉思/推测\nspeculative\t思索性的/投机的\nspeech\t演讲/说话\nspeed\t速率/速度\nspeedy\t快的/迅速的\nspell\t符咒/魅力\nspelling\t拼/拼字\nspencer\t针织短外衣/斜桁纵帆\nspend\t花费/浪费\nspending\t经费/开销\nsperm\t精液/精虫\nsphere\t球/球面\nspherical\t球的/球面的\nspice\t香料/药料\nspicy\t香的/多香料的\nspider\t蜘蛛/设圈套者\nspike\t长钉/鞋钉\nspill\t溢出/溅出\nspin\t旋转/自旋\nspinach\t菠菜/货币\nspinal\t针的/尖刺的\nspine\t背骨/脊柱\nspiral\t螺旋形之物/螺线\nspirit\t精神/心灵\nspiritual\t精神上的/神圣的\nspirituality\t精神性/灵性\nspit\t唾液/唾吐\nspite\t恶意/怨恨\nsplash\t飞溅/污点\nsplendid\t光亮的/了不起的\nsplendour\t光辉/壮丽\nsplit\t劈开/裂片\nspoil\t战利品/赃物\nspoken\t口头讲的/口语的\nspokesman\t发言人/代言者\nspokesperson\t发言人/代言人\nspokeswoman\t女发言人/女代言人\nsponge\t海绵/海绵状的东西\nsponsor\t保证人/赞助者\nsponsored\t赞助/资助\nsponsorship\t发起/倡议\nspontaneous\t自然的/自发的\nspontaneously\t自发/一时冲动\nspoon\t匙/调羹\nspoonful\t一匙\nsport\t运动/游戏\nsporting\t喜好运动的/运动用的\nsportsman\t运动员/冒险家\nspot\t污点/地点\nspotlight\t照明灯/反光灯\nspouse\t配偶\nspr\t心灵研究学会/战略石油储备\nsprawl\t伸开手足躺/爬行\nsprawling\t蔓生的/不规则地伸展的\nspray\t水沫/浪花\nspread\t传播/散布\nspreadsheet\t空白表格程序/电子制表软件\nspring\t春天/弹簧\nspringtime\t春天/春季\nsprinkle\t洒/散置\nsprint\t短距离赛跑\nsprout\t芽/萌芽\nspur\t马刺/刺激物\nspy\t间谍/侦探\nsquad\t班/小队\nsquadron\t骑兵营/分遣队\nsquare\t正方形/街区\nsquarely\t干脆地/正好\nsquash\t挤压/压碎的东西\nsquat\t蹲/窝\nsqueeze\t紧握/挤\nsquid\t枪乌贼/鱿鱼\nsquint\t斜视眼/斜着\nsquire\t乡绅/大地主\nsquirrel\t松鼠/松鼠毛皮\nsri\t斯里兰卡/神圣罗马帝国\nssr\t苏维埃社会主义共和国/二次监视雷\nstab\t刺/戳\nstability\t安定/稳定性\nstabilize\t使安定/使稳固\nstable\t马房/牛棚\nstack\t堆叠/堆\nstadium\t露天大型运动场\nstaff\t全体人员/工作班子\nstaffer\t职员\nstage\t阶段/舞台\nstagger\t蹒跚/踌躇\nstaggering\t蹒跚的/巨大的\nstain\t污染/污点\nstained\t沾污的/褪色的\nstainless\t无瑕疵的/不锈的\nstair\t梯级/楼梯\nstaircase\t楼梯/梯子\nstairs\t楼梯\nstairway\t楼梯/阶梯\nstake\t桩/炮烙刑\nstale\t尿\nstalin\t斯大林\nstalk\t茎/追踪\nstall\t厩/停车处\nstamford\t斯坦福德\nstamina\t精力/活力\nstammer\t口吃/结结巴巴地说\nstamp\t印/邮票\nstan\t斯坦\nstance\t准备击球姿势/站立的姿势\nstand\t站立/站住\nstandard\t标准/规格\nstandardize\t使标准化/使合于标准\nstandardized\t标准化的/标准的\nstanding\t起立/持续\nstandpoint\t立场/观点\nstanley\t斯坦利\nstaple\t主要产物/常用品\nstar\t星/恒星\nstare\t注视/凝视\nstark\t僵硬的/完全的\nstart\t惊起/出发\nstarter\t开端者/在起跑线上的人\nstarting\t开端/开始\nstartle\t惊愕/惊恐\nstartled\t震惊\nstartling\t令人吃惊的\nstarvation\t饥饿/饿死\nstarve\t饿死/挨饿\nstarving\t挨饿的/饥饿的\nstate\t州/状态\nstated\t决定了的/一定的\nstately\t庄严的/宏伟的\nstatement\t陈述/指令\nstates\t美国\nstatesman\t政治家\nstatewide\t全州的/遍及全州的\nstatic\t静电/静电干扰\nstation\t车站/站\nstationary\t不动的/静止的\nstationery\t文具/信纸\nstatistic\t统计量\nstatistical\t统计的/统计上的\nstatistically\t用统计的方法/统计学上\nstatistics\t统计学/统计资料\nstatue\t以雕像装饰\nstature\t身材/身高\nstatus\t状态/情形\nstatute\t法令/成文法律\nstatutory\t法令的/法定的\nstay\t停留/逗留\nsteadily\t稳定地/无变化地\nsteady\t稳定的/不动摇的\nsteak\t牛排/鱼排\nsteal\t剽窃/偷偷地做\nsteam\t蒸汽/精力\nsteamer\t汽船/蒸汽机\nsteel\t钢/钢制品\nsteep\t浸渍/悬崖\nsteer\t引导/驾驶\nsteering\t掌舵/操纵\nstellar\t星的/似星的\nstem\t茎/干\nstep\t步骤/步\nstepfather\t继父\nstephen\t斯蒂芬\nstereo\t铅版/立体照片\nstereotype\t铅版/陈规\nsterile\t不毛的/不孕的\nsterling\t英国货币/标准纯银\nstern\t尾部/船尾\nsteroids\t类固醇\nsteve\t史蒂夫\nsteven\t史蒂文\nstevens\t史蒂文斯\nstevenson\t史蒂文森\nstew\t炖/烦恼\nsteward\t管理人/招待员\nstewardess\t空中小姐/女管理人\nstewart\t斯图尔特\nstick\t棍/棒\nsticker\t屠夫/尖刀\nsticky\t粘的/有粘性的\nstiff\t坚硬的/严厉的\nstiffen\t使变硬/使僵硬\nstiffly\t呆板地/顽固地\nstiffness\t坚硬/呆板\nstifle\t使窒息/抑止\nstigma\t耻辱/污名\nstill\t蒸馏室/寂静\nstillness\t静止/沉静\nstimulate\t刺激/激励\nstimulating\t刺激的/有刺激性的\nstimulation\t刺激/激励\nstimulus\t刺激/激励\nsting\t叮/刺痛\nstink\t臭味/臭气\nstint\t节省/限制\nstipulate\t规定/保证\nstir\t骚动/轰动\nstirling\t斯特灵\nstitch\t一针/疼痛\nstock\t树干/祖先\nstockholder\t股东\nstocking\t长袜\nstockton\t斯托克顿市\nstoke\t司炉/大吃\nstolen\tsteal的过去分词\nstomach\t胃/食欲\nstomachache\t胃痛/肚子痛\nstomp\t跺脚\nstone\t石头/宝石\nstony\t多石的/无情的\nstool\t凳子/大便\nstoop\t佝偻/屈从\nstop\t停止/车站\nstopwatch\t计时表/码表\nstorage\t存储器/储藏\nstore\t商店/贮藏\nstorey\t楼/楼层\nstorm\t暴风雨/骚动\nstormy\t暴风雨的/粗暴的\nstory\t故事/小说\nstoryteller\t说故事的人/故事作者\nstorytelling\t说故事/说谎话\nstout\t结实的/矮胖的\nstove\t火炉/窑\nstraddle\t跨坐/观望\nstraight\t直线/直\nstraighten\t弄直/整顿\nstraightforward\t笔直的/率直的\nstrain\t紧张/拉紧\nstrait\t海峡/困境\nstrand\t股/绳\nstrange\t奇怪的/陌生的\nstrangely\t奇妙地/奇怪地\nstranger\t陌生人/门外汉\nstrangle\t勒死/扼死\nstrangler\t扼杀者/压制者\nstrap\t带/皮带\nstrategic\t战略的/战略上的\nstrategist\t战略家\nstrategy\t战略/策略\nstratford\t斯特拉特福德\nstrathclyde\t斯特拉思克莱德区[英国苏格兰行政\nstratum\t层/地层\nstraw\t稻草/麦管\nstrawberry\t草莓\nstray\t走失的家畜/浪子\nstreak\t条理/斑纹\nstream\t水流/小河\nstreamline\t流线/流线型\nstreet\t街道/马路\nstrength\t力量/实力\nstrengthen\t加强/变坚固\nstress\t压力/紧迫\nstressful\t着重/强调\nstretch\t伸展/张开\nstrew\t散播/撒满\nstrict\t严厉的/绝对的\nstrictly\t严格地/确实地\nstride\t大步/步幅\nstrife\t争吵/竞争\nstrike\t罢工/打击\nstriker\t打击者/罢工者\nstriking\t醒目的/惊人的\nstring\t线/细绳\nstringent\t迫切的/严厉的\nstrip\t长条/条状\nstripe\t斑纹/条纹\nstriped\t有斑纹的\nstrive\t努力/奋斗\nstroke\t笔划/打\nstroll\t闲逛/漫步\nstrong\t强壮的/坚固的\nstrongly\t强有力地/坚强地\nstructural\t结构的/建筑的\nstructure\t结构/构造\nstructured\t有结构的\nstruggle\t斗争/努力\nstruggling\t努力的/奋斗的\nstuart\t英国斯图亚特王室/斯图尔特（男子\nstubborn\t顽固的/不听话的\nstuck\tstick的过去式和过去分词\nstud\t装饰钮扣/大头钉\nstudent\t学生/研究者\nstudio\t工作室/画室\nstudy\t学习/研究\nstuff\t原料/要素\nstuffed\t已经喂饱了的/塞满了的\nstuffy\t闷热的/窒息的\nstumble\t绊倒/蹒跚而行\nstump\t残株/树桩\nstun\t使昏迷/使震惊\nstunned\t受惊的\nstunning\t打昏迷的/弄得人昏头昏脑的\nstunt\t特技/绝技\nstupid\t愚蠢的/麻木的\nsturdy\t强健的/健全的\nstyle\t风格/时尚\nstylish\t现代风格的/流行的\nstylistic\t格式上的/体裁上的\nsub\t补充人员/部下\nsubcommittee\t小组委员会\nsubdivide\tvi.再分/细分\nsubdivision\t细分/分部\nsubdue\t使服从/压制\nsubdued\t屈服的/被抑制的\nsubject\t科目/主题\nsubjective\t主观的/个人的\nsubmarine\t潜水艇/海底生物\nsubmerge\t使浸水/使陷入\nsubmission\t屈服/服从\nsubmit\t使服从/使受到\nsubordinate\t属下/附属物\nsubscale\t内部[扩散]氧化物\nsubscribe\t捐献/签署\nsubscriber\t签署者/捐献者\nsubscript\t下标的/写在底下的\nsubscription\t捐献/订金\nsubsection\t分部/分区\nsubsequent\t后来的/接下去的\nsubsequently\t后来/随后\nsubside\t沉淀/沉降\nsubsidiary\t子公司/附件\nsubsidize\t补助/资助\nsubsidy\t补助金/津贴\nsubsistence\t生存/生活\nsubstance\t物质/实质\nsubstantial\t重要材料/有实际价值的东西\nsubstantially\t实质上/本质上\nsubstantive\t表示实在的/有实质的\nsubstitute\t代理/代理人\nsubstitution\t代替/替换\nsubtle\t敏锐的/精细的\nsubtlety\t微妙/精明\nsubtly\t敏锐地/巧妙地\nsubtract\t减去/扣掉\nsubtraction\t减少\nsuburb\t市郊住宅区/郊区\nsuburban\t郊外的/郊区的\nsubway\t地铁/地道\nsucceed\t成功/继承\nsuccess\t成功/成就\nsuccessful\t成功的/一帆风顺的\nsuccessfully\t成功/结果良好\nsuccession\t连续/继承权\nsuccessive\t继承的/连续的\nsuccessor\t继承者/接任者\nsuccumb\t屈从/屈服\nsuch\t如此的/这样的\nsuck\t吸/吮\nsucker\t乳儿/吸管\nsudan\t苏丹\nsudden\t突然/忽然\nsuddenly\t突然/意外\nsue\t控告/起诉\nsuffer\t遭受/经历\nsufferer\t受难者/被害者\nsuffering\t苦难/受苦\nsuffice\t足够/有能力\nsufficient\t充分的/足够的\nsufficiently\t足够/充分\nsuffolk\t萨福克/萨克福马\nsugar\t糖/糖块\nsuggest\t提议/建议\nsuggested\t建议的/暗示的\nsuggestion\t提议/意见\nsuicidal\t自杀的/自杀性的\nsuicide\t自杀/自杀者\nsuit\t套装/诉讼\nsuitability\t适合/适当\nsuitable\t适当的/相配的\nsuitably\t合适地/适当地\nsuitcase\t手提箱\nsuite\t随员/套房\nsulfur\t硫/硫磺\nsullen\t愠怒的/沉闷的\nsulphur\t硫/硫磺\nsum\t总数/总和\nsummarise\t概括/总结\nsummarize\t概述/总结\nsummary\t摘要/概要\nsummat\t<英><方>某事/某物\nsummer\t夏季/全盛时期\nsummit\t顶点/最高阶层\nsummon\t召唤/召集\nsummons\t召唤/传唤\nsun\t太阳/日\nsunburnt\t晒黑的/有晒斑的\nsunday\t星期日\nsunderland\t森德兰[英国英格兰东北部港市]\nsunglasses\t太阳镜/墨镜\nsunlight\t日光\nsunni\t〈伊斯兰〉逊尼派教徒\nsunny\t阳光充足的/乐观的\nsunrise\t日出/黎明\nsunscreen\t遮光剂\nsunset\t日落/晚年\nsunshine\t阳光/光明\nsuper\t跑龙套角色/冗员\nsuperb\t极度的/华丽的\nsuperbly\t雄伟地/壮丽地\nsuperficial\t表面/外表\nsuperficially\t表面/表面性\nsuperintendent\t监督人/主管人\nsuperior\t长者/占优势的人\nsuperiority\t优越/高傲\nsuperman\t具有超人能力的人/超人\nsupermarket\t超级市场\nsupernatural\t超自然的/神奇的\nsupernova\t超新星\nsuperpower\t超级强权/超级大国\nsupersede\t代替/取代\nsupersonic\t超声波的\nsuperstar\t超级明星\nsuperstition\t迷信\nsupervise\t监督/管理\nsupervision\t监督/管理\nsupervisor\t管理者/监督者\nsupper\t晚餐\nsupplement\t补充物/增刊\nsupplementary\t补足的/补充的\nsupplier\t供应者/供给国\nsupply\t补给/供给\nsupport\t支持/支撑\nsupporter\t支持者/后盾\nsupporting\t次要的/支持的\nsupportive\t支撑/支承\nsuppose\t推想/假设\nsupposed\t想象上的/假定的\nsupposedly\t想象上/看上去像\nsuppress\t镇压/使止住\nsuppression\t抑压/镇压\nsupremacy\t至高无上/霸权地位\nsupreme\t至高/霸权\nsure\t确信/必然的\nsurely\t的确地/安全地\nsurf\t海浪/拍岸浪\nsurface\t面/表面\nsurge\t巨涌/汹涌\nsurgeon\t外科医生/军医\nsurgery\t外科/手术\nsurgical\t外科的/外科医生的\nsurname\t姓/别号\nsurpass\t超越/凌驾\nsurplus\t剩余/过剩\nsurprise\t惊奇/奇袭\nsurprised\t感到惊讶的\nsurprising\t令人惊讶的\nsurprisingly\t使人惊奇/出人意外\nsurrender\t交出/放弃\nsurrey\t四轮双座轻便游览马车\nsurrogate\t替代者/代用品\nsurround\t包围/环绕\nsurrounding\t环境\nsurroundings\t环境/周围的事物\nsurveillance\t监视/监督\nsurvey\t纵览/视察\nsurveyor\t测量员/检验员\nsurvival\t生存/残存\nsurvive\t比...活得长/生存\nsurvivor\t生还者/幸存者\nsusan\t苏珊\nsusceptible\t易受影响的/易感动的\nsuspect\t被怀疑者/嫌疑犯\nsuspected\t有嫌疑的\nsuspend\t悬/吊\nsuspended\t悬浮的/暂停的\nsuspension\t悬挂/暂停\nsuspicion\t怀疑/觉察\nsuspicious\t可疑的/多疑的\nsussex\t苏塞克斯\nsustain\t承受/支持\nsustainability\t持续性/能维持性\nsustainable\t足可支撑的/养得起的\nsustained\t持续的/持久不变的\nsutherland\t萨瑟兰郡/萨瑟兰\nsutton\t萨顿\nswallow\t燕子/吞咽\nswamp\t沼泽/进退两难的困境\nswan\t天鹅/天鹅星座\nswansea\t斯温西\nswap\t以货易货\nswarm\t群/大群\nsway\t摇摆/影响力\nswear\t发誓/咒骂\nsweat\t汗/汗水\nsweater\t毛衣/毛线衫\nsweaty\t出汗的/吃力的\nsweden\t瑞典\nswedish\t瑞典人/瑞典语\nsweep\t扫除/打扫\nsweeping\t扫除/垃圾\nsweet\t甜蜜/糖果\nsweeten\t使变甜/加糖于\nsweetheart\t心上人/爱人\nsweetness\t甜蜜/芳香\nswell\t增大/隆起的部分\nswelling\t肿胀/肿大\nswift\t褐雨燕/快速爬行的小蜥蜴\nswiftly\t很快地/即刻\nswim\t游泳/漂浮\nswimmer\t游泳者\nswimming\t游泳/眩晕\nswindon\t史云顿\nswing\t摇摆/振幅\nswirl\t漩涡/涡动\nswiss\t瑞士人/瑞士腔调\nswitch\t开关/电闸\nswitzerland\t瑞士\nswollen\t肿大的/涨水的\nswoop\t俯冲/攫取\nsword\t刀/剑\nsydney\t悉尼\nsyllable\t音节\nsyllabus\t摘要/提纲\nsymbol\t符号/象征\nsymbolic\t象征的/符号的\nsymbolism\t象征主义/符号论\nsymbolize\t符号化/用符号表现\nsymmetrical\t对称的/匀称的\nsymmetry\t对称/匀称\nsympathetic\t有同情心的/合意的\nsympathize\t同情/怜悯\nsympathy\t同情/赞同\nsymphony\t交响乐/交响曲\nsymposium\t讨论会/座谈会\nsymptom\t症状/征候\nsynagogue\t犹太人集会/犹太教会堂\nsyndrome\t并发症状/综合征\nsyntactic\t句法的/句法上的\nsyntax\t句法/语法\nsynthesis\t综合/组织\nsynthesize\t综合/合成\nsynthetic\t合成物质\nsyria\t叙利亚\nsyrian\t叙利亚人/叙利亚语\nsyrup\t糖浆/果汁\nsystem\t系统/体系\nsystematic\t有系统的/分类上的\nsystematical\t有系统的/成体系的\nsystematically\t有系统地/有组织地\nsystemic\t系统的/体系的\nta\tinterj.谢谢\ntab\t制表/搭襻\ntable\t桌子/餐桌\ntablespoon\t大汤匙\ntablet\t平板/门牌\ntabloid\t小报/小型画报\ntabulate\t作成表/作成一览表\ntack\t平头钉/大头钉\ntackle\t工具/复滑车\ntact\t机智/手法\ntactic\t一项战术/一条策略\ntactical\t战术的/用兵上的\ntactics\t用兵学/战术\ntag\t标签/附属物\ntail\t尾部/后部\ntailor\t裁缝/成衣匠\ntaiwan\t台湾\ntake\t拿/取\ntakeover\t接管/接收\ntaking\t取得/捕获\ntalbot\t塔尔博特提猎狗\ntale\t故事/谎言\ntalent\t天才/才能\ntalented\t天资高的/有才能的\ntaliban\t塔利班\ntalk\t谈话/交谈\ntalking\t说话的/多嘴的\ntall\t高的/长的\ntame\t驯服的/柔顺的\ntan\t黄褐色/鞣料\ntangible\t可触知的东西/有形资产\ntangle\t缠结/纠结的一团\ntangled\t纠缠的/紊乱的\ntank\t槽/箱\ntanker\t坦克手/油船\ntap\t轻打/水龙头\ntape\t带子/录音带\ntaper\t带子操作工/小蜡烛\ntar\t焦油/柏油\ntarget\t目标/靶子\ntariff\t关税/关税表\ntarmac\t柏油碎石/柏油碎石路\ntart\t酸的/辛辣的\ntask\t工作/任务\ntaste\t味道/品味\ntasteless\t没味道的/无鉴赏力的\ntasty\t好吃的/可口的\ntate\t塔特\ntattoo\t归营号/连续有节奏的敲击\ntavern\t酒馆/客栈\ntax\t税/税款\ntaxation\t课税/征税\ntaxi\t出租车\ntaxpayer\t纳税人\ntaylor\t泰勒\ntea\t茶/茶叶\nteach\t教/讲授\nteacher\t教师/老师\nteaching\t教学/学说\nteam\t队/组\nteammate\t队友\nteamwork\t协同作业/协力\nteapot\t茶壶\ntear\t泪滴/眼泪\ntease\t揶揄/戏弄\nteaspoon\t茶匙\ntech\t技术学院或学校\ntechnical\t技术上的/专门的\ntechnically\t技术上/学术上\ntechnician\t技师\ntechnique\t技巧/技术\ntechnological\t技术的\ntechnology\t技术/工业技术\nted\t翻晒\ntedious\t沉闷的/冗长乏味的\ntee\tT字形/T字形之物\nteen\t愤怒/悲哀\nteenage\t十三岁到十九岁的\nteenager\t十三岁到十九岁的少年\nteesside\t蒂赛德\ntel\t试验仪器清单\ntelecom\ttelecommunicatio\ntelecommunication\t电讯/远距离通讯\ntelecommunications\t电信/通讯\ntelegram\t电报/一封电报\ntelegraph\t电报/电报机\ntelephone\t电话/电话机\ntelescope\t望远镜\ntelevised\t由电视播送/电视拍摄\ntelevision\t电视\ntelex\t用户直通电报/电传打字机\ntell\t告诉/说\ntelly\t电视\ntemper\t硬度/脾气\ntemperament\t气质/性格\ntemperature\t温度/发烧\ntemplate\t样板/模板\ntemple\t圣堂/庙宇\ntempo\t速度/节奏\ntemporal\t时间的/暂时的\ntemporarily\t暂时/一时\ntemporary\t暂时的/临时的\ntempt\t诱惑/引诱\ntemptation\t诱惑/诱惑物\ntempting\t诱惑人的/吸引人的\nten\t十/十个\ntenable\t可守的/站得住的\ntenancy\t租用/租赁\ntenant\t承租人/房客\ntend\t走向/有某种的倾向\ntendency\t趋向/倾向\ntender\t嫩的/柔软的\ntenet\t信条/教义\ntennis\t网球\ntenor\t稳定的进程/思路\ntense\t紧张的/拉紧的\ntensile\t可拉长的/可伸长的\ntension\t紧张/不安\ntent\t帐篷/帷幕\ntentacle\t触须/触手\ntentative\t试验\ntentatively\t试验性地/暂时地\ntenth\t第十/十分之一\ntenure\t享有/保有期\nter\t领土/梯田\nterm\t术语/专有名词\nterminal\t终端机/终点\nterminate\t有结尾的/结束的\ntermination\t终止/结束\nterminology\t术语/术语学\nterms\t条件/条款\nterrace\t阶地/梯田\nterraced\t阶地的/有平台的\nterrain\t地带/地区\nterrestrial\t地球上的人\nterrible\t可怕的/令人恐惧的\nterribly\t可怕地/甚为\nterrific\t非常好的/极端的\nterrified\t受惊吓的/感到恐惧的\nterrify\t使恐惧/恐吓\nterrifying\t令人恐惧的/骇人的\nterritorial\t领土的/土地的\nterritory\t领土/领地\nterror\t恐怖/可怕的人\nterrorism\t恐怖主义/恐怖统治\nterrorist\t恐怖分子\nterry\t毛圈/毛圈织物\ntesco\t特斯科\ntest\t测试/试验\ntestament\t遗嘱/<<圣约书>>\ntester\t考试人/做试验者\ntestify\t证明/作证\ntestimony\t证言/证据\ntesting\t测试\ntexan\t得克萨斯州的\ntexas\t德克萨斯\ntext\t文本/正文\ntextbook\t教科书\ntextile\t纺织品/纺织业\ntextual\t文本的/原文的\ntexture\t密度/结构\ntha\t总碳氢分析器/泰国\nthai\t泰国人/泰语\nthailand\t泰国\nthames\t泰晤士河\nthan\t比/除...外\nthank\t谢意/感谢\nthankful\t感谢的/感激的\nthankfully\t感激地/感谢地\nthanks\t感谢/谢意\nthanksgiving\t感谢\nthat\t那/那个\nthatcher\t盖屋顶者\nthe\t那\ntheater\t戏院/电影院\ntheatre\t戏院/电影院\ntheatrical\t剧场的/夸张的\ntheda\t西达\ntheft\t盗窃/失窃\ntheir\t他们的\ntheirs\t他们的\nthem\t他们/她们\ntheme\t主题/话题\nthemselves\t他们自己/她们自己\nthen\t然后/当时\ntheologian\t神学者\ntheological\t神学上的\ntheology\t神学\ntheorem\t定理/原理\ntheoretical\t理论的/理论上的\ntheoretically\t理论上/理论地\ntheorist\t理论家/理论工作者\ntheory\t理论/学说\ntherapeutic\t治疗的/有益于健康的\ntherapist\t治疗学家\ntherapy\t治疗\nthere\t在那里\nthereafter\t其后/从那时以后\nthereby\t因此\ntherefore\t因此/所以\ntherein\t在其中/在那里\nthereof\t在其中/关于...\nthermal\t热的/热量的\nthermometer\t温度计/体温计\nthermos\t热水瓶\nthese\t这些\nthesis\t论题/论文\nthey\t他们/它们\nthick\t厚的/粗壮的\nthicken\t变浓/变厚\nthickness\t厚度/密度\nthief\t小偷/贼\nthigh\t大腿/股\nthin\t薄的/细的\nthing\t事物/东西\nthink\t想/考虑\nthinker\t思想者/思想家\nthinking\t思考/思想\nthinly\t薄/细\nthird\t第三/三分之一\nthirdly\t第三\nthirds\t归寡妇所得的亡夫遗产的三分之一/\nthirst\t口渴/渴望\nthirsty\t口渴的/渴望的\nthirteen\t十三/十三个\nthirteenth\t第十三/十三分之一\nthirty\t三十/三十个\nthis\t这/本\nthomas\t多马\nthompson\t汤普森\nthomson\t汤姆森（①姓氏②SirGeorg\nthorn\t刺/棘\nthornton\t桑顿\nthorough\t十分的/彻底的\nthoroughly\t彻底地/绝对地\nthose\t那些\nthou\t汝/你\nthough\t然而/可是\nthought\t想法/思想\nthoughtful\t深思的/体贴的\nthoughtfully\t沉思地/体贴地\nthoughtless\t欠考虑的/无深虑的\nthousand\t千\nthrash\t打/使逆行\nthread\t线/丝\nthreat\t恐吓/恶兆\nthreaten\t恐吓/威胁\nthreatened\t受到威胁的\nthree\t三/三个\nthresh\t打谷/摔打\nthreshold\t门槛/入口\nthrifty\t节俭的/兴旺的\nthrill\t震颤/激动\nthrilled\t非常兴奋的/极为激动的\nthriller\t使人激动的东西/使人毛骨悚然的东\nthrilling\t毛骨悚然的/令人兴奋的\nthrive\t繁荣/兴旺\nthriving\t兴旺的/旺盛的\nthroat\t咽喉/喉咙\nthrone\t王座/君主\nthrong\t群/人群\nthrough\t穿越/从头至尾\nthroughout\t到处/贯穿全部地\nthrow\t投/掷\nthrust\t插/戳\nthug\t恶棍/刺客\nthumb\t拇指\nthump\t重打/重击声\nthunder\t雷/雷声\nthunderstorm\t雷暴雨\nthursday\t星期四\nthus\t如此/因此\nthwart\t横放的\nthy\t你的\nthyme\t百里香\ntibet\t西藏\ntick\t滴答声/一瞬间\nticket\t票/券\ntickle\t胳肢/痒\ntidal\t潮汐的/受潮汐影响的\ntide\t潮/潮汐\ntidy\t椅子的背罩/装杂物的容器\ntie\t带子/线\ntier\t排/层\ntiger\t老虎/虎\ntight\t紧的/密封的\ntighten\t勒紧/使变紧\ntightly\t紧紧地/坚固地\ntile\t砖瓦/瓷砖\ntill\t直到/在...以前\ntilt\t倾斜/倾向\ntim\t蒂姆\ntimber\t木材/木料\ntime\t时间/时侯\ntimeless\t无时间限制的/不受时间影响的\ntimely\t及时的/适时的\ntimes\t时代/境遇\ntimetable\t时间表\ntimid\t胆小的/羞怯的\ntiming\t时间选择/时间测定\ntimothy\t梯牧草\ntin\t锡/马口铁\ntina\t蒂娜\ntiny\t很少的/微小的\ntip\t顶/尖端\ntire\t轮胎/头饰\ntired\t疲累的/疲乏的\ntiresome\t累人的/烦人的\ntissue\t薄的织物/薄纱\ntitle\t头衔/名称\nto\t到/向\ntoad\t蟾蜍/癞蛤蟆\ntoast\t吐司/烤面包\ntobacco\t烟草/香烟\ntoby\t人形水罐\ntoday\t今天/当今\ntoddler\t蹒跚行走的人/学步的小孩\ntoe\t足趾/趾部\ntogether\t一起/共同\ntoilet\t厕所/梳妆\ntoken\t表征/记号\ntokyo\t东京\ntolerance\t宽容/忍受\ntolerant\t宽容的/容忍的\ntolerate\t宽容/容许\ntoll\t通行费/代价\ntom\t雄性动物/雄猫\ntomato\t番茄/西红柿\ntomb\t坟墓/死亡\ntommy\t配给面包/实物工资制\ntomorrow\t明天/未来\nton\t吨\ntone\t音调/音质\ntongue\t舌/语言能力\ntonic\t补药/主调音或基音\ntonight\t今晚/今夜\ntonne\t吨/公吨\ntony\t高贵的/时髦的\ntoo\t也/非常\ntool\t工具/机床\ntooth\t牙齿/齿状物\ntoothache\t牙痛\ntoothbrush\t牙刷\ntoothpaste\t牙膏\ntop\t顶部/顶端\ntopaz\t黄晶/黄玉\ntopic\t主题/论题\ntopple\t推翻/颠覆\ntorch\t火把/启发之物\ntorment\t使人痛苦的东西/折磨者\ntorn\ttear的过去分词\ntornado\t旋风/龙卷风\ntorpedo\t鱼雷/水雷\ntorque\t扭转力/转矩\ntorrent\t奔流/倾盆大雨\ntorso\t躯干/裸体躯干雕像\ntortilla\t玉米饼\ntortoise\t龟/行动迟缓的人\ntorture\t拷问/苦闷\ntoss\t投掷/抛\ntotal\t全体的/总的\ntotally\t完全地\ntottenham\t托特纳姆\ntouch\t触觉/碰\ntouchable\t可触的/可使感动的\ntouchdown\t触地/触地得分\ntouching\t动人的/令人同情的\ntough\t恶棍\ntour\t旅游/观光旅行\ntourism\t观光业/游览\ntourist\t观光客/旅行者\ntournament\t比赛/竞赛\ntout\t招徕顾客/兜售物品\ntow\t拖/拖绳\ntoward\t向/对于\ntowards\t向/对于\ntowel\t手巾/毛巾\ntower\t塔/高楼\ntowering\t高耸的/激烈的\ntown\t城镇/市\ntownship\t小镇/镇区\ntoxic\t有毒的/中毒的\ntoxin\t毒素\ntoy\t玩具/小玩艺儿\ntrace\t痕迹/踪迹\ntracey\t特蕾西\ntrack\t轨迹/足迹\ntract\t大片土地/地带\ntraction\t曳/牵引\ntractor\t牵引器/拖拉机\ntrade\t贸易/商业\ntrademark\t商标\ntrader\t商人/商船\ntradesman\t零售商/工匠\ntradition\t传说/传统\ntraditional\t传统的/惯例的\ntraditionally\t传统上/传说上\ntraffic\t交通/通行\ntrafficking\t非法交易\ntrafford\t特拉福德/特拉福德\ntragedy\t悲剧/惨案\ntragic\t悲惨的/悲剧的\ntrail\t踪迹/痕迹\ntrailer\t追踪者/拖车\ntrain\t火车/列车\ntrained\t训练过的/受过培训的\ntrainee\t实习生/新兵\ntrainer\t训练员/驯马师\ntraining\t训练/培养\ntrait\t特征/特性\ntraitor\t叛逆者/叛国者\ntrajectory\t轨道/弹道\ntram\t电车轨道/煤车\ntramp\t坚实的脚步声/流浪者\ntrample\t践踏/蹂躏\ntranquil\t安静的\ntransaction\t交易/办理\ntranscend\t超越/胜过\ntranscribe\t抄写/译\ntranscript\t抄本/副本\ntranscription\t抄写/抄本\ntransfer\t迁移/移动\ntransform\t使转换/改变\ntransformation\t变形/变质\ntransformer\t变压器/促使变化的人\ntransient\t瞬/短期居留者\ntransistor\t晶体管\ntransit\t经过/通行\ntransition\t转变/转换\ntransitional\t变迁的/过渡期的\ntranslate\t翻译/解释\ntranslation\t翻译/译文\ntranslator\t翻译者\ntransmission\t传输/传送\ntransmit\t传输/传染\ntransnational\t超越国界的/跨国的\ntransparency\t透明/透明度\ntransparent\t透明的/显然的\ntransplant\t使移居/移植\ntransport\t运输/运输工具\ntransportation\t运输/输送\ntransverse\t横断物\ntrap\t圈套/陷阱\ntrash\t垃圾/废物\ntrauma\t外伤/损伤\ntraumatic\t外伤的/创伤的\ntravel\t旅行/游历\ntraveler\t旅行者/游客\ntraveling\t旅行的/旅行用的\ntraveller\t旅行者\ntravelling\t旅行的/旅行用的\ntraverse\t越过/横贯\ntravis\t崔维斯合唱团/特拉维斯\ntray\t托盘/公文盘\ntreacherous\t不可信任的/危险的\ntread\t踏/步态\ntreadmill\t踏车/令人厌倦的工作\ntreason\t叛逆/不忠\ntreasure\t宝物/财富\ntreasurer\t会计/出纳员\ntreasury\t国库/宝库\ntreat\t宴请/款待\ntreatment\t治疗/待遇\ntreaty\t条约/谈判\ntree\t树/木料\ntrek\t牛拉货车/艰苦跋涉\ntremble\t战栗/颤抖\ntremendous\t巨大的/非常的\ntremendously\t极大地/极端地\ntrench\t渠/沟渠\ntrend\t趋势/倾向\ntrendy\t随潮流的/时髦的\ntrent\t特伦特/特伦托河\ntrevor\t特雷弗\ntrial\t审判/试验\ntriangle\t三角形/三个一组\ntriangular\t三角形的/三人间的\ntribal\t部落的/宗族的\ntribe\t宗族/部落\ntribunal\t法庭/法官席\ntribute\t贡物/礼物\ntrick\t诡计/欺诈\ntrickle\t滴/细流\ntricky\t狡猾的/机敏的\ntrifle\t琐事/少量\ntrigger\t触发器/扳机\ntrillion\t大量\ntrim\t整齐/情形\ntrio\t三重唱\ntrip\t旅行/绊倒\ntriple\t三倍数/三个一组\ntriumph\t凯旋/胜利\ntriumphant\t得胜的/得意洋洋的\ntrivial\t琐碎的/不重要的\ntrolley\t电车/手推车\ntroop\t军队/一群\ntrooper\t骑兵/骑警\ntrophy\t战利品/奖品\ntropic\t回归线\ntropical\t热带的/热情的\ntrot\t快步\ntrouble\t烦恼/麻烦\ntroubled\t烦恼的/混乱的\ntroublesome\t麻烦的/令人讨厌的\ntroubling\t浊度/浑浊度\ntrough\t槽/水槽\ntrousers\tpl.裤子/长裤\ntrout\t鲑鱼\ntruce\t停战/休战\ntruck\t卡车/货车\ntrue\t真实的/正确的\ntruly\t真实地/不假\ntrumpet\t喇叭/小号\ntrunk\t树干/干线\ntrust\t信任/信赖\ntrustee\t受托人/理事\ntruth\t事实/实情\ntry\t尝试/试验\ntsar\t沙皇\ntt\t电汇\ntub\t桶/浴盆\ntube\t管/软管\ntuberculosis\t肺结核\ntuck\t缝褶/活力\ntudor\t英国都铎王朝\ntuesday\t星期二\ntug\t用力拉/拖曳\ntuition\t学费/讲授\ntulip\t郁金香\ntumble\t跌倒/摔跤\ntumor\t肿大/肿块\ntumour\t瘤/肿块\ntuna\t金枪鱼/金枪鱼肉\ntune\t歌曲/主旋律\ntunnel\t隧道/地下道\nturbine\t涡轮机\nturbulent\t狂暴的/骚乱的\nturf\t草皮/泥炭\nturk\t土耳其人/土耳其马\nturkey\t火鸡/无用的家伙\nturkish\t土耳其语\nturmoil\t骚动/混乱\nturn\t转弯/转动\nturnaround\t转向/回车道\nturner\t车工/体育协会会员\nturning\t旋转/转弯处\nturnip\t芜菁/芜菁甘蓝\nturnout\t聚集的人群/出席者\nturnover\t翻倒/翻转\nturtle\t海龟\ntutor\t家庭教师/导师\ntutorial\t个别指导/论文\ntv\t电视\ntweed\t花呢/花呢服装\ntwelfth\t第十二/十二分之一\ntwelve\t十二/十二个\ntwentieth\t第二十/二十分之一\ntwenty\t二十/二十个\ntwice\t两次/两倍\ntwig\t小枝/细枝\ntwilight\t暮光/曙光\ntwin\t双胞胎中一人/一对非常相像的人中\ntwinkle\t闪烁/闪耀\ntwist\t一扭/扭曲\ntwisted\t扭曲的\ntwitch\t急拉/抽搐\ntwo\t二/二个\ntyne\t泰恩河[英国英格兰北部]\ntype\t类型/样式\ntypewriter\t打字机\ntyphoon\t台风\ntypical\t典型的/象征性的\ntypically\t代表性地/作为特色地\ntypist\t打字员\ntyranny\t专制/暴政\ntyrant\t暴君\ntyre\t轮胎\nubiquitous\t无所不在的/到处存在的\nugly\t丑陋的/邪恶的\nuh\t嗯啊\nuk\t联合王国\nukraine\t乌克兰\nukrainian\t乌克兰的/乌克兰人的\nulcer\t溃疡/腐烂物\nulcerative\t形成溃疡/溃烂\nulster\t有带的宽大长外套\nultimate\t终极/根本\nultimately\t最后/最终\nultrasonic\t超声波\nultraviolet\t紫外线的\num\t嗯\numbrella\t伞/雨伞\numpire\t裁判员/仲裁人\nun\t家伙/东西\nunable\t不能的/不会的\nunacceptable\t无法接受的/不受欢迎的\nunaffected\t不矫揉造作的/自然的\nunanimous\t意见一致的/无异议的\nunanimously\t全体一致/无异议\nunanswered\t未答复的/无反应的\nunavailable\t得不到的/不能利用的\nunavoidable\t不可避免的/不得已的\nunaware\t未认识到的/不知道的\nunbearable\t无法忍受的/承受不住的\nunbeaten\t未曾挨打的/未搅打的\nunbelievable\t难以置信的\nuncertain\t不确定的/无常的\nuncertainty\t不确定/不可靠\nunchanged\t无变化的\nuncle\t叔父/伯父\nunclear\t不易了解的/不清楚的\nuncomfortable\t不舒服的/不自在的\nuncommon\t不寻常的/非凡的\nunconditional\t无条件的/无限制的\nunconscious\t未意识到的/无意识的\nunconsciously\t无意识地/无意中\nunconstitutional\t违反宪法的/不符合宪法的\nunconventional\t不依惯例的/非传统的\nuncover\t揭露/揭开\nunder\t在...之下/低于\nundercover\t秘密从事的/秘密的\nundercut\t底切/牛腰部下侧嫩肉\nunderestimate\t低估\nundergo\t遭受/经历\nundergraduate\t大学本科生/大学肄业生\nunderground\t地下/地铁\nunderlie\t位于...之下/成为...的基础\nunderline\t在...下面划线/作...的衬里\nunderlying\t在下面的\nundermine\t在...下面挖/渐渐破坏\nunderneath\t在下面\nunderpin\t从下面支承/支撑\nunderscore\t划线于...下\nunderside\t下面/下侧\nunderstand\t理解/了解\nunderstandable\t可以理解的\nunderstandably\t可懂/可了解\nunderstanding\t理解/谅解\nundertake\t试图/从事\nundertaking\t事业/企业\nunderwater\t在水中的\nunderway\t航行中的/进行中的\nunderwear\t内衣\nundesirable\t不受欢迎的/不合乎社会道德标准的\nundivided\t未分开的/专一的\nundo\t解开/取消\nundoubtedly\t无疑/必定\nundue\t不适当的/过度的\nunduly\t不适当地/过度地\nunease\t不安\nuneasy\t心神不安的/不自在的\nunemployed\t失业的/未被利用的\nunemployment\t失业/失业人数\nunequal\t不相等的/不规则的\nuneven\t不平坦的/不均等的\nunexpected\t料想不到的/突然的\nunexpectedly\t想不到的/突然的\nunfair\t不公平的/不正直的\nunfamiliar\t不熟悉的\nunfinished\t未完成的\nunfit\t不适当的/不胜任的\nunfold\t展开/打开\nunfortunate\t不幸的/不合适的\nunfortunately\t恐怕/不幸的是\nunhappy\t不快乐的/不幸的\nunhealthy\t不健康的\nunidentified\t未被认出的/未经确认的\nunification\t统一/联合\nunified\t统一的/一致标准的\nuniform\t制服\nuniformed\t使成一样/使一律化\nuniformly\t一样/一致\nunify\t统一/使成一体\nunilateral\t单方面的/单边的\nunimportant\t不重要的\nuninsured\t未保过险的\nunion\t联盟/联合\nunionist\t工会会员/工联主义者\nunique\t独一无二的/独特的\nuniquely\t独特地/珍奇地\nunison\t调和/和谐\nunit\t单位/分队\nunite\t联合/接合\nunited\t联合的/团结的\nunity\t一致/联合\nuniversal\t全世界的/普遍的\nuniversally\t宇宙/全世界\nuniverse\t宇宙/星系\nuniversity\t大学\nunix\tUNIX操作系统\nunjust\t不公平的\nunkind\t不仁慈的/不亲切的\nunknown\t不知道的/未知的\nunlawful\t非法的/不正当的\nunleash\t解开...的皮带/发出\nunless\t除非\nunlike\t不像的/不同的\nunlikely\t不太可能的\nunlimited\t无限的/不受限制的\nunload\t卸货\nunlock\t开...的锁/开启\nunlucky\t不吉利的/不祥的\nunmarried\t未婚的/单身的\nunmistakable\t不会弄错的/不会被误解的\nunnatural\t不自然的/反常的\nunnecessarily\t不必要地/多余地\nunnecessary\t不必要的\nunnoticed\t不被注意的/被忽视的\nunofficial\t非正式的/非官方的\nunorthodox\t非正统的/异教的\nunpaid\t未付款的/不支薪水的\nunpleasant\t使人不愉快的/使人厌恶的\nunpopular\t不得人心的/不受欢迎的\nunprecedented\t空前的\nunpredictable\t不可预知的\nunpublished\t未公开出版的/未发表过的\nunravel\t阐明/解决\nunrealistic\t不切实际的/幻想的\nunreasonable\t不合理的/过度的\nunreliable\t不可靠的\nunrest\t不安的状态/动荡的局面\nunsafe\t不安全的/不安稳的\nunsatisfactory\t不令人满意的\nunseen\t未被看见的/看不见的\nunsettle\t使移动/搅乱\nunskilled\t无技能的/不熟练的\nunstable\t不稳定的\nunsuccessful\t不成功的\nunsuccessfully\t无用/失败地\nunsuitable\t不适合的\nunsure\t不肯定的/不确定的\nunthinkable\t不能考虑的/不能想像的\nuntidy\t不整齐的/懒散的\nuntie\t解开\nuntil\t直到/在...以前\nunto\t到/对\nuntouched\t未触摸过的/未改变的\nuntrue\t不真实的/不正确的\nunused\t不用的/不在使用的\nunusual\t不寻常的/罕见的\nunusually\t不寻常地/异乎寻常地\nunveil\t揭开/揭幕\nunwanted\t没人要的/不需要的\nunwelcome\t不受欢迎的/讨厌的\nunwilling\t不愿意的/勉强的\nunwise\t愚蠢的/欠考虑的\nup\t向上的/起床的\nupbeat\t弱拍/上升\nupbringing\t教养\nupcoming\t即将来临的/即将出现的\nupdate\t更新/使现代化\nupgrade\t上坡/升级\nupheaval\t举起/隆起\nupheld\tuphold的过去式和过去分词\nuphold\t支撑/赞成\nupland\t山地/高地\nupon\t在...之上/迫近\nupper\t上面的/较高的\nupright\t正直的/诚实的\nuprising\t起义/升起\nuproar\t骚动/喧嚣\nupscale\t迎合高层次消费者的/质优价高的\nupset\t弄翻的/混乱的\nupstairs\t楼上的\nuptodate\t直到现代的/现时的\nupward\t向上的\nupwards\t以上/向上\nuranium\t铀\nurban\t都市的/住在都市的\nurge\t冲动/推动力\nurgency\t紧急/催促\nurgent\t紧急的/急迫的\nurgently\t急切地/迫切地\nurgh\t=ugh\nurine\t小便/尿\nus\t我们\nusa\t美国/美利坚合众国\nusage\t用法/使用\nuse\t使用/习惯\nused\t使用过的/二手的\nuseful\t有用的/有益的\nusefully\t有效地/有用地\nusefulness\t有用/有益\nuseless\t无用的/无效的\nuser\t使用者\nusher\t引座员/招待员\nusl\t用户专门语言\nussr\t苏联\nusual\t平常的/通常的\nusually\t通常/大抵\nutensil\t器皿/用具\nutilise\t利用/运用\nutility\t功用/有用之物\nutilization\t利用\nutilize\t利用\nutmost\t极限/最大限度\nutter\t全然的/绝对的\nutterance\t发声/言辞\nutterly\t完全地/全然\nux\t用户体验\nvacancy\t空/空白\nvacant\t空的/空白的\nvacation\t假期/休假\nvaccinate\t预防接种\nvaccine\t牛痘苗/疫苗\nvacuum\t真空/空间\nvague\t含糊的/不清楚的\nvaguely\t含糊地/暧昧地\nvain\t无价值的/徒然的\nvale\t谷/溪谷\nvalid\t有确实根据的/有法律效力的\nvalidate\t使有效/使生效\nvalidation\t批准/确认\nvalidity\t有效性/正确性\nvalley\t山谷/溪谷\nvaluable\t有价值的/贵重的\nvaluation\t评价/估价\nvalue\t价值/价格\nvalve\t活瓣/阀\nvampire\t吸血鬼\nvan\t货车/篷车\nvanilla\t香草/香子兰\nvanish\t消失/不见\nvanity\t虚荣心/虚无\nvantage\t优势/有利情况\nvapor\t汽/蒸气\nvapour\t汽/蒸气\nvariability\t易变/变化性\nvariable\t易变的事物/变数\nvariance\t不一致/变化\nvariant\t变体/异体\nvariation\t变更/变化\nvaried\t不同的/杂色的\nvariety\t多样/种类\nvarious\t不同的/各种的\nvariously\t各种各样/种种\nvary\t改变/使多样化\nvase\t花瓶/瓶\nvast\t巨大的/广大的\nvastly\t广大地/许多\nvat\t大桶\nvaughan\t沃恩\nvault\t拱顶/窖\nvauxhall\t沃克斯豪尔\nveal\t小牛肉\nvector\t矢量/传病媒介\nveer\t转向\nvegetable\t蔬菜/植物\nvegetarian\t素食者/食草动物\nvegetation\t植物\nvehicle\t交通工具/车辆\nveil\t面纱/面罩\nvein\t血管/静脉\nvelocity\t速度/迅速\nvelvet\t天鹅绒\nvendor\t小贩/卖主\nvengeance\t复仇/报仇\nvenice\t威尼斯\nvent\t排气口/出口\nventilate\t使空气流通/使通风\nventilation\t通风/空气流通\nventure\t冒险/风险\nvenue\t犯罪地点/审判地\nvenus\t维纳斯/金星\nverb\t动词\nverbal\t用言辞的/言语的\nverdict\t裁决/判决\nverge\t边缘/边界\nverify\t证明/查证\nversatile\t多才多艺的/万用的\nverse\t诗/韵文\nversion\t一种描述/版本\nversus\t对...\nvertical\t垂直的/直立的\nvertically\t垂直地\nvery\t真正的/恰好的\nvessel\t船/容器\nvest\t背心/汗背心\nvet\t兽医\nveteran\t老手/退伍军人\nveterinary\t兽医的\nveto\t否决权\nvex\t使烦恼/使苦恼\nvia\t经由/经过\nviability\t生存能力/发育能力\nviable\t能养活的/能生长发育的\nvibrant\t振动的/战栗的\nvibrate\t振动/颤动\nvibration\t振动/颤动\nvic\t飞机V字队形编队\nvicar\t教区牧师/教堂主持\nvice\t恶习/恶行\nvicinity\t附近/邻近\nvicious\t邪恶的/堕落的\nvictim\t受害人/牺牲者\nvictor\t胜利者\nvictoria\t维多利亚\nvictorian\t英国维多利亚女王时代的/笃信宗教\nvictorious\t胜利的/得胜的\nvictory\t胜利/战胜\nvideo\t影像/电视\nvideophone\t电视电话\nvideotape\t录相磁带\nvie\t争/竞争\nvienna\t维也纳\nvietnam\t越南\nvietnamese\t越南人/越南语\nview\t视野/风景\nviewer\t观察者/看电视者\nviewpoint\t观点\nvigor\t精力/活力\nvigorous\t精力充沛的/元气旺盛的\nvigorously\t朝气蓬勃/精力充沛\nvigour\t精力/活力\nvii\t罗马数字7\nviii\t罗马数字8\nviking\t海盗\nvilla\t别墅\nvillage\t村庄\nvillager\t村民\nvillain\t坏人/恶棍\nvincent\t文森特\nvine\t藤本植物/葡萄\nvinegar\t醋/尖酸刻薄\nvineyard\t葡萄园\nvintage\t酒/葡萄收获(期\nvinyl\t乙烯基\nviolate\t违犯/亵渎\nviolation\t违反/违背\nviolence\t猛烈/暴力\nviolent\t暴力的/猛烈的\nviolently\t猛烈地/激烈地\nviolet\t堇菜/紫罗兰\nviolin\t小提琴\nviolinist\t小提琴演奏者/小提琴家\nvirgin\t处女\nvirginia\t弗吉尼亚\nvirtual\t实际上起作用的/虚的\nvirtually\t事实上\nvirtue\t德行/美德\nvirus\t病毒/滤过性病毒\nvisa\t签证\nviscous\t粘的/粘性的\nvisibility\t可见性/能见度\nvisible\t看得见的/明显的\nvisibly\t看得见地/明显地\nvision\t视觉/眼光\nvisionary\t幻像的/幻想的\nvisit\t拜访/访问\nvisiting\t参观/拜访\nvisitor\t参观者/游客\nvista\t远景/展望\nvisual\t视觉的\nvisualize\t使看得见/使具体化\nvisually\t看/视力\nvital\t生命的/重要的\nvitality\t活力/生命力\nvitally\t与生命有关地/致命地\nvitamin\t维生素\nvitamine\t维生素/维他命\nvivid\t生动的/鲜明的\nvividly\t鲜艳/强烈\nvocabulary\t词汇/词汇表\nvocal\t嗓音的/声音的\nvocation\t职业/天命\nvocational\t职业的\nvodka\t伏特加酒\nvogue\t时尚/时髦\nvoice\t声音/嗓音\nvoid\t空虚/空间\nvolatile\t挥发性的/可变的\nvolcanic\t火山的/猛烈的\nvolcano\t火山\nvolleyball\t排球\nvolt\t伏特\nvoltage\t电压/伏特数\nvolume\t册/卷\nvoluntarily\t自愿地/以自由意志\nvoluntary\t自动的/自愿的\nvolunteer\t志愿者\nvomit\t吐出/呕吐\nvote\t投票/选举\nvoter\t选民/投票人\nvoting\t投票/选举\nvoucher\t证人/保证人\nvow\t誓约/誓言\nvowel\t元音\nvoyage\t航行/航海\nvs\t对\nvulgar\t粗俗的/庸俗的\nvulnerability\t易受伤/易受责难\nvulnerable\t易受伤害的/有弱点的\nwacc\t加权平均资金成本\nwade\t跋涉\nwag\t摇摆/摇动\nwage\t工资/报应\nwaggon\t运货车/四轮运货马车\nwagon\t四轮马车/货车\nwail\t恸哭/哀号\nwaist\t腰部/腰\nwait\t等待/等候\nwaiter\t侍者\nwaiting\t等候\nwaitress\t女侍者/女服务员\nwaiver\t放弃/弃权\nwake\t叫醒/激发\nwaken\t唤醒/使觉醒\nwales\t威尔士\nwalk\t走/散步\nwalker\t徒步者/轻便鞋\nwalking\t步行/步态\nwalkman\t随身听\nwalkway\t走道/人行道\nwall\t墙/墙壁\nwallace\t华莱士\nwallet\t皮夹\nwallpaper\t壁纸/墙纸\nwalnut\t胡桃\nwalsh\t沃尔什\nwalter\t沃尔特\nwalton\t沃尔顿\nwan\t苍白的/无血色的\nwander\t游荡/漫步\nwant\t需要的东西/缺乏\nwar\t战争/战争状态\nward\t病房/守卫\nwarden\t典狱官/渔猎法监督官\nwardrobe\t衣橱/衣室\nware\t物品/器具\nwarehouse\t仓库/货栈\nwarfare\t战争/战斗\nwarhead\t弹头\nwarm\t暖和的/暖的\nwarming\t暖和/加温\nwarmly\t亲切地/温暖地\nwarmth\t温暖/温情\nwarn\t警告/提醒\nwarner\t警告者/告诫者\nwarning\t警告/预告\nwarrant\t授权/正当理由\nwarranty\t正当理由/授权\nwarren\t养兔场/拥挤的地区\nwarrington\t沃灵顿\nwarrior\t战士/勇士\nwarsaw\t华沙\nwartime\t战时\nwarwick\t沃里克/沃里克（美国罗德岛州东部\nwary\t谨慎的/小心的\nwash\t洗/洗涤\nwashing\t洗涤/浸\nwashington\t华盛顿\nwashroom\t盥洗室\nwasp\t黄蜂/胡蜂\nwaste\t浪费/废物\nwasted\t浪费的\nwasteful\t浪费的/不经济的\nwatch\t观察/手表\nwatcher\t看守人/守望者\nwatchful\t注意的/警戒的\nwater\t水/雨水\nwatercolor\t水彩颜料/水彩画\nwatercolour\t水彩画\nwaterfall\t瀑布\nwaterfront\t水边/滨水区\nwaterloo\t滑铁卢/惨败\nwatermelon\t西瓜\nwaterproof\t防水材料\nwatershed\t流域/分水岭\nwatertight\t不透水的/不漏水的\nwaterway\t航道/水路\nwatery\t水的/湿的\nwatt\t瓦\nwave\t波/波浪\nwavelength\t波长\nwaver\t动摇/踌躇\nwax\t蜡/蜡状物\nway\t路/路线\nwayne\t韦恩\nwayside\t路旁\nwe\t我们\nwea\t工人教育协会\nweak\t不牢固的/弱的\nweaken\t削弱/减弱\nweakness\t虚弱/薄弱\nwealth\t财富/资源\nwealthy\t富有的/丰裕的\nweapon\t武器/兵器\nwear\t穿着/戴\nwearily\t疲倦地/厌倦地\nweary\t疲倦的/萎靡的\nweather\t天气/气象\nweatherman\t气象员/天气预报员\nweave\t编法/织法\nweaver\t织布者/织工\nweb\t网/蛛丝\nwebb\t韦勃/威布市\nwebsite\t网站\nwed\t与...结婚/使结合\nwedding\t婚礼/结婚\nwedge\t楔子/楔形物\nwednesday\t星期三\nwee\t很小的/微小的\nweed\t杂草/野草\nweek\t星期/周\nweekday\t周日/平日\nweekend\t周末/周末休假\nweekly\t周刊/周报\nweep\t哭/哭泣\nweigh\t称...重量/衡量\nweight\t重/重量\nweird\t怪异的/超自然的\nwelcome\t欢迎/欢迎词\nwelcoming\t欢迎/迎接\nweld\t焊接处/焊接\nwelfare\t福利/安宁\nwell\t井/泉水\nwellington\t惠灵顿长靴\nwells\t威尔斯\nwembley\t文布利\nwendy\t温迪\nwesley\t韦斯利\nwest\t西方/西部\nwestern\t西方人/西部片\nwesterner\t西方人/西洋人\nwestminster\t威斯敏斯特\nwestward\t朝西的方向\nwestwards\t向西\nwet\t湿气/潮湿\nwetland\t湿地/沼泽地\nwh\t瓦特小时/白宫\nwhale\t鲸\nwharf\t码头\nwhat\t什么\nwhatever\t无论什么\nwhatsoever\t无论什么\nwheat\t小麦\nwheel\t轮子/车轮\nwheelchair\t轮椅\nwheeler\t旋转物/推车人\nwhen\t当...的时候\nwhenever\t每当\nwhere\t在哪里\nwhereabouts\t下落/所在之处\nwhereas\t然而/鉴于\nwhereby\t靠什么/如何\nwherever\t无论哪里\nwhether\t是否/不论\nwhich\t哪一个/那一个\nwhichever\t无论那一个/任何一个\nwhile\t一会儿/时间\nwhilst\t当...的时候/和...同时\nwhim\t一时的兴致/冲动\nwhine\t哀叫声/嘎嘎声\nwhip\t鞭子/抽打\nwhirl\t回旋/旋转\nwhisk\t掸/扫帚\nwhisker\t腮须/胡须\nwhiskey\t威士忌酒\nwhisky\t威士忌酒/轻便马车\nwhisper\t耳语/密谈\nwhistle\t口哨/汽笛\nwhite\t白色/洁白\nwhitehall\t白厅/英国政府\nwhitewash\t白色涂料/粉饰\nwho\t谁\nwhoa\t惊叹声/停止\nwhoever\t任何人/无论谁\nwhole\t全部/全体\nwholesale\t批发\nwholesome\t有益健康的/合乎卫生的\nwholly\t完全地/整个\nwhom\t谁\nwhore\t娼妓\nwhose\t谁的\nwhy\t为什么\nwicked\t坏的/邪恶的\nwicket\t小门/腰门\nwide\t宽的/广阔的\nwidely\t广泛地\nwiden\t弄宽/加宽\nwidespread\t充分伸展的/广布的\nwidow\t寡妇/孀妇\nwidth\t宽度/宽广\nwield\t挥舞/运用\nwife\t妻子/太太\nwig\t假发/斥责\nwigan\t本色平纹棉布/无光上浆衬里布\nwight\t人类/人\nwild\t荒野/荒地\nwilderness\t荒野/荒地\nwildlife\t野生动植物\nwildly\t狂暴地/激动地\nwilful\t任性的/固执的\nwilkinson\t威尔金森\nwill\t意志/决心\nwilliam\t威廉/[常作W-][美俚]钞票\nwilliams\t威廉姆斯\nwillie\t威利\nwilling\t乐意的/自愿的\nwillingly\t自动地/欣然地\nwillingness\t乐意/心甘情愿\nwillis\t威利斯\nwillow\t柳树/柳木制品\nwilson\t威尔逊\nwilt\t枯萎/衰弱\nwiltshire\t威尔特郡\nwimbledon\t温布尔登[英国英格兰东南部城市]\nwin\t赢得/打胜\nwince\t畏缩/退避\nwind\t风/气息\nwindbreaker\t防风林/防风茄克衫\nwinding\t绕/卷\nwindmill\t风车\nwindow\t窗户/窗子\nwindscreen\t汽车的挡风玻璃\nwindshield\t挡风玻璃\nwindsor\t温莎\nwindy\t多风的/风强的\nwine\t葡萄酒/果酒\nwing\t翅膀/翼\nwinger\t边锋\nwink\t眨眼/使眼色\nwinner\t胜利者/优胜者\nwinning\t胜利/获得\nwinston\t温斯顿\nwinter\t冬季/萧条期\nwipe\t擦拭/用力打\nwire\t电线/电报\nwireless\t无线电\nwiring\t线路/接线\nwirral\t威勒尔半岛\nwisdom\t智慧/明智行为\nwise\t明智的/慎虑的\nwisely\t聪明地/精明地\nwish\t希望/愿望\nwit\t机智/智力\nwitch\t巫婆/女巫\nwith\t和...在一起/以\nwithdraw\t撤回/取回\nwithdrawal\t提款/撤退\nwither\t使凋谢/使消亡\nwithhold\t使停止/扣留\nwithin\t内部/里头\nwithout\t没有/不\nwithstand\t抵住/顶住\nwitness\t证人/目击者\nwitty\t富于机智的/诙谐的\nwizard\t男巫/术士\nwoe\t悲哀/悲痛\nwolf\t狼/残忍贪婪之人\nwoman\t女人/妇女\nwomb\t子宫/发源地\nwonder\t奇迹/惊奇\nwonderful\t令人惊奇的/奇妙的\nwonderfully\t惊人地/极好地\nwoo\t追求/向...求爱\nwood\t木材/木制品\nwooded\t树木繁茂的\nwooden\t木制的/呆笨的\nwoodland\t林区/林地\nwoodpecker\t啄木鸟\nwoods\t森林/树林\nwool\t羊毛/毛织物\nwoollen\t毛织品\nworcester\t伍斯特\nword\t话/消息\nwording\t用词/措词\nwordsworth\t华滋华斯\nwork\t工作/劳动\nworkday\t工作日/工作时数\nworker\t工人/劳动者\nworkforce\t劳动力/工人总数\nworkhouse\t贫民习艺所/济贫院\nworking\t工作/运转\nworkload\t工作量\nworkman\t工人/工匠\nworkmate\t共同工作者/同事\nworkout\t试验/试用\nworkpiece\t工件\nworkplace\t工作场所/工厂\nworks\t工程/工厂\nworkshop\t工场/车间\nworkstation\t工作站\nworld\t世界/地球\nworldview\t看/视力\nworldwide\t全世界的\nworm\t虫/蠕虫\nworn\t用旧的/穿旧的\nworried\t担心的/闷闷不乐的\nworry\t担心/烦恼\nworrying\t使人烦恼的/忧虑重重的\nworse\t更坏的事/更恶劣的事\nworsen\t使更坏/使恶化\nworship\t崇拜/礼拜\nworst\t最坏/最坏的时候\nworth\t价值/财产\nworthless\t无价值的/无益的\nworthwhile\t值得花时间的/值得做的\nworthy\t杰出人物\nwould\t将/愿意\nwound\t创伤/伤口\nwounded\t受伤的\nwow\tinterj.哇\nwrap\t外套/围巾\nwrath\t愤怒/激怒\nwreath\t花圈/花环\nwreck\t失事/残骸\nwreckage\t残骸/失事\nwrench\t扳钳/扳手\nwrestle\t摔跤/角力\nwrestling\t摔跤\nwretched\t可怜的/不幸的\nwriggle\t蠕动/蜿蜒\nwright\t制作者/工人\nwring\t扭绞/拧\nwrinkle\t皱纹/妙计\nwrist\t手腕/腕关节\nwrit\t令状/文书\nwrite\t书写/著述\nwriter\t作家/撰稿者\nwriting\t书写/著作\nwritten\t书面的/写成文字的\nwrong\t错误的/不正当的\nwrongdoing\t干坏事/坏事\nwrongly\t错误地/不恰当地\nwwf\t世界野生动物基金/世界摔跤联合会\nwycliffe\t威克利夫\nxerox\t静电复印\nyacht\t快艇/游艇\nyank\t猛拉\nyard\t码/庭院\nyarn\t纱/纱线\nyawn\t哈欠\nye\t亚萨卡/乒乓底板\nyeah\t是/是的\nyear\t年/年度\nyearly\t每年的/一年一度的\nyearn\t渴望/想念\nyeast\t酵母\nyell\t叫喊/大叫\nyellow\t黄色\nyeltsin\t叶利钦\nyen\t日元/渴望\nyep\t是\nyer\t你的\nyes\t是\nyesterday\t昨天\nyet\t还/尚\nyield\t生产量/投资收益\nyielding\t生产的/屈从的\nyo\t唷\nyoga\t瑜珈\nyoghurt\t酸乳/酸奶\nyogurt\t酸乳酪\nyoke\t轭/牛轭\nyolk\t蛋黄/卵黄\nyork\t约克郡/约克王朝\nyorkshire\t约克郡/约克王朝\nyou\t你/你们\nyoung\t年轻的/无经验的\nyoungster\t小孩/年轻人\nyour\t你的/你们的\nyours\t你的/你们的\nyourself\t你自己\nyourselves\t你们自己\nyouth\t年轻/青年时代\nyouthful\t年轻的/青年的\nyugoslav\t南斯拉夫的/南斯拉夫人的\nyugoslavia\t南斯拉夫\nyummy\t美味的/可口的\nzambia\t赞比亚\nzeal\t热心/热衷\nzealand\t西兰岛\nzealous\t热衷的/热诚的\nzebra\t斑马\nzero\t零/零点\nzimbabwe\t津巴布韦\nzinc\t锌\nzip\t尖啸声/拉链\nzipper\t拉链\nzone\t地带/带\nzoning\t分区制\nzoo\t动物园\nzoom\t急速上升/变焦摄影";
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
let spellOn=true;          // 内置拼写检查开关（自研词库查表，毫秒级；偏好记 localStorage）
// 我的生词本（用户右键主动添加，存 localStorage 持久化；加入的词直接反哺翻译查询，优先级最高）
// 内置补漏词根（高频但 ECDICT 精选集没收的词；加入即反哺翻译与拼写检查，优先级高于 BIGDICT）
let USERDICT={"seclude":"使隔离/使隐居","secluded":"与世隔绝的/隐居的","seclusion":"隐居/隔离","forbade":"禁止(过去)","forbidden":"被禁止的","wept":"哭泣(过去)","knelt":"跪下(过去)","arose":"起来/出现(过去)","awoken":"被唤醒的","forgave":"原谅(过去)","forgiven":"被原谅的","withdrew":"退出/撤回(过去)","underwent":"经历(过去)","dwelt":"居住(过去)","clung":"紧紧抓住(过去)","bliss":"极乐/幸福","fussy":"挑剔的/大惊小怪的","serene":"宁静的","itch":"发痒/渴望","behold":"看/目睹","contort":"扭曲","contorted":"扭曲的","contortion":"扭曲；扭体","contortionist":"柔术演员","slither":"蜿蜒滑行","smirk":"得意地笑；假笑","scowl":"皱眉；怒视","pout":"噘嘴","stutter":"口吃；结巴","rapport":"融洽；和睦","introspection":"内省；反省","resilience":"韧性；恢复力","fallacy":"谬误；错误观念","epiphany":"顿悟；突然领悟","whimsical":"异想天开的；古怪有趣的","meticulous":"一丝不苟的；极仔细的","succinct":"简洁的；简明的","apathetic":"冷漠的；无动于衷的"};
function loadMyWords(){ try{ return JSON.parse(localStorage.getItem("myWords")||"[]"); }catch(e){ return []; } }
function saveMyWords(a){ try{ localStorage.setItem("myWords", JSON.stringify(a)); }catch(e){} }
function loadUserDict(){ try{ const s=localStorage.getItem("myWords"); if(s){ JSON.parse(s).forEach(r=>{ if(r&&r.word) USERDICT[r.word.toLowerCase()]=r.zh; }); } }catch(e){} }
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
document.getElementById("ctxAdd").addEventListener("click",()=>{
  const zh=(ctxZh.value||"").trim(); if(!ctxWord||!zh){ ctxZh.focus(); return; }
  let ex=""; for(const row of rowsCache){ if((row.words||[]).some(w=>(w.clean||"").toLowerCase()===ctxWord)){ ex=row.raw; break; } }
  const arr=loadMyWords(); const i=arr.findIndex(r=>r.word.toLowerCase()===ctxWord);
  if(i>=0) arr[i].zh=zh; else arr.push({word:ctxWord, zh, ex, ts:Date.now()});
  saveMyWords(arr); USERDICT[ctxWord]=zh; ctxmenu.style.display="none"; render();
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
try{ if(localStorage.getItem("spellOn")==="0") spellOn=false; }catch(e){}
function setSpellBtn(){ spellBtn.textContent="拼写检查："+(spellOn?"开":"关"); spellBtn.style.opacity=spellOn?"":".55"; }
setSpellBtn();
spellBtn.title="内置拼写检查（自研，毫秒级）：词库里查不到的词画红色波浪线，两个词连写（如 Likemany）还会在悬停提示拆法。替代被关掉的浏览器拼写检查";
spellBtn.addEventListener("click",()=>{
  spellOn=!spellOn;
  try{ localStorage.setItem("spellOn",spellOn?"1":"0"); }catch(e){}
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
document.getElementById("missBody").addEventListener("click",e=>{
  const del=e.target.closest(".myword-del"); if(!del) return;
  const i=+del.dataset.i, arr=loadMyWords(); arr.splice(i,1); saveMyWords(arr);
  USERDICT={}; loadUserDict(); openMyWords();
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
