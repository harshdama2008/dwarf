const path = require("path");
process.env.MANGO_DEVELOPMENT = true;

process.env.MANGO_GLOBAL_DIR = path.join(
  process.env.PROJECT_DIR,
  "extensions",
  ".mango-debug",
);

require("./out/index.js");
