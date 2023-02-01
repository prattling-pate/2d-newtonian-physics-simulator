// default settings when the simulation is ran
const Settings = {
	"Resolution": [640, 480],
	"Force Scalar": 5,
	"Size Scalar": 20,
	"Buffer Frames": 0,
};

// run the application: fix problems. ask jake and charlie about how to handle presets + input as code will be messy if
// the global instances of the handlers are constantly accessed

class CanvasHandler {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.canvasCtx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.running = true;
	}

	// move to main.js when creating the self contained module.
	drawLine(initialPosition, finalPosition, colour="black") {
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

class SimulationHandler extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.objects = [];
		this.objectTracked = false;
		this.constants = {
			CoeffRest: 1,
			GravitationalFieldStrength: 9.81,
			TimeScale: 0.1,
			DensityOfAir: 1.225,
		};
	}

	addObject(newObject) {
		this.objects.push(newObject);
	}

	setObjectsList(newList){
		this.objects = newList;
	}

	setConstants(E, G, T, P) {
		this.constants.CoeffRest=E;
		this.constants.GravitationalFieldStrength=G;
		this.constants.TimeScale=T;
		this.constants.DensityOfAir=P;
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
			this.drawRectangle(objectXPosition, objectYPosition, object.width, object.height, objectColour);
		}
	}

	moveTimeForward() {
		if (this.objects.length > 0 && !this.objectTracked) {
			this.objects[0].objectTracked = true;
		}
		for (const object of this.objects) {
			object.addWeight(this.constants.GravitationalFieldStrength);
			object.groundCeilingCollision(this.constants.CoeffRest, this.constants.TimeScale, this.height);
			object.sideCollision(this.constants.CoeffRest, this.constants.TimeScale, this.width);
			object.updateKinematics(this.DensityOfAir, this.TimeScale);
			object.updateHitbox();
		}
		for (const object1 of this.objects) {
			for (const object2 of this.objects) {
				if (object1.isCollision(object2)) {
					object1.otherObjectCollision(object2);
				}
			}
		}
	}

	drawFrame() {
		this.drawBackground();
		this.drawGround();
		for (const object of this.objects){
			this.drawObject(object);
		}
	}

	animateFrame() {
		this.drawFrame();
		this.moveTimeForward();
	}
}

// add this into the code for the interval repetition of the code and see if there are problems.
// then find ways to implement the event handlers in more oop ways.

class DataLoggerHandler extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.graphs = [];
		this.trackedObject;
		this.canvasCtx.fontStyle = "30px Calibri";
	}

	clearGraphQueues(){
		for (const graph of this.graphs) {
			graph.clearQueue();
		}
	}

	setTrackedObject(object) {
		this.trackedObject = object;
	}

	addGraph(yAxis, centrePosition) {
		const position = {
			upperLeft: new Position(this.width * 0.25, this.height * 0.25),
			upperRight: new Position(this.width * 0.75, this.height * 0.25),
			bottomLeft: new Position(this.width * 0.25, this.height * 0.75),
			bottomRight: new Position(this.width * 0.75, this.height * 0.75)
		}
		const graph = new Graph(this.width, this.height, yAxis, "Time", position[centrePosition])
		this.graphs.push(graph);
	}

	drawBackground() {
		this.drawRectangle(0, 0, this.width, this.height, "white");
	}

	drawBorders(lineCoordinates) {
		this.canvasCtx.lineWidth = 5;
		this.drawLine(lineCoordinates.topLeft, lineCoordinates.bottomLeft, "black");
		this.drawLine(lineCoordinates.topRight, lineCoordinates.bottomRight, "black");
	}

	drawAxis(lineCoordinates) {
		this.canvasCtx.lineWidth = 2.5;
		this.drawLine(lineCoordinates.middleLeft, lineCoordinates.middleRight, "black");
		this.drawLine(lineCoordinates.topLeft, lineCoordinates.topRight, "black");
	}

	drawGraph(graph) {
		const lineCoordinates = {
			middleLeft: new Position(graph.originPosition.getX() - graph.width * 0.25, graph.originPosition.getY()), 
			middleRight: new Position(graph.originPosition.getX() + graph.width * 0.25, graph.originPosition.getY()),
			topLeft: new Position(graph.originPosition.getX() - graph.width * 0.25, graph.originPosition.getY() - graph.height * 0.25), 
			topRight: new Position(graph.originPosition.getX() + graph.width * 0.25, graph.originPosition.getY() - graph.height * 0.25),
			bottomRight: new Position(graph.originPosition.getX() + graph.width * 0.25, graph.originPosition.getY() + graph.height * 0.25),
			bottomLeft: new Position(graph.originPosition.getX() - graph.width * 0.25, graph.originPosition.getY() + graph.height * 0.25)
		};
		
		// drawing the graph axis
		this.drawAxis(lineCoordinates);
		// drawing boundaries between graphs
		this.drawBorders(lineCoordinates);
		const yAxisTitlePosition = graph.translateDataToCanvasPlane(new Position(10, 100));
		this.drawText(graph.axisY + " " + graph.unitsY, yAxisTitlePosition.getX(), yAxisTitlePosition.getY(), "black");
		const xAxisTitlePosition = graph.translateDataToCanvasPlane(new Position(280, 10));
		this.drawText(graph.axisX + " (s)", xAxisTitlePosition.getX(), xAxisTitlePosition.getY(), "black");
		
	}

	drawScales(graph) {
		let yValueScale;
		const xPosOfYScale = graph.originPosition.getX() - graph.width*0.225;
		for (let i = 0; i < 6; i++) {
			yValueScale = graph.roundToSignificantFigures(20*(i+1)*(1/graph.scale.getY()), 3);
			this.drawText(yValueScale, xPosOfYScale, graph.originPosition.getY()-(i+1)*20, "black");
			this.drawText(-yValueScale, xPosOfYScale, graph.originPosition.getY()+(i+1)*20, "black");
		}
	}

	plotData(graph) {
		let position; let positionNext; let index; let indexNext; let colour;
		const timeStep = graph.getXStepInPlot();
		for (let i = 0; i < graph.queue.getLength() - 1; i++) {
			index = graph.queue.getQueueIndex(i);
			indexNext = graph.queue.getQueueIndex(i+1);
			position = graph.translateDataToCanvasPlane(new Position((i)*timeStep, graph.queue.data[index][0]));
			positionNext = graph.translateDataToCanvasPlane(new Position((i+1)*timeStep, graph.queue.data[indexNext][0]));
			colour = graph.getColourOfDataPoint(graph.queue.data[indexNext][2]);
			this.drawLine(position, positionNext, colour);
			if ((i+50) % 100 == 0){
				// draws the x axis scales
				this.drawText(graph.queue.data[index][3], position.getX(), graph.originPosition.getY() + 20, "black");
			}
		}
		this.drawScales(graph);
	}

	animateFrame() {
		this.drawBackground();
		for (const graph of this.graphs) {
			this.drawGraph(graph);
			if (this.trackedObject){
				graph.addData(this.trackedObject);
				this.plotData(graph);
			}
		}
	}
}

// CONSTANTS

const RESOLUTION = Settings["Resolution"];

// GLOBALS--------------

const mouse = new Mouse();
const simulationHandler = new SimulationHandler("Simulation");
const dataLoggerHandler = new DataLoggerHandler("Graphs");


// CORE FUNCTIONS--------

// function which initializes the simulation
function init() {
	dataLoggerHandler.addGraph("Displacement", "upperLeft");
	dataLoggerHandler.addGraph("Velocity", "upperRight");
	dataLoggerHandler.addGraph("Acceleration", "bottomLeft");
	dataLoggerHandler.addGraph("Kinetic Energy", "bottomRight");
	clock();
}

// this function runs the update every 10ms using an interval function, this interval loops the update function which updates the positions of all balls in the animation.
function clock(refreshRate) {
	const milliSecondsPerFrame = 1000/refreshRate;
	window.interval = setInterval(update, milliSecondsPerFrame);
}

// function which draws the simulations current frame using the canvas drawing functions.
function update() {
	simulationHandler.animateFrame();
	dataLoggerHandler.setTrackedObject(simulationHandler.objectTracked);
	dataLoggerHandler.animateFrame();
}

function getInputtedObject() {
	let newObj;
	const shape = document.getElementById("object-type").value;
	const colour = document.getElementById("colour").value;
	const density = getElementFloatValue("density");
	const position = new Position(getElementFloatValue("position-x"), simulationHandler.height - (getElementFloatValue("position-y")+(1/9)*simulationHandler.height));
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
	simulationHandler.addObject(newObject);
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
	simulationHandler.setConstants(constants[0], constants[1], constants[2], constants[3]);
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
					new Circle(5, 5, "red", new Velocity(
						ExtraMaths.generateRandomFloat(-50, 50),  
						ExtraMaths.generateRandomFloat(-50, 50)), new Acceleration(), 
						new Position(ExtraMaths.generateRandomFloat(0, 0.25 * RESOLUTION[0]),
					 	(((8 / 9) * RESOLUTION[1]) / 100) * i))
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