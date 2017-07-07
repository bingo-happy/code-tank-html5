/**
 * Created by bingo on 2017/7/7.
 */




var game_server = {
    players:[],
    shells:[],
    maps:[],
};

game_server.handleMsg =(msg)=>{
    console.log(msg.type);
    let payload = msg.payload;
    switch (msg.type){
        case 'ADD_PLAYER':
            addPlayer(payload);
            break;
        case "REMOVE_PLAYER":
            removePlayer(payload);
            break;

    }
};

function addPlayer(player){
    console.log(player);
}

function removePlayer (player){

}


module.exports = game_server;