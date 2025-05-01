class ExpressError extends Error
{
    //here we are making our own custom error
    constructor (statusCode,message)
    {
        super();
        this.statusCode=statusCode;
        this.message=message;
    }
}

module.exports=ExpressError;