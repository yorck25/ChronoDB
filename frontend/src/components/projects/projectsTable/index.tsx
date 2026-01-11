import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import type {IProjectWithUsers} from "../../../models/projects.models.ts";
import TableContainer from "@mui/material/TableContainer";
import styles from "./style.module.scss";
import {useConfigContext} from "../../../contexts/connection-types.context.tsx";
import type {IUsersForProjectResponse} from "../../../models/user.models.ts";
import {useState} from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useLocation, useNavigate} from "react-router-dom";
import type {TargetedMouseEvent} from "preact";
import {EllipsisVerticalIcon} from "../../ui/icons";

export const ProjectsTable = ({projects}: { projects: IProjectWithUsers[] }) => {
    const {connectionTypes} = useConfigContext();
    const navigate = useNavigate();
    let location = useLocation()

    const renderMembers = (users: IUsersForProjectResponse) => {
        const amountOfIcons: number = 5;

        return (
            <div className={styles.members_container}>

                {users.firstFiveMembers?.slice(0, amountOfIcons).map((member: string) => (
                    renderMember(member[0])
                ))}

                {users.totalCount > amountOfIcons && (
                    renderMember("+" + (users.totalCount - amountOfIcons))
                )}
            </div>
        )
    }

    const renderMember = (key: string) => {
        const colors = ["#eb4034", "#9fd631", "#bf26c9", "#539667"];
        const random = Math.floor(Math.random() * colors.length);

        return (
            <div className={styles.profile_image_container} style={{background: colors[random]}}>
                {key.toUpperCase()}
            </div>
        );
    }

    const getConnectionType = (connectionTypeId: number): string => {
        if (!connectionTypes) {
            return "null";
        }

        const connectionType = connectionTypes.find(ct => ct.id === connectionTypeId);
        if (!connectionType) {
            return "null";
        }

        return connectionType.typeName;
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleMenuOpen = (event: MouseEvent, id: number) => {
        setAnchorEl((event as TargetedMouseEvent<HTMLElement>).currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = (
        e: MouseEvent
    ) => {
        const target = e.currentTarget as HTMLButtonElement;
        const {id} = target;

        console.log(selectedId)

        if (id === "open") {
            navigate(location.pathname + `/${selectedId}`);
        }

        if (id === "edit") {
            console.log("edit project");
        }

        setAnchorEl(null);
        setSelectedId(null);
    };

    return (
        <div className={styles.projects_table}>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align={"left"}>Description</TableCell>
                            <TableCell align={"left"}>Connection Type</TableCell>
                            <TableCell align={"left"}>Members</TableCell>
                            <TableCell align={"left"}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects?.map((row: IProjectWithUsers) => (
                            <TableRow
                                key={row.project.id}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell align={"left"} component="th" scope="row">
                                    {row.project.name}
                                </TableCell>
                                <TableCell align={"left"}>{row.project.id}</TableCell>
                                <TableCell align={"left"}>{row.project.description}</TableCell>
                                <TableCell align={"left"}>{getConnectionType(row.project.connectionType)}</TableCell>
                                <TableCell align={"left"}>{renderMembers(row.users)}</TableCell>
                                <TableCell align={"left"}>
                                    <span
                                        className={styles.option_button}
                                        onClick={(e) => handleMenuOpen(e, row.project.id)}>
                                        {EllipsisVerticalIcon()}
                                    </span>

                                    <Menu
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        open={openMenu}
                                        onClose={handleMenuClose}
                                        slotProps={{
                                            list: {
                                                'aria-labelledby': 'basic-button',
                                            },
                                        }}
                                    >
                                        <MenuItem id={"open"} onClick={handleMenuClose}>Open</MenuItem>
                                        <MenuItem id={"edit"} onClick={handleMenuClose}>Edit</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}