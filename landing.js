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

        this.currentAtmoDensity = this.planet.getAtmosphereDensity(this.body.position.y);
        this.currentDragCoef = this.body.getDragCoefficient();
        this.currentCrossSection = this.body.getCrossSectionalArea();
        this.currentSpeed = this.body.speed.getLength();

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
        this.currentAtmoDensity = this.planet.getAtmosphereDensity(this.body.position.y);
        this.currentDragCoef = this.body.getDragCoefficient();
        this.currentCrossSection = this.body.getCrossSectionalArea();
        this.currentSpeed = this.body.speed.getLength();
        var drag = 0.5 * this.currentAtmoDensity * this.currentDragCoef * this.currentCrossSection * Math.pow(this.currentSpeed,2);
        //console.log('drag',this.body.getDragCoefficient(),this.planet.getAtmosphereDensity(this.body.position.y),this.body.getCrossSectionalArea(),this.body.pitchAngle,drag);
        var y = drag * Math.sin( - this.body.speed.getAngle() * Math.PI / 180 ) + this.body.getGeneratedForce() * Math.sin( (- this.body.speed.getAngle() + this.body.pitchAngle) * Math.PI / 180 ) - this.body.mass * this.planet.getGravitationalAcceleration(this.body.position.y);
        var x = - Math.round(drag * Math.cos( this.body.speed.getAngle() * Math.PI / 180 )* 10000 ) / 10000 - Math.round(this.body.getGeneratedForce() * Math.cos( (this.body.speed.getAngle() + this.body.pitchAngle) * Math.PI / 180 )* 10000 ) / 10000;
        
        // https://publications.lib.chalmers.se/records/fulltext/199998/199998.pdf
        return new Vector(x,y);
    }

    calculateBodyAcceleration()
    {
        var force = this.calculateBodyForceVector();
        //console.log(force);
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
        this.currentAtmoDensity = this.planet.getAtmosphereDensity(this.body.position.y);
        this.currentDragCoef = this.body.getDragCoefficient();
        this.currentCrossSection = this.body.getCrossSectionalArea();
        this.currentSpeed = this.body.speed.getLength();
        //console.log(this.currentAtmoDensity,this.currentDragCoef,this.currentCrossSection,this.currentSpeed);
        this.time=0;
    }
    isOver()
    {
        return this.body.getTelemetry()['position'].y <=0;
    }
    isWon()
    {
        var telemetry = this.body.getTelemetry();
        return Math.abs(telemetry['speed'].y) < 3 && Math.abs(telemetry['speed'].x) < 1;
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
        var speedDiff = Math.pow(nextState[2],2)+Math.pow(nextState[3],2)-Math.pow(state[2],2)-Math.pow(state[3],2);
        
        if(nextState[2] - state[2]>0)
        {
            reward -= 10;
        }
        reward += nextState[3] - state[3];
        //reward = 1000/(1+((Math.pow(nextState[2],2)+Math.pow(nextState[3],2))));
        //reward = Math.exp(1/(nextState[1]+1))/(1+this.currentSpeed);
        //reward-=speedDiff;
        //console.log('velocity reward',reward)
        /*
        if(speedDiff<0)
        {
            reward+=speedDiff;
        }
        else{
            reward-=5;
        }
        */
       
        if(nextState[6]<state[6])
        {
            reward-=1;
        }
        /*
       if(this.body.propellantMass == 0)
       {
            reward-=4;
       }
       */
       
        if(this.isOver()){
            reward += 100 - Math.sqrt(Math.pow(state[2],2)+Math.pow(state[3],2));
            if(state[8]==0)
            {
                reward+=50;
            }
            if(this.isWon())
            {
                reward+=1000;
                console.log(state,this.body.getTelemetry()['position'].y);
            }
            else{
                //reward-=1000;
            }
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
                ,this.currentAtmoDensity
                ,this.currentCrossSection
                ,telemetry['propellantMass']
                ,telemetry['throttleRate']
                ,telemetry['pitchAngle']
            ];
    }
    getState()
    {
        var telemetry =  this.body.getTelemetry();
        /*
        return [telemetry['position'].x
                ,telemetry['position'].y
                ,telemetry['speed'].x
                ,telemetry['speed'].y
                ,telemetry['propellantMass']
                ,telemetry['throttleRate']
                ,telemetry['pitchAngle']
            ];
        */
        return [telemetry['position'].x / 100000
                ,telemetry['position'].y / 80000
                ,telemetry['speed'].x / 10000
                ,telemetry['speed'].y / 1000
                ,this.currentAtmoDensity
                ,this.currentCrossSection / 400
                ,telemetry['propellantMass'] / 5000
                ,telemetry['throttleRate'] / 100
                ,telemetry['pitchAngle'] / 360
            ];
    }
    
}