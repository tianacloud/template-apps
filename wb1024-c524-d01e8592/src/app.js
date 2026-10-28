const style=document.createElement("link"); style.rel="stylesheet"; style.href=new URL("./app.css",import.meta.url); document.head.append(style);
document.body.innerHTML="\n<canvas data-page-node-id=\"JvFXuVS1RFNvTYp15T6IIm\" id=\"rain\"></canvas>\n\n<header data-page-node-id=\"dDaxI3jKfekp9tBcIBBoVE\" class=\"top\">\n  <div data-page-node-id=\"334VrKDzYcg40EczwKv4zs\" class=\"brand\">\n    <div data-page-node-id=\"0VpwcKsdjaTwjxIAIwu5Ce\" class=\"logo\"><!--pnid:G2LoUZDB8X30ir4Yq8TeH6-->1024</div>\n    <div data-page-node-id=\"s4dnHSt8rp5o18CivEvgJU\">\n      <div data-page-node-id=\"IVrH1o8RH6E8AYSXvkawAP\" class=\"name\"><!--pnid:1bjukPrP1T9dl3GZ94Rpnu-->造物工具箱</div>\n      <div data-page-node-id=\"nZwSDeP4upGDgA9wzcXqSU\" class=\"sub\"><!--pnid:OwZiDDoqbgQSYMKZU0lDnz-->1024 程序员节 · 应用创作大赛参赛作品</div>\n    </div>\n  </div>\n  <div data-page-node-id=\"zCZmCNnWc06WgfiOkEeERh\" class=\"badge\"><!--pnid:B2di9xqODJm7EBU14L9exT-->2^10 = 1024</div>\n</header>\n\n<div data-page-node-id=\"Cy9vENbKImbbrdiUCRhXK8\" class=\"wrap\">\n  <section data-page-node-id=\"pkZYEjUv2SpHuF1Q5VKx7j\" class=\"hero\">\n    <h1 data-page-node-id=\"FESJNdbxfKkwJ7LZ6u2M9b\"><!--pnid:zawuvBprT7pwQTbYSSp9IW-->程序员的随身工具箱</h1>\n    <p data-page-node-id=\"OX5sXWyGd63tOS1MBurHKZ\"><!--pnid:x66yNTqfnHKgAZvXqeAzNQ-->时间戳、进制、JSON、正则、Base64、URL、颜色、哈希 —— 一个页面，全搞定。</p>\n    <div data-page-node-id=\"C2gb5laX62NH27EnQfibWJ\" class=\"ts\"><span data-page-node-id=\"zKTUPq9n5gOe0tlUr5R6j1\" class=\"dot\"></span><span data-page-node-id=\"IMKACvZc4qVd4nBeipb241\" id=\"liveTs\"><!--pnid:0A0Mxsvmcv86FbDDoFnicn-->当前时间戳加载中…</span></div>\n  </section>\n\n  <div data-page-node-id=\"JVmON3w75bTSQnjuHHHElf\" class=\"layout\">\n    <nav data-page-node-id=\"uroqSsD4L8OngG3zlbQRMQ\" class=\"tabs\" id=\"tabs\">\n      <div data-page-node-id=\"QZmEQqktiwVj6ojbNhyMp3\" class=\"tab active\" data-t=\"ts\"><span data-page-node-id=\"g7trwsCtmWJwMg8uwwTPLx\" class=\"ic\"><!--pnid:hN4GkPHspNl2PfxG2e6HKc-->⏱</span><span data-page-node-id=\"4l5EwFXejQgmmP85kG0iJu\" class=\"lbl\"><!--pnid:cDvoRWPrlKBckOPDXitlnp-->时间戳</span><span data-page-node-id=\"7qpIHO2FGmf9TfwVsTRTdG\" class=\"key\"><!--pnid:iKJIHqvyIplMMe1Omj0is9-->ts</span></div>\n      <div data-page-node-id=\"uGoJnouaKqncyGCruDurdy\" class=\"tab\" data-t=\"base\"><span data-page-node-id=\"gKkTa4Fo4UOgEvyv7Oq9Xp\" class=\"ic\"><!--pnid:UFufsmsn7JYrstCZHbHpaP-->🔢</span><span data-page-node-id=\"fSII9Pa88wv6SVqEq4B1hW\" class=\"lbl\"><!--pnid:UYEfEqEu4vTdH9NHVoywEO-->进制转换</span><span data-page-node-id=\"aVkShds5OqhX4jZKBzEosn\" class=\"key\"><!--pnid:OWwlw8sgei6KLsxnmkEdL4-->base</span></div>\n      <div data-page-node-id=\"OZgrFFD1ti8GVkHp7zqwmY\" class=\"tab\" data-t=\"json\"><span data-page-node-id=\"CYqMlSHaq3NxpeeXSFqpkg\" class=\"ic\"><!--pnid:jCA2flfzs5SkdUgDC2MlqB-->📋</span><span data-page-node-id=\"xouFGtQC5CSkhIpx2ESPie\" class=\"lbl\"><!--pnid:q98EIWouWYT5bfbb7h32Q8-->JSON 工具</span><span data-page-node-id=\"54NNgYKsoiUy5qJZzHfpj1\" class=\"key\"><!--pnid:uPBygW91fYckkoAh0ErNXm-->json</span></div>\n      <div data-page-node-id=\"9ufGhFLzrbVqNvtRyHdCDk\" class=\"tab\" data-t=\"regex\"><span data-page-node-id=\"hmc5cnU3KlGyDkv1hH8Lq6\" class=\"ic\"><!--pnid:aol3pSQNMbxYlD9Utbo0qe-->🔍</span><span data-page-node-id=\"EXYznWV80MenLUyl0rbKlV\" class=\"lbl\"><!--pnid:E7pxhS8Gg5S9jikc8PgTLP-->正则测试</span><span data-page-node-id=\"VV517GZWVe7AfNQ3QavSvH\" class=\"key\"><!--pnid:PuPP4n169RC6mU5yDizEpj-->re</span></div>\n      <div data-page-node-id=\"wsYWxDiyNpB4FT5D9joPB3\" class=\"tab\" data-t=\"b64\"><span data-page-node-id=\"OIRAutWyKUBWiDfPUx4UJ8\" class=\"ic\"><!--pnid:P4KyOld3QGj7gzwSL0iUhr-->🔐</span><span data-page-node-id=\"aXn82DqXIACDfIcExXApkI\" class=\"lbl\"><!--pnid:6EetLrxo7VpsvBPtiZkF52-->Base64</span><span data-page-node-id=\"igLOkFgV6EL6ZK94ilaWoS\" class=\"key\"><!--pnid:LSUzk0nRmNPCS4HttRVgAP-->b64</span></div>\n      <div data-page-node-id=\"ohHg5SWfYR6mOuOSI9LruU\" class=\"tab\" data-t=\"url\"><span data-page-node-id=\"90AXhYuvSoSdQ6N5a8snZA\" class=\"ic\"><!--pnid:UrdpOrb2oZSmBX1m3lfwgU-->🔗</span><span data-page-node-id=\"WLIKKJcGFAaTlq0CWrWSiF\" class=\"lbl\"><!--pnid:eFIb7leXef8xYNU8tFnGFU-->URL 编解码</span><span data-page-node-id=\"wsFnEdzdE1yPPTVF0eaGkx\" class=\"key\"><!--pnid:NACQ5V7RU2vyOdD2F20twa-->url</span></div>\n      <div data-page-node-id=\"HYvMyEpIMWAztvf7wLJwIo\" class=\"tab\" data-t=\"color\"><span data-page-node-id=\"NoYj5NR8vDRsR59j70j59k\" class=\"ic\"><!--pnid:kLjy4d5ceOpvx5PRw1ARGQ-->🎨</span><span data-page-node-id=\"9AIaa4e4ql2ss8sosG4Gf0\" class=\"lbl\"><!--pnid:ZPrWBn7Yr6IMXGoMcGrwFz-->颜色转换</span><span data-page-node-id=\"YqP2Byk0kw5mAsGGH6XqIK\" class=\"key\"><!--pnid:hAoOuTy0C7oKPAOElExfhn-->hex</span></div>\n      <div data-page-node-id=\"SIkjfC9o2G2otka55pj1A5\" class=\"tab\" data-t=\"hash\"><span data-page-node-id=\"LrBH8IY8zEtjrhpcTQD2Jy\" class=\"ic\"><!--pnid:zS8RPdSMhM1LJVBF6sDCkz-->🧬</span><span data-page-node-id=\"4d7amAoJ18ifYQ6Y6Kfdlb\" class=\"lbl\"><!--pnid:6KJzIuWF7XiaGjtvKEKpEE-->哈希 / UUID</span><span data-page-node-id=\"wzUgIc3BpbeshVdV69Isps\" class=\"key\"><!--pnid:pDfK3LRoGMEXQ3js3Aab8C-->hash</span></div>\n    </nav>\n\n    <main data-page-node-id=\"XQXPKdD5hzY0WRUJLNvIN3\">\n      <!--pnid:tlNDKq5P82vJ8YWEqkVWM7--><!-- 时间戳 -->\n      <section data-page-node-id=\"1Qs87dDpkJ4WPli4QmW3SJ\" class=\"panel\" id=\"p-ts\">\n        <h2 data-page-node-id=\"Fw3gTNWCyJWGmCgHqlxTq1\"><!--pnid:eJEohnaN1djmvZDbGNvdGn-->⏱ 时间戳 ⇄ 日期</h2>\n        <div data-page-node-id=\"c6LWLlG9M8Et6cOYz1AzIY\" class=\"desc\"><!--pnid:UODnVUTOwY0GlbIMWswBBc-->支持秒 / 毫秒自动识别，本地时区与 UTC 同时给出。</div>\n        <div data-page-node-id=\"1Oka61Ji5z9SGIiNnh5Z1h\" class=\"tool\">\n          <div data-page-node-id=\"1dI6w3DVNl0n6hVShStAX6\" class=\"row\">\n            <div data-page-node-id=\"9OZ4gem3TwUaBNUMQjqm0A\" style=\"flex:3\"><label data-page-node-id=\"7tRK1OalzEcVu9wBRB24AO\"><!--pnid:BQxHTnK2xfuGA96XDJPtYt-->时间戳（秒或毫秒）</label><input data-page-node-id=\"VMON2lLeEt0tkkMDd0NH0v\" id=\"tsInput\" placeholder=\"例如 1761091200\"></div>\n            <div data-page-node-id=\"f3wsJRjSdY5ffFHuFT8B2K\" style=\"flex:1; display:flex; gap:8px; align-items:flex-end\">\n              <button data-page-node-id=\"8IxWoaxJu3ahqQVZJmTWxL\" class=\"btn\" data-action=\"0\"><!--pnid:j3u6KQ8qFDnGC76tWbbNcb-->转日期 →</button>\n              <button data-page-node-id=\"okwRkU2KO8iJmr4rOYP8pu\" class=\"btn ghost\" data-action=\"1\"><!--pnid:FmNQm89xF9VBZjtBrP4mzg-->现在</button>\n            </div>\n          </div>\n          <div data-page-node-id=\"zgbx1GxUoOKpvX2w5LYQbv\" class=\"out\" id=\"tsOut\"><!--pnid:8vYJlXg7qK7guUBqqnk3Ca-->等待输入…</div>\n          <div data-page-node-id=\"JNlPraTvAADwmgvKjxSha9\">\n            <label data-page-node-id=\"6Jcl6UCWVfNGnzObuVHXlK\"><!--pnid:G2iDcX5ictNqUzEYgtpOUP-->日期 → 时间戳</label>\n            <div data-page-node-id=\"Jwuj6qt18dFVhs3x49UI9v\" class=\"row\">\n              <input data-page-node-id=\"9j2UhbJYz55dQEabAtrWcq\" id=\"dateInput\" step=\"1\" type=\"datetime-local\">\n              <button data-page-node-id=\"IDJF1xZVK3K65NHhCZgAUh\" class=\"btn\" data-action=\"2\"><!--pnid:5ByLIutELFynxxqHkDbb5l-->转时间戳 →</button>\n            </div>\n          </div>\n        </div>\n      </section>\n\n      <!--pnid:EcZWusCguRI5ZqNBeiQvQD--><!-- 进制转换 -->\n      <section data-page-node-id=\"zh2HFN7Z4I6RwQr7agCEuu\" class=\"panel hidden\" id=\"p-base\">\n        <h2 data-page-node-id=\"DeqSPmFhCUrP7yPwq6QUYr\"><!--pnid:hBFsxoXwPSANlEoaR35vRF-->🔢 进制转换</h2>\n        <div data-page-node-id=\"Jp3vKEFQA3ACrfKEMw8czF\" class=\"desc\"><!--pnid:CGCqPLqU5ZVRE0BDISJw6V-->二进制 / 八进制 / 十进制 / 十六进制 互转，自动识别非法字符。</div>\n        <div data-page-node-id=\"8Y0UHARcay3OK0ESg9Sze2\" class=\"tool\">\n          <div data-page-node-id=\"cMjFthx5ycdZ0iwLHgwBC3\" class=\"row\">\n            <div data-page-node-id=\"32Jo9oz7gjdleKs9LLvE4W\">\n              <label data-page-node-id=\"Pz1IV23UPuboDLZ06xAc68\"><!--pnid:Vjoc0o2NZxOXz3XgGxJI7T-->输入进制</label>\n              <select data-page-node-id=\"8rDADPRnHs7mNrgj7e6GN3\" id=\"fromBase\">\n                <option data-page-node-id=\"JcgmZMHz6JfiaD7XJpjBGH\" value=\"2\"><!--pnid:2DrCLIb6mAg45ORb0cWtkM-->2 · 二进制</option>\n                <option data-page-node-id=\"QMSaiJYeyGaTNuYxkTz5K4\" value=\"8\"><!--pnid:SiQtKsVrJ7Pc8PojkmeTU4-->8 · 八进制</option>\n                <option data-page-node-id=\"mBB2nqU7VBKYK50smT7b1m\" selected value=\"10\"><!--pnid:KQyNrFGrTs7P0KBHaXEjzf-->10 · 十进制</option>\n                <option data-page-node-id=\"Hh7pvzMPUiENptG7gK4nQR\" value=\"16\"><!--pnid:5FARPA5KvDuZcAUyB4Pec5-->16 · 十六进制</option>\n              </select>\n            </div>\n            <div data-page-node-id=\"xAlJa73AE9q7voLBaGoWr6\" style=\"flex:2\"><label data-page-node-id=\"ZkCOWJ770r4Hhf62bXeKSW\"><!--pnid:NfJVPB4UpjYEnj5BOTSO0R-->数值</label><input data-page-node-id=\"zPYdzGPRVkiuB9XhtCa5R4\" id=\"baseInput\" placeholder=\"例如 1024\"></div>\n            <div data-page-node-id=\"WyXw9DeZiz54Ig4qsw5cdd\" style=\"flex:0 0 auto; display:flex; align-items:flex-end\"><button data-page-node-id=\"zkqpdW5946OnzTwOpFeakK\" class=\"btn\" data-action=\"3\"><!--pnid:c7h9M5UgtzhG8rKiT6otOZ-->转换 →</button></div>\n          </div>\n          <div data-page-node-id=\"e444EhJPXCLAIq2SsID0U5\" class=\"grid3\" id=\"baseOut\"></div>\n        </div>\n      </section>\n\n      <!--pnid:HTtc0IL5JRcMA4kPwdTs2H--><!-- JSON -->\n      <section data-page-node-id=\"LOjXzUaXwxjsEWP1qCML50\" class=\"panel hidden\" id=\"p-json\">\n        <h2 data-page-node-id=\"u8S9738JZR0fVhVAJDwvHn\"><!--pnid:8HigS7bQzJWD9B0c8EW0pX-->📋 JSON 格式化 / 校验</h2>\n        <div data-page-node-id=\"lMP56MSsTYokHJkvUjHhB4\" class=\"desc\"><!--pnid:l1kQCW9fUaewCAoNRskvbU-->一键美化、压缩、校验 JSON，语法错误会高亮提示。</div>\n        <div data-page-node-id=\"khzlvBkUr6bJs2MM6bQt7r\" class=\"tool\">\n          <textarea data-page-node-id=\"tj5989dQlFSKC4gRRhjh6f\" id=\"jsonInput\" placeholder=\"{\"hello\":\"world\", \"code\": 1024}\"></textarea>\n          <div data-page-node-id=\"tcAyY9nHCxO8fHarNDi7bE\" class=\"row\">\n            <button data-page-node-id=\"liLBmDgTilIq7r55OR4igb\" class=\"btn\" data-action=\"4\"><!--pnid:D6SH1gL917JdLCrt1ClQ08-->格式化</button>\n            <button data-page-node-id=\"EZ21VztAlPOH8uzAhS4A3P\" class=\"btn ghost\" data-action=\"5\"><!--pnid:RSq5G263XpBTOmktGu2Yb7-->压缩</button>\n            <button data-page-node-id=\"PfwJqCvrDAGql5nmJEUpza\" class=\"btn ghost\" data-action=\"6\"><!--pnid:ZmIXy8plbkFMvqBZshyIM4-->校验</button>\n            <button data-page-node-id=\"FD7Nh4QThARxJuErtxvAYf\" class=\"btn ghost\" data-action=\"7\"><!--pnid:vpgkZ1lMJ0ged2z2io1YQm-->复制</button>\n          </div>\n          <div data-page-node-id=\"gsIsPKUo50PreGyVEkveyL\" class=\"out\" id=\"jsonOut\"><!--pnid:6utPMxxJfTNHUbkOYHb4dq-->等待输入…</div>\n        </div>\n      </section>\n\n      <!--pnid:7eGsVZpSZurCRfkxjJZJMO--><!-- 正则 -->\n      <section data-page-node-id=\"ggfsCm7Dq1TopZ2K9q5WjS\" class=\"panel hidden\" id=\"p-regex\">\n        <h2 data-page-node-id=\"XfDnlppHY0BEU276P779GX\"><!--pnid:m3c2PxUB4phXu9joJwFfFt-->🔍 正则测试</h2>\n        <div data-page-node-id=\"m3iXNotK9IaRO08i03nSkN\" class=\"desc\"><!--pnid:bc4LXBe7Mkb5yruXKfXRIC-->实时高亮匹配，列出全部匹配与捕获组（用 $1 $2 … 引用分组）。</div>\n        <div data-page-node-id=\"k0sjKrGghekjL4sd0MUdI2\" class=\"tool\">\n          <div data-page-node-id=\"YwwBOXkREeJ0R5cPqHbSf5\" class=\"row\">\n            <div data-page-node-id=\"TEuuTtyk2rPBS8uYaAs97P\" style=\"flex:2\"><label data-page-node-id=\"toJ64CAvWxio7l9Al8vHIT\"><!--pnid:YJ3eYEjLThAx8TdtmLDYGF-->正则表达式</label><input data-page-node-id=\"a2rjfXPcy7de2PReATT3Nl\" id=\"reInput\" placeholder=\"例如 \\d+\"></div>\n            <div data-page-node-id=\"WiKwDr2gE4V13HCo4zJfEb\" style=\"flex:0 0 auto\"><label data-page-node-id=\"xuaVi33bEvHMuhk0o28GGZ\"><!--pnid:yqzTJQMvvyYG75TYqEVibm-->标志</label><input data-page-node-id=\"pKFxNBmsh9OxHJ5zklt4kF\" id=\"reFlag\" placeholder=\"gim\" value=\"g\" style=\"width:90px\"></div>\n          </div>\n          <label data-page-node-id=\"zE5NO1CyIW7rtwe1AylnqA\"><!--pnid:8IGb7wY7b1FsXU00iyXL5j-->测试文本</label>\n          <textarea data-page-node-id=\"ZEzaEIjNpPUBsdGFjtq81r\" id=\"reText\" placeholder=\"在这里粘贴要测试的文本…\"></textarea>\n          <div data-page-node-id=\"m9DxBlhWbj6Pah0j57xoiJ\" class=\"out\" id=\"reOut\"><!--pnid:wiEQvGjhJuNFxgegyD1txX-->等待输入…</div>\n        </div>\n      </section>\n\n      <!--pnid:izwvYQS4WOYniVsAXhJRur--><!-- Base64 -->\n      <section data-page-node-id=\"OFYauxZmg3cCQoZb8Ge0Xe\" class=\"panel hidden\" id=\"p-b64\">\n        <h2 data-page-node-id=\"VvquAerG0WVA2Z9du0prQJ\"><!--pnid:SltWt3Iz1iDofYIDXvh9b0-->🔐 Base64 编 / 解码</h2>\n        <div data-page-node-id=\"NL8Ni7PDqJcFJuW0VvscqC\" class=\"desc\"><!--pnid:QJ69Dk8loldl2IX51bVuTy-->自动处理 UTF-8（中文不会乱码）。</div>\n        <div data-page-node-id=\"xjjSBviwQpa0ZOZbedvNVg\" class=\"tool\">\n          <textarea data-page-node-id=\"ZJMpAdMCREzmIPbuy7e5O4\" id=\"b64Input\" placeholder=\"输入要编码或解码的内容…\"></textarea>\n          <div data-page-node-id=\"ZLxHLveKVuKGdmVycLPMen\" class=\"row\">\n            <button data-page-node-id=\"fnvoUqDs1Cw5R3j8NE8G2t\" class=\"btn\" data-action=\"8\"><!--pnid:F7t9HhzJsjZws0mHeU0pIS-->编码 →</button>\n            <button data-page-node-id=\"CJZ5F4aHAhpa7swYkPvdRP\" class=\"btn ghost\" data-action=\"9\"><!--pnid:f9KvsCyIcEA1z2LWXM2wYG-->解码 →</button>\n            <button data-page-node-id=\"HjeyakAmFVGjIq6M0EcrG9\" class=\"btn ghost\" data-action=\"10\"><!--pnid:JaAymjEMoTwqiqVQzOVxxB-->复制</button>\n          </div>\n          <div data-page-node-id=\"1Fy5EUnwACrvMgjm8uLoKv\" class=\"out\" id=\"b64Out\"><!--pnid:tgHgL6SzaVJtGxPWMprqbY-->等待输入…</div>\n        </div>\n      </section>\n\n      <!--pnid:oN1pYatCKaf7uBdz9DpK3i--><!-- URL -->\n      <section data-page-node-id=\"3PehySJ9f9ybEWLdUWtrVe\" class=\"panel hidden\" id=\"p-url\">\n        <h2 data-page-node-id=\"cjQNmeABgoGZFfOjtr8F3W\"><!--pnid:vzp4CrUXwQ3NWPVJjrkjlx-->🔗 URL 编 / 解码</h2>\n        <div data-page-node-id=\"golgYG6NU1U3jrFgZsasmc\" class=\"desc\"><!--pnid:SXuUcTa5oxR7pi6aaTE3no-->encodeURIComponent / decodeURIComponent，适合处理查询参数。</div>\n        <div data-page-node-id=\"7Olgh2CPZh6mNqpxD6oaAI\" class=\"tool\">\n          <textarea data-page-node-id=\"vkPC3gAgO2OqpK0T55Ficv\" id=\"urlInput\" placeholder=\"输入要编码或解码的内容…\"></textarea>\n          <div data-page-node-id=\"jv4uiVLCdVJaaPAmq9YfNm\" class=\"row\">\n            <button data-page-node-id=\"Nidxql7NM3CN6mPRTYyiIG\" class=\"btn\" data-action=\"11\"><!--pnid:U4a2PID3rb61k1qwXiSqBc-->编码 →</button>\n            <button data-page-node-id=\"gEflQSS07ZqwlwkDlySl2D\" class=\"btn ghost\" data-action=\"12\"><!--pnid:f1jIjLsvx6o7drVa03oG2b-->解码 →</button>\n            <button data-page-node-id=\"6xAU3wZFZ42UdOsAT4aN1k\" class=\"btn ghost\" data-action=\"13\"><!--pnid:oAOm56O0YnIth75WM4vCjO-->复制</button>\n          </div>\n          <div data-page-node-id=\"7PBDOsA4xMrZvtNX8ZZKNA\" class=\"out\" id=\"urlOut\"><!--pnid:MQJbhcju4cavZIbSbdoG1E-->等待输入…</div>\n        </div>\n      </section>\n\n      <!--pnid:9GReKZxbArB84zDEO3MPT8--><!-- 颜色 -->\n      <section data-page-node-id=\"NCOY51B7tYSkeneHf8TLOX\" class=\"panel hidden\" id=\"p-color\">\n        <h2 data-page-node-id=\"4K7na9K27VvxoXDdxBkuAE\"><!--pnid:P2IrEINgoMoqWt67I5h0ec-->🎨 颜色转换</h2>\n        <div data-page-node-id=\"XTdkLLUgtMI9CgRO6PP2Wz\" class=\"desc\"><!--pnid:yvxgIxzRvScSkFEydDKtki-->HEX ⇄ RGB ⇄ HSL，实时色块预览。</div>\n        <div data-page-node-id=\"gVWDoKsofOnEptVSkNlhc5\" class=\"tool\">\n          <div data-page-node-id=\"rafCSnDyRQWxLB6tANaXPR\" class=\"grid3\">\n            <div data-page-node-id=\"4IR5avPE3DbYFa1Ga7nRnr\"><label data-page-node-id=\"nTlTkukusrFUVYKagHBaIk\"><!--pnid:1SsZEuOEzeJ3d8tpXlLcJo-->HEX</label><input data-page-node-id=\"JIjyKKbDH9WQm6xppYOgrl\" id=\"hexIn\" placeholder=\"#2dd4bf\"></div>\n            <div data-page-node-id=\"eUQZ3SElR9gvxY79svbZYc\"><label data-page-node-id=\"OfDFqX9Ii7unvElPRO40qd\"><!--pnid:gXm36tiu4v2AkH8UZefzdZ-->R,G,B</label><input data-page-node-id=\"FqR9RcLKKssaNzo9vOekeM\" id=\"rgbIn\" placeholder=\"45,212,191\"></div>\n            <div data-page-node-id=\"pn4WYfjJvCXBr7owiQfKZ9\"><label data-page-node-id=\"8jkbf3hb0VT2uhmYFFRAHl\"><!--pnid:CnrchKyAzzScN6BVGbc9wn-->H,S,L</label><input data-page-node-id=\"TmdemqB9H0zFmrR5vR11K7\" id=\"hslIn\" placeholder=\"168,62%,50%\"></div>\n          </div>\n          <div data-page-node-id=\"tM2fbdx7xunqOgDmWRh7Ob\" class=\"row\">\n            <button data-page-node-id=\"NrHnfJaEKydk94xLHNY9nu\" class=\"btn\" data-action=\"14\"><!--pnid:FKHT9acapePucSstlgThHi-->从 HEX 转换</button>\n            <button data-page-node-id=\"71aKhap7ZYIHyrYj2DhIK6\" class=\"btn ghost\" data-action=\"15\"><!--pnid:gJryhMr94Y1spg3kGiXRNB-->从 RGB 转换</button>\n            <button data-page-node-id=\"sr9ypV6phmd31bLOIPZ6pB\" class=\"btn ghost\" data-action=\"16\"><!--pnid:ZxFTJProsh0ukRuuXS1pxZ-->从 HSL 转换</button>\n          </div>\n          <div data-page-node-id=\"rLA55lUyOgcewFMO8y5DCO\" class=\"swatch\" id=\"swatch\"></div>\n          <div data-page-node-id=\"WA3vMZhUuUeh3EogBXJ85Q\" class=\"out\" id=\"colorOut\"><!--pnid:rMJ4eslmHc2ngdn9kIZJgC-->等待输入…</div>\n        </div>\n      </section>\n\n      <!--pnid:fSVkdh6zlWQH9LFt4dc0hM--><!-- 哈希 / UUID -->\n      <section data-page-node-id=\"ed2a5xc3qC53iQqIsv4xcV\" class=\"panel hidden\" id=\"p-hash\">\n        <h2 data-page-node-id=\"5mRflyWI5T4cBfcXfbmnOe\"><!--pnid:Guu3TjFsA7VckWlnVlXMoG-->🧬 哈希计算 & UUID</h2>\n        <div data-page-node-id=\"ivrROLLfyvX8HH6tuormdn\" class=\"desc\"><!--pnid:xgoNGgN1H8qClw2ZyIxUet-->SHA-1/256/384/512 走浏览器原生 crypto；MD5 内置实现。UUID 走 crypto.randomUUID。</div>\n        <div data-page-node-id=\"6SNlxtYGoTfz1f7cVq6dNL\" class=\"tool\">\n          <textarea data-page-node-id=\"58GygqidRebvjSqfItTEut\" id=\"hashInput\" placeholder=\"输入要计算哈希的文本…\"></textarea>\n          <div data-page-node-id=\"lvkzJZ7crz4kUCo1ngT59E\" class=\"row\">\n            <select data-page-node-id=\"XdgYXsMPD8hFcZ1rm5TEZT\" id=\"hashAlgo\">\n              <option data-page-node-id=\"j5bhRlVSkjLfSbzYcLtsFr\" value=\"SHA-256\"><!--pnid:fGhmrFlKUJBfUyQ56fFOzA-->SHA-256</option>\n              <option data-page-node-id=\"O3k9wNXCybzs36qVs2y7TS\" value=\"SHA-1\"><!--pnid:WP9hgr80olCwudoKIlmuGH-->SHA-1</option>\n              <option data-page-node-id=\"0wJGa7wVS2bODVzwmJB0Vy\" value=\"SHA-384\"><!--pnid:Kfq8LpwL8TUGG1ffyy8OVN-->SHA-384</option>\n              <option data-page-node-id=\"eOtJXxGnKi2bmO6wGEvTYb\" value=\"SHA-512\"><!--pnid:paAUvqgkqYiXJqU8k71oLg-->SHA-512</option>\n              <option data-page-node-id=\"wx6NFe5uGEhxSzlIgPyHCE\" value=\"MD5\"><!--pnid:SmzZg3N0UQPeKSayhwb8yt-->MD5</option>\n            </select>\n            <button data-page-node-id=\"esvEEfh2MYiAK716YhCHW3\" class=\"btn\" data-action=\"17\"><!--pnid:rkOmI21ptoG5ca0y4TN9NQ-->计算 →</button>\n          </div>\n          <div data-page-node-id=\"hWMMu3P2lIJnfQ0eccB7Io\" class=\"out\" id=\"hashOut\"><!--pnid:F9DeElepJXVq18T1dP8rpU-->等待输入…</div>\n          <div data-page-node-id=\"UHwnGew0dVgBCDjzKLzb1U\" class=\"row\">\n            <button data-page-node-id=\"xhRBXyoQyNSXdX0w4RTVsj\" class=\"btn ghost\" data-action=\"18\"><!--pnid:SgklaJsxdIFiSHGg1VvErh-->生成 5 个 UUID v4</button>\n            <button data-page-node-id=\"PevKS9znOu3FJfo86jwJJ1\" class=\"btn ghost\" data-action=\"19\"><!--pnid:CBeTVAYJDKf0K7Of5sO8d0-->复制</button>\n          </div>\n          <div data-page-node-id=\"LrpDe9MQRmLspZVO0srucn\" class=\"uuid-list\" id=\"uuidOut\"></div>\n        </div>\n      </section>\n    </main>\n  </div>\n\n  <footer data-page-node-id=\"qcQZ9WffqPR13BcNh3qc1y\"><!--pnid:asmVo1P6VjlRkOj7tLXRtA-->\n    由 <a data-page-node-id=\"WjcDxXzpqFbJrADCDOJ1iI\" href=\"https://www.workbuddy.cn\" rel=\"noreferrer\" target=\"_blank\"><!--pnid:2YoFSakuAQDB9Pd0IeLiyj-->WorkBuddy</a><!--pnid:v6LUpabeoj7gl6uSFiXEVJ--> 造物生成 · 致每一位用代码改变世界的工程师 · Happy 1024 🚀\n  </footer>\n</div>\n\n<div data-page-node-id=\"uimievknzsEPkTejZpNbWQ\" class=\"toast\" id=\"toast\"></div>\n\n";

/* ---------- 工具函数 ---------- */
window.setOut = function(id, text, cls) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'out' + (cls ? ' ' + cls : '');
}
window.copyOut = function(id) {
  const el = document.getElementById(id);
  const text = (el.tagName === 'DIV') ? el.textContent : el.value;
  navigator.clipboard.writeText(text).then(() => toast('已复制 ✓')).catch(() => toast('复制失败'));
}
window.toast = function(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ---------- Tab 切换 ---------- */
document.getElementById('tabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  tab.classList.add('active');
  document.getElementById('p-' + tab.dataset.t).classList.remove('hidden');
});

/* ---------- 实时时间戳 ---------- */
window.tick = function() {
  const now = Date.now();
  document.getElementById('liveTs').textContent =
    '本地 ' + now + ' ms ｜ ' + Math.floor(now/1000) + ' s ｜ ' + new Date().toISOString();
}
setInterval(tick, 1000); tick();

/* ---------- 时间戳 ---------- */
window.tsToDate = function() {
  const v = document.getElementById('tsInput').value.trim();
  if (!v || isNaN(v)) { setOut('tsOut', '请输入有效数字', 'err'); return; }
  let n = Number(v);
  if (n < 1e12) n = n * 1000; // 秒 → 毫秒
  const d = new Date(n);
  if (isNaN(d.getTime())) { setOut('tsOut', '无法解析该时间戳', 'err'); return; }
  setOut('tsOut',
    '本地时间 : ' + d.toLocaleString('zh-CN') + '\n' +
    'UTC      : ' + d.toUTCString() + '\n' +
    'ISO      : ' + d.toISOString() + '\n' +
    '星期     : ' + '日一二三四五六'.charAt(d.getDay()) + '（周' + '日一二三四五六'.charAt(d.getDay()) + '）', 'ok');
}
window.nowTs = function() {
  const now = Date.now();
  document.getElementById('tsInput').value = Math.floor(now/1000);
  tsToDate();
}
window.dateToTs = function() {
  const v = document.getElementById('dateInput').value;
  if (!v) { setOut('tsOut', '请选择日期时间', 'err'); return; }
  const d = new Date(v);
  const ms = d.getTime();
  setOut('tsOut', '毫秒 : ' + ms + '\n秒   : ' + Math.floor(ms/1000), 'ok');
}

/* ---------- 进制 ---------- */
window.convertBase = function() {
  const from = parseInt(document.getElementById('fromBase').value, 10);
  const val = document.getElementById('baseInput').value.trim();
  if (!val) { document.getElementById('baseOut').innerHTML = ''; return; }
  let dec;
  const valid = {2:/^[+-]?[01]+$/,8:/^[+-]?[0-7]+$/,10:/^[+-]?[0-9]+$/,16:/^[+-]?[0-9a-f]+$/i};
  if (!valid[from].test(val)) { document.getElementById('baseOut').innerHTML = '<div class="out err">该进制下包含非法字符</div>'; return; }
  try { dec = parseInt(val, from); } catch(e) { dec = NaN; }
  if (isNaN(dec)) { document.getElementById('baseOut').innerHTML = '<div class="out err">该进制下包含非法字符</div>'; return; }
  const map = {2: dec.toString(2), 8: dec.toString(8), 10: String(dec), 16: dec.toString(16).toUpperCase()};
  const labels = {2:'BIN', 8:'OCT', 10:'DEC', 16:'HEX'};
  document.getElementById('baseOut').innerHTML = [2,8,10,16].map(b =>
    `<div class="out">${labels[b]}<br><b>${map[b]}</b></div>`).join('');
}

/* ---------- JSON ---------- */
window.jsonFormat = function() {
  const t = document.getElementById('jsonInput').value;
  try {
    const o = JSON.parse(t);
    setOut('jsonOut', JSON.stringify(o, null, 2), 'ok');
  } catch(e) { setOut('jsonOut', '❌ ' + e.message, 'err'); }
}
window.jsonMinify = function() {
  const t = document.getElementById('jsonInput').value;
  try {
    const o = JSON.parse(t);
    setOut('jsonOut', JSON.stringify(o), 'ok');
  } catch(e) { setOut('jsonOut', '❌ ' + e.message, 'err'); }
}
window.jsonValidate = function() {
  const t = document.getElementById('jsonInput').value;
  try { JSON.parse(t); setOut('jsonOut', '✅ JSON 合法', 'ok'); }
  catch(e) { setOut('jsonOut', '❌ ' + e.message, 'err'); }
}
window.jsonCopy = function() { copyOut('jsonOut'); }

/* ---------- 正则 ---------- */
window.escapeHtml = function(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
window.reRun = function() {
  const pat = document.getElementById('reInput').value;
  const flags = document.getElementById('reFlag').value || 'g';
  const text = document.getElementById('reText').value;
  if (!pat) { setOut('reOut', '请输入正则', 'err'); return; }
  let re;
  try { re = new RegExp(pat, flags.includes('g') ? flags : flags + 'g'); }
  catch(e) { setOut('reOut', '❌ 正则错误: ' + e.message, 'err'); return; }
  if (!text) { setOut('reOut', '请输入测试文本', 'err'); return; }
  let m, count = 0, html = '', groups = [], last = 0;
  while ((m = re.exec(text)) !== null) {
    count++;
    html += escapeHtml(text.slice(last, m.index));
    last = m.index + m[0].length;
    html += '<span class="match">' + escapeHtml(m[0]) + '</span>';
    if (m.length > 1) groups.push('#' + count + ' → ' + m.slice(1).map((g,i)=>'$'+(i+1)+'='+(g===undefined?'∅':g)).join('  '));
    if (m.index === re.lastIndex) re.lastIndex++; // 防止零宽死循环
    if (count > 5000) break;
  }
  html += escapeHtml(text.slice(last));
  setOut('reOut', '匹配数: ' + count + (groups.length ? '\n\n' + groups.join('\n') : '') + '\n\n' + html.replace(/\n/g,'\\n'), 'ok');
  document.getElementById('reOut').innerHTML = '匹配数: <b>' + count + '</b>' +
    (groups.length ? '<br><br>' + escapeHtml(groups.join('\n')) : '') +
    '<br><br>' + html;
}
document.getElementById('reInput').addEventListener('input', reRun);
document.getElementById('reText').addEventListener('input', reRun);
document.getElementById('reFlag').addEventListener('input', reRun);

/* ---------- Base64 ---------- */
window.utf8ToB64 = function(str){ return btoa(String.fromCharCode(...new TextEncoder().encode(str))); }
window.b64ToUtf8 = function(b64){ return new TextDecoder().decode(Uint8Array.from(atob(b64), c=>c.charCodeAt(0))); }
window.b64encode_ = function() {
  const v = document.getElementById('b64Input').value;
  if (!v) { setOut('b64Out','请输入内容','err'); return; }
  try { setOut('b64Out', utf8ToB64(v), 'ok'); } catch(e){ setOut('b64Out','❌ '+e.message,'err'); }
}
window.b64decode_ = function() {
  const v = document.getElementById('b64Input').value.trim();
  if (!v) { setOut('b64Out','请输入内容','err'); return; }
  try { setOut('b64Out', b64ToUtf8(v), 'ok'); } catch(e){ setOut('b64Out','❌ 不是合法的 Base64','err'); }
}

/* ---------- URL ---------- */
window.urlEncode = function(){ const v=document.getElementById('urlInput').value; setOut('urlOut', encodeURIComponent(v),'ok'); }
window.urlDecode = function(){ const v=document.getElementById('urlInput').value.trim(); try{ setOut('urlOut', decodeURIComponent(v),'ok'); }catch(e){ setOut('urlOut','❌ 解码失败','err'); } }

/* ---------- 颜色 ---------- */
window.setColor = function(r,g,b){
  const hex = '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
  const hsl = rgbToHsl(r,g,b);
  document.getElementById('hexIn').value = hex;
  document.getElementById('rgbIn').value = `${r},${g},${b}`;
  document.getElementById('hslIn').value = `${hsl[0]},${hsl[1]}%,${hsl[2]}%`;
  document.getElementById('swatch').style.background = hex;
  setOut('colorOut', `HEX ${hex}\nRGB ${r},${g},${b}\nHSL ${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%`, 'ok');
}
window.hexToOthers = function(){
  const h = document.getElementById('hexIn').value.trim().replace('#','');
  if(!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)){ setOut('colorOut','❌ HEX 格式错误','err'); return; }
  let r,g,b;
  if(h.length===3){ r=parseInt(h[0]+h[0],16); g=parseInt(h[1]+h[1],16); b=parseInt(h[2]+h[2],16); }
  else { r=parseInt(h.slice(0,2),16); g=parseInt(h.slice(2,4),16); b=parseInt(h.slice(4,6),16); }
  setColor(r,g,b);
}
window.rgbToOthers = function(){
  const p = document.getElementById('rgbIn').value.split(',').map(s=>parseInt(s.trim(),10));
  if(p.length!==3 || p.some(isNaN) || p.some(x=>x<0||x>255)){ setOut('colorOut','❌ RGB 格式错误 (0-255)','err'); return; }
  setColor(p[0],p[1],p[2]);
}
window.hslToOthers = function(){
  const p = document.getElementById('hslIn').value.split(',').map(s=>parseFloat(s.replace('%','').trim()));
  if(p.length!==3 || p.some(isNaN)){ setOut('colorOut','❌ HSL 格式错误','err'); return; }
  const [r,g,b] = hslToRgb(p[0],p[1],p[2]);
  setColor(Math.round(r),Math.round(g),Math.round(b));
}
window.rgbToHsl = function(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}
    h/=6;}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}
window.hslToRgb = function(h,s,l){
  s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return [f(0)*255,f(8)*255,f(4)*255];
}

/* ---------- 哈希 / UUID ---------- */
window.doHash = async function(){
  const txt = document.getElementById('hashInput').value;
  const algo = document.getElementById('hashAlgo').value;
  if(!txt){ setOut('hashOut','请输入文本','err'); return; }
  try{
    let hex;
    if(algo==='MD5'){ hex = md5(txt); }
    else {
      const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(txt));
      hex = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
    }
    setOut('hashOut', hex, 'ok');
  }catch(e){ setOut('hashOut','❌ '+e.message,'err'); }
}
window.genUUID = async function(){
  const list = [];
  for(let i=0;i<5;i++) list.push(crypto.randomUUID());
  document.getElementById('uuidOut').innerHTML = list.map(u=>
    `<div>${u}<span class="copy" data-uuid="${u}">复制</span></div>`).join('');
}

/* ---------- MD5 (RFC1321, 经典验证实现) ---------- */
window.md5blk = function(s){ var b=[],i; for(i=0;i<64;i+=4){ b[i>>2]=(s.charCodeAt(i))+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24); } return b; }
window.md5cycle = function(x,k){
  var a=x[0],b=x[1],c=x[2],d=x[3];
  a=ff(a,b,c,d,k[0],7,-680876936); d=ff(d,a,b,c,k[1],12,-389564586); c=ff(c,d,a,b,k[2],17,606105819); b=ff(b,c,d,a,k[3],22,-1044525330);
  a=ff(a,b,c,d,k[4],7,-176418897); d=ff(d,a,b,c,k[5],12,1200080426); c=ff(c,d,a,b,k[6],17,-1473231341); b=ff(b,c,d,a,k[7],22,-45705983);
  a=ff(a,b,c,d,k[8],7,1770035416); d=ff(d,a,b,c,k[9],12,-1958414417); c=ff(c,d,a,b,k[10],17,-42063); b=ff(b,c,d,a,k[11],22,-1990404162);
  a=ff(a,b,c,d,k[12],7,1804603682); d=ff(d,a,b,c,k[13],12,-40341101); c=ff(c,d,a,b,k[14],17,-1502002290); b=ff(b,c,d,a,k[15],22,1236535329);
  a=gg(a,b,c,d,k[1],5,-165796510); d=gg(d,a,b,c,k[6],9,-1069501632); c=gg(c,d,a,b,k[11],14,643717713); b=gg(b,c,d,a,k[0],20,-373897302);
  a=gg(a,b,c,d,k[5],5,-701558691); d=gg(d,a,b,c,k[10],9,38016083); c=gg(c,d,a,b,k[15],14,-660478335); b=gg(b,c,d,a,k[4],20,-405537848);
  a=gg(a,b,c,d,k[9],5,568446438); d=gg(d,a,b,c,k[14],9,-1019803690); c=gg(c,d,a,b,k[3],14,-187363961); b=gg(b,c,d,a,k[8],20,1163531501);
  a=gg(a,b,c,d,k[13],5,-1444681467); d=gg(d,a,b,c,k[2],9,-51403784); c=gg(c,d,a,b,k[7],14,1735328473); b=gg(b,c,d,a,k[12],20,-1926607734);
  a=hh(a,b,c,d,k[5],4,-378558); d=hh(d,a,b,c,k[8],11,-2022574463); c=hh(c,d,a,b,k[11],16,1839030562); b=hh(b,c,d,a,k[14],23,-35309556);
  a=hh(a,b,c,d,k[1],4,-1530992060); d=hh(d,a,b,c,k[4],11,1272893353); c=hh(c,d,a,b,k[7],16,-155497632); b=hh(b,c,d,a,k[10],23,-1094730640);
  a=hh(a,b,c,d,k[13],4,681279174); d=hh(d,a,b,c,k[0],11,-358537222); c=hh(c,d,a,b,k[3],16,-722521979); b=hh(b,c,d,a,k[6],23,76029189);
  a=hh(a,b,c,d,k[9],4,-640364487); d=hh(d,a,b,c,k[12],11,-421815835); c=hh(c,d,a,b,k[15],16,530742520); b=hh(b,c,d,a,k[2],23,-995338651);
  a=ii(a,b,c,d,k[0],6,-198630844); d=ii(d,a,b,c,k[7],10,1126891415); c=ii(c,d,a,b,k[14],15,-1416354905); b=ii(b,c,d,a,k[5],21,-57434055);
  a=ii(a,b,c,d,k[12],6,1700485571); d=ii(d,a,b,c,k[3],10,-1894986606); c=ii(c,d,a,b,k[10],15,-1051523); b=ii(b,c,d,a,k[1],21,-2054922799);
  a=ii(a,b,c,d,k[8],6,1873313359); d=ii(d,a,b,c,k[15],10,-30611744); c=ii(c,d,a,b,k[6],15,-1560198380); b=ii(b,c,d,a,k[13],21,1309151649);
  a=ii(a,b,c,d,k[4],6,-145523070); d=ii(d,a,b,c,k[11],10,-1120210379); c=ii(c,d,a,b,k[2],15,718787259); b=ii(b,c,d,a,k[9],21,-343485551);
  x[0]=add32(a,x[0]); x[1]=add32(b,x[1]); x[2]=add32(c,x[2]); x[3]=add32(d,x[3]);
}
window.cmn = function(q,a,b,x,s,t){ a=add32(add32(a,q),add32(x,t)); return add32((a<<s)|(a>>>(32-s)),b); }
window.ff = function(a,b,c,d,x,s,t){ return cmn((b&c)|((~b)&d),a,b,x,s,t); }
window.gg = function(a,b,c,d,x,s,t){ return cmn((b&d)|(c&(~d)),a,b,x,s,t); }
window.hh = function(a,b,c,d,x,s,t){ return cmn(b^c^d,a,b,x,s,t); }
window.ii = function(a,b,c,d,x,s,t){ return cmn(c^(b|(~d)),a,b,x,s,t); }
window.add32 = function(a,b){ return (a+b)&0xffffffff; }
window.rhex = function(n){ var h='0123456789abcdef'.split(''),s='',j; for(j=0;j<4;j++) s+=h[(n>>(j*8+4))&0x0F]+h[(n>>(j*8))&0x0F]; return s; }
window.hex = function(x){ for(var i=0;i<x.length;i++) x[i]=rhex(x[i]); return x.join(''); }
window.md51 = function(s){
  var n=s.length, state=[1732584193,-271733879,-1732584194,271733878], i;
  for(i=64;i<=s.length;i+=64){ md5cycle(state, md5blk(s.substring(i-64,i))); }
  s=s.substring(i-64);
  var tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for(i=0;i<s.length;i++) tail[i>>2]|=s.charCodeAt(i)<<((i%4)<<3);
  tail[i>>2]|=0x80<<((i%4)<<3);
  if(i>55){ md5cycle(state,tail); for(i=0;i<16;i++) tail[i]=0; }
  tail[14]=n*8; md5cycle(state,tail); return state;
}
window.md5 = function(s){ return hex(md51(unescape(encodeURIComponent(s)))); }; 

/* ---------- 代码雨背景 ---------- */
(function(){
  const c = document.getElementById('rain'); const ctx = c.getContext('2d');
  const chars = '01<>{}[]()=+-*/;:#$%&|1024'.split('');
  let cols, drops, fontSize = 14;
  function resize(){ c.width = innerWidth; c.height = innerHeight; cols = Math.floor(c.width/fontSize); drops = Array(cols).fill(1); }
  resize(); addEventListener('resize', resize);
  function draw(){
    ctx.fillStyle = 'rgba(10,14,20,0.08)'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#2dd4bf'; ctx.font = fontSize + 'px monospace';
    for(let i=0;i<cols;i++){
      const ch = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(ch, i*fontSize, drops[i]*fontSize);
      if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 60);
})();

document.querySelector('[data-action="0"]').addEventListener("click",()=>{tsToDate()});
document.querySelector('[data-action="1"]').addEventListener("click",()=>{nowTs()});
document.querySelector('[data-action="2"]').addEventListener("click",()=>{dateToTs()});
document.querySelector('[data-action="3"]').addEventListener("click",()=>{convertBase()});
document.querySelector('[data-action="4"]').addEventListener("click",()=>{jsonFormat()});
document.querySelector('[data-action="5"]').addEventListener("click",()=>{jsonMinify()});
document.querySelector('[data-action="6"]').addEventListener("click",()=>{jsonValidate()});
document.querySelector('[data-action="7"]').addEventListener("click",()=>{jsonCopy()});
document.querySelector('[data-action="8"]').addEventListener("click",()=>{b64encode_()});
document.querySelector('[data-action="9"]').addEventListener("click",()=>{b64decode_()});
document.querySelector('[data-action="10"]').addEventListener("click",()=>{copyOut('b64Out')});
document.querySelector('[data-action="11"]').addEventListener("click",()=>{urlEncode()});
document.querySelector('[data-action="12"]').addEventListener("click",()=>{urlDecode()});
document.querySelector('[data-action="13"]').addEventListener("click",()=>{copyOut('urlOut')});
document.querySelector('[data-action="14"]').addEventListener("click",()=>{hexToOthers()});
document.querySelector('[data-action="15"]').addEventListener("click",()=>{rgbToOthers()});
document.querySelector('[data-action="16"]').addEventListener("click",()=>{hslToOthers()});
document.querySelector('[data-action="17"]').addEventListener("click",()=>{doHash()});
document.querySelector('[data-action="18"]').addEventListener("click",()=>{genUUID()});
document.querySelector('[data-action="19"]').addEventListener("click",()=>{copyOut('uuidOut')});
document.getElementById("uuidOut").addEventListener("click",e=>{if(e.target.dataset.uuid) navigator.clipboard.writeText(e.target.dataset.uuid).then(()=>toast("已复制 ✓"));});
