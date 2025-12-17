const { app } = require("@azure/functions");
const { ensureSetup, getLoansContainer } = require("../cosmosClient");
app.http("getLoans", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "loans",
  handler: async () => {
    await ensureSetup();
    try {
      const query = "SELECT * FROM c ORDER BY c.createdAt DESC";
      const container = getLoansContainer();
      const { resources: items } = await container.items.query(query).fetchAll();
      return { status: 200, jsonBody: items };
    } catch {
      return { status: 200, jsonBody: [] };
    }
  },
});
