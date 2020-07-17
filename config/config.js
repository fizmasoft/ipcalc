require("dotenv").config();

module.exports = {
  APP: {
    PORT: process.env.APP_PORT,
  },
  ENV: process.env.NODE_ENV,
};
