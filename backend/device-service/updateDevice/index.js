const { ObjectId } = require("mongodb");
const { ensureSetup, getDevicesContainer } = require("../mongoClient");

module.exports = async function (context, req) {
  const id = context.bindingData.id;

  try {
    await ensureSetup();
    const collection = getDevicesContainer();

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      context.res = {
        status: 404,
        body: { error: "Device not found" },
      };
      return;
    }

    const delta = Number(body.delta || 0);

    const newAvailable =
      delta !== 0
        ? Math.max(0, (existing.availableQuantity || 0) + delta)
        : body.availableQuantity ?? existing.availableQuantity;

    const update = {
      $set: {
        status: body.status ?? existing.status,
        availableQuantity: newAvailable,
        updatedAt: new Date(),
      },
    };

    await collection.updateOne(
      { _id: existing._id },
      update
    );

    const updated = await collection.findOne({ _id: existing._id });

    context.res = {
      status: 200,
      body: updated,
    };
  } catch (err) {
    context.log("[updateDevice] Error:", err);
    context.res = {
      status: 500,
      body: { error: err.message },
    };
  }
};
