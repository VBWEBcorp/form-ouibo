import { MongoClient } from "mongodb";

const globalForMongo = global as unknown as {
  _mongoClient?: Promise<MongoClient>;
};

function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI manquant : ajoutez-le dans les variables d'environnement.",
    );
  }
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClient;
}

export async function getQuestionnaireCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || "OUIBO");
  return db.collection(process.env.MONGODB_COLLECTION || "questionnaires");
}
