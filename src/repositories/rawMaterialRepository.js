const RawMaterial = require("../models/RawMaterial");

class RawMaterialRepository {
  findAll(filter) {
    return RawMaterial.find(filter).sort({ name: 1 });
  }

  findById(id) {
    return RawMaterial.findById(id);
  }

  findActiveByIds(ids) {
    return RawMaterial.find({ _id: { $in: ids }, isActive: true }).select("_id");
  }

  findByIds(ids, session) {
    return RawMaterial.find({ _id: { $in: ids }, isActive: true }).session(session);
  }

  findLowStock() {
    return RawMaterial.find({
      isActive: true,
      $expr: { $lte: ["$stockQuantity", "$minimumStock"] },
    }).sort({ name: 1 });
  }

  create(data) {
    return RawMaterial.create(data);
  }

  update(id, data) {
    return RawMaterial.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  deactivate(id) {
    return RawMaterial.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );
  }

  adjustStock(id, movementType, quantity, session) {
    const filter = { _id: id, isActive: true };
    if (movementType === "EXIT") {
      filter.stockQuantity = { $gte: quantity };
    }

    return RawMaterial.findOneAndUpdate(
      filter,
      { $inc: { stockQuantity: movementType === "ENTRY" ? quantity : -quantity } },
      { new: true, runValidators: true, session }
    );
  }
}

module.exports = new RawMaterialRepository();