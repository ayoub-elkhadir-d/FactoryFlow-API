const StockMovement = require("../models/StockMovement");

class StockMovementRepository {
  create(data, session) {
    if (session) {
      return StockMovement.create([data], { session }).then(([movement]) => movement);
    }
    return StockMovement.create(data);
  }

  findAll() {
    return StockMovement.find({})
      .populate("performedBy", "name email")
      .populate("item")
      .sort({ createdAt: -1 });
  }

  findById(id) {
    return StockMovement.findById(id)
      .populate("performedBy", "name email")
      .populate("item");
  }

  findForItem(itemModel, itemId) {
    return StockMovement.find({ itemModel, item: itemId })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });
  }
}

module.exports = new StockMovementRepository();
