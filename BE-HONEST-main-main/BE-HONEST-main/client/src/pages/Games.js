import React, { useState } from 'react';
import {
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Close as CloseIcon,
  Casino as CasinoIcon,
  Extension as PuzzleIcon,
  SportsEsports as GamingIcon,
  VideogameAsset as GamepadIcon
} from '@mui/icons-material';
import './Games.css';

// Import game components
import ChessGame from '../components/games/ChessGame';
import SnakeGame from '../components/games/SnakeGame';
import TicTacToe from '../components/games/TicTacToe';
import PuzzleGame from '../components/games/PuzzleGame';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'chess',
      name: 'Chess',
      description: 'Challenge your friends to a classic game of chess',
      icon: <CasinoIcon className="game-icon" />,
      component: <ChessGame />,
      available: true,
    },
    {
      id: 'snake',
      name: 'Snake',
      description: 'Play the classic Snake game with a modern twist',
      icon: <GamingIcon className="game-icon" />,
      component: <SnakeGame />,
      available: true,
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: "The classic game of X's and O's",
      icon: <GamepadIcon className="game-icon" />,
      component: <TicTacToe />,
      available: true,
    },
    {
      id: 'puzzle',
      name: 'Puzzle',
      description: 'Test your problem-solving skills',
      icon: <PuzzleIcon className="game-icon" />,
      component: <PuzzleGame />,
      available: false,
    }
  ];

  const handleGameSelect = (game) => {
    if (game.available) {
      setSelectedGame(game);
    }
  };

  const handleClose = () => {
    setSelectedGame(null);
  };

  return (
    <div className="game-room">
      <Container>
        <Typography variant="h2" className="game-room-title">
          Game Room
        </Typography>
        <Typography variant="h6" className="game-room-subtitle">
          Challenge your friends and have fun!
        </Typography>
        
        <Grid container spacing={4}>
          {games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <div
                className={`game-card ${game.available ? 'available' : 'unavailable'}`}
                onClick={() => handleGameSelect(game)}
              >
                <div className="game-card-content">
                  {game.icon}
                  <Typography className="game-name">{game.name}</Typography>
                  <Typography className="game-description">
                    {game.description}
                  </Typography>
                  {!game.available && (
                    <span className="coming-soon">Coming Soon</span>
                  )}
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={Boolean(selectedGame)}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          className="game-dialog"
        >
          {selectedGame && (
            <>
              <Box className="game-dialog-header">
                <Typography className="game-dialog-title">
                  {selectedGame.name}
                </Typography>
                <IconButton
                  onClick={handleClose}
                  className="close-button"
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <DialogContent className="game-dialog-content">
                {selectedGame.component}
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>
    </div>
  );
};

export default Games; 