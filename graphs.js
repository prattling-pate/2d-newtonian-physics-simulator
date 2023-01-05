// THIS HAS TO BE PLACED INTO THE MAIN.JS SCRIPT SO THAT ALL OF THE CODE RUNS SEQUENTIALLY - FIRST THE SIMULATION THEN THE GRAPHS.

// MAYBE SPEND ALL OF TOMORROW CLEANING UP ALL UNUSED METHODS AND MESSY CODE AND ORDER OF FUNCTIONS.



function init() {
    const canvas = document.getElementById("Graphs");
    const ctx = canvas.getContext("2d");
    const height = 480;
    const width = 640;
    const graphs = [new Graph(width/2, height/2, "Displacement", "Time", 1, [width*0.25,height*0.25]), new Graph(width/2, height/2, "Velocity", "Time", 1, [width*0.75,height*0.25]), new Graph(width/2, height/2, "Acceleration", "Time", 1, [width*0.25, height*0.75]), new Graph(width/2, height/2,  "Kinetic Energy", "Time", 1, [width*0.75, height*0.75])];
    console.log(graphs);
    // clock(ctx, graphs, height, width);
}

function clock(ctx, graphs, height, width) {
    setInterval(updateCanvas, 10, ctx, graphs, height, width);
}

function updateCanvas(ctx, graphs, height, width) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    let objectData;
    let time;

    // bug - graphs list is non-iterable?????
    // for (const graph of graphs) {
    //     objectData = retrieveObjectData();
    //     time = getTime();
    //     graph.drawGraph(ctx, width, height);
    //     // graph.plotData(ctx, width, height, objectData, time);
    // }
}

// get current time of result of simulation when data is fetched.
function getTime(){
    return time;
}

// develop to continually retrieve object data from main.js script once object is right clicked
function retrieveObjectData() {
    return null;
}

init();