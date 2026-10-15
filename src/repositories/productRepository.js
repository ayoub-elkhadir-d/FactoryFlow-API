const Product = require("../models/Product");

class ProductRepository {
  findAll(filter = {}) {
    return Product.find(filter).sort({ name: 1 });
  }

  findById(id) {
    return Product.findById(id);
  }

  findByIdWithComposition(id) {
    return Product.findById(id).populate("composition.rawMaterial");
  }

  create(data) {
    return Product.create(data);
  }

  update(id, data) {
    return Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  setComposition(id, composition) {
    return Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { composition } },
      { new: true, runValidators: true }
    );
  }

  deactivate(id) {
    return Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );
  }

  adjustStock(id, movementType, quantity, session) {
    const filter = { _id: id, isActive: true };
    if (movementType === "EXIT") {
      filter.stockQuantity = { $gte: quantity };
    }

    const change = movementType === "ENTRY" ? quantity : -quantity;
    return Product.findOneAndUpdate(
      filter,
      { $inc: { stockQuantity: change } },
      { new: true, runValidators: true, session }
    );
  }
}

module.exports = new ProductRepository();