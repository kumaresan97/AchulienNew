import * as React from "react";
import type { IAnnouncementProps } from "./IAnnouncementProps";
import { sp } from "@pnp/sp/presets/all";
import MainComponent from "./MainComponent";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import AnnouncementView from "./PocAnnounce";

export default class Announcement extends React.Component<
  IAnnouncementProps,
  {}
> {
  constructor(prop: IAnnouncementProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IAnnouncementProps> {
    return (
      <Router>
        <Routes>
          <Route path={`/id/:id`} element={<AnnouncementView />} />
          <Route
            // path="/sites/IntranetDev/_layouts/15/workbench.aspx/#/"
            index
            element={<MainComponent context={this.props.context} />}
          />
        </Routes>
      </Router>
    );
    // return <MainComponent context={this.props.context} />;
  }
}
