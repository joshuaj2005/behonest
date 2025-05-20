const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI (you'll need to add your API key to .env)
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Chat history storage (in production, use a database)
const chatHistory = new Map();

// Active calls storage (in production, use a proper signaling server)
const activeCalls = new Map();

// Get chat history
router.get('/chat/:userId', (req, res) => {
  const { userId } = req.params;
  const history = chatHistory.get(userId) || [];
  res.json(history);
});

// Send message to Honor
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Get user's chat history
    let history = chatHistory.get(userId) || [];
    history.push({ role: 'user', content: message });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Honor, a helpful AI assistant that helps users with navigation, finding places, and connecting with friends." },
        ...history
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Save to history
    history.push({ role: 'assistant', content: aiResponse });
    chatHistory.set(userId, history);

    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Initialize call
router.post('/call/init', (req, res) => {
  const { userId, type } = req.body;
  const callId = Date.now().toString();
  
  activeCalls.set(callId, {
    id: callId,
    type,
    userId,
    status: 'initializing',
    startTime: new Date(),
  });

  res.json({ callId });
});

// Join call
router.post('/call/join', (req, res) => {
  const { callId, userId } = req.body;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  call.participants = call.participants || [];
  call.participants.push(userId);
  call.status = 'active';

  res.json({ call });
});

// End call
router.post('/call/end', (req, res) => {
  const { callId } = req.body;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  call.status = 'ended';
  call.endTime = new Date();
  
  // In production, save call details to database
  activeCalls.delete(callId);

  res.json({ success: true });
});

module.exports = router; 