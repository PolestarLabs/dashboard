const DISCORD_CDN = "https://cdn.discordapp.com";

const DummyPrimeOptions = {
    "active" : false,
    "canReallocate" : false,
    "custom_background" : false,
    "custom_handle" : false,
    "custom_shop" : false,
    "maxServers" : 0,
    "tier" : false,
    "servers" : []
}



const PRIME = new Vue({
    el: "#prime-section",
    data:{
        levels:{
            "false":0,
            plastic:1,
            aluminum:2,
            aluminium:2,
            carbon:3,
            iron:3,
            lithium:4,
            iridium:4,
            palladium:5,
            zircon:6,
            zirconium:6,
            uranium:7,
            astatine:8,
            antimatter:9,
        },
        currentPrimeServers: [],
        eligibleFlavors: {
            neko: 3,
            prime: 2,
            rockstar: 3,
        },
        availablePolluxUsers,
        selectedFlavor: 'prime',
        CLIENT_PRIME_INFO:  Object.assign(DummyPrimeOptions, (userdata||{}).prime ) ,
        serverToPrime: {name:"Select a server..."},
        allUserServers: userinfo.servers,
        primeEligibleServers: userinfo.servers.filter(g=> g.owner || (g.permissions & 0x8) > 0 || (g.permissions & 0x20) > 0 ),
    },
    components: {
        "v-select": VueSelect.VueSelect,
      },
    methods: {
        checkEligibility(flavorName){
 
            return ([
                this.selectedFlavor == flavorName  ? 'selected' : '',
                !this.eligibleFlavors[flavorName] || (this.eligibleFlavors[flavorName] <= this.levels[this.CLIENT_PRIME_INFO.tier]) ? 'eligible' :'not_eligible'
            ].join(" "))
        },
        getServerIcon(server,size=64){
            console.log({server})
            if (!server || !server.id) return "0";
            return (
                server.avi ||                //-----------------------------------------//
                server.ava ||                // <--- Compat with self-supplied meta ----//
                (server.meta||{}).icon ||    //-----------------------------------------//
                `${DISCORD_CDN}/icons/${server.id}/${server.icon}.png?size=${size}`
            );
        },
        getAvatar(client,size=64){
            return `${DISCORD_CDN}/avatars/${client.id}/${client.avatar}.png?size=${size}`
        },
        availableClients(server){
            return this.availablePolluxUsers.filter(u=>
                (
                    (server.dbData||{}).activeClients ||
                    // TODO Remove this when proper activeClients are in place
                    ['578913818961248256','271394014358405121'] // DEFAULT
                ).includes(u.id)
            ) || []
        },
        setPrime(){
            console.log(this.serverToPrime,'stopirem');
            const currentServer = JSON.parse(JSON.stringify(this.serverToPrime||{}));
            currentServer.meta = this.serverToPrime;
            const flavor = this.availablePolluxUsers.find(x=>x.flavor === this.selectedFlavor);
            currentServer.dbData = {};
            currentServer.dbData.activeClients = ["354285599588483082","271394014358405121"]
            currentServer.dbData.activeClients.push(flavor.id);
            installFlavored(this.selectedFlavor,currentServer.id,1);
            currentServer.pending = true;
            this.currentPrimeServers.push(currentServer);
            this.CLIENT_PRIME_INFO.servers.push(currentServer.id);
            this.serverToPrime = {name:"Select a server..."};
            setTimeout(()=>{
                this.currentPrimeServers.find(s=>s.id===currentServer.id).pending = false;;
            },10e3);
            //this.primeEligibleServers = this.primeEligibleServers.filter()
        },
        getServer(svid){
            if (!svid) return null;

            let aServer = this.primeEligibleServers.find(s=>s.id === svid) || this.allUserServers.find(s=>s.id === svid);
            if (!aServer) aServer = {
                id:"000",
                name: "Unknown Server",
                icon: "",
                permissions: 0,
            };
            fetch("/api/server/"+svid).then(res=>{
                if (res.status !== 200) return;
                res.json().then(res=>{
                    aServer.dbData = res;
                    this.currentPrimeServers.push(aServer);
                }).catch(err=> {

                    console.log("err jso")

                } )
            })
        },
        unprime(svid){

            Swal.fire({
                title: "This will remove Pollux from this server.",
                showCancelButton: true,
                confirmButtonText: 'Aight!',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise((resolve,reject) => {
                        fetch("/api/prime/"+svid,{method: "DELETE"})
                        .then(res=>{
                            if (res.status === 200){
                                this.currentPrimeServers = this.currentPrimeServers.filter(s=>s.id !== svid);
                                return Swal.fire("Off she goes!",'Pollux has successfuly ejected from your server','success');
                            }
                            else
                                return resolve(Swal.showValidationMessage("Error!","AAAAAAAAAAAAAAAAAAAAA","error"));
                        }).catch(err=>{reject("Internal Error")});
                    })
                },
                allowOutsideClick: () => !swal.isLoading()         
            }) 

            
        },
    },
    computed: {
        activePrimeServers(){
            return (this.CLIENT_PRIME_INFO.servers || []).length
        },
        maxPrimeServers(){
            return this.CLIENT_PRIME_INFO.maxServers||0
        }
    }
});

if(userdata && userdata.prime && userdata.prime.servers){
    ((userdata.prime||{}).servers||[]).forEach(sv=>{
        console.log({sv});
        PRIME.getServer(sv);
    });
}

