const MiniGame = require('../models/MiniGame');
const User = require('../models/User');
const { generateTriviaQuestions, generateMemoryCards, generateQuizQuestions } = require('../utils/gameUtils');

// Create a new mini-game
exports.createGame = async (req, res) => {
  try {
    const { type, settings } = req.body;

    const game = new MiniGame({
      type,
      creator: req.user._id,
      settings: {
        ...settings,
        maxPlayers: settings.maxPlayers || 4,
        roundTime: settings.roundTime || 60,
        difficulty: settings.difficulty || 'medium'
      }
    });

    // Add creator as first player
    await game.addPlayer(req.user._id);

    // Initialize game-specific data
    switch (type) {
      case 'trivia':
        game.trivia.questions = await generateTriviaQuestions(settings.difficulty);
        break;
      case 'memory':
        game.memory.cards = generateMemoryCards();
        break;
      case 'quiz':
        game.quiz.questions = await generateQuizQuestions(settings.difficulty);
        break;
      case 'wordChain':
        game.wordChain.categories = ['Animals', 'Food', 'Countries', 'Movies'];
        break;
    }

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error: error.message });
  }
};

// Join a game
exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await MiniGame.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game has already started' });
    }

    await game.addPlayer(req.user._id);
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error joining game', error: error.message });
  }
};

// Start a game
exports.startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await MiniGame.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can start the game' });
    }

    await game.startGame();

    // Emit game start event
    req.app.get('io').to(gameId).emit('game:started', {
      gameId,
      players: game.players,
      currentTurn: game.gameData.currentTurn
    });

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error starting game', error: error.message });
  }
};

// Handle game actions
exports.handleGameAction = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { action, data } = req.body;

    const game = await MiniGame.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ message: 'Game is not active' });
    }

    if (game.gameData.currentTurn.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your turn' });
    }

    let response;
    switch (game.type) {
      case 'wordChain':
        response = await handleWordChainAction(game, action, data);
        break;
      case 'trivia':
        response = await handleTriviaAction(game, action, data);
        break;
      case 'drawing':
        response = await handleDrawingAction(game, action, data);
        break;
      case 'memory':
        response = await handleMemoryAction(game, action, data);
        break;
      case 'quiz':
        response = await handleQuizAction(game, action, data);
        break;
      case 'ticTacToe':
        response = await handleTicTacToeAction(game, action, data);
        break;
      case 'chess':
        response = await handleChessAction(game, action, data);
        break;
    }

    // Emit game update event
    req.app.get('io').to(gameId).emit('game:updated', {
      gameId,
      ...response
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error handling game action', error: error.message });
  }
};

// Get game status
exports.getGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await MiniGame.findById(gameId)
      .populate('players.user', 'username profilePicture')
      .populate('gameData.currentTurn', 'username profilePicture');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error getting game status', error: error.message });
  }
};

// Game-specific action handlers
async function handleWordChainAction(game, action, data) {
  switch (action) {
    case 'submitWord':
      const { word } = data;
      if (!isValidWord(word, game.wordChain.currentWord)) {
        throw new Error('Invalid word');
      }
      game.wordChain.usedWords.push(word);
      game.wordChain.currentWord = word;
      await game.updateScore(req.user._id, 10);
      break;
  }
  return game;
}

async function handleTriviaAction(game, action, data) {
  switch (action) {
    case 'submitAnswer':
      const { answer } = data;
      const currentQuestion = game.trivia.questions[game.trivia.currentQuestionIndex];
      if (answer === currentQuestion.correctAnswer) {
        await game.updateScore(req.user._id, 20);
      }
      game.trivia.currentQuestionIndex++;
      break;
  }
  return game;
}

async function handleDrawingAction(game, action, data) {
  switch (action) {
    case 'draw':
      game.drawing.canvas = data.canvas;
      break;
    case 'submitGuess':
      const { guess } = data;
      if (guess.toLowerCase() === game.drawing.currentWord.toLowerCase()) {
        await game.updateScore(req.user._id, 30);
      }
      break;
  }
  return game;
}

async function handleMemoryAction(game, action, data) {
  switch (action) {
    case 'flipCard':
      const { cardId } = data;
      const card = game.memory.cards.find(c => c.id === cardId);
      if (!card.isFlipped && !card.isMatched) {
        card.isFlipped = true;
        game.memory.flippedCards.push(cardId);
      }
      break;
    case 'checkMatch':
      if (game.memory.flippedCards.length === 2) {
        const [card1, card2] = game.memory.flippedCards.map(id =>
          game.memory.cards.find(c => c.id === id)
        );
        if (card1.value === card2.value) {
          card1.isMatched = true;
          card2.isMatched = true;
          await game.updateScore(req.user._id, 10);
        } else {
          card1.isFlipped = false;
          card2.isFlipped = false;
        }
        game.memory.flippedCards = [];
      }
      break;
  }
  return game;
}

async function handleQuizAction(game, action, data) {
  switch (action) {
    case 'submitAnswer':
      const { answer } = data;
      const currentQuestion = game.quiz.questions[game.quiz.currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;
      game.quiz.answers.push({
        user: req.user._id,
        questionIndex: game.quiz.currentQuestionIndex,
        answer,
        isCorrect
      });
      if (isCorrect) {
        await game.updateScore(req.user._id, 20);
      }
      game.quiz.currentQuestionIndex++;
      break;
  }
  return game;
}

// Helper functions
function isValidWord(word, previousWord) {
  if (!word || !previousWord) return false;
  const lastLetter = previousWord[previousWord.length - 1].toLowerCase();
  return word[0].toLowerCase() === lastLetter;
} 