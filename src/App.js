
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
const whiteDirection = 1;


const getPiece = (chessBoard, square) => {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const piece = chessBoard[row][col];
  return {
    "piece": piece,
    "row": row,
    "col": col,
    "pieceColour": piece === "" ? "" : whitePieces.indexOf(chessBoard[row][col]) > -1 ? "white" : "black"
  };
}

const validateMove = (chessBoard, selectedSquare, targetSquare) => {
  let from = getPiece(chessBoard, selectedSquare);
  const to = getPiece(chessBoard, targetSquare);
  if (from.pieceColour === to.pieceColour) {
    // alert("Cannot kill your own piece!");
    return chessBoard;
  }
  switch (from.piece) {
    case "":
      // alert("No piece selected!");
      return chessBoard;
    case "♟":
    case "♙":
      if (!validatePawnMove(chessBoard, from, to)) {
        // alert("Invalid move for pawn!");
        return chessBoard;
      }
      if (to.row === 0 || to.row === 7)
        from.piece = from.pieceColour === "white" ? "♛" : "♕";
      break
    case "♜":
    case "♖":
      if (!validateRookMove(chessBoard, from, to)) {
        // alert("Invalid move for rook!");
        return chessBoard;
      }
      break;
    case "♞":
    case "♘":
      if (!validateKnightMove(chessBoard, from, to)) {
        // alert("Invalid move for knight!");
        return chessBoard;
      }
      break;
    case "♝":
    case "♗":
      if (!validateBishopMove(chessBoard, from, to)) {
        // alert("Invalid move for bishop!");
        return chessBoard;
      }
      break;
    case "♛":
    case "♕":
      if (!validateQueenMove(chessBoard, from, to)) {
        // alert("Invalid move for queen!");
        return chessBoard;
      }
      break;
    case "♚":
    case "♔":
      if (!validateKingMove(chessBoard, from, to)) {
        // alert("Invalid move for king!");
        return chessBoard;
      }
      break;
    default:
      break;
  }
  chessBoard[to.row][to.col] = from.piece;
  chessBoard[from.row][from.col] = "";
  return chessBoard
}

const validatePawnMove = (chessBoard, from, to) => {
  const forwardVector = (to.row - from.row) * (from.pieceColour === "white" ? whiteDirection : whiteDirection * -1);
  const sideVector = to.col - from.col;
  if (forwardVector === 1 && to.piece === "" && sideVector === 0) return true;
  if (getInitialChessBoard()[from.row][from.col] === chessBoard[from.row][from.col] && forwardVector === 2 && sideVector === 0 && to.piece === "") return true;
  if (forwardVector === 1 && (sideVector === 1 || sideVector === -1) && to.piece !== "") return true
  return false;
}

const validateRookMove = (chessBoard, from, to) => {
  // Check if the move is horizontal or vertical
  const forwardVector = (to.row - from.row)
  const sideVector = to.col - from.col;
  if (!(forwardVector === 0 || sideVector === 0)) return false;
  for (let i = 0;  i !== forwardVector; forwardVector > 0 ? i++ : i--) {
    if (chessBoard[from.row + i][from.col] !== "" && i !== 0) return false;
  }
  for (let i = 0;  i !== sideVector; sideVector > 0 ? i++ : i--) {
    if (chessBoard[from.row][from.col + i] !== "" && i !== 0) return false;
  }
  return true;
}

const validateKnightMove = (chessBoard, from, to) => {
}

const validateBishopMove = (chessBoard, from, to) => {
  const forwardVector = (to.row - from.row)
  const sideVector = to.col - from.col;
  if (Math.abs(forwardVector) !== Math.abs(sideVector)) return false;
  for (let i = 0;  i !== Math.abs(forwardVector); i++) {
   if (chessBoard[from.row + (forwardVector > 0 ? i : -i)][from.col + (sideVector > 0 ? i : -i)] !== "" && i !== 0) return false;
  }
  return true;
}

const validateQueenMove = (chessBoard, from, to) => {
  return false;
}

const validateKingMove = (chessBoard, from, to) => {
  if (Math.abs(to.row - from.row) > 1 || Math.abs(to.col - from.col) > 1) return false;
  // if (positionInThreat(chessBoard, from, to)) return false;
  return true;
}

const positionInThreat = (chessBoard, from, to) => {
  chessBoard[to.row][to.col] = chessBoard[from.row][from.col];
  const toPosition = to.row * 8 + to.col;
  for (let i = 0; i < chessBoard.length ; i++) {
    for (let j = 0; j < chessBoard[0].length ; j++) {
      const piece = chessBoard[i][j];
      if( piece === "") continue;
      const thisPosition = i*8 + j;
      const thisPiece = getPiece(chessBoard, thisPosition);
      if (thisPiece.pieceColour === from.pieceColour) continue;
      if (validateMove(chessBoard, thisPosition, toPosition)[to.row][to.col] !== from.piece) {
        console.log("Threat from " + thisPiece.piece + " at " + thisPosition);
        return true;
      }
    }
  }
  return false;
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
