import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {

  var isWinner = false;
  props.posWins.forEach(item => {
  if((props.index === item) && item != null )
    isWinner = true;
  });

  return (
    <button className = {isWinner ? 'win' : 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {    
    return (
      <Square
        key = {i}
        index = {i}
        posWins = {this.props.posWins}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let squares = [];
    for(let i = 0 ; i < 3 ; i++){
      let row = [];
      for(let j = 0 ; j < 3 ; j++){
        row.push(this.renderSquare( (i * 3) + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div>
        {squares}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        clickPosition: 0
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
      squaresWins: Array(3).fill(null),
      countSquares: 0
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const [winner, , ,] = calculateWinner(squares);
    
    if (winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        clickPosition: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      countSquares: this.state.countSquares+1
    }, () => {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      const [winner, pos1, pos2, pos3] = calculateWinner(squares);
      if(winner){
        this.setState({
          squaresWins: [pos1, pos2, pos3]
        })
      }
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  orderToggle(){
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner,,,] = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      let col = 0;
      let fila = 0; 
      if(step.clickPosition  <= 2)
      {
        fila = 1;
        col = step.clickPosition + 1; 
      }
      else if(step.clickPosition >= 3 && step.clickPosition <= 5)
      {
        fila = 2;
        col = step.clickPosition - 2;
      }
      else if(step.clickPosition >= 6 && step.clickPosition <= 8)
      {
        fila = 3;
        col = step.clickPosition - 5;
      }
      
      var desc = move ? 
      move === this.state.stepNumber ?  
        <strong>Go to move #{move} (columna = {col}, fila = {fila})</strong>
        : 
        'Go to move #' + move + ' (columna = ' + col + ', ' + 'fila = ' + fila + ')'
      : 
      'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const isAscending = this.state.isAscending;
    if(!isAscending){
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if(this.state.countSquares === 9) {
      status = 'The result is a Tie';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            posWins = {this.state.squaresWins}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.orderToggle()}>{isAscending ? 'Ascending' : 'Descending'}</button>
          <ol>{moves}</ol> 
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], a, b, c];
    }
  }
  return [null, null, null, null];
}
