// WHERE I CLICK IS CONSISTENTLY NOT COINCIDING WITH WHERE THE CIRCLE IS!?!?!<LKJWHDFAIWDJHBGVWA

// CONSTANTS

const RESOLUTION = [640, 480];

// CORE FUNCTIONS--------

// function which initializes the simulation
function init() {
	// create all necessary objects for application
	const mouse = new Mouse();
	const simulationHandler = new SimulationHandler("Simulation");
	const dataLoggerHandler = new DataLoggerHandler("Graphs");
	dataLoggerHandler.addGraph("Displacement", "upperLeft");
	dataLoggerHandler.addGraph("Velocity", "upperRight");
	dataLoggerHandler.addGraph("Acceleration", "bottomLeft");
	dataLoggerHandler.addGraph("Kinetic Energy", "bottomRight");
	const constants = getConstants();
	simulationHandler.setConstants(constants.coeffRest, constants.gravitationalFieldStrength, constants.timeStep, constants.densityOfAir);
	dataLoggerHandler.refreshTimeStepInGraphs(simulationHandler.constants.timeStep);

	// MY ARMY OF EVENT LISTENERS o7

	document.getElementById("add-object-btn").addEventListener("click", () => {
		const newObject = getInputtedObject();
		simulationHandler.addObject(newObject);
	});

	document.getElementById("preset-btn").addEventListener("click", () => {
		simulationHandler.reloaded = true;
		dataLoggerHandler.clearGraphQueues();
		const preset = document.getElementById("presets").value;
		if (preset != "none") {
			const presetObjects = getPresetObjectList(preset);
			simulationHandler.setObjectsList(presetObjects);
			const newConstants = presetConstants(preset);
			simulationHandler.setConstants(newConstants[0], newConstants[1], newConstants[2], newConstants[3]);
		}
	});

	document.getElementById("refresh-scaling-btn").addEventListener("click", () => {
		const autoScaling = {
			Displacement: document.getElementById("auto-scale-displacement-y").checked,
			Velocity: document.getElementById("auto-scale-velocity-y").checked,
			Acceleration: document.getElementById("auto-scale-acceleration-y").checked,
			"Kinetic Energy": document.getElementById("auto-scale-kinetic-energy-y").checked,
		};
		for (const graph of dataLoggerHandler.graphs) {
			if (autoScaling[graph.getAxisY()]) {
				graph.yAutoScaling = true;
			} else {
				graph.yAutoScaling = false;
			}
		}
		const information = {
			Displacement: new Vector2(getElementFloatValue("displacement-scale-x"), getElementFloatValue("displacement-scale-y")),
			Velocity: new Vector2(getElementFloatValue("velocity-scale-x"), getElementFloatValue("velocity-scale-y")),
			Acceleration: new Vector2(getElementFloatValue("acceleration-scale-x"), getElementFloatValue("acceleration-scale-y")),
			"Kinetic Energy": new Vector2(getElementFloatValue("kinetic-energy-scale-x"), getElementFloatValue("kinetic-energy-scale-y")),
		};
		let scales;
		for (const graph of dataLoggerHandler.graphs) {
			scales = information[graph.getAxisY()];
			if (!graph.yAutoScaling) {
				graph.setScale(scales.getX(), scales.getY());
			} else {
				graph.setAutomaticScale();
				graph.setScale((x = scales.getX()));
			}
		}
		const displacementComponent = document.getElementById("displacement-component").value;
		const velocityComponent = document.getElementById("velocity-component").value;
		const accelerationComponent = document.getElementById("acceleration-component").value;
		const components = {
			Displacement: displacementComponent,
			Velocity: velocityComponent,
			Acceleration: accelerationComponent,
		};
		let componentToSet;
		for (const graph of dataLoggerHandler.graphs) {
			componentToSet = components[graph.getAxisY()];
			if (graph.getAxisYComponent() != componentToSet) {
				graph.setAxisYComponent(componentToSet);
			}
		}
	});

	document.getElementById("refresh-const-btn").addEventListener("click", () => {
		const constants = getConstants();
		simulationHandler.setConstants(constants.coeffRest, constants.gravitationalFieldStrength, constants.timeStep, constants.densityOfAir);
		dataLoggerHandler.refreshTimeStepInGraphs(simulationHandler.constants["timeStep"]);
	});

	document.getElementById("pause-btn").addEventListener("click", () => {
		if (simulationHandler.running) {
			simulationHandler.running = false;
			dataLoggerHandler.running = false;
			return null;
		}
		simulationHandler.running = true;
		dataLoggerHandler.running = true;
	});

	document.getElementById("refresh-sim-btn").addEventListener("click", () => {
		clearInterval(window.interval);
		init();
	});

	document.addEventListener("mousemove", (event) => {
		mouse.updatePosition(event, simulationHandler.canvas.getBoundingClientRect());
	});

	document.addEventListener("mousedown", (event) => {
		if (event.button != 0) {
			return null;
		}
		const index = mouse.updateTrackedObject(simulationHandler.objects, simulationHandler.constants.timeStep);
		if (!index) {
			return null;
		}
		simulationHandler.objects[simulationHandler.trackedObjectIndex].trackedObject = false;
		simulationHandler.objects[index].trackedObject = true;
		simulationHandler.trackedObject = simulationHandler.objects[index];
		simulationHandler.trackedObjectIndex = index;
		dataLoggerHandler.clearGraphQueues();
	});

	document.getElementById("display-graphs").addEventListener("click", () => {
		if (document.getElementById("display-graphs").checked) {
			dataLoggerHandler.running = true;
		} else {
			dataLoggerHandler.running = false;
		}
	});

	// run the recurring application loop
	clock(60, simulationHandler, dataLoggerHandler);
}

// this function runs the update every 10ms using an interval function, this interval loops the update function which updates the positions of all balls in the animation.
function clock(refreshRate, simulationHandler, dataLoggerHandler) {
	const milliSecondsPerFrame = 1000 / refreshRate;
	window.interval = setInterval(update, milliSecondsPerFrame, simulationHandler, dataLoggerHandler);
}

// function which draws the simulations current frame using the canvas drawing functions.
function update(simulationHandler, dataLoggerHandler) {
	dataLoggerHandler.setTrackedObject(simulationHandler.trackedObject);
	dataLoggerHandler.animateFrame();
	simulationHandler.animateFrame();
}

function getInputtedObject() {
	let newObj;
	const colour = getElementStringValue("colour");
	const density = getElementFloatValue("density");
	const position = new Position(getElementFloatValue("position-x"), RESOLUTION[1] - (getElementFloatValue("position-y") + (1 / 9) * RESOLUTION[1]));
	const velocity = new Velocity(getElementFloatValue("velocity-x"), -getElementFloatValue("velocity-y"));
	const acceleration = new Acceleration(getElementFloatValue("acceleration-x"), -getElementFloatValue("acceleration-y"));
	const radius = getElementFloatValue("radius");
	newObj = new Circle(radius, density, colour, velocity, acceleration, position);
	return newObj;
}

// PRESET HANDLING FUNCTIONS------

function setInputFieldsToNewConstants(E, G, T, P) {
	T *= 10;
	document.getElementById("restit").value = E.toString();
	document.getElementById("gravity").value = G.toString();
	document.getElementById("scale").value = T.toString();
	document.getElementById("densityOA").value = P.toString();
}

function presetConstants(preset) {
	const presetConstants = {
		diffusion: [1, 0, 0.1, 0],
		atmosphericDiffusion: [1, 9.81, 0.1, 0],
		oneToOneMassCollision: [1, 0, 0.1, 0],
		twoToOneMassCollision: [1, 0, 0.1, 0],
		threeToOneMassCollision: [1, 0, 0.1, 0],
	};
	const constants = presetConstants[preset];
	setInputFieldsToNewConstants(constants[0], constants[1], constants[2], constants[3]);
	return constants;
}

function getPresetObjectList(preset) {
	// object filled with lists of objects which will be added to current object list to be drawn according to each preset.
	const presetObjects = {
		diffusion: createDiffusionPresetObjectList(),
		atmosphericDiffusion: createAtmosphericDiffusionPresetObjectList(),
		oneToOneMassCollision: createOneToOneMassCollisionObjectList(),
		twoToOneMassCollision: createTwoToOneMassCollisionObjectList(),
		threeToOneMassCollision: createThreeToOneMassCollisionObjectList(),
		None: [],
	};
	const presetObjectList = presetObjects[preset];
	return presetObjectList;
}

// PRESET GENERATING FUNCTIONS-----

function createDiffusionPresetObjectList() {
	let presetObjectList = [];
	for (let i = 0; i < 100; i++) {
		// randomly decides if the y velocity will be upwards or downwards.
		presetObjectList.push(new Circle(5, 5, "red", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, 0.25 * RESOLUTION[0]), (((8 / 9) * RESOLUTION[1]) / 100) * i)));
	}
	for (let i = 0; i < 100; i++) {
		// randomly decides if the y velocity will be upwards or downwards.
		presetObjectList.push(
			new Circle(5, 5, "green", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0.75 * RESOLUTION[0], RESOLUTION[0]), (((8 / 9) * RESOLUTION[1]) / 100) * i))
		);
	}
	return presetObjectList;
}

function createAtmosphericDiffusionPresetObjectList() {
	const presetObjectList = [];
	const possibleMasses = [5, 10, 15];
	for (let i = 0; i < 66; i++) {
		// randomly decides if the y velocity will be upwards or downwards.
		presetObjectList.push(
			new Circle(5, possibleMasses[0], "red", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION[0]), generateRandomFloat(0, (8 / 9) * RESOLUTION[1])))
		);
	}
	for (let i = 0; i < 66; i++) {
		// randomly decides if the y velocity will be upwards or downwards.
		presetObjectList.push(
			new Circle(5, possibleMasses[1], "blue", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION[0]), generateRandomFloat(0, (8 / 9) * RESOLUTION[1])))
		);
	}
	for (let i = 0; i < 66; i++) {
		// randomly decides if the y velocity will be upwards or downwards.
		presetObjectList.push(
			new Circle(5, possibleMasses[2], "green", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION[0]), generateRandomFloat(0, (8 / 9) * RESOLUTION[1])))
		);
	}
	return presetObjectList;
}

function createOneToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 1, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.25, RESOLUTION[1] * 0.5)));
	objectList.push(new Circle(20, 1, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.75, RESOLUTION[1] * 0.5)));
	return objectList;
}

function createTwoToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 2, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.25, RESOLUTION[1] * 0.5)));
	objectList.push(new Circle(20, 1, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.75, RESOLUTION[1] * 0.5)));
	return objectList;
}

function createThreeToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 3, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.25, RESOLUTION[1] * 0.5)));
	objectList.push(new Circle(20, 1, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION[0] * 0.75, RESOLUTION[1] * 0.5)));
	return objectList;
}

// INPUT GRABBING FUNCTIONS------

// Grabs the values from each input field in order to update the constants array to user selected values.
function getConstants() {
	const G = getElementFloatValue("gravity");
	const densityOfAir = getElementFloatValue("densityOA");
	const RATE = getElementFloatValue("scale") / 10;
	const E = getElementFloatValue("restit");
	const constants = {
		coeffRest: E,
		gravitationalFieldStrength: G,
		timeStep: RATE,
		densityOfAir: densityOfAir,
	};
	return constants;
}

function getXStepInPlot() {
	return getConstants().timeStep;
}

function getElementStringValue(elementId) {
	return document.getElementById(elementId).value;
}

function getElementFloatValue(elementId) {
	const valueString = document.getElementById(elementId).value;
	const valueFloat = parseFloat(valueString);
	return valueFloat;
}

// GENERIC FUNCTIONS

function generateRandomFloat(lower, upper) {
	return lower + Math.random() * (upper - lower);
}

// when the page is loaded the init function is ran.
window.onload = init;

// bugs:
// bugs with user input of force on objects, again :(.

// TO ADD ========================================================================

// TOP PRIORITY AFTER BUGS ARE FIXED
// Presets (Mr Adams, Helpful for showing helpful teaching):
// 3 (or 2) Balls decreasing size on top of each other, falling freely.
// 1:1 mass, 1:2 mass, 1:1 mass but with velocity 2:1. Simple ratios of masses and velocities in the same plane, without gravity.
// Check how long it takes in diffusion for all particles to be in the canvas 0.99 by 0.99 then 0.98 by 0.98 then decreasing by 0.01, need meaning scales. (silly)

// ADD ERROR HANDLING (I DONT KNOW WHAT KIND, MAYBE TRY CHECKING IF THE NEGATIVE DISCRIMINANT ERROR STILL EXISTS IN THIS)
