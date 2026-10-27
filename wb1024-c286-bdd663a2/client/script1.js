
(function(){
  'use strict';
  const SK='wb_ledger_records',DK='wb_ledger_demo_loaded',CK='wb_ledger_cats',RK='wb_ledger_range',LK='wb_ledger_list',LDK='wb_ledger_default',SRC='wb_ledger_sources',SCOPE='wb_ledger_stats_scope';
  const $=id=>document.getElementById(id);
  const DEFAULT_CATS={
    income:[
      {n:'工资',c:'#5DB89F',p:'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'},
      {n:'奖金',c:'#FFD93D',p:'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'},
      {n:'理财',c:'#7ECFB6',p:'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z'},
      {n:'兼职',c:'#A8E6CF',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'},
      {n:'红包',c:'#FFB6C1',p:'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z'},
      {n:'报销',c:'#B8A9C9',p:'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z'},
      {n:'其他',c:'#9B8EC4',p:'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'}
    ],
    expense:[
      {n:'早餐',c:'#FFD93D',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',f:1},
      {n:'午餐',c:'#FFE66D',p:'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',f:1},
      {n:'晚餐',c:'#FFE66D',p:'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',f:1},
      {n:'外卖',c:'#FFB6C1',p:'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',f:0},
      {n:'咖啡',c:'#B8A9C9',p:'M2 21h18v-2H2v2zM20 8h-2V5h2V3H4v2h2v3H4c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-2V5h4v3z',f:0},
      {n:'零食',c:'#FFD93D',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',f:0},
      {n:'房租',c:'#5DB89F',p:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3z',f:1},
      {n:'物业',c:'#5DB89F',p:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3z',f:1},
      {n:'水费',c:'#7ECFB6',p:'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z',f:1},
      {n:'电费',c:'#A8E6CF',p:'M7 2v11h3v9l7-12h-4l4-8z',f:1},
      {n:'燃气',c:'#A8E6CF',p:'M7 2v11h3v9l7-12h-4l4-8z',f:1},
      {n:'公交',c:'#7ECFB6',p:'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z',f:1},
      {n:'地铁',c:'#7ECFB6',p:'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z',f:1},
      {n:'打车',c:'#A8E6CF',p:'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',f:0},
      {n:'加油',c:'#5DB89F',p:'M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z',f:1},
      {n:'超市',c:'#FFB6C1',p:'M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1z',f:0},
      {n:'购物',c:'#FFB6C1',p:'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',f:0},
      {n:'服饰',c:'#FF8FA3',p:'M21.96 6.73l-1.43-5C20.4 1.3 19.99 1 19.5 1H4.5c-.49 0-.9.3-1.03.73l-1.43 5C1.66 7.85 2.57 9 3.74 9c.45 0 .88-.15 1.23-.42L6 7.66l1.03 12.88c.05.55.5 1 1.06 1h9.82c.56 0 1.01-.45 1.06-1L19 7.66l1.03.92c.35.27.78.42 1.23.42 1.17 0 2.08-1.15 1.7-2.27z',f:0},
      {n:'医疗',c:'#FF8FA3',p:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',f:0},
      {n:'娱乐',c:'#B8A9C9',p:'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',f:0},
      {n:'社交',c:'#B8A9C9',p:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',f:0},
      {n:'宠物',c:'#FFD93D',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',f:0},
      {n:'教育',c:'#5DB89F',p:'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',f:0},
      {n:'通讯',c:'#7ECFB6',p:'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',f:1},
      {n:'其他',c:'#9B8EC4',p:'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',f:0}
    ]
  };
  const DEFAULT_ICON='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
  const demo=[
    {t:'income',c:'工资',a:8500,n:'8月工资',d:2,f:0},{t:'expense',c:'房租',a:2500,n:'8月房租',d:2,f:1},
    {t:'expense',c:'午餐',a:45.5,n:'公司午餐',d:1,f:1},{t:'expense',c:'公交',a:6,n:'地铁',d:1,f:1},
    {t:'expense',c:'超市',a:128,n:'日用品',d:0,f:0},{t:'income',c:'理财',a:120,n:'基金收益',d:3,f:0},
    {t:'expense',c:'晚餐',a:32,n:'外卖晚餐',d:0,f:1},{t:'expense',c:'娱乐',a:68,n:'电影票',d:4,f:0},
    {t:'expense',c:'水费',a:150,n:'7月水费',d:5,f:1},{t:'expense',c:'社交',a:200,n:'朋友聚餐',d:6,f:0},
    {t:'income',c:'奖金',a:2000,n:'季度奖金',d:8,f:0},{t:'expense',c:'购物',a:399,n:'衣服',d:7,f:0},
    {t:'expense',c:'早餐',a:28,n:'早餐店',d:0,f:1},{t:'expense',c:'打车',a:35,n:'滴滴',d:3,f:1},
    {t:'expense',c:'其他',a:88,n:'快递费',d:9,f:0},{t:'expense',c:'通讯',a:100,n:'手机话费',d:10,f:1}
  ];

  let currentPage='home',selectedType='expense',selectedCat='餐饮',selectedFf=1;
  // v1.8.1：batchSelected 由 Set<对象引用> 改为 Map<签名, 计数>。
  // 原来存引用有两个硬伤：①load() 每次 parse 新对象 → 全选后勾选框恒不勾 / 勾选后切页回来显示脱节；
  // ②删除按 sameRecord 字段匹配 → 两条完全相同的记录勾 1 条却删 2 条。签名方案同时解掉这两个。
  let batchMode=false,batchSelected=new Map();

  const fmt=n=>'¥'+Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtInt=n=>'¥'+Number(n).toLocaleString('zh-CN',{maximumFractionDigits:0});
  const escape=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const today=()=>{const t=new Date();return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;};
  const firstDayOfMonth=()=>today().slice(0,7)+'-01';
  const iconSvg=(p,c)=>`<svg viewBox="0 0 24 24" fill="${c}"><path d="${p||DEFAULT_ICON}"/></svg>`;
  const iconBox=(p,c)=>`<span class="icon-box" style="background:linear-gradient(135deg,${c},${c}DD)"><svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="${p||DEFAULT_ICON}"/></svg></span>`;
  // 图标库（路径 + 关键词），新增分类时按名称自动匹配，也支持手动挑选
  const ICON_LIBRARY=[
    {n:'钱币',p:'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',k:['工资','收入','钱','薪资','薪水','现金']},
    {n:'星星',p:'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',k:['奖金','奖励','荣誉','星','绩效']},
    {n:'折线图',p:'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',k:['理财','投资','收益','股票','基金','涨跌']},
    {n:'时钟',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',k:['兼职','零工','小时','临时','钟点']},
    {n:'票据',p:'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z',k:['报销','发票','票据','单据','凭据']},
    {n:'红包',p:'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z',k:['红包','礼金','压岁','福利','赠送']},
    {n:'房子',p:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3z',k:['房租','房贷','房子','家','住宅','居住','物业']},
    {n:'面包',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',k:['早餐','面包','早点','烘焙','蛋糕']},
    {n:'咖啡',p:'M2 21h18v-2H2v2zM20 8h-2V5h2V3H4v2h2v3H4c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-2V5h4v3z',k:['咖啡','奶茶','饮料','下午茶','饮品']},
    {n:'饭盒',p:'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',k:['午餐','晚餐','餐饮','饭','餐食','外卖','堂食']},
    {n:'购物袋',p:'M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a3 3 0 003 3h10a3 3 0 003-3V8a1 1 0 00-1-1zM10 6a2 2 0 014 0v1h-4V6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1V9h12v10z',k:['超市','购物','买东西','便利店','小卖部','日用']},
    {n:'购物车',p:'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',k:['网购','淘宝','京东','拼多多','线上购物']},
    {n:'水滴',p:'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z',k:['饮用水','纯净水','饮料','饮品']},
    {n:'闪电',p:'M7 2v11h3v9l7-12h-4l4-8z',k:['电费','水电','燃气','能源','电力']},
    {n:'公交',p:'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z',k:['公交','交通','出行','通勤','地铁','巴士']},
    {n:'汽车',p:'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',k:['汽车','打车','自驾','轿车','私家车']},
    {n:'加油',p:'M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z',k:['加油','汽油','油品','加油站','油耗']},
    {n:'音符',p:'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',k:['娱乐','音乐','唱歌','KTV','休闲']},
    {n:'游戏',p:'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',k:['游戏','电玩','网吧','Switch','PS5']},
    {n:'人群',p:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',k:['社交','聚餐','聚会','朋友','同学']},
    {n:'十字',p:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',k:['医疗','医院','药品','看病','诊所']},
    {n:'书本',p:'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',k:['教育','学习','培训','书本','读书']},
    {n:'猫爪',p:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v2h-2z',k:['宠物','猫','狗','萌宠','动物']},
    {n:'哑铃',p:'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',k:['健身','运动','锻炼','瑜伽','跑步']},
    {n:'手机',p:'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',k:['通讯','电话','手机','话费','流量']},
    {n:'扳手',p:'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',k:['维修','装修','工具','维护','修补']},
    {n:'礼物',p:'M20 12c0-1.1-.9-2-2-2h-2.58l2.29-2.29-1.41-1.41L13 9.71V7c0-.55-.45-1-1-1s-1 .45-1 1v2.71L7.71 6.41 6.41 7.71 8.71 10H6c-1.1 0-2 .9-2 2s.9 2 2 2h2.71l-2.29 2.29 1.41 1.41L11 14.29V17c0 .55.45 1 1 1s1-.45 1-1v-2.71l3.29 3.29 1.41-1.41L13.29 14H16c1.1 0 2-.9 2-2zm-9-1h2v2h-2z',k:['礼物','礼品','礼盒','生日','节日']},
    {n:'行李箱',p:'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',k:['旅行','旅游','出差','出行','机票']},
    {n:'飞机',p:'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',k:['飞机','航空','飞行','机票','航班']},
    {n:'更多',p:'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',k:['其他','更多','其他分类','其他支出','其他收入']}
  ];
  // 按名称自动匹配图标
  const findIcon=(name)=>{
    if(!name)return null;
    for(const icon of ICON_LIBRARY){
      if(icon.k.some(k=>name.includes(k)))return icon.p;
    }
    return null;
  };

  // 分类数据迁移（v1.5.0）：旧版 localStorage 分类不随升级自动更新 → 合并新默认分类
  // 规则：仅当版本标记缺失时执行一次合并（升级后不再动用户删除/修改的分类）
  const CATS_VER='2',CATS_VER_KEY='wb_ledger_cats_ver';
  const loadCats=()=>{
    let cats=null;
    try{const s=localStorage.getItem(CK);if(s)cats=JSON.parse(s);}catch(e){}
    if(!cats||!cats.expense||!cats.income)return JSON.parse(JSON.stringify(DEFAULT_CATS));
    const needUpgrade=localStorage.getItem(CATS_VER_KEY)!==CATS_VER;
    if(needUpgrade){
      ['expense','income'].forEach(type=>{
        const defs=DEFAULT_CATS[type]||[];
        const cur=(cats[type]||[]).filter(c=>c&&c.n);
        const curMap={};cur.forEach(c=>{curMap[c.n]=c;});
        // 1) 已有默认分类：同步图标；颜色/f 缺则补（不覆盖用户已自定义的）
        defs.forEach(def=>{
          const ex=curMap[def.n];
          if(!ex)return;
          if(def.p)ex.p=def.p;
          if(!ex.c&&def.c)ex.c=def.c;
          if(ex.f===undefined&&def.f!==undefined)ex.f=def.f;
        });
        // 2) 追加新默认分类（保留用户顺序，新分类排在末尾）
        const curNames=new Set(cur.map(c=>c.n));
        defs.forEach(def=>{if(!curNames.has(def.n))cur.push(JSON.parse(JSON.stringify(def)));});
        cats[type]=cur;
      });
      localStorage.setItem(CATS_VER_KEY,CATS_VER);
      saveCats(cats);
    }
    return cats;
  };
  const saveCats=cats=>localStorage.setItem(CK,JSON.stringify(cats));
  let CATS=loadCats();
  const catInfo=(type,name)=>{const f=CATS[type]&&CATS[type].find(x=>x.n===name);return f||{n:name,c:'#999',p:DEFAULT_ICON,f:0};};

  const loadRange=()=>{try{const s=localStorage.getItem(RK);if(s)return JSON.parse(s);}catch(e){}return {start:firstDayOfMonth(),end:today()};};
  const saveRange=r=>localStorage.setItem(RK,JSON.stringify(r));

  const OLD_SK='wb_ledger_records';
  const migrateOldData=()=>{
    try{const old=localStorage.getItem(OLD_SK);if(old){const p=JSON.parse(old);if(Array.isArray(p)&&p.length>0){const k=SK+'_默认账本';if(!localStorage.getItem(k)){localStorage.setItem(k,old);localStorage.removeItem(OLD_SK);}}}}catch(e){}
  };
  const loadLedgers=()=>{try{const s=localStorage.getItem(LK);if(s){const l=JSON.parse(s);if(Array.isArray(l)&&l.length>0)return l;}}catch(e){}migrateOldData();saveLedgers(['默认账本']);return ['默认账本'];};
  const saveLedgers=l=>localStorage.setItem(LK,JSON.stringify(l));
  const loadDefaultLedger=()=>localStorage.getItem(LDK)||'默认账本';
  const saveDefaultLedger=l=>localStorage.setItem(LDK,l);
  let LEDGERS=loadLedgers();
  let currentLedger=loadDefaultLedger();

  // ========== v1.8.1 损坏数据保护（P0-1） ==========
  // 病根：原来 load() 吞掉 JSON.parse 异常后返回 []，用户看到的是"空账本"，
  //       随手记一笔/删一条就把 [] 写回 → 全部历史被覆盖，无抢救无警告。
  // 药方只有两步：①抢救（原始损坏串另存 wb_ledger_corrupt_<账本>，只抢救第一次，避免每次失败刷一堆 key）
  //              ②禁写（corruptGuard 为真时 save 拒写并 throw；解析成功即自动解禁 → 恢复数据后不会卡死）
  let corruptGuard=false;
  const CORRUPT_KEY=l=>'wb_ledger_corrupt_'+l;
  const rescued=new Set();                                  // 本会话已抢救过的账本
  const clearCorruptGuard=()=>{corruptGuard=false;};        // 用户主动恢复（导入文件）时放行
  const load=()=>{
    try{
      const raw=localStorage.getItem(SK+'_'+currentLedger);
      corruptGuard=false;                                   // 解析成功 = 数据完好（或已被恢复覆盖）→ 解除禁写
      return raw?JSON.parse(raw):[];
    }catch(e){
      const raw=localStorage.getItem(SK+'_'+currentLedger)||'';
      corruptGuard=true;
      if(raw&&!rescued.has(currentLedger)){
        rescued.add(currentLedger);
        try{if(!localStorage.getItem(CORRUPT_KEY(currentLedger)))localStorage.setItem(CORRUPT_KEY(currentLedger),raw);}catch(e2){}
      }
      console.warn('[ledger] 记录解析失败，原始数据已保护在 '+CORRUPT_KEY(currentLedger)+'，本次禁止写入:',e);
      return[];
    }
  };
  const save=d=>{
    // throw 是故意的：调用方自然中断，不会出现"提示保存失败、界面却说已保存、输入框还清空"的假成功
    if(corruptGuard){toast('数据读取异常，已保护原始数据，本次未写入。请先恢复备份');throw new Error('数据读取异常，已保护原始数据');}
    try{localStorage.setItem(SK+'_'+currentLedger,JSON.stringify(d));}
    catch(e){toast('保存失败：存储空间不足，数据未写入');throw new Error('存储空间不足');}
  };
  const isDemo=()=>localStorage.getItem(DK)==='1';
  const setDemo=v=>localStorage.setItem(DK,v?'1':'0');
  // 支出来源配置 {enabled:boolean, list:[来源名]}
  const loadSources=()=>{try{const s=localStorage.getItem(SRC);if(s){const o=JSON.parse(s);if(o&&typeof o.enabled==='boolean'&&Array.isArray(o.list))return o;}}catch(e){}return {enabled:false,list:['信用卡','银行卡']};};
  const saveSources=c=>localStorage.setItem(SRC,JSON.stringify(c));
  let srcCfg=loadSources();
  // 统计范围配置 {mode:'current'|'all'|'custom', ledgers:[勾选账本]}
  const loadStatsScope=()=>{try{const s=localStorage.getItem(SCOPE);if(s){const o=JSON.parse(s);if(o&&(o.mode==='current'||o.mode==='all'||o.mode==='custom'))return o;}}catch(e){}return {mode:'current',ledgers:[]};};
  const saveStatsScope=s=>localStorage.setItem(SCOPE,JSON.stringify(s));
  let statsScope=loadStatsScope();
  const loadLedgerData=l=>{try{const raw=localStorage.getItem(SK+'_'+l);return raw?JSON.parse(raw):[]}catch(e){return[]}};
  // 统计页数据源：按统计范围合并账本
  const getStatsData=()=>{
    if(statsScope.mode==='all')return LEDGERS.flatMap(loadLedgerData);
    if(statsScope.mode==='custom'&&statsScope.ledgers&&statsScope.ledgers.length)return statsScope.ledgers.filter(l=>LEDGERS.includes(l)).flatMap(loadLedgerData);
    return load();
  };
  // 记录备注行（含支出来源前缀）
  const recordNote=r=>{const src=r.src?escape(r.src)+' · ':'';return `${src}${escape(r.n||'—')} · ${escape(r.d)}`;};

  let toastTimer;
  const toast=msg=>{const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2000);};

  const showModal=(title,body,actions,opts={})=>{
    $('modal-title').textContent=title;$('modal-body').innerHTML=body;
    // v1.6.0：可选右上角 ❌ 关闭按钮（closeX:true 时显示，点击直接关弹窗）
    let xbtn=$('modal-close-x');
    if(opts.closeX){
      if(!xbtn){xbtn=document.createElement('button');xbtn.id='modal-close-x';$('modal').appendChild(xbtn);}
      xbtn.style.display='flex';
      xbtn.onclick=()=>$('modal').classList.remove('show');
    }else if(xbtn){xbtn.style.display='none';}
    const act=$('modal-actions');act.innerHTML='';
    actions.forEach(a=>{const b=document.createElement('button');b.className='btn '+(a.cls||'');if(a.style)Object.assign(b.style,a.style);b.textContent=a.label;b.style.flex=a.flex||'1';b.onclick=()=>{a.action&&a.action();if(a.close!==false)$('modal').classList.remove('show')};act.appendChild(b);});
    $('modal').classList.add('show');
  };
  $('modal').addEventListener('click',e=>{if(e.target===$('modal'))$('modal').classList.remove('show')});

  const goPage=p=>{
    currentPage=p;
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    $('page-'+p).classList.add('active');
    document.querySelectorAll('.nav-item,.tab-item').forEach(x=>x.classList.toggle('active',x.dataset.page===p));
    renderLedgerSelect();
    if(p==='home')renderHome();
    if(p==='stats')renderStats();
    if(p==='search')renderDayCalendar(); // v1.8.0：按天查询用当前账本+当前区间重算
  };
  document.querySelectorAll('.nav-item,.tab-item').forEach(el=>{el.addEventListener('click',()=>goPage(el.dataset.page));});

  // 选中态刷新（v1.7.4）：只改类名/内联样式，不重建网格
  // 背景：点分类时若走 renderPills()，整格 innerHTML 被清空重建（N 个 pill + N 个 SVG）、
  //       拖拽引擎再 new 一遍、容器级监听器再叠一层——一次点击引发大量同步 DOM churn，
  //       会破坏 WebView 已建立的输入法会话 → 备注框中文只能字母直上屏；
  //       切走再切回（=再重建一次）才恢复。改为「点选只刷选中态」，点分类不再动 DOM 结构。
  const paintCatSelection=()=>{
    const box=$('cat-pills');if(!box)return;
    const arr=CATS[selectedType]||[];
    box.querySelectorAll('.cat-pill').forEach(d=>{
      const nameEl=d.querySelector('.cat-pill-name');
      const cat=arr.find(c=>c.n===(nameEl?nameEl.textContent:''));
      if(!cat)return;
      const sel=cat.n===selectedCat;
      d.classList.toggle('selected',sel);
      d.style.background=sel?cat.c:'';d.style.color=sel?'#fff':'';d.style.borderColor=sel?cat.c:'';
      const path=d.querySelector('svg path');if(path)path.setAttribute('fill',sel?'#fff':cat.c);
    });
  };
  // 点选分类（点按 / 长按未拖）：只切状态 + 刷选中态
  const pickCat=(name,f)=>{
    selectedCat=name;
    if(selectedType==='expense'){selectedFf=f!==undefined?f:0;updateFfToggle();}
    paintCatSelection();
  };
  // 拖拽引擎对 #cat-pills 只建一次（v1.7.4）：原先每次 renderPills 都 new 一个 sorter，
  // 同一容器上的 contextmenu 监听器逐次累积；结构性重渲染后只重新 bind 条目监听即可
  let pillsSorter=null;
  const renderPills=()=>{
    const box=$('cat-pills');box.innerHTML='';
    (CATS[selectedType]||[]).forEach(cat=>{
      const sel=cat.n===selectedCat;
      const d=document.createElement('div');
      d.className='cat-pill'+(sel?' selected':'');
      d.innerHTML=`${iconSvg(cat.p,sel?'#fff':cat.c)}<span class="cat-pill-name">${escape(cat.n)}</span>`;
      d.style.background=sel?cat.c:'';d.style.color=sel?'#fff':'';d.style.borderColor=sel?cat.c:'';
      const del=document.createElement('button');del.className='cat-pill-del';del.innerHTML='×';del.title='删除分类';
      del.onclick=e=>{e.stopPropagation();confirmDelCat(selectedType,cat.n)};
      d.appendChild(del);
      d.onclick=()=>{
        if(dragJustEnded){dragJustEnded=null;return;} // 长按拖拽后的 click 不选中
        pickCat(cat.n,cat.f);
      };
      box.appendChild(d);
    });
    // 记账页长按图标直接拖拽排序（与分类管理弹窗同逻辑，跟手）；长按未拖动=选中该分类
    if(!pillsSorter){
      pillsSorter=makeDragSorter(box,{
        getArr:()=>CATS[selectedType],
        itemSel:'.cat-pill',
        axis:'xy',
        onSave:()=>{saveCats(CATS);toast('顺序已保存');}, // DOM 已就位，不重渲染（保住松手吸附动画）
        onTap:(el)=>{const nameEl=el.querySelector('.cat-pill-name');const name=nameEl?nameEl.textContent:el.textContent.replace('×','').trim();const cat=(CATS[selectedType]||[]).find(c=>c.n===name);if(cat)pickCat(cat.n,cat.f);}
      });
    }else{
      pillsSorter.bind(); // 条目已重建，重新挂条目监听（不重复建 sorter）
    }
  };

  const updateFfToggle=()=>{document.querySelectorAll('.ff-btn').forEach(b=>{b.classList.remove('active','fixed','flex');if(parseInt(b.dataset.ff)===selectedFf)b.classList.add('active',selectedFf===1?'fixed':'flex');});};
  document.querySelectorAll('.ff-btn').forEach(btn=>{btn.addEventListener('click',()=>{selectedFf=parseInt(btn.dataset.ff);updateFfToggle();});});
  const updateFfVisibility=()=>{
    const isExp=selectedType==='expense';
    $('ff-toggle').style.display=isExp?'flex':'none';
    $('src-row').style.display=(isExp&&srcCfg.enabled)?'flex':'none';
  };

  const confirmDelCat=(type,name)=>{
    showModal('删除分类',`确定要删除分类「${escape(name)}」吗？`,[
      {label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{CATS[type]=CATS[type].filter(c=>c.n!==name);saveCats(CATS);if(selectedCat===name)selectedCat=(CATS[type][0]||{n:''}).n;renderPills();toast('已删除');}}
    ]);
  };

  $('cat-add-btn').addEventListener('click',()=>{
    const name=$('cat-name-input').value.trim(),type=$('cat-type-select').value,f=$('cat-fixed-select').value;
    if(!name){toast('请输入分类名称');return}
    if(CATS[type].some(c=>c.n===name)){toast('该分类已存在');return}
    const colors=['#5DB89F','#FFD93D','#7ECFB6','#A8E6CF','#FFE66D','#FFB6C1','#FF8FA3','#B8A9C9','#9B8EC4','#C9B1FF'];
    const autoIcon=findIcon(name);
    const newCat={n:name,c:colors[CATS[type].length%colors.length],p:autoIcon||DEFAULT_ICON};
    if(type==='expense')newCat.f=Number(f);
    CATS[type].push(newCat);saveCats(CATS);$('cat-name-input').value='';
    if(type===selectedType){selectedCat=name;selectedFf=newCat.f;renderPills();updateFfToggle()}
    if(!autoIcon){
      showIconPicker(type,CATS[type].length-1,()=>{
        if(type===selectedType){renderPills();}
        toast('已添加');
      });
    } else {
      toast('已添加');
    }
  });
  $('cat-type-select').addEventListener('change',()=>$('cat-fixed-select').style.display=$('cat-type-select').value==='expense'?'block':'none');
  $('cat-fixed-select').style.display='block';

  // 图标挑选弹窗
  const showIconPicker=(type,idx,onDone)=>{
    const cat=CATS[type][idx];
    const icons=ICON_LIBRARY;
    const grid=icons.map((ic,i)=>`<div class="icon-picker-item" data-i="${i}" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid transparent;background:${cat.p===ic.p?'rgba(93,184,159,0.12)':'var(--bg)'};transition:all .2s"><span style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,${cat.c},${cat.c}DD);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="${ic.p}"/></svg></span></div>`).join('');
    showModal(`为「${cat.n}」挑选图标`,`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-height:300px;overflow-y:auto">${grid}</div>`,[
      {label:'跳过',cls:'btn-outline',action:()=>{if(onDone)onDone();}},
      {label:'确认',cls:'btn-primary',action:()=>{if(onDone)onDone();}}
    ]);
    setTimeout(()=>{
      document.querySelectorAll('.icon-picker-item').forEach(item=>{
        item.addEventListener('click',()=>{
          const i=parseInt(item.dataset.i);
          CATS[type][idx].p=icons[i].p;saveCats(CATS);
          document.querySelectorAll('.icon-picker-item').forEach(d=>d.style.borderColor='transparent');
          item.style.borderColor='var(--primary)';
        });
      });
    },100);
  };

  // 分类管理弹窗（参照首页"最近记录"批量管理交互：勾选/全选/全消/删除选中）
  let catMgmtSelected=new Set();
  const catMgmtBody=()=>{
    const cats=CATS[selectedType]||[];
    const list=cats.map((c,i)=>`<label class="cat-mgmt-item" data-i="${i}" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:grab">
      <input type="checkbox" class="cat-mgmt-check" data-i="${i}" ${catMgmtSelected.has(i)?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);flex-shrink:0">
      <span class="icon-box" style="width:32px;height:32px;background:linear-gradient(135deg,${c.c},${c.c}DD)">${iconSvg(c.p,'#fff')}</span>
      <span style="font-size:14px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escape(c.n)}</span>
      <button class="cat-mgmt-edit" data-i="${i}" style="border:1px solid var(--border);background:var(--bg);color:var(--primary-dark);font-size:12px;border-radius:12px;padding:3px 10px;cursor:pointer;flex-shrink:0">修改</button>
    </label>`).join('');
    const typeTabs=['expense','income'].map(t=>{
      const act=t===selectedType;
      return `<button class="cat-mgmt-type" data-type="${t}" style="flex:1;padding:8px;border-radius:20px;border:1.5px solid ${act?'var(--primary)':'var(--border)'};background:${act?'rgba(93,184,159,0.12)':'var(--bg)'};color:${act?'var(--primary-dark)':'var(--text-light)'};font-size:13px;font-weight:${act?'600':'400'};cursor:pointer">${t==='expense'?'支出':'收入'}分类</button>`;
    }).join('');
    return `<div style="display:flex;gap:8px;margin-bottom:12px">${typeTabs}</div>
      <div style="font-size:11px;color:var(--text-light);margin-bottom:6px;text-align:right">长按条目可拖动调整顺序</div>
      ${cats.length?`<div style="max-height:40vh;overflow-y:auto;min-height:60px" id="cat-mgmt-list">${list}</div>`:`<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px">暂无${selectedType==='expense'?'支出':'收入'}分类，可在下方添加</div>`}
      <div style="display:flex;gap:8px;margin-top:14px;align-items:center">
        <span style="flex:1;font-size:13px;color:var(--text-light)" id="cat-mgmt-info">已选 ${catMgmtSelected.size} 条</span>
        <button class="btn btn-ghost btn-sm" id="cat-mgmt-all">全选</button>
        <button class="btn btn-ghost btn-sm" id="cat-mgmt-none">全消</button>
        <button class="btn btn-danger btn-sm" id="cat-mgmt-del">删除选中</button>
        <button class="btn btn-outline btn-sm" id="cat-mgmt-close">关闭</button>
      </div>`;
  };
  // ================================================================
  // 通用长按拖拽排序引擎 v5（方案 D：压实无空位 / 落点高亮 / 松手一次性重排）
  // ----------------------------------------------------------------
  // 封装边界：本段自包含（仅依赖传入的 container/opts），可整体拷贝到其他项目复用。
  // API：makeDragSorter(container, {
  //       getArr: ()=>array,   // 与 DOM 顺序同步的数据数组（松手重排后自动同步）
  //       itemSel: '.item',    // 条目选择器
  //       axis: 'xy' | 'y',    // xy 网格 / y 列表（y 轴自动锁 x）
  //       onSave: fn,          // 松手重排并落盘后回调
  //       onTap: el=>{}        // 长按未拖 = 点选（touch 长按不触发 click，需手动处理）
  //     })
  // 交互模型（v5，真机拍板方案 D）：
  //   1. 长按 280ms 激活：条目抬起（scale1.06 + 重阴影 + 震动）；其余条目一概不动，
  //      全程无空位——"没补全"物理上不可能发生
  //   2. 拖动：条目浮空跟手（transform 不脱流，布局快照永久有效）；最近目标格实时
  //      虚线高亮（.drop-hint），随手指切换
  //   3. 松手：目标格 ≠ 原位 → 一次性 FLIP 重排（0.55s：其余条目滑入新位，拖拽项
  //      吸附入槽）；目标格 = 原位 → 吸附回原位；位移 ≤10px 视为长按点选（onTap）
  //   4. 沿用 v3 基建：边缘自动滚动（rAF）、等待期 14px 抖动容错、文本选择/长按菜单阻断、
  //      每次按下重新收集 items（防 DOM 重排后索引失真）
  // ================================================================
  const EDGE = 44;         // 自动滚动边缘带宽(px)
  const EDGE_SPEED = 9;    // 每帧最大滚动量(px)
  const FLIP_MS = 550;     // 松手重排动画时长（按用户偏好放慢）
  let dragJustEnded=null,dragJustEndedTimer=null;
  const makeDragSorter=(container,opts)=>{
    if(!container)return;
    let items=[],pressIdx=-1,dragIdx=-1,startX=0,startY=0,longTimer=null,active=false,moved=false;
    let slots=[];    // 快照：激活时刻各槽位中心 {cx,cy}（全程不脱流，快照永久有效）
    let lastBest=-1; // 当前最近目标槽（高亮跟随）
    let dropEl=null; // 当前高亮的条目
    let scrollBase=0,scrollCur=0; // 激活时刻容器 scrollTop 基准 / 当前值
    let lastX=0,lastY=0,rafId=null,scrollEl=null;
    let bound=false; // v1.7.4：容器级监听器只挂一次
    const clearTimer=()=>{if(longTimer){clearTimeout(longTimer);longTimer=null;}};
    const getXY=e=>{const t=e.touches?e.touches[0]:e;return{x:t.clientX,y:t.clientY};};
    // 向上找最近的可滚动祖先（含容器自身）
    const findScroller=el=>{
      for(let n=el;n&&n!==document.body;n=n.parentElement){
        const o=getComputedStyle(n).overflowY;
        if((o==='auto'||o==='scroll')&&n.scrollHeight>n.clientHeight+2)return n;
      }
      return document.scrollingElement||document.documentElement;
    };
    const autoScroll=()=>{ // 边缘自动滚动循环：指针停在边缘带内则每帧滚动
      if(!active){rafId=null;return;}
      if(scrollEl){
        const cr=container.getBoundingClientRect();
        const dy=lastY-cr.top;
        let step=0;
        if(dy<EDGE)step=-Math.ceil((EDGE-dy)/EDGE*EDGE_SPEED);
        else if(cr.bottom-lastY<EDGE)step=Math.ceil((EDGE-(cr.bottom-lastY))/EDGE*EDGE_SPEED);
        if(step){
          scrollEl.scrollTop+=step;
          scrollCur=scrollEl.scrollTop;
          moveDrag(lastX,lastY);
        }
      }
      rafId=requestAnimationFrame(autoScroll);
    };
    // 清除落点高亮
    const clearHint=()=>{if(dropEl){dropEl.classList.remove('drop-hint');dropEl=null;}lastBest=-1;};
    // 移动拖拽项到 (x,y)（视口坐标）；y 轴自动锁 x。更新跟手位移 + 落点高亮
    const moveDrag=(x,y)=>{
      const it=items[dragIdx];if(!it)return;
      const dScroll=scrollCur-scrollBase; // 快照坐标系随滚动的偏移
      // 跟手：transform = 指针位移 + 滚动补偿 + 抬起放大（页面滚多少，条目相对内容不动）
      const lift=' scale(1.06)';
      if(opts.axis==='xy'){
        it.style.transform=`translate(${Math.round(x-startX)}px,${Math.round(y-startY+dScroll)}px)${lift}`;
      }else{
        it.style.transform=`translate(0px,${Math.round(y-startY+dScroll)}px)${lift}`;
      }
      it.style.zIndex='99';
      if(Math.hypot(x-startX,y-startY)>10)moved=true;
      // 最近目标槽（含原位——拖回原位=取消重排，松手吸附回家）
      const base=slots[dragIdx];
      const cx=base.cx+(opts.axis==='xy'?x-startX:0);
      const cy=base.cy+(y-startY+dScroll);
      let best=-1,bd=Infinity;
      slots.forEach((s,k)=>{
        const d=opts.axis==='y'?Math.abs(cy-s.cy):Math.hypot(cx-s.cx,cy-s.cy);
        if(d<bd){bd=d;best=k;}
      });
      if(best<0)return;
      if(best!==lastBest){ // 落点高亮跟随
        clearHint();
        if(best!==dragIdx){dropEl=items[best];dropEl.classList.add('drop-hint');}
        lastBest=best;
      }
    };
    const onStart=e=>{
      // 每次按下重新收集 items（防首次拖拽重排 DOM 后索引失真），按 currentTarget 定位
      items=[...container.querySelectorAll(opts.itemSel)];
      const i=items.indexOf(e.currentTarget);
      if(i<0)return;
      if(e.target.closest('input,button,a,select'))return;
      const p=getXY(e);startX=p.x;startY=p.y;lastX=p.x;lastY=p.y;pressIdx=i;
      moved=false;
      clearTimer();
      longTimer=setTimeout(()=>{
        const it=items[pressIdx];if(!it)return;
        active=true;dragIdx=pressIdx;moved=false;lastBest=dragIdx;
        // v1.7.3：不再污染 body 级 user-select（切换本身就会破坏 WebView 中文组字，
        // 真机两轮证实）。文本禁选改由静态 CSS（.cat-pill/.cat-mgmt-item 自身禁选）承担
        // 布局快照：此刻各槽位中心（拖拽项不脱流，此后所有条目布局不变，快照永久有效）
        slots=items.map(el=>{const r=el.getBoundingClientRect();return{cx:r.left+r.width/2,cy:r.top+r.height/2};});
        scrollEl=findScroller(container);
        scrollBase=scrollCur=scrollEl?scrollEl.scrollTop:0;
        it.classList.add('dragging');       // 视觉抬升（阴影），不改布局
        it.style.transition='none';
        it.style.transform='translate(0px,0px) scale(1.06)'; // 抬起感
        if(navigator.vibrate)navigator.vibrate(15);
        if(!rafId)rafId=requestAnimationFrame(autoScroll);
      },280);
    };
    const onMove=e=>{
      const p=getXY(e);lastX=p.x;lastY=p.y;
      if(!active){
        // 等待期：小幅抖动(<14px)不取消长按（激活前不 preventDefault，页面可正常滚动；
        // 若真滚动了，激活时会以当下手指位置重算基准，体验不受影响）
        if(Math.abs(p.x-startX)>14||Math.abs(p.y-startY)>14)clearTimer();
        return;
      }
      e.preventDefault(); // 已激活：禁掉页面滚动，交给拖拽+边缘自动滚动
      moveDrag(p.x,p.y);
    };
    const onEnd=()=>{
      clearTimer();
      if(active){
        active=false;
        if(rafId){cancelAnimationFrame(rafId);rafId=null;}
        const it=items[dragIdx];
        const target=lastBest>=0?lastBest:dragIdx; // 先取落点（clearHint 会重置 lastBest）
        clearHint();
        if(it&&!moved){
          // 长按未拖动 = 点击选中（touch 长按后不触发 click，需手动处理）
          it.classList.remove('dragging','drag-ghost');it.style.transform='';it.style.transition='';it.style.zIndex='';
          dragIdx=-1;
          dragJustEnded=null;
          if(opts.onTap)opts.onTap(it);
          return;
        }
        if(it&&moved){
          // 松手：一次性 FLIP 重排（目标=原位时无重排，仅吸附回家且不落盘）
          const changed=target!==dragIdx;
          const dScroll=scrollCur-scrollBase;
          const order=items.slice();
          order.splice(dragIdx,1);
          order.splice(target,0,it);
          if(changed){
            // 其余条目：先逆位移（视觉保持在原槽），DOM 重排后清零 → 滑入新槽
            order.forEach((el,k)=>{
              if(el===it)return;
              const oldK=items.indexOf(el);
              if(oldK===k)return;
              const from=slots[oldK],to=slots[k];
              el.style.transition='none';
              if(opts.axis==='xy'){
                el.style.transform=`translate(${Math.round(from.cx-to.cx)}px,${Math.round(from.cy-to.cy)}px)`;
              }else{
                el.style.transform=`translate(0px,${Math.round(from.cy-to.cy)}px)`;
              }
            });
            void container.offsetHeight; // 一次性 reflow：逆位移全部生效
          }
          // 拖拽项：视觉保持在浮空位置（相对新自然位=目标槽；未变化时=当前位移，清零即回家）
          const base=slots[dragIdx],to=slots[target];
          const dx=(base.cx-to.cx)+(opts.axis==='xy'?lastX-startX:0);
          const dy=(base.cy-to.cy)+(lastY-startY+dScroll);
          it.classList.remove('dragging','drag-ghost'); // 先摘类，解除 transition:none!important
          it.style.transition='none';
          it.style.transform=`translate(${Math.round(dx)}px,${Math.round(dy)}px) scale(1.06)`;
          if(changed){
            // DOM 重排：全部条目自然位置变为最终布局；数据数组与最终顺序同步
            order.forEach(el=>container.appendChild(el));
            const arr=opts.getArr();
            const byEl=new Map(items.map((el,i)=>[el,arr[i]]));
            for(let k=0;k<order.length;k++)arr[k]=byEl.get(order[k]);
          }
          // 全员清零 → 0.55s 平滑滑入新位（未变化时=吸附回原位）
          void container.offsetHeight;
          order.forEach(el=>{el.style.transition=`transform ${FLIP_MS}ms cubic-bezier(.2,.7,.3,1)`;el.style.transform='';});
          it.style.zIndex='';
          dragIdx=-1;
          dragJustEnded=true;clearTimeout(dragJustEndedTimer);dragJustEndedTimer=setTimeout(()=>dragJustEnded=null,50);
          if(changed&&opts.onSave)opts.onSave();
        }
      }
    };
    const bind=()=>{
      items=[...container.querySelectorAll(opts.itemSel)];
      if(items.length<2)return;
      items.forEach(it=>{
        it.addEventListener('touchstart',onStart,{passive:true});
        it.addEventListener('touchmove',onMove,{passive:false});
        it.addEventListener('touchend',onEnd);
        it.addEventListener('touchcancel',onEnd);
        it.addEventListener('mousedown',onStart);
        it.addEventListener('mousemove',onMove);
        it.addEventListener('mouseup',onEnd);
        it.addEventListener('mouseleave',onEnd);
      });
      // 长按等待期阻断系统文本选择/安卓长按菜单（不影响 click 与滚动）
      // v1.7.4：容器级监听器只挂一次——重复 bind 不再叠加（原先每次重建都叠一层）
      if(!bound){
        bound=true;
        container.addEventListener('contextmenu',e=>{
          if(active||longTimer)e.preventDefault();
        });
      }
    };
    bind();
    return {bind,isActive:()=>active};
  };
  // 修改分类弹窗：名称 / 支出属性(固定/弹性) / 图标
  const showEditCat=(type,idx)=>{
    const cat=CATS[type][idx];
    if(!cat){toast('分类不存在');return;}
    const isExp=type==='expense';
    const inpStyle='width:100%;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--bg);color:var(--text);outline:none;box-sizing:border-box';
    const lblStyle='display:block;font-size:12px;color:var(--text-light);margin-bottom:4px';
    const body=`<div>
      <div style="margin-bottom:12px"><label style="${lblStyle}">分类名称</label><input id="cat-edit-name" type="text" inputmode="text" value="${escape(cat.n)}" style="${inpStyle}"></div>
      ${isExp?`<div style="margin-bottom:12px"><label style="${lblStyle}">支出属性</label><select id="cat-edit-f" style="${inpStyle}"><option value="1" ${cat.f===1?'selected':''}>固定</option><option value="0" ${cat.f===0?'selected':''}>弹性</option></select></div>`:''}
      <div><label style="${lblStyle}">图标</label><div style="display:flex;align-items:center;gap:12px"><span class="icon-box" style="width:44px;height:44px;background:linear-gradient(135deg,${cat.c},${cat.c}DD)">${iconSvg(cat.p,'#fff')}</span><button class="btn btn-outline btn-sm" id="cat-edit-icon-btn">更换图标</button></div></div>
    </div>`;
    showModal(`修改分类「${escape(cat.n)}」`,body,[
      {label:'取消',cls:'btn-outline'},
      {label:'保存',cls:'btn-primary',action:()=>{
        const name=$('cat-edit-name').value.trim();
        if(!name){toast('名称不能为空');return;}
        if(name!==cat.n&&CATS[type].some(c=>c.n===name)){toast('该分类已存在');return;}
        const oldName=cat.n;
        cat.n=name;
        if(isExp)cat.f=parseInt($('cat-edit-f').value);
        saveCats(CATS);
        if(selectedType===type&&selectedCat===oldName){selectedCat=name;renderPills();}
        toast('已保存');
        showCatManage(true);
      }}
    ]);
    $('cat-edit-icon-btn').addEventListener('click',()=>{
      showIconPicker(type,idx,()=>{showEditCat(type,idx);}); // 选完重开编辑弹窗显示新图标
    });
  };
  const bindCatMgmt=()=>{
    const listBox=$('cat-mgmt-list');
    if(listBox)makeDragSorter(listBox,{
      getArr:()=>CATS[selectedType],
      itemSel:'.cat-mgmt-item',
      axis:'y',
      onSave:()=>{
        saveCats(CATS);
        renderPills();
        catMgmtSelected.clear();
        listBox.querySelectorAll('.cat-mgmt-check').forEach(cb=>{cb.checked=false;});
        const info=$('cat-mgmt-info');if(info)info.textContent='已选 0 条';
        toast('顺序已保存');
      }
    });
    document.querySelectorAll('.cat-mgmt-type').forEach(b=>{b.onclick=()=>{selectedType=b.dataset.type;catMgmtSelected.clear();showCatManage();};});
    document.querySelectorAll('.cat-mgmt-check').forEach(cb=>{cb.onchange=e=>{const i=parseInt(e.target.dataset.i);e.target.checked?catMgmtSelected.add(i):catMgmtSelected.delete(i);const info=$('cat-mgmt-info');if(info)info.textContent=`已选 ${catMgmtSelected.size} 条`;};});
    // 修改按钮（点击不进拖拽）
    document.querySelectorAll('.cat-mgmt-edit').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();showEditCat(selectedType,parseInt(btn.dataset.i));});
      btn.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
      btn.addEventListener('mousedown',e=>e.stopPropagation());
    });
    $('cat-mgmt-all').onclick=()=>{catMgmtSelected=new Set((CATS[selectedType]||[]).map((_,i)=>i));showCatManage(true);};
    $('cat-mgmt-none').onclick=()=>{catMgmtSelected.clear();showCatManage(true);};
    $('cat-mgmt-del').onclick=()=>{
      const n=catMgmtSelected.size;
      if(!n){toast('请先选择要删除的分类');return}
      showModal('删除分类',`确定删除选中的 ${n} 个分类吗？<br><span style="color:var(--text-light);font-size:12px">已使用这些分类的历史记录不受影响</span>`,[
        {label:'取消',cls:'btn-outline'},
        {label:'删除',cls:'btn-danger',action:()=>{
          const delNames=[...catMgmtSelected].map(i=>(CATS[selectedType]||[])[i]&&(CATS[selectedType][i]).n).filter(Boolean);
          CATS[selectedType]=(CATS[selectedType]||[]).filter(c=>!delNames.includes(c.n));
          saveCats(CATS);
          if(delNames.includes(selectedCat))selectedCat=((CATS[selectedType]||[])[0]||{n:''}).n;
          renderPills();toast('已删除');
          catMgmtSelected=new Set();showCatManage();
        }}
      ]);
    };
    $('cat-mgmt-close').onclick=()=>$('modal').classList.remove('show');
  };
  const showCatManage=(preserveSel=false)=>{
    if(!preserveSel)catMgmtSelected=new Set();
    dragJustEnded=null;clearTimeout(dragJustEndedTimer);
    showModal('管理分类',catMgmtBody(),[]);
    bindCatMgmt();
  };
  $('cat-manage-open').addEventListener('click',showCatManage);

  // ========== 记录编辑（弹窗方案：点击记录 → 弹出编辑表单，直接修改） ==========
  // opts.keepOpen：从"清单弹层"进入编辑时置 true —— 保存/删除后不自动关弹窗，
  //   由回调（清单弹层 reopen）接管重开，避免编辑一条就被踢出清单；
  //   顺带修掉"金额非法时弹窗仍被关掉"的老毛病（该校验路径本就不该关弹窗）
  const showEditModal=(rec,data,returnFn,opts={})=>{
    const keepOpen=opts.keepOpen===true;
    const idx=data.indexOf(rec);
    if(idx<0){toast('记录不存在');return;}
    let curT=rec.t==='income'?'income':'expense';
    let curF=rec.f!==undefined?rec.f:(catInfo(curT,rec.c).f||0);
    const inpStyle='width:100%;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--bg);color:var(--text);outline:none;box-sizing:border-box';
    const lblStyle='display:block;font-size:12px;color:var(--text-light);margin-bottom:4px';
    const typeBtns=()=>['expense','income'].map(t=>`<button class="edit-type-btn" data-t="${t}" style="flex:1;padding:9px;border-radius:18px;border:1.5px solid ${curT===t?'var(--primary)':'var(--border)'};background:${curT===t?'rgba(93,184,159,0.12)':'var(--bg)'};color:${curT===t?'var(--primary-dark)':'var(--text-light)'};font-size:13px;font-weight:${curT===t?'600':'400'};cursor:pointer">${t==='expense'?'支出':'收入'}</button>`).join('');
    const catOpts=()=>(CATS[curT]||[]).map(c=>`<option value="${escape(c.n)}" ${c.n===rec.c&&curT===rec.t?'selected':''}>${escape(c.n)}</option>`).join('');
    const ffBtns=()=>curT==='expense'?`<div id="edit-ff-row" style="display:flex;gap:8px;margin-bottom:10px">${[['1','固定'],['0','弹性']].map(([v,l])=>`<button class="edit-ff-btn" data-f="${v}" style="flex:1;padding:9px;border-radius:12px;border:1.5px solid ${curF===+v?'var(--primary)':'var(--border)'};background:${curF===+v?'rgba(93,184,159,0.12)':'var(--bg)'};color:${curF===+v?'var(--primary-dark)':'var(--text-light)'};font-size:13px;cursor:pointer">${l}</button>`).join('')}</div>`:'';
    const srcHtml=()=>(curT==='expense'&&srcCfg.enabled)?`<div id="edit-src-row" style="margin-bottom:10px"><label style="${lblStyle}">支出来源</label><select id="edit-src" style="${inpStyle}"><option value="">无</option>${srcCfg.list.map(s=>`<option value="${escape(s)}" ${rec.src===s?'selected':''}>${escape(s)}</option>`).join('')}</select></div>`:'';
    const render=()=>{
      $('edit-type-wrap').innerHTML=typeBtns();
      $('edit-cat').innerHTML=catOpts();
      $('edit-ff-wrap').innerHTML=ffBtns();
      $('edit-src-wrap').innerHTML=srcHtml();
      document.querySelectorAll('.edit-type-btn').forEach(b=>{b.onclick=()=>{curT=b.dataset.t;curF=catInfo(curT,rec.c).f||0;render();};});
      document.querySelectorAll('.edit-ff-btn').forEach(b=>{b.onclick=()=>{curF=parseInt(b.dataset.f);render();};});
    };
    const body=`<div>
      <div id="edit-type-wrap" style="display:flex;gap:8px;margin-bottom:12px"></div>
      <div style="margin-bottom:10px"><label style="${lblStyle}">分类</label><select id="edit-cat" style="${inpStyle}"></select></div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <!-- v1.7.5：同记账页——金额框不得用数字类 inputmode（会把 WebView 编辑器置为数字类，掐断备注框中文组字） -->
        <div style="flex:1"><label style="${lblStyle}">金额</label><input id="edit-amount" type="text" autocomplete="off" value="${rec.a}" style="${inpStyle}"></div>
        <div style="flex:1"><label style="${lblStyle}">日期</label><input id="edit-date" type="date" value="${rec.d}" style="${inpStyle}"></div>
      </div>
      <div id="edit-ff-wrap"></div>
      <div id="edit-src-wrap"></div>
      <div><label style="${lblStyle}">备注</label><input id="edit-note" type="text" inputmode="text" value="${escape(rec.n||'')}" style="${inpStyle}"></div>
    </div>`;
    // v1.6.0：删除（红底白字，占原"取消"位）+ 保存；取消改为右上角 ❌
    showModal('编辑记录',body,[
      {label:'删除',cls:'btn-outline',flex:'1',close:keepOpen?false:undefined,style:{background:'var(--expense)',color:'#fff',borderColor:'var(--expense)'},action:()=>{
        showModal('删除记录','确定要删除这条记录吗？',[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',close:keepOpen?false:undefined,action:()=>{
          data.splice(idx,1);save(data);toast('已删除');
          if(returnFn)returnFn();else{renderHome();renderStats();}
        }}]);
      }},
      {label:'保存',cls:'btn-primary',close:keepOpen?false:undefined,action:()=>{
        const amt=$('edit-amount').value,date=$('edit-date').value,note=$('edit-note').value.trim();
        const cat=$('edit-cat').value;
        if(!amt||isNaN(amt)||Number(amt)<=0){toast('请输入有效金额');return;}
        if(!cat){toast('请选择分类');return;}
        const nr={t:curT,c:cat,a:Number(amt),d:date||rec.d,n:note};
        if(curT==='expense'){
          nr.f=curF;
          const sv=$('edit-src')?$('edit-src').value:'';
          if(srcCfg.enabled&&sv)nr.src=sv;
        }
        data[idx]=nr;save(data);
        toast('已更新');
        if(returnFn)returnFn();else{renderHome();renderStats();}
      }}
    ],{closeX:true});
    render();
  };
  // 统计页明细入口编辑：优先当前账本引用匹配；统计范围为多账本时降级字段匹配当前账本
  const openEditFromStats=rec=>{
    const ret=()=>{goPage('stats');renderStats();};
    const cur=load();
    if(cur.indexOf(rec)>=0){showEditModal(rec,cur,ret);return;}
    const fi=cur.findIndex(x=>x.t===rec.t&&x.c===rec.c&&x.a===rec.a&&x.d===rec.d&&(x.n||'')===(rec.n||''));
    if(fi>=0){showEditModal(cur[fi],cur,ret);return;}
    toast('该记录不在当前账本，请切换账本后编辑');
  };
  // v1.6.0：统计页明细删除（引用匹配，删除后回调刷新宿主弹窗）；多账本范围下找不到时提示
  const delRecordRefStats=(rec,after)=>{
    const data=load();
    const di=data.findIndex(r=>sameRecord(r,rec));
    if(di<0){toast('该记录不在当前账本，请切换账本后删除');return;}
    showModal('删除记录','确定要删除这条记录吗？',[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{
      data.splice(di,1);save(data);toast('已删除');
      renderHome();
      goPage('stats');renderStats(); // 统计页数据已变，重算（分类合计/明细列表都会刷新）
      if(after)after();
    }}]);
  };

  document.querySelectorAll('.type-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      selectedType=btn.dataset.type;selectedCat=(CATS[selectedType]&&CATS[selectedType][0]||{n:''}).n;
      document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active','income','expense'));
      btn.classList.add('active',selectedType);updateFfVisibility();
      if(selectedType==='expense'){selectedFf=catInfo(selectedType,selectedCat).f;updateFfToggle();}
      renderPills();
    });
  });

  $('save-btn').addEventListener('click',()=>{
    const amt=$('amount-input').value,date=$('date-input').value||today(),note=$('note-input').value.trim();
    if(!amt||isNaN(amt)||Number(amt)<=0){toast('请输入有效金额');return}
    if(!selectedCat){toast('请先添加分类');return}
    const newRec={t:selectedType,c:selectedCat,a:Number(amt),d:date,n:note};
    if(selectedType==='expense'){
      newRec.f=selectedFf;
      if(srcCfg.enabled){const sv=$('src-select').value;if(sv)newRec.src=sv;}
    }
    const data=load();data.unshift(newRec);save(data);$('amount-input').value='';$('note-input').value='';toast('已保存');renderHome();
  });

  const delRecord=idx=>{showModal('删除记录','确定要删除这条记录吗？',[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{const data=load();data.splice(idx,1);save(data);toast('已删除');renderHome();renderStats();}}]);};
  // 引用删除（首页按日期排序显示后 index 不可靠）
  const delRecordRef=rec=>{
    const data=load();const idx=data.findIndex(r=>sameRecord(r,rec));
    if(idx<0){toast('记录不存在');return;}
    showModal('删除记录','确定要删除这条记录吗？',[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{data.splice(idx,1);save(data);toast('已删除');renderHome();renderStats();}}]);
  };
  // 字段匹配（load() 重新 parse 后引用失效，批量删除用它兜底）
  const sameRecord=(a,b)=>!!(a&&b)&&a.t===b.t&&a.c===b.c&&a.a===b.a&&a.d===b.d&&(a.n||'')===(b.n||'')&&a.f===b.f&&(a.src||'')===(b.src||'');
  // v1.8.1 批量选择助手（签名 = sameRecord 的七字段，跨 load() 重 parse 稳定）
  const sigOf=r=>JSON.stringify([r.t,r.c,r.a,r.d,r.n||'',r.f,r.src||'']);
  const batchAdd=s=>batchSelected.set(s,(batchSelected.get(s)||0)+1);
  const batchSub=s=>{const n=(batchSelected.get(s)||0)-1;if(n>0)batchSelected.set(s,n);else batchSelected.delete(s);};
  // 真实待删条数（相同记录按勾选份数计，而非签名种类数）
  const batchCount=()=>{const used={};let n=0;load().forEach(r=>{const s=sigOf(r);const c=batchSelected.get(s)||0;if((used[s]||0)<c){used[s]=(used[s]||0)+1;n++;}});return n;};
  const batchInfo=()=>{$('batch-info').textContent=`已选 ${batchCount()} 条`;};
  // 勾选框状态：按签名消耗计数，相同记录只有前 N 条勾上（N=勾选份数）——渲染与点选后同步共用
  const batchCheckStates=arr=>{const used={};return arr.map(r=>{const s=sigOf(r);const c=batchSelected.get(s)||0;const k=used[s]||0;const on=k<c;used[s]=k+(on?1:0);return on;});};
  window._del=delRecord;

  $('batch-toggle').addEventListener('click',()=>{
    batchMode=!batchMode;batchSelected.clear();$('batch-bar').classList.toggle('show',batchMode);
    $('batch-toggle').textContent=batchMode?'取消':'批量删除';
    renderHome();
  });
  $('batch-all').addEventListener('click',()=>{
    batchSelected=new Map();                    // v1.8.1：全选 = 逐条累加签名计数
    load().forEach(r=>batchAdd(sigOf(r)));
    batchInfo();
    renderHome();
  });
  $('batch-none').addEventListener('click',()=>{batchSelected.clear();batchInfo();renderHome();});

  // 消费清单弹层：格式与"统计"页支出明细弹窗同步（日期 | 分类/备注 | 金额 三列表格，无大图标）
  // v1.8.0：参数化——不传区间=当前账本全部记录；传 start/end=只看该区间内（首页「加载更多」用当前记账区间）
  const showRecordsModal=(opts={})=>{
    const start=opts.start,end=opts.end;
    const data=load();
    const list=(start||end)?data.filter(r=>(!start||r.d>=start)&&(!end||r.d<=end)):data.slice();
    if(list.length===0){toast(opts.emptyText||'还没有记录');$('modal').classList.remove('show');return;}
    const sorted=list.slice().sort((a,b)=>b.d.localeCompare(a.d));
    let sumI=0,sumE=0;sorted.forEach(r=>{r.t==='income'?sumI+=r.a:sumE+=r.a;});
    const rows=sorted.map((r,i)=>{
      const amtColor=r.t==='income'?'var(--income)':'var(--expense)';
      const sign=r.t==='income'?'+':'-';
      return `<tr class="all-rec-row" data-i="${i}" style="cursor:pointer"><td style="padding:12px 0;border-bottom:1px solid var(--border);font-size:15px;white-space:nowrap">${escape(r.d)}</td><td style="padding:12px 0;border-bottom:1px solid var(--border);font-size:15px;color:var(--text-light)">${escape(r.c)}${r.src?` <span style="color:var(--text-light)">[${escape(r.src)}]</span>`:''}${r.n?` · ${escape(r.n)}`:''}</td><td style="padding:12px 0;border-bottom:1px solid var(--border);font-size:16px;font-weight:600;color:${amtColor};text-align:right;white-space:nowrap">${sign}${fmt(r.a)}</td><td style="padding:12px 0 12px 12px;border-bottom:1px solid var(--border);text-align:right"><button class="all-rec-del" data-i="${i}" style="border:none;background:none;color:var(--expense);font-size:18px;cursor:pointer;padding:2px 6px;line-height:1">×</button></td></tr>`;
    }).join('');
    const scopeTip=(start||end)?` · 区间 ${escape(start||'最早')} ~ ${escape(end||'最晚')}`:'';
    showModal(`${opts.label||'消费清单'}（${list.length}条）`,`<div style="max-height:60vh;overflow-y:auto"><div style="font-size:12px;color:var(--text-light);padding:0 0 8px">共 ${list.length} 条 · 收入 ${fmt(sumI)} · 支出 ${fmt(sumE)}${scopeTip}</div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:12px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">日期</th><th style="text-align:left;padding:12px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">分类/备注</th><th style="text-align:right;padding:12px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">金额</th><th style="width:36px"></th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:center;font-size:12px;color:var(--text-light);padding:8px 0 2px">点击任意一行可编辑该记录，× 为删除</div></div>`,[{label:'关闭',cls:'btn-outline'}]);
    // 编辑/删除后按同一参数重开清单（区间过滤保持）
    const reopen=()=>{renderHome();renderStats();showRecordsModal(opts);};
    // 行点击 → 编辑（先关弹窗，编辑完原清单重开）
    document.querySelectorAll('.all-rec-row').forEach(tr=>{
      tr.addEventListener('click',e=>{
        if(e.target.closest('.all-rec-del'))return;
        const i=parseInt(tr.dataset.i);
        const rec=sorted[i];
        $('modal').classList.remove('show');
        showEditModal(rec,data,reopen,{keepOpen:true});
      });
    });
    // 行内 × → 删除（确认后刷新清单）
    document.querySelectorAll('.all-rec-del').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const rec=sorted[parseInt(btn.dataset.i)];
        if(!rec)return;
        showModal('删除记录','确定要删除这条记录吗？',[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',close:false,action:()=>{const d=load();const di=d.findIndex(x=>sameRecord(x,rec));if(di<0){toast('该记录已不存在');reopen();return;}d.splice(di,1);save(d);toast('已删除');reopen();}}]);
      });
    });
  };
  // 点击"最近记录"标题 → 查看当前账本全部记录（不按记账区间过滤）
  $('recent-title').addEventListener('click',()=>showRecordsModal({}));
  // v1.8.0 首页「加载更多」：最近记录卡片只展示最近 4 笔，点此展开当前记账区间内的全部明细
  $('recent-more').addEventListener('click',()=>{
    const rng=loadRange();
    showRecordsModal({start:rng.start,end:rng.end,label:'当前区间明细',emptyText:'当前记账区间内还没有记录'});
  });
  $('batch-cancel').addEventListener('click',()=>{batchMode=false;batchSelected.clear();$('batch-bar').classList.remove('show');$('batch-toggle').textContent='批量删除';renderHome();});
  $('batch-delete-btn').addEventListener('click',()=>{
    const n=batchCount();
    if(!n){toast('请先选择要删除的记录');return}
    showModal('批量删除',`确定要删除选中的 ${n} 条记录吗？`,[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{
      // v1.8.1：按签名消耗计数精确删除（勾 1 条相同记录就只删 1 条）
      const data=load(),used={};
      const keep=data.filter(r=>{const s=sigOf(r);const c=batchSelected.get(s)||0;if((used[s]||0)<c){used[s]=(used[s]||0)+1;return false;}return true;});
      save(keep);batchMode=false;batchSelected.clear();$('batch-bar').classList.remove('show');$('batch-toggle').textContent='批量删除';toast('已删除');renderHome();renderStats();
    }}]);
  });

  const renderHome=()=>{
    const data=load();const recent=$('recent-records');
    if(data.length===0){recent.innerHTML=`<div class="empty-state"><svg class="empty-illust" viewBox="0 0 120 120"><rect x="20" y="15" width="80" height="90" rx="10" fill="#F5F0E8" stroke="#D3D1C7" stroke-width="2"/><rect x="32" y="30" width="40" height="5" rx="2.5" fill="#D3D1C7"/><rect x="32" y="42" width="55" height="5" rx="2.5" fill="#D3D1C7"/><rect x="32" y="54" width="30" height="5" rx="2.5" fill="#D3D1C7"/><rect x="32" y="66" width="45" height="5" rx="2.5" fill="#D3D1C7"/><circle cx="85" cy="85" r="16" fill="#E1F5EE"/><path d="M78 85l5 5 10-10" stroke="#5DB89F" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><p>还没有记录<br>记一笔吧 ✏️</p></div>`;}
    else{
      // 按日期倒序显示（设置的时间顺序，非插入/修改顺序）；v1.7.0 只显示 4 笔（批量模式显示全部）
      const disp=data.slice().sort((a,b)=>b.d.localeCompare(a.d));
      const top=batchMode?disp:disp.slice(0,4);
      const checkStates=batchMode?batchCheckStates(top):[];   // v1.8.1：按签名消耗计数决定勾选态
      recent.innerHTML=top.map((r,i)=>{
        const ci=catInfo(r.t,r.c);const iconBg=r.t==='income'?'rgba(93,184,159,0.12)':'rgba(255,143,163,0.12)';
        const checked=checkStates[i]?'checked':'';
        const ffLabel=r.t==='expense'?(r.f===1?'<span style="font-size:10px;color:var(--fixed);margin-left:4px">固</span>':'<span style="font-size:10px;color:var(--flexible);margin-left:4px">弹</span>'):'';
        return `<div class="record-item" data-i="${i}">${batchMode?`<input type="checkbox" class="record-check" data-i="${i}" ${checked}>`:''}<div class="record-icon" style="background:linear-gradient(135deg,${ci.c},${ci.c}DD)">${iconSvg(ci.p,'#fff')}</div><div class="record-info"><div class="record-cat">${escape(r.c)}${ffLabel}</div><div class="record-note">${recordNote(r)}</div></div><div class="record-amount ${r.t}">${r.t==='income'?'+':'-'}${fmt(r.a)}</div>${batchMode?'':`<div class="record-del"><svg width="16" height="16" viewBox="0 0 24 24" fill="#FF8FA3"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>`}</div>`;
      }).join('');
      // 点击记录 → 编辑弹窗（排除删除按钮/批量勾选框）
      recent.querySelectorAll('.record-item').forEach((el,i)=>{
        el.addEventListener('click',e=>{
          if(e.target.closest('.record-del')||e.target.closest('.record-check'))return;
          const r=top[i];
          if(!r)return;
          showEditModal(r,data,()=>{goPage('home');renderHome();});
        });
      });
      // 删除按钮 → 引用定位删除（显示已按日期排序，index 不可靠）
      recent.querySelectorAll('.record-del').forEach((btn,i)=>{
        btn.addEventListener('click',e=>{e.stopPropagation();delRecordRef(top[i]);});
      });
      // 批量勾选 → 只改签名计数，然后把同签名的兄弟勾选框一起同步（不整表重渲染，保住滚动位置）
      if(batchMode){document.querySelectorAll('.record-check').forEach(cb=>{cb.addEventListener('change',e=>{const r=top[parseInt(e.target.dataset.i)];if(!r)return;const s=sigOf(r);e.target.checked?batchAdd(s):batchSub(s);const st=batchCheckStates(top);document.querySelectorAll('#recent-records .record-check').forEach(x=>{x.checked=!!st[parseInt(x.dataset.i)];});batchInfo();});});}
    }
    // v1.8.0：「加载更多」只在非批量模式且有记录时出现（批量模式列表本就展示全部）
    const moreBtn=$('recent-more');if(moreBtn)moreBtn.classList.toggle('show',!batchMode&&data.length>0);
    const rng=loadRange();const mdata=data.filter(r=>r.d>=rng.start&&r.d<=rng.end);let inc=0,exp=0;
    mdata.forEach(r=>{r.t==='income'?inc+=r.a:exp+=r.a});
    $('sum-income').textContent=fmtInt(inc);$('sum-expense').textContent=fmtInt(exp);$('sum-balance').textContent=fmtInt(inc-exp);
    const piggy=$('piggy-msg');
    if(inc-exp>0)piggy.innerHTML=`🐷 本月已存 <strong>${fmtInt(inc-exp)}</strong>，继续加油！`;
    else if(inc===0&&exp===0)piggy.textContent='本月还没有记录哦~';
    else piggy.innerHTML=`🐷 本月超支 <strong>${fmtInt(Math.abs(inc-exp))}</strong>，注意节约~`;
    renderDayCalendar(); // v1.8.0：记录有变（增删改/切账本）时，按天查询日历同步（收起态直接跳过）
  };

  const renderStats=()=>{
    renderStatsScope();
    const data=getStatsData(),range=loadRange();const mdata=data.filter(r=>r.d>=range.start&&r.d<=range.end);
    $('stats-range-label').textContent=`${range.start} ~ ${range.end}`;
    const breakdown=$('expense-breakdown');const expenses=mdata.filter(r=>r.t==='expense');
    if(expenses.length===0){breakdown.innerHTML=`<div class="empty-state"><svg class="empty-illust" viewBox="0 0 120 120"><circle cx="60" cy="55" r="30" fill="none" stroke="#D3D1C7" stroke-width="2"/><path d="M82 77l18 18" stroke="#D3D1C7" stroke-width="3" stroke-linecap="round"/><rect x="35" y="92" width="50" height="6" rx="3" fill="#F5F0E8"/><rect x="45" y="102" width="30" height="4" rx="2" fill="#F5F0E8"/></svg><p>区间内暂无支出记录<br>换个时间范围试试 🔍</p></div>`;}
    else{
      const cats={},catRecords={};expenses.forEach(r=>{cats[r.c]=(cats[r.c]||0)+r.a;if(!catRecords[r.c])catRecords[r.c]=[];catRecords[r.c].push(r);});
      const total=Object.values(cats).reduce((a,b)=>a+b,0);const sorted=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
      breakdown.innerHTML=sorted.map(([name,amt])=>{const ci=catInfo('expense',name),pct=(amt/total*100).toFixed(1);return `<div class="breakdown-item" data-cat="${escape(name)}" style="margin-bottom:12px;cursor:pointer"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${iconBox(ci.p,ci.c)} ${escape(name)}</span><span style="font-weight:600">${fmt(amt)} (${pct}%)</span></div><div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${ci.c};border-radius:4px;transition:width .5s"></div></div></div>`;}).join('');
      breakdown.querySelectorAll('.breakdown-item').forEach(item=>{item.addEventListener('click',()=>{
        const catRecordsList=catRecords[item.dataset.cat]||[];
        const openDetail=()=>{
          // v1.6.0：删除后重开时按当前存储过滤，闭包旧数据不残留（记录对象在 splice 后引用仍在，用存储比对排除）
          const alive=catRecordsList.filter(r=>load().some(x=>x===r||sameRecord(x,r)));
          const records=alive.map((r,i)=>`<tr class="stat-detail-row" data-i="${i}" style="cursor:pointer"><td style="padding:9px 0;border-bottom:1px solid var(--border);font-size:15px">${escape(r.d)}</td><td style="padding:9px 0;border-bottom:1px solid var(--border);font-size:15px;color:var(--text-light)">${escape(r.n||'—')}</td><td style="padding:9px 0;border-bottom:1px solid var(--border);font-size:15px;font-weight:600;color:var(--expense);text-align:right;white-space:nowrap">${fmt(r.a)} <button class="stat-del-btn" data-i="${i}" style="margin-left:6px;border:none;background:var(--expense);color:#fff;font-size:11px;border-radius:10px;padding:2px 8px;cursor:pointer;vertical-align:middle">删</button></td></tr>`).join('');
          showModal(`${escape(item.dataset.cat)} 支出明细`,`<div style="max-height:300px;overflow-y:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:9px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">日期</th><th style="text-align:left;padding:9px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">备注</th><th style="text-align:right;padding:9px 0;font-size:13px;color:var(--text-light);border-bottom:2px solid var(--border)">金额</th></tr></thead><tbody>${records}</tbody></table><div style="text-align:center;font-size:12px;color:var(--text-light);padding:8px 0 2px">点击任意一行可编辑该记录；点「删」删除</div></div>`,[{label:'关闭',cls:'btn-outline'}]);
          const bindRows=()=>{
            document.querySelectorAll('.stat-detail-row').forEach(tr=>{
              tr.addEventListener('click',e=>{
                if(e.target.closest('.stat-del-btn'))return; // 删按钮走自己的逻辑
                const rec=alive[parseInt(tr.dataset.i)];
                $('modal').classList.remove('show');
                openEditFromStats(rec);
              });
            });
            document.querySelectorAll('.stat-del-btn').forEach(btn=>{
              btn.addEventListener('click',e=>{
                e.stopPropagation();
                const rec=alive[parseInt(btn.dataset.i)];
                delRecordRefStats(rec,()=>{openDetail();}); // 删除后重开本弹窗刷新列表
              });
            });
          };
          setTimeout(bindRows,50);
        };
        openDetail();
      });});
    }
    const vf=$('fixed-vs-flexible');let fixed=0,flex=0;expenses.forEach(r=>{r.f===1?fixed+=r.a:flex+=r.a});
    const totalF=fixed+flex||1;
    vf.innerHTML=`<div style="display:flex;gap:12px;margin-bottom:12px"><div style="flex:1;text-align:center;padding:12px;background:rgba(126,207,182,0.1);border-radius:12px"><div style="font-size:12px;color:var(--text-light)">固定支出</div><div style="font-size:18px;font-weight:700;color:var(--fixed)">${fmtInt(fixed)}</div></div><div style="flex:1;text-align:center;padding:12px;background:rgba(255,182,193,0.1);border-radius:12px"><div style="font-size:12px;color:var(--text-light)">弹性支出</div><div style="font-size:18px;font-weight:700;color:var(--flexible)">${fmtInt(flex)}</div></div></div><div style="height:10px;background:var(--bg);border-radius:5px;overflow:hidden;display:flex"><div style="height:100%;width:${(fixed/totalF*100).toFixed(1)}%;background:var(--fixed)"></div><div style="height:100%;width:${(flex/totalF*100).toFixed(1)}%;background:var(--flexible)"></div></div>`;
  };

  $('search-btn').addEventListener('click',()=>{
    const amtK=$('search-amount').value.trim(),noteK=$('search-note').value.trim();
    // v1.7.0：从同一次 parse 中过滤（编辑弹窗需要全量数组的引用做 indexOf/splice）
    const all=load();
    const data=all.filter(r=>{const mA=!amtK||String(r.a).includes(amtK);const mN=!noteK||(r.n||'').toLowerCase().includes(noteK.toLowerCase());return mA&&mN;});
    const box=$('search-results');
    if(data.length===0){box.innerHTML=`<div class="empty-state"><svg class="empty-illust" viewBox="0 0 120 120"><circle cx="50" cy="50" r="28" fill="#F5F0E8" stroke="#D3D1C7" stroke-width="2"/><path d="M71 71l16 16" stroke="#D3D1C7" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="14" fill="none" stroke="#D3D1C7" stroke-width="1.5"/><path d="M44 50h12M50 44v12" stroke="#D3D1C7" stroke-width="1.5" stroke-linecap="round"/></svg><p>没有找到匹配的记录<br>换个关键词试试</p></div>`;return;}
    let tI=0,tE=0;data.forEach(r=>{r.t==='income'?tI+=r.a:tE+=r.a;});
    box.innerHTML=`<div class="search-summary">共 ${data.length} 条 · 收入 ${fmtInt(tI)} · 支出 ${fmtInt(tE)}<span style="margin-left:8px;font-size:12px">点击条目可查看 / 编辑</span></div>`+data.map((r,i)=>{const ci=catInfo(r.t,r.c);return `<div class="record-item" data-i="${i}" style="cursor:pointer"><div class="record-icon" style="background:linear-gradient(135deg,${ci.c},${ci.c}DD)">${iconSvg(ci.p,'#fff')}</div><div class="record-info"><div class="record-cat">${escape(r.c)}</div><div class="record-note">${recordNote(r)}</div></div><div class="record-amount ${r.t}">${r.t==='income'?'+':'-'}${fmt(r.a)}</div></div>`;}).join('');
    // 点击条目 → 编辑弹窗；编辑/删除后重跑查询刷新列表
    box.querySelectorAll('.record-item').forEach(el=>{
      el.addEventListener('click',()=>{
        const rec=data[parseInt(el.dataset.i)];
        if(!rec)return;
        showEditModal(rec,all,()=>{renderHome();renderStats();$('search-btn').click();});
      });
    });
  });

  // ========== v1.8.0 按天查询（日历网格） ==========
  // 规则（09-14 定稿）：按记账区间渲染；区间可为整月 / 非整月 / 多月 → **按月分块**，
  //   每月一块日历、各自对星期对齐（连续铺格会在月交界处把星期错位，日历就假了），
  //   跨月时每块前显示「YYYY年M月」，单月不显示（区间说明里已有日期）。
  //   格内只有「日号 + 当日金额」：有支出粉色显示支出合计、只有收入绿色带 +、无记录灰显不可点；今天绿框。
  //   金额不带货币符号、保留两位小数，装不下自动缩字号（≤5 字符 11px / 6~7 字符 10px / 8+ 字符 9px）。
  let dayCalOpen=false;
  const dayAmtCls=s=>s.length<=5?'':(s.length<=7?'s6':'s7');
  const dayAmt=v=>{
    const n=Math.round(v*100)/100;let t=n.toFixed(2);
    if(t.length>8)t=(n/10000).toFixed(1)+'万'; // 极端大额才用万，避免撑爆 40px 格子
    return t;
  };
  const dayCells=(y,m,map,rng,tdy)=>{
    const lead=(new Date(y,m-1,1).getDay()+6)%7; // 周一=第 0 列
    const days=new Date(y,m,0).getDate();
    let h='';for(let i=0;i<lead;i++)h+='<div></div>';
    for(let d=1;d<=days;d++){
      const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      if(ds<rng.start||ds>rng.end){h+='<div></div>';continue;} // 区间外的日子留空，只显示区间内
      const st=map[ds],num=`<div class="dc-day">${d}</div>`,isToday=ds===tdy?' today':'';
      if(!st){h+=`<div class="day-cell empty${isToday}">${num}<div class="dc-amt">—</div></div>`;continue;}
      const isInc=st.exp===0&&st.inc>0;
      const txt=(isInc?'+':'')+dayAmt(isInc?st.inc:st.exp);
      h+=`<div class="day-cell${isInc?' income':''}${isToday}" data-day="${ds}">${num}<div class="dc-amt ${dayAmtCls(txt)}">${txt}</div></div>`;
    }
    return h;
  };
  const renderDayCalendar=()=>{
    const cal=$('day-calendar'),btn=$('day-toggle'),box=$('day-months');
    if(!cal||!btn||!box)return;
    btn.textContent=dayCalOpen?'收起':'展开';
    cal.style.display=dayCalOpen?'block':'none';
    if(!dayCalOpen)return; // 收起时不重建，展开那一刻按最新数据现算（顺手避免无谓重绘）
    const rng=loadRange(),tdy=today(),map={};
    load().forEach(r=>{if(r.d<rng.start||r.d>rng.end)return;const m=map[r.d]||(map[r.d]={exp:0,inc:0});r.t==='income'?m.inc+=r.a:m.exp+=r.a;});
    $('day-range-label').textContent=`记账区间 ${rng.start} ~ ${rng.end} · ${Object.keys(map).length} 天有记录`;
    const ms=[];let y=+rng.start.slice(0,4),m=+rng.start.slice(5,7);
    const ey=+rng.end.slice(0,4),em=+rng.end.slice(5,7);
    while(y<ey||(y===ey&&m<=em)){ms.push([y,m]);m++;if(m>12){m=1;y++;}}
    const multi=ms.length>1;
    box.innerHTML=ms.map(([yy,mm])=>`${multi?`<div class="day-month">${yy}年${mm}月</div>`:''}<div class="day-grid">${dayCells(yy,mm,map,rng,tdy)}</div>`).join('');
    // 点某天 → 当天明细（复用消费清单弹层，区间=当天）
    box.querySelectorAll('.day-cell[data-day]').forEach(el=>{
      el.addEventListener('click',()=>{
        const ds=el.dataset.day;
        showRecordsModal({start:ds,end:ds,label:`${ds} 明细`,emptyText:'这一天没有记录'});
      });
    });
  };
  $('day-toggle').addEventListener('click',()=>{dayCalOpen=!dayCalOpen;renderDayCalendar();});

  // 导出：优先用 Capacitor Filesystem 写到 Documents 目录，弹层显示完整路径；浏览器 fallback
  // 修复乱码：文本必须带 encoding:'utf8'；opts.base64=true 时 content 已是 base64（xlsx），按二进制写入
  const exportFile=async(filename,content,mime,opts={})=>{
    const FS=window.Capacitor?.Plugins?.Filesystem;
    if(FS){
      try{
        const wOpt={path:filename,data:content,directory:'DOCUMENTS',recursive:true};
        if(!opts.base64)wOpt.encoding='utf8';
        const r=await FS.writeFile(wOpt);
        const showPath=r.uri||`/Documents/${filename}`;
        showModal('导出成功',`<div style="font-size:14px;line-height:1.6">文件已保存：<br><strong>${escape(filename)}</strong><br><br>完整路径：<br><code style="font-size:11px;word-break:break-all;background:var(--bg);padding:6px;border-radius:6px;display:block">${escape(showPath)}</code><br><span style="color:var(--text-light);font-size:12px">可在文件管理 / Documents 目录查看</span></div>`,[{label:'关闭',cls:'btn-outline'}]);
        return;
      }catch(e){toast('保存失败：'+e.message);return;}
    }
    const bytes=opts.base64?Uint8Array.from(atob(content),c=>c.charCodeAt(0)):content;
    const blob=new Blob([bytes],{type:mime});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('已下载到浏览器默认目录');
  };
  // 防 CSV 公式注入（=+-@ 行首加 '）+ 双引号转义
  const escCsv=s=>{s=String(s==null?'':s);if(/^[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};

  // v1.8.2：导出前先选「导出区间」——全部记录 / 当前记账区间（复用设置页区间）/ 自定义起止
  const showExportModal=fmt=>{
    const cur=loadRange();
    const rowStyle='display:flex;align-items:center;gap:10px;padding:11px 2px;border-bottom:1px solid var(--border);font-size:14px';
    showModal('选择导出区间',`
      <label style="${rowStyle}"><input type="radio" name="exp-range" value="all" checked>全部记录</label>
      <label style="${rowStyle}"><input type="radio" name="exp-range" value="cur">当前记账区间<span style="color:var(--text-light);font-size:12px">${cur.start} ~ ${cur.end}</span></label>
      <label style="display:flex;align-items:center;gap:10px;padding:11px 2px;font-size:14px"><input type="radio" name="exp-range" value="custom">自定义区间</label>
      <div id="exp-custom-box" style="display:none;align-items:center;gap:8px;padding:2px 2px 6px"><input type="date" id="exp-start" value="${cur.start}" style="flex:1"><span style="font-size:13px">至</span><input type="date" id="exp-end" value="${cur.end}" style="flex:1"></div>`,
      [{label:'取消',cls:'btn-outline'},{label:'导出',cls:'btn-primary',action:()=>doRangeExport(fmt),close:false}]);
    document.querySelectorAll('input[name="exp-range"]').forEach(r=>r.addEventListener('change',()=>{
      $('exp-custom-box').style.display=document.querySelector('input[name="exp-range"]:checked').value==='custom'?'flex':'none';
    }));
  };
  // 校验失败 toast 后弹层保持打开（close:false），用户可改完再导；成功才关弹层落盘
  const doRangeExport=async fmt=>{
    const sel=document.querySelector('input[name="exp-range"]:checked');
    const mode=sel?sel.value:'all';
    const data=load();let start='',end='',rows=data;
    if(mode!=='all'){
      if(mode==='cur'){const r=loadRange();start=r.start;end=r.end;}
      else{start=$('exp-start').value;end=$('exp-end').value;}
      if(!start||!end){toast('请先选择自定义区间的起止日期');return;}
      if(start>end){toast('区间开始日期不能晚于结束日期');return;}
      rows=data.filter(r=>r.d>=start&&r.d<=end);
      if(!rows.length){toast('该区间内暂无记录');return;}
    }else if(!data.length){toast('暂无数据');return;}
    $('modal').classList.remove('show');
    const fname=(start?`ledger_${start}_至_${end}`:`ledger_${today()}`)+'.'+fmt;
    if(fmt==='csv'){
      const out=['类型,分类,金额,日期,备注,来源'];
      rows.forEach(r=>out.push([escCsv(r.t),escCsv(r.c),r.a,escCsv(r.d),escCsv(r.n||''),escCsv(r.src||'')].join(',')));
      await exportFile(fname,'\uFEFF'+out.join('\n'),'text/csv;charset=utf-8');
    }else{
      await exportFile(fname,JSON.stringify(rows,null,2),'application/json');
    }
  };
  $('export-btn').addEventListener('click',()=>showExportModal('json'));
  $('export-csv-btn').addEventListener('click',()=>showExportModal('csv'));
  $('backup-btn').addEventListener('click',async()=>{
    const data=load();
    if(!data.length){toast('暂无数据');return}
    // 备份 = 全账本快照（所有账本的记录 + 账本列表 + 默认账本）
    const snap={version:'1.2.4',exportedAt:new Date().toISOString(),ledgers:LEDGERS.slice(),defaultLedger:loadDefaultLedger(),records:{}};
    LEDGERS.forEach(l=>{let d=[];try{d=JSON.parse(localStorage.getItem(SK+'_'+l))||[]}catch(e){d=[]}if(d.length)snap.records[l]=d;});
    await exportFile(`ledger_backup_${today()}.json`,JSON.stringify(snap,null,2),'application/json');
  });
  $('import-btn').addEventListener('click',()=>$('file-input').click());
  // M3: 记录 schema 校验（t∈{income,expense} && a 为数字 && d 为合法日期）
  const validateRecords=arr=>Array.isArray(arr)&&arr.every(r=>r&&(r.t==='income'||r.t==='expense')&&typeof r.a==='number'&&typeof r.d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.d));
  // ---- 多格式导入：CSV / XLSX 统一转记录数组 ----
  const HEADER_ALIASES={
    t:['类型','收支类型','收入/支出','type'],
    c:['分类','类别','category','cat'],
    a:['金额','消费金额','支出金额','收入金额','交易金额','amount'],
    d:['日期','消费日期','交易日期','记账日期','交易时间','消费时间','date'],
    n:['备注','摘要','商户','商户名称','商户名','交易对方','对方户名','交易描述','说明','note','description','desc'],
    src:['来源','支付方式','付款方式','src'],
    f:['支出属性','固定属性','收支属性','f','fixed']
  };
  const fmtDateLocal=dt=>`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  // 统一把 CSV / XLSX 的二维数组（首行为表头）转成记录数组
  const rowsToRecords=rows=>{
    if(!rows||rows.length<2)throw new Error('文件中没有数据行');
    const header=(rows[0]||[]).map(h=>String(h==null?'':h).trim());
    const col={};
    Object.keys(HEADER_ALIASES).forEach(k=>{col[k]=header.findIndex(h=>HEADER_ALIASES[k].includes(h));});
    if(col.a<0&&col.d<0){throw new Error('未找到「金额/日期」列');}
    const recs=[];let skipT=0,skipBad=0;
    for(let i=1;i<rows.length;i++){
      const row=rows[i];
      if(!row||row.every(c=>c==null||String(c).trim()===''))continue;
      const get=k=>{
        const idx=col[k];if(idx<0)return '';
        const v=row[idx];if(v==null||v==='')return '';
        if(v instanceof Date)return fmtDateLocal(v);
        if(typeof v==='number'&&k==='d')return fmtDateLocal(new Date(Math.round((v-25569)*86400*1000)));
        return String(v).trim();
      };
      const rawA=get('a').replace(/[¥￥,，\s]/g,'');
      const a=parseFloat(rawA);
      if(isNaN(a)){skipBad++;continue;}
      const dsRaw=get('d').replace(/[/.]/g,'-').trim();
      const dm=dsRaw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)||dsRaw.match(/^(\d{1,2})-(\d{1,2})/);
      if(!dm){skipBad++;continue;}
      // 支持「7-29」这类无年份的月-日格式，自动补当前年份
      const ds=dm[1].length===4?`${dm[1]}-${String(+dm[2]).padStart(2,'0')}-${String(+dm[3]).padStart(2,'0')}`:`${new Date().getFullYear()}-${String(+dm[1]).padStart(2,'0')}-${String(+dm[2]).padStart(2,'0')}`;
      let t='expense';
      const rawT=get('t');
      if(rawT){if(/收|income|\+/.test(rawT))t='income';else if(/支|付|expense|-/.test(rawT))t='expense';else skipT++;}
      const absA=Math.round(Math.abs(a)*100)/100; // v1.8.1：入库前取整到分，修 XLSX 浮点尾差（19.990000000000002）污染搜索与日历
      if(a<0)t='expense';
      const rec={t:t,c:get('c')||'其他',a:absA,d:ds,n:get('n'),src:get('src')};
      // 支出属性（固定/弹性）：文件有「支出属性」列则用该列；为空或无该列 → 默认与分类属性同步
      const rawF=get('f');
      if(rawF){rec.f=/固|fixed|1|是|true/i.test(rawF)?1:0;}
      else{rec.f=catInfo(t,rec.c).f!==undefined?catInfo(t,rec.c).f:0;}
      if(!rec.n)delete rec.n;
      if(!rec.src)delete rec.src;
      recs.push(rec);
    }
    if(recs.length===0)throw new Error('未识别到有效记录：请检查表头是否包含「金额」「日期」列（支持：金额/消费金额/交易金额，日期/消费日期/交易日期/交易时间）');
    let msg=`<span style="color:var(--text-light);font-size:12px">`;
    if(skipT>0)msg+=`${skipT} 行类型未识别，已按支出处理；`;
    if(skipBad>0)msg+=`${skipBad} 行金额/日期无效，已跳过；`;
    msg+='</span>';
    return {recs,msg};
  };
  // CSV 解析（支持引号转义与 BOM）
  const parseCSV=text=>{
    text=text.replace(/^\uFEFF/,'');
    const rows=[];let row=[],cur='',inQ=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(inQ){
        if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else inQ=false;}
        else cur+=ch;
      }else{
        if(ch==='"')inQ=true;
        else if(ch===','){row.push(cur);cur='';}
        else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);cur='';rows.push(row);row=[];}
        else cur+=ch;
      }
    }
    if(cur!==''||row.length){row.push(cur);rows.push(row);}
    return rows;
  };
  // 统一确认导入（追加到当前账本，不覆盖）
  const confirmImport=(recs,extraMsg='')=>{
    if(!validateRecords(recs)){toast('文件格式错误：记录字段无效');return;}
    const exist=load().length;
    showModal('确认导入',`将追加 ${recs.length} 条记录到当前账本（现有 ${exist} 条，导入后共 ${exist+recs.length} 条，不会覆盖原数据）。${extraMsg}`,[{label:'取消',cls:'btn-outline'},{label:'确认',cls:'btn-primary',action:()=>{try{const merged=load().concat(recs);clearCorruptGuard();save(merged);toast('导入成功');renderHome();renderStats();goPage('home');}catch(err){toast('导入失败：'+err.message)}}}]);
  };
  $('file-input').addEventListener('change',e=>{
    const f=e.target.files[0];if(!f)return;
    const ext=(f.name.split('.').pop()||'').toLowerCase();
    const fr=new FileReader();
    if(ext==='csv'||ext==='xlsx'||ext==='xls'){
      fr.onload=ev=>{
        try{
          let rows;
          if(ext==='csv')rows=parseCSV(ev.target.result);
          else{
            const wb=XLSX.read(new Uint8Array(ev.target.result),{type:'array',cellDates:true});
            const ws=wb.Sheets[wb.SheetNames[0]];
            rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
          }
          const {recs,msg}=rowsToRecords(rows);
          confirmImport(recs,msg);
        }catch(err){toast('文件格式错误：'+(err.message||''));}
      };
      if(ext==='csv')fr.readAsText(f);else fr.readAsArrayBuffer(f);
      e.target.value='';return;
    }
    fr.onload=ev=>{try{const data=JSON.parse(ev.target.result);if(!data)throw new Error();
    if(Array.isArray(data)){
      if(!validateRecords(data)){toast('文件格式错误：记录字段无效');return;}
      const exist=load().length;
      showModal('确认导入',`将追加 ${data.length} 条记录到当前账本（现有 ${exist} 条，导入后共 ${exist+data.length} 条，不会覆盖原数据）。`,[{label:'取消',cls:'btn-outline'},{label:'确认',cls:'btn-primary',action:()=>{try{const merged=load().concat(data);clearCorruptGuard();save(merged);toast('导入成功');renderHome();renderStats();goPage('home');}catch(err){toast('导入失败：'+err.message)}}}]);
    }else if(data.records&&Array.isArray(data.ledgers)){
      if(!data.ledgers.every(l=>typeof l==='string'&&l)){toast('备份文件格式错误：账本名无效');return;}
      const badLedger=Object.keys(data.records).find(l=>!validateRecords(data.records[l]));
      if(badLedger){toast('备份文件格式错误：账本「'+badLedger+'」记录无效');return;}
      const total=Object.values(data.records).reduce((a,arr)=>a+(Array.isArray(arr)?arr.length:0),0);
      showModal('恢复备份',`将恢复 ${data.ledgers.length} 个账本、共 ${total} 条记录，覆盖现有数据。`,[{label:'取消',cls:'btn-outline'},{label:'确认',cls:'btn-primary',action:()=>{
        // M3: 事务化——先备份现有，失败回滚
        const oldLedgers=LEDGERS.slice(),oldDef=loadDefaultLedger(),oldRecords={};
        LEDGERS.forEach(l=>{oldRecords[l]=localStorage.getItem(SK+'_'+l);});
        try{
          LEDGERS=data.ledgers.filter(l=>l);saveLedgers(LEDGERS);
          if(data.defaultLedger&&LEDGERS.includes(data.defaultLedger))saveDefaultLedger(data.defaultLedger);
          LEDGERS.forEach(l=>{const d=data.records[l];if(Array.isArray(d))localStorage.setItem(SK+'_'+l,JSON.stringify(d));});
          currentLedger=loadDefaultLedger();
          CATS=loadCats();srcCfg=loadSources(); // M3: 恢复后刷新分类/来源配置
          renderLedgerSelect();renderLedgerManage();renderHome();renderStats();goPage('home');toast('恢复成功');
        }catch(err){
          LEDGERS=oldLedgers;saveLedgers(oldLedgers);saveDefaultLedger(oldDef);
          Object.keys(oldRecords).forEach(k=>{if(oldRecords[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,oldRecords[k]);});
          currentLedger=loadDefaultLedger();
          renderLedgerSelect();renderLedgerManage();renderHome();renderStats();
          toast('恢复失败，已回滚：'+err.message);
        }
      }}]);
    }else{throw new Error();}
    }catch(err){toast('文件格式错误');}};fr.readAsText(f);e.target.value='';
  });
  // 示范文件导出（JSON / CSV / XLSX）
  const sampleRecords=()=>{const t=today();return demo.map(r=>{const d=new Date(t);d.setDate(d.getDate()-r.d);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return{t:r.t,c:r.c,a:r.a,n:r.n,d:ds,f:r.f!==undefined?r.f:0};});};
  $('sample-export-btn').addEventListener('click',()=>{
    showModal('导出示范文件','选择格式（15 条示例收支记录，导出的文件可直接用于测试导入）：',[
      {label:'JSON',cls:'btn-outline',action:()=>{exportFile(`ledger_sample.json`,JSON.stringify(sampleRecords(),null,2),'application/json');}},
      {label:'CSV',cls:'btn-outline',action:()=>{const data=sampleRecords();const rows=['类型,分类,金额,日期,备注,来源'];data.forEach(r=>rows.push([escCsv(r.t==='income'?'收入':'支出'),escCsv(r.c),r.a,escCsv(r.d),escCsv(r.n),escCsv('')].join(',')));exportFile(`ledger_sample.csv`,'\uFEFF'+rows.join('\n'),'text/csv;charset=utf-8');}},
      {label:'XLSX',cls:'btn-outline',action:()=>{const data=sampleRecords();const ws=XLSX.utils.json_to_sheet(data.map(r=>({类型:r.t==='income'?'收入':'支出',分类:r.c,金额:r.a,日期:r.d,备注:r.n,来源:''})));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'示例');exportFile(`ledger_sample.xlsx`,XLSX.write(wb,{type:'base64',bookType:'xlsx'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',{base64:true});}}
    ]);
  });

  $('demo-btn').addEventListener('click',()=>{if(isDemo()||load().length>0){showModal('加载示例','这将覆盖现有数据，确定吗？',[{label:'取消',cls:'btn-outline'},{label:'确定',cls:'btn-primary',action:()=>loadDemo()}]);}else loadDemo();});
  // v1.8.1：save 会 throw（损坏保护 / 配额满）→ 这里必须自己接住。否则 init() 里自动加载示例时抛异常
  //         会中断 init 后续的 goPage('add') → 直接白屏（P0-1 的连带风险）
  const loadDemo=()=>{const t=today();const recs=demo.map(r=>{const d=new Date(t);d.setDate(d.getDate()-r.d);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return{t:r.t,c:r.c,a:r.a,n:r.n+'（示例）',d:ds,f:r.f!==undefined?r.f:0};});try{save(recs);}catch(e){return;}setDemo(true);toast('已加载');renderHome();goPage('home');};
  // v1.7.0：清空数据支持日期区间——弹窗选区间，实时预览删除条数，二次确认后只删区间内记录
  $('clear-btn').addEventListener('click',()=>{
    const data=load();
    if(!data.length){toast('暂无数据');return;}
    const dates=data.map(r=>r.d).filter(Boolean).sort();
    const minD=dates[0]||today();
    const maxD=dates[dates.length-1]>today()?dates[dates.length-1]:today();
    const inpStyle='width:100%;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--bg);color:var(--text);outline:none;box-sizing:border-box';
    const body=`<div>
      <div style="margin-bottom:10px"><label style="display:block;font-size:12px;color:var(--text-light);margin-bottom:4px">开始日期</label><input type="date" id="clear-start" value="${minD}" style="${inpStyle}"></div>
      <div style="margin-bottom:10px"><label style="display:block;font-size:12px;color:var(--text-light);margin-bottom:4px">结束日期</label><input type="date" id="clear-end" value="${maxD}" style="${inpStyle}"></div>
      <div id="clear-preview" style="font-size:13px;color:var(--text-light);line-height:1.6"></div>
    </div>`;
    const inRange=r=>{const s=$('clear-start').value,e=$('clear-end').value;return (!s||r.d>=s)&&(!e||r.d<=e);};
    const upd=()=>{
      const pv=$('clear-preview');if(!pv)return;
      const s=$('clear-start').value,e=$('clear-end').value;
      if(s&&e&&s>e){pv.innerHTML='<span style="color:var(--expense)">开始日期不能晚于结束日期</span>';return;}
      const n=data.filter(inRange).length;
      pv.innerHTML=`将删除区间内 <strong style="color:var(--expense)">${n}</strong> 条记录，区间外 ${data.length-n} 条保留。`;
    };
    showModal('清空数据（按日期区间）',body,[
      {label:'取消',cls:'btn-outline'},
      {label:'确认清空',cls:'btn-danger',close:false,action:()=>{
        const s=$('clear-start').value,e=$('clear-end').value;
        if(s&&e&&s>e){toast('开始日期不能晚于结束日期');return;}
        const n=data.filter(inRange).length;
        if(!n){toast('区间内没有记录');return;}
        showModal('再次确认',`将删除 ${s||'最早'} ~ ${e||'最晚'} 区间内 ${n} 条记录，<strong>不可恢复</strong>！`,[
          {label:'取消',cls:'btn-outline'},
          {label:'确认删除',cls:'btn-danger',action:()=>{
            const cur=load();
            const keep=cur.filter(r=>!((!s||r.d>=s)&&(!e||r.d<=e)));
            save(keep);setDemo(false);
            toast(`已删除 ${cur.length-keep.length} 条，保留 ${keep.length} 条`);
            renderHome();renderStats();
            if(keep.length===0)goPage('home');else goPage('settings');
          }}
        ]);
      }}
    ],{closeX:true});
    $('clear-start').addEventListener('change',upd);
    $('clear-end').addEventListener('change',upd);
    upd();
  });

  const initRange=()=>{const r=loadRange();$('range-start').value=r.start;$('range-end').value=r.end;};
  $('range-start').addEventListener('change',()=>{const r=loadRange();r.start=$('range-start').value;saveRange(r);renderStats();});
  $('range-end').addEventListener('change',()=>{const r=loadRange();r.end=$('range-end').value;saveRange(r);renderStats();});
  $('range-this-month').addEventListener('click',()=>{const r={start:firstDayOfMonth(),end:today()};saveRange(r);$('range-start').value=r.start;$('range-end').value=r.end;renderStats();});

  const renderLedgerSelect=()=>{['ledger-select-search'].forEach(id=>{const sel=$(id);if(!sel)return;sel.innerHTML=LEDGERS.map(l=>`<option value="${escape(l)}" ${l===currentLedger?'selected':''}>${escape(l)}</option>`).join('');});};
  const renderLedgerManage=()=>{const box=$('settings-ledger-list');if(!box)return;const def=loadDefaultLedger();box.innerHTML=LEDGERS.map(l=>{const isD=l===def;return `<div class="ledger-item"><span class="ledger-item-name">${escape(l)}</span>${isD?'<span class="ledger-item-badge">默认</span>':`<button class="btn btn-ghost btn-xs" data-ledger-def="${escape(l)}">设为默认</button>`}${LEDGERS.length>1?`<button class="btn btn-danger btn-xs" data-ledger-del="${escape(l)}">删除</button>`:''}</div>`;}).join('');
    box.querySelectorAll('[data-ledger-def]').forEach(btn=>{btn.addEventListener('click',()=>{saveDefaultLedger(btn.dataset.ledgerDef);renderLedgerManage();toast('已设为默认');});});
    box.querySelectorAll('[data-ledger-del]').forEach(btn=>{btn.addEventListener('click',()=>{const n=btn.dataset.ledgerDel;showModal('删除账本',`确定删除「${n}」吗？`,[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{LEDGERS=LEDGERS.filter(l=>l!==n);if(currentLedger===n)currentLedger=LEDGERS[0];if(loadDefaultLedger()===n)saveDefaultLedger(LEDGERS[0]);if(statsScope.mode==='custom'){statsScope.ledgers=statsScope.ledgers.filter(l=>l!==n);saveStatsScope(statsScope);}saveLedgers(LEDGERS);localStorage.removeItem(SK+'_'+n);renderLedgerSelect();renderLedgerManage();renderStatsScope();renderHome();renderStats();toast('已删除');}}]);});});};
  const addLedger=n=>{n=n.trim();if(!n){toast('请输入名称');return}if(LEDGERS.includes(n)){toast('已存在');return}LEDGERS.push(n);saveLedgers(LEDGERS);currentLedger=n;saveDefaultLedger(n);renderLedgerSelect();renderLedgerManage();renderStatsScope();renderHome();renderStats();toast('已添加');};
  const switchLedger=n=>{
    if(n===currentLedger)return;
    currentLedger=n;
    // H1: 切换账本必须退出批量模式，否则索引指向新账本导致误删
    if(batchMode){batchMode=false;batchSelected.clear();$('batch-bar').classList.remove('show');$('batch-toggle').textContent='批量删除';}
    renderLedgerSelect();renderHome();renderStats();
  };
  // 统计范围下拉：当前账本 / 全部账本 / 自定义勾选
  const renderStatsScope=()=>{
    const sel=$('stats-scope');if(!sel)return;
    if(statsScope.mode==='custom')statsScope.ledgers=statsScope.ledgers.filter(l=>LEDGERS.includes(l));
    if(statsScope.mode==='custom'&&statsScope.ledgers.length===0){statsScope.mode='current';saveStatsScope(statsScope);}
    const customText=statsScope.mode==='custom'?`自定义勾选（${statsScope.ledgers.length}）`:'自定义勾选…';
    let opts=[`<option value="__all__">全部账本</option>`,`<option value="__custom__">${customText}</option>`,`<optgroup label="单个账本">`];
    LEDGERS.forEach(l=>{opts.push(`<option value="ledger:${escape(l)}" ${statsScope.mode==='current'&&l===currentLedger?'selected':''}>${escape(l)}</option>`);});
    opts.push('</optgroup>');
    sel.innerHTML=opts.join('');
    if(statsScope.mode==='all')sel.value='__all__';
    else if(statsScope.mode==='custom')sel.value='__custom__';
  };
  // 自定义勾选弹窗
  const showScopeModal=()=>{
    const list=LEDGERS.map(l=>{const checked=statsScope.mode==='custom'&&statsScope.ledgers.includes(l);return `<label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer"><input type="checkbox" class="scope-check" data-name="${escape(l)}" ${checked?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);flex-shrink:0"><span style="font-size:14px;font-weight:600">${escape(l)}</span></label>`;}).join('');
    showModal('统计哪些账本',`<div style="max-height:40vh;overflow-y:auto">${list}</div><div style="font-size:12px;color:var(--text-light);margin-top:10px">不勾选时自动统计当前账本</div>`,[
      {label:'取消',cls:'btn-outline'},
      {label:'确定',cls:'btn-primary',action:()=>{
        const sel=[...document.querySelectorAll('.scope-check')].filter(c=>c.checked).map(c=>c.dataset.name);
        statsScope=sel.length?{mode:'custom',ledgers:sel}:{mode:'current',ledgers:[]};
        saveStatsScope(statsScope);renderStatsScope();renderStats();
      }}
    ]);
  };

  ['ledger-select-search'].forEach(id=>{const s=$(id);if(s)s.addEventListener('change',()=>switchLedger(s.value));});
  ['ledger-set-default-search'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',()=>{saveDefaultLedger(currentLedger);renderLedgerManage();toast('已设为默认');});});
  ['ledger-manage-btn-stats','ledger-manage-btn-search'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',()=>goPage('settings'));});
  const statsScopeSel=$('stats-scope');
  if(statsScopeSel)statsScopeSel.addEventListener('change',()=>{
    const v=statsScopeSel.value;
    if(v==='__all__'){statsScope={mode:'all',ledgers:[]};saveStatsScope(statsScope);renderStats();}
    else if(v==='__custom__'){showScopeModal();}
    else if(v.startsWith('ledger:')){
      const l=v.slice(7);
      statsScope={mode:'current',ledgers:[]};saveStatsScope(statsScope);
      if(LEDGERS.includes(l)&&l!==currentLedger)switchLedger(l);
      renderStatsScope();renderStats();
    }
  });
  if($('settings-ledger-add'))$('settings-ledger-add').addEventListener('click',()=>{addLedger($('settings-ledger-input').value);$('settings-ledger-input').value='';});

  // 支出来源：开关 + 列表管理
  const renderSrcSelect=()=>{const sel=$('src-select');if(!sel)return;const cur=sel.value||'';sel.innerHTML='<option value="">无</option>'+srcCfg.list.map(s=>`<option value="${escape(s)}">${escape(s)}</option>`).join('');sel.value=cur&&srcCfg.list.includes(cur)?cur:'';};
  const renderSources=()=>{
    const toggle=$('src-toggle-btn');if(!toggle)return;
    toggle.textContent=srcCfg.enabled?'关闭':'开启';
    $('src-manage').style.display=srcCfg.enabled?'block':'none';
    const box=$('settings-src-list');
    if(!srcCfg.list.length)box.innerHTML=`<div style="font-size:12px;color:var(--text-light);padding:8px 0">暂无来源，请添加（如：信用卡、银行卡、花呗）</div>`;
    else box.innerHTML=srcCfg.list.map(s=>`<div class="ledger-item"><span class="ledger-item-name">${escape(s)}</span><button class="btn btn-danger btn-xs" data-src-del="${escape(s)}">删除</button></div>`).join('');
    box.querySelectorAll('[data-src-del]').forEach(btn=>{btn.addEventListener('click',()=>{const n=btn.dataset.srcDel;showModal('删除来源',`确定删除「${n}」吗？<br><span style="color:var(--text-light);font-size:12px">历史记录中的该来源不受影响</span>`,[{label:'取消',cls:'btn-outline'},{label:'删除',cls:'btn-danger',action:()=>{srcCfg.list=srcCfg.list.filter(x=>x!==n);saveSources(srcCfg);renderSources();toast('已删除');}}]);});});
    renderSrcSelect();
  };
  if($('src-toggle-btn'))$('src-toggle-btn').addEventListener('click',()=>{srcCfg.enabled=!srcCfg.enabled;saveSources(srcCfg);renderSources();updateFfVisibility();toast(srcCfg.enabled?'已开启':'已关闭');});
  if($('settings-src-add'))$('settings-src-add').addEventListener('click',()=>{const n=$('settings-src-input').value.trim();if(!n){toast('请输入名称');return}if(srcCfg.list.includes(n)){toast('该来源已存在');return}srcCfg.list.push(n);saveSources(srcCfg);$('settings-src-input').value='';renderSources();toast('已添加');});

  $('home-add-btn').addEventListener('click',()=>goPage('add'));

  const init=()=>{
    // 状态栏：确保 WebView 内容不延伸到系统状态栏后面（Android 15+ targetSdk>=35 强制 edge-to-edge 的兜底）
    try{
      const SB=window.Capacitor?.Plugins?.StatusBar;
      if(SB){
        SB.setOverlaysWebView({overlay:false});
        SB.setStyle({style:'LIGHT'});
      }
    }catch(e){}
    $('date-input').value=today();selectedCat=(CATS.expense[0]||{n:''}).n;selectedFf=catInfo(selectedType,selectedCat).f;
    renderPills();updateFfToggle();updateFfVisibility();renderLedgerSelect();renderLedgerManage();renderSources();renderStatsScope();renderHome();initRange();
    if(load().length===0&&localStorage.getItem(DK)!=='1')loadDemo();
    goPage('add'); // v1.7.0：软件默认打开即记账页
  };
  init();
})();
