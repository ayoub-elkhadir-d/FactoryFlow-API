const mongoose = require("mongoose");
const {
  PLANIFIED,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED,
} = require("../constants/status");

const compositionSnapshotSchema = new mongoose.Schema(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.000001, "Quantity must be greater than zero"],
    },
    compositionSnapshot: {
      type: [compositionSnapshotSchema],
      default: [],
    },
    status: {
      type: String,
      enum: [PLANIFIED, IN_PROGRESS, COMPLETED, CANCELLED],
      default: PLANIFIED,
      required: true,
    },
    plannedStartDate: {
      type: Date,
    },
    plannedEndDate: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

schema.index({ operator: 1, status: 1 });

module.exports = mongoose.model("ProductionOrder", schema);
