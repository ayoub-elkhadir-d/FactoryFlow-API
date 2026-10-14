const userService = require("../services/userService");
const asyncWrapper = require("../utils/asyncWrapper");

exports.getAll = asyncWrapper(async (req, res) => {
  const users = await userService.getAll();
  res.status(200).json({ users });
});

exports.create = asyncWrapper(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ user });
});
