const PROGEDIT = new Vue({
    el:"#progression_edit",
    data:{
        top100:  {loading:true},
        selectedMember:{loading:true},
        usersFromCurrentQuery: [],
    },
    components:{
        "v-select": VueSelect.VueSelect
    },
    methods:{
        edit(){

        },
        clear(){
            fetch( `/admin/${serverid}/progression/top100` ).then(res => {
                res.json().then(json => (PROGEDIT.top100 = json));
            });
        },
        setMember(mem,toggle){
            if(toggle){                
                PLX.accordion($("#progression_edit")).toggle(0, true);                
            }
            this.selectedMember = mem
        },
        onSearch(search, loading) {
            if(search.length) {
              loading(true);
              this.search(loading, search, this);
            }
        },
        search: debounce((loading, search, vm) => {
            fetch(
                `/admin/${serverid}/progression/search?q=${escape(search)}`
            ).then(res => {
              res.json().then(json => (vm.usersFromCurrentQuery = json));
              loading(false);
            });
          }, 350)
        
    }
});

fetch( `/admin/${serverid}/progression/top100` ).then(res => {
    res.json().then(json => (PROGEDIT.top100 = json));
});


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};