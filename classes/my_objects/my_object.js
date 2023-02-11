class MyObject {
	constructor(colour = "black", velocity = new Velocity(), acceleration = new Acceleration(), position = new Position()) {
		this.colour = colour;
		this.forces = [new Vector2(0, 0), new Vector2(0, 0)];
		this.acceleration = acceleration;
		this.velocity = velocity;
		this.position = position;
		this.initialPosition = new Position(position.getX(), position.getY());
		this.timeSinceSpawned = 0;
		this.trackedObject = false;
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

	updateKinematics(densityOfAir, timeStep) {
		this.updateDrag(densityOfAir);
		this.acceleration.update(this);
		this.velocity.update(this.acceleration, timeStep);
		this.position.update(this.velocity, timeStep);
		this.timeSinceSpawned += timeStep;
	}

	addWeight(gravitationalFieldStrength) {
		this.forces[0] = new Vector2(0, this.mass * gravitationalFieldStrength);
	}

	setInputForce(force) {
		this.forces[2] = force;
	}

	resolveVectors() {
		let totalVector = new Vector2();
		for (let i = 0; i < this.forces.length; i++) {
			totalVector = totalVector.add(this.forces[i]);
		}
		return totalVector;
	}

	updateDrag(densityOfAir) {
		const dragX = -Math.sign(this.velocity.getX()) * 0.5 * densityOfAir * this.coeffDrag * this.width * (this.velocity.getX()) ** 2;
		const dragY = -Math.sign(this.velocity.getY()) * 0.5 * densityOfAir * this.coeffDrag * this.height * (this.velocity.getY()) ** 2;
		this.forces[1].setX(dragX);
		this.forces[1].setY(dragY);
	}

	getCollisionPlanes(otherObject) {
		let centreJointPlane; let perpendicularJointPlane; let flipAxis = false;
		// if the two objects colliding dont have the same position vectors
		if (this.position.x - otherObject.position.getX() != 0 && this.position.y - otherObject.position.getY() != 0) {
			const gradient = (this.position.getY() - otherObject.getPosition().getY()) / (this.position.getX() - otherObject.getPosition().getX());
			centreJointPlane = new Vector2(1, gradient);
			perpendicularJointPlane = new Vector2(1, -1 / gradient);
		} else if (this.position.getY() - otherObject.getPosition().getY() == 0) {
			centreJointPlane = new Vector2(1, 0);
			perpendicularJointPlane = new Vector2(0, 1);
		} else if (this.position.getX() - otherObject.getPosition().getX() == 0) {
			centreJointPlane = new Vector2(0, 1);
			perpendicularJointPlane = new Vector2(1, 0);
			flipAxis = true;
		}
		return [centreJointPlane, perpendicularJointPlane, flipAxis];
	}

	collide(otherObject, thisInitialVelocity, otherInitialVelocity, sumMomentum, elasticity) {
		const thisFinalVelocityCentrePlane = (sumMomentum + otherObject.getMass() * elasticity * (otherInitialVelocity - thisInitialVelocity))/(this.mass+otherObject.getMass());
		const otherFinalVelocityCentrePlane = (sumMomentum + this.mass*elasticity*(thisInitialVelocity - otherInitialVelocity))/(this.mass+otherObject.getMass());
		return [thisFinalVelocityCentrePlane, otherFinalVelocityCentrePlane];
	}

	getFinalVelocities(otherObject, elasticity) {
		// get the vector planes for the collision between the two objects (tangent to each other's centres and normal to those centres)
		const planes = this.getCollisionPlanes(otherObject);
		const centreJointPlane = planes[0];
		const perpendicularJointPlane = planes[1];
		const flipAxis = planes[2];
		// Get the cosine of the angle between the objects velocity vectors and the new planes
		// used to find the components of these velocities in these planes afterwards
		const thisCosCentrePlane = this.velocity.getCosAngle(centreJointPlane);
		const thisCosPerpendicularPlane = this.velocity.getCosAngle(perpendicularJointPlane);
		const otherCosCentrePlane = otherObject.velocity.getCosAngle(centreJointPlane);
		const otherCosPerpendicularPlane = otherObject.velocity.getCosAngle(perpendicularJointPlane);
		// find momentum of each object in the collision plane
		const thisMomentumCentrePlane = this.mass * this.velocity.getMag() * thisCosCentrePlane;
		const otherMomentumCentrePlane = otherObject.mass * otherObject.velocity.getMag() * otherCosCentrePlane;
		// get all numeric values to solve the derived quadratic equation for an elastic collision
		const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
		const calculatedVelocities = this.collide(otherObject, this.velocity.getMag() * thisCosCentrePlane, otherObject.getVelocity().getMag() * otherCosCentrePlane, sumMomentum, elasticity);
		const thisFinalVelocityCentrePlane = calculatedVelocities[0];
		const otherFinalVelocityCentrePlane = calculatedVelocities[1];
		const thisFinalVelocityPerpendicularPlane = this.velocity.getMag() * thisCosPerpendicularPlane;
		const otherFinalVelocityPerpendicularPlane = otherObject.getVelocity().getMag() * otherCosPerpendicularPlane;
		return [thisFinalVelocityCentrePlane, otherFinalVelocityCentrePlane, thisFinalVelocityPerpendicularPlane, otherFinalVelocityPerpendicularPlane, flipAxis];
	}

	otherObjectCollision(otherObject, elasticity = 1) {
		const velocityComponents = this.getFinalVelocities(otherObject, elasticity);
		let thisFinalVelocity;
		let otherFinalVelocity;
		if (!velocityComponents[4]) {
			thisFinalVelocity = new Velocity(velocityComponents[0], velocityComponents[2]);
			otherFinalVelocity = new Velocity(velocityComponents[1], velocityComponents[3]);
		} else {
			thisFinalVelocity = new Velocity(velocityComponents[2], velocityComponents[0]);
			otherFinalVelocity = new Velocity(velocityComponents[3], velocityComponents[1]);
		}
		const thisFinalVelocityXComp = thisFinalVelocity.getMag() * thisFinalVelocity.getCosAngle(new Vector2(1, 0));
		const thisFinalVelocityYComp = thisFinalVelocity.getMag() * thisFinalVelocity.getCosAngle(new Vector2(0, 1));
		const otherFinalVelocityXComp = otherFinalVelocity.getMag() * otherFinalVelocity.getCosAngle(new Vector2(1, 0));
		const otherFinalVelocityYComp = otherFinalVelocity.getMag() * otherFinalVelocity.getCosAngle(new Vector2(0, 1));
		this.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
		otherObject.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp);
	}
}
