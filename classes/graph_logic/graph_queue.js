class GraphQueue {
	constructor(maximumLength) {
		this.frontPointer = -1;
		this.backPointer = -1;
		this.maximumLength = maximumLength;
		this.largestPresentValue = [0, 0]; // [largest stored value, index in graph of this value]
		this.data = []; // stores the actual data of the queue within this list
	}

	getLargestPresentValue() {
		return Math.abs(this.largestPresentValue[0]);
	}

	updateLargestPresentValue() {
		const largestValue = this.largestPresentValue[0];
		const indexOfValue = this.largestPresentValue[1];
		// avoids index range error as queue shrinks in accordance to x scale
		if (indexOfValue < this.data.length) {
			if (Math.abs(this.data[this.backPointer][1]) > Math.abs(largestValue) || this.data[indexOfValue][1] != largestValue) {
				this.largestPresentValue[0] = this.data[this.backPointer][1];
				this.largestPresentValue[1] = this.backPointer;
			}
		} else {
			this.largestPresentValue[0] = this.data[this.backPointer][1];
			this.largestPresentValue[1] = this.backPointer;
		}
	}

	// dequeues data and pops elements until length of data list is equal to newLength
	// if the newLength is greater than the current then more elements are added to the list
	setLength(newLength) {
		this.maximumLength = newLength;
		let pointerToPop;
		while (newLength < this.data.length) {
			pointerToPop = this.dequeueData();
			this.data.pop(pointerToPop);
			this.frontPointer--;
		}
		while (newLength > this.data.length) {
			this.data.splice(this.backPointer + 1, 0, [0, 0, 0]);
		}
	}

	// translates from absolute index to an index position relative to the pointer positions in the queue.
	getQueueIndex(index) {
		const newIndex = (this.frontPointer + index) % this.maximumLength;
		return newIndex;
	}

	// returns the list index of the given index given its location in the queue.
	// inverse function of getQueueIndex.
	undoQueueIndex(index) {
		return (index - this.frontPointer + this.maximumLength) % this.maximumLength;
	}

	isFull() {
		return (this.backPointer + 1) % this.maximumLength == this.frontPointer;
	}

	isEmpty() {
		return this.frontPointer == -1;
	}

	// get number of data points in queue
	getLength() {
		return this.undoQueueIndex(this.backPointer) - this.undoQueueIndex(this.frontPointer) + 1;
	}

	enqueueData(newData) {
		if (this.isFull()) {
			this.dequeueData();
		}
		this.backPointer = (this.backPointer + 1) % this.maximumLength;
		this.data[this.backPointer] = newData;
		if (this.frontPointer == -1) {
			this.frontPointer = 0;
		}
	}

	dequeueData() {
		if (this.isEmpty()) {
			return null;
		}
		const removedPointer = this.frontPointer;
		if (this.frontPointer == this.backPointer) {
			this.frontPointer = -1;
			this.backPointer = -1;
			return removedPointer;
		}
		this.frontPointer = (this.frontPointer + 1) % this.maximumLength;
		return removedPointer;
	}

	clearQueue() {
		for (let i = 0; i < this.data.length; i++) {
			this.dequeueData();
		}
	}
}
