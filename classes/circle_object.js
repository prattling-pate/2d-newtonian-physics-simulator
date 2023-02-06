class Circle extends MyObject {
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