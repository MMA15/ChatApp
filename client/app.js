var socket = io(); /*This is saying that socket is now a reference to the Socket.IO library.*/
$('#history').hide();
$('.messagearea').hide();

$('.userform').submit(function(e) {
	e.preventDefault();
	var username = $('#user').val();
	socket.emit('login', username, function(usernames) {
		if (usernames){
			$('.userform').fadeOut();
			$('#history').show();
			$('.messagearea').show();
			socket.user = username;
		}else{
			$('p').html("User already exists. Try again."); //not showing up now, double (olduser msg plus newuser msg on old user screen) thing still happening
		}
	});
	return false;
});

$('.messagearea').submit(function(e){
	e.preventDefault();
	var text = $('#message').val();
	socket.emit('message', socket.user + ' says: '+ text);/*The code above says to emit the textual message to the server instead of performing our temporary alert behaviour.*/
	$('#message').val(''); /* The second line in the code simply clears the input so that another message can be typed by the same user.*/	
	return false;
});

socket.on('message', function(msg){
	$('<li>').text(msg).appendTo('#history');
	$('#history').animate({scrollTop: $('#history').prop("scrollHeight")}, 500);

});

socket.on('user left', function(number_of_ppl){
	$('<li>').text("Someone left. There is " + number_of_ppl + " user(s) in the chat.").appendTo('#history');
	$('#history').animate({scrollTop: $('#history').prop("scrollHeight")}, 500);

});