const fs = require("fs");
const c = require("./classes");
const readline = require("readline");

const rl = readline.createInterface(
{
    input: process.stdin,
    output: process.stdout
});

const mapFileName = "map.osu";

// - - - - - - - - - - - - - - - - - - - - - - - - -

rl.question("Enter your desired Circle Size: ", (input) => 
{
    var desCS = parseFloat(input);
    if(Number.isNaN(desCS) || desCS > 10 || desCS < 0)
    {
        // terminate if the input couldn't be parsed to a float
        console.log("Invalid input! \"" + input + "\" is not a valid Circle Size.");
        console.log("The valid range of CS values is 0-10.");
        process.exit();
    }
    console.log("Your desired CS is " + desCS);

    // read in map.osu as a string
    var ogMap;
    try
    {
        var ogMapBuffer = fs.readFileSync(mapFileName);
        ogMap = ogMapBuffer.toString();
    }
    catch(error)
    {
        console.log("Error: map.osu not found!");
        console.log("Please put a copy of your map in the same directory as this script.");
        process.exit();
    }

    // replace old CS
    var ogCS = parseFloat(ogMap.slice(ogMap.indexOf("CircleSize:") + "CircleSize:".length));
    ogMap = ogMap.replace("CircleSize:"+ogCS, "CircleSize:"+desCS);

    // calculate scalar
    var scalar = csToDiameter(desCS) / csToDiameter(ogCS);

    console.log("Your original CS is " + ogCS);
    console.log("Your scalar is " + scalar);

    // replace old SliderMultiplier with scaled
    var sliderMult =  parseFloat(ogMap.slice(ogMap.indexOf("SliderMultiplier:") + "SliderMultiplier:".length));
    var newSliderMult = (sliderMult*scalar).toPrecision(15);
    ogMap = ogMap.replace("SliderMultiplier:"+sliderMult, "SliderMultiplier:"+(newSliderMult));
    if(newSliderMult < 0.4)
    {
        console.log("Warning: Your resulting SliderMultiplier of " + newSliderMult + " is less than the minimum of 0.4!")
        console.log("The resulting map will have broken sliders!");
    }    

    // duplicate map.osu to a file named map_[scalar].osu
    const newFileName = "map_cs" + desCS + ".osu";
    //fs.copyFileSync(mapFileName, newFileName);

    // get an array of all hitobjects from the map string and scale each one
    var hitObjSecTitle = "[HitObjects]";
    var startIndex = hitObjSecTitle.length + ogMap.indexOf(hitObjSecTitle);
    var objStrArr = ogMap.slice(startIndex).trim().split(/\r?\n/);
    ogMap = ogMap.slice(0, startIndex).trim() + "\r\n"; // remove the old HitObjects section from the map string
    var i;
    for(i = 0; i < objStrArr.length; ++i)
    {
        // insert the new scaled hitobjects into the map string
        ogMap += (new c.HitObject(objStrArr[i])).scale(scalar).toStr() + "\r\n";
    }

    // write the map string into the new file that was generated
    fs.writeFileSync(newFileName, ogMap, "utf8");

    rl.close();
});

const k = 0.0825;
const d_0 = 143;
function csToDiameter(cs)
{
    return (d_0 * (1 - k * cs));
}