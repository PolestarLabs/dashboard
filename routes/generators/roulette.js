const express = require('express');
const router = express.Router();
const Picto = require('../../../bot/core/utilities/Picto');

const staticAssets = {}
staticAssets.load = Promise.all([
    Picto.getCanvas('https://cdn.discordapp.com/attachments/488142183216709653/719962883525574706/unknown.png'),
    Picto.getCanvas('https://cdn.discordapp.com/attachments/488142183216709653/719963379099369512/rubineCHIP.png'),
    Picto.getCanvas(HOST + '/build/games/roulette/pin.png'),
]).then(res=>{
    let [table,chip,pin] = res;
    Object.assign(staticAssets, {table, chip, pin, loaded:true});
    delete staticAssets.load
})
 
router.get('/', async (req,res)=>{
    console.log('234')
    const canvas = Picto.new(800, 600);
    const ctx = canvas.getContext('2d');

    const payload = req.query.data

    if(!staticAssets.loaded) await staticAssets.load;

    const {table, chip, pin } = staticAssets;

    const betTypes = ["straight", "split", "street", "square", "basket", "dstreet", "dozen", "column", "snake", "manque", "passe", "colour", "parity"];

    let USERS = await Promise.all(payload.split(',').map(async U => {
        return {
            id: U.split('_')[0]
            , avatar: await Picto.getCanvas(`https://cdn.discordapp.com/avatars/${U.split('_')[0]}/${U.split('_')[1]}.png?size=64`)
            , bets: U.slice(U.indexOf(' ') + 1).split(' ').map(b => {
                let meta = b.split('-')[0];
                console.log({ b })
                return {
                    amt: parseInt(b.split('-')[1], 16)
                    , type: betTypes[parseInt(meta[0], 16)]
                    , offset: parseInt(meta[1])
                    , number: parseInt(meta[2], 36)
                }
            })
        }
    }));


    console.log({ USERS })
    console.log(USERS[0].bets)

    const baselineGridX = i => 192 + (46 * ~~(i.number / 3));
    const baselineGridY = i => 398 - (62 * (((i.number) % 3 || 3) - 1));
    const typeCoords = {
        dozen: {
            x: _ => 750,
            y: i => 276 + i.offset * 62
        },
        column: {
            x: i => i.offset == 1 ? 490 : 351,
            y: _ => 490
        },
        manque: {
            x: _ => 384,
            y: _ => 220
        },
        passe: {
            x: _ => 573,
            y: _ => 220
        },
        colour: {
            x: i => 192 + (i.offset == 1 ? 189 : i.offset == 2 ? 389 : 589),
            y: _ => 500
        },
        parity: {
            x: i => i.offset == 1 ? 281 : 700,
            y: _ => 500
        },
        straight: {
            x: i => i.offset ? 139 : baselineGridX(i),
            y: i => i.offset == '2' ? 307 : i.offset == '1' ? 307 + 62 : baselineGridY(i)
        },
        square: {
            x: i => baselineGridX(i) + 23,
            y: i => baselineGridY(i) - 31
        },
        split: {
            x: i => baselineGridX(i) + (i.offset == 2 ? 23 : 0),
            y: i => baselineGridY(i) - (i.offset == 1 ? 31 : 0),
        },
        street: {
            x: i => baselineGridX(i),
            y: _ => 430
        },
        basket: {
            x: _ => 169,
            y: _ => 334
        },
        snake: {
            x: _ => 112,
            y: _ => 470
        }
    }

    ctx.drawImage(table, 0, 0);
    ctx.shadowColor = "#112"
    USERS.forEach((player,i) => {

        let totalBet = 0;

        player.bets.forEach((bet) => {

            let { x, y } = typeCoords[bet.type];

            let dx = x(bet)
            let dy = y(bet)

            ctx.shadowBlur = 5
            ctx.drawImage(chip, dx - 20, dy - 20, 40, 40);
            totalBet+= bet.amt

        })
        let xpos = 300+ i % 3 * (225  + 8);
        let ypos = 300+ ~~(i/3) * (100 + 8);


         
            Picto.setAndDraw(ctx,
                Picto.tag(ctx, miliarize(totalBet, 0), '600 20px "AvenirNextRoundedW01-Bold" ', '#FFF'),
                xpos, ypos  , 128, 'center'
            )
         

    })
    
    canvas.pngStream().pipe(res);
})

module.exports = router