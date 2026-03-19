import { render } from "preact";
import "./styles/global.scss";
import { App } from "./app.tsx";

render(<App />, document.getElementById("app")!);
