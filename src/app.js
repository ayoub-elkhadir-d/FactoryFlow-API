const express = require("express");
const app = express();
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");

app.use(express.json());
app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use(errorMiddleware);

module.exports = app;
