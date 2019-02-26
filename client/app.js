var socket = io(); /*This is saying that socket is now a reference to the Socket.IO library.*/
$('.login').hide();
$('.userform').hide();
$('#history').hide();
$('.messagearea').hide();
$('.back').hide();

$('.signup').submit(function(e){
	e.preventDefault();
	var email = $('#email').val();
	var password = $('#password').val();
	socket.emit('Signup', email, password, function(valid){
		if (valid){
			$('.signup').fadeOut();
			$('.account').fadeOut();
			$('.userform').show();
		}
		else{
			socket.on('signup error', function(signup_error_msg){
				$('#signup_error').html(signup_error_msg + "Please confirm.");
			});
		}
	});
});

$('.account').click(function(e) {
	e.preventDefault();
	$('.account').fadeOut();
	$('.signup').fadeOut();
	$('.login').show();
	$('.back').show();
});

$('.login').submit(function(e){
	e.preventDefault();
	var email = $('#exist_email').val();
	var password = $('#real_password').val();
	socket.emit('login user', email, password, function(valid){
		if (valid){
			//if login is valid go to messagearea
			socket.on('accept', function(results){
				socket.user = results;
				$('.login').fadeOut();
				$('.back').fadeOut();
				$('#history').show();
				$('.messagearea').show();
			});

		}
		else{
			socket.on('error', function(error_msg){
				$('#error').html(error_msg + "Please confirm or proceed to sign up page.");
			});
		}
	});
});

$('.userform').submit(function(e) {
	e.preventDefault();
	var username = $('#user').val();
	socket.emit('create user', username, function(valid) {
		if (valid){
			$('.userform').fadeOut();
			$('.back').fadeOut();
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

socket.on('user left', function(user_left){
	$('<li>').text(user_left + " left the chat.").appendTo('#history');
	$('#history').animate({scrollTop: $('#history').prop("scrollHeight")}, 500);

});

$('.back').click(function(e){
	e.preventDefault();
	$('.login').fadeOut();
	$('.back').fadeOut();
	$('.account').show();
	$('.signup').show();

});