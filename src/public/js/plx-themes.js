
(function initializeTheme(){
    syncBetweenTabs()
    listenToOSChanges()
    enableTheme(
      returnThemeBasedOnLocalStorage() ||
      returnThemeBasedOnOS() )
  }())
  

  function syncBetweenTabs(){
    window.addEventListener('storage', (e) => {
      const root = document.documentElement
      if (e.key === 'plx-theme'){
        if (e.newValue === 'default') enableTheme('default', true, false)
        else if (e.newValue === 'dark') enableTheme('noctix', true, false) 
      }
    })
  }
  
  function listenToOSChanges(){
    let mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
  
    mediaQueryList.addListener( (m)=> {
      const root = document.documentElement
      if (m.matches !== true){
        if (!root.classList.contains('theme-default')){
          enableTheme('default', true)
        }
      }
      else{
        if(!root.classList.contains('theme-dark')) enableTheme('noctix', true)
      }
    })
  }
  
  function returnThemeBasedOnOS() {
    let mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQueryList.matches) return 'noctix'
      else {
      mediaQueryList = window.matchMedia('(prefers-color-scheme: light)')
      if (mediaQueryList.matches) return 'selenedi'
      else return undefined
      }
  }
  
  function returnThemeBasedOnLocalStorage() {
    const pref = localStorage.getItem('plx-theme')
    return pref || 'default'; 
  }
 
 function setHtmlThemeClass(theme){
    const root = document.documentElement
    [...root.classList]
      .filter((cls) => cls.startsWith('theme-'))
      .forEach((cls) => root.classList.remove(cls))
    root.classList.add(`theme-${theme}`)
 }
 
 function enableTheme(theme='default'){
    localStorage.setItem('plx-theme',theme)
    if(userdata) fetch(`/api/telemetry/theme/${theme}?user=${userdata.id}`)

    setHtmlThemeClass(theme)

    $('.plx-theme-button').removeAttr('style')
    $('.plx-theme-button.theme-'+theme).css({'opacity':1})

    $('.plxtheme').remove()

    // default theme is the base; do not append it on top (prevents an extra default layer from overriding custom themes)
    if (theme !== 'default') {
      $('head').append(`<link class='plxtheme' rel='stylesheet' href='/css/themes/${theme}.css'>`)
    }
 }
