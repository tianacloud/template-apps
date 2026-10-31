import css from "./style.css?inline";
const style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);
document.body.innerHTML = "\n<div class=\"wrap\">\n<header>\n  <h1>话术<span>风险识别器</span></h1>\n  <div class=\"sub\">收到可疑短信、电话推销或\"好事\"邀约？把对方说的话粘进来，看看它踩了几条套路</div>\n</header>\n\n<div class=\"card\">\n  <h2>粘贴对方说的话</h2>\n  <div class=\"hint\">短信原文、微信消息、电话里说的关键词都可以，字数不限</div>\n  <textarea id=\"txt\" placeholder=\"例：您好，您的社保账户异常将被冻结，请点击链接验证……\"></textarea>\n  <div class=\"btns\">\n    <button class=\"primary\" id=\"run-button\">识别一下</button>\n    <button id=\"demo-button\">载入示例</button>\n    <button id=\"clear-button\">清空</button>\n  </div>\n</div>\n\n<div id=\"out\"></div>\n\n<div class=\"card\">\n  <h2>拿不准的时候，打这几个电话核实</h2>\n  <div class=\"hot\">\n    <div><div class=\"n\">96110</div><div class=\"p\">全国反诈专线，接到可疑来电、被骗后举报都打它</div></div>\n    <div><div class=\"n\">12333</div><div class=\"p\">人力资源社会保障咨询热线，社保类消息核实</div></div>\n    <div><div class=\"n\">12378</div><div class=\"p\">银行保险消费者投诉维权热线，保险类纠纷反映</div></div>\n    <div><div class=\"n\">110</div><div class=\"p\">已经转了钱，直接报警</div></div>\n  </div>\n  <div class=\"note\">\n    <b>这个工具能做什么、不能做什么</b><br>\n    它只做一件事：把你收到的文字和自己维护的<b>常见诈骗话术特征库</b>逐条比对，告诉你命中了哪些特征。<br>\n    它<b>不能</b>认定某条消息一定是诈骗，也不对任何机构或个人作出评价。命中特征多，说明风险高，应当核实；没有命中，也不代表就一定安全。<br>\n    最终判断请以上述官方热线和线下窗口的答复为准。\n  </div>\n</div>\n</div>\n\n";

var PATTERNS = [
  {k:'冒充官方机构',re:/(?:社保(?:局|中心|所)|医保(?:局|中心)|公安局?|检察院|法院|税务局|银保监|市场监管)/,
   re2:/(?:异常|冻结|停用|注销|验证|核对|转账|汇款|涉嫌|通缉|立案|洗钱|查封)/, w:3,
   t:'正规部门不会用短信、电话要求转账或点击链接处理账户问题',
   d:'挂断，自己拨打 <b>12333 / 96110</b> 核实，绝不用对方给的联系方式'},
  {k:'制造紧迫感',re:/限时|最后(一天|机会)|仅剩\d*个?(名额|席位)|马上截止|过期不候|今日必办|再不办就来不及/g, w:2,
   t:'真有政策待遇，不会要求你当天做决定',
   d:'先拖一拖。凡是要你"马上决定"的，基本都能等，第二天去窗口问'},
  {k:'承诺高额回报',re:/保本|稳赚|零风险|高额?回报|年化\d+%|收益\d+%|翻番|躺赚|月入过万/g, w:3,
   t:'收益与风险并存，承诺保本高收益的本身就是最大的风险信号',
   d:'涉及投资理财，先问自己：它凭什么给这么高？不熟悉的渠道一概不碰'},
  {k:'索要个人信息',re:/验证码|短信码|银行卡号|储蓄卡号|身份证号|身份证号码|支付密码|登录密码|卡号后四位|刷脸|人脸识别/g, w:3,
   t:'验证码等于付款授权，任何机构的工作人员都不会向你要',
   d:'一个字都不要给。已经给了的，立刻改密码并联系银行冻结'},
  {k:'要求先交钱',re:/先交|手续费|保证金|解冻费|工本费|押金|税费|垫付|刷单|任务费/g, w:3,
   t:'领钱之前先交钱，是最典型的诈骗流程',
   d:'停手。可以先交钱的"好事"不存在，直接挂断或删除'},
  {k:'诱导点击链接或扫码',re:/点击链接|点链接|点击以下|扫码|扫描二维码|下载.{0,4}(app|APP)|t\.cn|a\.cn|短链/g, w:2,
   t:'不明链接可能导向仿冒页面，用于套取账号信息',
   d:'不点、不扫。要办事就自己打开官方 APP 或去线下窗口'},
  {k:'自称内部渠道',re:/内部(名额|指标|消息|渠道|价)|有关系|领导(的)?(亲戚|朋友)|特殊通道|独家/g, w:2,
   t:'公共业务没有"内部价"，说有内部渠道的多是为了让你放下戒心',
   d:'凡是要走"关系"才办得成的，都要多问一句为什么'},
  {k:'冒充熟人或领导',re:/我是(你)?(老|领导|书记|主任|老师)|换号了|新号码|帮我(转|汇)|急用钱|不方便接电话/g, w:3,
   t:'换号借钱是冒充熟人诈骗的固定套路',
   d:'用原来的号码或当面确认。涉及转账，一定要打通电话听到本人声音'},
  {k:'中奖与免费诱惑',re:/中奖|被抽中|免费领取|免费(领|送|拿)|补贴到账|退还|返还|扫码领/g, w:2,
   t:'没有参加过的活动不会平白中奖',
   d:'不填资料、不点链接，直接删除'},
  {k:'恐吓与威胁',re:/不处理将|逾期不候|被(冻结|注销|停用|起诉|追究)|承担法律(责任|后果)|影响(征信|子女|退休|发放|领取|待遇)|后果自负/g, w:2,
   t:'用恐惧逼你快速行动，是诈骗的常用手段',
   d:'征信、社保这类事项都有正规查询和处理渠道，不存在"不马上办就出事"'}
];

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function run(){
  var raw = document.getElementById('txt').value.trim();
  var out = document.getElementById('out');
  if(!raw){ out.innerHTML = '<div class="card"><div class="hint">先把对方说的话粘进来，再点识别</div></div>'; return; }

  var hits = [];
  PATTERNS.forEach(function(p){
    var m = raw.match(p.re) || [];
    if(p.re2){
      // 组合型：机构词 + 动作词 必须同时出现，避免把中性名词误判为风险
      var m2 = raw.match(p.re2);
      if(!m.length || !m2) return;
      m = m.concat(m2);
    }
    if(m.length){
      var uniq = [];
      m.forEach(function(x){ if(uniq.indexOf(x) < 0) uniq.push(x) });
      hits.push({p:p, samples:uniq.slice(0,4)});
    }
  });
  hits.sort(function(a,b){return b.p.w - a.p.w});

  var score = hits.reduce(function(s,h){return s + h.p.w}, 0);
  var high = hits.filter(function(h){return h.p.w >= 3}).length;

  var lv, cls, desc;
  if(high >= 2 || score >= 8){
    lv = '高风险'; cls = 'v-danger';
    desc = '这段话同时踩中多条典型诈骗特征。不要回复、不要点击、不要转账。';
  } else if(high >= 1 || score >= 4){
    lv = '需要警惕'; cls = 'v-warn';
    desc = '存在可疑表述，建议先通过官方渠道核实，再决定要不要继续。';
  } else if(hits.length){
    lv = '轻微可疑'; cls = 'v-warn';
    desc = '命中少量特征，不足以判断，但多问一句总不会错。';
  } else {
    lv = '未命中特征'; cls = 'v-ok';
    desc = '这段文字没有命中特征库里的常见话术。注意：这不等于它一定安全。';
  }

  var bars = '';
  var maxScore = 12;
  for(var i = 0; i < 8; i++){
    var on = score > i * (maxScore / 8);
    var mid = on && score < 8;
    bars += '<i class="' + (on ? (mid ? 'mid' : 'on') : '') + '"></i>';
  }

  var html = '<div class="verdict ' + cls + '">' +
    '<div class="lv">' + lv + '</div>' +
    '<div class="desc">' + desc + '</div>' +
    '<div class="score">' + bars + '</div>' +
    '</div>';

  if(hits.length){
    html += '<div class="card"><h2>命中了 ' + hits.length + ' 类特征</h2>';
    hits.forEach(function(h){
      html += '<div class="item' + (h.p.w >= 3 ? '' : ' mid') + '">' +
        '<div class="t"><span>' + h.p.k + '</span><span class="tagn">' + (h.p.w >= 3 ? '高风险' : '需留意') + '</span></div>' +
        '<div class="q">' + esc(h.samples.join(' / ')) + '</div>' +
        '<div class="w">' + h.p.t + '</div>' +
        '<div class="d">怎么做：' + h.p.d + '</div>' +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="card"><h2>没有命中任何特征</h2><div class="clean">这段文字没有匹配到特征库中的常见话术。<br>提示：诈骗手法一直在变，特征库覆盖不到的新套路是存在的。涉及钱和个人信息，一律通过官方渠道核实后再行动。</div></div>';
  }

  out.innerHTML = html;
}

function loadDemo(){
  document.getElementById('txt').value =
'【社保中心】您好，您的社保账户出现异常，将于今日被冻结停用。为保障您正常享受待遇，请点击链接 t.cn/xxxx 完成验证，并按要求填写身份证号、银行卡号及短信验证码。逾期未处理将影响您的养老金发放。这是最后一天处理期限，请尽快办理。';
  run();
}

loadDemo();

window.run=run; window.loadDemo=loadDemo;

document.getElementById("run-button").addEventListener("click",run);
document.getElementById("demo-button").addEventListener("click",loadDemo);
document.getElementById("clear-button").addEventListener("click",()=>{document.getElementById("txt").value=""; document.getElementById("out").innerHTML=""});
