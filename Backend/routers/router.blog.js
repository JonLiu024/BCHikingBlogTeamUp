const express = require('express');
const { createBlog, getAllBlogs, getBlogById, getBlogsByTrail,updateBlog, deleteBlog, getBlogsByUser } = require('../controllers/controller.blog');
const router = express.Router();



router.get('/', getAllBlogs);
router.get('/:userid', getBlogsByUser);
router.get('/:trailid', getBlogsByTrail);
router.get('/:blogid', getBlogById);


router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);



module.exports = router;