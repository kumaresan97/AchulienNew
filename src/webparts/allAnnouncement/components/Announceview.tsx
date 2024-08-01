/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */

import { sp } from "@pnp/sp/presets/all";
import * as React from "react";
import "../../Global/Style.css";
import styles from "./AllAnnouncement.module.scss";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Config } from "../../Global/Config";
import { Dialog } from "primereact/dialog";

const img = require("../../Global/Images/Leftarrow.svg");
const copyImg = require("../../Global/Images/files.png");
const AnnouncementView = () => {
  const [ispopup, setIspopup] = React.useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
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
        // Fetch the image details first
        await fetchImageDetailsById(id);
        // Then show the popup
        setIspopup(true);
      } else {
        setIspopup(false);
      }
    };

    fetchAndShowPopup();
    // fetchImageDetailsById(id);
  }, []);
  return (
    <>
      <Dialog
        visible={ispopup}
        onHide={() => setIspopup(false)}
        className={`Shipments ${styles.announceDialog}`}
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

// import * as React from "react";
// import "../../Global/Style.css";
// import styles from "./AllAnnouncement.module.scss";
// // import img from "../../Global/Images/Leftarrow.svg"
// let img: any = require("../../Global/Images/Leftarrow.svg");
// interface propitems {
//   selectItem: any;
//   setIspopup: (isPopup: boolean) => void;
// }
// const AnnouncementView: React.FC<propitems> = () => {
//   //   const fetchImageDetailsById = async (id) => {
//   //     try {
//   //       const items = await sp.web.lists
//   //         .getByTitle("Announcement")
//   //         .items.getById(id)
//   //         .select("Id", "FileRef", "Details", "Header")
//   //         .get();
//   //       //   await sp.web.lists
//   //       //     .getByTitle("Announcement")
//   //       //     .items.select("Id", "FileRef", "Details,Header")
//   //       //     .orderBy("Created", false)

//   //       //     .get();
//   //       console.log(items, "items");

//   //       const announcements = items.map((item) => ({
//   //         Id: item.Id,
//   //         FileRef: item.FileRef,
//   //         Title: item.Header,
//   //         Details: item.Details,
//   //       }));
//   //       //  return announcements;
//   //       //   setAnnouncements(announcements);
//   //     } catch (error) {
//   //       console.error("Error fetching announcements:", error);
//   //       return [];
//   //     }
//   //   };

//   React.useEffect(() => {
//     // const urlParams = new URLSearchParams(window.location.search);
//     // const imageId = urlParams.get("id");
//     // debugger;
//     // if (imageId) {
//     //   const imageDetails = fetchImageDetailsById(imageId);
//     //   console.log(imageDetails, "imgdetails");
//     // }
//   }, []);
//   return (
//     <div
//       className={styles.AnnounceContainer}
//       //   style={{
//       //     background: "#fff",
//       //     width: "100%",
//       //     padding: "10px 20px",
//       //     margin: "10px 0px",
//       //   }}
//     >
//       <div
//         className={styles.arrow}

//         //   style={{ cursor: "pointer" }}
//       >
//         <img
//           src={`${img}`}
//           alt=""
//           onClick={() => {
//             setIspopup(false);
//           }}
//         />
//       </div>
//       {/* <div style={{ width: "100%", height: "500px", position: "relative" }}>
//         <img
//           src="https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?cs=srgb&dl=pexels-bri-schneiter-28802-346529.jpg&fm=jpg"
//           alt=""
//           style={{ width: "100%", height: "100%", objectFit: "cover" }}
//         />
//         <p
//           style={{
//             position: "absolute",
//             width: "100%",
//             height: "30px",
//             top: "0px", // Adjust the position as needed
//             background: "white", // Optional: to make the icon stand out
//             // borderRadius: "50%", // Optional: to style the icon
//             padding: "5px", // Optional: to add some padding around the icon
//             cursor: "pointer", //
//             bottom: "10px",
//           }}
//         >
//           Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
//         </p>
//       </div> */}

//       <div className={styles.imagetitlecontainer}>
//         <div className={styles.title}>{selectItem.Title}</div>
//         <div className={styles.imagecontainer}>
//           <img src={`${selectItem.FileRef}`} alt="" />

//           {/* <img src="path-to-your-image.png" alt="Image Description" /> */}
//         </div>
//       </div>

//       <div
//         className={styles.selectedContent}
//         //   style={{ width: "60%", margin: "50px auto" }}
//       >
//         <div
//           className={styles.content}

//           // style={{ color: "#5F5F5F", fontWeight: "500", fontSize: "18px" }}
//         >
//           {selectItem.Details}
//           {/* <div dangerouslySetInnerHTML={{ __html: selectItem.Details }} /> */}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default AnnouncementView;
