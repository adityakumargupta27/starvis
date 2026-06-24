import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Workaround for networks (college/corporate WiFi) that intercept TLS
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit — let the server start and retry on next request
    console.error("The server will start but database calls will fail until connectivity is restored.");
  }
};

export default connectDB;
