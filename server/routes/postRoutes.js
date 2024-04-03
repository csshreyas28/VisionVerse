import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

// Get all posts
router.route('/').get(async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetching posts failed, please try again'})
    }
});

//Create a Post
router.route('/').post(async (req, res) => {
    try {
        // console.log("body: ", req.body)
        const { name, prompt, photo } = req.body;
        
        // Split the base64-encoded image to remove the data URL prefix
        const imageData = photo.split(';base64,').pop();
        const imageBuffer = Buffer.from(imageData, 'base64');
        // Create a new Promise that wraps the asynchronous image upload operation
        const photoUrl = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) {
                        reject(error); // Reject the Promise if there's an error
                    } else {
                        resolve(result.url); // Resolve the Promise with the uploaded image URL
                    }
                }
            ).end(imageBuffer);
        });

        console.log("photoUrl: ", photoUrl)
        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl,
        });
        res.status(200).json({ success: true, data: newPost });
    } catch (error) {
        res.status(500).json({ success: false, message:'Unable to create a post, please try again'})
    }
});


export default router;