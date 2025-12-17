const { webcrypto } = require("crypto");
globalThis.crypto = globalThis.crypto || webcrypto;
const { CosmosClient } = require("@azure/cosmos");
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const dbName = process.env.DATABASE_NAME || "cdls";
const loansContainerName = process.env.LOAN_CONTAINER || "loans";
const devicesContainerName = process.env.DEVICE_CONTAINER || "devices";
if (!endpoint || !key) throw new Error("Cosmos configuration missing");
const client = new CosmosClient({ endpoint, key });
let initialized = false;
async function ensureSetup() {
  if (initialized) return;
  await client.databases.createIfNotExists({ id: dbName });
  await client.database(dbName).containers.createIfNotExists({ id: loansContainerName, partitionKey: { paths: ["/id"], version: 2 } });
  await client.database(dbName).containers.createIfNotExists({ id: devicesContainerName, partitionKey: { paths: ["/id"], version: 2 } });
  initialized = true;
}
function getLoansContainer() {
  return client.database(dbName).container(loansContainerName);
}
function getDevicesContainer() {
  return client.database(dbName).container(devicesContainerName);
}
module.exports = { client, ensureSetup, getLoansContainer, getDevicesContainer };
