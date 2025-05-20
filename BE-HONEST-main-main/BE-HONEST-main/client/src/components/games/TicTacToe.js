import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon, RadioButtonUnchecked as CircleIcon } from '@mui/icons-material';

const TicTacToe = ({ game, onAction, isCurrentTurn }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (game.gameData.board) {
      setBoard(game.gameData.board);
    }
  }, [game.gameData.board]);

  useEffect(() => {
    if (isCurrentTurn && !hasWinner(board)) {
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
  }, [isCurrentTurn, board]);

  const handleTimeUp = async () => {
    try {
      await onAction('timeUp');
    } catch (error) {
      setError('Failed to handle time up');
    }
  };

  const handleCellClick = async (index) => {
    if (!isCurrentTurn || board[index] || hasWinner(board)) {
      return;
    }

    try {
      await onAction('makeMove', { position: index });
    } catch (error) {
      setError('Failed to make move');
    }
  };

  const hasWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (!board.includes(null)) {
      return 'draw';
    }

    return null;
  };

  const winner = hasWinner(board);
  const isDraw = winner === 'draw';

  const renderCell = (index) => {
    const value = board[index];
    const isWinningCell = winner && 
      (winner === 'X' ? game.players[0].user._id === localStorage.getItem('userId') : 
                       game.players[1].user._id === localStorage.getItem('userId'));

    return (
      <Grid item xs={4} key={index}>
        <Paper
          sx={{
            height: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isCurrentTurn && !value && !winner ? 'pointer' : 'default',
            backgroundColor: isWinningCell ? '#e8f5e9' : 'white',
            transition: 'background-color 0.3s'
          }}
          onClick={() => handleCellClick(index)}
        >
          {value === 'X' ? (
            <CloseIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          ) : value === 'O' ? (
            <CircleIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
          ) : null}
        </Paper>
      </Grid>
    );
  };

  const getGameStatus = () => {
    if (winner === 'X') {
      return `${game.players[0].user.username} wins!`;
    } else if (winner === 'O') {
      return `${game.players[1].user.username} wins!`;
    } else if (isDraw) {
      return "It's a draw!";
    } else {
      return isCurrentTurn ? 'Your turn!' : 'Waiting for other player...';
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {getGameStatus()}
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

        <Grid container spacing={1}>
          {Array(9).fill(null).map((_, index) => renderCell(index))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Players
        </Typography>
        {game.players.map((player, index) => (
          <Typography key={player.user._id}>
            {player.user.username}: {index === 0 ? 'X' : 'O'}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default TicTacToe; 