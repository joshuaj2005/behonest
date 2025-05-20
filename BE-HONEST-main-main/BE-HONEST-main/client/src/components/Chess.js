import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [isComputerOpponent, setIsComputerOpponent] = useState(false);
  const [computerThinking, setComputerThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    if (game.isGameOver()) {
      let status = '';
      if (game.isCheckmate()) status = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
      else if (game.isDraw()) status = 'Game Over - Draw!';
      else if (game.isStalemate()) status = 'Game Over - Stalemate!';
      else if (game.isThreefoldRepetition()) status = 'Game Over - Draw by repetition!';
      else if (game.isInsufficientMaterial()) status = 'Game Over - Draw by insufficient material!';
      setGameStatus(status);
      setGameOver(true);
    }
  }, [game]);

  useEffect(() => {
    if (isComputerOpponent && game.turn() === 'b' && !game.isGameOver()) {
      makeComputerMove();
    }
  }, [game, isComputerOpponent]);

  const makeComputerMove = useCallback(async () => {
    if (game.isGameOver()) return;

    setComputerThinking(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for better UX

    try {
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const randomIndex = Math.floor(Math.random() * moves.length);
        const move = moves[randomIndex];
        game.move(move);
        setGame(new Chess(game.fen()));
      }
    } catch (error) {
      console.error('Error making computer move:', error);
    }

    setComputerThinking(false);
  }, [game]);

  const onDrop = useCallback((sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to queen for simplicity
      });

      if (move === null) return false;
      setGame(new Chess(game.fen()));
      return true;
    } catch (error) {
      return false;
    }
  }, [game]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGameOver(false);
    setGameStatus('');
  };

  const toggleComputerOpponent = () => {
    setIsComputerOpponent(!isComputerOpponent);
    resetGame();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Chess Game
          </Typography>
          <Box>
            <Button
              startIcon={<ComputerIcon />}
              onClick={toggleComputerOpponent}
              variant="outlined"
              sx={{ mr: 1 }}
              disabled={gameOver}
            >
              {isComputerOpponent ? 'Play vs Human' : 'Play vs Computer'}
            </Button>
            <IconButton onClick={resetGame} color="primary" disabled={computerThinking}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                opacity: computerThinking ? 0.7 : 1,
                pointerEvents: computerThinking ? 'none' : 'auto',
              }}
            >
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardWidth={600}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
                boardOrientation="white"
              />
            </Box>
          </Grid>
        </Grid>

        {gameStatus && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {gameStatus}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ChessGame; 