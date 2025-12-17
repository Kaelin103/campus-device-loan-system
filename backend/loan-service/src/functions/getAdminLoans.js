const { app } = require("@azure/functions");
const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const auth0JwtCheck = require("../auth/auth0Jwt");
const requireStaff = require("../auth/requireStaff");
const runMiddleware = require("../auth/azureAdapter");

app.http("getAdminLoans", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "staff/loans",
  handler: async (request, context) => {
    context.log("Processing admin loans request");

    // 1. Run Auth0 JWT Check
    const jwtResult = await runMiddleware(request, auth0JwtCheck);
    if (jwtResult.isResponse) {
        context.log("JWT Check failed:", jwtResult.response.status);
        return jwtResult.response;
    }

    // 2. Run Staff Check
    const staffResult = await runMiddleware(jwtResult.req, requireStaff);
    if (staffResult.isResponse) {
        context.log("Staff Check failed:", staffResult.response.status);
        return staffResult.response;
    }

    // 3. Business Logic
    await ensureSetup();
    try {
      const query = "SELECT * FROM c ORDER BY c.createdAt DESC";
      const container = getLoansContainer();
      const { resources: items } = await container.items.query(query).fetchAll();
      return { status: 200, jsonBody: items };
    } catch (error) {
      context.log("Error fetching loans:", error);
      return { status: 500, jsonBody: { message: "Internal Server Error" } };
    }
  },
});
