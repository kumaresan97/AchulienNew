// import * as React from "react";
// import * as L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "../../Global/Style.css";

// import { useEffect, useRef } from "react";

// // let img = require("../../Global/Images/Pencil.svg");
// // Fix for Leaflet's default icon issue in React
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// const MapComponent: React.FC<{ routeData: any }> = ({ routeData }) => {
//   const mapRef = useRef<L.Map | null>(null);

//   useEffect(() => {
//     // Initialize the map if it doesn't exist yet
//     if (!mapRef.current) {
//       mapRef.current = L.map("map").setView([34.0522, -118.2437], 4); // Default center

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(mapRef.current);
//     }

//     // Remove existing layers before adding new ones
//     mapRef.current.eachLayer((layer:any) => {
//       if ((layer as L.TileLayer).getAttribution() !== undefined) {
//         return; // Keep the base tile layer
//       }
//       mapRef.current?.removeLayer(layer);
//     });

//     // Loop through each route in routeData.routes and add polylines to the map
//     const { route } = routeData.data.route_data;
//     route.forEach((routeItem: any) => {
//       const { path } = routeItem;
//       const latlngs = path.map((coord: number[]) => [coord[0], coord[1]]);
//       L.polyline(latlngs, { color: "#08f" }).addTo(mapRef.current!);
//     });

//     const { locations } = routeData.data;
//     locations.forEach((loc: any) => {
//       const { lat, lng, name } = loc;

//       // Create a custom dot icon
//       const dotIcon = L.divIcon({
//         html: `<div class="dot-marker"></div>`,
//         className: "",
//         iconSize: [10, 10],
//         iconAnchor: [5, 5],
//       });

//       // Add a marker with the dot icon at the location with a popup
//       L.marker([lat, lng], { icon: dotIcon })
//         .addTo(mapRef.current!)
//         .bindPopup(`Location: ${name}`);
//     });

//     // const { locations } = routeData.data;
//     // locations.forEach((loc: any) => {
//     //   const { lat, lng, name } = loc;

//     //   // Add a default marker at the location with a popup
//     //   L.marker([lat, lng])
//     //     .addTo(mapRef.current!)
//     //     .bindPopup(`Location: ${name}`);
//     // });

//     // Use the pin data for the current location
//     const pinLocation = routeData.data.route_data.pin;
//     if (pinLocation) {
//       // Create a custom marker with a blue circle and small blue dot
//       const customIcon = L.divIcon({
//         html: `
//           <div class="custom-marker">
//             <div class="large-circle"></div>
//             <div class="small-dot"></div>
//           </div>`,
//         className: "",
//         iconSize: [30, 30],
//         iconAnchor: [15, 15],
//       });

//       // Add a marker at the pin location with the custom icon
//       L.marker([pinLocation[0], pinLocation[1]], {
//         icon: customIcon,
//       })
//         .addTo(mapRef.current!)
//         .bindPopup("Current Location");

//       // Set the view to the pin location
//       mapRef.current.setView([pinLocation[0], pinLocation[1]], 8);
//     }
//   }, [routeData]);

//   // useEffect(() => {
//   //   // Initialize the map if it doesn't exist yet
//   //   if (!mapRef.current) {
//   //     mapRef.current = L.map("map").setView([34.0522, -118.2437], 13); // Centered on the first point of the first route

//   //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   //       attribution:
//   //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   //     }).addTo(mapRef.current);
//   //   }

//   //   // Remove existing layers before adding new ones
//   //   mapRef.current.eachLayer((layer) => {
//   //     if ((layer as L.TileLayer).getAttribution() !== undefined) {
//   //       return; // Keep the base tile layer
//   //     }
//   //     mapRef.current?.removeLayer(layer);
//   //   });

//   //   // Loop through each route in routeData.routes and add polylines to the map
//   //   routeData.data.route_data.route.forEach((route: any, index: number) => {
//   //     const { path } = route;
//   //     const latlngs = path.map((coord: number[]) => [coord[0], coord[1]]);
//   //     L.polyline(latlngs, { color: "blue" }).addTo(mapRef.current!);
//   //   });

//   //   // Find the latest actual event
//   //   const latestEvent = routeData.data.containers[0].events
//   //     .filter((event: any) => event.actual)
//   //     .reduce(
//   //       (latest: any, event: any) => {
//   //         return new Date(event.date) > new Date(latest.date) ? event : latest;
//   //       },
//   //       { date: "1970-01-01T00:00:00Z" }
//   //     );

//   //   // Get the location of the latest event
//   //   const latestLocation = routeData.data.locations.find(
//   //     (loc: any) => loc.id === latestEvent.location
//   //   );

//   //   if (latestLocation) {
//   //     // Create a custom marker with a blue circle and small blue dot
//   //     const customIcon = L.divIcon({
//   //       html: `
//   //         <div class="custom-marker">
//   //           <div class="large-circle"></div>
//   //           <div class="small-dot"></div>
//   //         </div>`,
//   //       className: "",
//   //       iconSize: [30, 30],
//   //       iconAnchor: [15, 15],
//   //     });

//   //     // Add a marker at the latest position with the custom icon
//   //     L.marker([latestLocation.lat, latestLocation.lng], {
//   //       icon: customIcon,
//   //     })
//   //       .addTo(mapRef.current!)
//   //       .bindPopup(latestLocation.name);

//   //     // Set the view to the latest position
//   //     mapRef.current.setView([latestLocation.lat, latestLocation.lng], 8);
//   //   }
//   // }, [routeData]);

//   return <div id="map" style={{ height: "500px", width: "100%" }} />;
// };

// export default MapComponent;

import * as React from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../Global/Style.css";

import { useEffect, useRef } from "react";

// Fix for Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapComponent: React.FC<{ routeData: any }> = ({ routeData }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize the map if it doesn't exist yet
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([34.0522, -118.2437], 4); // Default center

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    if (mapRef.current) {
      mapRef.current.eachLayer((layer: any) => {
        const tileLayer = layer as L.TileLayer;
        if (
          tileLayer.getAttribution &&
          typeof tileLayer.getAttribution === "function" &&
          tileLayer.getAttribution() !== undefined
        ) {
          return; // Keep the base tile layer
        }
        mapRef.current?.removeLayer(layer);
      });

      // Check if mapRef.current is defined before removing existing layers
      // if (mapRef.current) {
      //   mapRef.current.eachLayer((layer: any) => {
      //     // if ((layer as L.TileLayer).getAttribution() !== undefined) {
      //       return; // Keep the base tile layer
      //     }
      //     mapRef.current?.removeLayer(layer);
      //   });

      // Loop through each route in routeData.routes and add polylines to the map
      const { route } = routeData.data.route_data;
      route.forEach((routeItem: any) => {
        const { path } = routeItem;
        const latlngs = path.map((coord: number[]) => [coord[0], coord[1]]);
        L.polyline(latlngs, { color: "#08f" }).addTo(mapRef.current!);
      });

      const { locations } = routeData.data;
      locations.forEach((loc: any) => {
        const { lat, lng, name } = loc;

        // Create a custom dot icon
        const dotIcon = L.divIcon({
          html: `<div class="dot-marker"></div>`,
          className: "",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        // Add a marker with the dot icon at the location with a popup
        L.marker([lat, lng], { icon: dotIcon })
          .addTo(mapRef.current!)
          .bindPopup(`Location: ${name}`);
      });

      // Use the pin data for the current location
      const pinLocation = routeData.data.route_data.pin;
      if (pinLocation) {
        // Create a custom marker with a blue circle and small blue dot
        const customIcon = L.divIcon({
          html: `
            <div class="custom-marker">
              <div class="large-circle"></div>
              <div class="small-dot"></div>
            </div>`,
          className: "",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Add a marker at the pin location with the custom icon
        L.marker([pinLocation[0], pinLocation[1]], {
          icon: customIcon,
        })
          .addTo(mapRef.current!)
          .bindPopup("Current Location");

        // Set the view to the pin location
        mapRef.current.setView([pinLocation[0], pinLocation[1]], 8);
      }
    }
  }, [routeData]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
};

export default MapComponent;
