export function selectMediaDevice({
	video,
	cameraDeviceId = "",
	enabled
}) {
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
			reject({exc});
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
	cameraDeviceId
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
                cameras.filter((camera) => camera.deviceId === cameraDeviceId).length == 1
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

export function initializeCanvas({context, imageSize = { width: 800, height: 600}, gap = 10, chin = 50, fillStyle}){
	const {canvas} = context;
    // Add room for gaps above, between and below images
	canvas.width = imageSize.width;
	canvas.height = imageSize.height;

	context.fillStyle = fillStyle;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawImage({
	pos,
	context,
	video,
	gap,
	chin
}) {
	const { canvas : {width, height} } = context;
	// Make the shots slightly smaller to accomodate the gap/chin
	const hWidth = (width / 2) - ((gap * 3) / 2);
	const hHeight = ((height - chin) / 2) - (gap * 2);

	// Define where the first, second, third and fourth images appear
	// in the grid
	const posMap = {
		1: { x: gap, y: gap },
		2: { x: hWidth + gap * 2, y: gap },
		3: { x: gap, y: hHeight + gap * 2 },
		4: { x: hWidth + gap * 2, y: hHeight + gap * 2 },
	};

	const { x, y } = posMap[pos];

	context.drawImage(video, x, y, hWidth, hHeight);
}
