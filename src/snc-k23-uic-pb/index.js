import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import styles from "./styles.scss";
import { properties } from "./properties";
import { selectMediaDevice, toggleTracks, snap, getConnectedDevices } from "./media";
import { PHOTOBOOTH_CAMERA_SNAPPED, PHOTOBOOTH_AVAILABLE_CAMERAS_UPDATED } from "./events";
import { actionTypes } from "@servicenow/ui-core";

const { COMPONENT_CONNECTED, COMPONENT_PROPERTY_CHANGED, COMPONENT_DOM_READY } =
	actionTypes;

const initializeMedia = ({
	host,
	updateState,
	properties: { enabled, cameraDeviceId },
	dispatch
}) => {
	console.log("Initialize Media");

	// This is where the camera will be rendered
	// Note that "host" is how you get access to the DOM
	const video = host.shadowRoot.getElementById("video");
	// This is how the snapshot is composed
	const canvas = host.shadowRoot.ownerDocument.createElement("canvas");
	const context = canvas.getContext("2d");

	selectMediaDevice({ video, cameraDeviceId, enabled });

	getConnectedDevices({ cameraDeviceId }).then((cameras) => {
		dispatch(PHOTOBOOTH_AVAILABLE_CAMERAS_UPDATED, cameras);
	});

	// We will need these later when taking snapshots
	updateState({
		video,
		context
	});
	
};

const view = (state, { updateState }) => {
	return (
		<div>
			<video id="video" autoplay="" style={{ width: "800px" }}></video>
		</div>
	);
};

const initialState = {}; // Pre-set "state" variables

// Events that will be handled by this component
const actionHandlers = {
	[COMPONENT_DOM_READY]: ({
		host,
		state: { properties },
		updateState,
		dispatch
	}) => {
		initializeMedia({ host, properties, updateState, dispatch });
	},

	[COMPONENT_PROPERTY_CHANGED]: ({
		state,
		action: {
			payload: { name, value, previousValue },
		},
		dispatch,
		updateState,
	}) => {
		console.log(COMPONENT_PROPERTY_CHANGED, { name, value });
		const {
			snapState,
			video,
		} = state;

		const propertyHandlers = {
			snapRequested: () => {
				if (value && value != previousValue) {
					snap({ state, updateState }).then(({context}) => {
						console.log("SNAP COMPLETED", context);
						const imageData = context.canvas.toDataURL("image/jpeg");
						dispatch(PHOTOBOOTH_CAMERA_SNAPPED, {imageData});
					});
				} else if (!value && snapState != "idle") {
					// Reset if the value for snapRequested is empty
					updateState({ snapState: "idle" });
				}
			},
			enabled: () => {
				toggleTracks({ video, enabled: value });
				updateState({ snapState: "idle" });
			},
			cameraDeviceId: () => {
				const cameraDeviceId = value;
				selectMediaDevice({
					video,
					cameraDeviceId,
				});
				updateState({ cameraDeviceId });
			}
		};

		if (propertyHandlers[name]) {
			propertyHandlers[name]();
		}
	},	
};

const dispatches = {}; // Events that will be dispatched by this component

console.log("PROPERTIES IMPORTED", properties);

createCustomElement("snc-k23-uic-pb", {
	renderer: { type: snabbdom },
	view,
	styles,
	initialState,
	actionHandlers,
	dispatches,
	properties,
});
