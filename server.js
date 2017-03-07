var http = require('http');
var unirest = require('unirest');
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var hostname = process.env.IP;
var multer = require('multer');
var port = process.env.PORT;
var clarifai = require('clarifai');
var clarApp = new clarifai.App(
    'pc9zbieV89tW5ck7u08T9cedRkplfbXKMoAsA0tK',
    'fy4k15BkD98y3dOwrmdNPZh8hSivuMEMQEpeCjgV'
  );
  var accountSid = 'ACcc2091849ec8ec35d7ef59dcec21c45c'; 
var authToken = '8645c5e5638607a70f6acd2566cd7cda'; 
var client = require('twilio')(accountSid, authToken); 
  
  var storage = multer.diskStorage({
  filename: function (req, file, cb) {
      if(path.extname(file.originalname.toLowerCase())==='.jpg'||path.extname(file.originalname.toLowerCase())==='.jpeg'||path.extname(file.originalname.toLowerCase())==='.gif'||path.extname(file.originalname.toLowerCase())==='.bmp'||path.extname(file.originalname.toLowerCase())==='.png')
          {
              cb(null, file.originalname)
          }
  }
});

var upload = multer({storage})

app.use(express.static('client'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
    res.sendfile('index.html');
})

app.post('/test',function(req,res){
  console.log(req.body.message);
  res.send('hello there');
})

function clarifaiMe(imageString,callback){
  console.log('clarifaiing');
  var ingredientList=[];
  clarApp.models.predict('foodTest', {base64: imageString}).then(
  function(response) {
    console.log('no error woth carifai');
    console.log(response.outputs[0].data.concepts);
    for(var i = 0;i < response.outputs[0].data.concepts.length;i++){
      if(response.outputs[0].data.concepts[i].value>=.25){
         ingredientList.push(response.outputs[0].data.concepts[i].name);
      console.log(response.outputs[0].data.concepts[i].name);
      }
     
    }
    console.log('here?');
    callback(ingredientList);
  },
  function(err) {
    console.log('errorsss');
    console.error(err);
    callback(err);
  }
);

}


app.post('/getRecipe',function(req,res){
  
  var ingredients = req.body.ingredients;
  
  unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?fillIngredients=false&ingredients="+ingredients+"r&limitLicense=false&number=15&ranking=1")
  .header("X-Mashape-Key", "HyQC5oSqg6mshULr8QtDBoz6Zhgwp1OAEqRjsnrqsHATpQeU8Y")
  .header("Accept", "application/json")
  .end(function (result) {
  console.log(result.headers, result.body);
  res.send(result);
  });
  
});

 app.post('/upload',function(req,res){
   
    //res.status(200);
    clarifaiMe(req.body.image,function(data){ 
      
      io.sockets.emit('ingredientList',data);
       res.end();
     })
 });
 
 app.post('/temp',function(req,res){
   console.log(req.body.temp);
   io.sockets.emit('temp',req.body.temp);
   res.end();
 });
io.sockets.on('connection',function(socket){
  console.log('socket connected');
});

app.post('/print',function(req, res) {
    console.log(req.body.temp);
    res.send("got: " + req.body.temp);
})

app.post('/text',function(req,res){
    client.messages.create({ 
    to: "+13052836176", 
    from: "+15017250604", 
    body: req.body.message, 
    mediaUrl: req.body.media,  
}, function(err, message) { 
    console.log(message.sid); 
});
})

server.listen(process.env.PORT || 3000);