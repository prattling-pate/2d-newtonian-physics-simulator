class Mouse {
	constructor() {
		this.position = new Position();
		this.velocity = new Velocity();
		this.trackedObject = null;
	}

	isInObject(other) {
		const x = this.position.getX();
		const y = this.position.getY();
		if (other.shape == 'rectangle'){
			if (x > other.hitbox.left && x < other.hitbox.right && y < other.hitbox.bottom && y > other.hitbox.top) {
				return true;
			}
			return false;
		}
		else {
			if ((x-other.position.getX())**2 + (y - other.position.getY())**2 <= other.radius**2) {
				return true;
			}
			return false;
		}
	}

	updatePosition(event, canvasCoordinates) {
		this.containInBounds(event.clientX - canvasCoordinates.left, event.clientY - canvasCoordinates.top);
	}

	updateTrackedObject(objects, timeStep) {
		for (let i = 0; i < objects.length; i++) {
			if (this.isInObject(objects[i], timeStep)) {
				this.trackedObject=objects[i];
				return i;
			}
		}
		return false;
	}

	containInBounds(x, y) {
		switch (x != null) {
			case x > 0 && x < 640:
				this.position.setX(x);
				break;
			case x < 0:
				this.position.setX(0);
				break;
			case x > 640:
				this.position.setX(640);
				break;
			default:
				break;
		}
		switch (y != null) {
			case y > 0 && y < 480:
				this.position.setY(y);
				break;
			case y < 0:
				this.position.setY(0);
				break;
			case y > 480:
				this.position.setY(480);
				break;
			default:
				break;
		}
	}
}