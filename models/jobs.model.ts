import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyId: String,
    title: String,
    salaryMin: Number,
    salaryMax: Number,
    position: String,
    workingForm: String,
    technologies: Array,
    description: String,
    images: Array,
  },
  {
    timestamps: true,
  },
);

const Jobs = mongoose.model("Jobs", schema, "jobs");
export default Jobs;
