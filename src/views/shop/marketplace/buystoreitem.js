
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
          `/api/v1/shop/${type}/${(marketOps.type=='buy'?'sell':'buy') || 'buy'}/${item}`,
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
                /*
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
              }*/

              return Swal.fire({
                title: "Yay!",
                text: `Your ${type} is in your inventory. What's next?`,
                type:'success',
                confirmButtonText: 'Go to profile',
                cancelButtonText: 'Continue browsing',               
                showCancelButton : true,
                showCloseButton : true,
                preConfirm: () => location.assign("/dash"),
                onClose: ()=> $('.modal-close').click()
                //cancelButtonColor: ,

              });
              
            }

          }).catch(err=> Swal.fire("Error!","Something went fucky wucky","error") && console.error(err) )
        )
    });
}
