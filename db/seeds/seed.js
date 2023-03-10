const db = require("../connection");
const format = require("pg-format");

// messages

const seed = async (data) => {
  const { users, gameCategories, sessions, userGames, messages } = data;

  await db.query("DROP TABLE IF EXISTS messages;");
  await db.query("DROP TABLE IF EXISTS sessions;");
  await db.query("DROP TABLE IF EXISTS user_games;");
  await db.query("DROP TABLE IF EXISTS game_categories;");
  await db.query("DROP TABLE IF EXISTS users;");

  const usersTablePromise = db.query(`CREATE TABLE users (
    username VARCHAR NOT NULL PRIMARY KEY,
    avatar_url VARCHAR,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    dob VARCHAR(10) NOT NULL,
    street_address VARCHAR,
    city VARCHAR NOT NULL,
    postcode VARCHAR,
    county VARCHAR,
    country VARCHAR NOT NULL,
    distance_radius FLOAT NOT NULL DEFAULT 1,
    email VARCHAR NOT NULL,
    phone_number VARCHAR(11) NOT NULL
    );`);

  const gameCategoriesTablePromise = db.query(`CREATE TABLE game_categories (
    category_id SERIAL PRIMARY KEY,
    category_slug VARCHAR NOT NULL,
    category_description VARCHAR NOT NULL
    );`);

  await Promise.all([usersTablePromise, gameCategoriesTablePromise]);

  const userGamesTablePromise = db.query(`CREATE TABLE user_games (
    user_game_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL REFERENCES users(username),
    game_name VARCHAR NOT NULL,
    category_id INT NOT NULL REFERENCES game_categories(category_id)
    );`);

  const sessionsTablePromise = db.query(`CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    user_a_name VARCHAR NOT NULL REFERENCES users(username),
    user_b_name VARCHAR NOT NULL REFERENCES users(username)
    );`);

  await Promise.all([userGamesTablePromise, sessionsTablePromise]);

  await db.query(`CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES sessions(session_id),
    author_name VARCHAR NOT NULL REFERENCES users(username),
    message_body VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    );`);

  const insertUsersString = format(
    `INSERT INTO users 
  (username, avatar_url, first_name, last_name, dob, street_address, city, postcode, county, country, distance_radius, email, phone_number)
  VALUES %L RETURNING *;`,
    users.map(
      ({
        username,
        avatar_url,
        first_name,
        last_name,
        dob,
        street_address,
        city,
        postcode,
        county,
        country,
        distance_radius,
        email,
        phone_number,
      }) => [
        username,
        avatar_url,
        first_name,
        last_name,
        dob,
        street_address,
        city,
        postcode,
        county,
        country,
        distance_radius,
        email,
        phone_number,
      ]
    )
  );

  const usersPromise = db
    .query(insertUsersString)
    .then((result) => result.rows);

  const gameCategoriesString = format(
    `INSERT INTO game_categories (category_slug, category_description) VALUES %L RETURNING *;`,
    gameCategories.map(({ slug, description }) => [slug, description])
  );

  const gameCategoriesPromise = db
    .query(gameCategoriesString)
    .then((result) => result.rows);

  await Promise.all([usersPromise, gameCategoriesPromise]);

  const insertSessionString = format(
    `
  INSERT INTO sessions
  (user_a_name, user_b_name)
  VALUES %L
  RETURNING *;
  `,
    sessions.map(({ user_a_name, user_b_name }) => [user_a_name, user_b_name])
  );
  const sessionsPromise = db
    .query(insertSessionString)
    .then((result) => result.rows);
  await Promise.all([sessionsPromise]);

  const insertUserGameString = format(
    ` INSERT INTO user_games (
      username, game_name, category_id
    ) VALUES %L RETURNING *;
    `,
    userGames.map(({ username, game_name, category_id }) => [
      username,
      game_name,
      category_id,
    ])
  );

  const userGamesPromise = db
    .query(insertUserGameString)
    .then((result) => result.rows);

  await Promise.all([userGamesPromise]);

  const insertMessagesString = format(
    `
    INSERT INTO messages
    (session_id, author_name, message_body, created_at)
    VALUES %L
    RETURNING *;
    `,
    messages.map(({ session_id, author_name, message_body, created_at }) => [
      session_id,
      author_name,
      message_body,
      created_at,
    ])
  );

  await db.query(insertMessagesString).then((result) => result.rows);
};

module.exports = seed;
