class Rectangle extends MyObject {
	constructor(height, width, density, colour, velocity, acceleration, position) {
		super(colour, velocity, acceleration, position);
		this.height = height;
		this.coeffDrag = 1.05;
		this.width = width;
		this.mass = this.height * this.width * density;
		this.hitbox = {
			right:position.getX() + 0.5 * width,
			left: position.getX() - 0.5 * width,
			bottom: position.getY() + 0.5 * height,
			top: position.getY() - 0.5 * height};
	}

	
	sideCollision(coeffRest, timeStep, planeWidth) {
		// side collision check (checks if out of bounds on right side or on left side respectively in if statement)
		if (this.position.getX() + this.velocity.getX() * timeStep + this.width >= planeWidth || this.position.getX() + this.velocity.getX() * timeStep - this.width <= 0) {
			this.velocity.setX(-this.velocity.getX() * coeffRest);
		}
	}

	groundCeilingCollision(coeffRest, timeStep, planeHeight) {
		// ground collision check - statement 1. ceiling collision check - statement 2
		if (this.position.getY() + this.velocity.getY() * timeStep + this.height>= planeHeight * (8 / 9)) {
			this.position.setY(planeHeight * (8 / 9) - this.height);
			this.velocity.setY(-this.velocity.getY() * coeffRest);
		} else if (this.position.getY() + this.velocity.getY() * timeStep + this.height <= 0) {
			this.velocity.setY(-this.velocity.getY() * coeffRest);
		}
	}


	isCollision(other, timeStep) {
		if (other.shape = 'rectangle'){
			const thisFutureVelocity = this.velocity.mult(timeStep);
			const otherFutureVelocity = other.velocity.mult(timeStep);
			const case1 = this.hitbox.right + thisFutureVelocity.getX()> other.hitbox.left + otherFutureVelocity.getX();
			const case2= this.hitbox.right + thisFutureVelocity.getX() < other.hitbox.right + otherFutureVelocity.getX();
			const case3 = this.hitbox.bottom + thisFutureVelocity.getY() > other.hitbox.top + otherFutureVelocity.getY();
			const case4 = this.hitbox.top + thisFutureVelocity.getY() < other.hitbox.bottom + otherFutureVelocity.getY();
			if (case1 && case2 && case3 && case4) {
				return true;
			}
			return false;
		}
		else {
			other.isCollision(this);
		}
	}

	updateHitbox() {
		this.hitbox = {
			right:this.position.getX() + 0.5 * this.width,
			left: this.position.getX() - 0.5 * this.width,
			bottom: this.position.getY() + 0.5 * this.height,
			top: this.position.getY() - 0.5 * this.height};	}

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