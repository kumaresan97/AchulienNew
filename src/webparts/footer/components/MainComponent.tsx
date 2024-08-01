/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
let img1: any = require("../../Global/Images/logo.svg");
let img2: any = require("../../Global/Images/Logo1.svg");
let img3: any = require("../../Global/Images/image1.svg");
// let img4: any = require("../../Global/Images/image2.svg");
let img5: any = require("../../Global/Images/logo2.svg");
import styles from "./Footer.module.scss";
import "../../Global/Style.css";
const Maincomponent = () => {
  // const [ismobile, setIsmobile] = React.useState(false);
  // const handleResponsiveChange = () => {
  //   setIsmobile(window.innerWidth <= 768);
  // };
  // React.useEffect(() => {
  //   handleResponsiveChange();
  //   window.addEventListener("resize", handleResponsiveChange);
  //   return () => {
  //     window.removeEventListener("resize", handleResponsiveChange);
  //   };
  // }, []);
  return (
    <div>
      <div className={styles.footerContainer}>
        <div className={styles.fullviewSection}>
          <div>
            <img src={`${img3}`} alt="" />
          </div>
          <div className={styles.copyRights}>
            <p> &copy; 2024 A Chau Lien -All rights reserved.</p>
          </div>
          <div className={styles.socialLinks}>
            <img
              src={`${img1}`}
              alt=""
              title={"instagram"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.instagram.com/achau_lien/");
              }}
            />
            <img
              src={`${img2}`}
              alt=""
              style={{ cursor: "pointer" }}
              title={"facebook"}
              onClick={() => {
                window.open("https://www.facebook.com/achaulien");
              }}
            />
            <img
              src={`${img5}`}
              alt=""
              title={"pinterest"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://se.pinterest.com/achau_lien/");
              }}
            />
          </div>
        </div>
        {/* <>
            <div className={styles.mobileView}>
              <div className={styles.Logo}>
                <img src={`${img3}`} alt="" />

                <div className={styles.mbviewsocialLinks}>
                  <img
                    src={`${img1}`}
                    alt=""
                    title={"instagram"}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open("https://www.instagram.com/achau_lien/");
                    }}
                  />
                  <img
                    src={`${img2}`}
                    alt=""
                    style={{ cursor: "pointer" }}
                    title={"facebook"}
                    onClick={() => {
                      window.open("https://www.facebook.com/achaulien");
                    }}
                  />
                  <img
                    src={`${img5}`}
                    alt=""
                    title={"pinterest"}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open("https://se.pinterest.com/achau_lien/");
                    }}
                  />
                </div>
              </div>

              <div className={styles.mbcopyRights}>
                <p style={{ margin: 0, color: "#ffff" }}>
                  {" "}
                  &copy; 2024 A Chau Lien -All rights reserved.
                </p>
              </div>
            </div>
          </> */}
      </div>
    </div>
  );
};
export default Maincomponent;
