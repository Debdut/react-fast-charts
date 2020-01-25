import React, { Component } from 'react'
import './PieChart.css'

function LightenDarkenColor(col, amt) {
  let usePound = false;

  if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
  }

  let num = parseInt(col,16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  let g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

class PieChart extends Component {
  constructor (props) {
    super(props)

    this.state = {
      hover: -1
    }
  }
  getCoordinates (percent) {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  getColor (i) {
    return [
      '#bdf4e3',
      '#91edd1',
      '#65e6bf',
      '#39dfac',
      '#39dfac',
      '#20c693'
    ][i % 6]
  }

  //Event Handlers
  mouseEnter (e, i) {
    this.setState({
      hover: i
    })
  }

  mouseLeave(e, i) {
    this.setState({
      hover: -1
    })
  }

  colorize = (c, i) => {
    const color = c || this.getColor(i)
    return (this.state.hover === i) ? LightenDarkenColor(color, 20) : color
  }

  getSlices () {
    const total = this.props.data
                  .map(d => d.val)
                  .reduce((a, c) => a + c)
    return this.props.data
          .map (d => {
            const o = {}
            o.name = d.name
            o.val = d.val
            return o
          })
          .sort((d1, d2) => - d1.val + d2.val)
          .splice(0, this.props.top)
          .map(d => {
            d.percent = d.val/total
            return d
          })
  }

  makePaths = () => {
    let cumulativePercent = 0.0
    const slices = this.getSlices()

    let generatedSlices = slices
      .map((slice, i) => {
        const [startX, startY] = this.getCoordinates(cumulativePercent)
        cumulativePercent += slice.percent
        const [endX, endY] = this.getCoordinates(cumulativePercent)
        const largeArcFlag = slice.percent > .5 ? 1 : 0
        const pathD = [
          `M ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L 0 0`
        ].join(' ')
        return (
          <path key={i} className="piechart_path" d={pathD}
          style={{ 
            fill: this.colorize(slice.color, i),
            strokeWidth : .01,
            stroke: this.colorize(slice.color, i)
          }}
          onMouseEnter={(e) => this.mouseEnter(e, i)}
          onMouseLeave={(e) => this.mouseLeave(e, i)}/>
        )
      })

    if (this.state.hover === -1) {
      return generatedSlices
    }

    let hoverSlice = generatedSlices.splice(this.state.hover, 1)
    generatedSlices.push(hoverSlice)

    return generatedSlices
  }

  render () {
    return  (
      <svg viewBox="-1 -1 2 2" style={Styles.svg}>
        <g className="path_group">
          {this.makePaths()}
        </g>
      </svg>
    )
  }
}

PieChart.defaultProps = {
  data: [],
  color: '#ff4500',
  svgDimension: 200,
  top: 5
}

const Styles = {
  svg: {
    transform: 'rotate(-90deg)'
  }
}

export default PieChart