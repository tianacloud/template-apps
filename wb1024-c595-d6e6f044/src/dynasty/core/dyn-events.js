/**
 * core/dyn-events.js —— 王朝模拟器 · 事件族
 *
 * 一个"族" = 同一种朝政困境的十来种写法（哪条河决口、哪个藩王、哪个边镇）。
 * 引擎保证同族一局只出一条，否则会出现"一年之内三处决口、两个权相"。
 *
 * option:
 *   text      选项文字
 *   effects   立即生效的国势变化
 *   result    选择后的结果文案
 *   resolve   (s, rnd) => { text, effects, tone, flags }  条件结算，覆盖 result
 *   flags     打标记
 *
 * 数值键：treasury 国库 / people 民心 / army 军备 / admin 吏治 /
 *        authority 皇权 / prestige 威望 / health 身体 /
 *        scholar 士族 / eunuch 宦官 / warlord 武将 / clan 宗室 / heirs 子嗣
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DynEvents = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const EVENTS = []

  function O(text, effects, result, extra) {
    return Object.assign({ text: text, effects: effects, result: result }, extra || {})
  }

  /* =====================================================================
   * 一、天灾
   * ===================================================================== */

  const FLOOD = {
    id: 'flood', stage: 0, weight: 1.1,
    variants: [
      { river: '淮水', region: '淮南', city: '寿春', crop: '稻', season: '六月', n: 11 },
      { river: '漳水', region: '河北', city: '邺城', crop: '粟', season: '七月', n: 7 },
      { river: '渭水', region: '关中', city: '长安', crop: '麦', season: '八月', n: 5 },
      { river: '汉水', region: '荆湖', city: '江陵', crop: '稻', season: '五月', n: 9 },
      { river: '岷江', region: '巴蜀', city: '成都', crop: '稻', season: '六月', n: 6 },
      { river: '济水', region: '齐鲁', city: '历城', crop: '粟', season: '七月', n: 8 },
      { river: '珠江', region: '岭南', city: '番禺', crop: '稻', season: '四月', n: 4 }
    ],
    build(v) {
      return {
        title: v.river + '决口',
        scene: v.season + '连雨十日，' + v.river + '在' + v.city + '以东决了口。堤是三十年前修的，去年工部就报过该加高，折子压在通政司没上来。'
          + '淹了' + v.n + '县，' + v.crop + '田全在水下。地方官在折子末尾写：灾民已有聚于城下者。',
        options: [
          O('开常平仓，遣御史持节赈灾', { treasury: -9, people: 10, admin: 3, prestige: 3 },
            '粮船七日后到。你在朝会上说了一句"饿死一人，朕之过也"，这句话被记进了起居注。灾民在城下跪了一片，没闹。'),
          O('免今年田赋，令地方自筹赈粮', { treasury: 2, people: -6, admin: -3, authority: 2 },
            '诏书下去，免的是朝廷那部分。地方把免掉的又在别处加回来，最后由里正去收。没有人上告，因为没人知道该告谁。'),
          O('征发民夫堵口，加派河工银', { treasury: 6, people: -9, army: 2, prestige: 2 },
            '民夫三万上了堤，工钱由沿河五州摊。堤在入冬前合了龙，账上多了一笔，河两岸多了几百座新坟。',
            { resolve: (s, rnd) => rnd() < 0.35 ? {
              text: '民夫三万上了堤。七月里有人中暑倒下，队伍里传了疫，堵口拖了二十天。工钱照收，人却没少死。',
              effects: { people: -4, treasury: -3 }, tone: 'bad', flags: ['harsh_labor']
            } : null })
        ]
      }
    }
  }

  const DROUGHT = {
    id: 'drought', stage: 0, weight: 1.1,
    variants: [
      { region: '河北', city: '真定', pest: '蝗', months: 5 },
      { region: '关中', city: '凤翔', pest: '旱', months: 7 },
      { region: '河东', city: '太原', pest: '旱', months: 6 },
      { region: '江淮', city: '扬州', pest: '蝗', months: 4 },
      { region: '陇右', city: '秦州', pest: '旱', months: 8 },
      { region: '河南', city: '洛阳', pest: '蝗', months: 5 }
    ],
    build(v) {
      return {
        title: v.region + v.pest,
        scene: '入春以来，' + v.region + '没下过一场透雨。' + v.city + '一带的井见了底，' + v.pest + '灾跟着来了。'
          + '御史回来奏报，说' + v.months + '个州里，"民有易子而食者"。这句话在奏折上写得极小，像是怕被看见。',
        options: [
          O('下罪己诏，减膳撤乐，开仓平粜', { people: 8, prestige: -3, authority: 4, treasury: -6 },
            '罪己诏颁行天下。你减了每日的膳，宫里停了一个月的乐。平粜的粮价比市价低三成，粮商在城外骂，百姓在城里谢。'),
          O('遣使祈雨，令有司祭山川', { treasury: -2, people: 3, admin: -2, prestige: 2 },
            '钦天监择了日子，你在南郊站了两个时辰。第七天果然下了雨，史官记为"上祷而雨"，没人提那几天正好是雨季。'),
          O('严令地方不得报灾，以免动摇', { people: -12, admin: -6, authority: 5, prestige: -5 },
            '诏令说"妄报灾伤者论罪"。' + v.city + '的知县把折子烧了，改报"岁稔"。秋后流民北上，路过邻县时被拦下，说是"境内无饥民"。',
            { resolve: (s, rnd) => rnd() < 0.45 ? {
              text: '诏令说"妄报灾伤者论罪"。折子果然少了，可流民不会因为不报就不走。入冬后，' + v.city + '城下聚了三千人。',
              effects: { people: -4, authority: -3 }, tone: 'bad', flags: ['covered_famine']
            } : null })
        ]
      }
    }
  }

  const PLAGUE = {
    id: 'plague', stage: 0, weight: 0.8,
    variants: [
      { region: '荆湖', city: '襄阳', what: '时疫' },
      { region: '岭南', city: '广州', what: '瘴疫' },
      { region: '河北', city: '定州', what: '伤寒' },
      { region: '两浙', city: '杭州', what: '疫' },
      { region: '巴蜀', city: '梓州', what: '瘟疫' }
    ],
    build(v) {
      return {
        title: v.city + v.what,
        scene: v.region + '报' + v.what + '。先是城外的流民，后来城里也有了。太医院说这病"由秽气生"，'
          + '开了三张方子，药材在库里存了六年。守城门的兵开始收"过城钱"，说是怕带病进来。',
        options: [
          O('遣太医署携药南下，设局施治', { treasury: -7, people: 8, admin: 3, prestige: 3 },
            '太医署去了十二个人，回来九个。药局在城外设了三个月，烧掉的尸体按车算。疫情在入秋后断了，没有人知道是药起了作用还是天冷了。'),
          O('封城断路，禁出入', { people: -7, army: 2, admin: 4, treasury: 2, authority: 3 },
            '四门落锁，城里的米价一日三涨。疫情确实没往外传，城里死了多少，报上来的是"约千余"。'),
          O('命地方自处，朝廷不过问', { people: -4, admin: -4, treasury: 2 },
            '地方官自己凑了钱，在城外搭了棚。奏报里说"疫已平息"，没说服了多少药，也没说烧了多少人。')
        ]
      }
    }
  }

  const OMEN = {
    id: 'omen', stage: 0, weight: 1,
    variants: [
      { what: '荧惑守心', place: '紫微垣', meaning: '主君位不安', detail: '钦天监夜观，说火星在心头停了七日' },
      { what: '日中有黑子', place: '午门', meaning: '主臣下有谋', detail: '正午的日头上有块黑影，像一枚铜钱' },
      { what: '白虹贯日', place: '东阙', meaning: '主兵戈', detail: '一道白气从日边穿过，史官画了图' },
      { what: '地动', place: '陇西', meaning: '主社稷动摇', detail: '陇西地震，城堞塌了四十丈' },
      { what: '嘉禾同穗', place: '颍州', meaning: '主丰年', detail: '颍州刺史献上一株九穗的禾，装在锦匣里' },
      { what: '甘露降于宫柏', place: '太庙', meaning: '主圣德', detail: '太庙的柏树上结了露，甜得像蜜' },
      { what: '雌鸡化雄', place: '京畿', meaning: '主阴盛', detail: '京畿一户人家的母鸡长了冠，会打鸣' }
    ],
    build(v) {
      const bad = ['荧惑守心', '日中有黑子', '白虹贯日', '地动', '雌鸡化雄'].indexOf(v.what) >= 0
      return {
        title: v.what,
        scene: v.detail + '。' + (bad
          ? '钦天监正跪在阶下，说' + v.meaning + '，请陛下"修省"。这话在朝堂上说完，殿里安静了很久。'
          : '礼部请上表称贺，说这是' + v.meaning + '。折子写得极漂亮，末尾请"宣付史馆"。'),
        options: bad ? [
          O('下诏罪己，避正殿，减常膳', { people: 6, prestige: -2, authority: 4, treasury: -3 },
            '你在偏殿住了半个月，膳减为两菜。罪己诏写得诚恳，民间抄本流传很广——比你的政令流传得广。'),
          O('斥为妖言，杖钦天监正', { authority: 5, admin: -4, prestige: -4, people: -4 },
            '钦天监正在午门外受了二十杖，第二日便致仕。此后再没有人在你面前提天象，包括该提的时候。'),
          O('令百官直言得失', { admin: 5, people: 4, authority: -3, prestige: 2 },
            '求言诏下去，收了三百多道奏疏。其中大半在骂地方官，有十七道在骂你。你把那十七道都看了。')
        ] : [
          O('宣付史馆，大赦天下', { prestige: 5, people: 5, treasury: -4, authority: 2 },
            '大赦的诏书贴到州县，狱里放出的人比该放的多。史馆把这件事写进了本纪，用的是"天人相与"的笔法。'),
          O('不以为意，只令地方勿再献', { admin: 3, people: -2, prestige: 1 },
            '你朱批"知道了"。此后祥瑞的折子少了很多，地方官摸不清圣意，索性连真的也不报了。'),
          O('重赏献瑞之人，令天下效之', { prestige: 3, people: -5, admin: -4, treasury: -3 },
            '献瑞者得了绢百匹。第二年，各州献上的"嘉禾"有四十余株，其中三十九株是拿胶粘的。')
        ]
      }
    }
  }

  /* =====================================================================
   * 二、边事与兵戈
   * ===================================================================== */

  const BORDER = {
    id: 'border', stage: 0, weight: 1.2,
    variants: [
      { foe: '北狄', dir: '雁门', general: '李崇', n: 3, what: '寇边' },
      { foe: '西戎', dir: '凉州', general: '郭钧', n: 2, what: '掠边' },
      { foe: '东虏', dir: '辽东', general: '慕容础', n: 4, what: '犯塞' },
      { foe: '南蛮', dir: '交州', general: '陈昶', n: 2, what: '叛' },
      { foe: '北狄', dir: '云中', general: '王晏', n: 5, what: '大举入寇' },
      { foe: '西羌', dir: '河湟', general: '马勋', n: 3, what: '断商道' }
    ],
    build(v) {
      return {
        title: v.foe + v.what,
        scene: v.dir + '守将' + v.general + '八百里加急：' + v.foe + '以' + v.n + '万骑' + v.what + '，已破三堡。'
          + '折子后附了一张图，标着被掠的村落，墨迹很急。兵部的意见写在贴黄上：或战或款，请旨。',
        options: [
          O('发兵五万，命' + v.general + '出击', { treasury: -10, army: -4, prestige: 6, people: -3, warlord: 6 },
            '大军出塞三百里，斩首四千，夺马八百。捷报用黄绫裹着送进宫。阵亡名单附在后面，你没有细看，只问了一句"粮够不够"。',
            { resolve: (s, rnd) => (s.army > 55 || rnd() < 0.4) ? null : {
              text: '大军出塞，粮道被截。前军溃退，' + v.general + '收拢残部退守' + v.dir + '，折损过半。败报送到时，你正在用膳，那顿饭撤了下去。',
              effects: { army: -8, prestige: -6, people: -4 }, tone: 'bad', flags: ['border_defeat']
            } }),
          O('许其互市，岁赐缯帛', { treasury: -6, people: 3, prestige: -4, army: 2, warlord: -3 },
            '岁赐二十万匹，换来的是一纸盟约和边境三年的安静。朝中有御史骂这是"以帛买安"，你把折子留中，没有发。'),
          O('令边将自筹，坚壁清野', { treasury: 3, army: -2, people: -5, warlord: 8, authority: -3 },
            '边将从军镇里自己抽了钱粮，又把沿边的百姓迁进堡里。' + v.dir + '守住了，可从此那里的兵只认将令，不太认兵部的调令。'),
          O('闭关绝市，诏令备战', { army: 4, treasury: -3, people: -2, prestige: 3, warlord: 2 },
            '关市一封，' + v.foe + '的马队反而少了。可边镇的铁器、茶叶都断了来源，将士怨言不小，军中开始有人私贩。')
        ]
      }
    }
  }

  const ARMY_SYSTEM = {
    id: 'army_system', stage: 2, weight: 0.9,
    variants: [
      { issue: '军户逃亡', detail: '卫所的在册军户只剩六成，其余的是空名', who: '兵部尚书' },
      { issue: '募兵糜费', detail: '募兵的饷银三年涨了一倍，战力却没有涨', who: '户部尚书' },
      { issue: '将骄卒惰', detail: '边镇兵久不操练，将领常年住在京城', who: '御史' },
      { issue: '马政废弛', detail: '太仆寺的马只剩两万匹，能用的不到一半', who: '太仆寺卿' },
      { issue: '藩镇坐大', detail: '三镇节度使兼领民政，赋税不上解', who: '中书舍人' }
    ],
    build(v) {
      return {
        title: v.issue,
        scene: v.who + '上奏：' + v.detail + '。折子列了三条整顿之法，条条都要动到人的饭碗。'
          + '他在末尾写："臣知此言一出，必为众所怨。然不言，则兵将不成兵将。"',
        options: [
          O('依议整顿，裁汰冗员', { admin: 6, army: 6, people: -4, warlord: -6, treasury: -4 },
            '裁了三个卫，撤了十一个空额参将。被裁的人聚在兵部门口哭了三天，第四天散了。半年后清点，在册的兵终于和实数对上了。'),
          O('缓行，先试行一镇', { admin: 2, army: 2, treasury: -2, warlord: -1 },
            '你朱批"知道了，先从' + v.detail.slice(0, 2) + '一处试行"。试行的地方确实见了效，别处照旧，因为"别处情形不同"。'),
          O('不允，恐生变', { army: -4, admin: -3, warlord: 5, authority: 2 },
            '你留中不发。' + v.who + '又上了一次折子，你仍然留中。第三次他没上，改成托病请辞。')
        ]
      }
    }
  }

  const REVOLT = {
    id: 'revolt', stage: 3, weight: 1.1,
    variants: [
      { where: '沂州', who: '盐徒', n: 2, cause: '盐引改法，灶户断了活路' },
      { where: '汉南', who: '流民', n: 5, cause: '连年加派，山中已无树皮可剥' },
      { where: '岭外', who: '矿徒', n: 3, cause: '封矿之后，数万人失了业' },
      { where: '淮西', who: '邪教', n: 4, cause: '妖人倡言弥勒降世，从者数万' },
      { where: '蜀北', who: '棚民', n: 2, cause: '山田被大户圈占，棚民无处可去' },
      { where: '河北', who: '乱兵', n: 2, cause: '欠饷八月，哗变杀官' }
    ],
    build(v) {
      return {
        title: v.where + v.who + '起',
        scene: v.where + '报：' + v.who + '聚众' + v.n + '万，杀知县，据县城。起事的原因是' + v.cause + '。'
          + '巡抚请兵，兵部问粮，户部说没有。三份折子摆在案上，谁也没说该怎么办。',
        options: [
          O('发兵剿之，务求速平', { treasury: -8, people: -6, army: -2, authority: 6, prestige: 3 },
            '官军三路进剿，两个月平定。首级献于午门，依律传示九边。看过的人说，里面有不少是妇人和半大的孩子。'),
          O('遣使招抚，免其三年赋', { people: 8, treasury: -7, authority: -3, admin: 2 },
            '招抚的诏书念到"免三年赋"时，人群里有人跪下了。为首的被授了一个巡检，第二年他替朝廷守住了那个县。'),
          O('责地方激变，斩知县以谢', { people: 4, admin: -2, authority: -4, prestige: -2 },
            '知县已被乱民所杀，你追夺了他的官爵，算是给了一个交代。乱民散了七成，剩下的进了山，此后十年没下来。')
        ]
      }
    }
  }

  const PLOT = {
    id: 'plot', stage: 3, weight: 0.8,
    variants: [
      { who: '禁军都尉赵钦', how: '结纳内侍，约以夜半开宫门', when: '冬至' },
      { who: '宗正卿萧敏', how: '私铸兵器，藏于别业', when: '八月' },
      { who: '御史中丞周阔', how: '与边将通书，语多不逊', when: '三月' },
      { who: '太仆少卿韩昭', how: '以医入侍，药中杂他物', when: '九月' },
      { who: '羽林郎将李肃', how: '宴上将刃，为人所制', when: '正月' }
    ],
    build(v) {
      return {
        title: '告变',
        scene: v.when + '，密奏入宫：' + v.who + v.how + '。告发者是他的旧部，供词写了七页，'
          + '其中三页是往来书信的抄本。你把抄本读了两遍，字迹确实是他的。',
        options: [
          O('即日下狱，穷治其党', { authority: 8, admin: -4, people: -5, prestige: -3, scholar: -5 },
            '当夜拿了' + v.who + '，供出同党四十七人。三法司会审用了十二天，斩了十九个。此后半年，朝会上没人敢和你对视。'),
          O('密令收押，不事株连', { authority: 5, admin: 3, prestige: 2, people: 1 },
            '只拿了首犯，余者不问。' + v.who + '在狱中自尽，留了一封血书，说"臣罪当死，然心实无他"。你把血书烧了。'),
          O('佯为不知，遣人密察', { authority: 2, admin: 4, prestige: -2 },
            '你照常临朝，见了他还问了一句家常。三个月后查清了：书信是伪造的，告发者欠了他一笔钱。你没有追究告发的人，只把他调去了远州。',
            { resolve: (s, rnd) => rnd() < 0.5 ? {
              text: '你佯作不知。半月后的夜里，宫门果然开了。幸而宿卫换了人，事未成。' + v.who + '死于乱刀之下，你的手在袖子里抖了很久。',
              effects: { authority: -6, health: -4, people: -3, prestige: -4 }, tone: 'bad', flags: ['palace_coup']
            } : null })
        ]
      }
    }
  }

  /* =====================================================================
   * 三、朝堂
   * ===================================================================== */

  const MINISTER = {
    id: 'minister', stage: 1, weight: 1.1,
    variants: [
      { who: '中书令裴玄', merit: '佐先帝定天下', fault: '门生故吏遍布州县', age: 61 },
      { who: '尚书左仆射崔敬', merit: '理财十年，府库充实', fault: '诸子皆居要职', age: 57 },
      { who: '同平章事郑珪', merit: '三朝老臣，朝野所望', fault: '每事必援先例，新政难行', age: 66 },
      { who: '枢密副使杜衡', merit: '知兵，边事赖以安', fault: '与边将结为姻亲', age: 52 },
      { who: '吏部尚书卢坦', merit: '铨选公平，人不敢私', fault: '性刚，与同僚多不合', age: 49 },
      { who: '御史大夫韦皋', merit: '纠劾不避权贵', fault: '所劾多出于意气', age: 55 }
    ],
    build(v) {
      return {
        title: '论' + v.who,
        scene: '御史台呈上弹章，劾' + v.who + '：' + v.fault + '。' + v.who + '今年' + v.age + '岁，' + v.merit + '。'
          + '弹章在通政司压了三天才递上来，递的人也知道，这一本递出去，朝堂就要分两半。',
        options: [
          O('罢其职，令致仕归里', { authority: 6, admin: -4, scholar: -6, prestige: 2, treasury: -2 },
            v.who + '接旨时没有争辩，只请求把先帝赐的那柄玉如意带走。你准了。他走那日，城南送行的车马排了二里。'),
          O('留中不发，温言慰之', { authority: -3, admin: -2, scholar: 5, prestige: 1 },
            '你把弹章留在案上，召见时只说"卿辛苦了"。' + v.who + '回去后上了一道自陈疏，请求避位。你没准，他也没再提。'),
          O('命三法司会勘，是非付公论', { admin: 4, authority: 2, prestige: 3, scholar: -2, treasury: -3 },
            '会勘用了四个月，查出两件事是真的，五件是捕风捉影。' + v.who + '罚俸一年，仍居原位。弹劾的御史外放去了县里。'),
          O('擢其为相，以观后效', { scholar: 8, authority: -6, admin: 2, prestige: 3 },
            '制书下来那天，弹劾的御史在朝服里坐了很久。' + v.who + '拜相后第一件事，是把弹章里提到的那几个人调去了边州。')
        ]
      }
    }
  }

  const EUNUCH = {
    id: 'eunuch', stage: 1, weight: 1,
    variants: [
      { who: '内侍省高让', what: '掌内库，出纳无籍', act: '诸道进献，先入其手' },
      { who: '中常侍王黼', what: '典禁中兵', act: '宿卫将校多出其门' },
      { who: '内侍李愔', what: '传旨于外朝', act: '每有除授，必先议价' },
      { who: '御药院张敏', what: '侍疾左右', act: '药饵之事，外臣不得与闻' },
      { who: '监军使孙恪', what: '监' + '边军', act: '军中奏报，先过其目' }
    ],
    build(v) {
      return {
        title: v.who,
        scene: v.who + v.what + '，' + v.act + '。御史请"裁抑内侍，还政外朝"，'
          + '折子递进来时，他正好在你身边研墨。他什么也没说，手很稳。',
        options: [
          O('从其请，裁抑内侍', { eunuch: -12, admin: 6, scholar: 6, authority: -2, people: 3 },
            '内侍省裁了三百人，' + v.who + '调去看守皇陵。外朝称颂了一阵。可宫里的消息从此慢了半日，你有时是最后一个知道的。'),
          O('不问，仍用之如故', { eunuch: 10, authority: 4, admin: -5, scholar: -6 },
            '你把折子压下，' + v.who + '照旧当差。他知道你护着他，办事更用心了——用心到外朝递进来的折子，他先替你分了个轻重。'),
          O('令其自陈，量加惩处', { eunuch: -4, admin: 3, scholar: 2, authority: 1 },
            v.who + '自陈"愚钝失察"，罚俸半年，仍在原职。御史不满意，又上了一本。这一本你没看。'),
          O('命其领监事，出为耳目', { eunuch: 12, authority: 5, scholar: -7, admin: -2 },
            '你赐了他一枚牙牌，许其密奏。从此各地官员的动静，你比中书省先知道。代价是，他知道了你知道什么。')
        ]
      }
    }
  }

  const KIN = {
    id: 'kin', stage: 2, weight: 0.9,
    variants: [
      { who: '太后兄张国舅', ask: '求领节度使', why: '御史言外戚不宜典兵', back: '慈宁宫', tone: '太后提了一句“亲戚里头，也就他还想着朝廷”' },
      { who: '皇后弟曹侯', ask: '求开府仪同三司', why: '御史言其无尺寸之功', back: '中宫', tone: '皇后这几日话少，替你添茶时手停了一下' },
      { who: '驸马都尉薛绍', ask: '求盐引三千', why: '户部言盐法不可乱', back: '公主府', tone: '公主进宫请安，坐了一个时辰，没提这件事，走的时候眼圈是红的' },
      { who: '皇舅祖孙茂', ask: '求赐第于御街', why: '工部言侵占官道', back: '外戚旧邸', tone: '太后的兄弟辈里，只剩他一个还在京中' },
      { who: '太后侄张峤', ask: '求入中书', why: '中书言非进士不得入', back: '慈宁宫', tone: '太后把先帝赐的镯子给了张峤的母亲' }
    ],
    build(v) {
      return {
        title: v.who,
        scene: v.who + '入见，' + v.ask + '。' + v.why + '。'
          + '这事若在别家，一句"不许"就够了；可' + v.who + '身后站着的是' + v.back + '。' + v.tone + '。',
        options: [
          O('允之，以示亲亲', { clan: 10, authority: -5, admin: -4, scholar: -4, treasury: -3 },
            '制书下了。外朝议论了半个月，御史上了三本，都留中。太后很高兴，赏了你一碟她亲手做的点心。'),
          O('不许，另赐金帛以慰', { clan: -4, authority: 4, admin: 3, treasury: -4, scholar: 3 },
            '你赐了绢千匹、金百两，没有给官。' + v.who + '谢恩时笑得有些勉强。太后那边，你连着去了三天请安。'),
          O('许其虚衔，不予实权', { clan: 3, authority: 1, admin: 1, scholar: -1 },
            '给了个"特进"的散官，俸禄照领，不管事。' + v.who + '起初不满意，后来发现这个衔能穿紫袍，也就满意了。')
        ]
      }
    }
  }

  const CORRUPT = {
    id: 'corrupt', stage: 1, weight: 1,
    variants: [
      { who: '漕运总督钱度', amount: 40, how: '以"折耗"为名，每船加收' },
      { who: '户部侍郎杨绾', amount: 26, how: '挪借军饷，放贷取息' },
      { who: '江南织造曹寅', amount: 18, how: '贡物以次充好，余者入己' },
      { who: '河督陈潢', amount: 55, how: '虚报工料，河工银三去其一' },
      { who: '盐运使卢见曾', amount: 70, how: '盐引私卖，官盐滞销' },
      { who: '知府王亶望', amount: 12, how: '赈粮折银，银不入仓' }
    ],
    build(v) {
      return {
        title: v.who + '一案',
        scene: '御史查实：' + v.who + v.how + '，赃银' + v.amount + '万两。案卷有半人高，牵连的官员从州县到部院，'
          + '一共四十三人。' + v.who + '的父亲是先帝的旧臣，去年刚得了谥号。',
        options: [
          O('依律严办，抄没家产', { admin: 8, treasury: 12, people: 6, scholar: -7, prestige: 4 },
            '抄家那日，从' + v.who + '宅里抬出四十箱东西。斩决的旨意下来，京中官员连夜烧了不少账本。此后三年，部院的"例银"少了很多。'),
          O('追赃免死，发往军前效力', { treasury: 6, admin: 2, people: -2, scholar: 1 },
            '赃银追回六成，人发去了边镇。他在军前待了两年，后来病死了。有人说他是被灭口的，你没有查。'),
          O('只追赃，不问人', { treasury: 4, admin: -4, people: -5, scholar: 3, authority: -2 },
            '银子入库，官照做。消息传出去，各州县的"折耗"第二年就涨了。他们算过账：只要不被杀，这笔买卖就还划算。'),
          O('命其自劾，罚俸了事', { admin: -6, people: -7, authority: -3, scholar: 4, treasury: 1 },
            v.who + '上了一道"自陈疏"，说自己"一时糊涂"。罚俸一年，调任闲职。此案之后，御史台再查大案，往往查不动了。')
        ]
      }
    }
  }

  const EXAM = {
    id: 'exam', stage: 1, weight: 1,
    variants: [
      { issue: '科场舞弊', detail: '今科进士前十名，有七人是主考的门生', who: '礼部' },
      { issue: '请开恩科', detail: '士子积压于京，多年不得一第', who: '翰林院' },
      { issue: '南北榜之争', detail: '北人言南人占了名额，聚于贡院外', who: '礼部侍郎' },
      { issue: '请改试经义', detail: '有言诗赋无用，宜试策论', who: '国子监祭酒' },
      { issue: '捐纳入仕', detail: '府库不足，有司请开捐例', who: '户部' },
      { issue: '举人冒籍', detail: '京畿举子多冒籍顺天，本地士子鼓噪', who: '顺天府尹' }
    ],
    build(v) {
      return {
        title: v.issue,
        scene: v.who + '奏：' + v.detail + '。科场是天下读书人唯一的门，门要是歪了，人心就散了。'
          + '可这扇门后面站着的，往往是替你办事的人。',
        options: [
          O('严查，主考下狱，另择考官', { admin: 7, prestige: 5, scholar: -8, people: 4, treasury: -2 },
            '主考下狱，重考一次。新榜出来，寒门子弟占了半数。落第的举子在客栈里哭，中了的在街上跑。'),
          O('另额取中，两平之', { scholar: 3, admin: 2, people: 2, prestige: 1 },
            '南北各定额数，另加十名。两边都不满意，可两边都没闹起来。这种"都不满意"的法子，后来用了很多年。'),
          O('维持原榜，斥言者为谤', { scholar: 5, admin: -4, people: -5, prestige: -4, authority: 3 },
            '原榜不动，上言的举子被枷了三日。此后科场的规矩更"稳"了，只是中榜的名字，越来越像同一批人家的族谱。'),
          O('开捐纳之例，以充国用', { treasury: 14, admin: -8, people: -6, scholar: -3 },
            '捐例一开，三个月收了八十万两。州县多了一批不会断案的官，他们花银子买了印，自然要从别处赚回来。')
        ]
      }
    }
  }

  const RITUAL = {
    id: 'ritual', stage: 1, weight: 0.8,
    variants: [
      { issue: '追尊生父', detail: '礼部言于礼不合，当称"皇叔"' },
      { issue: '郊祀配天', detail: '议者谓当以先帝配，或以始祖配' },
      { issue: '太后称制仪', detail: '太后欲御正殿受贺' },
      { issue: '宗庙昭穆', detail: '祧迁之序，两派各执一说' },
      { issue: '服制三年', detail: '有请改期为三年者，百官异议' }
    ],
    build(v) {
      return {
        title: v.issue,
        scene: v.issue + '。' + v.detail + '。礼部的折子引了十七处古礼，另一派引了二十三处。'
          + '这不是小事——礼就是名分，名分定了，谁高谁低就定了。',
        options: [
          O('从礼部议，守旧制', { scholar: 6, admin: 3, authority: -3, prestige: 2 },
            '你准了礼部所议。旧制得以维持，士林称颂"上守礼法"。只是你想办的那件事，从此再没有提过。'),
          O('断以己意，另立新仪', { authority: 8, scholar: -10, prestige: 3, people: -2 },
            '你在廷议上拍了板："此朕家事。"礼部尚书跪了半个时辰，最后照办。新仪行过之后，没有人再敢跟你争"礼"。'),
          O('付廷议，令百官各抒所见', { admin: 2, scholar: 2, authority: -2, prestige: 1 },
            '廷议开了七次，最后一次议到深夜。结论是"仍旧"，但你在过程中看清了谁站在哪一边。这比结论有用。')
        ]
      }
    }
  }

  const HISTORY = {
    id: 'history', stage: 2, weight: 0.7,
    variants: [
      { what: '修前朝史', detail: '前朝实录散佚，需征书于天下', who: '翰林学士' },
      { what: '纂类书', detail: '集天下典籍三千种，卷帙浩繁', who: '国子监' },
      { what: '修本朝会典', detail: '典章散于各部，宜汇为一书', who: '中书省' },
      { what: '刊刻经书', detail: '请颁定本于天下学宫', who: '礼部' },
      { what: '起居注之议', detail: '有请陛下亲览起居注者', who: '谏议大夫' }
    ],
    build(v) {
      return {
        title: v.what,
        scene: v.who + '请' + v.what + '：' + v.detail + '。这件事花钱不多，费的是人，落成之后却是千秋的事。'
          + '也有人在私下说，修史的人手里的笔，比御史的还重。',
        options: [
          O('开局设馆，拨内帑以成之', { treasury: -8, prestige: 10, admin: 4, scholar: 6, people: 2 },
            '史馆开了六年，成书三百卷。你在书成那日翻了很久，最后只说了一句"存之"。这部书后来流传了下来，你的名字因此被人记住。'),
          O('许其修纂，不拨内帑', { prestige: 5, scholar: 3, treasury: 0, admin: 1 },
            '书还是修成了，靠的是各州县的摊派和士绅的捐助。纸张粗了些，字也小了些，内容倒还齐整。'),
          O('不许，以为虚文', { treasury: 3, prestige: -4, scholar: -5, admin: -1 },
            '你说"治天下在实政，不在虚文"。这话没错，可写在纸上的东西，往往比做过的事活得久。'),
          O('亲览起居注，命史官改易', { authority: 5, prestige: -8, scholar: -8, admin: -2 },
            '你把不顺眼的几处划了。史官照改，改完手抖得握不住笔。这件事没有传出去，除了史馆里的四个人。')
        ]
      }
    }
  }

  const OLDMAN = {
    id: 'oldman', stage: 2, weight: 0.9,
    variants: [
      { who: '太傅王恕', age: 74, what: '乞骸骨', note: '先帝托孤之臣，朝中无第二人可替' },
      { who: '枢密使李纲', age: 69, what: '以病请辞', note: '边将多其旧部' },
      { who: '司徒陈平', age: 71, what: '请致仕', note: '掌天下钱谷三十年' },
      { who: '太子太保周勃', age: 66, what: '乞归养病', note: '东宫师傅，太子与之最亲' },
      { who: '谏议大夫汲黯', age: 63, what: '请外放', note: '以直谏闻名，屡犯颜' }
    ],
    build(v) {
      return {
        title: v.who + v.what,
        scene: v.who + '今年' + v.age + '岁，上表' + v.what + '。' + v.note + '。'
          + '表里说"臣老矣，愿归田里"，话说得客气。真意是试探——他要看你还留不留他。',
        options: [
          O('温诏慰留，加衔赐几杖', { scholar: 6, admin: 3, authority: -2, treasury: -3, prestige: 2 },
            '你加了他太师衔，赐几杖，许乘轿入宫。他留了下来，又干了四年，最后死在任上。丧礼办得很重。'),
          O('允其请，厚赐遣归', { scholar: -3, admin: -2, authority: 4, people: 2, treasury: -3 },
            '你准了，赐绢千匹、金百两，命地方官岁时存问。他走那日，你站在殿门外看了一会儿。此人一去，朝中再没人敢这样跟你说话。'),
          O('允其请，并召其子入朝', { authority: 5, admin: 3, scholar: 1, treasury: -2 },
            '准他归乡，同时召其子为侍御史。老人临走前握着你的手说"犬子愚钝，望陛下教之"。他知道这是人质，也知道这是恩典。'),
          O('不许，且责其"托辞避事"', { authority: 6, scholar: -8, admin: 1, prestige: -3 },
            '你把表退回，朱批"卿欲弃朕而去耶"。他再没提致仕，可从此称病，一月只上三日朝。')
        ]
      }
    }
  }

  /* =====================================================================
   * 四、财用与民生
   * ===================================================================== */

  const TAX = {
    id: 'tax', stage: 2, weight: 1,
    variants: [
      { item: '田赋', where: '河南', gap: 30, why: '军费不敷' },
      { item: '丁银', where: '山东', gap: 22, why: '河工待款' },
      { item: '商税', where: '两浙', gap: 18, why: '宗室禄米不继' },
      { item: '加派', where: '河北', gap: 40, why: '边饷积欠' },
      { item: '关市', where: '潼关', gap: 12, why: '修陵' },
      { item: '杂税', where: '荆湖', gap: 15, why: '百官俸禄' }
    ],
    build(v) {
      return {
        title: v.item + '之议',
        scene: '户部奏：' + v.why + '，计缺银' + v.gap + '万两，请于' + v.where + '加' + v.item + '三分。'
          + '折子附了一份细账，算到每一亩。你翻到最后，看见一行小字："若加，民力恐不能支。"写这行字的人没有署名。',
        options: [
          O('准奏加征', { treasury: 14, people: -10, admin: -2, authority: 3 },
            '加征的诏书贴到乡里，里正挨户去收。收上来的比算出来的少三成，因为有些户已经跑了。国库这一关过了，' + v.where + '的县志里多了一句"是岁大饥"。'),
          O('不加，另裁冗费', { treasury: 4, admin: 5, people: 4, scholar: -4, clan: -3 },
            '你裁了宗室的禄米、并了三个闲司，又停了两年贡物。省下来的银子刚够填上缺口。被裁的人骂了你半年。'),
          O('加于商贾，不增田赋', { treasury: 8, people: 2, admin: 2, scholar: -3 },
            '商税加了一分，田赋不动。士绅称颂"不扰农桑"，商人在会馆里骂。三个月后，有两成的铺子关了门，税反而少收了。'),
          O('借内帑以济，徐图后计', { treasury: 7, people: 2, prestige: 3, authority: -2 },
            '你从内库拨了银子，说是"暂借"。户部尚书磕头，说"陛下圣明"。这笔钱后来没还，内库从此空了三分之一。')
        ]
      }
    }
  }

  const LAND = {
    id: 'land', stage: 2, weight: 1,
    variants: [
      { where: '江南', who: '缙绅', n: 60, what: '隐田' },
      { where: '河北', who: '勋贵', n: 40, what: '庄田' },
      { where: '关中', who: '藩府', n: 30, what: '侵占民田' },
      { where: '两浙', who: '豪商', n: 25, what: '买田避赋' },
      { where: '荆湖', who: '寺院', n: 35, what: '度牒占田' },
      { where: '蜀中', who: '土司', n: 20, what: '私相授受' }
    ],
    build(v) {
      return {
        title: v.where + '田亩之弊',
        scene: '丈田的官员回奏：' + v.where + v.who + v.what + '，隐匿田亩约' + v.n + '万顷，占一州之半。'
          + '这些田不纳粮，粮就摊到剩下的田上。剩下的田，是自耕农的。',
        options: [
          O('清丈田亩，一律起科', { treasury: 12, people: 9, admin: 5, scholar: -10, clan: -6 },
            '清丈令下，各州重新立了鱼鳞图册。' + v.where + '的士绅联名上书，说"祖宗之法不可变"。你没有理会。三年后，那里的田赋翻了一倍，粮价却没涨。'),
          O('只清' + v.who + '，不及他人', { treasury: 6, people: 4, admin: 2, scholar: -4, clan: -2 },
            '只查了' + v.who + '，退田三万顷。其余的人松了口气，同时明白了一件事：只要别太出头，就不会有事。'),
          O('暂缓，恐动摇根本', { treasury: -4, people: -6, admin: -4, scholar: 6, clan: 4 },
            '"暂缓"两个字写在朱批上，一缓就是十二年。' + v.where + '的自耕农又少了两成，剩下的都成了佃户。'),
          O('以田亩换官身，许其自陈', { treasury: 8, people: 2, admin: -2, scholar: 2, clan: 3 },
            '诏令自陈者免罪，还可授散官。一半人报了，一半人没报。报了的名下少了田，多了个"奉训大夫"的虚衔，见了知县可以不下跪。')
        ]
      }
    }
  }

  const SALT = {
    id: 'salt', stage: 2, weight: 0.8,
    variants: [
      { where: '两淮', issue: '盐引壅积', detail: '积引三百万，商人不肯再买' },
      { where: '河东', issue: '私盐盛行', detail: '私盐价贱，官盐卖不动' },
      { where: '长芦', issue: '灶户逃亡', detail: '灶户不堪盘剥，逃者过半' },
      { where: '福建', issue: '盐场坍塌', detail: '海潮冲了盐场，需银修葺' },
      { where: '四川', issue: '井盐枯竭', detail: '老井出卤渐少，新井需凿' }
    ],
    build(v) {
      return {
        title: v.where + v.issue,
        scene: '盐运司奏：' + v.where + v.issue + '，' + v.detail + '。盐利占国用四分之一，'
          + '这一块要是塌了，别处补不上。运河上的盐船已经停了十七艘。',
        options: [
          O('改行票盐，听商自运', { treasury: 10, admin: 3, people: 5, scholar: -4, clan: -3 },
            '票盐一行，盐价跌了三成，百姓吃得起盐了。原来的大盐商倒了六家，其中两家是京里某位尚书的姻亲。'),
          O('严缉私盐，增设巡卡', { treasury: 5, people: -6, army: 2, admin: 1 },
            '沿河设了三十处巡卡，缉私的兵丁比盐丁还多。私盐少了，官盐涨了价，百姓开始吃"淡食"——菜里不放盐。'),
          O('借商本，官督商销', { treasury: 6, clan: 4, scholar: 2, people: -2 },
            '官府出本钱，商人经销，利分三七。盐引重新流通起来，只是那几个拿到"总商"名号的，都是递过门包的。'),
          O('减盐课，纾灶户之困', { treasury: -6, people: 8, admin: 2, prestige: 2 },
            '盐课减了两成，灶户回来了大半。国库少了一笔，可沿海的灶村重新有了炊烟。这笔账，户部算不出来。')
        ]
      }
    }
  }

  const CURRENCY = {
    id: 'currency', stage: 3, weight: 0.7,
    variants: [
      { issue: '铜钱私铸', detail: '民间私铸的錢轻薄如纸，一贯只值三百文' },
      { issue: '宝钞壅滞', detail: '钞法不行，民间只认银，钞价跌至一成' },
      { issue: '银钱比价', detail: '银贵钱贱，农民以钱纳赋，实际多交三成' },
      { issue: '铸局亏本', detail: '铜价高于钱值，铸一炉亏一炉' }
    ],
    build(v) {
      return {
        title: v.issue,
        scene: '户部奏：' + v.detail + '。市面上的米价一月三变，' + '百姓把铜钱串在腰上，走一路掉一路。'
          + '管钱法的人换了三个，没有一个能把这团乱麻理清。',
        options: [
          O('严禁私铸，重法绳之', { admin: 4, people: -6, treasury: 5, authority: 4 },
            '私铸者斩，首级挂在钱局门口。钱法清了一阵，可铜价还是高，官炉开一天亏一天，最后索性停了。'),
          O('改铸大钱，以一当十', { treasury: 9, people: -9, admin: -3, prestige: -3 },
            '大钱铸出来了，一枚当十。民间立刻把旧钱藏起来，市面上只剩大钱。半年后，一枚大钱只买得到原来三文的东西。'),
          O('废钞用银，听民自便', { treasury: -5, people: 7, admin: 4, scholar: 2 },
            '钞法废了，银子成了真正的钱。交易反而顺了，只是朝廷再也不能靠印钞度日——从此每一笔开支，都要从库里实打实地拿。'),
          O('平粜以钱，收钱改铸', { treasury: 3, people: 2, admin: 1, prestige: 1 },
            '你令常平仓卖粮只收铜钱，把好钱收进库，坏钱熔了重铸。这法子慢，但两年后市面上的钱确实厚实了些。')
        ]
      }
    }
  }

  const TRADE = {
    id: 'trade', stage: 2, weight: 0.8,
    variants: [
      { where: '泉州', what: '市舶', detail: '番商云集，岁入香药八万斤' },
      { where: '广州', what: '海舶', detail: '有请开海禁者，亦有言海盗因之而起' },
      { where: '扬州', what: '漕运', detail: '运河淤塞，粮船滞留三月' },
      { where: '凉州', what: '互市', detail: '与西戎通商，马匹可得' },
      { where: '杭州', what: '丝市', detail: '丝价腾贵，机户停工' }
    ],
    build(v) {
      return {
        title: v.where + v.what,
        scene: v.where + '奏：' + v.detail + '。有司请设关榷税，或请弛禁通商。'
          + '这两种说法在朝堂上都有道理，区别只在于：钱由谁来收。',
        options: [
          O('设市舶司，抽分取利', { treasury: 12, people: 3, admin: 2, scholar: -2, clan: -2 },
            '市舶司设了，抽分一成。当年入库三十万两。管事的太监往家里搬了三箱香料，你没有追究——比起他替你收上来的，那不算什么。'),
          O('弛禁通商，不与民争利', { people: 7, treasury: 3, admin: 1, prestige: 4, scholar: -3 },
            '海禁一开，' + v.where + '的码头三个月里多了两百条船。有人富了，有人开始担心"引狼入室"。这两种声音你都听见了。'),
          O('严禁，恐生事端', { people: -5, treasury: -3, authority: 3, prestige: -3 },
            '一纸禁令，码头空了。走私的船反而多了，他们的价钱更好，因为风险要算进去。'),
          O('官督商办，利归公帑', { treasury: 9, clan: 3, scholar: 2, people: -2, admin: -1 },
            '设了官局，招商人承办。局里的账很漂亮，只是承办的那几家，都是各部堂官的亲戚。')
        ]
      }
    }
  }

  const BANDIT = {
    id: 'bandit', stage: 3, weight: 0.8,
    variants: [
      { where: '太行', who: '山贼', n: 3000, what: '劫掠商旅' },
      { where: '洞庭', who: '水匪', n: 800, what: '据湖为寨' },
      { where: '岭南', who: '土寇', n: 5000, what: '攻掠州县' },
      { where: '淮北', who: '盐枭', n: 2000, what: '私贩拒捕' },
      { where: '汉中', who: '逃兵', n: 1200, what: '结寨自保' }
    ],
    build(v) {
      return {
        title: v.where + v.who,
        scene: v.where + '有' + v.who + '约' + v.n + '人，' + v.what + '。官兵剿了两次，都扑了空——'
          + '山里的路他们熟，官兵不熟。带兵的参将说，这些人里头，一半是逃了赋的农户。',
        options: [
          O('增兵进剿，绝其巢穴', { treasury: -7, army: 2, people: -5, authority: 5, prestige: 3 },
            '三路合围，烧了寨子。俘获的"贼"里有六成是面黄肌瘦的农夫。班师那日，' + v.where + '的百姓没有出来看。'),
          O('招安，授其首领以职', { people: 4, authority: -4, army: 2, treasury: -2, warlord: 3 },
            '首领授了巡检，余众编入乡勇。' + v.where + '安静了三年。三年后，这个巡检手下有五千人，不再听调。'),
          O('免其逋赋，许其归田', { people: 8, treasury: -6, admin: 3, prestige: 2 },
            '诏书说"归田者免三年逋赋"。散了大半，剩下的头目不肯降，带着几百人进了更深的林子。'),
          O('责地方官平时失察，先行罢黜', { admin: 4, people: -2, authority: 2, prestige: -2 },
            '知府罢官，新知府到任第一件事是清乡。清乡清了两个月，' + v.where + '的村子少了七个。')
        ]
      }
    }
  }

  /* =====================================================================
   * 五、宫闱
   * ===================================================================== */

  const HAREM = {
    id: 'harem', stage: 1, weight: 0.9,
    variants: [
      { who: '皇后王氏', issue: '无子', ask: '请为陛下纳妃' },
      { who: '贵妃李氏', issue: '专宠', ask: '请进皇贵妃' },
      { who: '淑妃陈氏', issue: '父兄求官', ask: '请以其兄为郡守' },
      { who: '皇后之父', issue: '干预六宫', ask: '请赐皇后金宝' },
      { who: '才人张氏', issue: '有孕', ask: '请封' }
    ],
    build(v) {
      return {
        title: v.who + v.issue,
        scene: v.who + v.issue + '，' + v.ask + '。这事本在内廷，可内廷的事从来没有只在内廷。'
          + '前朝的旧例摆在那里，照着办，谁也说不出什么；不照着办，也有人说得出什么。',
        options: [
          O('依请，厚加封赏', { clan: 8, authority: -3, treasury: -5, people: -2 },
            '册礼办得很体面，赏赐按旧例加倍。六宫安静了，前朝却有了话：有人说"外戚渐盛"，说这话的人第二天就被调去了礼部。'),
          O('不许，抑其请', { authority: 4, clan: -6, admin: 2, prestige: 1 },
            '你没有准。内廷冷了一阵，有人哭了半夜。第二日早朝，你的脸色不太好，没人敢问为什么。'),
          O('许其名，不予其实', { clan: 3, authority: 1, treasury: -2 },
            '封号给了，实权没有。这法子你用得很熟：面子给足，里子留住。'),
          O('命礼部议，照旧例行', { admin: 3, clan: 2, authority: -1, treasury: -3 },
            '礼部议了半个月，翻出三朝旧例，最后按"中制"办。谁也没得罪，谁也没满意。')
        ]
      }
    }
  }

  const HEIR = {
    id: 'heir', stage: 2, weight: 1.1,
    variants: [
      { who: '长子', age: 19, issue: '性柔弱，喜文墨', other: '次子' },
      { who: '次子', age: 17, issue: '有军功，为武将所拥', other: '长子' },
      { who: '幼子', age: 12, issue: '聪敏，然非嫡出', other: '长子' },
      { who: '养子', age: 20, issue: '先帝所养，恩义已深', other: '亲子' },
      { who: '侄子', age: 22, issue: '宗室所推，礼法有疑', other: '诸子' }
    ],
    build(v) {
      return {
        title: '储位',
        scene: '储位空悬已久。' + v.who + '今年' + v.age + '岁，' + v.issue + '。' + v.other + '那边也有人。'
          + '礼部上了三道请立储的折子，最后一道里写："国本不定，人心易摇。"',
        options: [
          O('立' + v.who + '为太子，昭告天下', { authority: 4, people: 5, clan: 3, admin: 2, scholar: -2 },
            '册立大典办了三日。' + v.who + '受册时手在抖，你看见了，没有说话。' + v.other + '称病没来，派了长史道贺。'),
          O('暂缓，待其年长', { authority: -3, clan: 2, admin: -2, people: -2 },
            '你说"再观数年"。这句话一出口，"数年"就变成了很多年。朝中开始有人押注，押注的人往往押错。'),
          O('立' + v.other + '，以安其心', { clan: 5, army: 3, people: 1, authority: -2, scholar: 2 },
            '你选了另一边。' + v.who + '接旨时很平静，只请求去守陵。你准了——守陵的人，是不能再回京的。'),
          O('使' + v.who + '监国，试其能', { admin: 4, authority: 2, people: 3, clan: -2 },
            v.who + '在监国的半年里办了十七件事，错了四件。你没有说什么，只把那四件的卷宗留在了案头。他后来再没犯过同样的错。')
        ]
      }
    }
  }

  const RELIGION = {
    id: 'religion', stage: 2, weight: 0.7,
    variants: [
      { what: '佛寺占田', detail: '天下僧尼三十万，寺产不纳赋', who: '祠部' },
      { what: '道士入宫', detail: '有道士自言能炼金丹，可延年', who: '内侍' },
      { what: '度牒泛滥', detail: '民避徭役者多削发为僧', who: '礼部' },
      { what: '迎佛骨', detail: '有请迎凤翔佛骨入京供养者', who: '功德使' },
      { what: '建道观', detail: '请于名山建观，以祈国祚', who: '道录司' }
    ],
    build(v) {
      return {
        title: v.what,
        scene: v.who + '奏：' + v.detail + '。这事关乎信仰，也关乎户口钱粮。'
          + (v.what === '道士入宫' ? '那位道士说，服他的丹，可延寿二十年。丹炉已经架在了后院。' : '朝中一半人说该禁，一半人说该崇。'),
        options: [
          O('禁之，沙汰僧道', { treasury: 9, people: -7, admin: 5, prestige: -4, scholar: 3 },
            '还俗的僧尼二十万，寺产没入官。国库丰了，民间的怨气也重了。有人在夜里往宫墙上贴了字条，写"灭佛者不祥"。'),
          O('崇之，拨帑兴建', { treasury: -10, people: 3, prestige: 5, admin: -3 },
            '工程用了三年。佛像贴金，用了黄金八百两。你觉得这是为天下祈福，户部觉得这是往水里扔钱。'),
          O('不禁不崇，著为令甲', { admin: 3, people: 1, treasury: 2, prestige: 1 },
            '定了规矩：寺有定额，僧有定数，超额者还俗。规矩立在那里，执行得马马虎虎，可总算有了个说法。'),
          O('亲受其法，以为国师', { prestige: 3, authority: 4, people: -5, scholar: -6, health: -3 },
            '你受了法，称"国师"。朝臣谏阻的折子堆了半人高。你确实觉得精神好了些——大约是心里觉得好了些。')
        ]
      }
    }
  }

  /* =====================================================================
   * 六、工役与器物
   * ===================================================================== */

  const BUILD = {
    id: 'build', stage: 1, weight: 0.9,
    variants: [
      { what: '修宫殿', where: '大兴宫', cost: 40, years: 4, why: '宫室敝旧，非所以示天下' },
      { what: '营陵寝', where: '万寿山', cost: 60, years: 8, why: '天子即位，当豫建山陵' },
      { what: '开运河', where: '通济渠', cost: 80, years: 6, why: '漕运迂回，岁费不赀' },
      { what: '筑长城', where: '雁门以北', cost: 55, years: 5, why: '边墙颓圮，不足以御虏' },
      { what: '修京师', where: '外城', cost: 35, years: 3, why: '民居侵街，都城无制' },
      { what: '建太学', where: '城南', cost: 12, years: 2, why: '养士之所，不可废' }
    ],
    build(v) {
      return {
        title: v.what,
        scene: '工部请' + v.what + '于' + v.where + '，费银' + v.cost + '万两，役夫十万，' + v.years + '年可成。'
          + '理由是' + v.why + '。工部尚书说，此事"利在千秋"；户部尚书没有说话，只是把账本往前推了推。',
        options: [
          O('准，发帑兴工', { treasury: -14, people: -8, prestige: 8, authority: 4, admin: -2 },
            '工程开了。第一年征夫十万，第二年跑了三万。' + v.years + '年后落成，你去看了一次，站在高处看了很久。这景象确实配得上一个王朝。'),
          O('减其制，分年而办', { treasury: -6, people: -3, prestige: 4, admin: 2 },
            '规制减了三分之一，分' + (v.years + 2) + '年办。户部松了口气，工部说"如此则不成体统"。落成之后，没有人看得出减在哪里。'),
          O('不许，以为劳民', { people: 6, prestige: -3, treasury: 4, admin: 2 },
            '你说"百姓方困，何忍重役"。工部的折子退回。这件事在史书上被记了一句"上惜民力"，' + v.where + '的旧屋又撑了二十年。'),
          O('加征工银，不役民夫', { treasury: -8, people: -4, admin: -2, prestige: 5 },
            '改用雇役，工钱从加派的银子里出。百姓不用离乡，但要多交一笔。这笔钱最后有没有到役夫手里，你没有查。')
        ]
      }
    }
  }

  const ENVOY = {
    id: 'envoy', stage: 2, weight: 0.7,
    variants: [
      { who: '北狄使者', ask: '请和亲', detail: '愿以公主妻其可汗，岁赐如旧' },
      { who: '西戎使者', ask: '请互市', detail: '愿以马三千易绢帛' },
      { who: '南海舶主', ask: '请入贡', detail: '献象牙、犀角，乞通市' },
      { who: '东夷使者', ask: '请封册', detail: '乞受册命，岁修职贡' },
      { who: '西域僧', ask: '请传法', detail: '自言自天竺来，携经六百卷' }
    ],
    build(v) {
      return {
        title: v.who + '入朝',
        scene: v.who + '至阙下，' + v.ask + '，' + v.detail + '。礼部引了旧例，说前朝有过先例，也有过拒绝的先例。'
          + '使者在鸿胪寺等了十二天，每天问一次"陛下何时召见"。',
        options: [
          O('召见，许其所请', { prestige: 4, treasury: -4, people: 2, clan: 2, army: -1 },
            '你在正殿召见了他。使者行了大礼，献上礼物。许其所请的诏书用金泥写成，他捧回去的时候，一路没有放手。'),
          O('召见，却其所请', { prestige: 3, authority: 3, army: 2, treasury: 1 },
            '你见了他，赐宴，赐帛，什么也没答应。使者走的时候脸色不好看，但礼数没缺。回去之后，他们的史书里写"中国天子，难测"。'),
          O('不见，命礼部代答', { authority: 1, prestige: -4, people: -1, admin: 2 },
            '礼部代答，说"天子万机，不暇"。使者在鸿胪寺又等了七天，最后自己走了。边关的奏报说，他们回去之后，秋掠比往年早了一个月。'),
          O('留其使，以观其国', { authority: 3, prestige: -2, army: 1, scholar: 1 },
            '使者被留在了京师，赐宅、赐仆，日子过得不错，就是不能走。三年后他病死在这里，葬在了城外，坟头朝西。')
        ]
      }
    }
  }

  const VASSAL = {
    id: 'vassal', stage: 2, weight: 1,
    variants: [
      { who: '淮南王', n: 3, act: '私蓄甲士', note: '先帝同母弟，年最长' },
      { who: '蜀王', n: 5, act: '截留赋税，不奉诏', note: '据险而富，有兵五万' },
      { who: '晋王', n: 2, act: '交通朝臣，广布耳目', note: '素有贤名，朝野多附' },
      { who: '楚王', n: 4, act: '私铸钱，擅杀属官', note: '母族势大，太后所爱' },
      { who: '齐王', n: 3, act: '称病不朝，练兵于封内', note: '曾与你有旧怨' },
      { who: '湘王', n: 2, act: '收纳亡命，私通外邦', note: '封地近边，与虏有市' }
    ],
    build(v) {
      return {
        title: v.who,
        scene: '密奏：' + v.who + v.act + '，' + v.n + '州之地，赋税不入。' + v.note + '。'
          + '按祖制，藩王不典兵、不预政。可祖制是太祖定的，太祖当年也是从藩王起兵的。',
        options: [
          O('下诏削藩，收其兵权', { authority: 8, clan: -12, army: 3, people: -3, prestige: 3 },
            '削藩的诏书送到，' + v.who + '接了。他交出了兵符，跪在使臣面前说"臣无罪"。三个月后，他在流放途中"病卒"。'),
          O('召其入京，徐图之', { authority: 4, clan: -4, admin: 2, prestige: 1 },
            v.who + '奉诏入京，住在旧邸，不得归藩。他在京里住了十一年，最后老死在这里，再没见过自己的封地。'),
          O('赐书慰之，不问其事', { clan: 8, authority: -6, people: 1, prestige: -2 },
            '你写了一封长信，说"兄弟之间，何至于此"。他回信谢恩，言辞极恭。此后的赋税，还是不缴。'),
          O('推恩分其国，众建诸侯', { authority: 6, admin: 4, clan: -6, people: 3, treasury: -2 },
            '把他的封地分给了三个儿子。三份都比原来小，谁也不服谁。' + v.who + '气得病了半年，可他没有理由反。')
        ]
      }
    }
  }

  const HEIR_REBEL = {
    id: 'heir_rebel', stage: 4, weight: 0.7,
    variants: [
      { who: '太子', how: '矫诏发兵，据东宫', why: '恐为弟所构' },
      { who: '皇子雍王', how: '私通边将，约以清君侧', why: '久不得立，心不自安' },
      { who: '太子', how: '结纳禁军，谋以兵谏', why: '谏阻宫室之役，为左右所谮' }
    ],
    build(v) {
      return {
        title: v.who + '之变',
        scene: v.who + v.how + '。' + v.why + '。消息是午夜送进来的，送信的人跪在阶下，'
          + '浑身是土。你披衣坐起来，第一句话问的是"他身边有多少人"，第二句才是"他母亲知道吗"。',
        options: [
          O('亲往谕之，父子相见', { authority: -4, health: -4, people: 5, prestige: 4, clan: 3 },
            '你没有带兵，只带了两个内侍，去了东宫。' + v.who + '跪在阶下，一句话说不出。你们谈了半个时辰，他缴了兵符。'),
          O('发兵围之，废为庶人', { authority: 6, clan: -8, people: -4, prestige: -3, army: 2 },
            '禁军围了东宫。天亮时门开了，' + v.who + '自己走出来，穿着太子的朝服，很整齐。他被废为庶人，迁居别宫，两年后死了。'),
          O('秘不发丧，先安众心', { authority: 3, admin: 3, people: 2, prestige: 2 },
            '你封锁了消息，照常临朝。三天后事情平了，史书上写的是"宫中有小变，寻定"。没有几个人知道那一夜发生了什么。'),
          O('命其自尽，另立诸子', { authority: 7, clan: -10, people: -6, health: -5, prestige: -6 },
            '使者带去了白绫和鸩酒，他选了前者。你三天没有上朝。第四天临朝时，群臣看见你的头发白了一片。')
        ]
      }
    }
  }

  /* =====================================================================
   * 展开
   * ===================================================================== */

  const FAMILIES = [
    FLOOD, DROUGHT, PLAGUE, OMEN,
    BORDER, ARMY_SYSTEM, REVOLT, PLOT,
    MINISTER, EUNUCH, KIN, CORRUPT, EXAM, RITUAL, HISTORY, OLDMAN,
    TAX, LAND, SALT, CURRENCY, TRADE, BANDIT,
    HAREM, HEIR, RELIGION, BUILD, ENVOY, VASSAL, HEIR_REBEL
  ]

  FAMILIES.forEach(fam => {
    fam.variants.forEach((v, i) => {
      let t
      try {
        t = fam.build(v, i)
      } catch (e) {
        console.warn('family build error', fam.id, i, e)
        return
      }
      const ev = Object.assign({
        id: fam.id + '_' + i,
        stage: fam.stage,
        family: fam.id,
        weight: fam.weight || 1,
        vars: v
      }, t)
      EVENTS.push(ev)
    })
  })

  return EVENTS
})
