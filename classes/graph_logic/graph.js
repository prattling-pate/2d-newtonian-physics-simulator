class Graph {
	constructor(width, height, axisY, axisX = "Time", centrePosition) {
		this.width = width;
		this.height = height;
		this.axisX = axisX;
		this.axisY = axisY;
		this.yAutoScaling = true;
		this.unitsY = this.getYUnits();
		this.axisYComponent = "abs";
		this.scale = new Vector2(1, 1);
		this.previousPoint = 0;
		this.timeStep = 1;
		this.centrePosition = centrePosition; // indicates the quadrant of the canvas the graph resides in
		this.queue = new GraphQueue(this.findGraphQueueLength()); // queue property is a circular queue, allows old datapoints to be taken from graph while new ones are untouched.
		// queue contains lists (so 2d lists) containing data to be plotted [scaled, unscaled, is the point out of bounds, time of the point taken].
	}

	clearQueue() {
		this.queue.clearQueue();
	}

	getAxisY() {
		return this.axisY;
	}

	getAxisYComponent() {
		return this.axisYComponent;
	}

	// accepts discrete 'x', 'y' and 'abs' values
	setAxisYComponent(newComponent) {
		this.queue.clearQueue();
		this.axisYComponent = newComponent;
	}

	getYUnits() {
		const units = {
			"Kinetic Energy": "J",
			Displacement: "m",
			Velocity: "m/s",
			Acceleration: "m/s^2",
		};
		return "(" + units[this.axisY] + ")";
	}

	// finds queue length going up to the
	// limiting point (250/320 part way through the x axis) which is where the graph begins scrolling
	findGraphQueueLength() {
		const distanceBetweenPoints = this.scale.getX();
		const plottableGraphSpace = (250 / 320) * this.width;
		// floor function used as fractional indices do not exist in lists
		const distanceBetweenPointsInXAxis = Math.floor(plottableGraphSpace / distanceBetweenPoints);
		return distanceBetweenPointsInXAxis;
	}

	setXStepInPlot(input) {
		this.timeStep = input * 10;
	}

	// gets data to plot from object passed in by grabbing its attributes according to the
	// the graph's vector component and y axis plot.
	getDataPoint(objectData) {
		const information = {
			Displacement: objectData.getDisplacement(),
			Velocity: objectData.getVelocity(),
			Acceleration: objectData.getVelocity(),
			"Kinetic Energy": objectData.getKineticEnergy() / 100, // divided by 100 (as kinetic energy is the square of velocity) to maintain scale that time
		}; //is 10 times lower than stated on the UI in calculations
		let toPlot = information[this.axisY];
		if (this.axisY != "Kinetic Energy") {
			toPlot = toPlot.multiply(0.1); // all components of vectors are divided by 10 in order to preserve scale of computation time
			const components = {
				//being 10 times lower than what is stated on the web page
				x: toPlot.getX(),
				y: -toPlot.getY(),
				abs: toPlot.getMagnitude(),
			};
			toPlot = components[this.axisYComponent];
		}
		return toPlot;
	}

	addData(objectData) {
		let toPlot = this.getDataPoint(objectData);
		if (this.axisY == "Acceleration" && this.queue.getLength() >= 2) {
			toPlot = this.differentiate(toPlot);
			this.previousPoint = this.getDataPoint(objectData);
		}
		const timeAtAxis = objectData.getTime().toFixed(3);
		let toPlotScaled = this.scaleInYAxis(toPlot);
		toPlotScaled = this.putDataPointInBounds(toPlotScaled);
		this.queue.enqueueData([toPlotScaled, toPlot, timeAtAxis]);
		this.queue.updateLargestPresentValue();
	}

	roundToSignificantFigures(input, precision) {
		let output = input;
		if (Math.abs(input) > 1000 || Math.abs(input) < 0.001) {
			output = output.toExponential(precision-1);
			return output;
		}
		output = input.toPrecision(precision);
		return output;
	}

	setScale(x = 0, y = 0) {
		if (x != 0) {
			this.scale.setX(x);
			this.queue.setLength(this.findGraphQueueLength());
		}
		if (y != 0) {
			this.scale.setY(y);
		}
		this.updateQueueScale();
	}

	scaleInYAxis(dataPoint) {
		return dataPoint * this.scale.getY();
	}

	scaleInXAxis(dataPoint) {
		return dataPoint * this.scale.getX();
	}

	updateQueueScale() {
		for (let i = 0; i < this.queue.getLength(); i++) {
			this.queue.data[i][0] = this.queue.data[i][1] * this.scale.getY();
			this.queue.data[i][0] = this.putDataPointInBounds(this.queue.data[i][0]);
		}
	}

	// use linear interpolation to find a scaling factor for plotted values according to the largest recorded value (using direct proportion).
	setAutomaticScale() {
		if (this.queue.getLargestPresentValue() == 0) {
			return null;
		}
		const yScalingFactor = this.height / (this.queue.getLargestPresentValue() * 1.25);
		this.setScale(0, yScalingFactor);
	}

	// translates cartesian data point to the canvas coordinates system.
	translateDataToCanvasPlane(data) {
		const positionX = this.centrePosition.getX() - 0.5 * this.width + data.getX();
		const positionY = this.centrePosition.getY() - data.getY();
		const position = new Position(positionX, positionY);
		return position;
	}

	// if y data point is outside of the bounds of the graph the point will be replaced by the largest representable point on the graph.
	putDataPointInBounds(dataPoint) {
		const graphHeight = this.height;
		if (graphHeight < dataPoint) {
			return graphHeight;
		}
		if (-graphHeight > dataPoint) {
			return -graphHeight;
		}
		return dataPoint;
	}

	// finds the slope (rate of change of the y variable) between two points.
	differentiate(newData) {
		let slope = (newData - this.previousPoint) / (this.timeStep / 10);
		if (this.axisYComponent == "abs") {
			// allows abs of acceleration to be positive for all values (as it should be)
			slope = Math.abs(slope);
		}
		return slope;
	}
}
