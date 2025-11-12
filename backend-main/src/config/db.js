const { mongoose, connection } = require("mongoose");
const {DB_URI } = require('./env')

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connection.on("connected", () => {
  console.log(`Mongodb connected to: ${connection.db.databaseName}`);
});

connection.on("error", (error) => {
  console.error("Mongodb connection error:", error);
});

connection.on("disconnected", () => {
  console.error("Mongodb disconnected");
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  try {
    await connection.close();
    console.error("Mongodb connection closed due to app termination");
    process.exit(0); // Exit the process gracefully
  } catch (error) {
    console.error("Error while closing Mongodb connection:", error);
    process.exit(1); // Exit with failure
  }
});

module.exports = connectDB;
