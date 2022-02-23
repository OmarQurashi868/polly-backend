const mongoose = require("mongoose");

const choiceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pollId: {
        type: String,
        required: true
    },
    voteCount: {
        type: Number,
        required: true,
        default: 0
    },
});

module.exports = mongoose.model("choice", choiceSchema);