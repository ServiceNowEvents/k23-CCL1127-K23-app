import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import {
   PHOTOBOOTH_CAMERA_SNAPPED,
   PHOTOBOOTH_AVAILABLE_CAMERAS_UPDATED,
} from "../src/snc-k23-uic-pb/events";
import "../src/snc-k23-uic-pb";

const initialState = {
   // TODO: Add the starting values to initialize the component
   enabled: true,
   cameras: [], // Init so that the html binding doesn't break
   countdownDurationSeconds: 0
};

const view = (state, { updateState }) => {
   console.log("ELEMENT VIEW", state);
   const {
      // TODO: Add state variable reference here
      snapRequested,
      countdownDurationSeconds,
      enabled,
      imageData,
      cameras,
      cameraDeviceId,
   } = state;

   const requestSnap = (countdownDurationSeconds = 0) => {
      console.log("REQUEST SNAP");
      updateState({
         countdownDurationSeconds,
         snapRequested: Date.now() + "",
      });
   };

   return (
      <div id="element">
         <div style={{ display: "flex" }}>
            <div id="component" style={{ flex: 1 }}>
               <snc-k23-uic-pb
                  snapRequested={snapRequested}
                  countdownDurationSeconds={countdownDurationSeconds}
                  enabled={enabled}
                  cameraDeviceId={cameraDeviceId}
               ></snc-k23-uic-pb>
            </div>
            <div id="outputs" style={{ flex: 1 }}>
               <img src={imageData} />
            </div>
         </div>
         <div id="controls">
            {/* Place buttons or other controls here */}
            <button on-click={() => requestSnap(countdownDurationSeconds)}>
               Snap!
            </button>
            <button on-click={() => updateState({ enabled: !enabled })}>
               Toggle Enabled
            </button>
            Countdown Seconds:
            <input
               type="number"
               style={{ width: "2rem" }}
               on-blur={({ target: { value } }) =>
                  updateState({ countdownDurationSeconds: value })
               }
               value={countdownDurationSeconds}
            />
         </div>
         <div id="availableCameras">
            Available Cameras:
            <ol>
               {cameras.map(({ label, deviceId }) => {
                  console.log("LABEL", label, deviceId);
                  return (
                     <li
                        style={{ cursor: "pointer" }}
                        on-click={() => {
                           updateState({ cameraDeviceId: deviceId });
                        }}
                     >
                        {label} : {deviceId}
                     </li>
                  );
               })}
            </ol>
         </div>
      </div>
   );
};

const actionHandlers = {
   [PHOTOBOOTH_CAMERA_SNAPPED]: {
      effect: ({
         state,
         updateState,
         action: {
            payload: { imageData },
         },
      }) => {
         console.log("PHOTOBOOTH CAMERA SNAPPED YO!", state, imageData);
         updateState({ imageData });
      },
   },
   [PHOTOBOOTH_AVAILABLE_CAMERAS_UPDATED]: {
      effect: ({ updateState, action: { payload } }) => {
         const { selectedCameraDeviceId, cameras } = payload;
         console.log(
            "SET AVAILABLE CAMERAS",
            payload,
            "Selected Camera:",
            selectedCameraDeviceId
         );
         updateState({ cameras });
      },
   },
};

createCustomElement("example-element", {
   initialState,
   renderer: { type: snabbdom },
   view,
   actionHandlers
});

const el = document.createElement("main");
document.body.appendChild(el);

el.innerHTML = "<example-element/>";