/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from "react";
import "../../Global/Style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import styles from "./AllShipments.module.scss";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
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
import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import MapComponent from "./MapComponent";
import { isCurrentUserIsadmin } from "../../Global/Admin";
import { sp } from "@pnp/sp/presets/all";
import { InputTextarea } from "primereact/inputtextarea";

//global variable
const EditImg: any = require("../../Global/Images/Edit.png");
const DeleteImg: any = require("../../Global/Images/Delete.png");
const RefreshImg: any = require("../../Global/Images/Refresh.png");
const shipImg: any = require("../../Global/Images/Ship.png");
const ApiCallImg: any = require("../../Global/Images/Apicall.svg");
const BackImg: any = require("../../Global/Images/Leftarrow.svg");
const resetImg: any = require("../../Global/Images/reload.png");

interface IPurchaseOrder {
  content: string;
}

let TrackingId: any;

let objFilter = {
  Mainfield: "",
  eta: null,
  Status: "",
  sortOrder: { name: "", code: "" },
};

const Maincomponent = (props: any) => {
  const url = props.context.pageContext.web.absoluteUrl;

  //state variable

  const [isadmin, setIsadmin] = useState<any>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [values, setValues] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isAPI, setIsApi] = useState<boolean>(false);
  const [lastModified, setLastModified] = useState<any>(null);
  const [masterValue, setMasterValue] = useState<any>([]);
  const [selectedvalue, setSelectedvalue] = useState<any>(null);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [Id, setID] = useState<any>(null);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [statusOption, setStatusOption] = useState<any>([]);
  const [filterValue, setFilterValue] = useState({
    Mainfield: "",
    eta: null,
    Status: "",
    sortOrder: { name: "", code: "" },
  });
  const toast = useRef<any>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState<any | null>(null);

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

  const getColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          background: "#E0FFE6",

          color: "#00D42F",
        };

      case "MARKED AS DELIVERED":
        return {
          background: "#FEFFE0",
          color: "#D4B200",
        };
      case "IN TRANSIT":
        return {
          background: "#E0F1FF",
          color: "#0078D4",
        };
      case "UNKNOWN":
        return {
          background: "#FCE0FF",
          color: "#D400CC",
        };

      case "PLANNED":
        return {
          background: "#E0E1FF",
          color: "#0008D4",
        };

      case "REACHED":
        return {
          background: "#55555520",
          color: "#555",
        };
      default:
        return { backgroundColor: "#6c757d", color: "#fff" };
    }
  };

  const getNewListData = async (listName: string, ischeck: string) => {
    let _curData: any[] = [];

    try {
      let res;
      if (ischeck === "ischeck") {
        res = await sp.web.lists
          .getByTitle(listName)
          .items.select("*, AttachmentFiles")
          .expand("AttachmentFiles")
          .get();
      } else {
        res = await sp.web.lists
          .getByTitle(listName)
          .items.select("*, AttachmentFiles")
          .filter("isDelete ne 1 and isDelivered ne 1 and isPosted ne 1 and isReached ne 1")

          // .filter("isDelete ne 1 ")
          .expand("AttachmentFiles")
          .get();
      }

      _curData = res.map((val: any) => ({
        ID: val.ID || null,
        ContainerNumber: val.Title || "",
        ContainerName: val.ContainerName || "",
        Created: val.Created ? val.Created : "",
        isDelete: val.isDelete ? val.isDelete : false,
        // ETA: val.ETA ? moment(val?.ETA) : null,
        isPosted: val.isPosted ? val.isPosted : false,
        isDelivered: val.isDelivered ? val.isDelivered : false,
        isReached: val?.isReached ? val?.isReached : false,
        AttachmentFiles: val?.AttachmentFiles[0]?.FileName || "",
        Modified: val.Modified ? calculateTimeDifference(val.Modified) : "",
        LastModified: val.Modified || "",
      }));
    } catch (err) {
      console.log(err);
    }

    return _curData;
  };

  const calculateTimeDifference = (modifiedDate: any) => {
    const now: any = new Date();
    const modified: any = new Date(modifiedDate);
    const difference = Math.abs(now - modified);
    const minutesDifference = Math.floor(difference / (1000 * 60));

    if (minutesDifference < 60) {
      return `${minutesDifference} minute${minutesDifference !== 1 ? "s" : ""
        } ago`;
    }

    const hoursDifference = Math.floor(minutesDifference / 60);
    if (hoursDifference < 24) {
      return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
    }

    const daysDifference = Math.floor(hoursDifference / 24);
    return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
  };
  //new 1 code

  const getAttachmentUrls = async (listName: any, itemIds: any) => {
    try {
      const promises = itemIds.map(async (item: any) => {
        try {
          const res = await sp.web.lists
            .getByTitle(listName)
            .items.getById(item.ID)
            .attachmentFiles.getByName(item.AttachmentFiles)
            .getText();

          const parsedData = JSON.parse(res);

          return {
            ContainerNo: item.ContainerNumber,
            ID: item.ID,
            // ETA: item.ETA ? new Date(item.ETA) : null,
            start: parsedData ? parsedData.data?.route?.pod?.date : null,
            Status: item.isPosted
              ? "MARKED AS DELIVERED"
              : item?.isDelivered ? "DELIVERED" : item?.isReached ? "REACHED" : parsedData
                ? parsedData.data?.metadata?.status
                : "",
            Created: item.Created || "",
            // start: new Date(item.ETA) || null,
            // end: new Date(item.ETA) || null,
            Containername: item?.ContainerName,
            isPosted: item.isPosted ? item.isPosted : false,
            isDelivered: item.isDelivered ? item.isDelivered : false,
            isReached: item?.isReached ? item?.isReached : false,
            AttachmentFiles: parsedData,
            Modified: item.Modified,
            LastModified: item.LastModified,
            SPosition: parsedData?.data?.route
              ? findLocationNameById(
                parsedData.data.route.pol.location,
                parsedData.data.locations
              )
              : "",
            EPosition: parsedData?.data?.route
              ? findLocationNameById(
                parsedData.data.route.pod.location,
                parsedData.data.locations
              )
              : "",
          };
        } catch (err) {
          console.error("Error fetching data for item:", item.ID, err);
          return null; // Return null if there was an error
        }
      });

      const results = await Promise.all(promises);
      const array = results.filter((result) => result !== null); // Filter out null results

      // BindCalender(array);

      // array.sort((a, b) => {
      //   const monthA: any = new Date(a.start);
      //   const monthB: any = new Date(b.start);
      //   return monthA - monthB;
      // });

      // array.sort((a, b) => {
      //   const dateA: any = new Date(a.start);
      //   const dateB: any = new Date(b.start);

      //   if (dateA && dateB) {
      //     // Compare by year, month, and day
      //     return dateA - dateB; // Ascending order
      //   }

      //   // Handle cases where one or both dates are null or undefined
      //   if (!dateA && dateB) return 1;
      //   if (dateA && !dateB) return -1;

      //   return 0;
      // });

      array.sort((a, b) => {
        const statusOrder = (status: string) => {
          // Define priority for status
          return status === "IN_TRANSIT" ? 0 : 1;
        };

        const statusA = statusOrder(a.Status);
        const statusB = statusOrder(b.Status);

        // First, sort by Status
        if (statusA !== statusB) {
          return statusA - statusB; // "intransit" comes first
        }

        // If Status is the same, sort by start date
        const dateA: any = new Date(a.start);
        const dateB: any = new Date(b.start);

        if (dateA && dateB) {
          return dateA - dateB; // Ascending order
        }

        // Handle cases where one or both dates are null or undefined
        if (!dateA && dateB) return 1;
        if (dateA && !dateB) return -1;

        return 0;
      });

      // const latestModifiedItem = array.reduce((latest: any, item: any) => {
      //   return new Date(item.LastModified) > new Date(latest.LastModified)
      //     ? item
      //     : latest;
      // }, array[0]);
      // console.log(array, "array");

      // setLastModified(latestModifiedItem);

      const statusOptions = getUniqueStatusOptions(array);
      console.log(statusOptions, "statusOptions");

      setStatusOption([...statusOptions]);

      setLoader(false);
      setVisible(false);
      setValues(array);
      setMasterValue(array);
      setFilterValue({
        ...filterValue,
        sortOrder: { name: "", code: "" },
      });
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

      return array;
    } catch (error) {
      console.error("Error in getAttachmentUrls:", error);
      setLoader(false);
      return [];
    }
  };
  const getUniqueStatusOptions = (data: any[]) => {
    const uniqueStatuses = Array.from(
      new Set(data.map((item) => item.Status))
    ).filter(Boolean);
    return uniqueStatuses.map((status) => ({
      name: status == "MARKED AS DELIVERED" ? "MARKED AS DELIVERED" : status,
      code: status == "MARKED AS DELIVERED" ? "MARKED AS DELIVERED" : status,
    }));
  };

  // const getAttachments = async (listName: any, itemIds: any) => {
  //   try {
  //     const promises = itemIds.map(async (item: any) => {
  //       try {
  //         const res = await sp.web.lists
  //           .getByTitle(listName)
  //           .items.getById(item.ID)
  //           .attachmentFiles.getByName(item.AttachmentFiles)
  //           .getText();

  //         const parsedData = JSON.parse(res);

  //         return {
  //           ContainerNo: item.ContainerNumber,
  //           ID: item.ID,
  //           // ETA: item.ETA ? new Date(item.ETA) : null,
  //           start: parsedData ? parsedData.data?.route?.pod?.date : "",
  //           // start: new Date(item.ETA) || null,
  //           // end: new Date(item.ETA) || null,
  //           Containername: item.ContainerName,
  //           AttachmentFiles: parsedData,
  //           Modified: item.Modified,
  //           LastModified: item.LastModified,
  //           SPosition: parsedData?.data?.route
  //             ? findLocationNameById(
  //               parsedData.data.route.pol.location,
  //               parsedData.data.locations
  //             )
  //             : "",
  //           EPosition: parsedData?.data?.route
  //             ? findLocationNameById(
  //               parsedData.data.route.pod.location,
  //               parsedData.data.locations
  //             )
  //             : "",
  //         };
  //       } catch (err) {
  //         console.error("Error fetching data for item:", item.ID, err);
  //         return null; // Return null if there was an error
  //       }
  //     });

  //     const results = await Promise.all(promises);
  //     const array = results.filter((result) => result !== null); // Filter out null results

  //     // BindCalender(array);

  //     // array.sort((a, b) => {
  //     //   const monthA: any = new Date(a.start);
  //     //   const monthB: any = new Date(b.start);
  //     //   return monthA - monthB;
  //     // });

  //     // const latestModifiedItem = array.reduce((latest: any, item: any) => {
  //     //   return new Date(item.LastModified) > new Date(latest.LastModified)
  //     //     ? item
  //     //     : latest;
  //     // }, array[0]);

  //     // setLastModified(latestModifiedItem);

  //     // console.log(array, "array");
  //     // setLoader(false);
  //     // setVisible(false);
  //     // setShipments({
  //     //   ID: null,
  //     //   Containername: "",
  //     //   TrackingNumber: "",
  //     // });

  //     // setInitialShipment({
  //     //   ID: null,
  //     //   Containername: "",
  //     //   TrackingNumber: "",
  //     // });
  //     // setValues(array);
  //     // setMasterValue(array);

  //     return array;
  //   } catch (error) {
  //     console.error("Error in getAttachmentUrls:", error);
  //     setLoader(false);
  //     return [];
  //   }
  // };

  const findLocationNameById = (id: any, locations: any) => {
    const location = locations.find((loc: any) => loc.id === id);
    return location && location.name !== null
      ? location.name
      : location?.country_code;
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

      let data = await response.json();
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

  const checkDelivery = (response: any) => {
    if (!response || !response.data) {
      return false;
    }

    const podLocationId = response.data.route?.pod?.location;
    const locations = response.data.locations;
    const routeDataPin = response.data.route_data.pin;

    if (!podLocationId || !locations || !routeDataPin) {
      return false
    }

    const podLocation = locations.find((loc: any) => loc.id === podLocationId);

    if (!podLocation) {
      return false;
    }

    const podLat = podLocation.lat;
    const podLng = podLocation.lng;

    // Check if route_data.pin exists and has the expected format
    if (routeDataPin && routeDataPin.length === 2) {
      const pinLat = routeDataPin[0];
      const pinLng = routeDataPin[1];

      const isDelivered = podLat === pinLat && podLng === pinLng;
      return isDelivered;
    } else {
      return false
    }
  }

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
      isDelivered: description.data.metadata?.status === "DELIVERED" ? true : false,
      isReached: checkDelivery(description) || false
      // isDelivered:
      //   description.data.metadata?.status === "DELIVERED" || checkDelivery(description)
      // isDelivered:
      //   description.data.metadata.status == "DELIVERED" ? true : false,
      // ETA: new Date(),
    };
    const onlyDelivered = {
      isDelivered: description.data.metadata?.status === "DELIVERED" ? true : false,
      isReached: checkDelivery(description) || false
      // isDelivered:
      //   description.data.metadata?.status === "DELIVERED" || checkDelivery(description)

    }

    try {
      // Update item in the list


      await sp.web.lists
        .getByTitle(listName)
        .items.getById(itemId)
        .update(action === "refresh" ? onlyDelivered : itemData)
      // action !== "refresh" &&
      //   (await sp.web.lists
      //     .getByTitle(listName)
      //     .items.getById(itemId)
      //     .update(itemData));

      // Create file from JSON data
      const file = _handleRichText(jsonData, fileName);

      // Update the attachment
      await updateAttachmentToListItem(listName, itemId, file);

      const _listData = await getNewListData(listName, "");

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



      if (TrackingId?.length) {
        await sp.web.lists
          .getByTitle(Config.ListNames.TrackingId)
          .items.getById(TrackingId[0]?.ID)
          .update({
            Title: itemId.toString(),
          }).then(() => {

            getTrackingIDConfig()

          }).catch((err) => {
            console.log(err);


          })
      }

      else {

        await sp.web.lists
          .getByTitle(Config.ListNames.TrackingId)
          .items

          .add({
            Title: itemId.toString()
          }).then((res) => {
            getTrackingIDConfig()


          }).catch((err) => {
            console.log(err);

          })

      }





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
      isDelivered:
        description.data.metadata.status == "DELIVERED" ? true : false,
      // ETA: description ? new Date(description?.data?.route?.pod?.date) : null,
    };

    try {
      // Step 1: Add item to list and get the new item ID
      const itemId = await addItemToList(listName, itemData);

      // Step 2: Create file from JSON data
      const file = _handleRichText(jsonData, fileName);

      // Step 3: Add the attachment to the new item
      await addAttachmentToListItem(listName, itemId.Id, file);

      const _listData: any = await getNewListData(listName, "");

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
        .then(async (res: any) => {


          if (TrackingId?.length) {
            sp.web.lists
              .getByTitle(Config.ListNames.TrackingId)
              .items.getById(TrackingId[0].ID)
              .update({
                Title: itemId.toString(),
              }).then(() => {
                getTrackingIDConfig()

              }).catch((err) => {
                console.log(err);


              })
          }

          else {

            await sp.web.lists
              .getByTitle(Config.ListNames.TrackingId)
              .items

              .add({
                Title: itemId.toString()
              }).then((res) => {
                getTrackingIDConfig()


              }).catch((err) => {
                console.log(err);

              })

          }








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

  const handleSearch = (val: any) => {
    let filteredResults = masterValue;

    // Apply Mainfield filter
    if (val.Mainfield) {
      const searchValue = val.Mainfield.trim().toLowerCase();
      filteredResults = filteredResults.filter(
        (item: any) =>
          item?.ContainerNo?.toLowerCase().includes(searchValue) ||
          item?.Containername?.toLowerCase().includes(searchValue) ||
          item?.EPosition?.toLowerCase().includes(searchValue) ||
          item?.SPosition?.toLowerCase().includes(searchValue)
      );
    }

    // Apply Status filter
    if (val.Status) {
      filteredResults = filteredResults.filter(
        (li: any) => li.Status === val.Status.name
      );
    }

    // Apply ETA filter
    if (val.eta) {
      const formattedEta = moment(val.eta).format("MMDDYYYY");
      filteredResults = filteredResults.filter(
        (li: any) => moment(li.start).format("MMDDYYYY") === formattedEta
      );
    }
    if (val.sortOrder.name) {
      filteredResults = filteredResults.sort((a: any, b: any) => {
        const dateA = a.Created ? moment(a.Created) : null;
        const dateB = b.Created ? moment(b.Created) : null;

        // If both dates are valid, sort according to the selected order
        if (dateA && dateB) {
          return val?.sortOrder?.name === "Newer to older"
            ? dateB.diff(dateA)
            : dateA.diff(dateB);
        }

        // If one of the dates is null/empty, place it after valid dates
        if (!dateA && dateB) return 1;
        if (dateA && !dateB) return -1;

        // If both dates are null/empty, maintain their order
        return 0;
      });
    }
    // Update the state with filtered results
    setValues(filteredResults);
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
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
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
  const validateInputs = async (ischeck: string) => {
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
    // Check for duplicate tracking number
    // let check = await getNewListData(Config.ListNames.Shipment, ischeck);
    // console.log(check, "check");
    // let trackingNumberDuplicate = check?.some(
    //   (item: any) =>
    //     item.ContainerNumber.trim() === Shipments.TrackingNumber.trim() &&
    //     item.ID !== Shipments.ID
    // );
    // if (trackingNumberDuplicate) {
    //   toast.current.show({
    //     severity: "error",
    //     summary: "Validation Error",
    //     detail: "Tracking number already exists.",
    //     life: 3000,
    //   });
    //   return false;
    // }


    let check = await getNewListData(Config.ListNames.Shipment, ischeck);
    // let valusescheck = await getAttachments(Config.ListNames.Shipment, check);
    console.log(check, "check");
    let trackingNumberDuplicate = check?.find(
      (item: any) =>
        item?.ContainerNumber.trim() === Shipments.TrackingNumber.trim() &&
        item.ID !== Shipments.ID
    );



    if (trackingNumberDuplicate) {


      if (
        trackingNumberDuplicate.isDelete === true &&
        trackingNumberDuplicate.isDelivered === false &&
        trackingNumberDuplicate.isReached === false &&
        trackingNumberDuplicate.isPosted === false
      ) {
        setVisible(false)
        setConfirmData({ ...trackingNumberDuplicate })
        setConfirmVisible(true);
        return false;
      }







      else if (trackingNumberDuplicate.isDelivered === true || trackingNumberDuplicate.isReached === true || trackingNumberDuplicate.isPosted === true) {
        // toast.current.show({
        //   severity: "error",
        //   summary: "Validation Error",
        //   detail: `Tracking number already exists ${trackingNumberDuplicate.isDelivered ? "and is  Delivered." : trackingNumberDuplicate.isReached ? "and is REACHED." : trackingNumberDuplicate.isPosted ? "and is MARKED AS DELIVERY." : ""}`,
        //   life: 3000,
        // });

        const status = trackingNumberDuplicate.isDelivered
          ? "DELIVERED"
          : trackingNumberDuplicate.isReached
            ? "REACHED"
            : "MARKED AS DELIVERED";

        toast.current.show({
          severity: "error",
          summary: "Validation for duplicate",
          detail: `Tracking Number ${trackingNumberDuplicate?.ContainerNumber || Shipments?.TrackingNumber} already exists with the status ${status}. Please use a different tracking number`,

          // detail: `Tracking Number: ${trackingNumberDuplicate.ContainerNumber || Shipments.TrackingNumber} already exists.\nStatus: ${status}.`,

          // detail: `Shipment No: ${trackingNumberDuplicate.ContainerNumber||Shipments.TrackingNumber} is already ${status}.`,
          life: 3000,
        });
        return false;
      }
      else {
        toast.current.show({
          severity: "error",
          summary: "Validation for duplicate",
          detail: "Tracking number already exists.",
          life: 3000,
        });
        return false
      }
    }


    return true;
  };
  const cleaeDateFilter = () => {
    filterValue.Mainfield = "";
    filterValue.Status = "";
    filterValue.eta = null;
    (filterValue.sortOrder = {
      name: "",
      code: "",
    }),
      setFilterValue({ ...filterValue });

    objFilter.Mainfield = ""; // Reset to initial state
    objFilter.Status = ""; // Reset to initial state
    objFilter.eta = null;
    (objFilter.sortOrder = {
      name: "",
      code: "",
    }),
      masterValue.sort((a: any, b: any) => {
        const statusOrder = (status: string) => {
          // Define priority for status
          return status === "IN_TRANSIT" ? 0 : 1;
        };

        const statusA = statusOrder(a.Status);
        const statusB = statusOrder(b.Status);

        // First, sort by Status
        if (statusA !== statusB) {
          return statusA - statusB; // "intransit" comes first
        }

        // If Status is the same, sort by start date
        const dateA: any = new Date(a.start);
        const dateB: any = new Date(b.start);

        if (dateA && dateB) {
          return dateA - dateB; // Ascending order
        }

        // Handle cases where one or both dates are null or undefined
        if (!dateA && dateB) return 1;
        if (dateA && !dateB) return -1;

        return 0;
      });
    setValues(masterValue);

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

    // const rows = combinedString.match(
    //   /\d+\s*[·∙,.-]\s*.+?(?=\d+\s*[·∙,.-]\s*|$)/g
    // );

    // const rows = combinedString.match(/\d+\s*[-,]\s*[^-\n,]+/g);
    // const rows = combinedString.match(/\d+\s*[-,]\s*[^-\n,]+/g);

    //new

    const rows = combinedString.match(
      /\d+\s*[·∙,.-]\s*[\s\S]+?(?=\d+\s*[·∙,.-]\s*|$)/g
    );

    return rows ? rows.map((row) => ({ content: row.trim() })) : [];
  };

  const handleResponsiveChange = (): void => {
    setIsMobile(window.innerWidth <= 768);
  };

  const getApiCallStyle = (remaining: number | undefined | null | string) => {
    const remainingValue =
      typeof remaining === "string" ? Number(remaining) : remaining;

    if (
      remainingValue === null ||
      remainingValue === undefined ||
      isNaN(remainingValue)
    ) {
      return {}; // No style if remaining is null, undefined, or invalid
    } else if (remainingValue >= 1000 && remainingValue < 3000) {
      return { backgroundColor: "#CDFFCF", color: "#04B23F" }; // Green background
    } else if (remainingValue >= 500 && remainingValue < 1000) {
      return { backgroundColor: "#F9FFBB", color: "#A28600" }; // Yellow background
    } else if (remainingValue >= 0 && remainingValue < 500) {
      return { backgroundColor: "#FFDAD8", color: "#B41600" }; // Red background
    } else {
      return {}; // No style for values outside these ranges
    }
  };

  const getResponses = (
    remaining: number | undefined | null | string,
    totalCalls: number
  ) => {
    // Convert remaining to a number if it's a string
    const remainingValue =
      typeof remaining === "string" ? Number(remaining) : remaining;

    // Calculate percentage remaining
    const percentageRemaining =
      remainingValue !== null &&
        remainingValue !== undefined &&
        !isNaN(remainingValue)
        ? (remainingValue / totalCalls) * 100
        : 0;

    // Determine style based on percentage remaining
    if (percentageRemaining < 10) {
      return { backgroundColor: "#FFDAD8", color: "#B41600" }; // Red for below 10%
    } else if (percentageRemaining >= 20 && percentageRemaining <= 30) {
      return { backgroundColor: "#F9FFBB", color: "#A28600" }; // Yellow for 20% to 30%
    } else if (percentageRemaining > 30 && percentageRemaining <= 50) {
      return { backgroundColor: "#CDFFCF", color: "#04B23F" }; // Green for 30% to 50%
    } else {
      return {}; // No style for other percentages
    }
  };


  const Popupconfirmcheck = async (data: any) => {
    debugger;
    setVisible(false);

    setLoader(true);
    await sp.web.lists
      .getByTitle(Config.ListNames.Shipment)
      .items.getById(data.ID)
      .update({
        isDelete: false,
        ContainerName: Shipments.Containername,
      })
      .then(async (res: any) => {

        const item: any = await sp.web.lists
          .getByTitle(Config.ListNames.Shipment)
          .items.getById(data.ID)
          .attachmentFiles.getByName(data.AttachmentFiles)
          .getText();

        const parsedData = JSON.parse(item);

        const newdata = {
          ContainerNo: data.ContainerNumber,
          ID: data.ID,
          // ETA: data.ETA ? new Date(data.ETA) : null,
          start: parsedData ? parsedData.data?.route?.pod?.date : "",
          // start: new Date(data.ETA) || null,
          // end: new Date(data.ETA) || null,
          Containername: Shipments.Containername,
          AttachmentFiles: parsedData,
          Modified: data.Modified,
          LastModified: data.LastModified,
          SPosition: parsedData?.data?.route
            ? findLocationNameById(
              parsedData.data.route.pol.location,
              parsedData.data.locations
            )
            : "",
          EPosition: parsedData?.data?.route
            ? findLocationNameById(
              parsedData.data.route.pod.location,
              parsedData.data.locations
            )
            : "",
        };




        setValues((prevValues: any) => [...prevValues, newdata]);
        setMasterValue((prevValues: any) => [...prevValues, newdata]);
        // setMasterValue([...updatedClientDetail]);
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





  const getLatestModified = async () => {
    try {
      const latestItem = await sp.web.lists
        .getByTitle(Config.ListNames.Shipment)
        .items.getById(TrackingId[0]?.Title)

        .select("*, AttachmentFiles")
        .expand("AttachmentFiles")
        .get();

      if (latestItem) {
        const item = latestItem;

        if (item.AttachmentFiles && item.AttachmentFiles.length > 0) {
          // Get the first attachment file name
          const attachmentName = item.AttachmentFiles[0].FileName;

          const attachmentText = await sp.web.lists
            .getByTitle(Config.ListNames.Shipment)
            .items.getById(item.ID)
            .attachmentFiles.getByName(attachmentName)
            .getText();

          const parsedData = JSON.parse(attachmentText);

          console.log("Parsed Data: ", parsedData);
          setLastModified(parsedData);

          setIsApi(true)
        } else {
          console.log("No attachments found for the latest item.");
        }
      } else {
        console.log("No items found in the list.");
      }
    } catch (error) {
      console.error("Error fetching latest modified item:", error);
    }
  };

  const getTrackingIDConfig = async (): Promise<void> => {
    try {
      let trackingIDConfig = await sp.web.lists.getByTitle(Config.ListNames.TrackingId).items.get();

      TrackingId = trackingIDConfig;
      console.log(TrackingId);



    }
    catch (error) {
      console.error("Error Tracking Config ID: ", error);
    }
  }

  useEffect(() => {
    setLoader(true);
    const fetchData = async () => {
      try {
        // const _isAdmin = await isCurrentUserIsadmin("Ägare av Intranet Dev");
        getTrackingIDConfig()

        const _isAdmin = await isCurrentUserIsadmin(Config.ListNames.ProdAdmin);

        // let _isadmin = await isCurrentUserIsadmin("Achaulien Owners");
        setIsadmin(_isAdmin);
        let x = await getNewListData(Config.ListNames.Shipment, "");
        await getAttachmentUrls(Config.ListNames.Shipment, x);

        handleResponsiveChange();

        // Add event listener for resize
        window.addEventListener("resize", handleResponsiveChange);

        // Cleanup function to remove the event listener
        return () => {
          window.removeEventListener("resize", handleResponsiveChange);
        };
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    setFilterValue({
      ...filterValue,
      sortOrder: { name: "", code: "" },
    });

    fetchData();
  }, []);



  return (
    <div className="AllShipmentscontainer">
      <div className={styles.shipmentContainer}>
        <Toast ref={toast} />
        {loader ? (
          <div className={styles.loadingStyle}>
            <Loader />
          </div>
        ) : (
          <div
            className={styles.shipmentSection}
          >
            <div>
              <img
                src={`${BackImg}`}
                alt=""
                title="back"
                style={{
                  cursor: "pointer",
                  margin: "10px 0px",
                  widows: "26px",
                }}
                onClick={() => {
                  window.open(
                    `${url}/SitePages/${Config.ListNames.Homepage}.aspx`
                  );
                }}
              />
            </div>
            <div className={styles.header}>
              <div className={styles.selectShipData}>
                <p>
                  All Shipments ({values?.length})

                </p>

              </div>
              {!isMobile ? (
                <div className={styles.headerSection}>
                  <img
                    src={`${resetImg}`}
                    title="reset"
                    style={{ width: 23 }}
                    alt=""
                    onClick={() => {
                      cleaeDateFilter();
                    }}
                  />
                  {isadmin && (
                    <img
                      src={`${ApiCallImg}`}
                      alt=""
                      onClick={() => {
                        getLatestModified()
                      }}
                    />
                  )}

                  <div className={styles.StatusContainer}>
                    <Dropdown
                      options={[
                        {
                          name: "Newer to older",
                          code: "Newer to older",
                        },
                        {
                          name: "Older to newer",
                          code: "Older to newer",
                        },
                      ]}
                      value={filterValue.sortOrder}
                      style={{ width: 200 }}
                      optionLabel="name"
                      // showClear
                      onChange={(e) => {
                        filterValue.sortOrder = e.value;
                        setFilterValue({ ...filterValue });
                        objFilter.sortOrder = e.value;
                        handleSearch(objFilter);
                      }}
                      placeholder="Sort"
                    />
                    <Dropdown
                      value={filterValue.Status}
                      options={statusOption}
                      style={{ width: 200 }}
                      optionLabel="name"
                      // showClear
                      onChange={(e) => {
                        filterValue.Status = e.value;

                        setFilterValue({ ...filterValue });
                        objFilter.Status = e.value;
                        handleSearch(objFilter);

                      }}
                      placeholder="Status"
                    />

                    <Calendar
                      className="shipcalender"
                      value={filterValue.eta || null}
                      style={{ width: 200 }}
                      showIcon
                      placeholder="ETA"
                      onChange={(e: any) => {
                        filterValue.eta = e.value;

                        setFilterValue({ ...filterValue });
                        objFilter.eta = e.value;
                        handleSearch(objFilter);
                      }}
                    />
                  </div>

                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" color="#FF1721">
                      {" "}
                    </InputIcon>
                    <InputText
                      v-model="value1"
                      placeholder="Search"
                      // value={filter}
                      value={filterValue.Mainfield}
                      onChange={(e) => {
                        filterValue.Mainfield = e.target.value;
                        setFilterValue({ ...filterValue });
                        objFilter.Mainfield = e.target.value;
                        handleSearch(objFilter);
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

                        cleaeDateFilter();
                        setIsEdit(false);

                        setVisible(true);
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  className={styles.headerSection}
                  style={{ flexDirection: "column" }}
                >
                  <div className={styles.searchsection}>
                    <img
                      src={`${resetImg}`}
                      title="reset"
                      style={{ width: 20, paddingLeft: 5 }}
                      alt=""
                      onClick={() => {
                        cleaeDateFilter();
                      }}
                    />
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
                        // value={filter}
                        value={filterValue.Mainfield}
                        onChange={(e) => {


                          filterValue.Mainfield = e.target.value;

                          setFilterValue({ ...filterValue });
                          objFilter.Mainfield = e.target.value;
                          handleSearch(objFilter);


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

                          cleaeDateFilter();
                          setIsEdit(false);

                          setVisible(true);
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.StatusContainer}>
                    <Dropdown
                      value={filterValue.Status}
                      style={{ width: "50%" }}
                      options={statusOption}
                      optionLabel="name"
                      // showClear
                      onChange={(e) => {
                        filterValue.Status = e.value;

                        setFilterValue({ ...filterValue });
                        objFilter.Status = e.value;
                        handleSearch(objFilter);

                        // getSearchFilter(e.value);
                      }}
                      placeholder="Status"
                    />

                    <Calendar
                      className="shipcalender"
                      style={{ width: "50% " }}
                      placeholder="ETA"
                      value={filterValue.eta || null}
                      showIcon
                      onChange={(e: any) => {
                        filterValue.eta = e.value;

                        setFilterValue({ ...filterValue });
                        objFilter.eta = e.value;
                        handleSearch(objFilter);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <>
              <div className={styles.contentSection}>
                {values.length > 0 ? (
                  values.map((attachment: any, index: number) => (
                    <div
                      key={index}
                      // style={{ width: "50%" }}
                      className={styles.shipmentboxContainer}
                    >
                      {attachment?.AttachmentFiles?.data?.containers &&
                        attachment.AttachmentFiles.data.containers[0].events
                          .length > 0 ? (
                        attachment.AttachmentFiles.data.containers.map(
                          (container: any, containerIndex: number) => (
                            <div

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
                                    if (container.events.length > 0) {
                                      setIsPopup(true);
                                      setSelectedvalue(attachment);
                                    }
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
                                    {attachment?.AttachmentFiles?.data?.metadata
                                      ?.number || container.number}
                                  </span>

                                  <div
                                    className={styles.containersizeContainer}
                                  >
                                    <p>{container.size_type} </p>
                                    <img src={`${shipImg}`} alt="" />
                                  </div>
                                  <p className={styles.ETA}>
                                    ETA
                                    <span>
                                      {attachment?.AttachmentFiles.data?.route
                                        ?.pod?.date
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
                                        attachment.AttachmentFiles.data.route
                                          .pol.location,
                                        attachment.AttachmentFiles.data
                                          .locations
                                      )}
                                      podLocation={findLocationNameById(
                                        attachment.AttachmentFiles.data.route
                                          .pod.location,
                                        attachment.AttachmentFiles.data
                                          .locations
                                      )}
                                      polActual={
                                        attachment.AttachmentFiles.data.route
                                          .pol.actual
                                          ? attachment.AttachmentFiles.data
                                            .route.pol.actual
                                          : attachment.AttachmentFiles.data
                                            .route.prepol.actual
                                            ? attachment.AttachmentFiles.data
                                              .route.prepol.actual
                                            : attachment?.AttachmentFiles?.data?.containers[0]?.events?.some(
                                              (event: any) => event.actual
                                            )
                                      }
                                      podActual={
                                        attachment.AttachmentFiles.data.route
                                          .pod.actual
                                          ? attachment.AttachmentFiles.data
                                            .route.pod.actual
                                          : attachment.AttachmentFiles.data
                                            .route.postpod.actual
                                      }
                                    />
                                  </>


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
                                          id={`refreshIcon-${index}`}
                                          style={{
                                            cursor: "pointer",
                                            width: "23px",
                                            height: "23px",
                                          }}
                                          onClick={() => {

                                            if (
                                              !(
                                                attachment.isPosted === true || attachment.isReached === true || attachment.isDelivered === true ||
                                                attachment?.AttachmentFiles
                                                  ?.data?.metadata?.status ===
                                                "DELIVERED"
                                              )
                                            ) {
                                              // Call getApiData if either condition is not met

                                              cleaeDateFilter();

                                              getApiData(
                                                "refresh",
                                                attachment.ContainerNo,
                                                attachment.ID
                                              );
                                            }


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
                                        target={`#refreshIcon-${index}`}
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

                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: "13px",
                                          fontWeight: 400,
                                          padding: "6px 10px",
                                          borderRadius: "6px",

                                          // color: "#818181",

                                          ...getColor(
                                            attachment.isPosted
                                              ? "MARKED AS DELIVERED"
                                              : attachment?.isReached ? "REACHED" : attachment?.isDelivered ? "DELIVERED" : attachment?.AttachmentFiles.data
                                                .metadata.status ==
                                                "IN_TRANSIT"
                                                ? "IN TRANSIT"
                                                : attachment?.AttachmentFiles.data
                                                  .metadata.status
                                          ),
                                        }}
                                      >
                                        {attachment.isPosted
                                          ? "MARKED AS DELIVERED"
                                          : attachment?.isReached ? "REACHED" : attachment?.isDelivered ? "DELIVERED" : attachment?.AttachmentFiles.data
                                            .metadata.status == "IN_TRANSIT"
                                            ? "IN TRANSIT"
                                            : attachment?.AttachmentFiles.data
                                              .metadata.status}
                                      </p>
                                      {isadmin && (
                                        <>
                                          <img
                                            id={`editIcon-${index}`}

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
                                            id={`deleteIcon-${index}`}
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
                                        target={`#editIcon-${index}`}
                                        content="Edit"
                                        position="bottom"
                                      />
                                      <Tooltip
                                        target={`#deleteIcon-${index}`}
                                        content="Delete"
                                        position="bottom"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="">
                          <div

                            className={styles.contentBox}
                          >
                            <div
                              className={styles.ContentContainer}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                height: "122px",
                              }}
                            >
                              <div
                                className={styles.leftSection}

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
                                  {attachment?.AttachmentFiles?.data?.metadata
                                    ?.number || ""}
                                </span>
                                {attachment?.AttachmentFiles.data?.route?.pod
                                  ?.date ? (
                                  <p className={styles.ETA}>
                                    ETA
                                    <span>
                                      {attachment?.AttachmentFiles.data?.route
                                        ?.pod?.date
                                        ? moment(
                                          attachment?.AttachmentFiles.data
                                            ?.route?.pod?.date
                                        ).format("D MMM YYYY")
                                        : ""}
                                    </span>
                                  </p>
                                ) : (
                                  <></>
                                )}
                              </div>
                              <div className={styles.rightSection}>
                                <>
                                  <div>No events found</div>

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
                                          // id="refreshIcon"
                                          id={`refreshIcon-${index}`}

                                          style={{
                                            cursor: "pointer",
                                            width: "23px",
                                            height: "23px",
                                          }}
                                          onClick={() => {

                                            if (attachment.isPosted === true || attachment.isReached === true || attachment.isDelivered === true) {
                                              return
                                            }
                                            else {
                                              cleaeDateFilter();
                                              getApiData(
                                                "refresh",
                                                attachment.ContainerNo,
                                                attachment.ID
                                              );

                                            }

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
                                        id={`refreshIcon-${index}`}
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
                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: "13px",
                                          fontWeight: 400,
                                          padding: "6px 10px",
                                          borderRadius: "6px",
                                          ...getColor(
                                            attachment?.isPosted
                                              ? "MARKED AS DELIVERED"
                                              : attachment?.isReached ? "REACHED" : attachment?.AttachmentFiles.data
                                                ?.metadata?.status ==
                                                "IN_TRANSIT"
                                                ? "IN TRANSIT"
                                                : attachment?.AttachmentFiles
                                                  ?.data?.metadata?.status
                                          ),
                                        }}
                                      >
                                        {attachment?.AttachmentFiles?.data
                                          ?.metadata?.status == "IN_TRANSIT"
                                          ? "IN TRANSIT"
                                          : attachment?.AttachmentFiles?.data
                                            ?.metadata?.status}
                                      </p>
                                      {isadmin && (
                                        <>
                                          <img
                                            id={`editIcon-${index}`}

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
                                            id={`deleteIcon-${index}`}

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
                                        // target="#editIcon"
                                        target={`#editIcon-${index}`}

                                        content="Edit"
                                        position="bottom"
                                      />
                                      <Tooltip
                                        // target="#deleteIcon"
                                        target={`#deleteIcon-${index}`}

                                        content="Delete"
                                        position="bottom"
                                      />
                                    </div>
                                  </div>
                                </>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      minHeight: 150,
                    }}
                  >
                    No shipment found !!!
                  </div>
                )}
              </div>
            </>
          </div>
        )}
      </div>
      <Dialog
        className={`Shipments  ${styles.addnewDialog}`}
        visible={visible}
        onHide={() => {
          setVisible(false);
        }}
      >
        <div className={styles.dialogcontainer}>
          <div className={styles.addnewHeader}>
            <p>Add New Shipment</p>
            <span></span>
          </div>
          <div className={styles.textfieldContainer}>
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
            <div className={styles.textBox}>
              <label htmlFor="">Enter Tracking name</label>
              <InputTextarea
                value={Shipments.Containername || ""}
                style={{ width: "100%" }}
                autoResize
                onChange={(e) => {
                  onchangevalues("Containername", e.target.value);
                }}
                rows={3}
                cols={30}
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
                const isValid = await validateInputs("ischeck");
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
            <p style={{ fontSize: "14px ", margin: "10px 0px", color: "#000" }}>
              General
            </p>
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
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata?.api_calls
                    ?.total
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata?.api_calls
                    ?.total
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
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata?.api_calls
                    ?.used
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata?.api_calls
                    ?.used
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
              <span
                style={{
                  ...getApiCallStyle(
                    // lastModified
                    //   ? lastModified?.AttachmentFiles?.data?.metadata?.api_calls
                    //     ?.remaining
                    //   : null
                    lastModified
                      ? lastModified?.data?.metadata?.api_calls
                        ?.remaining
                      : null
                  ),
                  padding: "3px 10px",
                  borderRadius: "4px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata?.api_calls
                    ?.remaining
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata?.api_calls
                    ?.remaining
                  : null}
              </span>
            </p>
          </div>
          <div style={{}}>
            <p style={{ fontSize: "14px ", margin: "10px 0px", color: "#000" }}>
              Unique Shipments
            </p>
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
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata
                    ?.unique_shipments?.total
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata
                    ?.unique_shipments?.total
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
              The total number of calls used this month :{" "}
              <span style={{ color: "#FF1721" }}>
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata
                    ?.unique_shipments?.used
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata
                    ?.unique_shipments?.used
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
              <span
                style={{
                  ...getResponses(
                    // lastModified
                    //   ? lastModified?.AttachmentFiles?.data?.metadata
                    //     ?.unique_shipments?.remaining
                    //   : null,
                    lastModified
                      ? lastModified?.data?.metadata
                        ?.unique_shipments?.remaining
                      : null,
                    50
                  ),
                  padding: "3px 10px",
                  borderRadius: "4px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {/* {lastModified
                  ? lastModified?.AttachmentFiles?.data?.metadata
                    ?.unique_shipments?.remaining
                  : null} */}
                {lastModified
                  ? lastModified?.data?.metadata
                    ?.unique_shipments?.remaining
                  : null}
              </span>
            </p>
          </div>
        </div>
      </Dialog>
      {/* // Timeline Dialog */}
      <Dialog
        className={`ApicallDialog ${styles.timelineDialog}`}
        visible={isPopup}
        onHide={() => {
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

      <ConfirmDialog
        style={{ width: "30vw" }}
        pt={{
          headerTitle: { style: { fontSize: "16px", fontWeight: "bold" } }, // Header
          content: { style: { fontSize: "14px", color: "#555" } }, // Content
          icon: { style: { fontSize: "18px" } }, // Icon


        }}
        visible={confirmVisible}
        onHide={() => setConfirmVisible(false)}
        message="This tracking number was previously deleted. Do you want to add it again?"
        header="again add the deleted record"
        // header="Duplicate Tracking Number"
        icon="pi pi-exclamation-triangle"
        accept={() => {
          if (confirmData) {
            Popupconfirmcheck(confirmData);
            setConfirmVisible(false);
          }
        }}
        reject={() => {
          setConfirmVisible(false)

          setVisible(true)
        }}
      />
    </div>
  );
};
export default Maincomponent;
