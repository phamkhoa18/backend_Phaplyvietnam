const UsersController = require('../controllers/UsersController');
const router = require('express').Router();


// router (đường dẫn)
router.post('/register' , UsersController.Register);

router.post('/login' , UsersController.Login);

module.exports = router ;