import {
  BaseComponent, withInk, html, svg, PropertyValues,
} from '@iooxa/ink-basic';
import { types } from '@iooxa/runtime';
import { css } from 'lit-element';
import * as scale from 'd3-scale';
import * as Selection from 'd3-selection';
import * as d3axis from 'd3-axis';
import { Margin } from './types';


export const InkChartSpec = {
  name: 'chart',
  description: 'Chart',
  properties: {
    xlabel: { type: types.PropTypes.string, default: 'x' },
    ylabel: { type: types.PropTypes.string, default: 'y' },
    xAxisLocation: { type: types.PropTypes.string, default: 'bottom' },
    yAxisLocation: { type: types.PropTypes.string, default: 'left' },
    labeled: { type: types.PropTypes.boolean, default: false },
    xlim: { type: types.PropTypes.array, default: [0, 1] },
    ylim: { type: types.PropTypes.array, default: [0, 1] },
  },
  events: {},
};


const litProps = {
  width: { type: Number, reflect: false },
  height: { type: Number, reflect: false },
};


@withInk(InkChartSpec, litProps)
class InkChart extends BaseComponent<typeof InkChartSpec> {
  width = 700;

  height = 400;

  #initialized = false;

  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this.#initialized = true;
    setTimeout(() => this.requestUpdate(), 100);
  }

  get margin(): Margin {
    const top = 20;
    const right = 20;
    const bottom = 40;
    const left = 50;
    const width = this.width - left - right;
    const height = this.height - top - bottom;
    return {
      top, right, bottom, left, width, height,
    };
  }

  x: scale.ScaleLinear<number, number> = scale.scaleLinear();

  y: scale.ScaleLinear<number, number> = scale.scaleLinear();

  updateDomainAndRange(margin: Required<Margin>) {
    const { xlim, ylim } = this.ink!.state;

    this.x = scale.scaleLinear()
      .range([0, margin.width])
      .domain(xlim);

    this.y = scale.scaleLinear()
      .range([margin.height, 0])
      .domain(ylim);
  }

  renderXAxis(margin: Margin) {
    const { xAxisLocation, xlabel } = this.ink!.state;

    if (xAxisLocation === 'hidden') {
      return;
    }
    const xAxis = d3axis.axisBottom(this.x);

    const gXAxis = Selection.select(this.shadowRoot!.querySelector('.x.axis') as SVGSVGElement);
    gXAxis.html(null);
    gXAxis
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${(xAxisLocation === 'bottom') ? margin.height : this.y(0)})`)
      .call(xAxis);

    const label = gXAxis.append('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#333')
      .text(xlabel);
    if (xAxisLocation === 'bottom') {
      label.attr('dy', 30).attr('x', margin.width / 2);
    } else {
      label.attr('dy', -5).attr('x', margin.width)
        .style('text-anchor', 'end');
    }
  }

  renderYAxis(margin: Margin) {
    const { yAxisLocation, ylabel } = this.ink!.state;
    if (yAxisLocation === 'hidden') {
      return;
    }

    const yAxis = d3axis.axisLeft(this.y);

    const gYAxis = Selection.select(this.shadowRoot!.querySelector('.y.axis') as SVGSVGElement);
    gYAxis.html(null);
    gYAxis
      .attr('class', 'y axis')
      .attr('transform', `translate(${(yAxisLocation === 'left') ? 0 : this.x(0)}, 0)`)
      .call(yAxis);
    const label = gYAxis.append('text')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .attr('fill', '#333')
      .text(ylabel);

    if (yAxisLocation === 'left') {
      label.attr('dy', -35).attr('x', -margin.height / 2);
    } else {
      label.attr('dy', 15).attr('x', 0)
        .style('text-anchor', 'end');
    }
  }

  render() {
    const { margin } = this;

    if (this.#initialized) {
      this.updateDomainAndRange(margin);
      this.renderXAxis(margin);
      this.renderYAxis(margin);
    }

    const children = Array.from(this.children).map((child) => {
      const chartObj = child as Element & { renderSVG: (chart: Element) => svg };
      if (this.#initialized && (chartObj.renderSVG !== undefined)) {
        return chartObj.renderSVG(this);
      }
      return svg``;
    });

    return html`
      <div>
        <svg width="${this.width}" height="${this.height}">
          <g transform="translate(${margin.left},${margin.top})">
            <clipPath id="clip"><rect id="clip-rect" x="0" y="0" width="${margin.width}" height="${margin.height}"></rect></clipPath>
            <g class="x axis"></g>
            <g class="y axis"></g>
            <g clip-path="url(#clip)">
              ${children}
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  static get styles() {
    return css`
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
      .figure svg, .figure div{
        position: relative;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .drag{
        cursor: move;
      }
    `;
  }
}

export default InkChart;
