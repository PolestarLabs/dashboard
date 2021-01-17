// const DB = require('../database')
const express = require('express')

const router = express.Router()
const axios = require('axios');
const cfg = require('../../config.js')
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

  let webhookUrl = 'https://discord.com/api/webhooks/789665054081417287/UcKjPPvBpEpU7UO4DrpSnGY4JsvVw6WeAFnH0y8Z0gkyXQB6AnTanCr2CbyiEZjU8KDM?wait=true'
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

const AsanaUser = async id => {
  let res = await axios.get(`https://app.asana.com/api/1.0/users/${id}`,{headers: {Authorization:`Bearer ${cfg.asana}`}});
  let preuser = res.data.data;
  let user = {
    name: preuser.name,
    avatar: preuser.photo["image_36x36"]
  }
  return user;
}
const AsanaStory = async id => ((await axios.get(`https://app.asana.com/api/1.0/tasks/${id}/stories`,{headers: {Authorization:`Bearer ${cfg.asana}`}}))?.data?.data);
const AsanaTask = async id => {
  let res = await axios.get(`https://app.asana.com/api/1.0/tasks/${id}`,{headers: {Authorization:`Bearer ${cfg.asana}`}}).catch(err=>null);
  if (!res) return null;
  let pretask = res.data.data;
  let task = {
    name: pretask.name,
    completed: pretask.completed,
    link: pretask.permalink_url,
    notes: pretask.notes,
    assignee: pretask.assignee,
    parent: pretask.parent,
    workspace: pretask.workspace,
    tags: pretask.tags,
    memberships: pretask.memberships,
    stories: await AsanaStory(id)
  }
  return task;
}
let sendingNotes = false;
router.post('/asana', async  (req,res) =>{

  console.log( JSON.stringify(req.body,0,2))
//console.log( await AsanaUser(req.body?.events[0]?.user?.gid) )

  if(req.headers["x-hook-secret"]){
    res.setHeader("X-Hook-Secret",req.headers["x-hook-secret"]);
  }

  req.body?.events?.forEach( async ev=>{
    if(!ev.user.gid) return console.log({ev},"NO USER");

    let description = "";
    let author;
    let fields = []
    let color = 0xff6978;
    let image;
    
    let user = await AsanaUser(ev.user.gid);
    let thumbnail = {url: user.avatar}

    if(ev.resource.resource_type == "task" || ev.resource.resource_type == "story" ||  ev.resource.resource_type == "attachment" ){

      let task = ev.resource.resource_type == "task" ? await AsanaTask(ev.resource.gid) : await AsanaTask(ev.parent.gid);
      if (!task) return;
      let footer = task.assignee ? {
        text: task.assignee.name + " is assigned to this Task",
        icon_url: (await AsanaUser(task.assignee.gid))?.avatar
      } : {
        text: "This Task has not been assigned to a specific person"
      }

      if(ev.action == 'changed'){

        
        if(ev.change.field == "completed" && task.completed == true){ 
          description = `✅ **${user.name}** marked the task  [**${task.name}**](${task.link}) as **COMPLETE** `  
          color = 0x27dd86
        }
        if(ev.change.field == "completed" && task.completed == false){
          description = `❎ **${user.name}** has **reverted completion** for the task [**${task.name}**](${task.link}).`  
          }
          if(task.parent){
            fields.push({name:"Parent",value:task.parent.name})
        }
        if(ev.change.field == "assignee"){
          description = `**${user.name}** has assigned the task [**${task.name}**](${task.link}) to **${task.assignee?.name || "nobody"}**.`
        }
        if(ev.change.field == "notes"){
          if(sendingNotes) return;
          sendingNotes = true;
          setTimeout(() => {
            sendingNotes = false;
          }, 120e3);
          
          description = `
          **${user.name}** has **updated** the task [**${task.name}**](${task.link}).
          *Description:*
          \`\`\`
${task.notes.replace(/\n\n/,"\n") || "[Description Removed]"}
          \`\`\`
          
          `
        }
        if(ev.change.field == "tags"){
          return;
          description = `
          **${user.name}** has **updated** the task [**${task.name}**](${task.link}).
          *Tags:*
          \`\`\`
${task.tags?.map(t=> ` \`[🏷️${t.name}]\` `).join('') || "[Tags Removed]"}
          \`\`\`
          
          `
        }
      }
      if(ev.action == 'added'){
        if(ev.resource.resource_type == "attachment"){
          //console.log("ATTACH".blue)
          //console.log( ev )
          //console.log( "-----------".gray )
          
          let attachment = ((await axios.get(`https://app.asana.com/api/1.0/attachments/${ev.resource.gid}`,{headers: {Authorization:`Bearer ${cfg.asana}`}}))?.data?.data);
          if (!attachment) return console.log ({attachment});
          let parentTask = await AsanaTask(attachment.parent.gid);
          description = `**${user.name}** added an attachment to the task [**${task.name}**](${parentTask.link}).
          📎 [${attachment.name}](${attachment.permanent_url})
          `
          image = {url: attachment.view_url + attachment.name.split('.').pop() };
          footer = {};

        }
        else if(ev.resource.resource_type == "story"){      
          
          let story = task.stories?.find(s=>s.gid === ev.resource.gid);
          if (!story) return console.log({story});
          if (['assigned','unassigned','marked_complete','attachment_added','removed_from_tag','added_to_task'].includes(story.resource_subtype)) return;
          author = {
            name: user.name + ` @ 📇 ${task.name}`,
            icon_url: user.avatar,
            url: task.link
          }
          thumbnail = {};
          color= story.type=='system' ? 0xb3c3c7 : 0x48dafd;
          if(story.text.length) description = `${story.type=='system'? '⚙️':'💬'} - ${story.text}`;
          footer = {};
          
        }
        else if( ev.parent.resource_type == "project" || ev.parent.resource_type == "task" && task.tags && task.description && ev.resource.resource_type != "attachment" ){
          description = `**${user.name}** has created the task [**${task.name || "UNTITLED TASK"}**](${task.link}).`
          
          
          if(task.parent) fields.push({name:"Parent",value:`[**${task.parent.name}**](https://app.asana.com/0/${task.workspace.gid}/${task.parent.gid})`});        
          if(task.tags.length) fields.push({name:"Tags",value:  `${task.tags?.map(t=> ` \`[🏷️${t.name}]\` `).join('') || "[No Tags]"}` });
          if(task.notes) fields.push({name:"Description", value: `${task.notes}` , inline:false});
        }
      }
      
      let embed = {author,description,fields,color,thumbnail,footer,image};
      if (description.length){      
        
        if(req.query.type?.includes("dev")){

          //console.log("TASK".green + " | " + "DEV".blue)
          //console.log( task.name , req.query)
          //if( !task.memberships.some(t=>t.project.name.includes("Dev")) ) return;
          sendWebhook({
            avatar_url: "https://cdn3.iconfinder.com/data/icons/popular-services-brands-vol-2/512/asana-512.png",
            username: "ASANA DEV",
            embeds: [embed]
            }, "https://discord.com/api/webhooks/789636259713646633/1-AMyV1XYv7FIHLAQCLftAf-jGaea7n6jPSJ8AoFHl8FrIziqzMP_Ni8xUvE4EgFTlCi?wait=true"
            )
        }
        if(req.query.type?.includes("art")){
          //if( !task.memberships.some(t=>t.project.name.includes("Art")) ) return;
          sendWebhook({
            avatar_url: "https://cdn3.iconfinder.com/data/icons/popular-services-brands-vol-2/512/asana-512.png",
            username: "ASANA ART",
            embeds: [embed]
          }, "https://discord.com/api/webhooks/789626182722650153/vfe3UisVaH72hWRcAOtlB1O0Ka7ufiHzJan4XlBt04_WmUHtZBvIufwipGbreq77yy6I?wait=true"
          )
        }
        if(req.query.type?.includes("housekeep")){          
          sendWebhook({
            avatar_url: "https://cdn3.iconfinder.com/data/icons/popular-services-brands-vol-2/512/asana-512.png",
            username: "ASANA KEEPER",
            embeds: [embed]
          }, "https://discord.com/api/webhooks/789638561157873735/EsPFmMyCtRnswzJgoZYYKxrQV4TYswF0GUn5L2KRtCL27MqQa75n8FSLD61ynau65RRn?wait=true"
          )
        }
      }
      
     
    }

  })



  return res.sendStatus(200);
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

    
     xxx=`**${p.user_name}** (\`@${p.user_username}\`) pushed to **[${p.project.name}](${p.project.web_url})** \`/${p.ref.split('/').pop() }\``
  p.user_avatar
  

  if(p.ref.includes("live")){
    (require('child_process'))exec(`git reset --hard origin/live`, {cwd:  process.cwd() });
  }
  if(p.ref.includes("master") && p.project.name === 'Pollux'){
    (require('child_process'))exec(`git reset --hard origin/master`, {cwd: "/home/pollux/polaris/LIVE/beta" });
  }
 
  descrip =( p.commits.map(c=>
    `**\`${c.id.slice(0,8)}\`** [${c.title}](${c.url})`
  ).join('\n')).slice(0,1700)
 
 
  

  
  
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
console.log(p.project)
console.log(p.project.avatar_url)

 if(descrip.length < 5) return res.send(400);

let embed =   {
  title,fields,
  color:0xfc6d26 ,
  description: descrip,
  timestamp: new Date(),
   thumbnail: {url: p.project.avatar_url },
   footer:{text:'Gitlab',icon_url:"https://gitlab.com/assets/favicon-7901bd695fb93edb07975966062049829afb56cf11511236e61bcf425070e36e.png"}
  }

  console.log(embed)

  const payload = {
    avatar_url: p.user_avatar ||p.user.avatar_url,
    username: (p.user_username || p.user.username) + " @ Gitlab",
    content:xxx,
    embeds:[embed]
  }

  sendWebhook(payload, "https://discord.com/api/webhooks/715119311559065671/qro-0ekHSuz-m3q_VBAfCL_oE4n6O0CIJG8PT4Tz04kr2cgn5EN0DDVfhB0Jvcm4KvMi?wait=true")
  sendWebhook(payload, "https://discord.com/api/webhooks/793902216099659837/3zp10RNA1L-mo4jo-RDgx2PFPBhmNx7k0f8fnNCsYe5vqYxuCVfYHXJcQcoqmFWKAz5O?wait=true")
  sendWebhook(payload, "https://discord.com/api/webhooks/800139137327693835/y7o49TkOaMprpjK2sDU_ybFTtbd9eUxnc3X1Ry59qNHIP6Ox4nhOicxw67wB8E_eYhjU?wait=true")

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
    console.log("WebHook'd".green)
    console.log(JSON.stringify(data,0,2))
  })
}

module.exports = router



