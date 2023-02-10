class Circle extends MyObject {
	constructor(radius, density, colour, velocity, acceleration, position) {
		super(colour, velocity, acceleration, position);
		this.shape = "circle";
		this.coeffDrag = 0.47;
		this.width = radius * Math.PI;
		this.height = radius * Math.PI;
		this.radius = radius;
		this.area = Math.PI * radius ** 2;
		this.mass = density * this.area;
	}

	sideCollision(coeffRest, timeStep, planeWidth) {
		// side collision check (checks if out of bounds on right side or on left side respectively in if statement)
		if (this.position.getX() + this.velocity.getX() * timeStep + this.radius > planeWidth || this.position.getX() + this.velocity.getX() * timeStep - this.radius < 0) {
			this.velocity.setX(-this.velocity.getX() * coeffRest);
		}
	}

	groundCeilingCollision(coeffRest, timeStep, planeHeight) {
		// ground collision check - statement 1. ceiling collision check - statement 2
		if (this.position.getY() + this.velocity.getY() * timeStep + this.radius > planeHeight * (8 / 9)) {
			this.position.setY(planeHeight * (8 / 9) - this.radius);
			this.velocity.setY(-this.velocity.getY() * coeffRest);
		} else if (this.position.getY() + this.velocity.getY() * timeStep - this.radius < 0) {
			this.position.setY(this.radius);
			this.velocity.setY(-this.velocity.getY() * coeffRest);
		}
	}

	isCollision(other, timeStep) {
		// finds the future position of both objects
		const otherNextPosition = other.position.add(other.velocity.multiply(timeStep));
		const thisNextPosition = this.position.add(this.velocity.multiply(timeStep));
		// find the position vector from object A to B
		const vectorToOtherCircle = otherNextPosition.sub(thisNextPosition);
		// normalize the resulting vector
		let pointCheck = vectorToOtherCircle.normalize();
		// find the vector from object A's centre to it's circumference
		pointCheck = pointCheck.multiply(this.radius);
		// convert this vector into a position vector relative to the origin
		pointCheck = pointCheck.add(thisNextPosition);
		// use the circle equation to find if the position vector is inside object B
		if ((pointCheck.getX() - otherNextPosition.getX()) ** 2 + (pointCheck.getY() - otherNextPosition.getY()) ** 2 <= other.radius ** 2) {
			return true;
		}
		return false;
	}

	getShape() {
		return this.shape;
	}

	getRadius() {
		return this.radius;
	}
}
