const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const auth0JwtCheck = require("../auth/auth0Jwt");
const requireStaff = require("../auth/requireStaff");
const runMiddleware = require("../auth/azureAdapter");

module.exports = async function (context, req) {
  try {
    const jwt = await runMiddleware(req, auth0JwtCheck);
    if (jwt.isResponse) {
      context.res = jwt.response;
      return;
    }

    const staff = await runMiddleware(jwt.req, requireStaff);
    if (staff.isResponse) {
      context.res = staff.response;
      return;
    }

    await ensureSetup();
    const container = getLoansContainer();

    const query = {
      query: "SELECT * FROM c ORDER BY c.createdAt DESC",
    };

    const { resources: loans } = await container.items.query(query).fetchAll();

    context.res = {
      status: 200,
      body: loans,
    };
  } catch (err) {
    context.log.error("getAdminLoans failed", err);
    context.res = {
      status: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
