const db = require("../db/connection");

exports.insertUser = (newUser) => {
  const insertUserValues = [
    newUser.username,
    newUser.avatar_url,
    newUser.first_name,
    newUser.last_name,
    newUser.dob,
    newUser.street_address,
    newUser.city,
    newUser.postcode,
    newUser.county,
    newUser.country,
    newUser.distance_radius,
    newUser.email,
    newUser.phone_number,
  ];

  const insertUserQuery = `
  INSERT INTO users (
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
    phone_number
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
  )
  RETURNING *
  ;`;

  return db.query(insertUserQuery, insertUserValues).then((res) => {
    return res.rows[0];
  });
};

const selectSingleUserString = `SELECT * FROM users WHERE username = $1;`;

exports.checkUsernameExists = (username) => {
  const getUsernamesString = `SELECT username FROM users;`;

  return db.query(getUsernamesString).then(({ rows: usernames }) => {
    if (!username) return false;
    if (Number(username)) return false;

    let usernameExists = false;

    for (i = 0; i < usernames.length; i++) {
      if (usernames[i].username.toUpperCase() === username.toUpperCase()) {
        usernameExists = true;
        i = usernames.length;
      }
    }
    return usernameExists;
  });
};

exports.selectSingleUser = (username) => {
  return db.query(selectSingleUserString, [username]).then((result) => {
    return result.rows[0];
  });
};

exports.updateSingleUser = (username, updateBody) => {
  const validKeys = [
    "avatar_url",
    "first_name",
    "last_name",
    "street_address",
    "city",
    "postcode",
    "county",
    "country",
    "distance_radius",
    "email",
    "phone number",
  ];

  const inputValues = [username];

  let updateString = "UPDATE users SET ";

  for (const [key, value] of Object.entries(updateBody)) {
    if (validKeys.includes(key)) {
      updateString += `${key} = $${inputValues.length + 1}, `;
      inputValues.push(value);
    }
  }

  updateString = updateString.slice(0, -2);

  updateString += " WHERE username = $1 RETURNING *;";

  return db.query(updateString, inputValues).then(({ rows }) => rows[0]);
};

exports.selectUsersWithGames = () => {
  return db
    .query(
      `
    SELECT
      users.username,
      street_address,
      city,
      postcode,
      county,
      country,
      distance_radius,
      array_agg(
        game_name || '*@' ||
        category_slug || '*@' ||
        user_games.category_id
      ) AS games
    FROM users
    LEFT JOIN user_games USING (username) 
    LEFT JOIN game_categories USING (category_id) 
    GROUP BY users.username;
    `
    )
    .then(({ rows }) => rows);
};

exports.selectSessionsByUsername = (username) => {
  return db
    .query(
      `SELECT * FROM sessions 
    WHERE user_a_name = $1 OR user_b_name = $1`,
      [username]
    )
    .then(({ rows }) => {
      return rows;
    });
};
exports.insertSession = (user_a_name, user_b_name) => {
  return db
    .query(
      `INSERT INTO sessions
    (user_a_name, user_b_name)
    VALUES ($1, $2)
    RETURNING *;`,
      [user_a_name, user_b_name]
    )
    .then(({ rows }) => rows[0]);
};

exports.selectMessagesBySessionId = (session_id) => {
  return db
    .query(
      `SELECT * FROM messages 
  WHERE session_id = $1`,
      [session_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.checkSessionIdExists = (session_id) => {
  return db
    .query(
      `SELECT * FROM sessions 
  WHERE session_id = $1`,
      [session_id]
    )
    .then(({ rows }) => {
      return rows.length !== 0;
    });
};

exports.checkSessionWithUsersExists = (user_a_name, user_b_name) => {
  return db
    .query(
      `SELECT * FROM sessions 
  WHERE (user_a_name = $1 AND user_b_name = $2) OR (user_a_name = $2 AND user_b_name = $1)`,
      [user_a_name, user_b_name]
    )
    .then(({ rows }) => rows.length > 0);
};

exports.checkUserInSession = (session_id, author_name) => {
  return db
    .query(
      `SELECT * FROM sessions 
      WHERE (user_a_name = $1 OR user_b_name = $1) AND session_id = $2;`,
      [author_name, session_id]
    )
    .then(({ rows }) => rows.length > 0);
};

exports.insertMessage = (session_id, { author_name, message_body }) => {
  return db
    .query(
      `INSERT INTO messages (session_id, author_name, message_body) 
    VALUES ($1, $2, $3) RETURNING *;`,
      [session_id, author_name, message_body]
    )
    .then(({ rows }) => rows[0]);
};

exports.selectGamesByUsername = (username) => {
  return db
    .query(
      `SELECT game_name, user_games.category_id, category_slug 
  FROM user_games JOIN game_categories 
  USING (category_id) WHERE username = $1;`,
      [username]
    )
    .then(({ rows }) => rows);
};

exports.insertGame = (username, { game_name, category_id }) => {
  return db
    .query(
      `INSERT INTO user_games (username, game_name, category_id) 
    VALUES ($1, $2, $3) 
    RETURNING user_game_id, game_name, category_id;`,
      [username, game_name, category_id]
    )
    .then(({ rows }) => rows[0]);
};
