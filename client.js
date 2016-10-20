    var socket = io('https://textchat-karchev.c9users.io:8082');
    
    var current_nickname;
    
    // 페이지 로딩과 동시에 방 목록을 가져옴
    $(document).ready(function(){
      socket.emit('get_roomlist');
    })
    
    // 방목록을 갱신하는 이벤트
    socket.on('roomlist', function(e){
      // roomlist array
      var roomlist = e;
      
      console.log("roomlist : " + roomlist);
      
      $('.roomlist').html('');
      
      // append roomlist
      $.each(roomlist, function( index, value ) {
        console.log(value);
        $('.roomlist').append("<a href=" + "javascript:join_room('" + value + "')" + ">" + value +"</a><br/>");
        // $('.roomlist').append("<a href='#' onclick=''"join_room()+ "'' value='" + value + "'>" + value + "</a><br/>");
      }); 
      
    })
    
    socket.on('broadcast_message_recieve', function(e){
      
      console.log(e.nickname);
      console.log(e.message);
      
      $('#commentarea').append(e.nickname + " : " + e.message);
      $('#commentarea').append("\n");
      
    })
    
    socket.on('userlist', function(e){
      var users = e.users;
      console.log(users);
      console.log(users.length);
      
      $('.userlist').html('');
        
      for(var i=0; i<e.users.length; i++){
        $('.userlist').append("<a class='list-group-item'>" + users[i] + "</a>");
      }
    })
    
    socket.emit('leave_room', function(e){
      
    })
    
    // 방을 생성하는 이벤트
    var create_room = function(){
      // validate
      if($('#nickname_input').val() && $('#roomname_input').val()){
        // input field check
        console.log("send nickname : " + $('#nickname_input').val());
        console.log("send roomname : " + $('#roomname_input').val());
        
        var nickname = $('#nickname_input').val();
        var roomname = $('#roomname_input').val();
        // create room emit
        socket.emit('create_room', { 'nickname' : nickname, 'roomname' : roomname });
        
        join_room(roomname);
      
      }else{
        // if : empty field
        alert("you must input nickname & roomname");
        return false;
      }
    }
    
    var join_room = function(room){
      
      current_nickname = $('#nickname_input').val();
      
      socket.emit('join', {'room' : room, 'nickname' : current_nickname });
      
      socket.on('join', function(e){
        
        if(e.data != 'denial'){
          
          $('.roomlist-wrapper').css('display', 'none');
          $('.chatpage-wrapper').css('display', 'block');
          
          $('#roomtitle').html(room);
      
          $('.chatinput').keypress(function(e) {
            var code = e.keyCode;
          	if (code == 13) {
          		send_message();
          		$('#commentarea').append(current_nickname + " : " + $('.chatinput').val())
          		$('#commentarea').append("\n")
          		$('.chatinput').val('');
        	  }
          })
        }else{
          alert('in room, already your nickname');
        }
        
      })
    }
    
    var send_message = function(){
      var message = $('.chatinput').val();
      socket.emit('send_message', { 'nickname' : current_nickname, 'message' : message });
    }
    

    