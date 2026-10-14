const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { ADMIN } = require("../constants/roles");
const userController = require("../controllers/userController");

router.use(authMiddleware, authorize(ADMIN));
router.get("/", userController.getAll);
router.post("/", userController.create);

module.exports = router;
