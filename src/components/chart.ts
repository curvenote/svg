import {
  BaseComponent,
  withRuntime,
  html,
  svg,
  css,
  PropertyValues,
  throttle,
  THROTTLE_SKIP,
} from '@curvenote/components';
import { types } from '@curvenote/runtime';
import * as scale from 'd3-scale';
import * as format from 'd3-format';
import * as Selection from 'd3-selection';
import * as d3axis from 'd3-axis';
import { Margin } from './types';

export const SvgChartSpec = {
  name: 'svg-chart',
  description: 'Chart',
  properties: {
    xlabel: { type: types.PropTypes.string, default: 'x' },
    ylabel: { type: types.PropTypes.string, default: 'y' },
    xAxisLocation: {
      type: types.PropTypes.string,
      default: 'bottom',
      attribute: 'x-axis-location',
    },
    yAxisLocation: { type: types.PropTypes.string, default: 'left', attribute: 'y-axis-location' },
    labeled: { type: types.PropTypes.boolean, default: false },
    xlim: { type: types.PropTypes.array, default: [0, 1] },
    ylim: { type: types.PropTypes.array, default: [0, 1] },
    xAxisType: { type: types.PropTypes.string, default: 'linear' },
    yAxisType: { type: types.PropTypes.string, default: 'linear' },
  },
  events: {},
};

const litProps = {
  width: { type: Number, reflect: false },
  height: { type: Number, reflect: false },
};

@withRuntime(SvgChartSpec, litProps)
class SvgChart extends BaseComponent<typeof SvgChartSpec> {
  width = 700;

  height = 400;

  #initialized = false;

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.#initialized = true;
    // Now setup the children
    setTimeout(() => this.requestUpdate(), 100);
    // Now setup the event handlers
    setTimeout(() => this.attachCallbacks(), 200);

    // Add a resize handler
    window.addEventListener(
      'resize',
      throttle(() => {
        this.requestUpdate();
      }, THROTTLE_SKIP),
    );
  }

  private get dimensions(): { outerWidth: number; outerHeight: number } {
    if (this.#initialized) {
      const { offsetWidth } = this.shadowRoot?.children[0] as HTMLDivElement;
      const aspect = this.width / this.height;
      const outerWidth = Math.min(this.width, offsetWidth);
      const outerHeight = outerWidth / aspect;
      return { outerWidth, outerHeight };
    }
    return { outerWidth: this.width, outerHeight: this.height };
  }

  get margin(): Margin {
    const { outerWidth, outerHeight } = this.dimensions;
    const top = 20;
    const right = 20;
    const bottom = 40;
    const left = 50;
    const width = outerWidth - left - right;
    const height = outerHeight - top - bottom;
    return {
      top,
      right,
      bottom,
      left,
      width,
      height,
      outerWidth,
      outerHeight,
    };
  }

  
  x: scale.ScaleLinear<number, number> = scale.scaleLinear();

  y: scale.ScaleLinear<number, number> = scale.scaleLinear();

  updateDomainAndRange(margin: Required<Margin>) {
    const { xlim, ylim, xAxisType, yAxisType } = this.$runtime!.state;

    if(xAxisType=="log") {
      this.x = scale.scaleLog().range([0, margin.width]).domain(xlim);
    } else {
      this.x = scale.scaleLinear().range([0, margin.width]).domain(xlim);
    }

    if(yAxisType=="log") {
      this.y = scale.scaleLog().range([margin.height, 0]).domain(ylim);;
    } else {
      this.y = scale.scaleLinear().range([margin.height, 0]).domain(ylim);
    }

  }

  renderXAxis(margin: Margin) {
    const { xAxisLocation, xlabel } = this.$runtime!.state;

    if (xAxisLocation === 'hidden') {
      return;
    }

    const numberOfTicks = 6 // always have 6 ticks on x axis

    const xAxis = d3axis.axisBottom(this.x).ticks(numberOfTicks, ",.1f");

    const gXAxis = Selection.select(this.shadowRoot!.querySelector('.x.axis') as SVGSVGElement);
    gXAxis.html(null);
    gXAxis
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${xAxisLocation === 'bottom' ? margin.height : this.y(0)})`)
      .call(xAxis);

    const label = gXAxis
      .append('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#333')
      .text(xlabel);
    if (xAxisLocation === 'bottom') {
      label.attr('dy', 30).attr('x', margin.width / 2);
    } else {
      label.attr('dy', -5).attr('x', margin.width).style('text-anchor', 'end');
    }
  }

  renderYAxis(margin: Margin) {
    const { yAxisLocation, ylabel, ylim, yAxisType } = this.$runtime!.state;
    if (yAxisLocation === 'hidden') {
      return;
    }

    var numberOfTicks
    if(yAxisType=="log"){
      numberOfTicks = Math.log10(ylim[1]/ylim[0])
    } else {
      numberOfTicks = "10"
    }

    const yAxis = d3axis.axisLeft(this.y).ticks(numberOfTicks, ",.3f");

    // const yAxis = d3axis.axisLeft(this.y);

    const gYAxis = Selection.select(this.shadowRoot!.querySelector('.y.axis') as SVGSVGElement);
    gYAxis.html(null);
    gYAxis
      .attr('class', 'y axis')
      .attr('transform', `translate(${yAxisLocation === 'left' ? 0 : this.x(0)}, 0)`)
      .call(yAxis);
    const label = gYAxis
      .append('text')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .attr('fill', '#333')
      .text(ylabel);

    if (yAxisLocation === 'left') {
      label.attr('dy', -35).attr('x', -margin.height / 2);
    } else {
      label.attr('dy', 15).attr('x', 0).style('text-anchor', 'end');
    }
  }

  attachCallbacks() {
    Array.from(this.children).forEach((child) => {
      const chartObj = child as Element & { callback: (chart: Element) => void };
      chartObj.callback?.(this);
    });
  }

  render() {
    const { margin } = this;

    if (this.#initialized) {
      this.updateDomainAndRange(margin);
      this.renderXAxis(margin);
      this.renderYAxis(margin);
      requestAnimationFrame(() => this.attachCallbacks());
    }

    const children = Array.from(this.children).map((child) => {
      const chartObj = child as Element & { renderSVG: (chart: Element) => typeof svg };
      if (this.#initialized && chartObj.renderSVG !== undefined) {
        return chartObj.renderSVG(this);
      }
      return svg``;
    });

    return html`
      <div>
        <svg width="${margin.outerWidth}" height="${margin.outerHeight}">
          <g transform="translate(${margin.left},${margin.top})">
            <clipPath id="clip">
              <rect
                id="clip-rect"
                x="0"
                y="0"
                width="${margin.width}"
                height="${margin.height}"
              ></rect>
            </clipPath>
            <g class="x axis"></g>
            <g class="y axis"></g>
            <g clip-path="url(#clip)">${children}</g>
          </g>
        </svg>
      </div>
    `;
  }

  static get styles() {
    return css`
      div {
        text-align: center;
      }
      svg {
        font: 11px sans-serif;
      }
      .axis path,
      .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
      }
      .x.axis path {
        /*display: none;*/
      }
      .figure svg,
      .figure div {
        position: relative;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .drag {
        cursor: move;
      }
    `;
  }
}

export default SvgChart;
