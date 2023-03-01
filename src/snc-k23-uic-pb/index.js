import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import styles from "./styles.scss";
import { selectMediaDevice } from "./media";
import { actionTypes } from "@servicenow/ui-core";

const { COMPONENT_CONNECTED, COMPONENT_PROPERTY_CHANGED, COMPONENT_DOM_READY } =
	actionTypes;

const initializeMedia = ({
	host,
	updateState,
	properties: { enabled },
}) => {
	console.log("Initialize Media");

	// This is where the camera will be rendered
	// Note that "host" is how you get access to the DOM
	const video = host.shadowRoot.getElementById("video");
	// This is how the snapshot is composed
	const canvas = host.shadowRoot.ownerDocument.createElement("canvas");
	const context = canvas.getContext("2d");

	// We will need these later when taking snapshots
	updateState({
		video,
		context
	});

	// Get access to the camera!
	selectMediaDevice({enabled, video});
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
		default: true,
	},
	/**
	 * Triggers a snapshot
	 * Required: No
	 */
	snapRequested: {
		default: "",
		schema: { type: "string" },
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
