/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sp } from "@pnp/sp/presets/all";
import * as React from "react";
// import "./Style.css";
import styles from "./Announcement.module.scss";
import { useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Config } from "../../Global/Config";
import "../../Global/Style.css";
// import { Dialog } from "primereact/dialog";
// import AnnouncementView from "./AnnouncementView";
import { isCurrentUserIsadmin } from "../../Global/Admin";
import { useNavigate } from "react-router-dom";

const img = require("../../Global/Images/Pencil.svg");
const arrowImg = require("../../Global/Images/Frame.svg");
const MainComponent = (props: any): JSX.Element => {
  const navigate = useNavigate();

  // const [ispopup, setIspopup] = useState(false);
  const [isadmin, setIsadmin] = useState(false);
  // const [selectItem, setSelectItem] = useState<any>(null);
  const values: any = props.context.pageContext.web.absoluteUrl;

  const [announcements, setAnnouncements] = useState<any>([]);

  async function getAnnouncement() {
    try {
      const items = await sp.web.lists
        .getByTitle(Config.ListNames.Announcement)
        .items.select("Id", "FileRef", "Message", "Title")
        .orderBy("Modified", false)

        // .orderBy("", false)
        .top(4)
        .get();
      console.log(items, "items");

      const announcements = items.map((item: any) => ({
        Id: item.Id,
        FileRef: item.FileRef,
        Title: item.Title,
        Details: item.Message,
      }));
      //  return announcements;
      setAnnouncements(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
  }

  // const navigateToDetailsPage = async (val: any, flag: any) => {
  //   setSelectItem(val);
  //   setIspopup(flag);

  // };
  const handlenavigate = (id: any) => {
    // navigate(`/Sitepage/collabhome.aspx/page/${id}`);
    navigate(`/id/${id}`);
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      await getAnnouncement(); // Assuming getAnnouncement is defined somewhere in your code

      // const _isAdmin = await isCurrentUserIsadmin("Achaulien Owners"); // Replace with your admin group name
      // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");
      const _isAdmin = await isCurrentUserIsadmin(Config.ListNames.ProdAdmin);

      setIsadmin(_isAdmin);
    };
    checkAdminStatus();
  }, []);

  return (
    // <div>
    //   <div className={styles.container}>
    //     {imageArray.map((rec, i) => (
    //       <div className={styles.link}>
    //         <div className={styles.ImgContainer}>
    //           <img src={rec.url}></img>
    //         </div>
    //         <p>{rec.photographer}</p>
    //       </div>
    //     ))}
    //   </div>
    // </div>

    //   <div className={styles.container}>
    //     {announcements.map((rec, i) => (
    //       <div className={styles.link}>
    //         <div className={styles.ImgContainer}>
    //           <img src={rec.FileRef}></img>
    //         </div>
    //         <p>{rec.Details}</p>
    //       </div>
    //     ))}
    //   </div>
    // </div>

    //new
    <>
      <div className={styles.Container}>
        <div className={styles.headerContainer}>
          <div className={styles.headerSection}>
            <p>News & Announcements</p>
            {isadmin && (
              <img
                src={`${img}`}
                alt=""
                onClick={() => {
                  window.open(`${values}/${Config.ListNames.AnnounementLink}`);
                }}
              />
            )}
          </div>
        </div>
        {announcements.length ? (
          <>
            <div className={styles.imgContainer}>
              <div className={styles.imgwrapper}>
                {/* <div
              onClick={() => {
                window.open(
                  `${props.context.pageContext.web.absoluteUrl}/SitePages/AnnouncementView.aspx?id=1`,
                  "_self"
                );
              }}
            >
              Click
            </div> */}
                {announcements.map((val: any, index: number) => (
                  <div
                    className={styles.imgsplit}
                    key={index}
                    onClick={() => {
                      handlenavigate(val.Id);
                      // setIspopup(true);

                      // navigateToDetailsPage(val, true);
                    }}
                  >
                    <div className={styles.imgsection}>
                      <img src={val.FileRef} />
                    </div>
                    <Tooltip
                      content={val.Details}
                      position="top"
                      className="custom-tooltip "
                      // style={tooltipStyle}
                      target={`#pdesc-${index}`}
                    />
                    <div className={styles.detail}>
                      <h5>{val.Title}</h5>

                      <p className="pdesc" id={`pdesc-${index}`}>
                        {val.Details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.moreiconContainer}>
              <div
                className={styles.moreiconSection}
                onClick={() => {
                  window.open(`${values}/SitePages/AnnouncementView.aspx`);
                  // window.open(
                  //   "https://chandrudemo.sharepoint.com/sites/Achaulien/SitePages/Announcement.aspx"
                  // );
                  // window.open(
                  //   "https://achaulien.sharepoint.com/sites/IntranetDev/SitePages/AnnouncementView.aspx "
                  // );
                  // setIsMore(true);
                }}
              >
                <p>More</p>
                <img src={`${arrowImg}`} alt="" />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              minHeight: "250px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            No data found !!!
          </div>
        )}
      </div>

      {/* <Dialog
        // className="ApicallDialog"
        className={`ApicallDialog ${styles.announceDialog}`}
        visible={ispopup}
        onHide={() => {
          setIspopup(false);
        }}
      >
        <AnnouncementView
          setIspopup={setIspopup}
          selectItem={selectItem}
        ></AnnouncementView>
      </Dialog> */}
    </>
  );
};
export default MainComponent;
