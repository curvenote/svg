import { BaseComponent, withInk, svg } from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import InkChart from './chart';

export const InkChartTextSpec = {
  name: 'chart-text',
  description: 'Chart',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0.5 },
    y: { type: types.PropTypes.number, default: 0.5 },
    text: { type: types.PropTypes.string, default: 'text' },
    textAnchor: { type: types.PropTypes.string, default: 'start' },
    fontSize: { type: types.PropTypes.number, default: 11 },
    rotate: { type: types.PropTypes.number, default: 0 },
  },
  events: {},
};

const litProps = {};

@withInk(InkChartTextSpec, litProps)
class InkChartText extends BaseComponent<typeof InkChartTextSpec> {
  #chart?: InkChart;

  requestInkUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: InkChart) {
    this.#chart = chart;
    const {
      visible, x, y, text, rotate, textAnchor, fontSize,
    } = this.ink!.state;
    if (!visible) return svg``;
    const xValue = chart.x(x);
    const yValue = chart.y(y);
    return svg`<text x="${xValue}" y="${yValue}" transform="rotate(${rotate}, ${x}, ${y})" style="text-anchor: ${textAnchor}; font: ${fontSize}px sans-serif;">${text}</text>`;
  }
}

export default InkChartText;
