const createError = require('http-errors');
const express = require('express');
const fs = require('fs')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const usersRouter = require('./routes/users');
const commentRouter = require("./routes/comment")
const {MONGO_CONFIG} = require("./config/db") //数据库的配置信息
const mongoose = require("mongoose")
// const rule = require("./model/rule")
const itemRule = require("./model/itemRule")
const item = require("./model/item")
const itemGuide = require("./model/itemGuide")
mongoose.connect(MONGO_CONFIG.url);
const app = express();

// ------------------测试rule的添加-----------------------
// rule.create({
//   rule_id:"1",
//   rule_name:"个人业务/社会保险/社保卡遗失补办"
// })
// itemRule.create({
//   content:"个人业务办理请前往scut",
//   rule_id:"1"
// })
// item.create({
//   item_id:"430425200107050375X51564654",
//   item_guide_id:"1",
//   item_rule_id:"1632799167009"
// })
// itemGuide.create({
//   item_guide_id:"11440117007517547R4442111820008",
//   item_guide_name:"高校毕业生到基层就业补贴",
//   item_guide_content:"每人3000元给予一次补贴",
//   item_id:"430425200107050375X51564654"
// })

//------------------------------------------------------








// 动态网页的模板设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// 日志的设置使用
app.use(logger('dev'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), { flags: 'a' });
app.use(logger('combined', {
  stream: accessLogStream
}));
// post请求的参数的获取, express会将解析之后, 转换成对象的post请求参数放到请求对象的body属性中
app.use(express.json());// 告诉express能够解析 application/json类型的请求参数
app.use(express.urlencoded({ extended: false }));// 告诉express能够解析 表单类型的请求参数 application/x-www-form-urlencoded
//使用cookieParser将cookie转换成为对象，以便更好的使用
app.use(cookieParser());
// 处理静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 处理路由
app.use('/api', usersRouter);
app.use('/api',commentRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // 错误根据生产环境进行一个配置
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
