import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import update from 'immutability-helper';

class App extends Component {
  constructor() {
    super()

    this.state = {
      sessions: []
    }

    let ws = new WebSocket("ws://localhost:3001")

    ws.addEventListener('message', event => {
      let data = JSON.parse(event.data)

      let trace = data.data.trace
      let session = this.state.sessions.find(session => (session.id === trace.sessionId))

      if (session === undefined) {
        this.setState(function(prevState) {
          let session = {
            id: trace.sessionId,
            traces: [trace]
          }
          return { sessions: prevState.sessions.concat(session) }
        })
      } else {
        let sessionIndex = this.state.sessions.map(s => s.id).indexOf(trace.sessionId)

        console.log("session index", sessionIndex)
        console.log("sessions", this.state.sessions)

        this.setState({
          sessions: update(this.state.sessions, {[sessionIndex]: {traces: {$push: [trace]}}})
        })
      }
    })
  }

  render() {
    let tabs = this.state.sessions.map(session => (<Tab key={session.id}>{session.id.slice(0, 3)}</Tab>))

    let tabPanels = this.state.sessions.map(session => {
      let traces = session.traces.map(trace => <li key={trace.id}>{trace.result}</li>)
      return (
        <TabPanel key={session.id}>
          <ul>{traces}</ul>
        </TabPanel>
      )
      }
    )

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Delorean frontend</h1>
        </header>

        <Tabs>
          <TabList>
            {tabs}
          </TabList>
          {tabPanels}
        </Tabs>
      </div>
    );
  }
}

export default App;
