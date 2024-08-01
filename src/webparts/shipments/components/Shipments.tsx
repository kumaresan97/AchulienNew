import * as React from "react";
import type { IShipmentsProps } from "./IShipmentsProps";
import Maincomponent from "./Maincomponent";
import { sp } from "@pnp/sp/presets/all";

export default class Shipments extends React.Component<IShipmentsProps, {}> {
  constructor(prop: IShipmentsProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IShipmentsProps> {
    return <Maincomponent context={this.props.context} />;
  }
}
