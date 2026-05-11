"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Mot de passe invalide.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-5 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl p-7 sm:p-8"
        style={{
          background: "#fff",
          border: "1px solid var(--vb-border)",
          boxShadow: "0 12px 40px -16px rgba(15, 23, 42, 0.18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.ibb.co/5Wcyh7qd/VBWEB-LOGO-OFFICIEL.png"
          alt="VBWEB"
          className="h-9 w-auto mb-7"
        />
        <span
          className="block w-8 h-[3px] rounded-full mb-4"
          style={{ background: "var(--vb-accent)" }}
          aria-hidden
        />
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--vb-primary)" }}
        >
          Espace admin
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--vb-text-muted)" }}>
          Saisissez le mot de passe pour accéder aux questionnaires reçus.
        </p>

        <label
          className="block text-sm font-medium mt-6 mb-2"
          style={{ color: "var(--vb-primary)" }}
        >
          Mot de passe
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--vb-text-soft)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="vb-input w-full rounded-xl pl-10 pr-4 py-3 text-base"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--vb-danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="vb-btn-submit mt-5 inline-flex items-center justify-center gap-2 w-full px-7 py-3 rounded-xl text-base font-semibold cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Connexion…
            </>
          ) : (
            "Entrer"
          )}
        </button>
      </form>
    </main>
  );
}
