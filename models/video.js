let mongoose = require("mongoose");

let videoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    posted_by: {
        type: String,
        required: true
    }
});


let Video = module.exports = mongoose.model("Video", videoSchema);