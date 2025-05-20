import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  LinearProgress
} from '@mui/material';

const Trivia = ({ game, onAction, isCurrentTurn }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState('');
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (game.gameData.currentQuestion && isCurrentTurn) {
      setTimeLeft(30);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game.gameData.currentQuestion, isCurrentTurn]);

  const handleTimeUp = async () => {
    try {
      await onAction('timeUp');
    } catch (error) {
      setError('Failed to submit answer');
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer');
      return;
    }

    try {
      await onAction('submitAnswer', { answer: selectedAnswer });
      setSelectedAnswer('');
    } catch (error) {
      setError('Failed to submit answer');
    }
  };

  const currentQuestion = game.gameData.questions[game.gameData.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Game Over!</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Final Scores:
        </Typography>
        {game.players.map((player) => (
          <Typography key={player.user._id}>
            {player.user.username}: {player.score} points
          </Typography>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Question {game.gameData.currentQuestionIndex + 1} of {game.gameData.questions.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.question}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / 30) * 100}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Time left: {timeLeft}s
          </Typography>
        </Box>

        <FormControl component="fieldset">
          <RadioGroup
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={!isCurrentTurn}
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {isCurrentTurn && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </Button>
          </Box>
        )}
      </Paper>

      {!isCurrentTurn && (
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Waiting for other player's answer...
        </Typography>
      )}
    </Box>
  );
};

export default Trivia; 