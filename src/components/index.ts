import { actions, provider } from '@iooxa/runtime';
import InkChart from './chart';
import InkChartText from './text';
import InkChartPath from './path';
import InkChartCircle from './circle';
import InkChartNode from './node';
import InkChartImage from './image';


function registerComponent(name: string, component: any) {
  if (component.spec) {
    provider.dispatch(actions.createSpec(
      component.spec!.name,
      component.spec!.properties,
      component.spec!.events,
    ));
  }
  customElements.define(name, component);
}

export const register = () => {
  registerComponent('ink-chart', InkChart);
  registerComponent('ink-chart-text', InkChartText);
  registerComponent('ink-chart-path', InkChartPath);
  registerComponent('ink-chart-circle', InkChartCircle);
  registerComponent('ink-chart-image', InkChartImage);
  registerComponent('ink-chart-node', InkChartNode);
};

export {
  InkChart,
  InkChartText,
  InkChartPath,
  InkChartCircle,
  InkChartImage,
  InkChartNode,
};
