const { app } = require("@azure/functions");
const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const DEVICE_SVC_BASE = process.env.DEVICE_SVC_BASE || "http://localhost:32111";

app.http("returnLoan", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "loans/{id}/return",
  handler: async (request, context) => {
    await ensureSetup();
    const id = request.params.id;
    context.log(`[returnLoan] Returning loan ${id}`);
    try {
      const lContainer = getLoansContainer();
      let { resource: loan } = await lContainer.item(id, id).read();
      if (!loan) {
        const { resources } = await lContainer.items
          .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
          .fetchAll();
        loan = resources && resources[0];
      }
      if (!loan) {
        return { status: 404, jsonBody: { error: "Loan not found" } };
      }
      if (loan.status !== "Collected") {
        return { status: 400, jsonBody: { message: `Cannot return loan in status: ${loan.status}` } };
      }

      loan.status = "Returned";
      loan.returnedAt = new Date().toISOString();
      await lContainer.items.upsert(loan);
      const deviceId = loan.deviceId;
      if (!deviceId) {
        return { status: 200, jsonBody: { message: "Returned", loanId: id } };
      }
      try {
        const resp = await fetch(`${DEVICE_SVC_BASE}/api/devices/${deviceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta: +1 }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          context.log(`Device update failed. base=${DEVICE_SVC_BASE} status=${resp.status} body=${text}`);
          return {
            status: 500,
            jsonBody: { message: "Device stock update failed", status: resp.status },
          };
        }
      } catch (err) {
        context.log(`Device update failed. base=${DEVICE_SVC_BASE} error=${err && err.message ? err.message : String(err)}`);
        return {
          status: 500,
          jsonBody: { message: "Device stock update failed" },
        };
      }
      return { status: 200, jsonBody: { message: "Returned", loanId: id, deviceId } };
    } catch (err) {
      context.log("[returnLoan] Error:", err);
      return { status: 500, jsonBody: { error: "Failed to return loan" } };
    }
  },
});
