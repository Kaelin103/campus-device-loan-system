const { ObjectId } = require("mongodb");
const { connect } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const loanId = context.bindingData.id || body.loanId;
    if (!loanId) {
      context.res = {
        status: 400,
        body: { message: "Loan id is required" },
      };
      return;
    }

    const db = await connect();
    const loanObjectId = ObjectId.isValid(loanId) ? new ObjectId(loanId) : null;
    if (!loanObjectId) {
      context.res = { status: 400, body: { message: "Invalid loan id" } };
      return;
    }

    const updated = await db.collection("loans").findOneAndUpdate(
      { _id: loanObjectId, status: "Reserved" },
      { $set: { status: "Collected", collectedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated.value) {
      const exists = await db.collection("loans").findOne({ _id: loanObjectId });
      context.res = exists
        ? { status: 409, body: { message: `Cannot collect loan in status '${exists.status}'` } }
        : { status: 404, body: { message: "Loan not found" } };
      return;
    }

    const saved = { ...updated.value, id: updated.value._id.toString() };

    context.res = {
      status: 200,
      body: saved,
    };
  } catch (err) {
    context.log.error("collectLoan failed", err);
    context.res = {
      status: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
