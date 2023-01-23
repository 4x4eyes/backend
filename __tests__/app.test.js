const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("users table", () => {
  it("there are 3 users", () => {
    return db.query("SELECT * FROM users;").then((users) => {
      expect(users.rows.length).toBe(3);
    });
  });
});
