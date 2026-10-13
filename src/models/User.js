const mongoose = require("mongoose");
const { ADMIN, OPERATOR } = require("../constants/roles");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: [ADMIN, OPERATOR],
      default: OPERATOR,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(document, user) {
        delete user.password;
        return user;
      },
    },
  }
);

module.exports = mongoose.model("User", schema);