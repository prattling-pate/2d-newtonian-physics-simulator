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
		this.hitbox = {
			right: position.getX() + radius, 
			left: position.getX() - radius, 
			bottom: position.getY() + radius, 
			top: position.getY() - radius};
	}

	updateHitbox() {
		this.hitbox = {
			right: this.position.getX() + this.radius, 
			left: this.position.getX() - this.radius, 
			bottom: this.position.getY() + this.radius, 
			top: this.position.getY() - this.radius};	}

	getShape() {
		return this.shape;
	}

	getRadius() {
		return this.radius;
	}
}