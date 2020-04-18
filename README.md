# @iooxa/ink-chart

[![Ink-Basic on npm](https://img.shields.io/npm/v/@iooxa/ink-chart.svg)](https://www.npmjs.com/package/@iooxa/ink-chart)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/iooxa/ink-chart/blob/master/LICENSE)

The goal of ink-chart is to provide web-components for interactive scientific writing, reactive documents and [explorable explanations](https://explorabl.es). This library provides basic charting capabilities of [ink-components](https://components.ink) including 2D svg graphics.

## Getting Started

Ink is based on web-components, which creates custom HTML tags so that they can make writing documents easier.
To get started, copy the built javascript file to the head of your page:

```html
<script src="https://unpkg.com/@iooxa/ink-chart"></script>
```

You can also download the [latest release](https://github.com/iooxa/ink-chart/releases) from GitHub. If you are running this without a web server, ensure the script has `charset="utf-8"` in the script tag. You can also [install from npm](https://www.npmjs.com/package/@iooxa/ink-chart):

```bash
>> npm install @iooxa/ink-chart
```

You should then be able to extend ink as you see fit:

```javascript
import components from '@iooxa/ink-chart';
```

Note that the npm module does not setup the [@iooxa/runtime](https://github.com/iooxa/runtime) store, nor does it register the components. See the [ink.ts](/ink.ts) file for what the built package does to `setup` the store and `register` the components.

## Basic Components

* ink-chart
* ink-chart-text
* ink-chart-path
* ink-chart-eqn
* ink-chart-circle
* ink-chart-image
* ink-chart-node
