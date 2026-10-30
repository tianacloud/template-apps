import React, {useMemo, useState} from 'react';
import {useGym, Icon, Button, SearchBox, Empty} from './ui.jsx';
import {MUSCLES, EQUIPMENT, muscleOf} from './domain.js';
import {ExerciseThumb} from './ExerciseMedia.jsx';

const PARTS = {'full body':'全身',back:'背部',cardio:'有氧',chest:'胸部','lower arms':'前臂','lower legs':'小腿',neck:'颈部',shoulders:'肩部','upper arms':'上臂','upper legs':'大腿',waist:'腰腹'};
const TYPES = {strength:'力量',calisthenics:'徒手',stretching:'拉伸',plyometrics:'增强式',isometric:'等长',cardio:'有氧',mobility:'活动度',yoga:'瑜伽',rehab:'康复',olympic:'奥举',pilates:'普拉提',combat:'搏击'};
function bodyOf(exercise) {
  return exercise.bodyPart || ({abs:'waist',quads:'upper legs',hamstrings:'upper legs',glutes:'upper legs',calves:'lower legs',biceps:'upper arms',triceps:'upper arms',forearms:'lower arms',cardio:'cardio'}[muscleOf(exercise.muscle)] || muscleOf(exercise.muscle));
}

export function ExerciseList({onPick, onPlan, onCreate, muscle = '', onClearMuscle, limit = 40}) {
  const {all, store, run} = useGym();
  const [query, setQuery] = useState(''), [part, setPart] = useState(''), [equipment, setEquipment] = useState(''), [type, setType] = useState(''), [count, setCount] = useState(limit);
  const cards = store.setting('exerciseView', 'list') === 'cards';
  const inPart = useMemo(() => all.filter(e => (!query || `${e.name} ${e.en}`.toLowerCase().includes(query.toLowerCase())) && (!part || bodyOf(e) === part) && (!muscle || muscleOf(e.muscle) === muscle)), [all, query, part, muscle]);
  const types = [...new Set(inPart.map(e => e.category).filter(Boolean))];
  const effectiveType = types.includes(type) ? type : '';
  const inType = inPart.filter(e => !effectiveType || e.category === effectiveType);
  const equipmentNames = [...new Set(inType.map(e => e.equipment).filter(Boolean))].sort();
  const effectiveEquipment = equipmentNames.includes(equipment) ? equipment : '';
  const results = inType.filter(e => !effectiveEquipment || e.equipment === effectiveEquipment);
  const change = (fn, value) => { fn(value); setCount(limit); };
  const toggle = () => run(async () => { store.setSetting('exerciseView', cards ? 'list' : 'cards'); if (!await store.flush()) throw new Error(store.error); });
  return <>
    {muscle && <div className="active-muscle-filter"><span>肌群：{MUSCLES[muscle]}</span><button type="button" onClick={onClearMuscle}>清除筛选<Icon name="close" size={14}/></button></div>}
    <div className="search-row library-search">
      <SearchBox value={query} onChange={value => change(setQuery, value)} placeholder="搜索中文或英文动作名称…"/>
      <button type="button" className={`icon-button ex-view-btn ${cards ? 'on' : ''}`} aria-label={cards ? '切换为列表' : '切换为卡片'} aria-pressed={cards} onClick={toggle}><Icon name={cards ? 'exercises' : 'grid'}/></button>
    </div>
    <div className="chips" role="group" aria-label="筛选身体部位">
      <button className={`chip ${!part ? 'on' : ''}`} onClick={() => { change(setPart, ''); setEquipment(''); }}>全部</button>
      {Object.entries(PARTS).map(([key, label]) => <button key={key} className={`chip ${part === key ? 'on' : ''}`} onClick={() => change(setPart, key)}>{label}</button>)}
    </div>
    {types.length > 1 && <div className="chips" role="group" aria-label="筛选动作类型">
      <button className={`chip ${!effectiveType ? 'on' : ''}`} onClick={() => change(setType, '')}>所有类型</button>
      {types.map(key => <button key={key} className={`chip ${effectiveType === key ? 'on' : ''}`} onClick={() => change(setType, key)}>{TYPES[key] || key}</button>)}
    </div>}
    {equipmentNames.length > 1 && <div className="chips" role="group" aria-label="筛选器械">
      <button className={`chip ${!effectiveEquipment ? 'on' : ''}`} onClick={() => change(setEquipment, '')}>所有器械</button>
      {equipmentNames.map(key => <button key={key} className={`chip ${effectiveEquipment === key ? 'on' : ''}`} onClick={() => change(setEquipment, key)}>{EQUIPMENT[key] || key}</button>)}
    </div>}
    <div className="results-caption" role="status">{results.length.toLocaleString()} 个动作{query && ` · “${query}”`}</div>
    <div className={`list exercise-list ${cards ? 'ex-grid' : ''}`}>
      {onCreate && <button type="button" className="item ex-new" onClick={onCreate}><span className="thumb thumb-x"><Icon name="plus" size={24}/></span><span className="grow"><span className="tt">创建自定义动作</span><span className="ss">添加动作名称、肌群和训练方式</span></span><Icon name="plus"/></button>}
      {results.slice(0, count).map(exercise => <div key={exercise.id} data-exercise-id={exercise.id} className="item" role="button" tabIndex={0} onClick={() => onPick(exercise)} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onPick(exercise); } }}>
        <ExerciseThumb exercise={exercise}/>
        <span className="grow"><span className="tt">{exercise.name}</span><span className="ss">{MUSCLES[muscleOf(exercise.muscle)]} · {EQUIPMENT[exercise.equipment] || exercise.equipment || '自定义'}</span></span>
        {onPlan ? <Button icon="plus" variant="tinted" onClick={event => { event.stopPropagation(); onPlan(exercise); }}>计划</Button> : <Icon name="plus" size={18}/>}
      </div>)}
    </div>
    {!results.length && <Empty icon="search" title="没有找到匹配动作">试试其他名称，或清空器械和身体部位筛选。</Empty>}
    {results.length > count && <Button className="load-more" variant="secondary" onClick={() => setCount(value => value + 40)}>显示更多</Button>}
  </>;
}
