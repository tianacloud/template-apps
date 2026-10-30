import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4M17 3v4M3 11h18M8 15h2m4 0h2m-8 3h2" />
      </>
    ),
    cycle: (
      <>
        <path d="M20 8a8 8 0 0 0-14-2L3 9m0-5v5h5M4 16a8 8 0 0 0 14 2l3-3m0 5v-5h-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 16v-4m5 4V7m5 9V4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    left: <path d="m14 6-6 6 6 6" />,
    right: <path d="m10 6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H5v20h14V7l-5-5v5h5M8 12h8m-8 4h8" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C8 2 2 8 5 15s15 5 15-12Z" />
        <path d="M5 21 16 9" />
      </>
    ),
    check: <path d="m5 12 5 5L20 7" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    edit: (
      <>
        <path d="m15 3 6 6-11 11H4v-6L15 3ZM12 6l6 6" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    moon: <path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.calendar}
    </svg>
  );
}
export function Button({
  children,
  kind = "",
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: string; icon?: string }) {
  return (
    <button type="button" className={"btn " + kind} {...props}>
      {icon && <Icon name={icon} />} {children}
    </button>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = ref.current;
    el?.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === "Tab" && el) {
        const all = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
          ),
        ).filter((x) => x.offsetParent !== null);
        if (!all.length) return;
        const first = all[0],
          last = all.at(-1)!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <div
        ref={ref}
        className={"modal " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <Button
            aria-label="关闭"
            icon="close"
            kind="icon"
            onClick={onClose}
          />
        </header>
        {children}
      </div>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function ErrorBox({ error }: { error: string }) {
  return error ? (
    <p role="alert" className="error">
      {error}
    </p>
  ) : null;
}
export function ConfirmButton({
  message,
  onConfirm,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  onConfirm: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false),
    [waiting, setWaiting] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button type="button" {...props} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <Modal title="请确认" onClose={() => !waiting && setOpen(false)}>
          <p>{message}</p>
          <ErrorBox error={error} />
          <footer>
            <Button disabled={waiting} onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              kind="primary"
              disabled={waiting}
              onClick={async () => {
                setWaiting(true);
                try {
                  if (await onConfirm()) setOpen(false);
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  setWaiting(false);
                }
              }}
            >
              {waiting ? "处理中…" : "确认"}
            </Button>
          </footer>
        </Modal>
      )}
    </>
  );
}
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "操作失败，请核对实际结果";
