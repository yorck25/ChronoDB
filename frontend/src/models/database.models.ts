export interface IDatabaseStructureResponse {
    schemas: ISchemaStructureResponse[];
}

export interface ISchemaStructureResponse {
    schemaName: string;
    tables: ITableStructureResponse[];
}

export interface ITableStructureResponse {
    tableName: string;
    columns: IColumnStructureResponse[];
}

export interface IColumnStructureResponse {
    columnName: string;
    dataType: string;
}

export interface IDatabaseQueryResult {
    kind?: string;
    rows?: any[];
    rowsAffected?: number;
    message?: string;
}

export interface ISchemaCommitResponse {
    commits: ISchemaCommit[];
    totalCount: number;
}

export interface ISchemaCommit {
    id: number;
    projectId: number;
    checksum: string;
    parentChecksum?: string;
    actionType: string;
    title: string;
    message: string;
    upScript: string;
    downScript: string;
    authorUserId?: string;
    createdAt: string;
    deletedAt?: string;
}
