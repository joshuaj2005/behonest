import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  Send as SendIcon,
  Timer as TimerIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [isComputerOpponent, setIsComputerOpponent] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [playerTime, setPlayerTime] = useState({ white: 600, black: 600 }); // 10 minutes each
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerRating, setPlayerRating] = useState(1200);
  const [difficulty, setDifficulty] = useState('medium');
  
  const timerRef = useRef(null);
  const chatRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !gameOver) {
      timerRef.current = setInterval(() => {
        setPlayerTime(prev => ({
          ...prev,
          [game.turn() === 'w' ? 'white' : 'black']: 
            Math.max(0, prev[game.turn() === 'w' ? 'white' : 'black'] - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, game, gameOver]);

  // Check for game over conditions
  useEffect(() => {
    if (game.isGameOver()) {
      let status = '';
      if (game.isCheckmate()) {
        status = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
        updatePlayerRating(game.turn() === 'w' ? -15 : 15);
      } else if (game.isDraw()) {
        status = 'Draw!';
        updatePlayerRating(5);
      } else if (game.isStalemate()) {
        status = 'Stalemate!';
        updatePlayerRating(5);
      }
      setGameStatus(status);
      setGameOver(true);
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    }
  }, [game]);

  // Computer move logic
  useEffect(() => {
    if (isComputerOpponent && game.turn() === 'b' && !gameOver) {
      const timeout = setTimeout(() => {
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
          let selectedMove;
          
          if (difficulty === 'hard') {
            // Prioritize captures and checks
            const captures = moves.filter(move => move.captured);
            const checks = moves.filter(move => move.san.includes('+'));
            
            if (captures.length > 0) {
              selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else if (checks.length > 0) {
              selectedMove = checks[Math.floor(Math.random() * checks.length)];
            } else {
              selectedMove = moves[Math.floor(Math.random() * moves.length)];
            }
          } else {
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
          }

          const newGame = new Chess(game.fen());
          newGame.move(selectedMove);
          setGame(newGame);
          setMoveHistory(prev => [...prev, selectedMove.san]);
          addChatMessage('Computer', `Moved ${selectedMove.san}`);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [game, isComputerOpponent, gameOver, difficulty]);

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;
      
      setGame(new Chess(game.fen()));
      setMoveHistory(prev => [...prev, move.san]);
      
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
      
      addChatMessage('Player', `Moved ${move.san}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(false);
    setGameStatus('');
    setMoveHistory([]);
    setPlayerTime({ white: 600, black: 600 });
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
    setChatMessages([]);
  };

  const toggleComputerOpponent = () => {
    setIsComputerOpponent(!isComputerOpponent);
    resetGame();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updatePlayerRating = (change) => {
    setPlayerRating(prev => Math.max(100, prev + change));
  };

  const addChatMessage = (sender, text) => {
    setChatMessages(prev => [...prev, {
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addChatMessage('Player', newMessage);
    setNewMessage('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e1e', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ color: '#fff' }}>
                Chess Game
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<ComputerIcon />}
                  onClick={toggleComputerOpponent}
                  variant="contained"
                  color="primary"
                  disabled={gameOver}
                >
                  {isComputerOpponent ? 'Play vs Human' : 'Play vs Computer'}
                </Button>
                <IconButton onClick={() => setShowChat(!showChat)} color="primary">
                  <ChatIcon />
                </IconButton>
                <IconButton onClick={resetGame} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2,
              p: 2,
              backgroundColor: '#2d2d2d',
              borderRadius: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon />
                <Typography>
                  White: {formatTime(playerTime.white)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>
                  Black: {formatTime(playerTime.black)}
                </Typography>
                <TimerIcon />
              </Box>
            </Box>

            <Box sx={{ 
              width: '100%', 
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative',
            }}>
              <Chessboard 
                position={game.fen()}
                onPieceDrop={onDrop}
                boardWidth={600}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
                boardOrientation="white"
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6" color="error">
                {gameStatus}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: '#1e1e1e', color: 'white' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                <ChatIcon sx={{ mr: 1 }} />
                Chat
              </Typography>
              <List
                ref={chatRef}
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  maxHeight: '300px',
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                {chatMessages.map((message, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={message.text}
                      secondary={`${message.sender} - ${message.timestamp}`}
                      secondaryTypographyProps={{ color: 'gray' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </Box>

              <Divider sx={{ my: 2, bgcolor: 'gray' }} />

              <Typography variant="h6" gutterBottom>
                Game Stats
              </Typography>
              <Box sx={{ bgcolor: '#2d2d2d', p: 2, borderRadius: 1 }}>
                <Typography gutterBottom>
                  Player Rating: {playerRating}
                </Typography>
                <Rating
                  value={difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3}
                  readOnly
                  max={3}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Moves: {moveHistory.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={gameOver} onClose={() => setGameOver(false)}>
        <DialogTitle>Game Over</DialogTitle>
        <DialogContent>
          <Typography>{gameStatus}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Game Summary</Typography>
            <Typography>Total Moves: {moveHistory.length}</Typography>
            <Typography>Time Elapsed - White: {formatTime(600 - playerTime.white)}</Typography>
            <Typography>Time Elapsed - Black: {formatTime(600 - playerTime.black)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetGame} color="primary">
            Play Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChessGame;