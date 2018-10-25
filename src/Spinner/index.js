import React, { Component } from 'react'
import { Spinner as SpinnerPlugin } from 'spin.js'

import './index.scss'

class Spinner extends Component {
  componentDidMount() {
    const options = {
      lines: 13, // The number of lines to draw
      length: 38, // The length of each line
      width: 17, // The line thickness
      radius: 45, // The radius of the inner circle
      scale: 0.3, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#ffffff', // CSS color or array of colors
      fadeColor: 'transparent', // CSS color or array of colors
      opacity: 0.25, // Opacity of the lines
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      position: 'relative',
    }
    new SpinnerPlugin(options).spin(this.refs.spinner)
  }

  render() {
    return (
      <div className="spinner-component">
        <div className="spinner-box">
          <h2 className="heading-large">Loading</h2>
          <div ref="spinner" />
        </div>
      </div>
    )
  }
}

export default Spinner
