const { checkPositive } = require("../utils/utils");

describe("checkPositive", () => {
  it("returns true for positive", () => {
    expect(checkPositive(2)).toBe(true);
    expect(checkPositive(10)).toBe(true);
  });

  it("returns false for negative", () => {
    expect(checkPositive(-1)).toBe(false);
    expect(checkPositive(-30)).toBe(false);
  });

  it("returns false for non numbers", () => {
    expect(checkPositive("string")).toBe(false);
    expect(checkPositive(true)).toBe(false);
    expect(checkPositive({})).toBe(false);
    expect(checkPositive([])).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(checkPositive(Infinity)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(checkPositive(NaN)).toBe(false);
  });
});
