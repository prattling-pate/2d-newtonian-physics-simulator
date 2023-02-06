class Rectangle extends MyObject {
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