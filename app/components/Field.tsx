import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  required,
  missing,
  children,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  missing?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--vb-primary)" }}>
        {label}
        {required && (
          <span style={{ color: "var(--vb-accent-600)" }} className="ml-0.5">*</span>
        )}
      </label>
      <div data-missing={missing ? "true" : undefined} className="vb-field-wrap">
        {children}
      </div>
      {missing ? (
        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--vb-danger)" }}>
          Champ obligatoire, merci de le remplir.
        </p>
      ) : (
        hint && (
          <p
            className="mt-1.5 text-xs leading-relaxed"
            style={{ color: "var(--vb-text-soft)" }}
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`vb-input w-full rounded-xl px-4 py-3 text-base ${className}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`vb-input w-full rounded-xl px-4 py-3 text-base ${className}`}
    />
  );
}

export function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="vb-choice rounded-xl px-5 py-4 text-left text-base flex-1 cursor-pointer"
    >
      {children}
    </button>
  );
}
