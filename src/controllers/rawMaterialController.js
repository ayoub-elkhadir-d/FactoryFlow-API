const rawMaterialService = require("../services/rawMaterialService");
const asyncWrapper = require("../utils/asyncWrapper");

exports.getAll = asyncWrapper(async (req, res) => {
  const materials = await rawMaterialService.getAll(req.query);
  res.status(200).json({ materials });
});

exports.getLowStock = asyncWrapper(async (req, res) => {
  const materials = await rawMaterialService.getLowStock();
  res.status(200).json({ materials });
});

exports.getById = asyncWrapper(async (req, res) => {
  const material = await rawMaterialService.getById(req.params.id);
  res.status(200).json({ material });
});

exports.create = asyncWrapper(async (req, res) => {
  const material = await rawMaterialService.create(req.body);
  res.status(201).json({ material });
});

exports.update = asyncWrapper(async (req, res) => {
  const material = await rawMaterialService.update(req.params.id, req.body);
  res.status(200).json({ material });
});

exports.deactivate = asyncWrapper(async (req, res) => {
  const material = await rawMaterialService.deactivate(req.params.id);
  res.status(200).json({ material });
});

exports.createMovement = asyncWrapper(async (req, res) => {
  const result = await rawMaterialService.createMovement(
    req.params.id,
    req.body,
    req.user.id
  );
  res.status(201).json(result);
});

exports.getMovements = asyncWrapper(async (req, res) => {
  const movements = await rawMaterialService.getMovements(req.params.id);
  res.status(200).json({ movements });
});