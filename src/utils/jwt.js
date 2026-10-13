const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const getSecret = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured before using authentication");
  }
  return JWT_SECRET;
};

exports.generateToken = (payload) =>
  jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN });

exports.verifyToken = (token) => jwt.verify(token, getSecret());
