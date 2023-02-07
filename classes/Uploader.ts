import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ 
    cloud_name: 'dkfzxplwp', 
    api_key: '811849389631469', 
    api_secret: '1t9pVJrklkNYfhi_JEPbqj5TZ_A' 
  });

class Uploader {

    public async uploadImage(file: string){

        const response = await cloudinary.uploader.upload(file)
        return response;
    }


}

export default Uploader;