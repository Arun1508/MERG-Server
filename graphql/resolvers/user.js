const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const {SECRET_KEY} = require('../../config');
const {UserInputError } = require('apollo-server')
const {validateRegisterInput, validateLoginInput} = require('../../utils/validators')

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '12h'});
}

module.exports = {
    Mutation: {

        async login( _, {username, password}){
            //validate user Input
            const {errors, valid } = validateLoginInput(username, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
              }

            //find the user 
            const user = await User.findOne({ username });
            if(!user){
                errors.general = `User not found`;
                throw new UserInputError('User not found', { errors })
            }
            
            //Password check
            //const match = await bcrypt.compare(password, user.password);
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = "Invalid password";
                throw new UserInputError('Wrong credentials', { errors })
            }

            //token generation
            console.log("generating token");
            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },

        async register( _, 
            { registerInput : { username, email, password, confirmPassword }}, 
            context, 
            info
            ){
          
                // To vaild user data
                const { errors, valid } = validateRegisterInput(username, email, password, confirmPassword);
                console.log(`Error ${errors} valid ${valid}`);
                if(!valid){
                    throw new UserInputError('Errors', {errors} );
                }
                
                //user is unique 
                console.log(`in username validation ${username}`);
                const user = await User.findOne({ username });
                if (user){
                    throw new UserInputError('User name already exist',{
                     error:{
                         username: 'This is username is already taken'
                     }   
                    })
                }

                //password hashing 
                password = await bcrypt.hash(password, 12);
                
                //New user creation 
                const newUser = new User({
                    email,
                    username,
                    password,
                    createdAt: new Date().toISOString()
                    });
 
                const res = await newUser.save();

                //token creation 
                const token = generateToken(res);

                // hash password $ token return 
                 return {
                    ...res._doc,
                    id: res._id,
                    token
                  };
                }
            },
            
            
    }
