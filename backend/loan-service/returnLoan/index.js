const { ensureSetup, getLoansContainer } = require("../cosmosClient");
const auth0JwtCheck = require("../auth/auth0Jwt");
const runMiddleware = require("../auth/azureAdapter");

module.exports = async function (context, req) {
  const jwt = await runMiddleware(req, auth0JwtCheck);
  if (jwt.isResponse) {
    context.res = jwt.response;
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

  try {
    await ensureSetup();
  } catch (err) {
    context.log.error("Cosmos configuration missing", err);
    context.res = {
      status: 500,
      body: { message: "Database configuration error" },
    };
    return;
  }

  try {
    const container = getLoansContainer();

    let loan;
    try {
      const { resource } = await container.item(loanId, loanId).read();
      loan = resource;
    } catch (err) {
      if (err?.code !== 404 && err?.code !== 400) throw err;
    }

    if (!loan) {
      const query = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: loanId }],
      };
      const { resources } = await container.items.query(query).fetchAll();
      loan = resources && resources[0];
    }

    if (!loan) {
      context.res = {
        status: 404,
        body: { message: "Loan not found" },
      };
      return;
    }

    if (loan.status !== "collected") {
      context.res = {
        status: 409,
        body: { message: `Cannot return loan in status '${loan.status}'` },
      };
      return;
    }

    loan.status = "returned";
    loan.returnedAt = new Date().toISOString();

    const { resource: saved } = await container.items.upsert(loan);

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
