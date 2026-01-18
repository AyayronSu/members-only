const db = require('../db/queries');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

exports.signUpGet = (req, res) => res.render('sign-up-form', { errors: null });

exports.signUpPost = [
    body('username').isEmail().withMessage('Must be a valid email').normalizeEmail(),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 chars'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('sign-up-form', { errors: errors.array() });
        }

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            await db.insertUser(
                req.body.first_name,
                req.body.last_name,
                req.body.username,
                hashedPassword
            );

            res.redirect('/log-in'); 
        } catch (err) {
            next(err);
        }
    }
];

exports.joinPost = async (req, res, next) => {
    const { passcode } = req.body;
    const SECRET_CODE = 'odin';

    if (passcode === SECRET_CODE) {
        try {
            await db.updateUserStatus(req.user.id);
            res.redirect('/');
        } catch (err) {
            next(err);
        }
    } else {
        res.render('join-form', { error: 'Wrong passcode!' });
    }
};