import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  LinearProgress
} from '@mui/material';
import { QuestionMark as QuestionMarkIcon } from '@mui/icons-material';

const Memory = ({ game, onAction, isCurrentTurn }) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (game.gameData.matchedPairs) {
      setMatchedPairs(game.gameData.matchedPairs);
    }
  }, [game.gameData.matchedPairs]);

  useEffect(() => {
    if (isCurrentTurn && selectedCards.length === 0) {
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
  }, [isCurrentTurn, selectedCards.length]);

  const handleTimeUp = async () => {
    try {
      await onAction('timeUp');
    } catch (error) {
      setError('Failed to handle time up');
    }
  };

  const handleCardClick = async (index) => {
    if (!isCurrentTurn || selectedCards.length >= 2 || matchedPairs.includes(index)) {
      return;
    }

    const newSelectedCards = [...selectedCards, index];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      try {
        await onAction('flipCards', { cards: newSelectedCards });
        setSelectedCards([]);
      } catch (error) {
        setError('Failed to flip cards');
      }
    }
  };

  const renderCard = (index) => {
    const isSelected = selectedCards.includes(index);
    const isMatched = matchedPairs.includes(index);
    const card = game.gameData.cards[index];

    return (
      <Grid item xs={3} key={index}>
        <Card
          sx={{
            height: 120,
            cursor: isCurrentTurn && !isMatched ? 'pointer' : 'default',
            backgroundColor: isMatched ? '#e8f5e9' : 'white',
            transition: 'transform 0.3s',
            transform: isSelected || isMatched ? 'rotateY(180deg)' : 'none',
            transformStyle: 'preserve-3d'
          }}
          onClick={() => handleCardClick(index)}
        >
          <CardContent
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backfaceVisibility: 'hidden'
            }}
          >
            {isSelected || isMatched ? (
              <Typography variant="h4">{card}</Typography>
            ) : (
              <QuestionMarkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const isGameComplete = matchedPairs.length === game.gameData.cards.length / 2;

  if (isGameComplete) {
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
            {isCurrentTurn ? 'Your turn!' : 'Waiting for other player...'}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / 30) * 100}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Time left: {timeLeft}s
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {game.gameData.cards.map((_, index) => renderCard(index))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Scores
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

export default Memory; 