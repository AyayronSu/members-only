const db = require('../db/queries');
const bcrypt = require('bcryptjs');

exports.signUpGet = (req, res) => res.render('sign-up-form');

exports.signUpPost = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await db.insertUser(
            req.body.first_name,
            req.body.last_name,
            req.body.username,
            hashedPassword
        );

        res.redirect('/')
    } catch (err) {
        next(err);
    }
};

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

