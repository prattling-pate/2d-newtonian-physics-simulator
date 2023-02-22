class MyObject {
	constructor(colour = "black", velocity = new Velocity(), acceleration = new Acceleration(), position = new Position()) {
		this.colour = colour;
		this.forces = {weight: new Vector2(0, 0), drag: new Vector2(0, 0)};
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
		return 0.5 * this.mass * this.velocity.getMagnitude() ** 2;
	}

	getMomentum() {
		return this.velocity.getMagnitude() * this.mass;
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
		this.forces.weight = new Vector2(0, this.mass * gravitationalFieldStrength);
	}

	resolveVectors() {
		return this.forces.weight.add(this.forces.drag);
	}

	updateDrag(densityOfAir) {
		const dragX = -Math.sign(this.velocity.getX()) * 0.5 * densityOfAir * this.coeffDrag * this.width * this.velocity.getX() ** 2;
		const dragY = -Math.sign(this.velocity.getY()) * 0.5 * densityOfAir * this.coeffDrag * this.height * this.velocity.getY() ** 2;
		this.forces.drag.setX(dragX);
		this.forces.drag.setY(dragY);
	}

	getCollisionInformation(otherObject) {
		let centreJointPlane;
		let perpendicularJointPlane;
		let flipAxis = false;
		// if the two objects colliding dont have the same position vectors
		if (this.position.x - otherObject.getPosition().getX() != 0 && this.position.y - otherObject.getPosition().getY() != 0) {
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
		return {centreJointPlane: centreJointPlane, perpendicularJointPlane: perpendicularJointPlane, isFlipAxis: flipAxis};
	}

	collide(otherObject, thisInitialVelocity, otherInitialVelocity, sumMomentum, elasticity) {
		const thisFinalVelocityCentrePlane = (sumMomentum + otherObject.getMass() * elasticity * (otherInitialVelocity - thisInitialVelocity)) / (this.mass + otherObject.getMass());
		const otherFinalVelocityCentrePlane = (sumMomentum + this.mass * elasticity * (thisInitialVelocity - otherInitialVelocity)) / (this.mass + otherObject.getMass());
		return {thisFinal: thisFinalVelocityCentrePlane, otherFinal: otherFinalVelocityCentrePlane};
	}

	getFinalVelocities(otherObject, elasticity) {
		// get the vector planes for the collision between the two objects (tangent to each other's centres and normal to those centres)
		const information = this.getCollisionInformation(otherObject);
		const centreJointPlane = information.centreJointPlane;
		const perpendicularJointPlane = information.perpendicularJointPlane;
		const flipAxis = information.isFlipAxis;
		// Get the cosine of the angle between the objects velocity vectors and the new planes
		// used to find the components of these velocities in these planes afterwards
		const thisCosCentrePlane = this.velocity.getCosAngle(centreJointPlane);
		const thisCosPerpendicularPlane = this.velocity.getCosAngle(perpendicularJointPlane);
		const otherCosCentrePlane = otherObject.getVelocity().getCosAngle(centreJointPlane);
		const otherCosPerpendicularPlane = otherObject.getVelocity().getCosAngle(perpendicularJointPlane);
		// find momentum of each object in the collision plane
		const thisMomentumCentrePlane = this.mass * this.velocity.getMagnitude() * thisCosCentrePlane;
		const otherMomentumCentrePlane = otherObject.getMass() * otherObject.getVelocity().getMagnitude() * otherCosCentrePlane;
		// get all numeric values to solve the derived quadratic equation for an elastic collision
		const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
		const calculatedVelocities = this.collide(otherObject, this.velocity.getMagnitude() * thisCosCentrePlane, otherObject.getVelocity().getMagnitude() * otherCosCentrePlane, sumMomentum, elasticity);
		const thisFinalVelocityCentrePlane = calculatedVelocities.thisFinal;
		const otherFinalVelocityCentrePlane = calculatedVelocities.otherFinal;
		const thisFinalVelocityPerpendicularPlane = this.getVelocity().getMagnitude() * thisCosPerpendicularPlane;
		const otherFinalVelocityPerpendicularPlane = otherObject.getVelocity().getMagnitude() * otherCosPerpendicularPlane;
		return {thisFinalCentreVelocity: thisFinalVelocityCentrePlane, otherFinalCentreVelocity: otherFinalVelocityCentrePlane, thisFinalPerpendicularVelocity: thisFinalVelocityPerpendicularPlane, otherFinalPerpendicularVelocity: otherFinalVelocityPerpendicularPlane, isFlipAxis: flipAxis};
	}

	otherObjectCollision(otherObject, elasticity = 1) {
		const returnedValues = this.getFinalVelocities(otherObject, elasticity);
		const thisFinalVelocityComponents = {a:returnedValues.thisFinalCentreVelocity, b:returnedValues.thisFinalPerpendicularVelocity};
		const otherFinalVelocityComponents = {a:returnedValues.otherFinalCentreVelocity, b:returnedValues.otherFinalPerpendicularVelocity};
		const isFlipAxis = returnedValues.isFlipAxis;
		let thisFinalVelocity;
		let otherFinalVelocity;
		// creates vectors in collision planes post collision using calculated velocities
		if (!isFlipAxis) {
			thisFinalVelocity = new Velocity(thisFinalVelocityComponents.a, thisFinalVelocityComponents.b);
			otherFinalVelocity = new Velocity(otherFinalVelocityComponents.a, otherFinalVelocityComponents.b);
		} else {
			thisFinalVelocity = new Velocity(thisFinalVelocityComponents.b, thisFinalVelocityComponents.a);
			otherFinalVelocity = new Velocity(otherFinalVelocityComponents.b, otherFinalVelocityComponents.a);
		}
		// recombines vectors into i, j components using cosine angle of the vectors relative to i and j.
		const thisFinalVelocityXComp = thisFinalVelocity.getMagnitude() * thisFinalVelocity.getCosAngle(new Vector2(1, 0));
		const thisFinalVelocityYComp = thisFinalVelocity.getMagnitude() * thisFinalVelocity.getCosAngle(new Vector2(0, 1));
		const otherFinalVelocityXComp = otherFinalVelocity.getMagnitude() * otherFinalVelocity.getCosAngle(new Vector2(1, 0));
		const otherFinalVelocityYComp = otherFinalVelocity.getMagnitude() * otherFinalVelocity.getCosAngle(new Vector2(0, 1));
		this.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
		otherObject.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp);
	}
}
