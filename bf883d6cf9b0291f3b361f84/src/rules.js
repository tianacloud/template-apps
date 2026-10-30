export const defaultWords=['中国','人民','文化','山水','学习','朋友','天空','大地','学校','老师'];
export function counts(chars){const c={};for(const x of chars)c[x]=(c[x]||0)+1;return c}
export function has(hand,word){const c=counts(hand);return [...word].every(x=>--c[x]>=0)}
export function exact(chars,words){return words.find(w=>w.length===chars.length&&has(chars,w))||null}
export function partition(hand,words,memo=new Map()){
 const key=[...hand].sort().join('');if(!key)return [];if(memo.has(key))return memo.get(key);
 for(const w of words){if(!w.includes(key[0])||!has(hand,w))continue;const rest=[...hand];for(const ch of w)rest.splice(rest.indexOf(ch),1);const tail=partition(rest,words,memo);if(tail){const result=[w,...tail];memo.set(key,result);return result}}
 memo.set(key,null);return null;
}
export function shuffle(a,rng=Math.random){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export class Game{
 constructor(config,rng=Math.random){this.config=config;this.rng=rng;this.wall=shuffle([...config.tiles],rng);if(this.wall.length<config.handSize*4+1)throw Error('牌面不足，请增加份数或减少起手牌。');this.hands=[[],[],[],[]];this.melds=[[],[],[],[]];this.scores=[1000,1000,1000,1000];this.discards=[];this.turn=0;this.phase='turn';this.winner=null;this.log=[];for(let i=0;i<config.handSize;i++)for(const h of this.hands)h.push(this.wall.pop());this.draw()}
 draw(){if(!this.wall.length){this.phase='end';this.log.push('牌已摸尽，本局流局');return}this.hands[this.turn].push(this.wall.pop());this.phase='turn'}
 remove(p,chars){for(const c of chars)this.hands[p].splice(this.hands[p].indexOf(c),1)}
 words(p){return this.config.words.filter(w=>has(this.hands[p],w))}
 meld(p,w,claim=false){let chars=[...w];if(claim)chars.splice(chars.indexOf(this.last.tile),1);this.remove(p,chars);this.melds[p].push(w);this.scores[p]+=claim?20:10;this.log.push(`${p===0?'我':'电脑'+p}：${claim?'碰吃':'组词'}「${w}」`);if(claim)this.discards.pop()}
 win(p,by=null){const extra=by!==null&&this.last?.by===by?[this.last.tile]:[];this.winningWords=partition([...this.hands[p],...extra],this.config.words)||[];this.winner=p;this.scores[p]+=300;if(by===null)for(let i=0;i<4;i++){if(i!==p)this.scores[i]-=100}else this.scores[by]-=300;this.phase='end';this.log.push(`${p===0?'我':'电脑'+p}${by===null?'自摸':'胡牌'}！`)}
 self(indices){if(this.phase!=='turn'||this.turn!==0)throw Error('请等待你的回合');const w=exact(indices.map(i=>this.hands[0][i]),this.config.words);if(!w)throw Error('选中的汉字尚不能组成词库中的词');this.meld(0,w);if(!this.hands[0].length)this.win(0)}
 hu(){const extra=this.phase==='claim'?[this.last.tile]:[];if(partition([...this.hands[0],...extra],this.config.words)===null)throw Error('仍有落单的字，暂时不能胡牌');this.win(0,this.phase==='claim'?this.last.by:null)}
 discard(index){if(this.phase!=='turn'||this.turn!==0)throw Error('当前不能出牌');if(!Number.isInteger(index)||index<0||index>=this.hands[0].length)throw Error('请选择一张牌');this.put(0,index);this.resolve()}
 put(p,index){const tile=this.hands[p].splice(index,1)[0];this.last={tile,by:p};this.discards.push(this.last)}
 claim(indices,type){if(this.phase!=='claim')throw Error('当前没有待响应弃牌');if(type==='吃'&&this.last.by!==3)throw Error('只能吃上家弃牌');const w=exact([...indices.map(i=>this.hands[0][i]),this.last.tile],this.config.words);if(!w)throw Error('弃牌与所选手牌不能组成词');this.meld(0,w,true);this.turn=0;this.phase='turn';if(!this.hands[0].length)this.win(0,this.last.by)}
 resolve(){const {tile,by}=this.last;for(let i=1;i<4;i++){const p=(by+i)%4;if(p&&partition([...this.hands[p],tile],this.config.words)!==null){this.win(p,by);return}}if(by!==0){this.phase='claim';return}this.pass()}
 pass(){const {tile,by}=this.last;for(let i=1;i<4;i++){const p=(by+i)%4;if(!p)continue;const w=this.config.words.find(w=>w.includes(tile)&&has([...this.hands[p],tile],w));if(w){this.meld(p,w,true);this.turn=p;this.phase='turn';return}}this.turn=(by+1)%4;this.draw()}
 ai(){if(this.phase!=='turn'||this.turn===0)return;const p=this.turn;if(partition(this.hands[p],this.config.words)!==null){this.win(p);return}while(this.words(p).length)this.meld(p,this.words(p)[0]);if(!this.hands[p].length){this.win(p);return}let best=0,score=-Infinity;for(let i=0;i<this.hands[p].length;i++){const rest=this.hands[p].filter((_,j)=>i!==j);const c=counts(rest);const s=this.config.words.reduce((n,w)=>n+[...w].reduce((m,x)=>m+(c[x]?1:0),0)**2,0)+this.rng();if(s>score){best=i;score=s}}this.put(p,best);this.resolve()}
}
