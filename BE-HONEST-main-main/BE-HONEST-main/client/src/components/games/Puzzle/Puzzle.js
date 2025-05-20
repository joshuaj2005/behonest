import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';

const GameBoard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const PuzzlePiece = styled(Button)(({ theme, isCorrect }) => ({
  width: '100%',
  height: '100%',
  minHeight: 80,
  fontSize: '1.5rem',
  fontWeight: 'bold',
  backgroundColor: isCorrect ? theme.palette.success.light : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: isCorrect ? theme.palette.success.main : theme.palette.primary.dark,
  },
}));

const GRID_SIZE = 4;
const WINNING_MOVES = 20; // Number of moves needed to win

const Puzzle = () => {
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  // Initialize board
  const initializeBoard = () => {
    const numbers = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
    numbers.push(null); // Empty space
    return shuffleBoard(numbers);
  };

  // Shuffle board while ensuring it's solvable
  const shuffleBoard = (array) => {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    // Ensure the puzzle is solvable
    if (!isSolvable(array)) {
      // Swap last two numbers to make it solvable
      const lastIndex = array.length - 2;
      [array[lastIndex], array[lastIndex - 1]] = [array[lastIndex - 1], array[lastIndex]];
    }

    return array;
  };

  // Check if puzzle is solvable
  const isSolvable = (puzzle) => {
    let inversions = 0;
    const puzzleWithoutEmpty = puzzle.filter(num => num !== null);

    for (let i = 0; i < puzzleWithoutEmpty.length - 1; i++) {
      for (let j = i + 1; j < puzzleWithoutEmpty.length; j++) {
        if (puzzleWithoutEmpty[i] > puzzleWithoutEmpty[j]) {
          inversions++;
        }
      }
    }

    // For 4x4 puzzle, if empty tile is on even row from bottom and inversions odd, puzzle is solvable
    // If empty tile is on odd row from bottom and inversions even, puzzle is solvable
    const emptyIndex = puzzle.indexOf(null);
    const emptyRowFromBottom = GRID_SIZE - Math.floor(emptyIndex / GRID_SIZE);
    return emptyRowFromBottom % 2 === 0 ? inversions % 2 === 1 : inversions % 2 === 0;
  };

  // Start new game
  const startGame = () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setMoves(0);
    setGameStarted(true);
    setGameWon(false);
    setMoveHistory([]);
  };

  // Check if puzzle is solved
  const checkWin = (currentBoard) => {
    for (let i = 0; i < currentBoard.length - 1; i++) {
      if (currentBoard[i] !== i + 1) return false;
    }
    return currentBoard[currentBoard.length - 1] === null;
  };

  // Handle piece movement
  const movePiece = (index) => {
    if (!gameStarted || gameWon) return;

    const emptyIndex = board.indexOf(null);
    if (!isValidMove(index, emptyIndex)) return;

    const newBoard = [...board];
    [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
    
    setMoveHistory([...moveHistory, board]);
    setBoard(newBoard);
    setMoves(moves + 1);

    if (checkWin(newBoard)) {
      setGameWon(true);
    }
  };

  // Check if move is valid
  const isValidMove = (index, emptyIndex) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  // Undo last move
  const undoMove = () => {
    if (moveHistory.length === 0) return;
    
    const lastBoard = moveHistory[moveHistory.length - 1];
    setBoard(lastBoard);
    setMoveHistory(moveHistory.slice(0, -1));
    setMoves(moves - 1);
  };

  // Check if piece is in correct position
  const isPieceCorrect = (value, index) => {
    if (value === null) return index === GRID_SIZE * GRID_SIZE - 1;
    return value === index + 1;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={gameWon} onClose={() => setGameWon(false)}>
        <DialogTitle>Congratulations!</DialogTitle>
        <DialogContent>
          <Typography>
            You solved the puzzle in {moves} moves!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={startGame} color="primary">
            Play Again
          </Button>
        </DialogActions>
      </Dialog>

      <GameBoard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Sliding Puzzle
          </Typography>
          <Box>
            <IconButton
              onClick={undoMove}
              disabled={!gameStarted || moveHistory.length === 0}
              color="primary"
            >
              <UndoIcon />
            </IconButton>
            <IconButton onClick={startGame} color="primary">
              <RestartAltIcon />
            </IconButton>
          </Box>
        </Box>

        {!gameStarted && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" onClick={startGame}>
              Start Game
            </Button>
          </Box>
        )}

        <Grid container spacing={1} sx={{ maxWidth: 400, margin: '0 auto' }}>
          {board.map((value, index) => (
            <Grid item xs={3} key={index}>
              <PuzzlePiece
                onClick={() => movePiece(index)}
                disabled={value === null}
                isCorrect={isPieceCorrect(value, index)}
              >
                {value}
              </PuzzlePiece>
            </Grid>
          ))}
        </Grid>

        {gameStarted && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">
              Moves: {moves}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography>
            Click adjacent tiles to slide them into the empty space
          </Typography>
          <Typography>
            Arrange the numbers in order from 1 to 15
          </Typography>
        </Box>
      </GameBoard>
    </Box>
  );
};

export default Puzzle; 