const WebSocket = require('ws');

//创建一个websocket的服务器，并且传入对应的参数
const wss = new WebSocket.Server({ port: 3000 });

//一个生成唯一ID的函数
// wss.getUniqueID = function () {
//     function s4() {
//         return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
//     }
//     return s4() + s4() + '-' + s4();
// }

//广播函数，用来循环clients（它是一个set），所以他的forEach取不到index
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if(client.readyState === WebSocket.OPEN){
            client.send(data)
        }
    })
}

let clientCount = 0
//connection事件应该是当新的连接建立时，就会重新建一份
wss.on('connection', function connection(ws) {
    //所以可以勉强通过这种方式来获得新建链接的用户号
    clientCount ++
    ws.nickname = 'user' + clientCount
    console.log(`New connection: user${ws.nickname} coming`)

    let mes = {}
    mes.type = 'enter'
    mes.data = ws.nickname + " comes in"
    //只能传输str，所以要JSON.stringify
    wss.broadcast(JSON.stringify(mes))

    //当接收到消息时
    ws.on('message', function incoming(message) {
        let mes = {}
        mes.type = 'message'
        mes.data = ws.nickname + ":" + message
        wss.broadcast(JSON.stringify(mes))
    });
    //当有链接关闭时
    ws.on('close', function(code, reason) {
        console.log(`Connection closed: user${ws.nickname} leaving`)
        let mes = {}
        mes.type = 'leave'
        mes.data = ws.nickname + " left"
        wss.broadcast(JSON.stringify(mes))
    })
});

