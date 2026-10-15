const productService = require("../services/productService");
const asyncWrapper = require("../utils/asyncWrapper");

exports.getAll = asyncWrapper(async (req, res) => {
  const products = await productService.getAll();
  res.status(200).json({ products });
});

exports.getById = asyncWrapper(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.status(200).json({ product });
});

exports.create = asyncWrapper(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json({ product });
});

exports.update = asyncWrapper(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  res.status(200).json({ product });
});

exports.setComposition = asyncWrapper(async (req, res) => {
  const product = await productService.setComposition(
    req.params.id,
    req.body && req.body.composition
  );
  res.status(200).json({ product });
});

exports.deactivate = asyncWrapper(async (req, res) => {
  const product = await productService.deactivate(req.params.id);
  res.status(200).json({ product });
});