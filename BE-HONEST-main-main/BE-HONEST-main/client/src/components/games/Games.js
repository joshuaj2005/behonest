import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Dialog
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TicTacToe from './TicTacToe/TicTacToe';
import Snake from './Snake/Snake';
import MemoryGame from './MemoryGame/MemoryGame';

const GameCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const GameIcon = styled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: 60,
    color: theme.palette.common.white,
  },
}));

const games = [
  {
    id: 'chess',
    title: 'Chess',
    description: 'Challenge your mind with a classic game of chess against the computer or a friend.',
    color: '#2196F3',
    component: null,
    status: 'coming_soon'
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Navigate the snake, eat food, and try to achieve the highest score without hitting walls or yourself.',
    color: '#4CAF50',
    component: Snake,
    status: 'available'
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description: 'Classic game of X\'s and O\'s. Play against a friend or computer!',
    color: '#3F51B5',
    component: TicTacToe,
    status: 'available'
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Test your memory by matching pairs of cards.',
    color: '#FF9800',
    component: MemoryGame,
    status: 'available'
  },
  {
    id: 'pong',
    title: 'Pong',
    description: 'Classic arcade game. Play against the computer or a friend!',
    color: '#9C27B0',
    component: null,
    status: 'coming_soon'
  },
  {
    id: 'puzzle',
    title: 'Puzzle Game',
    description: 'Solve challenging puzzles and train your brain.',
    color: '#E91E63',
    component: null,
    status: 'coming_soon'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Classic minesweeper game. Clear the field without hitting mines!',
    color: '#607D8B',
    component: null,
    status: 'coming_soon'
  },
  {
    id: 'trivia',
    title: 'Trivia Quiz',
    description: 'Test your knowledge across various topics.',
    color: '#673AB7',
    component: null,
    status: 'coming_soon'
  }
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleGameSelect = (game) => {
    if (game.status === 'available') {
      setSelectedGame(game);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGame(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Game Room
      </Typography>
      
      <Grid container spacing={4}>
        {games.map((game) => (
          <Grid item key={game.id} xs={12} sm={6} md={3}>
            <GameCard>
              <GameIcon color={game.color}>
                <Typography variant="h2" component="span" sx={{ color: 'white' }}>
                  {game.title[0]}
                </Typography>
              </GameIcon>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {game.title}
                </Typography>
                <Typography>
                  {game.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color={game.status === 'available' ? 'primary' : 'secondary'}
                  onClick={() => handleGameSelect(game)}
                  disabled={game.status !== 'available'}
                >
                  {game.status === 'available' ? 'Play Now' : 'Coming Soon'}
                </Button>
              </Box>
            </GameCard>
          </Grid>
        ))}
      </Grid>

      <Dialog
        fullScreen
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <Box sx={{ height: '100%', bgcolor: 'background.default' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleCloseDialog}>
              Back to Games
            </Button>
          </Box>
          {selectedGame?.component && <selectedGame.component />}
        </Box>
      </Dialog>
    </Container>
  );
};

export default Games; 