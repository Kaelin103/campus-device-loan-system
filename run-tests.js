const http = require("http");
function callApi(method, base, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + (url.search || ""),
      headers: body ? { "Content-Type": "application/json", "Content-Length": data.length } : {}
    };
    const req = http.request(options, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        try { resolve(JSON.parse(text)); } catch { resolve(text); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}
(async () => {
  const deviceBase = "http://localhost:32101";
  const loanBase = "http://localhost:32102";
  const targetDevice = "macbook-pro-1";
  console.log("=== DCampus Device Loan Automated Test (Node) ===");
  const seed = await callApi("POST", deviceBase, "/api/devices/seed");
  console.log("Seed Response:", typeof seed === "string" ? seed : seed.message);
  const devices = await callApi("GET", deviceBase, "/api/devices");
  console.log("--- Devices count:", Array.isArray(devices) ? devices.length : 0);
  const loan = await callApi("POST", loanBase, "/api/loans", { userId: "test-user", userName: "Test User", deviceId: targetDevice });
  const loanId = loan.id;
  console.log("--- Reserved Loan ID:", loanId);
  const collected = await callApi("POST", loanBase, `/api/loans/${loanId}/collect`);
  console.log("--- Collect Status:", collected.status);
  const returned = await callApi("POST", loanBase, `/api/loans/${loanId}/return`);
  console.log("--- Return Status:", returned.status);
  const after = await callApi("GET", deviceBase, "/api/devices");
  const mbp = Array.isArray(after) ? after.find((d) => d.id === targetDevice) : null;
  console.log("--- Final Available Quantity:", mbp ? mbp.availableQuantity : "N/A");
  console.log("=== TEST COMPLETED SUCCESSFULLY ===");
})().catch((err) => {
  console.error("TEST FAILED", err);
  process.exit(1);
});
