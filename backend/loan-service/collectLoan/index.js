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

    const loanId = context.bindingData.id;
    if (!loanId) {
      context.res = {
        status: 400,
        body: { message: "Loan id is required" },
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

    loan.status = "collected";
    loan.collectedAt = new Date().toISOString();

    const { resource: saved } = await container.items.upsert(loan);

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
