const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const auth0JwtCheck = require("../auth/auth0Jwt");
const runMiddleware = require("../auth/azureAdapter");

module.exports = async function (context, req) {
  try {
    const loanId = context.bindingData.id;

    if (!loanId) {
      context.res = {
        status: 400,
        body: { message: "Loan id is required" },
      };
      return;
    }

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

    let loan;
    try {
      const { resource } = await container.item(loanId, loanId).read();
      loan = resource;
    } catch (err) {
      if (err?.code !== 404 && err?.code !== 400) throw err;
    }

    if (!loan) {
      const { resources } = await container.items
        .query({
          query: "SELECT * FROM c WHERE c.id = @id",
          parameters: [{ name: "@id", value: loanId }],
        })
        .fetchAll();
      loan = resources && resources[0];
    }

    if (!loan) {
      context.res = {
        status: 404,
        body: { message: "Loan not found" },
      };
      return;
    }

    if (loan.status !== "available") {
      context.res = {
        status: 400,
        body: { message: `Loan cannot be reserved from status '${loan.status}'` },
      };
      return;
    }

    loan.status = "reserved";
    loan.reservedBy = userSub;
    loan.reservedAt = new Date().toISOString();

    const { resource: saved } = await container.items.upsert(loan);

    context.res = {
      status: 200,
      body: saved,
    };
  } catch (err) {
    context.log.error("reserveLoan failed", err);
    context.res = {
      status: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
