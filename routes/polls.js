const express = require("express");
const router = express.Router();
const Poll = require("../models/poll.js");

// Middleware function to find poll by id
const getPoll = async (req, res, next) => {
    let poll
    try {
        poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(400).json({ message: "Poll not found" });
    } catch (err) {
        return res.status(500).json({ message: err.message })
    };

    req.poll = poll;
    next();
};

// Get all polls
router.get("/", async (req, res) => {
    try {
        const polls = await Poll.find();
        if (polls.length === 0) return res.status(404).json({ message: "No polls found" });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    };
});

// Get poll by id
router.get("/:id", getPoll, async (req, res) => {
    res.json(req.poll);
});

// Add poll
router.post("/", async (req, res) => {
	if (req.body === null) return res.status(400).json({ message: "Invalid input" });
    const newPoll = new Poll(req.body.pollData);
    try {
        const savedPoll = await newPoll.save();
        res.status(201).json(savedPoll);
		console.log("Poll added successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

// Delete poll
router.delete("/:id", getPoll, async (req, res) => {
    try {
        await req.poll.remove();
        res.json(req.poll);
		console.log("Poll deleted successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

// Vote on existing choice
router.patch("/vote/:id/:choiceid", getPoll, async (req, res) => {
	if (req.body === null) return res.status(400).json({ message: "Invalid input" });
    req.poll.choices.id(req.params.choiceid).voteCount++;

    try {
        const savedPoll = await req.poll.save();
        res.status(201).json(savedPoll);
		console.log("Vote added successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

// Add new choice
router.patch("/add/:id", getPoll, async (req, res) => {
	if (req.body === null) return res.status(400).json({ message: "Invalid input" });
    if (!req.body.pollData.choices) return res.status(400).json({ message: "Invalid input" });

    req.poll.choices.push(req.body.pollData.choices);

    try {
        const savedPoll = await req.poll.save();
        res.status(201).json(savedPoll);
		console.log("Choice added successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

// Remove vote from existing option
router.patch("/unvote/:id/:choiceid", getPoll, async (req, res) => {
	if (req.poll.choices.id(req.params.choiceid).voteCount > 0) {
		req.poll.choices.id(req.params.choiceid).voteCount--;
	}

    try {
        const savedPoll = await req.poll.save();
        res.status(201).json(savedPoll);
		console.log("Vote removed successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

// Remove choice
router.delete("/remove/:id/:choiceid", getPoll, async (req, res) => {
    try {
        await req.poll.choices.id(req.params.choiceid).remove();
        await req.poll.save();
        res.json(req.poll);
		console.log("Choice removed successfully...");
    } catch (err) {
        res.status(400).json({ message: err.message });
    };
});

module.exports = router;