class CanvasHandler {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.canvasCtx = this.canvas.getContext("2d");
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.running = true;
	}

	drawLine(initialPositionX, initialPositionY, finalPositionX, finalPositionY, colour = "black", thickness = 1) {
		this.canvasCtx.strokeStyle = colour;
		this.canvasCtx.lineWidth = thickness;
		this.canvasCtx.beginPath();
		this.canvasCtx.moveTo(initialPositionX, initialPositionY);
		this.canvasCtx.lineTo(finalPositionX, finalPositionY);
		this.canvasCtx.stroke();
	}

	drawRectangle(topLeftX, topLeftY, width, height, colour) {
		this.canvasCtx.fillStyle = colour;
		this.canvasCtx.fillRect(topLeftX, topLeftY, width, height);
	}

	drawCircle(x, y, radius, colour) {
		this.canvasCtx.fillStyle = colour;
		this.canvasCtx.beginPath();
		this.canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
		this.canvasCtx.fill();
	}

	drawText(text, x, y, colour) {
		this.canvasCtx.fillStyle = colour;
		this.canvasCtx.fillText(text, x, y);
	}
}
