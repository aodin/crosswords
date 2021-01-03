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
        className={this.props.highlight ? 'highlighted-clue' : ''}
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
      <td className="cell">
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
    }
    this.captureKeys = this.captureKeys.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCellChange = this.handleCellChange.bind(this);
    this.activeClue = this.activeClue.bind(this);
  }

  captureKeys(event) {
    let [x, y] = this.state.active;
    switch (event.key) {
      case 'Up':
      case 'ArrowUp':
        if (y > 0) y--;
        break;
      case 'Down':
      case 'ArrowDown':
        if (y < (this.rows - 1)) y++;
        break;
      case 'Right':
      case 'ArrowRight':
        if (x < (this.cols - 1)) x++;
        break;
      case 'Left':
      case 'ArrowLeft':
        if (x > 0) x--;
        break;
      case 'Backspace':
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

  activeClue(orientation, index, ) {
    this.setState({'clue': [orientation, index]});
  }

  handleCellChange(x, y, value) {
    const values = this.state.values.slice();
    const index = (y * this.cols) + x;
    values[index] = value;
    this.setState({'values': values});

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

  render() {
    const [activeX, activeY] = this.state.active;
    let body = [];
    for (let y = 0; y < this.rows; y++) {
      let cells = [];
      for (let x = 0; x < this.cols; x++) {
        let index = (y * this.cols) + x;
        let value = this.state.values[index];
        let actual = this.props.data.grid[index];
        let gridnum = this.props.data.gridnums[index];

        cells.push(<Cell
          key={index.toString()}
          x={x}
          y={y}
          value={value}
          isDisabled={actual === '.'}
          gridnum={gridnum ? gridnum : false}
          isActive={x === activeX && y === activeY}
          onClick={() => this.handleClick(x, y)}
          liftValue={this.handleCellChange}
        />);
      }
      body.push(<tr key={y.toString()}>{cells}</tr>)
    }
    const [orientation, activeClue] = this.state.clue;
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
      <div>
        <h3>{this.props.data.title}</h3>
        <h6>{this.props.data.date}</h6>
        <table className="">
          <tbody>
            {body}
          </tbody>
        </table>
        <div className="mt-4">
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
