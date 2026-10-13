import type { KnowledgeCard } from '../types';

const periods = { title: 'NHS · Periods', url: 'https://www.nhs.uk/conditions/periods/' };
const pain = { title: 'NHS · Period pain', url: 'https://www.nhs.uk/symptoms/period-pain/' };
const pms = { title: 'NHS · PMS', url: 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/' };
const discharge = { title: 'NHS · Vaginal discharge', url: 'https://www.nhs.uk/symptoms/vaginal-discharge/' };
const research = { title: 'npj Digital Medicine · 自然周期研究（2019）', url: 'https://www.nature.com/articles/s41746-019-0152-7' };
const fertility = { title: 'NHS · Natural family planning', url: 'https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/' };
const card = (data: Omit<KnowledgeCard, 'reviewedAt'>): KnowledgeCard => ({ ...data, reviewedAt: '2026-10-13' });
export const cards: KnowledgeCard[] = [
  card({ id: 'period-care', title: '经期里，给身体一点余地', summary: '按今天的感受安排休息和活动。',
    paragraphs: ['这几天如果觉得累，可以把安排放慢一点。出血和疼痛都是可以记录的事实，无需每天填满所有项目。', '温热敷和轻柔活动可能帮助缓解经期不适。选择让自己舒服的方式。'],
    topics: ['care'], phases: ['MENSTRUAL'], suggestions: ['热敷时隔一层布，避免烫伤。','有余力时，可以轻轻走一走。'],
    careNotices: ['疼痛明显加重或影响日常活动时，请就医。'], sources: [pain] }),
  card({ id: 'cycle-variation', title: '周期有变化，记录会帮你看清', summary: '与自己的历史比较，比追赶一个固定天数更有用。',
    paragraphs: ['个人周期可能有所波动。知己使用连续、已确认的记录计算，实际变长或变短的周期都会保留。', '如果中间有月经没记，可以在下一条经期标记漏记。跨过漏记的间隔不会被当作一次很长的周期。'],
    topics: ['cycle','record'], phases: ['UNKNOWN'], suggestions: ['先记清真实开始日期。'], careNotices: ['周期持续改变或出现经期外出血时，带上记录咨询医生。'], sources: [periods,research] }),
  card({ id: 'follicular', title: '经期之后，也留意自己的感受', summary: '阶段只是参考，今天的感受由你记录。',
    paragraphs: ['卵泡期在生理上包含月经阶段。应用将月经单独展示，方便记录；这里指经期结束后的日历参考。', '每个人在这段时间的感受不同。继续记录睡眠、情绪和身体状态，可以慢慢看见自己的变化。'],
    topics: ['phase'], phases: ['FOLLICULAR'], suggestions: ['按自己的精力安排今天。'], careNotices: [], sources: [research] }),
  card({ id: 'luteal', title: '月经前，情绪和睡眠也值得被照顾', summary: '有些人在经前会感到疲劳、腹胀或情绪变化。',
    paragraphs: ['经前可能出现情绪变化、疲劳、腹胀或乳房不适，但并不是每个人都会经历。', '记录感受及其日期，有助于判断这些变化是否反复出现。应用不会把一次情绪记录解释为周期变化的原因。'],
    topics: ['phase','moods','sleep'], phases: ['LUTEAL'], suggestions: ['尽量保持规律睡眠。','根据自己的状态安排轻柔活动。'], careNotices: ['不适持续影响生活时，可以带上记录寻求专业帮助。'], sources: [pms] }),
  card({ id: 'ovulation', title: '排卵日期为什么只能作参考？', summary: '日历推算没有检测到实际排卵。',
    paragraphs: ['排卵时间存在个人和周期之间的差异，不能固定当作周期第 14 天。知己结合个人周期与群体黄体期参数作日历估计。', '浅色区域表示某一天属于推测易孕窗口的相对可能性，不能用来判断安全日或代替避孕。白带和爱爱记录不作为排卵检测证据。'],
    topics: ['fertility'], phases: ['OVULATION_REFERENCE'], suggestions: ['把参考日期和真实身体观察分别记录。'], careNotices: [], sources: [research,fertility] }),
  card({ id: 'bleeding', title: '出血量和颜色，怎样记才有用？', summary: '记录看见的量与颜色，不必换算成毫升。',
    paragraphs: ['出血较多时可能呈红色，较少时可能呈粉红或褐色。颜色只能作为观察记录，不能单独判断健康状况。', '按自己当天的感受选择无、少、中或多；没有填写的日子会保持空白。点滴出血与月经区间分别记录。'],
    topics: ['bleeding'], phases: [], suggestions: ['同一天可以记录多种颜色。'], careNotices: ['经期外或爱爱后出血需要就医检查。'], sources: [periods] }),
  card({ id: 'pain', title: '疼痛不需要硬扛', summary: '记录程度、位置和是否影响活动。',
    paragraphs: ['0 分代表明确没有疼痛；留空代表没有记录。你可以只填程度，也可以补充位置和备注。', '温热敷、轻柔运动可能缓解经期不适。若疼痛严重、比以往更重，或影响活动，应及时寻求医疗帮助。'],
    topics: ['pain'], phases: [], suggestions: ['记下疼痛出现的日期和感受。'], careNotices: ['持续明显疼痛，或排便、爱爱时疼痛，请咨询医生。'], sources: [pain] }),
  card({ id: 'sleep-mood', title: '今天累了，也可以少做一点', summary: '睡眠和情绪不需要每天保持同一种状态。',
    paragraphs: ['规律睡眠、合适的活动和放松可能帮助照顾经前感受。身体疲惫时，给今天留一点休息时间。', '记录睡眠时长、质量或情绪中的一项就可以。未记录不等于睡得不好，也不等于情绪平静。'],
    topics: ['sleep','moods'], phases: [], suggestions: ['试着给入睡留一段安静的时间。'], careNotices: ['情绪或睡眠问题持续影响生活时，请寻求专业支持。'], sources: [pms] }),
  card({ id: 'bowel', title: '便便记录，可以从一次开始', summary: '次数、便型和感受可以分开填写。',
    paragraphs: ['便便记录保留当天每一次事件。没有填写便型也可以记录一次；选择当天没有时，才会计作零次。', '留意自己是否费力、疼痛以及便型是否改变。这些记录用于观察，不能仅凭便型诊断。'],
    topics: ['bowel'], phases: [], suggestions: ['有不舒服时，可以在备注里补充。'], careNotices: ['排便变化或不适持续时，请咨询医生。'],
    sources: [{ title: 'NIDDK · Constipation', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation' }] }),
  card({ id: 'intimacy', title: '亲密之后的不适，值得留意', summary: '只记录你愿意留下的感受。',
    paragraphs: ['爱爱记录不要求填写伴侣身份。一天可以添加多次，也可以明确记录当天没有。', '保护措施、不适和事后出血都是可选项。应用不会据此计算怀孕概率或断言周期变化的原因。'],
    topics: ['intimacy'], phases: [], suggestions: ['不舒服时可以停下来，关注自己的感受。'], careNotices: ['爱爱时持续疼痛或事后出血，请就医检查。'], sources: [pain,periods] }),
  card({ id: 'discharge', title: '白带观察，先看自己的变化', summary: '量、颜色、质地和感受都可以分别记录。',
    paragraphs: ['白带的量和质地可能变化。透明或乳白、黏稠或湿润的白带都可能出现。单凭一种颜色或质地无法诊断。', '如果观察到明显异味、瘙痒、灼热或疼痛，可以记录日期，并咨询医生。避免自行用标签判断感染。'],
    topics: ['discharge'], phases: [], suggestions: ['温和清洁外阴，避免阴道冲洗。'], careNotices: ['白带明显改变，伴随疼痛、出血或异味时，请寻求医疗帮助。'], sources: [discharge] }),
  card({ id: 'recording', title: '从最近一次经期，开始认识自己', summary: '不用一次补齐所有历史。',
    paragraphs: ['在日历里记下真实开始日期；结束后再补充最后有月经出血的一天。经期外出血可先记为点滴或不确定，确认后再补充区间。', '每个项目都可以留空。选择没有是明确事实，空白会保持未知。旧记录可以随时修改，估计会自动重新计算。'],
    topics: ['record','care'], phases: ['UNKNOWN'], suggestions: ['今天先记录一项愿意留下的感受。'], careNotices: [], sources: [periods] }),
];
