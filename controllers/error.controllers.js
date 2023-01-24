exports.handle404Paths = (request, response, next) => {
  response.status(404).send({ msg: "path not found" });
};
