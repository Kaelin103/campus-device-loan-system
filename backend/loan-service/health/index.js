module.exports = async function (context, req ) {
  context.res  = {
    status: 200 ,
    body : {
      status: "ok" ,
      service: "loan-service" ,
      time: new Date().toISOString ()
    }
  };
};