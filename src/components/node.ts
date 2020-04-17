import {
  BaseComponent, withInk, svg, THROTTLE_SKIP,
} from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import * as Selection from 'd3-selection';
import * as Drag from 'd3-drag';
import { throttle } from 'underscore';
import InkChart from './chart';
import { nextColor } from './utils';

const CURSOR_MOVE_CLASS = 'ink-drag-move';

export const InkChartNodeSpec = {
  name: 'chart-node',
  description: 'Chart node',
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
    strokeWidth: { type: types.PropTypes.number, default: 1.5 },
    strokeDasharray: { type: types.PropTypes.string, default: null },
  },
  events: {
    drag: { args: ['x', 'y'] },
  },
};

const litProps = {};

@withInk(InkChartNodeSpec, litProps)
class InkChartNode extends BaseComponent<typeof InkChartNodeSpec> {
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
      visible, constrain, r, fill, x, y, stroke, strokeWidth, strokeDasharray,
    } = this.ink!.state;
    if (!visible) return svg``;

    // wrap the function handler, as it is called from the ink-chart context
    function wrapper(node: InkChartNode) { return (e: Event) => node.setupDrag(e); }

    const constrainFunc = this.ink!.component?.properties.constrain.func ?? '';
    const [xVal, yVal] = (constrainFunc !== '' ? constrain : [x, y]) as number[];

    return svg`<circle class="drag" r="${r}" fill="${fill}" cx="${chart.x(xVal)}" cy="${chart.y(yVal)}" @mouseover=${wrapper(this)} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}"></circle>`;
  }

  private setupDrag(event: Event) {
    // Lazy setup the drag events; this is only called once
    const rawNode = event.target as Element & {inkDrag: boolean};
    if (rawNode.inkDrag) return;

    const bodyClassList = document.getElementsByTagName('BODY')[0].classList;
    const node = Selection.select(rawNode as Element);

    const throttled = throttle(
      (x: number, y: number) => this.ink?.dispatchEvent('drag', [x, y]),
      THROTTLE_SKIP / 3,
    );

    const drag = Drag.drag().on('start', () => {
      Selection.event.sourceEvent.preventDefault();
      bodyClassList.add(CURSOR_MOVE_CLASS);
    }).on('drag', () => {
      Selection.event.sourceEvent.preventDefault();
      const x = this.#chart!.x.invert(Selection.event.x);
      const y = this.#chart!.y.invert(Selection.event.y);
      throttled(x, y);
    }).on('end', () => {
      bodyClassList.remove(CURSOR_MOVE_CLASS);
    });
    node.call(drag);
    // Remember to mark the rawNode
    rawNode.inkDrag = true;
  }
}

export default InkChartNode;
