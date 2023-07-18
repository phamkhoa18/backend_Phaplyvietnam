const CategoriesController = require('../controllers/CategoriesController');
const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extname = path.extname(file.originalname);
      cb(null, uniqueSuffix + extname);
    }
  });
  
  const upload = multer({ storage: storage });

// router (đường dẫn)
router.post('/addcategory' , upload.single('background'), CategoriesController.Add_category);

router.get('/getCategories' , CategoriesController.getCategories);

// get one category 
router.get('/getcategory/:id' , CategoriesController.getOnecategory);

router.get('/listcategory' , CategoriesController.List_category);
// edit 
router.post('/edit_category' ,  upload.single('background'), CategoriesController.editCategory);
// del
router.post('/del_category' , CategoriesController.delCategory);
module.exports = router ;