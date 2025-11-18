#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

function parseFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  const entries = {};

  $("div[id]").each((_, div) => {
    const $div = $(div);
    const id = $div.attr("id")?.trim();
    if (!id) return;

    const name = $div.find("h2").first().text().trim() || id;

    // Grab description text before <h3>Settings:
    let description = "";
    const h3 = $div.find("h3").first();
    if (h3.length > 0) {
      let prev = h3.prev();
      while (prev.length > 0) {
        if (prev.is("p") || prev.is("div") || prev.is("span")) {
          description = prev.text().trim() + " " + description;
        }
        prev = prev.prev();
      }
      description = description.trim();
    }

    // Settings
    const settings = [];
    $div.find("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 5) return;
      settings.push({
        name: $(tds[0]).text().trim(),
        type: $(tds[1]).text().trim(),
        description: $(tds[2]).text().trim(),
        required: $(tds[3]).text().toLowerCase().includes("true"),
        default: $(tds[4]).text().trim(),
      });
    });

    // Example JSON
    let example = undefined;
    const pre = $div.find("pre.json-snippet").first();
    if (pre.length > 0) {
      try {
        example = JSON.parse(pre.text());
      } catch {
        example = pre.text().trim();
      }
    }

    entries[id] = {
      id,
      name,
      description,
      settings,
      example,
    };
  });

  return entries;
}

function main() {
  const [inputDir, outputFile] = process.argv.slice(2);
  if (!inputDir || !outputFile) {
    console.error("Usage: node build-docs.js <inputDir> <outputFile>");
    process.exit(1);
  }

  const categories = {};
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".html"));

  for (const file of files) {
    const category = path.basename(file, ".html");
    const entries = parseFile(path.join(inputDir, file));
    categories[category] = entries;
  }

  fs.writeFileSync(outputFile, JSON.stringify(categories, null, 2), "utf8");
  console.log(`✅ Built docs.json with categories: ${Object.keys(categories).join(", ")}`);
}

if (require.main === module) {
  main();
}
