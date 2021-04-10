const Express = require('express');
const path = require('path');

const app = Express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    next();
});

const ASSETS_PATH = process.env.ASSETS_PATH || "/home/pollux/polaris/ASSETS/";

app.use(Express.static(path.join(__dirname, './public')));
app.use(Express.static(path.join( ASSETS_PATH, './imgres')));
app.use(Express.static(path.join( ASSETS_PATH, './cosmetics')));
app.use("/images", Express.static(path.join(__dirname, './public/images')));
app.use("/images", Express.static(path.join( ASSETS_PATH, './website')));
app.use("/flairs",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));
app.use("/medals",    Express.static(path.join( ASSETS_PATH, './cosmetics/medals')));
app.use("/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/items",    Express.static(path.join( ASSETS_PATH, './build/items')));
app.use("/boosters",  Express.static(path.join( ASSETS_PATH, './build/boosters')));
app.use("/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build",     Express.static(path.join( ASSETS_PATH, './build')));
//backwards compat
app.use("/build/backdrops", Express.static(path.join( ASSETS_PATH, './cosmetics/backdrops')));
app.use("/build/stickers",  Express.static(path.join( ASSETS_PATH, './cosmetics/stickers')));
app.use("/build/flairs/top",    Express.static(path.join( ASSETS_PATH, './cosmetics/flairs')));
 
// CATCH 404
app.use(function (req, res, next) {
  if(req.handled) return; 
  if (res.headersSent) return next(err);
  res.status(404).send('404'); 
});

// ERROR HANDLER
app.use(async function (err, req, res, next) {
    console.error(err);
    res.status(500).send('500'); 
})

process.on('unhandledRejection', function (reason, p) {
  console.error("Possibly Unhandled Rejection at: Promise \n".red, p, "\n\n reason: ".red, reason);
  process.exit(1)
});
process.on('uncaughtException', function (err) {
  console.error(err)
  process.exit(1)
});


app.listen(4727, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:4727/')
})

