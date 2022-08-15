class Landing extends Game
{
    constructor(planet,body,step)
    {
        super();
        this.planet = planet;
        this.body = body;
        
        this.time=0;
        this.step = step;

        this.actions = ['LEFT','RIGHT','UP','DOWN','NONE'];
        Landing.LEFT_ARROW = 37;
        Landing.RIGHT_ARROW = 39;
        Landing.UP_ARROW = 38;
        Landing.DOWN_ARROW = 40;
        Landing.NONE = 0;
        this.saveInitialState();
    }

    saveInitialState()
    {
        var telemetry = this.body.getTelemetry();

        this.initialBodyState = {'pos_x':telemetry['position'].x
                                ,'pos_y':telemetry['position'].y
                                ,'speed_x':telemetry['speed'].x
                                ,'speed_y':telemetry['speed'].y
                                ,'propellant':telemetry['propellantMass']
                                ,'throttle':telemetry['throttleRate']
                                ,'pitch':telemetry['pitchAngle']
                                };
    }
    // altitude (m)
    //return (N == kg.m/s²)
    calculateBodyForceVector()
    {
        var drag = 0.5 * this.planet.getAtmosphereDensity(this.body.position.y) * this.body.getDragCoefficient() * this.body.getCrossSectionalArea() * Math.pow(this.body.speed.getLength(),2);
        var y = drag * Math.sin( - this.body.speed.getAngle() * Math.PI / 180 ) + this.body.getGeneratedForce() * Math.sin( (- this.body.speed.getAngle() + this.body.pitchAngle) * Math.PI / 180 ) - this.body.mass * this.planet.getGravitationalAcceleration(this.body.position.y);
        var x = - Math.round(drag * Math.cos( this.body.speed.getAngle() * Math.PI / 180 )* 10000 ) / 10000 - Math.round(this.body.getGeneratedForce() * Math.cos( (this.body.speed.getAngle() + this.body.pitchAngle) * Math.PI / 180 )* 10000 ) / 10000;
        // https://publications.lib.chalmers.se/records/fulltext/199998/199998.pdf
        return new Vector(x,y);
    }

    calculateBodyAcceleration()
    {
        var force = this.calculateBodyForceVector();
        this.body.setAcceleration(force.x/this.body.mass,force.y/this.body.mass);
    }
    simulate()
    {
        this.calculateBodyAcceleration();
        this.body.speed.add(VectorMath.mul(this.body.acceleration,this.step));
        this.body.position.add(VectorMath.mul(this.body.speed,this.step));
        this.body.updatePropellantMass(this.step);
        this.time += this.step;
    }
    reset()
    {
        this.body.position.set(this.initialBodyState['pos_x'],this.initialBodyState['pos_y']);
        this.body.speed.set(this.initialBodyState['speed_x'],this.initialBodyState['speed_y']);
        this.body.acceleration.set(0,0);
        this.body.setPropellantMass(this.initialBodyState['propellant']);
        this.body.pitchAngle = this.initialBodyState['pitch'];
        this.body.throttleRate = this.initialBodyState['throttle'];
        this.time=0;
    }
    isOver()
    {
        return this.body.getTelemetry()['position'].y <=0;
    }
    isWon()
    {
        var telemetry = this.body.getTelemetry();
        return telemetry['speed'].y < 3 && telemetry['speed'].x < 1;
    }
    play(action)
    {
        switch(action)
        {
            case 'LEFT':
                this.body.pitch(10 * this.step);
                break;
            case 'RIGHT':
                this.body.pitch(-10 * this.step);
                break;
            case 'UP':
                this.body.throttleEngines(10 * this.step);
                break;
            case 'DOWN':
                this.body.throttleEngines(-10 * this.step);
                break;
            case 'NONE':
                break;
        }
        var state = this.getRawState();
        this.simulate();
        var nextState = this.getRawState();
        var reward = 0;
        //vertical reduction
        if(Math.pow(nextState[2],2)+Math.pow(nextState[3],2)<Math.pow(state[2],2)+Math.pow(state[3],2))
        {
            reward++;
        }
        else{
            reward--;
        }
        if(nextState[4]<state[4])
        {
            reward-=0.5;
        }
        if(this.isWon())
        {
            reward+=100;
        }
        else
        {
            reward-=100;
        }
        super.play(action);
        return reward;
    }
    getRawState()
    {
        var telemetry =  this.body.getTelemetry();
        return [telemetry['position'].x
                ,telemetry['position'].y
                ,telemetry['speed'].x
                ,telemetry['speed'].y
                ,telemetry['propellantMass']
                ,telemetry['throttleRate']
                ,telemetry['pitchAngle']
            ];
    }
    getState()
    {
        var telemetry =  this.body.getTelemetry();
        return [telemetry['position'].x / 500000
                ,telemetry['position'].y / 80000
                ,telemetry['speed'].x / 10000
                ,telemetry['speed'].y / 1000
                ,telemetry['propellantMass'] / 5000
                ,telemetry['throttleRate'] / 100
                ,telemetry['pitchAngle'] / 360
            ];
    }
    
}