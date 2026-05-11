import { NextResponse } from "next/server";
import { getQuestionnaireCollection } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    if (!body.entreprise || !body.activite) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (entreprise, activite)" },
        { status: 400 },
      );
    }

    const collection = await getQuestionnaireCollection();
    const doc = {
      ...body,
      createdAt: new Date(),
      userAgent: request.headers.get("user-agent") || null,
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch (err) {
    console.error("[/api/submit] error", err);
    return NextResponse.json(
      { error: "Une erreur est survenue, merci de réessayer." },
      { status: 500 },
    );
  }
}
