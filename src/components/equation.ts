import { BaseComponent, withRuntime, svg } from '@curvenote/components';
import { types, actions, provider, selectors, DEFAULT_SCOPE } from '@curvenote/runtime';
import * as shape from 'd3-shape';
import * as array from 'd3-array';
import Chart from './chart';
import { nextColor } from './utils';

export const ChartEqnSpec = {
  name: 'svg-eqn',
  description: 'SVG equations',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    eqn: { type: types.PropTypes.string, default: 'x' },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5, attribute: 'stroke-width' },
    strokeDasharray: { type: types.PropTypes.string, default: null, attribute: 'stroke-dasharray' },
    parameterize: { type: types.PropTypes.string, default: 'x' },
    samples: { type: types.PropTypes.number, default: 500 },
    domain: { type: types.PropTypes.array, default: [-Infinity, Infinity] },
    // Might be a better way to do this.
    // right now the equation is a string, which doesn't change, so need a way to trigger updates.
    listen: { type: types.PropTypes.number, default: '' },
  },
  events: {
    hover: { args: ['enter'] },
  },
};

const litProps = {};

type EqnFunc = ((d: number) => number) | ((d: number) => [number, number]);

function getFunction(
  $runtime: types.ComponentShortcut<any> | null,
  eqn: string,
  args: string[],
): EqnFunc {
  const scopeName = $runtime!.scope ?? DEFAULT_SCOPE;
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

@withRuntime(ChartEqnSpec, litProps)
class ChartEqn extends BaseComponent<typeof ChartEqnSpec> {
  #chart?: Chart;

  constructor() {
    super();
    if (this.getAttribute('stroke')) return;
    this.setAttribute('stroke', nextColor());
  }

  requestRuntimeUpdate() {
    this.#chart?.requestUpdate();
  }

  renderSVG(chart: Chart) {
    this.#chart = chart;
    const { visible, eqn, samples, domain, stroke, strokeWidth, strokeDasharray, parameterize } =
      this.$runtime!.state;
    if (!visible) return svg``;

    let clippedDomain: number[];
    let funcXY: (d: number) => [number, number];
    switch (parameterize.toLocaleLowerCase().trim()) {
      case 'x': {
        const func = getFunction(this.$runtime, eqn, ['x']);
        funcXY = (d: number) => [d, func(d)] as [number, number];
        clippedDomain = clipDomain(domain, chart.$runtime!.state.xlim);
        break;
      }
      case 'y': {
        const func = getFunction(this.$runtime, eqn, ['y']);
        funcXY = (d: number) => [func(d), d] as [number, number];
        clippedDomain = clipDomain(domain, chart.$runtime!.state.ylim);
        break;
      }
      case 't': {
        const func = getFunction(this.$runtime, eqn, ['t']);
        funcXY = (d: number) => func(d) as [number, number];
        clippedDomain = domain;
        break;
      }
      default:
        throw new Error('parameterize must be "x", "y", or "t"');
    }
    const step = (clippedDomain[1] - clippedDomain[0]) / samples;
    const data = array.range(clippedDomain[0], clippedDomain[1], step).map((d) => funcXY(d));

    data.push(funcXY(clippedDomain[1]));

    const path = shape
      .line()
      .defined((d) => Number.isFinite(d[0]) && Number.isFinite(d[1]))
      .x((d) => chart.x(d[0]))
      .y((d) => chart.y(d[1]))(data);

    // wrap the function handler, as it is called from the r-svg-chart context
    function wrapper(node: ChartEqn, enter: boolean) {
      return () => node.$runtime?.dispatchEvent('hover', [enter]);
    }

    return svg`<path class="line" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" d="${path}" @mouseenter=${wrapper(
      this,
      true,
    )} @mouseleave=${wrapper(this, false)}></path>`;
  }
}

export default ChartEqn;
