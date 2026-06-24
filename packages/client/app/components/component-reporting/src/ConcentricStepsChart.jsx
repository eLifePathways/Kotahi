/* eslint-disable react/prop-types */

import {
  RadialBarChart,
  RadialBar,
  useChartWidth,
  useChartHeight,
  ZIndexLayer,
  DefaultZIndexes,
} from 'recharts'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Container = styled.div`
  height: 250px;
  width: 300px;
`

// Renders text labels for each bar using recharts v3 hooks for dimensions.
// In recharts v3, Customized no longer injects chart props — components
// rendered as direct children of a chart can use hooks to read chart state.
const RadialBarLabels = ({ data, labelColors }) => {
  const width = useChartWidth()
  const height = useChartHeight()

  if (!data || width <= 0 || height <= 0) return null

  // recharts default polar chart margin is 5px on each side
  const MARGIN = 5
  const maxRadius = Math.min(width - 2 * MARGIN, height - 2 * MARGIN) / 2
  // These match the chart props: cx="50%", cy="50%", innerRadius="20%", outerRadius="100%"
  const cx = width / 2
  const cy = height / 2
  const innerRadius = 0.2 * maxRadius
  const outerRadius = maxRadius

  const bandSize =
    data.length > 0 ? (outerRadius - innerRadius) / data.length : 0
  const stepY = bandSize
  const fontSize = Math.min(Math.max(stepY * 0.9, 7), 18)
  // baseX: just left of center so textAnchor="end" clears the start-of-arc area
  const baseX = cx - MARGIN
  // baseY: cy + innerEdge + half band = bottom-arc y of band center for bar 0
  const baseY = cy + innerRadius + 0.5 * bandSize + fontSize / 4

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label}>
      <g>
        {data.map((datum, index) => (
          <text
            fill="none"
            key={`lblOutline-${datum.name}`}
            stroke="white"
            strokeLinejoin="bevel"
            strokeOpacity={0.5}
            strokeWidth={3}
            style={{ fontSize: `${fontSize}px` }}
            textAnchor="end"
            x={baseX}
            y={baseY + index * stepY}
          >
            {datum.name}
          </text>
        ))}
        {data.map((datum, index) => (
          <text
            fill={labelColors[index]}
            key={`lbl-${datum.name}`}
            style={{ fontSize: `${fontSize}px` }}
            textAnchor="end"
            x={baseX}
            y={baseY + index * stepY}
          >
            {datum.name}
          </text>
        ))}
      </g>
    </ZIndexLayer>
  )
}

const ConcentricStepsChart = ({ data, barColors, labelColors }) => {
  const chartData = data.map((d, i) => ({ ...d, fill: barColors[i] }))

  return (
    <Container>
      <RadialBarChart
        barSize={14}
        cx="50%"
        cy="50%"
        data={chartData}
        endAngle={270}
        height={250}
        innerRadius="20%"
        outerRadius="100%"
        startAngle={-90}
        width={300}
      >
        <RadialBar
          background={{ fill: '#eee' }}
          dataKey="value"
          label={{ position: 'insideStart', fill: '#fff', fontSize: '13px' }}
          minAngle={15}
        />
        <RadialBarLabels data={chartData} labelColors={labelColors} />
      </RadialBarChart>
    </Container>
  )
}

ConcentricStepsChart.propTypes = {
  /** Bar names and sizes */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  /** Any valid CSS colour specifications */
  barColors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  /** Any valid CSS colour specifications */
  labelColors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
}

export default ConcentricStepsChart
