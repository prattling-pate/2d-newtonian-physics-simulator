// main 2 vector class
class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	getX() {
		return this.x;
	}

	setX(inp) {
		this.x = inp;
	}

	getY() {
		return this.y;
	}

	setY(inp) {
		this.y = inp;
	}

	// VECTOR ARITHMETIC METHODS -----

	// implement fast inverse square root algorithm using bit manip., apparently slower than default method of 1 / Math.sqrt()
	getMag() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	dotProduct(otherVector) {
		return this.x * otherVector.getX() + this.y * otherVector.getY();
	}

	getCosAngle(otherVector) {
		if ((this.x == 0 && this.y == 0) || (otherVector.getX() == 0 && otherVector.getY() == 0)) {
			return 0;
		}
		return this.dotProduct(otherVector) / (this.getMag() * otherVector.getMag());
	}

	normalize() {
		if (this.getMag() != 0) {
			return new Vector2(this.x / this.getMag(), this.y / this.getMag());
		}
		return new Vector2(0, 0);
	}

	add(otherVector) {
		return new Vector2(this.x + otherVector.getX(), this.y + otherVector.getY());
	}

	sub(otherVector) {
		return new Vector2(this.x - otherVector.getX(), this.y - otherVector.getY());
	}

	multiply(number) {
		return new Vector2(this.x * number, this.y * number);
	}
}
