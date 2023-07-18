const NewsController = require('../controllers/NewsController');
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
router.post('/addnew' , upload.single('image') , NewsController.Add_new);

router.post('/updatenew_image' , upload.single('image') , NewsController.Update_new_image);

router.get('/listnew' , NewsController.List_new);

router.get('/listnew_id/:id' , NewsController.get_new);

router.get('/newfeed' , NewsController.NewFeed);

router.post('/findnewcategory' , NewsController.Find_new_Category);

router.get('/findnewcategory/:_id' , NewsController.Find_new_Category_get);

router.get('/findnewcategorylimit/:_id' , NewsController.Find_new_Category_get_limit);

router.get('/listnew/:slug' , NewsController.One_new);

router.post('/updatenew' , NewsController.Update_new);

router.post('/delnew' , NewsController.Del_new);

router.get('/outstanding' , NewsController.Outstanding);

router.get('/findnew/:slug' , NewsController.Find_new_slug);

router.post('/tim-kiem' , NewsController.Tim_kiem );

router.get('/soluongbaiviet' , NewsController.So_luong);

module.exports = router ;