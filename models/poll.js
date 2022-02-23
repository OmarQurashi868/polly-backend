const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);

const choiceSchema = mongoose.Schema({
	_id: {
		type: String,
		default: () => nanoid()
	},
    name: {
        type: String,
        required: true
    },
    voteCount: {
        type: Number,
        required: true,
        default: 0
    },
});

const pollSchema = mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid()
    },
    adminLink: {
        type: String,
        default: () => nanoid(),
        select: false
    },
    question: {
        type: String,
        required: true,
        minlength: 3
    },
    name: {
        type: String
    },
    creationDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    startDate: {
        type: Date,
        required: false,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false,
    },
    isStarted: {
        type: Boolean,
        required: true,
        default: true
    },
    isEnded: {
        type: Boolean,
        required: true,
        default: false
    },
    canAddSuggestions: {
        type: Boolean,
        required: true,
        default: false
    },
    canMultipleVote: {
        type: Boolean,
        required: true,
        default: false
    },
    choices: {
        type: [choiceSchema],
        required: true
    }
});

module.exports = mongoose.model("poll", pollSchema);
// module.exports.choice = mongoose.model("choice", choiceSchema);