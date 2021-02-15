import { BaseComponent, withRuntime, svg } from '@curvenote/components';
import { types } from '@curvenote/runtime';
import * as shape from 'd3-shape';
import Chart from './chart';
import { nextColor } from './utils';

export const SvgPathSpec = {
  name: 'svg-path',
  description: 'SVG Path',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    data: { type: types.PropTypes.array, default: [[0, 0]] },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5, attribute: 'stroke-width' },
    strokeDasharray: { type: types.PropTypes.string, default: null, attribute: 'stroke-dasharray' },
    curve: { type: types.PropTypes.string, default: 'linear' },
    closed: { type: types.PropTypes.boolean, default: false },
  },
  events: {
    hover: { args: ['enter'] },
  },
};

const litProps = {};

@withRuntime(SvgPathSpec, litProps)
class SvgPath extends BaseComponent<typeof SvgPathSpec> {
  #chart?: Chart;

  requestRuntimeUpdate() { this.#chart?.requestUpdate(); }

  constructor() {
    super();
    if (this.getAttribute('stroke')) return;
    this.setAttribute('stroke', nextColor());
  }

  renderSVG(chart: Chart) {
    this.#chart = chart;
    const {
      visible, stroke, strokeWidth, strokeDasharray, data, curve, closed,
    } = this.$runtime!.state;
    if (!visible) return svg``;

    const path = shape.line()
      .defined((d: number[]) => (
        (Number.isFinite(d[0]) && Number.isFinite(d[1]))
        && !(d[0] == null || d[1] == null)
      ))
      .x((d: number[]) => chart.x(d[0]))
      .y((d: number[]) => chart.y(d[1]));
    switch (curve) {
      case 'linear':
        path.curve(!closed ? shape.curveLinear : shape.curveLinearClosed);
        break;
      case 'basis':
        path.curve(!closed ? shape.curveBasis : shape.curveBasisClosed);
        break;
      default:
        break;
    }

    // wrap the function handler, as it is called from the r-svg-chart context
    function wrapper(node: SvgPath, enter: boolean) { return () => node.$runtime?.dispatchEvent('hover', [enter]); }

    return svg`<path class="line" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" d="${path(data as [number, number][])}" @mouseenter=${wrapper(this, true)} @mouseleave=${wrapper(this, false)}></path>`;
  }
}

export default SvgPath;
