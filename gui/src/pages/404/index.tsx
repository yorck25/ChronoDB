import { useNavigate } from "react-router-dom";

export const Page404 = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>404 - Seite nicht gefunden</h1>
            <p>Die von Ihnen angeforderte Seite existiert nicht.</p>

            <button onClick={() => navigate("/")}>
                Zur Startseite
            </button>
        </div>
    )
}