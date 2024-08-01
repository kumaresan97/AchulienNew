import * as React from "react";
import "../../Global/Style.css";
import styles from "./Announcement.module.scss";
let img = require("../../Global/Images/Leftarrow.svg");
interface propitems {
  selectItem: any;
  setIspopup: (isPopup: boolean) => void;
}
const AnnouncementView: React.FC<propitems> = ({ selectItem, setIspopup }) => {
  React.useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const imageId = urlParams.get("id");
    // debugger;
    // if (imageId) {
    //   const imageDetails = fetchImageDetailsById(imageId);
    //   console.log(imageDetails, "imgdetails");
    // }
  }, []);
  return (
    <div className={styles.AnnounceContainer}>
      <div className={styles.arrow}>
        <img
          src={`${img}`}
          alt=""
          onClick={() => {
            setIspopup(false);
          }}
        />
      </div>

      <div className={styles.imagetitlecontainer}>
        <div className={styles.title}>{selectItem.Title}</div>
        <div className={styles.imagecontainer}>
          <img src={`${selectItem.FileRef}`} alt="" />
        </div>
      </div>

      <div className={styles.selectedContent}>
        <div className={styles.content}>{selectItem.Details}</div>
      </div>
    </div>
  );
};
export default AnnouncementView;
