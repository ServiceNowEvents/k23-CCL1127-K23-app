export function selectMediaDevice({ video, cameraDeviceId = "", enabled }) {
	console.log("SWITCH MEDIA DEVICE", { cameraDeviceId, enabled });
	// Get access to the camera!
	return new Promise((resolve, reject) => {
		navigator.mediaDevices
			.getUserMedia({ video: { deviceId: cameraDeviceId } })
			.then(function (stream) {
				console.log("Got User Media!", { video, cameraDeviceId });
				if (video.srcObject) {
					video.srcObject.getTracks().forEach((track) => {
						track.stop();
					});
				}
				video.srcObject = stream;
				toggleTracks({ video, enabled });
				video.play();
				resolve();
			})
			.catch((exc) => {
				console.log("Error Getting Media!", exc);
				reject({ exc });
			});
	});
}

export function toggleTracks({ video: { srcObject: stream }, enabled }) {
	if (stream) {
		stream.getTracks().forEach((track) => (track.enabled = enabled));
	}
}

export function getConnectedDevices({
	deviceType = "videoinput",
	cameraDeviceId,
}) {
	// This is done purely to return a list of devices to the client so that they can
	// offer a selection to the user. It does not impact initializing the camera functionality.
	return new Promise((resolver) => {
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
}

export function initializeCanvas({
	context,
	imageSize = { width: 800, height: 600 },
	fillStyle,
}) {
	const { canvas } = context;
	console.log("Initialize Canvas", canvas, imageSize, fillStyle);
	// Add room for gaps above, between and below images
	canvas.width = imageSize.width;
	canvas.height = imageSize.height;

	context.fillStyle = fillStyle;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawImage({ pos, context, video, gap, chin }) {
	const {
		canvas: { width, height },
	} = context;
	// Make the shots slightly smaller to accomodate the gap/chin
	const hWidth = (width / 2) - (gap * 3) / 2;
	const hHeight = ((height - chin) / 2) - (gap * 3) / 2;

	// Define where the first, second, third and fourth images appear
	// in the grid, taking into account offsets from the gap
	const posMap = {
		1: { x: gap, y: gap },
		2: { x: hWidth + gap * 2, y: gap },
		3: { x: gap, y: hHeight + gap * 2 },
		4: { x: hWidth + gap * 2, y: hHeight + gap * 2 },
	};

	const { x, y } = posMap[pos];

	context.drawImage(video, x, y, hWidth, hHeight);
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
			countdownDurationSeconds = 0,
			pauseDurationSeconds = 1,
			pauseDurationMilliseconds = pauseDurationSeconds * 1000,
			gap = 10,
			chin = 0,
		},
	} = state;

	let pos = 1;

	if (countdownDurationSeconds > 0) {
		updateState({ snapState: "countdown" });
	}

	return new Promise((resolve) => {
		const _snap = () => {
			updateState({ snapState: "snapping" });

			drawImage({ pos, context, video, gap, chin });

			if(shutterSound) {
				shutterSound.play();
			}

			if (pos < 4) {
				pos++;
				setTimeout(_snap, pauseDurationMilliseconds);
			} else {
				updateState({ snapState: "preview" });

				resolve({ context });
			}
		};

		setTimeout(_snap, countdownDurationSeconds * 1000);
	});
}
