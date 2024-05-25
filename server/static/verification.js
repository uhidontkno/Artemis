

function failVerif(reason) {
    let s = document.querySelector("object").contentDocument
s.querySelector("#big-star").style.animation = "none"
s.querySelector("#small-star").style.animation = "none"
setTimeout(()=>{
s.querySelector("#big-star").style.animation="1.5s cubic-bezier(0.18, 0.89, 0.04, 1.5) bigstar"
s.querySelector("#small-star").style.animation="1.5s cubic-bezier(0.65, 0.05, 0.36, 1) bigstar"
s.querySelector("#big-star").style.stroke = "#e78284"
s.querySelector("#small-star").style.stroke = "#e78284"
s.querySelector("#moon").style.stroke = "#e78284"
document.querySelector("h1").style.color = "#e78284"
document.querySelector("h1").style.animation = "shake 0.82s cubic-bezier(.36,.07,.19,.97) both"
},100)
document.querySelector("h1").innerText = reason;
document.title = "Verification Failed | Artemis"
}

function successVerif() {
let s = document.querySelector("object").contentDocument
s.querySelector("#big-star").style.animation = "none"
s.querySelector("#small-star").style.animation = "none"
setTimeout(()=>{
s.querySelector("#big-star").style.animation="1.5s cubic-bezier(0.18, 0.89, 0.04, 1.5) bigstar"
s.querySelector("#small-star").style.animation="1.5s cubic-bezier(0.65, 0.05, 0.36, 1) bigstar"
s.querySelector("#big-star").style.stroke = "#a6d189"
s.querySelector("#small-star").style.stroke = "#a6d189"
s.querySelector("#moon").style.stroke = "#a6d189"
document.querySelector("h1").style.color = "#a6d189"
},100)
document.querySelector("h1").innerText = "Success! You can now close this tab.";
document.title = "Verification Successful | Artemis"
}
setTimeout(async ()=>{
    if (document.location.pathname == "/verification.html") {
        failVerif("Invalid path.");return
    } else {
        let res = await fetch(document.location.pathname + "exists")
        if (await res.text() == "false") {
            failVerif("Invalid/expired verification code");return
        }
    }
    setTimeout(async ()=>{
    
        // cookie check
        if (document.cookie.indexOf("43616368652E5665726966696564") != -1) {
            failVerif("You already verified");return
        }

        // user agent check
        let ua = window.navigator.userAgent
        if (
            // we're on webkit
            ((window.webkitCancelAnimationFrame !== undefined || Math.hypot(-24.42, -50.519999999999925) == 56.1124478168614) && (!ua.includes("Chrome/") || !ua.includes("AppleWebKit/"))) || 
            // we're on gecko
            ((window.webkitCancelAnimationFrame == undefined || Math.hypot(-24.42, -50.519999999999925) != 56.1124478168614) && (!ua.includes("Firefox/") || !ua.includes("Gecko/"))
        )) {
            failVerif("Your user agent seems to be spoofed.");return
        }

        // vpn check
        let res = await fetch("/api/isvpn")
        if (await res.text() == "true") {
            failVerif("Please disable your VPN");return
        }
        // double check using an ip service
        i = await fetch("https://ip.rare1k.workers.dev")
        res = await fetch(`/api/isvpn/${await i.text()}`)
        if (await res.text() == "true") {
            failVerif("Please disable your VPN");return
        }

        // incognito check
        detectIncognito().then((result) => {
            if (result.isPrivate) {
                failVerif("Incognito Mode detected")
            }; return
          });
    
          successVerif()
          document.cookie = `43616368652E5665726966696564=y+${Math.floor(Date.now()).toString(16)}; expires=${new Date(new Date().setFullYear(9999)).toUTCString()}; path=/`;
    },750)
        
    
    
},100)