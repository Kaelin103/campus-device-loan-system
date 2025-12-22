const { webcrypto } = require("crypto");
globalThis.crypto = globalThis.crypto || webcrypto;
const { CosmosClient } = require("@azure/cosmos");

let client;
let initialized = false;

function getClient() {
  if (client) return client;

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  if (!endpoint || !key) throw new Error("Cosmos configuration missing");

  client = new CosmosClient({ endpoint, key });
  return client;
}

async function ensureSetup() {
  if (initialized) return;

  const dbName = process.env.DATABASE_NAME || "cdls";
  const devicesContainerName = process.env.DEVICE_CONTAINER || "devices";

  const client = getClient();
  await client.databases.createIfNotExists({ id: dbName });
  await client
    .database(dbName)
    .containers.createIfNotExists({
      id: devicesContainerName,
      partitionKey: { paths: ["/id"], version: 2 },
    });

  initialized = true;
}

function getDevicesContainer() {
  const client = getClient();
  const dbName = process.env.DATABASE_NAME || "cdls";
  const devicesContainerName = process.env.DEVICE_CONTAINER || "devices";
  return client.database(dbName).container(devicesContainerName);
}

module.exports = { getClient, ensureSetup, getDevicesContainer };
Object.defineProperty(module.exports, "client", { get: () => client });
