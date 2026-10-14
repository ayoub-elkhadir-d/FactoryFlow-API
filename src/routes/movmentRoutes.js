const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { ADMIN } = require("../constants/roles");
const movementController = require("../controllers/movmentController");

router.use(authMiddleware, authorize(ADMIN));

router.get("/", movementController.getAll);
router.post("/", movementController.create);
router.get("/:id", movementController.getById);

module.exports = router;
