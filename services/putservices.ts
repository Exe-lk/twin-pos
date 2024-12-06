import axios from "axios";

const PutDataService = async (endoint: string, data: any) => {
    try {
        const baseURL = `http://localhost:8090/`
        await axios.put(baseURL + endoint, data)
            .then((res: any) => {
              console.log(res.status)
                 return res.status
            })
            .catch((err) => {
                return err
            })

    } catch (error) {
        console.error('Error fetching data: ', error);

    }
}
export default PutDataService;