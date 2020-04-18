import { BaseComponent, withInk, svg } from '@iooxa/ink-basic';
import {
  types, actions, provider, selectors, DEFAULT_SCOPE,
} from '@iooxa/runtime';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import InkChart from './chart';
import { nextColor } from './utils';

export const InkChartEqnSpec = {
  name: 'chart-eqn',
  description: 'Chart equations',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    eqn: { type: types.PropTypes.string, default: 'x' },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5 },
    strokeDasharray: { type: types.PropTypes.string, default: null },
    parameterize: { type: types.PropTypes.string, default: 'x' },
    samples: { type: types.PropTypes.number, default: 500 },
    domain: { type: types.PropTypes.array, default: [-Infinity, Infinity] },
    // Might be a better way to do this.
    // right now the equation is a string, which doesn't change, so need a way to trigger updates.
    listen: { type: types.PropTypes.number, default: '' },
  },
  events: {},
};

const litProps = {};

type EqnFunc = ((d: number) => number) | ((d: number) => [number, number]);

function getFunction(
  ink: types.ComponentShortcut<any> | null, eqn: string, args: string[],
): EqnFunc {
  const scopeName = ink!.scope ?? DEFAULT_SCOPE;
  const executionState = selectors.getExecutionState(provider.getState());
  const func = actions.getEvaluationFunction(scopeName, eqn, executionState, args);
  return func(executionState, scopeName) as EqnFunc;
}


function clipDomain(domain: number[], clip: number[]) {
  const low = Math.min(...clip);
  const high = Math.max(...clip);
  const out = [domain[0] ?? low, domain[1] ?? high];
  out[0] = Math.max(out[0], low);
  out[1] = Math.min(out[1], high);
  return out;
}

@withInk(InkChartEqnSpec, litProps)
class InkChartEqn extends BaseComponent<typeof InkChartEqnSpec> {
  #chart?: InkChart;

  constructor() {
    super();
    if (this.getAttribute('stroke')) return;
    this.setAttribute('stroke', nextColor());
  }

  requestInkUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: InkChart) {
    this.#chart = chart;
    const {
      visible, eqn, samples, domain, stroke, strokeWidth, strokeDasharray, parameterize,
    } = this.ink!.state;
    if (!visible) return svg``;

    let clippedDomain: number[];
    let funcXY: (d: number)=> [number, number];
    switch (parameterize.toLocaleLowerCase().trim()) {
      case 'x': {
        const func = getFunction(this.ink, eqn, ['x']);
        funcXY = (d: number) => [d, func(d)] as [number, number];
        clippedDomain = clipDomain(domain, chart.ink!.state.xlim);
        break;
      }
      case 'y': {
        const func = getFunction(this.ink, eqn, ['y']);
        funcXY = (d: number) => [func(d), d] as [number, number];
        clippedDomain = clipDomain(domain, chart.ink!.state.ylim);
        break;
      }
      case 't': {
        const func = getFunction(this.ink, eqn, ['t']);
        funcXY = (d: number) => func(d) as [number, number];
        clippedDomain = domain;
        break;
      }
      default:
        throw new Error('parameterize must be "x", "y", or "t"');
    }
    const step = (clippedDomain[1] - clippedDomain[0]) / samples;
    const data = array
      .range(clippedDomain[0] - step, clippedDomain[1] + step, step)
      .map((d) => funcXY(d));

    const path = shape.line()
      .defined((d) => Number.isFinite(d[0]) && Number.isFinite(d[1]))
      .x((d) => chart.x(d[0]))
      .y((d) => chart.y(d[1]))(data);

    return svg`<path class="line" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" d="${path}"></path>`;
  }
}

export default InkChartEqn;
