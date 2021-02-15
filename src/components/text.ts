import { BaseComponent, withRuntime, svg } from '@curvenote/components';
import { types } from '@curvenote/runtime';
import Chart from './chart';

export const SvgTextSpec = {
  name: 'svg-text',
  description: 'SVG Text',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0.5 },
    y: { type: types.PropTypes.number, default: 0.5 },
    text: { type: types.PropTypes.string, default: 'text' },
    fill: { type: types.PropTypes.string, default: '' },
    textAnchor: { type: types.PropTypes.string, default: 'start', attribute: 'text-anchor' },
    fontSize: { type: types.PropTypes.number, default: 11, attribute: 'font-size' },
    rotate: { type: types.PropTypes.number, default: 0 },
  },
  events: {},
};

const litProps = {};

@withRuntime(SvgTextSpec, litProps)
class SvgText extends BaseComponent<typeof SvgTextSpec> {
  #chart?: Chart;

  requestRuntimeUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: Chart) {
    this.#chart = chart;
    const {
      visible, x, y, text, rotate, textAnchor, fontSize, fill,
    } = this.$runtime!.state;
    if (!visible) return svg``;
    const xValue = chart.x(x);
    const yValue = chart.y(y);
    return svg`<text x="${xValue}" y="${yValue}" transform="rotate(${rotate}, ${xValue}, ${yValue})" style="text-anchor: ${textAnchor}; font: ${fontSize}px sans-serif;" fill="${fill}">${text}</text>`;
  }
}

export default SvgText;
