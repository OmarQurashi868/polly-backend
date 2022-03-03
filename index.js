const express = require("express");
try {
  require("dotenv").config();
} catch {
    console.log("dotenv skipped");
}
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Connect database
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Database connected"));

// Add polls route
const pollsRouter = require("./routes/polls");
app.use("/polls", pollsRouter);

// Start listening
app.listen(process.env.PORT, () =>
  console.log(`Server is listening to port ${process.env.PORT}...`)
);
