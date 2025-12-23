const { connect } = require("../cosmosClient");

module.exports = async function (context) {
  try {
    const db = await connect();
    await db.command({ ping: 1 });

    context.res = {
      status: 200,
      body: { status: "ok", db: "connected" },
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      body: { status: "error", message: err.message },
    };
  }
};
