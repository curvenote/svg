import { types, setup } from '@iooxa/runtime';
import { registerComponent } from '@iooxa/components';
import Chart from './chart';
import Text from './text';
import Path from './path';
import Eqn from './equation';
import Circle from './circle';
import Node from './node';
import Image from './image';


export const register = (store: types.Store) => {
  setup(store);
  registerComponent('r-svg-chart', Chart);
  registerComponent('r-svg-text', Text);
  registerComponent('r-svg-path', Path);
  registerComponent('r-svg-eqn', Eqn);
  registerComponent('r-svg-circle', Circle);
  registerComponent('r-svg-image', Image);
  registerComponent('r-svg-node', Node);
};

export default {
  Chart,
  Text,
  Path,
  Eqn,
  Circle,
  Image,
  Node,
};
