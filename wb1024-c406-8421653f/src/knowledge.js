(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const KB = [];
  function e(id, cat, sev, patterns, title, what, causes, fixes) {
    KB.push({ id, cat, sev, patterns, title, what, causes, fixes });
  }

  /* ============ 网络 / 连接 ============ */
  e('net-connrefused', '网络', 'high', [/ECONNREFUSED/i, /Connection refused/i, /connect\(\) failed/i, /connect to .* failed/i],
    '连接被拒绝（ECONNREFUSED）',
    '客户端向目标地址发起 TCP 连接，对方端口没有服务监听，或被防火墙直接拒绝。',
    ['目标服务未启动、已崩溃或正在重启', '端口写错，或服务只监听了 127.0.0.1', '安全组 / 防火墙未放行该端口'],
    ['确认目标进程存活：ps -ef、docker ps、systemctl status', '核对 IP 与端口；服务需监听 0.0.0.0 才能对外访问', '检查云安全组、iptables / firewalld 规则', '容器场景检查 -p 端口映射与健康检查探针']);
  e('net-timeout', '网络', 'high', [/ETIMEDOUT/i, /timed? ?out/i, /deadline exceeded/i, /TimeoutException/i, /i\/o timeout/i],
    '连接 / 请求超时',
    '请求在约定时间内未得到响应，可能对端过载、网络不通或超时配置过短。',
    ['对端服务过载、响应缓慢或线程池打满', '网络抖动、跨机房 / 跨境链路质量差', '客户端超时时间设置过短'],
    ['先在目标机器上 curl / telnet 验证连通性与耗时', '检查对端负载、线程池、队列积压', '适当调大超时并加重试，同时排查根因', '跨公网场景考虑专线或就近部署']);
  e('net-dns', '网络', 'high', [/ENOTFOUND/i, /getaddrinfo/i, /Name or service not known/i, /ERR_NAME_NOT_RESOLVED/i, /Temporary failure in name resolution/i, /no such host/i],
    'DNS 解析失败',
    '域名无法解析为 IP，通常是 DNS 配置、域名不存在或解析服务故障。',
    ['域名拼写错误或尚未生效', 'DNS 服务器不可达 / 配置错误', '内网环境缺少该域名的解析记录'],
    ['nslookup / dig 验证域名解析', '检查 /etc/resolv.conf 与内网 DNS', 'K8s 场景确认 CoreDNS 与 Service 域名', '确认域名已备案且解析记录正确']);
  e('net-reset', '网络', 'medium', [/ECONNRESET/i, /Connection reset by peer/i, /broken pipe/i, /EPIPE/i],
    '连接被对端重置',
    '连接建立后对端直接关闭或重置，常见于服务重启、超时被掐断或代理拦截。',
    ['服务端重启 / 发布导致连接中断', '代理或 LB 空闲超时主动断连', '请求体过大触发中间设备拦截'],
    ['结合发布时间线确认是否发布抖动', '开启客户端 keep-alive 与重试', '检查代理 / LB 的空闲连接超时配置']);
  e('net-tls', '网络', 'high', [/SSL routines/i, /tlsv1 alert/i, /sslv3 alert/i, /handshake failure/i, /error:1408/i, /error:1409/i, /unable to get local issuer certificate/i, /certificate verify failed/i, /CERTIFICATE_VERIFY_FAILED/i, /certificate has expired/i, /x509/i, /tls: failed to verify/i],
    'TLS / 证书错误',
    'SSL 握手或证书校验失败：证书过期、链不完整、域名不匹配或协议版本不支持。',
    ['证书过期或尚未部署', '证书链不完整（缺少中间证书）', '证书域名与访问域名不匹配', '客户端不信任自签名 / 私有 CA'],
    ['openssl s_client -connect 域名:443 查看证书链与有效期', '补齐中间证书，确认部署完整链路', '核对证书 CN / SAN 与访问域名', '私有 CA 场景将根证书导入客户端信任库']);
  e('net-proxy', '网络', 'medium', [/proxyconnect/i, /CONNECT tunnel/i, /ProxyError/i, /proxy error/i],
    '代理 / 隧道错误',
    '请求经由代理转发时代理层失败，常见于代理不可达、认证失败或目标被代理拒绝。',
    ['代理服务不可用或配置错误', '代理认证信息过期', '目标地址被代理策略拦截'],
    ['检查代理地址、端口与账号', 'curl -x 验证代理连通性', '确认代理白名单包含目标域名', '公司内网代理咨询网络管理员']);

  /* ============ Node.js ============ */
  e('node-eaddrinuse', 'Node.js', 'high', [/EADDRINUSE/i, /listen EADDRINUSE/i],
    '端口已被占用（EADDRINUSE）',
    '要监听的端口已被其他进程占用，服务无法启动。',
    ['上一个进程未退出（僵死 / 未 kill 干净）', '多个实例配置了同一端口', '容器端口映射冲突'],
    ['lsof -i :端口 或 netstat -tlnp 找到占用进程', '结束旧进程或修改端口配置', 'CI / 容器场景检查端口重用与探针']);
  e('node-eacces', 'Node.js', 'high', [/EACCES/i, /permission denied/i],
    '权限不足（EACCES）',
    '当前用户对目标文件、目录或端口没有足够权限。',
    ['文件属主不是运行用户', '监听 1024 以下特权端口', '目录缺少写权限'],
    ['chown / chmod 修正属主与权限', '特权端口改用 80/443 由反向代理转发', '确认运行用户与部署脚本一致']);
  e('node-eperm', 'Node.js', 'medium', [/EPERM/i, /operation not permitted/i],
    '操作不被允许（EPERM）',
    '系统拒绝了该操作，通常是权限、能力（capability）或安全策略限制。',
    ['SELinux / AppArmor 等安全策略拦截', '容器缺少所需 capability', '目标资源被设置为只读'],
    ['查看 audit 日志确认拦截源', '容器按需添加 --cap-add', '修正安全策略后重试']);
  e('node-enoent', 'Node.js', 'medium', [/ENOENT/i, /no such file or directory/i],
    '文件或目录不存在（ENOENT）',
    '访问的文件 / 目录路径不存在，或相对路径基准不对。',
    ['路径拼写错误', '工作目录与预期不符', '构建产物未生成或被清理'],
    ['打印 __dirname / cwd 核对绝对路径', '确认构建步骤先于运行步骤', '容器内确认 COPY 路径与 WORKDIR']);
  e('node-emfile', 'Node.js', 'high', [/EMFILE/i, /too many open files/i],
    '打开文件描述符超限（EMFILE）',
    '进程打开的文件 / 连接数超过系统上限，通常是句柄泄漏。',
    ['文件或连接未正确关闭', 'ulimit 设置过小', '并发量突增'],
    ['ulimit -n 调大上限（治标）', '排查未关闭的流、socket、文件句柄', '接入池化与背压，控制并发']);
  e('node-module-not-found', 'Node.js', 'high', [/MODULE_NOT_FOUND/i, /Cannot find module/i],
    '找不到模块（MODULE_NOT_FOUND）',
    'require / import 的模块无法解析：未安装、路径错或大小写不匹配。',
    ['依赖未安装或 node_modules 不完整', '相对路径书写错误', '大小写不匹配（Linux 敏感）'],
    ['执行 npm ci / pnpm install 重装依赖', '核对 require 路径与文件实际位置', '检查 extensions 与 exports 字段配置']);
  e('node-require-esm', 'Node.js', 'high', [/ERR_REQUIRE_ESM/i, /require\(\) of ES Module/i],
    'require() 加载 ESM 报错',
    '用 CommonJS 的 require 加载了仅提供 ESM 出口的包。',
    ['目标包升级为 pure ESM（如 chalk v5、got v13）', '项目自身仍是 CJS'],
    ['改用动态 import() 引入', '或把项目迁移到 ESM（"type": "module"）', '锁定旧版兼容包作为过渡']);
  e('node-import-esm', 'Node.js', 'high', [/Cannot use import statement outside a module/i],
    'import 语句出现在 CJS 环境',
    'ESM 语法被当作 CommonJS 执行。',
    ['package.json 缺少 "type": "module"', '构建配置未转换 ESM 语法'],
    ['package.json 加 "type": "module"', '或通过 Babel / tsc 转译为 CJS', 'Node 版本确认支持所需特性']);
  e('node-unhandled', 'Node.js', 'medium', [/UnhandledPromiseRejection/i, /unhandled rejection/i],
    '未处理的 Promise 拒绝',
    'Promise 被 reject 但没有任何 catch 处理，新版 Node 会直接退出进程。',
    ['async 调用漏写 await / catch', 'Promise 链中断点未捕获', '事件回调中抛出异常'],
    ['补全 try/catch 或 .catch', '进程级监听 unhandledRejection 兜底并告警', '开启 --unhandled-rejections=strict 提前暴露']);
  e('node-listeners', 'Node.js', 'low', [/MaxListenersExceededWarning/i],
    '事件监听器过多（疑似泄漏）',
    '同一事件注册了超过 10 个监听器，通常是重复订阅未移除。',
    ['在循环或请求处理中重复 addListener', '未在适当时机 removeListener'],
    ['用 once 或显式 removeListener', '排查重复订阅的热路径', '必要时 setMaxListeners 并注释原因']);
  e('node-deprecated', 'Node.js', 'low', [/DeprecationWarning/i, /DEP00/i, /ExperimentalWarning/i],
    '弃用 / 实验特性警告',
    '使用了被标记弃用或实验性的 API，未来版本可能移除或变更。',
    ['依赖旧 API 未升级', '实验特性随版本变化'],
    ['按警告提示迁移到推荐 API', '升级相关依赖', '实验特性关注版本变更说明']);

  /* ============ npm / 包管理 ============ */
  e('npm-eresolve', 'npm', 'high', [/ERESOLVE/i, /peer dep/i, /while resolving:/i, /Could not resolve dependency/i],
    '依赖解析冲突（ERESOLVE）',
    'npm 无法找出一组满足所有 peerDependencies 的版本，安装直接失败。',
    ['两个包对同一 peer 依赖版本要求冲突', 'lockfile 与实际 package.json 不同步', '混用 npm / yarn / pnpm 造成状态混乱'],
    ['npm ls 查看冲突链，统一升级冲突双方', '删除 node_modules 与 lockfile 后重新安装', '必要时使用 overrides 强制版本', '团队统一包管理器与 Node 版本']);
  e('npm-auth', 'npm', 'high', [/npm ERR! code E401/i, /npm ERR! code E403/i, /ENEEDAUTH/i, /authentication required/i, /Incorrect or missing password/i],
    'npm 认证失败',
    '访问私有 registry 或私有包时认证信息缺失或失效。',
    ['token 过期 / 未登录', 'CI 缺少 NPM_TOKEN 配置', 'registry 地址指向错误'],
    ['npm login 重新登录或更新 token', 'CI 配置 NODE_AUTH_TOKEN 环境变量', '核对 .npmrc 中 registry 与 scope 配置']);
  e('npm-network', 'npm', 'high', [/npm ERR! network/i, /request to .* failed/i, /registry unreachable/i, /silly fetch/i],
    'npm 网络 / 源问题',
    '连接 npm registry 失败或极慢，常见于网络受限或源配置不当。',
    ['公司网络限制外网访问', 'registry 源不可用或被限速', '代理配置缺失'],
    ['切换国内镜像源（如 npmmirror）', '配置 HTTP_PROXY / HTTPS_PROXY', 'CI 使用缓存或私有 registry 代理']);
  e('npm-lock', 'npm', 'medium', [/Your lockfile needs/i, /lockfile is out of date/i, /npm WARN.*lockfile/i, /package-lock.*conflict/i],
    'lockfile 不同步',
    'lockfile 与 package.json 不一致，可能导致 CI 与本地安装结果不同。',
    ['多人协作合并冲突未正确解决', '手动编辑过 package.json'],
    ['npm install 重新生成 lockfile 并提交', '冲突时以一方为准后重新 install', 'CI 使用 npm ci 强制校验一致性']);
  e('yarn-pnpm', 'npm', 'medium', [/yarn error/i, /ERR_PNPM/i, /pnpm.*lockfile/i, /Incorrect integrity/i],
    'yarn / pnpm 安装异常',
    '包管理器自身报错：完整性校验失败、lockfile 损坏或存储异常。',
    ['缓存损坏或完整性校验失败', 'lockfile 与依赖清单不同步', 'node_modules 被不同管理器污染'],
    ['清理缓存后重装（yarn cache clean / pnpm store prune）', '删除 node_modules 与 lockfile 重新安装', '确认团队使用同一包管理器']);

  /* ============ 浏览器 / 前端 JS ============ */
  e('js-read-null', '浏览器 / JS', 'high', [/Cannot read properties of undefined/i, /Cannot read property .* of undefined/i, /Cannot read properties of null/i, /of null \(reading/i, /Cannot set properties of undefined/i],
    '读取 null / undefined 属性',
    '在值为 null 或 undefined 的对象上读取属性，JavaScript 运行时最常见错误。',
    ['接口数据未返回预期字段', '异步数据未到即渲染', '对象初始化不完整'],
    ['加可选链 ?. 与默认值兜底', '渲染前校验数据存在性', '接口层增加字段契约校验']);
  e('js-not-function', '浏览器 / JS', 'high', [/is not a function/i],
    '调用了一个非函数',
    '把一个非函数值当作函数调用，常见于引用错误或异步返回值处理不当。',
    ['方法名拼写错误或未挂载', 'this 指向丢失', '把返回值当成函数二次调用'],
    ['console.log 确认目标值为 function', '用 bind / 箭头函数固定 this', '检查 import 的命名导出是否正确']);
  e('js-not-defined', '浏览器 / JS', 'high', [/is not defined/i],
    '变量未定义',
    '访问了未声明的变量，常见于作用域、加载顺序或构建注入问题。',
    ['脚本加载顺序错误', '变量在别的块级作用域', '构建时环境变量未注入'],
    ['检查 script 标签顺序与 defer / async', '确认变量声明位置与作用域', '检查 webpack DefinePlugin 注入']);
  e('js-cors', '浏览器 / JS', 'high', [/CORS/i, /Access-Control-Allow-Origin/i, /blocked by CORS policy/i, /No 'Access-Control-Allow-Origin' header/i, /preflight/i],
    '跨域请求被拦截（CORS）',
    '浏览器同源策略拦截了跨域响应：服务端未返回正确的 CORS 响应头。',
    ['服务端未配置 Access-Control-Allow-Origin', '预检请求（OPTIONS）未通过', '携带凭证时通配符 * 不合法'],
    ['服务端按来源精确放行并处理 OPTIONS', '带 Cookie 时 Allow-Origin 不能为 *', '本地开发配置 devServer proxy'],
    ['排查重定向链上每一跳的 CORS 头']);
  e('js-mixed', '浏览器 / JS', 'high', [/Mixed Content/i, /mixed content/i, /was loaded over HTTPS/i, /requested an insecure/i],
    '混合内容被拦截',
    'HTTPS 页面中加载了 HTTP 资源，被浏览器拦截。',
    ['页面存在硬编码 http:// 资源', 'CDN 配置不完整'],
    ['全站资源改为 https 或协议相对 //', '配置 upgrade-insecure-requests CSP', '检查第三方嵌入代码']);
  e('js-fetch', '浏览器 / JS', 'high', [/Failed to fetch/i, /NetworkError when attempting to fetch/i, /Load failed/i, /ERR_INTERNET_DISCONNECTED/i, /ERR_NETWORK_CHANGED/i],
    '网络请求失败（fetch）',
    '请求未能完成：网络中断、服务不可达或被浏览器策略拦截。',
    ['设备断网 / 网络切换', '服务不可达或 DNS 故障', '请求被广告拦截插件拦截'],
    ['Network 面板查看失败请求的状态与原因', '检查服务可达性与 HTTPS 证书', '增加失败重试与用户提示']);
  e('js-json', '浏览器 / JS', 'high', [/Unexpected token .* in JSON/i, /JSON\.parse/i, /is not valid JSON/i, /Unexpected end of JSON input/i],
    'JSON 解析失败',
    '被解析的内容不是合法 JSON：空响应、HTML 错误页或字段缺失。',
    ['接口返回 404/500 的 HTML 页面', '响应体为空或含 BOM', '后端序列化异常'],
    ['先看 Response 原文再 JSON.parse', '解析前校验 content-type 与状态码', '统一封装请求层错误处理']);
  e('js-stack', '浏览器 / JS', 'high', [/Maximum call stack size exceeded/i, /too much recursion/i],
    '调用栈溢出',
    '递归没有正确终止，或循环引用导致栈空间耗尽。',
    ['递归缺少终止条件', 'getter / setter 循环触发', '深层嵌套数据结构'],
    ['检查递归基线与边界', '避免在 getter 中触发同类访问', '超大数据结构改用迭代处理']);
  e('js-quota', '浏览器 / JS', 'medium', [/QuotaExceededError/i, /quota exceeded/i, /DOM Exception 22/i, /localStorage.*quota/i],
    '存储配额超限',
    'localStorage / IndexedDB 写入超出浏览器配额（通常 5MB 左右）。',
    ['缓存数据只增不减', '频繁写入大对象', '多标签页并发写满'],
    ['写入前 try/catch 并清理过期数据', '大对象改用 IndexedDB', '加容量监控与降级策略']);
  e('js-script-error', '浏览器 / JS', 'low', [/Script error\./i, /window\.onerror/i],
    'Script error.（跨站脚本）',
    '来自不同域脚本的报错被浏览器统一脱敏为 Script error.，看不到真实信息。',
    ['第三方脚本未加 crossorigin', '监控 SDK 未配置跨源捕获'],
    ['script 标签加 crossorigin="anonymous"', '监控 SDK 开启 captureCrossOrigin', '自托管关键第三方脚本']);

  /* ============ HTTP 状态码 ============ */
  e('http-400', 'HTTP', 'medium', [/\b400\b/, /Bad Request/i],
    '400 请求错误',
    '服务端认为请求格式或参数不合法。',
    ['参数缺失或格式错误', '请求体 JSON 格式错误'],
    ['核对接口文档校验参数', '用抓包确认实际请求体', '统一前端参数校验']);
  e('http-401', 'HTTP', 'medium', [/\b401\b/, /Unauthorized/i],
    '401 未认证',
    '请求缺少或携带了无效的身份凭证。',
    ['token 过期', '未携带 Authorization 头', '凭证被服务端注销'],
    ['检查登录态与 token 有效期', '实现无感刷新与重登机制', '核对请求头是否正确注入']);
  e('http-403', 'HTTP', 'medium', [/\b403\b/, /Forbidden/i],
    '403 禁止访问',
    '服务端识别了身份但拒绝授权。',
    ['角色 / 权限不足', 'IP 被风控或黑名单拦截', 'CSRF 校验失败'],
    ['核对账号角色与资源 ACL', '检查 WAF / 风控规则', '确认 CSRF token 与 Referer 校验']);
  e('http-404', 'HTTP', 'medium', [/\b404\b/, /Not Found/i],
    '404 资源不存在',
    '服务端找不到请求的资源或路由。',
    ['URL 路径错误或资源已删除', '路由 / 重写规则未生效', '前端 base 路径配置错误'],
    ['核对请求 URL 与后端路由表', '检查 nginx location / try_files', '确认前端 publicPath / base href']);
  e('http-405', 'HTTP', 'low', [/\b405\b/, /Method Not Allowed/i],
    '405 方法不允许',
    '请求方法（GET/POST 等）不被该路由支持。',
    ['方法写错（如应为 POST 用了 GET）', '路由只注册了特定方法'],
    ['核对接口文档与方法', '检查前端请求封装', '确认后端路由方法注册']);
  e('http-408', 'HTTP', 'low', [/\b408\b/, /Request Timeout/i],
    '408 请求超时',
    '服务端等待完整请求超时，客户端发送过慢或网络差。',
    ['客户端网络差、发送大 body 慢', '服务端超时配置过短'],
    ['压缩与分片上传大 body', '调整服务端超时', '改善客户端网络']);
  e('http-413', 'HTTP', 'low', [/\b413\b/, /Payload Too Large/i, /Request Entity Too Large/i],
    '413 请求体过大',
    '请求体超过服务端或代理允许的大小上限。',
    ['上传文件过大', 'nginx client_max_body_size 限制'],
    ['调大 nginx / 服务端体积限制', '前端压缩与分片', '改用对象存储直传']);
  e('http-429', 'HTTP', 'medium', [/\b429\b/, /Too Many Requests/i, /rate limit/i],
    '429 请求过于频繁',
    '触发限流：单位时间请求数超过配额。',
    ['突增流量或循环请求', '多实例重复触发', '限流阈值配置过严'],
    ['加指数退避重试', '合并批量请求、加缓存', '按业务调整限流阈值与配额']);
  e('http-500', 'HTTP', 'high', [/\b500\b/, /Internal Server Error/i],
    '500 服务端内部错误',
    '服务端未捕获异常导致请求失败，需查服务端日志定位。',
    ['代码未处理异常', '依赖服务不可用', '配置错误'],
    ['查看服务端 error.log 与链路追踪', '补全异常捕获与兜底', '核对配置与依赖健康状态']);
  e('http-502', 'HTTP', 'high', [/\b502\b/, /Bad Gateway/i, /upstream/i],
    '502 网关错误',
    '反向代理无法从上游获得有效响应，上游崩溃或无响应。',
    ['上游服务崩溃 / 未启动', '上游过载无响应', '代理与上游连接被重置'],
    ['检查上游进程与端口', '查看代理 error.log 中的 upstream 详情', '扩容或优化上游处理能力']);
  e('http-503', 'HTTP', 'medium', [/\b503\b/, /Service Unavailable/i],
    '503 服务不可用',
    '服务暂时不可用：过载、维护或熔断。',
    ['流量过超容量', '发布 / 维护窗口', '熔断降级生效'],
    ['确认是否发布或维护中', '扩容与限流保护', '配置健康检查与自动恢复']);
  e('http-504', 'HTTP', 'high', [/\b504\b/, /Gateway Time/i],
    '504 网关超时',
    '上游未在代理超时时间内返回，常见于慢查询或下游阻塞。',
    ['慢 SQL / 慢接口', '下游服务阻塞拖长链路', '代理超时配置过短'],
    ['定位链路最慢节点并优化', '拆分同步阻塞调用', '按链路分级设置超时']);

  /* ============ Python ============ */
  e('py-module-not-found', 'Python', 'high', [/ModuleNotFoundError/i, /No module named/i],
    '模块不存在（ModuleNotFoundError）',
    '导入的包未安装或不在当前解释器的搜索路径中。',
    ['依赖未安装或装到了其他环境', '虚拟环境未激活', 'PYTHONPATH 缺失'],
    ['pip install 对应包，确认用的同一个解释器', '激活虚拟环境后重跑', '容器内确认 requirements 已安装']);
  e('py-import-name', 'Python', 'high', [/cannot import name/i, /ImportError/i],
    '导入名称失败（ImportError）',
    '包已安装但其中没有要导入的对象：版本不匹配或循环导入。',
    ['安装版本与代码不匹配', '循环导入', '改名 / 重构后未更新引用'],
    ['pip show 核对版本并升级 / 降级', '把导入挪到函数内打破循环', '全局搜索旧名称引用']);
  e('py-indentation', 'Python', 'high', [/IndentationError/i, /TabError/i, /unindent does not match/i],
    '缩进错误（IndentationError）',
    'Python 对缩进敏感：混用 Tab / 空格或对齐不一致直接报错。',
    ['编辑器混用 Tab 与空格', '复制代码带入不一致缩进'],
    ['编辑器开启「显示空白字符」统一为 4 空格', '用 autopep8 / black 格式化', '配置 .editorconfig 统一团队风格']);
  e('py-syntax', 'Python', 'high', [/SyntaxError/i, /invalid syntax/i],
    '语法错误（SyntaxError）',
    '代码不符合 Python 语法，解释器无法解析。',
    ['拼写 / 符号错误（中英文标点）', '版本语法不兼容（如 match 需 3.10+）'],
    ['按提示的行号检查标点与拼写', '确认运行 Python 版本满足语法要求', '用 ruff / flake8 提前拦截']);
  e('py-keyerror', 'Python', 'high', [/KeyError/i],
    '字典键不存在（KeyError）',
    '访问了字典中不存在的键。',
    ['接口返回结构与预期不符', '键名拼写错误', '并发写入后键被删除'],
    ['改用 dict.get(key, default)', '访问前校验 key in dict', '接口层加字段契约校验']);
  e('py-indexerror', 'Python', 'medium', [/IndexError/i, /list index out of range/i],
    '索引越界（IndexError）',
    '访问的列表下标超出实际长度。',
    ['对空列表 / 空结果直接取 [0]', '循环边界计算错误'],
    ['取元素前判断列表非空', '用切片或 next(iter, None) 安全取值', '补边界单测']);
  e('py-attributeerror', 'Python', 'high', [/AttributeError/i, /has no attribute/i],
    '属性不存在（AttributeError）',
    '对象上没有访问的属性或方法。',
    ['对象为 None 仍访问其属性', '拼写错误或版本 API 变更'],
    ['加 None 判断与类型注解', '核对库版本 API', '用 hasattr / getattr 兜底']);
  e('py-typeerror-args', 'Python', 'high', [/TypeError/i, /positional argument/i, /missing .* required positional/i, /takes .* positional/i],
    '类型错误（TypeError）',
    '操作对象类型不符，或函数实参数量 / 类型不对。',
    ['传参数量或类型错误', 'None 参与了运算', '版本间签名变更'],
    ['按报错核对函数签名与实参', '加类型注解与 mypy 检查', '对可能为 None 的入参提前校验']);
  e('py-valueerror', 'Python', 'medium', [/ValueError/i],
    '值错误（ValueError）',
    '类型正确但取值不合法，如解析失败、超出允许范围。',
    ['输入数据格式不符', '数值超出允许范围'],
    ['校验输入并给出明确错误信息', 'try/except 转换层统一处理', '补充分边界测试']);
  e('py-recursion', 'Python', 'high', [/RecursionError/i, /maximum recursion depth/i],
    '递归深度超限（RecursionError）',
    '递归层数超过解释器上限（默认 1000）。',
    ['递归缺少终止条件', '数据规模超过预期'],
    ['改写为迭代或增加显式栈', '确认递归终止条件覆盖所有分支', '必要时 sys.setrecursionlimit 并评估风险']);
  e('py-memory', 'Python', 'high', [/MemoryError/i],
    '内存不足（MemoryError）',
    '进程内存耗尽，通常是数据量过大或泄漏。',
    ['一次性加载超大文件 / 数据集', '循环内累积对象未释放'],
    ['改用流式 / 分块处理', '用生成器替代大列表', '加内存监控与限制']);
  e('py-killed', 'Python', 'high', [/\bKilled\b/i, /OOMKilled/i, /out of memory/i],
    '进程被杀（通常是 OOM）',
    '进程被系统或容器以 SIGKILL 终止，绝大多数是内存超限。',
    ['容器 memory limit 过低', '内存泄漏或峰值过大', '机器整体内存不足'],
    ['dmesg 确认 oom-kill 记录', '提高 limit 并优化内存峰值', '用 memory_profiler 定位泄漏点']);
  e('py-unicode', 'Python', 'medium', [/UnicodeDecodeError/i, /UnicodeEncodeError/i, /codec can't decode/i],
    '编码错误（UnicodeDecodeError）',
    '字节流按指定编码解码失败，常见编码不匹配。',
    ['文件实际编码与指定不符（GBK vs UTF-8）', '网络响应未声明编码'],
    ['显式指定 encoding="utf-8"', '用 chardet 探测真实编码', '源头统一为 UTF-8']);
  e('py-permission', 'Python', 'high', [/PermissionError/i],
    '权限错误（PermissionError）',
    '对文件 / 目录操作时权限不足。',
    ['运行用户无读写权限', '目标目录属主不同'],
    ['修正属主与权限位', '确认运行用户与部署脚本一致', '避免用 root 跑业务进程']);
  e('py-filenotfound', 'Python', 'medium', [/FileNotFoundError/i],
    '文件不存在（FileNotFoundError）',
    '打开的文件路径不存在。',
    ['路径拼写或相对目录错误', '产物未生成'],
    ['用 os.path.abspath 核对路径', '确认前置步骤已产出文件', '部署脚本中校验文件存在']);
  e('py-connrefused', 'Python', 'high', [/ConnectionRefusedError/i, /connection to server .* failed/i],
    '连接被拒绝（ConnectionRefusedError）',
    '连接目标服务时被拒绝：对端未监听或防火墙拦截。',
    ['数据库 / 下游服务未启动', '地址端口配置错误', '网络策略拦截'],
    ['确认下游服务存活与端口', '核对连接串', '检查安全组与容器网络']);
  e('py-brokenpipe', 'Python', 'medium', [/BrokenPipeError/i, /broken pipe/i],
    '管道断裂（BrokenPipeError）',
    '写入的对端已关闭连接，常见于客户端提前断开。',
    ['客户端超时断开', '下游进程崩溃', '写响应时客户端已取消'],
    ['捕获并记录而非直接崩溃', '加心跳与重连', '控制写入节奏与背压']);
  e('py-assert', 'Python', 'high', [/AssertionError/i],
    '断言失败（AssertionError）',
    'assert 条件不满足，测试或防御性断言触发。',
    ['测试预期与实际不符', '不变量被破坏', '测试数据构造错误'],
    ['查看断言两侧的实际值', '修正实现或更新预期', '区分测试断言与生产校验']);
  e('pip-resolve', 'Python', 'high', [/ResolutionImpossible/i, /Could not find a version/i, /dependency resolver/i, /ERROR: Cannot install/i],
    'pip 依赖解析失败',
    'pip 无法找出一组互相兼容的依赖版本。',
    ['版本约束冲突', '指定版本不存在', 'Python 版本不受支持'],
    ['放宽或统一版本约束', '用 pip-tools / uv 生成锁定文件', '确认 Python 版本在支持矩阵内']);

  /* ============ Java ============ */
  e('java-npe', 'Java', 'high', [/NullPointerException/i],
    '空指针异常（NullPointerException）',
    '对 null 引用调用方法或访问字段，Java 第一大异常。',
    ['对象未初始化', '方法可能返回 null 未校验', '自动拆箱遇到 null'],
    ['按堆栈定位到行，补 None 校验', '用 Optional 明确可空返回', '开启静态空值检查（IDE / ErrorProne）']);
  e('java-oom-heap', 'Java', 'high', [/Java heap space/i, /OutOfMemoryError.*heap/i],
    '堆内存溢出（OOM: Java heap space）',
    'JVM 堆耗尽：存活对象超过 -Xmx 上限。',
    ['内存泄漏（集合只增不减）', '一次性加载过大集合', '堆上限设置过小'],
    ['-XX:+HeapDumpOnOutOfMemoryError 抓 dump 用 MAT 分析', '定位泄漏集合并修复', '按负载调整 -Xmx', '大对象改流式处理']);
  e('java-oom-metaspace', 'Java', 'high', [/Metaspace/i],
    '元空间溢出（OOM: Metaspace）',
    '类元数据空间耗尽，常见于频繁动态生成类。',
    ['动态代理 / 反射生成类过多', 'Metaspace 上限过小'],
    ['-XX:MaxMetaspaceSize 调大', '排查重复类加载与代理泄漏', '热部署场景确认类卸载正常']);
  e('java-oom-gc', 'Java', 'high', [/GC overhead limit exceeded/i],
    'GC 开销超限',
    'JVM 超过 98% 时间在做 GC 却收效甚微，通常距离真正 OOM 一步之遥。',
    ['接近堆上限', '存在大量短命对象'],
    ['按堆溢出思路抓 dump 分析', '优化对象分配与缓存', '调整 GC 器与堆分区']);
  e('java-stackoverflow', 'Java', 'high', [/StackOverflowError/i],
    '栈溢出（StackOverflowError）',
    '调用链过深，通常是无终止递归。',
    ['递归缺少终止条件', '循环依赖调用'],
    ['检查递归基线与边界', '改迭代实现', '确认对象间无循环调用']);
  e('java-classnotfound', 'Java', 'high', [/ClassNotFoundException/i],
    '类未找到（ClassNotFoundException）',
    '运行时通过反射 / 类名加载，但类不在 classpath。',
    ['依赖缺失', 'classpath 配置错误', '打包遗漏'],
    ['补依赖并确认作用域', '检查 IDE 与构建的 classpath', '用 mvn dependency:tree 核对']);
  e('java-noclassdef', 'Java', 'high', [/NoClassDefFoundError/i],
    '类定义未找到（NoClassDefFoundError）',
    '编译期存在但运行期缺失：通常是依赖冲突或初始化失败。',
    ['jar 包冲突被排除', '类静态初始化抛异常后再次加载', '打包不完整'],
    ['mvn dependency:tree 排查冲突', '确认打包包含全部依赖', '查看类首次加载时的根因异常']);
  e('java-cme', 'Java', 'medium', [/ConcurrentModificationException/i],
    '并发修改异常',
    '遍历集合的同时修改了它。',
    ['多线程未同步访问集合', '遍历中直接删除元素'],
    ['用 Iterator.remove 或并发集合', '加锁或改 CopyOnWrite', '梳理线程所有权']);
  e('java-nosuchmethod', 'Java', 'medium', [/NoSuchMethodError/i, /NoSuchMethodException/i, /AbstractMethodError/i],
    '方法不存在（NoSuchMethod）',
    '调用的方法在运行期版本中不存在：依赖版本与编译期不一致。',
    ['依赖版本漂移', '二进制不兼容升级'],
    ['锁定依赖版本', 'mvn dependency:tree 对齐', '避免跨版本混用同一库']);
  e('java-sslhandshake', 'Java', 'high', [/SSLHandshakeException/i, /PKIX path/i, /unable to find valid certification path/i],
    'SSL 握手失败（Java）',
    'Java 客户端不信任服务端证书链或协议不匹配。',
    ['证书链不完整', 'JDK truststore 未导入私有 CA', 'TLS 版本不匹配'],
    ['keytool 导入证书到 truststore', '补齐服务端证书链', '对齐 JDK 与 TLS 版本']);
  e('java-bind', 'Java', 'high', [/BindException/i],
    '端口绑定失败（BindException）',
    '服务端口被占用或无权绑定。',
    ['端口已被占用', '绑定 1024 以下端口无权限'],
    ['netstat 找到占用进程', '更换端口或提升权限', '容器检查端口映射']);
  e('java-connect', 'Java', 'high', [/ConnectException/i],
    '连接失败（ConnectException）',
    'Java 客户端无法连接目标服务。',
    ['目标未启动或端口错误', '网络 / 防火墙拦截'],
    ['确认目标存活与端口', '检查网络策略', '加重试与熔断']);
  e('maven-failure', 'Java', 'high', [/BUILD FAILURE/i, /Failed to execute goal/i, /\[ERROR\].*maven/i],
    'Maven 构建失败',
    'Maven 某一阶段失败：编译、测试或插件执行。',
    ['编译错误', '测试失败', '插件 / 仓库配置问题'],
    ['看 [ERROR] 首个堆栈定位根因', '-DskipTests 先验证编译', '检查 settings.xml 与私服配置']);
  e('gradle-failure', 'Java', 'high', [/FAILURE: Build failed/i, /What went wrong/i, /Execution failed for task/i],
    'Gradle 构建失败',
    'Gradle 任务执行失败。',
    ['编译 / 测试错误', '任务配置或依赖问题', 'Gradle 版本与插件不兼容'],
    ['看 What went wrong 首条根因', '--stacktrace 获取完整堆栈', '升级 Gradle 与插件版本']);
  e('spring-bean', 'Java', 'high', [/BeanCreationException/i, /Error creating bean/i, /NoSuchBeanDefinition/i],
    'Spring Bean 创建失败',
    '容器初始化 Bean 时出错：依赖缺失、配置错误或循环依赖。',
    ['依赖 Bean 不存在', '属性注入值缺失', '循环依赖'],
    ['看 caused by 定位根因', '核对配置类与扫描路径', '用 @Lazy 或重构打破循环依赖']);
  e('hikari-pool', 'Java', 'high', [/HikariPool/i, /Connection is not available/i, /request timed out after \d+/i],
    '连接池耗尽（HikariPool）',
    '数据库连接池无可用连接，请求排队超时。',
    ['连接未归还（泄漏）', '慢 SQL 长时间占用连接', '池大小与并发不匹配'],
    ['开启 leakDetectionThreshold 查泄漏', '优化慢 SQL', '调整 maximum-pool-size', '加监控告警']);

  /* ============ Go ============ */
  e('go-nil-deref', 'Go', 'high', [/nil pointer dereference/i, /invalid memory address or nil pointer/i],
    '空指针解引用',
    '对 nil 指针访问字段或调用方法。',
    ['返回值未判空', '结构体指针未初始化', 'map 取值误用指针'],
    ['按堆栈定位行，补 nil 判断', '初始化返回值而非 nil 指针', '用值类型减少空指针面']);
  e('go-map-write', 'Go', 'high', [/concurrent map writes/i, /concurrent map read and map write/i],
    '并发写 map',
    '多个 goroutine 同时读写同一个 map，Go 运行时直接 crash。',
    ['缺少互斥保护', '误以为 map 读写并发安全'],
    ['加 sync.Mutex / RWMutex', '或改用 sync.Map', '把 map 收敛到单个 goroutine']);
  e('go-deadlock', 'Go', 'high', [/all goroutines are asleep - deadlock/i],
    '全部 goroutine 死锁',
    '所有 goroutine 都在等待，程序无法推进。',
    ['channel 等待方向写反', '锁顺序不一致', 'WaitGroup 计数错误'],
    ['用 goroutine dump 分析各自阻塞点', '修正 channel 收发配对', '统一加锁顺序']);
  e('go-panic', 'Go', 'medium', [/^panic:/i, /goroutine \d+ \[running\]/i],
    'panic 运行时崩溃',
    'Go 运行时抛出 panic，通常伴随堆栈输出。',
    ['空指针 / 越界等运行时错误', '显式 panic 调用'],
    ['看堆栈首个业务帧定位根因', '需要恢复的场景加 recover', '补对应单测']);
  e('go-too-many-open', 'Go', 'high', [/too many open files/i],
    '打开文件数超限',
    '进程 fd 超过系统上限，连接 / 文件未关闭。',
    ['响应体未关闭', '连接泄漏'],
    ['defer resp.Body.Close()', 'ulimit -n 调大', '连接池化复用']);

  /* ============ Docker / K8s ============ */
  e('docker-oomkilled', 'Docker / K8s', 'high', [/OOMKilled/i],
    '容器被 OOMKilled',
    '容器内存超过 limit 被内核终止，退出码通常为 137。',
    ['memory limit 过低', '应用内存泄漏或峰值过高'],
    ['kubectl describe pod 确认 OOMKilled 与 limit', '优化内存占用', '合理上调 limits.memory']);
  e('docker-exit137', 'Docker / K8s', 'high', [/exit code 137/i, /exit status 137/i, /code 137/i, /exited with code 137/i],
    '退出码 137（SIGKILL）',
    '进程收到 SIGKILL：多为 OOM 或手动强杀。',
    ['OOMKilled', '节点资源紧张被驱逐', '探针失败被重启'],
    ['确认上一状态是否 OOMKilled', '检查节点资源与驱逐事件', '调整 limits 与探针参数']);
  e('docker-exit143', 'Docker / K8s', 'medium', [/exit code 143/i, /exit status 143/i, /code 143/i],
    '退出码 143（SIGTERM）',
    '进程收到 SIGTERM 优雅终止，滚动更新时正常，异常时可能是探针或驱逐。',
    ['滚动更新 / 缩容', '探针失败重启', '节点排水'],
    ['结合事件时间线判断是否预期内', '配置 preStop 优雅退出', '检查探针阈值合理性']);
  e('docker-nospace', 'Docker / K8s', 'high', [/no space left on device/i, /ENOSPC/i],
    '磁盘空间不足',
    '写入时磁盘或 inode 耗尽。',
    ['日志 / 镜像无限增长', 'inode 耗尽', '临时文件未清理'],
    ['df -h 与 df -i 分别排查容量与 inode', '清理镜像 / 容器 / 日志', '配置日志轮转与资源限制']);
  e('docker-oci', 'Docker / K8s', 'medium', [/OCI runtime create failed/i, /error creating containerd/i, /no such file or directory.*container/i],
    '容器运行时创建失败',
    'containerd / runc 无法创建容器。',
    ['镜像不完整或损坏', '存储驱动异常', '资源限制冲突'],
    ['重新拉取镜像', '重启 docker / containerd', '检查存储驱动与内核版本']);
  e('docker-manifest', 'Docker / K8s', 'medium', [/manifest unknown/i, /manifest for .* not found/i, /error pulling image/i],
    '镜像拉取失败',
    '镜像不存在、tag 错误或无拉取权限。',
    ['tag 拼写错误', '私有仓库未认证', '镜像被删除'],
    ['核对镜像名与 tag', '配置 imagePullSecrets', '确认仓库中镜像存在']);
  e('k8s-crashloop', 'Docker / K8s', 'high', [/CrashLoopBackOff/i, /Back-off restarting/i],
    'Pod 崩溃重启循环',
    '容器启动后反复退出，K8s 以退避策略重启。',
    ['应用启动即崩溃（配置 / 依赖缺失）', '探针失败', 'OOMKilled'],
    ['kubectl logs --previous 看崩溃前日志', '检查探针与资源 limits', '修复后观察 restart 计数归零']);
  e('k8s-imagepull', 'Docker / K8s', 'high', [/ImagePullBackOff/i, /ErrImagePull/i, /Failed to pull image/i],
    '镜像拉取失败（ImagePullBackOff）',
    'K8s 无法拉取容器镜像。',
    ['镜像名 / tag 错误', '仓库认证缺失', '节点无法访问仓库'],
    ['describe pod 查看 Events 详情', '配置 imagePullSecrets', '确认节点到仓库网络连通']);
  e('docker-timeout', 'Docker / K8s', 'high', [/dial tcp .* i\/o timeout/i, /context deadline exceeded/i],
    '容器网络超时',
    '容器内访问外部地址超时。',
    ['DNS 解析失败', '网络策略拦截', '跨集群网络不通'],
    ['容器内 nslookup / curl 验证', '检查 NetworkPolicy 与安全组', '确认 DNS 配置（CoreDNS）']);

  /* ============ Git ============ */
  e('git-conflict', 'Git', 'high', [/CONFLICT \(content\)/i, /Merge conflict/i, /Automatic merge failed/i],
    '合并冲突',
    '两个分支对同一处代码做了不同修改，需要人工裁决。',
    ['多人同时修改同一区域', '长期分支未同步主干'],
    ['编辑冲突标记 <<<<<<< ======= >>>>>>> 后 git add', 'git checkout --ours / --theirs 快速取舍', '频繁 rebase 主干减少冲突面']);
  e('git-nonfastforward', 'Git', 'high', [/non-fast-forward/i, /failed to push some refs/i, /Updates were rejected/i],
    '推送被拒绝（non-fast-forward）',
    '远端有本地没有的提交，直接推送会被拒绝。',
    ['别人先推送了提交', '本地 base 落后'],
    ['git pull --rebase 后再推送', '确认无冲突后强推需谨慎（仅限自有分支）', '养成先 fetch 再开发的习惯']);
  e('git-detached', 'Git', 'low', [/detached HEAD/i, /You are in 'detached HEAD' state/i],
    '游离头指针（detached HEAD）',
    'HEAD 指向某个提交而非分支，直接提交可能丢失。',
    ['checkout 了 commit / tag', 'CI 检出特定版本'],
    ['git checkout -b 新分支 保住提交', '确认无需保留直接切回分支', '排查 CI 检出方式']);
  e('git-crlf', 'Git', 'low', [/CRLF/i, /LF will be replaced by CRLF/i, /warning: .* will be replaced/i],
    '换行符警告（CRLF/LF）',
    'Windows 与 Linux 换行符不一致导致的警告，可能引发整文件 diff。',
    ['core.autocrlf 配置不一致', '跨平台协作'],
    ['git config --global core.autocrlf true（Win）', '加 .gitattributes 统一规则', '提交前统一换行符']);
  e('git-publickey', 'Git', 'high', [/Permission denied \(publickey\)/i, /Could not read from remote repository/i],
    'SSH 公钥认证失败',
    'Git 服务器拒绝了 SSH 公钥。',
    ['公钥未添加到平台', '私钥未加载到 agent', 'key 类型不被支持'],
    ['ssh -T [redacted email] 验证', '平台添加公钥 / 检查 agent', '确认 remote 用的是 SSH 地址']);
  e('git-unrelated', 'Git', 'high', [/refusing to merge unrelated histories/i],
    '拒绝合并不相关历史',
    '两个仓库没有共同祖先，git 默认拒绝合并。',
    ['本地 init 与远端已有历史', '误操作 init 新仓库'],
    ['确认要保留的历史后加 --allow-unrelated-histories', '或清空本地重新 clone', '初始化时先 clone 再开发']);
  e('git-indexlock', 'Git', 'medium', [/Unable to create '.*index\.lock'/i, /Another git process/i],
    'index.lock 占用',
    '另一个 git 进程持有索引锁，或上次异常退出残留。',
    ['并发的 git 命令', '进程被杀留下锁文件'],
    ['确认无 git 进程后删除 .git/index.lock', '避免 IDE 与命令行并发操作', '异常中断后检查残留锁']);

  /* ============ TypeScript ============ */
  e('ts2307', 'TypeScript', 'high', [/TS2307/i, /Cannot find module '.*' or its type declarations/i],
    'TS2307 找不到模块',
    'TypeScript 无法解析模块或其类型声明。',
    ['包未安装或缺 @types', '路径 / 后缀配置问题', 'types 字段未包含声明'],
    ['安装依赖与对应 @types 包', '检查 tsconfig paths 与 moduleResolution', '确认 package.json types 入口']);
  e('ts2339', 'TypeScript', 'high', [/TS2339/i, /Property '.*' does not exist on type/i],
    'TS2339 属性不存在',
    '对象类型上没有该属性。',
    ['类型定义与实际不符', '可选属性未判空', '接口变更未同步'],
    ['补全类型定义或收敛使用处', '访问前 narrowing 类型', '接口变更同步更新类型']);
  e('ts2345', 'TypeScript', 'high', [/TS2345/i, /Argument of type .* is not assignable to parameter/i],
    'TS2345 参数类型不匹配',
    '函数实参类型与形参声明不符。',
    ['类型收窄 / 放宽变化', '字面量推断偏差', '重载签名不匹配'],
    ['对齐实参与形参类型', '用断言前先确认数据契约', '检查重载与泛型推导']);
  e('ts2322', 'TypeScript', 'high', [/TS2322/i, /Type '.*' is not assignable to type/i],
    'TS2322 类型不兼容赋值',
    '赋值两侧类型不匹配。',
    ['联合类型处理不全', 'API 返回类型变化'],
    ['补全分支处理所有联合成员', '更新类型定义', '避免盲目 as any']);
  e('ts2531', 'TypeScript', 'high', [/TS2531/i, /Object is possibly 'null'/i, /Object is possibly "null"/i],
    'TS2531 可能为 null',
    'strict 模式下对象可能为 null 未做判断。',
    ['严格模式开启', '可选值直接使用'],
    ['加 if 判空或可选链', '用非空断言前确认依据', '初始化时给默认值']);
  e('ts2554', 'TypeScript', 'high', [/TS2554/i, /Expected \d+ arguments, but got/i],
    'TS2554 参数数量不符',
    '调用函数实参个数与签名不符。',
    ['可选参数顺序错误', '重载理解偏差'],
    ['按签名补齐参数', '把可选参数后移', '核对重载列表']);
  e('ts7006', 'TypeScript', 'medium', [/TS7006/i, /Parameter '.*' implicitly has an 'any'/i],
    'TS7006 隐式 any',
    'noImplicitAny 下参数缺少类型标注。',
    ['回调参数未标注', '第三方库缺类型'],
    ['给参数补显式类型', '引入 @types 或 declare 模块', '回调类型用泛型推导']);

  /* ============ 数据库 ============ */
  e('db-unique', '数据库', 'high', [/duplicate key value violates unique constraint/i, /Duplicate entry/i, /ER_DUP_ENTRY/i],
    '唯一键冲突',
    '插入 / 更新违反了唯一约束。',
    ['重复提交', '幂等设计缺失', '历史脏数据'],
    ['业务层加幂等键（唯一索引）', '用 ON CONFLICT / INSERT IGNORE 处理', '清理存量重复数据']);
  e('db-deadlock', '数据库', 'high', [/deadlock detected/i, /Deadlock found when trying/i, /40P01/i, /\b1213\b/],
    '死锁（Deadlock）',
    '两个事务互相等待对方持有的锁，数据库主动回滚其一。',
    ['加锁顺序不一致', '大事务长时间持锁', '间隙锁范围过大'],
    ['统一加锁顺序', '拆小事务、缩短持锁时间', '失败后按策略重试', 'SHOW ENGINE INNODB STATUS 分析现场']);
  e('db-lockwait', '数据库', 'high', [/Lock wait timeout exceeded/i, /lock timeout/i],
    '锁等待超时',
    '等待行锁 / 表锁超过 innodb_lock_wait_timeout。',
    ['长事务持有锁不释放', '热点行更新集中'],
    ['找出持锁事务并评估 kill', '拆分大事务', '热点行改队列或乐观锁']);
  e('db-toomanyconn', '数据库', 'high', [/too many connections/i, /remaining connection slots/i, /connection slots are reserved/i],
    '数据库连接数打满',
    '连接数超过 max_connections，新连接被拒。',
    ['连接池配置过大 / 泄漏', '实例数过多', '连接未复用'],
    ['核算各服务池大小总和', '引入代理层（ProxySQL / pgbouncer）', '修复连接泄漏']);
  e('db-relation', '数据库', 'high', [/relation ".*" does not exist/i, /Table '.*' doesn't exist/i, /42P01/i, /\b1146\b/],
    '表 / 关系不存在',
    '访问的表不存在：未建表、库选错或迁移未执行。',
    ['迁移脚本未执行', '连接到了错误的库', '表名大小写敏感问题'],
    ['确认连接库与 schema', '执行迁移脚本', '核对表名与大小写']);
  e('db-column', '数据库', 'high', [/column ".*" does not exist/i, /Unknown column '.*'/i, /42703/i],
    '字段不存在',
    'SQL 引用的列不存在。',
    ['迁移未执行', '列名拼写错误', '多环境 schema 不一致'],
    ['执行最新迁移', '核对列名与表结构', 'CI 增加 schema 一致性校验']);
  e('db-datatoolong', '数据库', 'medium', [/Data too long for column/i, /data too long/i, /\b1406\b/],
    '数据超出字段长度',
    '写入值超过列定义长度。',
    ['输入未做长度校验', '列定义过小'],
    ['服务端校验并截断 / 拒绝', '评估扩大列长度', '统一长度约束到 API 层']);

  /* ============ 操作系统 ============ */
  e('os-segv', '操作系统', 'high', [/Segmentation fault/i, /SIGSEGV/i, /signal 11/i],
    '段错误（SIGSEGV）',
    '进程访问了非法内存地址被内核终止，常见于原生扩展。',
    ['原生模块 bug', '空指针 / 越界访问', '内存踩踏'],
    ['复现并抓 core dump 用 gdb 分析', '升级相关原生依赖', '隔离验证是哪个模块']);
  e('os-oomkiller', '操作系统', 'high', [/Out of memory: Killed process/i, /oom-kill/i, /OOM killer/i, /Memory cgroup out of memory/i],
    '系统 OOM Killer',
    '整机内存耗尽，内核按分值挑选进程杀掉。',
    ['单进程吃满内存', '多个服务超售', 'cgroup 限制触发'],
    ['dmesg / journalctl 确认被杀进程', '按进程治理内存占用', '合理设置 cgroup limit 与预留'],
    ['加内存水位告警提前发现']);
  e('os-disk', '操作系统', 'high', [/disk quota exceeded/i, /Read-only file system/i, /quota exceeded/i],
    '磁盘配额 / 只读文件系统',
    '写入被配额或只读挂载阻止。',
    ['用户 / 目录配额用满', '文件系统损坏进入只读', '云盘满'],
    ['df -h / quota 定位', '清理或申请扩容', '文件系统修复前先备份数据']);
  e('os-sigabrt', '操作系统', 'medium', [/SIGABRT/i, /signal 6/i, /abort\(\)/i],
    'SIGABRT 异常终止',
    '进程调用 abort 主动终止：断言失败、堆损坏或 C 运行时错误。',
    ['C 层断言失败', '堆内存损坏', '重复 free 等问题'],
    ['抓 core 用 gdb 看 abort 前堆栈', '升级相关库', '用 ASAN 复现定位']);
  e('os-address-in-use', '操作系统', 'high', [/Address already in use/i],
    '地址已被占用',
    '绑定地址端口失败，通常是被占用或不满足复用条件。',
    ['端口被占用', 'TIME_WAIT 未回收且未开 reuse'],
    ['netstat 找到占用方', '开启 SO_REUSEADDR', '更换端口或协调部署']);

  /* ============ CI / 测试 ============ */
  e('ci-exit1', 'CI / 测试', 'high', [/Process completed with exit code 1/i, /exit code 1/i, /exit status 1/i, /returned non-zero exit status/i],
    '命令退出码非 0',
    'CI 步骤返回非零退出码，需向上找到第一个真正失败的信号。',
    ['前置步骤失败', '测试 / 构建报错', '脚本逻辑错误'],
    ['定位日志中首个 error 而非最后一行', '本地复跑同一命令', '失败步骤加详细输出']);
  e('ci-gha-error', 'CI / 测试', 'medium', [/##\[error\]/i],
    'GitHub Actions 错误标记',
    'GHA 显式标注的错误行，通常紧跟真实失败原因。',
    ['步骤执行失败', '断言检查失败'],
    ['向上展开首个 ##[error] 的上下文', '本地复现同一步骤', '为步骤加 set -e 与详细日志']);
  e('test-jest', 'CI / 测试', 'high', [/●/, /Test suite failed to run/i, /expect\(received\)/i, /FAIL\s+\S+\.test\.(js|ts)/i],
    'Jest 测试失败',
    '单测断言失败或测试套件无法运行。',
    ['实现与预期不符', '测试环境 / mock 缺失', '异步未正确等待'],
    ['看 ● 后的用例名与 diff', '本地 jest 单文件复跑', '补齐 mock 与 await']);
  e('test-pytest', 'CI / 测试', 'high', [/FAILED \S+::/i, /pytest/i, /AssertionError/i],
    'pytest 测试失败',
    '用例失败或收集报错。',
    ['实现与预期不符', 'fixture 缺失', '环境依赖问题'],
    ['pytest -x 首个失败即停', '查看 FAILED 行定位用例', '本地复跑并核对 fixture']);
  e('test-build', 'CI / 测试', 'high', [/Build failed/i, /compilation failed/i, /Compilation failed/i, /BUILD FAILED/i, /error TS\d+/i],
    '构建失败',
    '编译或打包阶段失败，后续步骤均不可信。',
    ['类型 / 语法错误', '依赖或配置问题', '资源缺失'],
    ['从首个编译错误开始修', '本地跑同样构建命令', '锁定工具链版本']);
  e('test-lint', 'CI / 测试', 'low', [/ESLint/i, /ruff/i, /mypy/i, /pylint/i, /lint/i],
    'Lint / 静态检查告警',
    '代码风格或静态检查未通过，多数不影响运行但阻塞 CI 门禁。',
    ['风格规则严格', '潜在缺陷被静态检查发现'],
    ['按规则批量修复（--fix）', '确认是误报则加行内忽略并注释', '统一团队 lint 配置']);

  function byId() {
    const m = {};
    for (const item of KB) m[item.id] = item;
    return m;
  }

  function matchAll(text) {
    const out = [];
    if (!text) return out;
    const s = String(text);
    for (const item of KB) {
      let n = 0;
      for (const re of item.patterns) { if (re.test(s)) n++; }
      if (n > 0) out.push({ item: item, score: n });
    }
    const rank = { high: 3, medium: 2, low: 1 };
    out.sort(function (a, b) {
      return (rank[b.item.sev] - rank[a.item.sev]) || (b.score - a.score) || (a.item.id < b.item.id ? -1 : 1);
    });
    return out;
  }

  return { KB: KB, byId: byId, matchAll: matchAll };
});
