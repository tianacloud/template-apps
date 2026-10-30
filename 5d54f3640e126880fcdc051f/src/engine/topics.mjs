const TOPIC_CLASSES = Object.freeze([
  Object.freeze({
    key: "wealth",
    god: Object.freeze({ relatives: Object.freeze(["\u59BB\u8D22"]), reason: "\u6C42\u8D22\u53D6\u59BB\u8D22\uFF1A\u8D22\u723B\u662F\u6C42\u6D4B\u8005\u53EF\u4EE5\u652F\u914D\u3001\u53EF\u4EE5\u5230\u624B\u7684\u8D44\u6E90\u3002" }),
    label: "\u8D22\u8FD0",
    element: "\u91D1",
    reason: "\u91D1\u4E3A\u8D22\uFF0C\u6885\u82B1\u4EE5\u91D1\u4E3B\u8D22\u5E1B\u3001\u8D27\u5229\u3001\u5F97\u5931\u3002",
    // 进货、货款、卖掉这类买卖行话原先不在表里，「这批货该不该进」「该不该进货」一律认不出，
    // 问的人十有八九是问财，不该因为措辞不像「赚钱」就断成没写问题。
    keywords: Object.freeze([
      "\u5DE5\u8D44",
      "\u85AA\u6C34",
      "\u878D\u8D44",
      "\u80A1\u7968",
      "\u6295\u8D44",
      "\u62A5\u4EF7",
      "\u6536\u76CA",
      "\u4E70\u5356",
      "\u751F\u610F",
      "\u8D5A\u94B1",
      "\u4E8F",
      "\u94B1",
      "\u8D22",
      "\u8FDB\u8D27",
      "\u8D27\u6B3E",
      "\u8BA2\u8D27",
      "\u5229\u6DA6",
      "\u8425\u6536",
      "\u5356",
      "\u9500",
      "\u8D27"
    ])
  }),
  Object.freeze({
    key: "career",
    god: Object.freeze({ relatives: Object.freeze(["\u5B98\u9B3C"]), reason: "\u6C42\u804C\u3001\u5347\u8FC1\u53D6\u5B98\u9B3C\uFF0C\u5B98\u9B3C\u4E3A\u804C\u4F4D\u4E0E\u4E0A\u53F8\uFF1B\u8003\u8BD5\u3001\u6587\u51ED\u53E6\u53D6\u7236\u6BCD\u3002" }),
    label: "\u4E8B\u4E1A\u529F\u540D",
    element: "\u706B",
    reason: "\u706B\u4E3B\u6587\u660E\u4E0E\u663E\u8FBE\uFF0C\u6885\u82B1\u4EE5\u706B\u4E3B\u540D\u58F0\u3001\u804C\u4F4D\u3001\u4E0A\u4F4D\u8005\u7684\u7167\u62C2\u3002",
    keywords: Object.freeze(["\u5347\u804C", "\u8DF3\u69FD", "\u9762\u8BD5", "\u5F55\u7528", "\u521B\u4E1A", "\u5DE5\u4F5C", "\u4E8B\u4E1A", "\u524D\u7A0B", "\u9879\u76EE", "\u8001\u677F", "\u4E0A\u53F8", "\u804C\u4F4D", "offer"])
  }),
  Object.freeze({
    key: "love",
    god: Object.freeze({ relatives: Object.freeze(["\u59BB\u8D22", "\u5B98\u9B3C"]), byGender: true, reason: "\u300A\u589E\u5220\u535C\u6613\u300B\u300C\u7537\u6D4B\u5A5A\u4EE5\u8D22\u4E3A\u7528\uFF0C\u5973\u6D4B\u5A5A\u4EE5\u5B98\u4E3A\u7528\u300D\uFF1A\u7537\u5360\u53D6\u59BB\u8D22\uFF08\u5973\u65B9\uFF09\uFF0C\u5973\u5360\u53D6\u5B98\u9B3C\uFF08\u7537\u65B9\uFF09\u3002\u672C\u5305\u4E0D\u66FF\u6C42\u6D4B\u8005\u8BA4\u6027\u522B\uFF0C\u4E24\u4EB2\u90FD\u5217\u51FA\u6765\u3002" }),
    label: "\u611F\u60C5",
    element: "\u6C34",
    reason: "\u6C34\u4E3B\u6D41\u52A8\u4E0E\u6697\u6627\uFF0C\u6885\u82B1\u4EE5\u6C34\u4E3B\u60C5\u6B32\u3001\u66A7\u6627\u3001\u5F80\u6765\u4E0D\u5B9A\u3002",
    keywords: Object.freeze([
      "\u6697\u604B",
      "\u590D\u5408",
      "\u5206\u624B",
      "\u633D\u56DE",
      "\u66A7\u6627",
      "\u8868\u767D",
      "\u5728\u4E00\u8D77",
      "\u611F\u60C5",
      "\u604B\u7231",
      "\u4EA4\u5F80",
      "\u5FC3\u52A8",
      "\u4E3B\u52A8",
      "\u56DE\u5934",
      "\u559C\u6B22",
      // 「前任」「旧情」是别的类都不占的名词，加进来不会跟财运的「钱」之类抢。
      // 「回来」「找我」没加：这两个词跟财运、出行寻物共用，「这笔钱什么时候回来」
      // 会被判成感情——宁可认不出，也不把卦算到别的事上去。
      "\u524D\u4EFB",
      "\u65E7\u60C5"
    ])
  }),
  Object.freeze({
    key: "marriage",
    god: Object.freeze({ relatives: Object.freeze(["\u59BB\u8D22", "\u5B98\u9B3C"]), byGender: true, reason: "\u300A\u589E\u5220\u535C\u6613\u300B\u300C\u7537\u6D4B\u5A5A\u4EE5\u8D22\u4E3A\u7528\uFF0C\u5973\u6D4B\u5A5A\u4EE5\u5B98\u4E3A\u7528\u300D\uFF1A\u7537\u5360\u53D6\u59BB\u8D22\uFF0C\u5973\u5360\u53D6\u5B98\u9B3C\u3002" }),
    label: "\u5A5A\u604B",
    element: "\u6728",
    reason: "\u6728\u4E3B\u751F\u53D1\u4E0E\u5339\u914D\uFF0C\u6885\u82B1\u4EE5\u6728\u4E3B\u5A5A\u59FB\u3001\u914D\u5076\u3001\u957F\u8F88\u4E4B\u5141\u3002",
    // 补一个单字「婚」：「这婚要不要定」这类写法原先认不出，而婚在九个事类里
    // 只有婚恋用，不跟任何一类相撞。
    keywords: Object.freeze(["\u7ED3\u5A5A", "\u5A5A\u59FB", "\u5A5A\u671F", "\u5A5A", "\u76F8\u4EB2", "\u9886\u8BC1", "\u5AC1", "\u5A36", "\u914D\u5076", "\u5BF9\u8C61", "\u8001\u516C", "\u8001\u5A46"])
  }),
  Object.freeze({
    key: "health",
    god: Object.freeze({ relatives: Object.freeze(["\u5B98\u9B3C", "\u5B50\u5B59"]), reason: "\u5360\u75C5\u4EE5\u5B98\u9B3C\u4E3A\u75C5\u75C7\u672C\u8EAB\uFF0C\u4EE5\u5B50\u5B59\u4E3A\u533B\u836F\u3002", relate: "\u5B50\u5B59\u514B\u5B98\u9B3C\uFF1A\u5B50\u5B59\u6709\u529B\u5219\u75C5\u9000\uFF0C\u5B98\u9B3C\u53D7\u5236\u5219\u75C5\u8F7B\u3002" }),
    label: "\u75BE\u75C5",
    element: "\u571F",
    reason: "\u571F\u4E3B\u5F62\u4F53\u4E0E\u813E\u80C3\uFF0C\u6885\u82B1\u4EE5\u571F\u4E3B\u8089\u8EAB\u3001\u75BE\u5384\u3001\u5C45\u5904\u3002",
    keywords: Object.freeze(["\u4F53\u68C0", "\u624B\u672F", "\u5EB7\u590D", "\u5065\u5EB7", "\u8EAB\u4F53", "\u5403\u836F", "\u68C0\u67E5", "\u75C5"])
  }),
  Object.freeze({
    key: "study",
    god: Object.freeze({ relatives: Object.freeze(["\u7236\u6BCD"]), reason: "\u7236\u6BCD\u4E3A\u6587\u4E66\u3001\u6210\u7EE9\u4E0E\u8BC1\u7167\uFF0C\u95EE\u8003\u8BD5\u53D6\u7236\u6BCD\u723B\u3002" }),
    label: "\u5B66\u4E1A\u6587\u4E66",
    element: "\u6728",
    reason: "\u6728\u4E3B\u6587\u660C\u4E0E\u9752\u5377\uFF0C\u6885\u82B1\u4EE5\u6728\u4E3B\u6587\u4E66\u3001\u79D1\u540D\u3001\u8003\u8BD5\u4E0E\u6279\u590D\u3002",
    keywords: Object.freeze(["\u8003\u8BD5", "\u5B66\u4E1A", "\u8BBA\u6587", "\u8BC1\u7167", "\u6267\u7167", "\u8D44\u683C", "\u5F55\u53D6", "\u8BC1\u4E66", "\u7533\u8BF7", "\u6750\u6599"])
  }),
  Object.freeze({
    key: "property",
    god: Object.freeze({ relatives: Object.freeze(["\u7236\u6BCD"]), reason: "\u623F\u820D\u3001\u5951\u7EA6\u7686\u5C5E\u7236\u6BCD\uFF0C\u5951\u636E\u4E3A\u7236\u6BCD\u6240\u4E3B\u3002" }),
    label: "\u623F\u4EA7\u8F66\u5951",
    element: "\u571F",
    reason: "\u571F\u4E3A\u4E0D\u52A8\u4E4B\u8C61\uFF0C\u6885\u82B1\u4EE5\u571F\u4E3B\u5B85\u820D\u3001\u8F66\u8F86\u3001\u5951\u636E\u4E0E\u5B89\u987F\u3002",
    keywords: Object.freeze(["\u4E70\u623F", "\u79DF\u623F", "\u642C\u5BB6", "\u7F6E\u4E1A", "\u88C5\u4FEE", "\u8D37\u6B3E", "\u5408\u540C", "\u623F\u4EA7", "\u8F66", "\u623F"])
  }),
  Object.freeze({
    key: "dispute",
    god: Object.freeze({ relatives: Object.freeze(["\u5B98\u9B3C"]), reason: "\u5B98\u53F8\u53D6\u5B98\u9B3C\uFF0C\u5B98\u9B3C\u4E3A\u5BF9\u65B9\u4E0E\u5B98\u975E\uFF1B\u6211\u514B\u5B98\u9B3C\u5219\u6211\u80DC\u3002" }),
    label: "\u5B98\u8BBC\u662F\u975E",
    element: "\u91D1",
    reason: "\u91D1\u4E3B\u8083\u6740\u4E0E\u5F8B\u4EE4\uFF0C\u6885\u82B1\u4EE5\u91D1\u4E3B\u5B98\u975E\u3001\u8BC4\u5224\u3001\u8D54\u507F\u4E0E\u5F3A\u5236\u3002",
    keywords: Object.freeze(["\u8D54\u507F", "\u4EF2\u88C1", "\u4E3E\u62A5", "\u5B98\u53F8", "\u8BC9\u8BBC", "\u8D77\u8BC9", "\u7EA0\u7EB7", "\u662F\u975E", "\u7ACB\u6848"])
  }),
  Object.freeze({
    key: "journey",
    god: Object.freeze({ relatives: Object.freeze(["\u59BB\u8D22"]), reason: "\u5931\u7269\u53D6\u59BB\u8D22\u2014\u2014\u6240\u6C42\u4E4B\u7269\u4EE5\u8D22\u8BBA\u3002\u5BFB\u4EBA\u5219\u987B\u6309\u4E0E\u5931\u8E2A\u8005\u7684\u5173\u7CFB\u53E6\u53D6\u516D\u4EB2\uFF0C\u672C\u5305\u4E0D\u66FF\u4F60\u731C\u5173\u7CFB\u3002" }),
    label: "\u51FA\u884C\u5BFB\u7269",
    element: "\u6C34",
    reason: "\u6C34\u4E3B\u884C\u65C5\u4E0E\u9690\u533F\uFF0C\u6885\u82B1\u4EE5\u6C34\u4E3B\u8FDC\u884C\u3001\u5931\u7269\u4E0E\u5BFB\u8BBF\u3002",
    keywords: Object.freeze(["\u51FA\u5DEE", "\u5DEE\u65C5", "\u7B7E\u8BC1", "\u884C\u7A0B", "\u51FA\u884C", "\u8FDC\u884C", "\u9057\u5931", "\u5931\u7269", "\u4E22\u5931", "\u5BFB\u4EBA", "\u627E\u56DE", "\u627E\u5230", "\u5BFB", "\u4E22"])
  })
]);
const MATCH_ORDER = Object.freeze(
  [...TOPIC_CLASSES].flatMap((topic) => topic.keywords.map((keyword) => ({ topic, keyword }))).sort((a, b) => b.keyword.length - a.keyword.length)
);
const BY_KEYWORD = new Map(MATCH_ORDER.map((entry) => [entry.keyword, entry.topic]));
function detectTopic(question) {
  const text = (question ?? "").trim();
  if (!text) return null;
  for (const [keyword, topic] of BY_KEYWORD) {
    if (text.includes(keyword)) return topic;
  }
  return null;
}
function topicByKey(key) {
  return typeof key === "string" ? TOPIC_CLASSES.find((topic) => topic.key === key) ?? null : null;
}
const TOPIC_KEYS = Object.freeze(TOPIC_CLASSES.map((topic) => topic.key));
function godRelation(godElement, bodyElement, generates, overcomes) {
  if (generates(godElement, bodyElement)) {
    return { key: "god-generates-body", tone: "good", text: `\u7C7B\u795E${godElement}\u751F\u4F53\u5366${bodyElement}\uFF0C\u6240\u95EE\u4E4B\u4E8B\u5BF9\u4F60\u6709\u8865\u76CA\uFF0C\u591A\u4E3B\u5916\u529B\u5728\u6258\u7740\u4F60\u3002` };
  }
  if (overcomes(godElement, bodyElement)) {
    return { key: "god-overcomes-body", tone: "bad", text: `\u7C7B\u795E${godElement}\u514B\u4F53\u5366${bodyElement}\uFF0C\u6240\u95EE\u4E4B\u4E8B\u538B\u7740\u4F60\uFF0C\u591A\u4E3B\u4F60\u8981\u4E3B\u52A8\u5E94\u4ED8\u3001\u4E0D\u80FD\u8BA9\u5176\u7275\u7740\u8D70\u3002` };
  }
  if (generates(bodyElement, godElement)) {
    return { key: "body-generates-god", tone: "bad", text: `\u4F53\u5366${bodyElement}\u751F\u7C7B\u795E${godElement}\uFF0C\u4F60\u5728\u5F80\u8FD9\u4EF6\u4E8B\u4E0A\u4F7F\u529B\uFF0C\u591A\u4E3B\u4F60\u8981\u591A\u82B1\u5FC3\u601D\u4E0E\u672C\u94B1\u3002` };
  }
  if (overcomes(bodyElement, godElement)) {
    return { key: "body-overcomes-god", tone: "good", text: `\u4F53\u5366${bodyElement}\u514B\u7C7B\u795E${godElement}\uFF0C\u8FD9\u4EF6\u4E8B\u5728\u4F60\u638C\u63E1\u4E4B\u4E2D\uFF0C\u591A\u4E3B\u4E3B\u52A8\u6743\u5F52\u4F60\u3002` };
  }
  return { key: "god-same-as-body", tone: "flat", text: `\u7C7B\u795E\u4E0E\u4F53\u5366\u540C\u4E3A${godElement}\uFF0C\u6240\u95EE\u4E4B\u4E8B\u4E0E\u4F60\u7684\u5904\u5883\u540C\u6C14\uFF0C\u5B9C\u987A\u5176\u52BF\u800C\u4E0D\u5B9C\u5F3A\u6C42\u6539\u53D8\u3002` };
}
export {
  TOPIC_CLASSES,
  TOPIC_KEYS,
  detectTopic,
  godRelation,
  topicByKey
};
