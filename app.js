require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const connectDB = require('./config/connection')
const {check, validationResult} = require('express-validator')
const session  = require('express-session')
const morgan = require('morgan')
const swal = require('sweetalert')
const flash = require('connect-flash');
const multer = require('multer')




var indexRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(expressLayouts)
// app.set('layout','./layouts/layouts')

app.use(express.urlencoded({extended:false}))

//connectio=ng database
connectDB()


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//initializing session
app.use(
  session({
    secret:"key",
    cookie:{maxAge:600000},
    saveUninitialized:false,
    resave:false
  })
)
//inintializing flash middleware
app.use(flash());
app.use((req,res,next)=>{
  res.locals.message = req.session.message;
  delete req.session.message
  next()
})


app.use('/admin', indexRouter);
app.use('/', usersRouter);


// app.use((req,res,next)=>{
//   if(req.session.user && req.cookies.key){
//       res.redirect('/')
//   }
// })


//-------------------/>
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
