import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import './Snake.css';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_STEP = 10;

const Snake = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [showWalls, setShowWalls] = useState(true);
  const gameLoopRef = useRef();

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const checkCollision = useCallback((head) => {
    // Wall collision
    if (showWalls && (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    )) {
      return true;
    }

    // Wrap around if walls are disabled
    if (!showWalls) {
      head.x = (head.x + GRID_SIZE) % GRID_SIZE;
      head.y = (head.y + GRID_SIZE) % GRID_SIZE;
    }

    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake, showWalls]);

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

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
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 1;
          setHighScore(current => Math.max(current, newScore));
          // Increase speed every 5 points
          if (newScore % 5 === 0) {
            setSpeed(current => Math.max(50, current - SPEED_STEP));
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, checkCollision, isPaused, isGameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;

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
        case ' ':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, isGameOver]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, speed]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  const renderCell = (x, y) => {
    const isSnake = snake.some(segment => segment.x === x && segment.y === y);
    const isHead = snake[0].x === x && snake[0].y === y;
    const isFood = food.x === x && food.y === y;

    return (
      <Box
        key={`${x}-${y}`}
        className={`
          game-cell
          ${isSnake ? 'snake' : ''}
          ${isHead ? 'head' : ''}
          ${isFood ? 'food' : ''}
        `}
        sx={{
          width: `${100 / GRID_SIZE}%`,
          paddingBottom: `${100 / GRID_SIZE}%`,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: '4px',
            backgroundColor: isFood ? '#e91e63' :
              isHead ? '#2196f3' :
              isSnake ? '#4caf50' : 'transparent',
            transition: 'background-color 0.1s',
          }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Snake Game
        </Typography>
        <Typography variant="h6" color="primary">
          Score: {score} | High Score: {highScore}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Paper
          sx={{
            flex: '1 1 auto',
            aspectRatio: '1',
            display: 'flex',
            flexWrap: 'wrap',
            border: '2px solid #333',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            return renderCell(x, y);
          })}
        </Paper>

        <Box sx={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography gutterBottom>Speed</Typography>
            <Slider
              value={INITIAL_SPEED - speed + 50}
              min={0}
              max={100}
              onChange={(_, value) => setSpeed(INITIAL_SPEED - value + 50)}
              disabled={isGameOver || !isPaused}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showWalls}
                  onChange={(e) => setShowWalls(e.target.checked)}
                  disabled={!isPaused && !isGameOver}
                />
              }
              label="Show Walls"
            />
          </Paper>

          <Button
            variant="contained"
            onClick={() => setIsPaused(prev => !prev)}
            disabled={isGameOver}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={resetGame}
          >
            New Game
          </Button>
        </Box>
      </Box>

      <Dialog open={isGameOver} onClose={() => setIsGameOver(false)}>
        <DialogTitle>Game Over!</DialogTitle>
        <DialogContent>
          <Typography>
            Final Score: {score}
            {score === highScore && score > 0 && ' - New High Score!'}
          </Typography>
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

export default Snake; 