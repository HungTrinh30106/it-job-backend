import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE}`);
    console.log("Kết nối DB thành công");
  } catch (error) {
    console.log("kết nối DB thất bại");
    console.log(error);
  }
};
