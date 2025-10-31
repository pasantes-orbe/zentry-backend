// classes/Uploader.ts
import cloudinary from '../config/cloudinary';
/*cloudinary.config({ 
    cloud_name: 'dkfzxplwp', 
    api_key: '811849389631469', 
    api_secret: '1t9pVJrklkNYfhi_JEPbqj5TZ_A' 
  });
*/

class Uploader {
  public async uploadImage(filePath: string, folder = 'uploads') {
    try {
      const response = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
      });
      return response;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }
}

export default Uploader;
