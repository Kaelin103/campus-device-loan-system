const { MongoClient } = require("mongodb");

let client;
let db;
let devicesCollection;

async function ensureSetup() {
  if (devicesCollection) return;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  if (!dbName) {
    throw new Error("MONGODB_DB is not defined");
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  devicesCollection = db.collection("devices");

  console.log("[mongoClient] Connected to MongoDB:", dbName);
}

function getDevicesContainer() {
  if (!devicesCollection) {
    throw new Error("MongoDB not initialized. Call ensureSetup() first.");
  }
  return devicesCollection;
}

module.exports = {
  ensureSetup,
  getDevicesContainer,
};
