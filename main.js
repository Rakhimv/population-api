import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/population", async (req, res) => {
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

    res.json({ people, man, woman });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при парсинге" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
