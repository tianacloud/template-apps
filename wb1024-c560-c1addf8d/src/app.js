
(function(){
  'use strict';

  /* =========================================================
     词表：《新版PET备考主题词汇表（带音标）》
     [{n:主题, e:emoji, w:[[英文, 音标, 中文], ...]}]
     ========================================================= */
  var RAW = [{"n":"服装和配饰","e":"👕","w":[["backpack","ˈbækpæk","背包"],["bag","bæɡ","包"],["belt","belt","腰带"],["blouse","blaʊz","女士衬衫"],["boot","buːt","靴子"],["bracelet","ˈbreɪslət","手镯"],["button","ˈbʌtən","纽扣"],["cap","kæp","帽子"],["chain","tʃeɪn","链条"],["clothes","kləʊðz","衣服"],["coat","koʊt","外套"],["collar","ˈkɒlər","衣领"],["cotton","ˈkɒtən","棉"],["dress","dres","连衣裙"],["earring","ˈɪərɪŋ","耳环"],["fashion","ˈfæʃən","时尚"],["fasten","ˈfæsən","系紧"],["fit","fɪt","适合；健康的"],["fold","foʊld","折叠"],["glasses","ˈɡlæsɪz","眼镜"],["glove","ɡlʌv","手套"],["go","","搭配"],["get dressed","","穿衣"],["handbag","ˈhændbæɡ","手提包"],["handkerchief","ˈhæŋkərtʃɪf","手帕"],["hat","hæt","帽子"],["jacket","ˈdʒækɪt","夹克"],["jeans","dʒiːnz","牛仔裤"],["jewellery","ˈdʒuːələri","珠宝"],["jumper","ˈdʒʌmpər","套头毛衣"],["kit","kɪt","装备"],["knit","nɪt","编织"],["label","ˈleɪbl","标签"],["laundry","ˈlɔːndri","洗衣"],["leather","ˈlɛðər","皮革"],["make-up","ˈmeɪk ʌp","化妆品"],["match","mætʃ","比赛；相配；火柴"],["material","məˈtɪəriəl","材料"],["necklace","ˈnɛkləs","项链"],["old-fashioned","ˌoʊld ˈfæʃənd","过时的"],["pants","pænts","裤子"],["pattern","ˈpætərn","图案"],["perfume","pərˈfjuːm","香水"],["plastic","ˈplæstɪk","塑料"],["pocket","ˈpɒkɪt","口袋"],["pullover","ˈpʊloʊvər","套头衫"],["purse","pɜːrs","钱包"],["put on","ˈpʊt ɒn","穿上"],["raincoat","ˈreɪnkoʊt","雨衣"],["ring","rɪŋ","戒指；响铃"],["scarf","skɑːrf","围巾"],["shirt","ʃɜːrt","衬衫"],["shoe","ʃuː","鞋子"],["shorts","ʃɔːrts","短裤"],["silk","sɪlk","丝绸"],["size","saɪz","尺寸；大小"],["skirt","skɜːrt","裙子"],["sleeveless","ˈsliːvləs","无袖的"],["socks","sɒks","袜子"],["stripe","straɪp","条纹"],["suit","suːt","套装；适合"],["sunglasses","ˈsʌnɡlæsɪz","太阳镜"],["sweater","ˈswɛtər","毛衣"],["sweatshirt","ˈswɛtʃɜːrt","运动衫"],["swimming costume","ˈswɪmɪŋ ˈkɒstuːm","泳衣"],["take off","ˈteɪk ɒf","脱下"],["tie","taɪ","领带；系"],["tights","taɪts","紧身裤"],["tracksuit","ˈtræksuːt","运动服"],["trainers","ˈtreɪnərz","运动鞋"],["trousers","ˈtraʊzərz","裤子"],["T-shirt","ˈtiː ʃɜːrt","T恤"],["sandal","ˈsændl","凉鞋"],["swimsuit","ˈswɪmsuːt","泳装"],["umbrella","ʌmˈbrelə","雨伞"],["underpants","ˈʌndərpænts","内裤"],["underwear","ˈʌndərwɛər","内衣"],["undress","ʌnˈdres","脱衣服"],["uniform","ˈjuːnɪfɔːrm","制服"],["wallet","ˈwɒlɪt","钱包"],["watch","wɒtʃ","手表"],["wear","wɛər","穿；磨损"],["wool","wʊl","羊毛"]]},{"n":"颜色","e":"🎨","w":[["black","blæk","黑色"],["blue","bluː","蓝色"],["brown","braʊn","棕色"],["darkdark","dɑːrk","黑暗的"],["gold","ɡoʊld","金色"],["golden","ˈɡoʊldən","金黄色"],["green","ɡriːn","绿色"],["grey","ɡreɪ","灰色"],["gray","ɡreɪ","灰色"],["light","laɪt","光；轻的"],["orange","ˈɔːrɪndʒ","橙色"],["pale","peɪl","苍白的"],["pink","pɪŋk","粉红色"],["purple","ˈpɜːrpl","紫色"],["red","red","红色"],["silver","ˈsɪlvər","银色"],["white","waɪt","白色"],["yellow","ˈjeloʊ","黄色"]]},{"n":"通信与技术","e":"📱","w":[["access","ˈæksɛs","访问"],["address","əˈdrɛs","地址"],["app","æp","应用程序"],["at","æt","在"],["blog","blɒɡ","博客"],["blogger","ˈblɒɡər","博客作者"],["by post","baɪ poʊst","通过邮寄"],["calculator","ˈkalkjuleɪtər","计算器"],["call","kɔːl","打电话"],["call back","kɔːl bæk","回拨"],["CD","siːˈdiː ˈpleɪər","光盘（播放器）"],["cell phone","sɛl foʊn","手机"],["chat","tʃæt","聊天"],["chat room","tʃæt ruːm","聊天室"],["click","klɪk","点击"],["computer","kəmˈpjuːtər","计算机"],["connect","kəˈnɛkt","连接"],["connection","kəˈnɛkʃən","连接"],["data","ˈdeɪtə","数据"],["delete","dɪˈliːt","删除"],["dial","ˈdaɪəl","拨号"],["dial up","ˈdaɪəl ʌp","拨号上网"],["digital","ˈdɪdʒɪtl","数字的"],["digital camera","ˈdɪdʒɪtl ˈkæmərə","数字相机"],["disc/disk","dɪsk","磁盘"],["dot","dɒt","点"],["download","ˈdaʊnloʊd","下载"],["drag","dræɡ","拖动"],["DVD","ˌiːviːˈdiː ˈpleɪər","数字视频光盘（播放 器）"],["electronics","ɪˌlɛkˈtrɒnɪk","电子的"],["email","ˈiːmeɪl","电子邮件"],["engaged","ɪnˈɡeɪdʒd","忙碌的"],["enter","ˈɛntər","输入"],["envelope","ˈɛnvɪloʊp","信封"],["equipment","ɪˈkwɪpmənt","设备"],["fax","fæks","传真"],["file","faɪl","文件；档案"],["hang up","hæŋ ʌp","挂断"],["hardware","ˈhɑːrdwɛər","硬件"],["headline","ˈhɛdˌlaɪn","标题"],["homepage","ˈhoʊmˌpeɪdʒ","主页"],["install","ɪnˈstɔːl","安装"],["internet","ˈɪntərnɛt","互联网"],["invent","ɪnˈvɛnt","发明"],["invention","ɪnˈvɛnʃən","发明"],["IT","ɪt","信息技术"],["keyboard","ˈkiːboːrd","键盘"],["laptop","ˈlæptoʊp kəmˈpjuːtər","笔记本 电脑"],["machine","məˈʃiːn","机器"],["message","ˈmɛsɪdʒ","消息"],["mobile phone","ˈmoʊbaɪl foʊn","移动电话"],["mouse","maʊs","鼠标"],["mouse mat","maʊs mæt","鼠标垫"],["MP3 player","ˌɛmˌpiːˈiːˈθriː ˈpleɪər","MP3播放器"],["net","nɛt","网络"],["online","ˈɒnˌlaɪn","在线的"],["operator","ˈɒpəreɪtər","操作员"],["parcel","ˈpɑːrsl","包裹"],["password","ˈpæsˌwɜːrd","密码"],["PC","ˌpiːˈsiː","个人电脑"],["phone","foʊn","电话"],["photograph","ˈfoʊtəɡræf","照片"],["photography","fəˈtɒɡrəfi","摄影"],["podcast","ˈpoʊdkæst","播客"],["postcard","ˈpoʊstkɑːrd","明信片"],["print","prɪnt","打印"],["printer","ˈpraɪntər","打印机"],["programme","ˈproʊɡræm","程序"],["reply","rɪˈplaɪ","回复"],["ring","rɪŋ","戒指；响铃"],["ring up","rɪŋ ʌp","打电话"],["robot","ˈroʊbɒt","机器人"],["screen","skriːn","屏幕"],["server","ˈsɜːrvər","服务器"],["sign up","saɪn ʌp","注册"],["smartphone","ˈsmɑːrtfoʊn","智能手机"],["social media","ˈsoʊʃəl ˈmiːdiə","社交媒体"],["software","ˈsoʊftwɛər","软件"],["switch off","swɪtʃ ɔːf","关闭"],["switch on","swɪtʃ ɒn","打开"],["talk","tɔːk","谈话；演讲"],["telephone","ˈtɛlɪfoʊn","电话"],["text","tɛkst","文本"],["text message","tɛkst ˈmɛsɪdʒ","短信"],["turn off","tɜːrn ɔːf","关闭"],["turn on","tɜːrn ɒn","打开"],["upload","ˈʌpˌloʊd","上传"],["video clip","ˈviːdioʊ klɪp","视频剪辑"],["volume","ˈvɒljuːm","音量"],["web","wɛb","网络"],["webcam","ˈwɛbˌkæm","网络摄像头"],["web page","wɛb peɪdʒ","网页"],["website","ˈwɛbˌsaɪt","网站"]]},{"n":"教育","e":"🏫","w":[["absent","ˈæbsənt","缺席的"],["advanced","ədˈvænst","高级的"],["arithmetic","əˈrɪθmɪtɪk","算术"],["art","ɑːrt","艺术"],["beginner","bɪˈɡɪnər","初学者"],["bell","bɛl","铃声"],["biology","baɪˈɒlədʒi","生物学"],["blackboard","ˈblækbɔːrd","黑板"],["board","bɔːrd","板"],["book","bʊk","书；预订"],["bookshelf","ˈbʊkʃɛlf","书架"],["breaktime","breɪk","休息时间"],["break up","ˈbreɪk ʌp","分解"],["certificate","sərˈtɪfɪkət","证书"],["chemistry","ˈkɛmɪstri","化学"],["class","klæs","班级；课"],["classroom","ˈklæsruːm","教室"],["clever","ˈklɛvər","聪明的"],["coach","koʊtʃ","教练；长途客车"],["college","ˈkɒlɪdʒ","学院"],["composition","ˌkɒmpəˈzɪʃən","作文"],["course","kɔːrs","课程"],["curriculum","kəˈrɪkjələm","课程"],["degree","dɪˈɡriː","学位"],["desk","dɛsk","桌子"],["dictionary","ˈdɪkʃənəri","字典"],["diploma","dɪˈploʊmə","文凭"],["drama","ˈdrɑːmə","戏剧"],["economics","ˌiːkəˈnɒmɪks","经济学"],["elementary","ˌɛlɪˈmɛntəri","初级的"],["essay","ˈɛseɪ","论文"],["geography","dʒiˈɒɡrəfi","地理"],["history","ˈhɪstri","历史"],["handwriting","ˈhændraɪtɪŋ","书法"],["homework","ˈhoʊmˌwɜːrk","家庭作业"],["information","ˌɪnfərˈmeɪʃən","信息"],["instructions","ɪnˈstrʌkʃənz","指示"],["instructor","ɪnˈstrʌktər","教师"],["intermediate","ˌɪntərˈmiːdiət","中级的"],["IT","ɪt","信息技术"],["know","noʊ","知道"],["laboratory","ˈlæbrəˌtɔːri","实验室"],["language","ˈlæŋɡwɪdʒ","语言"],["learn","lɜːrn","学习"],["lesson","ˈlɛsən","课"],["level","ˈlɛvəl","水平"],["library","ˈlaɪbrəri","图书馆"],["mark","mɑːrk","标记；分数"],["mathematics","ˌmæθəˈmætɪks","数学"],["maths","mæθ","数学"],["music","ˈmjuːzɪk","音乐"],["nature studies","ˈneɪtʃər ˈstʌdiz","自然研究"],["note","noʊt","笔记；注意"],["notice board","ˈnoʊtɪs bɔːrd","公告板"],["pencil case","ˈpɛnsl keɪs","铅笔盒"],["photography","fəˈtɒɡrəfi","摄影"],["physics","ˈfaɪzɪks","物理"],["practice","ˈpræktɪs","练习；惯例"],["practise","ˈpræktɪs","练习"],["primary school","ˈpraɪməri skuːl","小学"],["project","ˈproʊdʒɛkt","项目"],["pupil","ˈpjuːpɪl","学生"],["qualification","ˌkwɒlɪfɪˈkeɪʃən","资格"],["read","riːd","阅读"],["register","ˈrɛdʒɪstər","注册"],["remember","rɪˈmɛmbər","记住"],["research","rɪˈsɜːrtʃ","研究"],["rubber","ˈrʌbər","橡皮"],["ruler","ˈruːlər","尺子"],["school","skuːl","学校"],["science","ˈsaɪəns","科学"],["secondary school","ˈsekənderi skuːl","中学"],["student","ˈstuːdənt","学生"],["studies","ˈstʌdiz","学习"],["study","ˈstʌdi","学习；书房"],["subject","ˈsʌbdʒɪkt","科目；主题"],["teach","tiːtʃ","教；教导"],["teacher","ˈtiːtʃər","教师"],["technology","tɛkˈnɒlədʒi","技术"],["term","tɜːrm","学期；术语"],["test","tɛst","测试；检验"],["university","ˌjuːnɪˈvɜːrsɪti","大学"]]},{"n":"娱乐与媒体","e":"🎬","w":[["act","ækt","表演"],["action","ˈækʃən","动作"],["actor","ˈæktər","演员"],["actress","ˈæktrəs","女演员"],["ad","æd","广告"],["admission","ədˈmɪʃən","入场"],["adventure","ədˈvɛnʧər","冒险"],["advert","ˈædvɜːrt","广告"],["advertisement","ədˈvɜːrtɪsmənt","广告"],["app","æp","应用程序"],["art","ɑːrt","艺术"],["article","ˈɑːrtɪkəl","文章"],["audience","ˈɔːdiəns","观众"],["ballet","ˈbæleɪ","芭蕾舞"],["band","bænd","乐队"],["bestseller","ˈbɛstˌsɛlər","畅销书"],["board game","bɔːrd ɡeɪm","棋盘游戏"],["book","bʊk","书；预订"],["camera","ˈkæmərə","相机"],["card","kɑːrd","卡片"],["cartoon","kɑːrˈtuːn","卡通"],["celebrity","səˈlɛbrɪti","名人"],["CD","siːˈdiː ˈpleɪər","光盘（播放器）"],["channel","ˈtʃænəl","频道"],["chat show","tʃæt ʃoʊ","访谈节目"],["chess","tʃɛs","国际象棋"],["cinema","ˈsɪnɪmə","电影院"],["circus","ˈsɜːrkəs","马戏团"],["classical music","ˈklæsɪkəl ˈmjuːzɪk","古典音乐"],["comedy","ˈkɒmədi","喜剧"],["comic","ˈkɒmɪk","漫画"],["competition","ˌkɒmpɪˈtɪʃən","比赛"],["concert","ˈkɒnsərt","音乐会"],["dance","dæns","舞蹈"],["dancer","ˈdænsər","舞者"],["disc","dɪsk","光盘"],["disk","dɪsk","磁盘"],["disco","ˈdɪskoʊ","迪斯科"],["display","dɪˈspleɪ","展示"],["DJ","ˈdiːˈdʒeɪ","唱片骑师"],["disc jockey","ˈdɪsk ˈdʒɒki","唱片骑师"],["documentary","ˌdɒkjʊˈmɛntəri","纪录片"],["drama","ˈdraːmə","戏剧"],["draw","drɔː","绘画"],["drawing","ˈdrɔːɪŋ","图画"],["DVD","ˌiːviːˈdiː ˈpleɪər","数字视频光盘（播放 器）"],["entrance","ˈɛntrəns","入口"],["exhibition","ˌɛksɪˈbɪʃən","展览"],["exit","ˈɛɡzɪt","出口"],["festival","ˈfɛstɪvəl","节日"],["film","fɪlm","电影"],["film maker","ˈfɪlm ˈmeɪkər","电影制作人"],["film star","ˈfɪlm stɑːr","电影明星"],["fireworks","ˈfaɪərwɜːrks","烟火"],["folk music","foʊk ˈmjuːzɪk","民间音乐"],["fun","fʌn","乐趣"],["go out","ɡoʊ aʊt","外出"],["group","ɡruːp","团体"],["guitar","ɡɪˈtɑːr","吉他"],["guitarist","ɡɪˈtɑːrɪst","吉他手"],["headline","ˈhɛdˌlaɪn","标题"],["headphones","ˈhɛdfəʊnz","耳机"],["hero","ˈhiːroʊ","英雄"],["heroine","ˈhɛroʊɪn","女英雄"],["hip hop","ˈhɪp hɒp","嘻哈"],["hit song","hɪt sɒŋ","热门歌曲"],["horror","ˈhɒrər","恐怖"],["instrument","ˈɪnstrʊmənt","乐器"],["interval","ˈɪntərvəl","间隔"],["interviewer","ˈɪntərvjuːər","采访者"],["jazz music","dʒæz ˈmjuːzɪk","爵士乐"],["journalist","ˈdʒɜːrnəˌlɪst","记者"],["keyboard","ˈkiːbɔːrd","键盘"],["laugh","læf","笑"],["listen to","ˈlɪsən tu","听"],["look at","lʊk æt","看"],["magazine","ˌmæɡəˈziːn","杂志"],["magic","ˈmædʒɪk","魔术"],["MP3 player","ˌɛmˌpiːˈiːˈθriː ˈpleɪər","MP3播放器"],["museum","mjuˈziːəm","博物馆"],["music","ˈmjuːzɪk","音乐"],["musician","mjuˈzɪʃən","音乐家"],["news","njuːz","新闻"],["newspaper","ˈnjuːzˌpeɪpər","报纸"],["opera","ˈɒpərə","歌剧"],["orchestra","ˈɔːrkɪstrə","管弦乐队"],["paint","peɪnt","绘画"],["painter","ˈpeɪntər","画家"],["perform","pərˈfɔːrm","表演"],["performance","pərˈfɔːrməns","表演"],["performer","pərˈfɔːrmər","表演者"],["play","pleɪ","戏剧"],["podcast","ˈpoʊdkæst","播客"],["poem","ˈpoʊəm","诗歌"],["pop music","pɒp ˈmjuːzɪk","流行音乐"],["presenter","prɪˈzɛntər","主持人"],["production","prəˈdʌkʃən","制作"],["programme","ˈproʊɡræm","节目"],["quiz","kwɪz","测验"],["recording","rɪˈkɔːrdɪŋ","录音"],["review","rɪˈvjuː","评论"],["rock music","rɒk ˈmjuːzɪk","摇滚乐"],["romantic","roʊˈmæntɪk","浪漫的"],["row","roʊ","一排；划船"],["scene","siːn","场景；现场"],["selfie","ˈsɛlfi","自拍照"],["series","ˈsɪəriːz","系列"],["soap opera","soʊp ˈɒpərə","肥皂剧"],["soundtrack","ˈsaʊndtræk","电影原声带"],["stage","steɪdʒ","舞台；阶段"],["star","stɑːr","星星；明星"],["studio","ˈstuːdioʊ","工作室"],["talk show","tɔːk ʃoʊ","脱口秀"],["television","ˈtɛlɪvɪʒən","电视"],["thriller","ˈθrɪlər","惊悚片"],["video","ˈviːdioʊ","视频"]]},{"n":"环境","e":"🌍","w":[["bottle bank","ˈbɒtəl bæŋk","瓶子回收站"],["climate change","ˈklaɪmɪt ʃeɪndʒ","气候变化"],["gas","ɡæs","气体"],["litter","ˈlɪtər","垃圾"],["petrol","ˈpɛtrəl","汽油"],["pollution","pəˈluːʃən","污染"],["prohibited","prəʊˈhɪbɪtɪd","禁止的"],["public transport","ˈpʌblɪk ˈtrænspɔːrt","公共交通"],["recycle","riːˈsaɪkəl","回收"],["recycled","riːˈsaɪkld","已回收的"],["recycling","riːˈsaɪklɪŋ","回收利用"],["rubbish","ˈrʌbɪʃ","垃圾（桶）"],["traffic","ˈtræfɪk","交通；车流"],["volunteer","ˌvɒlənˈtɪər","志愿者"]]},{"n":"食物与饮料","e":"🍔","w":[["apple","ˈæp.əl","苹果"],["bake","beɪk","烘焙"],["banana","bəˈnæn.ə","香蕉"],["barbecue","ˈbɑːr.bɪ.kjuː","烧烤"],["bean","biːn","豆"],["biscuit","ˈbɪs.kɪt","饼干"],["bitter","ˈbɪt.ər","苦的"],["boil","bɔɪl","煮沸"],["boiled","bɔɪld","煮熟的"],["bottle","ˈbɒt.əl","瓶子"],["bowl","boʊl","碗"],["box","bɒks","盒子"],["bread","bred","面包"],["breakfast","ˈbrek.fəst","早餐"],["broccoli","ˈbrɒk.ə.li","西兰花"],["bunch","bʌntʃ","一串"],["burger","ˈbɜːr.ɡər","汉堡"],["butter","ˈbʌt.ər","黄油"],["cabbage","ˈkæb.ɪdʒ","卷心菜"],["café","kæˈfeɪ","咖啡馆"],["cafeteria","kæˈfɪəˌtər.i.ə","自助餐厅"],["cake","keɪk","蛋糕"],["can","kæn","罐头"],["candy","ˈkæn.di","糖果"],["canteen","kænˈtiːn","食堂"],["carrot","ˈkæːr.ət","胡萝卜"],["cereal","ˈsɪər.i.əl","谷物"],["cheese","tʃiːz","奶酪"],["chef","ʃef","厨师"],["chicken","ˈtʃik.ən","鸡肉"],["chilli","ˈtʃɪl.i","辣椒"],["chips","tʃɪps","薯条"],["chocolate","ˈtʃɒk.lət","巧克力"],["coconut","ˈkoʊ.koʊ.nʌt","椰子"],["coffee","ˈkoʊ.fee","咖啡"],["cola","ˈkoʊ.lə","可乐"],["cook","kʊk","烹饪"],["cooker","ˈkʊk.ər","炊具"],["cookie","ˈkʊk.i","饼干"],["corn","kɔːrn","玉米"],["cream","kriːm","奶油"],["cucumber","ˈkjuː.kʌm.bər","黄瓜"],["cup","kʌp","杯子"],["curry","ˈkʌr.i","咖喱"],["cut","kʌt","切割"],["delicious","dɪˈlɪʃ.əs","美味的"],["dessert","dɪˈzɜːrt","甜点"],["diet","ˈdaɪ.ət","饮食"],["dinner","ˈdɪn.ər","晚餐"],["dish","dɪʃ","菜肴"],["drink","drɪŋk","饮料"],["duck","dʌk","鸭肉"],["eat","iːt","吃"],["egg","eɡ","鸡蛋"],["fish","fɪʃ","鱼"],["flavour","ˈfleɪ.vər","味道"],["flour","ˈflaʊ.ər","面粉"],["food","fuːd","食物"],["fork","fɔːrk","叉子"],["French fries","frentʃ fraɪz","炸薯条"],["fresh","freʃ","新鲜的"],["fridge","frɪdʒ","冰箱"],["fried","fraɪd","油炸的"],["fruit","fruːt","水果"],["fruit juice","fruːt dʒuːs","果汁"],["fry","fraɪ","油炸"],["frying pan","ˈfraɪ.ɪŋ pæn","煎锅"],["garlic","ˈɡɑːr.lɪk","大蒜"],["glass","ɡlæs","玻璃杯；玻璃"],["grape","ɡreɪp","葡萄"],["grill","ɡrɪl","烤架"],["grilled","ɡrɪld","烤的"],["herbs","hɜːrbs","香草"],["honey","ˈhʌn.i","蜂蜜"],["hot","hɒt","热的"],["hungry","ˈhʌŋ.ɡri","饥饿的"],["ice","aɪs","冰"],["ice cream","ˈaɪs kriːm","冰淇淋"],["ingredients","ɪnˈɡriː.di.ənts","原料"],["jam","dʒæm","果酱"],["jug","dʒʌɡ","壶"],["juice","dʒuːs","果汁"],["kitchen","ˈkɪtʃ.ən","厨房"],["knife","naɪf","刀"],["lamb","læm","羊肉"],["lemon","ˈlem.ən","柠檬"],["lemonade","ˈlem.ə.naɪd","柠檬水"],["lettuce","ˈlet.əs","生菜"],["lunch","lʌntʃ","午餐"],["main course","meɪn kɔːrs","主菜"],["meal","miːl","餐"],["meat","miːt","肉"],["melon","ˈmel.ən","甜瓜"],["menu","ˈmen.juː","菜单"],["microwave","ˈmaɪ.kroʊ.weɪv","微波炉"],["milk","mɪlk","牛奶"],["mineral water","ˈmɪn.ər.əl ˈwɔː.tər","矿泉水"],["mushroom","ˈmʌʃ.rum","蘑菇"],["oil","ɔɪl","油"],["omelette","ˈɒm.lɪt","煎蛋卷"],["onion","ˈʌn.jən","洋葱"],["orange","ˈɔːr.ɪndʒ","橙"],["pan","pæn","平底锅"],["pasta","ˈpæs.tə","意大利面"],["pea","piː","豌豆"],["peach","piːtʃ","桃"],["peanut","ˈpiː.nʌt","花生"],["pear","per","梨"],["pepper","ˈpep.ər","胡椒"],["picnic","ˈpɪk.nɪk","野餐"],["pie","paɪ","派"],["piece of cake","piːs əv keɪk","一块蛋糕"],["pineapple","ˈpaɪnˌæp.əl","菠萝"],["pizza","ˈpiːt.sə","披萨"],["plate","pleɪt","盘子；车牌"],["potato","pəˈteɪ.toʊ","土豆"],["recipe","ˈres.ə.pi","食谱"],["refreshments","rɪˈfreʃ.mənts","点心"],["rice","raɪs","米饭"],["roast","roʊst","烤"],["roll","roʊl","卷；滚动"],["salad","ˈsæl.əd","沙拉"],["salmon","ˈsæm.ən","鲑鱼"],["salt","sɔːlt","盐"],["sandwich","ˈsæn.wɪtʃ","三明治"],["sauce","sɔːs","酱"],["sausage","ˈsɒs.ɪdʒ","香肠"],["slice","slaɪs","切片"],["snack","snæk","小吃"],["soft drink","sɒft drɪŋk","软饮料"],["soup","suːp","汤"],["sour","saʊər","酸的"],["spicy","ˈspaɪ.si","辣的"],["spinach","ˈspɪn.ɪtʃ","菠菜"],["spoon","spuːn","勺子"],["steak","steɪk","牛排"],["strawberry","ˈstrɔː.ber.i","草莓"],["sugar","ˈʃʊɡ.ər","糖"],["sweet","swiːt","甜的；糖果"],["takeaway","ˈteɪ.kə.weɪ","外卖"],["taste","teɪst","味道；品尝"],["tasty","ˈteɪ.sti","美味的"],["tea","tiː","茶"],["thirsty","ˈθɜːr.sti","口渴的"],["toast","toʊst","吐司"],["tomato","təˈmeɪ.toʊ","番茄"],["tuna","ˈtuː.nə","金枪鱼"],["turkey","ˈtɜːr.ki","火鸡"],["vegetable","ˈvedʒ.tə.bəl","蔬菜"],["vegetarian","ˌvedʒ.ɪˈteər.i.ən","素食者"],["waiter","ˈweɪ.tər","服务员"],["waitress","ˈweɪ.trəs","女服务员"],["wash up","wɒʃ ʌp","清洗"],["yoghurt","ˈjoʊ.ɡərt","酸奶"]]},{"n":"健康、医学及锻炼","e":"💪","w":[["accident","ˈæk.sɪ.dənt","事故"],["ache","eɪk","疼痛"],["ambulance","ˈæm.bjʊ.ləns","救护车"],["ankle","ˈæŋ.kəl","脚踝"],["appointment","əˈpɔɪn.tmənt","预约"],["arm","ɑːrm","手臂"],["aspirin","ˈæs.pər.ɪn","阿司匹林"],["baby","ˈbeɪ.bi","婴儿"],["bandage","ˈbæn.dədʒ","绷带"],["bleed","bliːd","流血"],["blood","blʌd","血液"],["body","ˈbɒd.i","身体"],["bone","boʊn","骨头"],["brain","breɪn","大脑"],["break","breɪk","打破；休息"],["breath","breθ","呼吸"],["breathe","briːð","呼吸"],["check","tʃek","检查"],["chemist","ˈkem.ɪst","药剂师"],["chin","tʃɪn","下巴"],["clean","kliːn","清洁"],["cold","koʊld","感冒"],["comb","koʊm","梳子"],["cough","kɔːf","咳嗽"],["cut","kʌt","切割"],["damage","ˈdæm.ɪdʒ","损伤"],["danger","ˈdeɪn.dʒər","危险"],["dangerous","ˈdeɪn.dʒər.əs","危险的"],["dead","ded","死亡的"],["dentist","ˈden.tɪst","牙医"],["die","daɪ","死亡"],["diet","ˈdaɪ.ət","饮食"],["doctor","ˈdɒk.tər","医生"],["ear","ɪər","耳朵"],["earache","ˈɪər.eɪk","耳痛"],["emergency","ɪˈmɜːr.dʒən.si","紧急情况"],["exercise","ˈek.sər.kaɪz","锻炼"],["eye","aɪ","眼睛"],["face","feɪs","脸；面对"],["fall","fɔːl","落下；秋天"],["feel","fiːl","感觉"],["better","ˈbet.ər","好转"],["ill","ɪl","生病"],["sick","sɪk","生病"],["fever","ˈfiː.vər","发烧"],["finger","ˈfɪŋ.ɡər","手指"],["fit","fɪt","适合；健康的"],["flu","fluː","流感"],["foot","fʊt","脚"],["get better","ɡet ˈbet.ər","好转"],["get worse","ɡet wɜːrs","恶化"],["go jogging","ɡoʊ ˈdʒɑː.ɡɪŋ","慢跑"],["gym","dʒɪm","健身房"],["gymnastics","dʒɪmˈnæs.tɪks","体操"],["hair","her","头发"],["hand","hænd","手"],["head","hed","头；负责人"],["headache","ˈhed.eɪk","头痛"],["health","helθ","健康"],["hear","hɪər","听见"],["heart","hɑːrt","心脏"],["heel","hiːl","脚跟"],["hospital","ˈhɒs.pɪ.təl","医院"],["hurt","hɜːrt","受伤"],["illness","ˈɪl.nəs","疾病"],["injure","ˈɪn.dʒər","伤害"],["keep fit","kiːp fɪt","保持健康"],["knee","niː","膝盖"],["leg","leɡ","腿"],["lie down","laɪ daʊn","躺下"],["medicine","ˈmed.ɪ.sɪn","药物"],["nose","noʊz","鼻子"],["nurse","nɜːrs","护士"],["operate","ˈɒp.ər.eɪt","手术"],["operation","ˌɒp.ərˈeɪ.ʃən","手术"],["pain","peɪn","疼痛"],["painful","ˈpeɪf.əɫ","痛苦的"],["patient","ˈpeɪ.ʃənt","病人"],["pharmacy","ˈfɑːr.mə.si","药房"],["pill","pɪl","药丸"],["prescription","prɪˈskrɪp.ʃən","处方"],["problem","ˈproʊ.bləm","问题"],["recover","rɪˈkʌv.ər","恢复"],["rest","rest","休息；剩余"],["run","rʌn","跑；经营"],["shoulder","ˈʃoʊl.dər","肩膀"],["skin","skɪn","皮肤；外皮"],["soap","soʊp","肥皂"],["sore throat","sɔːr θroʊt","喉咙痛"],["stomach","ˈstʌm.ɪk","胃"],["stomach ache","ˈstʌm.ɪk eɪk","胃痛"],["stress","stres","压力"],["swim","swɪm","游泳"],["tablet","ˈtæb.lət","药片"],["take exercise","teɪk ˈek.sər.kaɪz","进行锻炼"],["temperature","ˈtem.prə.tʃər","体温"],["thumb","θʌm","拇指"],["tired","taɪərd","疲劳的"],["toes","toʊz","脚趾"],["tooth","tuːθ","牙齿"],["toothache","ˈtuːθ.eɪk","牙痛"],["toothbrush","ˈtuːθ.brʌʃ","牙刷"],["walk","wɔːk","走；散步"],["well","wel","健康的"]]},{"n":"爱好与休闲","e":"🎯","w":[["barbecue","ˈbɑːr.bɪ.kjuː","烧烤"],["beach","biːtʃ","海滩"],["bicycle","ˈbaɪ.sɪ.kəl","自行车"],["bike","baɪk","自行车"],["camera","ˈkæm.ər.ə","相机"],["camp","kæmp","露营"],["camping","ˈkæmp.ɪŋ","露营"],["campsite","ˈkæmp.staɪt","营地"],["CD","ˌsiː. diː ˈpleɪ.ər","光盘播放器"],["chess","tʃes","国际象棋"],["club","klʌb","俱乐部"],["collector","kəˈlek.tər","收集（者）"],["collection","kəˈlek.ʃən","收藏"],["computer","kəmˈpjuː.tər","计算机"],["cruise","kruːz","巡航"],["dance","dæns","跳舞"],["dancing","ˈdæn.sɪŋ","跳舞"],["doll","dɒl","玩偶"],["draw","drɔː","绘画"],["drawing","ˈdrɔː.ɪŋ","图画"],["DVD","ˌiː. diː. viː ˈpleɪ.ər","数字视频光盘播 放器"],["facilities","fəˈsɪl.ɪ.tiz","设施"],["fan","fæn","风扇；粉丝"],["festival","ˈfes.tɪ.vəl","节日"],["fiction","ˈfɪk.ʃən","小说"],["gallery","ˈɡæl.ər.i","画廊"],["go out","ɡoʊ aʊt","外出"],["go shopping","ɡoʊ ˈʃɒp.ɪŋ","购物"],["guitar","ɡɪˈtɑːr","吉他"],["hang out","hæŋ aʊt","闲逛"],["hire","haɪər","租用"],["hike","haɪk","徒步"],["hobby","ˈhɒb.i","爱好"],["holidays","ˈhoʊl.i.dez","假期"],["ice skates","ˈaɪs skeɪts","溜冰鞋"],["jogging","ˈdʒɒɡ.ɪŋ","慢跑"],["join in","dʒɔɪn ɪn","参与"],["keen on","kiːn ɒn","热衷于"],["keep fit","kiːp fɪt","保持健康"],["magazine","ˌmæɡ.əˈziːn","杂志"],["membership","ˈmemb.ər","成员（资格）"],["model","ˈmɒd.əl","模型；模特"],["museum","mjuːˈziː.əm","博物馆"],["music","ˈmjuː.zɪk","音乐"],["musician","mjuːˈzɪ.ʃən","音乐家"],["nightlife","ˈnaɪt.laɪf","夜生活"],["opening hours","ˈoʊ.pənɪŋ ˈaʊ.ərz","营业时间"],["paint","peɪnt","绘画"],["painting","ˈpeɪn.tɪŋ","绘画"],["park","pɑːrk","公园；停车"],["party","ˈpɑːr.t̬i","聚会；政党"],["photograph","ˈfoʊ.tə.ɡræf","照片"],["picnic","ˈpɪk.nɪk","野餐"],["playground","ˈpleɪ.ɡraʊnd","游乐场"],["quiz","kwɪz","测验"],["rope","roʊp","绳子"],["sculpture","ˈskʌl.pʃər","雕塑"],["sightseeing","ˈsaɪt.siː.ɪŋ","观光"],["slide","slaɪd","滑梯"],["sunbathe","ˈsʌn.beɪð","晒太阳"],["tent","tent","帐篷"],["torch","tɔːrtʃ","手电筒"]]},{"n":"房屋与家庭","e":"🏠","w":[["accommodation","əˌkɒm.məˈdeɪ.ʃən","住宿"],["address","əˈdrɛs","地址"],["air conditioning","ɛər kənˈdɪʃənɪŋ","空调"],["alarm","əˈlɑːrm","警报（火灾/汽车）"],["alarm clock","əˈlɑːrm klɒk","闹钟"],["antique","ænˈtiːk","古董"],["apartment","əˈpɑːrt.mənt","公寓"],["armchair","ˈɑːrm.tʃeər","扶手椅"],["balcony","ˈbæl.kə.ni","阳台"],["basin","ˈbeɪ.sɪn","盆"],["bathtub","bæθ","浴缸"],["bathroom","ˈbeɪθ.ruːm","浴室"],["bed","bed","床"],["bedroom","ˈbed.ruːm","卧室"],["bell","bel","铃"],["bin","bɪn","垃圾箱"],["blanket","ˈblæŋ.kɪt","毯子"],["blind","blaɪnd","百叶窗"],["block","blɒk","街区（公告）"],["board","bɔːrd","木板"],["bookcase","ˈbʊk.keɪs","书架"],["bookshelf","ˈbʊk.ʃɛlf","书架"],["bowl","boʊl","碗"],["box","bɒks","盒子"],["brush","brʌʃ","刷子"],["bucket","ˈbʌk.ɪt","水桶"],["bulb","bʌlb","灯泡"],["candle","ˈkæn.dəl","蜡烛"],["carpet","ˈkɑːr.pɪt","地毯"],["ceiling","ˈsiː.lɪŋ","天花板"],["central heating","ˈsɛn.trəl ˈhiː.tɪŋ","中央供暖"],["chair","tʃeər","椅子"],["channel","ˈtʃæn.əl","频道（与电视）"],["chest of drawers","tʃɛst əv drɔːrz","抽屉柜"],["clock","klɒk","时钟"],["computer","kəmˈpjuː.tər","计算机"],["cooker","ˈkʊ.kər","炊具"],["cottage","ˈkɒt.ɪdʒ","小屋"],["cupboard","ˈkʌb.ərd","橱柜"],["curtain","ˈkɜːr.tən","窗帘"],["cushion","ˈkʊʃ.ən","垫子"],["desk","dɛsk","书桌"],["digital","ˈdɪdʒ.ɪ.təl","数字的"],["dining room","ˈdaɪ.nɪŋ ruːm","餐厅"],["dish","dɪʃ","盘子"],["dishwasher","ˈdɪʃ.waʃ.ər","洗碗机"],["door","dɔːr","门"],["downstairs","ˌdaʊnˈstɛərz","楼下"],["drawer","drɔːr","抽屉"],["dustbin","ˈdʌst.bɪn","垃圾箱"],["duvet","ˈdjuː.veɪ","羽绒被"],["DVD","ˌiː. diː. viː ˈpleɪ.ər","DVD播放器"],["electrical","ɪˈlɛk.trɪk(əl)","电的"],["entrance","ˈɛn.trəns","入口"],["fan","fæn","风扇；粉丝"],["flat","flæt","公寓；平的"],["flatmate","ˈflæt.meɪt","室友"],["floor","flɔːr","地板"],["freezer","ˈfriː.zər","冷冻柜"],["fridge","frɪdʒ","冰箱"],["frying pan","ˈfraɪ.ɪŋ pæn","煎锅"],["furniture","ˈfɜːr.nɪ.tʃər","家具"],["garage","ˈɡəˈrɑːdʒ","车库"],["garden","ˈɡɑːr.dən","花园"],["gas","ɡæs","气体"],["gate","ɡeɪt","门"],["grill","ɡrɪl","烤架"],["ground","ɡraʊnd","地面；场地"],["hall","hɔːl","大厅"],["handle","ˈhæn.dəl","把手"],["heat","hiːt","加热"],["heater","ˈhiː.tər","加热器"],["heating","ˈhiː.tɪŋ","供暖"],["hi-fi","ˈhaɪ.faɪ","高保真音响"],["home","hoʊm","家"],["house","haʊs","房子"],["housewife","ˈhaʊs.waɪf","家庭主妇"],["housework","ˈhaʊs.wɜːrk","家务"],["iron","ˈaɪ.ərn","铁；熨斗"],["jug","dʒʌɡ","水壶"],["kettle","ˈkɛ.təl","水壶"],["key","kiː","钥匙；答案"],["kitchen","ˈkɪtʃ.ən","厨房"],["ladder","ˈlæd.ər","梯子"],["lamp","læmp","灯"],["laptop","ˈlæp.tɒp","笔记本电脑"],["lift","lɪft","电梯；举起"],["light","laɪt","光；轻的"],["line","laɪn","线；排队"],["living-room","ˈlɪv.ɪŋ ruːm","客厅"],["lock","lɒk","锁"],["microwave","ˈmaɪ.kroʊ.weɪv","微波炉"],["mirror","ˈmɪr.ər","镜子"],["mug","mʌɡ","杯子"],["neighbour","ˈneɪ.bər","邻居"],["oil","ɔɪl","油"],["oven","ˈʌv.ən","烤箱"],["pan","pæn","平底锅"],["path","pæθ","路径"],["pillow","ˈpɪl.oʊ","枕头"],["pipe","paɪp","管道"],["plant","plænt","植物；种植"],["plug","plʌɡ","插头"],["plug in","plʌɡ ɪn","插入"],["property","ˈprɒp.ər.t̬i","财产"],["radio","ˈreɪ.di.oʊ","收音机"],["refrigerator","rɪˈfrɪdʒ.ər.eɪ.tər","冰箱"],["remote control","rɪˈmoʊt kənˈtroʊl","遥控器"],["rent","rɛnt","租金；出租"],["repair","rɪˈpɛər","修理"],["roof","ruːf","屋顶"],["room","ruːm","房间"],["roommate","ˈruːm.meɪt","室友"],["rubbish","ˈrʌb.ɪʃ","垃圾"],["safe","seɪf","安全的；保险箱"],["seat","siːt","座位；坐下"],["sheet","ʃiːt","床单"],["shelf","ʃɛlf","架子"],["shower","ˈʃaʊ.ər","淋浴"],["sink","sɪŋk","水槽；下沉"],["sitting room","ˈsɪt.ɪŋ ruːm","起居室"],["sofa","ˈsoʊ.fə","沙发"],["stairs","stɛərz","楼梯"],["stay","steɪ","停留；保持"],["step","stɛp","步骤；台阶"],["surround","sərˈaʊnd","环绕"],["switch","swɪtʃ","开关；转换"],["table","ˈteɪ.bəl","桌子"],["tap","tæp","水龙头"],["telephone","ˈtɛl.ɪ.fəʊn","电话"],["television","ˈtɛl.ɪ.vɪ.ʒən","电视"],["toilet","ˈtɔɪ.lət","厕所"],["towel","ˈtaʊ.əl","毛巾"],["tower","ˈtaʊ.ər","塔；高耸"],["toy","tɔɪ","玩具"],["TV","ˌtiːˈviː","电视（屏幕/套装）"],["upstairs","ˌʌpˈstɛərz","楼上"],["vase","vɑːz","花瓶"],["video","ˈviː.di.oʊ","视频"],["wall","wɔːl","墙；围墙"],["washing machine","ˈwɒʃ.ɪŋ məˈʃiːn","洗衣机"],["window","ˈwɪn.dəʊ","窗户"]]},{"n":"语言","e":"🗣️","w":[["advanced","ədˈvæn.stʃəd","高级"],["answer","ˈæn.sər","回答"],["argue","ˈɑːr.ɡjuː","争论"],["ask","æsk","询问"],["beginner","bɪˈɡɪn.ər","初学者"],["chat","tʃæt","聊天"],["communicate","kəˈmjuː.nɪ.keɪt","交流"],["communication","kəˌmjuː.nɪˈkeɪ.ʃən","交流"],["elementary","ˌel.ɪˈmen.təri","初级"],["email","ˈiː.meɪl","电子邮件"],["grammar","ˈɡræm.ər","语法"],["intermediate","ˌɪn.tərˈmiː.di.ət","中级"],["joke","dʒoʊk","笑话"],["letter","ˈlet.ər","信"],["mean","miːn","意思是；刻薄的"],["meaning","ˈmiːn.ɪŋ","意思"],["mention","ˈmen.ʃən","提到"],["message","ˈmes.ɪdʒ","消息"],["pronounce","prəˈnaʊns","发音"],["pronunciation","prəˌnʌn.siˈeɪ.ʃən","发音"],["question","ˈkwest.ʃən","问题"],["say","seɪ","说"],["sentence","ˈsen.təns","句子"],["shout","ʃaʊt","喊"],["speak","spiːk","讲"],["talk","tɔːk","谈话；演讲"],["tell","tel","告诉；分辨"],["translate","trænsˈleɪt","翻译"],["translation","trænsˈleɪ.ʃən","翻译"],["vocabulary","voʊˈkæb.juˌler.i","词汇"],["word","wɜːrd","单词；话语"]]},{"n":"感受与经历","e":"💭","w":[["able","ˈeɪ.bəl","能够"],["afraid","əˈfreɪd","害怕"],["alone","əˈloʊn","独自"],["amazed","əˈmeɪzd","惊讶"],["amazing","əˈmeɪ.zɪŋ","令人惊讶"],["amusing","əˈmjuː.zɪŋ","好笑"],["angry","ˈæŋ.ɡri","生气"],["annoyed","əˈnɔɪd","烦恼"],["anxious","ˈæŋk.ʃəs","焦虑"],["ashamed","əˈʃeɪmd","羞愧"],["awesome","ˈɔːsəm","极好"],["awful","ˈɔː.fəl","糟糕"],["bad","bæd","坏"],["beautiful","ˈbjuː.tɪ.fəl","美丽"],["better","ˈbɛt.ər","更好"],["bored","bɔːrd","无聊"],["boring","ˈbɔːr.ɪŋ","乏味"],["bossy","ˈbɔː.si","专横"],["brave","breɪv","勇敢"],["brilliant","ˈbrɪl.i.ənt","出色"],["busy","ˈbɪz.i","忙碌"],["calm","kɑːm","平静"],["careful","ˈkɛər.fəl","小心"],["challenging","ˈtʃæl.ɪn.dʒɪŋ","有挑战性"],["charming","ˈtʃɑːr.mɪŋ","有魅力"],["cheerful","ˈtʃɪr.fəl","高兴"],["clear","klɪər","清晰"],["clever","ˈklɛv.ər","聪明"],["confident","ˈkɒn.fɪ.dənt","自信"],["confused","kənˈfjuːzd","困惑"],["confusing","kənˈfjuː.zɪŋ","令人困惑"],["cool","kuːl","酷"],["crazy","ˈkreɪ.zi","疯狂"],["cruel","kruːəl","残忍"],["curious","ˈkjʊər.i.əs","好奇"],["cute","kjuːt","可爱"],["delighted","dɪˈlaɪ.tɪd","高兴"],["depressed","dɪˈprɛs.tɪd","沮丧"],["different","ˈdɪf.ər.ənt","不同"],["difficult","ˈdɪf.ɪ.kəlt","困难"],["disappointed","ˌdɪs.əˈpɔɪn.tɪd","失望"],["disappointing","ˌdɪs.əˈpɔɪn.tɪŋ","令人失望"],["easy","ˈiː.zi","容易"],["embarrassed","ɛmˈbær.əst","尴尬"],["embarrassing","ɛmˈbær.əs.ɪŋ","令人尴尬"],["enjoyable","ɪnˈdʒɔɪ.ə.bəl","愉快"],["excellent","ˈɛk.sə.lənt","优秀"],["excited","ɪkˈsaɪ.tɪd","兴奋"],["exciting","ɪkˈsaɪ.tɪŋ","令人兴奋"],["famous","ˈfeɪ.məs","著名"],["fantastic","fænˈtæs.tɪk","奇妙"],["favourite","ˈfeɪ.vər.ɪt","最喜欢"],["fine","faɪn","好的；晴朗的"],["fit","fɪt","适合；健康的"],["fond","fɒnd","喜爱"],["free","friː","自由的；免费的"],["frightened","ˈfraɪ.tənd","害怕"],["frightening","ˈfraɪ.tənɪŋ","吓人"],["friendly","ˈfrɛn.də.li","友好"],["funny","ˈfʌn.i","有趣"],["generous","ˈdʒɛn.ər.əs","慷慨"],["gentle","ˈdʒɛn.təl","温柔"],["glad","ɡlæd","高兴"],["good","ɡʊd","好"],["great","ɡreɪt","伟大"],["guilty","ˈɡɪl.ti","内疚"],["happy","ˈhæp.i","快乐"],["hard","hɑːrd","困难"],["healthy","ˈhɛl.θi","健康"],["heavy","ˈhɛv.i","重"],["high","haɪ","高"],["hungry","ˈhʌŋ.ɡri","饿"],["important","ɪmˈpɔːr.tənt","重要"],["impressed","ɪmˈprɛs.tɪd","印象深刻"],["intelligent","ɪnˈtɛl.ɪ.dʒənt","聪明"],["interested","ˈɪn.tər.ɪst.ɪd","感兴趣"],["interesting","ˈɪn.tər.ɪs.tɪŋ","有趣"],["jealous","ˈdʒɛl.əs","嫉妒"],["keen","kiːn","热衷"],["kind","kaɪnd","种类；善良的"],["lazy","ˈleɪ.zi","懒惰"],["lovely","ˈlʌv.li","可爱"],["lucky","ˈlʌk.i","幸运"],["mad","mæd","疯狂"],["married","ˈmær.i.d","已婚"],["miserable","ˈmɪz.ər.ə.bəl","悲惨"],["modern","ˈmɒd.ərn","现代"],["negative","ˈnɛɡ.ə.tɪv","负面"],["nervous","ˈnɛr.vəs","紧张"],["nice","naɪs","好"],["noisy","ˈnɔɪ.zi","吵闹"],["normal","ˈnɔːr.məl","正常"],["old","oʊld","老"],["old-fashioned","ˈoʊld ˈfæʃ.ənd","老式"],["ordinary","ˈɔːr.dɪn.ɛr.i","普通"],["original","əˈrɪdʒ.ɪ.nəl","原始"],["patient","ˈpeɪ.ʃənt","耐心"],["personal","ˈpɜːr.sən.əl","个人"],["pleasant","ˈplɛz.ənt","愉快"],["poor","pʊər","贫穷"],["positive","ˈpɒz.ɪ.tɪv","积极"],["pretty","ˈprɪt.i","漂亮的；相当"],["quick","kwɪk","快"],["quiet","ˈkwaɪ.ət","安静"],["ready","ˈrɛd.i","准备好"],["real","rɪəl","真实"],["realistic","ˌriː.əˈlɪs.tɪk","现实"],["reasonable","ˈriː.zən.ə.bəl","合理"],["relaxed","rɪˈlækst","放松"],["reliable","rɪˈlaɪ.ə.bəl","可靠"],["relieved","rɪˈliːvd","如释重负"],["rich","rɪtʃ","富有"],["right","raɪt","右边；正确的"],["rude","ruːd","粗鲁"],["sad","sæd","悲伤"],["satisfied","ˈsæt.ɪs.faɪd","满意"],["serious","ˈsɪər.i.əs","严肃"],["slim","slɪm","苗条"],["slow","sloʊ","慢"],["small","smɔːl","小"],["smart","smɑːrt","聪明"],["sorry","ˈsɒr.i","抱歉"],["soft","sɔːft","软的；柔和的"],["special","ˈspɛ.ʃəl","特别"],["strange","streɪndʒ","奇怪的；陌生的"],["strong","strɒŋ","强壮的；浓的"],["stupid","ˈstuː.pɪd","愚蠢"],["sure","ʃʊər","确定"],["surprised","sərˈpraɪzd","惊讶"],["sweet","swiːt","甜的；糖果"],["tall","tɔːl","高的；身高"],["terrible","ˈter.ɪ.bəl","可怕"],["tired","taɪərd","累"],["true","truː","真实"],["typical","ˈtɪp.ɪ.kəl","典型"],["unable","ʌnˈeɪ.bəl","无法"],["unhappy","ʌnˈhæp.i","不快乐"],["unusual","ʌnˈjuː.ʒu.əl","不寻常"],["useful","ˈjuːs.fəl","有用"],["well","wel","好"],["wonderful","ˈwʌn.dər.fʊl","精彩"],["worried","ˈwɜː.rid","担心"],["wrong","rɒŋ","错误的；不对的"],["young","jʌŋ","年轻的；幼小的"]]},{"n":"建筑物","e":"🏢","w":[["apartment block","əˈpɑːr.tmənt blɒk","公寓楼"],["apartment building","əˈpɑːr.tmənt ˈbɪl.dəŋ","公寓楼"],["bank","bæŋk","银行；河岸"],["bookshop","ˈbʊk.ʃɒp","书店"],["bookstore","ˈbʊk.stɔːr","书店"],["building","ˈbɪl.dɪŋ","建筑"],["cafe / café","kæˈfeɪ","咖啡馆"],["cafeteria","ˌkæf.iˈtɪər.i.ə","自助餐厅"],["castle","ˈkæs.əl","城堡"],["cinema","ˈsɪn.ə.mə","电影院"],["clinic","ˈklɪn.ɪk","诊所"],["club","klʌb","俱乐部"],["college","ˈkɒl.ɪdʒ","学院"],["cottage","ˈkɒt.ɪdʒ","乡村小屋"],["department store","dɪˈpɑːrt.mənt stɔːr","百货商店"],["disco","ˈdɪs.koʊ","迪斯科"],["elevator","ˈɛl.ɪ.veɪ.tər","电梯"],["entrance","ˈɛn.trəns","入口"],["exit","ˈɛɡ.zɪt","出口"],["factory","ˈfæk.tər.i","工厂"],["flat","flæt","公寓；平的"],["gallery","ˈɡæl.ər.i","画廊"],["garage","ˈɡəˈrɑːdʒ","车库"],["grocery store","ˈɡroʊ.sər.i stɔːr","杂货店"],["guest-house","ˈɡest.haʊs","宾馆"],["hospital","ˈhɒs.pɪ.təl","医院"],["hotel","hoʊˈtel","酒店"],["house","haʊs","房子"],["library","ˈlaɪ.brər.i","图书馆"],["lift","lɪft","电梯；举起"],["mall","mæl","购物中心"],["museum","mjuːˈziː.əm","博物馆"],["office","ˈɒf.ɪs","办公室"],["palace","ˈpæl.ɪs","宫殿"],["police station","pəˈliːs ˈsteɪ.ʃən","警察局"],["post office","poʊst ˈɒf.ɪs","邮局"],["prison","ˈpraɪ.zən","监狱"],["railway station","ˈreɪl.weɪ ˈsteɪ.ʃən","火车站"],["ruin","ˈruː.ɪn","废墟"],["school","skuːl","学校"],["tower","ˈtaʊ.ər","塔；高耸"],["university","ˌjuː.nɪˈvɜːr.sɪ.t̬i","大学"]]},{"n":"乡村","e":"🌾","w":[["area","ˈeər.i.ə","区域"],["bay","beɪ","海湾"],["beach","biːtʃ","海滩"],["campsite","ˈkæmp.staɪt","营地"],["canal","kəˈnæl","运河"],["cliff","klɪf","悬崖"],["desert","ˈdez.ərt","沙漠"],["earth","ɜːrθ","地球"],["farm","fɑːrm","农场"],["field","fiːld","田地"],["forest","ˈfɒr.ɪst","森林"],["harbour","ˈhɑːr.bər","港口"],["hill","hɪl","山丘"],["island","ˈaɪ.lənd","岛屿"],["lake","leɪk","湖泊"],["land","lænd","土地；着陆"],["mountain","ˈmaʊn.tən","山"],["ocean","ˈoʊ.ʃən","海洋"],["path","pæθ","小径"],["port","pɔːrt","港口"],["railway","ˈreɪl.weɪ","铁路"],["rainforest","ˈreɪn.fɒr.ɪst","雨林"],["region","ˈriː.dʒən","地区"],["river","ˈrɪv.ər","河流"],["rock","rɒk","岩石；摇滚乐"],["sand","sænd","沙子"],["scenery","ˈsiː.nər.i","风景"],["sea","siː","海"],["seaside","ˈsiː.saɪd","海滨"],["sky","skaɪ","天空"],["stream","striːm","小溪"],["valley","ˈvæl.i","山谷"],["village","ˈvɪl.ɪdʒ","村庄"],["waterfall","ˈwɔː.tər.fɔːl","瀑布"],["wood","wʊd","木头；树林"]]},{"n":"城镇与城市","e":"🏙️","w":[["apartment building","əˈpɑːrtmənt ˈbɪldɪŋ","公寓楼"],["airport","ˈeərˌpɔːrt","机场"],["booking office","ˈbʊkɪŋ ˈɒfɪs","预订办公室"],["bridge","brɪdʒ","桥梁"],["bus station","bʌs ˈsteɪʃən","公共汽车站"],["bus stop","bʌs stɒp","公共汽车站"],["car park","kɑːr pɑːrk","停车场"],["cash machine","kæʃ məˈʃiːn","取款机"],["cashpoint","ˈkæʃpɔɪnt","取款点"],["city centre","ˈsɪti ˈsentər","市中心"],["corner","ˈkɔːrnər","角落"],["crossing","ˈkrɔːsɪŋ","交叉口"],["crossroads","ˈkrɔːsruːdz","十字路口"],["fountain","ˈfaʊn.tən","喷泉"],["market","ˈmɑːrkɪt","市场"],["motorway","ˈmoʊ.tər.weɪ","高速公路"],["monument","mɒn.jʊ.mənt","纪念碑"],["park","pɑːrk","公园；停车"],["pavement","ˈpeɪv.mənt","人行道"],["petrol station","ˈpetrəl steɪʃən","加油站"],["playground","ˈpleɪ.ɡraʊnd","游乐场"],["road","roʊd","道路"],["roundabout","ˌraʊn.dæˈbaʊt","环形交叉路口"],["route","ruːt","路线"],["shopping centre","","购物中心"],["signpost","ˈsaɪn.poʊst","路标"],["square","skweər","广场"],["station","ˈsteɪ.ʃən","车站；站"],["street","strit","街道"],["subway","ˈsʌb.weɪ","地铁"],["town","taʊn","城镇"],["tunnel","ˈtʌn.əl","隧道"],["turning","ˈtɜːrn.ɪŋ","转弯"],["underground","ˌʌn.dərˈɡraʊnd","地铁"],["zoo","zuː","动物园"]]},{"n":"服务","e":"🛎️","w":[["bank","bæŋk","银行；河岸"],["café","kæˈfeɪ","咖啡馆"],["cinema","ˈsɪnəmə","电影院"],["dentist","ˈdɛntɪst","牙医"],["doctor","ˈdɒktər","医生"],["gallery","ˈɡæləri","画廊"],["garage","ˈɡærɑːdʒ","车库"],["hairdresser","ˈheərˌdrɛsər","理发师"],["hotel","hoʊˈtel","酒店"],["library","ˈlaɪbrɛri","图书馆"],["museum","mjuˈziəm","博物馆"],["post office","poʊst ˈɔfɪs","邮局"],["restaurant","ˈrɛstərɒnt","餐厅"],["sports centre","ˈspɔrts ˈsɛntər","体育中心"],["swimming pool","ˈswɪmɪŋ pul","游泳池"],["theatre","ˈθiətər","剧院"],["tourist information","ˈtʊərɪst ɪnˈfɔːrmɛʃən","旅游信息"]]},{"n":"购物","e":"🛒","w":[["ad","æd","广告"],["advert","ˈædvɜːrt","广告"],["advertise","ˈædvərtaɪz","做广告"],["advertisement","ədˈvɜːrtɪsmənt","广告"],["assistant","əˈsɪstənt","助手"],["bargain","ˈbɑːrɡən","讨价还价"],["bill","bɪl","账单"],["book","bʊk","书；预订"],["buy","baɪ","购买"],["cash","kæʃ","现金"],["cent","sɛnt","分"],["change","tʃeɪndʒ","零钱"],["cheap","tʃiːp","便宜的"],["cheque","tʃɛk","支票"],["choose","tʃuːz","选择"],["close","kləʊz","关闭"],["closed","kləʊzd","关闭的"],["collect","kəˈlɛkt","收集"],["complain","kəmˈpleɪn","抱怨"],["cost","kɒst","花费"],["credit card","ˈkrɛdɪt kɑːrd","信用卡"],["customer","ˈkʌs.tə.mər","顾客"],["damaged","ˈdæm.ɪdʒd","损坏的"],["dear","dɪər","昂贵的"],["department store","dɪˈpɑːrt.mənt stɔːr","百货商店"],["deposit","dɪˈpɒz.ɪt","存款"],["dollar","ˈdɒl.ər","美元"],["euro","ˈjʊr.oʊ","欧元"],["exchange","ɪksˈtʃeɪndʒ","交换"],["expensive","ɪkˈspɛn.sɪv","昂贵的"],["for sale","fɔːr seɪl","出售"],["go shopping","ɡoʊ ˈʃɒp.ɪŋ","购物"],["hire","ˈhaɪər","租用"],["inexpensive","ˌɪn.ɪkˈspɛn.sɪv","便宜的"],["label","ˈleɪ.bəl","标签"],["logo","ˈloʊ.ɡoʊ","商标"],["luxury","ˈlʌk.ʃər.i","奢侈"],["mall","mɔːl","购物中心"],["money","ˈmʌn.i","钱"],["order","ˈɔr.dər","订购；顺序"],["pay","peɪ (fɔːr)","支付；值得"],["penny","ˈpɛn.i","便士"],["pound","paʊnd","英镑；磅"],["price","praɪs","价格"],["reasonable","ˈriː.zə.nə.bəl","合理的"],["receipt","rɪˈsiːt","收据"],["reduce","rɪˈduːs","减少"],["reduced","rɪˈdjuːst","减少的"],["rent","rɛnt","租金；出租"],["reserve","rɪˈzɜːrv","预订；保留"],["return","rɪˈtɜːrn","返回"],["save","seɪv","节省；拯救"],["second-hand","ˌsɛk.ənd ˈhænd","二手的"],["sell","sɛl","销售"],["shop","ʃɒp","商店；购物"],["shop assistant","ʃɒp əˈsɪs.tənt","店员"],["shopper","ˈʃɒp.ər","购物者"],["shopping","ˈʃɒp.ɪŋ","购物"],["spend","spend","花费；度过"],["supermarket","ˈsuː.pər.mɑːrk.ɪt","超市"],["try on","traɪ ɒn","试穿"]]},{"n":"运动","e":"⚽","w":[["athlete","ˈæθ.liːt","运动员"],["athletics","æθˈlet.ɪks","田径运动"],["badminton","ˈbæd.mɪn.tən","羽毛球"],["ball","bɔːl","球"],["baseball","ˈbeɪs.bɔːl","棒球"],["basketball","ˈbæs.kɪtˌbɔːl","篮球"],["bat","bæt","球拍；蝙蝠"],["bathing suit","ˈbæθ.ɪŋ suːt","泳衣"],["beach","biːtʃ","沙滩"],["bicycle","ˈbɪk.ə.kəl","自行车"],["bike","baɪk","自行车"],["boat","boʊt","船"],["boxing","ˈbɒks.ɪŋ","拳击"],["catch","kætʃ","捕捉"],["champion","ˈtʃæm.pjən","冠军"],["championship","ˈtʃæm.pjən.ʃɪp","锦标赛"],["changing room","ˈtʃeɪn.dʒɪŋ ruːm","更衣室"],["climb","klaɪm","攀登"],["climbing club","ˈklaɪm.ɪŋ klʌb","登山俱乐部"],["coach","koʊtʃ","教练；长途客车"],["compete","kəmˈpiːt","竞争"],["competition","ˌkɒm.pəˈtɪʃ.ən","比赛"],["competitor","kəmˈpet.ɪ.tər","竞争者"],["contest","ˈkɒn.tɛst","竞赛"],["court","kɔːrt","球场；法院"],["cricket","ˈkrɪk.ɪt","板球"],["cycling","ˈsaɪ.klɪŋ","自行车运动"],["cyclist","ˈsaɪ.sɪst","骑自行车的人"],["dancing","ˈdæn.sɪŋ","跳舞"],["diving","ˈdaɪ.vɪŋ","潜水"],["enter","ˈɛn.tər","参加（比赛）"],["extreme sports","ɪkˈstriːm spɔːrts","极限运动"],["facilities","fəˈsɪl.ə.tiz","设施"],["fishing","ˈfɪʃ.ɪŋ","钓鱼"],["fitness","ˈfɪt.nəs","健身"],["football","ˈfʊt.bɔːl","足球"],["football player","ˈfʊt.bɔːl ˈpleɪ.ər","足球运动员"],["game","ɡeɪm","游戏；比赛"],["goal","ɡoʊl","目标"],["goalkeeper","ˈɡoʊl.kiː.pər","守门员"],["golf","ɡɑːlf","高尔夫"],["gym","dʒɪm","健身房"],["gymnastics","dʒɪmˈnæs.tɪks","体操"],["helmet","ˈhɛl.mət","头盔"],["high jump","haɪ dʒʌmp","跳高"],["hit","hɪt","打；点击"],["hockey","ˈhɒk.i","曲棍球"],["horse-riding","ˈhɔːsˌraɪ.dɪŋ","骑马"],["ice hockey","ˈaɪs ˈhɒk.i","冰球"],["ice skates","ˈaɪs skeɪts","冰刀"],["ice skating","ˈaɪs ˈskɛɪ.tɪŋ","滑冰"],["instructor","ɪnˈstrʌk.tər","教练"],["jogging","ˈdʒɒɡ.ɪŋ","慢跑"],["join in","dʒɔɪn ɪn","参加"],["kick","kɪk","踢"],["kit","kɪt","装备"],["league","liːɡ","联盟"],["locker","ˈlɒk.ər ruːm","储物柜（室）"],["long jump","lɔːŋ dʒʌmp","跳远"],["luck","lʌk","运气"],["match","mætʃ","比赛；相配；火柴"],["member","ˈmɛm.bər","成员"],["motor-racing","ˈmoʊ.tər ˈreɪ.sɪŋ","赛车"],["net","nɛt","网"],["pitch","pɪtʃ","球场"],["play","pleɪ","玩"],["points","pɔɪnt(s)","分数"],["practice","ˈpræk.tɪs","练习；惯例"],["practise","ˈpræk.taɪz","练习"],["prize","praɪz","奖品"],["race","reɪs","比赛；赛跑"],["race track","reɪs træk","赛道"],["racing","ˈreɪ.sɪŋ","赛车"],["racket","ˈræk.ɪt","球拍"],["reserve","rɪˈzɜːrv","预订；保留"],["rest","rɛst","休息；剩余"],["ride","raɪd","骑行"],["rider","ˈraɪ.dər","骑手"],["riding","ˈraɪ.dəŋ","骑行"],["rugby","ˈrʌɡ.bi","橄榄球"],["run","rʌn","跑；经营"],["running","ˈrʌn.ɪŋ","跑步"],["sail","seɪl","航行；帆"],["sailing","ˈseɪ.lɪŋ","帆船运动"],["score","skɔːr","得分；分数"],["sea","siː","海"],["season","ˈsiː.zən","季节"],["shooting","ˈʃuː.tɪŋ","射击"],["shorts","ʃɔːrts","短裤"],["skateboard","ˈsket.bɔːrd","滑板"],["skating","ˈskeɪ.tɪŋ","滑冰"],["skiing","ˈskiː.ɪŋ","滑雪"],["snowboard","ˈsnəʊ.bɔːrd","单板滑雪"],["snowboarding","ˈsnəʊ.bɔːrd.ɪŋ","单板滑雪"],["soccer","ˈsɒk.ər","足球"],["sports","spɔːrt(s)","运动"],["sports centre","spɔːrts ˈsen.tər","体育中心"],["squash","skwɒʃ","壁球"],["stadium","ˈsteɪ.di.əm","体育场"],["surf","sɜːrf","冲浪"],["surfboard","ˈsɜːrf.bɔːrd","冲浪板"],["surfboarding","ˈsɜːrf.bɔːrd.ɪŋ","冲浪"],["surfing","ˈsɜːr.fɪŋ","冲浪"],["swim","swɪm","游泳"],["swimming","ˈswɪm.ɪŋ","游泳"],["swimming costume","ˈswɪm.ɪŋ kɒs.tjuːm","泳衣"],["swimming pool","ˈswɪm.ɪŋ puːl","游泳池"],["swimsuit","ˈswɪm.suːt","泳衣"],["table tennis","ˈteɪ.bəl ˈten.ɪs","乒乓球"],["take part","teɪk pɑːrt","参加"],["team","tiːm","团队；队"],["tennis","ˈten.ɪs","网球"],["tennis player","ˈten.ɪs ˈpleɪ.ər","网球运动员"],["throw","θroʊ","扔；举办"],["ticket","ˈtɪk.ɪt","票"],["tired","ˈtaɪ.ərd","疲劳"],["track","træk","跑道；轨道"],["tracksuit","ˈtræk.suːt","运动服"],["trainers","ˈtreɪ.nər(s)","教练"],["training","treɪn","训练"],["versus","ˈvɜːrsəs","对抗"],["volleyball","ˈvɒl.iˌbɔːl","排球"],["walk","wɔːk","走；散步"],["watch","wɒtʃ","观看"],["water skiing","ˈwɔː.tər ˈskiː.ɪŋ","水上滑雪"],["win","wɪn","赢；获胜"],["workout","ˈwɜːr.kaʊt","锻炼"],["yoga","ˈjoʊ.ɡə","瑜伽"]]},{"n":"自然","e":"🌳","w":[["air","eər","空气"],["animal","ˈæn.ɪ.məl","动物"],["autumn","ˈɔː.təm","秋天"],["beach","biːtʃ","海滩"],["bee","biː","蜜蜂"],["bird","bɜːrd","鸟"],["branch","bræntʃ","树枝"],["bush","bʊʃ","灌木"],["butterfly","ˈbʌt.ər.flaɪ","蝴蝶"],["cave","keɪv","洞穴"],["cliff","klɪf","悬崖"],["climate","ˈklaɪ.mət","气候"],["coast","koʊst","海岸"],["continent","ˈkɒn.tɪ.nənt","大陆"],["country","ˈkʌn.trɪ","国家"],["countryside","ˈkʌn.trɪ.saɪd","乡村"],["desert","ˈdez.ərt","沙漠"],["dolphin","ˈdɒl.fɪn","海豚"],["donkey","ˈdɒŋ.ki","驴"],["duck","dʌk","鸭子"],["earth","ɜːrθ","地球"],["east","iːst","东方"],["elephant","ˈel.ə.fənt","大象"],["environment","ɪnˈvaɪr.ən.mənt","环境"],["environmental","ɪnˌvaɪr.ənˈmen.təl","环境的"],["explorer","ɪkˈsplɔːr","探索（者）"],["fall","fɔːl","落下；秋天"],["farmland","ˈfɑːrm.lænd","农田"],["field","fiːld","田地"],["fire","ˈfaɪər","火；解雇"],["fish","fɪʃ","鱼"],["flood","flʌd","洪水"],["flower","ˈflaʊ.ər","花"],["forest","ˈfɔːr.ɪst","森林"],["freeze","friːz","结冰"],["frog","frɒɡ","青蛙"],["fur","fɜːr","毛皮"],["giraffe","dʒɪˈræf","长颈鹿"],["grass","ɡræs","草"],["grow","ɡroʊ","成长"],["hill","hɪl","山丘"],["hot","hɒt","热"],["ice","aɪs","冰"],["island","ˈaɪ.lənd","岛屿"],["jungle","ˈdʒʌŋ.ɡəl","丛林"],["kangaroo","ˌkæŋ.ɡəˈruː","袋鼠"],["lake","leɪk","湖泊"],["land","lænd","土地；着陆"],["leaf","liːf","叶子"],["lion","ˈlaɪ.ən","狮子"],["monkey","ˈmʌŋ.ki","猴子"],["moon","muːn","月亮"],["mosquito","məˈskiː.toʊ","蚊子"],["mountain","ˈmaʊn.tən","山"],["mouse/mice","maʊs","老鼠/老鼠们"],["nature","ˈneɪ.tʃər","自然"],["north","nɔːrθ","北方"],["parrot","ˈpæ.rət","鹦鹉"],["penguin","ˈpeŋ.ɡwɪn","企鹅"],["planet","ˈplæn.ɪt","行星"],["plant","plænt","植物；种植"],["pollution","pəˈluː.ʃən","污染"],["rabbit","ˈræb.ɪt","兔子"],["rainforest","ˈreɪn.fɔːrst","雨林"],["range","reɪndʒ","范围；山脉"],["river","ˈrɪv.ər","河流"],["rock","rɒk","岩石；摇滚乐"],["sand","sænd","沙子"],["scenery","ˈsiː.nər.i","风景"],["sea","siː","海"],["shark","ʃɑːrk","鲨鱼"],["sky","skaɪ","天空"],["south","saʊθ","南方"],["space","speɪs","太空"],["species","ˈspiː.ʃi.əz","物种"],["spring","sprɪŋ","春天；泉水"],["star","stɑːr","星星；明星"],["stone","stoʊn","石头"],["summer","ˈsʌm.ər","夏天"],["sun","sʌn","太阳"],["sunrise","ˈsʌn.raɪz","日出"],["sunset","ˈsʌn.set","日落"],["sunshine","ˈsʌn.ʃaɪn","阳光"],["tiger","ˈtaɪ.ɡər","老虎"],["tree","triː","树"],["valley","ˈvæl.i","山谷"],["waterfall","ˈwɔː.tər.fɔːl","瀑布"],["waves","weɪvz","波浪"],["west","wɛst","西方"],["wild","waɪld","野生的；狂热的"],["wildlife","ˈwaɪld.laɪf","野生动物"],["winter","ˈwɪn.tər","冬天"],["wood","wʊd","木头；树林"],["wool","wʊl","羊毛"],["world","wɜːrld","世界"],["zebra","ˈzeb.rə","斑马"]]},{"n":"时间","e":"⏰","w":[["afternoon","ˌæf.təˈnuːn","下午"],["evening","ˈiː.vənɪŋ","晚上"],["night","naɪt","夜晚"],["weekday","ˈwiːk.deɪ","工作日"],["a.m. / p.m","ˌeɪ ˈem","上午/下午"],["half","hæf","半（点）"],["noon","nuːn","中午"],["weekend","ˌwiːkˈɛnd","周末"],["ages","ˈeɪ.dʒɪz","很长时间"],["holidays","ˈhɑː.lɪ.deɪz","假期"],["o’clock","əˈklɒk","点钟"],["weekly","ˈwiːk.li","每周"],["appointment","əˈpɔɪn.tmənt","约会"],["hour","ˈaʊ.ər","小时"],["past","pæst","过去；经过"],["winter","ˈwɪn.tər","冬天"],["approximately","əˈprɒk.sɪ.mət.li","大约"],["January - December","dɪˈsɛm.bər","一月到十二月 一月到十二月"],["quarter","ˈkwɔː.tər","一刻（过/差）"],["working hours","ˈwɜːrk.ɪŋ ˈaʊ.ərz","工作时间"],["autumn","ˈɔː.təm","秋天"],["meeting","ˈmiː.tɪŋ","会议"],["second","ˈsɛk.ənd","第二；秒"],["year","jɪər","年"],["birthday","ˈbɜːrθ.deɪ","生日"],["midnight","ˈmɪd.naɪt","午夜"],["spring","sprɪŋ","春天；泉水"],["yesterday","ˈjɛs.tər.deɪ","昨天"],["century","ˈsɛn.tʃə.ri","世纪"],["minute","ˈmɪ.nət","分钟"],["summer","ˈsʌm.ər","夏天"],["clock","klɒk","时钟"],["moment","ˈmoʊ.mənt","时刻"],["time","taɪm","时间；次数"],["daily","ˈdeɪ.li","每天"],["today","təˈdeɪ","今天"],["date","deɪt","日期；约会"],["month","mʌnθ","月"],["tomorrow","təˈmɔːr.roʊ","明天"],["day","deɪ","天"],["monthly","ˈmʌn.θli","每月"],["tonight","təˈnaɪt","今晚"],["diary","ˈdaɪ.ə.ri","日记"],["morning","ˈmɔːr.nɪŋ","早晨"],["week","wiːk","周"]]},{"n":"旅行与交通","e":"✈️","w":[["abroad","əˈbrɔːd","国外"],["accommodation","əˌkɒməˈdeɪ.ʃən","住宿"],["airplane","ˈeər.pleɪn","飞机"],["airline","ˈeər.laɪn","航空公司"],["airport","ˈeər.pɔːrt","机场"],["ambulance","ˈæm.bjʊ.ləns","救护车"],["announcement","əˈnaʊns.mənt","公告"],["arrival","əˈraɪ.vəl","到达"],["arrive","əˈraɪv","到达"],["astronaut","ˈæs.trə.nɔːt","宇航员"],["at sea","æt siː","在海上"],["backpack","ˈbæk.pæk","背包"],["backpacker","ˈbæk.pæk.ər","背包客"],["backpacking","ˈbæk.pæk.ɪŋ","背包旅行"],["bag","bæɡ","包"],["baggage","ˈbæɡ.ɪdʒ","行李"],["bicycle / bike","ˈbaɪk","自行车"],["board","bɔːrd","登上"],["boarding pass","ˈbɔːr.dɪŋ pæs","登机牌"],["boat","boʊt","船"],["border","ˈbɔːr.dər","边境"],["bridge","brɪdʒ","桥"],["brochure","ˈbrəʊ.ʃɜːr","宣传册"],["bus","bʌs","公共汽车"],["bus station","bʌs ˈsteɪ.ʃən","公共汽车站"],["bus stop","bʌs stɒp","公共汽车站"],["by air","baɪ eər","通过航空"],["by land","baɪ lænd","通过陆路"],["by rail","baɪ reɪl","通过铁路"],["by road","baɪ roʊd","通过公路"],["by sea","baɪ siː","通过海路"],["cab","kæb","出租车"],["cabin","ˈkæb.ɪn","舱"],["canal","kəˈnæl","运河"],["capital","ˈkæp.ɪ.təl","首都"],["car","kɑːr","汽车"],["car alarm","ˌkɑːr əˈlɑːrm","汽车警报器"],["car park","ˌkɑːr pɑːrk","停车场"],["case","keɪs","箱子"],["catch","kætʃ","赶上"],["change","tʃeɪndʒ","更换"],["charter","ˈtʃɑːr.tər","包租"],["check in","ˌtʃek ˈɪn","办理登机手续"],["check-in","ˈtʃek ɪn","登机手续"],["check out","ˌtʃek aʊt","结账离开"],["coach","koʊtʃ","教练；长途客车"],["confirm","kənˈfɜːrm","确认"],["country","ˈkʌn.trɪ","国家"],["crossing","ˈkrɔː.sɪŋ","十字路口"],["crossroads","ˈkrɔːs.roʊdz","十字路口"],["currency","ˈkɝː.ən.si","货币"],["customs","ˈkʌs.təmz","海关"],["cycle","ˈsaɪ.kəl","自行车（名词和动词）"],["cyclist","ˈsaɪ.sɪst","自行车手"],["delay","dɪˈleɪ","延误"],["delayed","dɪˈleɪd","延迟的"],["deliver","dɪˈlɪv.ər","递送"],["depart","dɪˈpɑːrt","出发"],["departure","dɪˈpɑːr.tʃər","出发"],["destination","ˌdɛs.tɪˈneɪ.ʃən","目的地"],["direction","dɪˈrɛk.ʃən","方向"],["documents","ˈdɒk.ju.mənt","文件"],["dollar","ˈdɒl.ər","美元"],["double room","ˈdʌb.əl ruːm","双人间"],["drive","draɪv","驾驶"],["driver","ˈdraɪ.vər","司机"],["driving/driver’s licence","ˈdraɪ.vɪŋ","驾驶执照"],["due","duː","预期的"],["duty-free","ˈduː.ti friː","免税的"],["embassy","ˈem.bə.sɪ","大使馆"],["euro","ˈjʊr.oʊ","欧元"],["exchange rate","ɪksˈtʃeɪndʒ reɪt","汇率"],["facilities","fəˈsɪl.ə.tiz","设施"],["far","fɑːr","远"],["fare","fer","费用"],["ferry","ˈfer.i","渡轮"],["flight","flaɪt","航班"],["fly","flaɪ","飞；苍蝇"],["foreign","ˈfɔːr.ən","外国的"],["fuel","fjuːəl","燃料"],["garage","ɡəˈrɑːdʒ","车库"],["gas / gas station","ɡæs","汽油/加油站"],["gate","ɡeɪt","大门"],["guest","ɡɛst","客人"],["guide","ɡaɪd","导游"],["guidebook","ˈɡaɪd.bʊk","导游书"],["handlebars","ˈhænd.əl.bɑːrz","把手"],["harbour","ˈhɑːr.bər","港口"],["helicopter","ˈhel.i.kɑːp.tər","直升机"],["hitchhike","ˈhɪtʃ.haɪk","搭便车"],["hotel","hoʊˈtel","酒店"],["immigration","ˌɪm.ɪˈɡræ.ʃən","移民"],["jet","dʒet","喷气式飞机"],["journey","ˈdʒɝːn.i","旅程"],["land","lænd","土地；着陆"],["leave","liːv","离开；留下"],["left","lɛft","左边；剩下的"],["light","laɪt","光；轻的"],["lorry","ˈlɔːr.i","卡车"],["luggage","ˈlʌɡ.ɪdʒ","行李"],["machine","məˈʃiːn","机器"],["map","mæp","地图"],["mechanic","məˈkæn.ɪk","机械师"],["mirror","ˈmɪr.ər","镜子"],["miss","mɪs","错过；想念"],["motorbike","ˈmoʊ.tər.baɪk","摩托车"],["motorway","ˈmoʊ.tər.weɪ","高速公路"],["move","muːv","移动"],["nationality","ˌnæʃ.əˈwæl.ə.t̬i","国籍"],["on board","ɑːn bɔːrd","在船/飞机上"],["on business","ɑːn ˈbɪz.nəs","出差"],["on foot","ɑːn fʊt","步行"],["on holiday","ɑːn ˈhɒl.ə.deɪ","度假"],["on time","ɑːn taɪm","准时"],["oil","ɔɪl","油"],["operator","ˈɑːp.ə.reɪ.tər","操作员"],["overnight","ˌoʊ.vərˈnaɪt","过夜"],["park","pɑːrk","公园；停车"],["parking lot","ˈpɑːrk.ɪŋ lɒt","停车场"],["parking space","ˈpɑːrk.ɪŋ speɪs","停车位"],["passenger","ˈpæs.ɪndʒər","乘客"],["passport","ˈpæs.pɔːrt","护照"],["path","pæθ","小径"],["petrol","ˈpetrəl","汽油"],["petrol station","ˈpetrəl steɪʃən","加油站"],["pilot","ˈpaɪ.lət","飞行员"],["platform","ˈplæt.fɔːrm","站台"],["public transport","ˈpʌb.lik ˈtræn.spɔːrt","公共交通"],["railroad","ˈreɪl roʊd","铁路"],["railway","ˈreɪl.weɪ","铁路"],["reception","rɪˈsep.ʃən","接待"],["repair","rɪˈpeər","修理"],["reservation","ˌrez.ərˈveɪ.ʃən","预订"],["reserve","rɪˈzɜːrv","预订；保留"],["return","rɪˈtɜːrn","返回"],["ride","raɪd","骑行"],["road sign","roʊd saɪn","路标"],["rocket","ˈrɑː.kɪt","火箭"],["roundabout","ˈraʊn.də.baʊt","环形交叉路口"],["route","ruːt","路线"],["sail","seɪl","航行；帆"],["scooter","ˈskuː.tər","摩托车"],["service","ˈsɜːr.vɪs","服务；公共设施"],["ship","ʃɪp","船"],["sightseeing","ˈsaɪt.siɪŋ","观光"],["signpost","ˈsaɪn.poʊst","路标"],["single room","ˈsɪŋ.ɡəl ruːm","单人间"],["spaceship","ˈspeɪs.ʃɪp","宇宙飞船"],["speed","spiːd","速度；加速"],["subway","ˈsʌb.weɪ","地铁"],["suitcase","ˈsuːt.keɪs","手提箱"],["take off","teɪk ɔːf","起飞"],["taxi","ˈtæk.si","出租车"],["tour","tʊər","旅行；巡回"],["tour guide","ˈtʊər ɡaɪd","导游"],["tourist","ˈtʊər.ɪst","游客"],["tourist information centre","ˈtʊər.ɪst ˌɪn.fərˈmeɪ.ʃən ˈsen.tər","旅游信息中心"],["traffic","ˈtræf.ɪk","交通；车流"],["traffic jam","ˈtræf.ɪk dʒæm","交通堵塞"],["traffic lights","ˈtræf.ɪk laɪts","交通灯"],["train","treɪn","火车"],["tram","træm","电车"],["translate","trænsˈleɪt","翻译"],["translation","ˌtrænsˈleɪ.ʃən","翻译"],["travel","ˈtræv.əl","旅行"],["trip","trɪp","旅行；绊倒"],["tunnel","ˈtʌn.əl","隧道"],["tyre/tire","ˈtaɪər","轮胎"],["underground","ˌʌn.dərˈɡraʊnd","地铁"],["underground train","ˌʌn.dərˈɡraʊnd treɪn","地铁"],["vehicle","ˈviː.ɪ.kəl","车辆"],["visa","ˈviː.sə","签证"],["visitor","ˈvɪz.ɪtər","访问（者）"],["waiting room","ˈweɪ.tɪŋ ruːm","候诊室"],["way","weɪ","方法；路"],["wheel","wiːl","轮子；方向盘"],["windscreen","ˈwɪn.dskriːn","挡风玻璃"]]},{"n":"天气","e":"🌦️","w":[["blow","bloʊ","吹"],["breeze","briːz","微风"],["centigrade","ˈsɛn.taɪ.ɡreɪd","摄氏度"],["cloud","klaʊd","云"],["cloudy","ˈklaʊ.di","多云的"],["cold","koʊld","冷"],["cool","kuːl","凉爽"],["degrees","dɪˈɡriːz","度"],["dry","draɪ","干燥"],["forecast","ˈfɔːr.kæst","预报"],["fog","fɔɡ","雾"],["foggy","ˈfɒɡ.i","多雾的"],["freezing","ˈfriː.zɪŋ","冰冻的"],["frozen","ˈfrəʊ.zən","冻结的"],["gale","ɡeɪl","大风"],["get wet","ɡet wet","变湿"],["heat","hiːt","热"],["hot","hɒt","热"],["humid","ˈhjuː.mɪd","潮湿"],["ice","aɪs","冰"],["icy","ˈaɪ.si","冰冷的"],["lightning","ˈlaɪt.nɪŋ","闪电"],["mild","maɪld","温和"],["rain shower","reɪn ˈʃaʊ.ər","阵雨"],["snow","snoʊ","雪"],["snowfall","ˈsnoʊ.fɔːl","降雪"],["storm","stɔːrm","风暴"],["sun","sʌn","太阳"],["sunny","ˈsʌn.i","阳光明媚"],["sunshine","ˈsʌn.ʃaɪn","阳光"],["temperature","ˈtem.pɚ.ə.tuːr","温度"],["thunderstorm","ˈθʌn.dər","雷（暴）"],["warm","wɔːrm","温暖的；热情的"],["weather","ˈwɛð.ər","天气"],["wet","wet","湿"],["windy","ˈwɪn.di","多风"]]},{"n":"工作职业","e":"👷","w":[["actor","ˈæk.tər","演员"],["actress","ˈæk.trəs","女演员"],["application","ˌæp.lɪˈkeɪ.ʃən","申请"],["apply","əˈplaɪ","申请"],["architect","ˈɑːr.kɪ.tekt","建筑师"],["army","ˈɑːr.mi","军队"],["artist","ˈɑːr.tɪst","艺术家"],["assistant","əˈsɪs.tənt","助手"],["astronaut","ˈæs.trə.nɔːt","宇航员"],["athlete","ˈæθ.liːt","运动员"],["babysitter","ˈbeɪ.biˌsɪtər","保姆"],["banker","ˈbæŋ.kər","银行家"],["barber","ˈbɑːr.bər","理发师"],["boss","bɒs","老板"],["break","breɪk","打破；休息"],["businessman","ˈbɪz.nəs.mən","商人"],["businesswoman","ˈbɪz.nəs.wʊmən","商界女性"],["butcher","ˈbʊt.tʃər","屠夫"],["cameraman","ˈkæm.ər.mən","摄影师"],["candidate","ˈkændɪ.dət","候选人"],["canteen","kænˈtiːn","食堂"],["captain","ˈkæp.tən","队长"],["career","kəˈrɪr","职业"],["chef","ʃef","厨师"],["chemist","ˈkɛm.ɪst","化学家"],["cleaner","ˈkliː.nər","清洁工"],["colleague","ˈkɒl.iːɡ","同事"],["company","ˈkʌm.pəni","公司"],["computer","kəmˈpjuː.tər","计算机"],["conference","ˈkɒn.fər.əns","会议"],["contract","ˈkɒn.traкт","合同"],["cook","kʊk","厨师"],["crew","kruː","船员"],["customs officer","ˈkʌs.təmz ˈɒfɪ.sər","海关官员"],["CV","ˌsiː ˈviː","简历"],["dancer","ˈdæn.sər","舞者"],["dentist","ˈdɛn.tɪst","牙医"],["department","dɪˈpɑːrt.mənt","设计部门"],["designer","dɪˈzaɪ.nər","设计师"],["desk","dɛsk","办公桌"],["detective","dɪˈtɛk.tɪv","侦探"],["diary","ˈdaɪ.ər.i","日记"],["diploma","dɪˈpləʊ.mə","文凭"],["director","dɪˈrɛk.tər","导演"],["diver","ˈdaɪ.vər","潜水员"],["doctor","ˈdɒk.tər","医生"],["earn","ɜːrn","赚取"],["email","ˈiː.meɪl","电子邮件"],["employ","ɪmˈplɔɪ","雇佣"],["employee","ˌɛm.plɔɪˈiː","雇员"],["employer","ɪmˈplɔɪ.ər","雇主"],["employment","ɪmˈplɔɪ.mənt","就业"],["engineer","ˌɛn.dʒɪˈnɪr","工程师"],["explorer","ɪkˈsplɔːr.ər","探险家"],["factory","ˈfæk.tər.i","工厂"],["farm","fɑːrm","农场"],["farmer","ˈfɑːr.mər","农民"],["film star","fɪlm stɑːr","电影明星"],["firefighter","ˈfaɪərˌfaɪ.tər","消防员"],["football player/footballer","ˈfʊt.bɔːl ˈpleɪ.ər","足球运 动员"],["full time","ˌfʊl ˈtaɪm","全职"],["goalkeeper","ˈɡoʊl.kiː.pər","守门员"],["guard","ɡɑːrd","警卫"],["guest guide","ɡɛst ɡaɪd","导游"],["hairdresser","ˈhɛrˌdrɛs.ər","理发师"],["housewife","ˈhaʊsˌwaɪf","家庭主妇"],["housework","ˈhaʊsˌwɜːrk","家务"],["instructions","ɪnˈstrʌk.ʃənz","指令"],["instructor","ɪnˈstrʌk.tər","教练"],["job","dʒɑːb","工作"],["journalist","ˈdʒɜːr.nəˌlɪst","记者"],["judge","dʒʌdʒ","法官"],["king","kɪŋ","国王"],["laboratory","ləˈbɔːr.ə.tɔːr.i","实验室"],["lawyer","ˈlɔɪ.ər","律师"],["lecturer","ˈlɛk.tʃər.ər","讲师"],["letter","ˈlɛt.ər","信件"],["librarian","laɪˈbreər.i.ən","图书管理员"],["manager","ˈmæn.ɪdʒər","经理"],["mechanic","məˈkæn.ɪk","技工"],["meeting","ˈmiː.tɪŋ","会议"],["message","ˈmɛs.ɪdʒ","信息"],["model","ˈmɒd.əl","模型；模特"],["musician","mjuːˈzɪʃ.ən","音乐家"],["novelist","ˈnoʊ.və.lɪst","小说家"],["nurse","nɜːrs","护士"],["occupation","ˌɑːk.jəˈpeɪ.ʃən","职业"],["office","ˈɒfɪs","办公室"],["officer","ˈɒfɪ.sər","官员（如监狱/ 警察）"],["out of work","aʊt əv wɜːrk","失业"],["owner","ˈoʊ.nər","所有者"],["painter","ˈpeɪn.tər","画家"],["part time","pɑːrt taɪm","兼职"],["photographer","fəˈtɒɡ.rə.fər","摄影师"],["pilot","ˈpaɪ.lət","飞行员"],["poet","ˈpoʊ.ət","诗人"],["policeman","pəˈliːs.mən","警察"],["police officer","pəˈliːs ˈɒfɪ.sər","警官"],["policewoman","pəˈliːsˌwʊmən","女警察"],["politician","ˌpɒl.ɪˈtɪ.ʃən","政治家"],["porter","ˈpɔːr.tər","搬运工"],["postman","ˈpoʊs.tmən","邮递员"],["president","ˈprez.ɪ.dənt","总统"],["profession","prəˈfɛʃ.ən","专业"],["professional","prəˈfɛʃ.ə.nəl","专业人士"],["professor","prəˈfɛs.ər","教授"],["programmer","ˈkəm.pjuː.tər ˈprəʊ.ɡræ.mər","程序员"],["publisher","ˈpʌb.lɪʃ.ər","出版商"],["qualification","ˌkwɒl.ɪ.fɪˈkeɪ.ʃən","资格"],["queen","kwiːn","女王"],["quit","kwɪt","辞职"],["receptionist","rɪˈsɛp.ʃə.nɪst","接待员"],["reporter","rɪˈpɔːr.tər","记者"],["retire","rɪˈtaɪər","退休"],["retirement","rɪˈtaɪər.mənt","退休"],["sailor","ˈseɪ.lər","水手"],["salary","ˈsæl.ə.ri","薪水"],["sales assistant","seɪlz əˈsɪs.tənt","销售助理"],["salesman","ˈseɪlz.mən","销售员"],["saleswoman","ˈseɪlz.wʊmən","女销售员"],["scientist","ˈsaɪən.tɪst","科学家"],["secretary","ˈsek.rə.ter.i","秘书"],["security guard","sɪˈkjʊr.ə.t̬i ɡɑːrd","安保人员"],["shop assistant","ʃɒp əˈsɪs.tənt","店员"],["shopper","ˈʃɒp.ər","购物者"],["singer","ˈsɪŋ.ər","歌手"],["soldier","ˈsoʊl.dʒər","士兵"],["staff","stæf","员工；全体职员"],["student","ˈstuː.dənt","学生"],["taxi driver","ˈtæk.si ˈdraɪ.vər","出租车司机"],["teacher","ˈtiː.tʃər","教师"],["tennis player","ˈten.ɪs ˈpleɪ.ər","网球运动员"],["tour guide","tʊər ˈɡaɪd","导游"],["trade","treɪd","贸易；行业"],["travel agent","ˈtræv.əl ˈeɪ.ʒənt","旅行社"],["unemployed","ˌʌn.emˈplɔɪd","失业的"],["uniform","ˈjuː.nɪ.fɔːrm","制服"],["volunteer","ˌvɑl.ənˈtɪr","志愿者"],["wages","weɪdʒ","工资"],["waiter","ˈweɪ.tər","服务员"],["waitress","ˈweɪ.tər.ɪs","女服务员"],["work","wɜːrk","工作"],["worker","ˈwɜːr.kər","工人"]]},{"n":"PET固定词组搭配","e":"🔗","w":[["achieve success","","取得成功","强调通过自身努力、行动或一系列过程最终获得成功","He worked hard to achieve success in his exams."],["take action","","采取行动","指采取某种具体的行动来应对情况或解决问题","We should take action to protect the environment."],["take a risk","","冒险","指愿意承担风险去做某事","Don't take a risk when you cross the road."],["can/can’t afford to","","能/ 不能负担得起","表示是否有经济能力去做某事","I can't afford to buy a new dress."],["agree with sb.","","同意某人","指对某人的观点、意见或建议表示认同","I agree with my friend on this issue."],["allow sb. to do sth.","","允许某人做某事","指给予某人许可去做某事","My parents allow me to watch TV on weekends."],["apply for","","申请","指申请某个职位、机会或事物","He applied for a job in a big company."],["argue about sth.","","争论……","指就某个问题或事物进行争论","They often argue about which movie is better."],["arrange for","","安排……","指安排某个活动、事情或人员","She arranged for a party next week."],["make an attempt/ try","","尝试","指试图去做某事","He made an attempt to climb the mountain."],["keep balance","","保持平衡","指维持身体或事物的平衡状态","We should keep balance in our life."],["believe in","","相信","指对某个事物、人或观念表示信任","I believe in myself."],["belong to","","属于","指某个事物属于某人或某个群体","This book belongs to me."],["benefit from","","从……中受益","指从某个事物中获得好处","We can benefit from reading books."],["pay bill","","付账","指支付费用、账单等","He pays the bill."],["blame for","","责备","指因为某个原因而责备某人或某事","He was blamed for being late."],["make a reservation","","预定","指提前预订某个服务、物品或场所","I made a reservation for a hotel room."],["break down","","出故障","指某个机器、设备或系统出现故障","The car broke down on the way."],["break up","","解散","指某个组织、团体或聚会解散","The club broke up last year."],["bring up","","养育","指抚养、教育孩子","My parents brought me up well."],["call for sb","","去接某人","指去某个地方接某人","I will call for my friend tomorrow."],["carry out","","执行","指执行某个计划、任务或指令","We should carry out the plan carefully."],["take care of","","照顾，照看","指照顾某人或某物","My mother takes care of my younger brother."],["look after","","照顾，照看","指照顾某人或某物","She looks after her grandparents well."],["carry on","","继续做……","指继续进行某个活动或工作","He carried on working despite the noise."],["keep on doing sth.","","继续做某事","指继续做某个动作","He keeps on reading books in his free time."],["have chance to do sth.","","有机会做……","指有机会去做某事","I have a chance to travel abroad next year."],["have an opportunity to do","","有机会做……","指有机会去做某事","He has an opportunity to work in a large company."],["sth chat with sb.","","和……聊天","指和某人聊天","I like to chat with my friends online."],["check out","","结账；退房","指在酒店、宾馆等场所办理结账手续","He checked out at a hotel this morning."],["communicate with sb.","","与……交流","指和某人进行交流","I communicate with my friends through text messages."],["compete with sb.","","与……竞争","指和某人或某个群体竞争","They compete with each other in sports."],["complain about sth.","","抱怨某事","指对某事进行抱怨","They complain about the traffic jam."],["focus on","","关注，全神贯注","指将注意力集中在某个事物上","We should focus on our studies."],["concentrate on","","关注，全神贯注","指将注意力集中在某个事物上","We should concentrate on our studies."],["consist of","","由……组成","指某个事物由多个部分组成","This team consists of five members."],["make history","","创造历史，载入史册","指做出具有重大历史意义的事情","He made history by inventing a new technology."],["cross out","","划掉；删去","指在某个文本上划掉或删去某个内容","Please cross out the wrong answer."],["cut up","","切","指将某个物体切成小块","Cut up the apple into small pieces."],["decide to do sth.","","决定去做某事","指下定决心去做某事","He decided to do something new."],["depend on","","依靠……","指依靠某个事物、人或群体","I depend on my parents for support."],["pay a deposit","","付押金","指支付一定金额的押金","He paid a deposit for the apartment."],["develop a habit","","培养习惯","指通过一系列行为培养某种习惯","I develop a habit of reading every day."],["make an effort","","努力……","指付出努力去做某事","You should make an effort to learn English."],["come into","","进入，参加","指进入某个场所或参与某个活动","He came into the room quietly. She came into the competition."],["expect to do sth……","","期待去做……","指内心期待去做某个事情","I expect to see you soon."],["expect sb. to do sth..","","期待某人去做……","指期待某人去做某个事情","I expect my mother to come home early."],["feel like","","想要","指内心有某种欲望或感觉想要做某事","I feel like eating an ice cream."],["fill in","","填入","指在某个空格或区域内填写内容","Please fill in the form carefully."],["fill up","","填饱（肚子）","指通过进食使肚子饱胀","I need to fill up before I go to work."],["find out","","发现，找出","指通过寻找或探究得知某个事实或信息","I need to find out the answer to this question."],["keep fit/ healthy","","保持健康","指通过某种方式维持身体的健康状态","We should keep fit by exercising regularly."],["gain experience","","获得经验","指通过某种方式获取经验","You can gain experience by working."],["get along with","","和……相处","指与某人建立良好的关系并友好相处","I get along with my classmates well."],["do experiment","","做实验","指进行科学实验或其他类型的实验","We do experiment in the laboratory."],["do good to","","对……有益","指对某个事物或人产生有益的影响","Eating fruits does good to our health."],["do one’s (his, her,their) best","","尽力……","指尽自己最大的努力去做某事","I will do my best to study English."],["make progress","","取得进步","指在某个方面取得进展或提高","You should make progress in your studies."],["get rid of","","去除，去掉","指消除某个事物或摆脱某个情况","We need to get rid of the bugs in the garden."],["give back","","回来，归还","指将某个事物归还给原主","Please give back my book."],["give up","","放弃","指停止做某个事情，不再坚持","He gave up smoking."],["go with","","匹配","指两个事物相互搭配或适合","This shirt goes with those pants."],["hand in","","上交","指将某个事物交给上级或相关人员","Please hand in your homework."],["hand out","","发下去","指将某个事物分发给其他人","The teacher handed out the papers."],["deal with","","处理","指对某个问题或情况进行处理","We need to deal with the traffic jam."],["get along well with sb.","","和……相处很好","指与某人建立非常友好的关系","I get along well with my friends."],["hang up a phone call","","挂掉电话","指结束通话并挂断电话","He hung up the phone call after talking for a while."],["hold up","","延迟，延误","指某个事情或活动被推迟或耽搁","The flight was held up because of the rain."],["plan to do","","打算做……计划做……","指内心有计划去做某个事情","I plan to go on a trip next year."],["intend to do","","打算做……","指内心有计划去做某个事情","He intends to study hard."],["get involved","","参与，介入","指参与某个活动或介入某个事情","I get involved in the project."],["join the army","","参军","指加入军队成为军人","He joined the army last year."],["knock down","","击倒","指把某人或某物打倒","He knocked down the opponent in the boxing match."],["laugh at","","嘲笑","指因别人的缺点或错误而取笑","Don't laugh at others when they make mistakes."],["tell a lie","","说谎","指故意说出不真实的话","Don't tell a lie."],["take a lift","","搭便车","指乘坐别人的车以到达目的地","I took a lift from a stranger."],["make a living","","谋生，赚钱生活","指通过某种方式获取生活所需的经济来源","He makes a living by selling fruits."],["look forward to doing","","期待做……","指怀着愉快的心情等待某事发生","I look forward to seeing you again."],["look like","","看起来像……","指外观上与某个事物相似","She looks like her mother."],["look up","","查阅……","指在书籍等资料中查找信息","You can look up the word in the dictionary."],["make sure","","确信，确保","指采取措施保证某事是真实的或会发生","Make sure you lock the door before you go to bed."],["persuade sb. to do sth……","","劝说某人去做……","指试图说服某人去做某事","She persuaded me to go shopping with her."],["pick up","","捡起，学会","根据语境有不同含义，如拾起物品、学会知识等","Pick up the book from the floor. He picked up French quickly."],["play a record/ cassette/CD","","播放一个磁带 / CD","指播放音乐或其他录音","She plays a CD after dinner."],["post a letter","","寄一封信","指将信件投入邮筒或交给邮局等以寄出","I post a letter to my friend every week."],["prepare for","","为……准备","指为即将到来的事情做好安排等","We should prepare for the exam."],["press a button","","按按钮","指用手指等按下某个按钮","Press a button to start the machine."],["prevent sb. from doing sth.","","阻止某人做……","指采取措施不让某人做某事","The rain prevented us from going out."],["promise to do sth……","","许诺做……","指承诺去做某事","He promised to help me with my homework."],["keep a promise","","遵守诺言，履行诺言","指兑现自己的承诺","You should keep a promise."],["put down","","记下，放下","指将手中的东西放下或记录信息","Put down the book. Put down his phone number."],["put on","","穿上；体重增加","指穿上衣服或表演节目等","Put on your coat. They are going to put on a play."],["put out a fire","","灭火","指熄灭火焰","The firefighters put out the fire quickly."],["win a race","","赢得比赛","指在比赛中获得胜利","He won a race yesterday."],["defeat sb.","","打败某人","指在竞争中战胜某人","Our team defeated theirs."],["raise your arm","","举起胳膊","指将胳膊向上抬起","Raise your arm if you know the answer."],["raise prices","","涨价","指提高商品的价格","The store raised prices on some items."],["get ready for","","为……准备好","指为即将发生的事情做好准备","We should get ready for the party."],["recover from","","从……中恢复","指从疾病、困境等中恢复过来","He is recovering from his illness."],["make a request","","提出要求","指提出某个请求","You can make a request to the teacher."],["search for","","寻找……","指努力寻找某个丢失的东西或人","I am searching for my keys."],["ring back","","回电话","指给某人回拨电话","I will ring back later."],["run a business","","经营企业","指管理和运营企业","He runs a small business."],["run out of","","用完","指消耗完某种物品","We ran out of milk."],["save money","","省钱","指积攒或节省金钱","I am trying to save money for a trip."],["keep secret","","保密","指不将某事告诉别人","You should keep it secret."],["send out","","寄出，发出","指将物品发送出去","The company sent out the products."],["set free","","释放","指让某人或某物获得自由","The prisoners were set free."],["set out","","出发","指开始一段旅程或开始做某事","We set out early in the morning."],["set off","","出发，动身，使爆炸","指离开某个地方开始旅程或引爆炸弹等","We set off on our trip."],["set up a lab","","建立（一个实验室）","指创建一个实验室","They set up a lab for experiments."],["keep guard","","站岗，守卫","指负责站岗保卫某个地方","The soldiers keep guard at the border."],["sum up","","合计，总结","指对内容进行提炼、归纳","Let's sum up what we have learned today."],["take away","","带走，拿走","指把某物从一个地方移到另一个地方","Take away the trash."],["take up","","开始从事","指开始进行某项活动或学习某种技能","He took up painting last year."],["tell a story","","讲故事","指讲述一个故事","She told a story to the children."],["have a temperature","","发烧","指身体体温升高","He has a temperature and needs to see a doctor."],["throw away","","扔掉","指丢弃某物","Don't throw away the old books."],["tidy up","","收拾，整理","指把物品整理整齐","Tidy up your room before guests come."],["try to do sth","","努力做……","指尽力去做某事","I try to learn English well."],["try doing sth","","尝试着做……","指尝试做某事以看效果","I try reading books in English to improve my language skills."],["turn on","","打开","指开启电器等设备","Turn on the light."],["turn off","","关闭","指关闭电器等设备","Turn off the TV before you go to bed."],["turn down","","关小","指降低音量、温度等","Turn down the music. It's too loud."],["wear off","","消失","指某种效果逐渐消失","The painkiller will wear off soon."],["wear out","","穿破；磨损","指衣物等因使用而破损","My shoes are worn out."],["reach someplace","","到达某地","指抵达某个地点","We reached the top of the mountain."],["get to somplace","","到达某地","和 “reach someplace” 意思相近","I got to school on time."],["worry about","","对……担心","指为某人或某事感到担忧","Don't worry about me."],["write out","","写出","指把内容书写出来","Write out your answers neatly."],["tell a joke","","讲笑话","指讲述一个幽默的故事","He told a joke and made everyone laugh."],["tell the truth","","说实话","指说出真实的情况","You should always tell the truth."],["bump into","","撞见","指意外地碰到某人或某物","I bumped into an old friend on the street."],["work out the maths problems","","做出数学题","指解决数学问题","She worked out the maths problems easily."],["let someone down","","让……失望","指使某人感到失望","Don't let your parents down."],["make sb. disappointed","","让某人失望","和 “let someone down” 意思相近","His behavior made me disappointed."],["sign a contract","","签合同","指签署一份合同文件","They signed a contract with the company."],["get in (a taxi, a car)","","上出租车，进入小汽车","指进入交通工具内部","Get in the car quickly."],["head for","","前往","指朝着某个方向前进","We are heading for the beach."],["think about","","思考，考虑","指对某个问题进行思考","Think about your future carefully."],["turn into","","变成","指从一种状态转变为另一种状态","The caterpillar turns into a butterfly."],["make a mess","","弄乱，弄得乱七八糟","指把某个地方弄得混乱","Don't make a mess in the room."],["make money","","挣钱","指通过工作等方式获取金钱","He makes money by selling fruits."],["make room","","腾出地方，让出地方","指为某人或某物创造空间","Make room for the new bookshelf."],["make up one's mind","","决定","指下定决心做某事","I made up my mind to study harder."],["connect with","","与……连接","指与某物建立连接","Connect with the internet."],["keep a record","","保持记录","指记录某事","Keep a record of your expenses."],["break a record","","打破记录","指在某个领域创造新的记录","He broke a world record in swimming."],["go abroad","","出国","指离开自己所在的国家到其他国家去","She wants to go abroad for a holiday next year."],["go ahead","","直走，继续","可单独使用表示许可或继续前行；也可接 with sth. 表示继续做某","Go ahead! Go ahead with your work."],["stay alone","","独自呆着","事 指一个人单独待在某个地方","He likes to stay alone in his room."],["arrive at/in","","到达某地","指到达某个地点，“at” 后接小地点，“in” 后接大地点","He arrived at the station at 8 o'clock. He arrived in Beijing yesterday."],["wake up","","醒来","指从睡眠中苏醒过来","I usually wake up at 6 o'clock in the morning."],["grow up","","成长","指孩子长大成人","I grew up in a small town."],["calm down","","静下来","指让情绪或环境安静下来","Please calm down and listen to me."],["check in","","登记入住","指在酒店、宾馆等场所办理入住手续","He checked in at a hotel last night."],["come down","","下降","指某个数值、高度或数量下降","The price came down last week."],["come on","","快点","指催促某人加快速度","Come on! We're running late."],["go downstairs","","去楼下","指从当前位置移动到楼下","I need to go downstairs to get my book."],["get off","","动身","指离开某个地方开始出发","We should get off early in the morning."],["take off","","起飞；脱掉衣服","指飞机离开地面起飞，或脱去身上的衣物","The plane takes off at 8 o'clock. I take off my coat when I come inside."],["go out","","出来","指从某个封闭的空间内走出","Let's go out for a walk."],["take place","","发生","指某个事件或活动发生","The concert will take place next week."],["look out","","小心！！！","用于提醒别人注意危险或特别的情况","Look out! There's a car coming."],["run in a race","","参加跑步比赛","指参与跑步比赛","She ran in a race last weekend."],["go sightseeing","","观光","指游览名胜古迹等","We went sightseeing in the city."],["stay behind","","留下来","指在别人离开后继续留在某个地方","I stayed behind to clean the classroom."],["go straight","","直走","指沿着直线方向前进","Go straight and you will see the park."],["behave well","","守规矩","指行为举止得体","You should behave well in public."],["be able to","","能够","强调通过努力、学习或特定条件下获得的能力","I am able to swim after learning for a month."],["be unable to","","不能够","表示缺乏某种能力，可能是因为自身条件限制或未满足相关要求","He is unable to ride a bike because he has never learned."],["feel lonely","","感觉孤独","指内心感到孤独、寂寞","She feels lonely when she is alone."],["get annoyed","","恼怒的","指因为某事而感到生气、恼怒","He gets annoyed when people are late."],["be anxious about","","对……担忧","指内心对某事感到担心、忧虑","She is anxious about her exam results."],["be ashamed of","","对……感到羞愧","指对自己的某个行为或情况感到羞耻","He is ashamed of his bad behavior."],["be based on","","以……为基础","指以某个事物为依据或基础","This theory is based on many experiments."],["be born in","","出生在……年","指出生的年份","He was born in 1990."],["be curious about","","对……好奇","指对某个事物感到好奇","I am curious about the stars."],["be different from","","与……不同","指与某个事物存在差异","This book is different from that one."],["be divided into","","被分成……","指某个整体被划分成若干部分","The cake is divided into eight pieces."],["be familiar with","","对……熟悉","指对某个事物有一定的了解和认识","I am familiar with this city."],["be famous for","","以……著名","指因为某个特点或事物而闻名","This city is famous for its beautiful scenery."],["be fascinated by","","被……所着迷","指被某个事物深深吸引","He is fascinated by music."],["be keen on","","喜欢，热爱","指对某个事物有强烈的喜爱之情","I am keen on reading books."],["be fond of","","喜欢","指对某个事物有喜爱之情","She is fond of music."],["be interested in","","对……感兴趣","指对某个事物产生兴趣","I am interested in science."],["be jealous of","","嫉妒……","指对某人或某物产生嫉妒之情","Tom is jealous of Mary because she has a new toy."],["be likely to do sth","","有可能……","表示某种情况发生的可能性较大","He is likely to come late."],["be made of","","由……制成","表示某个物品的材料可以直接看出","This table is made of wood."],["be made from","","由……制成","表示某个物品的材料经过加工后难以直接看出","Paper is made from wood."],["be popular with","","受……欢迎","指受到某人的喜爱或欢迎","This singer is popular with young people."],["be proud of","","自豪，高兴","指对某人或某事感到骄傲","I am proud of my country."],["be responsible for","","对……负责任","指对某事承担责任","You should be responsible for your actions."],["be satisfied with","","对……满意","指对某人或某事感到满意","I am satisfied with my new bike."],["be full of","","装满……","指某个容器或地方充满了某物","The box is full of toys."],["be filled with","","装满……","和 “be full of” 意思相近","The room is filled with people."],["be well-known for","","以……著名","指因某个特点或事物而闻名","This city is well-known for its beautiful scenery."],["be guilty about","","对……感到内疚","表示因某事而感到内疚","He is guilty about lying."],["internet access","","互联网接用","指连接和使用互联网的行为或能力","We need good internet access for online learning this semester."],["alarm clock","","闹钟","用于提醒时间的装置","The alarm clock wakes me up every morning."],["music album","","音乐专辑","指收集了多首音乐作品的专辑","I have a music album of my favorite singer."],["rubbish bin","","垃圾桶","用于存放垃圾的容器","Please put the rubbish in the bin."],["boarding pass","","登机牌","用于登机时的凭证","You need to show your boarding pass at the gate."],["identity card (ID card )","","身份证","用于证明个人身份的证件","You need to show your ID card when you enter some places."],["main course","","主菜","指一顿饭中的主要菜品","The main course was steak."],["tennis court","","网球场","指进行网球比赛或练习的场地","There is a tennis court near my house."],["football field","","足球场","指进行足球比赛或练习的场地","There is a football field near my house."],["customs officer","","海关官员","指在海关工作的人员","The customs officer checked my luggage."],["hard disk","","硬盘","指计算机中的存储设备","The hard disk stores a lot of data."],["driving licence","","驾照","用于证明具备驾驶机动车资格的证件","You need a driving licence to drive a car."],["exchange rate","","汇率","指两种货币之间的兑换比率","The exchange rate between the dollar and the euro changes daily."],["film maker","","电影制片人","指制作电影的人","The film maker created a great movie."],["flight attendant","","飞行服务员","指在飞机上为乘客提供服务的人员","The flight attendant served the passengers well."],["weather forecast/ report","","天气预报","指对天气情况的预测和报告","The weather forecast says it will rain tomorrow."],["full time job","","全职工作","指需要投入全部工作时间的工作岗位","He has a full time job in a company."],["part time job","","兼职工作","指不需要投入全部工作时间的工作岗位","She has a part time job in a store."],["further information","","进一步信息","指更多的相关信息","I need further information about this topic."],["global warming","","全球变暖","指地球的气温逐渐升高的现象","Global warming is a serious problem."],["musical instrument","","乐器","指用于演奏音乐的器具","I play a musical instrument."],["traffic jam","","交通堵塞","指道路上车辆过多导致无法顺畅通行的情况","There is a traffic jam on the road."],["latest movie","","最新的电影","指最近上映的电影","I want to watch the latest movie."],["a loaf of bread","","一长条面包","指一条面包","I bought a loaf of bread at the bakery."],["lost property office","","失物招领","指专门负责保管失物并等待失主认领的地方","I went to the lost property office to look for my lost wallet."],["make-up","","化妆品","指用于美容的物品","She put on some make-up before going out."],["mobile phone","","手机","指可以随身携带的通讯设备","I use my mobile phone to call my friends."],["opening hours","","营业时间","指商店、机构等开放的时间段","The opening hours of the library are from 9 am to 6 pm."],["petrol station","","加油站","指提供汽油等燃料的地方","I need to stop at a petrol station to fill up my car."],["post office","","邮局","指专门处理邮件等事务的机构","I went to the post office to buy stamps."],["tennis racket","","网球球拍","指用于打网球的工具","I need a new tennis racket."],["return ticket","","回程票","指用于返回的车票","I need to buy a return ticket."],["right person","","合适的人","指符合特定要求的人","He is the right person for the job."],["right size","","合适的尺寸","指合适的大小尺寸","This shirt is the right size for me."],["seat belt","","安全带","指用于保护乘客安全的带子","Please fasten your seat belt."],["second school","","中学","指中等教育阶段的学校","I go to a second school."],["a TV series","","电视连续剧","指一系列连续播放的电视剧","I am watching a TV series."],["department store","","百货商场","指售卖各种商品的大型商店","I went to the department store to buy clothes."],["race track","","跑道","指用于赛跑等的场地","The athletes are running on the race track."],["a true friend","","真正的朋友","指真诚可靠的朋友","A true friend is always there when you need them."],["way of life","","生活方式","指一个人的生活习惯和模式","A healthy way of life is important."],["way in","","入口","指进入某个地方的通道","Look for the way in to the park."],["way out","","出口","指离开某个地方的通道","Find the way out quickly."],["the whole world","","全世界","指整个地球或全球范围","We should care about the whole world."],["according to","","根据","表示依据某个事物、观点或信息来源","According to the teacher, we should read more books."],["in addition","","另外，额外的","用于在原有内容基础上添加新的信息","In addition, I have a pen and a book."],["at the cost of","","以……样的价钱","表示以某种代价来获取某物","He bought the toy at the cost of 5 yuan."],["aim at","","目标，瞄准","指将注意力、行为或物体指向某个目标","He aimed at the target carefully."],["in spite of","","尽管","用于表示尽管存在某种不利因素，但仍然会发生某事","In spite of the rain, we had a great time."],["apart from","","除了","用于表示除了某些事物之外还有其他情况","Apart from English, I also like French."],["except for","","除了","用于表示整体中除了某个部分之外的情况","The composition is good except for a few spelling mistakes."],["as well as","","也","用于连接两个并列成分，表示两者都有某种情况","He as well as his friends likes music."],["on board","","在（飞机、轮船、火车）上","指在交通工具上","The passengers are on board now."],["at the bottom","","在底部","指在某个物体的底部位置","The book is at the bottom of the shelf."],["by accident","","偶然地","指意外地、偶然地发生某事","I found this book by accident."],["by hand","","手工","指用手工制作或完成某事","This sweater was made by hand."],["by mistake","","错误地","指因为错误而发生某事","I took the wrong bag by mistake."],["by name","","按照姓氏","指根据姓氏来识别或称呼某人","The teacher called the students by name."],["on display","","展示","指将某个物品展示出来供人观看","The paintings are on display in the museum."],["due to","","由于，因为","表示原因，用于解释某个结果是由某个原因导致的","Due to the rain, the game was cancelled."],["in exchange for","","交换","指用某个事物换取另一个事物","I gave him my book in exchange for his pen."],["in the heart of","","在……的中心","指位于某个区域的中心位置","The museum is in the heart of the city."],["in case of","","万一，如果","指在某种可能发生的情况出现时","In case of fire, call 119."],["in danger","","有……的危险，陷入危险","指某个事物或人面临危险","The baby is in danger."],["in front of","","在……的前面","指位于某个物体的前面位置","The tree is in front of the house."],["in public","","公开的，当众","指在公众场合","Don't talk loudly in public."],["instead of","","而不是，代替","指用某个事物代替另一个事物","I will have tea instead of coffee."],["on the internet","","在网上","指在互联网环境中","We can find a lot of information on the internet."],["lack of","","缺少……","表示缺乏某种事物","There is a lack of water in this area."],["in the middle of","","在……的中间","指位于某个物体的中心位置","The book is in the middle of the table."],["on……occasion","","在……场合","表示在特定的情境或时刻","He is always polite on formal occasions."],["on business","","出差，因公","指因工作事务外出","He is on business trip this week."],["on fire","","着火","指某个物体燃烧起来","The house is on fire."],["on foot","","走着，步行","指通过走路的方式移动","I go to school on foot."],["on holiday","","度假","指处于休假的状态","They are on holiday in Hawaii."],["on purpose","","故意的","指有意地做某事","He broke the cup on purpose."],["on request","","要求","表示根据要求提供某物","The information is provided on request."],["on sale","","打折出售","指商品可供销售或正在进行促销活动","These clothes are on sale."],["on time","","按时","指按照规定的时间到达或完成某事","We should arrive at school on time."],["out of work","","失业，没有工作","指没有工作的状态","He is out of work now."],["in sight","","在视力范围之内，被看到","指可以看到某个物体或人","The ship is in sight."],["out of sight","","看不见","指某个物体或人不在视线范围内","The car disappeared out of sight."],["on the phone","","在接电话","指正在通过电话交谈","She is on the phone now."],["as well","","也","用于句末表示并列关系","I like apples, and I like bananas as well."],["no longer","","不再","用于表示某个行为或情况已经停止，不再发生","He no longer smokes."],["at first","","起初","用于表示在某个过程的开始阶段","At first, I didn't like this book. But later I found it very interesting."],["at last/ finally","","最后","用于表示在某个过程的结束阶段","At last, I finished my work."],["at least","","至少","用于表示某个数量或程度的最低限度","You should study at least two hours every day."],["at once","","马上，立即","用于表示立即去做某事","Please come here at once."],["at present","","目前","用于表示当前的时间或情况","At present, I am studying for an exam."],["at the same time","","同时","用于表示两个或多个事情同时发生","At the same time, I am reading a book and listening to music."],["not ……at all","","根本不","用于加强否定语气","I don't like this movie at all."],["in detail","","具体的","指详细地、全面地描述某个事物","He described the event in detail."],["first of all","","首先","用于在一系列事情中首先提及某个事项","First of all, we need to clean the classroom."],["in future","","在将来","指未来的某个时间或时间段","We should be careful in future."],["in a hurry","","匆忙","指做事的速度很快，没有足够的时间","He left in a hurry."],["in advance","","提前","指在某个时间点之前","We should book the tickets in advance."],["in any case","","无论如何","指不管在什么情况下","In any case, we should be careful."],["in the end","","最后","指在某个过程的最后阶段","In the end, we found the solution."],["in turn","","依次，轮流","指按照顺序依次进行","The students introduced themselves in turn."],["in fact","","事实上","用于强调某个事实或真实情况","In fact, I like reading books very much."],["even though","","尽管，即使","表示尽管存在某种情况，但仍然会发生某事","Even though it is raining, I will go to school."],["even if","","尽管，即使","表示尽管存在某种情况，但仍然会发生某事","Even if you don't believe me, it is true."],["large amount of","","大量的，很多","用于描述数量较多的不可数名词","There is a large amount of water in the pool."],["a number of","","许多","用于描述数量较多的可数名词","A number of students are playing in the playground."],["a bit of","","一点……","用于描述数量较少的不可数名词","There is a bit of milk in the cup."],["both……of……","","两者都……","指两个事物都具有某种情况","Both of the books are very interesting."],["all of ……","","三者或以上都……","指三个或更多事物都具有某种情况","All of the students passed the exam."],["in good condition","","状况良好","指某个物体或人处于良好的状态","The car is in good condition."],["a couple of","","几个","指数量不多的几个","A couple of students are standing there."],["It’s difficult to do sth.","","做……很难","指某个行为或任务具有较高的难度","It’s difficult to solve this problem."],["It's sensible to do sth.","","做……是明智的","指某个行为或任务是明智的选择","It’s sensible to save money."],["It's hard to do sth.","","做……是很难的","指某个行为或任务具有较高的难度","It’s hard to climb that mountain."],["It's possible to do sth.","","做……是可能的","用于描述某个行为或动作存在发生的可能性","It is possible to achieve your dreams if you work hard."],["It's impossible to do sth.","","做……是不可能的","表示某事无法做到","It's impossible to fly without wings."],["either……or……","","两者之一，要么……要么……","用于表示在两个选项中进行选择","Either you come with me or you stay here."],["neither……nor……","","两者都不","用于否定两个事物或情况","Neither he nor she likes coffee."],["for example","","比如，例如","用于举例说明某个观点或事物","There are many fruits, for example, apples and bananas."],["such as","","比如","用于列举多个类似的事物","I like many colors, such as red, blue and green."],["extremely(very) good","","非常好","用于强调某个事物的良好程度","The food was extremely good."],["the following day","","第二天","指某个特定日期之后的那一天","We will go to the park the following day."],["the following year","","第二年","指某个特定年份之后的那一年","He will graduate the following year."],["in general","","大体上","用于概括性地描述某个事物或情况","In general, people like to travel."],["in order to","","为了……","指为了达到某个目的","In order to learn English well, we should practice every day."],["for instance","","比如","用于举例说明某个观点或事物","There are many fruits, for instance, apples and bananas."],["rather than","","而不是","指在两个事物中选择其中一个，否定另一个","I would like to go to the park rather than stay at home."],["less expensive","","没那么贵","表示价格相对较低","This shirt is less expensive than that one."],["at lunchtime","","在午餐时间","指中午吃饭的时间段","I usually have a rest at lunchtime."],["at midnight","","在午夜","指半夜十二点的时候","I was still awake at midnight."],["at the moment","","此刻，现在，目前","指当前的时间","I am busy at the moment."],["one……the other……","","一个……另一个","用于描述两个事物中的分别情况","I have two apples. One is red, the other is green."],["out of date","","过时的，陈旧的","表示某个事物不再流行或适用","This dress is out of date."],["plenty of","","很多","用于形容数量较多，可以修饰可数或不可数名词","There are plenty of books on the shelf."],["a range of……","","一系列……","表示众多不同的事物","There is a range of books in the library."],["the reason why","","……的原因是","用于解释某事的原因","The reason why I am late is that I missed the bus."],["as a result","","结果","表示某个行为或事件的结果","He didn't study hard. As a result, he failed the exam."],["sold out","","卖光","指商品全部售罄","The tickets are sold out."],["since then","","自从那时","指从某个特定的时间点开始","Since then, I have never seen him again."],["every single day","","每一天","指每天都发生的事情","I go to school every single day."],["to one’s (my, her, his, their) surprise","","让……惊讶的是","用于表示意外或惊讶的情况","To my surprise, he won the game."],["as soon as /when","","一……就……","用于引导时间状语从句","I will call you as soon as I arrive."],["sort of","","种类","表示某种类型或类别","This is sort of book I like."],["type of","","类型","指某个事物的种类","What type of music do you like?"],["It’s supposed to do ……","","推测应该是……","用于表达推测某种情况","It's supposed to rain tomorrow."],["well made","","样子好，做工考究","表示制作精良","This shirt is well made."],["up to","","高达……","表示数量、程度等达到某个范围","The cost is up to $100."],["up to date","","最新的","指处于最新的状态","This information is up to date."],["used to do sth","","曾经，过去常常……","指过去经常做某事","I used to play basketball after school."]]}];

  var CATS = [], ALL = [], WORDMAP = {}, CATMAP = {};
  RAW.forEach(function(cat, ci){
    var c = { id:'c' + ci, name:cat.n, emoji:cat.e, list:[] };
    CATS.push(c); CATMAP[c.id] = c;
    cat.w.forEach(function(t){
      var item = { w:t[0], ipa:t[1] || '', c:t[2], cat:c.id, u:t[3] || '', ex:t[4] || '' };
      ALL.push(item);
      if(!WORDMAP[item.w]) WORDMAP[item.w] = item;
      c.list.push(item);
    });
    c.total = c.list.length;
  });

  /* ================= 存储：按名字分档案 ================= */
  var KEY = 'petWords.v3';
  var OLD = 'petWords.v2';

  function newProfile(name){
    return {
      name: name, avatar: '🦊',
      stars: 0, spent: 0, lastDay: '', days: [],
      ptr: {}, wrong: {}, learned: {},
      sessions: 0, correct: 0, questions: 0,
      redeemed: [], custom: [], history: [], lastCat: 'all',
      campaign: { level: 0, lap: 0, cur: 0, best: 0, wins: 0, laps: 0, flagAt: '' }
    };
  }

  var store = null, state = null;

  function fixProfile(p, k){
    var d = newProfile(k);
    for(var f in d){ if(p[f] === undefined) p[f] = d[f]; }
    if(!Array.isArray(p.days)) p.days = [];
    if(!Array.isArray(p.redeemed)) p.redeemed = [];
    if(!Array.isArray(p.custom)) p.custom = [];
    if(!Array.isArray(p.history)) p.history = [];
    if(!p.ptr || typeof p.ptr !== 'object') p.ptr = {};
    if(!p.wrong || typeof p.wrong !== 'object') p.wrong = {};
    if(!p.learned || typeof p.learned !== 'object') p.learned = {};
    if(!p.campaign || typeof p.campaign !== 'object') p.campaign = { level: 0, lap: 0, cur: 0, best: 0, wins: 0, laps: 0, flagAt: '' };
    ['level','lap','cur','best','wins','laps'].forEach(function(f){
      if(typeof p.campaign[f] !== 'number' || isNaN(p.campaign[f])) p.campaign[f] = 0;
    });
    if(p.campaign.level >= 20){                   // 旧版通关记录 → 转成第 1 周目
      p.campaign.level = 0;
      p.campaign.lap = Math.max(1, p.campaign.lap | 0);
    }
    if(p.campaign.level < 0) p.campaign.level = 0;
    p.name = k;
    return p;
  }

  function loadStore(){
    var def = { active:'MARK', profiles:{ MARK:newProfile('MARK') }, settings:{ count:20, mode:'order', sound:true, volume:0.7, speechMode:'auto' } };
    var s = null;
    try{ s = JSON.parse(localStorage.getItem(KEY) || 'null'); }catch(e){ s = null; }
    if(s && s.profiles && typeof s.profiles === 'object' && Object.keys(s.profiles).length){
      s.settings = Object.assign({}, def.settings, s.settings || {});
      Object.keys(s.profiles).forEach(function(k){ s.profiles[k] = fixProfile(s.profiles[k], k); });
      if(!s.profiles[s.active]) s.active = Object.keys(s.profiles)[0];
      return s;
    }
    // 从旧版迁移（保留星星 / 打卡 / 错词本）
    try{
      var o = JSON.parse(localStorage.getItem(OLD) || 'null');
      if(o && typeof o === 'object'){
        var nm = ((o.name || 'MARK') + '').trim() || 'MARK';
        var p = newProfile(nm);
        ['stars','spent','lastDay','days','ptr','wrong','sessions','correct','questions','redeemed','custom','lastCat','avatar'].forEach(function(f){
          if(o[f] !== undefined) p[f] = o[f];
        });
        p.learned = {};
        p.history = [{
          d: o.lastDay || '', t: '', mode:'学习', cat:'（旧版数据）',
          total: o.questions | 0, correct: o.correct | 0, star: 0
        }];
        def.profiles = {}; def.profiles[nm] = p; def.active = nm;
        def.settings = Object.assign({}, def.settings, o.settings || {});
      }
    }catch(e){}
    return def;
  }

  store = loadStore();
  state = store.profiles[store.active];

  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }
  function balance(){ return Math.max(0, (state.stars|0) - (state.spent|0)); }
  function profileNames(){ return Object.keys(store.profiles); }

  function useProfile(name){
    name = (name || '').trim().slice(0, 12) || 'MARK';
    if(!store.profiles[name]) store.profiles[name] = newProfile(name);
    store.active = name;
    state = store.profiles[name];
    save();
  }

  function renameProfile(oldName, newName){
    newName = (newName || '').trim().slice(0, 12);
    if(!newName || newName === oldName) return;
    if(store.profiles[newName] && newName !== oldName) return;   // 已存在则视为切换
    var p = store.profiles[oldName];
    delete store.profiles[oldName];
    p.name = newName;
    store.profiles[newName] = p;
    store.active = newName;
    state = p;
    save();
  }

  /* ================= 小工具 ================= */
  function $(id){ return document.getElementById(id); }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function todayStr(d){ d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  function nowTime(){ var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  var toastT = null;
  function toast(msg){
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function(){ el.classList.remove('show'); }, 1900);
  }

  /* ================= 弹窗 ================= */
  var modalOkCb = null;

  function openModal(opt){
    $('modalEmoji').textContent = opt.emoji || '🎁';
    $('modalTitle').textContent = opt.title || '确定吗？';
    var t = $('modalText');
    if(opt.text){ t.textContent = opt.text; t.style.display = 'block'; }
    else { t.textContent = ''; t.style.display = 'none'; }
    $('modalBody').innerHTML = opt.html || '';
    $('modalOk').textContent = opt.ok || '确定';
    $('modalCancel').textContent = opt.cancel || '取消';
    $('modalMask').style.display = 'flex';
    modalOkCb = opt.onOk || null;
    if(typeof opt.after === 'function') opt.after();
  }
  function closeModal(){ $('modalMask').style.display = 'none'; modalOkCb = null; }

  $('modalOk').addEventListener('click', function(){
    var cb = modalOkCb;
    if(cb && cb() === false) return;
    closeModal();
  });
  $('modalCancel').addEventListener('click', closeModal);
  $('modalMask').addEventListener('click', function(e){ if(e.target === $('modalMask')) closeModal(); });

  /* ================= 声音 ================= */
  var actx = null;
  function vol(){
    var v = store.settings.volume;
    return (typeof v === 'number' && v >= 0 && v <= 1) ? v : 0.7;
  }
  function ac(){
    if(!actx){
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      actx = new AC();
    }
    return actx;
  }
  function tone(freq, dur, type, delay, gain){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.12) * vol()), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.03);
    }catch(e){}
  }

  var PRAISES = [
    { t:'PERFECT!',   c:'太棒了！',     s:'perfect' },
    { t:'AMAZING!',   c:'太厉害了！',   s:'amazing' },
    { t:'WONDERFUL!', c:'非常好！',     s:'wonderful' },
    { t:'EXCELLENT!', c:'真优秀！',     s:'excellent' },
    { t:'GREAT JOB!', c:'干得好！',     s:'greatjob' },
    { t:'WELL DONE!', c:'完成得漂亮！', s:'welldone' },
    { t:'SUPER!',     c:'超级棒！',     s:'super' }
  ];
  var lastPraise = -1;

  // 频率滑音
  function glide(f0, f1, dur, type, gain, delay){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, (gain || 0.09) * vol()), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.03);
    }catch(e){}
  }

  // 噪声爆破（炮击 / 爆炸）
  function noiseBurst(dur, gain, f0, f1, delay, type){
    if(!store.settings.sound || vol() <= 0) return;
    try{
      var a = ac(); if(!a) return;
      var t0 = a.currentTime + (delay || 0);
      var len = Math.max(1, Math.floor(a.sampleRate * dur));
      var buf = a.createBuffer(1, len, a.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < len; i++){
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
      var src = a.createBufferSource(); src.buffer = buf;
      var f = a.createBiquadFilter();
      f.type = type || 'lowpass';
      f.frequency.setValueAtTime(f0, t0);
      if(f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      var g = a.createGain();
      g.gain.setValueAtTime(Math.max(0.0001, (gain || 0.3) * vol()), t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(a.destination);
      src.start(t0);
    }catch(e){}
  }

  // 七种答对音效，波形 / 音高走向 / 节奏各不相同
  var PRAISE_SFX = {
    perfect: function(){                 // 明亮四连音（铃铛）
      [1046, 1318, 1568, 2093].forEach(function(f, i){ tone(f, 0.12, 'sine', i * 0.062, 0.10); });
    },
    amazing: function(){                 // 方波上滑音 + 高音收尾
      glide(392, 1568, 0.26, 'square', 0.055, 0);
      tone(2093, 0.13, 'sine', 0.27, 0.07);
    },
    wonderful: function(){               // 叮—咚（纯五度长音）
      tone(880, 0.20, 'sine', 0, 0.12);
      tone(1320, 0.30, 'sine', 0.17, 0.09);
    },
    excellent: function(){               // 短促三连（三角波）
      [784, 784, 1175].forEach(function(f, i){ tone(f, 0.075, 'triangle', i * 0.105, 0.09); });
    },
    greatjob: function(){                // 低→高琶音（三角波）
      [523, 659, 784, 1046].forEach(function(f, i){ tone(f, 0.10, 'triangle', i * 0.068, 0.085); });
    },
    welldone: function(){                // 温暖双和弦
      tone(392, 0.24, 'sine', 0, 0.09);
      tone(494, 0.24, 'sine', 0.02, 0.06);
      tone(587, 0.32, 'sine', 0.15, 0.075);
    },
    super: function(){                   // 闪光高音群 + 回响
      [1568, 2093, 2637].forEach(function(f, i){ tone(f, 0.08, 'sine', i * 0.05, 0.065); });
      tone(3136, 0.16, 'sine', 0.19, 0.045);
      tone(2093, 0.2, 'sine', 0.26, 0.03);
    }
  };

  var lastUtter = null;
  var voiceList = [];
  var onlineAudio = null;

  var spkState = { started: false, busy: false, text: '', lastErr: '' };

  function loadVoices(){
    try{ voiceList = window.speechSynthesis.getVoices() || []; }catch(e){ voiceList = []; }
  }
  function englishVoices(){
    loadVoices();
    var out = [];
    for(var i = 0; i < voiceList.length; i++){
      if(/^en/i.test(voiceList[i].lang || '')) out.push(voiceList[i]);
    }
    return out;
  }
  if('speechSynthesis' in window){
    loadVoices();
    try{
      window.speechSynthesis.onvoiceschanged = loadVoices;
      // 有的浏览器语音列表要等一会儿才齐
      setTimeout(loadVoices, 300);
      setTimeout(loadVoices, 1200);
    }catch(e){}
  }

  function makeUtter(text, lang, rate){
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'en-US';
    u.rate = Math.max(0.5, Math.min(1.5, rate || 0.92));
    u.pitch = 1.0;
    u.volume = Math.min(1, Math.max(0.1, vol() * 1.2));
    return u;
  }

  // 系统语音：不指定 voice（跨设备最稳），带事件回调判断是否真的开口
  function sysSpeak(text, lang, rate){
    if(!('speechSynthesis' in window)) return false;
    try{
      var syn = window.speechSynthesis;
      if(syn.speaking || syn.pending){ try{ syn.cancel(); }catch(e){} }
      var u = makeUtter(text, lang, rate);
      spkState.started = false;
      spkState.busy = false;
      spkState.text = text;
      spkState.lastErr = '';
      u.onstart = function(){
        if(u !== lastUtter) return;
        spkState.started = true; spkState.busy = true; setSpeakingUI(true);
      };
      u.onend = function(){
        if(u !== lastUtter) return;      // 旧语音的收尾事件不能影响新的朗读
        spkState.busy = false; setSpeakingUI(false);
      };
      u.onerror = function(e){
        if(u !== lastUtter) return;
        spkState.lastErr = (e && e.error) ? e.error : 'error';
        spkState.busy = false;
        setSpeakingUI(false);
      };
      lastUtter = u;
      try{ if(syn.paused) syn.resume(); }catch(e){}
      syn.speak(u);
      return true;
    }catch(e){ spkState.lastErr = e.message; return false; }
  }

  // 在线发音（有道词典语音接口，带缓存）
  function playOnline(word){ return false; }

  // 统一入口：自动模式 = 系统语音，700ms 内没开口就切在线
  function speakWord(text, rate){
    if(!store.settings.sound) return false;
    if(vol() <= 0) return false;
    var mode = store.settings.speechMode || 'auto';

    if(mode === 'online') return playOnline(text);

    var hasEn = englishVoices().length > 0;
    if(!hasEn && mode === 'auto'){          // 系统里没有英文语音，直接走在线
      if(playOnline(text)) return true;
    }
    var ok = sysSpeak(text, 'en-US', rate);
    if(mode === 'system') return ok;
    if(!ok && mode === 'auto') return playOnline(text);

    if(ok && mode === 'auto'){
      var t = text;
      setTimeout(function(){
        if(spkState.text === t && !spkState.started && !spkState.busy){
          playOnline(t);
        }
      }, 700);
    }
    return ok;
  }

  // 旧的 speak() 保留给鼓励语（不走在线，避免频繁请求）
  function speak(text, lang, rate){
    if(!store.settings.sound) return false;
    if(vol() <= 0) return false;
    return sysSpeak(text, lang || 'en-US', rate || 0.95);
  }

  var speakUITimer = null;
  function setSpeakingUI(on){
    var b = $('btnSpeak');
    if(!b) return;
    clearTimeout(speakUITimer);
    if(on){
      b.textContent = '🔊 正在读…';
      speakUITimer = setTimeout(function(){ b.textContent = '🔊 听一听怎么读'; }, 4000);
    }else{
      b.textContent = '🔊 听一听怎么读';
    }
  }

  function voiceReport(){
    var syn = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    var vs = syn ? (syn.getVoices() || []) : [];
    var en = englishVoices();
    var mode = store.settings.speechMode || 'auto';
    var name = { auto: '自动（系统语音）', system: '仅系统语音', online: '仅在线发音' }[mode] || mode;
    var lines = [];
    lines.push('浏览器语音合成：' + (syn ? '支持' : '不支持'));
    lines.push('语音总数：' + vs.length + '　英文语音：' + en.length);
    if(en.length){
      lines.push('英文语音示例：' + en[0].name + '（' + en[0].lang + '，' + (en[0].localService === false ? '网络' : '本地') + '）');
    }else{
      lines.push('英文语音：无');
    }
    lines.push('上次错误：' + (spkState.lastErr || '无'));
    lines.push('发音方式：' + name);
    lines.push('网络：' + (navigator.onLine ? '已连接' : '离线'));
    return lines.join('\n');
  }

  // 答对：不同音效 + 鼓励语
  function praise(streak){
    var i = Math.floor(Math.random() * PRAISES.length);
    if(i === lastPraise) i = (i + 1) % PRAISES.length;
    lastPraise = i;
    var p = PRAISES[i];
    try{ PRAISE_SFX[p.s](); }catch(e){}
    if(streak >= 3) tone(1568 + Math.min(streak - 3, 3) * 60, 0.16, 'triangle', 0.3, 0.06);

    var el = $('praise');
    el.innerHTML = p.t + (streak >= 3 ? ' ×' + streak : '') + '<span class="cn">' + p.c + '</span>';
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    speak(p.t.replace('!', '').toLowerCase(), 'en-US', 1.0);
  }

  function sfxWrong(){
    tone(300, 0.16, 'triangle', 0, 0.09);
    tone(200, 0.22, 'triangle', 0.11, 0.08);
    tone(150, 0.26, 'triangle', 0.22, 0.07);
  }
  function sfxStar(){
    [784,988,1319].forEach(function(f,k){ tone(f, 0.16, 'sine', k*0.1, 0.1); });
  }
  function sfxTick(){ tone(1200, 0.05, 'square', 0, 0.04); }
  function sfxBoom(){                       // 炮弹命中：噪声爆裂 + 低频冲击
    noiseBurst(0.42, 0.34, 2600, 160);
    tone(82, 0.34, 'sine', 0, 0.20);
    tone(55, 0.40, 'triangle', 0.02, 0.16);
    noiseBurst(0.9, 0.08, 900, 120, 0.06);
  }
  function sfxCannon(){                     // 开炮：短促气爆
    noiseBurst(0.16, 0.20, 1800, 300);
    tone(150, 0.14, 'square', 0, 0.07);
  }

  /* ================= 页面 ================= */
  function showScreen(id){
    var list = document.querySelectorAll('.screen');
    for(var i=0;i<list.length;i++) list[i].classList.remove('active');
    var el = $('screen-' + id);
    if(el) el.classList.add('active');
    try{ window.scrollTo({ top:0, behavior:'smooth' }); }catch(e){}
  }
  function refreshTopbar(){
    $('starBalance').textContent = balance();
    $('btnSound').textContent = store.settings.sound ? '🔊' : '🔇';
  }

  /* ================= 首页 ================= */
  function calcStreak(){
    if(!state.days.length) return 0;
    var set = {}; state.days.forEach(function(d){ set[d] = true; });
    var d = new Date();
    if(!set[todayStr(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    while(set[todayStr(d)] && n < 9999){ n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function renderHome(){
    refreshTopbar();
    $('hStars').textContent = balance();
    $('hStreak').textContent = calcStreak();
    $('hDays').textContent = state.days.length;
    $('libInfo').textContent = CATS.length + ' 个分类 · ' + ALL.length + ' 个词条';
    $('avatarEmoji').textContent = state.avatar || '🦊';
    $('heroName').textContent = state.name || '小朋友';

    var doneToday = (state.lastDay === todayStr());
    var card = $('todayCard');
    if(doneToday){
      card.classList.add('done');
      $('todayEmoji').textContent = '⭐';
      $('todayTitle').textContent = '今天的红星已经拿到啦！';
      $('todaySub').textContent = '还想再练一组也很棒哦～';
    }else{
      card.classList.remove('done');
      $('todayEmoji').textContent = '🌤️';
      $('todayTitle').textContent = '今天还没完成任务';
      $('todaySub').textContent = '完成一组单词（或一局对战），红星就归你啦';
    }

    renderCampaign();

    var wc = Object.keys(state.wrong).length;
    var bw = $('btnWrong');
    if(wc > 0){
      bw.style.display = 'block';
      bw.textContent = '错词本 ' + wc;
    }else{
      bw.style.display = 'none';
    }
  }

  /* ================= 名字 / 头像 ================= */
  var AVATARS = ['🦊','🐱','🐶','🐰','🐼','🐻','🐯','🐨'];
  var pickedAvatar = '🦊';

  function openProfileEditor(){
    pickedAvatar = state.avatar || '🦊';
    var grid = AVATARS.map(function(a){
      return '<button type="button" class="avatar-opt' + (a === pickedAvatar ? ' on' : '') + '" data-a="' + a + '">' + a + '</button>';
    }).join('');
    var names = profileNames();
    var chips = names.map(function(n){
      return '<button type="button" class="name-chip' + (n === store.active ? ' cur' : '') + '" data-n="' + escapeHtml(n) + '">' + escapeHtml(n) + '</button>';
    }).join('');

    openModal({
      emoji: pickedAvatar,
      title: '主角是谁呀？',
      html:
        '<div class="field-label">选一个头像</div>' +
        '<div class="avatar-grid" id="avatarGrid">' + grid + '</div>' +
        '<div class="field-label">名字（换新名字＝新建一份档案）</div>' +
        '<input class="name-input" id="editName" maxlength="12" placeholder="MARK">' +
        (names.length > 1 ? '<div class="field-label">已存档的小主角</div><div class="name-chips" id="nameChips">' + chips + '</div>' : ''),
      ok: '保存',
      after: function(){
        $('editName').value = state.name || '';
        $('avatarGrid').addEventListener('click', function(e){
          var b = e.target.closest('.avatar-opt');
          if(!b) return;
          pickedAvatar = b.getAttribute('data-a');
          var all = $('avatarGrid').querySelectorAll('.avatar-opt');
          for(var i=0;i<all.length;i++) all[i].classList.toggle('on', all[i] === b);
          $('modalEmoji').textContent = pickedAvatar;
        });
        var nc = $('nameChips');
        if(nc) nc.addEventListener('click', function(e){
          var b = e.target.closest('.name-chip');
          if(!b) return;
          $('editName').value = b.getAttribute('data-n');
        });
      },
      onOk: function(){
        var nm = ($('editName').value || '').trim().slice(0, 12) || 'MARK';
        if(nm !== store.active && store.profiles[nm]){
          useProfile(nm);                       // 已有档案：切换
        }else if(nm !== store.active){
          renameProfile(store.active, nm);      // 新名字：改名（记录跟着走）
        }
        state.avatar = pickedAvatar;
        save();
        syncSelCat(); renderSetup();
        renderHome(); renderStats(); renderRewards();
        toast('你好，' + state.name + '！' + state.avatar);
      }
    });
  }

  /* ================= 设置页 ================= */
  var selCat = 'all';
  function syncSelCat(){
    selCat = (state.lastCat && (state.lastCat === 'all' || CATMAP[state.lastCat])) ? state.lastCat : 'all';
  }
  syncSelCat();

  function renderSetup(){
    var grid = $('catGrid');
    grid.innerHTML = '';
    grid.appendChild(makeCatCard('all', '🎲', '全部混合', '从所有分类里随机抽', ALL.length));

    var wc = Object.keys(state.wrong).length;
    var wCard = makeCatCard('wrong', '📕', '错词本', wc > 0 ? '复习做错的单词' : '还没有错词', wc);
    if(wc === 0) wCard.classList.add('disabled');
    grid.appendChild(wCard);

    CATS.forEach(function(cat){
      var ptr = state.ptr[cat.id] || 0;
      grid.appendChild(makeCatCard(cat.id, cat.emoji, cat.name, '已学 ' + ptr + ' / ' + cat.total, cat.total));
    });

    updateCountUI(); updateModeUI(); syncSelHighlight();
  }

  function makeCatCard(id, emoji, name, meta, total){
    var b = document.createElement('button');
    b.className = 'cat-card';
    b.setAttribute('data-cat', id);
    b.innerHTML = '<div class="cc-emoji">' + emoji + '</div><div class="cc-body">' +
      '<div class="cc-name">' + escapeHtml(name) + '</div><div class="cc-meta">' + escapeHtml(meta) + '</div></div>';
    b.addEventListener('click', function(){
      if(id === 'wrong' && total === 0){ toast('错词本还是空的，先去做题吧～'); return; }
      selCat = id; state.lastCat = id; save(); syncSelHighlight();
    });
    return b;
  }

  function syncSelHighlight(){
    var cards = document.querySelectorAll('.cat-card');
    for(var i=0;i<cards.length;i++) cards[i].classList.toggle('selected', cards[i].getAttribute('data-cat') === selCat);
    var nm = selCat === 'all' ? '全部混合' : (selCat === 'wrong' ? '错词本' : (CATMAP[selCat] ? CATMAP[selCat].name : ''));
    $('setupNote').textContent = nm ? '当前：' + nm : '';
  }

  function updateCountUI(){
    var c = store.settings.count;
    $('countRange').value = c;
    $('countBadge').textContent = c + ' 个';
    var chips = $('countChips'); chips.innerHTML = '';
    [10,15,20,30,40,50].forEach(function(n){
      var b = document.createElement('button');
      b.className = 'chip' + (n === c ? ' on' : '');
      b.textContent = n;
      b.addEventListener('click', function(){ store.settings.count = n; save(); updateCountUI(); });
      chips.appendChild(b);
    });
  }
  function updateModeUI(){
    var btns = $('modeSeg').querySelectorAll('button');
    for(var i=0;i<btns.length;i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-mode') === store.settings.mode);
  }
  $('countRange').addEventListener('input', function(){
    store.settings.count = parseInt(this.value, 10) || 20;
    save();
    $('countBadge').textContent = store.settings.count + ' 个';
    var chips = $('countChips').querySelectorAll('.chip');
    for(var i=0;i<chips.length;i++) chips[i].classList.toggle('on', parseInt(chips[i].textContent,10) === store.settings.count);
  });
  $('modeSeg').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    store.settings.mode = b.getAttribute('data-mode'); save(); updateModeUI();
  });

  /* ================= 出题 ================= */
  function pickMeanings(word, pool){
    var src = (pool && pool.length >= 3 ? pool : ALL);
    var bag = [];
    for(var i=0;i<src.length;i++){ if(src[i].c !== word.c) bag.push(src[i].c); }
    bag = shuffle(bag);
    var used = {}; used[word.c] = true;
    var out = [];
    for(var j=0;j<bag.length && out.length<2;j++){ if(!used[bag[j]]){ used[bag[j]]=true; out.push(bag[j]); } }
    if(out.length < 2){
      var all2 = shuffle(ALL.map(function(x){ return x.c; }));
      for(var k=0;k<all2.length && out.length<2;k++){ if(!used[all2[k]]){ used[all2[k]]=true; out.push(all2[k]); } }
    }
    return shuffle([word.c].concat(out));
  }
  /* ================= 学习模式 ================= */
  var session = null;
  var streak = 0;

  function buildSession(catId){
    var count = Math.max(10, Math.min(50, store.settings.count | 0 || 20));
    var queue = [], catName = '';

    if(catId === 'all'){
      catName = '全部混合';
      queue = shuffle(ALL.slice()).slice(0, count);
    }else if(catId === 'wrong'){
      catName = '错词本';
      var ws = Object.keys(state.wrong).map(function(k){ return WORDMAP[k]; }).filter(Boolean);
      queue = shuffle(ws).slice(0, count);
    }else{
      var cat = CATMAP[catId];
      if(!cat) return null;
      catName = cat.name;
      var list = cat.list.slice();
      if(store.settings.mode === 'random'){
        queue = shuffle(list).slice(0, count);
      }else{
        var ptr = (state.ptr[catId] || 0) % list.length;
        var rotated = list.slice(ptr).concat(list.slice(0, ptr));
        queue = rotated.slice(0, Math.min(count, rotated.length));
        state.ptr[catId] = (ptr + queue.length) % list.length;
        save();
      }
    }
    if(queue.length < 2){ toast('这里的单词太少啦，换个主题试试～'); return null; }

    session = { catId:catId, catName:catName, queue:queue, i:0, correct:0, locked:false, opts:[], wrongWords:[] };
    streak = 0;
    return session;
  }

  function renderQuestion(){
    var q = session.queue[session.i];
    session.locked = false;
    var cat = CATMAP[q.cat];
    session.opts = pickMeanings(q, cat ? cat.list : null);

    $('qIndex').textContent = (session.i + 1) + ' / ' + session.queue.length;
    $('qScore').textContent = '✅ ' + session.correct;
    $('progressBar').style.width = Math.round((session.i / session.queue.length) * 100) + '%';

    $('posChip').textContent = cat ? cat.name : '单词';
    var wt = $('wordText');
    wt.textContent = q.w;
    wt.classList.remove('pop'); void wt.offsetWidth; wt.classList.add('pop');
    $('wordIpa').textContent = q.ipa ? '/' + String(q.ipa).trim() + '/' : '';

    var box = $('options'); box.innerHTML = '';
    session.opts.forEach(function(m, idx){
      var b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = '<span class="num">' + (idx+1) + '</span><span class="ot">' + escapeHtml(m) + '</span>';
      b.addEventListener('click', function(){ answer(m, b); });
      box.appendChild(b);
    });

    var note = $('qNote');
    note.className = 'q-note';
    note.innerHTML = '';

    if(store.settings.sound) speakWord(q.w, 0.82);
  }

  /* 答完一题后的用法 / 例句讲解 */
  function showQNote(q, ok){
    var note = $('qNote');
    if(!note) return false;
    var parts = [];
    var senses = String(q.c || '').split('；').filter(function(x){ return x.trim(); });
    if(senses.length > 1){
      var mark = ['①', '②', '③', '④'];
      parts.push('💡 <b>一词多义</b>　' + senses.map(function(x, i){ return (mark[i] || '·') + ' ' + escapeHtml(x.trim()); }).join('　'));
    }
    if(q.u) parts.push('💡 <b>用法</b>　' + escapeHtml(q.u));
    if(q.ex) parts.push('📖 <b>例句</b>　<span class="nw">' + escapeHtml(q.ex) + '</span>');
    if(!parts.length){ note.className = 'q-note'; note.innerHTML = ''; return false; }
    note.className = 'q-note show' + (ok ? ' ok' : '');
    note.innerHTML = parts.join('<br>');
    return true;
  }

  function markOptions(q, btn){
    var opts = document.querySelectorAll('#options .opt');
    for(var i=0;i<opts.length;i++){
      var txt = opts[i].querySelector('.ot').textContent;
      if(txt === q.c) opts[i].classList.add('correct');
      else if(opts[i] === btn) opts[i].classList.add('wrong');
      else opts[i].classList.add('dim');
      opts[i].style.pointerEvents = 'none';
    }
  }

  function recordAnswer(q, ok){
    state.questions = (state.questions | 0) + 1;
    if(ok){
      state.correct = (state.correct | 0) + 1;
      state.learned[q.w] = (state.learned[q.w] | 0) + 1;
      if(state.wrong[q.w]) delete state.wrong[q.w];
    }else{
      state.wrong[q.w] = { w:q.w, c:q.c, times:((state.wrong[q.w] && state.wrong[q.w].times) | 0) + 1 };
    }
    save();
  }

  function answer(choice, btn){
    if(!session || session.locked) return;
    session.locked = true;
    var q = session.queue[session.i];
    var ok = (choice === q.c);
    markOptions(q, btn);
    var noted = showQNote(q, ok);

    if(ok){
      session.correct++;
      streak++;
      recordAnswer(q, true);
      praise(streak);
      flyStar(btn);
    }else{
      streak = 0;
      recordAnswer(q, false);
      session.wrongWords.push(q.w);
      sfxWrong();
      speak(q.w, 'en-US', 0.82);
    }
    $('qScore').textContent = '✅ ' + session.correct;

    setTimeout(function(){
      if(!session) return;
      session.i++;
      if(session.i >= session.queue.length) endSession();
      else renderQuestion();
    }, ok ? (noted ? 1500 : 850) : (noted ? 2600 : 1450));
  }

  function flyStar(anchor){
    try{
      var r = anchor.getBoundingClientRect();
      var s = document.createElement('div');
      s.className = 'fly-star'; s.textContent = '⭐';
      s.style.left = (r.left + r.width*0.5 - 11) + 'px';
      s.style.top = (r.top + r.height*0.3) + 'px';
      document.body.appendChild(s);
      setTimeout(function(){ s.remove(); }, 1200);
    }catch(e){}
  }

  function pushHistory(mode, cat, total, correct, star){
    state.history.unshift({
      d: todayStr(), t: nowTime(), mode: mode, cat: cat,
      total: total, correct: correct, star: star
    });
    if(state.history.length > 60) state.history.length = 60;
  }

  function awardDaily(){
    var t = todayStr();
    if(state.lastDay === t) return false;
    state.lastDay = t;
    if(state.days.indexOf(t) === -1) state.days.push(t);
    state.stars = (state.stars | 0) + 1;
    return true;
  }

  function endSession(){
    var total = session.queue.length;
    var correct = session.correct;
    var rate = total ? Math.round(correct / total * 100) : 0;

    state.sessions = (state.sessions | 0) + 1;
    var gotStar = awardDaily();
    pushHistory('学习', session.catName, total, correct, gotStar ? 1 : 0);
    save();

    $('resCorrect').textContent = correct;
    $('resTotal').textContent = total;
    $('resRate').textContent = rate + '%';
    $('progressBar').style.width = '100%';

    var title, line;
    if(rate >= 95){ title = '完美通关！🏆'; line = '几乎全对，太厉害啦！'; }
    else if(rate >= 80){ title = '非常棒！🌟'; line = '记得很牢，继续保持！'; }
    else if(rate >= 60){ title = '完成啦！👍'; line = '再复习一下错词会更好哦。'; }
    else{ title = '坚持完成，很棒！💪'; line = '错词已经收进错词本，多练几遍就记住啦。'; }
    $('resTitle').textContent = title;
    $('resLine').textContent = session.catName + ' · 本组完成';

    if(gotStar){
      $('resStarIcon').textContent = '⭐';
      $('resStarMsg').innerHTML = '获得今日红星 +1 ⭐　当前可用 <b>' + balance() + '</b> 颗';
      sfxStar(); confetti(); burstStars();
    }else{
      $('resStarIcon').textContent = '🎉';
      $('resStarMsg').innerHTML = '今天的红星已经拿过啦，明天再来一颗！　当前可用 <b>' + balance() + '</b> 颗';
    }

    renderHome();
    showScreen('result');
  }

  function confetti(){
    var colors = ['#ff8fb1','#ffd93d','#6ec6ff','#7ed957','#b39ddb','#ffa552','#ff5d5d'];
    for(var i=0;i<46;i++){
      (function(i){
        var d = document.createElement('div');
        d.className = 'confetti';
        d.style.left = (Math.random()*100) + 'vw';
        d.style.background = colors[i % colors.length];
        d.style.animationDuration = (1.9 + Math.random()*1.6) + 's';
        d.style.animationDelay = (Math.random()*0.5) + 's';
        d.style.width = (7 + Math.random()*7) + 'px';
        d.style.height = (10 + Math.random()*10) + 'px';
        document.body.appendChild(d);
        setTimeout(function(){ d.remove(); }, 4200);
      })(i);
    }
  }
  function burstStars(){
    var rect = $('resStarIcon').getBoundingClientRect();
    for(var i=0;i<9;i++){
      (function(i){
        var s = document.createElement('div');
        s.className = 'fly-star'; s.textContent = '✨';
        s.style.left = (rect.left + rect.width/2 + (Math.random()*160 - 80)) + 'px';
        s.style.top = (rect.top + Math.random()*60) + 'px';
        s.style.animationDelay = (i*0.06) + 's';
        document.body.appendChild(s);
        setTimeout(function(){ s.remove(); }, 1500);
      })(i);
    }
  }

  /* ================= 对战 ================= */
  var BATTLE_ROUNDS = 10;          // 普通关：10 题
  var BOSS_ROUNDS = 12;            // BOSS 关：12 题（10 格装甲，最多允许错 2 题）
  var BATTLE_TIME = 5;
  var MAX_LEVEL = 20;
  var HP_ME = 3;                   // 我方 3 辆车 = 3 格血
  var HP_FOE = 3;                  // 普通关敌方 3 辆车 = 3 格血（一炮一车）
  var HP_BOSS = 10;                // BOSS 关敌方合计 10 格
  var BOSS_CORE_HP = 8;            //   └ 指挥车 8 格装甲
                                   //   └ 护卫 2 辆 × 1 格 = 2 格
  var FIELD_W = 366, FIELD_H = 200; // 战场设计尺寸（无布局时的坐标回退用）
  function isBoss(lv){ return lv % 5 === 0; }
  // 20 个关卡名与 20 张切片背景一一对应（已逐张按画面内容核对）
  var TERRAIN = ['首都广场','工业区','高架桥','港口码头','城市路口',
                 '街角','郊外公路','草原公路','丘陵草原','海岸公路',
                 '山谷草原','城市绿野','辽阔草原','湿地草原','海岸崖壁',
                 '密林','山区','石桥','河谷','海滩'];

  function tankImg(side){
    return '<img src="' + (side === 'me' ? ASSETS.tankMe : ASSETS.tankFoe) + '" alt="">';
  }

  var battle = null;

  function startBattle(){
    var lv = (((state.campaign && state.campaign.level) | 0) % MAX_LEVEL) + 1;
    var boss = isBoss(lv);
    var rounds = boss ? BOSS_ROUNDS : BATTLE_ROUNDS;
    var foeMax = boss ? HP_BOSS : HP_FOE;
    battle = {
      level: lv, boss: boss, rounds: rounds,
      queue: shuffle(ALL.slice()).slice(0, rounds),
      i: 0, myHP: HP_ME, foeHP: foeMax, maxMe: HP_ME, maxFoe: foeMax,
      correct: 0, locked: true, answered: 0,
      tid: null, t0: 0, over: false, combo: 0
    };
    streak = 0;

    $('field').style.backgroundImage = 'url("' + ASSETS.bg[lv - 1] + '")';
    $('field').className = 'field' + (boss ? ' boss' : '');
    $('levelTag').innerHTML = '第 ' + lv + ' 关 · ' + TERRAIN[lv - 1] + (boss ? ' <b class="boss-tag">BOSS</b>' : '');
    $('coMe').textContent = state.avatar || '🦊';
    $('chipMe').textContent = '橙星装甲队';
    $('chipFoe').textContent = boss ? 'BOSS 指挥车' : '绿地球装甲队';
    $('hpNumFoe').className = 'hpnum' + (boss ? ' bossnum' : '');
    $('battleTip').innerHTML = boss
      ? '5 秒内答对 → 击毁 1 辆敌方装甲　·　<b style="color:#e2402c">BOSS 关：先打掉 2 辆护卫，再击穿指挥车 ' + BOSS_CORE_HP + ' 层装甲（共 ' + BOSS_ROUNDS + ' 题）</b>'
      : '5 秒内答对 → 击毁敌方 1 辆装甲车；超时或答错 → 我方被击毁 1 辆';
    buildField();
    renderHP();
    renderBattleQuestion();
    showScreen('battle');
    bgmOn();
  }

  function makeUnit(side, role, leftPct, bottomPx, hp){
    var d = document.createElement('div');
    d.className = 'unit ' + role;
    d.style.left = leftPct + '%';
    d.style.bottom = bottomPx + 'px';
    d.setAttribute('data-role', role);
    d.setAttribute('data-side', side);
    d.setAttribute('data-hp', hp);
    d.setAttribute('data-maxhp', hp);
    var extra = '';
    if(role === 'core'){                       // 指挥车：车身上一排装甲灯
      var lights = '';
      for(var i = 0; i < hp; i++) lights += '<i class="on"></i>';
      extra = '<div class="armor">' + lights + '</div><b class="core-flag">★</b>';
    }
    d.innerHTML = tankImg(side) + extra;
    return d;
  }

  /* 普通关：我方 3 辆 vs 敌方 3 辆，一炮一车
     BOSS 关：我方 3 辆 vs 敌方 2 辆护卫（各 1 格）+ 1 辆指挥车（8 格）= 10 格 */
  function buildField(){
    var boss = !!(battle && battle.boss);
    var laneMe = $('laneMe'), laneFoe = $('laneFoe');
    laneMe.innerHTML = ''; laneFoe.innerHTML = '';
    laneMe.className = 'lane me';
    laneFoe.className = 'lane foe' + (boss ? ' wide' : '');
    if($('groundFx')) $('groundFx').innerHTML = '';
    if($('smokeFx')) $('smokeFx').innerHTML = '';

    battle.me = [
      makeUnit('me', 'tank', 3,  6,  1),
      makeUnit('me', 'tank', 28, 26, 1),
      makeUnit('me', 'tank', 53, 10, 1)
    ];
    battle.me.forEach(function(u){ laneMe.appendChild(u); });

    if(boss){
      battle.core = makeUnit('foe', 'core', 56, 60, BOSS_CORE_HP);
      battle.escorts = [
        makeUnit('foe', 'escort', 42, 10, 1),
        makeUnit('foe', 'escort', 68, 10, 1)
      ];
      laneFoe.appendChild(battle.core);                 // 指挥车在后，先画
      battle.escorts.forEach(function(u){ laneFoe.appendChild(u); });
      battle.foe = [battle.core].concat(battle.escorts);
    }else{
      battle.core = null;
      battle.escorts = [];
      battle.foe = [
        makeUnit('foe', 'tank', 3,  26, 1),
        makeUnit('foe', 'tank', 28, 6,  1),
        makeUnit('foe', 'tank', 53, 28, 1)
      ];
      battle.foe.forEach(function(u){ laneFoe.appendChild(u); });
    }
  }

  function aliveUnits(side){
    var arr = (side === 'me' ? (battle.me || []) : (battle.foe || []));
    var out = [];
    for(var i = 0; i < arr.length; i++){
      if(arr[i] && (arr[i].getAttribute('data-hp') | 0) > 0 && !arr[i].classList.contains('dead')) out.push(arr[i]);
    }
    return out;
  }

  /* BOSS 关先打护卫，护卫清空后才打指挥车；我方从最靠前线的车开始被击毁 */
  function pickTarget(side){
    var alive = aliveUnits(side);
    if(!alive.length) return null;
    if(side === 'foe' && battle.boss){
      var esc = alive.filter(function(u){ return u.getAttribute('data-role') === 'escort'; });
      if(esc.length) return esc[0];
    }
    return side === 'me' ? alive[alive.length - 1] : alive[0];
  }

  /* 单位中心在战场中的百分比坐标 */
  function unitPoint(laneEl, unitEl, side){
    var field = $('field');
    if(unitEl && field && unitEl.getBoundingClientRect && field.getBoundingClientRect){
      var fr = field.getBoundingClientRect(), ur = unitEl.getBoundingClientRect();
      if(fr.width > 0 && ur.width > 0){
        var px = (ur.left + ur.width / 2 - fr.left) / fr.width * 100;
        var py = (fr.bottom - ur.top - ur.height * 0.42) / fr.height * 100;
        return { x: Math.max(2, Math.min(98, px)), y: Math.max(3, Math.min(94, py)) };
      }
    }
    // 无布局环境（测试/隐藏）下的坐标回退
    var role = unitEl ? unitEl.getAttribute('data-role') : 'tank';
    var leftPct = parseFloat(unitEl && unitEl.style.left) || 0;
    var bottomPx = parseFloat(unitEl && unitEl.style.bottom) || 0;
    var wide = !!(laneEl && laneEl.className.indexOf('wide') >= 0);
    var laneW = wide ? 100 : 50;
    var laneX = (side === 'me') ? 0 : (wide ? 0 : 50);
    var w = role === 'core' ? 118 : (role === 'escort' ? 66 : 80);
    var x = laneX + leftPct / 100 * laneW + (w / 2) / 3.66;
    var y = bottomPx / FIELD_H * 100 + 14;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(3, Math.min(94, y)) };
  }

  function renderHP(){
    function draw(id, n, max, cls){
      var box = $(id); box.innerHTML = '';
      box.className = 'hpbar' + (max > 5 ? ' many' : '');
      for(var i=0;i<max;i++){
        var el = document.createElement('i');
        if(i < n) el.className = 'on ' + cls;
        box.appendChild(el);
      }
    }
    draw('hpMe', battle.myHP, battle.maxMe || HP_ME, 'me');
    draw('hpFoe', battle.foeHP, battle.maxFoe || HP_FOE, 'foe');
    $('hpNumMe').textContent = battle.myHP + '/' + (battle.maxMe || HP_ME);
    $('hpNumFoe').textContent = battle.foeHP + '/' + (battle.maxFoe || HP_FOE);
  }

  function renderBattleQuestion(){
    if(battle.over) return;
    var q = battle.queue[battle.i];
    var cat = CATMAP[q.cat];
    battle.opts = pickMeanings(q, cat ? cat.list : null);
    battle.locked = false;

    $('bWord').textContent = q.w;
    $('bIpa').textContent = q.ipa ? '/' + String(q.ipa).trim() + '/' : '';
    $('bRound').textContent = '第 ' + (battle.i + 1) + ' / ' + battle.rounds + ' 题' + (battle.boss ? ' · BOSS' : '');

    var box = $('bOptions'); box.innerHTML = '';
    battle.opts.forEach(function(m, idx){
      var b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = '<span class="num">' + (idx+1) + '</span><span class="ot">' + escapeHtml(m) + '</span>';
      b.addEventListener('click', function(){ battleAnswer(m, b); });
      box.appendChild(b);
    });

    if(store.settings.sound) speakWord(q.w, 0.92);
    startTimer();
  }

  function startTimer(){
    clearInterval(battle.tid);
    battle.t0 = Date.now();
    var fill = $('timerFill'), num = $('timerNum');
    fill.style.width = '100%';
    fill.className = 'timer-fill';
    num.textContent = BATTLE_TIME.toFixed(1);
    var ticked = false;

    battle.tid = setInterval(function(){
      var elapsed = (Date.now() - battle.t0) / 1000;
      var left = Math.max(0, BATTLE_TIME - elapsed);
      fill.style.width = (left / BATTLE_TIME * 100) + '%';
      num.textContent = left.toFixed(1);
      fill.className = 'timer-fill' + (left <= 1.5 ? ' danger' : (left <= 3 ? ' warn' : ''));
      if(left <= 2.05 && !ticked){ ticked = true; sfxTick(); }
      if(left <= 0){
        clearInterval(battle.tid);
        battleAnswer(null, null);
      }
    }, 50);
  }

  function stopTimer(){ if(battle && battle.tid){ clearInterval(battle.tid); battle.tid = null; } }

  function battleAnswer(choice, btn){
    if(!battle || battle.locked || battle.over) return;
    battle.locked = true;
    stopTimer();

    var q = battle.queue[battle.i];
    var ok = (choice === q.c);
    var opts = document.querySelectorAll('#bOptions .opt');
    for(var i=0;i<opts.length;i++){
      var txt = opts[i].querySelector('.ot').textContent;
      if(txt === q.c) opts[i].classList.add('correct');
      else if(opts[i] === btn) opts[i].classList.add('wrong');
      else opts[i].classList.add('dim');
      opts[i].style.pointerEvents = 'none';
    }

    battle.answered++;
    recordAnswer(q, ok);

    if(ok){
      battle.correct++;
      streak++;
      battle.foeHP = Math.max(0, battle.foeHP - 1);
      praise(streak);
      attack('me');
    }else{
      streak = 0;
      battle.myHP = Math.max(0, battle.myHP - 1);
      sfxWrong();
      attack('foe');
    }

    setTimeout(function(){
      if(!battle || battle.over) return;
      renderHP();
      if(battle.myHP <= 0 || battle.foeHP <= 0){ finishBattle(); return; }
      battle.i++;
      if(battle.i >= battle.queue.length){ finishBattle(); return; }
      renderBattleQuestion();
    }, 1150);
  }

  function attack(by){
    if(!battle) return;
    var targetSide = by === 'me' ? 'foe' : 'me';
    var attackerLane = by === 'me' ? $('laneMe') : $('laneFoe');
    var targetLane = by === 'me' ? $('laneFoe') : $('laneMe');
    var targetHud = by === 'me' ? $('hudFoe') : $('hudMe');
    var target = pickTarget(targetSide);
    var shooters = attackerLane.querySelectorAll('.unit:not(.dead)');

    // 攻击方全部存活车一起开火
    for(var i = 0; i < shooters.length; i++){
      (function(u){
        u.classList.remove('fire'); void u.offsetWidth; u.classList.add('fire');
        setTimeout(function(){ u.classList.remove('fire'); }, 380);
      })(shooters[i]);
    }
    sfxCannon();

    // 取最靠前线的一辆车作为开炮者
    var shooter = null, sLeft = 0;
    for(var k = 0; k < shooters.length; k++){
      var lx = parseFloat(shooters[k].style.left) || 0;
      if(!shooter){ shooter = shooters[k]; sLeft = lx; continue; }
      if(by === 'me' ? lx > sLeft : lx < sLeft){ shooter = shooters[k]; sLeft = lx; }
    }

    var from = unitPoint(attackerLane, shooter, by);
    var to = target ? unitPoint(targetLane, target, targetSide)
                    : { x: by === 'me' ? 76 : 24, y: 32 };

    var shell = $('shell');
    shell.className = 'shell';
    void shell.offsetWidth;
    shell.style.setProperty('--x0', from.x.toFixed(2) + '%');
    shell.style.setProperty('--y0', from.y.toFixed(2) + '%');
    shell.style.setProperty('--x1', to.x.toFixed(2) + '%');
    shell.style.setProperty('--y1', to.y.toFixed(2) + '%');
    shell.style.setProperty('--xm', ((from.x + to.x) / 2).toFixed(2) + '%');
    shell.style.setProperty('--ym', Math.min(92, Math.max(from.y, to.y) + 24).toFixed(2) + '%');
    shell.className = 'shell fly';

    setTimeout(function(){
      var boom = $('boom');
      boom.style.left = to.x.toFixed(2) + '%';
      boom.style.bottom = to.y.toFixed(2) + '%';
      boom.classList.remove('on'); void boom.offsetWidth; boom.classList.add('on');

      targetLane.classList.remove('hit'); void targetLane.offsetWidth; targetLane.classList.add('hit');
      targetHud.classList.remove('shake'); void targetHud.offsetWidth; targetHud.classList.add('shake');
      sfxBoom();

      if(target) damageUnit(target, targetSide);
      renderHP();
      setTimeout(function(){ targetLane.classList.remove('hit'); targetHud.classList.remove('shake'); }, 500);
    }, 380);
  }

  /* 掉血：指挥车扣装甲灯并逐级发暗，其余车辆一炮即毁 */
  function damageUnit(el, side){
    if(!el || el.classList.contains('dead')) return;
    var role = el.getAttribute('data-role');
    var max = el.getAttribute('data-maxhp') | 0;
    var hp = (el.getAttribute('data-hp') | 0) - 1;
    if(hp < 0) hp = 0;
    el.setAttribute('data-hp', hp);

    if(role === 'core'){
      var armor = el.querySelector('.armor');
      if(armor){
        var lights = armor.querySelectorAll('i');
        for(var i = 0; i < lights.length; i++) lights[i].className = i < hp ? 'on' : '';
      }
      el.classList.remove('dmg1', 'dmg2', 'critical');
      if(hp <= 0) destroyUnit(el, side, true);
      else if(hp <= 2) el.classList.add('critical');
      else if(hp <= 4) el.classList.add('dmg2');
      else if(hp < max) el.classList.add('dmg1');
      el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt');
      setTimeout(function(){ el.classList.remove('hurt'); }, 320);
      return;
    }

    if(hp <= 0) destroyUnit(el, side, false);
    else { el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt'); }
  }

  function destroyUnit(el, side, big){
    if(!el || el.classList.contains('dead')) return;
    el.classList.add('dying');
    spawnScorch(el, side, big);
    spawnSmoke(el, side, big);
    setTimeout(function(){
      el.classList.remove('dying');
      el.classList.add('dead');
    }, 520);
  }

  function spawnScorch(el, side, big){
    var layer = $('groundFx');
    if(!layer) return;
    var p = unitPoint(el.parentNode, el, side);
    var d = document.createElement('div');
    d.className = 'scorch' + (big ? ' big' : '');
    d.style.left = p.x.toFixed(2) + '%';
    d.style.top = Math.min(98, 100 - p.y + 3).toFixed(2) + '%';
    layer.appendChild(d);
  }

  function spawnSmoke(el, side, big){
    var layer = $('smokeFx');
    if(!layer) return;
    var p = unitPoint(el.parentNode, el, side);
    var n = big ? 4 : 2;
    for(var i = 0; i < n; i++){
      (function(k){
        setTimeout(function(){
          if(!layer.parentNode) return;
          var d = document.createElement('div');
          d.className = 'puff' + (big ? ' big' : '');
          d.style.left = (p.x + (k - (n - 1) / 2) * 3.4).toFixed(2) + '%';
          d.style.top = Math.min(98, 100 - p.y - 1).toFixed(2) + '%';
          layer.appendChild(d);
          setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 1150);
        }, k * 110);
      })(i);
    }
  }

  function finishBattle(){
    battle.over = true;
    stopTimer();
    bgmOff();
    var total = battle.answered, correct = battle.correct;
    var myHP = battle.myHP, foeHP = battle.foeHP;
    var win = foeHP <= 0 ? true : (myHP <= 0 ? false : myHP > foeHP);
    var draw = (!win && foeHP > 0 && myHP === foeHP);
    var tname = TERRAIN[battle.level - 1] || '';
    var perfect = total > 0 && correct === total;

    var camp = state.campaign;
    var gain = 0, newBest = false, lapDone = false;

    if(win){
      gain = 10 + (battle.boss ? 20 : 0) + (perfect ? 5 : 0);
      camp.cur = (camp.cur | 0) + gain;
      if(camp.cur > (camp.best | 0)){ camp.best = camp.cur; newBest = true; }
      camp.wins = (camp.wins | 0) + 1;
      if(battle.level === camp.level + 1){
        camp.level = battle.level;
        if(camp.level >= MAX_LEVEL){
          camp.level = 0;
          camp.lap = (camp.lap | 0) + 1;
          camp.laps = camp.lap;
          lapDone = true;
          if(!camp.flagAt) camp.flagAt = todayStr();
        }
      }
    }else{
      camp.cur = 0;                       // 输一局，连胜分清零（历史最高保留）
    }

    state.sessions = (state.sessions | 0) + 1;
    var gotStar = awardDaily();
    pushHistory('对战', '第' + battle.level + '关 · ' + tname + (battle.boss ? '（BOSS）' : ''), total, correct, gotStar ? 1 : 0);
    save();
    renderHome();
    renderCampaign();

    var medal = medalOf(camp.best | 0);
    var tip;
    if(win){
      tip = '🎯 连胜分 +' + gain + '　当前 ' + camp.cur + ' 分' + (newBest ? '　<b>刷新纪录！</b>' : '');
    }else if(draw){
      tip = '🤝 平局，连胜分保持不变（' + camp.cur + ' 分）';
    }else{
      tip = '💔 连胜分清零，历史最高仍是 ' + (camp.best | 0) + ' 分';
    }

    var box = document.createElement('div');
    box.className = 'battle-result';
    box.innerHTML =
      '<div class="br-card">' +
        '<div class="br-emoji">' + (win ? '🏆' : (draw ? '🤝' : '💥')) + '</div>' +
        '<h2>' + (win ? 'VICTORY! 胜利！' : (draw ? 'DRAW! 平局！' : 'DEFEAT 惜败')) + '</h2>' +
        '<p class="br-line">第 ' + battle.level + ' 关 · ' + tname + (battle.boss ? ' · BOSS 关' : '') + '</p>' +
        '<div class="br-vs"><span class="n me">' + myHP + '</span><span style="color:#b1a8c9;font-size:14px">HP</span><span class="n foe">' + foeHP + '</span></div>' +
        '<div class="res-stats">' +
          '<div class="rs"><div class="v">' + correct + '</div><div class="k">答对</div></div>' +
          '<div class="rs"><div class="v">' + total + '</div><div class="k">回合</div></div>' +
          '<div class="rs"><div class="v">' + (total ? Math.round(correct / total * 100) : 0) + '%</div><div class="k">正确率</div></div>' +
        '</div>' +
        '<div class="br-score">' +
          '<div class="bs-cur"><span>连胜分</span><b>' + (camp.cur | 0) + '</b></div>' +
          '<div class="bs-best"><span>历史最高</span><b>' + medal.e + ' ' + (camp.best | 0) + '</b></div>' +
        '</div>' +
        '<p class="rl" style="margin:10px 0 6px;color:#f2712a;font-weight:800">' + tip + '</p>' +
        '<p class="rl" style="margin:0 0 14px">' + (gotStar ? '获得今日红星 +1 ⭐　当前可用 ' + balance() + ' 颗' : '今天的红星已经拿过啦，明天再来一颗！') + '</p>' +
        '<div style="display:flex;flex-direction:column;gap:9px">' +
          (win && !lapDone
            ? '<button class="btn btn-battle" id="brAgain">进攻第 ' + (camp.level + 1) + ' 关 ⚔️</button>'
            : '<button class="btn btn-battle" id="brAgain">' + (lapDone ? '开始第 ' + (camp.lap + 1) + ' 周目 ⚔️' : '再打这一关 ⚔️') + '</button>') +
          '<button class="btn btn-ghost" id="brHome">回到首页</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);

    $('brAgain').addEventListener('click', function(){ box.remove(); startBattle(); });
    $('brHome').addEventListener('click', function(){ box.remove(); renderHome(); showScreen('home'); });

    if(win){ sfxStar(); confetti(); }
    if(lapDone){ setTimeout(showWin, 460); }
  }

  /* 连胜分 → 奖杯等级 */
  function medalOf(best){
    if(best >= 800) return { e:'💎', n:'钻石奖杯' };
    if(best >= 500) return { e:'🥇', n:'金奖杯' };
    if(best >= 300) return { e:'🥈', n:'银奖杯' };
    if(best >= 150) return { e:'🥉', n:'铜奖杯' };
    if(best >= 50)  return { e:'🎖️', n:'勇气勋章' };
    return { e:'🏅', n:'新兵奖章' };
  }

  /* ================= 战役 / 升旗 / BGM ================= */
  function renderCampaign(){
    var camp = state.campaign || { level:0, lap:0, cur:0, best:0 };
    var lv = (camp.level | 0) % MAX_LEVEL;
    var lap = camp.lap | 0;

    $('cmpCount').textContent = lap > 0 ? ('第 ' + (lap + 1) + ' 周目 · ' + lv + ' / ' + MAX_LEVEL)
                                        : (lv + ' / ' + MAX_LEVEL + ' 据点');
    var track = $('cmpTrack');
    track.innerHTML = '';
    for(var i = 0; i < MAX_LEVEL; i++){
      var d = document.createElement('i');
      var b = isBoss(i + 1);
      d.className = 'cmp-node' + (i < lv ? ' done' : (i === lv ? ' now' : '')) + (b ? ' boss' : '');
      track.appendChild(d);
    }
    var castle = document.createElement('i');
    castle.className = 'cmp-castle' + (lap > 0 ? ' taken' : '');
    castle.id = 'cmpCastle';
    castle.textContent = lap > 0 ? '🚩' : '🏰';
    track.appendChild(castle);

    var nextBoss = isBoss(lv + 1);
    $('cmpFoot').textContent = '下一关：第 ' + (lv + 1) + ' 关 · ' + TERRAIN[lv] +
      (nextBoss ? '（BOSS 关 · 指挥车 8 层装甲 + 2 辆护卫）' : '');
    $('btnBattle').textContent = '进攻第 ' + (lv + 1) + ' 关 ⚔️';

    $('cmpCur').textContent = (camp.cur | 0) + ' 分';
    var m = medalOf(camp.best | 0);
    $('cmpBest').textContent = m.e + ' ' + (camp.best | 0) + ' 分';
    if(lap > 0) $('cmpLap').textContent = '已通关 ' + lap + ' 次 🚩';
    else $('cmpLap').textContent = '通关 20 关后开启下一周目';
  }

  function showWin(){
    var mask = $('winMask');
    var lap = state.campaign.lap | 0;
    var m = medalOf(state.campaign.best | 0);
    $('winLine').innerHTML = '第 ' + lap + ' 周目完成！20 关全部通关，城堡升起了旗帜 🚩<br>' +
      '历史最高连胜分 ' + (state.campaign.best | 0) + ' 分 ' + m.e + ' ' + m.n;
    mask.style.display = 'flex';
    mask.classList.remove('show');
    void mask.offsetWidth;
    mask.classList.add('show');
    confetti();
    sfxStar();
  }

  var bgmEl = null;
  function bgmOn(){
    if(!store.settings.sound) return;
    try{
      if(!bgmEl){
        bgmEl = $('bgm');
        bgmEl.src = ASSETS.bgm;
        bgmEl.volume = Math.min(1, 0.5 * vol());
      }
      var p = bgmEl.play();
      if(p && p.catch) p.catch(function(){});
    }catch(e){}
  }
  function bgmOff(){
    try{ if(bgmEl) bgmEl.pause(); }catch(e){}
  }

  /* ================= 学习档案 ================= */
  function renderStats(){
    $('stAvatar').textContent = state.avatar || '🦊';
    $('stName').textContent = state.name || 'MARK';
    $('stSub').textContent = '连续打卡 ' + calcStreak() + ' 天 · 共学习 ' + state.days.length + ' 天';
    $('stLearned').textContent = Object.keys(state.learned).length;
    $('stQuestions').textContent = state.questions | 0;
    var q = state.questions | 0;
    $('stRate').textContent = q ? Math.round((state.correct | 0) / q * 100) + '%' : '0%';
    $('stStars').textContent = state.stars | 0;

    var camp = state.campaign || {};
    var best = camp.best | 0, m = medalOf(best);
    $('stTrophy').innerHTML =
      '<div class="tc-medal">' + m.e + '</div>' +
      '<div class="tc-best">' + best + ' 分</div>' +
      '<div class="tc-name">历史最高连胜分 · ' + m.n + '</div>' +
      '<div class="tc-row">' +
        '<div><div class="v">' + (camp.cur | 0) + '</div><div class="k">当前连胜</div></div>' +
        '<div><div class="v">' + (camp.wins | 0) + '</div><div class="k">胜利场次</div></div>' +
        '<div><div class="v">' + (camp.lap | 0) + '</div><div class="k">通关周目</div></div>' +
      '</div>' +
      '<div class="tc-tip">连赢不断累积：普通关 +10，BOSS 关 +20，全对再 +5；输一局清零。<br>' +
        '💎 800 · 🥇 500 · 🥈 300 · 🥉 150 · 🎖️ 50</div>';

    // 近 7 天
    var days = [], map = {};
    for(var i=6;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate() - i);
      var k = todayStr(d);
      days.push(k); map[k] = 0;
    }
    state.history.forEach(function(h){ if(map[h.d] !== undefined) map[h.d] += (h.total | 0); });
    var max = 1;
    days.forEach(function(k){ if(map[k] > max) max = map[k]; });

    var chart = $('stChart'); chart.innerHTML = '';
    days.forEach(function(k){
      var v = map[k];
      var h = Math.max(4, Math.round(v / max * 82));
      var wrap = document.createElement('div');
      wrap.className = 'bar-wrap';
      wrap.innerHTML = '<div class="bv">' + (v || '') + '</div>' +
        '<div class="bar' + (k === todayStr() ? ' today' : '') + '" style="height:' + h + 'px"></div>' +
        '<div class="bl">' + k.slice(5) + '</div>';
      chart.appendChild(wrap);
    });

    var list = $('stHistory'); list.innerHTML = '';
    if(!state.history.length){
      list.innerHTML = '<div class="empty">还没有记录，开始第一组吧 ⭐</div>';
    }else{
      state.history.slice(0, 12).forEach(function(h){
        var rate = h.total ? Math.round(h.correct / h.total * 100) : 0;
        var div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML =
          '<div class="hi-badge">' + (h.mode === '对战' ? '⚔️' : '📖') + '</div>' +
          '<div class="hi-main"><div class="hi-t">' + escapeHtml(h.cat) + '</div>' +
          '<div class="hi-s">' + (h.d || '') + ' ' + (h.t || '') + ' · ' + h.mode + ' · ' + h.total + ' 词' +
          (h.star ? ' · ⭐+1' : '') + '</div></div>' +
          '<div class="hi-r' + (rate < 60 ? ' bad' : '') + '">' + rate + '%</div>';
        list.appendChild(div);
      });
    }
  }

  /* ================= 奖励 ================= */
  var DEF_REWARDS = [
    { id:'r1', name:'一次骑行', cost:10, emoji:'🚴' },
    { id:'r2', name:'一顿美味大餐', cost:30, emoji:'🍽️' },
    { id:'r3', name:'一盒玩具', cost:50, emoji:'🧸' },
    { id:'r4', name:'3D 打印耗材', cost:70, emoji:'🖨️' },
    { id:'r5', name:'一次电影票', cost:100, emoji:'🎬' }
  ];
  function allRewards(){ return DEF_REWARDS.concat(state.custom || []); }

  function renderRewards(){
    refreshTopbar();
    $('rBalance').textContent = balance();
    $('rSub').textContent = '累计获得 ' + (state.stars | 0) + ' 颗 · 已兑换 ' + (state.spent | 0) + ' 颗（兑换会从可用红星里扣掉）';

    var grid = $('rewardGrid'); grid.innerHTML = '';
    allRewards().forEach(function(r){
      var can = balance() >= r.cost;
      var div = document.createElement('div');
      div.className = 'reward';
      div.innerHTML =
        '<div class="rw-top"><div class="rw-emoji">' + (r.emoji || '🎁') + '</div>' +
        '<div class="rw-name">' + escapeHtml(r.name) + '</div></div>' +
        '<div class="rw-cost">⭐ ' + r.cost + ' 颗</div>' +
        '<button class="rw-btn' + (can ? '' : ' off') + '">' + (can ? '兑换' : '还差 ' + (r.cost - balance()) + ' 颗') + '</button>';
      div.querySelector('.rw-btn').addEventListener('click', function(){
        if(balance() < r.cost){ toast('红星还不够，继续加油！还差 ' + (r.cost - balance()) + ' 颗'); return; }
        openModal({
          emoji: r.emoji || '🎁',
          title: '兑换「' + r.name + '」？',
          text: '将花掉 ⭐ ' + r.cost + ' 颗红星。兑换后记得让爸爸妈妈兑现哦～',
          ok: '兑换',
          onOk: function(){ doRedeem(r); }
        });
      });
      grid.appendChild(div);
    });

    var list = $('redeemList'); list.innerHTML = '';
    if(!state.redeemed.length){
      list.innerHTML = '<div class="empty">还没有兑换记录，加油攒星星吧 ⭐</div>';
    }else{
      state.redeemed.slice().reverse().forEach(function(item){
        var idx = state.redeemed.indexOf(item);
        var div = document.createElement('div');
        div.className = 'redeem-item';
        div.innerHTML = '<span>' + (item.emoji || '🎁') + '</span>' +
          '<span class="ri-name">' + escapeHtml(item.name) + '<br><span class="ri-time">' + item.time + ' · 花了 ' + item.cost + ' 颗</span></span>' +
          '<button>撤销</button>';
        div.querySelector('button').addEventListener('click', function(){
          openModal({
            emoji:'↩️', title:'撤销这次兑换？', text:'红星会退回 ' + item.cost + ' 颗。', ok:'撤销',
            onOk: function(){
              state.spent = Math.max(0, (state.spent | 0) - item.cost);
              state.redeemed.splice(idx, 1);
              save(); renderRewards(); toast('已撤销，红星退回来啦');
            }
          });
        });
        list.appendChild(div);
      });
    }
  }

  function doRedeem(r){
    if(balance() < r.cost){ toast('红星不够啦'); return; }
    state.spent = (state.spent | 0) + r.cost;
    var d = new Date();
    state.redeemed.push({ name:r.name, cost:r.cost, emoji:r.emoji || '🎁', time:(d.getMonth()+1) + '月' + d.getDate() + '日' });
    save(); renderRewards(); sfxStar(); confetti();
    toast('兑换成功！找爸爸妈妈领取吧 🎉');
  }

  /* ================= 导出 / 导入 ================= */
  function exportData(){
    try{
      var blob = new Blob([JSON.stringify(store, null, 2)], { type:'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'PET单词档案-' + (state.name || 'MARK') + '-' + todayStr() + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 400);
      toast('已导出，换电脑时导入它就行');
    }catch(e){ toast('导出失败，换个浏览器试试'); }
  }

  function importData(file){
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var obj = JSON.parse(String(reader.result));
        var incoming = null;
        if(obj && obj.profiles && obj.active){ incoming = obj; }
        else if(obj && typeof obj.stars !== 'undefined'){          // 兼容 v2 单档案
          var nm = ((obj.name || 'MARK') + '').trim() || 'MARK';
          var p = fixProfile(obj, nm);
          incoming = { active: nm, profiles:{}, settings: store.settings };
          incoming.profiles[nm] = p;
        }
        if(!incoming){ toast('文件内容不对，请选导出的 json 文件'); return; }

        openModal({
          emoji:'📥', title:'导入这份档案？',
          text:'会合并到当前浏览器，同名档案会被覆盖。',
          ok:'导入',
          onOk: function(){
            Object.keys(incoming.profiles).forEach(function(k){
              store.profiles[k] = fixProfile(incoming.profiles[k], k);
            });
            store.active = incoming.active;
            if(incoming.settings) store.settings = Object.assign({}, store.settings, incoming.settings);
            state = store.profiles[store.active];
            save(); syncSelCat();
            renderHome(); renderSetup(); renderStats(); renderRewards();
            toast('导入成功！继续加油 💪');
          }
        });
      }catch(e){ toast('读取失败，文件可能损坏了'); }
    };
    reader.readAsText(file, 'utf-8');
  }

  /* ================= 事件 ================= */
  function confirmQuit(){
    openModal({
      emoji:'🤔', title:'要退出本组吗？',
      text:'退出后这一组不算完成，也拿不到今天的红星哦。',
      ok:'退出',
      onOk: function(){ session = null; renderHome(); showScreen('home'); }
    });
  }

  $('btnHome').addEventListener('click', function(){
    if(session && session.i < session.queue.length && $('screen-quiz').classList.contains('active')){ confirmQuit(); return; }
    if(battle && !battle.over && $('screen-battle').classList.contains('active')){
      openModal({
        emoji:'⚔️', title:'退出对战？', text:'这一局不算完成哦。', ok:'退出',
        onOk: function(){ stopTimer(); bgmOff(); battle = null; renderHome(); showScreen('home'); }
      });
      return;
    }
    renderHome(); showScreen('home');
  });

  $('btnStars').addEventListener('click', function(){ renderRewards(); showScreen('rewards'); });
  function syncVolumeUI(){
    var v = Math.round(vol() * 100);
    ['volRange', 'bVolRange'].forEach(function(id){ var el = $(id); if(el) el.value = v; });
    ['volNum', 'bVolNum'].forEach(function(id){ var el = $(id); if(el) el.textContent = v + '%'; });
  }
  function setVolume(v){
    store.settings.volume = Math.max(0, Math.min(1, v));
    if(store.settings.volume > 0 && !store.settings.sound){ store.settings.sound = true; }
    save();
    syncVolumeUI();
  syncSpeechModeUI();
    refreshTopbar();
    if(bgmEl) bgmEl.volume = Math.min(1, 0.5 * vol());
  }
  ['volRange', 'bVolRange'].forEach(function(id){
    var el = $(id);
    if(el) el.addEventListener('input', function(){ setVolume(parseInt(this.value, 10) / 100); });
  });

  $('btnSound').addEventListener('click', function(){
    store.settings.sound = !store.settings.sound;
    save(); refreshTopbar();
    if(!store.settings.sound){ bgmOff(); }
    else if(battle && !battle.over && $('screen-battle').classList.contains('active')){ bgmOn(); }
    toast(store.settings.sound ? '声音已打开 🔊' : '声音已关闭 🔇');
  });

  $('winBtn').addEventListener('click', function(){
    $('winMask').style.display = 'none';
    $('winMask').classList.remove('show');
    renderHome(); showScreen('home');
  });
  $('btnAvatar').addEventListener('click', openProfileEditor);
  $('btnEditProfile').addEventListener('click', openProfileEditor);

  $('btnStart').addEventListener('click', function(){ renderSetup(); showScreen('setup'); });
  $('btnBattle').addEventListener('click', function(){ startBattle(); });
  $('campaignCard').addEventListener('click', function(){ startBattle(); });
  $('btnRewards').addEventListener('click', function(){ renderRewards(); showScreen('rewards'); });
  $('btnStats').addEventListener('click', function(){ renderStats(); showScreen('stats'); });
  $('stEdit').addEventListener('click', openProfileEditor);
  $('btnStatsHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });

  $('btnWrong').addEventListener('click', function(){
    var wc = Object.keys(state.wrong).length;
    if(!wc){ toast('错词本是空的'); return; }
    selCat = 'wrong'; state.lastCat = 'wrong'; save();
    renderSetup();
    var s = buildSession('wrong');
    if(s){ showScreen('quiz'); renderQuestion(); }
  });

  $('btnGo').addEventListener('click', function(){
    var s = buildSession(selCat);
    if(!s) return;
    showScreen('quiz'); renderQuestion();
  });

  $('btnBackHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });
  function speakFeedback(ok){
    if(ok) return;
    if(!store.settings.sound){ toast('声音被关掉了，点右上角 🔊 打开'); return; }
    if(vol() <= 0){ toast('音量是 0，把下面的音量条拖大一点'); return; }
    toast('这个浏览器没有语音引擎，换 Chrome / Edge 打开试试');
  }
  $('btnSpeak').addEventListener('click', function(){
    if(!session) return;
    var q = session.queue[session.i];
    var ok = speakWord(q.w, 0.82);
    speakFeedback(ok);
    var btn = this;
    btn.classList.remove('busy'); void btn.offsetWidth; btn.classList.add('busy');
    setTimeout(function(){ btn.classList.remove('busy'); }, 600);
  });
  $('btnQuit').addEventListener('click', confirmQuit);

  $('btnBSpeak').addEventListener('click', function(){
    if(!battle || battle.over) return;
    var ok = speakWord(battle.queue[battle.i].w, 0.92);
    speakFeedback(ok);
  });

  $('btnBattleQuit').addEventListener('click', function(){
    openModal({
      emoji:'⚔️', title:'退出对战？', text:'这一局不算完成哦。', ok:'退出',
      onOk: function(){ stopTimer(); bgmOff(); battle = null; renderHome(); showScreen('home'); }
    });
  });

  $('btnAgain').addEventListener('click', function(){
    var s = buildSession(selCat);
    if(!s){ renderSetup(); showScreen('setup'); return; }
    renderQuestion(); showScreen('quiz');
  });
  $('btnResHistory').addEventListener('click', function(){ renderStats(); showScreen('stats'); });
  $('btnResHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });
  $('btnRewardsHome').addEventListener('click', function(){ renderHome(); showScreen('home'); });

  $('btnAddReward').addEventListener('click', function(){
    var name = ($('newRewardName').value || '').trim();
    var cost = parseInt($('newRewardCost').value, 10);
    if(!name){ toast('先写一个奖励名称'); return; }
    if(!cost || cost < 1 || cost > 999){ toast('星星数填 1 - 999 之间'); return; }
    state.custom.push({ id:'c' + Date.now(), name:name, cost:cost, emoji:'🎈' });
    save();
    $('newRewardName').value = ''; $('newRewardCost').value = '';
    renderRewards(); toast('奖励已添加');
  });

  function syncSpeechModeUI(){
    var mode = store.settings.speechMode || 'auto';
    var btns = document.querySelectorAll('.seg-btn[data-speech]');
    for(var i = 0; i < btns.length; i++){
      btns[i].classList.toggle('on', btns[i].getAttribute('data-speech') === mode);
    }
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.seg-btn[data-speech]') : null;
    if(!b) return;
    store.settings.speechMode = b.getAttribute('data-speech');
    save(); syncSpeechModeUI();
    toast('发音方式：' + b.textContent);
    speakWord('hello', 0.9);
  });

  $('btnVoiceTest').addEventListener('click', function(){
    openModal({
      emoji:'🔧', title:'语音诊断',
      html: '<div style="white-space:pre-line;text-align:left;font-size:12.5px;line-height:1.9;color:#5a5178;background:#faf8ff;border-radius:14px;padding:12px 14px">' +
            voiceReport() + '</div>',
      ok:'测试发音', cancel:'关闭',
      onOk: function(){
        var ok = speakWord('pants', 0.85);
        if(!ok){ toast('设备没有可用英文语音'); }
      }
    });
  });

  $('btnExport').addEventListener('click', exportData);
  $('btnImport').addEventListener('click', function(){ $('importFile').click(); });
  $('importFile').addEventListener('change', function(){
    var f = this.files && this.files[0];
    if(f) importData(f);
    this.value = '';
  });

  $('btnReset').addEventListener('click', function(){
    openModal({
      emoji:'⚠️', title:'清空这个档案？',
      text:'「' + state.name + '」的星星、打卡、错词本、学习记录都会被删除，无法恢复。',
      ok:'清空',
      onOk: function(){
        openModal({
          emoji:'🗑️', title:'真的确定吗？',
          text:'最后一次确认：清空后所有学习记录都会消失。',
          ok:'确认清空',
          onOk: function(){
            var nm = store.active;
            store.profiles[nm] = newProfile(nm);
            state = store.profiles[nm];
            syncSelCat(); save();
            renderHome(); renderSetup(); renderStats(); renderRewards();
            toast('已清空，重新开始吧');
            showScreen('home');
          }
        });
      }
    });
  });

  document.addEventListener('keydown', function(e){
    if($('modalMask').style.display === 'flex') return;
    if(!$('screen-quiz').classList.contains('active') && !$('screen-battle').classList.contains('active')) return;
    if(e.key >= '1' && e.key <= '3'){
      var i = parseInt(e.key, 10) - 1;
      var opts = $('screen-battle').classList.contains('active')
        ? document.querySelectorAll('#bOptions .opt')
        : document.querySelectorAll('#options .opt');
      if(opts[i]) opts[i].click();
    }
  });

  document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

  /* ================= 启动 ================= */
  var STORAGE_OK = (function(){
    try{ localStorage.setItem('__pet_t','1'); localStorage.removeItem('__pet_t'); return true; }
    catch(e){ return false; }
  })();

  renderHome();
  renderSetup();
  renderStats();
  renderRewards();
  syncVolumeUI();
  showScreen('home');

  if(!STORAGE_OK){
    setTimeout(function(){ toast('这个浏览器不保存进度，换 Chrome 或 Edge 打开就能记住了'); }, 900);
  }

})();
