import axios from "axios";

const DeleteDataService = async (endoint: string) => {
    try {
        const baseURL = `http://localhost:8090/`
        await axios.delete(baseURL + endoint)
            .then((res: any) => {
              
                 return  res
            })
            .catch((err) => {
                return err
            })

    } catch (error) {
        console.error('Error fetching data: ', error);

    }
}
export default DeleteDataService;