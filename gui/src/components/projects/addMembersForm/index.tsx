import {Input} from "../../ui/input";
import styles from "./style.module.scss";
import React, {useEffect, useState} from "react";
import {Button, ButtonType} from "../../ui/button";
import {useUserContext} from "../../../contexts/users.context.tsx";
import {CloseIcon} from "../../ui/icons";
import type {IMemberRequest} from "../../../models/user.models.ts";

export interface IAddMembersFormProps {
    members: IMemberRequest[];
    setMembers: React.Dispatch<React.SetStateAction<IMemberRequest[]>>;
}

export const AddMembersForm = ({members, setMembers}: IAddMembersFormProps) => {
    const {searchAvailableMembers} = useUserContext();
    const [searchUserValue, setSearchUserValue] = useState<string>("");
    const [foundUsers, setFoundUsers] = useState<IMemberRequest[]>([]);
    const [_, setDebouncedInputValue] = React.useState("")

    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebouncedInputValue(searchUserValue);
        }, 500);
        return () => {
            handleSearchUser();
            clearTimeout(delayInputTimeoutId);
        };
    }, [searchUserValue, 500])

    useEffect(() => {
        handleSearchUser();
    }, []);

    const handleSearchUser = () => {
        searchAvailableMembers(searchUserValue).then((foundUsers) => {
            setFoundUsers(foundUsers);
        })
    }

    const filterFoundUsers = () => {
        return foundUsers?.filter((user) => {
            return !members.find((member) => {
                return member.id === user.id
            })
        });
    }

    const addMember = (member: IMemberRequest) => {
        if (members.find((m) => m.id === member.id)) {
            console.log("member already added");
            return
        }

        setMembers([
            ...members,
            member
        ]);
    }

    const removeMember = (id: number) => {
        setMembers(members.filter((member) => member.id !== id));
    }

    return (
        <div className={styles.add_members_form}>
            <ul className={styles.added_members_list}>
                {members.map((user: IMemberRequest, index: number) => (
                    <li key={index}>
                        <span>{user.username}</span>
                        <button onClick={() => removeMember(user.id)}
                                className={styles.remove_button}>{CloseIcon()}</button>
                    </li>
                ))}
            </ul>

            <div className={styles.search_header}>
                <div className={styles.input_wrapper}>
                    <Input
                        id={"searchUser"}
                        value={searchUserValue}
                        handleInput={(e: Event) => setSearchUserValue((e.target as HTMLInputElement).value)}
                        placeholder={"Search User..."}
                    />
                </div>

                <div className={styles.button_wrapper}>
                    <Button text={"Search User"} callback={() =>handleSearchUser()} />
                </div>
            </div>

            <ul className={styles.user_list}>
                {filterFoundUsers().map((user: IMemberRequest, index: number) => (
                    <li className={styles.user_list_items} key={index}>
                        <div className={styles.user_metadata}>
                            <p>{user.username}</p>
                            <p>{user.email}</p>
                        </div>
                        <div className={styles.button_wrapper}>
                            <Button type={ButtonType.Outline} text={"Add"} callback={() => addMember(user)}/>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}