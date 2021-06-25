const moment = require('moment');
const config = require('../../../../config');

module.exports = {
  name: "balance",
  beta: true,
  description: "💰 Check your balance and last transactions",

  exec: async function exec(req, params) {
      try{ 
    console.log(JSON.stringify(params, 0, 2),"whats inside");

    const Target =  await PLX.getRESTUser(params.member.user.id);
    const responseEmbed = {};

    const P = { lngs: ['en','dev'] };

    const bal = $t("responses.$.balance", P);
    /*
    const put =  $t('$.lewdery',P);
    const jog =  $t('$.gambling',P);
    const dro =  $t('$.drops',P);
    const tra =  $t('$.trades',P);
    const gas =  $t('$.expenses',P);
    const gan =  $t('$.earnings',P);
    const tot =  $t('$.total',P);
    const exg =  $t('$.exchange',P);
    const don =  $t('$.donation',P);
    const cra =  $t('$.crafts',P);
    const nope = $t('CMD.noDM',P);
    */

    moment.locale('en');

    const TARGETDATA = await DB.users.get({ id: Target.id });
    responseEmbed.color = 0xffc156;
    responseEmbed.title = bal;
console.log('hare')

    async function lastTransBuild(x) {
      if (!x) return "";

      const POLid = PLX.id;

      const ts = moment(x.timestamp)
        .format("hh:mma | DD/MMM")
        .padStart(16, "\u200b ");
      if (x.type === "SEND") x.type = "TRANSFER";
      if (x.to === TARGETDATA.id && x.from !== POLid) {
        othPart = (await PLX.getTarget(x.from, null, true)) || {
          tag: "Unknown#0000",
        };
        if (!othPart)
          return ` \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *\`${x.type}\`* from ${x.to}`;
        return (
          `↔ \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   ` +
          `*\`${x.type}\`* from [${othPart?.tag}](http://pollux.fun/p/${othPart?.id}) \`${othPart.id}\` `
        );
      }
      if (x.from === TARGETDATA.id && x.to !== POLid) {
        othPart = (await PLX.getTarget(x.to, null, true)) || {
          tag: "Unknown#0000",
        };
        if (!othPart)
          return ` \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *\`${x.type}\`* to ${x.to}`;
        return (
          `↔  \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   ` +
          `*\`${x.type}\`* to [${othPart?.tag}](http://pollux.fun/p/${othPart?.id}) \`${othPart.id}\` `
        );
      }
      if (x.to === POLid)
        return `📤  \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *${x.type}*`;
      if (x.from === POLid)
        return `📥  \`${ts}\` **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *${x.type}*`;

      return "";
    }

    responseEmbed.fields = [];

    if (TARGETDATA) {
      responseEmbed.fields.push({
        name: "\u200bClassic Gems",
        value: "\u200b" +
          `\u2003${_emoji("RBN")} ${$t("keywords.RBN_plural", {
            lngs: P.lngs,
          })}: **${miliarize(TARGETDATA.modules.RBN, true)}**` +
          `\n\u2003${_emoji("SPH")} ${$t("keywords.SPH_plural", {
            lngs: P.lngs,
          })}: **${miliarize(TARGETDATA.modules.SPH, true)}**` +
          `\n\u2003${_emoji("JDE")} ${$t("keywords.JDE_plural", {
            lngs: P.lngs,
          })}: **${miliarize(TARGETDATA.modules.JDE, true)}**`,
        inline:true
        });

        responseEmbed.fields.push({
        name:"\u200bPolaris Gems",
        value:"\u200b" +
          `\u2003${_emoji("COS")} ${$t("keywords.COS_plural", {
            lngs: P.lngs,
          })}: **${miliarize(
            TARGETDATA.modules.inventory.find((i) => i.id === "cosmo_fragment")
              ?.count || 0,
            true
          )}**` +
          `\n\u2003${_emoji("PSM")} ${$t("keywords.PSM_plural", {
            lngs: P.lngs,
          })}: **${miliarize(TARGETDATA.modules.PSM ?? 0, true)}**` +
          `\n\u2003${_emoji("EVT")} ${"Event Tokens"}: **${miliarize(
            TARGETDATA.eventGoodie || 0,
            true
          )}**` +
          `\n${invisibar}`,
        inline:true
        });

      lastTrans = await DB.audits
        .find({ $or: [{ from: TARGETDATA.id }, { to: TARGETDATA.id }] })
        .sort({ timestamp: -1 })
        .limit(5);
        responseEmbed.fields.push({
        name:"Last Transactions",
        value:`${await lastTransBuild(lastTrans[0])}
${await lastTransBuild(lastTrans[1])}
${await lastTransBuild(lastTrans[2])}
${await lastTransBuild(lastTrans[3])}
${await lastTransBuild(lastTrans[4])}
`.trim() || "\u200b",
        inline: false
        });
    } else {
      responseEmbed.description = (`User \`${Target.id}\` not found in Pollux Database`);
    }
    if (Target) {
      responseEmbed.footer = {text:Target.tag, icon_url: Target.avatarURL};
    } else {
      responseEmbed.description = `User \`${Target.id}\` not found anywhere`;
      responseEmbed.fields = [];
      responseEmbed.fields = [];
    }
    responseEmbed.thumbnail = {url:`${HOST}/build/coins/befli_t_s.png`};

    return {
      type: 4,
      data: {
        flags: 64,
        content: "",
        embeds:  [responseEmbed]
      },
    };
    }catch(err){console.error(err)}
  },
};
