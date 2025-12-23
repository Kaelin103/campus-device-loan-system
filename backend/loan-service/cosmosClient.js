const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "cdls";

let client;
let db;

async function connect() {
  if (db) return db;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log("✅ MongoDB connected:", dbName);

  return db;
}

module.exports = { connect };
