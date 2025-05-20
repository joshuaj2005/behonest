import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Drawer,
} from '@mui/material';
import {
  SportsEsports as ChessIcon,
  Casino as TicTacToeIcon,
  Extension as PuzzleIcon,
  Memory as MemoryIcon,
  QuestionMark as TriviaIcon,
  VideogameAsset as SnakeIcon,
  Gamepad as PongIcon,
  GridOn as MinesweeperIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import './GameRoom.css';

const GameRoom = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const games = [
    {
      title: 'Chess',
      description: 'Challenge your mind with a classic game of chess against the computer or a friend.',
      icon: <ChessIcon sx={{ fontSize: 60 }} />,
      path: '/chess',
      color: '#2196f3',
      isReady: true
    },
    {
      title: 'Snake',
      description: 'Navigate the snake, eat food, and try to achieve the highest score without hitting walls or yourself.',
      icon: <SnakeIcon sx={{ fontSize: 60 }} />,
      path: '/snake',
      color: '#4caf50',
      isReady: true
    },
    {
      title: 'Tic Tac Toe',
      description: "Classic game of X's and O's. Play against a friend or computer!",
      icon: <TicTacToeIcon sx={{ fontSize: 60 }} />,
      path: '/tictactoe',
      color: '#4CAF50',
      isReady: true,
    },
    {
      title: 'Memory Game',
      description: 'Test your memory by matching pairs of cards.',
      icon: <MemoryIcon sx={{ fontSize: 60 }} />,
      path: '/memory',
      color: '#FF9800',
      isReady: true,
    },
    {
      title: 'Pong',
      description: 'Classic arcade game. Play against the computer or a friend!',
      icon: <PongIcon sx={{ fontSize: 60 }} />,
      path: '/pong',
      color: '#9C27B0',
      isReady: true,
    },
    {
      title: 'Puzzle Game',
      description: 'Solve challenging puzzles and train your brain.',
      icon: <PuzzleIcon sx={{ fontSize: 60 }} />,
      path: '/puzzle',
      color: '#E91E63',
      isReady: true,
    },
    {
      title: 'Minesweeper',
      description: 'Classic minesweeper game. Clear the field without hitting mines!',
      icon: <MinesweeperIcon sx={{ fontSize: 60 }} />,
      path: '/minesweeper',
      color: '#607D8B',
      isReady: true,
    },
    {
      title: 'Trivia Quiz',
      description: 'Test your knowledge across various topics.',
      icon: <TriviaIcon sx={{ fontSize: 60 }} />,
      path: '/trivia',
      color: '#9C27B0',
      isReady: true,
    }
  ];

  useEffect(() => {
    if (socket) {
      socket.emit('joinGameRoom');

      socket.on('gameRoomMessage', (message) => {
        setMessages((prev) => [...prev, message]);
        if (!isChatOpen) {
          setUnreadMessages((prev) => prev + 1);
        }
      });

      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.emit('leaveGameRoom');
        socket.off('gameRoomMessage');
        socket.off('onlineUsers');
      };
    }
  }, [socket, isChatOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('gameRoomMessage', {
        text: newMessage,
        sender: user.username,
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0);
    }
  };

  return (
    <Container maxWidth="lg" className="game-room-container">
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center" 
        sx={{ 
          pt: 4, 
          mb: 4,
          color: '#fff',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        Game Room
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {games.map((game, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={game.title}>
            <Card 
              className={`game-card ${!game.isReady ? 'coming-soon' : ''}`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '--animation-order': index,
              }}
            >
              <Box
                className="game-icon-container"
                sx={{ bgcolor: game.color }}
              >
                {React.cloneElement(game.icon, { 
                  sx: { 
                    fontSize: 80, 
                    color: 'white',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                  } 
                })}
              </Box>
              <CardContent className="game-content">
                <Typography className="game-title" variant="h5">
                  {game.title}
                </Typography>
                <Typography className="game-description" variant="body1">
                  {game.description}
                </Typography>
                {game.isReady ? (
                  <Button
                    className="play-button"
                    onClick={() => navigate(game.path)}
                    sx={{
                      bgcolor: game.color,
                      color: 'white',
                      '&:hover': {
                        bgcolor: game.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Play Now
                  </Button>
                ) : (
                  <Button
                    className="play-button"
                    disabled
                    sx={{
                      bgcolor: 'grey.300',
                      color: 'grey.600',
                    }}
                  >
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <IconButton
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <Badge badgeContent={unreadMessages} color="error">
          <ChatIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={toggleChat}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Game Room Chat</Typography>
          <IconButton onClick={toggleChat}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
            <List>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.sender}
                    secondary={message.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: message.sender === user?.username ? 'primary.main' : 'text.primary',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Paper
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton type="submit" sx={{ p: '10px' }}>
              <SendIcon />
            </IconButton>
          </Paper>
        </Box>
      </Drawer>
    </Container>
  );
};

export default GameRoom; 