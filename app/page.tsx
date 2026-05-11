"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Field, Input, Textarea, Choice } from "./components/Field";

type FormState = {
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

const initial: FormState = {
  contactNom: "",
  contactEmail: "",
  entreprise: "",
  activite: "",
  positionnement: "",
  cible: "",
  histoire: "",
  siteExistant: "",
  siteExistantUrl: "",
  reseauxSociaux: "",
  inspirations: "",
  fonctionnalites: "",
  motsCles: "",
  cloudflareEmail: "",
  cloudflarePassword: "",
  formspreeEmail: "",
  formspreePassword: "",
  notes: "",
};

const STORAGE_KEY = "vbweb-questionnaire-v3";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function Page() {
  const [data, setData] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<keyof FormState>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Progression dynamique (% de champs remplis)
  const progress = useMemo(() => {
    const fields: string[] = [
      data.contactNom,
      data.contactEmail,
      data.entreprise,
      data.activite,
      data.positionnement,
      data.cible,
      data.histoire,
      data.siteExistant,
      ...(data.siteExistant === "oui" ? [data.siteExistantUrl] : []),
      data.reseauxSociaux,
      data.inspirations,
      data.fonctionnalites,
      data.motsCles,
      data.cloudflareEmail,
      data.cloudflarePassword,
      data.formspreeEmail,
      data.formspreePassword,
      data.notes,
    ];
    const filled = fields.filter((v) => v.trim().length > 0).length;
    return Math.min(100, Math.round((filled / fields.length) * 100));
  }, [data]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data, hydrated]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (missing.has(key)) {
      setMissing((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  function validate(): Set<keyof FormState> {
    const m = new Set<keyof FormState>();
    if (data.contactNom.trim().length < 2) m.add("contactNom");
    if (!isValidEmail(data.contactEmail)) m.add("contactEmail");
    if (data.entreprise.trim().length === 0) m.add("entreprise");
    if (data.activite.trim().length === 0) m.add("activite");
    if (data.positionnement.trim().length === 0) m.add("positionnement");
    if (data.cible.trim().length === 0) m.add("cible");
    if (data.siteExistant === "") m.add("siteExistant");
    if (data.siteExistant === "oui" && data.siteExistantUrl.trim().length === 0) {
      m.add("siteExistantUrl");
    }
    return m;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const m = validate();
    if (m.size > 0) {
      setMissing(m);
      setSubmitError("Quelques champs obligatoires sont à compléter.");
      const first = formRef.current?.querySelector<HTMLElement>("[data-missing='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMissing(new Set());
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur inconnue");
      setSubmitted(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const prenom = data.contactNom.trim().split(/\s+/)[0] || "";
    return (
      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.ibb.co/5Wcyh7qd/VBWEB-LOGO-OFFICIEL.png"
          alt="VBWEB"
          className="h-10 w-auto mb-10"
        />
        <span
          className="block w-10 h-[3px] rounded-full mb-5"
          style={{ background: "var(--vb-accent)" }}
          aria-hidden
        />
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight"
          style={{ color: "var(--vb-primary)" }}
        >
          Questionnaire bien reçu
        </h1>
        <div
          className="mt-5 space-y-4 leading-relaxed"
          style={{ color: "var(--vb-text-muted)" }}
        >
          <p>
            {prenom ? `${prenom}, ` : ""}vos réponses nous sont bien parvenues. Nous
            les étudions avec attention et reviendrons vers vous très prochainement
            pour démarrer votre projet.
          </p>
          <p style={{ color: "var(--vb-primary)" }} className="font-medium">
            Merci pour votre précieuse collaboration.
          </p>
        </div>
        <p className="mt-10 text-sm" style={{ color: "var(--vb-text-soft)" }}>
          VBWEB
        </p>
      </main>
    );
  }

  return (
    <>
      {hydrated && (
        <div className="vb-form-progress" aria-hidden>
          <div className="vb-form-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      <main className="max-w-2xl lg:max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="vb-intro-card px-5 py-6 sm:p-10 mb-10 sm:mb-14">
        {/* Letterhead : logo VBWEB flottant top-right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.ibb.co/5Wcyh7qd/VBWEB-LOGO-OFFICIEL.png"
          alt="VBWEB"
          className="vb-letterhead-mark"
        />

        {/* Bloc fondateur en tête de carte */}
        <div className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-9 relative pr-12 sm:pr-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.ibb.co/ZpkH8MbS/image.webp"
            alt="Victor, fondateur de VBWEB"
            className="vb-signature-photo shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <div
              className="text-base sm:text-lg font-semibold tracking-tight"
              style={{ color: "var(--vb-primary)" }}
            >
              Victor
            </div>
            <div
              className="text-[13px] sm:text-sm mt-0.5"
              style={{ color: "var(--vb-text-muted)" }}
            >
              Fondateur de VBWEB
            </div>
          </div>
        </div>

        {/* Trait d'accent + titre */}
        <span
          className="block w-10 sm:w-12 h-[3px] rounded-full mb-4 sm:mb-5 relative"
          style={{ background: "var(--vb-accent)" }}
          aria-hidden
        />
        <h1
          className="font-semibold leading-[1.05] tracking-[-0.02em] relative"
          style={{
            color: "var(--vb-primary)",
            fontSize: "clamp(1.875rem, 6.5vw, 3rem)",
          }}
        >
          Questionnaire
        </h1>

        {/* Paragraphes */}
        <div
          className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4 text-[15px] sm:text-base leading-relaxed relative max-w-prose"
          style={{ color: "var(--vb-text-muted)" }}
        >
          <p>
            Ce questionnaire est la base de votre projet. Les informations que vous
            y fournirez nous permettront non seulement de concevoir un site qui vous
            ressemble, mais aussi de réaliser un audit précis et de cibler les mots
            clés les plus pertinents pour optimiser votre référencement.
          </p>
          <p>
            Plus vos réponses seront détaillées, plus le résultat sera fidèle à vos
            attentes. Bien entendu, vous n&apos;êtes pas obligé de tout remplir :
            indiquez simplement les informations que vous avez, nous restons souples
            et avancerons avec ce que vous pourrez nous fournir.
          </p>
          <p>
            Merci de nous transmettre ce questionnaire complété, en même temps que
            votre contrat signé. La création de votre site débutera dès réception de
            ces éléments et encaissement du premier paiement.
          </p>
        </div>

        {/* Sign-off en italique serif */}
        <div
          className="mt-6 sm:mt-7 pt-5 sm:pt-6 relative"
          style={{ borderTop: "1px solid var(--vb-border)" }}
        >
          <p className="vb-signoff">Merci pour votre précieuse collaboration.</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-12">
        <Group title="Vos coordonnées">
          <Field label="Prénom et nom" required missing={missing.has("contactNom")}>
            <Input
              value={data.contactNom}
              onChange={(e) => update("contactNom", e.target.value)}
              placeholder="Jean Dupont"
              autoComplete="name"
            />
          </Field>
          <Field label="Email" required missing={missing.has("contactEmail")}>
            <Input
              type="email"
              inputMode="email"
              value={data.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="vous@entreprise.fr"
              autoComplete="email"
            />
          </Field>
        </Group>

        <Group title="Votre entreprise">
          <Field label="Nom de l'entreprise" required missing={missing.has("entreprise")}>
            <Input
              value={data.entreprise}
              onChange={(e) => update("entreprise", e.target.value)}
              placeholder="Boulangerie Dupont"
              autoComplete="organization"
            />
          </Field>
          <Field
            label="Décrivez votre activité en quelques mots"
            required
            missing={missing.has("activite")}
            hint="Présentez la nature de votre activité et le marché que vous adressez."
          >
            <Textarea
              value={data.activite}
              onChange={(e) => update("activite", e.target.value)}
              placeholder="Boulangerie artisanale spécialisée dans le pain au levain biologique, à destination des particuliers du centre-ville…"
              rows={3}
            />
          </Field>
          <Field
            label="Qu'est-ce qui vous distingue de la concurrence ?"
            required
            missing={missing.has("positionnement")}
          >
            <Textarea
              value={data.positionnement}
              onChange={(e) => update("positionnement", e.target.value)}
              placeholder="Vos valeurs, votre savoir-faire, ce que les clients aiment chez vous."
              rows={3}
            />
          </Field>
          <Field
            label="À qui s'adressent principalement vos produits ou services ?"
            required
            missing={missing.has("cible")}
          >
            <Textarea
              value={data.cible}
              onChange={(e) => update("cible", e.target.value)}
              placeholder="Particuliers, entreprises, secteur, profil type…"
              rows={3}
            />
          </Field>
          <Field
            label="Avez-vous une histoire ou un storytelling particulier à mettre en avant ?"
            hint="Optionnel. Origine de l'entreprise, héritage familial, moment fondateur."
          >
            <Textarea
              value={data.histoire}
              onChange={(e) => update("histoire", e.target.value)}
              placeholder="L'aventure a commencé en 1987, lorsque…"
              rows={3}
            />
          </Field>
        </Group>

        <Group title="Votre site actuel">
          <Field
            label="Avez-vous déjà un site web ?"
            required
            missing={missing.has("siteExistant")}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Choice
                active={data.siteExistant === "non"}
                onClick={() => update("siteExistant", "non")}
              >
                Non
              </Choice>
              <Choice
                active={data.siteExistant === "oui"}
                onClick={() => update("siteExistant", "oui")}
              >
                Oui
              </Choice>
            </div>
          </Field>

          {data.siteExistant === "oui" && (
            <Field
              label="Lien de votre site actuel"
              required
              missing={missing.has("siteExistantUrl")}
            >
              <Input
                type="url"
                inputMode="url"
                value={data.siteExistantUrl}
                onChange={(e) => update("siteExistantUrl", e.target.value)}
                placeholder="https://votresite.fr"
              />
            </Field>
          )}

          <Field
            label="Liens de vos réseaux sociaux"
            hint="Instagram, Facebook, LinkedIn, TikTok. Un lien par ligne, optionnel."
          >
            <Textarea
              value={data.reseauxSociaux}
              onChange={(e) => update("reseauxSociaux", e.target.value)}
              placeholder={"https://instagram.com/votrecompte\nhttps://facebook.com/votrepage"}
              rows={3}
            />
          </Field>
        </Group>

        <Group title="Préférences esthétiques et fonctionnelles">
          <Field
            label="Sites ou références qui vous plaisent"
            hint="Deux ou trois liens suffisent. Ces références nous aident à cerner vos préférences esthétiques."
          >
            <Textarea
              value={data.inspirations}
              onChange={(e) => update("inspirations", e.target.value)}
              placeholder={"https://exemple1.com\nhttps://exemple2.com"}
              rows={3}
            />
          </Field>
          <Field
            label="Fonctionnalités souhaitées sur le site"
            hint="Prise de RDV, formulaire de contact, blog, paiement en ligne, multilingue…"
          >
            <Textarea
              value={data.fonctionnalites}
              onChange={(e) => update("fonctionnalites", e.target.value)}
              placeholder={"- Un formulaire de contact\n- Une page tarifs"}
              rows={4}
            />
          </Field>
        </Group>

        <Group title="Référencement Google">
          <Field
            label="Selon vous, quels mots ou phrases vos clients tapent-ils sur Google pour trouver une entreprise comme la vôtre ?"
            hint="Indiquez toutes les requêtes qui vous viennent à l'esprit, y compris les formulations du quotidien. Aucune réponse n'est mauvaise."
          >
            <Textarea
              value={data.motsCles}
              onChange={(e) => update("motsCles", e.target.value)}
              placeholder={"boulangerie artisanale rennes\npain bio livraison à domicile"}
              rows={4}
            />
          </Field>
        </Group>

        <Group title="Configuration Cloudflare">
          <p
            className="text-sm leading-relaxed -mt-1"
            style={{ color: "var(--vb-text-muted)" }}
          >
            Cloudflare nous permet de connecter votre nom de domaine à votre nouveau
            site. Le service est gratuit.
          </p>
          <ol
            className="text-sm leading-relaxed list-decimal pl-5 space-y-1"
            style={{ color: "var(--vb-text-muted)" }}
          >
            <li>
              Créez un compte sur{" "}
              <a
                href="https://dash.cloudflare.com/sign-up"
                target="_blank"
                rel="noopener noreferrer"
                className="vb-link"
              >
                cloudflare.com
              </a>.
            </li>
            <li>Validez votre adresse email via le mail de confirmation reçu.</li>
            <li>Indiquez ci-dessous les identifiants utilisés.</li>
          </ol>
          <Field label="Email du compte Cloudflare">
            <Input
              type="email"
              value={data.cloudflareEmail}
              onChange={(e) => update("cloudflareEmail", e.target.value)}
              placeholder="vous@entreprise.fr"
              autoComplete="off"
            />
          </Field>
          <Field label="Mot de passe Cloudflare">
            <Input
              type="password"
              value={data.cloudflarePassword}
              onChange={(e) => update("cloudflarePassword", e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
          </Field>
        </Group>

        <Group title="Configuration Formspree">
          <p
            className="text-sm leading-relaxed -mt-1"
            style={{ color: "var(--vb-text-muted)" }}
          >
            Formspree gère la réception des emails envoyés depuis les formulaires de
            contact de votre site. Le service est gratuit jusqu&apos;à 50 messages
            par mois.
          </p>
          <ol
            className="text-sm leading-relaxed list-decimal pl-5 space-y-1"
            style={{ color: "var(--vb-text-muted)" }}
          >
            <li>
              Créez un compte sur{" "}
              <a
                href="https://formspree.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="vb-link"
              >
                formspree.io
              </a>.
            </li>
            <li>
              Validez votre adresse email dès l&apos;inscription (le mail de
              confirmation arrive en quelques secondes ; pensez à vérifier vos
              indésirables).
            </li>
            <li>Indiquez ci-dessous les identifiants utilisés.</li>
          </ol>
          <Field label="Email du compte Formspree">
            <Input
              type="email"
              value={data.formspreeEmail}
              onChange={(e) => update("formspreeEmail", e.target.value)}
              placeholder="vous@entreprise.fr"
              autoComplete="off"
            />
          </Field>
          <Field label="Mot de passe Formspree">
            <Input
              type="password"
              value={data.formspreePassword}
              onChange={(e) => update("formspreePassword", e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
          </Field>
        </Group>

        <Group title="Informations complémentaires">
          <Field
            label="Souhaitez-vous ajouter une information utile à votre projet ?"
            hint="Optionnel."
          >
            <Textarea
              value={data.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Toute information utile à la bonne compréhension de votre projet."
              rows={3}
            />
          </Field>
        </Group>

        <div className="flex flex-col items-stretch sm:items-start gap-3">
          {submitError && (
            <p className="text-sm" style={{ color: "var(--vb-danger)" }}>
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="vb-btn-submit inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold cursor-pointer w-full sm:w-auto"
          >
            {submitting ? "Envoi en cours…" : "Envoyer mes réponses"}
          </button>
        </div>
      </form>
    </main>
    </>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-6 sm:mb-7 flex items-center gap-3.5">
        <span
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
          style={{
            background: "var(--vb-accent)",
            boxShadow: "0 0 0 4px rgba(78, 186, 236, 0.16)",
          }}
          aria-hidden
        />
        <h2
          className="text-[1.5rem] sm:text-[1.75rem] font-semibold tracking-[-0.02em] leading-tight"
          style={{ color: "var(--vb-primary)" }}
        >
          {title}
        </h2>
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
