import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const GameBoard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  maxWidth: 600,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const Canvas = styled('canvas')({
  border: '2px solid #333',
  backgroundColor: '#f0f0f0',
});

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 100;

const Snake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const gameLoopRef = useRef();

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const checkCollision = useCallback((head) => {
    // Wall collision
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      setShowDialog(true);
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      generateFood();
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, checkCollision, generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });

    // Draw food
    ctx.fillStyle = '#f44336';
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }, [snake, food]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isPaused) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused]);

  useEffect(() => {
    drawGame();
  }, [snake, food, drawGame]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, gameOver, isPaused]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setShowDialog(false);
    generateFood();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Game Over!</DialogTitle>
        <DialogContent>
          <Typography>Your score: {score}</Typography>
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
            Snake Game
          </Typography>
          <Box>
            <IconButton onClick={togglePause} color="primary">
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
            <IconButton onClick={resetGame} color="primary">
              <RestartAltIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Score: {score}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />
        </Box>

        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Use arrow keys to control the snake
        </Typography>
      </GameBoard>
    </Box>
  );
};

export default Snake; 