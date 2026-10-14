const stockMovementService = require("../services/stockMovementService");

exports.getAll = async (req, res, next) => {
  try {
    const movements = await stockMovementService.getAll();
    res.status(200).json({ movements });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const movement = await stockMovementService.getById(req.params.id);
    res.status(200).json({ movement });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { itemModel, item, ...movementData } = req.body || {};
    const result = await stockMovementService.create(
      itemModel,
      item,
      movementData,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};