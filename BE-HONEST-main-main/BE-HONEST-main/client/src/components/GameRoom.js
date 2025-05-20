import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GameRoom = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', score: 0 },
    { id: 2, name: 'Player 2', score: 0 },
  ]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);

  const handleCellClick = (index) => {
    if (gameBoard[index] || winner) return;

    const newBoard = [...gameBoard];
    newBoard[index] = currentTurn === 1 ? 'X' : 'O';
    setGameBoard(newBoard);

    // Check for winner
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(newBoard[a]);
        setGameState('finished');
        return;
      }
    }

    // Check for draw
    if (!newBoard.includes(null)) {
      setGameState('finished');
      return;
    }

    setCurrentTurn(currentTurn === 1 ? 2 : 1);
  };

  const resetGame = () => {
    setGameBoard(Array(9).fill(null));
    setCurrentTurn(1);
    setWinner(null);
    setGameState('playing');
  };

  const startGame = () => {
    setGameState('playing');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', pt: 8, pb: 7 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Tic Tac Toe
        </Typography>

        {gameState === 'waiting' && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Players Ready
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={startGame}
            >
              Start Game
            </Button>
          </Box>
        )}

        {gameState === 'playing' && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {players.map((player) => (
                <Grid item xs={6} key={player.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: currentTurn === player.id ? 'primary.light' : 'background.paper',
                      color: currentTurn === player.id ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="h6">{player.name}</Typography>
                    <Typography variant="h4">{player.score}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={1} sx={{ mb: 3 }}>
              {gameBoard.map((cell, index) => (
                <Grid item xs={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleCellClick(index)}
                  >
                    <Typography variant="h3">{cell}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetGame}
              >
                Reset Game
              </Button>
            </Box>
          </>
        )}

        {gameState === 'finished' && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              {winner ? `Player ${winner === 'X' ? '1' : '2'} Wins!` : "It's a Draw!"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={resetGame}
              sx={{ mt: 2 }}
            >
              Play Again
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GameRoom; 