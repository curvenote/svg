# @iooxa/svg

[![Ink-Basic on npm](https://img.shields.io/npm/v/@iooxa/svg.svg)](https://www.npmjs.com/package/@iooxa/svg)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/iooxa/svg/blob/master/LICENSE)

The goal of `@iooxa/svg` is to provide web-components for interactive scientific writing, reactive documents and [explorable explanations](https://explorabl.es). This library provides basic charting and diagram capabilities through basic, reactive SVG graphics.

## Getting Started

Ink is based on web-components, which creates custom HTML tags so that they can make writing documents easier.
To get started, copy the built javascript file to the head of your page:

```html
<script src="https://unpkg.com/@iooxa/svg"></script>
```

You can also download the [latest release](https://github.com/iooxa/svg/releases) from GitHub. If you are running this without a web server, ensure the script has `charset="utf-8"` in the script tag. You can also [install from npm](https://www.npmjs.com/package/@iooxa/svg):

```bash
>> npm install @iooxa/svg
```

You should then be able to extend the package as you see fit:

```javascript
import components from '@iooxa/svg';
```

Note that the npm module does not setup the [@iooxa/runtime](https://github.com/iooxa/runtime) store, nor does it register the components. See the [iooxa.ts](/iooxa.ts) file for what the built package does to `setup` the store and `register` the components.

## Basic Components

* r-svg-chart
* r-svg-text
* r-svg-path
* r-svg-eqn
* r-svg-circle
* r-svg-image
* r-svg-node
