const express = require('express');
const router = express.Router();
const User  = require('../AppData/Models/User.js');
const asset = require('../Config/global_helper.js')

router.get('/:id', async (req, res) => {
    try {
        res.locals.asset = asset;
        const userId = req.params.id;
        const users = await User.findByPk(userId);
        res.render('User',users);
    } catch (error) {
        console.error('Error querying users:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        res.locals.asset = asset;
        const users = await User.findByPk(1);
        console.log(users);
        const plainUsers = users.get({ plain: true }); // Chuyển đổi thành đối tượng JavaScript
        console.log(plainUsers);
        const userJson = users.toJSON();
        res.render('User',{ users: plainUsers});
    } catch (error) {
        console.error('Error querying users:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;