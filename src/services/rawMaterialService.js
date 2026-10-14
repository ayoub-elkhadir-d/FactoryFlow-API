const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const rawMaterialRepository = require("../repositories/rawMaterialRepository");
const stockMovementService = require("./stockMovementService");

class RawMaterialService {
  getLowStock() {
    return rawMaterialRepository.findLowStock();
  }

  async getAll(query = {}) {
    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      return rawMaterialRepository.findAll({
        isActive: true,
        $or: [
          { sku: searchTerm },
          { name: searchTerm },
          { supplier: searchTerm },
        ],
      });
    }
    return rawMaterialRepository.findAll({ isActive: true });
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid raw material ID", 400);
    }
    const material = await rawMaterialRepository.findById(id);
    if (!material || !material.isActive) {
      throw new AppError("Raw material not found", 404);
    }
    return material;
  }

  async create(input = {}) {
    const { sku, name, unit, description, supplier, minimumStock, unitCost } = input || {};

    if (
      typeof sku !== "string" ||
      !sku.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof unit !== "string" ||
      !unit.trim()
    ) {
      throw new AppError("A name, SKU, and unit are required", 400);
    }
    if (
      (minimumStock !== undefined &&
        (typeof minimumStock !== "number" || !Number.isFinite(minimumStock) || minimumStock < 0)) ||
      (unitCost !== undefined &&
        (typeof unitCost !== "number" || !Number.isFinite(unitCost) || unitCost < 0))
    ) {
      throw new AppError("minimumStock and unitCost must be non-negative numbers", 400);
    }
    if (description !== undefined && typeof description !== "string") {
      throw new AppError("description must be a string", 400);
    }
    if (supplier !== undefined && typeof supplier !== "string") {
      throw new AppError("supplier must be a string", 400);
    }

    const data = {
      sku: sku.trim(),
      name: name.trim(),
      unit: unit.trim(),
      description: description ? description.trim() : "",
      minimumStock: minimumStock === undefined ? 0 : minimumStock,
      unitCost: unitCost === undefined ? 0 : unitCost
    };

    if (supplier !== undefined) data.supplier = supplier.trim();

    try {
      return await rawMaterialRepository.create(data);
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("A raw material with this SKU already exists", 409);
      }
      throw error;
    }
  }

  async update(id, input = {}) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid raw material ID", 400);
    }

    const { sku, name, unit, description, supplier, minimumStock, unitCost } = input || {};

    const data = {};

    if (sku !== undefined) {
      if (typeof sku !== "string" || !sku.trim()) throw new AppError("sku must be a non-empty string", 400);
      data.sku = sku.trim();
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) throw new AppError("name must be a non-empty string", 400);
      data.name = name.trim();
    }
    if (unit !== undefined) {
      if (typeof unit !== "string" || !unit.trim()) throw new AppError("unit must be a non-empty string", 400);
      data.unit = unit.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") throw new AppError("description must be a string", 400);
      data.description = description.trim();
    }
    if (supplier !== undefined) {
      if (typeof supplier !== "string") throw new AppError("supplier must be a string", 400);
      data.supplier = supplier.trim();
    }
    if (minimumStock !== undefined) {
      if (typeof minimumStock !== "number" || !Number.isFinite(minimumStock) || minimumStock < 0) {
        throw new AppError("minimumStock must be a non-negative number", 400);
      }
      data.minimumStock = minimumStock;
    }
    if (unitCost !== undefined) {
      if (typeof unitCost !== "number" || !Number.isFinite(unitCost) || unitCost < 0) {
        throw new AppError("unitCost must be a non-negative number", 400);
      }
      data.unitCost = unitCost;
    }

    try {
      const material = await rawMaterialRepository.update(id, data);
      if (!material) {
        throw new AppError("Raw material not found", 404);
      }
      return material;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("A raw material with this SKU already exists", 409);
      }
      throw error;
    }
  }

  async deactivate(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid raw material ID", 400);
    }
    const material = await rawMaterialRepository.deactivate(id);
    if (!material) {
      throw new AppError("Raw material not found", 404);
    }
    return material;
  }

  async createMovement(id, input, userId) {
    const result = await stockMovementService.create("RawMaterial", id, input, userId);
    return { material: result.item, movement: result.movement };
  }

  getMovements(id) {
    return stockMovementService.getForItem("RawMaterial", id);
  }
}

module.exports = new RawMaterialService();