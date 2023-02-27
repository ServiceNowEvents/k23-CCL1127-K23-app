import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import styles from "./styles.scss";

import { actionTypes } from "@servicenow/ui-core";

const { COMPONENT_CONNECTED, COMPONENT_PROPERTY_CHANGED, COMPONENT_DOM_READY } =
	actionTypes;

const initializeMedia = ({
	host,
	updateState,
	properties: { enabled },
}) => {
	console.log("Initialize Media");
	console.log(navigator.mediaDevices);

	// This is where the snapshots will be rendered
	const video = host.shadowRoot.getElementById("video");

	// Get access to the camera!
	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then((stream) => {
			console.log("Got User Media!");
			//video.src = window.URL.createObjectURL(stream);
			updateState({ stream: stream });
			video.srcObject = stream;
			video.play();
			toggleTracks({ stream }, enabled);
		})
		.catch((exc) => {
			console.log("Error Getting Media!");
			console.log(exc);
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
		dispatch,
	}) => {
		initializeMedia({ host, properties, dispatch, updateState });
	}
};

const dispatches = {}; // Events that will be dispatched by this component

const properties = {
	/**
	 * Camera is enabled
	 * @type {boolean}
	 */
	enabled: {
		schema: { type: "boolean" },
		default: false,
	},
}; 

createCustomElement("snc-k23-uic-pb", {
	renderer: { type: snabbdom },
	view,
	styles,
	initialState,
	actionHandlers,
	dispatches,
	properties,
});
