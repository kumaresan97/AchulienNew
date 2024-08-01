import * as React from "react";
import type { ICarouselProps } from "./ICarouselProps";
import { sp } from "@pnp/sp/presets/all";
import MainComponent from "./MainComponent";

export default class Carousel extends React.Component<ICarouselProps, {}> {
  constructor(prop: ICarouselProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    // graph.setup({
    //   spfxContext: this.props.context,
    // });
  }

  public render(): React.ReactElement<ICarouselProps> {
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName,
    // } = this.props;

    return <MainComponent context={this.props.context} />;
  }
}
