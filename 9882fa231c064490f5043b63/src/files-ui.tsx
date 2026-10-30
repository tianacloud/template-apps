import { useState } from "react";
import { monthStart, monthEnd } from "./dates";
import { download, exportCsv, exportIcs, importCsv, importJson } from "./files";
import type { Roster, Workspace } from "./model";
import { Button, ErrorBox, Field, errorMessage } from "./ui";
import type { Save } from "./editors";
export function Files({
  w,
  r,
  date,
  save,
  busy,
  demo = false,
}: {
  w: Workspace;
  r?: Roster;
  date: string;
  save: Save;
  busy: boolean;
  demo?: boolean;
}) {
  const [start, setStart] = useState(monthStart(date)),
    [end, setEnd] = useState(monthEnd(date)),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<{
      next: Workspace;
      kind: "csv" | "json";
      fingerprint: string;
      name: string;
    } | null>(null),
    [agree, setAgree] = useState(false);
  const run = (fn: () => void) => {
    try {
      setError("");
      fn();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">IMPORT & EXPORT</p>
          <h1>保存你的安排</h1>
          <p className="muted">文件在当前浏览器中处理，随时整理与备份。</p>
        </div>
      </div>
      <ErrorBox error={error} />
      <div className="file-columns">
        <article className="panel">
          <h2>导出班表</h2>
          {demo && (
            <p className="notice">
              预览中可查看文件流程，导出请安装应用后使用。
            </p>
          )}
          <p className="muted">CSV 用于表格整理，ICS 用于导入日历。</p>
          {r ? (
            <>
              <Field label="当前班表">
                <input readOnly value={r.name} />
              </Field>
              <div className="form-row">
                <Field label="开始日期">
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </Field>
                <Field label="结束日期">
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </Field>
              </div>
              <div className="card-actions">
                <Button
                  icon="file"
                  disabled={demo}
                  onClick={() =>
                    run(() =>
                      download(
                        "qingban.csv",
                        exportCsv(w, r, start, end),
                        "text/csv;charset=utf-8",
                      ),
                    )
                  }
                >
                  导出 CSV
                </Button>
                <Button
                  icon="calendar"
                  disabled={demo}
                  onClick={() =>
                    run(() =>
                      download(
                        "qingban.ics",
                        exportIcs(w, r, start, end),
                        "text/calendar;charset=utf-8",
                      ),
                    )
                  }
                >
                  导出 ICS
                </Button>
              </div>
              <small className="muted">
                ICS
                使用日历所在时区的本地时间，保留跨日结束。导入后修改班表不会自动同步。
              </small>
            </>
          ) : (
            <p>先创建一份班表，再导出日期范围。</p>
          )}
          <hr />
          <h3>完整备份</h3>
          <p className="muted">JSON 包含全部班表、班次、备注及循环方案。</p>
          <Button
            icon="file"
            disabled={demo}
            onClick={() =>
              download(
                "qingban-backup.json",
                JSON.stringify(w, null, 2),
                "application/json",
              )
            }
          >
            导出 JSON 备份
          </Button>
        </article>
        <article className="panel">
          <h2>导入文件</h2>
          <p className="muted">
            选择 CSV 新建班表，或使用 JSON 备份恢复工作区。最多 5 MB。
          </p>
          <label className="file-drop">
            <span>＋ 选择 CSV / JSON 文件</span>
            <input
              aria-label="导入文件"
              type="file"
              accept=".csv,.json,text/csv,application/json"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  if (file.size > 5 * 1024 * 1024)
                    throw new Error("文件最多 5 MB");
                  const text = await file.text(),
                    kind = file.name.toLowerCase().endsWith(".csv")
                      ? "csv"
                      : file.name.toLowerCase().endsWith(".json")
                        ? "json"
                        : null;
                  if (!kind) throw new Error("请选择 CSV 或 JSON");
                  const next =
                    kind === "csv"
                      ? importCsv(
                          w,
                          text,
                          file.name.replace(/\.csv$/i, "").slice(0, 60),
                        )
                      : importJson(text);
                  setPreview({
                    next,
                    kind,
                    fingerprint: JSON.stringify(w),
                    name: file.name,
                  });
                  setAgree(false);
                  setError("");
                } catch (err) {
                  setPreview(null);
                  setError(errorMessage(err));
                }
              }}
            />
          </label>
          <details>
            <summary>CSV 格式说明</summary>
            <p>
              必需表头：date,shift。可选：start,end,end_offset,color,note。日期格式
              YYYY-MM-DD，休息填写“休息”。同名班次的时间须与班次库一致，日期不可重复。
            </p>
            <pre>
              date,shift,start,end,end_offset,note{"\n"}
              2026-10-22,夜班,22:00,06:00,1,交班
            </pre>
          </details>
          {preview && (
            <div className="import-preview">
              <h3>导入预览 · {preview.name}</h3>
              <p>
                {preview.kind === "csv"
                  ? `新增班表「${preview.next.rosters.at(-1)!.name}」，共 ${Object.keys(preview.next.rosters.at(-1)!.entries).length} 天，新增 ${preview.next.shifts.length - w.shifts.length} 种班次。`
                  : `将当前 ${w.rosters.length} 份班表替换为备份中的 ${preview.next.rosters.length} 份班表及 ${preview.next.shifts.length} 种班次。`}
              </p>
              {preview.kind === "json" && (
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  我已备份当前数据，确认完整替换
                </label>
              )}
              <div className="card-actions">
                <Button disabled={busy} onClick={() => setPreview(null)}>
                  取消
                </Button>
                <Button
                  kind="primary"
                  disabled={busy || (preview.kind === "json" && !agree)}
                  onClick={async () => {
                    if (JSON.stringify(w) !== preview.fingerprint) {
                      setError("预览后数据已变化，请重新选择文件");
                      return;
                    }
                    if (await save(preview.next)) {
                      setPreview(null);
                      setError("");
                    }
                  }}
                >
                  确认导入
                </Button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
