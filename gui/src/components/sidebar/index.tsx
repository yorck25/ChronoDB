import { Link, useNavigate } from "react-router-dom";
import style from "./style.module.scss";
import { useAppContext } from "../../contexts/app.context";
import { LogoutIcon } from "../ui/icons";
import { Input, InputType } from "../ui/input";
import { useState } from "react";

export const Sidebar = () => {
  const { logout } = useAppContext();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={style.sidebar}>
      <div className={style.top_container}>
        <div className={style.search_bar}>
          <Input
            id={"search"}
            inputType={InputType.TEXT}
            value={searchValue}
            placeholder={"Search"}
            handleInput={(e: Event) =>
              setSearchValue((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div className={style.divider} />
      </div>

      <div className={style.nav_list}>
        <nav>
          <ul>
            <li>
              <Link to="/projects">projects</Link>
            </li>
          </ul>
        </nav>

        <nav>
          <ul>
            <li onClick={() => handleLogout()}>
              <LogoutIcon />
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
