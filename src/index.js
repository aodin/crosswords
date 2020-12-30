import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
import './index.css';

import example from './02.json';


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
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value.toUpperCase()})
  }

  render() {
    return (
      <td className="cell">
        {this.state.gridnum &&
        <div className="gridnum">{this.state.gridnum}</div>
        }
        <input
          type="text"
          className="form-control"
          value={this.state.value}
          onChange={this.handleChange}
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
        <table>
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
  <Crossword data={example} />,
  document.getElementById('root')
);
