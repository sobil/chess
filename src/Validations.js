

export class Move {
  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.pieceColour = this.from.pieceColour;
  }
  default() {
    return this
  }
  getFrom() {
    return this.from;
  }
  getTo() {
    return this.to;
  }
  get() {
    return [this.from, this.to];
  }
  set(from, to) {
    this.from = from;
    this.to = to;
    return this;
  }
}

export const getInitialChessBoard = () => [
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

export const getPiece = (chessBoard, square) => {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const piece = chessBoard[row][col];
  return {
    "position": square,
    "piece": piece,
    "row": row,
    "col": col,
    "pieceColour": piece === "" ? "" : whitePieces.indexOf(chessBoard[row][col]) > -1 ? "white" : "black"
  };
}

const findPieces = (chessBoard, piece) => {
  let pieces = [];
  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[0].length; j++) {
      if (chessBoard[i][j] === piece) {
        pieces.push(getPiece(chessBoard, i * chessBoard.length + j));
      }
    }
  }
  return pieces;
}

export const validateMove = (chessBoard, selectedSquare, targetSquare, testCheck = true, history) => {
  let from = getPiece(chessBoard, selectedSquare);
  const to = getPiece(chessBoard, targetSquare);
  const lastMove = history.slice(-1)[0];
  if (!lastMove && from.pieceColour === "black") return chessBoard;
  if (lastMove && lastMove.getFrom().pieceColour === from.pieceColour) return chessBoard;
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
      if (!validatePawnMove(chessBoard, from, to, lastMove)) {
        // alert("Invalid move for pawn!");
        return chessBoard;
      }
      if (lastMove && validateEnPassant(from, to, lastMove)) {
        chessBoard[lastMove.getTo().row][lastMove.getTo().col] = "";
      }
      // En Passant
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
      console.log("Validating king move");
      if (!validateKingMove(chessBoard, from, to, history)) {
        return chessBoard;
      }
      if (validateCastling(chessBoard, from, to, history)) {
        const targetRook = getPiece(chessBoard, (to.col === 1 ? from.row * 8 : from.row * 8 + 7))
        chessBoard[targetRook.row][targetRook.col] = "";
        chessBoard[from.row][to.col === 1 ? 2 : 5] = targetRook.piece;
      }
      break;
    default:
      break;
  }
  if (testCheck) {
    const result = resultsInCheck(chessBoard.map((row) => [...row]), from, to);
    if (result) return chessBoard;
  }
  chessBoard[from.row][from.col] = "";
  chessBoard[to.row][to.col] = from.piece;
  return chessBoard.map((row) => [...row]);
}

const validateEnPassant = (from, to, lastMove) => {
  if (lastMove === undefined) return false;
  if (!["♟", "♙"].includes(lastMove.getFrom().piece)) return false;
  if (Math.abs(lastMove.getFrom().row - lastMove.getTo().row) !== 2) return false;
  if (!(lastMove.getTo().row === from.row)) return false;
  if (!(lastMove.getTo().col === to.col)) return false;
  return true;
}

const validatePawnMove = (chessBoard, from, to, lastMove) => {
  const whiteDirection = 1;
  const forwardVector = (to.row - from.row) * (from.pieceColour === "white" ? whiteDirection : whiteDirection * -1);
  const sideVector = to.col - from.col;
  if (forwardVector === 1 && to.piece === "" && sideVector === 0) return true;
  if (getInitialChessBoard()[from.row][from.col] === chessBoard[from.row][from.col] && forwardVector === 2 && sideVector === 0 && to.piece === "") return true;
  if (forwardVector === 1 && (sideVector === 1 || sideVector === -1) && (to.piece !== "" || validateEnPassant(from, to, lastMove))) return true
  return false;
}

const validateRookMove = (chessBoard, from, to) => {
  // Check if the move is horizontal or vertical
  const forwardVector = (to.row - from.row)
  const sideVector = to.col - from.col;
  if (!(forwardVector === 0 || sideVector === 0)) return false;
  for (let i = 0; i !== forwardVector; forwardVector > 0 ? i++ : i--) {
    if (chessBoard[from.row + i][from.col] !== "" && i !== 0) return false;
  }
  for (let i = 0; i !== sideVector; sideVector > 0 ? i++ : i--) {
    if (chessBoard[from.row][from.col + i] !== "" && i !== 0) return false;
  }
  return true;
}



const validateKnightMove = (chessBoard, from, to) => {
  const forwardVector = (to.row - from.row)
  const sideVector = to.col - from.col;
  if (Math.abs(forwardVector) === 2 && Math.abs(sideVector) === 1) return true;
  if (Math.abs(forwardVector) === 1 && Math.abs(sideVector) === 2) return true;
  return false;
}

const validateBishopMove = (chessBoard, from, to) => {
  const forwardVector = (to.row - from.row)
  const sideVector = to.col - from.col;
  if (Math.abs(forwardVector) !== Math.abs(sideVector)) return false;
  for (let i = 0; i !== Math.abs(forwardVector); i++) {
    if (chessBoard[from.row + (forwardVector > 0 ? i : -i)][from.col + (sideVector > 0 ? i : -i)] !== "" && i !== 0) return false;
  }
  return true;
}

const validateQueenMove = (chessBoard, from, to) => {
  if (validateRookMove(chessBoard, from, to)) return true;
  if (validateBishopMove(chessBoard, from, to)) return true;
  return false;
}

const validateKingMove = (chessBoard, from, to, history) => {
  if (Math.abs(to.row - from.row) <= 1 && Math.abs(to.col - from.col) <= 1) return true;
  if (validateCastling(chessBoard, from, to, history)) return true;
  return false;
}

const validateCastling = (chessBoard, from, to, history) => {
  if (from.piece !== "♚" && from.piece !== "♔") return false;
  if (from.row !== to.row) return false;
  if (![1, 6].includes(to.col)) return false;
  const targetRook = getPiece(chessBoard, (to.col === 1 ? from.row * 8 : from.row * 8 + 7))
  for (let i = from.col; i !== to.col; to.col === 1 ? i-- : i++) {
    console.log("checking " + from.row + "," + i);
    if (chessBoard[from.row][i] !== "" && i !== from.col) return false;
  }
  if (targetRook.piece !== "♜" && targetRook.piece !== "♖") return false;
  for (let i = 0; i < history.length; i++) {
    if (["♚", "♔"].includes(history[i].getFrom().piece)) return false;
    if (history[i].getFrom().position === targetRook.position) return false;
  }
  return true;
}

const resultsInCheck = (chessBoard, from, to) => {
  chessBoard[from.row][from.col] = "";
  chessBoard[to.row][to.col] = from.piece;
  const king = findPieces(chessBoard, from.pieceColour === "white" ? "♚" : "♔")[0];
  for (let i = 0; i < chessBoard.length; i++) {
    for (let j = 0; j < chessBoard[0].length; j++) {
      if (chessBoard[i][j] === "") continue;
      if (getPiece(chessBoard, i * chessBoard.length + j).pieceColour === king.pieceColour) continue;
      const result = validateMove(chessBoard.map((row) => [...row]), i * chessBoard.length + j, king.position, false);
      if (result[king.row][king.col] !== king.piece) {
        console.log("Moving " + chessBoard[i][j] + " from " + i + "," + j + " to " + king.row + "," + king.col + " results in check!");
        return true;
      }
    }
  }
  return false;
}

