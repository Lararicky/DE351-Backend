const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    tag_name: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("Tag", tagSchema);