const productionOrderService = require("../services/productionOrderService");
const asyncWrapper = require("../utils/asyncWrapper");

exports.getAll = asyncWrapper(async (req, res) => {
  const result = await productionOrderService.getAll(req.query, req.user);
  res.status(200).json(result);
});

exports.getHistory = asyncWrapper(async (req, res) => {
  const result = await productionOrderService.getHistory(req.user.id, req.query);
  res.status(200).json(result);
});

exports.getById = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.getById(req.params.id, req.user);
  res.status(200).json({ order });
});

exports.create = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.create(req.body, req.user.id);
  res.status(201).json({ order });
});

exports.update = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.update(req.params.id, req.body);
  res.status(200).json({ order });
});

exports.assign = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.assign(req.params.id, req.body.operator);
  res.status(200).json({ order });
});

exports.cancel = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.cancel(req.params.id);
  res.status(200).json({ order });
});

exports.start = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.start(req.params.id, req.user.id);
  res.status(200).json({ order });
});

exports.finish = asyncWrapper(async (req, res) => {
  const order = await productionOrderService.finish(req.params.id, req.user.id);
  res.status(200).json({ order });
});
