// Initialize EmailJS
(function(){
emailjs.init("FE3asbfTksLdyo8D0");
})();

let latitude = 0;
let longitude = 0;

let countdownTimer;
let countdown = 10;
let selectedLevel = 0;

let audioCtx;
let oscillator;

// Create map
let map = L.map('map').setView([20.5937,78.9629],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

// Custom icons
const userIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/64/64113.png",
iconSize:[35,35]
});

const hospitalIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/1484/1484846.png",
iconSize:[30,30]
});

const policeIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/2991/2991108.png",
iconSize:[30,30]
});

// Get GPS location
if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(function(position){

latitude = position.coords.latitude;
longitude = position.coords.longitude;

map.setView([latitude,longitude],15);

L.marker([latitude,longitude],{icon:userIcon})
.addTo(map)
.bindPopup("📍 Your Location")
.openPopup();

}, function(){

alert("Please allow location access");

});

}

// Start buzzer
function startBuzzer(){

audioCtx = new (window.AudioContext || window.webkitAudioContext)();

oscillator = audioCtx.createOscillator();

oscillator.type="square";
oscillator.frequency.setValueAtTime(900,audioCtx.currentTime);

oscillator.connect(audioCtx.destination);

oscillator.start();

}

// Stop buzzer
function stopBuzzer(){

if(oscillator){
oscillator.stop();
oscillator.disconnect();
}

}

// Show nearby hospitals
function showNearbyHospitals(){

let query=`[out:json];
(
node["amenity"="hospital"](around:5000,${latitude},${longitude});
);
out;`;

fetch("https://overpass-api.de/api/interpreter",{
method:"POST",
body:query
})
.then(res=>res.json())
.then(data=>{

data.elements.forEach(function(hospital){

let lat=hospital.lat;
let lon=hospital.lon;
let name=hospital.tags.name || "Hospital";

L.marker([lat,lon],{icon:hospitalIcon})
.addTo(map)
.bindPopup("🏥 "+name);

});

});

}

// Show nearby police stations
function showNearbyPolice(){

let query=`[out:json];
(
node["amenity"="police"](around:5000,${latitude},${longitude});
);
out;`;

fetch("https://overpass-api.de/api/interpreter",{
method:"POST",
body:query
})
.then(res=>res.json())
.then(data=>{

data.elements.forEach(function(police){

let lat=police.lat;
let lon=police.lon;
let name=police.tags.name || "Police Station";

L.marker([lat,lon],{icon:policeIcon})
.addTo(map)
.bindPopup("🚓 "+name);

});

});

}

// Start countdown
function startCountdown(level){

selectedLevel = level;
countdown = 10;

showNearbyHospitals();
showNearbyPolice();

document.getElementById("cancelBtn").style.display="inline";

startBuzzer();

countdownTimer = setInterval(function(){

document.getElementById("countdownText").innerText =
"Sending alert in "+countdown+" seconds...";

countdown--;

if(countdown < 0){

clearInterval(countdownTimer);

stopBuzzer();

document.getElementById("countdownText").innerText="";
document.getElementById("cancelBtn").style.display="none";

sendAlert(selectedLevel);

}

},1000);

}

// Cancel alert
function cancelAlert(){

clearInterval(countdownTimer);

stopBuzzer();

document.getElementById("countdownText").innerText="Alert cancelled";
document.getElementById("cancelBtn").style.display="none";

}

// Save contacts
function saveContacts(){

let email1=document.getElementById("email1").value;
let email2=document.getElementById("email2").value;
let email3=document.getElementById("email3").value;

let contacts=[email1,email2,email3];

localStorage.setItem("emergencyContacts",JSON.stringify(contacts));

document.getElementById("contactForm").style.display="none";
document.getElementById("savedContacts").style.display="block";

}

// Edit contacts
function editContacts(){

document.getElementById("contactForm").style.display="block";
document.getElementById("savedContacts").style.display="none";

}

// Load contacts
window.onload=function(){

let contacts=JSON.parse(localStorage.getItem("emergencyContacts"));

if(contacts){

document.getElementById("email1").value=contacts[0] || "";
document.getElementById("email2").value=contacts[1] || "";
document.getElementById("email3").value=contacts[2] || "";

document.getElementById("contactForm").style.display="none";
document.getElementById("savedContacts").style.display="block";

}

};

// Send alert
function sendAlert(level){

let contacts=JSON.parse(localStorage.getItem("emergencyContacts")) || [];

let emails=contacts.filter(e=>e!=="");

if(emails.length===0){
alert("Please add emergency contacts");
return;
}

let severity="";

if(level===1) severity="Minor Accident";
if(level===2) severity="Moderate Accident";
if(level===3) severity="Severe Accident";

let mapLink="https://maps.google.com/?q="+latitude+","+longitude;

emails.forEach(function(email){

emailjs.send("service_b3rkneb","template_rowixrk",{

severity:severity,
location:mapLink,
time:new Date().toLocaleString(),
to_email:email

});

});

alert("Emergency alert sent to contacts");

}
