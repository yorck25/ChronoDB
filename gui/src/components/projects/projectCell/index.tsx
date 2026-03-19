import type {IProject} from "../../../models/projects.models.ts";
import style from "./style.module.scss";

export const ProjectCell = ({ project }: { project: IProject }) => {
    return (
        <div key={project.id} className={style.project_card}>
            <div className={style.project_header}>
                <h2 className={style.project_name}>{project.name}</h2>
            </div>
            <p className={style.project_description}>{project.description}</p>
            <div className={style.project_footer}>
                <button className={style.view_btn}>View</button>
                <button className={style.edit_btn}>Edit</button>
            </div>
        </div>
    );
};