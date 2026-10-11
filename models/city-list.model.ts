import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
});

const CityList = mongoose.model("CityList", schema, "city-list");

export default CityList;
