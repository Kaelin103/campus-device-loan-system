const { ensureSetup, getDevicesContainer } = require("../mongoClient");

const demoDevices = [
  {
    name: 'MacBook Pro 14"',
    type: "Laptop",
    status: "Available",
    totalQuantity: 3,
    availableQuantity: 2,
  },
  {
    name: "Surface Pro 7",
    type: "Tablet",
    status: "LoanedOut",
    totalQuantity: 2,
    availableQuantity: 0,
  },
  {
    name: "iPad Air",
    type: "Tablet",
    status: "Available",
    totalQuantity: 5,
    availableQuantity: 5,
  },
];

module.exports = async function (context, req) {
  try {
    await ensureSetup();
    const collection = getDevicesContainer();

    await collection.insertMany(
      demoDevices.map(d => ({
        ...d,
        seededAt: new Date(),
      }))
    );

    context.res = {
      status: 200,
      body: { message: "Seeded demo devices" },
    };
  } catch (err) {
    context.log("[seedDevices] Error:", err);
    context.res = {
      status: 500,
      body: { error: err.message },
    };
  }
};
