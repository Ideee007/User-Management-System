const express = require('express');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRound = 10

app.use(express.json());

const db = async () => {
    try {
        mongoose.connect("mongodb://0.0.0.0:27017/TechzoneAssignment")
        console.log("database connection established");
    }catch(error) {
        console.log("Error connection to db")
    }
}

db()

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    const {userName, email, password} = req.body;

    const existingUser = await User.findOne({email: email})
    if(existingUser) {
        return res.status(400).send({message: 'User already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, saltRound )

    const user = new User({
        userName: userName,
        email: email,
        password: hashedPassword,

})

await user.save()
res.status(201).json({message: 'User registered successfully'})
})

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email: email});

        if(!user) {
            return res.status(404).json({message: 'User not found, kindly signup'})
        }

        const checkPassword = await bcrypt.compare (password, user.password)

        if(!checkPassword) {
            return res.status(404).json({message: 'Incorrect password provided'})
        }
        return  res.status(200).json({message: 'success user logged in'})
    } catch (error) {
        return res.status(500).json({message: 'internal server error'})
    }
})

app.get('/getUsers', async (req, res) => {
try {
    const users = await User.find({});
    if(!User) {
        return res.status(404).json({ message: 'No users found' });
    }
    return res.status(200).json({ message:'List of the users', users});
    }catch (error) {
        return res.status(500).json({message: 'internal server error'})
    }
})

app.put('/updateUser/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const {userName, email, password} = req.body
        
        const updatedUser = await User.findByIdAndUpdate(userId, {userName, email, password}, {new: true, runValidators: true});
        if(!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({  message: 'User updated successfully', updatedUser});
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

app.patch('/updatePartialUser/:id', async (req, res) => {
    
    try {
        const userId = req.params.id;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true, runValidators: true});
        if(!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

app.delete('/deleteUser/:id', async (req, res) => {
    try {
        const userId = req.params.id

        const user = await User.findByIdAndDelete(userId);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})