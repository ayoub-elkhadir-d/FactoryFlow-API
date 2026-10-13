const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { ADMIN } = require("../constants/roles");
const systemStateRepository = require("../repositories/systemStateRepository");
const userRepository = require("../repositories/userRepository");
const { generateToken } = require("../utils/jwt");

const PASSWORD_ROUNDS = 12;

class InstallationService {
  async getStatus() {
    const installation = await systemStateRepository.findInstallation();
    return { installed: Boolean(installation && installation.value.installed) };
  }

  async install(input = {}) {
    const { name, email, password } = input || {};

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

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, PASSWORD_ROUNDS);

    try {
      await systemStateRepository.reserveInstallation();
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("The application is already installed or installation is in progress", 409);
      }
      throw error;
    }

    let user;
    try {
      user = await userRepository.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: ADMIN,
      });

      const token = generateToken({ sub: user.id, role: user.role });
      await systemStateRepository.completeInstallation(user.id);
      return {
        user,
        token,
      };
    } catch (error) {
      if (user) await userRepository.deleteById(user.id);
      await systemStateRepository.removeInstallationReservation();
      if (error.code === 11000) {
        throw new AppError("An account with this email already exists", 409);
      }
      throw error;
    }
  }
}

module.exports = new InstallationService();
