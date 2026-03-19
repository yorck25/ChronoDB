import {useState} from "preact/hooks";
import {useProjectContext} from "../../contexts/projects.context";
import type {
    ICreateProjectCredentialsRequest,
    ICreateProjectMembersRequest,
    ICreateProjectMetadataRequest,
    ICreateProjectRequest
} from "../../models/projects.models";
import styles from "./style.module.scss";
import {ProjectVisibilityType} from "../../enums/projects.enum.ts";
import {ProjectsTable} from "../../components/projects/projectsTable";
import type {IMemberRequest} from "../../models/user.models.ts";
import {ProjectStepper} from "../../components/projects/projectStepper";
import {Modal} from "../../components/ui/modal";
import {Button, ButtonType} from "../../components/ui/button";

export interface ICreateProjectFormData {
    projectName: string;
    description: string;
    visibility: ProjectVisibilityType;
    connectionType: string;
}

export interface ICreateProjectCredentialsData {
    projectPassword: string;
    databaseAuth: any;
}

export const ProjectsPage = () => {
    const {projects, createProject} = useProjectContext();

    const [newProjectData, setNewProjectData] = useState<ICreateProjectFormData>({
        projectName: "",
        description: "",
        visibility: ProjectVisibilityType.PRIVATE,
        connectionType: "",
    });

    const [newCredentialsData, setNewCredentialsData] = useState<ICreateProjectCredentialsData>({
        projectPassword: "",
        databaseAuth: {
            type: "psql",
            host: "",
            port: 5432,
            username: "",
            password: "",
            databaseName: "",
        },
    });

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const maxSteps = 2;
    const [step, setStep] = useState<number>(0);
    const [members, setMembers] = useState<IMemberRequest[]>([]);

    const openCreateProjectModal = () => {
        setIsCreateProjectModalOpen(true);
    }

    const closeCreateProjectModal = () => {
        setIsCreateProjectModalOpen(false);
    }

    const handleSubmit = () => {

        newCredentialsData.databaseAuth.port = String(newCredentialsData.databaseAuth.port);

        const cpmr: ICreateProjectMetadataRequest = {
            name: newProjectData.projectName,
            description: newProjectData.description,
            visibility: newProjectData.visibility,
            connectionType: Number(newProjectData.connectionType),
        }

        const cpcr: ICreateProjectCredentialsRequest = {
            projectPassword: newCredentialsData.projectPassword,
            databaseAuth: newCredentialsData.databaseAuth,
        }

        const cpmer: ICreateProjectMembersRequest = {
            members: members.map((member) => member.id),
        }

        const cpr: ICreateProjectRequest = {
            metadata: cpmr,
            credentials: cpcr,
            members: cpmer,
        }

        createProject(cpr).then((res) => {
            if (res) {
                clearCreateForm();
                closeCreateProjectModal();
            }
        });
    }

    const clearCreateForm = () => {
        setNewProjectData({
            projectName: "",
            description: "",
            visibility: ProjectVisibilityType.PRIVATE,
            connectionType: "",
        });
    }

    const getSubmitButtonText = (): string => {
        if (step === maxSteps) {
            return "Create Project";
        }

        return "Next";
    }

    const primaryButtonAction = (): void => {
        if (step === maxSteps) {
            return handleSubmit();
        }

        return setStep(prev => prev + 1);
    }

    const getCancelButtonText = (): string => {
        if (step === 0) {
            return "Cancel";
        }

        return "Back";
    }

    const cancelButtonAction = (): void => {
        if (step === 0) {
            return closeCreateProjectModal();
        }

        return setStep(prev => prev - 1);
    }


    return (
        <div className={styles.project_page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Projects</h1>

                <div className={styles.button_wrapper}>
                    <Button
                        text="New Project +"
                        callback={() => openCreateProjectModal()}
                        ariaLabel="new project"
                        type={ButtonType.Default}
                    />
                </div>
            </div>

            <div className={styles.table_wrapper}>
                {projects ? (
                    <ProjectsTable projects={projects}/>
                ): (
                    <div>No Projets to display.</div>
                )}
            </div>

            {isCreateProjectModalOpen && (
                <Modal
                    title="Create New Project"
                    hint="Don’t worry, you can always refactor it later... probably."
                    content={
                        <ProjectStepper
                            step={step}
                            members={members}
                            setMembers={setMembers}
                            newProjectData={newProjectData}
                            setNewProjectData={setNewProjectData}
                            newCredentialsData={newCredentialsData}
                            setNewCredentialsData={setNewCredentialsData}
                        />
                    }
                    footerType="double"
                    isOpen
                    submitButtonText={getSubmitButtonText()}
                    onSubmit={primaryButtonAction}
                    cancelButtonText={getCancelButtonText()}
                    onCancel={cancelButtonAction}
                    onClose={closeCreateProjectModal}
                />
            )}
        </div>
    )
}
