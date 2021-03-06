const express = require("express");
const router = express.Router();
const Poll = require("../models/poll.js");

// Middleware function to find poll by id
const getPoll = async (req, res, next) => {
  let poll;
  try {
    poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const dateNow = new Date().toISOString();
  if (poll.startDate) {
    if (dateNow > poll.startDate.toISOString()) {
      poll.isStarted = true;
    } else {
      poll.isStarted = false;
    }
  } else {
    return res.status(400).json({ message: "Invalid input" });
  }
  if (poll.endDate) {
    if (dateNow > poll.endDate.toISOString()) {
      poll.isEnded = true;
    } else {
      poll.isEnded = false;
    }
  }

  try {
    const requestedPoll = await poll.save();
    req.poll = requestedPoll;
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  next();
};

// Get all polls
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find();
    if (polls.length === 0)
      return res.status(404).json({ message: "No polls found" });
    let requestedPolls = polls;
    for (const poll of requestedPolls) {
      const dateNow = new Date().toISOString();
      if (poll.startDate) {
        if (dateNow > poll.startDate.toISOString()) {
          poll.isStarted = true;
        } else {
          poll.isStarted = false;
        }
      }
      if (poll.endDate) {
        if (dateNow > poll.endDate.toISOString()) {
          poll.isEnded = true;
        } else {
          poll.isEnded = false;
        }
      }
    }
    res.json(requestedPolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get poll by id
router.get("/:id", getPoll, async (req, res) => {
  res.json(req.poll);
});

// Access poll as admin
router.get("/:id/:adminLink", getPoll, async (req, res) => {
  try {
    requestedPoll = await Poll.findOne({ _id: req.params.id }).select(
      "+adminLink"
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

  if (req.params.adminLink === requestedPoll.adminLink) {
    res.status(200).json(req.poll);
  } else {
    res.status(401).json({ message: "Incorrect admin link" });
  }
});

// Add poll
router.post("/", async (req, res) => {
  if (req.body === null)
    return res.status(400).json({ message: "Invalid input" });
  const newPoll = new Poll(req.body.pollData);
  try {
    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
    console.log("Poll added successfully...");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete poll
router.delete("/:id", getPoll, async (req, res) => {
  try {
    await req.poll.remove();
    res.json(req.poll);
    console.log("Poll deleted successfully...");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Vote on existing choice
router.patch("/vote/:id/:choiceid", getPoll, async (req, res) => {
  if (req.body === null)
    return res.status(400).json({ message: "Invalid input" });
  req.poll.choices.id(req.params.choiceid).voteCount++;

  if (req.poll.isStarted && !req.poll.isEnded) {
    try {
      const savedPoll = await req.poll.save();
      res.status(201).json(savedPoll);
      console.log("Vote added successfully...");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "Voting is not allowed on this poll" });
  }
});

// Add new choice
router.patch("/add/:id", getPoll, async (req, res) => {
  if (req.body === null)
    return res.status(400).json({ message: "Invalid input" });
  if (!req.body.pollData.choices)
    return res.status(400).json({ message: "Invalid input" });

  req.poll.choices.push(req.body.pollData.choices);

  if (req.poll.isStarted && !req.poll.isEnded) {
    try {
      const savedPoll = await req.poll.save();
      res.status(201).json(savedPoll);
      console.log("Choice added successfully...");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res
      .status(400)
      .json({ message: "Adding choices is not allowed on this poll" });
  }
});

// Remove vote from existing option
router.patch("/unvote/:id/:choiceid", getPoll, async (req, res) => {
  if (req.poll.choices.id(req.params.choiceid).voteCount > 0) {
    req.poll.choices.id(req.params.choiceid).voteCount--;
  }

  if (req.poll.isStarted && !req.poll.isEnded) {
    try {
      const savedPoll = await req.poll.save();
      res.status(201).json(savedPoll);
      console.log("Vote removed successfully...");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "Unvoting is not allowed on this poll" });
  }
});

// Remove choice
router.delete("/remove/:id/:choiceid", getPoll, async (req, res) => {
  try {
    await req.poll.choices.id(req.params.choiceid).remove();
    await req.poll.save();
    res.status(201).json(req.poll);
    console.log("Choice removed successfully...");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/wakeup", async (req, res) => {
  res.status(200).json({ message: "Awake!" })
})

module.exports = router;
