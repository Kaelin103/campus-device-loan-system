module.exports = async function runMiddleware(request, middleware) {
  return new Promise((resolve, reject) => {
    const reqMock = {
      headers: {},
      auth: request.auth || null, 
    };

    if (request.headers) {
      if (typeof request.headers.entries === 'function') {
         for (const [key, value] of request.headers.entries()) {
           reqMock.headers[key.toLowerCase()] = value;
         }
      } else {
         for (const key in request.headers) {
             reqMock.headers[key.toLowerCase()] = request.headers[key];
         }
      }
    }

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
          response: { status: this._status, body: body },
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

    const next = (err) => {
      if (err) {
        if (err.name === 'UnauthorizedError') {
             resolve({
                isResponse: true,
                response: { status: 401, body: { message: err.message } }
             });
        } else {
             resolve({
                 isResponse: true,
                 response: { status: 500, body: { message: err.message } }
             });
        }
      } else {
        resolve({ isResponse: false, req: reqMock });
      }
    };

    try {
        middleware(reqMock, resMock, next);
    } catch (e) {
        reject(e);
    }
  });
};
