// const DB = require('../database')
const express = require('express')
const router = express.Router()
const fx = require('../pipelines/globalFunctions.js');
request = require('request')

router.get('/', function (req, res) {
  res.sendStatus(401)
})


router.post('/patreon', function (req, res) {
  let payload = req.body;
  let type = req.query.t

  console.log(require('util').inspect(payload, {
    depth: 6,
    colors: true
  }))
  embed = {}
  embed.fields = []
  if (type == "new") {
    embed.title = "New Patron"
    embed.color = 0x22ff33;
  }

  if (type == "delete") {
    embed.title = "Pledge Cancelled"
    embed.color = 0xff0000;
  }


  const TIERS = {

zircon: "<:zircon:673593105525637140>"
,uranium: "<:uranium:673593105454465035>"
,plastic: "<:plastic:673593105458528266>"
,palladium: "<:palladium:673593105055875073>"
,neutrino: "<:neutrino:673593105102143495>"
,lithium: "<:lithium:673593105391288357>"
,iron: "<:iron:673593105253007381>"
,iridium: "<:iridium:673593105546477568>"
,carbon: "<:carbon:673593105458659356>"
,astatine: "<:astatine:673593105479499817>"
,antimatter: "<:antimatter:673593105429299211>"
,aluminium: "<:aluminium:673593146025967617>"

  }

  let user = payload.included[0].attributes
  let tier = payload.included[1].attributes
  let rel = payload.data.relationships
  let disRoles;
  try {
    disRoles = tier.discord_role_ids.map(x=>`<@&${x}>`).join(' ')
  } catch (err) {
    disRoles = " "
  }
  embed.description = `
    **${user.full_name}**
    ${ user.discodiscord_id ? `<@${user.discodiscord_id}> \`${user.discodiscord_id}\`` : "`NO DISCORD ID`" } 
    ${TIERS[tier?.title?.toLowerCase()] ||"N/A"} [${tier.title||"N/A"}]  $${(Number(payload.data.attributes.amount_cents)/100).toFixed(2)}
    ${disRoles}
    `
  embed.thumbnail = {
    url: user.image_url
  }
  // embed.footer = {}
  embed.timestamp = payload.data.attributes.created_at.split('+')[0]
console.log(embed)
  sendWebhook({embeds: [embed]})
  res.sendStatus(200);
})


router.post('/drift', function (req, res) {
  let payload = req.body;
  let id = payload.data.author.id
  let reqarh = {
    url: 'https://driftapi.com/contacts/' + id,
    headers: {
      'User-Agent': 'Request-Promise',
      'Authorization': 'Bearer 2eew0UF1d766chPiLlO7CMPmvlK0w6Y7',
    }
  }

  let webhookUrl = "https://discordapp.com/api/webhooks/687786088202633275/lnY7fjJ0_T8Tq1HCKGOHyRReDxlLgMxBKHY7GCOj0Lxt04Qe7Z1ovsWpWshFVFgEGkMC?wait=true"
  embed = {}
  embed.description = payload.data.body
  if (id == 1447159) {
    embed.author = {
      name: "Pollux Support "
    }
    embed.color = 0;
    sendWebhook({embeds: [embed]},webhookUrl)
    res.sendStatus(200);

  } else {
    embed.color = 6967236;

    request(reqarh, function (error, response, body) {
      if (!error) {
        data = JSON.parse(body).data
        embed.author = {
          name: data.attributes.name,
          icon_url: data.attributes.avatar_url,
          url: "https://app.drift.com/inboxes/245219/conversations/" + data.conversationId
        }
        embed.footer = {
          text: data.attributes.bio
        }
        embed.thumbnail = {}
        sendWebhook({embeds: [embed]},webhookUrl)
        res.sendStatus(200);
      }

    })
  }
})

router.get('/pubhub', function (req, res) {
  console.log("waa")
chal = req.query["hub.challenge"]
console.log({chal})
  return res.send(chal)

})
router.post('/pubhub', function (req, res) {

 // console.log( req.data, "<-data")
//  console.log( req.form, "<-form")
  //console.log( req.body)
  //console.log( JSON.stringify(req.body.rss,null,2))

  let Parser = require('rss-parser');
  let parser = new Parser();
console.log(
 // parser.parseString(req.rawBody),
 // parser. buildAtomFeed(req.rawBody)
    req.body,
    parser.xmlParser.parseString(req.rawBody),
  )
  
  return res.send(200)

})




router.post('/gitlab', function (req, res) {
  let p = req.body;
 

let xxx =""
let descrip = ""
let title = ""
let fields = []

  if(p.object_kind == 'push'){

    
     xxx=`**${p.user_name}** (\`@${p.user_username}\`) pushed to **[${p.project.name}](${p.project.web_url})**`
  p.user_avatar
  
 
  descrip =( p.commits.map(c=>
    `**\`${c.id.slice(0,8)}\`** [${c.title}](${c.url} "${c.id}")`
  ).join('\n')).slice(0,1500)
 
 
  

  
  
}else if (p.object_kind == 'merge_request'){
  console.log(p)
  
   xxx=`**${p.user.name}** (\`@${p.user.username}\`) [Merge Request](${p.object_attributes.url}) at **[${p.project.name}](${p.project.web_url})**`;

  title = `Merge \`${p.object_attributes.source_branch}\` into \`${p.object_attributes.target_branch}\``

  descrip = `
  **\`${p.object_attributes.title||"---"}\`**
  *\`\`\`
  ${p.object_attributes.description||"No description"}  \`\`\`*
  Last commit:
  **[${p.object_attributes.last_commit.title}](${p.object_attributes.last_commit.url})** \`${p.object_attributes.last_commit.id}\` 
  ---


  `
  fields = [
    (p.labels.length ?
  
     {name:"Labels",
     value:p.labels.map(x=> "`["+x.title+"]` ").join('')}
    :null),
   {name: "Can Merge?",
   inline: !0,
   value: ` ${p.object_attributes.merge_status == 'can_be_merged' ? '<:yep:339398829050953728> ' : '<:nope:339398829088571402> ' }`
  },
   {name: "Status",
   inline: !0,
   value: ` \`${p.object_attributes.state.toUpperCase()}\``
  },
  ]
}
console.log(p)

 if(descrip.length < 5) return res.send(400);
sendWebhook({
  avatar_url: p.user_avatar ||p.user.avatar_url,
  username: (p.user_username || p.user.username) + " @ Gitlab",
  content:xxx,
  embeds:[
  {
    title,fields,
    color:0xfc6d26 ,
    description: descrip,
    timestamp: new Date(),
     //thumbnail: {url: (p.user_avatar||p.user.avatar_url).replace('s=80','s=64')},
     footer:{text:'Gitlab',icon_url:"https://gitlab.com/assets/favicon-7901bd695fb93edb07975966062049829afb56cf11511236e61bcf425070e36e.png"}
    }
]
},"https://discordapp.com/api/webhooks/715119311559065671/qro-0ekHSuz-m3q_VBAfCL_oE4n6O0CIJG8PT4Tz04kr2cgn5EN0DDVfhB0Jvcm4KvMi?wait=true")


  return res.send(200);
  


  

  
})



router.get('/minecraft', function (req, res) {
  let payload = req.body;

  console.log(payload);
  sendWebhook({embeds:[
    {description: "Web Request, no Payload"}
  ]
  },"https://discordapp.com/api/webhooks/615543899787624451/O0stVwtLX1QK_4mN0rkDJyFREHA3lWxPckHCDpF5OKyFtwcwxiCTfjpZQVHzTGrlOz4C?wait=true")

  res.send(200)
  
})



router.post('/minecraft', async function (req, res) {
  let payload = req.body.body;
  try{

    await DB.globals.set({$set:{'data.mine_payload':JSON.parse(payload)}});
  }catch(e){

    await DB.globals.set({$set:{'data.mine_payload':payload}});
  }
  console.log(require('util').inspect(payload,{color:true}));
  sendWebhook({embeds:[
    {description: JSON.stringify(payload,null,2).slice(0,2000) }
  ]
  },"https://discordapp.com/api/webhooks/615543899787624451/O0stVwtLX1QK_4mN0rkDJyFREHA3lWxPckHCDpF5OKyFtwcwxiCTfjpZQVHzTGrlOz4C?wait=true")

  res.send(200)
  
})




router.post('/:any', function (req, res) {
  let payload = req.body;

  console.log(payload);
 

  res.send(200)
  
})





function sendWebhook(data,url) {
  let opts = {
    url: url||"https://discordapp.com/api/webhooks/562584850826264586/k-b4xj-PzXT9GK1taQJNcl7WagefXr43SUT9gq9RuTAdUIKmnsF0djskR-C50rdv_XPB?wait=true",
    body: data,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }
  request(opts, function (error, response, body) {
    console.log("WebHook'd")
  })
}

module.exports = router



