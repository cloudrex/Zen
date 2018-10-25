import {EventEmitter} from "events";
import {IDisposable} from "./structures";

export enum NodeTreeEvent {
    NodeChange = "nodeChange"
}

export enum NodeType {
    Root = "PRN",
    MethodCall = "MEC",
    MethodParameter = "MEP",
    StringLiteral = "STL",
    NumberLiteral = "NBL"
}

export enum SpecialNodes {
    Root = "$Root"
}

export type INodeValue = string | number | any | undefined;

export type ITreeNode = {
    readonly type: NodeType;
    readonly name: NodeType | string;
    readonly position: number;

    value: INodeValue;
}

export default class NodeTree extends EventEmitter implements IDisposable {
    private readonly tree: ITreeNode;
    private readonly path: ITreeNode[];

    private currentNode: ITreeNode;
    private size: number;

    public constructor() {
        super();

        this.tree = NodeTree.createEmptyNode(NodeType.Root, SpecialNodes.Root, -1);
        this.currentNode = this.tree;
        this.path = [this.currentNode];
        this.size = 0;
    }

    public onRoot(): boolean {
        return this.currentNode.type === NodeType.Root;
    }

    public getParent(): ITreeNode {
        if (this.onRoot() || this.path.length - 2 < 0) {
            throw new RangeError("Cannot get parent of root node");
        }

        return this.path[this.path.length - 2];
    }

    public hasChild(name: string): boolean {
        return typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).includes(name);
    }

    public hasValue(): boolean {
        return (typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).length > 0) || this.currentNode.value === undefined;
    }

    public setValue(value: INodeValue): this {
        if (typeof value !== "object" && typeof value !== "string" && typeof value !== "number") {
            throw new Error("An invalid value type was provided; Expecting either object, string, or number");
        }

        this.currentNode.value = value;

        if (typeof value === "object") {
            this.size++;
        }

        return this;
    }

    public getChild(name: string): ITreeNode {
        if (!this.hasChild(name)) {
            throw new Error(`Current node does not have '${name}' as a child`);
        }

        return this.currentNode.value[name];
    }

    public parent(): this {
        this.currentNode = this.getParent();
        this.emit(NodeTreeEvent.NodeChange, this.currentNode);
        this.removeLastPath();

        return this;
    }

    public child(name: string): this {
        this.currentNode = this.getChild(name);
        this.emit(NodeTreeEvent.NodeChange, this.currentNode);
        this.pushNewPath();

        return this;
    }

    public getChildren(): ITreeNode[] {
        return NodeTree.getChildren(this.currentNode);
    }

    public getSize(): number {
        return this.size;
    }

    public setChild(name: string, node: ITreeNode): this {
        if (this.hasChild(name)) {
            throw new Error(`Child with name '${name}' already exists`);
        }
        else if (!this.isTree()) {
            throw new Error(`Cannot set child '${name}' when value is not a tree`);
        }

        this.currentNode.value[name] = node;
        this.size++;

        return this;
    }

    public setChildAndNav(name: string, node: ITreeNode): this {
        this.setChild(name, node);
        this.child(name);

        return this;
    }

    public getTree(): ITreeNode {
        return this.tree;
    }

    public getCurrent(): ITreeNode {
        return this.currentNode;
    }

    public dispose(): void {
        //
    }

    private removeLastPath(): this {
        this.path.pop();

        return this;
    }

    private pushNewPath(): this {
        this.path.push(this.currentNode);

        return this;
    }

    private isTree(): boolean {
        return NodeTree.isTree(this.currentNode);
    }

    public static createEmptyNode(type: NodeType, name: string, position: number): ITreeNode {
        return {
            type,
            name,
            position,
            value: {}
        };
    }

    public static getChildren(node: ITreeNode): ITreeNode[] {
        if (!NodeTree.isTree(node)) {
            throw new Error("Cannot get children when value is not a tree");
        }

        const children: ITreeNode[] = [];
        const keys: string[] = Object.keys(node.value);

        for (let i: number = 0; i < keys.length; i++) {
            children.push(node.value[keys[i]]);
        }

        return children;
    }

    public static isTree(node: ITreeNode): boolean {
        return typeof node.value === "object";
    }
}
