import React, { Component } from 'react'
import './LineChart.css'

class LineChart extends Component {

  constructor (props) {
    super(props)

    // Data Maps and Partitions
    const { data } = this.props
    this.dataMap = new Map(data
                        .map(point => [point.x, point.y]))
    this.xData = data.map(p => p.x)

    // Svg Dimensions
    this.svgWidth = this.props.aspect * 100
    this.svgHeight = 100

    // State
    this.state = {
      hover: false,
      position: {},
      marker: {},
      maxX: this.getMaxX(),
      maxY: this.getMaxY(),
      // minX: this.getMinX(),
      minY: this.getMinY()
    }
  }

  getMinX() {
    const {data} = this.props 
    const  only_x = data.map(obj => obj.x)
    const min_x = Math.min.apply(null, only_x)
    return min_x
  }

  getMinY() {
    const { data } = this.props 
    const  only_y = data.map(obj => obj.y)
    const min_y = Math.min.apply(null, only_y)
    return min_y
  }

  getMaxX() {
    const {data} = this.props 
    const  only_x = data.map(obj => obj.x)
    const max_x = Math.max.apply(null, only_x)
    return max_x
  }

  getMaxY() {
    const { data } = this.props 
    const  only_y = data.map(obj => obj.y)
    const max_y = Math.max.apply(null, only_y)
    return max_y
  }

  getSvgX = (x) => (x / this.state.maxX * this.svgWidth)

  getSvgY = (y) => {
    const slope = (10 - this.svgHeight) / (this.state.maxY - this.state.minY)
    const constant = 5 - slope * this.state.maxY
    return slope * y + constant
  }

  makePath() {
    const { data, color } = this.props
    let pathD = ` M  ${this.getSvgX(data[0].x)} ${this.getSvgY(data[0].y)} `

    pathD += data.map((point, i) => {
      return `L ${this.getSvgX(point.x)} ${this.getSvgY(point.y)}  `
    })

    return (
      <g>
        <path className="linechart_path" d={pathD}
        style={{ stroke: color, strokeOpacity: this.state.hover ? 1 : .8, strokeWidth: this.props.strokeWidth}} />
      </g>
    )
  }

  // Event Handlers
  mouseIn = (event) => {
    this.setState({
      hover: true
    })
  }

  mouseOut = (event) => {
    this.setState({
      hover: false
    })
  }

  mouseMove = (event) => {
    const data = this.updateMarker(event)
    this.props.sendData(data)
  }

  updateMarker = (event) => {
    const mouseX = event.clientX - this.state.position.x
    const nearMouseInDataX = mouseX / this.state.position.width * this.state.maxX
    const closestX = this.xData.reduce(function(prev, curr) {
      return (Math.abs(curr - nearMouseInDataX) < Math.abs(prev - nearMouseInDataX) ? curr : prev);
    })
    const nearMouseInSvgX = closestX / this.state.maxX * this.svgWidth
    const nearDataY = this.dataMap.get(closestX)
    const nearSvgY = this.getSvgY(nearDataY)
  
    this.setState({
      marker: {
        x: nearMouseInSvgX,
        y: nearSvgY
      }
    })

    return {
      x: nearMouseInDataX,
      y: nearDataY
    }
  }

  // Ref Handler
  setPosition = (el) => {
    this.setState(state => ({
      position: el.getBoundingClientRect()
    }))
  }

  marker = () => {
    if (this.state.hover) {
      const {x, y} = this.state.marker
      return (
        <g>
          <line x1={x} y1={this.svgHeight - 2} x2={x} y2={2} stroke={this.props.markerColor} strokeWidth="0.5" />
          <circle cx={x} cy={y} r="2" fill={this.props.color} stroke={this.props.backgroundColor} strokeWidth="2"/>
        </g>
      )
    }
    return null
  }

  render() {
    const { svgHeight, svgWidth } = this
    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      onMouseEnter={this.mouseIn}
      onMouseLeave={this.mouseOut}
      onMouseMove={this.mouseMove}
      ref={this.setPosition}>
        {this.makePath()}
        {this.marker()}
      </svg>
    )
  }
}

LineChart.defaultProps = {
  data: [],
  color: '#ff4500',
  markerColor: '#666',
  backgroundColor: 'black',
  strokeWidth: .7,
  aspect: 3,
  sendData: () => null
}

export default LineChart