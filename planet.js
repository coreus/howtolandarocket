class Planet
{   
    //mass (kg)
    //radius (m)
    constructor(mass,radius)
    {
        this.mass = mass;
        this.radius = radius;
        this.g = 6.674184 * Math.pow(10,-11) * this.mass / Math.pow(this.radius,2);
    }

    getGravitationalAcceleration(altitude)
    {
        return 6.674184 * Math.pow(10,-11) * this.mass / Math.pow(this.radius + altitude,2);
    }


    //for lift
    getAtmosphereViscosity(altitude)
    {
        return this.interpolate(this.getAtmosphereViscosityData(),altitude);
    }

    getAtmosphereViscosityData()
    {
        return [];
    }

    //for drag
    getAtmosphereDensity(altitude)
    {
        return this.interpolate(this.getAtmosphereDensityData(),altitude);
    }

    getAtmosphereDensityData()
    {
        return [];
    }
    
    interpolate(datas,altitude){
        var minAltitude;
        var maxAltitude;
        altitude = Math.round(altitude);
        if(datas[altitude] != undefined)
        {
            return datas[altitude];
        }
        if(altitude>0){
            //get closest defined min value
            var tmpAltitude = altitude;
            while(datas[tmpAltitude] == undefined)
            {
                tmpAltitude--;
            }
            minAltitude = tmpAltitude;
        }
        if(altitude<80000){
            //get closest defined min value
            var tmpAltitude = altitude;
            while(datas[tmpAltitude] == undefined)
            {
                tmpAltitude++;
            }
            maxAltitude = tmpAltitude;
        }
        return datas[minAltitude] + (datas[maxAltitude] - datas[minAltitude]) / (maxAltitude - minAltitude) * (altitude - minAltitude)    
    }
}


class Earth extends Planet
{
    constructor()
    {
        super(5.972 * Math.pow(10,24),6.371 * Math.pow(10,6));
    }
    getAtmosphereViscosityData()
    {
        //https://www.engineeringtoolbox.com/standard-atmosphere-d_604.html
        var datas = new Array();
        datas[0]= 1.225;
        datas[1000] = 1.112;
        datas[2000] = 1.007;
        datas[3000] = 0.9093;	
        datas[4000] = 0.8194;	
        datas[5000] = 0.7364;	
        datas[6000] = 0.6601;	
        datas[7000] = 0.5900;	
        datas[8000] = 0.5258;	
        datas[9000] = 0.4671;	
        datas[10000] = 0.4135;	
        datas[15000] = 0.1948;	
        datas[20000] = 0.08891;	
        datas[25000] = 0.04008;	
        datas[30000] = 0.01841;	
        datas[40000] = 0.003996;
        datas[50000] = 0.001027;
        datas[60000] = 0.0003097;
        datas[70000] = 0.00008283;
        datas[80000] = 0.00001846;
        return datas;
    }

    getAtmosphereDensityData()
    {
        //https://www.engineeringtoolbox.com/standard-atmosphere-d_604.html
        var datas = new Array();
        datas[0]= 1.225;
        datas[1000] = 1.112;
        datas[2000] = 1.007;
        datas[3000] = 0.9093;	
        datas[4000] = 0.8194;	
        datas[5000] = 0.7364;	
        datas[6000] = 0.6601;	
        datas[7000] = 0.5900;	
        datas[8000] = 0.5258;	
        datas[9000] = 0.4671;	
        datas[10000] = 0.4135;	
        datas[15000] = 0.1948;	
        datas[20000] = 0.08891;	
        datas[25000] = 0.04008;	
        datas[30000] = 0.01841;	
        datas[40000] = 0.003996;
        datas[50000] = 0.001027;
        datas[60000] = 0.0003097;
        datas[70000] = 0.00008283;
        datas[80000] = 0.00001846;
        return datas;
    }
}