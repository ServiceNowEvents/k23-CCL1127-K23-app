import { createCustomElement } from "@servicenow/ui-core";
import snabbdom from "@servicenow/ui-renderer-snabbdom";
import '../src/snc-k23-uic-pb';

// The state is provided by the UX Framework when running inside
// a UIB page.  We will just keep a local reference to the 
// "updateState" method for use within event handlers
let localUpdateState = null;

const initialState = {
    // TODO: Add the starting values to initialize the component
};

const view = (state, { updateState }) => {
	localUpdateState = updateState;
	console.log("ELEMENT VIEW");
	console.log(state);
	const {
        // TODO: Add state variable reference here
        snapRequested,
        countdownDurationSeconds
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
                    ></snc-k23-uic-pb>
				</div>
				<div id="outputs" style={{ flex: 1 }}>
				</div>
			</div>
			<div id="controls">
                {/* Place buttons or other controls here */}
                <button on-click={() => requestSnap(0)}>Snap!</button>
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

