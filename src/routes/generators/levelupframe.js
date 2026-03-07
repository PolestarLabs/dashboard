const Picto = require( process.env.BOT_PATH + '/core/utilities/Picto.js');
const RANGE = [...Array(31).keys()].slice(1);

const framesSheet = Picto.getCanvas(HOST + "/build/LEVELUPbrick.png");

module.exports = async function(req,res){

 
    let args = [200,200]
    const [argLv,user] = args;

    const canvas = Picto.new(800,300);
    const ctx = canvas.getContext('2d');
    
    
    const [avatar,spritesheet] = await Promise.all([
        Picto.getCanvas( req.query.avatar ||  "https://cdn.discordapp.com/avatars/354285599588483082/d58284a1f1ff096efd13b4a9f4643023.png?size=128" ),
        framesSheet
    ]);



    const userData = await DB.users.get('88120564400553984');
    
    let LV_SIZE = 42; //52
    


    function commitFrame(actualFrame){
        let frame = actualFrame > 56 ? 57*2 - actualFrame : actualFrame;
        
        if (actualFrame > 56*2) {
            ctx.fillStyle = '#00FF00'
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return ctx
        }
        
        //ctx.drawImage(avatar,15 + Math.min( (10000 / Math.pow(20+frame,2)),45) ,0,320,320);
        ctx.shadowColor = '#2b2b3b';
        ctx.shadowBlur = 5;

        if (frame < 22) LV_SIZE = 42-22+frame*2;
        if (frame == 22) LV_SIZE = 44;
        if (frame == 23) LV_SIZE = 48;
        if (frame == 24) LV_SIZE = 52;
        if (frame == 25) LV_SIZE = 60;
        if (frame == 26) LV_SIZE = 70;
        if (frame == 27) LV_SIZE = 65;
        if (frame == 28) LV_SIZE = 60;
        if (frame == 29) LV_SIZE = 55;
        if (frame == 30) LV_SIZE = 52;
        
        if (frame > 30) LV_SIZE = 52;
        
        const lvTag = Picto.tag(ctx, $t("terms.levelUp", {lngs:['en']}) , "600 30px 'Quicksand'", "#223" ).item;
        const Level = Picto.tag(ctx, argLv || userData.progression.level, "900 "+LV_SIZE+"px 'Panton Black'", "#223" ).item;
        const lvWidth = Math.min(118,Level.width);
        const lvtWidth = Math.min(150,lvTag.width);
        
        //ctx.drawImage(spritesheet, 0, -300 * Math.min(frame,29) );
        ctx.drawImage( spritesheet, -800 * (Math.min(frame,29) % 5) , -300 * ~~(Math.min(frame,29) / 5));

      

        if(frame > 20){
            //ctx.drawImage(lvTag, 590 - lvtWidth, 124, lvtWidth, lvTag.height);
        }
        if (frame > 22){
           // ctx.drawImage(Level, 660 - lvWidth / 2, (105+20) - (LV_SIZE/3) , lvWidth, Level.height);
        }

        return ctx
    };
  
    
    commitFrame(Number(req.query.f));
    
    res.status(200).header('Content-Type','image/png').send( await canvas.png );

}
