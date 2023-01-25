exports.checkPositive = (num) => {
  if (num < 0 || typeof num !== "number" || num === Infinity || isNaN(num))
    return false;
  return true;
};

exports.makeAddressString = (user) => {
  outputAddress = "";

  if (user.street_address) outputAddress += user.street_address + ",";
  outputAddress += user.city + ",";
  if (user.postcode) outputAddress += user.postcode + ",";
  if (user.county) outputAddress += user.county + ",";
  outputAddress += user.country;

  return outputAddress;
};
