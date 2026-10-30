/* =====================================================================
   高数练习卡片
   题库字段与 MATLAB 离线导出的 JSON schema 一致，可无损替换为完整题库。
   ===================================================================== */
export function startPractice(store){
  "use strict";

  /* ---------- 题型元数据 ---------- */
  const TYPES = [
    { key:"simpleDer", zh:"简单导数" },
    { key:"prodDer",   zh:"乘积法则导数" },
    { key:"chainDer",  zh:"链式法则导数" },
    { key:"powerDer",  zh:"幂与线性法则导数" },
    { key:"simpleInt", zh:"简单积分" },
    { key:"subsInt",   zh:"换元积分" },
    { key:"byPartsInt",zh:"分部积分" },
    { key:"defInt",    zh:"定积分" }
  ];
  const TYPESHORT = { simpleDer:"简单导数", prodDer:"乘积法则", chainDer:"链式法则",
    powerDer:"幂与线性", simpleInt:"简单积分", subsInt:"换元积分", byPartsInt:"分部积分", defInt:"定积分" };
  const FUNC = [ {key:"trig",zh:"三角函数"}, {key:"expLn",zh:"指数与对数"}, {key:"poly",zh:"多项式"} ];

  /* ---------- 内置示例题库（结构与导出 JSON 一致） ---------- */
  // 每条：id,typeKey,funcCategory,var,statementLatex,answerLatex,equivalents,numericValue(定积分),solution[{t,m}],flags
  const Q = [];
  const push = o => Q.push(o);
  const integ = '\\int ', dx = '\\,dx', frac='\\frac', d2x='\\frac{d}{dx}', d2t='\\frac{d}{dt}';

  // 导数
  push({id:"D01",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(x^{4}\\right)",answerLatex:"4x^{3}",equivalents:["4x^3","4*x^3"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{4}=4x^{3}"}]});
  push({id:"D02",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(3x^{2}-5x+7\\right)",answerLatex:"6x-5",equivalents:["6x-5"],
    solution:[{t:"逐项求导：",m:"3\\cdot 2x-5=6x-5"}]});
  push({id:"D03",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\tan x\\right)",answerLatex:"\\sec^{2}x",equivalents:["sec^2(x)","sec^2x","1/\\cos^2(x)"],
    solution:[{t:"基本导数表：",m:"\\frac{d}{dx}\\tan x=\\sec^{2}x"}]});
  push({id:"D11",typeKey:"simpleDer",funcCategory:"poly",var:"t",statement:d2t+"\\left(t^{3}+2t\\right)",answerLatex:"3t^{2}+2",equivalents:["3t^2+2","3t^{2}+2"],
    solution:[{t:"逐项求导：",m:"3t^{2}+2"}]});

  push({id:"D04",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(x\\sin x\\right)",answerLatex:"\\sin x+x\\cos x",equivalents:["sin(x)+xcos(x)","x\\cos x+\\sin x","\\cos(x)x+\\sin(x)"],
    solution:[{t:"乘积法则 ",m:"(uv)'=u'v+uv'"},{t:"得 ",m:"\\sin x+x\\cos x"}]});
  push({id:"D05",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(xe^{x}\\right)",answerLatex:"e^{x}(1+x)",equivalents:["(1+x)e^x","e^x+xe^x","(x+1)e^{x}","e^{x}+xe^{x}"],
    solution:[{t:"乘积法则：",m:"e^{x}+xe^{x}=(1+x)e^{x}"}]});
  push({id:"D12",typeKey:"prodDer",funcCategory:"trig",var:"t",statement:d2t+"\\left(t\\cos t\\right)",answerLatex:"\\cos t-t\\sin t",equivalents:["cos(t)-tsin(t)","\\cos(t)-t\\sin(t)"],
    solution:[{t:"乘积法则：",m:"\\cos t-t\\sin t"}]});

  push({id:"D06",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\sin(3x)\\right)",answerLatex:"3\\cos(3x)",equivalents:["3cos(3x)","3\\cos(3x)"],
    solution:[{t:"链式法则：",m:"\\cos(3x)\\cdot 3=3\\cos(3x)"}]});
  push({id:"D07",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:d2x+"\\left((2x+1)^{5}\\right)",answerLatex:"10(2x+1)^{4}",equivalents:["10(2x+1)^4","10(2x+1)^{4}"],
    solution:[{t:"链式法则：",m:"5(2x+1)^{4}\\cdot 2=10(2x+1)^{4}"}]});
  push({id:"D08",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(e^{x^{2}}\\right)",answerLatex:"2xe^{x^{2}}",equivalents:["2x e^(x^2)","2x*e^{x^{2}}","2xe^(x^2)"],
    solution:[{t:"链式法则：",m:"e^{x^{2}}\\cdot 2x=2xe^{x^{2}}"}]});

  push({id:"D09",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\sqrt{x}\\right)",answerLatex:"\\frac{1}{2\\sqrt{x}}",equivalents:["1/(2\\sqrt(x))","0.5x^{-0.5}","\\frac{1}{2}x^{-1/2}","1/2/sqrt(x)"],
    solution:[{t:"改写为幂：",m:"\\sqrt{x}=x^{1/2}"},{t:"得 ",m:"\\tfrac{1}{2}x^{-1/2}=\\frac{1}{2\\sqrt{x}}"}]});
  push({id:"D10",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(5x^{3}-2x^{2}+x\\right)",answerLatex:"15x^{2}-4x+1",equivalents:["15x^2-4x+1"],
    solution:[{t:"幂与线性法则：",m:"15x^{2}-4x+1"}]});

  // 简单积分
  push({id:"I01",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:integ+"x^{2}"+dx,answerLatex:"\\frac{x^{3}}{3}+C",equivalents:["x^3/3","\\frac{1}{3}x^{3}","x^{3}/3"],flags:{indef:true},
    solution:[{t:"幂的积分：",m:"\\int x^{2}dx=\\frac{x^{3}}{3}+C"}]});
  push({id:"I02",typeKey:"simpleInt",funcCategory:"trig",var:"x",statement:integ+"\\cos x"+dx,answerLatex:"\\sin x+C",equivalents:["sin(x)","\\sin(x)"],flags:{indef:true},
    solution:[{t:"基本积分：",m:"\\int \\cos x\\,dx=\\sin x+C"}]});
  push({id:"I03",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:integ+"e^{x}"+dx,answerLatex:"e^{x}+C",equivalents:["e^x","exp(x)","e^{x}"],flags:{indef:true},
    solution:[{t:"指数积分：",m:"\\int e^{x}dx=e^{x}+C"}]});
  push({id:"I04",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:integ+"\\frac{1}{x}"+dx,answerLatex:"\\ln|x|+C",equivalents:["ln(x)","\\ln|x|","log(x)","ln|x|"],flags:{indef:true},
    solution:[{t:"对数积分：",m:"\\int \\frac{1}{x}dx=\\ln|x|+C"}]});

  // 换元积分
  push({id:"I05",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:integ+"2x\\left(x^{2}+1\\right)^{3}"+dx,answerLatex:"\\frac{(x^{2}+1)^{4}}{4}+C",equivalents:["(x^2+1)^4/4","\\frac{(x^{2}+1)^{4}}{4}","((x^2+1)^4)/4"],flags:{indef:true},
    solution:[{t:"令 u=x^2+1，",m:"du=2x\\,dx"},{t:"原式 ",m:"=\\int u^{3}du=\\frac{u^{4}}{4}+C"}]});
  push({id:"I06",typeKey:"subsInt",funcCategory:"trig",var:"x",statement:integ+"\\cos(3x)"+dx,answerLatex:"\\frac{\\sin(3x)}{3}+C",equivalents:["sin(3x)/3","\\frac{\\sin(3x)}{3}"],flags:{indef:true},
    solution:[{t:"令 u=3x，",m:"du=3dx"},{t:"得 ",m:"\\frac{1}{3}\\sin(3x)+C"}]});
  push({id:"I07",typeKey:"subsInt",funcCategory:"expLn",var:"x",statement:integ+"\\frac{x}{x^{2}+1}"+dx,answerLatex:"\\frac{1}{2}\\ln(x^{2}+1)+C",equivalents:["\\ln(x^2+1)/2","0.5\\ln(x^{2}+1)","\\frac{\\ln(x^{2}+1)}{2}","ln(x^2+1)/2"],flags:{indef:true},
    solution:[{t:"令 u=x^2+1，",m:"du=2x\\,dx"},{t:"得 ",m:"\\frac{1}{2}\\ln(x^{2}+1)+C"}]});

  // 分部积分
  push({id:"I08",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:integ+"xe^{x}"+dx,answerLatex:"e^{x}(x-1)+C",equivalents:["(x-1)e^x","xe^x-e^x","(x-1)e^{x}","e^{x}x-e^{x}"],flags:{indef:true},
    solution:[{t:"取 u=x,\\;dv=e^{x}dx，",m:"\\int xe^{x}dx=xe^{x}-\\int e^{x}dx"},{t:"得 ",m:"e^{x}(x-1)+C"}]});
  push({id:"I09",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:integ+"x\\cos x"+dx,answerLatex:"x\\sin x+\\cos x+C",equivalents:["xsin(x)+cos(x)","\\cos(x)+x\\sin(x)","x\\sin x+\\cos x"],flags:{indef:true},
    solution:[{t:"取 u=x,\\;dv=\\cos x\\,dx，",m:"=x\\sin x-\\int \\sin x\\,dx"},{t:"得 ",m:"x\\sin x+\\cos x+C"}]});
  push({id:"I10",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:integ+"x\\sin x"+dx,answerLatex:"-x\\cos x+\\sin x+C",equivalents:["sin(x)-xcos(x)","\\sin x-x\\cos x","-x\\cos(x)+\\sin(x)"],flags:{indef:true},
    solution:[{t:"取 u=x,\\;dv=\\sin x\\,dx，",m:"=-x\\cos x+\\int \\cos x\\,dx"},{t:"得 ",m:"-x\\cos x+\\sin x+C"}]});
  push({id:"I11",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:integ+"x\\ln x"+dx,answerLatex:"\\frac{x^{2}}{2}\\ln x-\\frac{x^{2}}{4}+C",equivalents:["(x^2/2)ln(x)-x^2/4","0.5x^2ln(x)-0.25x^2","\\frac{x^2}{2}\\ln x-\\frac{x^2}{4}"],flags:{indef:true},
    solution:[{t:"取 u=\\ln x,\\;dv=x\\,dx，",m:"=\\frac{x^{2}}{2}\\ln x-\\int \\frac{x^{2}}{2}\\cdot\\frac{1}{x}dx"},{t:"得 ",m:"\\frac{x^{2}}{2}\\ln x-\\frac{x^{2}}{4}+C"}]});

  // 定积分
  push({id:"F01",typeKey:"defInt",funcCategory:"poly",var:"x",statement:integ+"_{0}^{1}x^{2}"+dx,answerLatex:"\\frac{1}{3}",numericValue:0.3333333,equivalents:["1/3","0.333","0.3333"],
    solution:[{t:"先求原函数：",m:"\\left[\\frac{x^{3}}{3}\\right]_{0}^{1}=\\frac{1}{3}"}]});
  push({id:"F02",typeKey:"defInt",funcCategory:"trig",var:"x",statement:integ+"_{0}^{\\pi}\\sin x"+dx,answerLatex:"2",numericValue:2,equivalents:["2"],
    solution:[{t:"原函数 ",m:"-\\cos x"},{t:"代入：",m:"-\\cos\\pi+\\cos 0=2"}]});
  push({id:"F03",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:integ+"_{0}^{1}e^{x}"+dx,answerLatex:"e-1",numericValue:1.7182818,equivalents:["e-1","exp(1)-1","1.718","1.72"],
    solution:[{t:"原函数 ",m:"e^{x}"},{t:"代入：",m:"e^{1}-e^{0}=e-1"}]});
  push({id:"F04",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:integ+"_{1}^{4}\\frac{1}{x}"+dx,answerLatex:"\\ln 4",numericValue:1.3862944,equivalents:["ln(4)","ln4","log(4)","1.386","1.3863"],
    solution:[{t:"原函数 ",m:"\\ln x"},{t:"代入：",m:"\\ln 4-\\ln 1=\\ln 4"}]});
  push({id:"F05",typeKey:"defInt",funcCategory:"poly",var:"t",statement:integ+"_{0}^{2}t^{2}\\,dt",answerLatex:"\\frac{8}{3}",numericValue:2.6666667,equivalents:["8/3","2.6667","2.666","2.67"],
    solution:[{t:"原函数 ",m:"\\frac{t^{3}}{3}"},{t:"代入：",m:"\\frac{8}{3}-0=\\frac{8}{3}"}]});
  push({id:"F06",typeKey:"defInt",funcCategory:"trig",var:"x",statement:integ+"_{0}^{\\pi/2}\\cos x"+dx,answerLatex:"1",numericValue:1,equivalents:["1"],
    solution:[{t:"原函数 ",m:"\\sin x"},{t:"代入：",m:"\\sin\\frac{\\pi}{2}-0=1"}]});
  push({id:"F07",typeKey:"defInt",funcCategory:"poly",var:"x",statement:integ+"_{-1}^{2}x"+dx,answerLatex:"\\frac{3}{2}",numericValue:1.5,equivalents:["3/2","1.5"],
    solution:[{t:"原函数 ",m:"\\frac{x^{2}}{2}"},{t:"代入：",m:"\\frac{4}{2}-\\frac{1}{2}=\\frac{3}{2}"}]});
  push({id:"F08",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:integ+"_{0}^{\\ln 2}e^{x}"+dx,answerLatex:"1",numericValue:1,equivalents:["1","e^{ln2}-1","e^(ln2)-1"],
    solution:[{t:"原函数 ",m:"e^{x}"},{t:"代入：",m:"e^{\\ln 2}-e^{0}=2-1=1"}]});

  push({id:"S13",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\sin x\\right)",answerLatex:"\\cos x",equivalents:["cos(x)","\\cos(x)"],
    solution:[{t:"基本导数表：",m:"\\frac{d}{dx}\\sin x=\\cos x"}]});
  push({id:"S14",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\cos x\\right)",answerLatex:"-\\sin x",equivalents:["-sin(x)","-\\sin(x)"],
    solution:[{t:"基本导数表：",m:"\\frac{d}{dx}\\cos x=-\\sin x"}]});
  push({id:"S15",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(e^{x}\\right)",answerLatex:"e^{x}",equivalents:["e^x","exp(x)"],
    solution:[{t:"指数求导：",m:"\\frac{d}{dx}e^{x}=e^{x}"}]});
  push({id:"S16",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(\\ln x\\right)",answerLatex:"\\frac{1}{x}",equivalents:["1/x","x^(-1)"],
    solution:[{t:"对数求导：",m:"\\frac{d}{dx}\\ln x=\\frac{1}{x}"}]});
  push({id:"S17",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(x^{5}\\right)",answerLatex:"5x^{4}",equivalents:["5x^4","5*x^4"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{5}=5x^{4}"}]});
  push({id:"S18",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(7x\\right)",answerLatex:"7",equivalents:["7"],
    solution:[{t:"常数倍：",m:"\\frac{d}{dx}(7x)=7"}]});
  push({id:"S19",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\frac{1}{x}\\right)",answerLatex:"-\\frac{1}{x^{2}}",equivalents:["-1/x^2","-x^(-2)"],
    solution:[{t:"改写为幂：",m:"\\frac{d}{dx}x^{-1}=-x^{-2}"}]});
  push({id:"S20",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\sin x+\\cos x\\right)",answerLatex:"\\cos x-\\sin x",equivalents:["cos(x)-sin(x)"],
    solution:[{t:"逐项求导：",m:"\\cos x-\\sin x"}]});
  push({id:"S21",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(3e^{x}\\right)",answerLatex:"3e^{x}",equivalents:["3e^x","3exp(x)"],
    solution:[{t:"常数倍：",m:"3e^{x}"}]});
  push({id:"S22",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(x^{3}-4x\\right)",answerLatex:"3x^{2}-4",equivalents:["3x^2-4"],
    solution:[{t:"逐项求导：",m:"3x^{2}-4"}]});
  push({id:"P06",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(x^{2}e^{x}\\right)",answerLatex:"e^{x}(x^{2}+2x)",equivalents:["(x^2+2x)e^x","x^2e^x+2xe^x","e^{x}(x^{2}+2x)"],
    solution:[{t:"乘积法则：",m:"(x^{2})'e^{x}+x^{2}e^{x}=2xe^{x}+x^{2}e^{x}=e^{x}(x^{2}+2x)"}]});
  push({id:"P07",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(x\\ln x\\right)",answerLatex:"\\ln x+1",equivalents:["ln(x)+1","1+ln(x)"],
    solution:[{t:"乘积法则：",m:"1\\cdot\\ln x+x\\cdot\\tfrac{1}{x}=\\ln x+1"}]});
  push({id:"P08",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(x^{2}\\sin x\\right)",answerLatex:"2x\\sin x+x^{2}\\cos x",equivalents:["x(2sin(x)+xcos(x))","2xsin(x)+x^2cos(x)"],
    solution:[{t:"乘积法则：",m:"2x\\sin x+x^{2}\\cos x"}]});
  push({id:"P09",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(xe^{2x}\\right)",answerLatex:"e^{2x}(1+2x)",equivalents:["(1+2x)e^{2x}","e^{2x}+2xe^{2x}"],
    solution:[{t:"乘积法则：",m:"e^{2x}+2xe^{2x}=e^{2x}(1+2x)"}]});
  push({id:"P10",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\sin x\\cos x\\right)",answerLatex:"\\cos^{2}x-\\sin^{2}x",equivalents:["cos^2(x)-sin^2(x)","cos(2x)"],
    solution:[{t:"乘积法则：",m:"\\cos^{2}x-\\sin^{2}x=\\cos 2x"}]});
  push({id:"P11",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(x^{3}\\ln x\\right)",answerLatex:"3x^{2}\\ln x+x^{2}",equivalents:["x^2(3ln(x)+1)","3x^2ln(x)+x^2"],
    solution:[{t:"乘积法则：",m:"3x^{2}\\ln x+x^{3}\\cdot\\tfrac{1}{x}=3x^{2}\\ln x+x^{2}"}]});
  push({id:"P12",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(x\\tan x\\right)",answerLatex:"\\tan x+x\\sec^{2}x",equivalents:["tan(x)+xsec^2(x)"],
    solution:[{t:"乘积法则：",m:"\\tan x+x\\sec^{2}x"}]});
  push({id:"P13",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:d2x+"\\left((x+1)(x+2)\\right)",answerLatex:"2x+3",equivalents:["2x+3"],
    solution:[{t:"乘积法则：",m:"(x+2)+(x+1)=2x+3"}]});
  push({id:"C09",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\sin(5x)\\right)",answerLatex:"5\\cos(5x)",equivalents:["5cos(5x)"],
    solution:[{t:"链式法则：",m:"\\cos(5x)\\cdot 5=5\\cos(5x)"}]});
  push({id:"C10",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\cos(2x)\\right)",answerLatex:"-2\\sin(2x)",equivalents:["-2sin(2x)"],
    solution:[{t:"链式法则：",m:"-\\sin(2x)\\cdot 2=-2\\sin(2x)"}]});
  push({id:"C11",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(e^{3x}\\right)",answerLatex:"3e^{3x}",equivalents:["3e^{3x}","3e^3x"],
    solution:[{t:"链式法则：",m:"e^{3x}\\cdot 3=3e^{3x}"}]});
  push({id:"C12",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(\\ln(2x+1)\\right)",answerLatex:"\\frac{2}{2x+1}",equivalents:["2/(2x+1)"],
    solution:[{t:"链式法则：",m:"\\frac{1}{2x+1}\\cdot 2=\\frac{2}{2x+1}"}]});
  push({id:"C13",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:d2x+"\\left((3x-1)^{4}\\right)",answerLatex:"12(3x-1)^{3}",equivalents:["12(3x-1)^3"],
    solution:[{t:"链式法则：",m:"4(3x-1)^{3}\\cdot 3=12(3x-1)^{3}"}]});
  push({id:"C14",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\sqrt{x^{2}+1}\\right)",answerLatex:"\\frac{x}{\\sqrt{x^{2}+1}}",equivalents:["x/sqrt(x^2+1)"],
    solution:[{t:"链式法则：",m:"\\frac{1}{2\\sqrt{x^{2}+1}}\\cdot 2x=\\frac{x}{\\sqrt{x^{2}+1}}"}]});
  push({id:"C15",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:d2x+"\\left(\\tan(x^{2})\\right)",answerLatex:"2x\\sec^{2}(x^{2})",equivalents:["2xsec^2(x^2)"],
    solution:[{t:"链式法则：",m:"\\sec^{2}(x^{2})\\cdot 2x=2x\\sec^{2}(x^{2})"}]});
  push({id:"C16",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(e^{\\sin x}\\right)",answerLatex:"e^{\\sin x}\\cos x",equivalents:["cos(x)e^{sin(x)}"],
    solution:[{t:"链式法则：",m:"e^{\\sin x}\\cdot\\cos x"}]});
  push({id:"C17",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:d2x+"\\left(\\ln(x^{2}+1)\\right)",answerLatex:"\\frac{2x}{x^{2}+1}",equivalents:["2x/(x^2+1)"],
    solution:[{t:"链式法则：",m:"\\frac{1}{x^{2}+1}\\cdot 2x=\\frac{2x}{x^{2}+1}"}]});
  push({id:"C18",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:d2x+"\\left((2x+1)^{3}\\right)",answerLatex:"6(2x+1)^{2}",equivalents:["6(2x+1)^2"],
    solution:[{t:"链式法则：",m:"3(2x+1)^{2}\\cdot 2=6(2x+1)^{2}"}]});
  push({id:"W07",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\sqrt[3]{x}\\right)",answerLatex:"\\frac{1}{3x^{2/3}}",equivalents:["1/(3x^(2/3))","(1/3)x^(-2/3)"],
    solution:[{t:"改写为幂：",m:"\\frac{d}{dx}x^{1/3}=\\tfrac{1}{3}x^{-2/3}"}]});
  push({id:"W08",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(x^{-2}\\right)",answerLatex:"-2x^{-3}",equivalents:["-2/x^3","-2x^(-3)"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{-2}=-2x^{-3}"}]});
  push({id:"W09",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(4\\sqrt{x}\\right)",answerLatex:"\\frac{2}{\\sqrt{x}}",equivalents:["2/sqrt(x)"],
    solution:[{t:"幂法则：",m:"4\\cdot\\tfrac{1}{2}x^{-1/2}=\\frac{2}{\\sqrt{x}}"}]});
  push({id:"W10",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\frac{x^{4}}{4}\\right)",answerLatex:"x^{3}",equivalents:["x^3"],
    solution:[{t:"常数倍：",m:"\\tfrac{1}{4}\\cdot 4x^{3}=x^{3}"}]});
  push({id:"W11",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\frac{1}{x^{3}}\\right)",answerLatex:"-\\frac{3}{x^{4}}",equivalents:["-3/x^4"],
    solution:[{t:"幂法则：",m:"-3x^{-4}"}]});
  push({id:"W12",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(2x^{5}-3x^{3}+x\\right)",answerLatex:"10x^{4}-9x^{2}+1",equivalents:["10x^4-9x^2+1"],
    solution:[{t:"逐项求导：",m:"10x^{4}-9x^{2}+1"}]});
  push({id:"W13",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\sqrt{2x}\\right)",answerLatex:"\\frac{1}{\\sqrt{2x}}",equivalents:["1/sqrt(2x)"],
    solution:[{t:"链式+幂：",m:"(2x)^{-1/2}=\\frac{1}{\\sqrt{2x}}"}]});
  push({id:"W14",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:d2x+"\\left(\\frac{x^{2}+1}{x}\\right)",answerLatex:"1-\\frac{1}{x^{2}}",equivalents:["1-1/x^2"],
    solution:[{t:"化简后求导：",m:"\\frac{d}{dx}\\left(x+\\tfrac{1}{x}\\right)=1-\\tfrac{1}{x^{2}}"}]});
  push({id:"I12",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x^{3}\\,dx",answerLatex:"\\frac{x^{4}}{4}+C",equivalents:["x^4/4","\\frac{1}{4}x^{4}"],flags:{indef:true},
    solution:[{t:"幂的积分：",m:"\\int x^{3}dx=\\frac{x^{4}}{4}+C"}]});
  push({id:"I13",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int \\frac{1}{x^{2}}\\,dx",answerLatex:"-\\frac{1}{x}+C",equivalents:["-1/x","-x^(-1)"],flags:{indef:true},
    solution:[{t:"改写为幂：",m:"\\int x^{-2}dx=-x^{-1}+C"}]});
  push({id:"I14",typeKey:"simpleInt",funcCategory:"trig",var:"x",statement:"\\int \\sin x\\,dx",answerLatex:"-\\cos x+C",equivalents:["-cos(x)","-\\cos(x)"],flags:{indef:true},
    solution:[{t:"基本积分：",m:"\\int\\sin x\\,dx=-\\cos x+C"}]});
  push({id:"I15",typeKey:"simpleInt",funcCategory:"trig",var:"x",statement:"\\int \\sec^{2}x\\,dx",answerLatex:"\\tan x+C",equivalents:["tan(x)"],flags:{indef:true},
    solution:[{t:"基本积分：",m:"\\int\\sec^{2}x\\,dx=\\tan x+C"}]});
  push({id:"I16",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int \\frac{1}{\\sqrt{x}}\\,dx",answerLatex:"2\\sqrt{x}+C",equivalents:["2sqrt(x)","2\\sqrt{x}"],flags:{indef:true},
    solution:[{t:"改写为幂：",m:"\\int x^{-1/2}dx=2x^{1/2}+C"}]});
  push({id:"I17",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 3x^{2}-2x\\,dx",answerLatex:"x^{3}-x^{2}+C",equivalents:["x^3-x^2"],flags:{indef:true},
    solution:[{t:"逐项积分：",m:"x^{3}-x^{2}+C"}]});
  push({id:"I18",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int e^{2x}\\,dx",answerLatex:"\\frac{e^{2x}}{2}+C",equivalents:["e^{2x}/2","0.5e^{2x}"],flags:{indef:true},
    solution:[{t:"指数积分：",m:"\\int e^{2x}dx=\\tfrac{1}{2}e^{2x}+C"}]});
  push({id:"I19",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 1+x\\,dx",answerLatex:"x+\\frac{x^{2}}{2}+C",equivalents:["x+x^2/2"],flags:{indef:true},
    solution:[{t:"逐项积分：",m:"x+\\tfrac{x^{2}}{2}+C"}]});
  push({id:"I20",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x^{2}+x+1\\,dx",answerLatex:"\\frac{x^{3}}{3}+\\frac{x^{2}}{2}+x+C",equivalents:["x^3/3+x^2/2+x"],flags:{indef:true},
    solution:[{t:"逐项积分：",m:"\\frac{x^{3}}{3}+\\frac{x^{2}}{2}+x+C"}]});
  push({id:"I21",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int \\frac{2}{x}\\,dx",answerLatex:"2\\ln|x|+C",equivalents:["2ln(x)","2ln|x|"],flags:{indef:true},
    solution:[{t:"常数倍：",m:"\\int\\frac{2}{x}dx=2\\ln|x|+C"}]});
  push({id:"U08",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x(x^{2}+1)^{5}\\,dx",answerLatex:"\\frac{(x^{2}+1)^{6}}{6}+C",equivalents:["(x^2+1)^6/6"],flags:{indef:true},
    solution:[{t:"令 u=x^2+1：",m:"\\int u^{5}du=\\frac{u^{6}}{6}+C"}]});
  push({id:"U09",typeKey:"subsInt",funcCategory:"trig",var:"x",statement:"\\int \\cos(4x)\\,dx",answerLatex:"\\frac{\\sin(4x)}{4}+C",equivalents:["sin(4x)/4"],flags:{indef:true},
    solution:[{t:"令 u=4x：",m:"\\frac{1}{4}\\sin(4x)+C"}]});
  push({id:"U10",typeKey:"subsInt",funcCategory:"expLn",var:"x",statement:"\\int xe^{x^{2}}\\,dx",answerLatex:"\\frac{e^{x^{2}}}{2}+C",equivalents:["e^{x^2}/2","0.5e^{x^2}"],flags:{indef:true},
    solution:[{t:"令 u=x^2：",m:"\\frac{1}{2}e^{x^{2}}+C"}]});
  push({id:"U11",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int \\frac{1}{x+1}\\,dx",answerLatex:"\\ln|x+1|+C",equivalents:["ln(x+1)","ln|x+1|"],flags:{indef:true},
    solution:[{t:"令 u=x+1：",m:"\\ln|x+1|+C"}]});
  push({id:"U12",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int (2x+1)(x^{2}+x)^{3}\\,dx",answerLatex:"\\frac{(x^{2}+x)^{4}}{4}+C",equivalents:["(x^2+x)^4/4"],flags:{indef:true},
    solution:[{t:"令 u=x^2+x：",m:"\\frac{u^{4}}{4}+C"}]});
  push({id:"U13",typeKey:"subsInt",funcCategory:"trig",var:"x",statement:"\\int \\sec x\\tan x\\,dx",answerLatex:"\\sec x+C",equivalents:["sec(x)","1/cos(x)"],flags:{indef:true},
    solution:[{t:"基本形式：",m:"\\int\\sec x\\tan x\\,dx=\\sec x+C"}]});
  push({id:"U14",typeKey:"subsInt",funcCategory:"expLn",var:"x",statement:"\\int 3x^{2}e^{x^{3}}\\,dx",answerLatex:"e^{x^{3}}+C",equivalents:["e^{x^3}"],flags:{indef:true},
    solution:[{t:"令 u=x^3：",m:"\\int e^{u}du=e^{x^{3}}+C"}]});
  push({id:"U15",typeKey:"subsInt",funcCategory:"trig",var:"x",statement:"\\int \\sin(3x)\\,dx",answerLatex:"-\\frac{\\cos(3x)}{3}+C",equivalents:["-cos(3x)/3"],flags:{indef:true},
    solution:[{t:"令 u=3x：",m:"-\\frac{1}{3}\\cos(3x)+C"}]});
  push({id:"U16",typeKey:"subsInt",funcCategory:"trig",var:"x",statement:"\\int 2x\\cos(x^{2})\\,dx",answerLatex:"\\sin(x^{2})+C",equivalents:["sin(x^2)"],flags:{indef:true},
    solution:[{t:"令 u=x^2：",m:"\\int\\cos u\\,du=\\sin(x^{2})+C"}]});
  push({id:"B05",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int xe^{2x}\\,dx",answerLatex:"\\frac{e^{2x}(2x-1)}{4}+C",equivalents:["e^{2x}(2x-1)/4","(x/2)e^{2x}-e^{2x}/4"],flags:{indef:true},
    solution:[{t:"取 u=x,\\;dv=e^{2x}dx：",m:"\\frac{x}{2}e^{2x}-\\frac{1}{4}e^{2x}=\\frac{e^{2x}(2x-1)}{4}+C"}]});
  push({id:"B06",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int \\ln x\\,dx",answerLatex:"x\\ln x-x+C",equivalents:["xln(x)-x","x(ln(x)-1)"],flags:{indef:true},
    solution:[{t:"取 u=\\ln x,\\;dv=dx：",m:"x\\ln x-\\int 1\\,dx=x\\ln x-x+C"}]});
  push({id:"B07",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int x^{2}e^{x}\\,dx",answerLatex:"e^{x}(x^{2}-2x+2)+C",equivalents:["e^x(x^2-2x+2)"],flags:{indef:true},
    solution:[{t:"两次分部：",m:"e^{x}(x^{2}-2x+2)+C"}]});
  push({id:"B08",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int x^{2}\\ln x\\,dx",answerLatex:"\\frac{x^{3}}{3}\\ln x-\\frac{x^{3}}{9}+C",equivalents:["(x^3/3)ln(x)-x^3/9"],flags:{indef:true},
    solution:[{t:"取 u=\\ln x,\\;dv=x^{2}dx：",m:"\\frac{x^{3}}{3}\\ln x-\\frac{x^{3}}{9}+C"}]});
  push({id:"B09",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int e^{x}\\sin x\\,dx",answerLatex:"\\frac{e^{x}(\\sin x-\\cos x)}{2}+C",equivalents:["(e^x/2)(sin(x)-cos(x))"],flags:{indef:true},
    solution:[{t:"两次分部回代：",m:"\\frac{e^{x}(\\sin x-\\cos x)}{2}+C"}]});
  push({id:"B10",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int 2x\\ln x\\,dx",answerLatex:"x^{2}\\ln x-\\frac{x^{2}}{2}+C",equivalents:["x^2ln(x)-x^2/2"],flags:{indef:true},
    solution:[{t:"取 u=\\ln x,\\;dv=2x\\,dx：",m:"x^{2}\\ln x-\\frac{x^{2}}{2}+C"}]});
  push({id:"F09",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}x^{3}\\,dx",answerLatex:"4",numericValue:4.0000000,equivalents:["4"],
    solution:[{t:"先求原函数：",m:"\\left[\\tfrac{x^{4}}{4}\\right]_0^2=4"}]});
  push({id:"F10",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:"\\int _{1}^{2}\\frac{1}{x}\\,dx",answerLatex:"\\ln 2",numericValue:0.6931472,equivalents:["ln(2)","0.693","0.6931"],
    solution:[{t:"原函数 ",m:"\\ln x"}]});
  push({id:"F11",typeKey:"defInt",funcCategory:"trig",var:"x",statement:"\\int _{0}^{\\pi}\\cos x\\,dx",answerLatex:"0",numericValue:0.0000000,equivalents:["0"],
    solution:[{t:"原函数 ",m:"\\sin x"}]});
  push({id:"F12",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:"\\int _{0}^{1}xe^{x}\\,dx",answerLatex:"1",numericValue:1.0000000,equivalents:["1"],
    solution:[{t:"分部：",m:"\\left[e^{x}(x-1)\\right]_0^1=1"}]});
  push({id:"F13",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}3x^{2}\\,dx",answerLatex:"8",numericValue:8.0000000,equivalents:["8"],
    solution:[{t:"原函数 ",m:"x^{3}"}]});
  push({id:"F14",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{4}\\frac{1}{\\sqrt{x}}\\,dx",answerLatex:"2",numericValue:2.0000000,equivalents:["2"],
    solution:[{t:"原函数 ",m:"2\\sqrt{x}"}]});
  push({id:"F15",typeKey:"defInt",funcCategory:"trig",var:"x",statement:"\\int _{0}^{\\pi/2}\\sin x\\,dx",answerLatex:"1",numericValue:1.0000000,equivalents:["1"],
    solution:[{t:"原函数 ",m:"-\\cos x"}]});
  push({id:"F16",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{1}x^{2}+x\\,dx",answerLatex:"\\frac{5}{6}",numericValue:0.8333333,equivalents:["5/6","0.833","0.8333"],
    solution:[{t:"逐项积分：",m:"\\tfrac{1}{3}+\\tfrac{1}{2}=\\tfrac{5}{6}"}]});
  push({id:"F17",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{-1}^{1}x^{2}\\,dx",answerLatex:"\\frac{2}{3}",numericValue:0.6666667,equivalents:["2/3","0.667","0.6667"],
    solution:[{t:"原函数 ",m:"\\tfrac{x^{3}}{3}"}]});
  push({id:"F18",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:"\\int _{0}^{\\ln 3}e^{x}\\,dx",answerLatex:"2",numericValue:2.0000000,equivalents:["2"],
    solution:[{t:"代入：",m:"e^{\\ln 3}-e^{0}=2"}]});
  push({id:"F19",typeKey:"defInt",funcCategory:"expLn",var:"x",statement:"\\int _{1}^{e}\\frac{1}{x}\\,dx",answerLatex:"1",numericValue:1.0000000,equivalents:["1"],
    solution:[{t:"代入：",m:"\\ln e-\\ln 1=1"}]});
  push({id:"F20",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{1}2x(x^{2}+1)\\,dx",answerLatex:"\\frac{3}{2}",numericValue:1.5000000,equivalents:["3/2","1.5"],
    solution:[{t:"展开积分：",m:"\\left[\\tfrac{x^{4}}{2}+x^{2}\\right]_0^1=\\tfrac{3}{2}"}]});
  push({id:"F21",typeKey:"defInt",funcCategory:"trig",var:"x",statement:"\\int _{0}^{2\\pi}\\cos x\\,dx",answerLatex:"0",numericValue:0.0000000,equivalents:["0"],
    solution:[{t:"周期积分：",m:"\\sin 2\\pi-\\sin 0=0"}]});
  push({id:"F22",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{3}2x+1\\,dx",answerLatex:"10",numericValue:10.0000000,equivalents:["10"],
    solution:[{t:"原函数 ",m:"x^{2}+x"}]});

push({id:"G001",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{2}\\right)",answerLatex:"4x",equivalents:["4x"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{2}=2x"}]});
  push({id:"G002",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3}\\right)",answerLatex:"6x^{2}",equivalents:["6x^2"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{3}=3x^{2}"}]});
  push({id:"G003",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4}\\right)",answerLatex:"8x^{3}",equivalents:["8x^3"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{4}=4x^{3}"}]});
  push({id:"G004",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5}\\right)",answerLatex:"10x^{4}",equivalents:["10x^4"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{5}=5x^{4}"}]});
  push({id:"G005",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6}\\right)",answerLatex:"12x^{5}",equivalents:["12x^5"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{6}=6x^{5}"}]});
  push({id:"G006",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{7}\\right)",answerLatex:"14x^{6}",equivalents:["14x^6"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{7}=7x^{6}"}]});
  push({id:"G007",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{8}\\right)",answerLatex:"16x^{7}",equivalents:["16x^7"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{8}=8x^{7}"}]});
  push({id:"G008",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(2\\sin x\\right)",answerLatex:"2\\cos x",equivalents:["2cos(x)"],
    solution:[{t:"基本导数：",m:"(\\sin x)'=\\cos x"}]});
  push({id:"G009",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(2\\cos x\\right)",answerLatex:"-2\\sin x",equivalents:["-2sin(x)"],
    solution:[{t:"基本导数：",m:"(\\cos x)'=-\\sin x"}]});
  push({id:"G010",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(2e^{x}\\right)",answerLatex:"2e^{x}",equivalents:["2e^x","2exp(x)"],
    solution:[{t:"指数求导：",m:"(e^{x})'=e^{x}"}]});
  push({id:"G011",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(2\\ln x\\right)",answerLatex:"\\frac{2}{x}",equivalents:["2/x"],
    solution:[{t:"对数求导：",m:"(\\ln x)'=1/x"}]});
  push({id:"G012",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\frac{2}{x}\\right)",answerLatex:"-\\frac{2}{x^{2}}",equivalents:["-2/x^2"],
    solution:[{t:"改写为幂：",m:"(2x^{-1})'=-2x^{-2}"}]});
  push({id:"G013",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(2\\tan x\\right)",answerLatex:"2\\sec^{2}x",equivalents:["2sec^2(x)","2/cos^2(x)"],
    solution:[{t:"基本导数：",m:"(\\tan x)'=\\sec^{2}x"}]});
  push({id:"G014",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{2}\\right)",answerLatex:"6x",equivalents:["6x"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{2}=2x"}]});
  push({id:"G015",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{3}\\right)",answerLatex:"9x^{2}",equivalents:["9x^2"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{3}=3x^{2}"}]});
  push({id:"G016",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{4}\\right)",answerLatex:"12x^{3}",equivalents:["12x^3"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{4}=4x^{3}"}]});
  push({id:"G017",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{5}\\right)",answerLatex:"15x^{4}",equivalents:["15x^4"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{5}=5x^{4}"}]});
  push({id:"G018",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{6}\\right)",answerLatex:"18x^{5}",equivalents:["18x^5"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{6}=6x^{5}"}]});
  push({id:"G019",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{7}\\right)",answerLatex:"21x^{6}",equivalents:["21x^6"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{7}=7x^{6}"}]});
  push({id:"G020",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(3x^{8}\\right)",answerLatex:"24x^{7}",equivalents:["24x^7"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{8}=8x^{7}"}]});
  push({id:"G021",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(3\\sin x\\right)",answerLatex:"3\\cos x",equivalents:["3cos(x)"],
    solution:[{t:"基本导数：",m:"(\\sin x)'=\\cos x"}]});
  push({id:"G022",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(3\\cos x\\right)",answerLatex:"-3\\sin x",equivalents:["-3sin(x)"],
    solution:[{t:"基本导数：",m:"(\\cos x)'=-\\sin x"}]});
  push({id:"G023",typeKey:"simpleDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(3\\ln x\\right)",answerLatex:"\\frac{3}{x}",equivalents:["3/x"],
    solution:[{t:"对数求导：",m:"(\\ln x)'=1/x"}]});
  push({id:"G024",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\frac{3}{x}\\right)",answerLatex:"-\\frac{3}{x^{2}}",equivalents:["-3/x^2"],
    solution:[{t:"改写为幂：",m:"(3x^{-1})'=-3x^{-2}"}]});
  push({id:"G025",typeKey:"simpleDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(3\\tan x\\right)",answerLatex:"3\\sec^{2}x",equivalents:["3sec^2(x)","3/cos^2(x)"],
    solution:[{t:"基本导数：",m:"(\\tan x)'=\\sec^{2}x"}]});
  push({id:"G026",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(4x^{2}\\right)",answerLatex:"8x",equivalents:["8x"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{2}=2x"}]});
  push({id:"G027",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(4x^{3}\\right)",answerLatex:"12x^{2}",equivalents:["12x^2"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{3}=3x^{2}"}]});
  push({id:"G028",typeKey:"simpleDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(4x^{4}\\right)",answerLatex:"16x^{3}",equivalents:["16x^3"],
    solution:[{t:"幂法则：",m:"\\frac{d}{dx}x^{4}=4x^{3}"}]});
  push({id:"G029",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3} - 2x\\right)",answerLatex:"6x^{2} - 2",equivalents:["6x^2 - 2"],
    solution:[{t:"逐项幂法则",m:"6x^{2} - 2"}]});
  push({id:"G030",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4} - 2x^{2}\\right)",answerLatex:"8x^{3} - 4x",equivalents:["8x^3 - 4x"],
    solution:[{t:"逐项幂法则",m:"8x^{3} - 4x"}]});
  push({id:"G031",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5} - 2x^{3}\\right)",answerLatex:"10x^{4} - 6x^{2}",equivalents:["10x^4 - 6x^2"],
    solution:[{t:"逐项幂法则",m:"10x^{4} - 6x^{2}"}]});
  push({id:"G032",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6} - 2x^{4}\\right)",answerLatex:"12x^{5} - 8x^{3}",equivalents:["12x^5 - 8x^3"],
    solution:[{t:"逐项幂法则",m:"12x^{5} - 8x^{3}"}]});
  push({id:"G033",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3} - 3x\\right)",answerLatex:"6x^{2} - 3",equivalents:["6x^2 - 3"],
    solution:[{t:"逐项幂法则",m:"6x^{2} - 3"}]});
  push({id:"G034",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4} - 3x^{2}\\right)",answerLatex:"8x^{3} - 6x",equivalents:["8x^3 - 6x"],
    solution:[{t:"逐项幂法则",m:"8x^{3} - 6x"}]});
  push({id:"G035",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5} - 3x^{3}\\right)",answerLatex:"10x^{4} - 9x^{2}",equivalents:["10x^4 - 9x^2"],
    solution:[{t:"逐项幂法则",m:"10x^{4} - 9x^{2}"}]});
  push({id:"G036",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6} - 3x^{4}\\right)",answerLatex:"12x^{5} - 12x^{3}",equivalents:["12x^5 - 12x^3"],
    solution:[{t:"逐项幂法则",m:"12x^{5} - 12x^{3}"}]});
  push({id:"G037",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3} - 4x\\right)",answerLatex:"6x^{2} - 4",equivalents:["6x^2 - 4"],
    solution:[{t:"逐项幂法则",m:"6x^{2} - 4"}]});
  push({id:"G038",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4} - 4x^{2}\\right)",answerLatex:"8x^{3} - 8x",equivalents:["8x^3 - 8x"],
    solution:[{t:"逐项幂法则",m:"8x^{3} - 8x"}]});
  push({id:"G039",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5} - 4x^{3}\\right)",answerLatex:"10x^{4} - 12x^{2}",equivalents:["10x^4 - 12x^2"],
    solution:[{t:"逐项幂法则",m:"10x^{4} - 12x^{2}"}]});
  push({id:"G040",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6} - 4x^{4}\\right)",answerLatex:"12x^{5} - 16x^{3}",equivalents:["12x^5 - 16x^3"],
    solution:[{t:"逐项幂法则",m:"12x^{5} - 16x^{3}"}]});
  push({id:"G041",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3} - 5x\\right)",answerLatex:"6x^{2} - 5",equivalents:["6x^2 - 5"],
    solution:[{t:"逐项幂法则",m:"6x^{2} - 5"}]});
  push({id:"G042",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4} - 5x^{2}\\right)",answerLatex:"8x^{3} - 10x",equivalents:["8x^3 - 10x"],
    solution:[{t:"逐项幂法则",m:"8x^{3} - 10x"}]});
  push({id:"G043",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5} - 5x^{3}\\right)",answerLatex:"10x^{4} - 15x^{2}",equivalents:["10x^4 - 15x^2"],
    solution:[{t:"逐项幂法则",m:"10x^{4} - 15x^{2}"}]});
  push({id:"G044",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6} - 5x^{4}\\right)",answerLatex:"12x^{5} - 20x^{3}",equivalents:["12x^5 - 20x^3"],
    solution:[{t:"逐项幂法则",m:"12x^{5} - 20x^{3}"}]});
  push({id:"G045",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{3} - 6x\\right)",answerLatex:"6x^{2} - 6",equivalents:["6x^2 - 6"],
    solution:[{t:"逐项幂法则",m:"6x^{2} - 6"}]});
  push({id:"G046",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{4} - 6x^{2}\\right)",answerLatex:"8x^{3} - 12x",equivalents:["8x^3 - 12x"],
    solution:[{t:"逐项幂法则",m:"8x^{3} - 12x"}]});
  push({id:"G047",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{5} - 6x^{3}\\right)",answerLatex:"10x^{4} - 18x^{2}",equivalents:["10x^4 - 18x^2"],
    solution:[{t:"逐项幂法则",m:"10x^{4} - 18x^{2}"}]});
  push({id:"G048",typeKey:"powerDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(2x^{6} - 6x^{4}\\right)",answerLatex:"12x^{5} - 24x^{3}",equivalents:["12x^5 - 24x^3"],
    solution:[{t:"逐项幂法则",m:"12x^{5} - 24x^{3}"}]});
  push({id:"G049",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(x^{2}\\cos x\\right)",answerLatex:"2x\\cos x-x^{2}\\sin x",equivalents:["2xcos(x)-x^2sin(x)"],
    solution:[{t:"乘积法则",m:"=2x\\cos x - x^{2}\\sin x"}]});
  push({id:"G050",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(x^{2}\\ln x\\right)",answerLatex:"2x\\ln x+x",equivalents:["2xln(x)+x","x(2ln(x)+1)"],
    solution:[{t:"乘积法则",m:"=2x\\ln x + x"}]});
  push({id:"G051",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(x^{3}e^{x}\\right)",answerLatex:"3x^{2}e^{x}+x^{3}e^{x}",equivalents:["e^x(3x^{2}+x^{3})","3x^2e^x+x^3e^x"],
    solution:[{t:"乘积法则",m:"(x^{3})'e^{x}+x^{3}(e^{x})'= 3x^{2}e^{x}+x^{3}e^{x}"}]});
  push({id:"G052",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(x^{3}\\sin x\\right)",answerLatex:"3x^{2}\\sin x+x^{3}\\cos x",equivalents:["3x^2sin(x)+x^3cos(x)"],
    solution:[{t:"乘积法则",m:"=3x^{2}\\sin x + x^{3}\\cos x"}]});
  push({id:"G053",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(x^{3}\\cos x\\right)",answerLatex:"3x^{2}\\cos x-x^{3}\\sin x",equivalents:["3x^2cos(x)-x^3sin(x)"],
    solution:[{t:"乘积法则",m:"=3x^{2}\\cos x - x^{3}\\sin x"}]});
  push({id:"G054",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(x^{4}e^{x}\\right)",answerLatex:"4x^{3}e^{x}+x^{4}e^{x}",equivalents:["e^x(4x^{3}+x^{4})","4x^3e^x+x^4e^x"],
    solution:[{t:"乘积法则",m:"(x^{4})'e^{x}+x^{4}(e^{x})'= 4x^{3}e^{x}+x^{4}e^{x}"}]});
  push({id:"G055",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(x^{4}\\sin x\\right)",answerLatex:"4x^{3}\\sin x+x^{4}\\cos x",equivalents:["4x^3sin(x)+x^4cos(x)"],
    solution:[{t:"乘积法则",m:"=4x^{3}\\sin x + x^{4}\\cos x"}]});
  push({id:"G056",typeKey:"prodDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(x^{4}\\cos x\\right)",answerLatex:"4x^{3}\\cos x-x^{4}\\sin x",equivalents:["4x^3cos(x)-x^4sin(x)"],
    solution:[{t:"乘积法则",m:"=4x^{3}\\cos x - x^{4}\\sin x"}]});
  push({id:"G057",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(x^{4}\\ln x\\right)",answerLatex:"4x^{3}\\ln x+x^{3}",equivalents:["4x^3ln(x)+x^3","x^{3}(4ln(x)+1)"],
    solution:[{t:"乘积法则",m:"=4x^{3}\\ln x + x^{3}"}]});
  push({id:"G058",typeKey:"prodDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(xe^{3x}\\right)",answerLatex:"e^{3x}+3xe^{3x}",equivalents:["e^(3x)(1+3x)","e^3x+3xe^3x"],
    solution:[{t:"乘积法则",m:"=e^{3x}+3xe^{3x}"}]});
  push({id:"G059",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(x+1)\\right)",answerLatex:"2x+2",equivalents:["2x+2"],
    solution:[{t:"乘积法则",m:"=1(x+1)+1(x+1)=2x+2"}]});
  push({id:"G060",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(x+3)\\right)",answerLatex:"2x+4",equivalents:["2x+4"],
    solution:[{t:"乘积法则",m:"=1(x+3)+1(x+1)=2x+4"}]});
  push({id:"G061",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(x+4)\\right)",answerLatex:"2x+5",equivalents:["2x+5"],
    solution:[{t:"乘积法则",m:"=1(x+4)+1(x+1)=2x+5"}]});
  push({id:"G062",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(2x+1)\\right)",answerLatex:"4x+3",equivalents:["4x+3"],
    solution:[{t:"乘积法则",m:"=1(2x+1)+2(x+1)=4x+3"}]});
  push({id:"G063",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(2x+2)\\right)",answerLatex:"4x+4",equivalents:["4x+4"],
    solution:[{t:"乘积法则",m:"=1(2x+2)+2(x+1)=4x+4"}]});
  push({id:"G064",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(2x+3)\\right)",answerLatex:"4x+5",equivalents:["4x+5"],
    solution:[{t:"乘积法则",m:"=1(2x+3)+2(x+1)=4x+5"}]});
  push({id:"G065",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(2x+4)\\right)",answerLatex:"4x+6",equivalents:["4x+6"],
    solution:[{t:"乘积法则",m:"=1(2x+4)+2(x+1)=4x+6"}]});
  push({id:"G066",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(3x+1)\\right)",answerLatex:"6x+4",equivalents:["6x+4"],
    solution:[{t:"乘积法则",m:"=1(3x+1)+3(x+1)=6x+4"}]});
  push({id:"G067",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(3x+2)\\right)",answerLatex:"6x+5",equivalents:["6x+5"],
    solution:[{t:"乘积法则",m:"=1(3x+2)+3(x+1)=6x+5"}]});
  push({id:"G068",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(3x+3)\\right)",answerLatex:"6x+6",equivalents:["6x+6"],
    solution:[{t:"乘积法则",m:"=1(3x+3)+3(x+1)=6x+6"}]});
  push({id:"G069",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((x+1)(3x+4)\\right)",answerLatex:"6x+7",equivalents:["6x+7"],
    solution:[{t:"乘积法则",m:"=1(3x+4)+3(x+1)=6x+7"}]});
  push({id:"G070",typeKey:"prodDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left((2x+1)(x+1)\\right)",answerLatex:"4x+3",equivalents:["4x+3"],
    solution:[{t:"乘积法则",m:"=2(x+1)+1(2x+1)=4x+3"}]});
  push({id:"G071",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\sin(2x)\\right)",answerLatex:"2\\cos(2x)",equivalents:["2cos(2x)"],
    solution:[{t:"链式法则",m:"(\\sin 2x)'=2\\cos 2x"}]});
  push({id:"G072",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\tan(2x)\\right)",answerLatex:"2\\sec^{2}(2x)",equivalents:["2sec^2(2x)"],
    solution:[{t:"链式法则",m:"=2\\sec^{2}(2x)"}]});
  push({id:"G073",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(e^{2x}\\right)",answerLatex:"2e^{2x}",equivalents:["2e^(2x)","2exp(2x)"],
    solution:[{t:"链式法则",m:"=2e^{2x}"}]});
  push({id:"G074",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{2x+1}\\right)",answerLatex:"\\frac{2}{2\\sqrt{2x+1}}",equivalents:["2/(2sqrt(2x+1))"],
    solution:[{t:"链式法则",m:"=2/(2\\sqrt{2x+1})"}]});
  push({id:"G075",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{2x+2}\\right)",answerLatex:"\\frac{2}{2\\sqrt{2x+2}}",equivalents:["2/(2sqrt(2x+2))"],
    solution:[{t:"链式法则",m:"=2/(2\\sqrt{2x+2})"}]});
  push({id:"G076",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{2x+3}\\right)",answerLatex:"\\frac{2}{2\\sqrt{2x+3}}",equivalents:["2/(2sqrt(2x+3))"],
    solution:[{t:"链式法则",m:"=2/(2\\sqrt{2x+3})"}]});
  push({id:"G077",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{2x+4}\\right)",answerLatex:"\\frac{2}{2\\sqrt{2x+4}}",equivalents:["2/(2sqrt(2x+4))"],
    solution:[{t:"链式法则",m:"=2/(2\\sqrt{2x+4})"}]});
  push({id:"G078",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\cos(3x)\\right)",answerLatex:"-3\\sin(3x)",equivalents:["-3sin(3x)"],
    solution:[{t:"链式法则",m:"=3\\cdot(-\\sin 3x)"}]});
  push({id:"G079",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\tan(3x)\\right)",answerLatex:"3\\sec^{2}(3x)",equivalents:["3sec^2(3x)"],
    solution:[{t:"链式法则",m:"=3\\sec^{2}(3x)"}]});
  push({id:"G080",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(\\ln(3x+1)\\right)",answerLatex:"\\frac{3}{3x+1}",equivalents:["3/(3x+1)"],
    solution:[{t:"链式法则",m:"=3/(3x+1)"}]});
  push({id:"G081",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{3x+1}\\right)",answerLatex:"\\frac{3}{2\\sqrt{3x+1}}",equivalents:["3/(2sqrt(3x+1))"],
    solution:[{t:"链式法则",m:"=3/(2\\sqrt{3x+1})"}]});
  push({id:"G082",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{3x+2}\\right)",answerLatex:"\\frac{3}{2\\sqrt{3x+2}}",equivalents:["3/(2sqrt(3x+2))"],
    solution:[{t:"链式法则",m:"=3/(2\\sqrt{3x+2})"}]});
  push({id:"G083",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{3x+3}\\right)",answerLatex:"\\frac{3}{2\\sqrt{3x+3}}",equivalents:["3/(2sqrt(3x+3))"],
    solution:[{t:"链式法则",m:"=3/(2\\sqrt{3x+3})"}]});
  push({id:"G084",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{3x+4}\\right)",answerLatex:"\\frac{3}{2\\sqrt{3x+4}}",equivalents:["3/(2sqrt(3x+4))"],
    solution:[{t:"链式法则",m:"=3/(2\\sqrt{3x+4})"}]});
  push({id:"G085",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\sin(4x)\\right)",answerLatex:"4\\cos(4x)",equivalents:["4cos(4x)"],
    solution:[{t:"链式法则",m:"(\\sin 4x)'=4\\cos 4x"}]});
  push({id:"G086",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\cos(4x)\\right)",answerLatex:"-4\\sin(4x)",equivalents:["-4sin(4x)"],
    solution:[{t:"链式法则",m:"=4\\cdot(-\\sin 4x)"}]});
  push({id:"G087",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\tan(4x)\\right)",answerLatex:"4\\sec^{2}(4x)",equivalents:["4sec^2(4x)"],
    solution:[{t:"链式法则",m:"=4\\sec^{2}(4x)"}]});
  push({id:"G088",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(e^{4x}\\right)",answerLatex:"4e^{4x}",equivalents:["4e^(4x)","4exp(4x)"],
    solution:[{t:"链式法则",m:"=4e^{4x}"}]});
  push({id:"G089",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(\\ln(4x+1)\\right)",answerLatex:"\\frac{4}{4x+1}",equivalents:["4/(4x+1)"],
    solution:[{t:"链式法则",m:"=4/(4x+1)"}]});
  push({id:"G090",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{4x+1}\\right)",answerLatex:"\\frac{4}{2\\sqrt{4x+1}}",equivalents:["4/(2sqrt(4x+1))"],
    solution:[{t:"链式法则",m:"=4/(2\\sqrt{4x+1})"}]});
  push({id:"G091",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{4x+2}\\right)",answerLatex:"\\frac{4}{2\\sqrt{4x+2}}",equivalents:["4/(2sqrt(4x+2))"],
    solution:[{t:"链式法则",m:"=4/(2\\sqrt{4x+2})"}]});
  push({id:"G092",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{4x+3}\\right)",answerLatex:"\\frac{4}{2\\sqrt{4x+3}}",equivalents:["4/(2sqrt(4x+3))"],
    solution:[{t:"链式法则",m:"=4/(2\\sqrt{4x+3})"}]});
  push({id:"G093",typeKey:"chainDer",funcCategory:"poly",var:"x",statement:"\\frac{d}{dx}\\left(\\sqrt{4x+4}\\right)",answerLatex:"\\frac{4}{2\\sqrt{4x+4}}",equivalents:["4/(2sqrt(4x+4))"],
    solution:[{t:"链式法则",m:"=4/(2\\sqrt{4x+4})"}]});
  push({id:"G094",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\cos(5x)\\right)",answerLatex:"-5\\sin(5x)",equivalents:["-5sin(5x)"],
    solution:[{t:"链式法则",m:"=5\\cdot(-\\sin 5x)"}]});
  push({id:"G095",typeKey:"chainDer",funcCategory:"trig",var:"x",statement:"\\frac{d}{dx}\\left(\\tan(5x)\\right)",answerLatex:"5\\sec^{2}(5x)",equivalents:["5sec^2(5x)"],
    solution:[{t:"链式法则",m:"=5\\sec^{2}(5x)"}]});
  push({id:"G096",typeKey:"chainDer",funcCategory:"expLn",var:"x",statement:"\\frac{d}{dx}\\left(e^{5x}\\right)",answerLatex:"5e^{5x}",equivalents:["5e^(5x)","5exp(5x)"],
    solution:[{t:"链式法则",m:"=5e^{5x}"}]});
  push({id:"G097",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x\\,dx",answerLatex:"\\frac{1}{2}x^{2}+C",equivalents:["x^2/2","(1)/(2)x^2+C"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"\\int xdx=\\frac{x^{2}}{2}+C"}]});
  push({id:"G098",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x^{4}\\,dx",answerLatex:"\\frac{1}{5}x^{5}+C",equivalents:["x^5/5","(1)/(5)x^5+C"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"\\int x^{4}dx=\\frac{x^{5}}{5}+C"}]});
  push({id:"G099",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x^{5}\\,dx",answerLatex:"\\frac{1}{6}x^{6}+C",equivalents:["x^6/6","(1)/(6)x^6+C"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"\\int x^{5}dx=\\frac{x^{6}}{6}+C"}]});
  push({id:"G100",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int x^{6}\\,dx",answerLatex:"\\frac{1}{7}x^{7}+C",equivalents:["x^7/7","(1)/(7)x^7+C"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"\\int x^{6}dx=\\frac{x^{7}}{7}+C"}]});
  push({id:"G101",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 2x^{2}\\,dx",answerLatex:"\\frac{2}{3}x^{3}+C",equivalents:["(2)/(3)x^3+C","2x^3/3"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{2x^{3}}{3}+C"}]});
  push({id:"G102",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 2x^{3}\\,dx",answerLatex:"\\frac{1}{2}x^{4}+C",equivalents:["(1)/(2)x^4+C","2x^4/4"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{2x^{4}}{4}+C"}]});
  push({id:"G103",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 2x^{4}\\,dx",answerLatex:"\\frac{2}{5}x^{5}+C",equivalents:["(2)/(5)x^5+C","2x^5/5"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{2x^{5}}{5}+C"}]});
  push({id:"G104",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 2x^{5}\\,dx",answerLatex:"\\frac{1}{3}x^{6}+C",equivalents:["(1)/(3)x^6+C","2x^6/6"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{2x^{6}}{6}+C"}]});
  push({id:"G105",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int 2e^{x}\\,dx",answerLatex:"2e^{x}+C",equivalents:["2e^x","2exp(x)"],flags:{indef:true},
    solution:[{t:"指数积分",m:"=2e^{x}+C"}]});
  push({id:"G106",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 3x^{2}\\,dx",answerLatex:"1x^{3}+C",equivalents:["1x^3+C","3x^3/3"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{3x^{3}}{3}+C"}]});
  push({id:"G107",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 3x^{3}\\,dx",answerLatex:"\\frac{3}{4}x^{4}+C",equivalents:["(3)/(4)x^4+C","3x^4/4"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{3x^{4}}{4}+C"}]});
  push({id:"G108",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 3x^{4}\\,dx",answerLatex:"\\frac{3}{5}x^{5}+C",equivalents:["(3)/(5)x^5+C","3x^5/5"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{3x^{5}}{5}+C"}]});
  push({id:"G109",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 3x^{5}\\,dx",answerLatex:"\\frac{1}{2}x^{6}+C",equivalents:["(1)/(2)x^6+C","3x^6/6"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{3x^{6}}{6}+C"}]});
  push({id:"G110",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int 3e^{x}\\,dx",answerLatex:"3e^{x}+C",equivalents:["3e^x","3exp(x)"],flags:{indef:true},
    solution:[{t:"指数积分",m:"=3e^{x}+C"}]});
  push({id:"G111",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int \\frac{3}{x}\\,dx",answerLatex:"3\\ln|x|+C",equivalents:["3ln(x)","3ln|x|"],flags:{indef:true},
    solution:[{t:"对数积分",m:"\\int 3/x dx=3\\ln|x|+C"}]});
  push({id:"G112",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 4x^{2}\\,dx",answerLatex:"\\frac{4}{3}x^{3}+C",equivalents:["(4)/(3)x^3+C","4x^3/3"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{4x^{3}}{3}+C"}]});
  push({id:"G113",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 4x^{3}\\,dx",answerLatex:"1x^{4}+C",equivalents:["1x^4+C","4x^4/4"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{4x^{4}}{4}+C"}]});
  push({id:"G114",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 4x^{4}\\,dx",answerLatex:"\\frac{4}{5}x^{5}+C",equivalents:["(4)/(5)x^5+C","4x^5/5"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{4x^{5}}{5}+C"}]});
  push({id:"G115",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 4x^{5}\\,dx",answerLatex:"\\frac{2}{3}x^{6}+C",equivalents:["(2)/(3)x^6+C","4x^6/6"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{4x^{6}}{6}+C"}]});
  push({id:"G116",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int 4e^{x}\\,dx",answerLatex:"4e^{x}+C",equivalents:["4e^x","4exp(x)"],flags:{indef:true},
    solution:[{t:"指数积分",m:"=4e^{x}+C"}]});
  push({id:"G117",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int \\frac{4}{x}\\,dx",answerLatex:"4\\ln|x|+C",equivalents:["4ln(x)","4ln|x|"],flags:{indef:true},
    solution:[{t:"对数积分",m:"\\int 4/x dx=4\\ln|x|+C"}]});
  push({id:"G118",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 5x^{2}\\,dx",answerLatex:"\\frac{5}{3}x^{3}+C",equivalents:["(5)/(3)x^3+C","5x^3/3"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{5x^{3}}{3}+C"}]});
  push({id:"G119",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 5x^{3}\\,dx",answerLatex:"\\frac{5}{4}x^{4}+C",equivalents:["(5)/(4)x^4+C","5x^4/4"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{5x^{4}}{4}+C"}]});
  push({id:"G120",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 5x^{4}\\,dx",answerLatex:"1x^{5}+C",equivalents:["1x^5+C","5x^5/5"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{5x^{5}}{5}+C"}]});
  push({id:"G121",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 5x^{5}\\,dx",answerLatex:"\\frac{5}{6}x^{6}+C",equivalents:["(5)/(6)x^6+C","5x^6/6"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{5x^{6}}{6}+C"}]});
  push({id:"G122",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int 5e^{x}\\,dx",answerLatex:"5e^{x}+C",equivalents:["5e^x","5exp(x)"],flags:{indef:true},
    solution:[{t:"指数积分",m:"=5e^{x}+C"}]});
  push({id:"G123",typeKey:"simpleInt",funcCategory:"expLn",var:"x",statement:"\\int \\frac{5}{x}\\,dx",answerLatex:"5\\ln|x|+C",equivalents:["5ln(x)","5ln|x|"],flags:{indef:true},
    solution:[{t:"对数积分",m:"\\int 5/x dx=5\\ln|x|+C"}]});
  push({id:"G124",typeKey:"simpleInt",funcCategory:"poly",var:"x",statement:"\\int 6x^{2}\\,dx",answerLatex:"2x^{3}+C",equivalents:["2x^3+C","6x^3/3"],flags:{indef:true},
    solution:[{t:"幂的积分",m:"=\\frac{6x^{3}}{3}+C"}]});
  push({id:"G125",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+1\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(x^{2}+1\\right)^{2}+C",equivalents:["(1)/(2)(x^2+1)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+1",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G126",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+1\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(x^{2}+1\\right)^{3}+C",equivalents:["(1)/(3)(x^2+1)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+1",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G127",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+2\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(x^{2}+2\\right)^{2}+C",equivalents:["(1)/(2)(x^2+2)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+2",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G128",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+2\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(x^{2}+2\\right)^{3}+C",equivalents:["(1)/(3)(x^2+2)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+2",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G129",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+2\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(x^{2}+2\\right)^{4}+C",equivalents:["(1)/(4)(x^2+2)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+2",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G130",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+3\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(x^{2}+3\\right)^{2}+C",equivalents:["(1)/(2)(x^2+3)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+3",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G131",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+3\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(x^{2}+3\\right)^{3}+C",equivalents:["(1)/(3)(x^2+3)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+3",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G132",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+3\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(x^{2}+3\\right)^{4}+C",equivalents:["(1)/(4)(x^2+3)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+3",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G133",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+4\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(x^{2}+4\\right)^{2}+C",equivalents:["(1)/(2)(x^2+4)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+4",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G134",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+4\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(x^{2}+4\\right)^{3}+C",equivalents:["(1)/(3)(x^2+4)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+4",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G135",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 2x\\left(x^{2}+4\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(x^{2}+4\\right)^{4}+C",equivalents:["(1)/(4)(x^2+4)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = x²+4",m:"du=2x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G136",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+1\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(2x^{2}+1\\right)^{2}+C",equivalents:["(1)/(2)(2x^2+1)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+1",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G137",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+1\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(2x^{2}+1\\right)^{3}+C",equivalents:["(1)/(3)(2x^2+1)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+1",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G138",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+1\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(2x^{2}+1\\right)^{4}+C",equivalents:["(1)/(4)(2x^2+1)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+1",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G139",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+2\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(2x^{2}+2\\right)^{2}+C",equivalents:["(1)/(2)(2x^2+2)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+2",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G140",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+2\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(2x^{2}+2\\right)^{3}+C",equivalents:["(1)/(3)(2x^2+2)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+2",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G141",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+2\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(2x^{2}+2\\right)^{4}+C",equivalents:["(1)/(4)(2x^2+2)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+2",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G142",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+3\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(2x^{2}+3\\right)^{2}+C",equivalents:["(1)/(2)(2x^2+3)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+3",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G143",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+3\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(2x^{2}+3\\right)^{3}+C",equivalents:["(1)/(3)(2x^2+3)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+3",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G144",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+3\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(2x^{2}+3\\right)^{4}+C",equivalents:["(1)/(4)(2x^2+3)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+3",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G145",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+4\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(2x^{2}+4\\right)^{2}+C",equivalents:["(1)/(2)(2x^2+4)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+4",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G146",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+4\\right)^{2}\\,dx",answerLatex:"\\frac{1}{3}\\left(2x^{2}+4\\right)^{3}+C",equivalents:["(1)/(3)(2x^2+4)^3+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+4",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{3}}{3}+C"}]});
  push({id:"G147",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 4x\\left(2x^{2}+4\\right)^{3}\\,dx",answerLatex:"\\frac{1}{4}\\left(2x^{2}+4\\right)^{4}+C",equivalents:["(1)/(4)(2x^2+4)^4+C"],flags:{indef:true},
    solution:[{t:"换元：u = 2x²+4",m:"du=4x\\,dx\\;\\Rightarrow\\; \\frac{u^{4}}{4}+C"}]});
  push({id:"G148",typeKey:"subsInt",funcCategory:"poly",var:"x",statement:"\\int 6x\\left(3x^{2}+1\\right)\\,dx",answerLatex:"\\frac{1}{2}\\left(3x^{2}+1\\right)^{2}+C",equivalents:["(1)/(2)(3x^2+1)^2+C"],flags:{indef:true},
    solution:[{t:"换元：u = 3x²+1",m:"du=6x\\,dx\\;\\Rightarrow\\; \\frac{u^{2}}{2}+C"}]});
  push({id:"G149",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int xe^{1x}\\,dx",answerLatex:"e^{x}\\left(x-1\\right)+C",equivalents:["e^x(x-1)"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=\\frac{xe^{1x}}{1}-\\int \\frac{e^{1x}}{1}\\,dx"}]});
  push({id:"G150",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int x^{2}e^{2x}\\,dx",answerLatex:"e^{2x}\\left(\\frac{x^{2}}{2}-\\frac{x}{2}+\\frac{1}{4}\\right)+C",equivalents:["e^(2x)(x^2/2-x/2+1/4)"],flags:{indef:true},
    solution:[{t:"两次分部",m:"=e^{2x}(x^{2}/2-x/2+1/4)+C"}]});
  push({id:"G151",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x^{2}\\sin x\\,dx",answerLatex:"-x^{2}\\cos x+2x\\sin x+2\\cos x+C",equivalents:["-x^2cos(x)+2xsin(x)+2cos(x)"],flags:{indef:true},
    solution:[{t:"两次分部",m:"=-x^{2}\\cos x+2x\\sin x+2\\cos x+C"}]});
  push({id:"G152",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x^{2}\\cos x\\,dx",answerLatex:"x^{2}\\sin x+2x\\cos x-2\\sin x+C",equivalents:["x^2sin(x)+2xcos(x)-2sin(x)"],flags:{indef:true},
    solution:[{t:"两次分部",m:"=x^{2}\\sin x+2x\\cos x-2\\sin x+C"}]});
  push({id:"G153",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int xe^{-x}\\,dx",answerLatex:"-e^{-x}(x+1)+C",equivalents:["-e^(-x)(x+1)"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=-e^{-x}(x+1)+C"}]});
  push({id:"G154",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int x^{3}\\ln x\\,dx",answerLatex:"\\frac{x^{4}}{4}\\ln x-\\frac{x^{4}}{16}+C",equivalents:["x^4/4*ln(x)-x^4/16"],flags:{indef:true},
    solution:[{t:"分部积分：u = ln x",m:"=\\frac{x^{4}}{4}\\ln x-\\int \\frac{x^{3}}{4}\\,dx"}]});
  push({id:"G155",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int (x+1)e^{x}\\,dx",answerLatex:"xe^{x}+C",equivalents:["x*e^x"],flags:{indef:true},
    solution:[{t:"分部积分：u = x+1",m:"=xe^{x}+C"}]});
  push({id:"G156",typeKey:"byPartsInt",funcCategory:"expLn",var:"x",statement:"\\int x^{2}e^{-x}\\,dx",answerLatex:"-e^{-x}(x^{2}+2x+2)+C",equivalents:["-e^(-x)(x^2+2x+2)"],flags:{indef:true},
    solution:[{t:"两次分部",m:"=-e^{-x}(x^{2}+2x+2)+C"}]});
  push({id:"G157",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x\\sin(2x)\\,dx",answerLatex:"-\\frac{x\\cos(2x)}{2}+\\frac{\\sin(2x)}{4}+C",equivalents:["-(xcos (2x))/(2)+(sin (2x))/(4)+C"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=-\\frac{x\\cos 2x}{2}+\\int \\frac{\\cos 2x}{2}\\,dx"}]});
  push({id:"G158",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x\\cos(2x)\\,dx",answerLatex:"\\frac{x\\sin(2x)}{2}+\\frac{\\cos(2x)}{4}+C",equivalents:["(xsin (2x))/(2)+(cos (2x))/(4)+C"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=\\frac{x\\sin 2x}{2}-\\int \\frac{\\sin 2x}{2}\\,dx"}]});
  push({id:"G159",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x\\sin(3x)\\,dx",answerLatex:"-\\frac{x\\cos(3x)}{3}+\\frac{\\sin(3x)}{9}+C",equivalents:["-(xcos (3x))/(3)+(sin (3x))/(9)+C"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=-\\frac{x\\cos 3x}{3}+\\int \\frac{\\cos 3x}{3}\\,dx"}]});
  push({id:"G160",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int x\\cos(3x)\\,dx",answerLatex:"\\frac{x\\sin(3x)}{3}+\\frac{\\cos(3x)}{9}+C",equivalents:["(xsin (3x))/(3)+(cos (3x))/(9)+C"],flags:{indef:true},
    solution:[{t:"分部积分：u = x",m:"=\\frac{x\\sin 3x}{3}-\\int \\frac{\\sin 3x}{3}\\,dx"}]});
  push({id:"G161",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{1x}\\sin(2x)\\,dx",answerLatex:"\\frac{e^{1x}(1\\sin(2x)-2\\cos(2x))}{5}+C",equivalents:["\\frace^1x(1sin (2x)-2cos (2x))5+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{1x}(1\\sin 2x-2\\cos 2x)}{5}+C"}]});
  push({id:"G162",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{1x}\\cos(2x)\\,dx",answerLatex:"\\frac{e^{1x}(1\\cos(2x)+2\\sin(2x))}{5}+C",equivalents:["\\frace^1x(1cos (2x)+2sin (2x))5+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{1x}(1\\cos 2x+2\\sin 2x)}{5}+C"}]});
  push({id:"G163",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{1x}\\sin(3x)\\,dx",answerLatex:"\\frac{e^{1x}(1\\sin(3x)-3\\cos(3x))}{10}+C",equivalents:["\\frace^1x(1sin (3x)-3cos (3x))10+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{1x}(1\\sin 3x-3\\cos 3x)}{10}+C"}]});
  push({id:"G164",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{1x}\\cos(3x)\\,dx",answerLatex:"\\frac{e^{1x}(1\\cos(3x)+3\\sin(3x))}{10}+C",equivalents:["\\frace^1x(1cos (3x)+3sin (3x))10+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{1x}(1\\cos 3x+3\\sin 3x)}{10}+C"}]});
  push({id:"G165",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{2x}\\sin(2x)\\,dx",answerLatex:"\\frac{e^{2x}(2\\sin(2x)-2\\cos(2x))}{8}+C",equivalents:["\\frace^2x(2sin (2x)-2cos (2x))8+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{2x}(2\\sin 2x-2\\cos 2x)}{8}+C"}]});
  push({id:"G166",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{2x}\\cos(2x)\\,dx",answerLatex:"\\frac{e^{2x}(2\\cos(2x)+2\\sin(2x))}{8}+C",equivalents:["\\frace^2x(2cos (2x)+2sin (2x))8+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{2x}(2\\cos 2x+2\\sin 2x)}{8}+C"}]});
  push({id:"G167",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{2x}\\sin(3x)\\,dx",answerLatex:"\\frac{e^{2x}(2\\sin(3x)-3\\cos(3x))}{13}+C",equivalents:["\\frace^2x(2sin (3x)-3cos (3x))13+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{2x}(2\\sin 3x-3\\cos 3x)}{13}+C"}]});
  push({id:"G168",typeKey:"byPartsInt",funcCategory:"trig",var:"x",statement:"\\int e^{2x}\\cos(3x)\\,dx",answerLatex:"\\frac{e^{2x}(2\\cos(3x)+3\\sin(3x))}{13}+C",equivalents:["\\frace^2x(2cos (3x)+3sin (3x))13+C"],flags:{indef:true},
    solution:[{t:"两次分部回代",m:"=\\frac{e^{2x}(2\\cos 3x+3\\sin 3x)}{13}+C"}]});
  push({id:"G169",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{1}x\\,dx",answerLatex:"\\frac{1}{2}",numericValue:0.5,equivalents:["0.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G170",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}x\\,dx",answerLatex:"2",numericValue:2,equivalents:["2"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G171",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{3}x\\,dx",answerLatex:"\\frac{9}{2}",numericValue:4.5,equivalents:["4.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G172",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{2}x\\,dx",answerLatex:"\\frac{3}{2}",numericValue:1.5,equivalents:["1.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G173",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{3}x\\,dx",answerLatex:"4",numericValue:4,equivalents:["4"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G174",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{4}x\\,dx",answerLatex:"\\frac{15}{2}",numericValue:7.5,equivalents:["7.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G175",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{3}x\\,dx",answerLatex:"\\frac{5}{2}",numericValue:2.5,equivalents:["2.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G176",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{4}x\\,dx",answerLatex:"6",numericValue:6,equivalents:["6"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G177",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{5}x\\,dx",answerLatex:"\\frac{21}{2}",numericValue:10.5,equivalents:["10.5"],
    solution:[{t:"原函数",m:"\\frac{x^{2}}{2}"}]});
  push({id:"G178",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}x^{2}\\,dx",answerLatex:"\\frac{8}{3}",numericValue:2.6666667,equivalents:["2.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G179",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{3}x^{2}\\,dx",answerLatex:"9",numericValue:9,equivalents:["9"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G180",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{2}x^{2}\\,dx",answerLatex:"\\frac{7}{3}",numericValue:2.3333333,equivalents:["2.333333"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G181",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{3}x^{2}\\,dx",answerLatex:"\\frac{26}{3}",numericValue:8.6666667,equivalents:["8.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G182",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{4}x^{2}\\,dx",answerLatex:"21",numericValue:21,equivalents:["21"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G183",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{3}x^{2}\\,dx",answerLatex:"\\frac{19}{3}",numericValue:6.3333333,equivalents:["6.333333"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G184",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{4}x^{2}\\,dx",answerLatex:"\\frac{56}{3}",numericValue:18.6666667,equivalents:["18.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G185",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{5}x^{2}\\,dx",answerLatex:"39",numericValue:39,equivalents:["39"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}"}]});
  push({id:"G186",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{1}x^{3}\\,dx",answerLatex:"\\frac{1}{4}",numericValue:0.25,equivalents:["0.25"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G187",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{3}x^{3}\\,dx",answerLatex:"\\frac{81}{4}",numericValue:20.25,equivalents:["20.25"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G188",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{2}x^{3}\\,dx",answerLatex:"\\frac{15}{4}",numericValue:3.75,equivalents:["3.75"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G189",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{3}x^{3}\\,dx",answerLatex:"20",numericValue:20,equivalents:["20"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G190",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{4}x^{3}\\,dx",answerLatex:"\\frac{255}{4}",numericValue:63.75,equivalents:["63.75"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G191",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{3}x^{3}\\,dx",answerLatex:"\\frac{65}{4}",numericValue:16.25,equivalents:["16.25"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G192",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{4}x^{3}\\,dx",answerLatex:"60",numericValue:60,equivalents:["60"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G193",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{5}x^{3}\\,dx",answerLatex:"\\frac{609}{4}",numericValue:152.25,equivalents:["152.25"],
    solution:[{t:"原函数",m:"\\frac{x^{4}}{4}"}]});
  push({id:"G194",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{1}x^{4}\\,dx",answerLatex:"\\frac{1}{5}",numericValue:0.2,equivalents:["0.2"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G195",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}x^{4}\\,dx",answerLatex:"\\frac{32}{5}",numericValue:6.4,equivalents:["6.4"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G196",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{3}x^{4}\\,dx",answerLatex:"\\frac{243}{5}",numericValue:48.6,equivalents:["48.6"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G197",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{2}x^{4}\\,dx",answerLatex:"\\frac{31}{5}",numericValue:6.2,equivalents:["6.2"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G198",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{3}x^{4}\\,dx",answerLatex:"\\frac{242}{5}",numericValue:48.4,equivalents:["48.4"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G199",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{1}^{4}x^{4}\\,dx",answerLatex:"\\frac{1023}{5}",numericValue:204.6,equivalents:["204.6"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G200",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{3}x^{4}\\,dx",answerLatex:"\\frac{211}{5}",numericValue:42.2,equivalents:["42.2"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G201",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{4}x^{4}\\,dx",answerLatex:"\\frac{992}{5}",numericValue:198.4,equivalents:["198.4"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G202",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{2}^{5}x^{4}\\,dx",answerLatex:"\\frac{3093}{5}",numericValue:618.6,equivalents:["618.6"],
    solution:[{t:"原函数",m:"\\frac{x^{5}}{5}"}]});
  push({id:"G203",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(x^{2}+1)\\,dx",answerLatex:"\\frac{14}{3}",numericValue:4.6666667,equivalents:["4.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}+x"}]});
  push({id:"G204",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(x^{2}+2)\\,dx",answerLatex:"\\frac{20}{3}",numericValue:6.6666667,equivalents:["6.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}+2x"}]});
  push({id:"G205",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(x^{2}+3)\\,dx",answerLatex:"\\frac{26}{3}",numericValue:8.6666667,equivalents:["8.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}+3x"}]});
  push({id:"G206",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(x^{2}+4)\\,dx",answerLatex:"\\frac{32}{3}",numericValue:10.6666667,equivalents:["10.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}+4x"}]});
  push({id:"G207",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(x^{2}+5)\\,dx",answerLatex:"\\frac{38}{3}",numericValue:12.6666667,equivalents:["12.666667"],
    solution:[{t:"原函数",m:"\\frac{x^{3}}{3}+5x"}]});
  push({id:"G208",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(2x^{2}+1)\\,dx",answerLatex:"\\frac{22}{3}",numericValue:7.3333333,equivalents:["7.333333"],
    solution:[{t:"原函数",m:"\\frac{2x^{3}}{3}+x"}]});
  push({id:"G209",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(2x^{2}+2)\\,dx",answerLatex:"\\frac{28}{3}",numericValue:9.3333333,equivalents:["9.333333"],
    solution:[{t:"原函数",m:"\\frac{2x^{3}}{3}+2x"}]});
  push({id:"G210",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(2x^{2}+3)\\,dx",answerLatex:"\\frac{34}{3}",numericValue:11.3333333,equivalents:["11.333333"],
    solution:[{t:"原函数",m:"\\frac{2x^{3}}{3}+3x"}]});
  push({id:"G211",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(2x^{2}+4)\\,dx",answerLatex:"\\frac{40}{3}",numericValue:13.3333333,equivalents:["13.333333"],
    solution:[{t:"原函数",m:"\\frac{2x^{3}}{3}+4x"}]});
  push({id:"G212",typeKey:"defInt",funcCategory:"poly",var:"x",statement:"\\int _{0}^{2}(2x^{2}+5)\\,dx",answerLatex:"\\frac{46}{3}",numericValue:15.3333333,equivalents:["15.333333"],
    solution:[{t:"原函数",m:"\\frac{2x^{3}}{3}+5x"}]});

  /* ---------- 状态 ---------- */
  const state = {
    types: new Set(TYPES.map(t=>t.key)),
    funcs: new Set(FUNC.map(f=>f.key)),
    varMode: "any",
    showSoln: "no",
    current: null,        // 当前题目对象
    attempt: 0,           // 本题已提交次数
    answered: false,      // 本题是否已提交过
    phase: "answer",      // 回车阶段：answer=待判分；revealed=已判分，再按回车进入下一题
    lastSubmitted: "",    // 最近一次判分时的输入内容（用于判断是否已修改答案）
    stats: {}             // per typeKey: {gen,correct,error,lastFive:[],skip,resub}
  };
  TYPES.forEach(t=> state.stats[t.key]=newStat());
  function newStat(){ return {gen:0,correct:0,error:0,lastFive:[],skip:0,resub:0}; }

  /* ---------- 持久化 ---------- */
  function persist(){ try{ store.set(JSON.stringify({stats:state.stats})); }catch(e){} }
  function restore(){
    const raw = store.get();
    if(!raw) return;
    try{
      const d = JSON.parse(raw);
      if(d && d.stats){ TYPES.forEach(t=>{ if(d.stats[t.key]) state.stats[t.key]=Object.assign(newStat(), d.stats[t.key]); }); }
    }catch(e){}
  }

  /* ---------- LaTeX / 表达式归一化 ---------- */
  function normalize(s){
    if(s==null) return "";
    s = String(s).replace(/[（）]/g,m=>m==="（"?"(":")");
    // Unicode 数学符号 → ASCII（支持用户直接输入 π、−、×、√、² 等）
    s = s.replace(/π/g,"pi").replace(/[−–—]/g,"-").replace(/[×·∙]/g,"*").replace(/÷/g,"/")
         .replace(/√/g,"sqrt").replace(/¹/g,"^1").replace(/²/g,"^2").replace(/³/g,"^3");
    s = s.replace(/\\[,;:!.\s]/g,"").replace(/\\left|\\right|\\quad|\\qquad|\\displaystyle|\\limits/g,"");
    s = s.replace(/\\cdot|\\times/g,"");
    s = s.replace(/\\[dt]frac/g,"\\frac");
    for(let i=0;i<6;i++){ const ns=s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,"($1)/($2)"); if(ns===s)break; s=ns; }
    s = s.replace(/\\sqrt\{([^{}]*)\}/g,"sqrt($1)").replace(/\\sqrt/g,"sqrt");
    s = s.replace(/\\ln|\\log/g,"ln");
    s = s.replace(/\\(sin|cos|tan|sec|csc|cot|exp)/g,"$1");
    s = s.replace(/\\pi/g,"pi");
    s = s.replace(/\\[a-zA-Z]+/g,"").replace(/\\/g,"");
    for(let i=0;i<6;i++){ const ns=s.replace(/\^\{([^{}]*)\}/g,(m,g)=>(/^[-+]?\d+(?:\.\d+)?$/.test(g)||/^[a-zA-Z]$/.test(g))?"^"+g:"^("+g+")"); if(ns===s)break; s=ns; }
    s = s.replace(/[{}]/g,"").replace(/\s+/g,"");
    // 三角函数幂次规范化：cos^2 x / cos^2(x) / (cos x)^2 统一为 (cos(x))^2
    const TRIG='sin|cos|tan|cot|sec|csc';
    s = s.replace(new RegExp('\\(('+TRIG+')([^()]+)\\)\\^(-?\\d+)','g'),'($1($2))^$3');   // (cosx)^2
    s = s.replace(new RegExp('('+TRIG+')\\^(-?\\d+)\\(([^()]*)\\)','g'),'($1($3))^$2');    // cos^2(x)
    s = s.replace(new RegExp('('+TRIG+')\\^(-?\\d+)([a-z0-9]+)','g'),'($1($3))^$2');       // cos^2x
    return s;
  }
  function stripConst(s){ return s.replace(/[+\-]?C/gi,(m)=> (/[+\-]/.test(m)? "": "")).replace(/C\b/g,"").replace(/c\b/g,m=>m); }
  // 更稳的 +C 剥离：去掉结尾的 +/- C 与裸 C（大写，避免误伤 cos）
  function dropC(s){ return s.replace(/[+\-]\s*C\b/gi,"").replace(/\bC\b/g,""); }

  function normKey(s){ return dropC(normalize(s)); }
  function parenless(s){ return s.replace(/[()]/g,""); }
  // 交换律 / 乘法记号不敏感的规范形：去 *、按顶层 +/- 拆项、逐项去括号后排序
  function termsKey(s){
    s = normKey(s).replace(/\*/g,"");
    let depth=0, terms=[], buf="";
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(c==="("||c==="["||c==="{")depth++;
      else if(c===")"||c==="]"||c==="}")depth--;
      if((c==="+"||c==="-")&&depth===0&&i>0){ terms.push(buf); buf=c; }
      else buf+=c;
    }
    terms.push(buf);
    terms=terms.filter(t=>t!=="").map(t=>t.replace(/[()]/g,""));
    terms.sort();
    return terms.join("|");
  }

  // 算术表达式递归解析，避免依赖受托管页面 CSP 禁止的动态代码执行。
  function evaluateExpression(input, scope){
    const parts=input.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z]+|\*\*|[-+*/%(),]/g)||[];
    if(parts.join("")!==input.replace(/\s+/g,"")) return null;
    let i=0;
    function primary(){
      const t=parts[i++];
      if(t==="("){const v=add();if(parts[i++]!==")") throw 0;return v;}
      if(t==null) throw 0;
      if(/^\d|^\./.test(t)) return Number(t);
      if(Object.prototype.hasOwnProperty.call(scope,t)){
        const v=scope[t]; if(typeof v!=="function") return v;
        if(parts[i++]!=="(") throw 0; const arg=add();if(parts[i++]!==")") throw 0; return v(arg);
      }
      throw 0;
    }
    function unary(){if(parts[i]==="+"){i++;return unary()} if(parts[i]==="-"){i++;return -unary()} return power()}
    function power(){let v=primary();if(parts[i]==="**"){i++;v=Math.pow(v,unary())}return v}
    function mul(){let v=unary();while(["*","/","%"].includes(parts[i])){let op=parts[i++],n=unary();v=op==="*"?v*n:op==="/"?v/n:v%n}return v}
    function add(){let v=mul();while(parts[i]==="+"||parts[i]==="-"){let op=parts[i++],n=mul();v=op==="+"?v+n:v-n}return v}
    try{const v=add();return i===parts.length && Number.isFinite(v)?v:null}catch(e){return null}
  }

  /* ---------- 数值求值（定积分兜底判分） ---------- */
  function evalNum(s){
    let t = normalize(s);
    if(!t) return null;
    t = t.replace(/(?<![A-Za-z])e\^(\([^()]*\)|[-\w.]+)/g,"exp($1)");
    t = t.replace(/\^\*\*/g,"^").replace(/\^/g,"**");
    t = t.replace(/(?<![A-Za-z])e(?![A-Za-z])/g,"E");
    t = t.replace(/pi/g,"PI");
    if(!/^[-+*/().,%0-9A-Za-z_* ]+$/.test(t)) return null;
    const scope={sin:Math.sin,cos:Math.cos,tan:Math.tan,sec:x=>1/Math.cos(x),csc:x=>1/Math.sin(x),cot:x=>1/Math.tan(x),
      ln:Math.log,log:Math.log,exp:Math.exp,sqrt:Math.sqrt,abs:Math.abs,PI:Math.PI,E:Math.E};
    const keys=Object.keys(scope);
    // 拒绝未知标识符
    const ids=t.match(/[A-Za-z]+/g)||[];
    for(const id of ids){ if(!(id in scope)) return null; }
    try{
      const v=evaluateExpression(t,scope);
      return (typeof v==="number" && isFinite(v)) ? v : null;
    }catch(err){ return null; }
  }

  /* ---------- 数值等价（把含 x 的表达式在若干采样点求值比较） ---------- */
  const FUNCS=['sin','cos','tan','cot','sec','csc','ln','exp','sqrt','abs'];
  const JS_SCOPE={sin:Math.sin,cos:Math.cos,tan:Math.tan,cot:x=>1/Math.tan(x),sec:x=>1/Math.cos(x),csc:x=>1/Math.sin(x),
    ln:Math.log,log:Math.log,exp:Math.exp,sqrt:Math.sqrt,abs:Math.abs,PI:Math.PI,E:Math.E};
  function toJs(s){
    if(!s) return null;
    s = s.replace(/\|([^|]+)\|/g,'abs($1)');                                   // |x| -> abs(x)
    s = s.replace(/(sin|cos|tan|cot|sec|csc|ln|sqrt)([a-z0-9]+)/g,'$1($2)');   // sinx -> sin(x)
    s = s.replace(/\^/g,'**');
    s = s.replace(/(\d)\(/g,'$1*(');                                           // 2( -> 2*(
    s = s.replace(/\)\(/g,')*(');                                              // )( -> )*(
    s = s.replace(/\)([a-z0-9])/gi,')*$1');                                    // )x -> )*x
    s = s.replace(/(\d)([a-z])/gi,'$1*$2');                                    // 2x -> 2*x
    s = s.replace(/([a-z]+)\(/gi,(m,w)=> FUNCS.includes(w.toLowerCase())? m : w+'*('); // x( -> x*(
    s = s.replace(/pi/g,'PI');
    s = s.replace(/(?<![A-Za-z])e(?![A-Za-z])/g,'E');
    if(!/^[-+*/().,%0-9A-Za-z_* ]+$/.test(s)) return null;
    return s;
  }
  function evalAt(s, xv){
    let t = dropC(normalize(s));
    t = toJs(t);
    if(!t) return null;
    t = t.replace(/(?<![A-Za-z])x(?![A-Za-z])/g,'('+xv+')');
    const ids=t.match(/[A-Za-z]+/g)||[];
    for(const id of ids){ if(!(id in JS_SCOPE)) return null; }
    try{ return evaluateExpression(t,JS_SCOPE); }catch(err){ return null; }
  }
  // 判断 user 是否与某个参考式在采样点上数值等价（≥3 点吻合且 0 冲突）
  function numericEquivalent(userRaw, refLatex){
    const PTS=[0.37,0.73,1.13,1.61,2.27,2.71];
    let agree=0, bad=0;
    for(const x of PTS){
      const uv=evalAt(userRaw,x), rv=evalAt(refLatex,x);
      if(uv===null||rv===null) continue;
      if(Math.abs(uv-rv) <= 1e-3*Math.max(1,Math.abs(rv))) agree++; else bad++;
    }
    return agree>=3 && bad===0;
  }

  /* ---------- 判分 ---------- */
  const isDef = q => q.typeKey==="defInt";
  function grade(user, q){
    const raw = (user||"").trim();
    if(!raw) return {status:"empty"};
    const u = normKey(raw);

    if(isDef(q)){
      const v = evalNum(raw);
      if(v!==null && q.numericValue!=null && Math.abs(v-q.numericValue) <= 0.01*Math.max(1,Math.abs(q.numericValue))){
        return {status:"correct", alt: u!==normKey(q.answerLatex)};
      }
    }
    const cands = [q.answerLatex].concat(q.equivalents||[]).map(normKey);
    const cset = new Set(cands);
    const cp = new Set(cands.map(parenless));
    if(cset.has(u)) return {status:"correct", alt: u!==normKey(q.answerLatex)};
    if(cp.has(parenless(u))) return {status:"correct", alt: true};
    // 交换律 / * 号不敏感的兜底比较
    const tkset = new Set([q.answerLatex].concat(q.equivalents||[]).map(termsKey));
    if(tkset.has(termsKey(raw))) return {status:"correct", alt: true};

    // 数值等价兜底：处理三角幂次/倍角等符号匹配漏掉但数学等价的形式
    for(const r of [q.answerLatex].concat(q.equivalents||[])){
      if(numericEquivalent(raw, r)) return {status:"correct", alt:true};
    }

    return {status:"wrong"};
  }
  function hasKnownFn(u){ return /sin|cos|tan|sec|ln|exp|sqrt/.test(u); }

  /* ---------- 抽题 ---------- */
  function pool(){
    return Q.filter(q=> state.types.has(q.typeKey) && state.funcs.has(q.funcCategory) &&
      (state.varMode==="any" || q.var===state.varMode));
  }
  function pickQuestion(){
    const p = pool();
    if(!p.length) return null;
    // 尽量不与前一道重复
    let cand = p.filter(q=>!state.current||q.id!==state.current.id);
    if(!cand.length) cand = p;
    return cand[Math.floor(Math.random()*cand.length)];
  }

  /* ---------- DOM ---------- */
  const $ = id => document.getElementById(id);
  const els = {
    probTag:$("probTag"), probBody:$("probBody"), answerRow:$("answerRow"), input:$("answerInput"),
    feedback:$("feedback"), solBox:$("solutionBox"), solSteps:$("solutionSteps"),
    probFoot:$("probFoot"), curState:$("curState"), poolCount:$("poolCount"), funcWarn:$("funcWarn"), cHint:$("cHint")
  };

  function renderMath(el, latex, display){
    if(!el) return;
    if(window.katex){
      try{ katex.render(latex, el, {displayMode:!!display, throwOnError:false}); return; }catch(e){}
    }
    el.textContent = latex; // KaTeX 未加载时降级
  }

  /* ---------- 标签切换 ---------- */
  document.querySelectorAll(".tab").forEach(tab=>{
    tab.addEventListener("click", ()=> switchTab(tab.dataset.panel));
  });
  function switchTab(name){
    document.querySelectorAll(".tab").forEach(t=>{
      const on = t.dataset.panel===name;
      t.setAttribute("aria-selected", on?"true":"false");
    });
    document.querySelectorAll(".panel").forEach(p=>{
      p.classList.toggle("active", p.id==="panel-"+name);
    });
    if(name==="analysis") renderAnalysis();
  }

  /* ---------- 设置：题型 chips ---------- */
  const ptWrap=$("probTypeChips");
  TYPES.forEach(t=>{
    const lab=document.createElement("label"); lab.className="chip on"; lab.dataset.key=t.key;
    lab.innerHTML='<input type="checkbox" checked /><span class="box"></span>'+t.zh;
    ptWrap.appendChild(lab);
  });
  ptWrap.addEventListener("change", e=>{
    const cb=e.target; if(!cb || cb.type!=="checkbox") return;
    const lab=cb.closest(".chip"); if(!lab) return;
    lab.classList.toggle("on", cb.checked);
    cb.checked? state.types.add(lab.dataset.key) : state.types.delete(lab.dataset.key);
    updatePool();
  });

  /* ---------- 设置：函数类型 chips ---------- */
  const fcWrap=$("funcChips");
  FUNC.forEach(f=>{
    const lab=document.createElement("label"); lab.className="chip on"; lab.dataset.key=f.key;
    lab.innerHTML='<input type="checkbox" checked /><span class="box"></span>'+f.zh;
    fcWrap.appendChild(lab);
  });
  fcWrap.addEventListener("change", e=>{
    const cb=e.target; if(!cb || cb.type!=="checkbox") return;
    const lab=cb.closest(".chip"); if(!lab) return;
    lab.classList.toggle("on", cb.checked);
    cb.checked? state.funcs.add(lab.dataset.key) : state.funcs.delete(lab.dataset.key);
    updatePool();
  });

  /* ---------- 设置：分段单选 ---------- */
  wireSeg($("varSeg"), v=>{ state.varMode=v; updatePool(); });
  wireSeg($("solnSeg"), v=>{ state.showSoln=v; });
  function wireSeg(el, apply){
    el.addEventListener("click", e=>{
      const lab=e.target.closest("label"); if(!lab)return;
      const inp=lab.querySelector("input"); inp.checked=true;
      el.querySelectorAll("label").forEach(l=>l.classList.toggle("on", l===lab));
      apply(lab.dataset.value); updatePool();
    });
  }

  function updatePool(){
    const n=pool().length;
    els.poolCount.textContent=n;
    const none = state.funcs.size===0;
    els.funcWarn.style.display = none? "block":"none";
    $("btnGoPractice").disabled = (n===0);
  }

  /* ---------- 练习：生成 / 换题 ---------- */
  function markSkip(){
    if(state.current && !state.answered && state.showSoln==="no"){
      state.stats[state.current.typeKey].skip++;
      persist();
    }
  }
  function generate(){
    markSkip();
    const q = pickQuestion();
    if(!q){
      state.current=null; resetPracticeUi("没有符合当前筛选条件的题目，请在设置页放宽题型或函数类型。");
      return;
    }
    state.current=q; state.attempt=0; state.answered=false; state.phase="answer"; state.lastSubmitted="";
    if(state.showSoln==="no") state.stats[q.typeKey].gen++;
    persist();
    showQuestion(q);
  }
  function setCurState(kind){
    const el=els.curState; if(!el) return;
    if(kind==="correct"){ el.className="status-pill st-ok"; el.textContent="已答对"; }
    else if(kind==="wrong"){ el.className="status-pill st-no"; el.textContent="待订正"; }
    else { el.className="status-pill st-idle"; el.textContent="未作答"; }
  }
  function showQuestion(q){
    els.probTag.textContent = TYPESHORT[q.typeKey] + " · 变量 " + q.var;
    const indef = !!(q.flags && q.flags.indef);
    if(indef){
      els.cHint.textContent = "（不定积分可省略 + C）";
      els.input.placeholder = "例如：sin(x)+C";
    } else if(isDef(q)){
      els.cHint.textContent = "（结果为一个数值）";
      els.input.placeholder = "例如：1/3 或 0.333";
    } else {
      els.cHint.textContent = "（求导结果，不含 + C）";
      els.input.placeholder = "例如：4x^3";
    }
    els.probBody.innerHTML=""; renderMath(els.probBody, q.statement, true);
    els.answerRow.style.display="flex";
    els.probFoot.style.display="flex";
    els.input.value=""; els.input.classList.remove("err");
    els.input.disabled=false;
    $("btnSubmit").disabled=false;
    hideFeedback(); els.solBox.classList.remove("show");
    setCurState("idle");
    $("probStart").style.display="none";
    setTimeout(()=>els.input.focus(),30);
  }
  function resetPracticeUi(msg){
    els.answerRow.style.display="none";
    els.probFoot.style.display="none";
    $("probStart").style.display="block";
    els.feedback.className="feedback info show";
    els.feedback.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg><div>'+msg+'</div>';
    if(!state.current){ els.probTag.textContent="准备开始"; els.probBody.innerHTML='<span class="hint">点击下方「生成题目」开始练习。可在设置页调整题型与函数范围。</span>'; }
  }

  /* ---------- 练习：提交 ---------- */
  function submit(){
    if(!state.current){ generate(); if(!state.current) return; }
    const q=state.current;
    const res=grade(els.input.value, q);
    state.attempt++;

    if(res.status==="empty"){
      els.input.classList.add("err");
      feedback("info", "请输入答案后再提交。");
      return;
    }
    els.input.classList.remove("err");

    const recording = state.showSoln==="no";
    if(!state.answered && recording){
      state.answered=true;
      if(res.status==="correct") state.stats[q.typeKey].correct++;
      else state.stats[q.typeKey].error++;
      pushLast(q.typeKey, res.status==="correct");
      persist();
      renderAnalysisIfVisible();
    } else if(state.answered && res.status==="wrong" && recording){
      state.stats[q.typeKey].resub++; persist();
    }

    setCurState(res.status==="correct" ? "correct" : "wrong");
    state.phase="revealed";   // 已判分：未修改再按回车进入下一题
    state.lastSubmitted=els.input.value;   // 记录本次判分的输入，用于判断是否已修改

    if(res.status==="correct"){
      let html = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-11"/></svg>';
      html += '<div>这个答案是正确的。'+(recording?"":"<span class='hint'>（未计入分析）</span>");
      if(res.alt){ html += '<div class="alt">另一个等价形式：<span id="altTex"></span></div>'; }
      html += '</div>';
      els.feedback.className="feedback ok show"; els.feedback.innerHTML=html;
      const alt=$("altTex"); if(alt) renderMath(alt, q.answerLatex, false);
      $("btnSubmit").disabled=true; els.input.disabled=true;
    } else {
      let html = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      html += '<div>这个答案不正确。再检查一下——';
      if(/\be\^/.test(els.input.value) && !hasKnownFn(normalize(els.input.value))){
        html += ' 指数建议写成 exp(...) 或 e^(...)。';
      }
      html += '可点「预览解答」查看分步。</div>';
      els.feedback.className="feedback no show"; els.feedback.innerHTML=html;
    }
  }
  function pushLast(key, ok){
    const a=state.stats[key].lastFive; a.push(ok?1:0); if(a.length>5) a.shift();
  }

  /* ---------- 预览解答 ---------- */
  function preview(){
    if(!state.current) return;
    const q=state.current;
    els.solSteps.innerHTML="";
    (q.solution||[]).forEach(step=>{
      const li=document.createElement("div"); li.className="step";
      const t=document.createElement("span"); t.textContent=step.t||"";
      const m=document.createElement("span"); m.className="m";
      renderMath(m, step.m, false);
      li.appendChild(t); li.appendChild(m); els.solSteps.appendChild(li);
    });
    const ansLine=document.createElement("div"); ansLine.className="step";
    ansLine.style.marginTop="var(--space-3)";
    const lab=document.createElement("span"); lab.textContent="参考答案：";
    const am=document.createElement("span"); am.className="m"; am.style.color="var(--fg)";
    renderMath(am, q.answerLatex, false);
    ansLine.appendChild(lab); ansLine.appendChild(am); els.solSteps.appendChild(ansLine);
    els.solBox.classList.add("show");
  }

  function feedback(kind, msg){
    const icon = kind==="info"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>'
      : '';
    els.feedback.className="feedback "+kind+" show";
    els.feedback.innerHTML=icon+"<div>"+msg+"</div>";
  }
  function hideFeedback(){ els.feedback.className="feedback"; els.feedback.innerHTML=""; }

  $("btnGen").addEventListener("click", generate);
  $("btnNew").addEventListener("click", generate);
  $("btnSubmit").addEventListener("click", submit);
  $("btnPreview").addEventListener("click", preview);
  $("btnGoPractice").addEventListener("click", ()=>{ switchTab("practice"); generate(); });
  // 两段式回车：第一次判分，已判分后再按一次进入下一题（document 级，正确答案禁用输入框后仍生效）
  document.addEventListener("keydown", e=>{
    if(e.key!=="Enter") return;
    if(!$("panel-practice").classList.contains("active")) return;
    e.preventDefault();
    if(!state.current){ generate(); return; }
    if(state.phase==="revealed" && els.input.value===state.lastSubmitted) generate(); // 未修改 → 下一题
    else submit();                              // 首次回车或已修改答案 → 判分
  });

  /* ---------- 分析 ---------- */
  function renderAnalysisIfVisible(){ if($("panel-analysis").classList.contains("active")) renderAnalysis(); }
  function renderAnalysis(){
    const rows=TYPES.map(t=>({t, s:state.stats[t.key]}));
    const totalGen=rows.reduce((a,r)=>a+r.s.gen,0);
    const totalCor=rows.reduce((a,r)=>a+r.s.correct,0);
    const totalErr=rows.reduce((a,r)=>a+r.s.error,0);
    const totalSkip=rows.reduce((a,r)=>a+r.s.skip,0);
    const hasData = totalGen>0 || totalSkip>0;
    $("analysisEmpty").style.display = hasData?"none":"block";
    $("analysisBody").style.display = hasData?"block":"none";
    if(!hasData) return;

    const sub = totalCor+totalErr;
    const overall = totalGen>0 ? Math.round(totalCor/totalGen*100) : 0;
    $("kOverall").textContent=overall+"%";
    $("kGen").textContent=totalGen;
    $("kCorrect").textContent=totalCor;
    $("kSkip").textContent=totalSkip;

    const tb=$("statRows"); tb.innerHTML="";
    rows.forEach(({t,s})=>{
      const submits=s.correct+s.error;
      const wrongPct = submits>0 ? s.error/submits*100 : null;
      const tr=document.createElement("tr");
      const l5 = s.lastFive.length ? (s.lastFive.filter(x=>x).length+" / "+s.lastFive.length) : "—";
      tr.innerHTML =
        '<td class="name">'+t.zh+'</td>'+
        '<td>'+(submits||"—")+'</td>'+
        '<td>'+ (wrongPct==null ? "—" :
              '<span class="cell-flex"><span class="bar'+(wrongPct>50?" bad":"")+'"><i style="width:'+Math.round(wrongPct)+'%"></i></span><span>'+wrongPct.toFixed(0)+'%</span></span>') +'</td>'+
        '<td>'+l5+'</td>'+
        '<td>'+(s.skip||"—")+'</td>'+
        '<td>'+(s.resub||"—")+'</td>';
      tb.appendChild(tr);
    });
  }
  $("btnClear").addEventListener("click", ()=>{
    TYPES.forEach(t=> state.stats[t.key]=newStat());
    persist(); renderAnalysis();
  });

  /* ---------- 初始化 ---------- */
  restore();
  updatePool();
  // KaTeX 可能在 defer 后仍未就绪，轮询渲染当前
  window.addEventListener("load", ()=>{ /* 首屏无公式，交互时再渲染 */ });

}
