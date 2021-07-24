function login() {

    window.open('/auth', 'Login', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=400,height=500")
  
  }
  function install() {

    window.open('/invite', 'Hire Pollux', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=1280,height=720")
  
  }
  
  function installFlavored(flavor,server,activate=false) {
    if (activate){
      window.open(`/invite/activate/${flavor}/${server}`, 'Activate Pollux Prime', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=1280,height=720")
    }else{
      window.open(`/invite/${flavor}?sv=${server}`, 'Invite Pollux Prime', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=1280,height=720")
    }
  }
  function authwindow(url,text="Login") {

    window.open(url, text, "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=400,height=500")
  
  }