const { ensureSetup, getDevicesContainer } = require("../cosmosClient");

const demoDevices = [
  { id: "macbook-pro-1", name: 'MacBook Pro 14"', type: "Laptop", status: "Available", totalQuantity: 3, availableQuantity: 2 },
  { id: "surface-pro-7-1", name: "Surface Pro 7", type: "Tablet", status: "LoanedOut", totalQuantity: 2, availableQuantity: 0 },
  { id: "ipad-air-1", name: "iPad Air", type: "Tablet", status: "Available", totalQuantity: 5, availableQuantity: 5 },
];

module.exports = async function (context, req) {
  await ensureSetup();
  context.log("[seedDevices] Seeding demo devices");
  try {
    const container = getDevicesContainer();
    const operations = demoDevices.map((d) =>
      container.items.upsert({ ...d, seededAt: new Date().toISOString() })
    );
    await Promise.all(operations);
    context.res = { status: 200, body: { message: "Seeded demo devices" } };
  } catch (err) {
    context.log("[seedDevices] Error:", err);
    context.res = { status: 500, body: { error: "Failed to seed devices" } };
  }
};
