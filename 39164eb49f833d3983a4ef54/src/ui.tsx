import {
  useEffect,
  useRef,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const p: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </>
    ),
    fuel: (
      <>
        <rect x="3" y="3" width="11" height="18" rx="2" />
        <path d="M6 7h5v5H6M14 9h2l3 3v6a2 2 0 0 0 4 0v-7l-4-5M2 21h14" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M7 14l4-5 4 3 5-7" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M17 10h4v6h-4a3 3 0 0 1 0-6ZM3 8V5a2 2 0 0 1 2-2h12" />
      </>
    ),
    car: (
      <>
        <path d="m5 7 2-4h10l2 4 2 3v9h-3v-3H6v3H3v-9l2-3Zm0 0h14M3 12h18M6 12v2m12-2v2" />
      </>
    ),
    settings: (
      <>
        <path d="m10 3 1-1h2l1 1 1 3 3 1 3 1v4l-3 2-1 3-1 3h-4l-2-3-3-1-3-1v-4l3-2 1-3Z" />
        <circle cx="12" cy="11" r="3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    down: <path d="m6 9 6 6 6-6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 2v6m10-6v6M3 11h18" />
      </>
    ),
    road: (
      <>
        <path d="M6 3 3 21m15-18 3 18M12 3v4m0 4v3m0 4v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C3 1 1 13 7 18s15-2 13-15ZM5 21l11-13" />
      </>
    ),
    tool: (
      <>
        <path d="m14 7 3 3 4-4a7 7 0 0 1-9 9L6 21l-3-3 6-6a7 7 0 0 1 9-9Z" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1" />
      </>
    ),
    bell: (
      <>
        <path d="M5 9a7 7 0 0 1 14 0c0 8 2 7 2 8H3c0-1 2 0 2-8m4 12h6" />
      </>
    ),
    edit: (
      <>
        <path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M9 3h6m-10 3 1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 3v7c0 6-8 10-8 10S4 18 4 12V5Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 7a7 7 0 0 1 13 3M5 14a7 7 0 0 0 13 3" />
      </>
    ),
    folder: <path d="M3 5h7l2 3h9v12H3Z" />,
    dots: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    receipt: (
      <>
        <path d="M5 2v20l3-2 4 2 4-2 3 2V2l-3 2-4-2-4 2ZM9 9h6m-6 5h6" />
      </>
    ),
    arrowdown: <path d="M7 5v14m-4-4 4 4 4-4M17 19V5m-4 4 4-4 4 4" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p[name] ?? p.car}
    </svg>
  );
}
export const fmt = (n: number | null | undefined, d = 2) =>
  n == null
    ? "—"
    : n.toLocaleString("zh-CN", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
export const money = (n: number) => "¥" + fmt(n);
export function Brand() {
  return (
    <div className="brand">
      <span className="brandmark">
        <Icon name="road" size={25} />
      </span>
      <div>
        <strong>
          行迹<span>油耗账本</span>
        </strong>
        <small>记录每一程的美好</small>
      </div>
    </div>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span>
        <Icon name="road" size={32} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function CardTitle({
  icon,
  title,
  action,
}: {
  icon?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-title">
      <h2>
        {icon && <Icon name={icon} size={18} />} {title}
      </h2>
      {action}
    </div>
  );
}
export function Stat({
  label,
  value,
  unit,
  icon,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: string;
  foot?: ReactNode;
}) {
  return (
    <article className="metric">
      <div className="metric-top">
        <span>{label}</span>
        {icon && <Icon name={icon} size={17} />}
      </div>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
      {foot && <p>{foot}</p>}
    </article>
  );
}
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  busy,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  busy?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "wide" : ""}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      <header className="dialog-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          disabled={busy}
          aria-label="关闭窗口"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <fieldset disabled={busy} className="modal-fields">
        {children}
      </fieldset>
    </dialog>
  );
}
export function Field({
  label,
  hint,
  children,
  full,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label className={"field " + (full ? "full" : "")}>
      <span>{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            "aria-label": label,
            "aria-description": hint,
          })
        : children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function FormFoot({
  busy,
  onClose,
  label = "保存记录",
  onSave,
}: {
  busy?: boolean;
  onClose: () => void;
  label?: string;
  onSave: () => void;
}) {
  return (
    <footer className="dialog-foot">
      <span>
        <Icon name="shield" size={14} /> 保存后同步到账本
      </span>
      <div className="row">
        <button disabled={busy} onClick={onClose}>
          取消
        </button>
        <button className="primary" disabled={busy} onClick={onSave}>
          {busy ? "正在保存…" : label}
        </button>
      </div>
    </footer>
  );
}
export function CarArt() {
  return (
    <svg viewBox="0 0 360 145" role="img" aria-label="爱车插画">
      <defs>
        <linearGradient id="carbody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f7fffb" />
          <stop offset="1" stopColor="#d5e9df" />
        </linearGradient>
      </defs>
      <ellipse cx="190" cy="121" rx="148" ry="11" fill="#0a613b" opacity=".1" />
      <path
        d="M28 100 39 73q7-9 45-13l47-39q10-7 33-7h62q12 0 25 11l40 35 39 13q15 7 15 27l-8 10H34Z"
        fill="url(#carbody)"
        stroke="#508c71"
        strokeWidth="1.5"
      />
      <path d="m100 60 37-34q5-4 17-4h69q8 0 17 7l34 31Z" fill="#326b56" />
      <path d="M177 23v37m62-32 27 32" stroke="#a3c6b6" strokeWidth="5" />
      <path
        d="M48 76h34l-9 9H43m260-10 26 6v8h-18Z"
        fill="#fff"
        stroke="#80a991"
      />
      <path
        d="M90 67h189M181 68v34m-72 0h157M213 73h12m-84 0h12"
        stroke="#86ae99"
        fill="none"
      />
      <circle cx="91" cy="109" r="25" fill="#254b3c" />
      <circle cx="91" cy="109" r="15" fill="#d4e3d9" />
      <circle cx="91" cy="109" r="6" fill="#799d8c" />
      <circle cx="284" cy="109" r="25" fill="#254b3c" />
      <circle cx="284" cy="109" r="15" fill="#d4e3d9" />
      <circle cx="284" cy="109" r="6" fill="#799d8c" />
      <path d="M35 99h28m252 0h23" stroke="#8aab9b" strokeWidth="3" />
    </svg>
  );
}
