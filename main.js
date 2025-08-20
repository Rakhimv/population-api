import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto("https://stat.uz/uz", {
    waitUntil: "domcontentloaded",
  });


  const woman = await page.$eval(
    "div.woman",
    (el) => el.innerText
  );
  const man = await page.$eval(
    "div.man",
    (el) => el.innerText
  )
  const people = await page.$eval(
    "div.people",
    (el) => el.innerText
  )


  let data = {
    people: people,
    man: man,
    woman: woman
  }
  fs.writeFileSync("population.json", JSON.stringify(data))

  await browser.close();
})();
