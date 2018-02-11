import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  if (props.highlight) {
      return (
        <button className="square" style={{color: "red"}}>
          {props.value}
        </button>
      );
    } else {
      return (
        <button className="square" onClick={props.onClick}>
          {props.value}
        </button>
      );
    }
  }
  
  class Board extends React.Component {
    renderSquare(i) {
      let won = false;
      if (this.props.winningPos && this.props.winningPos.indexOf(i) >= 0) {
        // If there is a winning position and square or cell i is part of that winning pos
        won = true;
      }
      return (
            <Square 
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                highlight={won}
             />
      );
    }
  
    render() {
      var rows = [];
      var cells = [];
      var cellNumber = 0;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            cells.push(this.renderSquare(cellNumber))
            cellNumber++;
        }
        rows.push(<div key={i} className="board-row">{ cells }</div>);
        cells = [];
      }

      return (
        <div>
          {rows}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                col: null,
                row: null
            }],
            xIsNext: true,
            stepNumber: 0,
            ascending: true
        }
    }

    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
          // Game is finished or square is not empty
          return;
      }
      // Place new X or O
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      let row = parseInt(i / 3, 10);
      let col = i % 3;
      this.setState({
          history: history.concat([{squares: squares, row: row, col: col}]),
          xIsNext: !this.state.xIsNext, // flip
          stepNumber: history.length
      });
    }

    toggleSort() {
      const ascending = this.state.ascending;
      this.setState({
        ascending: !ascending,
      });
    }
    
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winnerResult = calculateWinner(current.squares);

      const moves = history.map((step, move) => {
        const desc = move ?
          'Go to move #' + move :
          'Go to game start';
        const location = move ? 'Row: ' + step.row + ' Col: ' + step.col : '';
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
              {/* if move is selected, bold it */}
              {move === this.state.stepNumber ? <b>{desc}</b> :  desc} ({location})</button>
          </li>
        );
      });
  
      let status;
      let winningPos;
      if (winnerResult && winnerResult.winner === 'Draw') {
        status = winnerResult.winner;
      } else if (winnerResult) {
        status = 'Winner: ' + winnerResult.winner;
        winningPos = winnerResult.winningPos;
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
       
      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              winningPos={winningPos}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <button onClick={() => this.toggleSort()}>Sort moves</button>
            {(() => this.state.ascending === true ? <ol>{moves}</ol> : <ol>{moves.reverse()}</ol>) ()}
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let allFilled = true;
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          winningPos: lines[i]
        }
      }
      if (!squares[a] || !squares[b] || !squares[c]) {
        allFilled = false;
      }
    }
    return allFilled ? {winner: 'Draw'} : null;
  }