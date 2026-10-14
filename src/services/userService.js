const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { ADMIN, OPERATOR } = require("../constants/roles");
const userRepository = require("../repositories/userRepository");

const PASSWORD_ROUNDS = 12;

class UserService {
  getAll() {
    return userRepository.findAll();
  }

  async create(input = {}) {
    const { name, email, password, role = OPERATOR } = input || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      throw new AppError(
        "A name, email, and password of at least 8 characters are required",
        400
      );
    }

    if (role !== ADMIN && role !== OPERATOR) {
      throw new AppError("role must be ADMIN or OPERATOR", 400);
    }

    try {
      return await userRepository.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, PASSWORD_ROUNDS),
        role,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("An account with this email already exists", 409);
      }
      throw error;
    }
  }
}

module.exports = new UserService();
