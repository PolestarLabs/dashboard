function NameSplitter(name, end) {
  const slice = Math[end ? "floor" : "ceil"](name.split(/ +/)[0].length / 2);
  return name.split(/ +/)[0].slice(end ? slice : 0, end ? undefined : slice);
}


module.exports = {
    name: "ship",
    beta: true,
    description: "💗 A fancy Love Calculator for two people!",
    options: [
      {
        type: 6,
        name: "lovey",
        description: "💜 The first person for the match",
        required: true,
      },
      {
        type: 6,
        name: "dovey",
        description: "💛 The second person for match",
        required: true,
      }
    ],
    exec: async function exec(req,params){
      console.log(JSON.stringify(params,0,2))
      
      const TargetA = await PLX.getRESTUser(params.data.options[0].value);
      const TargetB = await PLX.getRESTUser(params.data.options[1].value);
      const serverData = await DB.servers.get(params.guild_id);

      const LANG = serverData.modules.LANGUAGE || 'en';
      
      let reject;
      if (!(TargetA && TargetB)) reject = $t("responses.ship.needTupipo", { lngs: [LANG,'en', 'dev' ] });
      if (TargetA.id === TargetB.id) reject = $t("responses.ship.need2diffpipo", { lngs: [LANG,'en', 'dev'] });

      const SHIPNAME = NameSplitter(TargetA.username) + NameSplitter(TargetB.username, true);
      const rand = randomize(0, 100);
      let response;
      if (rand === 69) response = "Nice.";
      else if (rand === 24 && ["pt", "pt-BR"].includes( LANG )) response = "Mas afinal qual dos dois vem de quatro?";
      else response = $t(`responses.ship.quotes.${Math.floor(rand / 10)}.${randomize(0, 1)}`, { lngs: [LANG,'en','dev'] });

      return {
        type: 4,
        data: {
            content: reject ,
            embeds:reject?[]:[
              {
                description: `**${response}**`,
                image: {url: `${HOST}/generators/ship.png?av1=${TargetA.id}::${TargetA.avatar}&av2=${TargetB.id}::${TargetB.avatar}&spn=${SHIPNAME}&pct=${rand}`  }
              }
            ]
          }
        };
  }
  }
  