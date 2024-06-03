import express from "express";
import { PrismaClient } from "@prisma/client";

const app: express.Application = express();

const prisma: PrismaClient = new PrismaClient();

const portti: number = 3001;

app.set("view engine", "ejs");

let jarjesta: string = "kunta";
let suunta: "asc" | "desc" = "asc";

app.get("/", async (req: express.Request, res: express.Response) => {

  let hakusana = req.query.search?.toString() || "";

  if (req.query.sortBy && req.query.sortBy.toString() !== jarjesta) {
    suunta = "asc";
  } else {
    suunta = suunta === "asc" ? "desc" : "asc";
  }


  jarjesta = req.query.sortBy?.toString() || jarjesta;

  const arvot = await prisma.kunta.findMany({
    where: {
      kunta: {
        startsWith: hakusana,
      },
    },
    orderBy: {
      [jarjesta]: suunta,
    },
  });

  const yhteensaKuntia = arvot.length;
  const yhteensaAsukkaita = arvot.reduce((acc, cur) => acc + cur.asukkaatYhteensa, 0);
  const keskiarvoAsukkaat = yhteensaAsukkaita / yhteensaKuntia;

  const yhteensaNaisia = arvot.reduce((acc, cur) => acc + cur.asukkaatNaiset, 0);
  const prosenttiNaiset = (yhteensaNaisia / yhteensaAsukkaita) * 100 || 0;

  res.render("index", {
    data: {
      yhteensaKuntia,
      keskiarvoAsukkaat,
      prosenttiNaiset,
      kunnat: arvot,
    }, jarjesta, suunta
  });
});



app.listen(portti, () => {

  console.log(`Palvelin käynnistyi porttiin http://localhost:${portti}`);

})