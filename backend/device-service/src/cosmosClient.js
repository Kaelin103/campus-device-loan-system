const { webcrypto } = require("crypto");
globalThis.crypto = globalThis.crypto || webcrypto;
const { CosmosClient } = require("@azure/cosmos");
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const dbName = process.env.DATABASE_NAME || "cdls";
const devicesContainerName = process.env.DEVICE_CONTAINER || "devices";
if (!endpoint || !key) throw new Error("Cosmos configuration missing");
const client = new CosmosClient({ endpoint, key });
let devicesContainer;
let initialized = false;
async function ensureSetup() {
  if (initialized) return;
  await client.databases.createIfNotExists({ id: dbName });
  await client.database(dbName).containers.createIfNotExists({ id: devicesContainerName, partitionKey: { paths: ["/id"], version: 2 } });
  devicesContainer = client.database(dbName).container(devicesContainerName);
  initialized = true;
}
function getDevicesContainer() {
  return client.database(dbName).container(devicesContainerName);
}
module.exports = { client, ensureSetup, getDevicesContainer };
