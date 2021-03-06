import React, { Component } from 'react';
import players from './data/players.json';
import _ from 'lodash';
import Timer from './Timer';

class Pick extends Component {
  state = {playerToDraft: "", draft: null}

  componentDidMount() {
    fetch(`/api/drafts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ draft: data.draft });
        this.startTimer();
      });
  }

  togglePause() {
    fetch(`/api/drafts/${this.props.match.params.id}/pause`)
      .then(res => res.json())
      .then(data => {
        this.setState({ draft: data.draft });
        this.startTimer();
      });
  }

  startTimer() {
    let component = this;
    let response = true;

    function tick(){
        if(response && !component.state.draft.paused) {
            response = false;
            fetch(`/api/drafts/${component.props.match.params.id}/tick`)
              .then(res => res.json())
              .then(data => {
                response = true;
                component.setState({ draft: data.draft });
                setTimeout(tick,1025);
              });
        }
    }

    tick();
  }

  pickIsIn(event) {
    if (event.target.value) {
      this.setState({ playerToDraft: JSON.parse(event.target.value) });
    }
  }

  draftPlayer() {
    if (this.state.playerToDraft) {
      fetch(`/api/drafts/${this.props.match.params.id}/pick`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify(this.state.playerToDraft)
      })
      .then(res => res.json())
      .then(data => {
        this.setState({ playerToDraft: "", draft: data.draft});
      });
    }
  }

  render() {
    if (this.state.draft === null) {
      return null;
    }

    const playersSelected = _.map(this.state.draft.picks, pick => pick.name);

    return (
      <div className="Pick">
        <h1>Pick {this.state.draft.picks.length % 10 + 1} in Round {Math.floor(this.state.draft.picks.length / 10) + 1}</h1>
        <Timer draft={this.state.draft}/>
        <div><button onClick={this.togglePause.bind(this)}>{this.state.draft.paused ? "Resume" : "Pause"}</button></div>
        <select onChange={this.pickIsIn.bind(this)} value={JSON.stringify(this.state.playerToDraft)}>
            <option value="">Select Player</option>
            {
                players.map((player) => {
                    if (_.indexOf(playersSelected, player.name) < 0) {
                      return <option key={player.name} value={JSON.stringify(player)}>{player.name} - {player.team} - {player.position}</option>
                    } else {
                      return null;
                    }
                })
            }
        </select>
        <button onClick={this.draftPlayer.bind(this)}>Draft Player</button>
        { this.state.playerToDraft &&
          <h1>Picking: {this.state.playerToDraft.name}</h1>
        }
      </div>
    );
  }
}

export default Pick;
