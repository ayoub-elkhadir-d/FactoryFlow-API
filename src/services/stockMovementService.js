const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const rawMaterialRepository = require("../repositories/rawMaterialRepository");
const productRepository = require("../repositories/productRepository");
const stockMovementRepository = require("../repositories/stockMovementRepository");
const { ENTRY, EXIT } = require("../constants/stockMovementTypes");

class StockMovementService {
  async create(itemModel, itemId, input = {}, userId) {
    if (itemModel !== "Product" && itemModel !== "RawMaterial") {
      throw new AppError("itemModel must be Product or RawMaterial", 400);
    }

    if (!mongoose.isValidObjectId(itemId)) {
      throw new AppError("Invalid item ID", 400);
    }

    const repository = itemModel === "Product" ? productRepository : rawMaterialRepository;
    const { movementType, quantity, unitCost, productionOrder, reason } = input || {};

    if (movementType !== ENTRY && movementType !== EXIT) {
      throw new AppError("movementType must be ENTRY or EXIT", 400);
    }

    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
      throw new AppError("quantity must be a positive number", 400);
    }
    if (unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) {
      throw new AppError("unitCost must be a non-negative number", 400);
    }
    if (productionOrder !== undefined && !mongoose.isValidObjectId(productionOrder)) {
      throw new AppError("Invalid production order ID", 400);
    }

    const movementData = {
      itemModel,
      item: itemId,
      movementType,
      quantity,
      performedBy: userId,
      reason: reason || "",
    };

    if (unitCost !== undefined) movementData.unitCost = unitCost;
    if (productionOrder !== undefined) movementData.productionOrder = productionOrder;

    const session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        const item = await repository.adjustStock(itemId, movementType, quantity, session);
        if (!item || !item.isActive) {
          throw new AppError("Item not found or not enough stock", 400);
        }
        const movement = await stockMovementRepository.create(movementData, session);
        result = { item, movement };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  async getAll() {
    return stockMovementRepository.findAll();
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid movement ID", 400);
    }
    const movement = await stockMovementRepository.findById(id);
    if (!movement) {
      throw new AppError("Stock movement not found", 404);
    }
    return movement;
  }

  async getForItem(itemModel, itemId) {
    if (itemModel !== "Product" && itemModel !== "RawMaterial") {
      throw new AppError("itemModel must be Product or RawMaterial", 400);
    }
    if (!mongoose.isValidObjectId(itemId)) {
      throw new AppError("Invalid item ID", 400);
    }

    const repository = itemModel === "Product" ? productRepository : rawMaterialRepository;
    const item = await repository.findById(itemId);
    if (!item || !item.isActive) {
      throw new AppError("Item not found", 404);
    }
    return stockMovementRepository.findForItem(itemModel, itemId);
  }
}

module.exports = new StockMovementService();