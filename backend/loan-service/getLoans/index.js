const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const auth0JwtCheck = require("../auth/auth0Jwt");
const runMiddleware = require("../auth/azureAdapter");

module.exports = async function (context, req) {
  try {
    const jwt = await runMiddleware(req, auth0JwtCheck);
    if (jwt.isResponse) {
      context.res = jwt.response;
      return;
    }

    const user = jwt.req.auth;
    const userSub = user?.sub;
    if (!userSub) {
      context.res = {
        status: 401,
        body: { message: "Unauthorized" },
      };
      return;
    }

    await ensureSetup();
    const container = getLoansContainer();

    const querySpec = {
      query:
        "SELECT * FROM c WHERE c.reservedBy = @uid OR c.borrowerId = @uid OR c.userId = @uid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@uid", value: userSub }],
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    context.res = {
      status: 200,
      body: resources || [],
    };
  } catch (err) {
    context.log.error("getLoans failed", err);
    context.res = {
      status: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
