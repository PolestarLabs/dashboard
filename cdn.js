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

app.use(Express.static(path.join(__dirname, 'public')));
app.use(Express.static(path.join(__dirname, '../assets/imgres')));
app.use(Express.static(path.join(__dirname, '../assets/cosmetics')));
app.use("/images", Express.static(path.join(__dirname, 'public/images')));
app.use("/images", Express.static(path.join(__dirname, '../assets/website')));
app.use("/flairs",    Express.static(path.join(__dirname, '../assets/cosmetics/flairs')));
app.use("/medals",    Express.static(path.join(__dirname, '../assets/cosmetics/medals')));
app.use("/stickers",  Express.static(path.join(__dirname, '../assets/cosmetics/stickers')));
app.use("/boosters",  Express.static(path.join(__dirname, '../assets/build/boosters')));
app.use("/backdrops", Express.static(path.join(__dirname, '../assets/cosmetics/backdrops')));
app.use("/build",     Express.static(path.join(__dirname, '../assets/build')));

app.use("/build/backdrops", Express.static(path.join(__dirname, '../assets/cosmetics/backdrops')));
app.use("/build/stickers",  Express.static(path.join(__dirname, '../assets/cosmetics/stickers')));
app.use("/build/flairs/top",    Express.static(path.join(__dirname, '../assets/cosmetics/flairs')));
 
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
  console.log("Possibly Unhandled Rejection at: Promise \n".red, p, "\n\n reason: ".red, reason);
  process.exit(1)
});


app.listen(4727, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:4727/')
})

