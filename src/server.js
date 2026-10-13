const app = require("./app");
const { connectDB } = require("./config/db");
const { PORT } = require("./config/env");

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
