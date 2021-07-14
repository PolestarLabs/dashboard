function login() {

    window.open('/auth', 'Login', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=400,height=500")
  
  }
  function install() {

    window.open('/invite', 'Hire Pollux', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=1280,height=720")
  
  }
  
  function installFlavored(flavor) {

    window.open(`/invite/${flavor}`, 'Activate Pollux Prime', "directories=0,titlebar=0,toolbar=0,location=false,status=0,menubar=0,scrollbars=no,resizable=no,width=1280,height=720")
  
  }
  