exports.getRoot = (request, response, next) => {
  response.status(200).send({ msg: "connected" });
};
