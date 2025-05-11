import axios from 'axios';

const IMGBB_API_KEY = 'db3e6e11d31b50e5f32a03814f90fd42';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

const imageService = {
  /**
   * Upload an image to ImgBB
   * @param imageFile - The image file to upload
   * @returns Promise with the uploaded image URLs and data
   */
  async uploadImage(imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', imageFile);
      
      const response = await axios.post(IMGBB_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};

export default imageService;
