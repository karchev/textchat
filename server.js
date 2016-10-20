// require module
var express = require('express');
var http = require('http');
var main = express();
var server = http.createServer(main);
var io  = require('socket.io').listen(server);
var compression = require('compression');
var bodyParser = require('body-parser');

// listenerch
server.listen(8082, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

// express set
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: true }));
main.get('/', function(req, res){ res.sendfile('client.html'); });
main.get('/index', function(req, res){ res.render('client.html'); });
main.get('/client', function(req, res){ res.render('client.html'); });

var rooms = [];

io.on('connection', function (socket) {
  
  console.log('conected : ' + socket.id);
  
  // create room
  socket.on('create_room', function(e){
    var room = e.roomname;
    var nickname = e.nickname;
    
    console.log('roomname : ' + room);
    console.log('ncikname : ' + nickname);
    
    // already has same name's room
    if(rooms[room] != undefined){
      return false;
    }else{
      
      // create room
      rooms[room] = new Object();
      // create in room's user list
      rooms[room].socket_ids = new Object();
      
      console.log(rooms);
      console.log(Object.keys(rooms));
      
      io.sockets.emit('roomlist', Object.keys(rooms) );
      
    }

  })
  
  // join room
  socket.on('join',function(e){
    
    var room = e.room;
    var nickname = e.nickname;
    
    console.log(rooms[room].socket_ids[nickname]);
    
    if(rooms[room].socket_ids[nickname] != undefined){
      
      socket.emit('join', { 'data' : 'denial' } );
      
    }else{
      
      socket.emit('join', { 'data' : 'permission' })
      
      socket.join(room);
 
      socket.room = room;
      socket.nickname = nickname;
      
      rooms[room].socket_ids[nickname] = socket.id;
      
      io.sockets.in(room).emit('userlist', { 'users' : Object.keys(rooms[socket.room].socket_ids)});
      
    }
    
    console.log(rooms);
    
  });
  
  socket.on('get_roomlist', function(){
    socket.emit('roomlist', Object.keys(rooms));
  })
  
  socket.on('send_message', function(e){
    socket.broadcast.to(socket.room).emit('broadcast_message_recieve', e);
  })
  
  socket.on('disconnect', function(e){
    if(socket.room){
      socket.leave(socket.room);
      if (rooms[socket.room].socket_ids != undefined && rooms[socket.room].socket_ids[socket.nickname] != undefined)
        delete rooms[socket.room].socket_ids[socket.nickname];
        console.log(rooms);
        if(Object.keys(rooms[socket.room].socket_ids).length === 0){
          delete rooms[socket.room];
        }else{
          io.sockets.in(socket.room).emit('userlist', {users: Object.keys(rooms[socket.room].socket_ids)});
        }
        io.sockets.emit('roomlist', Object.keys(rooms));
    }
  })
  
});