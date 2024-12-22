const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Jimp = require('jimp');

const app = express();
const port = process.env.PORT || 3000; // Use the port Render assigns if deployed

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to enhance the image
app.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Read the image buffer with Sharp for resizing and basic manipulations
    const processedSharpImage = await sharp(req.file.buffer)
      .resize(800) // Resize for better quality
      .sharpen(2)  // Sharpen for better detail
      .normalize() // Remove noise
      .modulate({
        brightness: 1.4, // Increase brightness
        saturation: 1.3, // Enhance saturation
        contrast: 1.5, // Improve contrast
      })
      .toBuffer();

    // Now use Jimp to apply advanced effects such as denoising and refined glow
    const image = await Jimp.read(processedSharpImage);
    
    // Advanced Denoising with Jimp (Gaussian Blur)
    image.gaussian(2);  // A gentle blur to reduce noise

    // Dynamic Range Enhancement - Increase shadows and highlights
    image.contrast(0.3);  // Increase the contrast dynamically

    // Glow Effect - Create a subtle glowing effect around edges
    image.blur(4); // Apply a higher blur for a stronger glow effect
    image.tint(0x00ffcc); // Apply a soft blue-green glow effect (adjust as needed)

    // Save and send back the processed image
    const enhancedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

    // Set the response type to image/png and send the enhanced image
    res.setHeader('Content-Type', 'image/png');
    res.send(enhancedImageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the image' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Image enhancement API listening at http://localhost:${port}`);
});
