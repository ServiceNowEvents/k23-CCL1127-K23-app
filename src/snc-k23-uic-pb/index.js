import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import styles from "./styles.scss";
import { selectMediaDevice, toggleTracks, snap } from "./media";
import { PHOTOBOOTH_CAMERA_SNAPPED } from "./events";
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

	// Get access to the camera!
	selectMediaDevice({enabled, video});

	// We will need these later when taking snapshots
	updateState({
		video,
		context
	});
	
};

const view = ({
	snapState,
	properties: {
		pauseDurationSeconds,
		animationDuration = pauseDurationSeconds + "s",
	},
}) => {
	return (
		<div id="container" className={snapState}>
			<div
				id="flash"
				style={{
					"animation-iteration-count": 4,
					"animation-duration": animationDuration,
				}}
			></div>
			<video id="video" autoplay="" style={{ width: "100%" }}></video>
		</div>
	);
};

const initialState = { snapState : "idle" }; // Pre-set "state" variables

// Events that will be handled by this component
const actionHandlers = {
	[COMPONENT_DOM_READY]: ({
		host,
		state: { properties },
		updateState,
	}) => {
		initializeMedia({ host, properties, updateState });
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
				} 
			},
			enabled: () => {
				toggleTracks({ video, enabled: value });
			}
		};

		if (propertyHandlers[name]) {
			propertyHandlers[name]();
		}
	},	
};

const dispatches = {}; // Events that will be dispatched by this component

export const properties = {
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

	/**
	 * How long to wait after requesting a snap and beginning the shots.
	 */
	countdownDurationSeconds: {
		default: 0,
		schema: { type: "number" },
	},

	/**
	 * Number of seconds to pause between each snap.
	 */
	pauseDurationSeconds: {
		default: 1,
		schema: { type: "number" },
	},

	/**
	 * The html fillStyle property for the canvas, e.g. "green"
	 * Required: No
	 */
	fillStyle: {
		default: "lightgreen",
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
