/**
 * Legacy static list — prefer:
 *
 *   npm run sync:product-folders
 *   (`scripts/sync-product-image-folders.js` — uses local `FALLBACK_PRODUCTS`; no DB.)
 *
 * Creates /public/products/{category}/{slug}/main.jpg placeholders for dropping images.
 *
 * Run from project root:
 *   node scripts/create-product-folders.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PRODUCTS_BASE = path.join(ROOT, "public", "products");

const PRODUCTS = [
  { category: "jumpers-5in1", slug: "block-party-5-en-1-jumper" },
  { category: "jumpers-5in1", slug: "frozen-5-en-1-jumper" },
  { category: "jumpers-5in1", slug: "girl-5-en-1-jumper" },
  { category: "jumpers-5in1", slug: "multicolor-5-en-1-jumper" },
  { category: "jumpers-5in1", slug: "sport-5-en-1-jumper" },
  { category: "jumpers-5in1", slug: "unicorn-5-en-1-jumper" },

  { category: "jumpers-13x13", slug: "classic-13x13-jumper" },
  { category: "jumpers-13x13", slug: "spiderman-13x13-jumper" },
  { category: "jumpers-13x13", slug: "princess-13x13-jumper" },

  { category: "waterslides", slug: "wild-thing-waterslide" },
  { category: "waterslides", slug: "tropical-waterslide" },

  { category: "combos", slug: "mini-combo-slide" },
  { category: "combos", slug: "mega-combo-slide" },
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

function main() {
  const baseCreated = ensureDir(PRODUCTS_BASE);
  if (baseCreated) {
    console.log(`Created ${path.relative(ROOT, PRODUCTS_BASE)}`);
  } else {
    console.log(`Exists  ${path.relative(ROOT, PRODUCTS_BASE)}`);
  }

  for (const { category, slug } of PRODUCTS) {
    const productDir = path.join(PRODUCTS_BASE, category, slug);
    const dirCreated = ensureDir(productDir);

    if (dirCreated) {
      console.log(`Created ${path.relative(ROOT, productDir)}`);
    }

    const mainPath = path.join(productDir, "main.jpg");
    if (!fs.existsSync(mainPath)) {
      fs.writeFileSync(mainPath, Buffer.alloc(0));
      console.log(`Created ${path.relative(ROOT, mainPath)} (empty placeholder)`);
    } else {
      console.log(`Skipped ${path.relative(ROOT, mainPath)} (already exists)`);
    }
  }

  console.log(`Done. ${PRODUCTS.length} product folder(s) processed.`);
}

main();
