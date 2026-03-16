import mongoose from "mongoose";

const connectDb = async () => {
  try {
    let dbHost = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "hellow",
    });
    console.log(
      "Database connected successfully on dbHost :",
      dbHost.connection.host
    );
  } catch (error) {
    console.log("Database connection failed :", error);
    process.exit(1);
  }
};

export default connectDb;
