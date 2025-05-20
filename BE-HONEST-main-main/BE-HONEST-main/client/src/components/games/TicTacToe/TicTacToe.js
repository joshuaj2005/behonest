import React, { useState, useEffect } from 'react';
import { 
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';

const GameBoard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const Cell = styled(Button)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: 4,
  fontSize: '2rem',
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // 'pvp' or 'ai'
  const [openDialog, setOpenDialog] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    }

    // AI move
    if (gameMode === 'ai' && !newWinner && !isXNext) {
      setTimeout(makeAIMove, 500, newBoard);
    }
  };

  const makeAIMove = (currentBoard) => {
    // Simple AI: Find first empty cell
    const emptyCells = currentBoard.reduce((acc, cell, index) => {
      if (!cell) acc.push(index);
      return acc;
    }, []);

    if (emptyCells.length > 0) {
      // Choose random empty cell
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = [...currentBoard];
      newBoard[randomIndex] = 'O';
      setBoard(newBoard);
      setIsXNext(true);

      const newWinner = calculateWinner(newBoard);
      if (newWinner) {
        setWinner(newWinner);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
    setOpenDialog(false);
  };

  const getStatus = () => {
    if (winner) {
      return `Winner: ${winner}`;
    } else if (!board.includes(null)) {
      return "Game Draw!";
    } else {
      return `Next player: ${isXNext ? 'X' : 'O'}`;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={openDialog} onClose={() => {}}>
        <DialogTitle>Select Game Mode</DialogTitle>
        <DialogContent>
          <Typography>Choose how you want to play:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleGameModeSelect('pvp')} color="primary">
            Player vs Player
          </Button>
          <Button onClick={() => handleGameModeSelect('ai')} color="secondary">
            Player vs AI
          </Button>
        </DialogActions>
      </Dialog>

      <GameBoard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Tic Tac Toe
          </Typography>
          <IconButton onClick={resetGame} color="primary">
            <RestartAltIcon />
          </IconButton>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          {getStatus()}
        </Typography>

        <Grid container spacing={1} justifyContent="center" sx={{ maxWidth: 324, margin: '0 auto' }}>
          {board.map((value, index) => (
            <Grid item key={index} xs={4}>
              <Cell
                onClick={() => handleClick(index)}
                disabled={!!winner}
                variant="contained"
              >
                {value}
              </Cell>
            </Grid>
          ))}
        </Grid>

        {(winner || !board.includes(null)) && (
          <Button
            variant="contained"
            color="primary"
            onClick={resetGame}
            sx={{ mt: 3 }}
          >
            Play Again
          </Button>
        )}
      </GameBoard>
    </Box>
  );
};

export default TicTacToe; 