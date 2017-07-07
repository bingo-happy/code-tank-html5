/**
 * Created by bingo on 2017/7/4.
 */


var PER_SHELL = 10;
var TIME_PER_STEP = 50;
var MAP_SIZE = 600;
var CODE_TIMEOUT = 250;

var socket = {};
var running = false;
var player = {};

socket = io.connect('http://localhost:4004');
socket.on('onconnected',(socket)=>{
    alert("welcome to CodeTank! UUID:"+socket.id);
    player = socket;
});
socket.on('message',(msg)=>{
    handleMsg(msg)
});


function handleMsg(msg) {

}


function addToGame() {

    player.name = "!!";
    socket.emit("message",{
        type:"ADD_PLAY",
        payload:player,
    })
}


function StartGame() {

    socket.emit('message', {
        myTank: {
            id: id,
            name: 'fly',
        }
    });
}


function run() {
    if (running) {
        doStep();
        paintCanvas();
        window.setTimeout(run, TIME_PER_STEP);
    }
}

function doStep() {

}

function paintCanvas() {

}