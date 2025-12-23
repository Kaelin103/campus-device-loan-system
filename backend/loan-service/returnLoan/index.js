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

    const existing = await db.collection("loans").findOne({ _id: loanObjectId });
    if (!existing) {
      context.res = { status: 404, body: { message: "Loan not found" } };
      return;
    }
    if (existing.status !== "Collected") {
      context.res = {
        status: 409,
        body: { message: `Cannot return loan in status '${existing.status}'` },
      };
      return;
    }

    const updated = await db.collection("loans").findOneAndUpdate(
      { _id: loanObjectId },
      { $set: { status: "Returned", returnedAt: new Date() } },
      { returnDocument: "after" }
    );

    const deviceIdRaw = body.deviceId || existing.deviceId;
    if (deviceIdRaw && ObjectId.isValid(deviceIdRaw)) {
      await db
        .collection("devices")
        .updateOne({ _id: new ObjectId(deviceIdRaw) }, { $inc: { availableQuantity: 1 } });
    }

    const saved = { ...updated.value, id: updated.value._id.toString() };

    context.res = {
      status: 200,
      body: saved,
    };
  } catch (err) {
    context.log.error("Return loan failed", err);
    context.res = {
      status: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
