const path = require('path');
const fs = require('fs');
const UglifyJS = require("uglify-js");

/*
    Arguments:
        filePath: The relative file path of files that need to be minified.
        fileType: Type of file (currently the system supports only js files).
        finalDestination: The relative file path where the minified files need to be stored.
*/
const minifyFiles = (globalPath, filePath, fileType, finalDestination) => {
    if(fileType != ".js"){
        return console.log("The system currently supports only minification of JavaScript files, whereas the requested file type is " + fileType);
    }

    let currentFilePath = path.join(globalPath, filePath);
    
    fs.readdir(currentFilePath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan the given file path, hence could not process minification of files: ' + err);
        }

        //listing all files using forEach
        files.forEach(function (file) {
            var stats = fs.statSync(path.join(currentFilePath, file));

            /* If file is directory, then use recursion. */
            if(!stats.isFile()){
                minifyFiles(
                    globalPath,
                    path.join(filePath, file),
                    '.js',
                    path.join(finalDestination, file),
                );
            }

            if(path.extname(file) != ".js"){
                return;
            }

            var result = UglifyJS.minify(fs.readFileSync(path.join(globalPath, filePath, file), "utf8"), {
                mangle: true,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                }
            });

            if (fs.existsSync(path.join(globalPath, finalDestination, file))) {
                //file exists
                fs.unlinkSync(path.join(globalPath, finalDestination, file));
            }

            fs.writeFile(path.join(globalPath, finalDestination, file), result.code, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("Minified file: " + path.join(globalPath, finalDestination, file));
                }
            });
        });

        console.log("Minified folder: " + currentFilePath);
    });
}

module.exports = minifyFiles;