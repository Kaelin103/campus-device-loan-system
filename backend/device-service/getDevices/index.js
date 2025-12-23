const { ensureSetup, getDevicesContainer } = require("../mongoClient");

module.exports = async function (context, req) {
  try {
    await ensureSetup();
    const collection = getDevicesContainer();

    const items = await collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    context.res = { status: 200, body: items };
  } catch (err) {
    context.log("[getDevices] Error:", err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
