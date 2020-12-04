import {
  BaseComponent, withRuntime, svg, throttle, THROTTLE_SKIP,
} from '@iooxa/components';
import { types } from '@iooxa/runtime';
import * as Selection from 'd3-selection';
import * as Drag from 'd3-drag';
import Chart from './chart';
import { nextColor } from './utils';

const CURSOR_MOVE_CLASS = 'cursor-move';

export const SvgNodeSpec = {
  name: 'svg-node',
  description: 'SVG node',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0.5 },
    y: { type: types.PropTypes.number, default: 0.5 },
    constrain: {
      type: types.PropTypes.array, default: '', has: { func: true, value: false }, args: ['x', 'y'],
    },
    r: { type: types.PropTypes.number, default: 5 },
    fill: { type: types.PropTypes.string, default: 'none' },
    stroke: { type: types.PropTypes.string, default: '' },
    strokeWidth: { type: types.PropTypes.number, default: 1.5, attribute: 'stroke-width' },
    strokeDasharray: { type: types.PropTypes.string, default: null, attribute: 'stroke-dasharray' },
  },
  events: {
    drag: { args: ['x', 'y'] },
    dragging: { args: ['value'] },
  },
};

const litProps = {};

@withRuntime(SvgNodeSpec, litProps)
class SvgNode extends BaseComponent<typeof SvgNodeSpec> {
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
      visible, constrain, r, fill, x, y, stroke, strokeWidth, strokeDasharray,
    } = this.$runtime!.state;
    if (!visible) return svg``;

    const constrainFunc = this.$runtime!.component?.properties.constrain.func ?? '';
    const [xVal, yVal] = (constrainFunc !== '' ? constrain : [x, y]) as number[];

    return svg`
    <circle r="${r}" fill="${fill}" cx="${chart.x(xVal)}" cy="${chart.y(yVal)}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}"></circle>
    <circle id=${this.$runtime!.id} class="drag" r="20" fill="#aaaaaa33" cx="${chart.x(xVal)}" cy="${chart.y(yVal)}"></circle>`;
  }

  callback(chart: Chart) {
    // Lazy setup the drag events; this is only called once
    const rawNode = chart.shadowRoot
      ?.getElementById(this.$runtime!.id) as (HTMLElement & {hasDragHandler: boolean}) | null;

    if (rawNode == null || rawNode.hasDragHandler) return;

    const bodyClassList = document.getElementsByTagName('BODY')[0].classList;
    const node = Selection.select(rawNode as Element);

    const throttled = throttle(
      (x: number, y: number) => this.$runtime?.dispatchEvent('drag', [x, y]),
      THROTTLE_SKIP / 3,
    );

    const drag = Drag.drag().on('start', () => {
      bodyClassList.add(CURSOR_MOVE_CLASS);
      this.$runtime?.dispatchEvent('dragging', [true]);
      // This prevents scrolling, by hiding the overflow
      // Important on touch:
      document.documentElement.style.overflow = 'hidden';
    }).on('drag', (event) => {
      const x = this.#chart!.x.invert(event.x);
      const y = this.#chart!.y.invert(event.y);
      throttled(x, y);
    }).on('end', () => {
      document.documentElement.style.overflow = '';
      bodyClassList.remove(CURSOR_MOVE_CLASS);
      this.$runtime?.dispatchEvent('dragging', [false]);
    });
    node.call(drag);
    // Remember to mark the rawNode
    rawNode.hasDragHandler = true;
  }
}

export default SvgNode;
