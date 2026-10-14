const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");
const userRepository = require("../repositories/userRepository");

class AuthService {
  async login(input = {}) {
    const { email, password } = input || {};

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    const isPasswordCorrect = user && (await bcrypt.compare(password, user.password));
    if (!user || !user.isActive || !isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      user,
      token: generateToken({ sub: user.id, role: user.role }),
    };
  }
}

module.exports = new AuthService();