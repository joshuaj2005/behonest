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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

const Quiz = ({ game, onAction, isCurrentTurn }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (game.gameData.answers) {
      setAnswers(game.gameData.answers);
    }
  }, [game.gameData.answers]);

  useEffect(() => {
    if (isCurrentTurn && !selectedAnswer) {
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
  }, [isCurrentTurn, selectedAnswer]);

  const handleTimeUp = async () => {
    try {
      await onAction('timeUp');
    } catch (error) {
      setError('Failed to handle time up');
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

      {answers.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Previous Answers
          </Typography>
          <List>
            {answers.map((answer, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={answer.user.username}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Question: {answer.question}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Answer: {answer.answer}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={answer.isCorrect ? 'success.main' : 'error.main'}
                        >
                          {answer.isCorrect ? 'Correct!' : 'Incorrect'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Scores
        </Typography>
        {game.players.map((player) => (
          <Typography key={player.user._id}>
            {player.user.username}: {player.score} points
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default Quiz; 