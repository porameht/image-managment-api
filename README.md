# Image Generator Service

A powerful image processing service built with Bun, Elysia, and Cloudinary that provides various image manipulation capabilities.

## Features

- Image upload to Cloudinary
- Image optimization
- Automatic image cropping
- Background replacement with AI-generated scenes
- Video upload to Cloudinary
- Video optimization
- Video watermarking
- File to URL conversion
- RESTful API endpoints
- Swagger documentation
- CORS support

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Cloudinary account with API credentials

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/image-generator-service.git
   cd image-generator-service
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Cloudinary credentials:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Usage

1. Start the server:
   ```
   bun run start
   ```

2. The server will start running on `http://localhost:3000`.

3. Access the Swagger documentation at `http://localhost:3000/swagger` to explore and test the API endpoints.

## API Endpoints

- `POST /upload`: Upload an image to Cloudinary
- `POST /optimize`: Get an optimized version of an image
- `POST /autocrop`: Automatically crop an image to specified dimensions
- `POST /replace-background`: Replace the background of an image with an AI-generated scene
- `POST /add-watermark-video`: Add a watermark to a video

For detailed information on request/response formats, refer to the Swagger documentation.

## Testing

Run the test suite with:
