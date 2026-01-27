import styles from './style.module.scss';
import type {IProject} from "../../../models/projects.models.ts";
import {Button, ButtonType} from "../../ui/button";
import {GearIcon, ReloadIcon} from "../../ui/icons";
import {useDbBrowserContext} from "../../../contexts/dbBrowser.context.tsx";

interface IHeaderProps {
    project: IProject | undefined;
}

export const Header = ({project}: IHeaderProps) => {
    const {createNewQueryTab} = useDbBrowserContext();


    const handleCreateQuery = () => {
        createNewQueryTab();
    }

    return (
        <div className={styles['database-browser-header']}>
            <div className={styles['database-path']}>
                {project && (
                    <>
                        <p className={styles['project-name']}>{project.name}</p>
                        <p className={styles['path-divider']}>/</p>
                        <p>PostgresSQL</p>
                        <p className={styles['path-divider']}>/</p>
                        <p>postgres</p>
                    </>
                )}
            </div>

            <div className={styles['control-buttons']}>
                <Button text={'Refresh'} icon={ReloadIcon()} type={ButtonType.Outline}></Button>
                <Button callback={handleCreateQuery} text={'New Query'} type={ButtonType.Outline}></Button>
                <Button text={'Settings'} icon={GearIcon()} type={ButtonType.Outline}></Button>
            </div>
        </div>
    )
}