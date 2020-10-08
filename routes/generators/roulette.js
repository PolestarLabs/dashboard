const express = require('express');
const router = express.Router();
const Picto = require('../../../bot/core/utilities/Picto');

const staticAssets = {}
staticAssets.load = Promise.all([
    Picto.getCanvas(HOST + '/build/games/roulette/board.png'),
    Picto.getCanvas(HOST + '/build/games/roulette/rubineCHIP.png'),
    Picto.getCanvas(HOST + '/build/games/roulette/pin.png'),
]).then(res=>{
    let [table,chip,pin] = res;
    Object.assign(staticAssets, {table, chip, pin, loaded:true});
    delete staticAssets.load
})
 
router.get('/', async (req,res)=>{
    console.log('2343')
    const canvas = Picto.new(800, 600);
    const ctx = canvas.getContext('2d');

    const payload = req.query.data 

    if(!staticAssets.loaded) await staticAssets.load;

    const {table, chip, pin } = staticAssets;

    const betTypes = ["straight", "split", "street", "square", "basket", "dstreet", "dozen", "column", "snake", "manque", "passe", "colour", "parity"];

    let USERS = payload ? await Promise.all(payload.split(',').map(async U => {
        let avatar
        try {
            avatar = await Picto.getCanvas(`https://cdn.discordapp.com/avatars/${U.split('_')[0]}/${U.split('_')[1]}.png?size=64`);
        } catch (err) {
            avatar = await Picto.getCanvas(`https://cdn.discordapp.com/embed/avatars/4.png`);
        }
        return {
            id: U.split('_')[0]
            , avatar
            , bets: U.slice(U.indexOf(' ') + 1).split(' ').map(b => {
                let meta = b.split('-')[0];
                console.log({ b })
                return {
                    amt: parseInt(b.split('-')[1], 16)
                    , type: betTypes[parseInt(meta[0], 16)]
                    , offset: parseInt(meta[1])
                    , number: parseInt(meta[2], 36)+1
                }
            })
        }
    })) : [];




    const baselineGridX = i => 192 + (46 * ~~(i.number / 3.1));
    const baselineGridY = i => 405 - (62 * (((i.number) % 3 || 3) - 1));
    const typeCoords = {
        column: {
            x: _ => 750,
            y: i => 280 + (i.offset-1) * 62
        },
        dozen: {
            x: i => 050 + i.offset * 200,
            y: _ => 464
        },
        manque: {
            x: _ => 380,
            y: _ => 229
        },
        passe: {
            x: _ => 568,
            y: _ => 229
        },
        colour: {
            x: i => i.offset == 1 ? 389 : i.offset == 2 ? 539 : 539,
            y: _ => 509
        },
        parity: {
            x: i => i.offset == 1 ? 281 : 700,
            y: _ => 509
        },
        straight: {
            x: i => i.offset ? 137 : baselineGridX(i),
            y: i => i.offset == '2' ? 317 : i.offset == '1' ? 317 + 62 : baselineGridY(i)
        },
        square: {
            x: i => baselineGridX(i) + 23,
            y: i => baselineGridY(i) - 31
        },
        split: {
            x: i => baselineGridX(i) + (i.offset == 1 ? 23 : 0),
            y: i => baselineGridY(i) - (i.offset == 2 ? 31 : 0),
        },
        street: {
            x: i => baselineGridX(i),
            y: _ => 439
        },
        dstreet: {
            x: i => baselineGridX(i)+23,
            y: _ => 260
        },
        basket: {
            x: _ => 169,
            y: _ => 345
        },
        snake: {
            x: _ => 112,
            y: _ => 479
        }
    }

    let betsPlaced = []
    ctx.drawImage(table, 0, 0);
    ctx.shadowColor = "#1125"
    const userColors = ["ff2937","00a8db","02e857","f5c105","ff7f06","690ae6","ff319f","2127d5","9cff22","1f1f23"]


    USERS.forEach((player,i) => {

        console.log(player.bets)

        let totalBet = 0;
        player.color = "#"+userColors[i]

        player.bets.forEach((bet) => {

            betsPlaced.push(bet.type+bet.number+bet.offset);
            

            let { x, y } = typeCoords[bet.type];

            let dx = x(bet)
            let dy = y(bet)

            let rpt =  betsPlaced.filter(b=>b==bet.type+bet.number+bet.offset).length-1;
            
            let od = -400+dx
            let ddx = (rpt*(od/100))
            let ddy =  -rpt*5          

            ctx.shadowBlur = -ddx
            ctx.drawImage(chip, dx - 20+ddx, dy - 20+ddy, 40, 40);
            ctx.globalCompositeOperation = 'color'
            ctx.strokeStyle  = player.color
            ctx.lineWidth = 6
            ctx.beginPath();
            ctx.arc(dx+ddx, dy+ddy, 16, 0, 2 * Math.PI);
            ctx.stroke()
            ctx.globalCompositeOperation = 'source-over'

            totalBet+= bet.amt

        })
        let xpos = 280+ i % 4 * (120  + 8);
        let ypos = 20+ ~~(i/4) * (60 + 8);

        if(i<8){
            ctx.strokeStyle  = player.color
            ctx.fillStyle  = player.color+"35"
            ctx.beginPath();
            ctx.arc(xpos+20, ypos+20, 25, 0, 2 * Math.PI);
            ctx.fill()
            ctx.save();
            ctx.beginPath();
            ctx.arc(xpos+20, ypos+20, 20, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(player.avatar, xpos, ypos, 40, 40);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(xpos+20, ypos+20, 25, 0, 2 * Math.PI);
            ctx.lineWidth = 3
            ctx.stroke()
            Picto.setAndDraw(ctx,
                Picto.tag(ctx, miliarize(totalBet, 0)+' ', '600 20px "AvenirNextRoundedW01-Bold" ', '#FFF'),
                xpos + 55, ypos  , 128, 'left'
            )         
            Picto.setAndDraw(ctx,
                Picto.tag(ctx, 'TOTAL ', '600 12px "AvenirNextRoundedW01-Regular" ', '#FFFA'),
                xpos + 55, ypos  +20, 128, 'left'
            )         

            ctx.drawImage(chip, xpos-10, ypos+25, 20, 20);
            ctx.globalCompositeOperation = 'color'
            ctx.strokeStyle  = player.color
            ctx.lineWidth = 6
            ctx.beginPath();
            ctx.arc(xpos, ypos+35, 8, 0, 2 * Math.PI);
            ctx.stroke()
            ctx.globalCompositeOperation = 'source-over'
        }

    })
    


    if(req.query.h){
        const {h} = req.query
        let { x, y } = typeCoords.straight;
        let posX = x({number:h,offset: h == "0" ? 1 : h == "00" ? 2 : 0})
        let posY = y({number:h,offset: h == "0" ? 1 : h == "00" ? 2 : 0})

        let overlay = Picto.new(800,600);
        let c = overlay.getContext('2d');
        
        let grad = c.createLinearGradient(0,0,0,600)
        grad.addColorStop(0,"#0005")
        grad.addColorStop(1,"#000A")

        c.fillStyle = grad;


        c.fillRect(0,0,800,600);
        c.fillStyle = "#FFF";
        c.arc(posX,posY+5, 50, 0, 2 * Math.PI);

        c.fill()

        ctx.globalCompositeOperation  = "multiply"
        ctx.drawImage(overlay,0,0)

       
        
    }        

    canvas.pngStream().pipe(res);
})

module.exports = router