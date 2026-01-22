
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { Carousel } from "primereact/carousel";
import "../../Global/Style.css";
import { sp } from "@pnp/sp/presets/all";
import { useEffect, useState } from "react";
// import { Button } from "primereact/button";
import { isCurrentUserIsadmin } from "../../Global/Admin";
// import Loader from "../../Loader/Loader";
import { Config } from "../../Global/Config";
import styles from "./Carousel.module.scss";

// import "primeicons/primeicons.css";
let Pencil = require("../../Global/Images/pencil.png");
let PencilNodata = require("../../Global/Images/Pencil.svg");

const MainComponent = (props: any) => {
  const [images, setImages] = React.useState<any[]>([]);
  console.log("");
  const [isadmin, setIsadmin] = useState<boolean>(false);
  // const [loading, setLoading] = useState(true);

  const getCurrentUrl = () => {
    const baseUrl = props.context.pageContext.web.absoluteUrl;
    return `${baseUrl}/${Config.ListNames.CarouseelLink}/Forms/AllItems.aspx`;
  };

  const productTemplate = (product: any) => {
    return (
      <div className={styles.imageContainer}>
        <img src={product.imgUrl} alt={`Product ${product.ID}`} />
        {isadmin && (
          <div
            className={styles.editIcondiv}
            onClick={() => {
              window.open(getCurrentUrl());
            }}
          >
            <img src={`${Pencil}`} alt="" />
            {/* <i className="pi pi-pencil" style={{ fontSize: "2rem" }}></i> */}
          </div>
        )}
        {(product.Title || product.Description) && (
          <div
            className={styles.contentDiv}
            onClick={() => {
              if (product.Link) {
                window.open(product.Link);
              }
            }}
          >
            <p className={styles.Title}>{product.Title}</p>

            <div>
              <p className={styles.Description} title={product.Description}>
                {product.Description}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };
  //new

  useEffect(() => {
    const fetchFiles = async () => {
      await sp.web
        .getFolderByServerRelativePath(Config.ListNames.CarouseelLink)
        .files.select("*,ListItemAllFields")
        .expand("ListItemAllFields")
        .get()
        .then(async (res: any) => {


          let img: any[] = [];
          img = res
            .map((val: any) => ({
              imgUrl: val.ServerRelativeUrl,
              ID: val.ListItemAllFields.ID,
              Description: val.ListItemAllFields.Imagedescription || "",
              Title: val.ListItemAllFields.Title || "",
              Link: val.ListItemAllFields.Link || "",
            }))
            ?.sort((a: any, b: any) => b.ID - a.ID);
          // let sortimg = img.sort((a, b) => a.ID - b.ID);
          // console.log(sortimg, "sortimg");

          setImages([...img]);

          // let _isAdmin = await isCurrentUserIsadmin("Achaulien Owners");

          // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");
          const _isAdmin = await isCurrentUserIsadmin(
            Config.ListNames.ProdAdmin
          );

          setIsadmin(_isAdmin);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchFiles();
  }, []);

  return (
    <div>
      {images.length > 0 ? (
        <div className="card" style={{ height: "200px !important" }}>
          <Carousel
            // className="custom-carousel"
            className={styles.customCarousel}
            value={images || null}
            numVisible={1}
            numScroll={1}
            // verticalViewPortHeight="320px"
            showNavigators={false}
            showIndicators={true}
            // autoplayInterval={3000}
            circular
            autoplayInterval={images.length > 1 ? 3000 : 8.64e7}
            itemTemplate={productTemplate}
          />
        </div>
      ) : (
        <div style={{ padding: "10px 20px" }}>
          <div
            style={{ padding: "10px", display: "flex", justifyContent: "end" }}
          >
            <img
              src={`${PencilNodata}`}
              alt=""
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.open(getCurrentUrl());
              }}
            />
          </div>
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
        </div>
      )}
    </div>
  );
};

export default MainComponent;
