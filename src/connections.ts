import * as VSCode from 'vscode';
import * as path from 'path';

function getConnectionStatus(_connection: Connection){
    const r = Math.random()
    return r < 0.5 ? 'ok' : 'notok';
}

function getPathToIcon(iconFileName : string) {
    return path.join(__filename, '../../..', 'images', 'connection', iconFileName);
}

export function getConnectionStatusIcon(connection : Connection){
    if(connection.status === 'ok'){
        return getPathToIcon('ok.svg')
    } else if(connection.status === 'notok'){
        return getPathToIcon('notok.svg');
    }
    return getPathToIcon('loading.svg');
}

export class Connection extends VSCode.TreeItem {
    constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly contextValue: 'sonarqubeConnection' | 'sonarcloudConnection'
    ) {
        super(label, VSCode.TreeItemCollapsibleState.None);
    }
    collapsibleState = VSCode.TreeItemCollapsibleState.None;
    status = getConnectionStatus(this);
    iconPath = getConnectionStatusIcon(this);
}

export class ConnectionGroup extends VSCode.TreeItem {
    constructor(
        public readonly id: 'sonarqube' | 'sonarcloud',
        public readonly label: 'SonarQube' | 'SonarCloud',
        public readonly contextValue: 'sonarQubeGroup' | 'sonarCloudGroup'
    ) {
        super(label, VSCode.TreeItemCollapsibleState.Collapsed);
    }
}

export type ConnectionsNode = Connection | ConnectionGroup;

export interface ConnectionsResponse {
    'sonarqube': Array<Connection>;
    'sonarcloud': Array<Connection>;
}

function listAllConnections(): ConnectionsResponse {
    return {
        'sonarqube': getConnections('sonarqube'),
        'sonarcloud': getConnections('sonarcloud')
    };
}

export function getConnections(type: string) : Connection[] {
    const contextValue = type === 'sonarqube' ? 'sonarqubeConnection' : 'sonarcloudConnection';
    const labelKey = type === 'sonarqube' ? 'serverUrl' : 'organizationKey';
    let connections = VSCode.workspace.getConfiguration('sonarlint.connectedMode.connections')[type];
    connections = connections.map(c => new Connection(c['connectionId'], c[labelKey], contextValue))
    return connections;
}

export class AllConnectionsTreeDataProvider implements VSCode.TreeDataProvider<ConnectionsNode> {

    private readonly _onDidChangeTreeData = new VSCode.EventEmitter<Connection | undefined>();
    readonly onDidChangeTreeData: VSCode.Event<ConnectionsNode | undefined> = this._onDidChangeTreeData.event;

    constructor() { }

    refresh() {
        this._onDidChangeTreeData.fire(null);
    }

    getTreeItem(element: Connection): VSCode.TreeItem {
        return element;
    }

    getChildren(element?: ConnectionsNode): ConnectionsNode[] {
        if(!element){
            return this.getInitialState();
        }
        const connectionsResponse = listAllConnections();
        return connectionsResponse[element.id];
    }

    getInitialState() : ConnectionGroup[] {
        return [
            new ConnectionGroup('sonarqube', 'SonarQube', 'sonarQubeGroup'),
            new ConnectionGroup('sonarcloud', 'SonarCloud', 'sonarCloudGroup')
        ];
    }
}
