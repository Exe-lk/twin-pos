import axios from "axios";

const PostDataService = async (endpoint: string, data: any) => {
    try {
        const baseURL = `http://localhost:8090/`;
        const response = await axios.post(baseURL + endpoint, data);
      
        
        return response;
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error; // Re-throwing error for handling outside
    }
};

export default PostDataService;