/**
 * Local-only sync for `public/products/{category_slug}/{slug}/main.jpg`.
 *
 * No database, Supabase, or Postgres — edit `FALLBACK_PRODUCTS` below and run:
 *   npm run sync:product-folders
 *
 * Legacy folder moves (filesystem only; see LEGACY_CATEGORY_MOVES):
 *   jumpers-5in1  → five-in-one-jumpers
 *   jumpers-13x13 → regular-jumpers
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PRODUCTS_BASE = path.join(ROOT, "public", "products");

const USE_FALLBACK_PRODUCT_LIST = true;

const FALLBACK_PRODUCTS = [
  { category_slug: "combos", slug: "girl-double-slide-combo" },
  { category_slug: "combos", slug: "king-double-slide-combo" },
  { category_slug: "combos", slug: "multicolor-single-slide-combo" },
  { category_slug: "combos", slug: "palm-tree-double-slide-combo" },
  { category_slug: "disney-jumpers", slug: "frozen-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "justice-league-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "mickey-mouse-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "mickey-mouse-toddler-jumper" },
  { category_slug: "disney-jumpers", slug: "minnie-mouse-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "princess-3d-combo-jumper" },
  { category_slug: "disney-jumpers", slug: "princess-castle-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "spiderman-jumper-13x13" },
  { category_slug: "disney-jumpers", slug: "unicorn-jumper-13x13" },
  { category_slug: "eleven-by-eleven-jumpers", slug: "girl-colors-jumper-11x11" },
  { category_slug: "eleven-by-eleven-jumpers", slug: "multicolor-jumper-11x11" },
  { category_slug: "five-in-one-jumpers", slug: "block-party-5-en-1-jumper" },
  { category_slug: "five-in-one-jumpers", slug: "frozen-5-en-1-jumper" },
  { category_slug: "five-in-one-jumpers", slug: "girl-5-en-1-jumper" },
  { category_slug: "five-in-one-jumpers", slug: "multicolor-5-en-1-jumper" },
  { category_slug: "five-in-one-jumpers", slug: "sport-5-en-1-jumper" },
  { category_slug: "five-in-one-jumpers", slug: "unicorn-5-en-1-jumper" },
  { category_slug: "inflatable-games", slug: "3-in-1-inflatable-game" },
  { category_slug: "inflatable-games", slug: "baseball-game" },
  { category_slug: "inflatable-games", slug: "basketball-game" },
  { category_slug: "inflatable-games", slug: "boxing-ring" },
  { category_slug: "inflatable-games", slug: "football-game" },
  { category_slug: "inflatable-games", slug: "sport-zone-3-in-1-game" },
  { category_slug: "minicombo", slug: "girl-minicombo" },
  { category_slug: "minicombo", slug: "modular-multicolor-minicombo" },
  { category_slug: "minicombo", slug: "multicolor-minicombo" },
  { category_slug: "obstacle-course", slug: "26ft-girl-colors-obstacle-course" },
  { category_slug: "obstacle-course", slug: "26ft-multicolor-obstacle-course" },
  { category_slug: "obstacle-course", slug: "40ft-one-piece-obstacle-course" },
  { category_slug: "obstacle-course", slug: "40ft-two-piece-obstacle-course" },
  { category_slug: "obstacle-course", slug: "52ft-obstacle-course" },
  { category_slug: "regular-jumper-13x13", slug: "castle-multicolor-jumper-13x13" },
  { category_slug: "regular-jumper-13x13", slug: "castle-multicolor-jumper-13x13-option-2" },
  { category_slug: "regular-jumper-13x13", slug: "fun-multicolor-jumper-13x13" },
  { category_slug: "regular-jumper-13x13", slug: "girl-crown-jumper-13x13" },
  { category_slug: "regular-jumper-13x13", slug: "girl-jumper-13x13" },
  { category_slug: "regular-jumper-13x13", slug: "modular-girl-color-jumper-13x13" },
  { category_slug: "regular-jumper-13x13", slug: "modular-multicolor-jumper-13x13" },
  { category_slug: "waterslide", slug: "double-slide-waterslide-18ft" },
  { category_slug: "waterslide", slug: "rocky-island-waterslide-18ft" },
  { category_slug: "waterslide", slug: "wild-thing-waterslide-18ft" },
  { category_slug: "xtreme-disco-dome", slug: "xtreme-disco-dome" },
];

/** Canonical `category_slug` is `to`; merge/move from legacy folder `from` when `from/{slug}/` exists on disk. */
const LEGACY_CATEGORY_MOVES = [
  { from: "jumpers-5in1", to: "five-in-one-jumpers" },
  { from: "jumpers-13x13", to: "regular-jumpers" },
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  if (!fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Path exists but is not a directory: ${dirPath}`);
  }
  return false;
}

function rel(p) {
  return path.relative(ROOT, p);
}

function listSubdirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
}

function renamePathSafe(fromAbs, toAbs) {
  const fromNorm = path.resolve(fromAbs);
  const toNorm = path.resolve(toAbs);
  if (fromNorm === toNorm) return;

  const fromBase = path.basename(fromNorm);
  const toBase = path.basename(toNorm);

  if (fromBase.toLowerCase() === toBase.toLowerCase() && fromBase !== toBase) {
    const parent = path.dirname(fromNorm);
    const tmpName = `.tmp-rename-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const tmpAbs = path.join(parent, tmpName);
    fs.renameSync(fromNorm, tmpAbs);
    fs.renameSync(tmpAbs, toNorm);
    return;
  }

  fs.renameSync(fromNorm, toNorm);
}

function slugMatchesDir(dirName, expectedSlug) {
  const slugifyFs = (n) =>
    n
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  if (dirName === expectedSlug) return true;
  if (dirName.toLowerCase() === expectedSlug.toLowerCase()) return true;
  return slugifyFs(dirName) === expectedSlug;
}

function fileHasContent(stat) {
  return stat.isFile() && stat.size > 0;
}

/**
 * Prefer keeping `toAbs` non-empty payload; never overwrite meaningful dest with conflicting source.
 * @returns {boolean} merged something
 */
function mergeFilePreferDest(fromAbs, toAbs, log, label) {
  if (!fs.existsSync(fromAbs)) return false;

  const fromSt = fs.statSync(fromAbs);
  if (!fromSt.isFile()) return false;

  if (!fs.existsSync(toAbs)) {
    ensureDir(path.dirname(toAbs));
    try {
      fs.renameSync(fromAbs, toAbs);
    } catch {
      fs.copyFileSync(fromAbs, toAbs);
      fs.unlinkSync(fromAbs);
    }
    log.movedFiles.push(`${rel(fromAbs)} → ${rel(toAbs)} (${label})`);
    return true;
  }

  const toSt = fs.statSync(toAbs);
  if (!toSt.isFile()) throw new Error(`Expected file: ${toAbs}`);

  const fromReal = fileHasContent(fromSt);
  const toReal = fileHasContent(toSt);

  if (toReal && fromReal && path.basename(toAbs).toLowerCase() === "main.jpg") {
    log.conflicts.push(
      `${rel(fromAbs)} vs ${rel(toAbs)} (${label}; kept destination non-empty main.jpg, removed duplicate source)`,
    );
    fs.unlinkSync(fromAbs);
    return false;
  }

  if (toReal && fromReal && path.basename(toAbs).toLowerCase() !== "main.jpg") {
    log.conflicts.push(
      `${rel(fromAbs)} vs ${rel(toAbs)} (${label}; kept destination, removed duplicate source)`,
    );
    fs.unlinkSync(fromAbs);
    return false;
  }

  if (!toReal && fromReal) {
    fs.unlinkSync(toAbs);
    try {
      fs.renameSync(fromAbs, toAbs);
    } catch {
      fs.copyFileSync(fromAbs, toAbs);
      fs.unlinkSync(fromAbs);
    }
    log.movedFiles.push(`${rel(fromAbs)} → ${rel(toAbs)} (${label}, replaced empty dest)`);
    return true;
  }

  if (!fromReal && toReal) {
    fs.unlinkSync(fromAbs);
    return false;
  }

  fs.unlinkSync(fromAbs);
  return false;
}

function mergeProductDirs(fromDir, toDir, log, label) {
  if (!fs.existsSync(fromDir) || !fs.statSync(fromDir).isDirectory()) return;

  ensureDir(path.dirname(toDir));

  const toExists = fs.existsSync(toDir);
  if (!toExists) {
    try {
      renamePathSafe(fromDir, toDir);
      log.movedFolders.push(`${rel(fromDir)} → ${rel(toDir)} (${label})`);
      return;
    } catch {
      ensureDir(toDir);
      /* merge file-by-file */
    }
  } else if (fs.statSync(toDir).isDirectory() && fs.readdirSync(toDir).length === 0) {
    try {
      fs.rmdirSync(toDir);
      renamePathSafe(fromDir, toDir);
      log.movedFolders.push(`${rel(fromDir)} → ${rel(toDir)} (${label}, replaced empty)`);
      return;
    } catch {
      /* merge file-by-file into existing */
    }
  }

  ensureDir(toDir);

  const entries = fs.readdirSync(fromDir, { withFileTypes: true });
  for (const e of entries) {
    const fromP = path.join(fromDir, e.name);
    const toP = path.join(toDir, e.name);
    if (e.isDirectory()) {
      mergeProductDirs(fromP, toP, log, `${label}/${e.name}`);
      continue;
    }
    mergeFilePreferDest(fromP, toP, log, label);
  }

  tryRemoveEmptyTree(fromDir);
}

function tryRemoveEmptyTree(dir) {
  if (!fs.existsSync(dir)) return;
  const children = fs.readdirSync(dir);
  for (const c of children) {
    const p = path.join(dir, c);
    if (fs.statSync(p).isDirectory()) tryRemoveEmptyTree(p);
  }
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    try {
      fs.rmdirSync(dir);
    } catch {
      /* ignore */
    }
  }
}

function buildExpectedSet(products) {
  const byCat = new Map();
  const allCats = new Set();
  for (const { category_slug, slug } of products) {
    allCats.add(category_slug);
    if (!byCat.has(category_slug)) byCat.set(category_slug, new Set());
    byCat.get(category_slug).add(slug);
  }
  return { byCat, allCats };
}

function hasProduct(expected, category, slug) {
  return expected.byCat.get(category)?.has(slug) ?? false;
}

function main() {
  if (!USE_FALLBACK_PRODUCT_LIST) {
    console.error(
      "This script is configured for local FALLBACK_PRODUCTS only. Set USE_FALLBACK_PRODUCT_LIST = true.",
    );
    process.exitCode = 1;
    return;
  }

  const products = FALLBACK_PRODUCTS;
  if (!products.length) {
    console.error(
      "FALLBACK_PRODUCTS is empty. Add `{ category_slug, slug }` entries to this script.",
    );
    process.exitCode = 1;
    return;
  }

  const log = {
    createdFolders: [],
    movedFolders: [],
    movedFiles: [],
    missingMain: [],
    conflicts: [],
  };

  const expected = buildExpectedSet(products);
  ensureDir(PRODUCTS_BASE);

  for (const cat of expected.allCats) {
    const p = path.join(PRODUCTS_BASE, cat);
    if (ensureDir(p)) log.createdFolders.push(rel(p));
  }

  for (const { from: legacyCat, to: canonicalCat } of LEGACY_CATEGORY_MOVES) {
    const legacyBase = path.join(PRODUCTS_BASE, legacyCat);
    if (!fs.existsSync(legacyBase)) continue;

    ensureDir(path.join(PRODUCTS_BASE, canonicalCat));

    for (const slug of listSubdirs(legacyBase)) {
      if (!hasProduct(expected, canonicalCat, slug)) continue;

      const fromDir = path.join(legacyBase, slug);
      const toDir = path.join(PRODUCTS_BASE, canonicalCat, slug);

      if (!fs.existsSync(toDir)) {
        try {
          renamePathSafe(fromDir, toDir);
          log.movedFolders.push(`${rel(fromDir)} → ${rel(toDir)} (legacy category)`);
        } catch (e) {
          mergeProductDirs(fromDir, toDir, log, `legacy category ${legacyCat}→${canonicalCat}`);
        }
      } else {
        mergeProductDirs(fromDir, toDir, log, `legacy category ${legacyCat}→${canonicalCat}`);
      }
    }
  }

  for (const { category_slug: cat, slug } of products) {
    const catPath = path.join(PRODUCTS_BASE, cat);
    const targetDir = path.join(catPath, slug);
    const mainPath = path.join(targetDir, "main.jpg");

    const targetMissing = !fs.existsSync(targetDir);
    const targetNotDir =
      !targetMissing && !fs.statSync(targetDir).isDirectory();

    if (targetNotDir) {
      log.conflicts.push(
        `Expected product folder but path is not a directory: ${rel(targetDir)} — fix manually.`,
      );
    } else if (targetMissing) {
      const candidates = listSubdirs(catPath).filter((d) => slugMatchesDir(d, slug));
      if (candidates.length === 1) {
        const fromDir = path.join(catPath, candidates[0]);
        renamePathSafe(fromDir, targetDir);
        log.movedFolders.push(
          `${rel(fromDir)} → ${rel(targetDir)} (slug folder normalize)`,
        );
      } else if (candidates.length > 1) {
        log.conflicts.push(
          `Multiple slug folders for ${cat}/${slug}: ${candidates.join(", ")} — fix manually.`,
        );
      } else if (ensureDir(targetDir)) {
        log.createdFolders.push(rel(targetDir));
      }
    } else {
      ensureDir(targetDir);
    }

    if (!fs.existsSync(mainPath)) {
      for (const { from: legacyCat, to: canonicalCat } of LEGACY_CATEGORY_MOVES) {
        if (canonicalCat !== cat) continue;
        const legacyMain = path.join(PRODUCTS_BASE, legacyCat, slug, "main.jpg");
        if (fs.existsSync(legacyMain)) {
          mergeFilePreferDest(legacyMain, mainPath, log, `residual ${legacyCat}/main.jpg`);
        }
      }
    }

    if (!fs.existsSync(mainPath)) {
      log.missingMain.push(`/products/${cat}/${slug}/main.jpg`);
    } else {
      const st = fs.statSync(mainPath);
      if (!fileHasContent(st)) {
        log.missingMain.push(`/products/${cat}/${slug}/main.jpg (empty file — replace with real JPG)`);
      }
    }
  }

  const orphanCategories = [];
  const orphanProducts = [];

  if (fs.existsSync(PRODUCTS_BASE)) {
    for (const name of listSubdirs(PRODUCTS_BASE)) {
      if (!expected.allCats.has(name)) {
        orphanCategories.push(rel(path.join(PRODUCTS_BASE, name)));
      }
    }

    for (const cat of expected.allCats) {
      const catPath = path.join(PRODUCTS_BASE, cat);
      if (!fs.existsSync(catPath)) continue;
      const want = expected.byCat.get(cat);
      if (!want) continue;
      for (const dirName of listSubdirs(catPath)) {
        if (!want.has(dirName)) {
          orphanProducts.push(rel(path.join(catPath, dirName)));
        }
      }
    }
  }

  console.log("\n=== sync-product-image-folders ===\n");
  console.log("(created folders)");
  console.log(log.createdFolders.length ? log.createdFolders.map((l) => `  - ${l}`).join("\n") : "  (none)");

  console.log("\n(moved folders)");
  console.log(log.movedFolders.length ? log.movedFolders.map((l) => `  - ${l}`).join("\n") : "  (none)");

  console.log("\n(moved files)");
  console.log(log.movedFiles.length ? log.movedFiles.map((l) => `  - ${l}`).join("\n") : "  (none)");

  console.log("\n(missing real main.jpg — add file locally)");
  console.log(log.missingMain.length ? log.missingMain.map((l) => `  - ${l}`).join("\n") : "  (none)");

  console.log("\n(conflicts / warnings)");
  console.log(log.conflicts.length ? log.conflicts.map((l) => `  - ${l}`).join("\n") : "  (none)");

  console.log("\n(orphan folders — not deleted)");
  if (!orphanCategories.length && !orphanProducts.length) {
    console.log("  (none)");
  } else {
    orphanCategories.forEach((l) => console.log(`  [category] ${l}`));
    orphanProducts.forEach((l) => console.log(`  [product ] ${l}`));
  }

  console.log(`\nProduct rows from FALLBACK_PRODUCTS: ${products.length}`);
  console.log(
    "\nImage paths convention: `/public/products/{category_slug}/{slug}/main.jpg` → URL `/products/.../main.jpg`.",
  );
}

try {
  main();
} catch (e) {
  console.error("[sync-product-image-folders]", e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
