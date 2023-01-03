class Graph {
    constructor(width, height, axisY, axisX, scale, originPosition) {
        this.width = width;
        this.height = height;
        this.axisX = axisX;
        this.axisY = axisY;
        this.scale = scale;
        this.originPosition = originPosition; // indicates the quadrant of the canvas the graph resides in
        this.data = []; // data property is a linear dynamic queue, allows old datapoints to be taken from graph while new ones are untouched
    }

    drawGraph(ctx, width, height) {
        // object storing the origin position for each sector
        const originCentre=this.originPosition;
        // drawing the graph axis
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(originCentre[0]-width*0.25,originCentre[1]);
        ctx.lineTo(originCentre[0]+width*0.25,originCentre[1]);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(originCentre[0]-width*0.25,originCentre[1]-height*0.25);
        ctx.lineTo(originCentre[0]-width*0.25,originCentre[1]+height*0.25);
        ctx.stroke();
        // drawing boundaries between graphs
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(originCentre[0]-width*0.25,originCentre[1]-height*0.25);
        ctx.lineTo(originCentre[0]+width*0.25,originCentre[1]-height*0.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(originCentre[0]+width*0.25,originCentre[1]-height*0.25);
        ctx.lineTo(originCentre[0]+width*0.25,originCentre[1]+height*0.25);
        ctx.stroke();
    }

    // write code to plot points at given time with appropriate scaling
    plotData(ctx, width, height, objectData, time){
        const information = {"Displacement": objectData.getDisplacement(), "Velocity": objectData.getVelocity(), "Acceleration": objectData.getAcceleration(), "Kinetic Energy": objectData.getKineticEnergy()};
        const toPlot = information[this.axisY];
        ctx.beginPath();
        ctx.strokeRect();
    }

    // data queue methods

    enqueueData(data) {
        this.data.push(data);
    }

    dequeueData() {
        this.data.shift();
    }

    getDataQueueLength() {
        return this.data.length;
    }
    
}

function init() {
    const canvas = document.getElementById("Graphs");
    const ctx = canvas.getContext("2d");
    const height = 480;
    const width = 640;
    const graphs = [new Graph(width/2, height/2, "Displacement", "Time", 1, [width*0.25,height*0.25]), new Graph(width/2, height/2, "Velocity", "Time", 1, [width*0.75,height*0.25]), new Graph(width/2, height/2, "Acceleration", "Time", 1, [width*0.25, height*0.75]), new Graph(width/2, height/2,  "Kinetic Energy", "Time", 1, [width*0.75, height*0.75])];
    clock(ctx, graphs, height, width);
}

function clock(ctx, graphs, height, width) {
    setInterval(updateCanvas(ctx, graphs, height, width));
}

function updateCanvas(ctx, graphs, height, width) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    let objectData;
    let time;
    for (const graph of graphs) {
        objectData = retrieveObjectData();
        time = getTime();
        graph.drawGraph(ctx, width, height);
        // graph.plotData(ctx, width, height, objectData, time);
    }

}

function getTime(){
    return null;
}

// develop to continually retrieve object data from main.js script once object is right clicked
function retrieveObjectData() {
    return null;
}

init();