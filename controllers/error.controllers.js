exports.handle404Paths = (request, response, next) => {
  response.status(404).send({ msg: "path not found" });
};

exports.handleSqlError = (error, request, response, next) => {
  const errorCodes400 = ["22P02", "23502", "23503", "42601"];
  if (errorCodes400.includes(error.code)) {
    response.status(400).send({ msg: "bad request" });
  } else {
    next(error);
  }
};

exports.handleCustomError = (error, request, response, next) => {
  if (error.code && error.msg) {
    response.status(error.code).send({ msg: error.msg });
  } else {
    next(error);
  }
};

exports.handle500Error = (error, request, response, next) => {
  console.log("CRUMBS! A 500!", error);
  response.status(500).send({ msg: "internal server error" });
};
