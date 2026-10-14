const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { ADMIN } = require("../constants/roles");
const rawMaterialController = require("../controllers/rawMaterialController");

router.use(authMiddleware, authorize(ADMIN));

router.get("/", rawMaterialController.getAll);
router.get("/alerts/low-stock", rawMaterialController.getLowStock);
router.post("/", rawMaterialController.create);
router.get("/:id", rawMaterialController.getById);
router.patch("/:id", rawMaterialController.update);
router.delete("/:id", rawMaterialController.deactivate);
router.get("/:id/movements", rawMaterialController.getMovements);
router.post("/:id/movements", rawMaterialController.createMovement);

module.exports = router;
