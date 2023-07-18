const TypesController = require('../controllers/TypesController');
const router = require('express').Router();


// router (đường dẫn)

// THÊM 
router.post('/addtypes' , TypesController.add_Types);
// LIST
router.get('/listtypes' , TypesController.list_Types) ;

// GET ONE TYPE 
router.get('/listtypes/:id' , TypesController.getone_Types);

// EDIT
router.post('/edittypes' , TypesController.edit_Types);

// REMOVE
router.get('/deltypes/:id' , TypesController.del_Types);


module.exports = router ;