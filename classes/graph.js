class Graph {
	constructor(width, height, axisY, axisX = "Time", originPosition) {
		this.width = width;
		this.height = height;
		this.axisX = axisX;
		this.axisY = axisY;
		this.unitsY = this.getYUnits();
		this.axisYComponent = "abs";
		this.scale = new Vector2(1, 1);
		this.largestValueRecorded = 0;
		this.timeStep = 1;
		this.originPosition = originPosition; // indicates the quadrant of the canvas the graph resides in
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

	// uses simple inverse proportionality after finding 2500 length is good for timescale of 0.1.
	findGraphQueueLength() {
		const distancePerPoint = this.scaleInXAxis(this.timeStep);
		const plottableGraphSpace = 250/320 * this.width;
		const distanceBetweenPointsInXAxis = plottableGraphSpace / distancePerPoint;
		return distanceBetweenPointsInXAxis;
	}

	setXStepInPlot(input) {
		this.timeStep = input * 10;
	}

	getDataPoint(objectData) {
		const information = {
			Displacement: objectData.getDisplacement(), // could use integration but that could be very taxing on the performance
			Velocity: objectData.getVelocity(),
			Acceleration: objectData.getVelocity(),
			"Kinetic Energy": objectData.getKineticEnergy(), // for now in 10^4 J
		};
		let toPlot = information[this.axisY];
		if (this.axisY != "Kinetic Energy") {
			const components = {
				x: toPlot.getX(),
				y: toPlot.getY(),
				abs: toPlot.getMag(),
			};
			toPlot = components[this.axisYComponent];
		}
		return toPlot;
	}

	isPointOutOfBounds(toPlotScaled) {
		if (Math.abs(toPlotScaled) > this.height) {
			return true;
		}
		return false;
	}

	// look at colour to make it easier to see the scale over it
	getColourOfDataPoint(outOfBounds) {
		if (outOfBounds) {
			return "red";
		}
		return "black";
	}

	addData(objectData) {
		const toPlot = this.getDataPoint(objectData);
		const timeAtAxis = objectData.getTime().toFixed(3);
		let toPlotScaled = this.scaleInYAxis(toPlot);
		toPlotScaled = this.putDataPointInBounds(toPlotScaled);
		const outOfBounds = this.isPointOutOfBounds(toPlotScaled);
		this.queue.enqueueData([toPlotScaled, toPlot, outOfBounds, timeAtAxis]);
		this.queue.updateLargestPresentValue();
	}

	roundToSignificantFigures(input, precision) {
		let output = input;
		if (Math.abs(input) > 1000) {
			output = output.toExponential();
		}
		output = input.toPrecision(precision);
		return output;
	}

	setScale(x = 0, y = 0) {
		if (x == 0 && y == 0) {
			alert("Cannot set scales to 0");
			return null;
		}
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
		const yScalingFactor = this.height / this.queue.getLargestPresentValue();
		this.setScale(0, yScalingFactor);
	}

	// translates cartesian data point to the canvas coordinates system.
	translateDataToCanvasPlane(data) {
		const positionX = this.originPosition.getX() - 0.5 * this.width + data.getX();
		const positionY = this.originPosition.getY() - data.getY();
		const position = new Position(positionX, positionY);
		return position;
	}

	// if y data point is outside of the bounds of the graph the point will be replaced by the largest representable point on the graph.
	// how do i denote a value is out of range?
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
	differentiate(dataPointY, dataPointNextY) {
		return (dataPointNextY - dataPointY) / this.timeScale;
	}
}
