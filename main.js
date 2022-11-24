// default settings when the simulation is ran
const Settings = {
  "Resolution": [640, 480],
  "Force Scalar": 5,
  "Size Scalar": 20,
  "Buffer Frames": 0,
};

// should take from config.json eventually
const RESOLUTION = Settings["Resolution"];
const SIZESCALE = Settings["Size Scalar"];
const FORCESCALE = Settings["Force Scalar"];

class Vector2 {
  constructor(x, y) {
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

  getMag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  dotProd(otherVector) {
    return this.x * otherVector.getX() + this.y * otherVector.getY();
  }

  getCosAngle(otherVector) {
    return this.dotProd(otherVector) / (this.getMag() * otherVector.getMag());
  }

  add(otherVector) {
    return new Vector2(
      this.x + otherVector.getX(),
      this.y + otherVector.getY()
    );
  }

  mult(number) {
    return new Vector2(this.x * number, this.y * number);
  }
}

class Position extends Vector2 {
  constructor(x, y) {
    super(x, y);
  }

  update(velocity, RATE) {
    this.x += velocity.getX() * RATE;
    this.y += velocity.getY() * RATE;
  }
}

class Velocity extends Vector2 {
  constructor(x, y) {
    super(x, y);
  }

  update(acceleration, RATE) {
    this.x += acceleration.getX() * RATE;
    this.y += acceleration.getY() * RATE;
  }
}

class Acceleration extends Vector2 {
  constructor(x, y) {
    super(x, y);
  }

  update(object) {
    this.x = object.resolveVectors().getX() / object.getMass();
    this.y = object.resolveVectors().getY() / object.getMass();
  }
}

class Object {
  constructor(colour, velocity, acceleration, position) {
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

  updateAll(constants) {
    this.updateDrag(constants["DensityOfAir"]);
    this.acceleration.update(this);
    this.velocity.update(this.acceleration, constants["TimeScale"]);
    this.position.update(this.velocity, constants["TimeScale"]);
    // sort out impulse buffer eventually
    this.forces[2] = new Vector2(0, 0);
  }

  addWeight(G) {
    console.log(G)
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

  updateDrag(DENSITYOFAIR) {
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

  sideCollision(constants) {
    const E = constants["CoeffRest"];
    const RATE = constants["TimeScale"];
    // side collision check (checks if out of bounds on right side or on left side respectively in if statement)
    if (
      this.position.getX() + this.velocity.getX() * RATE + this.radius >=
        RESOLUTION[0] ||
      this.position.getX() + this.velocity.getX() * RATE + this.radius <= 0
    ) {
      this.velocity.setX(-this.velocity.getX() * E);
    }
  }

  groundCeilingCollision(constants) {
    const E = constants["CoeffRest"];
    const RATE = constants["TimeScale"];
    // ground collision check - statement 1. ceiling collision check - statement 2
    if (
      this.position.getY() + this.velocity.getY() * RATE + this.radius >=
      RESOLUTION[1] * (8 / 9)
    ) {
      this.position.setY(RESOLUTION[1] * (8 / 9) - this.radius);
      this.velocity.setY(-this.velocity.getY() * E);
    } else if (
      this.position.getY() + this.velocity.getY() * RATE + this.radius <=
      0
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
    const otherCosCentrePlane = otherObject
      .getVelocity()
      .getCosAngle(centreJointPlane);
    const otherCosPerpendicularPlane = otherObject
      .getVelocity()
      .getCosAngle(perpendicularJointPlane);
    const thisMomentumCentrePlane = this.getMomentum() * thisCosCentrePlane;
    const otherMomentumCentrePlane =
      otherObject.getMomentum() * otherCosCentrePlane;
    const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
    const sumEnergy =
      0.5 *
      (this.mass * (this.velocity().getMag() * thisCosCentrePlane) ** 2 +
        otherObject.getMass() *
          (otherObject.getMag() * otherCosCentrePlane) ** 2);
    const a = -this.mass * (otherObject.getMass() + this.mass);
    const b = 2 * sumMomentum * this.mass;
    const c = 2 * sumEnergy * otherObject.getMass() - sumMomentum ** 2;
    if (b ** 2 - 4 * a * c >= 0) {
      const thisFinalVelocityCentrePlane =
        ((-b + Math.sqrt(b ** 2 - 4 * a * c)) / 2) * a;
      const otherFinalVelocityCentrePlane =
        (sumMomentum - this.mass * thisFinalVelocityCentrePlane) /
        otherObject.getMass;
    } else {
      const thisFinalVelocityCentrePlane =
        this.velocity.getMag() * thisCosCentrePlane;
      const otherFinalVelocityCentrePlane =
        otherObject.getVelocity.getMag() * otherCosCentrePlane;
    }
    const thisFinalVelocityPerpendicularPlane =
      this.velocity.getMag() * thisCosPerpendicularPlane;
    const otherFinalVelocityPerpendicularPlane =
      otherObject.getVelocity().getMag() * thisCosPerpendicularPlane;
    return [
      thisFinalVelocityCentrePlane,
      otherFinalVelocityCentrePlane,
      thisFinalVelocityPerpendicularPlane,
      otherFinalVelocityPerpendicularPlane,
    ];
  }

  otherObjectCollision(otherObject) {
    velocityComponents = this.getFinalVelocities(otherObject);
    thisFinalVelocity = new Velocity(
      velocityComponents[0],
      velocityComponents[2]
    );
    otherFinalVelocity = new Velocity(
      velocityComponents[1],
      velocityComponents[3]
    );
    thisFinalVelocityXComp =
      thisFinalVelocity.getMag() *
      thisFinalVelocity.getCosAngle(new Vector2(1, 0));
    thisFinalVelocityYComp =
      thisFinalVelocity.getMag() *
      thisFinalVelocity.getCosAngle(new Vector2(0, 1));
    otherFinalVelocityXComp =
      otherFinalVelocity.getMag() *
      otherFinalVelocity.getCosAngle(new Vector2(1, 0));
    otherFinalVelocityYComp =
      otherFinalVelocity.getMag() *
      otherFinalVelocity.getCosAngle(new Vector2(0, 1));
    this.velocity.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
    otherObject.getVelocity.setVelocity(
      otherFinalVelocityXComp,
      otherFinalVelocityYComp
    );
  }
}

class Circle extends Object {
  constructor(radius, density, colour, velocity, acceleration, position) {
    super(colour, velocity, acceleration, position);
    this.shape = "circle";
    this.coeffDrag = 0.47;
    this.width = radius * Math.PI;
    this.height = radius * Math.PI;
    this.radius = radius;
    this.volume = Math.PI * radius ** 2;
    this.mass = density * this.volume;
  }

  getShape() {
    return this.shape;
  }

  getRadius() {
    return this.radius;
  }
}

class Rectangle extends Object {
  constructor(
    height,
    width,
    density,
    colour,
    velocity,
    acceleration,
    position
  ) {
    super(colour, velocity, acceleration, position);
    this.height = height;
    this.coeffDrag = 1.05;
    this.width = width;
    this.mass = this.height * this.width * density;
  }
  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getCorner() {
    let x = this.position.getX();
    let y = this.position.getY();
    x -= 0.5 * this.width;
    y -= 0.5 * this.height;
    return new Position(x, y);
  }
}

function init() {
  let constants = getConstants();
  const c = document.getElementById("Simulation");
  const ctx = c.getContext("2d");
  const objects = addObjects(10, constants["GravitationalFieldStrength"]);
  const height = 480; // Resolution/dimensions of canvas displayed in.
  const width = 640;
  clock(ctx, objects, width, height, constants);
}

function addObjects(n, G) {
  const objects = [];
  for (let i = 0; i < n; i++) {
    objects.push(
      new Circle(
        10,
        5,
        "red",
        new Velocity(100, 0),
        new Acceleration(0, 0),
        new Position(i * 10, i * 10)
      )
    );
    objects[i].addWeight(G);
  }
  return objects;
}

function update(ctx, objects, width, height, constants) {
  constants = getConstants();
  ctx.fillStyle = "#89CFF0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#964B00";
  ctx.fillRect(0, RESOLUTION[1] * (8 / 9), width, RESOLUTION[1]);
  for (const object of objects) {
    object.groundCeilingCollision(constants);
    object.sideCollision(constants);
    object.updateAll(constants);
    drawObject(ctx, object);
  }
}

function drawObject(ctx, object) {
  ctx.fillStyle = object.getColour();
  if (object.getShape() == "circle") {
    ctx.beginPath();
    ctx.arc(
      object.getPosition().getX(),
      object.getPosition().getY(),
      object.getRadius(),
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.fill();
  } else if (object.getShape() == "rectangle") {
    ctx.beginPath();
    ctx.rect(
      object.getCorner().getX(),
      object.getCorner().getY(),
      object.getWidth(),
      object.getHeight()
    );
    ctx.closePath();
    ctx.fill();
  }
}

function clock(ctx, objects, width, height, constants) {
  setInterval(update, 10, ctx, objects, width, height, constants);
}

function getConstants() {
  const c = document.getElementById("settings");
  const G = c.elements[0].value;
  const DENSITYOFAIR = c.elements[1].value;
  const RATE = c.elements[2].value / 10;
  const E = c.elements[3].value;
  const constants = {
    CoeffRest: E,
    GravitationalFieldStrength: G,
    TimeScale: RATE,
    DensityOfAir: DENSITYOFAIR,
  };
  return constants;
}

window.onload = init;
