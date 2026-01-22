import * as React from "react";
import type { IAllShipmentsProps } from "./IAllShipmentsProps";
import { sp } from "@pnp/sp/presets/all";
import Maincomponent from "./Maincomponent";

export default class AllShipments extends React.Component<
  IAllShipmentsProps,
  {}
> {
  constructor(prop: IAllShipmentsProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }

  public render(): React.ReactElement<IAllShipmentsProps> {
    return <Maincomponent context={this.props.context} />;
  }
}
