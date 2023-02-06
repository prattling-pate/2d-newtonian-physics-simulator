class Acceleration extends Vector2 {
	constructor(x, y) {
		super(x, y);
	}

	// uses Newton's generalised second law F=ma to find new acceleration of object given its resultant force and mass (a = F/m)
	update(object) {
		this.x = object.resolveVectors().getX() / object.getMass();
		this.y = object.resolveVectors().getY() / object.getMass();
	}
}