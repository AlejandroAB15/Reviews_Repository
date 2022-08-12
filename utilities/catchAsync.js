//Async wrapper to handle errors and pass them to express error handler

module.exports = (func) => {
    return (req, res, next) => {
        func(req,res,next).catch(next);
    }
}