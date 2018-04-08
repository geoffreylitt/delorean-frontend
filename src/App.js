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

      console.log(data)

      let trace = data.data.trace
      let session = this.state.sessions.find(session => (session.id === trace.sessionId))

      if (session === undefined) {
        let tracepoint = session.tracepoints.find(tracepoint => (tracepoint.id === trace.tracepointId))
        let session = {
          id: trace.sessionId,
          traces: [trace],
          tracepoints: [tracepoint]
        }

        this.setState(function(prevState) {
          return { sessions: prevState.sessions.concat(session) }
        })
      } else {
        let tracepoint = session.tracepoints.find(tracepoint => (tracepoint.id === trace.tracepointId))
        let sessionIndex = this.state.sessions.map(s => s.id).indexOf(trace.sessionId)

        this.setState({
          sessions: update(this.state.sessions, {[sessionIndex]: {traces: {$push: [trace]}}})
        })

        if (tracepoint === undefined) {
          let tracepoint = {
            id: trace.tracepointId
          }
          this.setState({
            sessions: update(this.state.sessions, {
              [sessionIndex]: {
                tracepoints: {$push: [tracepoint]}
              }
            })
          })
        }
      }
    })
  }

  render() {
    let tabs = this.state.sessions.map(session => (<Tab key={session.id}>{session.id.slice(0, 3)}</Tab>))

    let tabPanels = this.state.sessions.map(session => {
      let traces = session.traces.map(trace => <div className="trace-result" key={trace.id}>{trace.result}</div>)
      let tracepoints = session.tracepoints.map(tracepoint =>
        <div className="tracepoint" key={tracepoint.id}>
          <div>{tracepoint.id}</div>
          <input />
        </div>
      )

      return (
        <TabPanel key={session.id}>
          <div className="trace-list">{traces}</div>
          <div className="tracepoint-list">{tracepoints}</div>
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
