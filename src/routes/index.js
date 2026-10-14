const router = require("express").Router();
const installationRoutes = require("./installationRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

router.use("/installation", installationRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;
