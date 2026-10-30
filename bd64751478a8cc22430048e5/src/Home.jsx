import React, {useState} from 'react';
import {useGym, Icon, IconButton, PageTitle, Button, Modal, Field} from './ui.jsx';
import {today, weekDays, addDays, daysAgo, nextRoutine, fmt, kgTo} from './domain.js';
import {LineChart} from './visuals.jsx';

// Preserve openGym's narrow home page: this week, today's session, weight, week tally.
export function Home() {
  const {store, routines, workouts, weights, active, unit, go, start, showWeight, run, commit} = useGym();
  const [offset, setOffset] = useState(0), [picked, setPicked] = useState(null), [choice, setChoice] = useState('');
  const now = today(), first = store.setting('weekStart', 1), weekday = new Date(now + 'T12:00:00').getDay();
  const beginning = addDays(now, -((weekday - first + 7) % 7) + offset * 7);
  const dates = Array.from({length: 7}, (_, i) => addDays(beginning, i));
  const mode = store.setting('schedule', 'weekly'), override = store.get('override', now);
  const routine = nextRoutine(routines, workouts, mode, now, override?.routineId);
  const weekStart = addDays(now, -((weekday - first + 7) % 7));
  const thisWeek = workouts.filter(w => w.date >= weekStart && daysAgo(w.date) >= 0).length;
  const plannedDays = new Set(routines.flatMap(r => r.days || [])).size;
  const doneToday = workouts.filter(w => w.date === now).at(0);
  const completed = doneToday && (!routine || workouts.some(w => w.date === now && w.routineId === routine.id));
  const last = weights.at(-1), previous = weights.at(-2), goal = store.setting('goal', null);
  const pickDay = d => {
    const o = store.get('override', d), planned = nextRoutine(routines, workouts, 'weekly', d, o?.routineId);
    setPicked(d); setChoice(o?.routineId ?? planned?.id ?? '');
  };
  const openToday = () => active ? go('workout') : routine ? start(routine) : pickDay(now);
  return <div className="narrow home-page">
    <PageTitle title={`你好，${store.setting('name', '训练者')}`} subtitle={new Date().toLocaleDateString('zh-CN', {weekday:'long', day:'numeric', month:'long'})}/>
    <div className="card">
      {mode === 'weekly' ? <>
        <div className="row between home-week-heading">
          <IconButton name="back" label="上一周" onClick={() => setOffset(n => n - 1)}/>
          <span className="small muted">{offset === 0 ? '本周' : `${beginning.slice(5)} — ${dates.at(-1).slice(5)}`}</span>
          <IconButton name="chevron" label="下一周" onClick={() => setOffset(n => n + 1)}/>
        </div>
        <div className="week">{dates.map(d => {
          const o = store.get('override', d), planned = nextRoutine(routines, workouts, 'weekly', d, o?.routineId);
          const done = workouts.some(w => w.date === d);
          return <button type="button" key={d} className={`wday ${d === now ? 'today' : ''}`} onClick={() => pickDay(d)} aria-label={`${d} 的安排`}>
            <div className="lbl">{weekDays[new Date(d + 'T12:00:00').getDay()]}</div><div className="num">{Number(d.slice(-2))}</div><div className={`dot ${done ? 'done' : o && planned ? 'ovr' : planned ? 'plan' : ''}`}/>
          </button>;
        })}</div>
      </> : <div className="row between"><span>轮换训练</span><Button variant="tinted" onClick={() => go('plan')}>查看轮换</Button></div>}
      <button type="button" className="today-row" onClick={openToday}>
        <span className="row home-today-name"><span className="lrow-i" style={{background:active?'var(--orange)':routine&&!completed?'var(--acc)':'var(--surface-3)'}}><Icon name={active?'play':completed?'check':routine?'workout':'sun'}/></span>
          <span><span className="lbl2">今日</span><span className="ttl">{active ? `${active.name}（进行中）` : completed ? `${doneToday.name}（已完成）` : routine?.name || '休息日'}</span></span>
        </span>
        {active || routine || completed ? <span className="tag acc">{active?'继续':completed?'完成':'开始'}</span> : <Icon name="plus"/>}
      </button>
      {!active && <div className="home-different"><button type="button" className="btn sm ghost" onClick={() => go('workout')}><Icon name="loop" size={16}/>选择其他训练</button></div>}
    </div>
    {!routines.length && !active && <div className="card home-welcome">
      <div className="row"><span className="lrow-i"><Icon name="plan"/></span><strong>欢迎！</strong></div>
      <p className="muted small">安排每周训练，或先选一份入门计划。</p>
      <button type="button" className="btn primary" onClick={() => go('plan')}><Icon name="plan"/>载入入门计划</button>
      <button type="button" className="btn" onClick={() => go('plan')}>创建我的计划</button>
    </div>}
    <div className="card home-weight">
      <div className="row between bw-head"><h2>体重</h2><div className="row">
        <button type="button" className="btn sm" onClick={() => go('settings')}>{goal ? `目标 ${fmt(kgTo(goal, unit))}` : '目标'}</button>
        <button type="button" className="btn sm" onClick={showWeight}><Icon name="plus" size={16}/>记录</button>
      </div></div>
      {last ? <>
        <div className="row home-weight-value"><div className="big">{fmt(kgTo(last.weight,unit))} <span>{unit}</span></div>
          {previous && last.weight !== previous.weight && <span className="small muted">{last.weight > previous.weight ? '+' : '−'}{fmt(Math.abs(kgTo(last.weight-previous.weight,unit)))}</span>}
          <span className="small muted home-weight-date">{last.date}</span>
        </div>
        {goal && <div className="small home-weight-goal">目标 {fmt(kgTo(goal,unit))} {unit}</div>}
        <LineChart points={weights.slice(-30).map(w => ({date:w.date,value:kgTo(w.weight,unit)}))} goal={goal?kgTo(goal,unit):null} unit={unit}/>
        <div className="home-weight-all"><button type="button" className="btn sm ghost" onClick={() => go('progress/weight')}>全部体重记录<Icon name="chevron" size={16}/></button></div>
      </> : <p className="muted small">还没有体重记录，记录第一笔后即可看到趋势。</p>}
    </div>
    <button type="button" className="card home-tally" onClick={() => go('progress')}>
      <span><strong><Icon name="fire" size={22}/>{thisWeek} 次本周训练</strong><span className="muted small">{thisWeek}{plannedDays ? ` / ${plannedDays}` : ''} 本周 · 累计 {workouts.length} 次训练</span></span><Icon name="plan"/>
    </button>
    {picked && <Modal title={`${picked} 的安排`} subtitle="仅调整这一天，不改变周计划。" onClose={() => setPicked(null)}>
      <Field label="当天训练"><select value={choice} onChange={e => setChoice(e.target.value)}><option value="">休息日</option>{routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
      <div className="modal-actions"><Button variant="secondary" onClick={() => setPicked(null)}>取消</Button><Button onClick={() => run(async () => {await commit('override',picked,{date:picked,routineId:choice||null});setPicked(null);})}>保存安排</Button></div>
    </Modal>}
  </div>;
}
