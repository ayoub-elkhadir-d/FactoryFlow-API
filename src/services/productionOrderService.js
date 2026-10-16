const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { OPERATOR } = require("../constants/roles");
const { PLANIFIED, CANCELLED } = require("../constants/status");
const productRepository = require("../repositories/productRepository");
const productionOrderRepository = require("../repositories/productionOrderRepository");
const userRepository = require("../repositories/userRepository");

class ProductionOrderService {
  async create(input = {}, userId) {
    const { product, quantity, operator, plannedStartDate, plannedEndDate, notes } = input || {};
    this.validateId(product, "product");
    this.validateId(operator, "operator");
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
      throw new AppError("quantity must be a positive number", 400);
    }

    const [productRecord, operatorRecord] = await Promise.all([
      productRepository.findByIdWithComposition(product),
      userRepository.findById(operator),
    ]);
    if (!productRecord || !productRecord.isActive) {
      throw new AppError("Product not found", 404);
    }
    this.ensureOperator(operatorRecord);

    const compositionSnapshot = productRecord.composition.map((component) => {
      const material = component.rawMaterial;
      if (!material || !material.isActive) {
        throw new AppError("The product contains an inactive or missing raw material", 400);
      }
      return {
        rawMaterial: material.id,
        name: material.name,
        unit: material.unit,
        quantity: component.quantity,
      };
    });

    return productionOrderRepository.create({
      product,
      quantity,
      operator,
      compositionSnapshot,
      plannedStartDate,
      plannedEndDate,
      notes,
      createdBy: userId,
    });
  }

  async update(id, input = {}) {
    this.validateId(id, "order");
    const existing = await productionOrderRepository.findById(id);
    if (!existing) throw new AppError("Production order not found", 404);
    if (existing.status !== PLANIFIED) {
      throw new AppError("Only planified orders can be edited", 400);
    }

    const update = {};
    if (input.quantity !== undefined) {
      if (typeof input.quantity !== "number" || !Number.isFinite(input.quantity) || input.quantity <= 0) {
        throw new AppError("quantity must be a positive number", 400);
      }
      update.quantity = input.quantity;
    }
    if (input.product !== undefined) {
      this.validateId(input.product, "product");
      const product = await productRepository.findByIdWithComposition(input.product);
      if (!product || !product.isActive) throw new AppError("Product not found", 404);
      update.product = product.id;
      update.compositionSnapshot = product.composition.map((component) => {
        const material = component.rawMaterial;
        if (!material || !material.isActive) {
          throw new AppError("The product contains an inactive or missing raw material", 400);
        }
        return {
          rawMaterial: material.id,
          name: material.name,
          unit: material.unit,
          quantity: component.quantity,
        };
      });
    }
    if (input.plannedStartDate !== undefined) update.plannedStartDate = input.plannedStartDate;
    if (input.plannedEndDate !== undefined) update.plannedEndDate = input.plannedEndDate;
    if (input.notes !== undefined) update.notes = input.notes;

    const order = await productionOrderRepository.updateIfStatus(id, PLANIFIED, update);
    if (!order) throw new AppError("Only planified orders can be edited", 400);
    return order;
  }

  async assign(id, operatorId) {
    this.validateId(id, "order");
    this.validateId(operatorId, "operator");
    const operator = await userRepository.findById(operatorId);
    this.ensureOperator(operator);
    const existing = await productionOrderRepository.findById(id);
    if (!existing) throw new AppError("Production order not found", 404);
    const order = await productionOrderRepository.updateIfStatus(
      id,
      PLANIFIED,
      { operator: operatorId }
    );
    if (!order) throw new AppError("Planified production order not found", 404);
    return order;
  }

  async cancel(id) {
    this.validateId(id, "order");
    const existing = await productionOrderRepository.findById(id);
    if (!existing) throw new AppError("Production order not found", 404);
    const order = await productionOrderRepository.updateIfStatus(
      id,
      PLANIFIED,
      { status: CANCELLED }
    );
    if (!order) throw new AppError("Only planified orders can be cancelled", 400);
    return order;
  }

  validateId(id, label) {
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new AppError(`Invalid ${label} ID`, 400);
    }
  }

  ensureOperator(user) {
    if (!user || !user.isActive || user.role !== OPERATOR) {
      throw new AppError("An active operator must be assigned", 400);
    }
  }
}

module.exports = new ProductionOrderService();
