const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true, // optional
    },
    mobile: {
        type: String,
        required: true, // optional
    },
    address: {
        type: String,
        required: true,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true, // fixed typo here
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
    },
    isVoted: {
        type: Boolean,
        default: false,
    },
});

userSchema.pre('save', async function (next) {
    const person = this;

    if (!person.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        person.password = await bcrypt.hash(person.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model('user', userSchema);
module.exports = User;
