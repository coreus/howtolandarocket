class Vector
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }

    getLength()
    {
        return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
    }

    getAngle()
    {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;
    }
    set(x,y)
    {
        this.x = x;
        this.y = y;
        return this;
    }

    setX(x)
    {
        this.x = x;
        return this;
    }

    setY(y)
    {
        this.y = y;
        return this;
    }

    add(vector)
    {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    
}


class VectorMath
{
    static mul(vector,value)
    {
        return new Vector(vector.x * value,vector.y * value);
    }
}