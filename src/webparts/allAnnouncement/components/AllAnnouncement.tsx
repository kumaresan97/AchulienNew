import * as React from "react";
import type { IAllAnnouncementProps } from "./IAllAnnouncementProps";
import { sp } from "@pnp/sp/presets/all";
import MainComponent from "./MainComponent";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AnnouncementView from "./Announceview";

export default class AllAnnouncement extends React.Component<
  IAllAnnouncementProps,
  {}
> {
  constructor(prop: IAllAnnouncementProps, state: {}) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IAllAnnouncementProps> {
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
    // return (
    // <Router>
    //   <Routes>
    {
      /* <Route
            index
            element={<MainComponent context={this.props.context} />}
          /> */
    }
    {
      /* <Route
            path="/sites/IntranetDev/_layouts/15/workbench.aspx/:id"
            element={<MainComponent context={this.props.context} />}
          /> */
    }
    // </Routes>
    // <MainComponent context={this.props.context} />
    // </Router>
    // );
    // return <MainComponent context={this.props.context} />;
  }
}
