import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    fullName: String,
    jobId: String,
    email: String,
    phone: String,
    fileCV: String,
    viewed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "initial",
    },
  },
  {
    timestamps: true,
  },
);

const CV = mongoose.model("CV", schema, "cvs");

export default CV;
