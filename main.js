// default settings when the simulation is ran
const Settings = {
  Resolution: [640, 480],
  "Force Scalar": 5,
  "Size Scalar": 20,
  "Buffer Frames": 0,
};

const RESOLUTION = Settings["Resolution"];
const SIZESCALE = Settings["Size Scalar"];
const FORCESCALE = Settings["Force Scalar"];

// CLASSES

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

  sub(otherVector) {
    return new Vector2(
      this.x - otherVector.getX(),
      this.y - otherVector.getY()
    );
  }

  mult(number) {
    return new Vector2(this.x * number, this.y * number);
  }
}

// classes extending the 2 vector to run newtonian mechanics simulation

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

// class outlining the generic object

class Object {
  constructor(
    colour = "black",
    velocity = new Velocity(),
    acceleration = new Acceleration(),
    position = new Position()
  ) {
    this.colour = colour;
    this.forces = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
    this.acceleration = acceleration;
    this.velocity = velocity;
    this.position = position;
    this.initialPosition = position;
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

  getDensity() {
    return this.density;
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

  getDisplacement() {
    return (self.position - self.initialPosition);
  }

  updateAll() {
    this.updateDrag(constants["DensityOfAir"]);
    this.acceleration.update(this);
    this.velocity.update(this.acceleration, constants["TimeScale"]);
    this.position.update(this.velocity, constants["TimeScale"]);
    // sort out impulse buffer eventually
    this.forces[2] = new Vector2(0, 0);
  }

  addWeight() {
    this.forces[0] = new Vector2(
      0,
      this.mass * constants["GravitationalFieldStrength"]
    );
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
      -Math.sign(this.velocity.getX()) *
      0.5 *
      DENSITYOFAIR *
      this.coeffDrag *
      this.width *
      this.velocity.getX() ** 2;
    const dragY =
      -Math.sign(this.velocity.getY()) *
      0.5 *
      DENSITYOFAIR *
      this.coeffDrag *
      this.height *
      this.velocity.getY() ** 2;
    this.forces[1] = new Vector2(dragX, dragY);
  }

  sideCollision() {
    const E = constants["CoeffRest"];
    const RATE = constants["TimeScale"];
    // side collision check (checks if out of bounds on right side or on left side respectively in if statement)
    if (
      this.position.getX() + this.velocity.getX() * RATE + this.radius >=
        RESOLUTION[0] ||
      this.position.getX() + this.velocity.getX() * RATE - this.radius <= 0
    ) {
      this.velocity.setX(-this.velocity.getX() * E);
    }
  }

  groundCeilingCollision() {
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

  isCollision(other) {
    if (
      ((this.hitbox[0] > other.hitbox[1] && this.hitbox[1] < other.hitbox[1]) ||
        (this.hitbox[0] > other.hitbox[0] &&
          this.hitbox[1] < other.hitbox[0])) &&
      ((this.hitbox[2] > other.hitbox[3] && this.hitbox[3] < other.hitbox[3]) ||
        (this.hitbox[2] > other.hitbox[2] && this.hitbox[3] < other.hitbox[2]))
    ) {
      this.fixSamePointProblem(other);
      return true;
    }
    return false;
  }

  // fixes problem of object phasing out of simulation due to taking up the same point in 2d space.
  fixSamePointProblem(other) {
    if (this.position == other.getPosition()) {
      this.position.setX(this.position.getX() + 1);
    }
  }

  getCollisionPlanes(otherObject) {
    let centreJointPlane = 0;
    let perpendicularJointPlane = 0;
    if (
      this.position.getX() - otherObject.getPosition().getX() != 0 &&
      this.position.getY() - otherObject.getPosition().getY() != 0
    ) {
      const gradient =
        (this.position.getY() - otherObject.getPosition().getY()) /
        (this.position.getX() - otherObject.getPosition().getX());
      centreJointPlane = new Vector2(1, gradient);
      perpendicularJointPlane = new Vector2(1, -1 / gradient);
    } else if (this.position.getY() - otherObject.getPosition.getY() != 0) {
      centreJointPlane = new Vector2(1, 0);
      perpendicularJointPlane = new Vector2(0, 1);
    } else {
      centreJointPlane = new Vector2(0, 1);
      perpendicularJointPlane = new Vector2(1, 0);
    }
    return [centreJointPlane, perpendicularJointPlane];
  }

  getFinalVelocities(otherObject) {
    const planes = this.getCollisionPlanes(otherObject);
    const centreJointPlane = planes[0];
    const perpendicularJointPlane = planes[1];
    const thisCosCentrePlane = this.velocity.getCosAngle(centreJointPlane);
    const thisCosPerpendicularPlane = this.velocity.getCosAngle(
      perpendicularJointPlane
    );
    const otherCosCentrePlane =
      otherObject.velocity.getCosAngle(centreJointPlane);
    const otherCosPerpendicularPlane = otherObject.velocity.getCosAngle(
      perpendicularJointPlane
    );
    const thisMomentumCentrePlane =
      this.mass * this.velocity.getMag() * thisCosCentrePlane;
    const otherMomentumCentrePlane =
      otherObject.mass * otherObject.velocity.getMag() * otherCosCentrePlane;
    const sumMomentum = thisMomentumCentrePlane + otherMomentumCentrePlane;
    const sumEnergy =
      0.5 *
      (this.mass * (this.velocity.getMag() * thisCosCentrePlane) ** 2 +
        otherObject.mass *
          (otherObject.velocity.getMag() * otherCosCentrePlane) ** 2);
    const a = -this.mass * (otherObject.mass + this.mass);
    const b = 2 * sumMomentum * this.mass;
    const c = 2 * sumEnergy * otherObject.mass - sumMomentum ** 2;
    let thisFinalVelocityCentrePlane = 0;
    let otherFinalVelocityCentrePlane = 0;
    if (b ** 2 - 4 * a * c >= 0) {
      thisFinalVelocityCentrePlane =
        (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
      otherFinalVelocityCentrePlane =
        (sumMomentum - this.mass * thisFinalVelocityCentrePlane) /
        otherObject.getMass();
    } else {
      thisFinalVelocityCentrePlane =
        this.velocity.getMag() * thisCosCentrePlane;
      otherFinalVelocityCentrePlane =
        otherObject.getVelocity().getMag() * otherCosCentrePlane;
    }
    const thisFinalVelocityPerpendicularPlane =
      this.velocity.getMag() * thisCosPerpendicularPlane;
    const otherFinalVelocityPerpendicularPlane =
      otherObject.getVelocity().getMag() * otherCosPerpendicularPlane;
    return [
      thisFinalVelocityCentrePlane,
      otherFinalVelocityCentrePlane,
      thisFinalVelocityPerpendicularPlane,
      otherFinalVelocityPerpendicularPlane,
    ];
  }

  otherObjectCollision(otherObject) {
    const velocityComponents = this.getFinalVelocities(otherObject);
    const thisFinalVelocity = new Velocity(
      velocityComponents[0],
      velocityComponents[2]
    );
    const otherFinalVelocity = new Velocity(
      velocityComponents[1],
      velocityComponents[3]
    );
    const thisFinalVelocityXComp =
      thisFinalVelocity.getMag() *
      thisFinalVelocity.getCosAngle(new Vector2(1, 0));
    const thisFinalVelocityYComp =
      thisFinalVelocity.getMag() *
      thisFinalVelocity.getCosAngle(new Vector2(0, 1));
    const otherFinalVelocityXComp =
      otherFinalVelocity.getMag() *
      otherFinalVelocity.getCosAngle(new Vector2(1, 0));
    const otherFinalVelocityYComp =
      otherFinalVelocity.getMag() *
      otherFinalVelocity.getCosAngle(new Vector2(0, 1));
    this.setVelocity(thisFinalVelocityXComp, thisFinalVelocityYComp);
    otherObject.setVelocity(otherFinalVelocityXComp, otherFinalVelocityYComp);
  }
}

// classes extending the object class to specific shapes which can be drawn.

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
    this.hitbox = [
      position.getX() + radius,
      position.getX() - radius,
      position.getY() + radius,
      position.getY() - radius,
    ];
  }

  updateHitbox() {
    this.hitbox = [
      this.position.getX() + 0.5 * this.radius,
      this.position.getX() - 0.5 * this.radius,
      this.position.getY() + 0.5 * this.radius,
      this.position.getY() - 0.5 * this.radius,
    ];
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
    this.hitbox = [
      position.getX() + 0.5 * width,
      position.getX() - 0.5 * width,
      position.getY() + 0.5 * height,
      position.getY() - 0.5 * height,
    ];
  }

  updateHitbox() {
    this.hitbox = [
      this.position.getX() + 0.5 * width,
      this.position.getX() - 0.5 * width,
      this.position.getY() + 0.5 * height,
      this.position.getY() - 0.5 * height,
    ];
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

// mouse class used to store information on the user mouse cursor for inputting of forces and viewing information about objects.

class Mouse {
  constructor() {
    this.position = new Position(0, 0);
    // have to use the same .hitbox property structure to not have to code a new function for detecting whether mouse is in an object
    this.hitbox = [0, 0, 0, 0];
    this.leftClickDragging = false;
    this.prevPos = new Position(0, 0);
    this.newPos = new Position(0, 0);
    this.inputPrimed = false;
    this.inputtedObject = null;
    this.leftClicked = false;
  }

  isInObject(other) {
    return other.isCollision(this);
  }

  addForceOnObject(other) {
    // whenever mouse is dragged off of canvas the input method breaks, can fix with oob detection
    if (this.isInObject(other) && this.leftClicked && !this.inputPrimed) {
      // cannot directly assign this.pos as it tracks the property for some reason then
      this.prevPos = new Position(this.position.x, this.position.y);
      this.leftClicked = false;
      this.inputPrimed = true;
      this.inputtedObject = other;
    } else if (this.leftClicked && this.inputPrimed) {
      const diffPos = this.position.sub(this.prevPos);
      this.inputtedObject.forces[2] = diffPos.mult(-10000);
      this.leftClicked = false;
      this.inputPrimed = false;
      this.inputtedObject = null;
    }
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

// GLOBALS

const mouse = new Mouse();
var constants = getConstants();
var objects;

// CORE FUNCTIONS

// function which initializes the simulation
function init() {
  objects = [];
  const c = document.getElementById("Simulation");
  const ctx = c.getContext("2d");
  const height = 480; // Resolution/dimensions of canvas displayed in.
  const width = 640;
  // let collisions = {};
  clock(ctx, width, height);
}

// adding object function which grabs from the input fields on the html page to create an object of the given parameters.
function addInputObject() {
  let newObj;
  const shape = document.getElementById("object-type").value;
  const colour = document.getElementById("colour").value;
  const density = parseFloat(document.getElementById("density").value);
  const position = new Position(
    parseFloat(document.getElementById("position-x").value),
    parseFloat(document.getElementById("position-y").value)
  );
  const velocity = new Velocity(
    parseFloat(document.getElementById("velocity-x").value),
    parseFloat(document.getElementById("velocity-y").value)
  );
  const acceleration = new Acceleration(
    parseFloat(document.getElementById("acc-x").value),
    parseFloat(document.getElementById("acc-y").value)
  );
  if (shape == "circle") {
    const radius = parseFloat(document.getElementById("radius").value);
    newObj = new Circle(
      radius,
      density,
      colour,
      velocity,
      acceleration,
      position
    );
  } else {
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    newObj = new Rectangle(
      height,
      width,
      density,
      colour,
      velocity,
      acceleration,
      position
    );
  }
  objects.push(newObj);
}

// function which draws the simulations current frame using the canvas drawing functions.
function update(ctx, width, height) {
  // collisions = {};
  ctx.fillStyle = "#89CFF0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#964B00";
  ctx.fillRect(0, RESOLUTION[1] * (8 / 9), width, RESOLUTION[1]);
  for (const object of objects) {
    object.addWeight();
    object.groundCeilingCollision();
    object.sideCollision();
    object.updateAll();
    object.updateHitbox();
    drawObject(ctx, object);
  }

  // checks for other object collisions, source of most lag O(n^2) time complexity
  for (const object1 of objects) {
    for (const object2 of objects) {
      if (
        object1.isCollision(object2) 
        // && !collisions.hasOwnProperty(object1) &&
        // !collisions.hasOwnProperty(object2)
      ) {
        object1.otherObjectCollision(object2);
        // collisions[object1] = true;
        // collisions[object2] = true;
      }
    }
  }
  for (const object of objects) {
    mouse.addForceOnObject(object);
  }
}

// this functions draws the given object, differentiating between methods of drawing using the object.shape property of the object class.
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

// this function runs the update every 10ms using an interval function, this interval loops the update function which updates the positions of all balls in the animation.
function clock(ctx, width, height) {
  window.interval = setInterval(update, 10, ctx, width, height);
}

// preset handling function
function createPresetSituation() {
  const preset = document.getElementById("presets").value;
  if (preset != "none") {
    addPresetObjects(preset);
    presetConstants(preset);
  }
}

function presetConstants(preset) {
  switch (preset) {
    case ("diffusion"):
      window.constants = {
        CoeffRest: 1,
        GravitationalFieldStrength: 0,
        TimeScale: 0.1,
        DensityOfAir: 0,
      };
      break;
    default:
      break;
  }
}

function getPresetObjectList(preset) {
  // object filled with lists of objects which will be added to current object list to be drawn according to each preset.
  let presetObjectList = [];
  switch (preset) {
    case ("diffusion"):
      for (let i = 0; i < 100; i++) {
        // randomly decides if the y velocity will be upwards or downwards.
        let sign = generateRandomSign();
        presetObjectList.push(
          new Circle(
            5,
            5,
            "red",
            new Velocity(
              sign * generateRandomFloat(0, 50),
              sign * generateRandomFloat(0, 50)
            ),
            new Acceleration(),
            new Position(
              generateRandomFloat(0, 0.25 * RESOLUTION[0]),
              (((8 / 9) * RESOLUTION[1]) / 100) * i
            )
          )
        );
      }
      for (let i = 0; i < 100; i++) {
        // randomly decides if the y velocity will be upwards or downwards.
        let sign = generateRandomSign();
        const k = new Position(
          generateRandomFloat(0.75 * RESOLUTION[0], RESOLUTION[0]),
          (((8 / 9) * RESOLUTION[1]) / 100) * i
        );
        presetObjectList.push(
          new Circle(
            5,
            5,
            "green",
            new Velocity(
              sign * generateRandomFloat(0, 50),
              sign * generateRandomFloat(0, 50)
            ),
            new Acceleration(),
            k
          )
        );
        console.log(k);
      }
      break;
    case "other":
      break;
    default:
      break;
  }
  return presetObjectList;
}

// INPUT HANDLING FUNCTIONS

// adding object function which adds a list of objects, used to handle the creation of preset scenarios.
function addPresetObjects(preset) {
  const presetObjects = getPresetObjectList(preset);
  objects = presetObjects;
}

function generateRandomSign() {
  let sign;
  if (Math.random() < 0.5) {
    sign = -1;
  } else {
    sign = 1;
  }
  return sign;
}

function generateRandomFloat(lower, upper) {
  return lower + Math.random() * (upper - lower);
}

// mouse input function which updates the position attribute of the mouse class used for player input
function updateMousePos(event) {
  const canvas = document.getElementById("Simulation");
  const relativeCoords = canvas.getBoundingClientRect();
  // convert this to relative canvas coords :)
  mouse.containInBounds(
    event.clientX - relativeCoords.left,
    event.clientY - relativeCoords.top
  );
  for (let i = 0; i < 4; i++) {
    if (i < 2) {
      mouse.hitbox[i] = mouse.position.getX();
    } else {
      mouse.hitbox[i] = mouse.position.getY();
    }
  }
}

// mouse input handle which handles the event of the mouse click (of any buttons), i.e. inputting a force on an object.
function onMouseClick(event) {
  if (event.button == 0) {
    mouse.leftClicked = true;
  }
}

// Grabs the values from each input field in order to update the constants array to user selected values.
function getConstants() {
  const G = parseFloat(document.getElementById("gravity").value);
  const DENSITYOFAIR = parseFloat(document.getElementById("densityOA").value);
  const RATE = parseFloat(document.getElementById("scale").value / 10);
  const E = parseFloat(document.getElementById("restit").value);
  const constants = {
    CoeffRest: E,
    GravitationalFieldStrength: G,
    TimeScale: RATE,
    DensityOfAir: DENSITYOFAIR,
  };
  return constants;
}

// the global variable constants is updated whenever this function is called, with updated values in the user interface of the web page.
function updateConstants() {
  constants = getConstants();
}

// the function called by the pause button when it is clicked, clears the interval when the button is toggled on when clicked, starts it again when toggled off when clicked.
// this stops and starts the animation of canvas.
function pauseSim() {
  const btn = document.getElementById("pause-btn");
  if (btn.value == "ON") {
    clearInterval(window.interval);
  } else {
    const c = document.getElementById("Simulation");
    const ctx = c.getContext("2d");
    const height = 480; // Resolution/dimensions of canvas displayed in.
    const width = 640;
    clock(ctx, width, height);
  }
}

// Toggles the pause button between ON and OFF states, allows for the pauseSim() function to decide when to stop and start the interval function.
function tgl() {
  const btn = document.getElementById("pause-btn");
  if (btn.value == "ON") {
    btn.value = "OFF";
  } else {
    btn.value = "ON";
  }
}

// function which reinitilaizes the
function reInit() {
  clearInterval(window.interval);
  const c = document.getElementById("Simulation");
  ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 640, 480);
  init();
}

// event listeners for user input ------------

document
  .getElementById("refresh-btn")
  .addEventListener("click", updateConstants);

document
  .getElementById("preset-btn")
  .addEventListener("click", createPresetSituation);

document.getElementById("pause-btn").addEventListener("click", pauseSim);

document.getElementById("refresh-sim").addEventListener("click", reInit);

document
  .getElementById("add-object-btn")
  .addEventListener("click", addInputObject);

document.addEventListener("mousemove", updateMousePos);

document.addEventListener("mousedown", onMouseClick);

document.addEventListener("mouseup", onMouseClick);

// when the page is loaded the init function is ran.
window.onload = init;

// notes:
// Create presets and an interesting default option or something... - talk to monsiour adams
// then add the graphs (sadge) - all on one canvas if possible (try to create seperate file for this script)
