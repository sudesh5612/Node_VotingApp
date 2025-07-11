const express = require('express');
const router = express.Router();
const  User = require('../models/user')
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// -------------------- SIGNUP --------------------
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        const newUser = new User(data);
        const response = await newUser.save();
        console.log('Data saved');

        const payload = {
            id: response.id,
        };

        const token = generateToken(payload);
        res.status(200).json({ response, token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
    try {
        const {  aadharCardNumber, password } = req.body;
        const user = await User.findOne({  aadharCardNumber:aadharCardNumber});

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = { id: user.id};
        const token = generateToken(payload);

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// -------------------- PROFILE (JWT Protected) --------------------
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// -------------------- UPDATE PERSON (JWT Protected) --------------------
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; // Extract the id from the token
        const {currentPassword,newPassword} = req.body;// Extract the current and new passwords from the request body

         //Find the user by userID
        const user= await User.findById(userId);
        
        // if password doesnot match, return error
        if ( !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
          
        // update the user's password
          user.password = newPassword;
          await user.save();
         console.log("password updated");
        res.status(200).json({message:'Password updated'});
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
