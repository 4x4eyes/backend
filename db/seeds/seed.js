const db = require("../connection");
const format = require("pg-format");

const seed = async (data) => {
  //   const { users, user_games, game_categories, sessions, messages } =
  //     data;
  await db.query("DROP TABLE IF EXISTS messages;");
  await db.query("DROP TABLE IF EXISTS sessions;");
  await db.query("DROP TABLE IF EXISTS user_games;");
  await db.query("DROP TABLE IF EXISTS game_categories;");
  await db.query("DROP TABLE IF EXISTS users;");

  const usersTablePromise = db.query(`CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    avatar_url VARCHAR,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    age INT NOT NULL,
    street_address VARCHAR,
    city VARCHAR NOT NULL,
    post_code VARCHAR,
    county VARCHAR,
    country VARCHAR NOT NULL,
    distance_radius FLOAT NOT NULL DEFAULT 1,
    email VARCHAR NOT NULL,
    phone_number INT NOT NULL
    );`);

  const gameCategoriesTablePromise = db.query(`CREATE TABLE game_categories (
    category_id SERIAL PRIMARY KEY,
    category_slug VARCHAR NOT NULL,
    category_description VARCHAR NOT NULL
    );`);

  await Promise.all([usersTablePromise, gameCategoriesTablePromise]);

  const userGamesTablePromise = db.query(`CREATE TABLE user_games (
    user_game_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    game_name VARCHAR NOT NULL,
    category_id INT NOT NULL REFERENCES game_categories(category_id)
    );`);

  const sessionsTablePromise = db.query(`CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    user_a_id INT NOT NULL REFERENCES users(user_id),
    user_b_id INT NOT NULL REFERENCES users(user_id)
    );`);

  await Promise.all([userGamesTablePromise, sessionsTablePromise]);

  await db.query(`CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES sessions(session_id),
    message_body VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    );`);
};

module.exports = seed;
