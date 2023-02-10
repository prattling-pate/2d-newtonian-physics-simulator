class Mouse {
	constructor() {
		this.position = new Position();
		this.velocity = new Velocity();
		this.trackedObject = null;
	}

	// check if mouse point is inside of a circular object using the circle equation
	isInObject(other) {
		const x = this.position.getX();
		const y = this.position.getY();
		if ((x-other.position.getX())**2 + (y - other.position.getY())**2 <= other.radius**2) {
			return true;
		}
		return false;
	}

	updatePosition(event, canvasCoordinates) {
		this.position.setX(event.clientX - canvasCoordinates.left);
		this.position.setY(event.clientY - canvasCoordinates.top);
	}

	updateTrackedObject(objects, timeStep) {
		for (let i = 0; i < objects.length; i++) {
			if (this.isInObject(objects[i], timeStep)) {
				this.trackedObject=objects[i];
				return i;
			}
		}
		return -1;
	}
}