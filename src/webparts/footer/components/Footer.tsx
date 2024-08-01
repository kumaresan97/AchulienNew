import * as React from "react";
import type { IFooterProps } from "./IFooterProps";
import Maincomponent from "./MainComponent";

export default class Footer extends React.Component<IFooterProps, {}> {
  public render(): React.ReactElement<IFooterProps> {
    return <Maincomponent />;
  }
}
