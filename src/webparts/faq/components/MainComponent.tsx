/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/*  eslint-disable @typescript-eslint/no-use-before-define */

import * as React from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import "primereact/resources/themes/saga-blue/theme.css";
import { MultiSelect } from "primereact/multiselect";
import styles from "./Faq.module.scss";

import "../../Global/Style.css";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { sp } from "@pnp/sp/presets/all";
import { Config } from "../../Global/Config";
import { isCurrentUserIsadmin } from "../../Global/Admin";
import { InputText } from "primereact/inputtext";

const img: any = require("../../Global/Images/Pencil.svg");
const MainComponent = (props: any) => {
  const [faqTags, setFaqTags] = useState<any>([]);
  const [faqQuestions, setFaqQuestions] = useState<any>([]);
  const [isadmin, setIsadmin] = useState<boolean>(false);
  const [qfilter, setQilter] = useState<any>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [filterQues, setFilterQues] = useState<any>([]);
  const [selected, setSelected] = useState<any>([]);
  const values = props.context.pageContext.web.absoluteUrl;
  console.log(values, "values");

  const createDynamicTabs = () => {
    return faqQuestions.map((tab: any, i: number) => (
      <AccordionTab
        key={i}
        header={
          <HeaderTemplate title={tab.Title} tag={tab.Tag} color={tab.color} />
        }
      >
        <div dangerouslySetInnerHTML={{ __html: tab.Answers }} />
      </AccordionTab>
    ));
  };
  const getBackground = (value: any, color: any): any => {
    // let backgroundColor = "";
    // let textColor = "";

    // Define styles based on value
    // switch (value) {
    //   case "Apple":
    //     backgroundColor = "#ffc107";
    //     textColor = "#fff";
    //     break;
    //   case "Google":
    //     backgroundColor = "#4caf50";
    //     textColor = "#fff";
    //     break;
    //   case "Microsoft":
    //     backgroundColor = "#e91e63";
    //     textColor = "#fff";
    //     break;
    //   default:
    //     backgroundColor = "#e0e0e0";
    //     textColor = "#fff";
    // }

    // Return styled div
    return (
      <span
        className="custom-tag"
        style={{
          backgroundColor: `${color ? color : "#e0e0e0"}`,
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "20px",
          display: "inline-flex",
          margin: "5px 0px",
          fontSize: "14px",
          fontWeight: 400,
        }}
      >
        {value}
      </span>
    );
  };

  const HeaderTemplate = ({ title, tag, color }: any) => {
    return (
      <div>
        {getBackground(tag, color)}
        <div
          // className="custom-header"
          className={styles.customHeader}
        >
          <span> {title}</span>
          {/* <span className="tag">{tag}</span> */}
          <Button
            icon="pi pi-plus"
            rounded
            className={styles.PlusIcon}
            // text
            // raised
            severity="danger"
            aria-label="Cancel"
          />
        </div>
      </div>
    );
  };

  const filterQuestions = (val: any): void => {
    let filtered = filterQues;

    // Filter based on tags if any are selected
    if (val.tags.length > 0) {
      filtered = filtered.filter((question: any) =>
        val.tags.some((tag: any) => tag.code === question.Tag)
      );
    }

    // Filter based on search input if it's not empty
    if (val.search.trim() !== "") {
      filtered = filtered.filter((question: any) =>
        question.Title.toLowerCase().includes(val.search.trim().toLowerCase())
      );
    }

    setFaqQuestions(filtered);
  };

  const removeTag = (tag: any): void => {
    const updatedTags = selected.filter((t: any, i: any) => i !== tag);
    setSelected(updatedTags);
    filterQuestions({ tags: updatedTags, search: qfilter });
  };

  const handleResponsiveChange = (): void => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    // Fetch FAQ tags
    const fetchFaqTags = async () => {
      const tags = await sp.web.lists
        .getByTitle(Config.ListNames.FAQTag)
        .items.get();
      setFaqTags(
        tags.map((tag: any) => ({ name: tag.Title, code: tag.Title }))
      );

      // let _isAdmin = await isCurrentUserIsadmin("Achaulien Owners");
      // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");

      const _isAdmin = await isCurrentUserIsadmin("aclhub Owners");

      setIsadmin(_isAdmin);
    };

    // Fetch FAQ questions
    const fetchFaqQuestions = async () => {
      let ques = [];

      const questions = await sp.web.lists
        .getByTitle(Config.ListNames.FAQ)
        .items.select("Title", "Answers", "Tag/Title ", "Tag/Color")
        .expand("Tag")
        .get();
      ques = questions.map((val) => ({
        Title: val.Title,
        Answers: val.Answers,
        Tag: val.Tag.Title,
        color: val.Tag.Color,
      }));
      setFaqQuestions([...ques]);
      setFilterQues([...ques]);
    };

    // Function to handle fetching data
    const fetchData = async () => {
      try {
        await fetchFaqTags();
        await fetchFaqQuestions();
      } catch (error) {
        console.error("Error fetching FAQ data:", error);
      }
    };

    fetchData();

    handleResponsiveChange();

    // Add event listener for resize
    window.addEventListener("resize", handleResponsiveChange);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", handleResponsiveChange);
    };
  }, []);

  // useEffect(() => {
  //   // Fetch FAQ tags
  //   const fetchFaqTags = async () => {
  //     const tags = await sp.web.lists
  //       .getByTitle(Config.ListNames.FAQTag)
  //       .items.get();
  //     setFaqTags(
  //       tags.map((tag: any) => ({ name: tag.Title, code: tag.Title }))
  //     );

  //     // let _isAdmin = await isCurrentUserIsadmin("Achaulien Owners");
  //     // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");

  //     const _isAdmin = await isCurrentUserIsadmin("aclhub Owners");

  //     setIsadmin(_isAdmin);
  //   };

  //   // Fetch FAQ questions
  //   const fetchFaqQuestions = async () => {
  //     let ques = [];

  //     const questions = await sp.web.lists
  //       .getByTitle(Config.ListNames.FAQ)
  //       .items.select("Title", "Answers", "Tag/Title ", "Tag/Color")
  //       .expand("Tag")
  //       .get();
  //     ques = questions.map((val) => ({
  //       Title: val.Title,
  //       Answers: val.Answers,
  //       Tag: val.Tag.Title,
  //       color: val.Tag.Color,
  //     }));
  //     setFaqQuestions([...ques]);
  //     setFilterQues([...ques]);
  //   };

  //   fetchFaqTags();
  //   fetchFaqQuestions();

  //   handleResponsiveChange();

  //   // Add event listener for resize
  //   window.addEventListener("resize", handleResponsiveChange);

  //   // Cleanup function to remove the event listener
  //   return () => {
  //     window.removeEventListener("resize", handleResponsiveChange);
  //   };
  // }, []);

  // useEffect(() => {
  //   setSelected(selected);
  // }, [selected]);

  return (
    <div className={styles.container}>
      {isMobile ? (
        <>
          <div
            // className={styles.header}

            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h5
                style={{
                  fontSize: "16px",
                  color: "#ff1721",
                  borderBottom: "2px solid",
                }}
              >
                FAQ
              </h5>
              <div className={styles.search}>
                {isadmin && (
                  <img
                    style={{ cursor: "pointer" }}
                    src={`${img}`}
                    onClick={() => {
                      window.open(
                        `${values}/Lists/${Config.ListNames.FAQLink}`
                      );
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <InputText
                className="Faqinput"
                value={qfilter}
                style={{ width: "50%" }}
                placeholder="search"
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setQilter(searchValue);
                  filterQuestions({ tags: selected, search: searchValue });
                }}
              ></InputText>
              <MultiSelect
                value={selected}
                style={{ width: "50%" }}
                onChange={(e) => {
                  const selectedTags = e.value;
                  setSelected(selectedTags);
                  filterQuestions({ tags: selectedTags, search: qfilter });
                }}
                options={faqTags}
                optionLabel="name"
                display="chip"
                placeholder="Select category"
                maxSelectedLabels={3}
                className={styles.muldropdown}
              />
            </div>
          </div>
        </>
      ) : (
        <div className={styles.header}>
          <h5>FAQ</h5>

          <div className={styles.search}>
            <InputText
              className="Faqinput"
              style={{ width: "250px " }}
              value={qfilter}
              placeholder="Search"
              onChange={(e) => {
                const searchValue = e.target.value;
                setQilter(searchValue);
                filterQuestions({ tags: selected, search: searchValue });
              }}
              // onChange={(e) => {
              //   setQilter(e.target.value);
              //   filterQuestions(e.target.value)
              // }}
            ></InputText>
            <MultiSelect
              value={selected}
              // onChange={(e) => {
              //   if (e.value.length === 0) {
              //     removeTag(null); // Clear all tags
              //   } else {
              //     setSelected(e.value);
              //     filterQuestions(e.value);
              //   }
              // }}
              // onChange={(e) => {
              //   setSelected(e.value);
              //   filterQuestions(e.value);
              // }}

              onChange={(e) => {
                const selectedTags = e.value;
                setSelected(selectedTags);
                filterQuestions({ tags: selectedTags, search: qfilter });
              }}
              options={faqTags}
              optionLabel="name"
              display="chip"
              placeholder="Select category"
              maxSelectedLabels={3}
              className={styles.muldropdown}
              // className="w-full md:w-20rem"
            />
            {isadmin && (
              <img
                src={`${img}`}
                onClick={() => {
                  window.open(`${values}/Lists/${Config.ListNames.FAQLink}`);
                }}
              />
            )}
          </div>
        </div>
      )}
      <div style={{ margin: "10px 0px" }}>
        <div className={styles.selectedtags}>
          {selected.map((tag: any, i: number) => (
            <div className={styles.chip} key={i}>
              <span className={styles.chiplabel}>{tag?.name}</span>
              <span className={styles.chipremove} onClick={() => removeTag(i)}>
                ×
              </span>
            </div>

            // <div key={tag.code} className="chip">
            //   {tag.name}
            //   <span className="close-icon" onClick={() => removeTag(tag.code)}>
            //     &#10005;
            //   </span>
            // </div>
          ))}
        </div>
      </div>
      {faqQuestions.length > 0 ? (
        <div className={styles.card}>
          <Accordion>{createDynamicTabs()}</Accordion>
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
  );
};
export default MainComponent;
