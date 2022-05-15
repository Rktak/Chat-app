const path=require('path');
const http=require('http');
const express =require('express');
const socketio=require('socket.io');
const { SocketAddress } = require('net');
const Filter=require('bad-words');
const { generateMessage, genereteLocation, generateLocation } =require('./utils/messages');
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/users.js')


const app= express();
const server=http.createServer(app);
const io=socketio(server);


const port =process.env.PORT || 3000

const publicDirectoryPath=path.join(__dirname,'../public');
//__dirname mean current directory

app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{
     console.log("New connection on socket.io");

     socket.on('join',({username,room},callback)=>{
          const {error,user}=addUser({id:socket.id,username,room});

          if(error){
               return callback(error);
          }

          socket.join(user.room)
          
          socket.emit('message',generateMessage('Admin','Welcome'));
          socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined !`));

          io.to(user.room).emit('roomData',{
               room:user.room,
               users:getUserInRoom(user.room)
          })

     })
     //io.to.emit,socket.broadcast.to.emit 
     //send at the particular room
     socket.on('sendMessage',(message,callback)=>{
          const user=getUser(socket.id);
          const filter=new Filter();

          if(filter.isProfane(message)){
               return callback('Profanity is not allowed');
          }

          io.to(user.room).emit('message',generateMessage(user.username,message));

          callback();
     });

     //listner for the geo-location
     socket.on('sendLocation',(coords,callback)=>{
          const user=getUser(socket.id);
          let url=`https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
          io.to(user.room).emit('LocationMessage',generateLocation(user.username,url));
          callback();
     });

     socket.on('disconnect',()=>{
          const user=removeUser(socket.id)

          if(user){
               io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left !`));
               io.to(user.room).emit('roomData',{
                    room:user.room,
                    users:getUserInRoom(user.room)
               })
          }

          
     })
     // inbuild data type that is use when the user disconnect  
})

server.listen(port,()=>{
     console.log(`server is up on the port ${port}`);
})