/* eslint-disable @typescript-eslint/no-var-requires */

import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPinterestSquare,
  faSquareFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

// let InstagramImg: any = require("../../Global/Images/logo.svg");
// let facebookImg: any = require("../../Global/Images/Logo1.svg");
let CompanyLogo: any = require("../../Global/Images/CompanyLogo.png");

// let img4: any = require("../../Global/Images/image2.svg");
// let pininterestImg: any = require("../../Global/Images/logo2.svg");
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
          <div className={styles.Companylogo}>
            <img src={`${CompanyLogo}`} alt="" />
          </div>
          <div className={styles.copyRights}>
            <p> &copy; 2024 A Chau Lien -All rights reserved.</p>
          </div>
          <div className={styles.socialLinks}>
            {/* <img
              src={`${InstagramImg}`}
              alt=""
              title={"instagram"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.instagram.com/achau_lien/");
              }}
            /> */}

            <FontAwesomeIcon
              icon={faSquareFacebook}
              title="facebook"
              className={styles.iconStyle}
              // style={{ color: "#ffffff", fontSize: "2.2em", cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.facebook.com/achaulien");
              }}
            />
            {/* <img
              src={`${facebookImg}`}
              alt=""
              style={{ cursor: "pointer" }}
              title={"facebook"}
              onClick={() => {
                window.open("https://www.facebook.com/achaulien");
              }}
            /> */}

            <FontAwesomeIcon
              title={"instagram"}
              icon={faInstagram}
              className={styles.iconStyle}
              // style={{ color: "#ffffff", fontSize: "2.2em", cursor: "pointer" }}
              onClick={() => {
                window.open("https://www.instagram.com/achau_lien/");
              }}
            />

            <FontAwesomeIcon
              title="Pinterest"
              className={styles.iconStyle}
              icon={faPinterestSquare}
              // style={{ color: "#ffffff", fontSize: "2.2em", cursor: "pointer" }}
              onClick={() => {
                window.open("https://se.pinterest.com/achau_lien/");
              }}
            />

            {/* <img
              src={`${pininterestImg}`}
              alt=""
              title={"pinterest"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.open("https://se.pinterest.com/achau_lien/");
              }}
            /> */}
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
