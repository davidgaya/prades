var koa = require('koa');
var app = module.exports = koa();

app.use(function *(){
  this.body = 'Hey!';
});

if (!module.parent) app.listen(3000);
