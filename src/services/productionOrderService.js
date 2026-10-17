const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { OPERATOR } = require("../constants/roles");
const { PLANIFIED, IN_PROGRESS, CANCELLED, COMPLETED } = require("../constants/status");
const productRepository = require("../repositories/productRepository");
const productionOrderRepository = require("../repositories/productionOrderRepository");
const userRepository = require("../repositories/userRepository");
const { EXIT } = require("../constants/stockMovementTypes");
const rawMaterialRepository = require("../repositories/rawMaterialRepository");
const stockMovementRepository = require("../repositories/stockMovementRepository");

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

  async start(id, userId) {
    this.validateId(id, "order");
    const session = await mongoose.startSession();
    let startedOrder;

    try {
      await session.withTransaction(async () => {
        const order = await productionOrderRepository.findById(id, session);
        if (!order) throw new AppError("Production order not found", 404);
        if (order.status !== PLANIFIED) {
          throw new AppError("Only planified orders can be started", 400);
        }
        if (order.operator.toString() !== userId) {
          throw new AppError("This production order is assigned to another operator", 403);
        }

        const requiredMaterials = new Map();
        for (const component of order.compositionSnapshot) {
          const key = component.rawMaterial.toString();
          const current = requiredMaterials.get(key);
          if (current) {
            current.quantity += component.quantity * order.quantity;
          } else {
            requiredMaterials.set(key, {
              rawMaterial: component.rawMaterial,
              name: component.name,
              quantity: component.quantity * order.quantity,
            });
          }
        }

        const materials = await rawMaterialRepository.findByIds(
          [...requiredMaterials.keys()],
          session
        );
        const materialsById = new Map(materials.map((material) => [material.id, material]));
        for (const required of requiredMaterials.values()) {
          const material = materialsById.get(required.rawMaterial.toString());
          if (!material || material.stockQuantity < required.quantity) {
            throw new AppError(`Insufficient stock for raw material: ${required.name}`, 400);
          }
        }

        for (const required of requiredMaterials.values()) {
          const material = await rawMaterialRepository.adjustStock(
            required.rawMaterial,
            EXIT,
            required.quantity,
            session
          );
          if (!material) {
            throw new AppError(`Insufficient stock for raw material: ${required.name}`, 400);
          }
          await stockMovementRepository.create(
            {
              itemModel: "RawMaterial",
              item: required.rawMaterial,
              movementType: EXIT,
              quantity: required.quantity,
              productionOrder: order.id,
              performedBy: userId,
              reason: `Materials consumed by production order ${order.id}`,
            },
            session
          );
        }

        startedOrder = await productionOrderRepository.updateIfStatus(
          id,
          PLANIFIED,
          { status: IN_PROGRESS, startedAt: new Date() },
          session
        );
        if (!startedOrder) throw new AppError("Only planified orders can be started", 400);
      });
      return startedOrder;
    } finally {
      await session.endSession();
    }
  }

  async finish(id, userId) {
    this.validateId(id, "order");
    const order = await productionOrderRepository.findById(id);
    if (!order) throw new AppError("Production order not found", 404);
    if (order.operator.toString() !== userId) {
      throw new AppError("This production order is assigned to another operator", 403);
    }
    const completedOrder = await productionOrderRepository.updateIfStatus(
      id,
      IN_PROGRESS,
      { status: COMPLETED, finishedAt: new Date() }
    );
    if (!completedOrder) throw new AppError("Only in-progress orders can be finished", 400);
    return completedOrder;
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
