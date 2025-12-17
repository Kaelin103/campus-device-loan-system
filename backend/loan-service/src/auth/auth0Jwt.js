const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const auth0JwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-bs8f6ioqhkbhfd04.us.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://cdls-api",
  issuer: "https://dev-bs8f6ioqhkbhfd04.us.auth0.com/",
  algorithms: ["RS256"],
});

module.exports = auth0JwtCheck;
