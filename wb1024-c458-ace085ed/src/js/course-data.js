/* =========================================================
 * PyAcademy 课程数据
 * 字段说明：
 *   intro   课程导语
 *   sections 讲解小节：h 标题 / p 正文(允许少量内联code标签) / code 示例 / out 预期输出 / warn 警示 / tip 提示
 *   pitfalls 易错点
 *   exercises 练习：q 题目 / lv 难度 / hint 提示 / sol 参考答案
 * ========================================================= */
window.COURSES = [

/* ================= 第 1 课 ================= */
{
id:'c1', no:'01', title:'变量与数据类型', stage:'S1 · 语言基础', minutes:45,
intro:'程序的本质是「处理数据」，而变量就是给数据贴上的名字标签。这一课解决三个问题：数据放在哪、有哪些类型、类型之间怎么转换。所有示例都可以点代码块右上角的「运行」直接在浏览器里看结果。',
sections:[
 {h:'1.1 变量：给对象贴标签',
  p:'Python 的变量本质上是「名字 → 对象」的引用。赋值时不需要声明类型，解释器会自动推断，这叫<strong>动态类型</strong>。变量名遵循蛇形命名（如 user_name），区分大小写，不能用关键字（if、for、class 等）。',
  code:`name = "小明"        # 字符串\nage = 18             # 整数\nheight = 1.75        # 浮点数\nis_student = True    # 布尔值\n\nprint(name, age, height, is_student)\nprint(type(name), type(age), type(height), type(is_student))`,
  out:'小明 18 1.75 True\n<class \'str\'> <class \'int\'> <class \'float\'> <class \'bool\'>',
  tip:'用 id(变量) 可以查看对象在内存中的地址。a = 10; b = a 之后 id(a) == id(b)——两个名字指向同一个对象，这个模型理解了，后面很多「奇怪现象」都好解释。'},
 {h:'1.2 类型转换与 bool 的假值',
  p:'类型之间用 int() / float() / str() / bool() 显式转换。转换失败不会得到特殊值，而是直接抛出异常（ValueError）——Python 信奉「快速失败」。另外要记住 bool 的五个假值：0、0.0、空串 ""、空列表 []、None，其余都是真值。',
  code:`print(int("42") + 1)      # 字符串转整数\nprint(float("3.14"))\nprint(str(100) + " 分")   # 数字转字符串才能拼接\nprint(int(7.9))           # 截断，不是四舍五入\nprint(bool(0), bool(""), bool("0"))`,
  out:'43\n3.14\n100 分\n7\nFalse False True',
  warn:'int("3.14") 会直接报错！想转浮点再转整型要写 int(float("3.14"))。把 float 转 int 是「向零取整」，int(-3.7) 得到 -3 而不是 -4。'},
 {h:'1.3 运算符速通',
  p:'除了常见的 + - * /，Python 有三个高频特殊运算符：//（整除，向下取整）、%（取余，判断整除/分组神器）、**（幂运算）。逻辑运算用英文单词 and / or / not，并且支持链式比较，这是很多语言没有的语法糖。',
  code:`print(7 / 2)    # 除法永远得 float\nprint(7 // 2)   # 整除：3\nprint(7 % 2)    # 取余：1\nprint(2 ** 10)  # 幂：1024\n\nscore = 86\nprint(80 <= score < 90)      # 链式比较\nprint(score >= 60 and score < 90)  # 等价于上面`,
  out:'3.5\n3\n1\n1024\nTrue\nTrue'},
 {h:'1.4 f-string：现代格式化标配',
  p:'Python 3.6+ 推荐 f-string：字符串前加 f，花括号里直接写变量甚至表达式。冒号后可以控制格式，如 :.2f 保留两位小数、:>8 右对齐占 8 位。调试时写 {x=} 能同时输出变量名和值。',
  code:`pi = 3.14159\nprint(f"圆周率约等于 {pi:.2f}")\nprint(f"{'左对齐':<10}|{'右对齐':>10}|")\nprice = 99.5\nprint(f"价格是 {price * 0.8:.1f} 元（八折）")\nprint(f"{price = }")   # 调试神器`,
  out:'圆周率约等于 3.14\n左对齐       |    右对齐|\n价格是 79.6 元（八折）\nprice = 99.5'}
],
pitfalls:[
 {t:'0.1 + 0.2 != 0.3', d:'浮点数在计算机里是二进制近似存储，print(0.1 + 0.2) 得到 0.30000000000000004。涉及钱的计算用整数（分）或 decimal.Decimal。'},
 {t:'int("3.14") 直接崩', d:'字符串转 int 只认纯数字。混了小数点就抛 ValueError。'},
 {t:'True == 1 为 True', d:'bool 是 int 的子类，True 就是 1。sum([True, True, False]) 得到 2，这反而可以用来做计数技巧。'},
 {t:'变量未定义就用', d:'NameError 是新手最常撞见的报错。从报错信息最后一行往上读，它会告诉你是哪个名字没定义。'}
],
exercises:[
 {q:'输入圆的半径（用变量 r = 2.5 模拟），输出面积（保留 2 位小数，π 用 3.14159）', lv:'基础', hint:'面积公式 pi * r ** 2，用 f-string 的 :.2f',
  sol:`r = 2.5\npi = 3.14159\nprint(f"面积 = {pi * r ** 2:.2f}")`},
 {q:'BMI 计算器：weight = 68（kg），height = 1.72（m），输出 BMI 值并保留 1 位小数', lv:'基础', hint:'BMI = 体重 / 身高的平方',
  sol:`w, h = 68, 1.72\nbmi = w / h ** 2\nprint(f"BMI = {bmi:.1f}")`},
 {q:'不引入第三个变量，交换 a = 3 和 b = 5 的值', lv:'进阶', hint:'Python 支持多元赋值：a, b = b, a',
  sol:`a, b = 3, 5\na, b = b, a\nprint(a, b)  # 5 3`}
]
},

/* ================= 第 2 课 ================= */
{
id:'c2', no:'02', title:'字符串：索引、切片与方法', stage:'S1 · 语言基础', minutes:45,
intro:'字符串是使用频率最高的类型：用户名、文件路径、网页内容、日志……全是字符串。这一课的重点是「切片」这个贯穿 Python 全身的语法，以及一组必须背下来的字符串方法。',
sections:[
 {h:'2.1 索引与切片',
  p:'字符串是一个字符序列，可以下标访问，<strong>从 0 开始</strong>，负索引从尾部倒数（-1 是最后一个）。切片语法 s[start:stop:step]，<strong>包左不包右</strong>。切片是面试和日常使用频率最高的操作之一，必须形成肌肉记忆。',
  code:`s = "Python"\nprint(s[0], s[-1])       # P n\nprint(s[0:2])            # Py（不含索引2）\nprint(s[2:])             # thon\nprint(s[:3])             # Pyt\nprint(s[::-1])           # 反转：nohtyP\nprint(s[::2])            # 步长2：Pto\nprint(len(s))            # 长度：6`,
  out:'P n\nPy\nthon\nPyt\nnohtyP\nPto\n6',
  tip:'记住口诀「包左不包右」：s[1:4] 取索引 1、2、3。当 start 或 stop 省略时，表示「到头」。s[::-1] 反转字符串是 Python 的经典写法。'},
 {h:'2.2 字符串不可变',
  p:'字符串一旦创建就<strong>不能修改</strong>。所有"修改"类方法（replace、upper 等）返回的都是<strong>新字符串</strong>，原串纹丝不动。这是函数式思想：不修改旧值，返回新值。',
  code:`s = "hello world"\n# s[0] = "H"            # 报错！TypeError\nnew_s = s.replace("world", "Python")\nprint(s)        # 原串没变\nprint(new_s)    # 新串\nprint(s.upper().title())  # 链式调用`,
  out:'hello world\nhello Python\nHello World',
  warn:'如果代码里出现 s = s.replace(...)，不要以为你修改了 s —— 你是让 s 这个名字指向了新字符串，旧字符串会被垃圾回收。'},
 {h:'2.3 高频方法清单',
  p:'下面这些方法覆盖日常 90% 的字符串操作，建议全部亲手跑一遍：strip 去两端空白（处理用户输入必用）、split 切分、join 拼接、find 查找、startswith/endswith 判断前后缀、isdigit 判断数字。',
  code:`s = "  apple,banana,cherry  "\nclean = s.strip()\nitems = clean.split(",")\nprint(items)\nprint(" | ".join(items))   # join 的主角是分隔符\n\nfilename = "report.pdf"\nprint(filename.endswith(".pdf"))\nprint(filename.find("."))       # 点的位置\nprint("abc123".isdigit(), "123".isdigit())`,
  out:'[\'apple\', \'banana\', \'cherry\']\napple | banana | cherry\nTrue\n6\nFalse True'},
 {h:'2.4 转义字符与原始字符串',
  p:'\\n 换行、\\t 制表符、\\\\ 反斜杠本身。在字符串前加 r 可以让反斜杠失去转义能力（原始字符串），写 Windows 路径和正则表达式时必备。三引号字符串可以跨多行，常用于文档说明。',
  code:`print("第一行\\n第二行\\t缩进")\nprint(r"C:\\Users\\new\\table")   # 原始字符串\n\nhtml = """\n<div>\n  <p>多行文本</p>\n</div>\n"""\nprint(html.strip())`,
  out:'第一行\n第二行\t缩进\nC:\\Users\\new\\table\n<div>\n  <p>多行文本</p>\n</div>'}
],
pitfalls:[
 {t:'s[0] = "X" 报 TypeError', d:'字符串不可变，想改就用切片拼接或 replace 生成新串。'},
 {t:'split() 和 split(" ") 不同', d:'不传参数时按「任意连续空白」切分并忽略首尾空白，传 " " 则严格按单个空格切。处理用户输入几乎总应该用不带参数的 split()。'},
 {t:'join 只能拼字符串', d:'"".join([1, 2, 3]) 报错，要写成 "".join(str(x) for x in [1,2,3])。'},
 {t:'中文占几个字符？', d:'len("中") 是 1 —— Python3 的字符串按「码点」计数，不是字节。写文件时才需要关心编码（utf-8 下一个中文 3 字节）。'}
],
exercises:[
 {q:'判断回文：给定 word = "level"，输出它是否为回文（忽略大小写）', lv:'基础', hint:'s == s[::-1]',
  sol:`word = "Level".lower()\nprint(word == word[::-1])  # True`},
 {q:'统计 "python is awesome" 中元音字母（a e i o u）出现的次数', lv:'基础', hint:'遍历 + in "aeiou"',
  sol:`s = "python is awesome"\ncount = sum(1 for ch in s.lower() if ch in "aeiou")\nprint(count)  # 6`},
 {q:'把变量名 camel_case_str 转成驼峰 camelCaseStr；再反过来转回去', lv:'挑战', hint:'split("_") 后首字母大写拼回去；反过来用正则或逐字符扫描',
  sol:`s = "camel_case_str"\nparts = s.split("_")\ncamel = parts[0] + "".join(p.title() for p in parts[1:])\nprint(camel)  # camelCaseStr\n\nsnake = ""\nfor i, ch in enumerate(camel):\n    if ch.isupper() and i > 0:\n        snake += "_" + ch.lower()\n    else:\n        snake += ch\nprint(snake)  # camel_case_str`}
]
},

/* ================= 第 3 课 ================= */
{
id:'c3', no:'03', title:'列表与元组', stage:'S1 · 语言基础', minutes:50,
intro:'列表（list）是 Python 最常用的容器，没有之一。这一课除了增删改查，更重要的是理解「可变对象与引用」——这是 Python 新手 bug 的第一大来源。元组则是它的不可变兄弟。',
sections:[
 {h:'3.1 列表的基本操作',
  p:'列表用方括号定义，有序、可变、可重复。增用 append / insert / extend，删用 pop / remove / del，改用下标赋值，查用 in / index / count。切片语法在列表上完全适用。',
  code:`nums = [5, 2, 9, 2]\nnums.append(7)        # 尾部添加\nnums.insert(1, 100)   # 指定位置插入\nnums.remove(2)        # 删除第一个值为2的元素\nlast = nums.pop()     # 弹出并返回最后一个\nprint(nums, last)\nprint(nums.index(9), nums.count(2))\nprint(9 in nums, 99 not in nums)`,
  out:'[5, 100, 9, 2] 7\n2 1\nTrue True',
  tip:'remove 只删第一个匹配项且不存在时报 ValueError；pop 可以指定下标 nums.pop(0)。需要频繁头部插删时改用 collections.deque，效率更高。'},
 {h:'3.2 排序：sort 与 sorted',
  p:'<code>list.sort()</code> 是原地排序，返回 None；<code>sorted(list)</code> 返回新列表，不动原列表。都可以用 key 参数指定排序依据，reverse=True 反向。key 配合 lambda 能实现各种花式排序。',
  code:`nums = [3, 1, 4, 1, 5]\nprint(sorted(nums))       # 新列表\nprint(nums)               # 原列表没变\nnums.sort(reverse=True)   # 原地降序\nprint(nums)\n\nwords = ["banana", "fig", "apple"]\nprint(sorted(words, key=len))          # 按长度\npeople = [("小明", 86), ("小红", 92), ("小刚", 86)]\nprint(sorted(people, key=lambda p: -p[1]))  # 按分数降序`,
  out:'[1, 1, 3, 4, 5]\n[3, 1, 4, 1, 5]\n[5, 4, 3, 1, 1]\n[\'fig\', \'apple\', \'banana\']\n[(\'小红\', 92), (\'小明\', 86), (\'小刚\', 86)]',
  warn:'经典错误：nums = nums.sort() —— sort 返回 None，这一行之后 nums 就变成 None 了！直接调用 nums.sort() 不要赋值。'},
 {h:'3.3 引用！可变对象的头号陷阱',
  p:'<code>b = a</code> 复制的不是列表，而是「引用」——两个名字指向同一个列表对象，改一个另一个跟着变。想要独立副本用 a.copy() 或 a[:] 或 list(a)。嵌套列表的 copy 只复制第一层（浅拷贝），彻底复制要用 copy.deepcopy。',
  code:`a = [1, 2, 3]\nb = a            # 引用！\nb.append(4)\nprint(a)         # a 也变了！\n\nc = a.copy()\nc.append(99)\nprint(a, c)      # c 独立了\n\nmatrix = [[0] * 3] * 2   # 经典坑：两行是同一个列表\nmatrix[0][0] = 1\nprint(matrix)`,
  out:'[1, 2, 3, 4]\n[1, 2, 3, 4] [1, 2, 3, 4, 99]\n[[1, 0, 0], [1, 0, 0]]',
  warn:'[[0]*3]*2 的两行是同一个引用！正确写法：[[0]*3 for _ in range(2)]。记住口诀：乘号复制的是引用，推导式创建的才是独立对象。'},
 {h:'3.4 元组与解包',
  p:'元组（tuple）用圆括号，<strong>不可变</strong>，适合表示"固定结构"的记录，如 (姓名, 年龄, 分数)。解包是元组最优雅的用法：把序列一次性拆给多个变量，配合 * 可以收集剩余元素。函数返回多个值其实就是返回元组。',
  code:`point = (3, 5)\nx, y = point            # 解包\nprint(x, y)\n\nfirst, *rest = [1, 2, 3, 4, 5]\nprint(first, rest)      # 1 [2, 3, 4, 5]\n\ndef min_max(nums):\n    return min(nums), max(nums)   # 其实返回元组\nlo, hi = min_max([3, 1, 4, 1, 5])\nprint(lo, hi)`,
  out:'3 5\n1 [2, 3, 4, 5]\n1 5',
  tip:'其实只有一个元素的元组要写成 (3,)，(3) 只是数字 3。元组比列表省内存、可哈希（能当字典的键），凡是"不该被改"的数据优先用元组。'}
],
pitfalls:[
 {t:'b = a 之后改 b，a 也变了', d:'引用问题。用 copy() 或切片 a[:] 创建副本。'},
 {t:'nums.sort() 返回 None', d:'原地方法都返回 None。想要新列表用 sorted(nums)。'},
 {t:'列表乘法是浅复制', d:'[[0]*3]*2 里两行是同一个列表对象。'},
 {t:'遍历时增删元素', d:'for 循环里 remove 元素会导致跳元素。正确做法是遍历副本 for x in lst[:] 或用推导式重建列表。'}
],
exercises:[
 {q:'scores = [88, 92, 79, 93, 85]，输出去重（本题无重复，改为：找出第二高的分数）', lv:'进阶', hint:'sorted(set(scores))[-2] 或排序后取倒数第二个',
  sol:`scores = [88, 92, 79, 93, 85]\nprint(sorted(scores)[-2])  # 92\n# 注意 [88, 92, 92, 79] 这种有重复的情况要用 set：\nprint(sorted(set(scores))[-2])`},
 {q:'用 zip 实现矩阵转置：matrix = [[1,2,3],[4,5,6]] 转成 [[1,4],[2,5],[3,6]]', lv:'进阶', hint:'list(map(list, zip(*matrix)))',
  sol:`matrix = [[1, 2, 3], [4, 5, 6]]\nprint([list(col) for col in zip(*matrix)])\n# [[1, 4], [2, 5], [3, 6]]`},
 {q:'约瑟夫环简版：15 个人围成圈从 1 报数，报到 7 的人出列，输出出列顺序', lv:'挑战', hint:'用列表模拟 + 取模运算处理环形',
  sol:`people = list(range(1, 16))\norder, idx = [], 0\nwhile people:\n    idx = (idx + 6) % len(people)   # 报到7：跨过6个人\n    order.append(people.pop(idx))\nprint(order)`}
]
},

/* ================= 第 4 课 ================= */
{
id:'c4', no:'04', title:'字典与集合', stage:'S1 · 语言基础', minutes:45,
intro:'字典（dict）提供「键 → 值」的映射，查找速度是 O(1)，是 Python 性能与优雅的基石——统计、缓存、配置、JSON 全靠它。集合（set）则是「只存键的字典」，天然去重。',
sections:[
 {h:'4.1 字典的增删改查',
  p:'字典用花括号 {键: 值} 定义，Python 3.7+ 保证插入顺序。访问不存在的键会 KeyError，安全访问用 get(键, 默认值)。增改直接赋值，删用 pop / del。遍历用 items() 同时拿键值。',
  code:`user = {"name": "小明", "age": 18}\nuser["city"] = "杭州"        # 增\nuser["age"] = 19             # 改\nprint(user.get("email"), user.get("email", "未填写"))\n\nfor key, value in user.items():\n    print(key, ":", value)\n\nuser.pop("city")\nprint(user, len(user))`,
  out:'None 未填写\nname : 小明\nage : 19\ncity : 杭州\n{\'name\': \'小明\', \'age\': 19} 2',
  tip:'in 检查的是键而不是值："name" in user 为 True，"小明" in user 为 False。检查值要写 "小明" in user.values()。'},
 {h:'4.2 统计三件套：get / setdefault / Counter',
  p:'「词频统计」是字典最典型的应用场景。三种写法从朴素到优雅：手动 get 累加、setdefault 自动初始化、以及标准库 collections.Counter 一行搞定。Counter 还自带 most_common 排序。',
  code:`text = "abracadabra"\n\n# 写法一：get + 默认值\nc1 = {}\nfor ch in text:\n    c1[ch] = c1.get(ch, 0) + 1\n\n# 写法二：setdefault\nc2 = {}\nfor ch in text:\n    c2.setdefault(ch, 0)\n    c2[ch] += 1\n\n# 写法三：Counter（推荐）\nfrom collections import Counter\nc3 = Counter(text)\nprint(c3.most_common(3))   # 前3名\nprint(dict(c3))`,
  out:'[(\'a\', 5), (\'b\', 2), (\'r\', 2)]\n{\'a\': 5, \'b\': 2, \'r\': 2, \'c\': 1, \'d\': 1}'},
 {h:'4.3 集合：去重与关系运算',
  p:'集合无序、元素唯一，支持数学集合运算：交集 &、并集 |、差集 -、对称差 ^。判断成员 in 对集合是 O(1)（列表是 O(n)），大列表频繁判断成员时转成集合能大幅提速。',
  code:`skills_a = {"Python", "SQL", "Git"}\nskills_b = {"SQL", "Linux"}\n\nprint(skills_a & skills_b)   # 都会\nprint(skills_a | skills_b)   # 任一\nprint(skills_a - skills_b)   # A有B无\n\nnums = [3, 1, 3, 2, 1, 3]\nprint(set(nums))             # 去重\nprint(list(dict.fromkeys(nums)))  # 去重且保序\n\nbig = list(range(1000000))\nprint(999999 in big, 999999 in set(big))`,
  out:'{\'SQL\'}\n{\'Git\', \'SQL\', \'Python\', \'Linux\'}\n{\'Git\', \'Python\'}\n{1, 2, 3}\n[3, 1, 2]\nTrue True',
  warn:'空集合必须写 set()，因为 {} 是空字典！另外 set 无序，打印顺序可能和插入顺序不同，上面的输出在你的机器上顺序可能不一样——这不影响正确性。'},
 {h:'4.4 字典推导式与嵌套',
  p:'字典和集合都支持推导式：{k: v for ...}。真实数据几乎都是嵌套结构（列表套字典最常见，比如 API 返回的 JSON），掌握「遍历嵌套 + 列表推导筛选」是从新手到熟手的分水岭。',
  code:`squares = {x: x ** 2 for x in range(1, 6)}\nprint(squares)\n\nstudents = [\n    {"name": "小明", "score": 86, "city": "杭州"},\n    {"name": "小红", "score": 92, "city": "上海"},\n    {"name": "小刚", "score": 74, "city": "杭州"},\n]\nhangzhou = [s["name"] for s in students if s["city"] == "杭州"]\nprint(hangzhou)\nby_city = {}\nfor s in students:\n    by_city.setdefault(s["city"], []).append(s["name"])\nprint(by_city)`,
  out:'{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}\n[\'小明\', \'小刚\']\n{\'杭州\': [\'小明\', \'小刚\'], \'上海\': [\'小红\']}'}
],
pitfalls:[
 {t:'遍历字典时删除键', d:'RuntimeError: dictionary changed size during iteration。先收集要删的键，循环结束后统一删。'},
 {t:'键必须可哈希', d:'列表不能当键（TypeError: unhashable type），元组可以。'},
 {t:'dict1 = dict2 是引用', d:'和列表一样，字典也是可变对象，赋值只复制引用，独立副本用 dict1.copy() 或 dict(dict1)。'},
 {t:'get 与 [] 的区别', d:'user["email"] 不存在直接崩；user.get("email") 返回 None。写配置解析时几乎永远该用 get。'}
],
exercises:[
 {q:'统计字符串 "the quick brown fox jumps over the lazy dog the end" 中每个单词出现次数，输出出现最多的两个词', lv:'基础', hint:'Counter + most_common(2)',
  sol:`from collections import Counter\ntext = "the quick brown fox jumps over the lazy dog the end"\nprint(Counter(text.split()).most_common(2))`},
 {q:'两数之和：nums = [2, 7, 11, 15]，target = 9，用字典一次遍历找出和为 target 的两个下标（LeetCode 第 1 题）', lv:'挑战', hint:'遍历时查 target - x 是否已在字典里',
  sol:`nums = [2, 7, 11, 15]\ntarget = 9\nseen = {}                      # 值 -> 下标\nfor i, x in enumerate(nums):\n    if target - x in seen:\n        print(seen[target - x], i)   # 0 1\n        break\n    seen[x] = i`},
 {q:'合并两个成绩字典，同名的取较高分：a={"语文":85,"数学":90}，b={"数学":95,"英语":88}', lv:'进阶', hint:'先复制一份，再遍历另一个用 max 合并',
  sol:`a = {"语文": 85, "数学": 90}\nb = {"数学": 95, "英语": 88}\nmerged = dict(a)\nfor k, v in b.items():\n    merged[k] = max(v, merged.get(k, v))\nprint(merged)  # {'语文': 85, '数学': 95, '英语': 88}`}
]
},

/* ================= 第 5 课 ================= */
{
id:'c5', no:'05', title:'条件与循环', stage:'S1 · 语言基础', minutes:45,
intro:'程序之所以"智能"，是因为它会判断（if）和重复（for/while）。这一课还藏着一个 90% 的学习者不知道的冷知识——循环的 else 分支。',
sections:[
 {h:'5.1 条件分支',
  p:'if / elif / else 按<strong>缩进</strong>划分代码块（4 个空格是社区规范，Tab 和空格混用会直接报错）。简单二选一可以用三元表达式：值1 if 条件 else 值2。',
  code:`score = 86\nif score >= 90:\n    grade = "优"\nelif score >= 80:\n    grade = "良"\nelse:\n    grade = "加油"\nprint(grade)\n\n# 三元表达式\nstatus = "及格" if score >= 60 else "不及格"\nprint(status)\n\n# 多条件组合\nage, vip = 25, True\nif vip or age >= 60:\n    print("免排队")`,
  out:'良\n及格\n免排队',
  tip:'Python 没有 switch 语句，但 3.10+ 提供了 match-case 模式匹配。此外空容器在 if 里直接是 False，所以 if user_list: 就是"列表非空"的意思，非常地道。'},
 {h:'5.2 for 循环与 range',
  p:'for 遍历的是「可迭代对象」：列表、字符串、字典、range 都是。range(start, stop, step) 同样包左不包右。需要下标时用 enumerate，并行遍历两个序列用 zip——这两个内建函数能让你少写 90% 的 range(len(...))。',
  code:`for i in range(1, 4):        # 1 2 3\n    print(i, end=" ")\nprint()\n\nfruits = ["苹果", "香蕉", "橘子"]\nfor idx, fruit in enumerate(fruits, start=1):  # 带序号\n    print(idx, fruit)\n\nfor name, price in zip(fruits, [5.5, 3.2, 4.0]):\n    print(f"{name}: {price}元")`,
  out:'1 2 3\n1 苹果\n2 香蕉\n3 橘子\n苹果: 5.5元\n香蕉: 3.2元\n橘子: 4.0元',
  warn:'忘掉 range(len(fruits)) 这种写法吧——它只在极少数"既要改元素又要下标"的场景才需要。地道的 Python 永远优先直接遍历元素。'},
 {h:'5.3 while、break 与循环 else',
  p:'while 适合"不知道要循环几次"的场景（游戏循环、等待输入）。break 立即跳出整个循环，continue 跳过本次进入下一轮。<strong>冷知识</strong>：循环可以接 else，当循环没有被 break 打断时执行——典型用途是"找一圈没找到"的判断。',
  code:`# 经典：猜数字\nimport random\nanswer = random.randint(1, 10)\n# 这里用固定值模拟（浏览器环境没有 input）\nanswer, guesses = 7, [3, 8, 7]\nfor g in guesses:\n    if g == answer:\n        print("猜中了！", g)\n        break\nelse:\n    print("很遗憾没猜中")   # 没被 break 才执行\n\n# while 版本\nn = 100\nwhile n > 0:\n    if n % 13 == 0:\n        print("100以内最大的13倍数:", n)\n        break\n    n -= 1`,
  out:'猜中了！ 7\n100以内最大的13倍数: 91'},
 {h:'5.4 循环性能小贴士',
  p:'循环里最贵的操作往往是重复计算。把不变的计算移出循环、用局部变量缓存方法、必要时用推导式替代循环，是三个立竿见影的优化手段。',
  code:`import time\n\nn = 200000\n\n# 慢：每次都重新 len\nstart = time.time()\ntotal = 0\nlst = list(range(n))\nfor i in range(len(lst)):\n    total += lst[i]\nt1 = time.time() - start\n\n# 快：直接遍历\nstart = time.time()\ntotal = sum(lst)\nt2 = time.time() - start\n\nprint(f"循环累加: {t1*1000:.1f}ms, 内建sum: {t2*1000:.1f}ms")`,
  out:'循环累加: 18.2ms, 内建sum: 3.5ms',
  tip:'内建函数 sum/max/min/len 都是 C 实现的，比自己写循环快得多。能一行写清的简单求和聚合，优先用内建函数。'}
],
pitfalls:[
 {t:'= 写成 ==', d:'if x = 5 是语法错误，Python 会直接拒绝运行——这反而是好事，比某些语言悄悄通过要友好。'},
 {t:'range(1, 10) 不含 10', d:'再次强调包左不包右。1 到 10 的循环是 range(1, 11)。'},
 {t:'input() 返回字符串', d:'input("数字") 得到的是 "5" 不是 5，做算术前必须 int() 转换（浏览器实验室里没有 input，用变量模拟）。'},
 {t:'死循环', d:'while 忘记更新条件变量就永远出不来。PyCharm/VS Code 点红色方块停止，终端 Ctrl+C。'}
],
exercises:[
 {q:'FizzBuzz：1 到 30，3 的倍数打印 Fizz，5 的倍数打印 Buzz，15 的倍数打印 FizzBuzz', lv:'基础', hint:'先判断 15，再判断 3 和 5',
  sol:`for i in range(1, 31):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`},
 {q:'打印金字塔：输入 4 行，输出如下图形（每行前导空格递减、星号递增）', lv:'基础', hint:'第 i 行：空格 n-i 个，星号 2i-1 个',
  sol:`n = 4\nfor i in range(1, n + 1):\n    print(" " * (n - i) + "*" * (2 * i - 1))`},
 {q:'找出 100 以内所有的质数，并统计个数（循环 + else 的一题两用）', lv:'挑战', hint:'内层循环没被 break 说明没有因数，正是质数——循环 else 的完美场景',
  sol:`primes = []\nfor n in range(2, 100):\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            break\n    else:\n        primes.append(n)   # 循环正常结束 = 质数\nprint(primes)\nprint("共", len(primes), "个")  # 25 个`}
]
},

/* ================= 第 6 课 ================= */
{
id:'c6', no:'06', title:'函数：参数、作用域与陷阱', stage:'S2 · 组织代码', minutes:50,
intro:'函数是代码复用的最小单位。这一课的目标：会写、会传参、懂作用域，并彻底搞懂那个面试必考的「可变默认参数」陷阱。',
sections:[
 {h:'6.1 定义、返回值与多返回值',
  p:'用 def 定义函数。没有 return 或裸 return 时返回 None。return 多个值其实是返回元组，接收方解包即可。函数名同样用蛇形命名，动词开头是好习惯（get_xxx / calc_xxx / is_xxx）。',
  code:`def greet(name, greeting="你好"):\n    return f"{greeting}，{name}！"\n\nprint(greet("小明"))\nprint(greet("Tom", "Hello"))\n\ndef analyze(nums):\n    """返回 总和、平均值、最大值"""\n    return sum(nums), sum(nums) / len(nums), max(nums)\n\ntotal, avg, best = analyze([88, 92, 79])\nprint(total, avg, best)`,
  out:'你好，小明！\nHello，Tom！\n259 86.33333333333333 92',
  tip:'紧跟在 def 下一行的三引号字符串是文档字符串（docstring），help(函数名) 就能看到它。养成随手写的习惯，这是"自文档化"的第一步。'},
 {h:'6.2 参数的四种形态',
  p:'按位置传参最常见；带默认值的参数可以省略；调用时用 键=值 的关键字参数可以乱序、可读性更好；*args 收集多余位置参数成元组，**kwargs 收集多余关键字参数成字典。',
  code:`def make_coffee(size, milk=True, *toppings, **options):\n    print(f"咖啡：{size}杯，{'加' if milk else '不加'}奶")\n    if toppings:\n        print("  加料:", toppings)\n    for k, v in options.items():\n        print(f"  {k} = {v}")\n\nmake_coffee("大", False, "焦糖", "奶油", sugar="半糖", temp="去冰")`,
  out:'咖啡：大杯，不加奶\n  加料: (\'焦糖\', \'奶油\')\n  sugar = 半糖\n  temp = 去冰',
  tip:'反过来也有「解包传参」：f(*my_list) 把列表拆成位置参数，f(**my_dict) 把字典拆成关键字参数。写 API 封装时非常常用。'},
 {h:'6.3 可变默认参数：年度第一大坑',
  p:'默认值在<strong>函数定义时求值一次</strong>，之后所有调用共享同一个对象。默认参数是可变类型（列表/字典）时，上次调用修改的数据会"漏"到下次调用——这是 Python 官方 FAQ 里的经典坑。',
  code:`def add_task_bad(task, tasks=[]):    # 危险！\n    tasks.append(task)\n    return tasks\n\nprint(add_task_bad("买菜"))\nprint(add_task_bad("写代码"))   # 上次的"买菜"还在！\n\n# 正确写法：用 None 占位，函数体内创建\ndef add_task(task, tasks=None):\n    if tasks is None:\n        tasks = []\n    tasks.append(task)\n    return tasks\n\nprint(add_task("买菜"))\nprint(add_task("写代码"))       # 干净了`,
  out:'[\'买菜\']\n[\'买菜\', \'写代码\']\n[\'买菜\']\n[\'写代码\']'},
 {h:'6.4 作用域：LEGB 规则',
  p:'变量查找顺序：Local（函数内）→ Enclosing（外层函数）→ Global（模块级）→ Builtin（内建）。在函数内给名字赋值会创建<strong>局部变量</strong>，除非你用 global / nonlocal 声明。好的代码尽量避免 global——传参进去、返回值出来，才是干净的写法。',
  code:`count = 0                 # 全局\n\ndef increase_bad():\n    count = 99            # 只是创建局部变量，不影响全局\n\ndef increase_good():\n    global count\n    count += 1\n\nincrease_bad()\nprint(count)              # 还是 0\nincrease_good()\nprint(count)              # 1\n\n# 更推荐：纯函数风格\ndef increase(n):\n    return n + 1\ncount = increase(count)\nprint(count)              # 2`,
  out:'0\n1\n2'}
],
pitfalls:[
 {t:'可变默认参数', d:'def f(x, acc=[]) —— acc 会在多次调用间共享。永远用 None 占位。'},
 {t:'函数里改全局变量不生效', d:'没有 global 声明时赋值只创建局部变量。当然更好的方案是根本不用全局变量。'},
 {t:'print 和 return 混淆', d:'函数里只 print 不 return，外面拿到的永远是 None。print 是给人看的，return 是给程序用的。'},
 {t:'先调用后定义', d:'Python 从上到下执行，def 之前调用函数会 NameError。'}
],
exercises:[
 {q:'写 is_prime(n) 判断质数，再用它打印 1-100 的所有质数', lv:'基础', hint:'试除到 sqrt(n) 即可，range(2, int(n**0.5)+1)',
  sol:`def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint([n for n in range(1, 101) if is_prime(n)])`},
 {q:'写一个 calc(a, b, op) 支持加减乘除，除数为 0 返回 None，未知运算符抛 ValueError', lv:'进阶', hint:'if/elif 分发即可；raise ValueError("...")',
  sol:`def calc(a, b, op):\n    if op == "+":  return a + b\n    if op == "-":  return a - b\n    if op == "*":  return a * b\n    if op == "/":\n        if b == 0:\n            return None\n        return a / b\n    raise ValueError(f"不支持的运算符: {op}")\n\nprint(calc(8, 2, "*"))\nprint(calc(1, 0, "/"))\nprint(calc(1, 2, "^") if False else "未知运算符会抛异常")`},
 {q:'写函数 flatten(nested)，把任意深度的嵌套列表压平：[1,[2,[3,4]],5] → [1,2,3,4,5]（用递归）', lv:'挑战', hint:'遍历时 isinstance(x, list) 就递归展开，否则追加',
  sol:`def flatten(nested):\n    result = []\n    for x in nested:\n        if isinstance(x, list):\n            result.extend(flatten(x))   # 递归\n        else:\n            result.append(x)\n    return result\n\nprint(flatten([1, [2, [3, 4]], 5]))`}
]
},

/* ================= 第 7 课 ================= */
{
id:'c7', no:'07', title:'面向对象：类、继承与魔法方法', stage:'S2 · 组织代码', minutes:60,
intro:'类把「数据」和「操作数据的函数」打包在一起。判断标准很简单：当一组数据和它的行为总是成对出现时（账户和余额、学生和成绩），就该用类了。',
sections:[
 {h:'7.1 类与实例',
  p:'class 定义类，__init__ 是初始化方法，self 指向实例本身（Python 会自动传入，写第一个参数即可）。实例属性每个对象一份；直接定义在类下的<strong>类属性</strong>所有实例共享。',
  code:`class Student:\n    school = "实验中学"            # 类属性（共享）\n\n    def __init__(self, name, age):\n        self.name = name           # 实例属性（独有）\n        self.age = age\n        self.scores = []\n\n    def add_score(self, score):\n        self.scores.append(score)\n\n    def average(self):\n        return sum(self.scores) / len(self.scores) if self.scores else 0\n\ns1 = Student("小明", 16)\ns2 = Student("小红", 17)\ns1.add_score(90)\ns1.add_score(80)\nprint(s1.name, s1.average())\nprint(s2.name, s2.average())    # s2 的成绩列表是独立的\nprint(Student.school, s1.school)`,
  out:'小明 85.0\n小红 0\n实验中学 实验中学'},
 {h:'7.2 __str__ 与 __repr__：可控的显示',
  p:'print(对象) 默认显示难看的 <__main__.Student object at 0x...>。定义 __str__ 后 print 走它；__repr__ 是开发者视图，交互式终端和调试器用它。日常实践：两个都定义，__repr__ 甚至可以直接返回 __str__ 的结果。',
  code:`class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __repr__(self):\n        return f"Point({self.x}, {self.y})"\n\n    def __str__(self):\n        return f"({self.x}, {self.y})"\n\np = Point(3, 5)\nprint(p)          # 调用 __str__\nprint([p])        # 容器里显示 __repr__`,
  out:'(3, 5)\n[Point(3, 5)]'},
 {h:'7.3 继承与 super()',
  p:'子类自动获得父类的全部能力，用 super().__init__() 复用父类初始化逻辑，再补自己的部分。重写方法时函数签名尽量保持一致。判断"是不是"用 isinstance，比比较类名靠谱（能识别继承链）。',
  code:`class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        raise NotImplementedError("子类必须实现 speak")\n\n    def intro(self):\n        return f"我是{self.name}，{self.speak()}"\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)\n        self.breed = breed\n\n    def speak(self):\n        return "汪汪"\n\nclass Cat(Animal):\n    def speak(self):\n        return "喵喵"\n\nzoo = [Dog("旺财", "柴犬"), Cat("咪咪")]\nfor a in zoo:\n    print(a.intro(), "| 是动物吗:", isinstance(a, Animal))`,
  out:'我是旺财，汪汪 | 是动物吗: True\n我是咪咪，喵喵 | 是动物吗: True',
  tip:'Python 支持多继承（class C(A, B)），方法按 MRO（方法解析顺序）查找，可以用 类名.__mro__ 查看。新手阶段建议只用单继承，避免菱形继承的复杂度。'},
 {h:'7.4 @property：优雅的受控属性',
  p:'把方法伪装成属性：score setter 里可以做校验（比如分数必须在 0-100），外部依然用 s.score = 85 的自然写法。这比 Java 风格的 getScore/setScore 地道得多。双下划线前缀（__name）触发名称改写，实现简单的"私有"。',
  code:`class Exam:\n    def __init__(self):\n        self._score = 0        # 单下划线 = 内部约定\n\n    @property\n    def score(self):\n        return self._score\n\n    @score.setter\n    def score(self, value):\n        if not 0 <= value <= 100:\n            raise ValueError("分数必须在 0-100 之间")\n        self._score = value\n\ne = Exam()\ne.score = 92\nprint(e.score)\ntry:\n    e.score = 150\nexcept ValueError as err:\n    print("拦截到非法值:", err)`},
 {h:'7.5 魔法方法：让对象参与运算',
  p:'双下划线方法（dunder methods）定义了对象与语言交互的方式：__len__ 支持 len()，__eq__ 支持 ==，__add__ 支持 +，__getitem__ 支持下标访问。实现它们，自定义类就能像内建类型一样自然。',
  code:`class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __eq__(self, other):\n        return self.x == other.x and self.y == other.y\n\n    def __repr__(self):\n        return f"Vector({self.x}, {self.y})"\n\nv1, v2 = Vector(1, 2), Vector(3, 4)\nprint(v1 + v2)                 # 像内建类型一样相加\nprint(v1 == Vector(1, 2))      # True`}],
pitfalls:[
 {t:'忘了 self', d:'实例方法第一个参数永远是 self，调用时不用传。忘了写会在调用时报参数数量错误。'},
 {t:'可变类属性被所有实例共享', d:'class 下直接写 tasks = []，所有实例的 tasks 是同一个列表！需要独有数据的放 __init__ 里。'},
 {t:'__init__ 不是构造对象的方法', d:'真正创建对象的是 __new__，__init__ 只负责初始化。知道即可，日常几乎只写 __init__。'},
 {t:'滥继承', d:'"猫是一种动物"适合继承；"汽车有一个引擎"该用组合（把引擎作为属性）。is-a 用继承，has-a 用组合。'}
],
exercises:[
 {q:'实现 BankAccount：deposit/withdraw（余额不足抛自定义异常 InsufficientBalance）、balance 只读属性', lv:'进阶', hint:'自定义异常 class InsufficientBalance(Exception)；balance 用 @property 只读',
  sol:`class InsufficientBalance(Exception):\n    pass\n\nclass BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance\n\n    @property\n    def balance(self):\n        return self._balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("存款金额必须为正")\n        self._balance += amount\n\n    def withdraw(self, amount):\n        if amount > self._balance:\n            raise InsufficientBalance(f"余额不足: 仅有 {self._balance}")\n        self._balance -= amount\n\nacc = BankAccount("小明", 100)\nacc.deposit(50)\ntry:\n    acc.withdraw(500)\nexcept InsufficientBalance as e:\n    print("失败:", e)\nacc.withdraw(30)\nprint(acc.balance)  # 120`},
 {q:'实现一个 Playlist 类：支持 add(song)、len()（__len__）、下标访问 songs[0]（__getitem__）、print 显示歌单（__str__）', lv:'挑战', hint:'把四个魔法方法各写一遍',
  sol:`class Playlist:\n    def __init__(self, name):\n        self.name = name\n        self._songs = []\n\n    def add(self, song):\n        self._songs.append(song)\n\n    def __len__(self):\n        return len(self._songs)\n\n    def __getitem__(self, idx):\n        return self._songs[idx]\n\n    def __str__(self):\n        lines = [f"歌单《{self.name}》共{len(self)}首"]\n        for i, s in enumerate(self._songs, 1):\n            lines.append(f"  {i}. {s}")\n        return "\\n".join(lines)\n\npl = Playlist("学习BGM")\npl.add("Chrono Trigger")\npl.add("Weightless")\nprint(pl)\nprint("第一首:", pl[0], "| 总数:", len(pl))`}
]
},

/* ================= 第 8 课 ================= */
{
id:'c8', no:'08', title:'文件与异常处理', stage:'S3 · 工程起点', minutes:50,
intro:'这一课让程序获得两样关键能力：记住数据（文件读写）和优雅地失败（异常处理）。学完之后你的程序才配得上"可靠"两个字。',
sections:[
 {h:'8.1 with open：读与写',
  p:'open(path, mode, encoding="utf-8") 打开文件，<strong>永远用 with 语句</strong>——它保证无论如何都会关闭文件。模式：r 读（默认）、w 写（清空原内容！）、a 追加、+ 读写。Windows 一定显式指定 encoding="utf-8"，否则默认 GBK 会乱码。',
  code:`# 写文件（浏览器虚拟文件系统里运行）\nwith open("notes.txt", "w", encoding="utf-8") as f:\n    f.write("第一行\\n")\n    f.writelines(["第二行\\n", "第三行\\n"])\n\n# 追加\nwith open("notes.txt", "a", encoding="utf-8") as f:\n    f.write("第四行（追加）\\n")\n\n# 读：三种方式\nwith open("notes.txt", encoding="utf-8") as f:\n    print(f.read())                # 整个读\n\nwith open("notes.txt", encoding="utf-8") as f:\n    lines = f.readlines()          # 读成列表\nprint("行数:", len(lines))`,
  out:'第一行\n第二行\n第三行\n第四行（追加）\n行数: 4',
  warn:'"w" 模式打开的一瞬间文件就被清空了，哪怕你还没写任何东西。想保留历史必须用 "a"。这是真实生产事故的常见来源。'},
 {h:'8.2 逐行处理：内存友好的标准姿势',
  p:'大文件不要 read() 一口气读进内存。文件对象本身就是迭代器，逐行遍历即可，内存占用恒定。配合 strip() 去换行符、split() 解析字段，就能处理绝大多数文本数据。',
  code:`with open("sales.csv", "w", encoding="utf-8") as f:\n    f.write("商品,金额\\n键盘,299\\n鼠标,129\\n显示器,1599\\n")\n\ntotal = 0\nwith open("sales.csv", encoding="utf-8") as f:\n    header = next(f)               # 跳过表头\n    for line in f:                 # 逐行迭代\n        name, amount = line.strip().split(",")\n        total += int(amount)\n        print(name, amount)\nprint("总销售额:", total)`},
 {h:'8.3 JSON 与 CSV：最常用的两种格式',
  p:'JSON 是配置和接口数据的通用语言：json.dump/dumps 写、load/loads 读，ensure_ascii=False 保留中文，indent 美化。CSV 用内建 csv 模块处理，比手工 split 可靠（能处理字段内含逗号的情况）。',
  code:`import json, csv\n\ndata = {"name": "小明", "skills": ["Python", "SQL"], "level": 3}\nwith open("user.json", "w", encoding="utf-8") as f:\n    json.dump(data, f, ensure_ascii=False, indent=2)\n\nwith open("user.json", encoding="utf-8") as f:\n    back = json.load(f)\nprint(back["name"], back["skills"])\n\n# CSV\nwith open("people.csv", "w", newline="", encoding="utf-8") as f:\n    w = csv.writer(f)\n    w.writerow(["姓名", "城市"])\n    w.writerows([["小明", "杭州"], ["小红", "上海"]])\n\nwith open("people.csv", encoding="utf-8") as f:\n    for row in csv.reader(f):\n        print(row)`},
 {h:'8.4 异常处理：try / except / else / finally',
  p:'程序崩了要给用户友好提示、给系统留日志。except 可以捕获特定异常（推荐）；else 在无异常时执行；finally 无论如何都执行（清理资源）。主动报错用 raise，业务规则违规可以定义自己的异常类。',
  code:`def parse_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        print(f"无法把 {text!r} 转成整数")\n        return None\n    finally:\n        print(f"  （已处理输入 {text!r}）")\n\nprint(parse_int("42"))\nprint(parse_int("abc"))\n\nclass AgeError(Exception):\n    pass\n\ndef set_age(age):\n    if age < 0:\n        raise AgeError("年龄不能为负")\n    return age\n\ntry:\n    set_age(-5)\nexcept AgeError as e:\n    print("业务异常:", e)`}],
pitfalls:[
 {t:'忘了 encoding="utf-8"', d:'Windows 上读写中文文件出现乱码或 UnicodeDecodeError 的头号原因。'},
 {t:'用 w 模式打开已有文件', d:'内容瞬间清空。写日志、记账一律用 a 追加模式。'},
 {t:'裸 except 或 except Exception', d:'会把 KeyboardInterrupt、程序 bug 全部吞掉，问题被掩盖。永远捕获具体异常类型。'},
 {t:'异常处理后继续用坏数据', d:'parse 失败返回 None 后，调用方忘了判 None 就往下算，最后在别处爆出莫名其妙的 TypeError。'}
],
exercises:[
 {q:'实现一个简易记账本：add_record(金额, 备注) 追加写入 ledger.csv，report() 读取并输出总支出与每条记录', lv:'进阶', hint:'写用 csv.writer + 追加模式；读用 csv.reader 并跳过表头',
  sol:`import csv\n\ndef add_record(amount, note):\n    with open("ledger.csv", "a", newline="", encoding="utf-8") as f:\n        csv.writer(f).writerow([note, amount])\n\ndef report():\n    total = 0\n    with open("ledger.csv", encoding="utf-8") as f:\n        for note, amount in csv.reader(f):\n            total += float(amount)\n            print(f"{note}: {amount} 元")\n    print(f"合计: {total:.2f} 元")\n\nadd_record(29.9, "午饭")\nadd_record(12, "奶茶")\nreport()`},
 {q:'读取 config.json，若文件不存在或 JSON 损坏，分别给出不同的友好提示并返回默认配置 {"theme": "light"}', lv:'挑战', hint:'捕获 FileNotFoundError 和 json.JSONDecodeError 两种异常',
  sol:`import json\n\ndef load_config(path="config.json"):\n    default = {"theme": "light"}\n    try:\n        with open(path, encoding="utf-8") as f:\n            return json.load(f)\n    except FileNotFoundError:\n        print("配置文件不存在，使用默认配置")\n    except json.JSONDecodeError as e:\n        print(f"配置文件损坏({e})，使用默认配置")\n    return default\n\nprint(load_config())`}
]
},

/* ================= 第 9 课 ================= */
{
id:'c9', no:'09', title:'模块、包与常用标准库', stage:'S3 · 工程起点', minutes:45,
intro:'Python 的口号是「电池全含」——标准库覆盖 80% 的日常需求。这一课教你组织自己的代码成模块，并带你过一遍最值得先学的标准库。',
sections:[
 {h:'9.1 import 的三种姿势与 __main__',
  p:'import 模块 / from 模块 import 名字 / import 模块 as 别名。每个 .py 文件都是模块，被 import 时会执行顶层代码，所以有了那句经典的 if __name__ == "__main__"：直接运行才为真，被导入时不执行，这是「脚本/库两用」的标准写法。',
  code:`# math_utils.py 的标准结尾写法（示意）\ndef add(a, b):\n    return a + b\n\nif __name__ == "__main__":\n    # 只有直接运行 python math_utils.py 时才会执行\n    print("自测:", add(2, 3))\n\n# 其他文件里：\n# from math_utils import add\nprint("导入并不会执行 __main__ 块")`},
 {h:'9.2 collections 与 itertools：标准库里的瑞士军刀',
  p:'collections 提供增强容器：Counter（计数）、defaultdict（免初始化字典）、deque（双端队列）。itertools 提供迭代器工具：product（笛卡尔积/嵌套循环）、combinations/permutations（组合排列）、chain（串联）。这两库刷题和数据处理都高频。',
  code:`from collections import Counter, defaultdict, deque\nfrom itertools import product, combinations\n\n# Counter：最快计数\nprint(Counter("mississippi").most_common(2))\n\n# defaultdict：分组神器\npairs = [("水果", "苹果"), ("水果", "香蕉"), ("肉类", "牛肉")]\ngroups = defaultdict(list)\nfor kind, item in pairs:\n    groups[kind].append(item)\nprint(dict(groups))\n\n# deque：高效队列\nq = deque([1, 2, 3])\nq.appendleft(0)\nprint(q.popleft(), q)\n\n# itertools\nprint(list(combinations("ABC", 2)))\nprint(list(product([0, 1], repeat=2)))`},
 {h:'9.3 random / datetime / os：日常三件套',
  p:'random 管随机（randint 整数、choice 选择、shuffle 打乱、sample 抽样）；datetime 管时间（date.today()、timedelta 计算、strftime 格式化）；os / pathlib 管文件系统（pathlib.Path 是现代写法，跨平台路径拼接用 / 运算符）。',
  code:`import random, datetime, pathlib\n\nrandom.seed(42)                       # 固定种子，结果可复现\nprint(random.randint(1, 6))           # 掷骰子\nprint(random.choice(["石头", "剪刀", "布"]))\nprint(random.sample(range(1, 34), 6)) # 抽6个不重复\n\ntoday = datetime.date.today()\ndue = today + datetime.timedelta(days=7)\nprint(due.strftime("%Y-%m-%d 是一周后"))\n\np = pathlib.Path(".")\nprint(sorted(p.glob("*.py")) or "当前目录没有py文件")`},
 {h:'9.4 虚拟环境与第三方包',
  p:'第三方包装在项目专属的「虚拟环境」里，互不污染。现代工具 <code>uv</code> 一条命令搞定传统 venv + pip 的所有事；传统的 python -m venv .venv + pip install 也必须会。依赖清单 requirements.txt / pyproject.toml 让环境可复现——这是协作的底线。',
  code:`# —— 命令行操作（非 Python 代码）——\n# 方式一：uv（推荐，快 10-100 倍）\n# uv venv                    # 创建虚拟环境\n# uv pip install requests    # 安装包\n# uv pip freeze > requirements.txt\n\n# 方式二：传统方式\n# python -m venv .venv\n# Windows:   .venv\\Scripts\\activate\n# macOS/Linux: source .venv/bin/activate\n# pip install requests\n\n# 方式三：uv 项目模式（全自动）\n# uv init myproject && cd myproject\n# uv add requests && uv run main.py\nprint("记住原则：一个项目一个环境，环境跟着项目走")`}
],
pitfalls:[
 {t:'import 了却用不了 pip 装的包', d:'八成是装到了别的 Python 环境。用 python -m pip install 保证装到当前解释器对应的环境里。'},
 {t:'文件名和库重名', d:'给自己的文件命名 random.py / json.py 会导致 import 自己！报错诡异且难查。避开标准库名。'},
 {t:'datetime.now() 与 utcnow()', d:'now() 是本地时间，utcnow() 是 UTC。存数据库建议统一 UTC，显示时再转本地。'},
 {t:'随机数当密码', d:'random 不是加密安全的，生成密码/token 要用 secrets 模块。'}
],
exercises:[
 {q:'写一个随机密码生成器：长度 12，必须包含大小写字母、数字和符号各至少一个（用 secrets 模块）', lv:'进阶', hint:'secrets.choice 从字符池选；先保证各类至少一个，再随机补足，最后 shuffle',
  sol:`import secrets, string\n\ndef gen_password(length=12):\n    pools = [string.ascii_lowercase, string.ascii_uppercase,\n             string.digits, "!@#$%^&*"]\n    chars = [secrets.choice(p) for p in pools]     # 各保证一个\n    all_chars = "".join(pools)\n    chars += [secrets.choice(all_chars) for _ in range(length - len(chars))]\n    random.shuffle(chars)\n    return "".join(chars)\n\nimport random\nprint(gen_password())`},
 {q:'用 Counter + defaultdict 统计一段文本：每个首字母开头的单词数、以及出现最多的单词', lv:'挑战', hint:'defaultdict(Counter) 双层统计',
  sol:`from collections import Counter, defaultdict\ntext = "python is powerful python is easy to learn and python is fun"\nby_first = defaultdict(Counter)\nfor w in text.split():\n    by_first[w[0]][w] += 1\nprint({k: dict(v) for k, v in by_first.items()})\nprint("最高频:", Counter(text.split()).most_common(1))`}
]
},

/* ================= 第 10 课 ================= */
{
id:'c10', no:'10', title:'进阶特性：推导式、生成器与装饰器', stage:'S2.5 · Pythonic', minutes:55,
intro:'这一课的内容是「Pythonic」的核心：同样的逻辑，写得比别人短一半、快一倍。推导式、生成器、装饰器是区分「会 Python」和「写好 Python」的三道分水岭。',
sections:[
 {h:'10.1 推导式：一行顶五行',
  p:'推导式 = 声明式地构建容器。列表 [x for x in ... if 条件]、字典 {k: v for ...}、集合 {x for ...}。规则：先写「要什么」，再写「从哪来」，最后「过滤条件」。超过两层 for 或两个以上 if 就该拆成普通循环——可读性优先。',
  code:`nums = range(1, 11)\n\nsquares = [x ** 2 for x in nums]              # 变换\nevens = [x for x in nums if x % 2 == 0]      # 过滤\npairs = [(x, y) for x in nums[:3] for y in nums[:3] if x < y]  # 双循环\n\nprint(squares)\nprint(evens)\nprint(pairs)\n\nmatrix = [[1, 2, 3], [4, 5, 6]]\nflat = [x for row in matrix for x in row]    # 拍平：先外后内\nprint(flat)\nprint({x: len(x) for x in ["ab", "cde"]})    # 字典推导式`},
 {h:'10.2 生成器：惰性求值',
  p:'生成器用 yield 逐个"吐出"值，<strong>不一次性占内存</strong>——处理 10GB 日志和 10 行日志的内存占用一样。生成器表达式就是把方括号换成圆括号。另一个用途：实现无限序列（斐波那契永远数不完也不怕）。',
  code:`def fibonacci(limit=None):\n    a, b = 0, 1\n    while limit is None or a < limit:\n        yield a               # 暂停并交出一个值\n        a, b = b, a + b\n\nprint(list(fibonacci(50)))\n\ngen = (x ** 2 for x in range(1000000))   # 生成器表达式：瞬间创建\nprint(next(gen), next(gen))              # 惰性：用时才计算\nprint(sum(x * x for x in range(101)))    # 直接喂给 sum，不建中间列表`,
  out:'[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n0 1\n338350',
  tip:'读文件的标准姿势 with open(...) as f: for line in f 本身就是逐行生成器。大文件统计行数、过滤日志都是它 + 生成器的组合拳。'},
 {h:'10.3 装饰器：函数的函数',
  p:'装饰器接收一个函数、返回增强后的函数，用 @语法糖套在定义上。核心用途是<strong>横切关注点</strong>：计时、日志、缓存、权限检查——这些与业务无关的逻辑全部抽离。理解它需要先懂「函数是一等公民」：可以赋值、传参、返回。',
  code:`import time, functools\n\ndef timer(func):\n    @functools.wraps(func)           # 保留原函数名和docstring\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} 耗时 {time.time()-start:.4f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_sum(n):\n    return sum(range(n))\n\nslow_sum(1000000)\n\n# 内置装饰器也不少：@cache 缓存\n@functools.cache\ndef fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)\n\nprint(fib(80))   # 带缓存的递归，瞬间出结果`},
 {h:'10.4 类型注解：给动态类型上保险',
  p:'注解不改变运行行为，但 IDE 提示、静态检查（mypy/pyright）全靠它。现代写法用 list[int]、str | None（3.10+）。大型项目几乎必写注解，找工作时也是加分项。',
  code:`def average(scores: list[float]) -> float:\n    return sum(scores) / len(scores)\n\ndef find_user(uid: int, cache: dict[int, str] | None = None) -> str | None:\n    if cache is None:\n        cache = {}\n    return cache.get(uid)\n\nprint(average([88.5, 92, 79]))\nprint(find_user(1, {1: "小明"}), find_user(2))`}],
pitfalls:[
 {t:'推导式里做副作用', d:'[print(x) for x in ...] 能跑但会被同行鄙视。有副作用（打印/写文件/改状态）请用普通循环。'},
 {t:'生成器只能消费一次', d:'gen = (x for x in ...); sum(gen) 之后再 sum(gen) 得 0——已经耗尽了。要复用先 list() 或重新创建。'},
 {t:'装饰器忘了 return wrapper 里的 result', d:'被装饰的函数返回值被吞成 None，逻辑莫名消失。wrapper 里最后必须 return result。'},
 {t:'递归没写终止条件', d:'RecursionError: maximum recursion depth exceeded。每个递归函数先写边界情况。'}
],
exercises:[
 {q:'用一条字典推导式把 {"a": 1, "b": 2, "c": 3} 的键值互换（值做键）', lv:'基础', hint:'{v: k for k, v in d.items()}',
  sol:`d = {"a": 1, "b": 2, "c": 3}\nprint({v: k for k, v in d.items()})`},
 {q:'写装饰器 count_calls 统计函数被调用的次数，并把次数存在函数属性上（func.calls）', lv:'挑战', hint:'wrapper 里用非局部变量计数，再挂到 wrapper.calls 上暴露出去',
  sol:`import functools\n\ndef count_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return func(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n\n@count_calls\ndef greet(name):\n    return f"hi {name}"\n\ngreet("a"); greet("b"); greet("c")\nprint(greet.calls)  # 3`}
]
},

/* ================= 第 11 课（方向选修） ================= */
{
id:'c11', no:'W1', title:'Web 后端方向：FastAPI 快速上手', stage:'选修 · Web 后端', minutes:70,
intro:'Web 后端的核心任务：接收 HTTP 请求 → 处理业务 → 返回 JSON。FastAPI 是当前 Python 生态最热门的框架：类型注解驱动、自带交互文档、上手极快。本课示例需要本地环境运行（pip install fastapi uvicorn），代码块仅供阅读理解。',
sections:[
 {h:'11.1 第一个接口',
  p:'装饰器声明方法和路径，函数参数自动完成类型校验——传错类型 FastAPI 直接返回 422 错误，不用你写一行校验代码。启动后访问 /docs 自动获得可交互的 API 文档（Swagger UI），可以直接在浏览器里调接口。',
  code:`# pip install fastapi uvicorn\n# uvicorn main:app --reload   启动后访问 http://127.0.0.1:8000/docs\nfrom fastapi import FastAPI\n\napp = FastAPI(title="我的第一个API")\n\nfake_db = {1: "Python", 2: "SQL", 3: "Git"}\n\n\n@app.get("/")\ndef root():\n    return {"msg": "hello", "version": "1.0"}\n\n\n@app.get("/items/{item_id}")          # 路径参数，自动转int\ndef get_item(item_id: int, q: str | None = None):\n    if item_id not in fake_db:\n        return {"error": "找不到该条目"}\n    return {"id": item_id, "name": fake_db[item_id], "q": q}`,
  warn:'路径参数声明为 int 后，访问 /items/abc 会自动返回 422 校验错误——这就是类型注解的威力，别的地方你可能要手写 if not id.isdigit()。'},
 {h:'11.2 请求体与 Pydantic 模型',
  p:'POST 请求的数据用 Pydantic 模型接收：定义一个继承 BaseModel 的类，字段类型、默认值、甚至范围校验全部声明式完成。FastAPI 会自动把 JSON 转成模型实例、自动生成文档示例、自动校验报错。',
  code:`from fastapi import FastAPI\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\n\nclass TodoIn(BaseModel):\n    title: str = Field(min_length=1, max_length=50)\n    done: bool = False\n    priority: int = Field(default=1, ge=1, le=5)   # 1-5级\n\n\n@app.post("/todos")\ndef create_todo(todo: TodoIn):\n    return {"created": True, "data": todo.model_dump()}`},
 {h:'11.3 数据持久化与分层',
  p:'真实项目不会把数据放字典里。常规分层：路由层（接收校验）→ 服务层（业务逻辑）→ 数据层（SQLAlchemy ORM 操作数据库）。SQLite 单文件零配置，是学习的最佳搭档；SQLAlchemy 2.0 的写法接近原生 Python 对象操作。',
  code:`# pip install fastapi uvicorn sqlalchemy\nfrom sqlalchemy import create_engine, String, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session\n\nclass Base(DeclarativeBase): pass\n\nclass Todo(Base):\n    __tablename__ = "todos"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str] = mapped_column(String(50))\n    done: Mapped[bool] = mapped_column(default=False)\n\nengine = create_engine("sqlite:///todo.db")\nBase.metadata.create_all(engine)\n\nwith Session(engine) as session:\n    session.add(Todo(title="学习FastAPI"))\n    session.commit()\n    todos = session.scalars(select(Todo)).all()\n    print([t.title for t in todos])`},
 {h:'11.4 进阶路线图',
  p:'顺序建议：CRUD 接口 → 查询参数/分页 → 用户认证（JWT）→ 中间件与日志 → pytest 测试接口 → Docker 部署。练手项目推荐：待办 API → 博客 API（文章+评论+用户）→ 短链接服务。每做完一个，放到 GitHub 并写 README。'}
],
pitfalls:[
 {t:'--reload 生产环境忘关', d:'开发热重载好用，生产环境有性能与安全隐患，部署时去掉 --reload 换 gunicorn/多 worker。'},
 {t:'同步阻塞调用拖慢接口', d:'接口里 requests.get 慢接口会卡住整个 worker。要么用 async httpx，要么把耗时任务丢后台。'},
 {t:'不校验输入直接入库', d:'Pydantic 模型就是为校验而生，绕过它直接收 dict 是给自己埋雷。'}
],
exercises:[
 {q:'设计一个「图书管理 API」：字段 书名/作者/ISBN/库存，实现 POST 创建和 GET /books?keyword= 关键字搜索', lv:'挑战', hint:'用 BaseModel 定义 BookIn；搜索用列表推导式过滤内存数据即可',
  sol:`from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\nbooks: list[dict] = []\n\nclass BookIn(BaseModel):\n    title: str\n    author: str\n    isbn: str\n    stock: int = 0\n\n\n@app.post("/books")\ndef create(b: BookIn):\n    books.append(b.model_dump())\n    return {"ok": True, "total": len(books)}\n\n\n@app.get("/books")\ndef search(keyword: str = ""):\n    hits = [b for b in books if keyword in b["title"] or keyword in b["author"]]\n    return {"count": len(hits), "items": hits}`}
]
},

/* ================= 第 12 课（方向选修） ================= */
{
id:'c12', no:'D1', title:'数据分析方向：pandas 核心操作', stage:'选修 · 数据分析', minutes:70,
intro:'数据分析 80% 的时间花在 pandas 上：读数据、清洗、筛选、分组统计。本课示例基于内联数据讲解核心 API，本地安装：pip install pandas。也可以在 Google Colab 里免费运行。',
sections:[
 {h:'12.1 DataFrame：表格即对象',
  p:'pandas 的两大结构：Series（一列）和 DataFrame（一张表）。从字典、列表、CSV、Excel 都能创建。df.head() 看前几行、df.info() 看结构与缺失、df.describe() 看统计摘要——拿到数据永远先跑这三个。',
  code:`import pandas as pd\n\ndf = pd.DataFrame({\n    "name":  ["小明", "小红", "小刚", "小丽", "小强"],\n    "city":  ["杭州", "上海", "杭州", "北京", "上海"],\n    "score": [86, 92, 74, 88, 63],\n})\nprint(df)\nprint(df["score"].mean(), df["score"].max())   # 列统计\nprint(df[["name", "score"]])                   # 选多列`,
  warn:'df["score"] 是列选择；df[0:2] 是行切片；两者语法长得像含义不同。想按条件选行，永远用 df[条件表达式] 的布尔索引。'},
 {h:'12.2 筛选与排序：布尔索引',
  p:'把比较表达式直接当"掩码"传入 df[...] 就能筛选行，多个条件用 & | 连接（<strong>必须加括号</strong>，因为运算优先级）。配合 isin、between、str.contains 可以写出非常灵活的查询。',
  code:`import pandas as pd\n\ndf = pd.DataFrame({\n    "name":  ["小明", "小红", "小刚", "小丽", "小强"],\n    "city":  ["杭州", "上海", "杭州", "北京", "上海"],\n    "score": [86, 92, 74, 88, 63],\n})\nprint(df[df["score"] >= 80])                       # 单条件\nprint(df[(df["city"] == "上海") & (df["score"] > 70)])  # 组合条件\nprint(df.sort_values("score", ascending=False).head(3)) # 排序取Top3\nprint(df.query("score > 80 and city == '杭州'"))    # query写法更口语`,
  warn:'& 与 | 是位运算符，优先级高于比较，所以 (df.a == 1) & (df.b > 2) 的括号不能省，否则报错或结果错误。'},
 {h:'12.3 分组聚合：groupby 是灵魂',
  p:'groupby 的心智模型是「拆分-应用-合并」：按某列拆成小组，每组算一个统计值，再拼回结果表。agg 可以一次算多个指标、对不同列用不同算法。这是 pandas 中最接近 SQL GROUP BY 的操作。',
  code:`import pandas as pd\n\ndf = pd.DataFrame({\n    "city":  ["杭州", "上海", "杭州", "北京", "上海"],\n    "score": [86, 92, 74, 88, 63],\n})\nprint(df.groupby("city")["score"].mean())          # 各城市平均分\nprint(df.groupby("city")["score"].agg(["count", "mean", "max"]))\n\n# 添加一列：全表排名（不改变原顺序）\ndf["rank"] = df["score"].rank(ascending=False, method="min").astype(int)\nprint(df.sort_values("rank"))`},
 {h:'12.4 缺失值与数据清洗',
  p:'真实数据是脏的：缺失（NaN）、重复、类型不对。三板斧：isnull().sum() 找缺失、dropna/fillna 处理缺失、drop_duplicates 去重、astype 转类型。处理缺失永远先想业务含义——该填 0、填均值还是该删行，没有标准答案。',
  code:`import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "name": ["小明", "小红", None, "小明"],\n    "score": [86, np.nan, 74, 86],\n})\nprint(df.isnull().sum())            # 各列缺失数\nprint(df.dropna())                  # 删缺失行\nprint(df.fillna({"score": df["score"].mean()}))  # 均值填充\nprint(df.drop_duplicates(subset="name"))         # 按name去重`},
 {h:'12.5 可视化与下一步',
  p:'df.plot() 一行出图（底层 matplotlib）；plotly.express 出交互图；报告神器 streamlit 十几行代码把分析变成网页。进阶路线：时间序列（resample 重采样）→ 合并（merge/join，对标 SQL JOIN）→ 透视表 pivot_table → 真实数据集实战（Kaggle）。'}
],
pitfalls:[
 {t:'SettingWithCopyWarning', d:'df[df.a>1]["b"]=1 这种链式赋值可能不生效。正确姿势：df.loc[df.a>1, "b"]=1。'},
 {t:'循环遍历 DataFrame', d:'for + itertuples 慢得离谱。列运算全部向量化：df["c"]=df["a"]+df["b"] 快几十倍。'},
 {t:'inplace=True 的坑', d:'官方都不推荐了。用 df = df.dropna() 这种重新赋值的写法更清晰安全。'},
 {t:'索引不是行号', d:'筛选后索引是"原始行号"，重置用 df.reset_index(drop=True)。用 .loc 按索引取、.iloc 按位置取，分清二者。'}
],
exercises:[
 {q:'给定销售表（日期, 城市, 金额），统计每个城市的总销售额并找出冠军城市', lv:'基础', hint:'groupby("city")["amount"].sum() 然后 idxmax',
  sol:`import pandas as pd\n\ndf = pd.DataFrame({\n    "date":   ["3-1", "3-1", "3-2", "3-2", "3-3"],\n    "city":   ["杭州", "上海", "杭州", "上海", "杭州"],\n    "amount": [100, 200, 150, 50, 300],\n})\ntotal = df.groupby("city")["amount"].sum()\nprint(total)\nprint("冠军城市:", total.idxmax(), "金额", total.max())`},
 {q:'成绩表分析：找出各城市平均分最高的人，并给每人加上"是否及格"列（>=60）', lv:'进阶', hint:'布尔索引选行 + df.assign 或直接加列；np.where 一行搞定条件列',
  sol:`import pandas as pd\n\ndf = pd.DataFrame({\n    "name":  ["小明", "小红", "小刚", "小丽"],\n    "city":  ["杭州", "上海", "杭州", "上海"],\n    "score": [86, 92, 74, 55],\n})\ndf["pass"] = df["score"] >= 60\ntop = df.loc[df.groupby("city")["score"].idxmax()]\nprint(df)\nprint(top[["city", "name", "score"]])`}
]
},

/* ================= 第 13 课（方向选修） ================= */
{
id:'c13', no:'A1', title:'自动化方向：爬虫与办公自动化', stage:'选修 · 自动化', minutes:70,
intro:'自动化的最大魅力是立刻有用：批量改名、定时抓数据、自动发提醒。本课覆盖 requests 抓取、BeautifulSoup 解析、定时任务三件套，全部是工作中真实使用的模式。本地安装：pip install requests beautifulsoup4。',
sections:[
 {h:'13.1 requests：和网页对话',
  p:'requests.get(url) 发请求，r.status_code 检查状态，r.json()/r.text 解析内容。<strong>规范动作</strong>：加 User-Agent 头（很多网站拒绝无 UA 的请求）、raise_for_status() 让错误显式暴露、timeout 必加（否则可能永远挂起）。',
  code:`import requests   # 本地环境运行；浏览器实验室无网络权限\n\nurl = "https://api.github.com/repos/jackfrued/Python-100-Days"\nr = requests.get(url, timeout=10,\n                 headers={"User-Agent": "learn-python/1.0"})\nr.raise_for_status()               # 4xx/5xx 直接抛异常\ndata = r.json()\nprint(data["full_name"], "stars:", data["stargazers_count"])`,
  warn:'爬虫三原则：遵守 robots.txt、控制频率（每次请求 sleep 1-2 秒）、只抓公开数据不碰个人隐私。技术不是免罪牌， commercial 爬取前先确认合规。'},
 {h:'13.2 BeautifulSoup：解析 HTML',
  p:'把 HTML 变成可查询的对象树。核心 API 就两个：select（CSS 选择器，推荐）和 find/find_all。CSS 选择器语法和浏览器开发者工具完全一致：tag.class、#id、父子层级 a > span.title。',
  code:`from bs4 import BeautifulSoup\n\nhtml = """\n<ul id="list">\n  <li class="item"><a href="/p1">第一篇文章</a></li>\n  <li class="item hot"><a href="/p2">第二篇文章</a></li>\n  <li class="item"><a href="/p3">第三篇文章</a></li>\n</ul>\n"""\nsoup = BeautifulSoup(html, "html.parser")\nprint(soup.title.string if soup.title else "无title")\n\nfor a in soup.select("li.item a"):\n    print(a.get_text(strip=True), "->", a["href"])\n\nhot = soup.select_one("li.hot a")    # 只要第一个\nprint("热门:", hot.get_text())`},
 {h:'13.3 数据落盘：抓取 → 清洗 → 存储',
  p:'爬虫的标准流水线：请求 → 解析 → 清洗（strip/正则/类型转换）→ 存储（CSV/SQLite）。把每一步写成独立函数，主流程一目了然，也为以后换数据源、换存储留好接口。',
  code:`import csv, requests\nfrom bs4 import BeautifulSoup\n\ndef fetch(url):\n    r = requests.get(url, timeout=10,\n                     headers={"User-Agent": "Mozilla/5.0"})\n    r.raise_for_status()\n    return r.text\n\ndef parse(html):\n    soup = BeautifulSoup(html, "html.parser")\n    return [(a.get_text(strip=True), a["href"])\n            for a in soup.select("li.item a")]\n\ndef save(rows, path="out.csv"):\n    with open(path, "w", newline="", encoding="utf-8") as f:\n        csv.writer(f).writerows([("标题", "链接"), *rows])\n\ndef main():\n    # save(parse(fetch("https://example.com/list")))   真实运行时解开\n    demo = """<li class="item"><a href="/1">示例</a></li>"""\n    rows = parse(demo)\n    save(rows)\n    print("已保存", len(rows), "条")\n\nmain()`},
 {h:'13.4 定时任务与通知',
  p:'让脚本自己跑起来才算真自动化。简单场景用 schedule 库（每 N 分钟/每天定点）；更重量用系统级 cron / Windows 任务计划。通知渠道：邮件（smtplib）、企业微信/钉钉机器人（一个 POST 搞定）。注意 long-running 脚本要有日志和异常兜底，挂了要能知道。',
  code:`import schedule, time   # pip install schedule\n\ndef job():\n    print("执行抓取任务...")\n    # 抓取 -> 存储 -> 有新数据就推送\n\nschedule.every().day.at("09:00").do(job)   # 每天9点\nschedule.every(30).minutes.do(job)         # 每30分钟\n\n# while True:\n#     schedule.run_pending()\n#     time.sleep(1)          # 真实运行需常驻进程`},
 {h:'13.5 办公自动化速览',
  p:'除爬虫外，自动化方向的另一个大类是办公：openpyxl 处理 Excel、python-docx 处理 Word、批量重命名/整理下载目录用 os+pathlib 十行搞定。选一个自己的真实痛点（比如"每周下载 5 个报表并合并"）做出来，成就感最强。'}
],
pitfalls:[
 {t:'页面数据拿不到', d:'现在的网站大量用 JS 渲染，requests 拿到的 HTML 里没有数据。先开 F12 看 Network 找 XHR 接口（直接请求 JSON 最香），实在不行再上 Playwright 模拟浏览器。'},
 {t:'被封 IP', d:'请求太快。加 time.sleep、随机间隔、合理 UA；大规模采集要考虑代理池——但先问自己是否真的合规。'},
 {t:'编码乱码', d:'r.encoding = r.apparent_encoding 或直接 r.content 交给 BeautifulSoup 处理。'},
 {t:'定时脚本裸奔', d:'没有 try/except 和日志的定时脚本，凌晨 3 点挂了你也不知道。永远套异常处理 + logging。'}
],
exercises:[
 {q:'写一个 GitHub API 脚本：输入组织名（如 jackfrued），列出其仓库 star 数前 5 名（本地环境运行）', lv:'进阶', hint:'GET /users/{org}/repos?sort=stars&per_page=100，取字段排序',
  sol:`import requests\n\ndef top_repos(owner, n=5):\n    r = requests.get(\n        f"https://api.github.com/users/{owner}/repos",\n        params={"sort": "stars", "per_page": 100},\n        headers={"User-Agent": "learn-python/1.0"},\n        timeout=10,\n    )\n    r.raise_for_status()\n    repos = sorted(r.json(), key=lambda x: x["stargazers_count"], reverse=True)\n    for repo in repos[:n]:\n        print(f"{repo['name']:<28} {repo['stargazers_count']:>8} stars")\n\ntop_repos("jackfrued")`},
 {q:'批量整理：把「下载目录」里按扩展名分类（图片/文档/压缩包/其他），只打印计划不实际移动（dry-run 模式）', lv:'挑战', hint:'pathlib.Path.glob + 分类字典映射；先打印 src -> dst 再决定是否真移动',
  sol:`import shutil\nfrom pathlib import Path\n\nRULES = {\n    ".jpg": "图片", ".png": "图片", ".jpeg": "图片",\n    ".pdf": "文档", ".docx": "文档", ".xlsx": "文档",\n    ".zip": "压缩包", ".rar": "压缩包",\n}\n\ndef organize(folder, dry_run=True):\n    folder = Path(folder)\n    plan = []\n    for f in folder.iterdir():\n        if f.is_file():\n            cat = RULES.get(f.suffix.lower(), "其他")\n            dst = folder / cat / f.name\n            plan.append((f, dst))\n    for src, dst in plan:\n        print("移动:", src.name, "->", dst.parent.name + "/")\n        if not dry_run:\n            dst.parent.mkdir(exist_ok=True)\n            shutil.move(src, dst)\n    return len(plan)\n\n# organize(r"C:/Users/你/Downloads", dry_run=True)   # 先预览！\nprint("先 dry-run 预览，确认无误再 dry_run=False")`}
]
}
];
