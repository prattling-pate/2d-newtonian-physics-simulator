class Border extends MyObject {
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

	addWeight(gravitationalFieldStrength) {
		this.forces[0] = new Vector2(0, 0*gravitationalFieldStrength);
	}

	updateHitbox() {
		this.hitbox = {
			right:this.position.getX() + 0.5 * this.width,
			left: this.position.getX() - 0.5 * this.width,
			bottom: this.position.getY() + 0.5 * this.height,
			top: this.position.getY() - 0.5 * this.height};
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