const  jwt = require('jsonwebtoken');
const JWT_SECRET = 'UserIsValidated';


const fetchUser = (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        res.status(401).send({error: "Please authenticate using valid token"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();    
    } 
    catch (error) {
        res.status(401).send({error: "Please authenticate using valid token"});
    }
}



module.exports = fetchUser;