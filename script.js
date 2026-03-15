(function(){
emailjs.init("");
})();

let latitude=0;
let longitude=0;

let countdown=10;
let timer;

let audioCtx;
let oscillator;

let map;


// MAP
function initMap(){

map=L.map("map").setView([17.3850,78.4867],13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
maxZoom:19
}).addTo(map);

navigator.geolocation.getCurrentPosition(function(pos){

latitude=pos.coords.latitude;
longitude=pos.coords.longitude;

map.setView([latitude,longitude],16);

L.marker([latitude,longitude]).addTo(map)
.bindPopup("Your Location")
.openPopup();

});

}

initMap();


// BUZZER
function startBuzzer(){

audioCtx=new(window.AudioContext||window.webkitAudioContext)();

oscillator=audioCtx.createOscillator();
oscillator.type="square";

oscillator.frequency.setValueAtTime(900,audioCtx.currentTime);

oscillator.connect(audioCtx.destination);
oscillator.start();

}


function stopBuzzer(){

if(oscillator){

oscillator.stop();
oscillator.disconnect();

}

}


// COUNTDOWN
function startCountdown(level){

countdown=10;

startBuzzer();

timer=setInterval(function(){

document.getElementById("countdownText").innerText=
"Sending alert in "+countdown+" seconds";

countdown--;

if(countdown<0){

clearInterval(timer);
stopBuzzer();

sendAlert(level);

}

},1000);

}


// EMAIL SAVE
function saveEmails(){

let e1=document.getElementById("email1").value;
let e2=document.getElementById("email2").value;
let e3=document.getElementById("email3").value;

let emails=[e1,e2,e3];

localStorage.setItem("contacts",JSON.stringify(emails));

document.getElementById("emailSection").style.display="none";
document.getElementById("editBtn").style.display="block";

}


function editEmails(){

document.getElementById("emailSection").style.display="block";
document.getElementById("editBtn").style.display="none";

}


// LOAD EMAILS
window.onload=function(){

let stored=localStorage.getItem("contacts");

if(stored){

document.getElementById("emailSection").style.display="none";
document.getElementById("editBtn").style.display="block";

}

};


// SEND ALERT
function sendAlert(level){

let severity="";

if(level===1) severity="Minor Accident";
if(level===2) severity="Moderate Accident";
if(level===3) severity="Severe Accident";

let mapLink="https://maps.google.com/?q="+latitude+","+longitude;


let contacts=JSON.parse(localStorage.getItem("contacts"))||[];


contacts.forEach(function(email){

if(email){

emailjs.send("","",{

severity:severity,
location:mapLink,
time:new Date().toLocaleString(),
to_email:email

});

}

});


// TWILIO CALL
fetch("http://localhost:3000/call",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

phone:"+919177253782",
severity:severity

})

});

alert("Emergency alerts sent");

}