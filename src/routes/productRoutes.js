const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { ADMIN } = require("../constants/roles");
const productController = require("../controllers/productController");

router.use(authMiddleware, authorize(ADMIN));

router.get("/", productController.getAll);
router.post("/", productController.create);
router.get("/:id", productController.getById);
router.patch("/:id", productController.update);
router.put("/:id/composition", productController.setComposition);
router.delete("/:id", productController.deactivate);

module.exports = router;
