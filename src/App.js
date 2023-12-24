
import './App.css';
import { useState } from 'react';
import { validateMove, Move, getInitialChessBoard, getPiece } from './Validations';


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
  let [selectedSquare, selectSquare] = useState(-1);
  let [moves, updateMoveHistory] = useState([]);
  const updateChessBoard = (newChessBoard, lastMove) => {
    if (JSON.stringify(chessBoard) === JSON.stringify(newChessBoard)) {
      return false;
    }
    setChessBoard(newChessBoard);
    return true;
  }
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
        if (updateChessBoard(validateMove(chessBoard.map((row) => [...row]), selectedSquare, square, false, moves.slice(-1)[0]))) {
          updateMoveHistory(moves.concat([new Move(getPiece(chessBoard,selectedSquare), getPiece(chessBoard,square))]));
        }
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
