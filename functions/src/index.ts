import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

const serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-grafica-42e5b-default-rtdb.firebaseio.com",
});

const db = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response)=>{
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({message: "Hello from Firebase!!"});
});

export const getGOTY = functions.https.onRequest(async (request, response)=>{
  const gotyRef = db.collection("goty");
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());
  response.json(games);
});

const app = express();
app.use(cors({origin: true}));

app.get("/goty", async (req, res) => {
  const gotyRef = db.collection("goty");
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());
  res.json(games);
});

app.post("/goty/:id", async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection("goty").doc( id );
  const gameSnap = await gameRef.get();
  if ( !gameSnap.exists ) {
    res.status(404).json({
      ok: false,
      message: "No existe un juego con el ID " + id,
    });
  } else {
    const gameBefore = gameSnap.data() || {votes: 0};
    await gameRef.update({
      votes: gameBefore.votes + 1,
    });
    res.json({
      ok: true,
      message: `Gracias por tu voto a ${ gameBefore.name }`,
    });
  }
});

export const api = functions.https.onRequest(app);
