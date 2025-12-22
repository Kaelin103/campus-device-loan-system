const { ensureSetup, getDevicesContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  await ensureSetup();

  const id = context.bindingData.id;
  context.log(`[updateDevice] Updating device ${id}`);

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const container = getDevicesContainer();

    let existing;
    try {
      const { resource } = await container.item(id, id).read();
      existing = resource;
    } catch (err) {
      if (err?.code !== 404 && err?.code !== 400) throw err;
    }

    if (!existing) {
      const { resources } = await container.items
        .query({
          query: "SELECT * FROM c WHERE c.id = @id",
          parameters: [{ name: "@id", value: id }],
        })
        .fetchAll();
      existing = resources && resources[0];
    }

    if (!existing) {
      context.res = { status: 404, body: { error: "Device not found" } };
      return;
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
    context.res = { status: 200, body: saved };
  } catch (err) {
    context.log("[updateDevice] Error:", err);
    context.res = { status: 500, body: { error: "Failed to update device" } };
  }
};
