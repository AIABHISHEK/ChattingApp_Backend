const express = require('express')
const socketio = require('socket.io')

// const http = require('http')

const {addUser, removeUser, getUser, getUserInRoom } = require('./user')
const app = express()

const router = require('./router.js');

const port = 5000

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');// set which origins are allowed
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST , PUT, PATCH, DELETE'); //to set which methods 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// const io = require('./socket.js').init(server);
const io = socketio(server,  { cors: { origin: "*" } });

// io.on('connection', (socket) => {
//     console.log(socket, " the connection established");
// });

// const server = http.createServer(app);
// const io = socketio(server,{
//     cors: {
//         origin: "*",
//       }
// });

app.use(router);

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('connected');
    // this function run when above connected user (socket get disconnected)
    // call back can be handled on client side for specific error
    socket.on('join', (data, callback) => {
        console.log(data);
        const {error, user} = addUser({id: socket.id, name: data.name, room: data.room});

        if(error) return callback(error);
        //join to certain room 
        socket.join(user.room);
        socket.emit('message', {user: user.name, message: 'Welcome to room ' + user.room })
        socket.broadcast.to(user.name).emit('message', {user: 'admin', text: `&{user.name} has joined`});
        // io.to(user.room).emit('joined_room', {message:user.name + " has joined room" });
        callback(undefined);
        })
        // if user sends messages
    socket.on('sendMessage', (data, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user:user.name, text:data.message});
        callback();
    })
    socket.on('disconnect', () => {
        removeUser(socket.id);
        console.log('User left');
    })
})



