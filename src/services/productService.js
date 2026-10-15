const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const productRepository = require("../repositories/productRepository");
const rawMaterialRepository = require("../repositories/rawMaterialRepository");

class ProductService {

  async getAll() {
    return await productRepository.findAll({ isActive: true });
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await productRepository.findById(id);
    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async create(input = {}) {
    const { sku, name, unit, description, minimumStock } = input;

    if (
      typeof sku !== "string" ||
      !sku.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof unit !== "string" ||
      !unit.trim()
    ) {
      throw new AppError("Please provide required fields: sku, name, unit", 400);
    }
    if (
      minimumStock !== undefined &&
      (typeof minimumStock !== "number" || !Number.isFinite(minimumStock) || minimumStock < 0)
    ) {
      throw new AppError("minimumStock must be a non-negative number", 400);
    }

    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      unit: unit.trim(),
      description: description ? description.trim() : "",
      minimumStock: minimumStock === undefined ? 0 : minimumStock
    };

    try {
      return await productRepository.create(productData);
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("A product with this SKU already exists", 409);
      }
      throw error;
    }
  }

  async update(id, input = {}) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const { sku, name, unit, description, minimumStock } = input;

    const productData = {};
    if (sku !== undefined) {
      if (typeof sku !== "string" || !sku.trim()) throw new AppError("sku must be a non-empty string", 400);
      productData.sku = sku.trim();
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) throw new AppError("name must be a non-empty string", 400);
      productData.name = name.trim();
    }
    if (unit !== undefined) {
      if (typeof unit !== "string" || !unit.trim()) throw new AppError("unit must be a non-empty string", 400);
      productData.unit = unit.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") throw new AppError("description must be a string", 400);
      productData.description = description.trim();
    }
    if (minimumStock !== undefined) {
      if (typeof minimumStock !== "number" || !Number.isFinite(minimumStock) || minimumStock < 0) {
        throw new AppError("minimumStock must be a non-negative number", 400);
      }
      productData.minimumStock = minimumStock;
    }

    try {
      const product = await productRepository.update(id, productData);
      if (!product) {
        throw new AppError("Product not found", 404);
      }
      return product;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("A product with this SKU already exists", 409);
      }
      throw error;
    }
  }

  async setComposition(id, components) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid product ID", 400);
    }
    
    if (!Array.isArray(components)) {
      throw new AppError("Composition must be an array", 400);
    }

    const composition = [];
    const materialIds = [];
    for (const item of components) {
      if (
        !item ||
        !item.rawMaterial ||
        !mongoose.isValidObjectId(item.rawMaterial) ||
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new AppError("Each component must have a valid rawMaterial and positive quantity", 400);
      }

      composition.push({
        rawMaterial: item.rawMaterial,
        quantity: item.quantity
      });
      materialIds.push(item.rawMaterial);
    }

    const activeMaterials = await rawMaterialRepository.findActiveByIds(materialIds);
    if (activeMaterials.length !== new Set(materialIds.map(String)).size) {
      throw new AppError("Composition contains a missing or inactive raw material", 400);
    }

    const product = await productRepository.setComposition(id, composition);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async deactivate(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid product ID", 400);
    }
    const product = await productRepository.deactivate(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  }
}

module.exports = new ProductService();