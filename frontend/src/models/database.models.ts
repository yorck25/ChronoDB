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
