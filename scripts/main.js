// default settings when the simulation is ran
const Settings = {
	"Resolution": [640, 480],
	"Force Scalar": 5,
	"Size Scalar": 20,
	"Buffer Frames": 0,
};

class CanvasHandler {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.canvasCtx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.running = true;
	}

	// move to main.js when creating the self contained module.
	drawLine(initialPosition, finalPosition, colour) {
		this.canvasCtx.strokeStyle = colour;
		this.canvasCtx.beginPath();
		this.canvasCtx.moveTo(initialPosition.getX(), initialPosition.getY());
		this.canvasCtx.lineTo(finalPosition.getX(), finalPosition.getY());
		this.canvasCtx.stroke();
	}

	drawRectangle(topLeftX, topLeftY, width, height, colour) {
		this.canvasCtx.fillStyle = colour;
		this.canvasCtx.fillRect(topLeftX, topLeftY, width, height);
	}

	drawCircle(x, y, radius) {
		this.canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
	}

	drawText(text, x, y, colour) {
		this.canvasCtx.fillStyle = colour;
		this.canvasCtx.fillText(text, x, y)
	}
}

class Simulation extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.objects = [];
		this.constants = {};
	}

	addObject() {
		return null;
	}

	setConstants() {
		return null;
	}

	drawBackground() {
		this.drawRectangle(0, 0, this.width, this.height, "#89CFF0");
	}

	drawGround() {
		this.drawRectangle(0, this.height * (8 / 9), this.width, this.height, "#964B00");
	}

	drawObject(object) {
		let objectXPosition;
		let objectYPosition;
		let objectColour = object.colour;
		if (object.objectTracked) {
			objectColour = "#FFF04D";
		}
		if (object.shape == "circle") {
			objectXPosition = object.position.getX();
			objectYPosition = object.position.getY();
			this.drawCircle(objectXPosition, objectYPosition, object.radius);
		}
		else {
			objectXPosition = object.getCorner.getX();
			objectYPosition = object.getCorner.getY();
			this.drawRectangle(objectXPosition, objectYPosition, object.width, object.height, object.colour);
		}
	}

	moveTimeForward() {
		for (const object of this.objects) {
			object.addWeight();
			object.groundCeilingCollision();
			object.sideCollision();
			object.updateKinematics();
			object.updateHitbox();
		}
		for (const object1 of objects) {
			for (const object2 of objects) {
				if (object1.isCollision(object2)) {
					object1.otherObjectCollision(object2);
				}
			}
		}
	}

	drawFrame() {
		this.drawBackground();
		this.drawGround();
		this.drawObject(object);
	}

	animate() {
		this.drawFrame();
		this.moveTimeForward();
	}
}

class GraphDrawer extends CanvasHandler {

}

// CONSTANTS

const RESOLUTION = Settings["Resolution"];
const SIZESCALE = Settings["Size Scalar"];
const FORCESCALE = Settings["Force Scalar"];

// GLOBALS--------------

const mouse = new Mouse();
var constants = getConstants();
var objects;
var graphs;

// CORE FUNCTIONS--------

// function which initializes the simulation
function init() {
	objects = [];
	const sim = document.getElementById("Simulation");
	const ctxSim = sim.getContext("2d");
	const graphsCanvas = document.getElementById("Graphs");
	const ctxGraphs = graphsCanvas.getContext("2d");
	const height = 480; // Resolution/dimensions of canvas displayed in.
	const width = 640;
	graphs = [
		new Graph(width, height, "Displacement", "Time", new Position(width * 0.25, height * 0.25)),
		new Graph(width, height, "Velocity", "Time", new Position(width * 0.75, height * 0.25)),
		new Graph(width, height, "Acceleration", "Time", new Position(width * 0.25, height * 0.75)),
		new Graph(width, height, "Kinetic Energy", "Time", new Position(width * 0.75, height * 0.75)),
	];
	clock(ctxSim, ctxGraphs, width, height);
}

// this function runs the update every 10ms using an interval function, this interval loops the update function which updates the positions of all balls in the animation.
function clock(ctxSim, ctxGraphs, width, height) {
	window.interval = setInterval(update, 16.67, ctxSim, ctxGraphs, width, height);
}

// function which draws the simulations current frame using the canvas drawing functions.
function update(ctxSim, ctxGraphs, width, height) {
	// simulation drawing---------------------
	ctxSim.fillStyle = "#89CFF0";
	ctxSim.fillRect(0, 0, width, height);
	ctxSim.fillStyle = "#964B00";
	ctxSim.fillRect(0, RESOLUTION[1] * (8 / 9), width, RESOLUTION[1]);

	// if the user has not selected an object to track by default the first object created is tracked, provided no object is selected.
	if (objects.length > 0 && this.trackedObject == null) {
		mouse.setTrackedObject(objects[0]);
		objects[0].objectTracked = true;
	}

	// graph drawing -----------------------------

	ctxGraphs.fillStyle = "#FFFFFF";
	ctxGraphs.fillRect(0, 0, width, height);
	for (const graph of graphs) {
		// fetching tracked object data
		graph.drawGraph(ctxGraphs);
		if (mouse.trackedObject != null) {
			graph.plotData(ctxGraphs, mouse.trackedObject);
		}
	}

	for (const object of objects) {
		object.addWeight();
		object.groundCeilingCollision();
		object.sideCollision();
		object.updateKinematics();
		object.updateHitbox();
		drawObject(ctxSim, object); // turn into a method later on then encapsulate all of this loop in a single method
	}
	// checks for other object collisions, source of most lag O(n^2) time complexity
	for (const object1 of objects) {
		for (const object2 of objects) {
			if (object1.isCollision(object2)) {
				object1.otherObjectCollision(object2);
			}
		}
	}

	if (document.getElementById("force-enabled").checked) {
		for (const object of objects) {
			mouse.addForceOnObject(object);
		}
	}
}

function getInputtedObject() {
	let newObj;
	const shape = document.getElementById("object-type").value;
	const colour = document.getElementById("colour").value;
	const density = getElementFloatValue("density");
	const position = new Position(getElementFloatValue("position-x"), RESOLUTION[1] - (getElementFloatValue("position-y")+(1/9)*RESOLUTION[1]));
	const velocity = new Velocity(getElementFloatValue("velocity-x"), -getElementFloatValue("velocity-y"));
	const acceleration = new Acceleration(getElementFloatValue("acceleration-x"), -getElementFloatValue("acceleration-y"));
	if (shape == "circle") {
		const radius = getElementFloatValue("radius");
		newObj = new Circle(radius, density, colour, velocity, acceleration, position);
	} else {
		const width = getElementFloatValue("width");
		const height = getElementFloatValue("height");
		newObj = new Rectangle(height, width, density, colour, velocity, acceleration, position);
	}
	return newObj;
}

// adding object function which grabs from the input fields on the html page to create an object of the given parameters.
function addInputObject() {
	const newObject = getInputtedObject();
	objects.push(newObject);
}

// this functions draws the given object, differentiating between methods of drawing using the object.shape property of the object class.
function drawObject(ctxSim, object) {
	if (!object.objectTracked) {
		ctxSim.fillStyle = object.getColour();
	} else {
		ctxSim.fillStyle = "#FFF04D";
	}
	if (object.getShape() == "circle") {
		ctxSim.beginPath();
		ctxSim.arc(object.getPosition().getX(), object.getPosition().getY(), object.getRadius(), 0, 2 * Math.PI);
		ctxSim.closePath();
		ctxSim.fill();
	} else if (object.getShape() == "rectangle") {
		ctxSim.beginPath();
		ctxSim.rect(object.getCorner().getX(), object.getCorner().getY(), object.getWidth(), object.getHeight());
		ctxSim.closePath();
		ctxSim.fill();
	}
}

// PRESET HANDLING FUNCTIONS------

function createPresetSituation() {
	for (const graph of graphs) {
		graph.queue.clearQueue();
	}
	const preset = document.getElementById("presets").value;
	if (preset != "none") {
		addPresetObjects(preset);
		presetConstants(preset);
	}
}

function setInputFieldsToNewConstants(E, G, T, P, input) {
	T *= 10;
	document.getElementById("restit").value = E.toString();
	document.getElementById("gravity").value = G.toString();
	document.getElementById("scale").value = T.toString();
	document.getElementById("densityOA").value = P.toString();
	document.getElementById("force-enabled").checked = input;
}


function presetConstants(preset) {
	const presetConstants = {
		diffusion: [1, 0, 0.1, 0, false],
		"atmospheric-diffusion": [1, 9.81, 0.1, 0, false],
		default: [1, 9.81, 0.1, 1.225, true]
	};
	const constants = presetConstants[preset];
	window.constants = {
		CoeffRest: constants[0],
		GravitationalFieldStrength: constants[1],
		TimeScale: constants[2],
		DensityOfAir: constants[3],
	};
	setInputFieldsToNewConstants(constants[0], constants[1], constants[2], constants[3], constants[4]);
}

function getPresetObjectList(preset) {
	// object filled with lists of objects which will be added to current object list to be drawn according to each preset.
	let presetObjectList = [];
	switch (preset) {
		case "diffusion":
			for (let i = 0; i < 100; i++) {
				// randomly decides if the y velocity will be upwards or downwards.
				presetObjectList.push(
					new Circle(5, 5, "red", new Velocity(ExtraMaths.generateRandomFloat(-50, 50),  ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), new Position(ExtraMaths.generateRandomFloat(0, 0.25 * RESOLUTION[0]), (((8 / 9) * RESOLUTION[1]) / 100) * i))
				);
			}
			for (let i = 0; i < 100; i++) {
				// randomly decides if the y velocity will be upwards or downwards.
				presetObjectList.push(
					new Circle(5, 5, "green", new Velocity(ExtraMaths.generateRandomFloat(-50, 50), ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), new Position(ExtraMaths.generateRandomFloat(0.75 * RESOLUTION[0], RESOLUTION[0]), (((8 / 9) * RESOLUTION[1]) / 100) * i))
				);
			}
			break;
		case "atmospheric-diffusion":
			const possibleMasses = [5,10,15]; 
			for (let i = 0; i < 66; i++) {
				// randomly decides if the y velocity will be upwards or downwards.
				presetObjectList.push(
					new Circle(5, possibleMasses[0], "red", new Velocity(ExtraMaths.generateRandomFloat(-50, 50), ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), new Position(ExtraMaths.generateRandomFloat(0, RESOLUTION[0]), generateRandomFloat(0, RESOLUTION[1])))
				);
			}
			for (let i = 0; i < 66; i++) {
				// randomly decides if the y velocity will be upwards or downwards.
				presetObjectList.push(
					new Circle(5, possibleMasses[1], "blue", new Velocity(ExtraMaths.generateRandomFloat(-50, 50), ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), new Position(ExtraMaths.generateRandomFloat(0, RESOLUTION[0]), ExtraMaths.generateRandomFloat(0, RESOLUTION[1])))
				);
			}
			for (let i = 0; i < 66; i++) {
				// randomly decides if the y velocity will be upwards or downwards.
				presetObjectList.push(
					new Circle(5, possibleMasses[2], "green", new Velocity(ExtraMaths.generateRandomFloat(-50, 50), ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), new Position(ExtraMaths.generateRandomFloat(0, RESOLUTION[0]), ExtraMaths.generateRandomFloat(0, RESOLUTION[1])))
				);
			}
			break;
		case "1:1-mass-collision":
			break;
		case "2:1-mass-collision":
			break;
		default:
			break;
	}
	return presetObjectList;
}

// INPUT HANDLING FUNCTIONS------

// adding object function which adds a list of objects, used to handle the creation of preset scenarios.
function addPresetObjects(preset) {
	const presetObjects = getPresetObjectList(preset);
	objects = presetObjects;
}

// mouse input function which updates the position attribute of the mouse class used for player input
function updateMousePos(event) {
	const canvas = document.getElementById("Simulation");
	const relativeCoords = canvas.getBoundingClientRect();
	// convert this to relative canvas coords :)
	mouse.containInBounds(event.clientX - relativeCoords.left, event.clientY - relativeCoords.top);
	for (let i = 0; i < 4; i++) {
		if (i < 2) {
			mouse.hitbox[i] = mouse.position.getX();
		} else {
			mouse.hitbox[i] = mouse.position.getY();
		}
	}
}

// mouse input handle which handles the event of the mouse click (of any buttons), i.e. inputting a force on an object.
function onMouseClick(event) {
	if (event.button == 0) {
		mouse.leftClicked = true;
	}
}

// Grabs the values from each input field in order to update the constants array to user selected values.
function getConstants() {
	const G = getElementFloatValue("gravity");
	const DENSITYOFAIR = getElementFloatValue("densityOA");
	const RATE = getElementFloatValue("scale") / 10;
	const E = getElementFloatValue("restit");
	const constants = {
		CoeffRest: E,
		GravitationalFieldStrength: G,
		TimeScale: RATE,
		DensityOfAir: DENSITYOFAIR,
	};
	return constants;
}

// the global variable constants is updated whenever this function is called, with updated values in the user interface of the web page.
function updateConstants() {
	constants = getConstants();
}

// the function called by the pause button when it is clicked, clears the interval when the button is toggled on when clicked, starts it again when toggled off when clicked.
// this stops and starts the animation of canvas.
// possibly change to a boolean denoting a paused sim and paused graph which skips the refresh frame for the canvas' allowing them to still have user input.
function pauseSim() {
	const btn = document.getElementById("pause-btn");
	if (btn.value == "ON") {
		clearInterval(window.interval);
	} else {
		const c = document.getElementById("Simulation");
		const ctxSim = c.getContext("2d");
		const canvasGraph = document.getElementById("Graphs");
		const ctxGraphs = canvasGraph.getContext("2d");
		const height = 480; // Resolution/dimensions of canvas displayed in.
		const width = 640;
		clock(ctxSim, ctxGraphs, width, height);
	}
}

 function getElementFloatValue(elementName) {
	const valueString = document.getElementById(elementName).value;
	const valueFloat = parseFloat(valueString);
	return valueFloat;
}

function refreshGraphScaling() {
	let isAutoScalingY = false;
	if (document.getElementById("auto-scale-y").checked){
		isAutoScalingY = true;
	}
	const information = {
		Displacement: new Vector2(getElementFloatValue("displacement-scale-x"), getElementFloatValue("displacement-scale-y")),
		Velocity: new Vector2(getElementFloatValue("velocity-scale-x"), getElementFloatValue("velocity-scale-y")),
		Acceleration: new Vector2(getElementFloatValue("acceleration-scale-x"), getElementFloatValue("acceleration-scale-y")),
		"Kinetic Energy": new Vector2(getElementFloatValue("kinetic-energy-scale-x"), getElementFloatValue("kinetic-energy-scale-y"))};
	let scales;
	for (const graph of graphs) {
		scales = information[graph.getAxisY()];
		if (!(isAutoScalingY)){
			graph.setScale(scales.getX(), scales.getY());
		}
		else {
			graph.setAutomaticScale();
			graph.setScale(x=scales.getX());
		}
	}
}

function refreshGraphComponents() {
	const displacementComponent =  document.getElementById("displacement-component").value;
	const velocityComponent = document.getElementById("velocity-component").value;
	const accelerationComponent = document.getElementById("acceleration-component").value;
	const components = {
		Displacement: displacementComponent,
		Velocity: velocityComponent,
		Acceleration: accelerationComponent
	};
	let componentToSet;
	for (const graph of graphs) {
		componentToSet = components[graph.getAxisY()];
		if (graph.getAxisYComponent() != componentToSet){
			graph.setAxisYComponent(componentToSet);
		}
	}
}

function refreshGraph() {
	refreshGraphScaling();
	refreshGraphComponents();
}

// Toggles the pause button between ON and OFF states, allows for the pauseSim() function to decide when to stop and start the interval function.
function tgl() {
	const btn = document.getElementById("pause-btn");
	if (btn.value == "ON") {
		btn.value = "OFF";
	} else {
		btn.value = "ON";
	}
}

function reInit() {
	clearInterval(window.interval);
	const c = document.getElementById("Simulation");
	ctxSim = c.getContext("2d");
	ctxSim.clearRect(0, 0, 640, 480);
	init();
}

// event listeners for user input ------------

document.getElementById("refresh-btn").addEventListener("click", updateConstants);

document.getElementById("preset-btn").addEventListener("click", createPresetSituation);

document.getElementById("pause-btn").addEventListener("click", pauseSim);

document.getElementById("refresh-sim").addEventListener("click", reInit);

document.getElementById("add-object-btn").addEventListener("click", addInputObject);

document.getElementById("refresh-scaling-btn").addEventListener("click", refreshGraph);

document.addEventListener("mousemove", updateMousePos);

document.addEventListener("mousedown", onMouseClick);

document.addEventListener("mouseup", onMouseClick);

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


//SECOND PRIORITY (DO AT HOME I NEED DUAL MONITOR FOR THIS)
// GRAPHS:
// drop down menus to decide on whether to plot the absolute value, x or y components of vectors
// add axis titles and scales.
// add an autoscaling algorithm for the graphing.	

// ADD ERROR HANDLING (I DONT KNOW WHAT KIND, MAYBE TRY CHECKING IF THE NEGATIVE DISCRIMINANT ERROR STILL EXISTS IN THIS)