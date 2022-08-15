class Rocket extends Body
{
    //rocket is approximated as a cylinder with a center of mass in the middle (intersection of diagionals)
    //radius (meters)
    //height (meters)
    //dryMass (kg)
    //propellantMass (kg)
    constructor(radius,height, dryMass, propellantMass)
    {
        super(dryMass+propellantMass);
        this.radius = radius;
        this.height = height;
        this.dryMass = dryMass;
        this.propellantMass = propellantMass;
        //https://www.grc.nasa.gov/www/k-12/airplane/kiteincl.html
        this.dragCoefficient = 0.82; // https://en.wikipedia.org/wiki/Drag_coefficient
        this.engines = new Array();
        this.throttleRate = 0;
    }

    getDragCoefficient()
    {
        //cylinder from bottom (flat circle)
        if(this.pitchAngle == 0){
            return 1.1;
        }
        //cylinder from side
        if(this.pitchAngle == 90){
            return 0.82;
        }
        //edge
        return 0.80;
    }

    getCrossSectionalArea()
    {
        if(this.pitchAngle == 0){
            return Math.PI * this.radius * this.radius
        }
        if(this.pitchAngle == 90){
            return this.radius * 2 * this.height;
        }
        // https://www.quora.com/What-is-the-formula-for-calculating-the-cross-sectional-area-of-a-cylinder
        return this.radius * this.radius * Math.sin(this.radianPitchAngle) * Math.PI
    }
    
    addEngine(engine)
    {
        this.engines.push(engine);
        this.maxThrust = this.calcultateMaxThrust();
        this.maxConsumption = this.calcultateMaxConsumption();
    }
    pitch(angle)
    {
        this.pitchAngle += angle;
        this.pitchAngle = this.pitchAngle % 360;
    }

    calcultateMaxThrust()
    {
        return this.engines.reduce((previousThrust,currentEngine)=>previousThrust + currentEngine.maxThrust,0);
    }
    calcultateMaxConsumption()
    {
        return this.engines.reduce((previousConsumption,currentEngine)=>previousConsumption + currentEngine.fuelConsumption,0);
    }
    throttleEngines(rate)
    {
        this.throttleRate += rate;
        if(this.throttleRate>100) this.throttleRate = 100;
        if(this.throttleRate<0) this.throttleRate = 0;
        if(this.propellantMass == 0)
        {
            this.throttleRate = 0;
        }
        return this;
    }
    getCurrentThrust()
    {
        return this.throttleRate * this.maxThrust / 100; //Newtons
    }
    getCurrentComsuption()
    {
        return this.throttleRate * this.maxConsumption / 100; 
    }
    //engine thrust
    getGeneratedForce()
    {
        return this.getCurrentThrust();
    }
    updatePropellantMass(step)
    {
        this.propellantMass -= this.getCurrentComsuption() * step;
        this.setMass(this.dryMass + this.propellantMass);
    }
    setPropellantMass(mass)
    {
        this.propellantMass = mass;
        this.setMass(this.dryMass + this.propellantMass);
    }
    getTelemetry()
    {
        var telemetry = super.getTelemetry();
        telemetry['propellantMass'] = this.propellantMass;
        telemetry['pitchAngle'] = this.pitchAngle;
        telemetry['throttleRate'] = this.throttleRate;
        return telemetry;
    }
    setTelemetry(telemetry)
    {
        this.propellantMass = telemetry['propellantMass'];
        this.mass = this.dryMass + this.propellantMass;
        this.pitchAngle = telemetry['pitchAngle'];
        this.throttleRate = telemetry['throttleRate'];
    }
}