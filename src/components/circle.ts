import { BaseComponent, withInk, svg } from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import InkChart from './chart';
import { nextColor } from './utils';

export const InkChartCircleSpec = {
  name: 'chart-circle',
  description: 'Chart circle',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0.5 },
    y: { type: types.PropTypes.number, default: 0.5 },
    r: { type: types.PropTypes.number, default: 4.5 },
    fill: { type: types.PropTypes.string, default: 'none' },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5 },
    strokeDasharray: { type: types.PropTypes.string, default: null },
  },
  events: {},
};

const litProps = {};

@withInk(InkChartCircleSpec, litProps)
class InkChartCircle extends BaseComponent<typeof InkChartCircleSpec> {
  #chart?: InkChart;

  constructor() {
    super();
    if (this.getAttribute('fill')) return;
    this.setAttribute('fill', nextColor());
  }

  requestInkUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: InkChart) {
    this.#chart = chart;
    const {
      visible, r, fill, x, y, stroke, strokeWidth, strokeDasharray,
    } = this.ink!.state;
    if (!visible) return svg``;
    return svg`<circle r="${r}" fill="${fill}" cx="${chart.x(x)}" cy="${chart.y(y)}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}"></circle>`;
  }
}

export default InkChartCircle;
