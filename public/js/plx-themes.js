// Find if user has set a preference and react to changes
(function initializeTheme(){
    syncBetweenTabs()
    listenToOSChanges()
    enableTheme(
      returnThemeBasedOnLocalStorage() ||
      returnThemeBasedOnOS() )
  }())
  
  // Listen to preference changes. The event only fires in inactive tabs, so theme changes aren't applied twice.
  function syncBetweenTabs(){
    window.addEventListener('storage', (e) => {
      const root = document.documentElement
      if (e.key === 'plx-theme'){
        if (e.newValue === 'default') enableTheme('default', true, false)
        else if (e.newValue === 'dark') enableTheme('dark', true, false) // The third argument makes sure the state isn't saved again.
      }
    })
  }
  
  // Add a listener in case OS-level preference changes.
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
        if(!root.classList.contains('theme-dark')) enableTheme('dark', true)
      }
    })
  }
  
  // If no preference was set, check what the OS pref is.
  function returnThemeBasedOnOS() {
    let mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQueryList.matches) return 'dark'
      else {
      mediaQueryList = window.matchMedia('(prefers-color-scheme: light)')
      if (mediaQueryList.matches) return 'borealis'
      else return undefined
      }
  }
  
  // For subsequent page loads
  function returnThemeBasedOnLocalStorage() {
    const pref = localStorage.getItem('plx-theme')
    return pref || 'default'; 
  }
 
 function enableTheme(theme='default'){
    localStorage.setItem('plx-theme',theme)
     $('.plxtheme').remove()
     $('head').append(`<link class='plxtheme' rel='stylesheet' href='/css/themes/${theme}.css'>`)
 }