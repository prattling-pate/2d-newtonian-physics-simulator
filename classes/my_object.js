class MyObject {
	constructor(colour = "black", velocity = new Velocity(), acceleration = new Acceleration(), position = new Position()) {
		this.colour = colour;
		this.forces = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
		this.acceleration = acceleration;
		this.velocity = velocity;
		this.position = position;
		this.initialPosition = position;
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
		this.forces[2] = new Vector2();
		this.timeSinceSpawned += timeStep;
	}

	addWeight(gravitationalFieldStrength) {
		this.forces[0] = new Vector2(0, this.mass * gravitationalFieldStrength);
	}

	setInputForce(force) {
		this.forces[2] = force;
	}

	resolveVectors() {
		let totalVector = new Vector2(0, 0);
		for (let i = 0; i < this.forces.length; i++) {
			totalVector = totalVector.add(this.forces[i]);
		}
		return totalVector;
	}

	updateDrag(densityOfAir) {
		const dragX = -Math.sign(this.velocity.getX()) * 0.5 * densityOfAir * this.coeffDrag * this.width * this.velocity.getX() ** 2;
		const dragY = -Math.sign(this.velocity.getY()) * 0.5 * densityOfAir * this.coeffDrag * this.height * this.velocity.getY() ** 2;
		this.forces[1] = new Vector2(dragX, dragY);
	}
	
	getCollisionPlanes(otherObject) {
		let centreJointPlane = 0;
		let perpendicularJointPlane = 0;
		if (this.position.getX() - otherObject.getPosition().getX() != 0 && this.position.getY() - otherObject.getPosition().getY() != 0) {
			const gradient = (this.position.getY() - otherObject.getPosition().getY()) / (this.position.getX() - otherObject.getPosition().getX());
			centreJointPlane = new Vector2(1, gradient);
			perpendicularJointPlane = new Vector2(1, -1 / gradient);
		} else if (this.position.getY() - otherObject.getPosition().getY() != 0) {
			centreJointPlane = new Vector2(1, 0);
			perpendicularJointPlane = new Vector2(0, 1);
		} else {
			centreJointPlane = new Vector2(0, 1);
			perpendicularJointPlane = new Vector2(1, 0);
		}
		return [centreJointPlane, perpendicularJointPlane];
	}

	perfectlyElasticallyCollide(otherObject, sumEnergy, sumMomentum) {
		const a = -this.mass * (otherObject.mass + this.mass);
		const b = 2 * sumMomentum * this.mass;
		const c = 2 * sumEnergy * otherObject.mass - sumMomentum ** 2;
		let thisFinalVelocityCentrePlane = 0;
		let otherFinalVelocityCentrePlane = 0;
		if (b ** 2 - 4 * a * c >= 0) {
			thisFinalVelocityCentrePlane = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
			otherFinalVelocityCentrePlane = (sumMomentum - this.mass * thisFinalVelocityCentrePlane) / otherObject.getMass();
		} else {
			alert("Negative discriminant error");
			thisFinalVelocityCentrePlane = this.velocity.getMag() * thisCosCentrePlane;
			otherFinalVelocityCentrePlane = otherObject.getVelocity().getMag() * otherCosCentrePlane;
		}
		return [thisFinalVelocityCentrePlane, otherFinalVelocityCentrePlane];
	}

	getFinalVelocities(otherObject) {
		// get the vector planes for the collision between the two objects (tangent to each other's centres and normal to those centres)
		const planes = this.getCollisionPlanes(otherObject);
		const centreJointPlane = planes[0];
		const perpendicularJointPlane = planes[1];
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
		const sumEnergy = 0.5 * (this.mass * (this.velocity.getMag() * thisCosCentrePlane) ** 2 + otherObject.mass * (otherObject.velocity.getMag() * otherCosCentrePlane) ** 2);
		const calculatedVelocities=this.perfectlyElasticallyCollide(otherObject, sumEnergy, sumMomentum);
		const thisFinalVelocityCentrePlane = calculatedVelocities[0];
		const otherFinalVelocityCentrePlane = calculatedVelocities[1];
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
		this.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
		otherObject.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp);
	}
}
