/**
 * Created by bingo on 2017/7/7.
 */


var _ = require('./lib/lodash.js');

var PER_SHELL = 10;
var TIME_PER_STEP = 1000;
var MAP_SIZE = 800;
var CODE_TIMEOUT = 250;



function addClient() {

}

function removeClient() {

}

var game_server = {
    players:[],
    shells:[],
    map:[],
    host:0,
};
var server_sockets ;
game_server.handleMsg =(msg,sockets)=>{
    server_sockets = sockets;
    // console.log(msg.type);
    // console.log(msg.payload);
    let payload = msg.payload;
    switch (msg.type){
        case 'ADD_PLAYER':
            addPlayer(payload);
            break;
        case "REMOVE_PLAYER":
            removePlayer(payload);
            break;
        case "GAME_PARAM":
            emitParam();
            break;
        case "RESET":
            reset();
            break;
        case "RUN_GAME":
            if(payload!=game_server.host)return;
            RUN_GAME();
            emitParam();
            break;
    }
};

function reset() {
    game_server.players = [];
    game_server.shells = [];
    game_server.map = [];
    emitParam();
}

function emitParam() {
    // console.log("function emitParam");
    server_sockets.emit("message",{
        type:"GAME_PARAM",
        payload:{
            players:game_server.players,
            shells:game_server.shells,
            map:game_server.map,
        }
    });
}

function addPlayer(player){
    let hasThisPlay = false;
    _.forEach(game_server.players,item=>{
        if(player.uuid==item.uuid)
            hasThisPlay = true;
    });
    if(hasThisPlay)return;
    // console.log("function addPlayer");
    player.x=Math.min(MAP_SIZE,player.x);
    player.x=Math.max(0,player.x);
    player.y=Math.min(MAP_SIZE,player.y);
    player.y=Math.max(0,player.y);
    game_server.players.push(player);
    if(game_server.players.length==1){
        game_server.host = player.uuid;
        server_sockets.emit("message",{
            type:"HOST_ID",
            payload:player.uuid,
        })
    }
    emitParam();
}

function removePlayer (id){
    // console.log("function removePlayer");
    _.remove(game_server.players,item=>{
        return uuid==item.id;
    })
}

function getCode1Result(me,players,shells,map) {
    let code1 =
        '<scr' + 'ipt>' +
        'function f1(me,players,shells,map){' +
        me.moveCode
        + '};' +
        'f1(' + JSON.stringify(me) + ',' + JSON.stringify(players) + ',' + JSON.stringify(shells) + ',' + JSON.stringify(map) + ')' +
        '</scr' + 'ipt>';
    code1 = code1.replace(/<\/?sc[^\>]+>/g, '');
    let direction = [0, 0];
    try {
        direction = eval(code1);
        if(!direction) direction= [0, 0];
    } catch (err) {
        direction = [0, 0];
    }
    return direction;
}

function getCode2Result(me,players,shells,map) {
    let direction = [0, 0];
    if(me.readyShells>PER_SHELL){
        let code2 =
            '<scr' + 'ipt>' +
            'function f1(me,players,shells,map){' +
            me.shellCode
            + '};' +
            'f1(' + JSON.stringify(me) + ',' + JSON.stringify(players) + ',' + JSON.stringify(shells) + ',' + JSON.stringify(map) + ')' +
            '</scr' + 'ipt>';
        code2 = code2.replace(/<\/?sc[^\>]+>/g, '');
        try {
            direction = eval(code2);
            if(!direction) direction= [0, 0];
        } catch (err) {
            direction = [0, 0];
        }
    }
    return direction
}

function RUN_GAME() {
    let players = game_server.players;
    let shells = game_server.shells;
    let map = game_server.map;

    for(let i = 0 ; i<shells.length; i ++){
        shells[i].x = parseInt(shells[i].x) + 2*parseInt(shells[i].dx);
        shells[i].y = parseInt(shells[i].y) + 2*parseInt(shells[i].dy);
    }

    for(let i = 0 ; i<players.length; i ++){
        let moveDirection = getCode1Result(players[i],players,shells,map);
        let dx = 0;
        let dy = 0;
        if(moveDirection[0]>0)dx=1;
        else if(moveDirection[0]<0)dx=-1;
        else if(moveDirection[1]>0)dy=1;
        else if(moveDirection[1]<0)dy=-1;
        players[i].dx = dx;
        players[i].dy = dy;
        players[i].x = parseInt(players[i].x) + dx;
        if(players[i].x<0)players[i].x = 0;
        if(players[i].x>MAP_SIZE)players[i].x = MAP_SIZE;
        players[i].y = parseInt(players[i].y) + dy;
        if(players[i].y<0)players[i].y = 0;
        if(players[i].y>MAP_SIZE)players[i].y = MAP_SIZE;
        players[i].readyShells+=1;
        let shellDirection = getCode2Result(players[i],players,shells,map);
        if(shellDirection[0]!=0||shellDirection[1]!=0){
            if(shellDirection[0]>0)dx=1;
            else if(shellDirection[0]<0)dx=-1;
            if(shellDirection[1]>0)dy=1;
            else if(shellDirection[1]<0)dy=-1;
            shells.push({
                x:parseInt(players[i].x) + dx*6,
                y:parseInt(players[i].y) + dy*6,
                dx:shellDirection[0],
                dy:shellDirection[1],
                group:players[i].group,
            });
            players[i].readyShells-=PER_SHELL;
        }
    }

    _.forEach(shells,shell=>{
        _.remove(players,player=>{
            return  Math.abs(shell.x-player.x)<4&&Math.abs(shell.y-player.y)<4
        })
    });

    game_server.players = players;
    game_server.shells = shells;
    game_server.map  = map;
}

module.exports = game_server;