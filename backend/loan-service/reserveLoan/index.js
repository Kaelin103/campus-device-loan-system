const { ObjectId } = require("mongodb");
const { connect } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const studentId = body.studentId || body.userId;
    const userName = body.userName;
    const deviceId = body.deviceId;

    if (!studentId || !deviceId) {
      context.res = {
        status: 400,
        body: "studentId/userId and deviceId required",
      };
      return;
    }

    const db = await connect();

    const deviceObjectId = ObjectId.isValid(deviceId)
      ? new ObjectId(deviceId)
      : null;
    if (!deviceObjectId) {
      context.res = { status: 400, body: "Invalid deviceId" };
      return;
    }

    const deviceUpdate = await db.collection("devices").findOneAndUpdate(
      { _id: deviceObjectId, availableQuantity: { $gt: 0 } },
      { $inc: { availableQuantity: -1 } },
      { returnDocument: "before" }
    );

    const device = deviceUpdate.value;
    if (!device) {
      context.res = { status: 400, body: "Device unavailable" };
      return;
    }

    const loan = {
      studentId,
      userId: body.userId,
      userName,
      deviceId: deviceObjectId.toString(),
      deviceName: device.name,
      status: "Reserved",
      createdAt: new Date(),
    };

    const inserted = await db.collection("loans").insertOne(loan);
    const saved = { ...loan, _id: inserted.insertedId, id: inserted.insertedId.toString() };

    context.res = {
      status: 201,
      body: saved,
    };
  } catch (err) {
    context.log.error("reserveLoan failed", err);
    context.res = {
      status: 500,
      body: "Reserve failed",
    };
  }
};
