const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { ADMIN, OPERATOR } = require("../constants/roles");
const productionOrderController = require("../controllers/productionOrderController");

router.use(authMiddleware);

router.post("/", authorize(ADMIN), productionOrderController.create);
router.patch("/:id", authorize(ADMIN), productionOrderController.update);
router.patch("/:id/assign", authorize(ADMIN), productionOrderController.assign);
router.post("/:id/cancel", authorize(ADMIN), productionOrderController.cancel);
router.post("/:id/start", authorize(OPERATOR), productionOrderController.start);
router.post("/:id/finish", authorize(OPERATOR), productionOrderController.finish);

module.exports = router;
