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
},100)
document.querySelector("h1").innerText = reason;
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
},100)
document.querySelector("h1").innerText = "Success! You can now close this tab.";
}