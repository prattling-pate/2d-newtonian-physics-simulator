
class SimulationHandler extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.objects = [];
		this.collisionBuffer = {};
		this.bufferCounter=0;
		this.bufferFrames=5;
		this.trackedObjectIndex;
		this.trackedObject;
		this.constants = {
			CoeffRest: 0,
			GravitationalFieldStrength: 0,
			timeStep: 0,
			DensityOfAir: 0,
		};
		this.reloaded = true;
	}

	addObject(newObject) {
		this.objects.push(newObject);
	}

	setObjectsList(newList) {
		this.objects = newList;
	}

	setConstants(E, G, T, P) {
		this.constants.CoeffRest = E;
		this.constants.GravitationalFieldStrength = G;
		this.constants.timeStep = T;
		this.constants.DensityOfAir = P;
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
		if (object.shape == "circle") {
			objectXPosition = object.position.getX();
			objectYPosition = object.position.getY();
			this.drawCircle(objectXPosition, objectYPosition, object.radius, objectColour);
		}
		else {
			objectXPosition = object.getCorner.getX();
			objectYPosition = object.getCorner.getY();
			this.drawRectangle(objectXPosition, objectYPosition, object.width, object.height, objectColour);
		}
	}

	moveTimeForward() {
		if ((this.bufferCounter + 1) % this.bufferFrames == 0){
			this.collisionBuffer = {};
		}
		this.bufferCounter++;
		if (this.objects.length > 0 && this.reloaded) {
			this.trackedObject = this.objects[0];
			this.objects[0].trackedObject = true;
			this.trackedObjectIndex = 0;
			this.reloaded = false;
		}
		for (const object of this.objects) {
			object.addWeight(this.constants.GravitationalFieldStrength);
			object.groundCeilingCollision(this.constants.CoeffRest, this.constants.timeStep, this.height);
			object.sideCollision(this.constants.CoeffRest, this.constants.timeStep, this.width);
			object.updateKinematics(this.constants.DensityOfAir, this.constants.timeStep);
			object.updateHitbox();
		}
		for (const object1 of this.objects) {
			for (const object2 of this.objects) {
				if (object1.isCollision(object2, this.constants.timeStep) && object1!=object2 && !(this.collisionBuffer.hasOwnProperty(object1)||this.collisionBuffer.hasOwnProperty(object2))) {
					this.collisionBuffer.object1=true;
					this.collisionBuffer.object2=true;
					object1.otherObjectCollision(object2);
				}
			}
		}
	}

	drawFrame() {
		this.drawBackground();
		this.drawGround();
		for (const object of this.objects) {
			this.drawObject(object);
		}
	}

	animateFrame() {
		this.drawFrame();
		if (this.running) {
			this.moveTimeForward();
		}
	}
}