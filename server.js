const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// --- Twilio credentials ---
const accountSid = "AC59c81856f60619c048ce106ccc2099ba";
const authToken = "5bdefe76acf0bc2861aba4d1733978d6";
const twilioNumber = "+16562548009"; // your Twilio number

const client = twilio(accountSid, authToken);

// Health route
app.get("/", (req, res) => {
  res.send("Accident Alert Server Running");
});

// Call API
app.post("/call", async (req, res) => {
  const { phone, severity, latitude, longitude } = req.body;

  try {
    const message = `
      Emergency alert.
      ${severity ? severity + "." : ""}
      Accident detected.
      Please check the email for the map link immediately.
    `;

    const call = await client.calls.create({
      twiml: `<Response>
                <Say voice="alice">${message}</Say>
              </Response>`,
      to: phone,
      from: twilioNumber
    });

    console.log("Call started:", call.sid);
    res.send("Call triggered");
  } catch (err) {
    console.error(err);
    res.status(500).send("Call failed");
  }
});

// Start server
app.listen(PORT, () => {
  console.log("\n==============================");
  console.log("🚨 Accident Alert System");
  console.log("==============================");
  console.log(`Backend Server : http://localhost:${PORT}`);
  console.log("Web App        : http://127.0.0.1:5500");
  console.log("==============================\n");
});