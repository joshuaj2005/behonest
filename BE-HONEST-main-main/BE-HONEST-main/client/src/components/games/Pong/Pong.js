import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const GameBoard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const Canvas = styled('canvas')({
  border: '2px solid #000',
  backgroundColor: '#000',
});

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 8;
const PADDLE_SPEED = 5;
const INITIAL_BALL_SPEED = 4;

const Pong = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Game state
  const gameState = useRef({
    playerPaddle: {
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      dy: 0
    },
    aiPaddle: {
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      dy: 0
    },
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: INITIAL_BALL_SPEED,
      dy: INITIAL_BALL_SPEED
    }
  });

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          gameState.current.playerPaddle.dy = -PADDLE_SPEED;
          break;
        case 'ArrowDown':
          gameState.current.playerPaddle.dy = PADDLE_SPEED;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (!gameStarted || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          gameState.current.playerPaddle.dy = 0;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, isPaused]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Draw paddles
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, gameState.current.playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(
        CANVAS_WIDTH - PADDLE_WIDTH,
        gameState.current.aiPaddle.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      );

      // Draw ball
      ctx.beginPath();
      ctx.arc(
        gameState.current.ball.x,
        gameState.current.ball.y,
        BALL_SIZE,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();

      // Draw score
      ctx.font = '32px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(score.player.toString(), CANVAS_WIDTH / 4, 50);
      ctx.fillText(score.ai.toString(), (CANVAS_WIDTH * 3) / 4, 50);
    };

    const update = () => {
      // Update player paddle position
      gameState.current.playerPaddle.y += gameState.current.playerPaddle.dy;
      gameState.current.playerPaddle.y = Math.max(
        0,
        Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, gameState.current.playerPaddle.y)
      );

      // Update AI paddle position
      const aiTarget = gameState.current.ball.y - PADDLE_HEIGHT / 2;
      const aiSpeed = PADDLE_SPEED * 0.8; // Make AI slightly slower than player
      if (aiTarget < gameState.current.aiPaddle.y) {
        gameState.current.aiPaddle.y -= aiSpeed;
      } else if (aiTarget > gameState.current.aiPaddle.y) {
        gameState.current.aiPaddle.y += aiSpeed;
      }
      gameState.current.aiPaddle.y = Math.max(
        0,
        Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, gameState.current.aiPaddle.y)
      );

      // Update ball position
      gameState.current.ball.x += gameState.current.ball.dx;
      gameState.current.ball.y += gameState.current.ball.dy;

      // Ball collision with top and bottom walls
      if (
        gameState.current.ball.y <= BALL_SIZE ||
        gameState.current.ball.y >= CANVAS_HEIGHT - BALL_SIZE
      ) {
        gameState.current.ball.dy *= -1;
      }

      // Ball collision with paddles
      if (
        gameState.current.ball.x <= PADDLE_WIDTH + BALL_SIZE &&
        gameState.current.ball.y >= gameState.current.playerPaddle.y &&
        gameState.current.ball.y <= gameState.current.playerPaddle.y + PADDLE_HEIGHT
      ) {
        gameState.current.ball.dx = Math.abs(gameState.current.ball.dx) * 1.1; // Increase speed
      }

      if (
        gameState.current.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        gameState.current.ball.y >= gameState.current.aiPaddle.y &&
        gameState.current.ball.y <= gameState.current.aiPaddle.y + PADDLE_HEIGHT
      ) {
        gameState.current.ball.dx = -Math.abs(gameState.current.ball.dx) * 1.1; // Increase speed
      }

      // Check for scoring
      if (gameState.current.ball.x <= 0) {
        // AI scores
        setScore(prev => {
          const newScore = { ...prev, ai: prev.ai + 1 };
          if (newScore.ai >= 5) {
            setGameOver(true);
            setWinner('AI');
          }
          return newScore;
        });
        resetBall();
      } else if (gameState.current.ball.x >= CANVAS_WIDTH) {
        // Player scores
        setScore(prev => {
          const newScore = { ...prev, player: prev.player + 1 };
          if (newScore.player >= 5) {
            setGameOver(true);
            setWinner('Player');
          }
          return newScore;
        });
        resetBall();
      }
    };

    const gameLoop = () => {
      update();
      render();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, isPaused]);

  const resetBall = () => {
    gameState.current.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    };
  };

  const startGame = () => {
    setGameStarted(true);
    setIsPaused(false);
    setScore({ player: 0, ai: 0 });
    setGameOver(false);
    setWinner(null);
    resetBall();
    gameState.current.playerPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gameState.current.aiPaddle.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Dialog open={gameOver} onClose={() => setGameOver(false)}>
        <DialogTitle>Game Over!</DialogTitle>
        <DialogContent>
          <Typography>
            {winner} wins!
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
            Pong
          </Typography>
          <Box>
            {gameStarted && (
              <IconButton onClick={togglePause} color="primary">
                {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
              </IconButton>
            )}
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

        <Canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />

        <Box sx={{ mt: 2 }}>
          <Typography>
            Use ↑ and ↓ arrow keys to move your paddle
          </Typography>
          <Typography>
            First to 5 points wins!
          </Typography>
        </Box>
      </GameBoard>
    </Box>
  );
};

export default Pong; 