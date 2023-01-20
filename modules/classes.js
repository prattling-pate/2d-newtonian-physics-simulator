// CLASSES

// main 2 vector class

class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	getX() {
		return this.x;
	}

	setX(inp) {
		this.x = inp;
	}

	getY() {
		return this.y;
	}

	setY(inp) {
		this.y = inp;
	}

	// VECTOR ARITHMETIC METHODS -----

	// implement fast inverse square root algorithm using bit manip., apparently slower than default method of 1 / Math.sqrt()
	getMag() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	dotProd(otherVector) {
		return this.x * otherVector.getX() + this.y * otherVector.getY();
	}

	getCosAngle(otherVector) {
		return this.dotProd(otherVector) / (this.getMag() * otherVector.getMag());
	}

	add(otherVector) {
		return new Vector2(this.x + otherVector.getX(), this.y + otherVector.getY());
	}

	sub(otherVector) {
		return new Vector2(this.x - otherVector.getX(), this.y - otherVector.getY());
	}

	mult(number) {
		return new Vector2(this.x * number, this.y * number);
	}
}

// classes extending the 2 vector to run newtonian mechanics simulation

class Position extends Vector2 {
	constructor(x, y) {
		super(x, y);
	}
	// uses equation s = vt to calculate the vector change in position
	update(velocity, RATE) {
		this.x += velocity.getX() * RATE;
		this.y += velocity.getY() * RATE;
	}
}

class Velocity extends Vector2 {
	constructor(x, y) {
		super(x, y);
	}

	// use equation v=at to find vector change in velocity
	update(acceleration, RATE) {
		this.x += acceleration.getX() * RATE;
		this.y += acceleration.getY() * RATE;
	}
}

class Acceleration extends Vector2 {
	constructor(x, y) {
		super(x, y);
	}

	// uses Newton's generalised second law F=ma to find new acceleration of object given its resultant force and mass (a = F/m)
	update(object) {
		this.x = object.resolveVectors().getX() / object.getMass();
		this.y = object.resolveVectors().getY() / object.getMass();
	}
}

// class outlining the generic object boilerplate

class Object {
	constructor(colour = "black", velocity = new Velocity(), acceleration = new Acceleration(), position = new Position()) {
		this.colour = colour;
		this.forces = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
		this.acceleration = acceleration;
		this.velocity = velocity;
		this.position = position;
		this.initialPosition = position;
		this.timeSinceSpawned = 0;
		this.objectTracked = false;
	}

	getForces() {
		return this.forces;
	}

	getColour() {
		return this.colour;
	}

	getVelocity() {
		return this.velocity;
	}

	setVelocity(x, y) {
		this.velocity.setX(x);
		this.velocity.setY(y);
	}

	getAcceleration() {
		return this.acceleration;
	}

	getPosition() {
		return this.position;
	}

	getDensity() {
		return this.density;
	}

	getMass() {
		return this.mass;
	}

	getKineticEnergy() {
		return 0.5 * this.mass * this.velocity.getMag() ** 2;
	}

	getMomentum() {
		return this.velocity.getMag() * this.mass;
	}

	getDisplacement() {
		return this.position.sub(this.initialPosition);
	}

	getTime() {
		return this.timeSinceSpawned;
	}

	updateAll() {
		this.updateDrag(constants["DensityOfAir"]);
		this.acceleration.update(this);
		this.velocity.update(this.acceleration, constants["TimeScale"]);
		this.position.update(this.velocity, constants["TimeScale"]);
		this.forces[2] = new Vector2(0, 0);
		this.timeSinceSpawned += constants["TimeScale"];
	}

	addWeight() {
		this.forces[0] = new Vector2(0, this.mass * constants["GravitationalFieldStrength"]);
	}

	setInputForce(force) {
		this.forces[2] = force;
	}

	resolveVectors() {
		let totalVect = new Vector2(0, 0);
		for (let i = 0; i < this.forces.length; i++) {
			totalVect = totalVect.add(this.forces[i]);
		}
		return totalVect;
	}

	updateDrag(DENSITYOFAIR) {
		const dragX = -Math.sign(this.velocity.getX()) * 0.5 * DENSITYOFAIR * this.coeffDrag * this.width * this.velocity.getX() ** 2;
		const dragY = -Math.sign(this.velocity.getY()) * 0.5 * DENSITYOFAIR * this.coeffDrag * this.height * this.velocity.getY() ** 2;
		this.forces[1] = new Vector2(dragX, dragY);
	}

	sideCollision() {
		const E = constants["CoeffRest"];
		const RATE = constants["TimeScale"];
		// side collision check (checks if out of bounds on right side or on left side respectively in if statement)
		if (this.position.getX() + this.velocity.getX() * RATE + this.radius >= RESOLUTION[0] || this.position.getX() + this.velocity.getX() * RATE - this.radius <= 0) {
			this.velocity.setX(-this.velocity.getX() * E);
		}
	}

	groundCeilingCollision() {
		const E = constants["CoeffRest"];
		const RATE = constants["TimeScale"];
		// ground collision check - statement 1. ceiling collision check - statement 2
		if (this.position.getY() + this.velocity.getY() * RATE + this.radius >= RESOLUTION[1] * (8 / 9)) {
			this.position.setY(RESOLUTION[1] * (8 / 9) - this.radius);
			this.velocity.setY(-this.velocity.getY() * E);
		} else if (this.position.getY() + this.velocity.getY() * RATE + this.radius <= 0) {
			this.velocity.setY(-this.velocity.getY() * E);
		}
	}

	isCollision(other) {
		if (
			((this.hitbox[0] > other.hitbox[1] && this.hitbox[1] < other.hitbox[1]) || (this.hitbox[0] > other.hitbox[0] && this.hitbox[1] < other.hitbox[0])) &&
			((this.hitbox[2] > other.hitbox[3] && this.hitbox[3] < other.hitbox[3]) || (this.hitbox[2] > other.hitbox[2] && this.hitbox[3] < other.hitbox[2]))
		) {
			if (other instanceof Object) {
				this.fixSamePointProblem(other);
			}
			return true;
		}
		return false;
	}

	// fixes problem of object phasing out of simulation due to taking up the same point in 2d space.
	fixSamePointProblem(other) {
		if (this.position == other.getPosition()) {
			this.position.setX(this.position.getX() + 1);
		}
	}

	getCollisionPlanes(otherObject) {
		let centreJointPlane = 0;
		let perpendicularJointPlane = 0;
		if (this.position.getX() - otherObject.getPosition().getX() != 0 && this.position.getY() - otherObject.getPosition().getY() != 0) {
			const gradient = (this.position.getY() - otherObject.getPosition().getY()) / (this.position.getX() - otherObject.getPosition().getX());
			centreJointPlane = new Vector2(1, gradient);
			perpendicularJointPlane = new Vector2(1, -1 / gradient);
		} else if (this.position.getY() - otherObject.getPosition.getY() != 0) {
			centreJointPlane = new Vector2(1, 0);
			perpendicularJointPlane = new Vector2(0, 1);
		} else {
			centreJointPlane = new Vector2(0, 1);
			perpendicularJointPlane = new Vector2(1, 0);
		}
		return [centreJointPlane, perpendicularJointPlane];
	}

	getFinalVelocities(otherObject) {
		const planes = this.getCollisionPlanes(otherObject);
		const centreJointPlane = planes[0];
		const perpendicularJointPlane = planes[1];
		const thisCosCentrePlane = this.velocity.getCosAngle(centreJointPlane);
		const thisCosPerpendicularPlane = this.velocity.getCosAngle(perpendicularJointPlane);
		const otherCosCentrePlane = otherObject.velocity.getCosAngle(centreJointPlane);
		const otherCosPerpendicularPlane = otherObject.velocity.getCosAngle(perpendicularJointPlane);
		const thisMomentumCentrePlane = this.mass * this.velocity.getMag() * thisCosCentrePlane;
		const otherMomentumCentrePlane = otherObject.mass * otherObject.velocity.getMag() * otherCosCentrePlane;
		const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
		const sumEnergy = 0.5 * (this.mass * (this.velocity.getMag() * thisCosCentrePlane) ** 2 + otherObject.mass * (otherObject.velocity.getMag() * otherCosCentrePlane) ** 2);
		const a = -this.mass * (otherObject.mass + this.mass);
		const b = 2 * sumMomentum * this.mass;
		const c = 2 * sumEnergy * otherObject.mass - sumMomentum ** 2;
		let thisFinalVelocityCentrePlane = 0;
		let otherFinalVelocityCentrePlane = 0;
		if (b ** 2 - 4 * a * c >= 0) {
			thisFinalVelocityCentrePlane = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
			otherFinalVelocityCentrePlane = (sumMomentum - this.mass * thisFinalVelocityCentrePlane) / otherObject.getMass();
		} else {
			thisFinalVelocityCentrePlane = this.velocity.getMag() * thisCosCentrePlane;
			otherFinalVelocityCentrePlane = otherObject.getVelocity().getMag() * otherCosCentrePlane;
		}
		const thisFinalVelocityPerpendicularPlane = this.velocity.getMag() * thisCosPerpendicularPlane;
		const otherFinalVelocityPerpendicularPlane = otherObject.getVelocity().getMag() * otherCosPerpendicularPlane;
		return [thisFinalVelocityCentrePlane, otherFinalVelocityCentrePlane, thisFinalVelocityPerpendicularPlane, otherFinalVelocityPerpendicularPlane];
	}

	otherObjectCollision(otherObject) {
		const velocityComponents = this.getFinalVelocities(otherObject);
		const thisFinalVelocity = new Velocity(velocityComponents[0], velocityComponents[2]);
		const otherFinalVelocity = new Velocity(velocityComponents[1], velocityComponents[3]);
		const thisFinalVelocityXComp = thisFinalVelocity.getMag() * thisFinalVelocity.getCosAngle(new Vector2(1, 0));
		const thisFinalVelocityYComp = thisFinalVelocity.getMag() * thisFinalVelocity.getCosAngle(new Vector2(0, 1));
		const otherFinalVelocityXComp = otherFinalVelocity.getMag() * otherFinalVelocity.getCosAngle(new Vector2(1, 0));
		const otherFinalVelocityYComp = otherFinalVelocity.getMag() * otherFinalVelocity.getCosAngle(new Vector2(0, 1));
		// maybe add coefficient of restitution to this equation after creating a function which fixes the problem of object getting stuck in each other post collision (similar to side collision logic)
		this.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
		otherObject.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp);
	}
}

// classes extending the object class to specific shapes which can be drawn.

class Circle extends Object {
	constructor(radius, density, colour, velocity, acceleration, position) {
		super(colour, velocity, acceleration, position);
		this.shape = "circle";
		this.coeffDrag = 0.47;
		this.width = radius * Math.PI;
		this.height = radius * Math.PI;
		this.radius = radius;
		this.volume = Math.PI * radius ** 2;
		this.mass = density * this.volume;
		this.hitbox = [position.getX() + radius, position.getX() - radius, position.getY() + radius, position.getY() - radius];
	}

	updateHitbox() {
		this.hitbox = [this.position.getX() + 0.5 * this.radius, this.position.getX() - 0.5 * this.radius, this.position.getY() + 0.5 * this.radius, this.position.getY() - 0.5 * this.radius];
	}

	getShape() {
		return this.shape;
	}

	getRadius() {
		return this.radius;
	}
}

class Rectangle extends Object {
	constructor(height, width, density, colour, velocity, acceleration, position) {
		super(colour, velocity, acceleration, position);
		this.height = height;
		this.coeffDrag = 1.05;
		this.width = width;
		this.mass = this.height * this.width * density;
		this.hitbox = [position.getX() + 0.5 * width, position.getX() - 0.5 * width, position.getY() + 0.5 * height, position.getY() - 0.5 * height];
	}

	updateHitbox() {
		this.hitbox = [this.position.getX() + 0.5 * width, this.position.getX() - 0.5 * width, this.position.getY() + 0.5 * height, this.position.getY() - 0.5 * height];
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getCorner() {
		let x = this.position.getX();
		let y = this.position.getY();
		x -= 0.5 * this.width;
		y -= 0.5 * this.height;
		return new Position(x, y);
	}
}

// mouse class used to store information on the user mouse cursor for inputting of forces and viewing information about objects.

class Mouse {
	constructor() {
		this.position = new Position();
		this.hitbox = [0, 0, 0, 0]; // have to use the same .hitbox property structure to not have to code a new function for detecting whether mouse is in an object
		this.prevPos = new Position(); // denotes previous position of mouse when left click is first pressed
		this.inputPrimed = false;
		this.inputtedObject = null;
		this.leftClicked = false;
		this.trackedObject = null;
	}

	// add code which allows user to switch object via right clicking using eventlistener functions.

	setTrackedObject(other) {
		this.trackedObject = other;
	}

	isInObject(other) {
		return other.isCollision(this);
	}

	addForceOnObject(other) {
		if (this.isInObject(other) && this.leftClicked && !this.inputPrimed) {
			// cannot directly assign this.pos as it tracks the property for some reason then
			this.prevPos = new Position(this.position.x, this.position.y);
			this.leftClicked = false;
			this.inputPrimed = true;
			this.inputtedObject = other;
		} else if (!this.isInObject(other) && this.leftClicked && this.inputPrimed) {
			const diffPos = this.position.sub(this.prevPos);
			this.prevPos = new Position();
			this.inputtedObject.forces[2] = diffPos.mult(-10000);
			this.leftClicked = false;
			this.inputPrimed = false;
			this.inputtedObject = null;
		}
	}

	containInBounds(x, y) {
		switch (x != null) {
			case x > 0 && x < 640:
				this.position.setX(x);
				break;
			case x < 0:
				this.position.setX(0);
				break;
			case x > 640:
				this.position.setX(640);
				break;
			default:
				break;
		}
		switch (y != null) {
			case y > 0 && y < 480:
				this.position.setY(y);
				break;
			case y < 0:
				this.position.setY(0);
				break;
			case y > 480:
				this.position.setY(480);
				break;
			default:
				break;
		}
	}
}

// need to implement
class GraphQueue {
	constructor(maximumLength) {
		this.data = [];
		this.frontPointer = -1;
		this.backPointer = 0;
		this.maximumLength = maximumLength;
	}

	enqueueData(newData) {
		if (this.isFull()) {
			this.data[this.backPointer] = newData;
			this.frontPointer = this.backPointer;
			this.backPointer++;
			return null;
		}
        this.frontPointer++;
		this.data.push(newData);
	}

	isFull() {
		return (this.backPointer + 1) % this.maximumLength == this.frontPointer;
	}

	translateRelativeIndexToAbsoluteIndex(index) {
        const newIndex = (this.backPointer + index) % this.maximumLength;
		return newIndex;
	}

    shiftItemXAxisLeft(){
        const timeStep = this.data[this.backpointer+1]-this.data[this.backpointer];
        for (let i = 0; i < this.maximumLength; i++){
            this.data[this.translateRelativeIndexToAbsoluteIndex(i)].setX(this.data.getX() - timeStep);
        }
    }
}

// graph class which stores information about data and methods related to drawing graphs

class Graph {
	constructor(width, height, axisY, axisX = "Time", scale = new Vector2(1, 1), originPosition) {
		this.width = width;
		this.height = height;
		this.axisX = axisX;
		this.axisY = axisY;
		this.scale = scale;
		this.originPosition = originPosition; // indicates the quadrant of the canvas the graph resides in
		this.queue = new GraphQueue(100); // data property is a linear dynamic queue, allows old datapoints to be taken from graph while new ones are untouched
	}

	drawLine(ctx, initialPosition, finalPosition) {
		ctx.beginPath();
		ctx.moveTo(initialPosition.getX(), initialPosition.getY());
		ctx.lineTo(finalPosition.getX(), finalPosition.getY());
		ctx.stroke();
	}

	drawGraph(ctx) {
		// object storing the origin position for each sector
		const originCentre = this.originPosition;
		// drawing the graph axis
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = "black";
		this.drawLine(ctx, new Position(originCentre.getX() - this.width * 0.25, originCentre.getY()), new Position(originCentre.getX() + this.width * 0.25, originCentre.getY()));
		this.drawLine(ctx, new Position(originCentre.getX() - this.width * 0.25, originCentre.getY() - this.height * 0.25), new Position(originCentre.getX() - this.width * 0.25, originCentre.getY() + this.height * 0.25));
		// drawing boundaries between graphs
		ctx.lineWidth = 5;
		this.drawLine(ctx, new Position(originCentre.getX() - this.width * 0.25, originCentre.getY() - this.height * 0.25), new Position(originCentre.getX() + this.width * 0.25, originCentre.getY() - this.height * 0.25));
		this.drawLine(ctx, new Position(originCentre.getX() + this.width * 0.25, originCentre.getY() - this.height * 0.25), new Position(originCentre.getX() + this.width * 0.25, originCentre.getY() + this.height * 0.25));
		ctx.fontStyle = "30px Calibri";
		ctx.fillStyle = "black";
		const textPosition = new Position(originCentre.getX() - this.width * 0.24, originCentre.getY() - this.height * (1.75 / 8));
		ctx.fillText(this.axisY, textPosition.getX(), textPosition.getY());
	}

	// figure out how to do scaling
	// data goes out of bounds due to absolute time being used to plot - just take away some constant i have to figure out
	plotData(ctx, objectData) {
		const information = {
			Displacement: objectData.getDisplacement().getX(), // could use integration but that could be very taxing on the performance
			Velocity: objectData.getVelocity().getX(),
			"Kinetic Energy": objectData.getKineticEnergy(), // for now in 10^4 J
			Time: objectData.getTime(),
		};
		let toPlot;
		if (this.axisY != "Acceleration") {
			toPlot = information[this.axisY];
		} else {
			toPlot = information["Velocity"];
		}
		const timeOfPlot = information["Time"];
		this.maintainDataQueue();
		this.enqueueData(new Position(timeOfPlot, toPlot));
		let position;
		let positionNext;
		for (let i = 0; i < this.getDataQueueLength() - 1; i++) {
			ctx.beginPath();
			position = this.translateDataToCanvasPlane(this.data[i]);
			positionNext = this.translateDataToCanvasPlane(this.data[i + 1]);
			if (this.isDataPointInBounds(position) && this.isDataPointInBounds(positionNext)) {
				ctx.moveTo(position.getX(), position.getY());
				ctx.lineTo(positionNext.getX(), positionNext.getY());
				ctx.stroke();
			}
		}
	}

	// translates data point to the canvas coordinates system.
	translateDataToCanvasPlane(data) {
		const position = new Position(this.originPosition.getX() - 0.25 * this.width + data.getX() * this.scale.getX(), this.originPosition.getY() - data.getY() * this.scale.getY());
		return position;
	}

	// checks if datapoint is in boundary to be plotted, if not then
	isDataPointInBounds(dataPoint) {
		if (this.originPosition.getY() - 0.25 * this.height < dataPoint.getY() && this.originPosition.getY() + 0.25 * this.height > dataPoint.getY()) {
			return true;
		}
		return false;
	}

	// methods for obtaining other graphs from velocity -- WIP

	// used only by velocity graph to return the queue for the acceleration graph
	getAcceleration(dataPoint, dataPointNext) {
		return new Position(dataPoint.getX(), this.differentiate(dataPoint, dataPointNext));
	}

	differentiate(dataPoint, dataPointNext) {
		return (dataPointNext.getY() - dataPoint.getY()) / (dataPointNext.getX() - dataPoint.getX());
	}

	// data queue methods

	maintainDataQueue() {
		// if the data queue hits an abitrary maximum length the first data point is dequeued and then all points are moved back by one timeframe back on the plot.
		if (this.isDataQueueFull()) {
			// should implement a static list of size max, with each positions.x being the index*timeScale. A problem will 100% all the memory movement. Could instead implement circular.
			this.dequeueData();
			const timeStep = this.data[1].getX() - this.data[0].getX();
			// moves back all data points by one data point
			for (let i = 0; i < this.getDataQueueLength(); i++) {
				this.data[i].setX(this.data[i].getX() - timeStep * this.scale.getX());
			}
		}
	}

	isDataQueueFull() {
		return this.getDataQueueLength() >= this.maxQueueLength;
	}

	enqueueData(dataInput) {
		this.data.push(dataInput);
	}

	dequeueData() {
		this.data.shift();
	}

	getDataQueueLength() {
		return this.data.length;
	}
}
