import { BaseComponent, withInk, svg } from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import * as shape from 'd3-shape';
import InkChart from './chart';
import { nextColor } from './utils';

export const InkChartPathSpec = {
  name: 'chart-path',
  description: 'Chart',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    data: { type: types.PropTypes.array, default: [[0, 0]] },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5 },
    strokeDasharray: { type: types.PropTypes.string, default: null },
  },
  events: {},
};

const litProps = {};

@withInk(InkChartPathSpec, litProps)
class InkChartPath extends BaseComponent<typeof InkChartPathSpec> {
  #chart?: InkChart;

  requestInkUpdate() { this.#chart?.requestUpdate(); }

  constructor() {
    super();
    if (this.getAttribute('stroke')) return;
    this.setAttribute('stroke', nextColor());
  }

  renderSVG(chart: InkChart) {
    this.#chart = chart;
    const {
      visible, stroke, strokeWidth, strokeDasharray, data,
    } = this.ink!.state;
    if (!visible) return svg``;

    const path = shape.line()
      .defined((d: number[]) => (
        (Number.isFinite(d[0]) && Number.isFinite(d[1]))
        && !(d[0] == null || d[1] == null)
      ))
      .x((d: number[]) => chart.x(d[0]))
      .y((d: number[]) => chart.y(d[1]));

    return svg`<path class="line" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" d="${path(data as [number, number][])}"></path>`;
  }
}

export default InkChartPath;
