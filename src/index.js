// eslint-disable-next-line no-unused-vars
import { Tooltip, Popover } from 'bootstrap';
import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
import './index.css';

import example from './02.json';


class Clue extends React.Component {
  render() {
    return (
      <li
        onClick={this.props.onClick}
        className={this.props.highlight ? 'highlight' : ''}
      >{this.props.text}</li>
    );
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (this.props.isActive) {
      this.input.current.focus();
      // TODO If rebus, this selection will depend on current value length
      this.input.current.select();
    }
  }

  componentDidUpdate() {
    if (this.props.isActive) {
      this.input.current.focus();
      // TODO If rebus, this selection will depend on current value length
      this.input.current.select();
    }
  }

  handleChange() {
    // Move active to focused input
    let value = this.input.current.value.toUpperCase();
    this.props.liftValue(this.props.x, this.props.y, value);
  }

  render() {
    return (
      <td className={`cell ${this.props.highlight ? 'highlight' : ''} ${this.props.incorrect ? 'incorrect' : ''}`}>
        {this.props.gridnum &&
        <div className="gridnum">{this.props.gridnum}</div>
        }
        <input
          ref={this.input}
          type="text"
          className="form-control"
          value={this.props.value}
          onChange={this.handleChange}
          onClick={this.props.onClick}
          disabled={this.props.isDisabled}
          autoComplete="off"
        />
      </td>
    );
  }
}

class Crossword extends React.Component {
  constructor(props) {
    super(props);
    this.rows = this.props.data.size.rows || 15;
    this.cols = this.props.data.size.cols || 15;
    this.state = {
      active: [0, 0],
      clue: ['across', 0],
      values: Array(this.props.data.grid.length).fill(''),
      incorrect: Array(this.props.data.grid.length).fill(false),
    }
    this.captureKeys = this.captureKeys.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCellChange = this.handleCellChange.bind(this);
    this.activeClue = this.activeClue.bind(this);

    // Solves
    this.solveLetter = this.solveLetter.bind(this);
    this.solveClue = this.solveClue.bind(this);
    this.solvePuzzle = this.solvePuzzle.bind(this);

    // Check
    this.checkLetter = this.checkLetter.bind(this);
    this.checkClue = this.checkClue.bind(this);
    this.checkPuzzle = this.checkPuzzle.bind(this);
  }

  captureKeys(event) {
    let [orientation, activeClue] = this.state.clue;
    let [x, y] = this.state.active;
    switch (event.key) {
      case 'Up':
      case 'ArrowUp':
        if (y > 0) y--;
        orientation = 'down';
        // TODO change clue?
        break;
      case 'Down':
      case 'ArrowDown':
        if (y < (this.rows - 1)) y++;
        orientation = 'down';
        // TODO change clue?
        break;
      case 'Right':
      case 'ArrowRight':
        if (x < (this.cols - 1)) x++;
        orientation = 'across';
        // TODO change clue?
        break;
      case 'Left':
      case 'ArrowLeft':
        if (x > 0) x--;
        orientation = 'across';
        // TODO change clue?
        break;
      case 'Backspace':
        // TODO Use handleCellChange for deletions
        let index = (y * this.cols) + x;
        const values = this.state.values.slice();
        if (values[index]) {
          // Delete the contents of the current cell
          values[index] = '';
          this.setState({'values': values});
        } else {
          // Delete the contents of the previous cell
          const [orientation, ] = this.state.clue;
          if (orientation === 'across') {
            if (x > 0) x--;
          } else {
            if (y > 0) y--;
          }
          let index = (y * this.cols) + x;
          values[index] = '';
          this.setState({'values': values});
        }
        break;
      default:
        return;
    }
    // TODO Skip disabled cells
    this.setState({'active': [x, y]});
    this.setState({'clue': [orientation, activeClue]});
    event.preventDefault();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.captureKeys, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.captureKeys, false);
  }

  handleClick(x, y) {
    // Move active to focused input
    this.setState({'active': [x, y]});
  }

  activeClue(orientation, index) {
    // The clue's gridnum is contained in the clue text
    let clue;
    if (orientation === 'across') {
      clue = this.props.data.clues.across[index];
    } else if (orientation === 'down') {
      clue = this.props.data.clues.down[index];
    }
    const [value, ] = clue.split('.', 2);
    const number = parseInt(value, 10);

    // Use the gridnums to determine which cell should be active
    let i = 0;
    while (i < this.props.data.gridnums.length) {
      if (this.props.data.gridnums[i] === number) {
        break;
      }
      i++;
    }
    const x = i % this.cols;
    const y = Math.floor((i+1)/this.cols);
    this.setState({'clue': [orientation, index]});
    this.setState({'active': [x, y]});
  }

  handleCellChange(x, y, value) {
    const values = this.state.values.slice();
    const index = (y * this.cols) + x;
    values[index] = value;
    this.setState({'values': values});

    // Clear any incorrect state
    const incorrect = this.state.incorrect.slice();
    incorrect[index] = false;
    this.setState({'incorrect': incorrect});

    // If a value was added, move active cell
    // TODO Depends on rebus
    if (value.length === 0) return;
    const [orientation, ] = this.state.clue;

    // TODO Skip disabled cells
    if (orientation === 'across') {
      if (x < (this.cols - 1)) x++;
    } else {
      if (y < (this.rows - 1)) y++;
    }
    this.setState({'active': [x, y]});
  }

  solveLetter() {
    const [x, y] = this.state.active;
    const values = this.state.values.slice();
    const index = (y * this.cols) + x;
    values[index] = this.props.data.grid[index];
    this.setState({'values': values});
  }

  solveClue() {}

  solvePuzzle() {
    this.setState({'values': this.props.data.grid});
  }

  checkLetter() {}

  checkClue() {}

  checkPuzzle() {
    // Reset the incorrect state
    let incorrect = Array(this.props.data.grid.length).fill(false);
    for (let i = 0; i < this.state.values.length; i++) {
      // Only check cells with a value
      let value = this.state.values[i];
      if (!value) continue;
      incorrect[i] = (value !== this.props.data.grid[i]);
    }
    this.setState({'incorrect': incorrect});
  }

  render() {
    const [orientation, activeClue] = this.state.clue;
    const [activeX, activeY] = this.state.active;
    let body = [];
    for (let y = 0; y < this.rows; y++) {
      let cells = [];
      for (let x = 0; x < this.cols; x++) {
        let index = (y * this.cols) + x;
        let value = this.state.values[index];
        let actual = this.props.data.grid[index];
        let gridnum = this.props.data.gridnums[index];
        let incorrect = this.state.incorrect[index];

        // TODO For now, highlight the whole row or column
        let highlight = false;
        if (orientation === 'across' && activeY === y) {
          highlight = true;
        }
        if (orientation === 'down' && activeX === x) {
          highlight = true;
        }

        cells.push(<Cell
          key={index.toString()}
          x={x}
          y={y}
          value={value}
          isDisabled={actual === '.'}
          gridnum={gridnum ? gridnum : false}
          highlight={highlight}
          isActive={x === activeX && y === activeY}
          incorrect={incorrect}
          onClick={() => this.handleClick(x, y)}
          liftValue={this.handleCellChange}
        />);
      }
      body.push(<tr key={y.toString()}>{cells}</tr>)
    }

    const across = this.props.data.clues.across.map((clue, index) => {
      // TODO Determine clue gridnum
      return <Clue
        key={index.toString()}
        text={clue}
        onClick={() => this.activeClue('across', index)}
        highlight={orientation === 'across' && index === activeClue}
      />;
    });
    const down = this.props.data.clues.down.map((clue, index) => {
      // TODO Determine clue gridnum
      return <Clue
        key={index.toString()}
        text={clue}
        onClick={() => this.activeClue('down', index)}
        highlight={orientation === 'down' && index === activeClue}
      />;
    });
    return (
      <div className="row mt-3">
        <div className="col-12">
          <h3>{this.props.data.title}</h3>
          <h6>{this.props.data.date}</h6>
          <div>
            <button className="btn btn-sm btn-light dropdown-toggle" type="button" id="solve" data-bs-toggle="dropdown" aria-expanded="false">
              Solve
            </button>
            <ul className="dropdown-menu" aria-labelledby="solve">
              <li><button className="btn btn-link dropdown-item" onClick={this.solveLetter}>Letter</button></li>
              <li><button className="btn btn-link dropdown-item" onClick={this.solveClue}>Clue</button></li>
              <li><button className="btn btn-link dropdown-item" onClick={this.solvePuzzle}>Puzzle</button></li>
            </ul>
            <button className="btn btn-sm btn-danger dropdown-toggle" type="button" id="solve" data-bs-toggle="dropdown" aria-expanded="false">
              Check
            </button>
            <ul className="dropdown-menu" aria-labelledby="solve">
              <li><button className="btn btn-link dropdown-item" onClick={this.checkLetter}>Letter</button></li>
              <li><button className="btn btn-link dropdown-item" onClick={this.checkClue}>Clue</button></li>
              <li><button className="btn btn-link dropdown-item" onClick={this.checkPuzzle}>Puzzle</button></li>
            </ul>
          </div>
        </div>
        <div className="col-auto">
          <table className="mt-3">
            <tbody>
              {body}
            </tbody>
          </table>
        </div>
        <div className="col-12 col-lg-4">
        <h4 className="font-weight-bold">Across</h4>
          <ul className="list-unstyled">
            {across}
          </ul>
          <h4 className="font-weight-bold">Down</h4>
          <ul className="list-unstyled">
            {down}
          </ul>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Crossword data={example} />,
  document.getElementById('root')
);
