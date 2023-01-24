exports.checkPositive = (num) => {
  if (num < 0 || typeof num !== "number" || num === Infinity || isNaN(num))
    return false;
  return true;
};
