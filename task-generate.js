const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const packageJson = require("./package.json");
const archiver = require("archiver");
const {deleteAsync} = require("del");

const SOURCE_PATH = "src";
const TARGET_PATH = "packages";

/**
 * Prepares archive target folder
 * @returns {Promise<void>}
 */
async function init() {
  await deleteAsync(TARGET_PATH);
  await fsp.mkdir(TARGET_PATH);
}

/**
 * Updates manifest file so the browser extension can be registered
 * @returns {Promise<void>}
 */
async function updateManifest() {
  console.log("> Manifest is being updated");

  const manifestPath = path.join(SOURCE_PATH, 'manifest.json');
  const fileContent = await fsp.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(fileContent);

  manifest.version = packageJson.version;
  manifest.description = packageJson.description;
  manifest.homepage_url = packageJson.homepage;

  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log("✨ Manifest has been updated");
}

/**
 * Zips dist and source files for extension upload
 * @param {string} sourceFolder Glob patterns start folder name
 * @param {string[]} globs Globs (https://github.com/isaacs/node-glob#options)
 * @param {string[]} ignore Ignored globs (https://github.com/isaacs/node-glob#options)
 * @param {string} targetFileName Archive's file name
 * @returns {Promise<void>}
 */
async function archiveFiles(sourceFolder, globs, ignore = [], targetFileName) {
  return new Promise((resolve, reject) => {
    console.log(`> Creating ${targetFileName} archive`);

    const zipPath = `${TARGET_PATH}/${targetFileName}.zip`;
    const sourcePath = path.join(__dirname, sourceFolder);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: {
        level: 9
      }
    });

    output.on("close", function () {
      console.log("✨ Archive has been created");
      resolve();
    });

    archive.on("error", function (err) {
      reject(err);
    });
    archive.pipe(output);
    for (const glob of globs) {
      archive.glob(glob, {
        cwd: sourcePath,
        nodir: true,
        dot: true,
        ignore: ignore
      });
    }
    archive.finalize();
  });
}

/**
 * Main
 * @returns {Promise<void>}
 */
async function main() {
  console.log(":: Generating archives ::");

  await init();
  await updateManifest();
  await archiveFiles(SOURCE_PATH, ["**"], [], "package");
}

//run
main().catch((error) => {
  console.error(error);
});
