import * as React from "react";
import type { IQuickLinksProps } from "./IQuickLinksProps";
import { sp } from "@pnp/sp/presets/all";
import MainComponent from "./MainComponent";

export default class QuickLinks extends React.Component<IQuickLinksProps, {}> {
  constructor(prop: IQuickLinksProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IQuickLinksProps> {
    return <MainComponent context={this.props.context}></MainComponent>;
  }
}
