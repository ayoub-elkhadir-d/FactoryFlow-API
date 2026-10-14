
const authService = require("../services/authService");
const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/AppError");
const userRepository = require("../repositories/userRepository");

exports.login = asyncWrapper(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

exports.getProfile = asyncWrapper(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({ user });
});
