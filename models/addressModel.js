const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userData",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  houseNo: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    requied: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    requied: true,
  },
});

const AddressModel = mongoose.model("addresscollections", addressSchema);

module.exports = { AddressModel, addressSchema };