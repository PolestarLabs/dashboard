const PRIME = new Vue({
    el: "#primedata",
    data:{
        servers: [],
        users: availablePolluxUsers,
        selectedFlavor: 'prime',
        PRIMEDATA: (userdata||{}).prime,
        serverToPrime: {name:"Select a server..."},
        primable_servers: userinfo.servers.filter(g=> g.owner || (g.permissions & 0x8) > 0 || (g.permissions & 0x20) > 0 ),
    },
    components: {
        "v-select": VueSelect.VueSelect,
      },
    methods: {
        setPrime(){
            const currentServer = JSON.parse(JSON.stringify(this.serverToPrime));
            currentServer.meta = this.serverToPrime;
            const flavor = this.users.find(x=>x.flavor === this.selectedFlavor);
            currentServer.activeClients = ["354285599588483082","271394014358405121"]
            currentServer.activeClients.push(flavor.id);
            this.servers.push(currentServer);
            this.serverToPrime = {name:"Select a server..."};
            //this.primable_servers = this.primable_servers.filter()
        },
        getServer(svid){
            fetch("/api/server/"+svid).then(res=>{
                if (res.status !== 200) return;
                res.json().then(res=>{
                    this.servers.push(res);
                    //PRIME.getUser(res.clientID);
                    //(res.activeClients||[]).forEach(cli=> PRIME.getUser(cli));
                    this.servers.loading = false;
                })
            })
        },
    }
});
if(userdata && userdata.prime && userdata.prime.servers){
    userdata.prime.servers.forEach(sv=>{
        PRIME.getServer(sv);
    });
}

