class Mouse {
	constructor() {
		this.position = new Position();
		this.velocity = new Velocity();
		this.hitbox = [0, 0, 0, 0]; // have to use the same .hitbox property structure to not have to code a new function for detecting whether mouse is in an object
		this.trackedObject = null;
	}

	isInObject(other, timeStep) {
		return other.isCollision(this, timeStep);
	}

	updateHitbox() {
		this.hitbox = [this.position.getX() + 20, this.position.getX() - 20, this.position.getY() + 20, this.position.getY() - 20];
	}

	updatePosition(event, canvasCoordinates) {
		this.containInBounds(event.clientX - canvasCoordinates.left, event.clientY - canvasCoordinates.top);
		this.updateHitbox();
	}

	updateTrackedObject(objects, timeStep, useTimeStep) {
		for (let i = 0; i < objects.length; i++) {
			if (this.isInObject(objects[i], timeStep, useTimeStep)) {
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