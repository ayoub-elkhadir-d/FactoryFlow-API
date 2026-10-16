const router = require("express").Router();
const installationRoutes = require("./installationRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const rawMaterialRoutes = require("./rawMaterialRoutes");
const movementRoutes = require("./movmentRoutes");
const productRoutes = require("./productRoutes");
const productionOrderRoutes = require("./productionOrderRoutes");

router.use("/installation", installationRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/raw-materials", rawMaterialRoutes);
router.use("/stock-movements", movementRoutes);
router.use("/products", productRoutes);
router.use("/production-orders", productionOrderRoutes);

module.exports = router;
