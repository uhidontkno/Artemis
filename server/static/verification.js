

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
setTimeout(()=>{
    if (document.cookie.indexOf("43616368652E5665726966696564") != -1) {
        failVerif("You already verified");return
    }
    
    detectIncognito().then((result) => {
        if (result.isPrivate) {
            failVerif("Incognito Mode detected")
        }; return
      });

      successVerif()
      document.cookie = `43616368652E5665726966696564=y+${Math.floor(Date.now()).toString(16)}; expires=${new Date(new Date().setFullYear(9999)).toUTCString()}; path=/`;
},500)
    

