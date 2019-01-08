class HitObject
{
    // see https://osu.ppy.sh/help/wiki/osu!_File_Formats/Osu_(file_format)#hit-objects

    constructor(str)
    {
        var csvArr = str.split(',');
        this.x =        parseInt(csvArr[0]);
        this.y =        parseInt(csvArr[1]);
        this.time =     parseInt(csvArr[2]);
        this.type =     parseInt(csvArr[3]);
        this.hitsound = parseInt(csvArr[4]);
        this.extras = csvArr[csvArr.length-1];

        this.isSlider = (2 == (2 & this.type));
        this.isSpinner = (8 == (8 & this.type));

        // slider only
        //this.sliderType;
        //this.curvePoints;
        //this.repeat;
        //this.pixelLength;
        //this.edgeHitsounds;
        //this.edgeAdditions;

        // spinner only
        //this.endTime;
        
        if(this.isSlider)
        {
            var sliderStuff = csvArr[5].split('|');
            this.sliderType = sliderStuff[0];
            this.curvePoints = new Array;
            var i;
            for(i = 1; i < sliderStuff.length; ++i)
            {
                this.curvePoints.push(new SliderNode(sliderStuff[i]));
            }
            this.repeat = csvArr[6];
            this.pixelLength = csvArr[7];
            this.edgeHitsounds = csvArr[8];
            this.edgeAdditions = csvArr[9];

            if(!this.edgeAdditions)
            {
                this.extras = null;
            }
        }
        
        if(this.isSpinner)
        {
            this.endTime = parseInt(csvArr[5]);
        }
    }

    toStr()
    {
        var retStr = this.x + "," + this.y + "," + this.time + "," + this.type + "," + this.hitsound;
        if(this.isSpinner)
        {
            retStr += "," + this.endTime;
        }
        else if(this.isSlider)
        {
            retStr += "," + this.sliderType;
            var i;
            for(i = 0; i < this.curvePoints.length; ++i)
            {
                retStr += "|" + this.curvePoints[i].x + ":" + this.curvePoints[i].y;
            }
            retStr += "," + this.repeat + "," + this.pixelLength;
            if(!this.edgeHitsounds){ return retStr; }
            retStr += "," + this.edgeHitsounds;
            if(!this.edgeAdditions){ return retStr; }
            retStr += "," + this.edgeAdditions;
        }
        if(!this.extras){ return retStr; }
        retStr += "," + this.extras;

        return retStr;
    }

    scale(scalar)
    {
        this.x = Math.floor(this.x * scalar);
        this.y = Math.floor(this.y * scalar);
        if(this.isSlider)
        {
            var i;
            for(i = 0; i < this.curvePoints.length; ++i)
            {
                this.curvePoints[i].x = Math.floor(this.curvePoints[i].x * scalar);
                this.curvePoints[i].y = Math.floor(this.curvePoints[i].y * scalar);
            }
            this.pixelLength = (this.pixelLength * scalar).toPrecision(15); // this is the only float
        }
        return this;
    }
}

class SliderNode
{
    constructor(xyStr)
    {
        var temp = xyStr.split(':');
        this.x = parseInt(temp[0]);
        this.y = parseInt(temp[1]);
    }
}

module.exports = {HitObject};