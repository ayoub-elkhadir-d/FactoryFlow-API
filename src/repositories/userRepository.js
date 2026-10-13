const User = require("../models/User");

class UserRepository {
  create(userData) {
    return User.create(userData);
  }

  findByEmail(email) {
    return User.findOne({ email }).select("+password");
  }

  findById(id) {
    return User.findById(id);
  }

  findAll() {
    return User.find({}).sort({ createdAt: -1 });
  }

  deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  countUsers() {
    return User.countDocuments();
  }
}

module.exports = new UserRepository();
