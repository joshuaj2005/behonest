import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import BoltIcon from '@mui/icons-material/Bolt';
import CakeIcon from '@mui/icons-material/Cake';

const GameBoard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const Card = styled(Paper)(({ theme, isFlipped, isMatched }) => ({
  width: '100%',
  paddingBottom: '100%',
  position: 'relative',
  cursor: isMatched ? 'default' : 'pointer',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
  backgroundColor: isMatched ? theme.palette.success.light : theme.palette.background.default,
  '&:hover': {
    backgroundColor: isMatched ? theme.palette.success.light : theme.palette.action.hover,
  },
}));

const CardContent = styled(Box)(({ isBack }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: isBack ? 'rotateY(180deg)' : 'rotateY(0)',
  fontSize: '2rem',
}));

const ICONS = [
  EmojiEmotionsIcon,
  PetsIcon,
  FavoriteIcon,
  StarIcon,
  MusicNoteIcon,
  LocalFloristIcon,
  BoltIcon,
  CakeIcon,
];

const createBoard = () => {
  const cards = [...ICONS, ...ICONS].map((Icon, index) => ({
    id: index,
    Icon,
    isFlipped: false,
    isMatched: false,
  }));

  // Shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

const MemoryGame = () => {
  const [cards, setCards] = useState(createBoard());
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].Icon === cards[second].Icon) {
        setCards(prev => prev.map((card, idx) => 
          idx === first || idx === second ? { ...card, isMatched: true } : card
        ));
      }
      
      setTimeout(() => {
        setCards(prev => prev.map((card, idx) => 
          flippedCards.includes(idx) ? { ...card, isFlipped: false } : card
        ));
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards]);

  useEffect(() => {
    if (cards.every(card => card.isMatched)) {
      setGameComplete(true);
      setShowDialog(true);
    }
  }, [cards]);

  const handleCardClick = (index) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      cards[index].isMatched
    ) {
      return;
    }

    setCards(prev => prev.map((card, idx) => 
      idx === index ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, index]);
    setMoves(prev => prev + 1);
  };

  const resetGame = () => {
    setCards(createBoard());
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
    setShowDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Congratulations!</DialogTitle>
        <DialogContent>
          <Typography>
            You completed the game in {moves} moves!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetGame} color="primary">
            Play Again
          </Button>
        </DialogActions>
      </Dialog>

      <GameBoard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Memory Game
          </Typography>
          <Box>
            <IconButton onClick={resetGame} color="primary">
              <RestartAltIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Moves: {moves}
        </Typography>

        <Grid container spacing={2}>
          {cards.map((card, index) => (
            <Grid item xs={3} sm={3} key={card.id}>
              <Card
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={() => handleCardClick(index)}
              >
                <CardContent>?</CardContent>
                <CardContent isBack>
                  <card.Icon sx={{ fontSize: 40 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </GameBoard>
    </Box>
  );
};

export default MemoryGame; 