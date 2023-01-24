const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("GET /", () => {
  it("responds", () => {
    return request(app)
      .get("/")
      .expect(200)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("connected");
      });
  });
});

describe("handles 404", () => {
  it("returns 404 when requested endpoint is not found", () => {
    return request(app)
      .get("/splorgle/cheese")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("path not found");
      });
  });
});
