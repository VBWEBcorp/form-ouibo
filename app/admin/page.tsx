import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getQuestionnaireCollection } from "@/lib/mongodb";
import { AdminLogin } from "./AdminLogin";
import { AdminTable, type Submission } from "./AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await isAdminAuthenticated();
  if (!auth) {
    return <AdminLogin />;
  }

  const col = await getQuestionnaireCollection();
  const docs = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();
  const submissions: Submission[] = docs.map((d) => ({
    _id: d._id.toString(),
    createdAt:
      d.createdAt instanceof Date
        ? d.createdAt.toISOString()
        : typeof d.createdAt === "string"
          ? d.createdAt
          : new Date().toISOString(),
    contactNom: typeof d.contactNom === "string" ? d.contactNom : "",
    contactEmail: typeof d.contactEmail === "string" ? d.contactEmail : "",
    entreprise: typeof d.entreprise === "string" ? d.entreprise : "",
    activite: typeof d.activite === "string" ? d.activite : "",
    positionnement: typeof d.positionnement === "string" ? d.positionnement : "",
    cible: typeof d.cible === "string" ? d.cible : "",
    histoire: typeof d.histoire === "string" ? d.histoire : "",
    siteExistant:
      d.siteExistant === "oui" || d.siteExistant === "non" ? d.siteExistant : "",
    siteExistantUrl: typeof d.siteExistantUrl === "string" ? d.siteExistantUrl : "",
    reseauxSociaux: typeof d.reseauxSociaux === "string" ? d.reseauxSociaux : "",
    inspirations: typeof d.inspirations === "string" ? d.inspirations : "",
    fonctionnalites: typeof d.fonctionnalites === "string" ? d.fonctionnalites : "",
    motsCles: typeof d.motsCles === "string" ? d.motsCles : "",
    cloudflareEmail: typeof d.cloudflareEmail === "string" ? d.cloudflareEmail : "",
    cloudflarePassword:
      typeof d.cloudflarePassword === "string" ? d.cloudflarePassword : "",
    formspreeEmail: typeof d.formspreeEmail === "string" ? d.formspreeEmail : "",
    formspreePassword:
      typeof d.formspreePassword === "string" ? d.formspreePassword : "",
    notes: typeof d.notes === "string" ? d.notes : "",
  }));

  return <AdminTable submissions={submissions} />;
}
