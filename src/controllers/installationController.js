const installationService = require("../services/installationService");
const asyncWrapper = require("../utils/asyncWrapper");

exports.getStatus = asyncWrapper(async (req, res) => {
  const status = await installationService.getStatus();
  res.status(200).json(status);
});

exports.install = asyncWrapper(async (req, res) => {
  const result = await installationService.install(req.body);
  res.status(201).json(result);
});