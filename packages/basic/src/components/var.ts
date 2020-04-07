import { html } from 'lit-element';
import { actions, types, InkVarSpec } from '@iooxa/ink-store';
import { store } from '../provider';
import { formatter } from '../utils';
import { BaseSubscribe, withInk } from './base';

@withInk(InkVarSpec)
class InkVar extends BaseSubscribe {
  connectedCallback() {
    super.connectedCallback();
    const { scope } = this;
    const name = this.getAttribute('name') as string;
    this.ink = store.dispatch(actions.createVariable(
      `${scope}.${name}`,
      this.getAttribute('value') ?? InkVarSpec.properties.value.default,
      this.getAttribute(':value') ?? '',
      {
        description: this.getAttribute('description') ?? '',
        type: this.getAttribute('type') as types.PropTypes ?? InkVarSpec.properties.type.default,
        format: this.getAttribute('format') ?? InkVarSpec.properties.format.default as types.PropTypes,
      },
    ));
    this.subscribe(this.ink.id);
  }

  render() {
    const {
      name, current, func, format, derived,
    } = this.ink?.state;
    const formatted = formatter(current, format);
    if (derived) {
      return html`<div><code>function ${name}() { return ${func}; }</code> = ${formatted}</div>`;
    }
    return html`<div>${name} = ${formatted}</div>`;
  }
}

export default InkVar;
