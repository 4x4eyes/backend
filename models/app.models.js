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
