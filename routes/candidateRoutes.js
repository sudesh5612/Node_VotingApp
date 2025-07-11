const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// 🔹 Utility: Check if user is admin
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user && user.role === 'admin';
  } catch (err) {
    console.error('Error checking admin role:', err);
    return false;
  }
};

// 🔹 GET: Vote count (must come before '/vote/:candidateID' to avoid route conflicts)
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    const voteRecord = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount,
    }));
    res.status(200).json(voteRecord);
  } catch (err) {
    console.error('Error fetching vote count:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔹 POST: Cast a vote
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ message: 'Invalid candidate ID format' });
    }

    const [candidate, user] = await Promise.all([
      Candidate.findById(candidateID),
      User.findById(userId),
    ]);

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed to vote' });
    if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error('Error recording vote:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔹 POST: Add a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    res.status(201).json({ response });
  } catch (err) {
    console.error('Error saving candidate:', err);
    res.status(400).json({ error: err.message || 'Invalid candidate data' });
  }
});

// 🔹 PUT: Update candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ error: 'Invalid candidate ID format' });
    }

    const response = await Candidate.findByIdAndUpdate(candidateID, req.body, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('Error updating candidate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔹 DELETE: Remove candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ error: 'Invalid candidate ID format' });
    }

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔹 GET: List all candidates (only name and party)
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'name party');
    res.status(200).json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
