-- 合成示例字集：共享给所有使用者，方便第一次建课堂时直接勾选。
-- 字表为常见课堂用字，不含任何教材原文或第三方题库内容。
INSERT OR IGNORE INTO char_sets (id, owner_id, name, category, chars, shared, created_at) VALUES
  ('seed_set_lesson1', 'seed', '示例·第1课', '第1课', '明休林好学校生字', 1, '2026-01-01T00:00:00.000Z'),
  ('seed_set_lesson2', 'seed', '示例·第2课', '第2课', '你我他她们大小上下', 1, '2026-01-01T00:00:00.000Z'),
  ('seed_set_lesson3', 'seed', '示例·第3课', '第3课', '江河花草山水火木', 1, '2026-01-01T00:00:00.000Z'),
  ('seed_set_hsk1', 'seed', '示例·入门常用', '入门', '日月田口中国汉语', 1, '2026-01-01T00:00:00.000Z');
