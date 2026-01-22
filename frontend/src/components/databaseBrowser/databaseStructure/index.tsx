import type {IProject} from "../../../models/projects.models.ts";
import styles from './style.module.scss';
import {useEffect, useState} from "react";
import type {IDatabaseStructureResponse} from "../../../models/database.models.ts";
import {useDatabaseWorkerContext} from "../../../contexts/databaseWorker.context.tsx";
import {SchemaItem} from "../schemaItem";
import {Input} from "../../ui/input";
import {MagnifyingGlasIcon} from "../../ui/icons";

interface IDatabaseStructureProps {
    project: IProject;
}

export const DatabaseStructure = ({project}: IDatabaseStructureProps) => {
    return (
        <div className={styles['database-structure']}>
            <StructureHeader/>

            <div className={styles.divider}/>

            <StructureList projectId={project.id}/>
        </div>
    )
}

const StructureHeader = () => {
    const [activeFilter, setActiveFilter] = useState<string>('');
    const [searchValue, setSearchValue] = useState<string>('');

    const setFilter = (filterKey: string) => {
        if (activeFilter === filterKey) {
            setFilter('');
            return;
        }

        setActiveFilter(filterKey);
    }

    const onSearchInput = (e: Event) => {
        setSearchValue((e.target as HTMLInputElement).value ?? "");
    }

    return (
        <div className={styles['structure-header']}>
            <p className={styles.headline}>Database Structure</p>

            <Input
                id="schemaFilter"
                placeholder="Filter schemas/tables..."
                value={searchValue}
                handleInput={onSearchInput}
                icon={MagnifyingGlasIcon()}
                iconPosition="leading"
            />

            <div className={styles['filter-list']}>
                <div onClick={() => setFilter('all')} className={styles['filter-item']}>
                    <span>All</span>
                    <span/>
                </div>

                <div onClick={() => setFilter('favourites')} className={styles['filter-item']}>
                    <span>Favourites</span>
                    <span/>
                </div>

                <div onClick={() => setFilter('recent')} className={styles['filter-item']}>
                    <span>Recent</span>
                    <span/>
                </div>
            </div>
        </div>
    )
}

interface IStructureListProps {
    projectId: number;
}

const StructureList = ({projectId}: IStructureListProps) => {
    const {fetchDatabaseStructure} = useDatabaseWorkerContext();

    const [loading, setLoading] = useState(false);
    const [databaseStructure, setDatabaseStructure] = useState<IDatabaseStructureResponse>();
    const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLoading(true);
        fetchDatabaseStructure(Number(projectId)).then(structure => {
            if (structure) {
                setDatabaseStructure(structure);
            } else {
                console.log("Failed to fetch database structure");
            }
            setLoading(false);
        });
    }, [projectId]);

    const handleSchemaToggle = (schemaName: string) => {
        setExpandedSchemas(prev => {
            const newSet = new Set(prev);
            newSet.has(schemaName) ? newSet.delete(schemaName) : newSet.add(schemaName);
            return newSet;
        });
    };

    const handleTableToggle = (tableName: string) => {
        setExpandedTables(prev => {
            const newSet = new Set(prev);
            newSet.has(tableName) ? newSet.delete(tableName) : newSet.add(tableName);
            return newSet;
        });
    };

    if (loading) return <p>Loading database structure...</p>;

    if (!databaseStructure && !loading) return <p>No database structure found.</p>;

    return (
        <div className={styles['structure-list']}>
            <ul className={styles['structure-list-list']}>
                {databaseStructure?.schemas.map(schema => (
                    <SchemaItem
                        key={schema.schemaName}
                        schema={schema}
                        expandedSchemas={expandedSchemas}
                        expandedTables={expandedTables}
                        onSchemaToggle={handleSchemaToggle}
                        onTableToggle={handleTableToggle}
                    />
                ))}
            </ul>
        </div>
    )
}