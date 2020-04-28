import { BaseComponent, withRuntime, svg } from '@iooxa/components';
import { types } from '@iooxa/runtime';
import Chart from './chart';

export const SvgImageSpec = {
  name: 'svg-image',
  description: 'Image',
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

@withRuntime(SvgImageSpec, litProps)
class SvgImage extends BaseComponent<typeof SvgImageSpec> {
  #chart?: Chart;

  requestRuntimeUpdate() { this.#chart?.requestUpdate(); }

  renderSVG(chart: Chart) {
    this.#chart = chart;
    const {
      visible, x, y, width, height, href,
    } = this.$runtime!.state;
    if (!visible) return svg``;
    const widthValue = chart.x(width) - chart.x(0);
    const heightValue = chart.y(0) - chart.y(height);
    const xValue = chart.x(x);
    const yValue = chart.y(y) - heightValue;
    return svg`<image x="${xValue}" y="${yValue}" width="${widthValue}" height="${heightValue}" href="${href}" preserveAspectRatio="none"></image>`;
  }
}

export default SvgImage;
