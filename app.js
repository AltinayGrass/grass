var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');
const { exec } = require('child_process');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended:true}));
app.post('/post-test',(req,res)=>{
  console.log('Got-body',req.body);
  let entrywith = 
'#!/usr/bin/env python3\n'+
'from geometry_msgs.msg import Pose, Point\n'+
'from pilz_robot_programming import *\n'+
'import math\n'+
'import rospy\n'+
'\n'+
'__REQUIRED_API_VERSION__ = "1"  # API version \n'+
'__ROBOT_VELOCITY__ = 0.5        # velocity of the robot\n' +
  '\n' +
'# main program\n'+
'def start_program():\n'+
'  print(r.get_current_pose(target_link="flange",base="base_link")) # print the current position of thr robot in the terminal\n';
let complatewith = 
'\n'+
'if __name__ == "__main__":\n'+
'    # init a rosnode\n'+
"    rospy.init_node('robot_program_node')\n"+
'    # initialisation\n'+
'    r = Robot(__REQUIRED_API_VERSION__)  # instance of the robot\n'+
'    # start the main program\n'+
'    start_program()\n';

var result = req.body.code.split(/\r?\n/);

for (let index = 0; index < result.length; index++) {
  const element = result[index];
  result[index]= ' '.repeat(2)+ element;
}

prog=entrywith+result.join('\n')+complatewith;
console.log(prog); 

var script_name='/root/ws_moveit/src/pilz_tutorial/scripts/test.py';

try {
  fs.writeFileSync(script_name, prog);
  // file written successfully
  fs.chmodSync(script_name, "755");
  exec ('rosrun pilz_tutorial test.py', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`Result ${stdout}`);
  });
} catch (err) {
  console.error(err);
}

//res.sendStatus(200);
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
