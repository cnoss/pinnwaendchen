const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Jimp = require('jimp');


/** Config
 --------------------------------------------------------------------------- */

const config = {};

config.paths = {};
config.paths.src = [
  "/Users/cnoss/sciebo/EMI"
];

config.paths.target = "/Users/cnoss/git/privat/pinnwaendchen/assets/images/pool";
config.suffixes = [
  'jpg',
  'jpeg',
  'png'
];

config.output = {};
config.output.width = 1200;
config.output.quality = 85;
config.output.brightness = 0;
config.output.contrast = 0;

config.mode = "";


/** Functions
 --------------------------------------------------------------------------- */

async function copyImages(source, target) {
  let cmd = `rsync -av ${source}/ ${target}/`;
  let ret = await exec(cmd, (error, stdout, stderr) => {
    return (stdout ? stdout : stderr);
  });
  return ret.stdout;
}

async function copyImages(source, target) {
  let cmd = `rsync -av ${source}/ ${target}/`;
  let { stdout, stderr } = await exec(cmd);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  return await stdout;
}

async function convert(images, width, quality) {
  await Promise.all(
    images.map(async (imgPath) => {
      const image = await Jimp.read(imgPath);
      await image.resize(width, Jimp.AUTO);
      await image.brightness(config.output.brightness);
      await image.contrast(config.output.contrast);

      await image.quality(quality);
      await image.writeAsync(imgPath);
    })
  );
};

async function scaleImages(path) {
  let cmd = `find ${path} -type f`;
  let { stdout, stderr } = await exec(cmd);
  let files = stdout.split(/\n/);
  let pattern = new RegExp(config.suffixes.join("$|") + "$", 'i');

  let images = [];
  files.forEach(file => {
    if (file.match(pattern)) {
      images.push(file);
    }
  });

  convert(images, config.output.width, config.output.quality );
}


/** Main
 --------------------------------------------------------------------------- */

let args = process.argv;
config.mode = (args[2]) ? args[2] : "";

let sources = config.paths.src;
sources.forEach((src) => {
  copyImages(src, config.paths.target)
    .then((stdout) => {
      console.log(stdout);
      console.log("Dateien kopiert :)");
    }).then(
      () => {
        if (config.mode !== "raw") { 
          scaleImages(config.paths.target);
          console.log("Bilder skalieren …");
        }
      }
    )
    .catch(e => console.log(e));
});