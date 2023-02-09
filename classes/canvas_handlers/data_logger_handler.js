class DataLoggerHandler extends CanvasHandler {
	constructor(canvasId) {
		super(canvasId);
		this.graphs = [];
		this.trackedObject;
		this.canvasCtx.fontStyle = "30px Calibri";
	}

	refreshTimeStepInGraphs(newTimeStep) {
		for (const graph of this.graphs) {
			graph.setXStepInPlot(newTimeStep);
		}
	}

	clearGraphQueues() {
		for (const graph of this.graphs) {
			graph.clearQueue();
		}
	}

	setTrackedObject(object) {
		this.trackedObject = object;
	}

	addGraph(yAxis, centrePosition) {
		const position = {
			upperLeft: new Position(this.width * 0.25, this.height * 0.25),
			upperRight: new Position(this.width * 0.75, this.height * 0.25),
			bottomLeft: new Position(this.width * 0.25, this.height * 0.75),
			bottomRight: new Position(this.width * 0.75, this.height * 0.75),
		};
		const graph = new Graph(this.width / 2, this.height / 4, yAxis, "Time", position[centrePosition]);
		this.graphs.push(graph);
	}

	drawBackground() {
		this.drawRectangle(0, 0, this.width, this.height, "white");
	}

	drawBorders(lineCoordinates) {
		this.drawLine(lineCoordinates.topLeft.getX(), lineCoordinates.topLeft.getY(), lineCoordinates.bottomLeft.getX(), lineCoordinates.bottomLeft.getY(), "black", 5);
		this.drawLine(lineCoordinates.topRight.getX(), lineCoordinates.topRight.getY(), lineCoordinates.bottomRight.getX(), lineCoordinates.topRight.getY(), "black", 5);
	}

	drawAxis(lineCoordinates) {
		this.drawLine(lineCoordinates.middleLeft.getX(), lineCoordinates.middleLeft.getY(), lineCoordinates.middleRight.getX(), lineCoordinates.middleRight.getY(), "black", 2.5);
		this.drawLine(lineCoordinates.topLeft.getX(), lineCoordinates.topLeft.getY(), lineCoordinates.topRight.getX(), lineCoordinates.topRight.getY(), "black", 2.5);
	}

	drawTicks(graph) {
		const distanceBetweenYTicks = graph.height / 6;
		for (let i = 0; i < 5; i++) {
			this.drawLine(
				graph.originPosition.getX() - 0.525 * graph.width, graph.originPosition.getY() + distanceBetweenYTicks * (i + 1),
				graph.originPosition.getX() - 0.475 * graph.width, graph.originPosition.getY() + distanceBetweenYTicks * (i + 1),
				"black",
				1
			);
			this.drawLine(
				graph.originPosition.getX() - 0.525 * graph.width, graph.originPosition.getY() - distanceBetweenYTicks * (i + 1),
				graph.originPosition.getX() - 0.475 * graph.width, graph.originPosition.getY() - distanceBetweenYTicks * (i + 1),
				"black",
				1
			);
		}
	}

	drawGraph(graph) {
		const lineCoordinates = {
			middleLeft: new Position(graph.originPosition.getX() - this.width * 0.25, graph.originPosition.getY()),
			middleRight: new Position(graph.originPosition.getX() + this.width * 0.25, graph.originPosition.getY()),
			topLeft: new Position(graph.originPosition.getX() - this.width * 0.25, graph.originPosition.getY() - this.height * 0.25),
			topRight: new Position(graph.originPosition.getX() + this.width * 0.25, graph.originPosition.getY() - this.height * 0.25),
			bottomRight: new Position(graph.originPosition.getX() + this.width * 0.25, graph.originPosition.getY() + this.height * 0.25),
			bottomLeft: new Position(graph.originPosition.getX() - this.width * 0.25, graph.originPosition.getY() + this.height * 0.25),
		};

		// drawing the graph axis
		this.drawAxis(lineCoordinates);
		// drawing boundaries between graphs
		this.drawBorders(lineCoordinates);
		const yAxisTitlePosition = graph.translateDataToCanvasPlane(new Position(10, 110));
		this.drawText(graph.axisY + " " + graph.unitsY, yAxisTitlePosition.getX(), yAxisTitlePosition.getY(), "black");
		const xAxisTitlePosition = graph.translateDataToCanvasPlane(new Position(280, 10));
		this.drawText(graph.axisX + " (s)", xAxisTitlePosition.getX(), xAxisTitlePosition.getY(), "black");
	}

	drawScales(graph) {
		let yValueScale;
		const xPosOfYScale = graph.originPosition.getX() - this.width * 0.225;
		for (let i = 0; i < 5; i++) {
			yValueScale = graph.roundToSignificantFigures(20 * (i + 1) * (1 / graph.scale.getY()), 3);
			this.drawText(yValueScale, xPosOfYScale, graph.originPosition.getY() - (i + 1) * 20, "black");
			this.drawText('-'+yValueScale, xPosOfYScale, graph.originPosition.getY() + (i + 1) * 20, "black");
		}
	}

	plotData(graph) {
		let position; let positionNext; let index; let indexNext; let colour;
		const xScale = graph.scale.getX();
		for (let i = 0; i < graph.queue.getLength() - 1; i++) {
			index = graph.queue.getQueueIndex(i);
			indexNext = graph.queue.getQueueIndex(i + 1);
			position = graph.translateDataToCanvasPlane(new Position(i*xScale, graph.queue.data[index][0]));
			positionNext = graph.translateDataToCanvasPlane(new Position((i + 1)*xScale, graph.queue.data[indexNext][0]));
			colour = graph.getColourOfDataPoint(graph.queue.data[indexNext][2]);
			this.drawLine(position.getX(), position.getY(), positionNext.getX(), positionNext.getY(), colour, 1);
			if ((i + 51) % 100 == 0) {
				// draws the x axis scales
				this.drawText(graph.queue.data[index][3], position.getX(), graph.originPosition.getY() + 20, "black");
			}
		}
		this.drawScales(graph);
	}

	animateFrame() {
		this.drawBackground();
		for (const graph of this.graphs) {
			if (this.trackedObject && this.running) {
				graph.addData(this.trackedObject);
			}
			this.drawGraph(graph);
			this.plotData(graph);
			this.drawTicks(graph);
		}
	}
}
