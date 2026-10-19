INSERT OR IGNORE INTO cycle_tags(id,name) VALUES ('home','家务清洁'),('plants','绿植养护'),('care','个人护理'),('reading','自我充电');
INSERT OR IGNORE INTO cycle_events(id,name,interval_days,first_due,tags,icon,color,archived,created_at) VALUES
('water','给绿植浇水',3,date('now'),'["plants"]','plant','green',0,datetime('now','-90 days')),
('sheets','换洗床单',14,date('now'),'["home"]','shirt','orange',0,datetime('now','-90 days')),
('fridge','清理冰箱',30,date('now'),'["home"]','sparkles','blue',0,datetime('now','-90 days')),
('vacuum','给家里吸尘',7,date('now'),'["home"]','home','green',0,datetime('now','-90 days')),
('toothbrush','更换牙刷',90,date('now'),'["care"]','heart','pink',0,datetime('now','-90 days')),
('read','留点时间读书',2,date('now'),'["reading"]','book','purple',0,datetime('now','-90 days'));
WITH RECURSIVE n(i) AS (VALUES(0) UNION ALL SELECT i+1 FROM n WHERE i<15)
INSERT OR IGNORE INTO cycle_records(id,event_id,occurred_at,duration,note,photos,created_at)
SELECT 'water-'||i,'water',date('now','-'||(4+i*3)||' days')||'T09:30',10,CASE WHEN i=0 THEN '土壤已经干了，给龟背竹和琴叶榕浇透水。' WHEN i=1 THEN '顺便擦了擦叶子，今天又长出一片新叶。' ELSE '' END,'[]',date('now','-'||(4+i*3)||' days')||'T09:30' FROM n;
INSERT OR IGNORE INTO cycle_records(id,event_id,occurred_at,duration,note,photos,created_at) VALUES
('sheets-0','sheets',date('now','-14 days')||'T20:10',35,'换上了晒过太阳的床单。','[]',date('now','-14 days')||'T20:10'),
('fridge-0','fridge',date('now','-21 days')||'T20:10',45,'整理了冷藏区，把快到期的食物放在前面。','[]',date('now','-21 days')||'T20:10'),
('vacuum-0','vacuum',date('now','-5 days')||'T20:10',25,'客厅和卧室都清理好了。','[]',date('now','-5 days')||'T20:10'),
('toothbrush-0','toothbrush',date('now','-45 days')||'T20:10',2,'换了一支软毛牙刷。','[]',date('now','-45 days')||'T20:10'),
('read-0','read',date('now','-1 days')||'T20:10',30,'读了几页喜欢的书。','[]',date('now','-1 days')||'T20:10');
