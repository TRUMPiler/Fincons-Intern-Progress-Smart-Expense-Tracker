import api from "../lib/axiosInstance";
import { useEffect, type FC } from "react";
import { useParams } from "react-router";

const verifyUser: FC = () => {
    const { id } = useParams();
    useEffect(() => {
        api.get(`/api/user/verify/${id}`, {
            headers: {
                Accept: "application/text"
            }
        }).then((response) => {
            if (response.status == 200) {
                window.location.href = "/login";
            }
            else
            {
                window.location.href="/Register";
            }
        }).catch((error) => {
            console.log(error);
        });

    }, [])
    return (
        <>

        </>
    );
}
export default verifyUser;