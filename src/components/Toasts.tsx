import { useToast } from "../context/ToastContext";

const icons: Record<string, string> = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-exclamation",
  info: "fa-solid fa-circle-info",
};

export default function Toasts() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast toast-${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          <i className={icons[t.type]} />
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  );
}
