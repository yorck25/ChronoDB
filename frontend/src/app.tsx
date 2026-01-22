import "./app.css";
import {AppContextProvider} from "./contexts/app.context";
import {ProjectContextProvider} from "./contexts/projects.context";
import {Router} from "./lib/router";
import {BrowserRouter} from "react-router-dom";
import {ConfigContextProvider} from "./contexts/connection-types.context.tsx";
import {UserContextProvider} from "./contexts/users.context.tsx";
import {DbBrowserContextProvider} from "./contexts/db-browser.context.tsx";

export function App() {
    return (
        <AppContextProvider>
            <BrowserRouter>
                <div className={"main"}>
                    <ConfigContextProvider>
                        <UserContextProvider>
                            <ProjectContextProvider>
                                <DbBrowserContextProvider>
                                <div className={"main_wrapper"}>
                                    <Router/>
                                </div>
                                </DbBrowserContextProvider>
                            </ProjectContextProvider>
                        </UserContextProvider>
                    </ConfigContextProvider>
                </div>
            </BrowserRouter>
        </AppContextProvider>
    );
}
