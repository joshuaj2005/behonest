import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Brush as BrushIcon,
  Clear as ClearIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

const Drawing = ({ game, onAction, isCurrentTurn }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isGuessing, setIsGuessing] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set initial styles
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load existing drawing if any
    if (game.gameData.currentDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = game.gameData.currentDrawing;
    }

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [game.gameData.currentDrawing]);

  useEffect(() => {
    if (game.gameData.guesses) {
      setGuesses(game.gameData.guesses);
    }
  }, [game.gameData.guesses]);

  const startDrawing = (e) => {
    if (!isCurrentTurn) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !isCurrentTurn) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lastState = undoStack[undoStack.length - 1];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(lastState, 0, 0);
    
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, canvas.toDataURL()]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const nextState = redoStack[redoStack.length - 1];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(nextState, 0, 0);
    
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, canvas.toDataURL()]);
  };

  const handleSubmitDrawing = async () => {
    try {
      const canvas = canvasRef.current;
      const drawingData = canvas.toDataURL();
      await onAction('submitDrawing', { drawing: drawingData });
    } catch (error) {
      setError('Failed to submit drawing');
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim()) {
      setError('Please enter your guess');
      return;
    }

    try {
      await onAction('submitGuess', { guess: guess.trim() });
      setGuess('');
    } catch (error) {
      setError('Failed to submit guess');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {isCurrentTurn ? 'Your turn to draw!' : 'Guess what others are drawing'}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            style={{
              border: '1px solid #ccc',
              cursor: isCurrentTurn ? 'crosshair' : 'default',
              backgroundColor: '#fff'
            }}
          />
        </Box>

        {isCurrentTurn && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Tooltip title="Clear Canvas">
              <IconButton onClick={clearCanvas}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Undo">
              <IconButton onClick={undo} disabled={undoStack.length === 0}>
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton onClick={redo} disabled={redoStack.length === 0}>
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Change Color">
              <IconButton>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.strokeStyle = e.target.value;
                  }}
                  style={{ display: 'none' }}
                  id="color-picker"
                />
                <label htmlFor="color-picker">
                  <PaletteIcon />
                </label>
              </IconButton>
            </Tooltip>
            <Tooltip title="Brush Size">
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => {
                  setBrushSize(e.target.value);
                  const ctx = canvasRef.current.getContext('2d');
                  ctx.lineWidth = e.target.value;
                }}
              />
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleSubmitDrawing}
              startIcon={<BrushIcon />}
            >
              Submit Drawing
            </Button>
          </Box>
        )}
      </Paper>

      {!isCurrentTurn && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Make your guess
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="What do you think it is?"
            />
            <Button
              variant="contained"
              onClick={handleSubmitGuess}
              disabled={!guess.trim()}
            >
              Submit Guess
            </Button>
          </Box>
        </Paper>
      )}

      {guesses.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Guesses
          </Typography>
          <List>
            {guesses.map((guess, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={guess.user.username}
                    secondary={guess.text}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Drawing; 