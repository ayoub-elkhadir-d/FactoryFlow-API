const ProductionOrder = require("../models/ProductionOrder");

class ProductionOrderRepository {
  create(data, session) {
    if (session) {
      return ProductionOrder.create([data], { session }).then(([order]) => order);
    }
    return ProductionOrder.create(data);
  }

  findAll(filter, skip, limit) {
    return ProductionOrder.find(filter)
      .populate("product", "sku name unit")
      .populate("operator", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  count(filter) {
    return ProductionOrder.countDocuments(filter);
  }

  findById(id, session) {
    return ProductionOrder.findById(id).session(session || null);
  }

  update(id, data, session) {
    return ProductionOrder.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      session,
    });
  }

  updateIfStatus(id, status, data, session) {
    return ProductionOrder.findOneAndUpdate(
      { _id: id, status },
      data,
      { new: true, runValidators: true, session }
    );
  }
}

module.exports = new ProductionOrderRepository();
