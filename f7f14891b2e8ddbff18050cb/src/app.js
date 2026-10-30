"use strict";

const categories = {
  office: "办公协同",
  browser: "浏览器",
  devops: "运维开发",
  chat: "聊天通讯",
  "ai-chat": "AI 聊天",
  "ai-tools": "AI 工具",
  game: "游戏娱乐",
  media: "影音创作",
  entertainment: "影音娱乐",
  utility: "系统工具",
};

const softwareCatalog = [
  {
    id: "wechat",
    name: "微信",
    mark: "微",
    tone: "green",
    category: "chat",
    url: "https://weixin.qq.com/",
    description: "腾讯官方微信客户端下载与产品说明。",
    aliases: ["微信", "wechat", "weixin", "聊天", "即时通讯", "社交"],
  },
  {
    id: "wecom",
    name: "企业微信",
    mark: "企",
    tone: "green",
    category: "office",
    url: "https://work.weixin.qq.com/",
    description: "面向企业内部沟通与客户联系的腾讯官方工具。",
    aliases: ["企业微信", "wecom", "公司聊天", "办公沟通", "客户联系"],
  },
  {
    id: "qq",
    name: "QQ",
    mark: "Q",
    tone: "blue",
    category: "chat",
    url: "https://im.qq.com/",
    description: "腾讯 QQ 官方电脑版、手机版与产品入口。",
    aliases: ["qq", "腾讯qq", "聊天", "即时通讯", "社交"],
  },
  {
    id: "dingtalk",
    name: "钉钉",
    mark: "钉",
    tone: "blue",
    category: "office",
    url: "https://www.dingtalk.com/",
    description: "阿里巴巴官方协同办公与组织沟通平台。",
    aliases: ["钉钉", "dingtalk", "办公", "打卡", "协同", "会议"],
  },
  {
    id: "feishu",
    name: "飞书",
    mark: "飞",
    tone: "blue",
    category: "office",
    url: "https://www.feishu.cn/",
    description: "字节跳动官方办公协作、文档与会议工具。",
    aliases: ["飞书", "lark", "feishu", "办公", "协同", "团队会议", "文档"],
  },
  {
    id: "tencent-meeting",
    name: "腾讯会议",
    mark: "会",
    tone: "blue",
    category: "office",
    url: "https://meeting.tencent.com/",
    description: "腾讯官方在线会议、屏幕共享与远程协作工具。",
    aliases: ["腾讯会议", "tencent meeting", "voov", "在线会议", "团队会议", "开会", "视频会议"],
  },
  {
    id: "zoom",
    name: "Zoom",
    mark: "Z",
    tone: "blue",
    category: "office",
    url: "https://zoom.us/download",
    description: "Zoom 官方客户端下载与在线会议服务。",
    aliases: ["zoom", "在线会议", "团队会议", "视频会议", "开会"],
  },
  {
    id: "discord",
    name: "Discord",
    mark: "D",
    tone: "lilac",
    category: "chat",
    url: "https://discord.com/download",
    description: "Discord 官方桌面客户端下载入口。",
    aliases: ["discord", "语音聊天", "游戏开黑", "社群", "频道"],
  },
  {
    id: "telegram",
    name: "Telegram",
    mark: "T",
    tone: "blue",
    category: "chat",
    url: "https://telegram.org/",
    description: "Telegram 官方桌面端、移动端与网页版入口。",
    aliases: ["telegram", "tg", "纸飞机", "聊天", "即时通讯"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    mark: "W",
    tone: "green",
    category: "chat",
    url: "https://www.whatsapp.com/download/",
    description: "WhatsApp 官方桌面客户端下载入口。",
    aliases: ["whatsapp", "聊天", "即时通讯", "国际聊天"],
  },
  {
    id: "wps",
    name: "WPS Office",
    mark: "W",
    tone: "orange",
    category: "office",
    url: "https://www.wps.cn/",
    description: "金山办公官方 WPS 下载、文档与 AI 办公入口。",
    aliases: ["wps", "wps office", "金山", "金山办公", "word", "excel", "ppt", "办公软件", "文档"],
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    mark: "M",
    tone: "blue",
    category: "office",
    url: "https://www.microsoft.com/zh-cn/microsoft-365",
    description: "微软官方 Office、Word、Excel 与 Microsoft 365 产品页。",
    aliases: ["office", "microsoft office", "microsoft 365", "微软办公", "word", "excel", "ppt", "办公软件"],
  },
  {
    id: "libreoffice",
    name: "LibreOffice",
    mark: "L",
    tone: "green",
    category: "office",
    url: "https://www.libreoffice.org/download/download-libreoffice/",
    description: "自由开源办公套件的官方下载页面。",
    aliases: ["libreoffice", "office", "办公软件", "文档", "表格", "演示"],
  },
  {
    id: "notion",
    name: "Notion",
    mark: "N",
    tone: "sand",
    category: "office",
    url: "https://www.notion.com/desktop",
    description: "Notion 官方桌面客户端与工作区应用。",
    aliases: ["notion", "笔记", "知识库", "文档", "项目管理"],
  },
  {
    id: "slack",
    name: "Slack",
    mark: "S",
    tone: "lilac",
    category: "office",
    url: "https://slack.com/downloads/windows",
    description: "Slack 官方 Windows 桌面客户端下载入口。",
    aliases: ["slack", "团队沟通", "办公聊天", "协作", "频道"],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    mark: "O",
    tone: "lilac",
    category: "office",
    url: "https://obsidian.md/download",
    description: "Obsidian 官方本地笔记与知识管理工具。",
    aliases: ["obsidian", "黑曜石", "笔记", "知识库", "markdown"],
  },
  {
    id: "chrome",
    name: "Google Chrome",
    mark: "C",
    tone: "orange",
    category: "browser",
    url: "https://www.google.com/chrome/",
    description: "Google 官方 Chrome 浏览器下载与介绍页。",
    aliases: ["chrome", "谷歌浏览器", "谷歌", "google", "浏览器", "网页"],
  },
  {
    id: "edge",
    name: "Microsoft Edge",
    mark: "E",
    tone: "blue",
    category: "browser",
    url: "https://www.microsoft.com/zh-cn/edge/download",
    description: "微软官方 Edge 浏览器下载入口。",
    aliases: ["edge", "微软浏览器", "microsoft edge", "ie浏览器", "浏览器", "网页"],
  },
  {
    id: "firefox",
    name: "Firefox",
    mark: "F",
    tone: "orange",
    category: "browser",
    url: "https://www.mozilla.org/zh-CN/firefox/new/",
    description: "Mozilla 官方 Firefox 浏览器下载页面。",
    aliases: ["firefox", "火狐", "火狐浏览器", "mozilla", "浏览器", "网页"],
  },
  {
    id: "brave",
    name: "Brave",
    mark: "B",
    tone: "orange",
    category: "browser",
    url: "https://brave.com/download/",
    description: "Brave 官方隐私浏览器下载入口。",
    aliases: ["brave", "隐私浏览器", "广告拦截", "浏览器", "网页"],
  },
  {
    id: "opera",
    name: "Opera",
    mark: "O",
    tone: "orange",
    category: "browser",
    url: "https://www.opera.com/zh-cn",
    description: "Opera 官方浏览器中文产品与下载入口。",
    aliases: ["opera", "欧朋浏览器", "浏览器", "网页"],
  },
  {
    id: "vivaldi",
    name: "Vivaldi",
    mark: "V",
    tone: "orange",
    category: "browser",
    url: "https://vivaldi.com/zh-hans/download/",
    description: "Vivaldi 官方高度可定制浏览器下载页。",
    aliases: ["vivaldi", "浏览器", "网页", "自定义浏览器"],
  },
  {
    id: "360-browser-x",
    name: "360 极速浏览器X",
    mark: "360",
    tone: "green",
    category: "browser",
    url: "https://browser.360.cn/ee/",
    description: "360 官方极速浏览器 X 产品与下载入口。",
    aliases: ["360", "360浏览器", "360极速浏览器", "360极速浏览器x", "浏览器"],
  },
  {
    id: "360-browser",
    name: "360 安全浏览器",
    mark: "360",
    tone: "green",
    category: "browser",
    url: "https://browser.360.cn/",
    description: "360 官方安全浏览器产品与下载入口。",
    aliases: ["360", "360浏览器", "360安全浏览器", "浏览器"],
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    mark: "VS",
    tone: "blue",
    category: "devops",
    url: "https://code.visualstudio.com/download",
    description: "微软官方 VS Code 编辑器下载页。",
    aliases: ["vscode", "vs code", "visual studio code", "代码编辑器", "编程", "写代码", "开发"],
  },
  {
    id: "git",
    name: "Git",
    mark: "Git",
    tone: "orange",
    category: "devops",
    url: "https://git-scm.com/download/win",
    description: "Git 官方 Windows 安装程序下载入口。",
    aliases: ["git", "版本控制", "代码管理", "开发", "github", "编程"],
  },
  {
    id: "nodejs",
    name: "Node.js",
    mark: "N",
    tone: "green",
    category: "devops",
    url: "https://nodejs.org/zh-cn/download",
    description: "Node.js 官方中文下载页，务必选择 LTS 版本。",
    aliases: ["node", "nodejs", "node.js", "npm", "javascript", "开发", "环境"],
  },
  {
    id: "python",
    name: "Python",
    mark: "Py",
    tone: "blue",
    category: "devops",
    url: "https://www.python.org/downloads/windows/",
    description: "Python 官方 Windows 版本下载页面。",
    aliases: ["python", "py", "编程", "开发", "环境", "python3"],
  },
  {
    id: "docker",
    name: "Docker Desktop",
    mark: "D",
    tone: "blue",
    category: "devops",
    url: "https://www.docker.com/products/docker-desktop/",
    description: "Docker 官方桌面容器工具产品与下载入口。",
    aliases: ["docker", "docker desktop", "容器", "开发", "运维"],
  },
  {
    id: "jetbrains-toolbox",
    name: "JetBrains Toolbox",
    mark: "JB",
    tone: "orange",
    category: "devops",
    url: "https://www.jetbrains.com/toolbox-app/",
    description: "JetBrains 官方开发工具管理器下载入口。",
    aliases: ["jetbrains", "toolbox", "ide", "编程", "开发者", "开发"],
  },
  {
    id: "postman",
    name: "Postman",
    mark: "P",
    tone: "orange",
    category: "devops",
    url: "https://www.postman.com/downloads/",
    description: "Postman 官方 API 调试客户端下载页。",
    aliases: ["postman", "api", "接口调试", "开发", "运维"],
  },
  {
    id: "notepadpp",
    name: "Notepad++",
    mark: "N+",
    tone: "green",
    category: "devops",
    url: "https://notepad-plus-plus.org/downloads/",
    description: "Notepad++ 官方文本编辑器下载入口。",
    aliases: ["notepad++", "notepad", "文本编辑器", "记事本", "sublime", "代码"],
  },
  {
    id: "winscp",
    name: "WinSCP",
    mark: "WS",
    tone: "green",
    category: "devops",
    url: "https://winscp.net/eng/download.php",
    description: "WinSCP 官方 SFTP、FTP 客户端下载页。",
    aliases: ["winscp", "sftp", "ftp", "文件传输", "服务器", "运维"],
  },
  {
    id: "putty",
    name: "PuTTY",
    mark: "P",
    tone: "green",
    category: "devops",
    url: "https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html",
    description: "PuTTY 项目官方 Windows 版本下载页。",
    aliases: ["putty", "ssh", "终端", "服务器", "运维"],
  },
  {
    id: "virtualbox",
    name: "VirtualBox",
    mark: "VB",
    tone: "blue",
    category: "devops",
    url: "https://www.virtualbox.org/wiki/Downloads",
    description: "Oracle VirtualBox 官方虚拟机下载页面。",
    aliases: ["virtualbox", "虚拟机", "vm", "系统", "开发", "运维"],
  },
  {
    id: "wireshark",
    name: "Wireshark",
    mark: "W",
    tone: "blue",
    category: "devops",
    url: "https://www.wireshark.org/download.html",
    description: "Wireshark 官方网络协议分析工具下载页。",
    aliases: ["wireshark", "抓包", "网络分析", "运维", "网络"],
  },
  {
    id: "rustdesk",
    name: "RustDesk",
    mark: "R",
    tone: "blue",
    category: "devops",
    url: "https://rustdesk.com/zh-cn/",
    description: "RustDesk 官方开源远程桌面入口，可自托管。",
    aliases: ["rustdesk", "远程控制", "远程桌面", "远程协助", "远控", "运维"],
  },
  {
    id: "todesk",
    name: "ToDesk",
    mark: "T",
    tone: "blue",
    category: "devops",
    url: "https://www.todesk.com/",
    description: "ToDesk 官方远程控制客户端与下载入口。",
    aliases: ["todesk", "远程控制", "远程桌面", "远程协助", "远控", "运维"],
  },
  {
    id: "anydesk",
    name: "AnyDesk",
    mark: "A",
    tone: "orange",
    category: "devops",
    url: "https://anydesk.com/zhs/downloads/windows",
    description: "AnyDesk 官方 Windows 远程桌面下载页。",
    aliases: ["anydesk", "远程控制", "远程桌面", "远程协助", "远控", "运维"],
  },
  {
    id: "teamviewer",
    name: "TeamViewer",
    mark: "TV",
    tone: "blue",
    category: "devops",
    url: "https://www.teamviewer.com/cn/download/windows/",
    description: "TeamViewer 官方中文 Windows 下载入口。",
    aliases: ["teamviewer", "远程控制", "远程桌面", "远程协助", "远控", "运维"],
  },
  {
    id: "sunlogin",
    name: "向日葵远程控制",
    mark: "向",
    tone: "orange",
    category: "devops",
    url: "https://sunlogin.oray.com/download",
    description: "贝锐官方向日葵远程控制客户端下载入口。",
    aliases: ["向日葵", "sunlogin", "远程控制", "远程桌面", "远程协助", "远控", "运维"],
  },
  {
    id: "powertoys",
    name: "PowerToys",
    mark: "PT",
    tone: "blue",
    category: "utility",
    url: "https://learn.microsoft.com/zh-cn/windows/powertoys/install",
    description: "微软官方 PowerToys 安装说明与下载入口。",
    aliases: ["powertoys", "微软工具", "效率工具", "窗口管理", "系统工具"],
  },
  {
    id: "sysinternals",
    name: "Sysinternals",
    mark: "SI",
    tone: "blue",
    category: "utility",
    url: "https://learn.microsoft.com/zh-cn/sysinternals/downloads/",
    description: "微软官方 Windows 系统诊断工具合集。",
    aliases: ["sysinternals", "process explorer", "autoruns", "系统工具", "进程管理", "运维"],
  },
  {
    id: "steam",
    name: "Steam",
    mark: "S",
    tone: "blue",
    category: "game",
    url: "https://store.steampowered.com/about/",
    description: "Valve 官方 Steam 客户端下载与商店介绍。",
    aliases: ["steam", "蒸汽平台", "游戏平台", "游戏", "valve", "单机游戏"],
  },
  {
    id: "epic",
    name: "Epic Games",
    mark: "E",
    tone: "sand",
    category: "game",
    url: "https://store.epicgames.com/zh-CN/download",
    description: "Epic Games 官方启动器下载与商店入口。",
    aliases: ["epic", "epic games", "游戏平台", "游戏", "堡垒之夜"],
  },
  {
    id: "battlenet",
    name: "Battle.net",
    mark: "B",
    tone: "blue",
    category: "game",
    url: "https://www.blizzard.com/zh-tw/apps/battle.net/desktop",
    description: "暴雪官方 Battle.net 桌面客户端下载入口。",
    aliases: ["battlenet", "battle.net", "暴雪", "战网", "游戏平台", "游戏"],
  },
  {
    id: "gog",
    name: "GOG Galaxy",
    mark: "G",
    tone: "lilac",
    category: "game",
    url: "https://www.gog.com/galaxy",
    description: "GOG 官方游戏客户端下载与产品说明。",
    aliases: ["gog", "gog galaxy", "游戏平台", "单机游戏", "游戏"],
  },
  {
    id: "7zip",
    name: "7-Zip",
    mark: "7z",
    tone: "blue",
    category: "utility",
    url: "https://www.7-zip.org/download.html",
    description: "7-Zip 官方压缩软件下载页面。",
    aliases: ["7zip", "7-zip", "解压", "压缩", "压缩软件", "zip", "rar"],
  },
  {
    id: "winrar",
    name: "WinRAR",
    mark: "R",
    tone: "orange",
    category: "utility",
    url: "https://www.rarlab.com/download.htm",
    description: "RARLAB 官方 WinRAR 下载入口。",
    aliases: ["winrar", "rar", "解压", "压缩", "压缩软件"],
  },
  {
    id: "bandizip",
    name: "Bandizip",
    mark: "B",
    tone: "orange",
    category: "utility",
    url: "https://www.bandisoft.com/bandizip/",
    description: "Bandisoft 官方 Bandizip 压缩软件入口。",
    aliases: ["bandizip", "解压", "压缩", "压缩软件", "zip"],
  },
  {
    id: "vlc",
    name: "VLC media player",
    mark: "V",
    tone: "orange",
    category: "entertainment",
    url: "https://www.videolan.org/vlc/",
    description: "VideoLAN 官方 VLC 播放器下载页。",
    aliases: ["vlc", "视频播放器", "播放器", "看视频", "多媒体"],
  },
  {
    id: "potplayer",
    name: "PotPlayer",
    mark: "P",
    tone: "blue",
    category: "entertainment",
    url: "https://potplayer.daum.net/?lang=zh_CN",
    description: "PotPlayer 官方中文下载与播放器介绍。",
    aliases: ["potplayer", "视频播放器", "播放器", "看视频", "多媒体"],
  },
  {
    id: "obs",
    name: "OBS Studio",
    mark: "OBS",
    tone: "lilac",
    category: "media",
    url: "https://obsproject.com/download",
    description: "OBS 官方录屏与直播推流软件下载页。",
    aliases: ["obs", "obs studio", "录屏", "直播", "推流", "录制"],
  },
  {
    id: "handbrake",
    name: "HandBrake",
    mark: "HB",
    tone: "green",
    category: "media",
    url: "https://handbrake.fr/downloads.php",
    description: "HandBrake 官方视频转码工具下载页。",
    aliases: ["handbrake", "视频转码", "转码", "压缩视频", "视频"],
  },
  {
    id: "audacity",
    name: "Audacity",
    mark: "A",
    tone: "orange",
    category: "media",
    url: "https://www.audacityteam.org/download/",
    description: "Audacity 官方音频录制与编辑软件下载页。",
    aliases: ["audacity", "音频编辑", "录音", "音频", "剪辑"],
  },
  {
    id: "everything",
    name: "Everything",
    mark: "EV",
    tone: "orange",
    category: "utility",
    url: "https://www.voidtools.com/zh-cn/downloads/",
    description: "voidtools 官方文件快速搜索工具下载页。",
    aliases: ["everything", "文件搜索", "快速搜索", "搜索工具", "系统工具"],
  },
  {
    id: "rufus",
    name: "Rufus",
    mark: "R",
    tone: "green",
    category: "utility",
    url: "https://rufus.ie/zh/",
    description: "Rufus 官方 Windows 启动盘制作工具。",
    aliases: ["rufus", "启动盘", "u盘启动", "重装系统", "系统工具"],
  },
  {
    id: "ventoy",
    name: "Ventoy",
    mark: "V",
    tone: "blue",
    category: "utility",
    url: "https://www.ventoy.net/cn/download.html",
    description: "Ventoy 官方多启动 U 盘工具下载页面。",
    aliases: ["ventoy", "启动盘", "u盘启动", "重装系统", "系统工具"],
  },
  {
    id: "huorong",
    name: "火绒安全软件",
    mark: "火",
    tone: "orange",
    category: "utility",
    url: "https://www.huorong.cn/person",
    description: "火绒官方个人版安全软件下载入口。",
    aliases: ["火绒", "杀毒", "安全软件", "病毒", "银狐", "防病毒"],
  },
  {
    id: "360-safeguard",
    name: "360 安全卫士",
    mark: "360",
    tone: "green",
    category: "utility",
    url: "https://weishi.360.cn/",
    description: "360 官方安全卫士产品与下载入口。",
    aliases: ["360", "360安全卫士", "安全卫士", "安全软件", "杀毒"],
  },
  {
    id: "360-zip",
    name: "360 压缩",
    mark: "360",
    tone: "green",
    category: "utility",
    url: "https://yasuo.360.cn/",
    description: "360 官方压缩软件产品与下载入口。",
    aliases: ["360", "360压缩", "解压", "压缩软件"],
  },
  {
    id: "tencent-pc-manager",
    name: "腾讯电脑管家",
    mark: "管",
    tone: "blue",
    category: "utility",
    url: "https://guanjia.qq.com/",
    description: "腾讯官方电脑管家产品与下载入口。",
    aliases: ["电脑管家", "腾讯电脑管家", "管家", "安全软件", "杀毒"],
  },
  {
    id: "keepassxc",
    name: "KeePassXC",
    mark: "K",
    tone: "green",
    category: "utility",
    url: "https://keepassxc.org/download/",
    description: "KeePassXC 官方开源密码管理器下载页。",
    aliases: ["keepass", "keepassxc", "密码管理", "密码", "安全工具"],
  },
  {
    id: "nvidia-driver",
    name: "NVIDIA 驱动",
    mark: "NV",
    tone: "green",
    category: "utility",
    url: "https://www.nvidia.cn/Download/index.aspx?lang=cn",
    description: "NVIDIA 官方中文显卡驱动查询与下载入口。",
    aliases: ["nvidia", "英伟达", "显卡驱动", "驱动", "geforce"],
  },
  {
    id: "amd-driver",
    name: "AMD 驱动",
    mark: "AMD",
    tone: "orange",
    category: "utility",
    url: "https://www.amd.com/zh-cn/support/download/drivers.html",
    description: "AMD 官方中文驱动与支持页面。",
    aliases: ["amd", "显卡驱动", "驱动", "radeon"],
  },
  {
    id: "intel-driver",
    name: "Intel Driver & Support",
    mark: "intel",
    tone: "blue",
    category: "utility",
    url: "https://www.intel.cn/content/www/cn/zh/support/detect.html",
    description: "英特尔官方驱动与支持助手下载页面。",
    aliases: ["intel", "英特尔", "显卡驱动", "驱动", "系统更新"],
  },
  {
    id: "sogou-pinyin",
    name: "搜狗输入法",
    mark: "搜",
    tone: "orange",
    category: "utility",
    url: "https://pinyin.sogou.com/",
    description: "搜狗官方输入法产品与下载入口。",
    aliases: ["搜狗输入法", "sogou", "输入法", "打字", "拼音"],
  },
  {
    id: "qq-pinyin",
    name: "QQ 输入法",
    mark: "拼",
    tone: "blue",
    category: "utility",
    url: "https://qq.pinyin.cn/",
    description: "腾讯官方 QQ 输入法产品与下载入口。",
    aliases: ["qq输入法", "qq拼音", "输入法", "打字", "拼音"],
  },
  {
    id: "tencent-docs",
    name: "腾讯文档",
    mark: "文",
    tone: "blue",
    category: "office",
    url: "https://docs.qq.com/",
    description: "腾讯官方在线文档、表格与协作文档入口。",
    aliases: ["腾讯文档", "在线文档", "协作文档", "docs", "文档"],
  },
  {
    id: "kingsoft-docs",
    name: "金山文档",
    mark: "金",
    tone: "orange",
    category: "office",
    url: "https://www.kdocs.cn/",
    description: "金山办公官方在线文档与多人协作入口。",
    aliases: ["金山文档", "kdocs", "在线文档", "协作文档", "文档"],
  },
  {
    id: "shimo",
    name: "石墨文档",
    mark: "石",
    tone: "blue",
    category: "office",
    url: "https://shimo.im/",
    description: "石墨文档官方在线协作与文档编辑入口。",
    aliases: ["石墨文档", "石墨", "shimo", "在线文档", "协作文档"],
  },
  {
    id: "youdao-note",
    name: "有道云笔记",
    mark: "有",
    tone: "green",
    category: "office",
    url: "https://note.youdao.com/",
    description: "网易有道官方云笔记与知识管理入口。",
    aliases: ["有道云笔记", "有道笔记", "云笔记", "笔记", "youdao"],
  },
  {
    id: "mubu",
    name: "幕布",
    mark: "幕",
    tone: "sand",
    category: "office",
    url: "https://mubu.com/",
    description: "幕布官方大纲笔记与思维导图工具入口。",
    aliases: ["幕布", "mubu", "大纲", "思维导图", "笔记"],
  },
  {
    id: "processon",
    name: "ProcessOn",
    mark: "PO",
    tone: "blue",
    category: "office",
    url: "https://www.processon.com/",
    description: "ProcessOn 官方流程图、思维导图与协作入口。",
    aliases: ["processon", "流程图", "思维导图", "在线制图", "协作"],
  },
  {
    id: "jianguoyun",
    name: "坚果云",
    mark: "果",
    tone: "orange",
    category: "office",
    url: "https://www.jianguoyun.com/",
    description: "坚果云官方同步网盘与文件协作入口。",
    aliases: ["坚果云", "jianguoyun", "同步盘", "网盘", "文件同步"],
  },
  {
    id: "baidu-netdisk",
    name: "百度网盘",
    mark: "百",
    tone: "blue",
    category: "office",
    url: "https://pan.baidu.com/",
    description: "百度网盘官方网页、客户端下载与文件服务入口。",
    aliases: ["百度网盘", "百度云", "baidupan", "网盘", "云盘"],
  },
  {
    id: "aliyun-drive",
    name: "阿里云盘",
    mark: "阿",
    tone: "blue",
    category: "office",
    url: "https://www.alipan.com/",
    description: "阿里云盘官方客户端、网页与云存储入口。",
    aliases: ["阿里云盘", "alipan", "阿里云", "网盘", "云盘"],
  },
  {
    id: "qq-browser",
    name: "QQ 浏览器",
    mark: "Q",
    tone: "blue",
    category: "browser",
    url: "https://browser.qq.com/",
    description: "腾讯官方 QQ 浏览器产品与下载入口。",
    aliases: ["qq浏览器", "qqbrowser", "腾讯浏览器", "浏览器", "网页"],
  },
  {
    id: "sogou-browser",
    name: "搜狗浏览器",
    mark: "搜",
    tone: "orange",
    category: "browser",
    url: "https://ie.sogou.com/",
    description: "搜狗官方浏览器产品与下载入口。",
    aliases: ["搜狗浏览器", "sogou浏览器", "搜狗", "浏览器", "网页"],
  },
  {
    id: "uc-browser-pc",
    name: "UC 浏览器电脑版",
    mark: "UC",
    tone: "orange",
    category: "browser",
    url: "https://pc.uc.cn/",
    description: "UC 官方电脑浏览器产品与下载入口。",
    aliases: ["uc浏览器", "uc浏览器电脑版", "uc", "浏览器", "网页"],
  },
  {
    id: "quark-pc",
    name: "夸克",
    mark: "夸",
    tone: "blue",
    category: "browser",
    url: "https://pc.quark.cn/",
    description: "夸克官方电脑端产品与下载入口。",
    aliases: ["夸克", "夸克浏览器", "quark", "浏览器", "网盘"],
  },
  {
    id: "yy",
    name: "YY",
    mark: "YY",
    tone: "blue",
    category: "chat",
    url: "https://www.yy.com/",
    description: "YY 官方语音直播与多人聊天客户端入口。",
    aliases: ["yy", "歪歪", "语音聊天", "语音房", "直播"],
  },
  {
    id: "kook",
    name: "KOOK",
    mark: "K",
    tone: "lilac",
    category: "chat",
    url: "https://www.kookapp.cn/",
    description: "KOOK 官方语音聊天与游戏社群客户端入口。",
    aliases: ["kook", "开黑啦", "语音聊天", "游戏开黑", "社群"],
  },
  {
    id: "netease-cc",
    name: "网易 CC 直播",
    mark: "CC",
    tone: "orange",
    category: "chat",
    url: "https://cc.163.com/",
    description: "网易官方 CC 直播与语音互动入口。",
    aliases: ["网易cc", "cc直播", "网易直播", "语音", "直播"],
  },
  {
    id: "wegame",
    name: "WeGame",
    mark: "WG",
    tone: "blue",
    category: "game",
    url: "https://www.wegame.com.cn/",
    description: "腾讯官方 WeGame 游戏平台与客户端入口。",
    aliases: ["wegame", "腾讯游戏平台", "游戏平台", "游戏", "腾讯游戏"],
  },
  {
    id: "netease-uu",
    name: "网易 UU 加速器",
    mark: "UU",
    tone: "orange",
    category: "game",
    url: "https://uu.163.com/",
    description: "网易官方 UU 游戏加速器产品与下载入口。",
    aliases: ["uu加速器", "网易uu", "游戏加速器", "网游加速", "游戏"],
  },
  {
    id: "mobaxterm",
    name: "MobaXterm",
    mark: "MX",
    tone: "green",
    category: "devops",
    url: "https://mobaxterm.mobatek.net/download.html",
    description: "MobaXterm 官方 SSH、终端与远程工具下载页。",
    aliases: ["mobaxterm", "ssh", "终端", "远程连接", "服务器", "运维"],
  },
  {
    id: "finalshell",
    name: "FinalShell",
    mark: "FS",
    tone: "green",
    category: "devops",
    url: "https://www.hostbuf.com/",
    description: "FinalShell 官方服务器管理与终端工具入口。",
    aliases: ["finalshell", "ssh", "终端", "服务器", "运维", "远程连接"],
  },
  {
    id: "termius",
    name: "Termius",
    mark: "T",
    tone: "lilac",
    category: "devops",
    url: "https://termius.com/download/",
    description: "Termius 官方跨平台 SSH 客户端下载页。",
    aliases: ["termius", "ssh", "终端", "服务器", "运维", "远程连接"],
  },
  {
    id: "dbeaver",
    name: "DBeaver",
    mark: "DB",
    tone: "green",
    category: "devops",
    url: "https://dbeaver.io/download/",
    description: "DBeaver 官方通用数据库客户端下载页。",
    aliases: ["dbeaver", "数据库", "sql", "数据库客户端", "开发"],
  },
  {
    id: "mysql-workbench",
    name: "MySQL Workbench",
    mark: "MY",
    tone: "blue",
    category: "devops",
    url: "https://dev.mysql.com/downloads/workbench/",
    description: "Oracle MySQL 官方数据库管理工具下载页。",
    aliases: ["mysql workbench", "mysql", "数据库", "sql", "数据库客户端"],
  },
  {
    id: "pgadmin",
    name: "pgAdmin",
    mark: "PG",
    tone: "blue",
    category: "devops",
    url: "https://www.pgadmin.org/download/",
    description: "PostgreSQL 官方 pgAdmin 管理工具下载页。",
    aliases: ["pgadmin", "postgresql", "postgres", "数据库", "sql"],
  },
  {
    id: "mongodb-compass",
    name: "MongoDB Compass",
    mark: "MG",
    tone: "green",
    category: "devops",
    url: "https://www.mongodb.com/try/download/compass",
    description: "MongoDB 官方图形化数据库管理工具下载页。",
    aliases: ["mongodb compass", "mongodb", "数据库", "nosql", "数据库客户端"],
  },
  {
    id: "redisinsight",
    name: "RedisInsight",
    mark: "RI",
    tone: "orange",
    category: "devops",
    url: "https://redis.io/insight/",
    description: "Redis 官方 RedisInsight 图形化管理工具入口。",
    aliases: ["redisinsight", "redis", "数据库", "缓存", "数据库客户端"],
  },
  {
    id: "heidisql",
    name: "HeidiSQL",
    mark: "HS",
    tone: "blue",
    category: "devops",
    url: "https://www.heidisql.com/download.php",
    description: "HeidiSQL 官方数据库客户端下载页。",
    aliases: ["heidisql", "mysql", "mariadb", "数据库", "sql"],
  },
  {
    id: "android-studio",
    name: "Android Studio",
    mark: "AS",
    tone: "green",
    category: "devops",
    url: "https://developer.android.com/studio",
    description: "Google 官方 Android 应用开发工具下载页。",
    aliases: ["android studio", "android", "安卓开发", "开发", "ide"],
  },
  {
    id: "intellij-idea",
    name: "IntelliJ IDEA",
    mark: "IJ",
    tone: "orange",
    category: "devops",
    url: "https://www.jetbrains.com/idea/download/",
    description: "JetBrains 官方 IntelliJ IDEA 下载页。",
    aliases: ["intellij idea", "idea", "java", "开发", "ide"],
  },
  {
    id: "pycharm",
    name: "PyCharm",
    mark: "PC",
    tone: "green",
    category: "devops",
    url: "https://www.jetbrains.com/pycharm/download/",
    description: "JetBrains 官方 PyCharm Python IDE 下载页。",
    aliases: ["pycharm", "python", "开发", "ide", "编程"],
  },
  {
    id: "windows-terminal",
    name: "Windows Terminal",
    mark: "WT",
    tone: "blue",
    category: "devops",
    url: "https://apps.microsoft.com/detail/9N0DX20HK701",
    description: "微软商店中的 Windows Terminal 官方应用页。",
    aliases: ["windows terminal", "terminal", "终端", "命令行", "开发"],
  },
  {
    id: "powershell-7",
    name: "PowerShell 7",
    mark: "PS",
    tone: "blue",
    category: "devops",
    url: "https://github.com/PowerShell/PowerShell/releases",
    description: "PowerShell 官方 GitHub Releases 下载页。",
    aliases: ["powershell", "pwsh", "命令行", "终端", "脚本", "开发"],
  },
  {
    id: "sublime-text",
    name: "Sublime Text",
    mark: "ST",
    tone: "orange",
    category: "devops",
    url: "https://www.sublimetext.com/download",
    description: "Sublime Text 官方编辑器下载页。",
    aliases: ["sublime text", "sublime", "文本编辑器", "代码编辑器", "编程"],
  },
  {
    id: "typora",
    name: "Typora",
    mark: "TY",
    tone: "sand",
    category: "devops",
    url: "https://typora.io/",
    description: "Typora 官方 Markdown 编辑器产品与下载入口。",
    aliases: ["typora", "markdown", "md编辑器", "写作", "笔记"],
  },
  {
    id: "navicat",
    name: "Navicat",
    mark: "NV",
    tone: "blue",
    category: "devops",
    url: "https://www.navicat.com.cn/download/navicat-premium",
    description: "Navicat 官方中文数据库管理工具下载页。",
    aliases: ["navicat", "数据库", "sql", "数据库客户端", "开发"],
  },
  {
    id: "cpu-z",
    name: "CPU-Z",
    mark: "CPU",
    tone: "orange",
    category: "utility",
    url: "https://www.cpuid.com/softwares/cpu-z.html",
    description: "CPUID 官方 CPU-Z 硬件检测工具下载页。",
    aliases: ["cpu-z", "cpuz", "硬件检测", "处理器", "系统工具"],
  },
  {
    id: "gpu-z",
    name: "GPU-Z",
    mark: "GPU",
    tone: "green",
    category: "utility",
    url: "https://www.techpowerup.com/gpuz/",
    description: "TechPowerUp 官方 GPU-Z 显卡检测工具入口。",
    aliases: ["gpu-z", "gpuz", "显卡检测", "显卡", "系统工具"],
  },
  {
    id: "crystaldiskinfo",
    name: "CrystalDiskInfo",
    mark: "CD",
    tone: "blue",
    category: "utility",
    url: "https://crystalmark.info/en/software/crystaldiskinfo/",
    description: "CrystalDiskInfo 官方硬盘健康检测工具入口。",
    aliases: ["crystaldiskinfo", "硬盘检测", "硬盘健康", "磁盘", "系统工具"],
  },
  {
    id: "hwinfo",
    name: "HWiNFO",
    mark: "HW",
    tone: "green",
    category: "utility",
    url: "https://www.hwinfo.com/download/",
    description: "HWiNFO 官方硬件信息与传感器检测工具下载页。",
    aliases: ["hwinfo", "硬件检测", "温度监控", "传感器", "系统工具"],
  },
  {
    id: "aida64",
    name: "AIDA64",
    mark: "A64",
    tone: "orange",
    category: "utility",
    url: "https://www.aida64.com/downloads",
    description: "FinalWire 官方 AIDA64 硬件诊断工具下载页。",
    aliases: ["aida64", "硬件检测", "系统信息", "性能测试", "系统工具"],
  },
  {
    id: "treesize",
    name: "TreeSize",
    mark: "TS",
    tone: "green",
    category: "utility",
    url: "https://www.jam-software.com/treesize_free",
    description: "JAM Software 官方磁盘空间分析工具入口。",
    aliases: ["treesize", "磁盘空间", "空间分析", "c盘清理", "系统工具"],
  },
  {
    id: "revo-uninstaller",
    name: "Revo Uninstaller",
    mark: "RU",
    tone: "blue",
    category: "utility",
    url: "https://www.revouninstaller.com/products/revo-uninstaller-free/",
    description: "Revo Uninstaller 官方卸载工具下载页。",
    aliases: ["revo uninstaller", "卸载工具", "彻底卸载", "系统工具"],
  },
  {
    id: "geek-uninstaller",
    name: "Geek Uninstaller",
    mark: "GU",
    tone: "orange",
    category: "utility",
    url: "https://geekuninstaller.com/download",
    description: "Geek Uninstaller 官方轻量卸载工具下载页。",
    aliases: ["geek uninstaller", "卸载工具", "彻底卸载", "系统工具"],
  },
  {
    id: "localsend",
    name: "LocalSend",
    mark: "LS",
    tone: "green",
    category: "utility",
    url: "https://localsend.org/",
    description: "LocalSend 官方开源局域网文件传输工具入口。",
    aliases: ["localsend", "局域网传输", "传文件", "文件传输", "开源"],
  },
  {
    id: "blender",
    name: "Blender",
    mark: "BL",
    tone: "orange",
    category: "media",
    url: "https://www.blender.org/download/",
    description: "Blender 官方三维创作软件下载页。",
    aliases: ["blender", "3d", "建模", "三维", "动画"],
  },
  {
    id: "gimp",
    name: "GIMP",
    mark: "G",
    tone: "orange",
    category: "media",
    url: "https://www.gimp.org/downloads/",
    description: "GIMP 官方开源图片编辑软件下载页。",
    aliases: ["gimp", "图片编辑", "修图", "图像处理", "开源"],
  },
  {
    id: "krita",
    name: "Krita",
    mark: "K",
    tone: "lilac",
    category: "media",
    url: "https://krita.org/en/download/",
    description: "Krita 官方开源数字绘画软件下载页。",
    aliases: ["krita", "绘画", "数字绘画", "画图", "开源"],
  },
  {
    id: "inkscape",
    name: "Inkscape",
    mark: "I",
    tone: "blue",
    category: "media",
    url: "https://inkscape.org/release/",
    description: "Inkscape 官方开源矢量绘图软件下载页。",
    aliases: ["inkscape", "矢量图", "svg", "绘图", "开源"],
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    mark: "DR",
    tone: "orange",
    category: "media",
    url: "https://www.blackmagicdesign.com/products/davinciresolve",
    description: "Blackmagic Design 官方视频剪辑软件入口。",
    aliases: ["davinci resolve", "达芬奇", "视频剪辑", "剪辑", "调色"],
  },
  {
    id: "jianying",
    name: "剪映专业版",
    mark: "剪",
    tone: "blue",
    category: "media",
    url: "https://www.capcut.cn/",
    description: "剪映官方专业版产品与下载入口。",
    aliases: ["剪映", "剪映专业版", "jianying", "capcut", "视频剪辑"],
  },
  {
    id: "bcut",
    name: "必剪",
    mark: "必",
    tone: "blue",
    category: "media",
    url: "https://bcut.bilibili.cn/",
    description: "B 站官方必剪视频创作工具入口。",
    aliases: ["必剪", "bcut", "bilibili", "视频剪辑", "剪辑"],
  },
  {
    id: "netease-music",
    name: "网易云音乐",
    mark: "云",
    tone: "orange",
    category: "entertainment",
    url: "https://music.163.com/",
    description: "网易云音乐官方网页、客户端与下载入口。",
    aliases: ["网易云音乐", "网易云", "netease music", "音乐", "听歌"],
  },
  {
    id: "qq-music",
    name: "QQ 音乐",
    mark: "Q",
    tone: "green",
    category: "entertainment",
    url: "https://y.qq.com/",
    description: "腾讯官方 QQ 音乐网页与客户端入口。",
    aliases: ["qq音乐", "qqmusic", "音乐", "听歌"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    mark: "GPT",
    tone: "green",
    category: "ai-chat",
    url: "https://chatgpt.com/",
    description: "OpenAI 官方 ChatGPT 网页版入口，海外服务的可用性取决于网络与地区。",
    aliases: ["chatgpt", "gpt", "openai", "ai聊天", "人工智能", "对话"],
  },
  {
    id: "claude",
    name: "Claude",
    mark: "C",
    tone: "orange",
    category: "ai-chat",
    url: "https://claude.ai/",
    description: "Anthropic 官方 Claude AI 助手入口，海外服务的可用性取决于网络与地区。",
    aliases: ["claude", "anthropic", "ai聊天", "人工智能", "对话"],
  },
  {
    id: "gemini",
    name: "Gemini",
    mark: "G",
    tone: "blue",
    category: "ai-chat",
    url: "https://gemini.google.com/",
    description: "Google 官方 Gemini AI 助手入口，海外服务的可用性取决于网络与地区。",
    aliases: ["gemini", "谷歌ai", "google ai", "ai聊天", "人工智能"],
  },
  {
    id: "microsoft-copilot",
    name: "Microsoft Copilot",
    mark: "Co",
    tone: "blue",
    category: "ai-chat",
    url: "https://copilot.microsoft.com/",
    description: "微软官方 Copilot AI 助手网页入口。",
    aliases: ["copilot", "微软copilot", "microsoft copilot", "ai聊天", "人工智能"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    mark: "P",
    tone: "green",
    category: "ai-chat",
    url: "https://www.perplexity.ai/",
    description: "Perplexity 官方 AI 搜索与问答入口，海外服务的可用性取决于网络与地区。",
    aliases: ["perplexity", "ai搜索", "ai问答", "人工智能", "搜索"],
  },
  {
    id: "grok",
    name: "Grok",
    mark: "G",
    tone: "sand",
    category: "ai-chat",
    url: "https://grok.com/",
    description: "xAI 官方 Grok AI 助手入口，海外服务的可用性取决于网络与地区。",
    aliases: ["grok", "xai", "ai聊天", "人工智能", "对话"],
  },
  {
    id: "poe",
    name: "Poe",
    mark: "Poe",
    tone: "lilac",
    category: "ai-chat",
    url: "https://poe.com/",
    description: "Poe 官方多模型 AI 聊天平台入口，海外服务的可用性取决于网络与地区。",
    aliases: ["poe", "ai聊天", "多模型", "人工智能", "对话"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    mark: "DS",
    tone: "blue",
    category: "ai-chat",
    url: "https://chat.deepseek.com/",
    description: "DeepSeek 官方网页版 AI 助手与对话入口。",
    aliases: ["deepseek", "深度求索", "ai聊天", "人工智能", "对话"],
  },
  {
    id: "doubao",
    name: "豆包",
    mark: "豆",
    tone: "blue",
    category: "ai-chat",
    url: "https://www.doubao.com/",
    description: "字节跳动官方豆包 AI 助手网页入口。",
    aliases: ["豆包", "doubao", "字节豆包", "ai聊天", "人工智能"],
  },
  {
    id: "kimi",
    name: "Kimi",
    mark: "K",
    tone: "green",
    category: "ai-chat",
    url: "https://kimi.moonshot.cn/",
    description: "月之暗面官方 Kimi 智能助手入口。",
    aliases: ["kimi", "月之暗面", "moonshot", "ai聊天", "长文本"],
  },
  {
    id: "tongyi",
    name: "通义千问",
    mark: "通",
    tone: "orange",
    category: "ai-chat",
    url: "https://tongyi.aliyun.com/",
    description: "阿里云官方通义 AI 助手入口。",
    aliases: ["通义", "通义千问", "qwen", "阿里ai", "ai聊天"],
  },
  {
    id: "ernie",
    name: "文心一言",
    mark: "文",
    tone: "blue",
    category: "ai-chat",
    url: "https://yiyan.baidu.com/",
    description: "百度官方文心一言 AI 助手入口。",
    aliases: ["文心一言", "文心", "yiyan", "百度ai", "ernie", "ai聊天"],
  },
  {
    id: "chatglm",
    name: "智谱清言",
    mark: "智",
    tone: "lilac",
    category: "ai-chat",
    url: "https://chatglm.cn/",
    description: "智谱官方清言 AI 助手入口。",
    aliases: ["智谱清言", "智谱", "chatglm", "glm", "ai聊天"],
  },
  {
    id: "iflytek-spark",
    name: "讯飞星火",
    mark: "星",
    tone: "blue",
    category: "ai-chat",
    url: "https://xinghuo.xfyun.cn/",
    description: "科大讯飞官方星火认知大模型入口。",
    aliases: ["讯飞星火", "星火", "讯飞", "spark", "ai聊天"],
  },
  {
    id: "yuanbao",
    name: "腾讯元宝",
    mark: "元",
    tone: "blue",
    category: "ai-chat",
    url: "https://yuanbao.tencent.com/",
    description: "腾讯官方元宝 AI 助手入口。",
    aliases: ["腾讯元宝", "元宝", "腾讯ai", "yuanbao", "ai聊天"],
  },
  {
    id: "metaso",
    name: "秘塔 AI 搜索",
    mark: "秘",
    tone: "green",
    category: "ai-chat",
    url: "https://metaso.cn/",
    description: "秘塔官方 AI 搜索与研究助手入口。",
    aliases: ["秘塔", "秘塔ai", "秘塔搜索", "metaso", "ai搜索"],
  },
  {
    id: "hailuo",
    name: "海螺 AI",
    mark: "海",
    tone: "orange",
    category: "ai-chat",
    url: "https://hailuoai.com/",
    description: "MiniMax 官方海螺 AI 助手与创作平台入口。",
    aliases: ["海螺ai", "海螺", "hailuo", "minimax", "ai聊天", "ai视频"],
  },
  {
    id: "openai-platform",
    name: "OpenAI Platform",
    mark: "OA",
    tone: "green",
    category: "ai-tools",
    url: "https://platform.openai.com/",
    description: "OpenAI 官方开发者平台、API 文档与用量控制入口。",
    aliases: ["openai api", "openai platform", "api", "开发者", "ai工具"],
  },
  {
    id: "anthropic-console",
    name: "Anthropic Console",
    mark: "AC",
    tone: "orange",
    category: "ai-tools",
    url: "https://console.anthropic.com/",
    description: "Anthropic 官方 Claude API 开发者控制台入口。",
    aliases: ["anthropic console", "claude api", "api", "开发者", "ai工具"],
  },
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    mark: "AI",
    tone: "blue",
    category: "ai-tools",
    url: "https://aistudio.google.com/",
    description: "Google 官方 AI 模型试验与开发者工具入口。",
    aliases: ["google ai studio", "ai studio", "gemini api", "开发者", "ai工具"],
  },
  {
    id: "hugging-face",
    name: "Hugging Face",
    mark: "HF",
    tone: "sand",
    category: "ai-tools",
    url: "https://huggingface.co/",
    description: "Hugging Face 官方模型、数据集与 AI 应用社区入口。",
    aliases: ["hugging face", "huggingface", "模型", "数据集", "ai工具", "开源ai"],
  },
  {
    id: "ollama",
    name: "Ollama",
    mark: "O",
    tone: "green",
    category: "ai-tools",
    url: "https://ollama.com/download",
    description: "Ollama 官方本地大模型运行工具下载入口。",
    aliases: ["ollama", "本地大模型", "本地ai", "llm", "ai工具"],
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    mark: "LM",
    tone: "lilac",
    category: "ai-tools",
    url: "https://lmstudio.ai/",
    description: "LM Studio 官方本地大模型桌面客户端入口。",
    aliases: ["lm studio", "lmstudio", "本地大模型", "本地ai", "llm", "ai工具"],
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    mark: "CU",
    tone: "orange",
    category: "ai-tools",
    url: "https://www.comfy.org/download",
    description: "ComfyUI 官方节点式 AI 图像生成工具下载入口。",
    aliases: ["comfyui", "ai绘画", "图像生成", "工作流", "stable diffusion", "ai工具"],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    mark: "MJ",
    tone: "sand",
    category: "ai-tools",
    url: "https://www.midjourney.com/",
    description: "Midjourney 官方 AI 图像生成平台入口，海外服务的可用性取决于网络与地区。",
    aliases: ["midjourney", "mj", "ai绘画", "图像生成", "ai工具"],
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    mark: "FF",
    tone: "orange",
    category: "ai-tools",
    url: "https://firefly.adobe.com/",
    description: "Adobe 官方 Firefly 生成式 AI 创作平台入口。",
    aliases: ["adobe firefly", "firefly", "ai绘画", "图像生成", "ai工具"],
  },
  {
    id: "jimeng",
    name: "即梦 AI",
    mark: "即",
    tone: "blue",
    category: "ai-tools",
    url: "https://jimeng.jianying.com/",
    description: "剪映旗下即梦 AI 图片与视频生成平台入口。",
    aliases: ["即梦", "即梦ai", "jimeng", "ai绘画", "ai视频", "图像生成"],
  },
  {
    id: "kling",
    name: "可灵 AI",
    mark: "可",
    tone: "green",
    category: "ai-tools",
    url: "https://klingai.kuaishou.com/",
    description: "快手官方可灵 AI 图片与视频生成平台入口。",
    aliases: ["可灵", "可灵ai", "kling", "kling ai", "ai视频", "ai工具"],
  },
  {
    id: "suno",
    name: "Suno",
    mark: "S",
    tone: "orange",
    category: "ai-tools",
    url: "https://suno.com/",
    description: "Suno 官方 AI 音乐生成平台入口，海外服务的可用性取决于网络与地区。",
    aliases: ["suno", "ai音乐", "音乐生成", "ai工具"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    mark: "11",
    tone: "lilac",
    category: "ai-tools",
    url: "https://elevenlabs.io/",
    description: "ElevenLabs 官方 AI 语音合成平台入口。",
    aliases: ["elevenlabs", "ai配音", "语音合成", "tts", "ai工具"],
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    mark: "N",
    tone: "blue",
    category: "ai-tools",
    url: "https://notebooklm.google.com/",
    description: "Google 官方 NotebookLM 文档研究与 AI 笔记工具入口。",
    aliases: ["notebooklm", "notebook lm", "ai笔记", "文档问答", "ai工具"],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    mark: "GH",
    tone: "sand",
    category: "ai-tools",
    url: "https://github.com/features/copilot",
    description: "GitHub 官方 Copilot AI 编程助手介绍与入口。",
    aliases: ["github copilot", "copilot", "ai编程", "代码助手", "ai工具"],
  },
  {
    id: "cursor",
    name: "Cursor",
    mark: "C",
    tone: "green",
    category: "ai-tools",
    url: "https://www.cursor.com/downloads",
    description: "Cursor 官方 AI 代码编辑器下载入口。",
    aliases: ["cursor", "ai编程", "代码编辑器", "ai ide", "ai工具"],
  },
  {
    id: "remove-bg",
    name: "remove.bg",
    mark: "RB",
    tone: "green",
    category: "ai-tools",
    url: "https://www.remove.bg/",
    description: "remove.bg 官方 AI 图片背景移除与批量处理入口。",
    aliases: ["remove bg", "remove.bg", "抠图", "去背景", "ai工具"],
  },
  {
    id: "photoshop",
    name: "Adobe Photoshop",
    mark: "Ps",
    tone: "blue",
    category: "media",
    url: "https://www.adobe.com/products/photoshop.html",
    description: "Adobe 官方 Photoshop 图片编辑软件产品与下载页。",
    aliases: ["photoshop", "ps", "修图", "图片编辑", "海报", "Adobe"],
  },
  {
    id: "premiere-pro",
    name: "Adobe Premiere Pro",
    mark: "Pr",
    tone: "lilac",
    category: "media",
    url: "https://www.adobe.com/products/premiere.html",
    description: "Adobe 官方 Premiere Pro 视频剪辑软件产品页。",
    aliases: ["premiere", "premiere pro", "pr", "视频剪辑", "剪辑", "Adobe"],
  },
  {
    id: "lightroom",
    name: "Adobe Lightroom",
    mark: "Lr",
    tone: "blue",
    category: "media",
    url: "https://www.adobe.com/products/lightroom.html",
    description: "Adobe 官方 Lightroom 照片编辑与管理工具入口。",
    aliases: ["lightroom", "lr", "照片编辑", "修图", "摄影", "Adobe"],
  },
  {
    id: "affinity-photo",
    name: "Affinity Photo",
    mark: "AF",
    tone: "blue",
    category: "media",
    url: "https://affinity.serif.com/photo/",
    description: "Affinity 官方专业图片编辑软件产品入口。",
    aliases: ["affinity photo", "affinity", "图片编辑", "修图", "设计"],
  },
  {
    id: "photopea",
    name: "Photopea",
    mark: "PP",
    tone: "lilac",
    category: "media",
    url: "https://www.photopea.com/",
    description: "Photopea 官方网页版图片编辑工具入口。",
    aliases: ["photopea", "网页修图", "图片编辑", "修图", "ps在线"],
  },
  {
    id: "pixlr",
    name: "Pixlr",
    mark: "PX",
    tone: "green",
    category: "media",
    url: "https://pixlr.com/",
    description: "Pixlr 官方在线图片编辑与设计工具入口。",
    aliases: ["pixlr", "在线修图", "图片编辑", "设计", "修图"],
  },
  {
    id: "canva",
    name: "Canva 可画",
    mark: "Ca",
    tone: "lilac",
    category: "media",
    url: "https://www.canva.cn/",
    description: "Canva 官方中文在线设计与图片编辑平台入口。",
    aliases: ["canva", "可画", "在线设计", "海报", "图片编辑", "设计"],
  },
  {
    id: "gaoding",
    name: "稿定设计",
    mark: "稿",
    tone: "orange",
    category: "media",
    url: "https://www.gaoding.com/",
    description: "稿定官方在线设计、图片编辑与电商素材入口。",
    aliases: ["稿定", "稿定设计", "在线设计", "海报", "修图", "设计"],
  },
  {
    id: "meitu",
    name: "美图秀秀",
    mark: "美",
    tone: "orange",
    category: "media",
    url: "https://www.meitu.com/",
    description: "美图官方图片美化、设计与人像编辑工具入口。",
    aliases: ["美图秀秀", "美图", "修图", "图片编辑", "人像", "设计"],
  },
  {
    id: "shotcut",
    name: "Shotcut",
    mark: "SC",
    tone: "blue",
    category: "media",
    url: "https://shotcut.org/download/",
    description: "Shotcut 官方开源视频剪辑软件下载页。",
    aliases: ["shotcut", "视频剪辑", "剪辑", "开源", "视频编辑"],
  },
  {
    id: "openshot",
    name: "OpenShot",
    mark: "OS",
    tone: "orange",
    category: "media",
    url: "https://www.openshot.org/download/",
    description: "OpenShot 官方开源视频编辑器下载页。",
    aliases: ["openshot", "视频剪辑", "剪辑", "开源", "视频编辑"],
  },
  {
    id: "kdenlive",
    name: "Kdenlive",
    mark: "KD",
    tone: "blue",
    category: "media",
    url: "https://kdenlive.org/en/download/",
    description: "Kdenlive 官方开源非线性视频编辑器下载页。",
    aliases: ["kdenlive", "视频剪辑", "剪辑", "开源", "视频编辑"],
  },
  {
    id: "filmora",
    name: "万兴喵影",
    mark: "喵",
    tone: "orange",
    category: "media",
    url: "https://filmora.wondershare.cn/",
    description: "万兴科技官方喵影视频剪辑软件入口。",
    aliases: ["万兴喵影", "filmora", "喵影", "视频剪辑", "剪辑"],
  },
  {
    id: "ffmpeg",
    name: "FFmpeg",
    mark: "FF",
    tone: "green",
    category: "media",
    url: "https://ffmpeg.org/download.html",
    description: "FFmpeg 官方音视频处理工具下载与文档入口。",
    aliases: ["ffmpeg", "音视频处理", "视频转码", "命令行", "转码"],
  },
  {
    id: "capcut",
    name: "CapCut",
    mark: "CC",
    tone: "blue",
    category: "media",
    url: "https://www.capcut.com/",
    description: "CapCut 官方国际版视频剪辑工具入口，海外服务可用性取决于地区。",
    aliases: ["capcut", "剪映国际版", "视频剪辑", "剪辑", "视频编辑"],
  },
  {
    id: "format-factory",
    name: "格式工厂",
    mark: "格",
    tone: "blue",
    category: "media",
    url: "https://www.pcfreetime.com/formatfactory/CN/index.html",
    description: "格式工厂官方音视频转换与处理工具入口。",
    aliases: ["格式工厂", "format factory", "格式转换", "视频转换", "音频转换"],
  },
  {
    id: "foxit-reader",
    name: "福昕 PDF 阅读器",
    mark: "福",
    tone: "orange",
    category: "office",
    url: "https://www.foxitsoftware.cn/pdf-reader/",
    description: "福昕官方 PDF 阅读与编辑软件下载入口。",
    aliases: ["福昕", "foxit", "pdf", "pdf阅读器", "pdf编辑", "文档"],
  },
  {
    id: "wondershare-pdf",
    name: "万兴 PDF",
    mark: "万",
    tone: "blue",
    category: "office",
    url: "https://pdf.wondershare.cn/",
    description: "万兴科技官方 PDF 编辑与转换软件入口。",
    aliases: ["万兴pdf", "pdfelement", "pdf", "pdf编辑", "文档"],
  },
  {
    id: "weiyun",
    name: "腾讯微云",
    mark: "云",
    tone: "blue",
    category: "office",
    url: "https://www.weiyun.com/",
    description: "腾讯官方微云网盘与文件同步入口。",
    aliases: ["腾讯微云", "微云", "weiyun", "网盘", "云盘", "文件同步"],
  },
  {
    id: "netease-mail",
    name: "网易邮箱",
    mark: "邮",
    tone: "green",
    category: "office",
    url: "https://mail.163.com/",
    description: "网易官方邮箱网页与客户端服务入口。",
    aliases: ["网易邮箱", "163邮箱", "126邮箱", "邮箱", "mail"],
  },
  {
    id: "wechat-input",
    name: "微信输入法",
    mark: "微",
    tone: "green",
    category: "utility",
    url: "https://z.weixin.qq.com/",
    description: "微信官方输入法产品与下载入口。",
    aliases: ["微信输入法", "微信键盘", "输入法", "打字", "拼音"],
  },
  {
    id: "baidu-input",
    name: "百度输入法",
    mark: "百",
    tone: "blue",
    category: "utility",
    url: "https://srf.baidu.com/",
    description: "百度官方输入法产品与下载入口。",
    aliases: ["百度输入法", "百度拼音", "输入法", "打字", "拼音"],
  },
  {
    id: "iflytek-input",
    name: "讯飞输入法",
    mark: "讯",
    tone: "blue",
    category: "utility",
    url: "https://srf.xunfei.cn/",
    description: "科大讯飞官方输入法产品与下载入口。",
    aliases: ["讯飞输入法", "讯飞", "语音输入", "输入法", "打字"],
  },
  {
    id: "xunlei",
    name: "迅雷",
    mark: "迅",
    tone: "blue",
    category: "utility",
    url: "https://www.xunlei.com/",
    description: "迅雷官方下载工具入口；安装和使用时请留意附加推广选项。",
    aliases: ["迅雷", "xunlei", "下载工具", "下载", "下载器"],
  },
  {
    id: "huawei-pc-manager",
    name: "华为电脑管家",
    mark: "华",
    tone: "orange",
    category: "utility",
    url: "https://consumer.huawei.com/cn/support/pc-manager/",
    description: "华为官方电脑管家产品、驱动与下载入口。",
    aliases: ["华为电脑管家", "huawei pc manager", "电脑管家", "华为管家", "驱动"],
  },
  {
    id: "lenovo-pc-manager",
    name: "联想电脑管家",
    mark: "联",
    tone: "blue",
    category: "utility",
    url: "https://guanjia.lenovo.com.cn/",
    description: "联想官方电脑管家与设备服务入口。",
    aliases: ["联想电脑管家", "lenovo pc manager", "联想管家", "电脑管家", "驱动"],
  },
  {
    id: "snipaste",
    name: "Snipaste",
    mark: "SN",
    tone: "green",
    category: "utility",
    url: "https://zh.snipaste.com/",
    description: "Snipaste 官方截图与贴图工具下载入口。",
    aliases: ["snipaste", "截图", "贴图", "截图工具", "效率工具"],
  },
  {
    id: "pixpin",
    name: "PixPin",
    mark: "PX",
    tone: "blue",
    category: "utility",
    url: "https://pixpin.cn/",
    description: "PixPin 官方截图、贴图与 OCR 工具入口。",
    aliases: ["pixpin", "截图", "长截图", "ocr", "贴图", "截图工具"],
  },
  {
    id: "utools",
    name: "uTools",
    mark: "u",
    tone: "orange",
    category: "utility",
    url: "https://u.tools/",
    description: "uTools 官方快捷启动与效率工具平台入口。",
    aliases: ["utools", "快捷启动", "效率工具", "搜索工具", "插件"],
  },
  {
    id: "drivergenius",
    name: "驱动精灵",
    mark: "驱",
    tone: "blue",
    category: "utility",
    url: "https://www.drivergenius.com/",
    description: "驱动精灵官方驱动管理工具入口；安装时留意取消非必要捆绑组件。",
    aliases: ["驱动精灵", "drivergenius", "驱动", "驱动安装", "驱动更新"],
  },
  {
    id: "drivethelife",
    name: "驱动人生",
    mark: "生",
    tone: "orange",
    category: "utility",
    url: "https://www.160.com/",
    description: "驱动人生官方驱动管理工具入口；安装时留意取消附加推广组件。",
    aliases: ["驱动人生", "drivethelife", "驱动", "驱动安装", "驱动更新"],
  },
  {
    id: "ludashi",
    name: "鲁大师",
    mark: "鲁",
    tone: "orange",
    category: "utility",
    url: "https://www.ludashi.com/",
    description: "鲁大师官方硬件检测与系统工具入口；安装时留意附加推广选项。",
    aliases: ["鲁大师", "ludashi", "硬件检测", "跑分", "温度检测", "系统工具"],
  },
  {
    id: "kingsoft-antivirus",
    name: "金山毒霸",
    mark: "金",
    tone: "blue",
    category: "utility",
    url: "https://www.ijinshan.com/",
    description: "金山官方安全软件产品与下载入口。",
    aliases: ["金山毒霸", "毒霸", "kingsoft", "杀毒", "安全软件"],
  },
  {
    id: "rising",
    name: "瑞星杀毒软件",
    mark: "瑞",
    tone: "orange",
    category: "utility",
    url: "https://www.rising.com.cn/",
    description: "瑞星官方安全软件产品与服务入口。",
    aliases: ["瑞星", "瑞星杀毒", "rising", "杀毒", "安全软件"],
  },
  {
    id: "wepe",
    name: "微PE工具箱",
    mark: "PE",
    tone: "green",
    category: "utility",
    url: "https://www.wepe.com.cn/",
    description: "微PE官方 Windows 维护与启动盘工具入口。",
    aliases: ["微pe", "wepe", "pe工具箱", "启动盘", "重装系统", "系统维护"],
  },
  {
    id: "edgeless",
    name: "Edgeless",
    mark: "ED",
    tone: "blue",
    category: "utility",
    url: "https://www.edgeless.top/",
    description: "Edgeless 官方 PE 系统与启动盘制作入口。",
    aliases: ["edgeless", "pe系统", "启动盘", "重装系统", "系统维护"],
  },
  {
    id: "lenovo-store",
    name: "联想应用商店",
    mark: "L",
    tone: "blue",
    category: "utility",
    url: "https://lestore.lenovo.com/",
    description: "联想官方应用商店网页与电脑端入口。",
    aliases: ["联想应用商店", "联想商店", "lestore", "应用商店", "软件商店"],
  },
  {
    id: "tencent-pc-store",
    name: "腾讯软件中心",
    mark: "T",
    tone: "green",
    category: "utility",
    url: "https://pc.qq.com/",
    description: "腾讯官方 PC 软件中心与应用下载入口。",
    aliases: ["腾讯软件中心", "pcqq", "软件中心", "应用商店", "软件商店"],
  },
  {
    id: "kingsoft-typing",
    name: "金山打字通",
    mark: "打",
    tone: "orange",
    category: "utility",
    url: "https://www.51dzt.com/",
    description: "金山官方打字学习与练习软件入口。",
    aliases: ["金山打字通", "打字通", "打字练习", "键盘练习", "学习工具"],
  },
  {
    id: "ldplayer",
    name: "雷电模拟器",
    mark: "雷",
    tone: "blue",
    category: "game",
    url: "https://www.ldmnq.com/",
    description: "雷电模拟器官方安卓模拟器产品与下载入口。",
    aliases: ["雷电模拟器", "ldplayer", "安卓模拟器", "手游模拟器", "模拟器"],
  },
  {
    id: "mumu-player",
    name: "MuMu 模拟器",
    mark: "M",
    tone: "green",
    category: "game",
    url: "https://mumu.163.com/",
    description: "网易官方 MuMu 安卓模拟器产品与下载入口。",
    aliases: ["mumu", "mumu模拟器", "网易模拟器", "安卓模拟器", "手游模拟器"],
  },
  {
    id: "tencent-video",
    name: "腾讯视频",
    mark: "视",
    tone: "orange",
    category: "entertainment",
    url: "https://v.qq.com/download/",
    description: "腾讯视频官方客户端下载与网页入口。",
    aliases: ["腾讯视频", "tencent video", "视频", "追剧", "电视剧", "电影"],
  },
  {
    id: "iqiyi",
    name: "爱奇艺",
    mark: "爱",
    tone: "green",
    category: "entertainment",
    url: "https://www.iqiyi.com/",
    description: "爱奇艺官方网页与客户端服务入口。",
    aliases: ["爱奇艺", "iqiyi", "视频", "追剧", "电视剧", "电影"],
  },
  {
    id: "youku",
    name: "优酷",
    mark: "优",
    tone: "blue",
    category: "entertainment",
    url: "https://www.youku.com/",
    description: "优酷官方网页与客户端服务入口。",
    aliases: ["优酷", "youku", "视频", "追剧", "电视剧", "电影"],
  },
  {
    id: "mgtv",
    name: "芒果 TV",
    mark: "芒",
    tone: "orange",
    category: "entertainment",
    url: "https://www.mgtv.com/",
    description: "芒果 TV 官方网页与客户端服务入口。",
    aliases: ["芒果tv", "芒果", "mgtv", "视频", "综艺", "追剧"],
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    mark: "B",
    tone: "blue",
    category: "entertainment",
    url: "https://app.bilibili.com/",
    description: "哔哩哔哩官方客户端下载与网页服务入口。",
    aliases: ["哔哩哔哩", "b站", "bilibili", "视频", "番剧", "直播"],
  },
  {
    id: "douyin",
    name: "抖音",
    mark: "抖",
    tone: "blue",
    category: "entertainment",
    url: "https://www.douyin.com/",
    description: "抖音官方网页与电脑客户端服务入口。",
    aliases: ["抖音", "douyin", "短视频", "直播", "视频"],
  },
  {
    id: "kuaishou",
    name: "快手",
    mark: "快",
    tone: "orange",
    category: "entertainment",
    url: "https://www.kuaishou.com/",
    description: "快手官方网页与客户端服务入口。",
    aliases: ["快手", "kuaishou", "短视频", "直播", "视频"],
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    mark: "红",
    tone: "orange",
    category: "entertainment",
    url: "https://www.xiaohongshu.com/",
    description: "小红书官方网页与客户端服务入口。",
    aliases: ["小红书", "xiaohongshu", "rednote", "社区", "笔记"],
  },
  {
    id: "weibo",
    name: "微博",
    mark: "微",
    tone: "orange",
    category: "entertainment",
    url: "https://weibo.com/",
    description: "微博官方网页与客户端服务入口。",
    aliases: ["微博", "weibo", "新浪微博", "社交", "资讯"],
  },
  {
    id: "huya",
    name: "虎牙直播",
    mark: "虎",
    tone: "orange",
    category: "entertainment",
    url: "https://www.huya.com/",
    description: "虎牙官方游戏直播与客户端服务入口。",
    aliases: ["虎牙", "虎牙直播", "huya", "直播", "游戏直播"],
  },
  {
    id: "douyu",
    name: "斗鱼直播",
    mark: "斗",
    tone: "orange",
    category: "entertainment",
    url: "https://www.douyu.com/",
    description: "斗鱼官方游戏直播与客户端服务入口。",
    aliases: ["斗鱼", "斗鱼直播", "douyu", "直播", "游戏直播"],
  },
  {
    id: "weread",
    name: "微信读书",
    mark: "读",
    tone: "blue",
    category: "entertainment",
    url: "https://weread.qq.com/",
    description: "腾讯官方微信读书网页与客户端服务入口。",
    aliases: ["微信读书", "weread", "阅读", "电子书", "听书"],
  },
  {
    id: "kugou",
    name: "酷狗音乐",
    mark: "狗",
    tone: "blue",
    category: "entertainment",
    url: "https://www.kugou.com/",
    description: "酷狗音乐官方网页与客户端服务入口。",
    aliases: ["酷狗", "酷狗音乐", "kugou", "音乐", "听歌"],
  },
  {
    id: "kuwo",
    name: "酷我音乐",
    mark: "酷",
    tone: "orange",
    category: "entertainment",
    url: "https://www.kuwo.cn/",
    description: "酷我音乐官方网页与客户端服务入口。",
    aliases: ["酷我", "酷我音乐", "kuwo", "音乐", "听歌"],
  },
  {
    id: "ximalaya",
    name: "喜马拉雅",
    mark: "喜",
    tone: "orange",
    category: "entertainment",
    url: "https://www.ximalaya.com/",
    description: "喜马拉雅官方音频、听书与播客服务入口。",
    aliases: ["喜马拉雅", "ximalaya", "听书", "播客", "音频"],
  },
  {
    id: "qingting",
    name: "蜻蜓 FM",
    mark: "蜻",
    tone: "green",
    category: "entertainment",
    url: "https://www.qingting.fm/",
    description: "蜻蜓 FM 官方广播、播客与音频服务入口。",
    aliases: ["蜻蜓fm", "蜻蜓", "qingting", "广播", "播客", "音频"],
  },
  {
    id: "neoimaging",
    name: "光影魔术手",
    mark: "光",
    tone: "orange",
    category: "media",
    url: "https://www.neoimaging.cn/",
    description: "光影魔术手官方照片处理与美化工具入口。",
    aliases: ["光影魔术手", "neoimaging", "修图", "图片编辑", "照片处理"],
  },
  {
    id: "kuaijianji",
    name: "快剪辑",
    mark: "快",
    tone: "orange",
    category: "media",
    url: "https://kuai.360.cn/",
    description: "360 官方快剪辑视频编辑工具入口。",
    aliases: ["快剪辑", "360快剪辑", "视频剪辑", "剪辑", "视频编辑"],
  },
];

const featuredIds = [
  "wechat",
  "chrome",
  "wps",
  "steam",
  "deepseek",
  "vscode",
  "microsoft-365",
  "todesk",
  "7zip",
];

const riskPhrases = [
  "破解版",
  "破解",
  "绿色版",
  "绿化版",
  "免安装版",
  "激活工具",
  "注册机",
  "高速下载",
  "极速下载",
  "下载器",
  "一键安装",
  "crack",
];

const genericSearchWords = [
  "官方下载",
  "官网下载",
  "免费下载",
  "最新版",
  "电脑版",
  "客户端",
  "安装包",
  "官方版",
  "官网",
  "下载",
];

const appById = new Map(softwareCatalog.map((app) => [app.id, app]));
const state = {
  category: "all",
  query: "",
  pendingNavigation: null,
  toastTimer: null,
};

const elements = {
  form: document.getElementById("search-form"),
  input: document.getElementById("search-input"),
  clear: document.getElementById("clear-search"),
  categoryBar: document.getElementById("category-bar"),
  grid: document.getElementById("results-grid"),
  inlineResults: document.getElementById("inline-results"),
  inlineResultsTitle: document.getElementById("inline-results-title"),
  inlineResultsCount: document.getElementById("inline-results-count"),
  inlineResultsList: document.getElementById("inline-results-list"),
  inlineNoResults: document.getElementById("inline-no-results"),
  inlineResultsClose: document.getElementById("inline-results-close"),
  summary: document.getElementById("results-summary"),
  catalogTitle: document.getElementById("catalog-title"),
  riskBanner: document.getElementById("risk-banner"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptyCopy: document.getElementById("empty-copy"),
  resetButton: document.getElementById("reset-search"),
  relatedWrap: document.getElementById("related-wrap"),
  relatedResults: document.getElementById("related-results"),
  dialog: document.getElementById("verify-dialog"),
  dialogStatusLabel: document.getElementById("dialog-status-label"),
  dialogTitle: document.getElementById("dialog-title"),
  dialogCopy: document.getElementById("dialog-copy"),
  dialogDomain: document.getElementById("dialog-domain"),
  dialogCopyDomain: document.getElementById("dialog-copy-domain"),
  dialogTip: document.getElementById("dialog-tip"),
  dialogConfirm: document.getElementById("dialog-confirm"),
  dialogCancel: document.getElementById("dialog-cancel"),
  dialogClose: document.getElementById("dialog-close"),
  toast: document.getElementById("toast"),
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function normalize(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[·._\-—/\\（）()【】[\]]/g, "")
    .replace(/\s+/g, "");
}

function stripRiskPhrases(value) {
  let cleaned = String(value);
  for (const phrase of riskPhrases) {
    cleaned = cleaned.replace(new RegExp(escapeRegExp(phrase), "gi"), " ");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

function stripGenericWords(value) {
  let cleaned = String(value).trim();
  for (const word of genericSearchWords) {
    cleaned = cleaned.replace(new RegExp(escapeRegExp(word), "gi"), " ");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findRiskPhrases(value) {
  const normalizedValue = String(value).toLowerCase();
  return riskPhrases.filter((phrase) =>
    normalizedValue.includes(phrase.toLowerCase()),
  );
}

function getSearchText(app) {
  return normalize([
    app.name,
    app.mark,
    categories[app.category],
    app.description,
    ...app.aliases,
  ].join(" "));
}

function scoreApp(app, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const name = normalize(app.name);
  const aliases = app.aliases.map(normalize);
  const searchText = getSearchText(app);

  if (name === normalizedQuery) return 120;
  if (aliases.includes(normalizedQuery)) return 112;
  if (name.startsWith(normalizedQuery)) return 102;
  if (aliases.some((alias) => alias.startsWith(normalizedQuery))) return 96;
  if (name.includes(normalizedQuery)) return 84;
  if (aliases.some((alias) => alias.includes(normalizedQuery))) return 76;
  if (searchText.includes(normalizedQuery)) return 48;

  const queryTokens = normalizedQuery.split(/[^\p{L}\p{N}+]+/u).filter(Boolean);
  if (
    queryTokens.length > 1 &&
    queryTokens.every((token) => searchText.includes(token))
  ) {
    return 35;
  }

  return 0;
}

function searchCatalog(value) {
  const cleaned = stripGenericWords(stripRiskPhrases(value)) || String(value).trim();
  if (!cleaned) {
    return softwareCatalog.map((app) => ({ app, score: 0 }));
  }

  const normalizedQuery = normalize(cleaned);
  if (normalizedQuery === "ai" || normalizedQuery === "人工智能") {
    return softwareCatalog
      .filter(
        (app) => app.category === "ai-chat" || app.category === "ai-tools",
      )
      .map((app) => ({ app, score: 100 }));
  }

  return softwareCatalog
    .map((app) => ({ app, score: scoreApp(app, cleaned) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.app.name.localeCompare(b.app.name, "zh-CN"));
}

function getFuzzySuggestions(value, limit = 4) {
  const normalizedQuery = normalize(stripGenericWords(stripRiskPhrases(value)));
  if (normalizedQuery.length < 2) return [];

  const queryChars = new Set(normalizedQuery);
  return softwareCatalog
    .map((app) => {
      const candidates = [app.name, ...app.aliases].map(normalize);
      let bestOverlap = 0;
      for (const candidate of candidates) {
        const overlap = [...new Set(candidate)].filter((char) =>
          queryChars.has(char),
        ).length;
        if (overlap > bestOverlap) bestOverlap = overlap;
      }
      return { app, overlap: bestOverlap };
    })
    .filter((entry) => entry.overlap >= Math.min(3, normalizedQuery.length))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((entry) => entry.app);
}

function resultCardTemplate(app) {
  const domain = getDomain(app.url);
  return `
    <article class="result-card">
      <div class="result-head">
        <span class="app-mark mark-${escapeHtml(app.tone)}" aria-hidden="true">${escapeHtml(app.mark)}</span>
        <div class="app-title">
          <h3>${escapeHtml(app.name)}</h3>
          <p>${escapeHtml(categories[app.category])}</p>
        </div>
        <span class="official-mark">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.8 13 3.6v4.1c0 3.3-2.1 5.7-5 7-2.9-1.3-5-3.7-5-7V3.6l5-1.8Z"></path>
            <path d="m5.7 7.8 1.5 1.5 3.1-3.4"></path>
          </svg>
          官网
        </span>
      </div>
      <p class="result-description">${escapeHtml(app.description)}</p>
      <div class="domain-line">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M5.3 7.3V5.5a2.7 2.7 0 0 1 5.4 0v1.8"></path>
          <rect x="3.2" y="7.2" width="9.6" height="7" rx="1.6"></rect>
        </svg>
        <code>${escapeHtml(domain)}</code>
        <button
          type="button"
          class="copy-link"
          data-copy-url="${escapeHtml(app.url)}"
          aria-label="复制 ${escapeHtml(app.name)} 官网地址"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="8" y="8" width="11" height="11" rx="2"></rect>
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
          </svg>
        </button>
      </div>
      <div class="result-footer">
        <span class="result-category">${escapeHtml(categories[app.category])}</span>
        <button type="button" class="visit-button" data-open-id="${escapeHtml(app.id)}">
          打开官网
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 10h12M11 5l5 5-5 5"></path>
          </svg>
        </button>
      </div>
    </article>
  `;
}

function renderCards(apps) {
  elements.grid.innerHTML = apps.map(resultCardTemplate).join("");
  elements.grid.hidden = apps.length === 0;
}

function inlineResultTemplate(app) {
  const domain = getDomain(app.url);
  return `
    <div class="inline-result-row">
      <span class="app-mark mark-${escapeHtml(app.tone)}" aria-hidden="true">${escapeHtml(app.mark)}</span>
      <div class="inline-result-copy">
        <strong>${escapeHtml(app.name)}</strong>
        <span>${escapeHtml(domain)}</span>
      </div>
      <span class="inline-official">官网</span>
      <button
        type="button"
        class="inline-open"
        data-open-id="${escapeHtml(app.id)}"
        aria-label="打开 ${escapeHtml(app.name)} 官网"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10h12M11 5l5 5-5 5"></path>
        </svg>
      </button>
    </div>
  `;
}

function renderInlineResults(apps) {
  if (!state.query) {
    elements.inlineResults.hidden = true;
    elements.inlineResultsList.innerHTML = "";
    return;
  }

  const visibleApps = apps.slice(0, 6);
  elements.inlineResults.hidden = false;
  elements.inlineResultsTitle.textContent = `“${state.query}”的官网结果`;
  elements.inlineResultsCount.textContent = apps.length
    ? `找到 ${apps.length} 个`
    : "未匹配";
  elements.inlineResultsList.innerHTML = visibleApps
    .map(inlineResultTemplate)
    .join("");
  elements.inlineResultsList.hidden = visibleApps.length === 0;
  elements.inlineNoResults.hidden = visibleApps.length > 0;

  if (apps.length > visibleApps.length) {
    elements.inlineResultsCount.textContent =
      `找到 ${apps.length} 个，显示前 ${visibleApps.length} 个`;
  }
}

function setCategory(category) {
  state.category = category;
  for (const button of elements.categoryBar.querySelectorAll("[data-category]")) {
    const active = button.dataset.category === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function getVisibleApps() {
  const matches = searchCatalog(state.query);
  const filtered = matches.filter(
    (entry) => state.category === "all" || entry.app.category === state.category,
  );

  if (state.query) {
    return filtered.map((entry) => entry.app);
  }

  if (state.category === "all") {
    return featuredIds.map((id) => appById.get(id)).filter(Boolean);
  }

  return softwareCatalog.filter((app) => app.category === state.category);
}

function setRiskBanner(query) {
  const found = findRiskPhrases(query);
  elements.riskBanner.hidden = found.length === 0;
}

function showEmptyState(query, suggestions = []) {
  renderCards([]);
  elements.emptyState.hidden = false;
  elements.emptyTitle.textContent = query
    ? `没有找到“${query}”的本地官网入口`
    : "这个分类暂时没有匹配项";
  elements.emptyCopy.textContent = query
    ? "可以换用中文名、英文名或用途再试，或从下方分类目录浏览。"
    : "请换一个分类，或清空搜索条件返回官网目录。";

  elements.relatedResults.innerHTML = suggestions
    .map(
      (app) =>
        `<button type="button" class="related-chip" data-related-query="${escapeHtml(app.name)}">${escapeHtml(app.name)}</button>`,
    )
    .join("");
  elements.relatedWrap.hidden = suggestions.length === 0;
}

function updateResults() {
  state.query = elements.input.value.trim();
  elements.clear.hidden = state.query.length === 0;
  setRiskBanner(state.query);

  const visibleApps = getVisibleApps();
  elements.emptyState.hidden = true;
  renderInlineResults(visibleApps);

  if (visibleApps.length === 0 && state.query) {
    elements.catalogTitle.textContent = "没有匹配到官网";
    elements.summary.textContent = "本地官网名单未匹配，请换用其他关键词。";
    showEmptyState(state.query, getFuzzySuggestions(state.query));
    return;
  }

  if (state.query) {
    elements.catalogTitle.textContent = `“${state.query}”的官网入口`;
    elements.summary.textContent = `找到 ${visibleApps.length} 个本地官网名单入口。请以打开后的地址栏域名为准。`;
  } else if (state.category === "all") {
    elements.catalogTitle.textContent = "热门软件安全入口";
    elements.summary.textContent = "人工整理常用软件官网，优先展示可核对的品牌域名。";
  } else {
    elements.catalogTitle.textContent = `${categories[state.category]}安全入口`;
    elements.summary.textContent = `当前分类共 ${visibleApps.length} 个本地官网名单入口。`;
  }

  renderCards(visibleApps);
}

function closeDialog() {
  if (elements.dialog.open) {
    elements.dialog.close();
  }
}

function openVerification({ name, url }) {
  const domain = getDomain(url);

  elements.dialogStatusLabel.textContent = "官网域名核对";
  elements.dialogTitle.textContent = `即将打开 ${name} 官网`;
  elements.dialogCopy.textContent =
    "先核对域名，再从软件自己的下载入口获取安装包。";
  elements.dialogDomain.textContent = domain;
  elements.dialogCopyDomain.dataset.copyValue = domain;
  elements.dialogTip.innerHTML =
    "<strong>下载前最后一步</strong><span>不要点击页面里颜色最醒目的“高速下载”，认准软件自己的下载入口。</span>";
  elements.dialogConfirm.querySelector("span").textContent = "已核对，打开官网";

  state.pendingNavigation = { url, name };
  elements.dialog.showModal();
}

function openExternal(url) {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) {
    newWindow.opener = null;
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
  showToast("已复制，可粘贴到地址栏核对");
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function applyQuery(query) {
  elements.input.value = query;
  setCategory("all");
  updateResults();
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.input.value.trim();
  if (!query) {
    elements.input.focus();
    return;
  }
  updateResults();
  elements.input.focus({ preventScroll: true });
});

elements.input.addEventListener("input", updateResults);

elements.inlineResultsList.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-id]");
  if (!openButton) return;
  const app = appById.get(openButton.dataset.openId);
  if (!app) return;
  openVerification({
    name: app.name,
    url: app.url,
  });
});

elements.inlineResultsClose.addEventListener("click", () => {
  elements.inlineResults.hidden = true;
});

elements.clear.addEventListener("click", () => {
  elements.input.value = "";
  elements.input.focus();
  updateResults();
});

elements.categoryBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  setCategory(button.dataset.category);
  updateResults();
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    applyQuery(button.dataset.query);
    elements.input.focus({ preventScroll: true });
  });
});

elements.grid.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy-url]");
  if (copyButton) {
    copyText(copyButton.dataset.copyUrl);
    return;
  }

  const openButton = event.target.closest("[data-open-id]");
  if (!openButton) return;
  const app = appById.get(openButton.dataset.openId);
  if (!app) return;
  openVerification({
    name: app.name,
    url: app.url,
  });
});

elements.resetButton.addEventListener("click", () => {
  applyQuery("");
  elements.input.focus();
});

elements.relatedResults.addEventListener("click", (event) => {
  const button = event.target.closest("[data-related-query]");
  if (!button) return;
  applyQuery(button.dataset.relatedQuery, { scroll: false });
});

elements.dialogConfirm.addEventListener("click", () => {
  const pending = state.pendingNavigation;
  closeDialog();
  if (pending) {
    openExternal(pending.url);
  }
});

elements.dialogCancel.addEventListener("click", closeDialog);
elements.dialogClose.addEventListener("click", closeDialog);

elements.dialog.addEventListener("close", () => {
  state.pendingNavigation = null;
});

elements.dialog.addEventListener("click", (event) => {
  if (event.target !== elements.dialog) return;
  const bounds = elements.dialog.getBoundingClientRect();
  const inside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;
  if (!inside) closeDialog();
});

elements.dialogCopyDomain.addEventListener("click", () => {
  const value = elements.dialogCopyDomain.dataset.copyValue;
  if (value) copyText(value);
});

updateResults();
window.addEventListener("pageshow", updateResults);
