const router = require("express").Router();
const installationRoutes = require("./installationRoutes");

router.use("/installation", installationRoutes);

module.exports = router;
