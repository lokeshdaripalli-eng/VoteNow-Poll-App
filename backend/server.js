const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database
const db = {
  polls: []
};

// Helper to generate a simple unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// GET /polls -> Fetch all polls with results
app.get('/polls', (req, res) => {
  res.json(db.polls);
});

// POST /polls -> Create a new poll
app.post('/polls', (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: 'Invalid poll data. Question and options array are required.' });
  }

  if (options.length < 2 || options.length > 4) {
    return res.status(400).json({ error: 'A poll must have between 2 and 4 options.' });
  }

  const newPoll = {
    id: generateId(),
    question,
    options: options.map(opt => ({ text: opt, votes: 0 })),
    createdAt: new Date().toISOString()
  };

  db.polls.push(newPoll);
  res.status(201).json(newPoll);
});

// POST /polls/:id/vote -> Vote on a poll
app.post('/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;

  const poll = db.polls.find(p => p.id === id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found.' });
  }

  if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid option index.' });
  }

  poll.options[optionIndex].votes += 1;
  res.json(poll);
});

// DELETE /polls/:id -> Delete a poll
app.delete('/polls/:id', (req, res) => {
  const { id } = req.params;
  const pollIndex = db.polls.findIndex(p => p.id === id);
  
  if (pollIndex === -1) {
    return res.status(404).json({ error: 'Poll not found.' });
  }

  db.polls.splice(pollIndex, 1);
  res.status(200).json({ message: 'Poll deleted successfully.' });
});

// GET /polls/:id/results -> Get poll results
app.get('/polls/:id/results', (req, res) => {
  const { id } = req.params;
  const poll = db.polls.find(p => p.id === id);
  
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found.' });
  }

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  const results = poll.options.map((opt, index) => {
    const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
    return {
      index,
      text: opt.text,
      votes: opt.votes,
      percentage
    };
  });

  res.json({
    question: poll.question,
    results,
    totalVotes
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
