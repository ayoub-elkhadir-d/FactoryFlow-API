const mongoose = require("mongoose");
const { ENTRY, EXIT } = require("../constants/stockMovementTypes");

const schema = new mongoose.Schema(
  {
    itemModel: {
      type: String,
      required: true,
      enum: ["Product", "RawMaterial"],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel",
      index: true,
    },
    movementType: {
      type: String,
      enum: [ENTRY, EXIT],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.000001, "Quantity must be greater than zero"],
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    productionOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionOrder",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", schema);
