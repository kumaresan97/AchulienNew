import * as React from "react";
import type { IFaqProps } from "./IFaqProps";
import MainComponent from "./MainComponent";
import { sp } from "@pnp/sp/presets/all";

export default class Faq extends React.Component<IFaqProps, {}> {
  constructor(prop: IFaqProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }

  public render(): React.ReactElement<IFaqProps> {
    return <MainComponent context={this.props.context} />;
  }
}
