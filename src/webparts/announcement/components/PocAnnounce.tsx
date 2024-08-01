/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import "../../Global/Style.css";
import styles from "./Announcement.module.scss";
import { sp } from "@pnp/sp/presets/all";
import { Config } from "../../Global/Config";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";

let img = require("../../Global/Images/Leftarrow.svg");
let copyImg = require("../../Global/Images/files.png");

const AnnouncementView = () => {
  const { id } = useParams<{ id: string }>();
  const [ispopup, setIspopup] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const [selectItem, setSelectItem] = React.useState<any>(null);

  const fetchImageDetailsById = async (id: any) => {
    try {
      const items = await sp.web.lists
        .getByTitle(Config.ListNames.Announcement)
        .items.getById(id)
        .select("Id", "FileRef", "Message", "Title")
        .get();

      console.log(items, "items");

      const announcement = {
        Id: items.Id,
        FileRef: items.FileRef,
        Title: items.Header,
        Details: items.Message,
      };
      setSelectItem(announcement);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
  };

  const copyUrlToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        alert("URL copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  React.useEffect(() => {
    const fetchAndShowPopup = async () => {
      if (id) {
        await fetchImageDetailsById(id);
        setIspopup(true);
      } else {
        setIspopup(false);
      }
    };

    fetchAndShowPopup();
  }, [id]);
  return (
    <>
      <Dialog
        visible={ispopup}
        showHeader={false}
        // style={{

        // }}
        className={`Shipments ${styles.announceDialog}`}
        onHide={() => setIspopup(false)}
        // style={{
        //   width: "100% !important",
        //   maxHeight: "100% !important",
        // }}
      >
        <div className={styles.AnnounceContainer}>
          <div className={styles.arrow}>
            <img
              src={`${img}`}
              alt=""
              title={"back"}
              onClick={() => {
                navigate("/");
                // setIspopup(false);
              }}
            />

            <img
              src={`${copyImg}`}
              alt=""
              title={"copy"}
              onClick={() => {
                copyUrlToClipboard();
                // setIspopup(false);
              }}
            />
          </div>

          <div className={styles.imagetitlecontainer}>
            <div className={styles.title}>{selectItem?.Title}</div>
            <div className={styles.imagecontainer}>
              <img src={`${selectItem?.FileRef}`} alt="" />
            </div>
          </div>

          <div className={styles.selectedContent}>
            <div className={styles.content}>{selectItem?.Details}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
export default AnnouncementView;
