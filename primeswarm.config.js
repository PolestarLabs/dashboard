const INVDASH = new Vue({
    el:'#invdash',
    data:{
        sellprice: 0
    },
    methods:{
        marketplacePopup(item) {
            
            new Vue({
                el: '#swal-pop',
                data:{
                    sellprice: 100,
                    sellbuy: "sell",
                    rbnsph: "RBN",
                },
                beforeCreate:   Swal.fire({
                    title: "Post this as a listing via Discord",
                    html: `<div id='swal-pop'>`+
                    `
                    You want to: <select v-model='sellbuy'>
                        <option value="sell"> Sell this item </option>
                        <option value="buy"> Buy another one </option>
                    </select>
                    For: <input type='number' max=100000 min=100 style="width:4rem" v-model='sellprice'></input>
                    <select v-model='rbnsph'>
                        <option value="RBN" color="red" > Rubines </option>
                        <option value="SPH" color="blue" > Sapphires </option>
                    </select><br>
                    <br>Use the command<br>
                    <pre>+market post {{sellbuy}} ${item.type} ${item.id} {{sellprice}} {{rbnsph}}</pre>
                    </div>
                    `,
                  type: "info",
                  confirmButtonText: "Okay",
                })
            })
            
          },
    }
})
