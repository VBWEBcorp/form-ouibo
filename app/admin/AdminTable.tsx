"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LogOut,
  X,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Mail,
  CheckCircle2,
  Inbox,
  Bell,
  CheckCheck,
  Sparkles,
} from "lucide-react";

export type Submission = {
  _id: string;
  createdAt: string;
  contactNom: string;
  contactEmail: string;
  entreprise: string;
  activite: string;
  positionnement: string;
  cible: string;
  histoire: string;
  siteExistant: "oui" | "non" | "";
  siteExistantUrl: string;
  reseauxSociaux: string;
  inspirations: string;
  fonctionnalites: string;
  motsCles: string;
  cloudflareEmail: string;
  cloudflarePassword: string;
  formspreeEmail: string;
  formspreePassword: string;
  notes: string;
};

const LAST_SEEN_KEY = "vbweb-admin-last-seen";
const POLL_INTERVAL_MS = 25_000;

export function AdminTable({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ count: number; key: number } | null>(null);

  const prevCountRef = useRef(submissions.length);
  const prevLatestIdRef = useRef(submissions[0]?._id ?? null);

  // Hydrate lastSeen from localStorage (init to now if first visit)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_SEEN_KEY);
      if (stored) {
        setLastSeen(new Date(stored));
      } else {
        const now = new Date();
        localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
        setLastSeen(now);
      }
    } catch {
      setLastSeen(new Date());
    }
    setHydrated(true);
  }, []);

  // Auto-refresh (polling) for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  // Detect new submissions arriving (props update via router.refresh)
  useEffect(() => {
    const latestId = submissions[0]?._id ?? null;
    const previousCount = prevCountRef.current;
    const previousLatestId = prevLatestIdRef.current;

    if (
      hydrated &&
      submissions.length > previousCount &&
      latestId !== previousLatestId
    ) {
      const diff = submissions.length - previousCount;
      setToast({ count: diff, key: Date.now() });
    }

    prevCountRef.current = submissions.length;
    prevLatestIdRef.current = latestId;
  }, [submissions, hydrated]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  // Unread = submissions newer than lastSeen
  const unreadIds = useMemo(() => {
    if (!lastSeen) return new Set<string>();
    const set = new Set<string>();
    for (const s of submissions) {
      if (new Date(s.createdAt) > lastSeen) set.add(s._id);
    }
    return set;
  }, [submissions, lastSeen]);

  const unreadCount = unreadIds.size;

  // Update document title with unread count
  useEffect(() => {
    if (!hydrated) return;
    document.title =
      unreadCount > 0 ? `(${unreadCount}) Admin · VBWEB` : "Admin · VBWEB";
    return () => {
      document.title = "Admin · VBWEB";
    };
  }, [unreadCount, hydrated]);

  function markAllAsSeen() {
    const now = new Date();
    try {
      localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
    } catch {}
    setLastSeen(now);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (s) =>
        s.contactNom.toLowerCase().includes(q) ||
        s.entreprise.toLowerCase().includes(q) ||
        s.contactEmail.toLowerCase().includes(q) ||
        s.activite.toLowerCase().includes(q),
    );
  }, [submissions, query]);

  const selected = submissions.find((s) => s._id === selectedId) || null;

  // Scroll lock when drawer open
  useEffect(() => {
    if (!selected) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [selected]);

  // Esc to close drawer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur"
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          borderBottom: "1px solid var(--vb-border)",
        }}
      >
        <div className="px-5 sm:px-8 py-4 max-w-7xl w-full mx-auto flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.ibb.co/5Wcyh7qd/VBWEB-LOGO-OFFICIEL.png"
            alt="VBWEB"
            className="h-7 w-auto"
          />
          <span
            className="hidden sm:inline text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--vb-text-soft)" }}
          >
            Admin
          </span>

          {hydrated && unreadCount > 0 && (
            <span
              className="vb-pulse-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "var(--vb-accent)",
                color: "#fff",
              }}
              title={`${unreadCount} nouveau${unreadCount > 1 ? "x" : ""} questionnaire${unreadCount > 1 ? "s" : ""}`}
            >
              <Bell size={12} />
              {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
            </span>
          )}

          <div className="flex-1" />

          <div className="relative w-full max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--vb-text-soft)" }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, entreprise…)"
              className="vb-input w-full rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          {hydrated && unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsSeen}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition"
              style={{
                color: "var(--vb-accent-600)",
                border: "1px solid rgba(78, 186, 236, 0.3)",
                background: "var(--vb-accent-50)",
              }}
              title="Marquer tous les questionnaires comme lus"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition"
            style={{
              color: "var(--vb-text-muted)",
              border: "1px solid var(--vb-border)",
              background: "#fff",
            }}
            title="Se déconnecter"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 px-5 sm:px-8 py-8 sm:py-10 max-w-7xl w-full mx-auto">
        <div className="mb-6 flex items-baseline gap-3">
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
            style={{ color: "var(--vb-primary)" }}
          >
            Questionnaires reçus
          </h1>
          <span className="text-sm" style={{ color: "var(--vb-text-soft)" }}>
            {filtered.length}
            {filtered.length !== submissions.length ? ` / ${submissions.length}` : ""}
          </span>
        </div>

        {submissions.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl px-6 py-12 text-center text-sm"
            style={{
              border: "1px dashed var(--vb-border)",
              color: "var(--vb-text-muted)",
            }}
          >
            Aucun résultat pour « {query} ».
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--vb-border)", background: "#fff" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs uppercase tracking-wider"
                    style={{
                      color: "var(--vb-text-soft)",
                      borderBottom: "1px solid var(--vb-border)",
                      background: "#fafbfd",
                    }}
                  >
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Nom</th>
                    <th className="px-5 py-3 font-medium">Entreprise</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Site</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">
                      Accès
                    </th>
                    <th className="px-5 py-3 font-medium text-right">{""}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <Row
                      key={s._id}
                      sub={s}
                      isNew={unreadIds.has(s._id)}
                      onClick={() => setSelectedId(s._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Drawer */}
      {selected && (
        <Drawer submission={selected} onClose={() => setSelectedId(null)} />
      )}

      {/* Toast notification on new arrival */}
      {toast && <Toast key={toast.key} count={toast.count} />}
    </div>
  );
}

function Toast({ count }: { count: number }) {
  return (
    <div
      className="vb-toast fixed bottom-5 right-5 z-50 max-w-sm flex items-start gap-3 px-4 py-3.5 rounded-xl"
      style={{
        background: "#fff",
        border: "1px solid var(--vb-border)",
        boxShadow:
          "0 1px 2px rgba(15, 23, 42, 0.05), 0 18px 40px -16px rgba(26, 44, 69, 0.25)",
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full"
        style={{
          background: "var(--vb-accent-50)",
          color: "var(--vb-accent-600)",
        }}
      >
        <Sparkles size={16} />
      </span>
      <div className="min-w-0">
        <div
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--vb-primary)" }}
        >
          {count === 1
            ? "Nouveau questionnaire reçu"
            : `${count} nouveaux questionnaires reçus`}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--vb-text-muted)" }}>
          Mis à jour automatiquement.
        </div>
      </div>
    </div>
  );
}

function Row({
  sub,
  isNew,
  onClick,
}: {
  sub: Submission;
  isNew: boolean;
  onClick: () => void;
}) {
  const date = new Date(sub.createdAt);
  const dateStr = formatDate(date);
  const dateRel = relativeDate(date);
  const hasAcces =
    sub.cloudflareEmail.length > 0 ||
    sub.cloudflarePassword.length > 0 ||
    sub.formspreeEmail.length > 0 ||
    sub.formspreePassword.length > 0;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition ${isNew ? "vb-row-new" : ""}`}
      style={{
        borderBottom: "1px solid var(--vb-border)",
        background: isNew ? "rgba(234, 246, 253, 0.55)" : undefined,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--vb-accent-50)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = isNew
          ? "rgba(234, 246, 253, 0.55)"
          : "")
      }
    >
      <td className="px-5 py-4 align-top whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div style={{ color: "var(--vb-primary)" }} className="font-medium">
            {dateStr}
          </div>
          {isNew && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "var(--vb-accent)",
                color: "#fff",
              }}
            >
              Nouveau
            </span>
          )}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--vb-text-soft)" }}>
          {dateRel}
        </div>
      </td>
      <td
        className="px-5 py-4 align-top font-medium"
        style={{ color: "var(--vb-primary)" }}
      >
        {sub.contactNom || <span style={{ color: "var(--vb-text-soft)" }}>—</span>}
      </td>
      <td className="px-5 py-4 align-top" style={{ color: "var(--vb-text-muted)" }}>
        {sub.entreprise || <span style={{ color: "var(--vb-text-soft)" }}>—</span>}
      </td>
      <td
        className="px-5 py-4 align-top hidden md:table-cell"
        style={{ color: "var(--vb-text-muted)" }}
      >
        {sub.contactEmail || <span style={{ color: "var(--vb-text-soft)" }}>—</span>}
      </td>
      <td className="px-5 py-4 align-top hidden lg:table-cell">
        {sub.siteExistant === "oui" ? (
          <Pill label="Oui" tone="accent" />
        ) : sub.siteExistant === "non" ? (
          <Pill label="Non" tone="muted" />
        ) : (
          <span style={{ color: "var(--vb-text-soft)" }}>—</span>
        )}
      </td>
      <td className="px-5 py-4 align-top hidden lg:table-cell">
        {hasAcces ? (
          <Pill label="Fournis" tone="accent" />
        ) : (
          <span className="text-xs" style={{ color: "var(--vb-text-soft)" }}>
            Non fournis
          </span>
        )}
      </td>
      <td className="px-5 py-4 align-top text-right">
        <div className="flex items-center gap-2 justify-end">
          <CopyBriefBtn submission={sub} compact />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--vb-accent-600)" }}
          >
            Voir →
          </span>
        </div>
      </td>
    </tr>
  );
}

function Pill({ label, tone }: { label: string; tone: "accent" | "muted" }) {
  if (tone === "accent") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
        style={{
          background: "var(--vb-accent-50)",
          color: "var(--vb-accent-600)",
          border: "1px solid rgba(78, 186, 236, 0.3)",
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: "#f1f5f9",
        color: "var(--vb-text-muted)",
        border: "1px solid var(--vb-border)",
      }}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl px-6 py-16 text-center"
      style={{ border: "1px dashed var(--vb-border)", background: "#fff" }}
    >
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4"
        style={{
          background: "var(--vb-accent-50)",
          color: "var(--vb-accent-600)",
        }}
      >
        <Inbox size={22} />
      </div>
      <h3
        className="text-lg font-semibold"
        style={{ color: "var(--vb-primary)" }}
      >
        Aucune réponse pour l&apos;instant
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed max-w-sm mx-auto"
        style={{ color: "var(--vb-text-muted)" }}
      >
        Les questionnaires envoyés par vos clients apparaîtront ici, du plus récent
        au plus ancien.
      </p>
    </div>
  );
}

/* ───────── Drawer ───────── */

function Drawer({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Détails du questionnaire"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="flex-1 cursor-pointer"
        style={{ background: "rgba(15, 23, 42, 0.35)" }}
      />
      <aside
        className="relative w-full sm:max-w-2xl bg-white shadow-2xl flex flex-col vb-drawer-enter"
        style={{ borderLeft: "1px solid var(--vb-border)" }}
      >
        <header
          className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 sm:px-7 py-4"
          style={{
            background: "#fff",
            borderBottom: "1px solid var(--vb-border)",
          }}
        >
          <div className="min-w-0">
            <p
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--vb-accent-600)" }}
            >
              {formatDate(new Date(submission.createdAt))}
            </p>
            <h2
              className="mt-1 text-lg sm:text-xl font-semibold tracking-tight truncate"
              style={{ color: "var(--vb-primary)" }}
            >
              {submission.contactNom || "Sans nom"}
            </h2>
            <p
              className="text-sm truncate"
              style={{ color: "var(--vb-text-muted)" }}
            >
              {submission.entreprise || "—"}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <CopyBriefBtn submission={submission} />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition"
              style={{
                color: "var(--vb-text-muted)",
                border: "1px solid var(--vb-border)",
                background: "#fff",
              }}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-7">
          {/* Contact */}
          <DetailGroup title="Contact">
            <DetailRow
              label="Nom"
              value={submission.contactNom}
              copyable={!!submission.contactNom}
            />
            <DetailRow
              label="Email"
              value={submission.contactEmail}
              copyable={!!submission.contactEmail}
              linkHref={
                submission.contactEmail ? `mailto:${submission.contactEmail}` : undefined
              }
              linkIcon={<Mail size={13} />}
              linkLabel="Écrire"
            />
          </DetailGroup>

          {/* Entreprise */}
          <DetailGroup title="Entreprise">
            <DetailRow label="Nom" value={submission.entreprise} />
            <DetailRow label="Activité" value={submission.activite} multiline />
            <DetailRow
              label="Positionnement"
              value={submission.positionnement}
              multiline
            />
            <DetailRow label="Cible" value={submission.cible} multiline />
            {submission.histoire && (
              <DetailRow label="Histoire" value={submission.histoire} multiline />
            )}
          </DetailGroup>

          {/* Site & réseaux */}
          <DetailGroup title="Site & réseaux">
            <DetailRow
              label="Site existant"
              value={
                submission.siteExistant === "oui"
                  ? "Oui"
                  : submission.siteExistant === "non"
                    ? "Non"
                    : ""
              }
            />
            {submission.siteExistant === "oui" && submission.siteExistantUrl && (
              <DetailRow
                label="URL du site"
                value={submission.siteExistantUrl}
                linkHref={ensureHttp(submission.siteExistantUrl)}
                linkIcon={<ExternalLink size={13} />}
                linkLabel="Ouvrir"
              />
            )}
            {submission.reseauxSociaux && (
              <DetailRow
                label="Réseaux sociaux"
                value={submission.reseauxSociaux}
                multiline
              />
            )}
          </DetailGroup>

          {/* Vision */}
          {(submission.inspirations || submission.fonctionnalites) && (
            <DetailGroup title="Goûts & besoins">
              {submission.inspirations && (
                <DetailRow
                  label="Inspirations"
                  value={submission.inspirations}
                  multiline
                />
              )}
              {submission.fonctionnalites && (
                <DetailRow
                  label="Fonctionnalités"
                  value={submission.fonctionnalites}
                  multiline
                />
              )}
            </DetailGroup>
          )}

          {/* SEO */}
          {submission.motsCles && (
            <DetailGroup title="Mots-clés Google">
              <DetailRow label="Mots-clés" value={submission.motsCles} multiline />
            </DetailGroup>
          )}

          {/* Accès techniques */}
          {(submission.cloudflareEmail ||
            submission.cloudflarePassword ||
            submission.formspreeEmail ||
            submission.formspreePassword) && (
            <DetailGroup title="Accès techniques">
              <CredentialsBlock
                label="Cloudflare"
                email={submission.cloudflareEmail}
                password={submission.cloudflarePassword}
              />
              <CredentialsBlock
                label="Formspree"
                email={submission.formspreeEmail}
                password={submission.formspreePassword}
              />
            </DetailGroup>
          )}

          {/* Notes */}
          {submission.notes && (
            <DetailGroup title="Notes">
              <DetailRow label="" value={submission.notes} multiline />
            </DetailGroup>
          )}
        </div>
      </aside>
    </div>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3
        className="text-[11px] uppercase tracking-[0.22em] mb-3"
        style={{ color: "var(--vb-accent-600)" }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-3.5">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  multiline,
  copyable,
  linkHref,
  linkIcon,
  linkLabel,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  copyable?: boolean;
  linkHref?: string;
  linkIcon?: React.ReactNode;
  linkLabel?: string;
}) {
  if (!value) return null;
  return (
    <div>
      {label && (
        <div
          className="text-xs font-medium mb-1"
          style={{ color: "var(--vb-text-muted)" }}
        >
          {label}
        </div>
      )}
      <div className="flex items-start gap-2">
        <div
          className={`flex-1 text-sm leading-relaxed ${multiline ? "whitespace-pre-line" : ""}`}
          style={{ color: "var(--vb-primary)" }}
        >
          {value}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {linkHref && (
            <a
              href={linkHref}
              target={linkHref.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium no-underline transition"
              style={{
                color: "var(--vb-accent-600)",
                background: "var(--vb-accent-50)",
                border: "1px solid rgba(78, 186, 236, 0.3)",
              }}
              title={linkLabel}
            >
              {linkIcon}
              <span className="hidden sm:inline">{linkLabel}</span>
            </a>
          )}
          {copyable && <CopyBtn text={value} />}
        </div>
      </div>
    </div>
  );
}

function CredentialsBlock({
  label,
  email,
  password,
}: {
  label: string;
  email: string;
  password: string;
}) {
  if (!email && !password) return null;
  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: "#fafbfd",
        border: "1px solid var(--vb-border)",
      }}
    >
      <div
        className="text-sm font-semibold mb-2"
        style={{ color: "var(--vb-primary)" }}
      >
        {label}
      </div>
      <div className="space-y-2.5">
        {email && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div
                className="text-[11px] mb-0.5"
                style={{ color: "var(--vb-text-soft)" }}
              >
                Email
              </div>
              <div
                className="text-sm truncate"
                style={{ color: "var(--vb-primary)" }}
              >
                {email}
              </div>
            </div>
            <CopyBtn text={email} />
          </div>
        )}
        {password && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div
                className="text-[11px] mb-0.5"
                style={{ color: "var(--vb-text-soft)" }}
              >
                Mot de passe
              </div>
              <PasswordReveal value={password} />
            </div>
            <CopyBtn text={password} />
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordReveal({ value }: { value: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-sm font-mono"
        style={{ color: "var(--vb-primary)" }}
      >
        {shown ? value : "•".repeat(Math.max(8, Math.min(value.length, 14)))}
      </span>
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="inline-flex items-center justify-center w-6 h-6 rounded cursor-pointer"
        style={{ color: "var(--vb-text-muted)" }}
        title={shown ? "Masquer" : "Afficher"}
        aria-label={shown ? "Masquer" : "Afficher"}
      >
        {shown ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition"
      style={{
        color: copied ? "var(--vb-accent-600)" : "var(--vb-text-muted)",
        background: copied ? "var(--vb-accent-50)" : "#fff",
        border: "1px solid var(--vb-border)",
      }}
      title={copied ? "Copié" : "Copier"}
      aria-label={copied ? "Copié" : "Copier"}
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
    </button>
  );
}

/* ───────── Copy entire submission as a prompt ───────── */

function CopyBriefBtn({
  submission,
  compact = false,
}: {
  submission: Submission;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const text = submissionToPrompt(submission);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition"
        style={{
          color: copied ? "var(--vb-accent-600)" : "var(--vb-text-muted)",
          background: copied ? "var(--vb-accent-50)" : "#fff",
          border: "1px solid",
          borderColor: copied ? "rgba(78, 186, 236, 0.4)" : "var(--vb-border)",
        }}
        title={copied ? "Brief copié" : "Copier le brief complet"}
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="vb-btn-submit inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
    >
      {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
      {copied ? "Brief copié" : "Copier le brief"}
    </button>
  );
}

function submissionToPrompt(s: Submission): string {
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(s.createdAt));

  const headerName = s.entreprise || s.contactNom || "Sans nom";
  const lines: string[] = [];

  lines.push(`# Brief client VBWEB — ${headerName}`);
  lines.push(`Reçu le ${date}`);
  lines.push("");

  lines.push("## Contact");
  if (s.contactNom) lines.push(`- Prénom et nom : ${s.contactNom}`);
  if (s.contactEmail) lines.push(`- Email : ${s.contactEmail}`);
  lines.push("");

  lines.push("## Entreprise");
  if (s.entreprise) lines.push(`- Nom de l'entreprise : ${s.entreprise}`);
  lines.push("");

  if (s.activite) {
    lines.push("**Q. Pouvez-vous décrire votre activité en quelques mots ?**");
    lines.push(s.activite);
    lines.push("");
  }
  if (s.positionnement) {
    lines.push("**Q. Qu'est-ce qui vous distingue de la concurrence ?**");
    lines.push(s.positionnement);
    lines.push("");
  }
  if (s.cible) {
    lines.push("**Q. À qui s'adressent principalement vos produits ou services ?**");
    lines.push(s.cible);
    lines.push("");
  }
  if (s.histoire) {
    lines.push("**Q. Une histoire ou une anecdote à raconter ?**");
    lines.push(s.histoire);
    lines.push("");
  }

  if (s.siteExistant || s.reseauxSociaux) {
    lines.push("## Présence actuelle");
    lines.push("");
    if (s.siteExistant) {
      lines.push("**Q. Avez-vous déjà un site web ?**");
      if (s.siteExistant === "oui") {
        lines.push(s.siteExistantUrl ? `Oui — ${s.siteExistantUrl}` : "Oui");
      } else if (s.siteExistant === "non") {
        lines.push("Non");
      }
      lines.push("");
    }
    if (s.reseauxSociaux) {
      lines.push("**Q. Liens des réseaux sociaux**");
      lines.push(s.reseauxSociaux);
      lines.push("");
    }
  }

  if (s.inspirations || s.fonctionnalites) {
    lines.push("## Goûts & besoins");
    lines.push("");
    if (s.inspirations) {
      lines.push("**Q. Sites ou références qui vous plaisent**");
      lines.push(s.inspirations);
      lines.push("");
    }
    if (s.fonctionnalites) {
      lines.push("**Q. Fonctionnalités souhaitées sur le site**");
      lines.push(s.fonctionnalites);
      lines.push("");
    }
  }

  if (s.motsCles) {
    lines.push("## SEO");
    lines.push("");
    lines.push("**Q. Quels mots vos clients tapent-ils sur Google pour vous trouver ?**");
    lines.push(s.motsCles);
    lines.push("");
  }

  if (s.cloudflareEmail || s.formspreeEmail) {
    lines.push("## Accès techniques");
    if (s.cloudflareEmail) lines.push(`- Email Cloudflare : ${s.cloudflareEmail}`);
    if (s.formspreeEmail) lines.push(`- Email Formspree : ${s.formspreeEmail}`);
    if (s.cloudflarePassword || s.formspreePassword) {
      lines.push("(Mots de passe stockés dans l'admin, non inclus ici par sécurité.)");
    }
    lines.push("");
  }

  if (s.notes) {
    lines.push("## Notes complémentaires");
    lines.push(s.notes);
    lines.push("");
  }

  return lines.join("\n").trim();
}

/* ───────── Helpers ───────── */

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function relativeDate(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  const sem = Math.floor(j / 7);
  if (sem < 4) return `il y a ${sem} sem.`;
  const mois = Math.floor(j / 30);
  if (mois < 12) return `il y a ${mois} mois`;
  const an = Math.floor(j / 365);
  return `il y a ${an} an${an > 1 ? "s" : ""}`;
}

function ensureHttp(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
