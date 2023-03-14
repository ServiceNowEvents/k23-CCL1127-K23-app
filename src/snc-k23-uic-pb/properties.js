// NOTES FROM JON
// This is based on the standard JSON Schema
// https://developer.servicenow.com/dev.do#!/reference/now-experience/quebec/ui-framework/main-concepts/type-schema
export const properties = {
	/**
	 * Camera is enabled
	 * @type {boolean}
	 */
	enabled: {
		schema: { type: "boolean" },
		default: false,
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
	 * Output Image width and height in pixels (not the size of the video stream)
	 */
	imageSize: {
		default: { width: 800, height: 600 },
		schema: {
			type: "object",
			properties: {
				width: { type: "integer" },
				height: { type: "integer" },
			},
			required: ["width", "height"],
		},
	},

	// Gap between snapshots in pixels
	gap: {
		default: 10,
		schema: { type: "number" },
	},

	// Height of chin below snapshots in pixels. Use the same value as "gap" to make no chin.
	chin: {
		default: 50,
		schema: { type: "number" },
	},

	// Set the background color of the snaps.
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle
	fillStyle: {
		default: "lightgreen",
		schema: { type: "string" },
	},

	/*
	 * Specify which camera to default to. If only one camera is available this will be ignored and the available camera used.
	 */
	cameraDeviceId: {
		default: "",
		schema: { type: "string" },
	},

	watermarkImageUrl: {
		schema: { type: "string" },
		default: "",
	},

	watermarkImagePosition: {
		schema: {
			type: "string",
			enum: [
				"top-left",
				"top-center",
				"top-right",
				"bottom-left",
				"bottom-center",
				"bottom-right",
				"center",
			],
		},
		default: "center",
	},

	/**
	 * Number representing the scale of the watermark image from 0 to 1 (100%)
	 */
	watermarkImageScale: {
		schema: { type: "number" },
		default: 1,
	},

	shutterSoundFile: {
		schema: { type: "string" },
		default: "",
	},
};
