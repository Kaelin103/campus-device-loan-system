const { app } = require("@azure/functions");
const { ensureSetup, getLoansContainer } = require("../cosmosClient");
app.http("collectLoan", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "loans/{id}/collect",
  handler: async (request, context) => {
    await ensureSetup();
    const id = request.params.id;
    context.log(`[collectLoan] Collecting loan ${id}`);
    try {
      const container = getLoansContainer();
      let { resource: loan } = await container.item(id, id).read();
      if (!loan) {
        const { resources } = await container.items.query({
          query: "SELECT * FROM c WHERE c.id = @id",
          parameters: [{ name: "@id", value: id }],
        }).fetchAll();
        loan = resources && resources[0];
      }
      if (!loan) {
        return { status: 404, jsonBody: { error: "Loan not found" } };
      }
      if (loan.status !== "Reserved") {
        return { status: 400, jsonBody: { message: `Cannot collect loan in status: ${loan.status}` } };
      }
      loan.status = "Collected";
      loan.collectedAt = new Date().toISOString();
      const { resource: saved } = await container.items.upsert(loan);
      return { status: 200, jsonBody: saved };
    } catch (err) {
      context.log("[collectLoan] Error:", err);
      return { status: 500, jsonBody: { error: "Failed to collect loan" } };
    }
  },
});
