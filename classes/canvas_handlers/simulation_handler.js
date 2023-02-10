class SimulationHandler extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.objects = [];
		this.collisionBuffer = {};
		this.bufferCounter = 0;
		this.bufferFrames = 5;
		this.trackedObjectIndex;
		this.trackedObject;
		this.constants = {
			coeffRest: 0,
			gravitationalFieldStrength: 0,
			timeStep: 0,
			densityOfAir: 0,
		};
		this.showMasses = false;
		this.reloaded = true;
	}

	addObject(newObject) {
		this.objects.push(newObject);
	}

	setObjectsList(newList) {
		this.objects = newList;
	}

	setConstants(E, G, T, P) {
		this.constants.coeffRest = E;
		this.constants.gravitationalFieldStrength = G;
		this.constants.timeStep = T;
		this.constants.densityOfAir = P;
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
		if (object.trackedObject) {
			objectColour = "#FFF04D";
		}
		objectXPosition = object.position.getX();
		objectYPosition = object.position.getY();
		this.drawCircle(objectXPosition, objectYPosition, object.radius, objectColour);
	}

	drawMasses(object) {
		let objectXPosition;
		let objectYPosition;
		objectXPosition = object.position.getX();
		objectYPosition = object.position.getY();
		this.drawText(object.mass.toFixed(3) +" kg", objectXPosition, objectYPosition, "black")
	}

	moveTimeForward() {
		if ((this.bufferCounter + 1) % this.bufferFrames == 0) {
			this.collisionBuffer = {};
		}
		this.bufferCounter++;
		for (const object of this.objects) {
			object.addWeight(this.constants.gravitationalFieldStrength);
			object.groundCeilingCollision(this.constants.coeffRest, this.constants.timeStep, this.height);
			object.sideCollision(this.constants.coeffRest, this.constants.timeStep, this.width);
			object.updateKinematics(this.constants.densityOfAir, this.constants.timeStep);
			if (object.shape == "rectangle") {
				object.updateHitbox();
			}
		}
		for (const object1 of this.objects) {
			for (const object2 of this.objects) {
				if (object1 != object2 && !(this.collisionBuffer.hasOwnProperty(object1) && this.collisionBuffer.hasOwnProperty(object2))) {
					if (object1.isCollision(object2, this.constants.timeStep)) {
						this.collisionBuffer.object1 = true;
						this.collisionBuffer.object2 = true;
						object1.otherObjectCollision(object2, this.constants.coeffRest);
					}
				}
			}
		}
	}

	drawFrame() {
		this.drawBackground();
		this.drawGround();
		for (const object of this.objects) {
			this.drawObject(object);
			if (this.showMasses){
				this.drawMasses(object);
			}
		}
	}

	setTrackedObject() {
		if (this.objects.length > 0 && this.reloaded) {
			this.trackedObject = this.objects[0];
			this.objects[0].trackedObject = true;
			this.trackedObjectIndex = 0;
			this.reloaded = false;
		}
	}

	animateFrame() {
		this.drawFrame();
		// figure out how to have this run only when an object is tracked
		if (this.running && this.objects.length > 0 && !this.reloaded) {
			this.moveTimeForward();
		}
		this.setTrackedObject();
	}
}
