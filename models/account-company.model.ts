import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyName: String,
    logo: String,
    city: String,
    address: String,
    companyModel: String,
    companyEmployees: String,
    workingTime: String,
    workOverTime: String,
    phone: String,
    email: String,
    password: String,
    description: String,
  },
  {
    timestamps: true,
  },
);

const AccountCompany = mongoose.model(
  "AccountCompany",
  schema,
  "accounts-company",
);

export default AccountCompany;
