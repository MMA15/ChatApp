/*console.log('hello from our node script!');shows this on our cmd termnial*/
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
const bcrypt = require('bcrypt');
const emailRegex = require('email-regex');

var user_log = [];

app.use('/', express.static('client'));


const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'admin',
	host: process.env.PGHOST,
	database: 'chatapp',
	password: 'guess@90xMe',
	port: process.env.PGPORT,
	//ssl: true
});


io.on('connection', function(socket){
	
	socket.on('Signup', function(email, password, callback){
		bcrypt.hash(password, 10, function(error, hash){
			if (error){
				throw error;
			}
			else{
				pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash], (error, results) =>{ 
					if (error){
						callback(false);
					}
					else{
						socket.email = email;
						callback(true);
					}
				});
			}
		});
	});

	socket.on('create user', function(username, callback){
		if (user_log.includes(username)){
			callback(false);			
		} else{
			pool.query('UPDATE users SET username = $1 WHERE email = $2', [username, socket.email], (error, results) =>{
				if (error){
					throw error;
				}
				else{
					callback(true);
					user_log.push(username);
					socket.user = username;
				}
			});
		}
	});

	socket.on('login user', function(email, password, callback){
		//check if email is in the database, then check if password is correct using bcrypt
		//then grab username
		pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) =>{
			if (error){
				callback(false);
				io.emit('error', 'E-mail does not exist. ');
			}
			else if(JSON.stringify(results.rows[0]) == undefined){
				//check if email exists or not
				callback(false);
				io.emit('error', 'E-mail does not exist. ');
			}
			else {
				//check password
				bcrypt.compare(password, results.rows[0].password, function(err, res){
					if (err){
						callback(false);
						io.emit('error', 'Password is incorrect. ');
					}
					else{
						if (res){
							callback(true);	
							io.emit('accept', results.rows[0].username);
							socket.email = results.rows[0].email;
						}
						else{
							callback(false);
							io.emit('error', 'Password is incorrect. ');
						}
					}
				});
			}
		});
	});
});

io.on('connection', function(socket){
	socket.on('message', function(msg){
		io.emit('message', msg);
	});
});

io.on('connection', function(socket){
	socket.on('disconnect', function(){
		user_log.splice(user_log.indexOf(socket.user), 1); //gets rid of one user
		io.emit('user left', user_log.length);
	});
});

server.listen(process.env.PORT || 5000, function(){
	console.log('Chat server running');
});

