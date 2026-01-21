import type {IColumnStructureResponse} from "../../../models/database.models.ts";
import {EllipsisVerticalIcon, FontIcon, HashtagIcon, ToggleOffIcon} from "../../ui/icons";
import styles from "./style.module.scss";
import {Button, ButtonType} from "../../ui/button";

export const ColumnItem = ({column}: { column: IColumnStructureResponse }) => {
    const renderDataTypeIcon = (dt: string) => {
        const numericDts = new Set(['integer', 'int']);
        const alphabeticDts = new Set(['string', 'char']);
        const boolishDts = new Set(['bool', 'boolean']);

        if (numericDts.has(dt)) {
            return HashtagIcon();
        } else if (alphabeticDts.has(dt)) {
            return FontIcon();
        } else if (boolishDts.has(dt)) {
            return ToggleOffIcon();
        }

        return HashtagIcon();
    }

    return (
        <li className={styles['column-item']}>
            <div className={styles['column-info']}>
                <span className={styles['data-type-icon']}>{renderDataTypeIcon(column.dataType)}</span>
                <p className={styles['column-name']}>{column.columnName}</p>
            </div>

            <Button icon={EllipsisVerticalIcon()} type={ButtonType.Icon}/>
        </li>
    )
}