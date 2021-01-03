import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
import './index.css';

import example from './02.json';

// document.addEventListener('keydown', function(event) {
//   switch (event.key) {
//     case 'Left':
//     case 'ArrowLeft':
//       break;
//     case 'Up':
//     case 'ArrowUp':
//       break;
//     case 'Right':
//     case 'ArrowRight':
//       break;
//     case 'Down':
//     case 'ArrowDown':
//       break;
//     default:
//       return;
//   }
//   event.preventDefault();
// });

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.rows = this.props.rows || 15;
    this.cols = this.props.cols || 15;
    this.state = {
      active: [0, 0],
    }
    this.move = this.move.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  move(event) {
    let [x, y] = this.state.active;
    switch (event.key) {
      case 'Up':
      case 'ArrowUp':
        if (y > 0) y--;
        this.setState({'active': [x, y]});
        break;
      case 'Down':
      case 'ArrowDown':
        if (y < (this.rows - 1)) y++;
        this.setState({'active': [x, y]});
        break;
      case 'Right':
      case 'ArrowRight':
        if (x < (this.cols - 1)) x++;
        this.setState({'active': [x, y]});
        break;
      case 'Left':
      case 'ArrowLeft':
        if (x > 0) x--;
        this.setState({'active': [x, y]});
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.move, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.move, false);
  }

  handleClick(x, y) {
    // Move active to focused input
    this.setState({'active': [x, y]});
  }

  render() {
    const [activeX, activeY] = this.state.active;

    let body = [];
    for (let y = 0; y < this.rows; y++) {
      let cells = [];
      for (let x = 0; x < this.cols; x++) {
        let isActive = (x === activeX && y === activeY);
        cells.push(<Cell
          x={x}
          y={y}
          isActive={isActive}
          onClick={() => this.handleClick(x, y)}
        />);
      }
      body.push(<tr>{cells}</tr>)
    }

    return (
      <table className="table">
        <tbody>
          {body}
        </tbody>
      </table>
    );
  }
}


class Clue extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    console.log('Clue!', this.props.text);
  }

  render() {
    return (
      <li onClick={this.handleClick}>{this.props.text}</li>
    );
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gridnum: props.gridnum ? props.gridnum : false,
      value: '',
      actual: props.value,
      isDisabled: props.value === '.',
    };
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

  handleChange(x, y) {
    this.setState({value: this.input.current.value.toUpperCase()});
    // TODO If rebus, this event will depend on current value length
  }

  render() {
    return (
      <td className="cell">
        {this.state.gridnum &&
        <div className="gridnum">{this.state.gridnum}</div>
        }
        <input
          ref={this.input}
          type="text"
          className="form-control"
          value={this.state.value}
          onChange={this.handleChange}
          onClick={this.props.onClick}
          disabled={this.state.isDisabled}
        />
      </td>
    );
  }
}

class Row extends React.Component {
  render() {
    let data = [];
    for (let i = 0; i < this.props.values.length; i++) {
      let value = this.props.values[i];
      let gridnum = this.props.gridnums[i];
      data.push({key: i.toString(), value: value, gridnum: gridnum});
    }
    const cells = data.map(item =>
      <Cell key={item.key} value={item.value} gridnum={item.gridnum} />
    );
    return (
      <tr>
        {cells}
      </tr>
    );
  }
}

class Crossword extends React.Component {
  render() {
    const colsize = this.props.data.size.cols;
    let rows = [];
    for (let i = 0; i < this.props.data.size.rows; i++) {
      // Get the cell values and gridnums
      let start = i * colsize;
      let end = (i+1) * colsize;
      let values = this.props.data.grid.slice(start, end);
      let gridnums = this.props.data.gridnums.slice(start, end);
      rows.push(<Row key={i.toString()} values={values} gridnums={gridnums} />);
    }
    const across = this.props.data.clues.across.map((clue, index) =>
      <Clue key={index.toString()} text={clue} />
    );
    const down = this.props.data.clues.down.map((clue, index) =>
      <Clue key={index.toString()} text={clue} />
    );
    return (
      <div>
        <h3>{this.props.data.title}</h3>
        <h6>{this.props.data.date}</h6>
        <table className="table table-sm">
          <tbody>
            {rows}
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
  // <Crossword data={example} />,
  <Square />,
  document.getElementById('root')
);
