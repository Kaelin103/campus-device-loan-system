const { connect } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const db = await connect();
    const loans = await db
      .collection("loans")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    context.res = {
      status: 200,
      body: loans.map((l) => ({ ...l, id: l._id?.toString?.() ?? l.id })),
    };
  } catch (err) {
    context.log.error("getAdminLoans failed", err);
    context.res = {
      status: 500,
      body: { message: "Failed to fetch admin loans" },
    };
  }
};
