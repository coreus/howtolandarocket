class Body
{
    constructor(mass)
    {
        this.mass = mass;
        this.acceleration = new Vector(0,0);
        this.speed = new Vector(0,0);
        this.position = new Vector(0,0);
        this.setAngle(0);
    }

    setAcceleration(x,y)
    {
        this.acceleration.set(x,y);
    }

    setPosition(x,y)
    {
        this.position.set(x,y);
    }
    setMass(mass)
    {
        this.mass = mass;
    }
    //x (m.s^-1)
    //y (m.s^-1)
    setSpeed(x,y)
    {
        this.speed.set(x,y)
    }

    getGeneratedForce()
    {
        return 0;
    }
    //pitchAngle (degrees)
    setAngle(pitchAngle)
    {
        this.pitchAngle = pitchAngle;
        this.pitchAngle = this.pitchAngle % 360;
        this.radianPitchAngle = pitchAngle * Math.PI / 180;
    }

    getDragCoefficient()
    {
        return 1;
    }

    getCrossSectionalArea()
    {
        return 1;
    }
    
    getTelemetry()
    {
        //console.log(this.speed);
        //console.log({'speed':this.speed,'position':this.position});
        return {'speed':this.speed,'position':this.position}
    }
    setTelemetry(telemetry)
    {
        this.speed = telemetry['speed'];
        this.position = telemetry['position'];
    }
}