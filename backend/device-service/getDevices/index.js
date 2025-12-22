const { ensureSetup, getDevicesContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  await ensureSetup();
  try {
    const query = "SELECT * FROM c ORDER BY c.name";
    const container = getDevicesContainer();
    const { resources: items } = await container.items.query(query).fetchAll();
    context.res = { status: 200, body: items };
  } catch {
    context.res = { status: 200, body: [] };
  }
};
