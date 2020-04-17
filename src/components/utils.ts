import * as d3ScaleChromatic from 'd3-scale-chromatic';

let next = 0;

// eslint-disable-next-line import/prefer-default-export
export function nextColor() {
  next += 1;
  return d3ScaleChromatic.schemeCategory10[next % 10];
}
