document.addEventListener("DOMContentLoaded", function (event) {
  const addTabButton = document.getElementById("add-tab")
  const tabList = document.getElementById("tab-list")
  const iframeContainer = document.getElementById("iframe-container")
  let tabCounter = 1

  addTabButton.addEventListener("click", () => {
    createNewTab()
    Load()
  })

  function createNewTab() {
    const newTab = document.createElement("li")
    const tabTitle = document.createElement("span")
    const newIframe = document.createElement("iframe")

    tabTitle.textContent = `New Tab ${tabCounter}`
    tabTitle.className = "tab-title"
    newTab.dataset.tabId = tabCounter
    newTab.addEventListener("click", switchTab)
    newTab.setAttribute("draggable", true)

    const closeButton = document.createElement("button")
    closeButton.classList.add("close-tab")
    closeButton.innerHTML = "&#10005;"
    closeButton.addEventListener("click", closeTab)

    newTab.appendChild(tabTitle)
    newTab.appendChild(closeButton)
    tabList.appendChild(newTab)

    const allTabs = Array.from(tabList.querySelectorAll("li"))
    allTabs.forEach((tab) => tab.classList.remove("active"))
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
    allIframes.forEach((iframe) => iframe.classList.remove("active"))

    newTab.classList.add("active")

    newIframe.dataset.tabId = tabCounter
    newIframe.classList.add("active")

    newIframe.setAttribute("onload", "Load();")

    const GoURL = sessionStorage.getItem("GoUrl")

    if (tabCounter === 1) {
      newIframe.src = window.location.origin + "/a/" + GoURL
    } else if (tabCounter !== 1) {
      newIframe.src = "/"
    } else if (GoURL !== null) {
      newIframe.src = window.location.origin + "/a/" + GoURL
    }

    iframeContainer.appendChild(newIframe)

    newIframe.addEventListener("load", () => {
      const title = newIframe.contentDocument.title
      if (title.length <= 1) {
        tabTitle.textContent = "New Tab"
      } else {
        tabTitle.textContent = title
      }
      Load()
    })

    tabCounter++
  }

  function closeTab(event) {
    event.stopPropagation()

    const tabId = event.target.closest("li").dataset.tabId

    const tabToRemove = tabList.querySelector(`[data-tab-id='${tabId}']`)
    const iframeToRemove = iframeContainer.querySelector(`[data-tab-id='${tabId}']`)

    if (tabToRemove && iframeToRemove) {
      tabToRemove.remove()
      iframeToRemove.remove()

      const remainingTabs = Array.from(tabList.querySelectorAll("li"))

      if (remainingTabs.length === 0) {
        tabCounter = 0
        document.getElementById("is").value = ""
      } else {
        const nextTabIndex = remainingTabs.findIndex((tab) => tab.dataset.tabId !== tabId)
        if (nextTabIndex > -1) {
          const nextTabToActivate = remainingTabs[nextTabIndex]
          const nextIframeToActivate = iframeContainer.querySelector(
            `[data-tab-id='${nextTabToActivate.dataset.tabId}']`
          )

          remainingTabs.forEach((tab) => tab.classList.remove("active"))
          remainingTabs[nextTabIndex].classList.add("active")

          const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
          allIframes.forEach((iframe) => iframe.classList.remove("active"))
          nextIframeToActivate.classList.add("active")
        }
      }
    }
  }

  function switchTab(event) {
    const tabId = event.target.closest("li").dataset.tabId

    const allTabs = Array.from(tabList.querySelectorAll("li"))
    allTabs.forEach((tab) => tab.classList.remove("active"))
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
    allIframes.forEach((iframe) => iframe.classList.remove("active"))

    const selectedTab = tabList.querySelector(`[data-tab-id='${tabId}']`)
    if (selectedTab) {
      selectedTab.classList.add("active")
      document.getElementById("is").value = ""
      Load()
    } else {
      console.log("No selected tab found with ID:", tabId)
    }

    const selectedIframe = iframeContainer.querySelector(`[data-tab-id='${tabId}']`)
    if (selectedIframe) {
      selectedIframe.classList.add("active")
    } else {
      console.log("No selected iframe found with ID:", tabId)
    }
  }

  let dragTab = null

  tabList.addEventListener("dragstart", (event) => {
    dragTab = event.target
  })

  tabList.addEventListener("dragover", (event) => {
    event.preventDefault()
    const targetTab = event.target
    if (targetTab.tagName === "LI" && targetTab !== dragTab) {
      const targetIndex = Array.from(tabList.children).indexOf(targetTab)
      const dragIndex = Array.from(tabList.children).indexOf(dragTab)
      if (targetIndex < dragIndex) {
        tabList.insertBefore(dragTab, targetTab)
      } else {
        tabList.insertBefore(dragTab, targetTab.nextSibling)
      }
    }
  })

  tabList.addEventListener("dragend", () => {
    dragTab = null
  })

  createNewTab()
})

// Reload
function reload() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}

// Popout
function popout() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")

  if (activeIframe) {
    const newWindow = window.open("about:blank", "_blank")

    if (newWindow) {
      const name = localStorage.getItem("name") || "My Drive - Google Drive"
      const icon = localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"

      newWindow.document.title = name

      const link = newWindow.document.createElement("link")
      link.rel = "icon"
      link.href = encodeURI(icon)
      newWindow.document.head.appendChild(link)

      const newIframe = newWindow.document.createElement("iframe")
      const style = newIframe.style
      style.position = "fixed"
      style.top = style.bottom = style.left = style.right = 0
      style.border = style.outline = "none"
      style.width = style.height = "100%"

      newIframe.src = activeIframe.src

      newWindow.document.body.appendChild(newIframe)
    }
  } else {
    console.error("No active iframe found")
  }
}

function erudaToggle() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (!activeIframe) {
    console.error("No active iframe found")
    return
  }

  const erudaWindow = activeIframe.contentWindow
  if (!erudaWindow) {
    console.error("No content window found for the active iframe")
    return
  }

  if (erudaWindow.eruda) {
    if (erudaWindow.eruda._isInit) {
      erudaWindow.eruda.destroy()
    } else {
      console.error("Eruda is not initialized in the active iframe")
    }
  } else {
    const erudaDocument = activeIframe.contentDocument
    if (!erudaDocument) {
      console.error("No content document found for the active iframe")
      return
    }

    const script = erudaDocument.createElement("script")
    script.src = window.location.origin + "/assets/scripts/e.js"
    script.onload = function () {
      if (!erudaWindow.eruda) {
        console.error("Failed to load Eruda in the active iframe")
        return
      }
      erudaWindow.eruda.init()
      erudaWindow.eruda.show()
    }
    erudaDocument.head.appendChild(script)
  }
}

// Fullscreen
function FS() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    if (!activeIframe.contentDocument.fullscreenElement) {
      activeIframe.contentDocument.documentElement.requestFullscreen()
    } else {
      activeIframe.contentDocument.exitFullscreen()
    }
  } else {
    console.error("No active iframe found")
  }
}

const fullscreenButton = document.getElementById("fullscreen-button")
fullscreenButton.addEventListener("click", FS)

// Home
function Home() {
  window.location.href = "./"
}

const homeButton = document.getElementById("home-page")
homeButton.addEventListener("click", Home)

// Back
function goBack() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.contentWindow.history.back()
    iframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}

// Forward
function goForward() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.contentWindow.history.forward()
    iframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}

// Remove Nav
document.addEventListener("fullscreenchange", function () {
  const isFullscreen = Boolean(document.fullscreenElement)
  document.body.classList.toggle("fullscreen", isFullscreen)
})

document.addEventListener("DOMContentLoaded", function () {
  var navIcon = document.getElementById("nav-icon")
  var navBar = document.getElementById("right-side-nav")
  const activeIframe = document.querySelector("#iframe-container iframe.active")

  console.log(navIcon)
  navIcon.addEventListener("click", function () {
    console.log("Nav icon clicked")

    var isOpen = navBar.classList.toggle("hidden")
    this.classList.toggle("open")
    if (isOpen) {
      activeIframe.style.top = "5%"
    } else {
      activeIframe.style.top = "13%"
    }
  })
})

if (navigator.userAgent.includes("Chrome")) {
  window.addEventListener("resize", function () {
    navigator.keyboard.lock(["Escape"])
  })
}

// Decode URL
function decodeXor(input) {
  if (!input) return input
  let [str, ...search] = input.split("?")

  return (
    decodeURIComponent(str)
      .split("")
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char))
      .join("") + (search.length ? "?" + search.join("?") : "")
  )
}

function Load() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe && document.readyState === "complete") {
    const website = activeIframe.contentWindow.document.location.href

    if (website.includes("/a/")) {
      const websitePath = website.replace(window.location.origin, "").replace("/a/", "")
      const decodedValue = decodeXor(websitePath)
      document.getElementById("is").value = decodedValue
      localStorage.setItem("decoded", decodedValue)
    } else if (website.includes("/a/q/")) {
      const websitePath = website.replace(window.location.origin, "").replace("/a/q/", "")
      const decodedValue = decodeXor(websitePath)
      document.getElementById("is").value = decodedValue
      localStorage.setItem("decoded", decodedValue)
    } else {
      const websitePath = website.replace(window.location.origin, "")
      document.getElementById("is").value = websitePath
      localStorage.setItem("decoded", websitePath)
    }
  }
}
