import { rows, one, run, sql, newId, nowIso } from './db.js';

/* ---------------- 首页统计 ---------------- */
export async function siteStats() {
  const row = await one(`SELECT
    (SELECT COUNT(DISTINCT owner_id) FROM rooms) AS teachers,
    (SELECT COUNT(*) FROM students) AS students,
    (SELECT COUNT(*) FROM rooms) AS rooms,
    (SELECT COUNT(*) FROM practice_records) AS practice`);
  return {
    teachers: Number(row?.teachers || 0),
    students: Number(row?.students || 0),
    rooms: Number(row?.rooms || 0),
    practice: Number(row?.practice || 0),
  };
}

/* ---------------- 课堂 ---------------- */
const roomRow = (row) => row && {
  code: row.code,
  ownerId: row.owner_id,
  name: row.name || '',
  folder: row.folder || '',
  status: row.status,
  roundNo: Number(row.round_no),
  currentIndex: Number(row.current_index),
  maxComponents: Number(row.max_components),
  createdAt: row.created_at,
  endedAt: row.ended_at || null,
  radicalNames: JSON.parse(row.radical_names || '{}'),
  stories: JSON.parse(row.stories || '{}'),
};

export async function getRoom(code) {
  return roomRow(await one('SELECT * FROM rooms WHERE code = ?', [code]));
}

export async function listRooms(ownerId) {
  const list = await rows(
    `SELECT r.*, (SELECT COUNT(*) FROM room_chars c WHERE c.room_code = r.code) AS char_count
     FROM rooms r WHERE r.owner_id = ? ORDER BY r.created_at DESC`, [ownerId],
  );
  return list.map((row) => ({ ...roomRow(row), charCount: Number(row.char_count) }));
}

export async function roomChars(code) {
  const list = await rows('SELECT idx, char, lesson FROM room_chars WHERE room_code = ? ORDER BY idx', [code]);
  return list.map((row) => ({ index: Number(row.idx), char: row.char, lesson: row.lesson || '' }));
}

export async function roomExists(code) {
  return Boolean(await one('SELECT 1 AS ok FROM rooms WHERE code = ?', [code]));
}

export async function createRoom({ code, ownerId, name = '', folder = '', chars }) {
  const now = nowIso();
  await sql('INSERT INTO rooms (code, owner_id, name, folder, status, round_no, current_index, max_components, created_at) VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)',
    [code, ownerId, name, folder, 'lobby', maxComponentsOf(chars), now]);
  await replaceChars(code, chars);
  return getRoom(code);
}

export async function updateRoom(code, patch) {
  const fields = [];
  const values = [];
  const map = {
    name: 'name', folder: 'folder', status: 'status', roundNo: 'round_no',
    currentIndex: 'current_index', endedAt: 'ended_at', maxComponents: 'max_components',
  };
  for (const [key, column] of Object.entries(map)) {
    if (patch[key] !== undefined) { fields.push(`${column} = ?`); values.push(patch[key]); }
  }
  for (const key of ['radicalNames', 'stories']) {
    if (patch[key] !== undefined) {
      const column = key === 'radicalNames' ? 'radical_names' : 'stories';
      fields.push(`${column} = ?`);
      values.push(JSON.stringify(patch[key]));
    }
  }
  if (!fields.length) return getRoom(code);
  values.push(code);
  await run(`UPDATE rooms SET ${fields.join(', ')} WHERE code = ?`, values);
  return getRoom(code);
}

export const maxComponentsOf = (chars) => Math.max(2, ...chars.map((item) => (item.parts?.length || 2)));

export async function replaceChars(code, chars) {
  await run('DELETE FROM room_chars WHERE room_code = ?', [code]);
  for (const [index, item] of chars.entries()) {
    await run('INSERT INTO room_chars (room_code, idx, char, lesson) VALUES (?, ?, ?, ?)',
      [code, index, item.char, item.lesson || '']);
  }
  const max = Math.max(2, ...chars.map((item) => (item.parts?.length || 2)));
  await run('UPDATE rooms SET max_components = ? WHERE code = ?', [max, code]);
}

export async function deleteRoom(code) {
  await run('DELETE FROM answers WHERE room_code = ?', [code]);
  await run('DELETE FROM students WHERE room_code = ?', [code]);
  await run('DELETE FROM room_chars WHERE room_code = ?', [code]);
  await run('DELETE FROM rooms WHERE code = ?', [code]);
}

export async function setRoomStatus(code, status) {
  if (status === 'playing') return updateRoom(code, { status, currentIndex: 0, endedAt: null });
  if (status === 'ended') return updateRoom(code, { status, endedAt: nowIso() });
  return updateRoom(code, { status, endedAt: null });
}

export async function nextRound(code) {
  const room = await getRoom(code);
  await run('DELETE FROM answers WHERE room_code = ?', [code]);
  await run('DELETE FROM students WHERE room_code = ?', [code]);
  return updateRoom(code, { status: 'playing', roundNo: room.roundNo + 1, currentIndex: 0, endedAt: null });
}

/* ---------------- 学生与作答 ---------------- */
export async function joinRoom(code, nickname) {
  const id = newId('stu');
  const now = nowIso();
  await run('INSERT INTO students (id, room_code, nickname, joined_at, last_seen_at, help_count) VALUES (?, ?, ?, ?, ?, 0)',
    [id, code, nickname.slice(0, 20), now, now]);
  return { id, nickname };
}

export async function touchStudent(code, studentId) {
  await run('UPDATE students SET last_seen_at = ? WHERE id = ? AND room_code = ?', [nowIso(), studentId, code]);
}

export async function askHelp(code, studentId, charIndex = -1) {
  await run('UPDATE students SET help_count = help_count + 1, help_char = ?, last_seen_at = ? WHERE id = ? AND room_code = ?',
    [charIndex, nowIso(), studentId, code]);
}

export async function roomStudents(code) {
  const list = await rows('SELECT * FROM students WHERE room_code = ? ORDER BY joined_at', [code]);
  return list.map((row) => ({
    id: row.id, nickname: row.nickname, joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at, helpCount: Number(row.help_count), helpChar: Number(row.help_char ?? -1),
  }));
}

export async function saveAnswer({ code, studentId, charIndex, char, parts, formation, attempts, elapsedMs, correct, helped }) {
  const now = nowIso();
  const hintTriggered = attempts >= 3 && !correct ? 1 : 0;
  await sql(`INSERT INTO answers (room_code, student_id, char_index, char, parts, formation, attempts, elapsed_ms, correct, helped, hint_triggered, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(room_code, student_id, char_index) DO UPDATE SET
      parts = excluded.parts, formation = excluded.formation, attempts = excluded.attempts,
      elapsed_ms = excluded.elapsed_ms, correct = excluded.correct, helped = excluded.helped,
      hint_triggered = excluded.hint_triggered, updated_at = excluded.updated_at`,
  [code, studentId, charIndex, char, JSON.stringify(parts), formation || '', attempts, Math.round(elapsedMs), correct ? 1 : 0, helped ? 1 : 0, hintTriggered, now]);
}

export async function roomAnswers(code) {
  return rows('SELECT * FROM answers WHERE room_code = ?', [code]);
}

/* ---------------- 报告 ---------------- */
export async function report(code) {
  const [room, chars, students, answers] = await Promise.all([
    getRoom(code), roomChars(code), roomStudents(code), roomAnswers(code),
  ]);
  const byStudent = new Map(students.map((student) => [student.id, { ...student, records: [] }]));
  for (const row of answers) {
    const bucket = byStudent.get(row.student_id);
    if (!bucket) continue;
    bucket.records.push({
      charIndex: Number(row.char_index), char: row.char, attempts: Number(row.attempts),
      elapsedMs: Number(row.elapsed_ms), correct: Number(row.correct) === 1,
      helped: Number(row.helped) === 1, hintTriggered: Number(row.hint_triggered) === 1,
    });
  }
  const people = [...byStudent.values()].map((student) => {
    const answered = student.records.length;
    const correct = student.records.filter((record) => record.correct).length;
    const sumAttempts = student.records.reduce((sum, record) => sum + record.attempts, 0);
    const sumMs = student.records.reduce((sum, record) => sum + record.elapsedMs, 0);
    return {
      ...student,
      summary: {
        answered,
        correct,
        accuracy: answered ? correct / answered : 0,
        avgAttempts: answered ? sumAttempts / answered : 0,
        avgMs: answered ? sumMs / answered : 0,
      },
    };
  }).sort((a, b) => b.summary.correct - a.summary.correct
    || a.summary.avgAttempts - b.summary.avgAttempts
    || a.summary.avgMs - b.summary.avgMs);

  const byChar = chars.map((item, index) => {
    const records = answers.filter((row) => Number(row.char_index) === index);
    const answered = records.length;
    const correct = records.filter((row) => Number(row.correct) === 1).length;
    return {
      ...item,
      answered,
      correct,
      accuracy: answered ? correct / answered : null,
      avgAttempts: answered ? records.reduce((sum, row) => sum + Number(row.attempts), 0) / answered : null,
      stuck: records.filter((row) => Number(row.correct) === 0 && Number(row.attempts) >= 3).length,
      helped: records.filter((row) => Number(row.helped) === 1).length,
      solvedOnThirdTry: records.filter((row) => Number(row.correct) === 1 && Number(row.attempts) === 3).length,
      failedAfterHint: records.filter((row) => Number(row.correct) === 0 && Number(row.hint_triggered) === 1).length,
    };
  });

  const totalAnswered = answers.length;
  const totalCorrect = answers.filter((row) => Number(row.correct) === 1).length;
  return {
    room,
    chars,
    students: people,
    byChar,
    metrics: {
      participants: students.length,
      answeredStudents: people.filter((person) => person.summary.answered > 0).length,
      totalAnswered,
      avgAccuracy: totalAnswered ? totalCorrect / totalAnswered : 0,
      charsMastered: byChar.filter((item) => item.answered > 0 && item.correct === item.answered).length,
      charsTotal: chars.length,
      helpTotal: students.reduce((sum, student) => sum + student.helpCount, 0),
      hardestChars: byChar.filter((item) => item.answered > 0 && item.accuracy < 1)
        .sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((item) => item.char),
    },
  };
}

/* ---------------- 排行榜 ---------------- */
export function scoreOf(record) {
  if (!record.correct) return 0;
  if (record.helped || record.hintTriggered) return 5;
  return record.attempts <= 1 ? 15 : 10;
}

export async function leaderboard({ code, scope = 'all', period = 'all' }) {
  const conditions = [];
  const values = [];
  if (scope === 'room') { conditions.push('a.room_code = ?'); values.push(code); }
  if (period === 'week') conditions.push("a.updated_at >= datetime('now', '-7 days')");
  if (period === 'month') conditions.push("a.updated_at >= datetime('now', '-30 days')");
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const list = await rows(`SELECT s.nickname AS nickname, a.correct, a.attempts, a.elapsed_ms, a.helped, a.hint_triggered, a.room_code
    FROM answers a JOIN students s ON s.id = a.student_id ${where}`, values);
  const byName = new Map();
  for (const row of list) {
    const key = row.nickname;
    const entry = byName.get(key) || { nickname: key, score: 0, correctCount: 0, attempts: 0, elapsedMs: 0, total: 0 };
    const correct = Number(row.correct) === 1;
    entry.score += scoreOf({
      correct, attempts: Number(row.attempts), helped: Number(row.helped) === 1,
      hintTriggered: Number(row.hint_triggered) === 1,
    });
    if (correct) entry.correctCount += 1;
    entry.attempts += Number(row.attempts);
    entry.elapsedMs += Number(row.elapsed_ms);
    entry.total += 1;
    byName.set(key, entry);
  }
  return [...byName.values()]
    .map((entry) => ({ ...entry, accuracy: entry.total ? entry.correctCount / entry.total : 0 }))
    .sort((a, b) => b.score - a.score || b.correctCount - a.correctCount || a.elapsedMs - b.elapsedMs)
    .slice(0, 50);
}

/* ---------------- 字库 ---------------- */
export async function listCharSets(userId) {
  const list = await rows('SELECT * FROM char_sets WHERE owner_id = ? OR shared = 1 ORDER BY created_at DESC', [userId]);
  return list.map((row) => ({
    id: row.id, ownerId: row.owner_id, name: row.name, category: row.category || '',
    chars: row.chars || '', shared: Number(row.shared) === 1, mine: row.owner_id === userId,
    createdAt: row.created_at,
  }));
}

export async function createCharSet({ ownerId, name, category, chars, shared = 0 }) {
  const id = newId('set');
  await run('INSERT INTO char_sets (id, owner_id, name, category, chars, shared, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, ownerId, name, category, chars, shared ? 1 : 0, nowIso()]);
  return id;
}

export async function updateCharSet(id, patch) {
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries({ name: 'name', category: 'category', chars: 'chars', shared: 'shared' })) {
    if (patch[key] !== undefined) { fields.push(`${column} = ?`); values.push(key === 'shared' ? (patch[key] ? 1 : 0) : patch[key]); }
  }
  if (!fields.length) return;
  values.push(id);
  await run(`UPDATE char_sets SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteCharSet(id) {
  await run('DELETE FROM char_sets WHERE id = ?', [id]);
}

/* ---------------- 拆解覆盖与组字故事 ---------------- */
export async function listOverrides(ownerId) {
  const list = await rows('SELECT * FROM char_overrides WHERE owner_id = ? ORDER BY char', [ownerId]);
  return list.map((row) => ({
    char: row.char, mode: row.mode, parts: JSON.parse(row.parts),
    lockParts: JSON.parse(row.lock_parts || '[]'), structure: row.structure,
  }));
}

export async function saveOverride(ownerId, { char, mode, parts, lockParts = [], structure }) {
  await sql(`INSERT INTO char_overrides (owner_id, char, mode, parts, lock_parts, structure) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id, char) DO UPDATE SET mode = excluded.mode, parts = excluded.parts, lock_parts = excluded.lock_parts, structure = excluded.structure`,
  [ownerId, char, mode, JSON.stringify(parts), JSON.stringify(lockParts), structure]);
}

export async function deleteOverride(ownerId, char) {
  await run('DELETE FROM char_overrides WHERE owner_id = ? AND char = ?', [ownerId, char]);
}

export async function listStories(ownerId) {
  const list = await rows('SELECT * FROM char_stories WHERE owner_id = ? ORDER BY char', [ownerId]);
  return list.map((row) => ({ char: row.char, story: row.story }));
}

export async function saveStory(ownerId, char, story) {
  if (!story) { await run('DELETE FROM char_stories WHERE owner_id = ? AND char = ?', [ownerId, char]); return; }
  await sql(`INSERT INTO char_stories (owner_id, char, story) VALUES (?, ?, ?)
    ON CONFLICT(owner_id, char) DO UPDATE SET story = excluded.story`, [ownerId, char, story]);
}

/* ---------------- 课后练习（匿名聚合） ---------------- */
export async function addPractice(records) {
  const now = nowIso();
  for (const record of records) {
    await run('INSERT INTO practice_records (id, char, correct, attempts, elapsed_ms, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [newId('pr'), record.char, record.correct ? 1 : 0, record.attempts, Math.round(record.elapsedMs), now]);
  }
}

export async function practiceStats(days) {
  const since = `datetime('now', '-${Number(days) || 30} days')`;
  const totals = await one(`SELECT COUNT(*) AS records, COUNT(DISTINCT char) AS chars,
      SUM(correct) AS correct, SUM(attempts) AS attempts
    FROM practice_records WHERE created_at >= ${since}`);
  const sessions = await one(`SELECT COUNT(DISTINCT substr(created_at, 1, 13) || char) AS sessions FROM practice_records WHERE created_at >= ${since}`);
  const hardest = await rows(`SELECT char, COUNT(*) AS times, SUM(correct) AS correct, AVG(attempts) AS avg_attempts
    FROM practice_records WHERE created_at >= ${since}
    GROUP BY char HAVING times >= 2 ORDER BY (CAST(SUM(correct) AS REAL) / COUNT(*)) ASC, times DESC LIMIT 10`);
  const records = Number(totals?.records || 0);
  return {
    records,
    chars: Number(totals?.chars || 0),
    accuracy: records ? Number(totals?.correct || 0) / records : 0,
    sessions: Number(sessions?.sessions || 0),
    hardest: hardest.map((row) => ({
      char: row.char, times: Number(row.times),
      accuracy: Number(row.times) ? Number(row.correct) / Number(row.times) : 0,
      avgAttempts: Number(row.avg_attempts || 0),
    })),
  };
}

export async function purgePractice(keepDays) {
  await run(`DELETE FROM practice_records WHERE created_at < datetime('now', '-${Number(keepDays) || 30} days')`);
}
