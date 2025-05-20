import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';

const WordChain = ({ game, onAction, isCurrentTurn }) => {
  const [word, setWord] = useState('');
  const [error, setError] = useState('');
  const [lastWord, setLastWord] = useState('');

  useEffect(() => {
    if (game.gameData.words && game.gameData.words.length > 0) {
      setLastWord(game.gameData.words[game.gameData.words.length - 1]);
    }
  }, [game.gameData.words]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate word
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    if (lastWord && word[0].toLowerCase() !== lastWord[lastWord.length - 1].toLowerCase()) {
      setError(`Word must start with the letter '${lastWord[lastWord.length - 1].toUpperCase()}'`);
      return;
    }

    if (game.gameData.words.includes(word.toLowerCase())) {
      setError('This word has already been used');
      return;
    }

    try {
      await onAction('submitWord', { word: word.toLowerCase() });
      setWord('');
    } catch (error) {
      setError('Failed to submit word');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Chain
        </Typography>
        <List>
          {game.gameData.words.map((word, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText primary={word} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {isCurrentTurn ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" gutterBottom>
            {lastWord
              ? `Enter a word starting with '${lastWord[lastWord.length - 1].toUpperCase()}'`
              : 'Enter any word to start'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word"
              disabled={!isCurrentTurn}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!isCurrentTurn}
            >
              Submit
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="subtitle1" color="text.secondary">
          Waiting for other player's turn...
        </Typography>
      )}
    </Box>
  );
};

export default WordChain; 