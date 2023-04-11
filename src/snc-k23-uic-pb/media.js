export function selectMediaDevice({ video, cameraDeviceId = "", enabled }) {
	console.log("SELECT MEDIA DEVICE", { cameraDeviceId, enabled });
	// Get access to the camera!
	return new Promise((resolve, reject) => {
		navigator.mediaDevices
			.getUserMedia({ video: { deviceId: cameraDeviceId } }).then((stream) => {
				console.log("Got User Media!", { video, cameraDeviceId, stream });
				if (video.srcObject) {
					video.srcObject.getTracks().forEach((track) => {
						track.stop();
					});
				}
				video.srcObject = stream;
				toggleTracks({ video, enabled });
				video.play();
				resolve(stream);
			})
			.catch((exc) => {
				console.log("Error Getting Media!", exc);
				reject({ exc });
			});
	});
}

export function toggleTracks({ video: { srcObject: stream }, enabled }) {
	// Don't use falsy to enable tracks, actual true or false only
	if (stream && (enabled === true || enabled === false)) {
		stream.getTracks().forEach((track) => (track.enabled = enabled));
	}
}

export function getConnectedDevices({
	deviceType = "videoinput",
	cameraDeviceId,
}) {
	return new Promise((resolver) => {
		// This is done purely to return a list of devices to the client so that they can
		// offer a selection to the user. It does not impact initializing the camera functionality.
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			const cameras = devices.filter((device) => device.kind === deviceType);
			cameras.forEach((camera) => (camera.id = camera.deviceId));
			const updatedCameras = {
				selectedCameraDeviceId: cameraDeviceId,
				cameras,
				selectedDeviceIdFound: false,
				boundCameraDeviceId: null,
			};

			if (
				cameras.filter((camera) => camera.deviceId === cameraDeviceId).length ==
				1
			) {
				updatedCameras.selectedDeviceIdFound = true;
				updatedCameras.boundCameraDeviceId = cameraDeviceId;
			} else if (cameras.length === 1) {
				// If there is only one camera attached, just ignore the deviceId and use that one
				const selectedCameraDeviceId = cameras[0].deviceId;
				updatedCameras.selectedDeviceIdFound =
					selectedCameraDeviceId === cameraDeviceId;
				updatedCameras.boundCameraDeviceId = selectedCameraDeviceId;
			}
			resolver(updatedCameras);
		});
	});
};

function initializeCanvas(context, {
	imageSize: { width, height },
	fillStyle = null,
}) {
	context.canvas.width = width;
	context.canvas.height = height;

	context.fillStyle = fillStyle || context.fillStyle;
	context.fillRect(0, 0, width, height);
}

function drawToSnapImage({ pos, context, video, gap, chin }) {
	console.log("drawToSnapImage", { context })

	const { width, height } = context.canvas;

	// Subtract out gap and chin to make image size proportional
	const hWidth = ((width - (gap * 3)) / 2);
	const hHeight = ((height - (gap * 3) - chin) / 2);

	// Define where the first, second, third and fourth images appear
	// in the grid, taking into account offsets from the gap
	const posMap = {
		1: { x: gap, y: gap },
		2: { x: hWidth + gap * 2, y: gap },
		3: { x: gap, y: hHeight + gap * 2 },
		4: { x: hWidth + gap * 2, y: hHeight + gap * 2 },
	};

	const { x, y } = posMap[pos];

	drawImage(context, video, { x, y, width: hWidth, height: hHeight })

	return { context };
}

function drawImage(context, video, { x = 0, y = 0, width, height }) {
	context.drawImage(video, x, y, width, height);
}

// Passing in "state" instead of destructuring it in place
// becuase drawImage needs a lot of values from state
// and I don't want to have to call them out twice
export function snap({ state, updateState }) {
	const {
		video,
		context,
		shutterSound,
		properties: {
			countdownDurationSeconds,
			pauseDurationSeconds = 1,
			pauseDurationMilliseconds = pauseDurationSeconds * 1000,
			gap = 10,
			chin = 0,
			imageSize = { width: 800, height: 600 },
			fillStyle
		},
	} = state;

	const NUMBER_OF_SNAPS = 4;
	const singleSnapContexts = [];
	let pos = 1;

	const mainCanvasSize = { width: (imageSize.width + (gap * 3)), height: (imageSize.height + (gap * 3) + chin) };
	initializeCanvas(context, { imageSize: mainCanvasSize, fillStyle });

	if (countdownDurationSeconds > 0) {
		updateState({ snapState: "countdown" });
	}

	// Initialize the snap contexts to return for the single snaps in advance
	// Man, I haven't done a for loop like this in years!
	for (let i = 0; i < NUMBER_OF_SNAPS; i++) {
		const singleSnapContext = context.canvas.ownerDocument.createElement("canvas").getContext("2d");
		initializeCanvas(singleSnapContext, { imageSize });
		singleSnapContexts.push(singleSnapContext);
	}


	return new Promise((resolve) => {

		const _snap = () => {
			console.log("_snap", pos, context);
			updateState({ snapState: "snapping" });

			if (shutterSound) {
				console.log("SHUTTER SOUND!");
				shutterSound.play();
			}

			// Draw the primary 2x2 result to the main context
			drawToSnapImage({ pos, context, video, gap, chin });

			const singleSnapContext = singleSnapContexts[pos - 1];
			// Draw the individual image full-sized
			drawImage(singleSnapContext, video, imageSize);

			if (pos < NUMBER_OF_SNAPS) {
				pos++
				setTimeout(_snap, pauseDurationMilliseconds);
			} else {
				updateState({ snapState: "idle" });

				resolve({ context, singleSnapContexts });
			}
		};

		setTimeout(_snap, countdownDurationSeconds * 1000);
	});
}
