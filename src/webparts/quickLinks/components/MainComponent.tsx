/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
// import "./Style.css";
import "primereact/resources/themes/saga-blue/theme.css";

import { useEffect, useState } from "react";
import styles from "./QuickLinks.module.scss";
let img: any = require("../../Global/Images/Pencil.svg");
import { sp } from "@pnp/sp/presets/all";
import { Config } from "../../Global/Config";
let arrowImg = require("../../Global/Images/Frame.svg");
import { Dialog } from "primereact/dialog";
import "../../Global/Style.css";
import { Tooltip } from "primereact/tooltip";
import { isCurrentUserIsadmin } from "../../Global/Admin";

const MainComponent = (props: any) => {
  const [data, setData] = useState<any>([]);
  const [isMore, setIsMore] = useState(false);
  const [isadmin, setIsadmin] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  let values = props.context.pageContext.web.absoluteUrl;
  const displayedData = isMobile ? data.slice(0, 4) : data;

  let tempArr = [];
  const getItems = async () => {
    await sp.web.lists
      .getByTitle(Config.ListNames.QuickLinks)
      .items()
      .then(async (res: any) => {
        tempArr = await res.map((val: any) => ({
          Links: val.Links,
          Title: val.Title,
          Imgurl: val.Icon ? JSON.parse(val.Icon)?.serverRelativeUrl : "",
        }));
        await setData([...tempArr]);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // mobile Responsive Change
  const handleResponsiveChange = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  useEffect(() => {
    const checkAdminStatus = async () => {
      await getItems(); // Assuming getAnnouncement is defined somewhere in your code
      // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");
      const _isAdmin = await isCurrentUserIsadmin(Config.ListNames.ProdAdmin);

      // const _isAdmin = await isCurrentUserIsadmin("Achaulien Owners"); // Replace with your admin group name
      setIsadmin(_isAdmin);

      await handleResponsiveChange();
      window.addEventListener("resize", handleResponsiveChange);
      return () => {
        window.removeEventListener("resize", handleResponsiveChange);
      };
    };
    checkAdminStatus();

    // getItems();

    // // mobile Responsive Change
    // handleResponsiveChange();
    // window.addEventListener("resize", handleResponsiveChange);
    // return () => {
    //   window.removeEventListener("resize", handleResponsiveChange);
    // };
    //   console.log(props);
  }, []);

  return (
    <>
      {data.length > 0 ? (
        <div className={styles.MainContainer}>
          <div className={styles.MainSection}>
            <p>Quick Links</p>
            {isadmin && (
              <img
                src={`${img}`}
                alt=""
                onClick={() => {
                  window.open(
                    `${values}/Lists/${Config.ListNames.QuickLinksLink}`
                  );
                }}
              />
            )}
          </div>
          <div className={styles.boxContainer}>
            {displayedData.length &&
              displayedData.length > 0 &&
              displayedData.map((val: any, index: number) => (
                <div
                  className={styles.box}
                  onClick={() => {
                    window.open(val.Links);
                  }}
                >
                  <div className={styles.content}>
                    <img src={val.Imgurl}></img>
                    <p id={`quick-${index}`}>{val.Title}</p>
                  </div>

                  <Tooltip
                    content={val.Title}
                    position="top"
                    // style={tooltipStyle}
                    target={`#quick-${index}`}
                  />
                </div>
              ))}
            {isMobile && (
              <div className={styles.moreiconContainer}>
                <div
                  className={styles.moreiconSection}
                  onClick={() => {
                    setIsMore(true);
                  }}
                >
                  <p>More</p>
                  <img src={`${arrowImg}`} alt="" />
                </div>
              </div>
            )}
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
        // <div> no Data found !!!</div>
      )}

      <Dialog
        // className={`Shipments`}
        className="Seemore"
        visible={isMore}
        style={{ width: "90%", background: "#ccc" }}
        onHide={() => {
          setIsMore(false);
        }}
      >
        <div style={{ padding: "10px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <i
              className={`pi pi-times ${styles.dialogHeader} `}
              onClick={() => {
                setIsMore(false);
              }}
            ></i>
          </div>
          <span className={styles.quicklinks}>Quick Links</span>
          <div
            style={{ width: "100%", padding: 0 }}
            className={styles.MainContainer}
          >
            <div
              style={{ justifyContent: "center" }}
              className={styles.boxContainer}
            >
              {data.length &&
                data.length > 0 &&
                data.map((val: any) => (
                  <div
                    className={styles.box}
                    onClick={() => {
                      window.open(val.Links);
                    }}
                  >
                    <div className={styles.content}>
                      <img src={val.Imgurl}></img>
                      <p>{val.Title}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Dialog>
    </>
    // <div className={styles.mainSection}>
    //   <div className={styles.Header}>
    //     <div className={styles.webPartTitle}>Quick links</div>
    //     <img src={`${img}`} alt="" />
    //   </div>
    //   <div className={styles.container}>
    //     {data.map((rec, i) => (
    //       <div className={styles.link}>
    //         <img src={rec.Imgurl}></img>
    //         <a href={rec.Links}>{rec.Title}</a>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};
export default MainComponent;
