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

exports.selectUsers = () => {
  return db
    .query(
      `
    SELECT
      username,
      street_address,
      city,
      postcode,
      county,
      country,
      distance_radius
    FROM users
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
