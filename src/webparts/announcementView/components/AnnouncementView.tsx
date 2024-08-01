import * as React from "react";
import type { IAnnouncementViewProps } from "./IAnnouncementViewProps";
import { BrowserRouter as Router } from "react-router-dom";

import MainComponent from "./MainComponent";

export default class AnnouncementView extends React.Component<
  IAnnouncementViewProps,
  {}
> {
  public render(): React.ReactElement<IAnnouncementViewProps> {
    return (
      <Router>
        <MainComponent />
      </Router>
    );
  }
}
