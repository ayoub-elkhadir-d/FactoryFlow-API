const SystemState = require("../models/SystemState");

class SystemStateRepository {
  findInstallation() {
    return SystemState.findOne({ key: "installation" });
  }

  reserveInstallation() {
    return SystemState.create({
      key: "installation",
      value: { installed: false },
    });
  }

  completeInstallation(userId) {
    return SystemState.findOneAndUpdate(
      { key: "installation" },
      { value: { installed: true }, updatedBy: userId },
      { new: true, runValidators: true }
    );
  }

  removeInstallationReservation() {
    return SystemState.deleteOne({ key: "installation" });
  }
}

module.exports = new SystemStateRepository();
