import axios from "axios";

const GetDataService = async (endoint: string) => {
    try {
        const baseURL = `http://localhost:8090/`
        await axios.get(baseURL + endoint)
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
export default GetDataService;