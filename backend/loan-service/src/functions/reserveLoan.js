const { app } = require("@azure/functions");
const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const DEVICE_SVC_BASE = process.env.DEVICE_SVC_BASE || "http://localhost:32111";

app.http("reserveLoan", {
  methods: ["POST"],
  authLevel: "anonymous", // 之后需要学生登录
  route: "loans",
  handler: async (request, context) => {
    await ensureSetup();
    context.log("[reserveLoan] Creating new loan");
    try {
      const { v4: uuid } = await import("uuid");
      const body = await request.json();
      const { userId, userName, deviceId } = body;
      const devResp = await fetch(`${DEVICE_SVC_BASE}/api/devices`);
      const devList = devResp.ok ? await devResp.json() : [];
      const device = devList.find((d) => d.id === deviceId);
      if (!device) {
        return { status: 404, jsonBody: { error: "Device not found" } };
      }
      if (device.availableQuantity <= 0) {
        return {
          status: 409,
          jsonBody: { error: "No available units; you may join waitlist later" },
        };
      }
      const now = new Date();
      const due = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const loan = {
        id: uuid(),
        userId,
        userName: userName || "Student",
        deviceId,
        deviceName: device.name,
        status: "Reserved",
        createdAt: now.toISOString(),
        dueAt: due.toISOString(),
      };
      const lContainer = getLoansContainer();
      const { resource: savedLoan } = await lContainer.items.create(loan);
      const upd = await fetch(`${DEVICE_SVC_BASE}/api/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: -1 }),
      });
      if (!upd.ok) {
        const t = await upd.text();
        context.log(`Device update failed. base=${DEVICE_SVC_BASE} status=${upd.status} body=${t}`);
      }
      return { status: 200, jsonBody: savedLoan };
    } catch (err) {
      context.log("[reserveLoan] Error:", err);
      return { status: 500, jsonBody: { error: "Failed to create loan" } };
    }
  },
});
