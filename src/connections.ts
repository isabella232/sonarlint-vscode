import * as VSCode from 'vscode';

export class Connection extends VSCode.TreeItem {
    constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly collapsibleState: VSCode.TreeItemCollapsibleState,
        public readonly contextValue: 'sonarqubeConnection' | 'sonarcloudConnection'
    ) {
        super(label, collapsibleState);
    }
}

export class ConnectionGroup extends VSCode.TreeItem {
    constructor(
        public readonly id: 'sonarqube' | 'sonarcloud',
        public readonly label: string,
        public readonly collapsibleState: VSCode.TreeItemCollapsibleState,
        public readonly contextValue: 'sonarQubeGroup' | 'sonarCloudGroup'
    ) {
        super(id, collapsibleState)
    }
}


export type AllConnectionsNode = Connection | ConnectionGroup;

export interface ConnectionsResponse {
    'sonarqube': Array<Connection>;
    'sonarcloud': Array<Connection>;
}

export function listAllConnections(): ConnectionsResponse {
    return {
        'sonarqube': [new Connection('Cat', '1.0',VSCode.TreeItemCollapsibleState.None,'sonarqubeConnection')],
        'sonarcloud': [new Connection('Dog','21.0', VSCode.TreeItemCollapsibleState.None,'sonarcloudConnection')]
    }
}

export class AllConnectionsTreeDataProvider implements VSCode.TreeDataProvider<AllConnectionsNode> {

    private readonly _onDidChangeTreeData = new VSCode.EventEmitter<Connection | undefined>();
    readonly onDidChangeTreeData: VSCode.Event<Connection | undefined> = this._onDidChangeTreeData.event;

    constructor() { }


    refresh() {
        this._onDidChangeTreeData.fire(null);
    }

    getTreeItem(element: Connection): VSCode.TreeItem {
        return element;
    }

    getChildren(element?: AllConnectionsNode): AllConnectionsNode[] {
        if(!element){
            return this.getInitialState()
        }
        const cr = listAllConnections();
        if(element.id === 'sonarqube'){
            return cr.sonarqube
        } else if(element.id === 'sonarcloud'){
            return cr.sonarcloud
        }
    }

    getInitialState() : ConnectionGroup[] {
        return [
            new ConnectionGroup('sonarqube', 'SonarQube Connections', VSCode.TreeItemCollapsibleState.Collapsed, 'sonarQubeGroup'),
            new ConnectionGroup('sonarcloud', 'SonarCloud Connections', VSCode.TreeItemCollapsibleState.Collapsed, 'sonarCloudGroup')
        ]
    }
}
