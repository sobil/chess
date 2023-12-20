
import './App.css';
import { useState } from 'react';

const getInitialChessBoard = () => [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  new Array(8).fill(""),
  new Array(8).fill(""),
  new Array(8).fill(""),
  new Array(8).fill(""),
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

const whitePieces = getInitialChessBoard()[0].concat(getInitialChessBoard()[1]);

const getPiece = (chessBoard, square) => {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const piece = chessBoard[row][col];
  return {
    "piece": piece,
    "row": row,
    "col": col,
    "pieceColour": piece === ""  ? "" : whitePieces.indexOf(chessBoard[row][col]) > 0 ? "white" : "black"
  };
}

const validateMove = (chessBoard, selectedSquare, targetSquare) => {
  const from = getPiece(chessBoard, selectedSquare);
  const to = getPiece(chessBoard, targetSquare);
  if (from === "") {
    alert("No piece selected!");
    return chessBoard;
  }
  if (to !== "") {
    if (from.pieceColour === to.pieceColour) {
      alert("Cannot kill your own piece!");
      return chessBoard;
    }
    chessBoard[to.row][to.col] = from.piece;
    chessBoard[from.row][from.col] = "";
    return chessBoard;
  }
  alert("Ambitious move!");
  return chessBoard
}

const SquareBox = (props) => {
  return (
    <div className="square" style={{ backgroundColor: props.color }}>{props.text}</div>
  );
}

const ChessBoard = (layout = [], clickAction, selectedSquare) => {
  return layout.map((row, i) => {
    return (
      <tr key={i}>
        {row.map((cell, j) => {
          const square = i * row.length + j;
          const defaultColor = (i + j) % 2 === 0 ? "black" : "grey";
          const color = selectedSquare === square ? "red" : defaultColor;
          return (
            <td key={square} onClick={() => clickAction(square)}>
              <SquareBox color={color} text={cell} squareNumber={square} />
            </td>
          )
        })}
      </tr>
    )

  })
}

const App = () => {
  let [chessBoard, setChessBoard] = useState(
    getInitialChessBoard())
  const updateChessBoard = (chessBoard) => {
    console.log("Resetting Chess Board");
    setChessBoard(chessBoard);
  }
  let [selectedSquare, selectSquare] = useState(-1);
  const clickAction = (square) => {
    if (square === selectedSquare) {
      // Deselect the square
      selectSquare(-1);
    } else {
      if (selectedSquare === -1) {
        // Select the square
        selectSquare(square);
      }
      else {
        setChessBoard(validateMove(chessBoard, selectedSquare, square));
        selectSquare(-1);
      }
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={(e) => updateChessBoard(getInitialChessBoard())}>Reset</button>
        <table>
          <tbody>
            {ChessBoard(chessBoard, clickAction, selectedSquare)}
          </tbody>
        </table>

      </header>
    </div>
  );
}



export default App;
