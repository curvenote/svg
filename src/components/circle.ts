import { types } from '@curvenote/runtime';
import { BaseComponent, withRuntime, svg } from '@curvenote/components';
import Chart from './chart';
import { nextColor } from './utils';

export const SvgCircleSpec = {
  name: 'svg-circle',
  description: 'SVG circle',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0.5 },
    y: { type: types.PropTypes.number, default: 0.5 },
    r: { type: types.PropTypes.number, default: 4.5 },
    fill: { type: types.PropTypes.string, default: 'none' },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5, attribute: 'stroke-width' },
    strokeDasharray: { type: types.PropTypes.string, default: null, attribute: 'stroke-dasharray' },
  },
  events: {},
};

const litProps = {};

@withRuntime(SvgCircleSpec, litProps)
class SvgCircle extends BaseComponent<typeof SvgCircleSpec> {
  #chart?: Chart;

  constructor() {
    super();
    if (this.getAttribute('fill')) return;
    this.setAttribute('fill', nextColor());
  }

  requestRuntimeUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: Chart) {
    this.#chart = chart;
    const {
      visible, r, fill, x, y, stroke, strokeWidth, strokeDasharray,
    } = this.$runtime!.state;
    if (!visible) return svg``;
    return svg`<circle r="${r}" fill="${fill}" cx="${chart.x(x)}" cy="${chart.y(y)}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}"></circle>`;
  }
}

export default SvgCircle;
