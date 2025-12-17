const { app } = require("@azure/functions");
const { ensureSetup, getDevicesContainer } = require("../cosmosClient");
app.http("updateDevice", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "devices/{id}",
  handler: async (request, context) => {
    await ensureSetup();
    const id = request.params.id;
    context.log(`[updateDevice] Updating device ${id}`);
    try {
      const body = await request.json();
      const container = getDevicesContainer();
      let { resource: existing } = await container.item(id, id).read();
      if (!existing) {
        const { resources } = await container.items
          .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
          .fetchAll();
        existing = resources && resources[0];
      }
      if (!existing) {
        return { status: 404, jsonBody: { error: "Device not found" } };
      }
      const delta = Number(body.delta || 0);
      const newAvailable =
        delta !== 0
          ? Math.max(0, (existing.availableQuantity || 0) + delta)
          : body.availableQuantity ?? existing.availableQuantity;
      const updated = {
        ...existing,
        status: body.status ?? existing.status,
        availableQuantity: newAvailable,
        updatedAt: new Date().toISOString(),
      };
      const { resource: saved } = await container.items.upsert(updated);
      return { status: 200, jsonBody: saved };
    } catch (err) {
      context.log("[updateDevice] Error:", err);
      return { status: 500, jsonBody: { error: "Failed to update device" } };
    }
  },
});
