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

    // wrap the function handler, as it is called from the r-svg-chart context
    function wrapper(node: SvgNode) { return (e: Event) => node.setupDrag(e); }

    const constrainFunc = this.$runtime!.component?.properties.constrain.func ?? '';
    const [xVal, yVal] = (constrainFunc !== '' ? constrain : [x, y]) as number[];

    return svg`<circle class="drag" r="${r}" fill="${fill}" cx="${chart.x(xVal)}" cy="${chart.y(yVal)}" @mouseover=${wrapper(this)} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}"></circle>`;
  }

  private setupDrag(event: Event) {
    // Lazy setup the drag events; this is only called once
    const rawNode = event.target as Element & {hasDragHandler: boolean};
    if (rawNode.hasDragHandler) return;

    const bodyClassList = document.getElementsByTagName('BODY')[0].classList;
    const node = Selection.select(rawNode as Element);

    const throttled = throttle(
      (x: number, y: number) => this.$runtime?.dispatchEvent('drag', [x, y]),
      THROTTLE_SKIP / 3,
    );

    const drag = Drag.drag().on('start', () => {
      Selection.event.sourceEvent.preventDefault();
      bodyClassList.add(CURSOR_MOVE_CLASS);
      this.$runtime?.dispatchEvent('dragging', [true]);
    }).on('drag', () => {
      Selection.event.sourceEvent.preventDefault();
      const x = this.#chart!.x.invert(Selection.event.x);
      const y = this.#chart!.y.invert(Selection.event.y);
      throttled(x, y);
    }).on('end', () => {
      bodyClassList.remove(CURSOR_MOVE_CLASS);
      this.$runtime?.dispatchEvent('dragging', [false]);
    });
    node.call(drag);
    // Remember to mark the rawNode
    rawNode.hasDragHandler = true;
  }
}

export default SvgNode;
