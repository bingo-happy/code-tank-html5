/**
 * Created by bingo on 2017/7/4.
 */

var PER_SHELL = 10;
var TIME_PER_STEP = 100;
var MAP_SIZE = 800;
var CODE_TIMEOUT = 250;

var socket;
var running = false;
var player;
var players;
var shells;
var map;
var panelVisiable=true;
var docVisiablev = false;
var UUID;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");


socket = io.connect('http://192.168.18.45:4004');
socket.on('onconnected',(socket)=>{
    UUID = socket.id;
    alert("welcome to CodeTank! Your UUID is :" + UUID);
    player = socket;
});
socket.on('message',(msg)=>{
    handleMsg(msg)
});

function handleMsg(msg) {
    console.log(msg.type);
    console.log(msg.payload);
    let payload = msg.payload;
    switch (msg.type){
        case 'HOST_ID':
            if(payload==UUID)
                $("#StartStopGame")[0].style.visibility='visible';
            break;
        case 'GAME_PARAM':
            players = payload.players;
            shells = payload.shells;
            map = payload.map;
            _.forEach(players,item=>{
                if(player.id==item.id)
                    player=item;
            });
            paintCanvas();
            break;
    }
}

function addRobot() {

    player.x = MAP_SIZE/2;
    player.y = MAP_SIZE/2;
    player.name = "robot";
    player.group = 'roboy';
    player.dx = 0;
    player.dx = 0;
    player.moveCode =  "let x =  Math.floor(Math.random()*3)-1;"+
        "let y = Math.floor(Math.random()*3)-1;"+
        " return [x,y];";
    player.shellCode ="let x = Math.floor(Math.random()*3)-1;"+
        "let y = Math.floor(Math.random()*3)-1;"+
        " return [x,y];";
    player.readyShells= 0;

    socket.emit("message",{
        type: 'ADD_PLAYER',
        payload:player,
    })
}


function addToGame() {

    let startX = $("#startX").val();
    if(isNaN(startX))startX=MAP_SIZE/2;
    let startY = $("#startY").val();
    if(isNaN(startY))startY=MAP_SIZE/2;
    let startName = $("#startName").val();
    let startGroup = $("#startGroup").val();
    if(isNaN(startGroup))startGroup=1;
    if(startGroup<0||startGroup>7)startGroup=0;
    let startMoveCode = $("#startMoveCode").val();
    let startShellCode = $("#startShellCode").val();

    if(!startName){
        alert("姓名必填");return;
    }
    if(!startGroup){
        alert("分组必填0-7");return;
    }
    player.uuid = UUID;
    player.x = startX;
    player.y = startY;
    player.name = startName;
    player.group = startGroup;
    player.dx = 0;
    player.dx = 0;
    player.moveCode = startMoveCode;
    player.shellCode = startShellCode;
    player.readyShells= 0 ;

    socket.emit("message",{
        type: 'ADD_PLAYER',
        payload:player,
    })
}


function StartStopGame() {
    running = !running;
    run();
}
function reset() {
    socket.emit("message",{
        type: 'RESET',
        payload:"",
    });
    running = false;
}
function run() {
    if (running) {
        socket.emit("message",{
            type: 'RUN_GAME',
            payload:UUID,
        });
        window.setTimeout(run, TIME_PER_STEP);
    }
}

function paintCanvas() {
    context.fillStyle = "#212121";
    context.fillRect(0,0, MAP_SIZE,MAP_SIZE);

    for(let i = 0 ; i < players.length ; i ++){
        if(players[i].group==0)context.fillStyle = "#f00000";
        else if(players[i].group==0)context.fillStyle = "#0f0000";
        else if(players[i].group==1)context.fillStyle = "#00f000";
        else if(players[i].group==2)context.fillStyle = "#000f00";
        else if(players[i].group==3)context.fillStyle = "#0000f0";
        else if(players[i].group==4)context.fillStyle = "#00000f";
        else if(players[i].group==5)context.fillStyle = "#f0f0f0";
        else if(players[i].group==6)context.fillStyle = "#0f0f0f";
        context.fillRect(players[i].x - 5, players[i].y - 5, 11, 11);
        context.font="20px Georgia";
        context.fillText(players[i].name,players[i].x,players[i].y-10);
    }

    for(let i = 0 ; i < shells.length ; i ++){
        context.fillStyle = "#ffffff";
        context.fillRect(shells[i].x-1,  shells[i].y-1, 3, 3);
    }
    if(!!player){
        $('#showX')[0].innerHTML="x:"+player.x;
        $('#showY')[0].innerHTML="y:"+player.y;
        $('#showDx')[0].innerHTML="dx:"+player.dx;
        $('#showDy')[0].innerHTML="dy:"+player.dy;
        $('#showReadyShells')[0].innerHTML="readyShells:"+player.readyShells;
    }
}

function showHidDoc() {
    if(docVisiablev){
        docVisiablev=false;
        $('#doc')[0].style.maxHeight='0px'
    }else {
        docVisiablev=true;
        $('#doc')[0].style.maxHeight='1000px'
    }
}

function showHidPanel(){
    if(panelVisiable){
        panelVisiable=false;
        $('#panel')[0].style.maxHeight='0px'
    }else {
        panelVisiable=true;
        $('#panel')[0].style.maxHeight='500px'
    }
}
