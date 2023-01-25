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
  return db.query(selectSingleUserString, [username]).then((result) => {
    if (!!result.rows.length) {
      return Promise.reject({ code: 400, msg: "username already taken" });
    } else {
      return Promise.resolve();
    }
  });
};

exports.selectSingleUser = (username) => {
  return db.query(selectSingleUserString, [username]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ code: 404, msg: "user not found" });
    } else {
      return result.rows[0];
    }
  });
};

exports.updateSingleUser = (username, updateBody) => {
  const inputValues = [username];
  let updateString = "UPDATE users SET ";
  for (const [key, value] of Object.entries(updateBody)) {
    updateString += `${key} = $${inputValues.length + 1}`;
    inputValues.push(value);
  }
  updateString += "WHERE username = $1 RETURNING *;";
  console.log(updateString, inputValues);
  return db.query(updateString, inputValues).then(({ rows }) => rows[0]);
};
