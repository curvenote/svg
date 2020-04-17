import { BaseComponent, withInk, svg } from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import InkChart from './chart';

export const InkChartImageSpec = {
  name: 'chart-image',
  description: 'Chart',
  properties: {
    visible: { type: types.PropTypes.boolean, default: true },
    x: { type: types.PropTypes.number, default: 0 },
    y: { type: types.PropTypes.number, default: 1 },
    width: { type: types.PropTypes.number, default: 1 },
    height: { type: types.PropTypes.number, default: 1 },
    href: { type: types.PropTypes.string, default: '' },
  },
  events: {},
};

const litProps = {};

@withInk(InkChartImageSpec, litProps)
class InkChartImage extends BaseComponent<typeof InkChartImageSpec> {
  #chart?: InkChart;

  requestInkUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: InkChart) {
    this.#chart = chart;
    const {
      visible, x, y, width, height, href,
    } = this.ink!.state;
    if (!visible) return svg``;
    const widthValue = chart.x(width) - chart.x(0);
    const heightValue = chart.y(0) - chart.y(height);
    const xValue = chart.x(x);
    const yValue = chart.y(y) - heightValue;
    return svg`<image x="${xValue}" y="${yValue}" width="${widthValue}" height="${heightValue}" href="${href}" preserveAspectRatio="none"></image>`;
  }
}

export default InkChartImage;
