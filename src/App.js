
import './App.css';
import { useState } from 'react';

const SquareBox = (props) => {
  return (
    <div className="square" style={{ backgroundColor: props.color }}>{props.text}</div>
  );
}

const ChessBoard = (layout = [], clickAction, selectedPiece) => {
  return layout.map((row, i) => {
    return (
      <tr key={i}>
        {row.map((cell, j) => {
          const square = i * row.length + j;
          const defaultColor = (i + j) % 2 === 0 ? "black" : "grey";
          const color = selectedPiece === square ? "red" : defaultColor;
          return (
            <td key={square} onClick={()=>clickAction(square)}>
              <SquareBox color={color} text={cell} squareNumber={square} />
            </td>
          )
        })}
      </tr>
    )

  })
}

const App = () => {
  let [chessBoard, updateChessBoard] = useState(
    [
      ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      new Array(8).fill(""),
      new Array(8).fill(""),
      new Array(8).fill(""),
      new Array(8).fill(""),
      ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
    ])
  let [selectedPiece, selectSquare] = useState(-1);

  return (
    <div className="App">
      <header className="App-header">
        <table>
          <tbody>
            {ChessBoard(chessBoard,selectSquare,selectedPiece,updateChessBoard)}
          </tbody>
        </table>

      </header>
    </div>
  );
}



export default App;
