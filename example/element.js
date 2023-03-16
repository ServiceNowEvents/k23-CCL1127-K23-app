import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import { PHOTOBOOTH_CAMERA_SNAPPED } from "../src/snc-k23-uic-pb/events";
import '../src/snc-k23-uic-pb';

const initialState = {
   // TODO: Add the starting values to initialize the component
   enabled: true
};

const view = (state, { updateState }) => {
   console.log("ELEMENT VIEW");
   console.log(state);
   const {
      // TODO: Add state variable reference here
      snapRequested,
      countdownDurationSeconds,
      enabled,
      imageData
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
               ></snc-k23-uic-pb>
            </div>
            <div id="outputs" style={{ flex: 1 }}>
            </div>
         </div>
         <div id="controls">
            {/* Place buttons or other controls here */}
            <button on-click={() => requestSnap(0)}>Snap!</button>
            <button on-click={() => updateState({ enabled: !enabled })}>Toggle Enabled</button>
         </div>
      </div>
   );
};

const actionHandlers = {};

createCustomElement("example-element", {
   initialState,
   renderer: { type: snabbdom },
   view,
   actionHandlers
});

const el = document.createElement("main");
document.body.appendChild(el);

el.innerHTML = "<example-element/>";