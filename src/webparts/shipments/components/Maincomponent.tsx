/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import "../../Global/Style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import styles from "./Shipments.module.scss";
import * as moment from "moment";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog } from "primereact/confirmdialog";

import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Config } from "../../Global/Config";
import ProgressBar from "./Progressbar";
import Loader from "../../Loader/Loader";
import TimelineComponent from "./TimelineComponent";

import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import { useEffect, useRef, useState } from "react";

import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import MapComponent from "./MapComponent";
import { isCurrentUserIsadmin } from "../../Global/Admin";
import { sp } from "@pnp/sp/presets/all";

const EditImg: any = require("../../Global/Images/Edit.png");
const DeleteImg: any = require("../../Global/Images/Delete.png");
const RefreshImg: any = require("../../Global/Images/Refresh.png");
const shipImg: any = require("../../Global/Images/Ship.png");
const ApiCallImg: any = require("../../Global/Images/Apicall.svg");

interface IPurchaseOrder {
  content: string;
}
const Maincomponent = (props: any) => {
  const [isadmin, setIsadmin] = useState<any>(false);
  const [values, setValues] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isAPI, setIsApi] = useState<boolean>(false);
  const [lastModified, setLastModified] = useState<any>(null);
  const [masterValue, setMasterValue] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedvalue, setSelectedvalue] = useState<any>(null);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [Id, setID] = useState<any>(null);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const toast = useRef<any>(null);

  const [Shipments, setShipments] = useState<any>({
    ID: null,
    Containername: "",
    TrackingNumber: "",
  });
  const [initialShipment, setInitialShipment] = useState<any>({
    ID: null,
    Containername: "",
    TrackingNumber: "",
  });

  const [step, setStep] = useState<number>(0);

  const nextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 1));
  const prevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  const getNewListData = async (listName: string) => {
    let _curData: any[] = [];
    try {
      await sp.web.lists
        .getByTitle(listName)

        .items.select("*, AttachmentFiles")
        .filter("isDelete ne 1 and isDelivered ne 1")
        .expand("AttachmentFiles")
        .get()
        .then(async (res: any) => {
          console.log(res);
          _curData = await res.map((val: any) => ({
            ID: val.ID || null,
            ContainerNumber: val.Title || "",
            ContainerName: val.ContainerName || "",
            // ETA: val.ETA ? moment(val?.ETA) : null,
            AttachmentFiles: val?.AttachmentFiles[0].FileName || "",
            Modified: val.Modified ? calculateTimeDifference(val.Modified) : "",
            LastModified: val.Modified || "",
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    } catch {}

    return _curData;
  };

  const calculateTimeDifference = (modifiedDate: any) => {
    const now: any = new Date();
    const modified: any = new Date(modifiedDate);
    const difference = Math.abs(now - modified);
    const minutesDifference = Math.floor(difference / (1000 * 60));

    if (minutesDifference < 60) {
      return `${minutesDifference} minute${
        minutesDifference !== 1 ? "s" : ""
      } ago`;
    }

    const hoursDifference = Math.floor(minutesDifference / 60);
    if (hoursDifference < 24) {
      return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
    }

    const daysDifference = Math.floor(hoursDifference / 24);
    return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
  };

  const getAttachmentUrls = async (listName: any, itemIds: any) => {
    let array = [];
    for (let i = 0; i < itemIds.length; i++) {
      try {
        const res = await sp.web.lists
          .getByTitle(listName)
          .items.getById(itemIds[i].ID)
          .attachmentFiles.getByName(itemIds[i].AttachmentFiles)
          .getText();

        let parsedData = JSON.parse(res);

        // Push the result into the array
        array.push({
          ContainerNo: itemIds[i].ContainerNumber,
          ID: itemIds[i].ID,
          // ETA: itemIds[i]?.ETA ? new Date(itemIds[i].ETA) : null,
          start: parsedData ? parsedData.data?.route?.pod?.date : "",
          // start: new Date(itemIds[i].ETA) || null,
          // end: new Date(itemIds[i].ETA) || null,
          Containername: itemIds[i].ContainerName,
          AttachmentFiles: parsedData,
          Modified: itemIds[i].Modified,
          LastModified: itemIds[i].LastModified,
          SPosition: parsedData
            ? findLocationNameById(
                parsedData.data.route.pol.location,
                parsedData.data.locations
              )
            : "",
          EPosition: parsedData
            ? findLocationNameById(
                parsedData.data.route.pod.location,
                parsedData.data.locations
              )
            : "",
        });
      } catch (err) {
        setLoader(false);
      }
    }
    BindCalender(array);

    array.sort((a, b) => {
      const monthA: any = new Date(a.start);
      const monthB: any = new Date(b.start);
      return monthA - monthB;
    });

    const latestModifiedItem = array.reduce((latest: any, item: any) => {
      return new Date(item.LastModified) > new Date(latest.LastModified)
        ? item
        : latest;
    }, array[0]);

    setLastModified(latestModifiedItem);

    console.log(array, "array");
    setLoader(false);
    setVisible(false);
    setShipments({
      ID: null,
      Containername: "",
      TrackingNumber: "",
    });

    setInitialShipment({
      ID: null,
      Containername: "",
      TrackingNumber: "",
    });
    setValues(array);
    setMasterValue(array);

    return array;
  };

  const findLocationNameById = (id: any, locations: any) => {
    const location = locations.find((loc: any) => loc.id === id);
    return location ? location.name : "Unknown Location";
  };

  function calculatePercentage(container: any) {
    const totalEvents = container.events.length;
    const actualEvents = container.events.filter(
      (event: any) => event.actual
    ).length;
    return (actualEvents / totalEvents) * 100;
  }

  const getApiData = async (action: any, number: any, ID: any) => {
    setLoader(true);
    setVisible(false);

    let apiKey = "K-8A209FCB-A578-455E-84FC-257A5F427128";
    try {
      const response = await fetch(
        `https://tracking.searates.com/tracking?api_key=${apiKey}&number=${number}&route=true&force_update=true`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      // if (!response.ok ||data.status === "error") {
      //   throw new Error("Network response was not ok");
      // }

      if (!response.ok || data.status === "error") {
        const errorMessage = data.message || "Network response was not ok";
        throw new Error(errorMessage);
      }
      if (data) {
        if (isEdit) {
          updateItem(action, number, data, ID);
        } else if (action == "refresh") {
          updateItem(action, number, data, ID);
        } else {
          addItem(number, data, ID);
        }
      }
    } catch (error) {
      setLoader(false);
      toast.current.show({
        severity: "error",
        summary: "API Error",
        detail: error.message,
        life: 3000,
      });
      setShipments({
        ID: null,
        TrackingNumber: "",
        Containername: "",
      });

      console.log(error.message);
    } finally {
      setLoader(false);
    }
  };

  const updateItem = async (
    action: any,
    number: any,
    description: any,
    itemId: any
  ) => {
    const jsonData = description;
    const fileName = `${number}.txt`;
    const listName = Config.ListNames.Shipment;

    // Data to update the item
    const itemData = {
      Title: number,
      ContainerName: Shipments.Containername,
      // ETA: new Date(),
    };

    try {
      // Update item in the list
      action !== "refresh" &&
        (await sp.web.lists
          .getByTitle(listName)
          .items.getById(itemId)
          .update(itemData));

      // Create file from JSON data
      const file = _handleRichText(jsonData, fileName);

      // Update the attachment
      await updateAttachmentToListItem(listName, itemId, file);

      const _listData = await getNewListData(listName);

      await getAttachmentUrls(listName, _listData);

      console.log("Item and attachment updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setLoader(false);
    }
  };
  const updateAttachmentToListItem = async (
    listName: any,
    itemId: any,
    file: any
  ) => {
    try {
      // Delete existing attachments
      const attachments = await sp.web.lists
        .getByTitle(listName)
        .items.getById(itemId)
        .attachmentFiles();
      for (let attachment of attachments) {
        await sp.web.lists
          .getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles.getByName(attachment.FileName)
          .delete();
      }

      // Add the new attachment
      await sp.web.lists
        .getByTitle(listName)
        .items.getById(itemId)
        .attachmentFiles.add(file.name, file);

      console.log("Attachment updated successfully!");
    } catch (error) {
      setLoader(false);
      console.error("Error updating attachment:", error);
      throw error;
    }
  };

  const addItem = async (number: any, description: any, ID: any) => {
    const jsonData = description;
    const fileName = `${number}.txt`;
    const listName = Config.ListNames.Shipment;

    // Data for the new item
    const itemData = {
      Title: number,
      ContainerName: Shipments?.Containername,
      // ETA: description ? new Date(description?.data?.route?.pod?.date) : null,
    };

    try {
      // Step 1: Add item to list and get the new item ID
      const itemId = await addItemToList(listName, itemData);

      // Step 2: Create file from JSON data
      const file = _handleRichText(jsonData, fileName);

      // Step 3: Add the attachment to the new item
      await addAttachmentToListItem(listName, itemId.Id, file);

      const _listData: any = await getNewListData(listName);

      await getAttachmentUrls(listName, _listData);

      console.log("Item and attachment added successfully!");
    } catch (error) {
      console.error("Error in the process:", error);
    }
  };

  const _handleRichText = (description: any, fileName: any): File => {
    const blob = new Blob([JSON.stringify(description, null, 2)], {
      type: "text/plain",
    });
    const file = new File([blob], fileName, { type: "text/plain" });
    return file;
  };

  const addItemToList = async (listName: any, itemData: any) => {
    try {
      const item = await sp.web.lists
        .getByTitle(listName)
        .items.select("*,AttachmentFiles")
        .expand("AttachmentFiles")
        .add(itemData);
      return item.data;
    } catch (error) {
      setLoader(false);

      console.error("Error adding item:", error);
      throw error;
    }
  };

  const addAttachmentToListItem = async (
    listName: any,
    itemId: any,
    file: any
  ) => {
    try {
      await sp.web.lists
        .getByTitle(listName)
        .items.getById(itemId)
        .select("*, AttachmentFiles")
        .expand("AttachmentFiles")
        .attachmentFiles.add(file.name, file)
        .then((res) => {
          console.log(res, "res");
        })
        .catch((err) => {
          setLoader(false);

          err;
        });
      console.log("Attachment added successfully!");
    } catch (error) {
      setLoader(false);

      console.error("Error adding attachment:", error);
      throw error;
    }
  };
  // };

  const updateOnly = async (id: any) => {
    setVisible(false);

    setLoader(true);
    await sp.web.lists
      .getByTitle(Config.ListNames.Shipment)
      .items.getById(id)
      .update({
        ContainerName: Shipments.Containername,
      })
      .then((res) => {
        console.log("successfully updated");
        setIsEdit(false);

        let updatedClientDetail = values.map((val: any) => {
          if (val.ID === id) {
            return { ...val, Containername: Shipments.Containername };
          }
          return val;
        });

        setValues([...updatedClientDetail]);
        setMasterValue([...updatedClientDetail]);
        setLoader(false);

        setShipments({
          ID: null,
          Containername: "",
          TrackingNumber: "",
        });
        setInitialShipment({
          ID: null,
          Containername: "",
          TrackingNumber: "",
        });
      })
      .catch((err) => {
        setVisible(false);
        setLoader(false);

        console.log(err);
      });
  };

  const getSearchFilter = (val: any) => {
    let selval = val.trim();
    setSelectedDate(null);
    if (selval != "") {
      const filteredData = masterValue.filter(
        (container: any) =>
          container.ContainerNo.toLowerCase().includes(selval.toLowerCase()) ||
          container.Containername.toLowerCase().includes(
            selval.toLowerCase()
          ) ||
          container.EPosition.toLowerCase().includes(selval.toLowerCase()) ||
          container.SPosition.toLowerCase().includes(selval.toLowerCase())
      );
      setValues(filteredData);
    } else {
      setValues(masterValue);
    }
  };

  const handleDelete = async () => {
    await sp.web.lists
      .getByTitle(Config.ListNames.Shipment)
      .items.getById(Id)
      .update({
        isDelete: true,
      })
      .then(async (res: any) => {
        setID(null);

        let updatedClientDetail = values.filter((val: any) => val.ID != Id);

        setValues([...updatedClientDetail]);
        setMasterValue([...updatedClientDetail]);
        setLoader(false);
        setIsDelete(false);
        // let del = await getNewListData(Config.ListNames.Shipment);
        // await getAttachmentUrls(Config.ListNames.Shipment, del);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //calender section
  const BindCalender = (data: any) => {
    let calendarEl: any = document.getElementById("myCalendar");
    let _Calendar = new Calendar(calendarEl, {
      plugins: [
        interactionPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        bootstrap5Plugin,
      ],

      // selectable: true,
      // editable: true,
      buttonText: {
        today: "Today",
        dayGridMonth: "Month",
        dayGridWeek: "Week - ListGrid",
        timeGridWeek: "Week",
        dayGridDay: "Day - ListGrid",
        timeGridDay: "Day",
        listWeek: "List",
      },

      headerToolbar: {
        left: "prev",
        center: "title",
        right: "next",
      },
      initialDate: new Date(),
      events: data,
      height: "auto",
      displayEventTime: true,
      weekends: true,
      dayMaxEventRows: true,
      views: {
        dayGrid: {
          dayMaxEventRows: 4,
        },
      },
      showNonCurrentDates: false,
      fixedWeekCount: false,
      eventDidMount: (event) => {
        console.log("Event mounted:", event);
        event.el.setAttribute("data-bs-target", "event");
      },
      dateClick: function (arg: any) {
        arg.jsEvent.preventDefault();
        const allDayNumberElements = document.querySelectorAll(
          ".fc-daygrid-day-number"
        );
        // alert("Date Clicked.");
        allDayNumberElements.forEach((dayNumber) => {
          (dayNumber as HTMLElement).style.color = "#000";
        });

        const dayNumber = arg.dayEl.querySelector(".fc-daygrid-day-number");
        if (dayNumber) {
          (dayNumber as HTMLElement).style.color = "#000 !important";
        }
        // const selectedDateString = moment(arg.dateStr).format("YYYYMMDD");
        setSelectedDate(arg.dateStr);
        DateFilter(arg.dateStr, data);
        // const filterEvents = data.filter(
        //   (event: any) =>
        //     moment(event.ETA).format("YYYYMMDD") === selectedDateString
        // );
        // setValues(filterEvents);
        // filterEvents.length &&
        //   filterEvents.sort(
        //     (a: any, b: any) =>
        //       moment(a.start).valueOf() - moment(b.start).valueOf()
        //   );

        // setTodayEvent([...filterEvents]);
        // setCurrentEventIndex(0);
      },
      // selectLongPressDelay: 1,
    });

    _Calendar.updateSize();
    _Calendar.render();
  };
  const onchangevalues = (key: any, value: any) => {
    let obj: any = { ...Shipments };
    obj[key] = value;
    setShipments({ ...obj });
  };

  const EditHandler = (_val: any) => {
    setIsEdit(true);
    setVisible(true);
    setShipments((prev: any) => ({
      ...prev,
      ID: _val.ID,
      Containername: _val.Containername,
      TrackingNumber: _val.ContainerNo,
    }));

    setInitialShipment({
      ID: _val.ID,
      Containername: _val.Containername,
      TrackingNumber: _val.ContainerNo,
    });
  };

  const validateInputs = async () => {
    if (!Shipments.Containername.trim()) {
      toast.current.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Tracking name is required.",
        life: 3000,
      });
      return false;
    }

    if (!Shipments.TrackingNumber.trim()) {
      toast.current.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Tracking number is required.",
        life: 3000,
      });
      return false;
    }

    if (Shipments.TrackingNumber.trim().length < 6) {
      toast.current.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Tracking number must be at least 6 characters long.",
        life: 3000,
      });
      return false;
    }

    // Check for duplicate container name
    // let containerNameDuplicate = values.some(
    //   (item) =>
    //     item.Containername.trim().toLowerCase() ===
    //       Shipments.Containername.trim().toLowerCase() &&
    //     item.ID !== Shipments.ID
    // );
    // if (containerNameDuplicate) {
    //   toast.current.show({
    //     severity: "error",
    //     summary: "Validation Error",
    //     detail: "Tracking name already exists.",
    //     life: 3000,
    //   });
    //   return false;
    // }

    // Check for duplicate tracking number
    let trackingNumberDuplicate = values.some(
      (item: any) =>
        item.ContainerNo.trim() === Shipments.TrackingNumber.trim() &&
        item.ID !== Shipments.ID
    );
    if (trackingNumberDuplicate) {
      toast.current.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Tracking number already exists.",
        life: 3000,
      });
      return false;
    }

    return true;
  };

  const DateFilter = (_value: any, datas: any) => {
    let data = datas.filter(
      // (val) => moment(val.ETA).format("YYYYMMDD") == _value
      (val: any) =>
        moment(val.AttachmentFiles.data?.route?.pod?.date).format("YYYYMMDD") ==
        moment(_value).format("YYYYMMDD")
      // (val) => moment(val.ETA).format("YYYYMMDD") == _value
    );
    setValues(data);
  };
  const cleaeDateFilter = () => {
    setSelectedDate(null);
    setValues(masterValue);

    const allDayNumberElements = document.querySelectorAll(
      ".fc-daygrid-day-number"
    );
    allDayNumberElements.forEach((dayNumber) => {
      (dayNumber as HTMLElement).style.color = "";
    });
  };

  const parsePurchaseOrders = (combinedString: string): IPurchaseOrder[] => {
    // const rows = combinedString.match(
    //   /\d+\s*[·∙]\s*[^·∙]+?(?=\d+\s*[·∙]\s*|$)/g
    // );

    // const rows = combinedString.match(
    //   /\d+\s*[-.]\s*[^-.]+?(?=\d+\s*[-.]\s*|$)/g
    // );

    // const rows = combinedString.match(/\d+\s*[-,.]\s*[^-.,\d]+/g);

    // const rows = combinedString.match(/\d+\s*[-,.∙]\s*[^-.,∙\d]+/g);

    const rows = combinedString.match(
      /\d+\s*[·∙,.-]\s*.+?(?=\d+\s*[·∙,.-]\s*|$)/g
    );

    return rows ? rows.map((row) => ({ content: row.trim() })) : [];
  };

  useEffect(() => {
    setLoader(true);
    const fetchData = async () => {
      try {
        // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");

        const _isAdmin = await isCurrentUserIsadmin("aclhub Owners");

        // let _isadmin = await isCurrentUserIsadmin("Achaulien Owners");
        setIsadmin(_isAdmin);
        let x = await getNewListData(Config.ListNames.Shipment);
        await getAttachmentUrls(Config.ListNames.Shipment, x);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    getSearchFilter(filter);
  }, [filter]);

  return (
    <div>
      <div className={styles.shipmentContainer}>
        <Toast ref={toast} />

        <div
          className={styles.calenderSection}
          // style={{ width: "40%" }}
        >
          <div className={styles.ETATitle}>ETA</div>
          <div className={styles.calendarContainer}>
            <div id="myCalendar"></div>
          </div>
        </div>
        {loader ? (
          <div className={styles.loadingStyle}>
            <Loader />
          </div>
        ) : (
          <div
            className={styles.shipmentSection}
            // style={{ width: "60%" }}
          >
            <div className={styles.header}>
              <div className={styles.selectShipData}>
                {/* <p>Shipments</p> */}
                <p>
                  {selectedDate
                    ? `Shipments on ${moment(selectedDate).format(
                        "D MMM YYYY"
                      )}`
                    : ` All Shipments  (${values?.length})`}
                </p>
                {selectedDate && (
                  <i className="pi pi-times" onClick={cleaeDateFilter}></i>
                )}
              </div>

              <div className={styles.headerSection}>
                <img
                  src={`${ApiCallImg}`}
                  alt=""
                  onClick={() => setIsApi(true)}
                />

                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" color="#FF1721">
                    {" "}
                  </InputIcon>
                  <InputText
                    v-model="value1"
                    placeholder="Search"
                    value={filter}
                    onChange={(e) => {
                      const allDayNumberElements = document.querySelectorAll(
                        ".fc-daygrid-day-number"
                      );
                      allDayNumberElements.forEach((dayNumber) => {
                        (dayNumber as HTMLElement).style.color = "";
                      });
                      setFilter(e.target.value);
                      getSearchFilter(e.target.value);
                    }}
                    className={` Shipmentsearch ${styles.searchField}`}
                  />
                </IconField>
                {isadmin && (
                  <Button
                    label="Add New"
                    className={styles.button}
                    onClick={() => {
                      setID(null);
                      setFilter("");
                      cleaeDateFilter();
                      setIsEdit(false);

                      setVisible(true);
                    }}
                  />
                )}
              </div>
            </div>

            <>
              <div className={styles.contentSection}>
                {values.length > 0 ? (
                  values.map((attachment: any, index: number) => (
                    <div key={index}>
                      {attachment.AttachmentFiles.data.containers.map(
                        (container: any, containerIndex: number) => (
                          <div
                            // onClick={() => {
                            //   setIsPopup(true);
                            //   setSelectedvalue(attachment);
                            // }}
                            key={containerIndex}
                            className={styles.contentBox}
                          >
                            <div
                              className={styles.ContentContainer}
                              // style={{ display: "flex" }}
                            >
                              <div
                                className={styles.leftSection}
                                // style={{ width: "40%", cursor: "pointer" }}
                                onClick={() => {
                                  setIsPopup(true);
                                  setSelectedvalue(attachment);
                                }}
                              >
                                <div className={styles.purchaseOrderList}>
                                  {parsePurchaseOrders(
                                    attachment?.Containername
                                  )?.map((po, index) => (
                                    <div
                                      key={index}
                                      title={po.content}
                                      className={styles.purchaseOrderRow}
                                    >
                                      <span>{po.content}</span>
                                    </div>
                                  ))}
                                </div>

                                <span className={styles.containerNumber}>
                                  {container.number}
                                </span>
                                {/* <p className={styles.containerName}>
                                  {attachment?.Containername} -{" "}
                                  <span className={styles.containerNumber}>
                                    {container.number}
                                  </span>
                                </p> */}
                                <div className={styles.containersizeContainer}>
                                  <p>{container.size_type} </p>
                                  <img src={`${shipImg}`} alt="" />
                                </div>
                                <p className={styles.ETA}>
                                  ETA
                                  <span>
                                    {attachment
                                      ? moment(
                                          attachment?.AttachmentFiles.data
                                            ?.route?.pod?.date
                                        ).format("D MMM YYYY")
                                      : ""}
                                  </span>
                                </p>
                              </div>
                              <div className={styles.rightSection}>
                                <>
                                  <ProgressBar
                                    percentageComplete={calculatePercentage(
                                      container
                                    )}
                                    polLocation={findLocationNameById(
                                      attachment.AttachmentFiles.data.route.pol
                                        .location,
                                      attachment.AttachmentFiles.data.locations
                                    )}
                                    podLocation={findLocationNameById(
                                      attachment.AttachmentFiles.data.route.pod
                                        .location,
                                      attachment.AttachmentFiles.data.locations
                                    )}
                                    polActual={
                                      attachment.AttachmentFiles.data.route.pol
                                        .actual
                                        ? attachment.AttachmentFiles.data.route
                                            .pol.actual
                                        : attachment.AttachmentFiles.data.route
                                            .prepol.actual
                                    }
                                    podActual={
                                      attachment.AttachmentFiles.data.route.pod
                                        .actual
                                        ? attachment.AttachmentFiles.data.route
                                            .pod.actual
                                        : attachment.AttachmentFiles.data.route
                                            .postpod.actual
                                    }
                                  />
                                </>
                                {/* <ShippingTimeline
                          polLocation={findLocationNameById(
                            attachment.AttachmentFiles.data.route.pol.location,
                            attachment.AttachmentFiles.data.locations
                          )}
                          podLocation={findLocationNameById(
                            attachment.AttachmentFiles.data.route.pod.location,
                            attachment.AttachmentFiles.data.locations
                          )}
                        /> */}

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    margin: !isadmin
                                      ? "20px 0px 0px 0px"
                                      : "15px 0px 0px 0px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "5px",
                                      alignItems: "center",
                                    }}
                                  >
                                    {isadmin && (
                                      <img
                                        src={`${RefreshImg}`}
                                        alt=""
                                        id="refreshIcon"
                                        style={{
                                          cursor: "pointer",
                                          width: "23px",
                                          height: "23px",
                                        }}
                                        onClick={() => {
                                          cleaeDateFilter();
                                          getApiData(
                                            "refresh",
                                            attachment.ContainerNo,
                                            attachment.ID
                                          );
                                        }}
                                      />
                                    )}

                                    <p
                                      style={{
                                        margin: 0,
                                        color: "#8A8A8A",
                                        fontSize: "11px",
                                        fontWeight: 500,
                                      }}
                                    >{` ( ${attachment?.Modified} )`}</p>
                                    <Tooltip
                                      target="#refreshIcon"
                                      content="Refresh"
                                      position="bottom"
                                    />
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    {/* <img src={`${dotImg}`} alt="" /> */}
                                    <span
                                      style={{
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: "50%",
                                        background: "#1D4E86",
                                      }}
                                    ></span>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        color: "#818181",
                                      }}
                                    >
                                      {attachment?.AttachmentFiles.data.metadata
                                        .status == "IN_TRANSIT"
                                        ? "IN TRANSIT"
                                        : attachment?.AttachmentFiles.data
                                            .metadata.status}
                                    </p>
                                    {isadmin && (
                                      <>
                                        <img
                                          id="editIcon"
                                          src={`${EditImg}`}
                                          alt=""
                                          onClick={() => {
                                            cleaeDateFilter();
                                            EditHandler(attachment);
                                          }}
                                          style={{
                                            cursor: "pointer",
                                            width: "23px",
                                            height: "23px",
                                          }}
                                        />
                                        <img
                                          onClick={() => {
                                            cleaeDateFilter();
                                            setIsDelete(true);

                                            setID(attachment.ID);
                                          }}
                                          id="deleteIcon"
                                          src={`${DeleteImg}`}
                                          alt=""
                                          style={{
                                            cursor: "pointer",
                                            width: "23px",
                                            height: "23px",
                                          }}
                                        />
                                      </>
                                    )}

                                    <Tooltip
                                      target="#editIcon"
                                      content="Edit"
                                      position="bottom"
                                    />
                                    <Tooltip
                                      target="#deleteIcon"
                                      content="Delete"
                                      position="bottom"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    No shipments found !!!
                  </div>
                )}
              </div>
            </>
          </div>
        )}
      </div>
      <Dialog
        // className="Shipments"
        className={`Shipments  ${styles.addnewDialog}`}
        visible={visible}
        // style={{ width: "40vw" }}
        onHide={() => {
          setVisible(false);
        }}
      >
        <div className={styles.dialogcontainer}>
          <div className={styles.addnewHeader}>
            <p>Add New Shipments</p>
            <span></span>
          </div>

          <div className={styles.textfieldContainer}>
            <div className={styles.textBox}>
              <label htmlFor="">Enter Tracking name</label>
              <InputText
                value={Shipments.Containername || ""}
                style={{ width: "100%" }}
                onChange={(e) => {
                  onchangevalues("Containername", e.target.value);
                }}
              />
            </div>
            <div className={styles.textBox}>
              <label htmlFor="">Enter Tracking number</label>
              <InputText
                style={{ width: "100%" }}
                value={Shipments.TrackingNumber || ""}
                onChange={(e) => {
                  onchangevalues("TrackingNumber", e.target.value);
                }}
              />
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              label="Cancel"
              className={styles.cancelButton}
              onClick={() => {
                setVisible(false);
                setShipments({
                  Containername: "",
                  ID: null,
                  TrackingNumber: "",
                });
              }}
            />

            <Button
              label={isEdit ? "Update" : "Submit"}
              className={styles.saveButton}
              onClick={async () => {
                const isValid = await validateInputs();
                if (isValid) {
                  if (isEdit) {
                    if (
                      initialShipment.TrackingNumber !==
                      Shipments.TrackingNumber
                    ) {
                      getApiData("", Shipments.TrackingNumber, Shipments.ID);
                    } else {
                      updateOnly(Shipments.ID);
                    }
                  } else {
                    getApiData("", Shipments.TrackingNumber, Shipments.ID);
                  }
                }
              }}
            />
          </div>
        </div>
      </Dialog>

      {/* //api Dialog */}

      <Dialog
        className={`ApicallDialog ${styles.apiDialog}`}
        visible={isAPI}
        // style={{ width: "35vw" }}
        onHide={() => {
          setIsApi(false);
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "10px 10px 0px 0px",
            }}
          >
            <i
              className="pi pi-times"
              style={{ cursor: "pointer" }}
              onClick={() => setIsApi(false)}
            ></i>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              margin: "0px 0px 15px 0px",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "#FF1721",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 2,
              }}
            >
              API usage
            </h4>
            <span
              style={{ borderBottom: " 3px solid #FF1721", width: "25%" }}
            ></span>
          </div>

          <div style={{}}>
            <p
              style={{
                color: "#8A8A8A",
                fontSize: "13px",
                fontWeight: "500",
                margin: "8px 0px",
              }}
            >
              The total number of calls for this month :{" "}
              <span style={{ color: "#FF1721" }}>
                {lastModified
                  ? lastModified.AttachmentFiles.data.metadata.api_calls.total
                  : null}
              </span>
            </p>
            <p
              style={{
                color: "#8A8A8A",
                fontSize: "13px",
                fontWeight: "500",
                margin: "8px 0px",
              }}
            >
              The total number of calls completed this month :{" "}
              <span style={{ color: "#FF1721" }}>
                {lastModified
                  ? lastModified.AttachmentFiles.data.metadata.api_calls.used
                  : null}
              </span>
            </p>
            <p
              style={{
                color: "#8A8A8A",
                fontSize: "13px",
                fontWeight: "500",
                margin: "8px 0px",
              }}
            >
              The total number of calls available this month :{" "}
              <span style={{ color: "#FF1721" }}>
                {lastModified
                  ? lastModified.AttachmentFiles.data.metadata.api_calls
                      .remaining
                  : null}
              </span>
            </p>
          </div>
        </div>
      </Dialog>

      {/* // Timeline Dialog */}

      <Dialog
        // className="ApicallDialog"
        className={`ApicallDialog ${styles.timelineDialog}`}
        visible={isPopup}
        // style={{ width: "60vw" }}
        onHide={() => {
          // if (!visible) return;
          setIsPopup(false);
        }}
      >
        <div style={{ position: "relative" }}>
          <i
            className="pi pi-times"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "10px 0px",
              cursor: "pointer",
            }}
            onClick={() => {
              setStep(0);
              setIsPopup(false);
            }}
          ></i>

          <div style={{ width: "100%" }}>
            {step === 0 ? (
              <TimelineComponent
                Attachment={selectedvalue}
                setIsPopup={setIsPopup}
              />
            ) : (
              <MapComponent routeData={selectedvalue?.AttachmentFiles} />
            )}
          </div>

          {step > 0 && (
            <Button
              icon="pi pi-chevron-left"
              className="p-button-secondary"
              onClick={prevStep}
              style={{
                position: "fixed",
                top: "50%",
                // left: "0px",
                zIndex: 9999,
              }}
            />
          )}
          {step < 1 && (
            <Button
              icon="pi pi-chevron-right"
              className="p-button-secondary"
              onClick={nextStep}
              style={{ position: "absolute", top: "50%", right: "0px" }}
            />
          )}
        </div>
        {/* <div>
          <TimelineComponent
            Attachment={selectedvalue}
            setIsPopup={setIsPopup}
          />
          <MapComponent routeData={selectedvalue} />
        </div> */}
      </Dialog>

      {/* delete popup*/}

      <ConfirmDialog
        className="Deletemodal"
        visible={isDelete}
        onHide={() => setIsDelete(false)}
        message="Are you sure you want to delete?"
        acceptClassName="p-button-danger"
        acceptLabel="Yes"
        header="Confirmation"
        rejectLabel="No"
        accept={handleDelete}
        reject={() => setIsDelete(false)}
      />
    </div>
  );
};
export default Maincomponent;
