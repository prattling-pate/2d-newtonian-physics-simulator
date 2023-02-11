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
