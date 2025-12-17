/**
 * Helper to run Express middleware in Azure Functions V4
 * @param {HttpRequest} request - The Azure Function V4 request object
 * @param {Function} middleware - The Express middleware function (req, res, next)
 * @returns {Promise<object>} - Returns context object with { req, isResponse, response }
 */
module.exports = async function runMiddleware(request, middleware) {
  return new Promise((resolve, reject) => {
    // 1. Mock Express Request
    const reqMock = {
      headers: {},
      auth: request.auth || null, 
    };

    // Copy headers from Azure HttpRequest (Map-like) or existing object
    if (request.headers) {
      if (typeof request.headers.entries === 'function') {
         // Azure HttpRequest
         for (const [key, value] of request.headers.entries()) {
           reqMock.headers[key.toLowerCase()] = value;
         }
      } else {
         // Plain object (chained mock)
         // reqMock.headers = { ...request.headers };
         // Normalize keys to lowercase
         for (const key in request.headers) {
             reqMock.headers[key.toLowerCase()] = request.headers[key];
         }
      }
    }

    // 2. Mock Express Response
    const resMock = {
      _status: 200,
      _body: null,
      status: function (code) {
        this._status = code;
        return this;
      },
      json: function (body) {
        this._body = body;
        resolve({
          isResponse: true,
          response: { status: this._status, jsonBody: body },
        });
        return this;
      },
      send: function (body) {
        this._body = body;
        resolve({
            isResponse: true,
            response: { status: this._status, body: body }
        });
        return this;
      },
      setHeader: () => {},
      end: () => {}
    };

    // 3. Mock Next
    const next = (err) => {
      if (err) {
        // Middleware reported an error (e.g. invalid token)
        if (err.name === 'UnauthorizedError') {
             resolve({
                isResponse: true,
                response: { status: 401, jsonBody: { message: err.message } }
             });
        } else {
             // Other errors
             resolve({
                 isResponse: true,
                 response: { status: 500, jsonBody: { message: err.message } }
             });
        }
      } else {
        // Middleware passed
        resolve({ isResponse: false, req: reqMock });
      }
    };

    // 4. Run
    try {
        middleware(reqMock, resMock, next);
    } catch (e) {
        reject(e);
    }
  });
};
