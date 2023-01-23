const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("seed data tables", () => {
  it("there are 3 users", () => {
    return db.query("SELECT * FROM users;").then((users) => {
      expect(users.rows.length).toBe(3);
    });
  });

  it("there are 9 game categories", () => {
    return db.query("SELECT * FROM game_categories;").then((categories) => {
      console.log(categories);
      expect(categories.rows.length).toBe(9);
    });
  });
});
