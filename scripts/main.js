const RESOLUTION = { x: 640, y: 480 };

// CORE FUNCTIONS--------

// function which initializes the simulation
function init() {
	// create all necessary objects for application
	const mouse = new Mouse();
	const simulationHandler = new SimulationHandler("simulation");
	const dataLoggerHandler = new DataLoggerHandler("data-logger");
	dataLoggerHandler.addGraph("Displacement", "upperLeft");
	dataLoggerHandler.addGraph("Velocity", "upperRight");
	dataLoggerHandler.addGraph("Acceleration", "bottomLeft");
	dataLoggerHandler.addGraph("Kinetic Energy", "bottomRight");
	// grab all constants from main page
	const constants = getConstants();
	// change constants in both canvas handlers to new constants
	simulationHandler.setConstants(constants.coeffRest, constants.gravitationalFieldStrength, constants.timeStep, constants.densityOfAir);
	dataLoggerHandler.refreshTimeStepInGraphs(simulationHandler.constants.timeStep);

	// Initiate event-listeners for user-input detection

	// use anonymous functions in event listeners in order to get around needing to use the canvas handler objects as global objects

	// Function which grabs the features of the user inputed object on the page and added to the simulation object list to be used
	document.getElementById("add-object-btn").addEventListener("click", () => {
		const newObject = getInputtedObject();
		simulationHandler.addObject(newObject);
	});

	// clears the datalogger graphs and replaces the object list as well as constants according to the preset
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

	// updates scales/zoom for all graphs when button is clicked
	document.getElementById("refresh-scaling-btn").addEventListener("click", () => {
		const displacementComponent = document.getElementById("displacement-component").value;
		const velocityComponent = document.getElementById("velocity-component").value;
		const accelerationComponent = document.getElementById("acceleration-component").value;
		const autoScaling = {
			Displacement: document.getElementById("auto-scale-displacement-y").checked,
			Velocity: document.getElementById("auto-scale-velocity-y").checked,
			Acceleration: document.getElementById("auto-scale-acceleration-y").checked,
			"Kinetic Energy": document.getElementById("auto-scale-kinetic-energy-y").checked,
		};
		const information = {
			Displacement: new Vector2(getElementFloatValue("displacement-scale-x"), getElementFloatValue("displacement-scale-y")),
			Velocity: new Vector2(getElementFloatValue("velocity-scale-x"), getElementFloatValue("velocity-scale-y")),
			Acceleration: new Vector2(getElementFloatValue("acceleration-scale-x"), getElementFloatValue("acceleration-scale-y")),
			"Kinetic Energy": new Vector2(getElementFloatValue("kinetic-energy-scale-x"), getElementFloatValue("kinetic-energy-scale-y")),
		};
		const components = {
			Displacement: displacementComponent,
			Velocity: velocityComponent,
			Acceleration: accelerationComponent,
		};
		let scales;
		let componentToSet;
		for (const graph of dataLoggerHandler.graphs) {
			// enables/disables auto-scaling depending on user input
			if (autoScaling[graph.getAxisY()]) {
				graph.yAutoScaling = true;
			} else {
				graph.yAutoScaling = false;
			}
			scales = information[graph.getAxisY()];
			// checks if input is valid
			scales.setX(checkForValidInput(scales.getX(), "scales"));
			scales.setY(checkForValidInput(scales.getY(), "scales"));
			setInputFieldsForGraphs(scales.getX(), scales.getY(), graph.getAxisY());
			// sets new graph scaling depending on whether autoscaling is on
			if (!graph.yAutoScaling) {
				graph.setScale(scales.getX(), scales.getY());
			} else {
				graph.setAutomaticScale();
				graph.setScale(scales.getX());
			}
			// kinetic energy does not have vector components as it is a scalar
			if (graph.axisY == "Kinetic Energy") {
				return null;
			}
			// if the component is a vector set new components as its y axis
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
			document.getElementById("pause-btn").innerHTML = "Unpause Simulation";
			simulationHandler.running = false;
			dataLoggerHandler.running = false;
			return null;
		}
		document.getElementById("pause-btn").innerHTML = "Pause Simulation";
		simulationHandler.running = true;
		dataLoggerHandler.running = true;
	});

	document.getElementById("refresh-sim-btn").addEventListener("click", () => {
		document.getElementById("pause-btn").innerHTML = "Pause Simulation";
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
		// -1 indicates mouse isnt inside of an object
		if (index == -1) {
			return null;
		}
		// switch tracked object flags in object and simulation handler to new object from old object being tracked
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

	document.getElementById("show-masses").addEventListener("click", () => {
		if (document.getElementById("show-masses").checked) {
			simulationHandler.showMasses = true;
		} else {
			simulationHandler.showMasses = false;
		}
	});

	document.getElementById("show-grids").addEventListener("click", () => {
		if (document.getElementById("show-grids").checked) {
			dataLoggerHandler.showGrids = true;
		} else {
			dataLoggerHandler.showGrids = false;
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
	const colour = getElementStringValue("colour");
	const density = checkForValidInput(getElementFloatValue("density"), "density");
	// multiplied positions by 10 to retain that 100px = 10m
	const position = new Position(checkForValidInput(getElementFloatValue("position-x"), "positionx")*10, RESOLUTION.y - (checkForValidInput(getElementFloatValue("position-y"), "positiony")*10 + (1 / 9) * RESOLUTION.y));
	const velocity = new Velocity(getElementFloatValue("velocity-x"), -getElementFloatValue("velocity-y"));
	const acceleration = new Acceleration(getElementFloatValue("acceleration-x"), -getElementFloatValue("acceleration-y"));
	const radius = checkForValidInput(getElementFloatValue("radius"), "radius")*10; // multiplied by 10 to retain that 100px = 10m
	const newObj = new Circle(radius, density, colour, velocity, acceleration, position);
	return newObj;
}

// PRESET HANDLING FUNCTIONS------

function presetConstants(preset) {
	// object with lists which contain the constants for each preset scenario
	// [Coefficient of resitution, gravitational field strength, time step, air density] - structure to lists
	const presetConstants = {
		diffusion: [1, 0, 0.1, 0],
		atmosphericDiffusion: [1, 9.81, 0.1, 0],
		oneToOneMassCollision: [1, 0, 0.1, 0],
		twoToOneMassCollision: [1, 0, 0.1, 0],
		threeToOneMassCollision: [1, 0, 0.1, 0],
		partialOneToOneMassCollision: [0.5, 0, 0.1, 0],
		partialTwoToOneMassCollision: [0.5, 0, 0.1, 0],
		partialThreeToOneMassCollision: [0.5, 0, 0.1, 0],
		inelasticOneToOneMassCollision: [0, 0, 0.1, 0],
		inelasticTwoToOneMassCollision: [0, 0, 0.1, 0],
		inelasticThreeToOneMassCollision: [0, 0, 0.1, 0],
		threeBallDrop: [1, 9.81, 0.05, 0],
		terminalVelocity: [1, 9.81, 0.1, 1.225e-3],
		stressTest: [0.75, 100, 0.1, 15e-3],
		none: [1, 9.81, 0.1, 1.225e-3],
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
		partialOneToOneMassCollision: createOneToOneMassCollisionObjectList(),
		partialTwoToOneMassCollision: createTwoToOneMassCollisionObjectList(),
		partialThreeToOneMassCollision: createThreeToOneMassCollisionObjectList(),
		inelasticOneToOneMassCollision: createOneToOneMassCollisionObjectList(),
		inelasticTwoToOneMassCollision: createTwoToOneMassCollisionObjectList(),
		inelasticThreeToOneMassCollision: createThreeToOneMassCollisionObjectList(),
		threeBallDrop: createThreeBallDropObjectList(),
		terminalVelocity: createTerminalVelocityObjectList(),
		stressTest: createStressTestObjectList(),
		none: [],
	};
	const presetObjectList = presetObjects[preset];
	return presetObjectList;
}

// PRESET GENERATING FUNCTIONS-----
// these generate the lists of objects used in each preset to create the preset scenarios

function createDiffusionPresetObjectList() {
	let presetObjectList = [];
	for (let i = 0; i < 100; i++) {
		presetObjectList.push(new Circle(5, 0.001, "red", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, 0.25 * RESOLUTION.x), (((8 / 9) * RESOLUTION.y) / 100) * i)));
	}
	for (let i = 0; i < 100; i++) {
		presetObjectList.push(
			new Circle(5, 0.001, "green", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0.75 * RESOLUTION.x, RESOLUTION.x), (((8 / 9) * RESOLUTION.y) / 100) * i))
		);
	}
	return presetObjectList;
}

function createAtmosphericDiffusionPresetObjectList() {
	const presetObjectList = [];
	for (let i = 0; i < 66; i++) {
		presetObjectList.push(new Circle(5, 0.001, "red", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))));
	}
	for (let i = 0; i < 66; i++) {
		presetObjectList.push(new Circle(5, 0.002, "blue", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))));
	}
	for (let i = 0; i < 66; i++) {
		presetObjectList.push(new Circle(5, 0.003, "green", new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)), new Acceleration(), new Position(generateRandomFloat(0, RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))));
	}
	return presetObjectList;
}

function createOneToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 0.001, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.25, RESOLUTION.y * 0.5)));
	objectList.push(new Circle(20, 0.001, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.75, RESOLUTION.y * 0.5)));
	return objectList;
}

function createTwoToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 0.002, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.25, RESOLUTION.y * 0.5)));
	objectList.push(new Circle(20, 0.001, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.75, RESOLUTION.y * 0.5)));
	return objectList;
}

function createThreeToOneMassCollisionObjectList() {
	const objectList = [];
	objectList.push(new Circle(20, 0.003, "red", new Velocity(25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.25, RESOLUTION.y * 0.5)));
	objectList.push(new Circle(20, 0.001, "red", new Velocity(-25, 0), new Acceleration(), new Position(RESOLUTION.x * 0.75, RESOLUTION.y * 0.5)));
	return objectList;
}

function createThreeBallDropObjectList() {
	const objectList = [];
	objectList.push(new Circle(5, 0.1, "red", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.5, RESOLUTION.y * 0.25)));
	objectList.push(new Circle(10, 0.1, "yellow", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.5, RESOLUTION.y * 0.25 + 20)));
	objectList.push(new Circle(15, 0.1, "blue", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.5, RESOLUTION.y * 0.25 + 50)));
	return objectList;
}

function createTerminalVelocityObjectList() {
	const objectList = [];
	objectList.push(new Circle(10, 0.001, "red", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.25, RESOLUTION.y * 0.1)));
	objectList.push(new Circle(10, 0.002, "yellow", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.5, RESOLUTION.y * 0.1)));
	objectList.push(new Circle(10, 0.003, "blue", new Velocity(), new Acceleration(), new Position(RESOLUTION.x * 0.75, RESOLUTION.y * 0.1)));
	return objectList;
}

function createStressTestObjectList() {
	const presetObjectList = [];
	for (let i = 0; i < 200; i++) {
		presetObjectList.push(
			new Circle(
				generateRandomFloat(5, 15),
				generateRandomFloat(5, 20),
				"red",
				new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Acceleration(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Position(generateRandomFloat(0, 0.25 * RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))
			)
		);
	}
	for (let i = 0; i < 200; i++) {
		presetObjectList.push(
			new Circle(
				generateRandomFloat(5, 15),
				generateRandomFloat(5, 20),
				"green",
				new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Acceleration(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Position(generateRandomFloat(0.25 * RESOLUTION.x, 0.75 * RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))
			)
		);
	}
	for (let i = 0; i < 200; i++) {
		presetObjectList.push(
			new Circle(
				generateRandomFloat(5, 15),
				generateRandomFloat(5, 20),
				"blue",
				new Velocity(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Acceleration(generateRandomFloat(-50, 50), generateRandomFloat(-50, 50)),
				new Position(generateRandomFloat(0.75 * RESOLUTION.x, RESOLUTION.x), generateRandomFloat(0, (8 / 9) * RESOLUTION.y))
			)
		);
	}
	return presetObjectList;
}

// INPUT GRABBING FUNCTIONS------

// Grabs the values from each input field in order to update the constants array to user selected values.

function checkForValidInput(input, type) {
	let output = input;
	// boundary boolean for valid inputs stored in object
	const isInvalid = {
		gravitationalFieldStrength: input < 0,
		densityOfAir: input * 1000 < 0 || input * 1000 >= 100,
		density: input < 0,
		timeStep: input <= 0,
		restitution: input < 0 || input > 1,
		radius: input < 0 || input > 10,
		scales: input <= 0,
		positionx: input < 0 || input > 64,
		positiony: input < 0 || input > 42.5
	};
	const errorMessages = {
		gravitationalFieldStrength: "Gravity cannot be negative",
		densityOfAir: "Density of Air cannot be negative or greater than 100 without causing simulation issues",
		density: "Density of object must be greater than 0",
		timeStep: "Time step in simulation cannot be negative or 0, pausing the simulation can be done using the button",
		restitution: "Coefficient of restitution cannot be less than 0 or greater than 1",
		radius: "Radius of a circle must be greater than 0, upper limit set to 10",
		scales: "Graph scales must be greater than 0",
		positionx: "X Position must be in the range 0 - 64m",
		positiony: "Y Position must be in the range 0 - 42.5m"
	};
	const boundaryInputs = {
		gravitationalFieldStrength: 0,
		densityOfAir: 0,
		timeStep: 0.01,
		restitution: 1,
		scales: 1,
		positionx: 10,
		positiony: 10
	};
	if (isInvalid[type]) {
		alert(errorMessages[type]);
		output = boundaryInputs[type];
	}
	return output;
}

function getConstants() {
	// some constants are scaled to lower numbers to make for better scaling to visualisation
	// density of air if 0.001x what is inputted
	// time step is 0.1x what is inputted
	let gravitationalFieldStrength = checkForValidInput(getElementFloatValue("gravity"), "gravitationalFieldStrength");
	let densityOfAir = checkForValidInput(getElementFloatValue("densityOA") / 1000, "densityOfAir");
	let timeStep = checkForValidInput(getElementFloatValue("scale") / 10, "timeStep");
	let restitution = checkForValidInput(getElementFloatValue("restit"), "restitution");
	setInputFieldsToNewConstants(restitution, gravitationalFieldStrength, timeStep, densityOfAir);
	const constants = {
		coeffRest: restitution,
		gravitationalFieldStrength: gravitationalFieldStrength,
		timeStep: timeStep,
		densityOfAir: densityOfAir,
	};
	return constants;
}

function setInputFieldsForGraphs(x, y, graph) {
	const mappingToElementId = {
		"Kinetic Energy": "kinetic-energy",
		Acceleration: "acceleration",
		Velocity: "velocity",
		Displacement: "displacement",
	};
	const graphId = mappingToElementId[graph];
	document.getElementById(graphId + "-scale-x").value = x.toString();
	document.getElementById(graphId + "-scale-y").value = y.toString();
}

function setInputFieldsToNewConstants(E, G, T, P) {
	// input is mapped onto new values to be displayed to user from the values used in calculation
	T *= 10;
	P *= 1000;
	document.getElementById("restit").value = E.toString();
	document.getElementById("gravity").value = G.toString();
	document.getElementById("scale").value = T.toString();
	document.getElementById("densityOA").value = P.toFixed(3);
}

// GETTERS FROM HTML - get value of elements on page

function getXStepInPlot() {
	const timeStep = getConstants().timeStep;
	return timeStep;
}

function getElementStringValue(elementId) {
	return document.getElementById(elementId).value;
}

function getElementFloatValue(elementId) {
	const valueString = document.getElementById(elementId).value;
	const valueFloat = parseFloat(valueString);
	return valueFloat;
}

// simple random float generating function for presets

function generateRandomFloat(lower, upper) {
	return lower + Math.random() * (upper - lower);
}

// when the page is loaded the init function is ran.
window.onload = init;
