/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from "@pnp/sp/presets/all";
import * as React from "react";
// import "./Style.css";
import styles from "./AllAnnouncement.module.scss";
import { useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "../../Global/Style.css";
import { Config } from "../../Global/Config";
import { Dialog } from "primereact/dialog";
import AnnouncementView from "./Announceview";
import { isCurrentUserIsadmin } from "../../Global/Admin";
// import { useHistory } from "react-router-dom";

import { useNavigate } from "react-router-dom";

interface Announcement {
  Id: number;
  FileRef: string;
  Title: string;
  Details: string;
}

interface MainComponentProps {
  context: {
    pageContext: {
      web: {
        absoluteUrl: string;
      };
    };
  };
}

const img = require("../../Global/Images/Pencil.svg");
const MainComponent = (props: MainComponentProps): JSX.Element => {
  const navigate = useNavigate();
  // const navigate = useNavigate();
  // const history = useHistory();

  const values = props.context.pageContext.web.absoluteUrl;
  const [ispopup, setIspopup] = useState<boolean>(false);
  const [isadmin, setIsadmin] = useState<boolean>(false);
  // const [selectItem, setSelectItem] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // const [selectItem, setSelectItem] = useState<any>(null);

  // const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // const navigateToDetailsPage = (val: Announcement, flag: boolean): void => {
  //   setSelectItem(val);
  //   setIspopup(flag);

  // };

  const getAnnouncement = async (): Promise<void> => {
    try {
      const items = await sp.web.lists
        .getByTitle(Config.ListNames.Announcement)
        .items.select("Id", "FileRef", "Message", "Title")
        .orderBy("Modified", false)

        .get();
      console.log(items, "items");

      const announcements: Announcement[] = items.map((item: any) => ({
        Id: item.Id,
        FileRef: item.FileRef,
        Title: item.Title,
        Details: item.Message,
      }));
      //  return announcements;
      setAnnouncements(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handlenavigate = (id: any): void => {
    // window.location.href = `https://achaulien.sharepoint.com/sites/IntranetDev/SitePages/announceViewPage.aspx?id=${id}`;

    // navigate(`/sites/IntranetDev/SitePages/announceViewPage.aspx?id=${id}`, {
    //   replace: true,
    // });
    // window.location.reload();
    navigate(`/id/${id}`);
  };
  useEffect(() => {
    // getAnnouncement();

    const checkAdminStatus = async (): Promise<void> => {
      await getAnnouncement(); // Assuming getAnnouncement is defined somewhere in your code

      // const _isAdmin = await isCurrentUserIsadmin("Achaulien Owners");
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
        {announcements?.length ? (
          <div className={styles.imgContainer}>
            <div className={styles.imgwrapper}>
              {announcements.map((val: Announcement, index: number) => (
                <div
                  className={styles.imgsplit}
                  key={index}
                  onClick={() => {
                    handlenavigate(val.Id);
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

      <Dialog
        // className="ApicallDialog"
        className={`ApicallDialog ${styles.announceDialog}`}
        visible={ispopup}
        onHide={() => {
          setIspopup(false);
        }}
      >
        {/* <AnnouncementView setIspopup={setIspopup} selectItem={selectItem} /> */}
        <AnnouncementView />
      </Dialog>
    </>
  );
};
export default MainComponent;
