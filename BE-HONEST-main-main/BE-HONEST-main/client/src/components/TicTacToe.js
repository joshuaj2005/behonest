import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Divider,
  Rating,
  useTheme
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const TicTacToe = () => {
  const theme = useTheme();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isComputerOpponent, setIsComputerOpponent] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const messagesEndRef = useRef(null);

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
    return squares.every(square => square !== null) ? 'draw' : null;
  };

  const calculateBestMove = (squares) => {
    // Minimax algorithm implementation
    const minimax = (board, depth, isMaximizing) => {
      const winner = calculateWinner(board);
      if (winner === 'X') return -10 + depth;
      if (winner === 'O') return 10 - depth;
      if (winner === 'draw') return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (!board[i]) {
            board[i] = 'O';
            const score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (!board[i]) {
            board[i] = 'X';
            const score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleClick = (index) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setGameHistory([...gameHistory, { board: newBoard, move: index }]);

    const winner = calculateWinner(newBoard);
    if (winner) {
      if (winner !== 'draw') {
        setScore(prev => ({
          ...prev,
          [winner]: prev[winner] + 1
        }));
      }
      return;
    }

    if (isComputerOpponent && !isXNext) {
      setTimeout(() => {
        const computerMove = calculateBestMove(newBoard);
        if (computerMove !== null) {
          const nextBoard = newBoard.slice();
          nextBoard[computerMove] = 'O';
          setBoard(nextBoard);
          setIsXNext(true);
          setGameHistory([...gameHistory, { board: nextBoard, move: computerMove }]);

          const computerWinner = calculateWinner(nextBoard);
          if (computerWinner && computerWinner !== 'draw') {
            setScore(prev => ({
              ...prev,
              [computerWinner]: prev[computerWinner] + 1
            }));
          }
        }
      }, 500);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'Player' }]);
      setNewMessage('');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameHistory([]);
  };

  const toggleOpponent = () => {
    setIsComputerOpponent(!isComputerOpponent);
    resetGame();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderSquare = (index) => {
    const isWinningSquare = false; // Add winning line highlight logic here
    return (
      <Button
        variant="outlined"
        onClick={() => handleClick(index)}
        sx={{
          width: 80,
          height: 80,
          margin: 0.5,
          fontSize: '2rem',
          backgroundColor: isWinningSquare ? theme.palette.success.light : 'transparent',
          '&:hover': {
            backgroundColor: isWinningSquare ? theme.palette.success.light : theme.palette.action.hover,
          },
        }}
      >
        {board[index]}
      </Button>
    );
  };

  const getStatus = () => {
    const winner = calculateWinner(board);
    if (winner === 'draw') return 'Game ended in a draw!';
    if (winner) return `Winner: ${winner}`;
    return `Next player: ${isXNext ? 'X' : 'O'}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2">
                Tic Tac Toe
              </Typography>
              <Box>
                <Button
                  startIcon={isComputerOpponent ? <PersonIcon /> : <ComputerIcon />}
                  onClick={toggleOpponent}
                  sx={{ mr: 1 }}
                >
                  {isComputerOpponent ? 'Play with Friend' : 'Play with Computer'}
                </Button>
                <Button startIcon={<RefreshIcon />} onClick={resetGame}>
                  Reset Game
                </Button>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {getStatus()}
              </Typography>
              <Typography variant="subtitle1">
                Score - X: {score.X} | O: {score.O}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex' }}>
                  {renderSquare(0)}
                  {renderSquare(1)}
                  {renderSquare(2)}
                </Box>
                <Box sx={{ display: 'flex' }}>
                  {renderSquare(3)}
                  {renderSquare(4)}
                  {renderSquare(5)}
                </Box>
                <Box sx={{ display: 'flex' }}>
                  {renderSquare(6)}
                  {renderSquare(7)}
                  {renderSquare(8)}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Game Chat
            </Typography>
            <List sx={{ height: 300, overflow: 'auto', mb: 2 }}>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.text}
                    secondary={message.sender}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <Button variant="contained" onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicTacToe; 