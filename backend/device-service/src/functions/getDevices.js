const { app } = require("@azure/functions");
const { ensureSetup, getDevicesContainer } = require("../cosmosClient");
app.http("getDevices", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "devices",
  handler: async () => {
    await ensureSetup();
    try {
      const query = "SELECT * FROM c ORDER BY c.name";
      const container = getDevicesContainer();
      const { resources: items } = await container.items.query(query).fetchAll();
      return { status: 200, jsonBody: items };
    } catch {
      return { status: 200, jsonBody: [] };
    }
  },
});
