// should take from config.json eventually
const RESOLUTION = [640, 480];
const RATE = 0.1;
const G = 9.81;
const E = 1;
const SIZESCALE = 1;
const FORCESCALE = 1;
const DENSITYOFAIR = 1.225;

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

  mult(number) {
    return new Vector2(this.#x * number, this.#x * number);
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
  constructor(colour, velocity, acceleration, position) {
    this.mass = 0;
    this.colour = colour;
    this.forces = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
    this.acceleration = acceleration;
    this.velocity = velocity;
    this.position = position;
  }

  getForces() {
    return this.forces;
  }

  getColour() {
    return this.colour;
  }

  getVelocity() {
    return this.velocity;
  }

  setVelocity(x, y) {
    this.velocity.setX(x);
    this.velocity.setY(y);
  }

  getPosition() {
    return this.position;
  }

  getMass() {
    return this.mass;
  }

  getKineticEnergy() {
    return 0.5 * this.mass * this.velocity.getMag() ** 2;
  }

  getMomentum() {
    return this.velocity.getMag() * this.mass;
  }

  updateAll() {
    // add drag update
    this.acceleration.update();
    this.velocity.update();
    this.position.update();
    // sort out impulse buffer eventually
    this.forces[2] = new Vector2(0, 0);
  }
  addWeight() {
    this.forces[0] = new Vector2(0, this.mass * G);
  }

  setInputForce(force) {
    this.forces[2] = force;
  }

  resolveVectors() {
    let totalVect = new Vector2(0, 0);
    for (let i = 0; i < this.forces.length; i++) {
      totalVect = totalVect.add(this.forces[i]);
    }
    return totalVect;
  }

  updateDrag() {
    const dragX =
      -0.5 *
      DENSITYOFAIR *
      this.coeffDrag *
      this.width *
      this.velocity.getX() ** 2;
    const dragY =
      -0.5 *
      DENSITYOFAIR *
      this.coeffDrag *
      this.height *
      this.velocity.getY() ** 2;
    this.forces[1] = new Vector2(dragX, dragY);
  }

  sideCollision() {
    // side collision check (checks if out of bounds on right side or on left side respectively in if statement)
    if (
      this.position.getX() + this.velocity.getX() * RATE >= RESOLUTION[0] ||
      this.position.getX() + this.velocity.getX() * RATE <= 0
    ) {
      this.velocity.setX(-this.velocity.getX() * E);
    }
  }

  groundCeilingCollision() {
    // ground collision check - statement 1. ceiling collision check - statement 2
    if (
      this.position.getY() + this.velocity.getY() * RATE >=
        RESOLUTION[1] * (8 / 9) ||
      this.position.getY() + this.velocity.getY() * RATE <= 0
    ) {
      this.velocity.setY(-this.velocity.getY() * E);
    }
  }

  isCollision() {
    // checks if two given objects collide during the frame
    return false;
  }

  getCollisionPlanes(otherObject) {
    if (
      this.position.getX() - otherObject.getPosition().getX() != 0 &&
      this.position().getY() - otherObject.getPosition().getY() != 0
    ) {
      const gradient =
        (this.position.getY() - otherObject.getPosition().getY()) /
        (this.position.getX() - otherObject.getPosition.getX());
      const centreJointPlane = new Vector2(1, gradient);
      const perpendicularJointPlane = new Vector2(1, -1 / gradient);
    } else if (this.position.getY() - otherObject.getPosition.getY() != 0) {
      const centreJointPlane = new Vector2(1, 0);
      const perpendicularJointPlane = new Vector2(0, 1);
    } else {
      const centreJointPlane = new Vector2(0, 1);
      const perpendicularJointPlane = new Vector2(1, 0);
    }
    return [centreJointPlane, perpendicularJointPlane];
  }

  getFinalVelocities(otherObject) {
    const planes = this.getCollisionPlanes();
    const centreJointPlane = planes[0];
    const perpendicularJointPlane = planes[1];
    const thisCosCentrePlane = this.velocity.getCosAngle(centreJointPlane);
    const thisCosPerpendicularPlane = this.velocity.getCosAngle(
      perpendicularJointPlane
    );
    const otherCosCentrePlane =
      otherObject.getVelocity().getCosAngle(centreJointPlane);
    const otherCosPerpendicularPlane = otherObject.getVelocity().getCosAngle(
      perpendicularJointPlane
    );
    const thisMomentumCentrePlane = this.getMomentum() * thisCosCentrePlane;
    const otherMomentumCentrePlane =
      otherObject.getMomentum() * otherCosCentrePlane;
    const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
    const sumEnergy = 0.5 * (this.mass * (this.velocity().getMag() * thisCosCentrePlane) ** 2 + otherObject.getMass() * (otherObject.getMag() * otherCosCentrePlane) ** 2);
    const a = -this.mass * (otherObject.getMass() + this.mass);
    const b = 2*sumMomentum*this.mass;
    const c = 2*sumEnergy*otherObject.getMass() - sumMomentum**2;
    if (b**2 - 4*a*c >= 0){
        const thisFinalVelocityCentrePlane = ((-b + Math.sqrt(b**2 - 4 * a * c)) / 2 * a);
        const otherFinalVelocityCentrePlane = ((sumMomentum - this.mass * thisFinalVelocityCentrePlane) / otherObject.getMass);
    }
    else {
        console.log("Negative Discriminant")
        const thisFinalVelocityCentrePlane = this.velocity.getMag() * thisCosCentrePlane;
        const otherFinalVelocityCentrePlane = otherObject.getVelocity.getMag() * otherCosCentrePlane;
    }
    const thisFinalVelocityPerpendicularPlane = this.velocity.getMag() * thisCosPerpendicularPlane;
    const otherFinalVelocityPerpendicularPlane = otherObject.getVelocity().getMag() * thisCosPerpendicularPlane;
    return [thisFinalVelocityCentrePlane, otherFinalVelocityCentrePlane, thisFinalVelocityPerpendicularPlane, otherFinalVelocityPerpendicularPlane];
  }

  otherObjectCollision(otherObject) {
    velocityComponents = this.getFinalVelocities(otherObject);
    thisFinalVelocity = new Velocity(velocityComponents[0], velocityComponents[2]);
    otherFinalVelocity = new Velocity(velocityComponents[1], velocityComponents[3]);
    thisFinalVelocityXComp = thisFinalVelocity.getMag()*thisFinalVelocity.getCosAngle(new Vector2(1, 0));
    thisFinalVelocityYComp = thisFinalVelocity.getMag()*thisFinalVelocity.getCosAngle(new Vector2(0, 1));
    otherFinalVelocityXComp = otherFinalVelocity.getMag()*otherFinalVelocity.getCosAngle(new Vector2(1, 0));
    otherFinalVelocityYComp = otherFinalVelocity.getMag()*otherFinalVelocity.getCosAngle(new Vector2(0, 1));
    this.velocity.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
    otherObject.getVelocity.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp)
  }
}

// continue translating the rest of the classes in class

class Circle extends Object {
    constructor(radius, density, colour, velocity, acceleration, position){ 
        this.forces = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
        this.shape = 'circle';
        this.width = radius * Math.PI();
        this.radius = radius;
        this.volume = Math.PI() * radius ** 2;
        this.mass = density * this.volume;
        this.colour = colour;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.position = position;
    }
}
