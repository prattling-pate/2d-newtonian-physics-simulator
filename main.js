class Vector2 {
  #x;
  #y;
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  getX() {
    return this.#x;
  }

  setX(inp) {
    this.#x = inp;
  }

  getY() {
    return this.#y;
  }

  setY(inp) {
    this.#y = inp;
  }

  getMag() {
    return Math.sqrt(this.#x ** 2 + this.#y ** 2);
  }

  dotProd(otherVector) {
    return this.#x * otherVector.getX() + this.#y * otherVector.getY();
  }

  getCosAngle(otherVector) {
    return this.dotProd(otherVector) / (this.getMag() * otherVector.getMag());
  }

  add(otherVector) {
    return new Vector2(
      this.#x + otherVector.getX(),
      this.#y + otherVector.getY()
    );
  }
}

class Position extends Vector2 {
  #x;
  #y;
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  update(velocity) {
    this.#x += velocity.getX() * RATE;
    this.#y += velocity.getY() * RATE;
  }
}

class Velocity extends Vector2 {
  #x;
  #y;
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  update(acceleration) {
    this.#x += acceleration.getX() * RATE;
    this.#y += acceleration.getY() * RATE;
  }
}

class Acceleration extends Vector2 {
  #x;
  #y;
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  update(force) {
    this.#x = force.getX();
    this.#y = force.getY();
  }
}

class Object {
  constructor(density, colour, velocity, acceleration, position) {
    this.mass = 0;
    this.colour = colour;
    this.force = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
  }
}

let vect1 = new Vector2(210, 20);
let vect2 = new Vector2(100, -812);

console.log(vect1.add(vect2));
