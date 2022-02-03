const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const regex = new RegExp(/\<\%.+?include\(\"(.+)\"\).+?\%\>/gim);
const viewsPath = path.join(__dirname, "..", "views");
const outPath = path.join(__dirname, "..", "out");
const publicPath = path.join(__dirname, "..", "public");

console.log("Scanning files...");

if(!fs.existsSync(viewsPath) || !fs.lstatSync(viewsPath).isDirectory()) {
    console.log("Views folder does not exist!");
    return;
}

const files_ = fs.readdirSync(viewsPath);
const folders = [];
var files = [];

if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);

for (var i = 0; i < files_.length; i++) {
    if (fs.lstatSync(path.join(viewsPath, files_[i])).isDirectory()) {
        folders.push(path.join(viewsPath, files_[i]));
    } else {
        files.push(path.join(viewsPath, files_[i]));
    }
}

console.log("Starting compilation...");

for (var i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Compiling ${file}...`);
    var content = fs.readFileSync(file, { encoding: "utf-8" }).toString();
    var match = regex.exec(content);
    while (match != null) {
        content = content.replace(
            match[0],
            fs
                .readFileSync(
                    path.join(
                        viewsPath,
                        match[1] + (match[1].endsWith(".ejs") ? "" : ".ejs")
                    )
                )
                .toString()
        );
        match = regex.exec(content);
    }
    fs.writeFileSync(
        path.join(
            outPath,
            files[i].replace(viewsPath, "").replace(".ejs", ".html")
        ),
        content
    );
}

console.log("Copying assets...");

if (fs.existsSync(publicPath)) {
    const publicFiles = fs.readdirSync(publicPath);
    for (var i = 0; i < publicFiles.length; i++) {
        const file = path.join(publicPath, publicFiles[i]);
        const targetFile = path.join(outPath, publicFiles[i]);
        fse.copySync(file, targetFile);
    }
}

console.log("Done!");
