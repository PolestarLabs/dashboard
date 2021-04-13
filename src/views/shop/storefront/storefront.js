let default_img = "https://via.placeholder.com/120x120";

function miliarize(numstring, strict, symbol) {
  let sym = symbol || ".";
  if (!numstring) return 0;
  if (typeof numstring == "number") {
    numstring = numstring.toString();
  }
  if (numstring.length < 4) return numstring;

  var stashe = numstring.replace(/\B(?=(\d{3})+(?!\d))/g, sym).toString();

  if (strict === "ultra") {
    return stashe;
  }

  if (strict) {
    var stash = stashe.split(sym);
    switch (stash.length) {
      case 1:
        return stash;
      case 2:
        if (stash[1] != "000") break;
        return stash[0] + "K";
      case 3:
        if (stash[2] != "000") break;
        return stash[0] + sym + stash[1][0] + stash[1][1] + "Mi";
      case 4:
        if (stash[3] != "000") break;
        return stash[0] + sym + stash[1][0] + stash[1][1] + "Bi";
    }

    return stashe;
  }

  stash = stashe.split(sym);
  switch (stash.length) {
    case 1:
      return stash.join(" ");
    case 2:
      if (stash[0].length <= 1) break;
      return stash[0] + "K";
    case 3:
      return stash[0] + "Mi";
    case 4:
      return stash[0] + "Bi";
  }
  return stashe;
}
console.log(miliarize);
console.log(Vue);
const STORE = new Vue({
  el: "#storefront",
  components: {},
  data: {
    userdata,
    backgrounds: { loading: true },
    medals: { loading: true },
    boosters: { loading: true },
    stickers: { loading: true },
    market: { loading: true },
    defaultPrices: { loading: true },
    search: "",
    arrivals: [],
    currentModalItem: 0,
    hideOwnedArrivals: false,
    displayPackinfo:false,
    displayStickerinfo: false,
    currentPage:{
      medals: 0,
    }
 
  },
  computed: {
  },
  methods: {
    buttonBuy(entry){
      console.log({entry},1)
      this.currentModalItem = entry.itemdata;
      console.log(1)

    },
    buttonSell(entry){
      console.log({entry},1)
      this.currentModalItem = entry.itemdata;
      console.log(12)

    },
    firstOfWeek(d) {
      d = new Date(d); 
      let diff = d.getDate() - d.getDay() + (d.getDay() == 0 ? -6:1);
      return new Date(d.setDate(diff));
    },
    buyStoreItem,
    bs(item){
      return bullshitGenerator(item.type)
      },
    marketItems() {
      if (this.market.map) {
        return this.market.map((x) => x.metadata).filter((x) => !!x);
      } else {
        return [];
      }
    },
    createBgTags(bg){
      if (bg.tags) return bg.tags.split(/ +/).map(x=>x.replace(/_/g,' '))
    },
    rarity(rar){
      return ({
        C: "Common",
        U: "Uncommon",
        R: "Rare",
        SR: "Super Rare",
        UR: "Ultra Rare",
        XR: "Exclusive Rewards"
      })[rar]
    },
    renderPPC(bgid){
      setTimeout(()=>{

        let ppcCanvas = document.getElementById('pppc')
        if(!ppcCanvas) return;
        let ctx = ppcCanvas.getContext('2d');
        
        Promise.all([
      makeImage('/backdrops/'+bgid+'.png'),
      makeImage('/images/demo/profile_dummy.png')
    ]).then(items=>{
        const [bg,base] = items;
        ctx.drawImage(bg, 60, 14,720,360);
        ctx.drawImage(base, 0, 0);
      })
    },0)
      
      function makeImage(imgLink) {
        return new Promise(async resolve => {
          const img = new Image();
          img.src = imgLink;
          img.onload = () => {
            console.log(2)
            resolve(img);
          }
        })
      }
    },
    setCurrentItem(item){
 
      this.currentModalItem = item
    },
    hasItem(i) {
      if (!this.userdata) return false;
      if (i.type == "background")
        return (this.userdata.modules.bgInventory||[]).includes(i.code);
      if (i.type == "medal")
        return (this.userdata.modules.medalInventory||[]).includes(i.icon);
      if (i.type == "sticker")
        return (this.userdata.modules.stickerInventory||[]).includes(i.id);
      if (i.type == "skin")
        return (this.userdata.modules.skinInventory||[]).includes(i.id);
      return false;
    },
    timeFun(i) {
      return i * 20 + i * 80;
    },
    miliarize,
    selectPack(i, ref, noscroll) {
      console.log("aaa");
      if (!noscroll)
        this.$refs[ref].slideTo(i),
          (this.currentIndex = this.$refs[ref].currentSlide);
    },
    filterMeds() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        var input = this.search;
        var filter = document.getElementById("filter-arrivals");
        if (input == "") filter.setAttribute("plx-filter-control", "");
        else
          filter.setAttribute(
            "plx-filter-control",
            "filter:[data-search*='" + input + "'i] ; group:search"
          );

        filter.click();
      }, 800);
    },
    storepage(type,store,max,jump){
      this[store] = [];
      fetch(`/api/cosmetics/search?type=${type}&lim=${max||20}&skip=${jump*(max||20)}`).then((r) =>
        r.json().then(async (res) => this[store] = res )
      )
    }
  },
});
console.log(STORE);

 

Promise.all([
  fetch("/api/cosmetics/search?type=background&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=medal&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=sticker&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=skin&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/cosmetics/search?type=flair&lim=20").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
  fetch("/api/items/search?lim=10").then((r) =>
    r.json().then(async (res) => STORE.arrivals.push(...res))
  ),
]).then(res=>{
  STORE.arrivals.sort((a,b)=> b.release - a.release)
});

  fetch("/api/cosmetics/search?type=background").then((r) =>
    r.json().then(async (res) => (STORE.backgrounds = res.slice(0, 24)))
  ),

  fetch("/api/cosmetics/search?type=medal").then((r) =>
    r.json().then(async (res) => (STORE.medals = res.slice(0, 24)))
  ),

fetch("/api/items/search?type=boosterpack").then((r) =>
  r.json().then(async (res) => (STORE.boosters = res.slice(0, 24)))
);

fetch("/api/marketplace?limit=100").then((r) =>
  r.json().then(async (res) => (STORE.market = res))
);

fetch("/api/marketplace/rates").then((r) =>
  r
    .json()
    .then(
      async (res) =>
        (STORE.defaultPrices = Object.assign(res,{
          medal: res.medalPrices,
          background: res.bgPrices,
        }))
    )
);


function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



// MODALS
 
  function buyStoreItem(type,item,currency="RBN",marketOps = {}){
    
    Swal.fire({
      title: `Making an excellent acquisition...`,
      allowEscapeKey: () => !Swal.isLoading(),
      allowOutsideClick: () => !Swal.isLoading(),
      showConfirmButton: false,
      showLoaderOnConfirm: true,
      onOpen: Swal.clickConfirm,    
      preConfirm: () =>
        fetch(
          `/api/shop/${type}/${(marketOps.type=='buy'?'sell':'buy') || 'buy'}/${item}`,
          {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ currency })
          }
        ).then((r) =>
          r.json().then( val=> {
           console.log({val,rOk:r.ok,r})
            if(!r.ok){
              const newSwalOptions = {
                title : "Making an excellent acquisition... or not.",
                showCancelButton : true,
                showCloseButton : true,
              }
              
              if(val.code == 0xC1 || val.status == "OK"){
                currency = currency == 'RBN' ? 'SPH' : 'RBN';
                newSwalOptions.confirmButtonText = `Try with ${currency}`
                newSwalOptions.confirmButtonColor = currency == 'SPH' ? '#5599F0' : '#F03355';                    
              }
              if([0xB1,0xB2].includes(val.code)){
                newSwalOptions.showConfirmButton = false;
                if(val.code == 0xB1)
                  newSwalOptions.cancelButtonText = "Ah I can't have two?";
                if(val.code == 0xB2)
                  newSwalOptions.cancelButtonText = "Wow ok.";
              }
              if((val.code||00).toString(16).startsWith("f")){
                newSwalOptions.showConfirmButton = false;
                newSwalOptions.cancelButtonText = "😬"
              }
              
              Swal.update( newSwalOptions );
              return Swal.showValidationMessage(val.reason || val.status);
            }else{
              if(STORE && type!="marketplace"){
                STORE.userdata.modules[
                  (type=="background"?"bg"
                  :type=="flair"?"flairs"
                  :type)
                  + "Inventory"
                ].push(item)
              }else if(STORE && type === 'marketplace'){
                let itemToChange = STORE.market.find(e=>e.id == marketOps.id);
                if (itemToChange){
                  itemToChange.lock = true;                  
                }
              }

              return Swal.fire({
                title: "Yay!",
                text: `Your ${type} is in your inventory. What's next?`,
                type:'success',
                confirmButtonText: 'Go to profile',
                cancelButtonText: 'Continue browsing',               
                showCancelButton : true,
                showCloseButton : true,
                preConfirm: () => location.assign("/profile/me"),
                onClose: ()=> $('.modal-close').click()
                //cancelButtonColor: ,

              });
              
            }

          }).catch(err=> Swal.fire("Error!","Something went fucky wucky","error") && console.error(err) )
        )
    });
}


function bullshitGenerator(ins){
  const bsgen = {
    "adverbs":["appropriately","assertively","authoritatively","collaboratively","compellingly","competently","completely","continually","conveniently","credibly","distinctively","dramatically","dynamically","efficiently","energistically","enthusiastically","fungibly","globally","holisticly","interactively","intrinsically","monotonectally","objectively","phosfluorescently","proactively","professionally","progressively","quickly","altruistically","alertly","agreeably","agilely","agelessly","affluently","affirmatively","affectionately","affectingly","affably","aesthetically","adroitly","adoringly","adorably","admiringly","admirably","adeptly","vivaciously","acutely","warmly","actually","victoriously","actively","safely","accurately","powerfully","accordingly","politely","accommodatingly","perfectly","abundantly","obediently","absolutely","merrily","ably","kindly","abidingly","justly","innocently","greatly","great","honestly","gratifyingly","happily","gratefully","gracefully","graciously","gleefully","gracefully","fortunately","gorgeously","faithfully","glowingly","elegantly","gloriously","eagerly","gleefully","devotedly","gladly","deftly","gingerly","cheerfully","gallantly","brightly","gainfully","bravely","gaily","boldly","uniquely","synergistically","seamlessly","rapidiously","always","amazingly","ambitiously","amenably","amiably","amply","amusingly","anew","angelically","appetizingly","appreciably","appreciatively","appropriately","approvingly","aptly","ardently","arrestingly","articulately","artistically","assertively","assiduously","assuredly","astonishingly","astoundingly","astutely","attentively","attractively","atypically","augustly","auspiciously","authentically","authoritatively","autonomously","avidly","awesomely","beauteously","beautifully","believably","beneficently","beneficially","benevolently","benignly","best","blazingly","blessedly","blissfully","blithely","boisterously","boldly","bounteously","bountifully","bravely","brightly","brilliantly","briskly","brotherly","buoyantly","busily","calmly","candidly","cannily","capably","captivatingly","carefully","caringly","casually","causatively","celestially","cerebrally","certainly","charitably","charmingly","cheerfully","chicly","chivalrously","civilly","clairvoyantly","cleanly","clearly","clemently","cleverly","cogently","coherently","colourfully","comfortably","comfortingly","comically","commandingly","commendably","commiseratively","communicatively","companionably","compassionately","compatibly","compellingly","competently","completely","concisely","conclusively","confidently","confirmingly","congenially","congruously","conscientiously","consciously","considerately","consistently","consonantly","constructively","contemplatively","contently","conveniently","conversantly","convincingly","convivially","coolly","cooperatively","cordially","correctly","cosily","cosmically","courageously","courteously","creatively","credibly","creditably","cunningly","cutely","dapperly","daringly","dashingly","dazzlingly","dearly","debonairly","decently","decisively","decorously","deeply","defiantly","definitely","deftly","delectably","deliberately","delicately","delightedly","delightfully","dependably","deservingly","desirably","determinedly","devotedly","devoutly","dexterously","differently","diligently","diplomatically","directly","disarmingly","discerningly","discretely","discriminatingly","distinctively","diversely","divinely","dreamily","durably","dynamically","eagerly","earnestly","easily","ebulliently","economically","ecstatically","edifyingly","educationally","effectively","effectually","effervescently","efficiently","effortlessly","elaborately","elatedly","electrically","elegantly","eloquently","eminently","empathetically","emphatically","enchantingly","encouragingly","endearingly","enduringly","energetically","engagingly","engrossingly","enjoyably","enlighteningly","enliveningly","enrichingly","enterprisingly","enthrallingly","enthusiastically","enticingly","entirely","entrancingly","equally","equitably","eruditely","especially","essentially","ethically","euphorically","even-handedly","evenly","evocatively","exactly","exceedingly","excellently","exceptionally","excitingly","executively","exhaustive","exhilaratingly","exotically","expansively","expectantly","expeditiously","expensively","expertly","explicitly","expressively","exquisitely","extensively","extraordinarily","extravagantly","exuberantly","exultantly","exultingly","fabulously","facilely","fain","fair","fairly","faithfully","famously","fantastically","fascinatingly","fashionably","favorably","fearlessly","felicitously","fertilely","fervently","festively","fetchingly","finely","firm","first","first-rate","fitly","fittingly","flamboyantly","flat out","flavorfully","fleetly","flexibly","flourishingly","fluently","fondly","forcefully","foremost","forever","forgivingly","formally","forthrightly","fortuitously","fortunately","forward","frankly","fraternally","free","freshly","frolicsomely","fruitfully","full","fully","funnily","futuristically","gaily","gainfully","gallantly","gamesomely","generously","genially","gently","genuinely","gladly","gleefully","gloriously","glowingly","good-heartedly","good-humoredly","goodly","good-naturedly","gorgeously","gracefully","graciously","gradely","graithly","grandly","gratefully","gratifyingly","greatly","guidingly","gymnastically","handily","handsomely","happily","hardily","harmlessly","harmoniously","healthily","heartily","helpfully","heroically","highly","high-spiritedly","hilariously","hiply","honestly","honorably","hopefully","hospitably","hotly","humanely","humbly","humorously","hygienically","hypnotically","idealistically","ideally","illuminatingly","illustriously","imaginatively","immaculately","immeasurably","immediately","impartially","impassionedly","impeccably","importantly","impressively","incisively","incredibly","indefatigably","independently","indestructibly","indispensably","individualistically","indomitably","industriously","infinitely","influentially","informatively","ingeniously","innocently","inquisitively","insightfully","inspiredly","inspiringly","instantly","instinctively","instructively","instrumentally","intellectually","intelligently","intensely","intently","interactively","interestedly","interestingly","intimately","inventively","invincibly","inviolably","invitingly","irreplaceably","irrepressibly","irreproachably","irresistibly","jauntily","jazzily","jestingly","jocosely","jocularly","jointly","jokingly","jovially","joyfully","joyously","jubilantly","judiciously","justly","keenly","kiddingly","kindly","knowingly","knowledgeably","kookily","laudably","laughingly","lavishly","lawfully","learnedly","legitimately","leniently","level-headedly","liberally","liberatingly","light-heartedly","likely","limberly","literately","lithely","lordly","lovably","lovingly","loyally","lucidly","luckily","lucratively","luminously","lusciously","lushly","lustily","lustrously","luxuriantly","luxuriously","magically","magnanimously","magnetically","magnificently","main","majestically","majorly","malleably","managerially","manly","mannerly","markedly","marvelously","masterfully","masterly","maternally","meaningfully","measurably","meditatively","mellowly","melodiously","mercifully","meritoriously","merrily","mesmerizingly","metaphysically","meteorically","methodically","meticulously","mightily","mindfully","miraculously","mirthfully","modestly","morally","most fortunately","munificently","muscularly","musically","mutually","naturally","neatly","neighborly","newly","nicely","niftily","nimbly","no end","nobly","notably","noticeably","objectively","obligingly","observantly","once","open-handedly","open-heartedly","openly","open-mindedly","opportunely","optimally","optimistically","opulently","originally","outstandingly","parentally","particularly","passionately","paternally","patiently","peaceably","peacefully","perceptively","perfectly","permissively","perseveringly","persistently","personally","perspicaciously","perspicuously","persuasively","pertly","phenomenally","philanthropically","philosophically","picturesquely","piously","piquantly","placidly","playfully","please","pleasingly","pleasurably","plenty","plum","poetically","poignantly","politely","popularly","positively","powerfully","practically","pragmatically","praiseworthily","prayerfully","preciously","precisely","preparedly","prestigiously","prevalently","princely","pristinely","proactively","prodigiously","productively","professionally","proficiently","profitably","profoundly","progressively","prolifically","prominently","promisingly","promptly","proper","properly","prophetically","propitiously","prosperously","protectively","proudly","provocatively","prudently","public-spiritedly","punctually","purely","purposefully","quaintly","qualitatively","queenly","quick","quickly","quick-wittedly","quietly","quintessentially","radiantly","rapidly","rapturously","rationally","ravishingly","readily","really","reasonably","reassuringly","receptively","reciprocally","reflectively","refreshingly","regally","relaxingly","reliably","remarkably","reputably","resiliently","resolutely","resoundingly","resourcefully","respectably","respectfully","resplendently","responsibly","responsively","restfully","restoratively","retentively","reverently","rewardingly","rhapsodically","richly","right","righteously","rightfully","rightly","risibly","robustly","rollickingly","romantically","rosily","rousingly","ruggedly","safely","sagaciously","saliently","salubriously","sanguinely","satisfactorily","saucily","scintillatingly","scrumptiously","scrupulously","securely","sedulously","seemly","self-confidently","selflessly","sensationally","sensibly","sensitively","sensuously","sentimentally","serendipitously","serenely","sharp","significantly","simply","sincerely","skilfully","sleekly","smartly","smashingly","smilingly","smoothly","snugly","sociably","socially","softly","solicitously","solidly","soothingly","sophisticatedly","soulfully","soundly","specially","spectacularly","speedily","spellbindingly","spiritedly","spiritually","splendidly","splendiferously","spontaneously","sportingly","sportively","sprightly","square","stably","stalwartly","stately","statuesquely","steadily","straightforwardly","strongly","studiously","stunningly","stupendously","stylishly","suavely","sublimely","substantially","subtly","successfully","succinctly","sufficiently","suitably","sumptuously","super","superabundantly","superbly","superiorly","supplely","supportingly","supportively","supremely","sure","surely","surprisingly","sweet","sweetly","swiftly","sympathetically","synergistically","systematically","tactfully","tastefully","tenderly","terrifically","thankfully","therapeutically","thoroughly","thoughtfully","thrillingly","tidily","tight","timely","tirelessly","to the max","today","together","tolerantly","too","totally","touchingly","tranquilly","transcendentally","transparently","tremendously","triumphantly","truly","trustfully","trustingly","truthfully","unabashedly","unaffectedly","unambiguously","unbelievably","unconditionally","uncritically","understandingly","unequivocally","unerringly","unfailingly","unflaggingly","ungrudgingly","uniquely","universally","unquestionably","unselfishly","unstoppably","up to par","up-front","uppermost","uprightly","upward","upwardly","urbanely","usefully","valiantly","valorously","valuably","vehemently","venerably","venturesomely","veraciously","very","vibrantly","victoriously","vigilantly","vigorously","virtuously","visually","vitally","vivaciously","volitionally","voluntarily","voluptuously","warm-heartedly","warmly","well","wholeheartedly","wholesomely","wholly","willingly","winningly","wisely","with relish","wonderfully","wondrous","wondrously","worldly","worthily","yeah","yearningly","yes","youthfully","zanily","zealously","zestfully"],
    "verbs":["grip","gravitate","grasp","govern","gobble","glitter","glisten","gleam","glare","gaze","garble","fuse","frown","fling","fish","fight","eyeball","extend","extract","expose","explore","explode","expand","escort","erase","envelop","explores","absorb","advance","advise","alter","amend","amplify","attack","balloon","bash","batter","beam","beef","blab","blast","bolt","boost","brief","broadcast","brood","burst","bus","bust","capture","catch","charge","chap","chip","clasp","climb","clutch","collide","command","commune","cower","crackle","crash","crave","crush","dangle","dash","demolish","depart","deposit","detect","deviate","devour","direct","discern","discover","dismantle","download","drag","drain","drip","drop","eavesdrop","engage","engulf","enlarge","ensnare","groan","grope","growl","guide","gush","hack","hail","heighten","hobble","hover","hurry","ignite","illuminate","inspect","instruct","intensify","intertwine","impart","jostle","journey","lash","launch","lead","leap","locate","lurch","lurk","magnify","mimic","mint","moan","modify","multiply","muse","mushroom","mystify","notice","notify","obtain","oppress","order","paint","park","peck","peek","peer","perceive","picture","pilot","pinpoint","place","plant","plop","pluck","plunge","poison","pop","position","power","prickle","probe","prune","realize","recite","recoil","refashion","refine","remove","report","retreat","reveal","reverberate","revitalize","revolutionize","revolve","rip","rise","ruin","rush","rust","saunter","scamper","scan","scorch","scrape","scratch","scrawl","seize","serve","shatter","shepherd","shimmer","shine","shock","shrivel","sizzle","skip","skulk","slash","slide","slink","slip","slump","slurp","smash","smite","snag","snarl","sneak","snowball","soar","spam","sparkle","sport","sprinkle","stare","starve","steal","steer","storm","strain","stretch","strip","stroll","struggle","stumble","supercharge","supersize","surge","survey","swell","swipe","swoon","tail","tattle","toddle","transfigure","transform","travel","treat","trim","trip","trudge","tussle","uncover","unearth","untangle","unveil","usher","veil","wail","weave","wind","withdraw","wreck","wrench","wrest","wrestle","wring","yank","zing","zap"],
    "adjectives":["adamant","adroit","amatory","animistic","antic","arcadian","baleful","bellicose","bilious","boorish","calamitous","caustic","cerulean","comely","concomitant","avant-garde","contumacious","corpulent","crapulous","defamatory","didactic","dilatory","dowdy","efficacious","effulgent","egregious","endemic","equanimous","execrable","fastidious","feckless","fecund","friable","fulsome","garrulous","guileless","gustatory","heuristic","histrionic","hubristic","incendiary","insidious","insolent","intransigent","inveterate","invidious","irksome","jejune","jocular","judicious","lachrymose","limpid","loquacious","luminous","mannered","mendacious","meretricious","minatory","mordant","munificent","nefarious","noxious","obtuse","parsimonious","pendulous","pernicious","pervasive","petulant","platitudinous","precipitate","propitious","puckish","querulous","quiescent","rebarbative","recalcitrant","redolent","rhadamanthine","risible","ruminative","sagacious","salubrious","sartorial","sclerotic","serpentine","spasmodic","strident","taciturn","tenacious","tremulous","trenchant","turbulent","turgid","ubiquitous","uxorious","verdant","voluble","voracious","wheedling","withering","zealous"]
  }
  let signed = ["IGN","Steve Jobs","Albert Einstein","Goku","Elon Musk","Donald J. Trump", "Kim Jong Un", "Oda Nobunaga", "Cleopatra", "Julius Caesar", "Aristotle", "Charles Chaplin", "The New York Times", "Washington Post", "Buzzfeed" ];
  shuffle(bsgen.adverbs)
  shuffle(bsgen.verbs)
  shuffle(bsgen.adjectives)
  shuffle(signed)
  return `This ${bsgen.adjectives[0]} ${ins} ${bsgen.adverbs[0]} ${bsgen.verbs[1]}s ${bsgen.adjectives[2]} ${bsgen.adjectives[5]}ness and ${bsgen.verbs[3]}s with ${bsgen.adjectives[3]} ${shuffle(["aspect","nuances","characteristic","appeal","quality"])[0]}.  — ${signed[0]}` 
}