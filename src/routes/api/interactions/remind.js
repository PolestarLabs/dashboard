

module.exports = {
name: "remind",
description: "Reminders",
beta: true,
options: [

    {
        name: "reminder",
        description: "What to remind",
        type: 3,
        required: true,
        
    },

    {
        name: "days",
        description: "days",
        type: 4,
        
    },
    {
        name: "hours",
        description: "hours",
        type: 4,
        
    },
    {
        name: "minutes",
        description: "minutes",
        type: 4,
        
    },
    {
        name: "channel",
        description: "channel",
        type: 7,
        
    },
    
],
exec: async function exec(req,params){
    //const Author = params.data.user
    //await DB.feed.new({
    //    url: msg.author.id, type: "reminder", name: preInput || what, expires: timestamp, repeat: 0, channel: destination || "dm",
    //});
    return {
        type: 4,
        data: {
          content: "DEMO"
        }
      };
}
}
