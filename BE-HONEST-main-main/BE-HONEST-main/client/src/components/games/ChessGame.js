import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './ChessGame.css';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    // from square
    if (!moveFrom) {
      const piece = game.get(square);
      if (piece) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
      return;
    }

    // to square
    if (moveFrom) {
      const move = makeMove(moveFrom, square);
      if (move) {
        setTimeout(makeRandomMove, 300);
        setMoveFrom('');
        setOptionSquares({});
      }
      if (!move) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

  function makeMove(from, to) {
    try {
      const move = game.move({
        from,
        to,
        promotion: 'q' // always promote to a queen for example simplicity
      });
      setGame(new Chess(game.fen()));
      return move;
    } catch (e) {
      return null;
    }
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = game.move(possibleMoves[randomIndex]);
    setGame(new Chess(game.fen()));

    return move;
  }

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

  function resetGame() {
    setGame(new Chess());
    setMoveFrom('');
    setRightClickedSquares({});
    setMoveSquares({});
    setOptionSquares({});
  }

  return (
    <Box className="chess-game">
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Chessboard
            position={game.fen()}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={{
              ...moveSquares,
              ...optionSquares,
              ...rightClickedSquares
            }}
            boardWidth={500}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box className="chess-controls">
            <Typography variant="h6" gutterBottom>
              Game Status
            </Typography>
            <Typography>
              {game.isGameOver()
                ? 'Game Over!'
                : game.isDraw()
                ? 'Draw!'
                : `Current Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={resetGame}
              sx={{ mt: 2 }}
            >
              Reset Game
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChessGame; 