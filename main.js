import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join("/tmp", "population.json");

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

async function fetchPopulation() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://stat.uz/uz", {
      waitUntil: "domcontentloaded",
    });

    const woman = await page.$eval("div.woman", (el) => el.innerText);
    const man = await page.$eval("div.man", (el) => el.innerText);
    const people = await page.$eval("div.people", (el) => el.innerText);

    await browser.close();

    const data = { people, man, woman, updated: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("Population обновлено:", data);
    return data;
  } catch (err) {
    console.error("Ошибка парсинга:", err);
  }
}

fetchPopulation();
setInterval(fetchPopulation, 5 * 60 * 1000);


app.get("/population", (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    res.sendFile(DATA_FILE);
  } else {
    res.json({ error: "Данные ещё не загружены" });
  }
});


app.get("/update", async (req, res) => {
  try {
    const data = await fetchPopulation();
    res.json({ status: "updated", data });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при обновлении" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

