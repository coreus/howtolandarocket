class Engine
{
    constructor(isp,maxThrust)
    {
        this.isp = isp; //on earth ground
        this.maxThrust = maxThrust;
        this.fuelConsumption = this.calculateFuelConsumption();
    }

    // https://www.quora.com/What-makes-a-rocket-engines-Isp-depend-only-on-the-exhsaust-velocity-and-g0
    // https://www.reddit.com/r/SpaceXLounge/comments/kpklni/raptor_fuel_consumption_rate/
    calculateFuelConsumption()
    {
        return this.maxThrust / (this.isp * 9.80665);
    }
}