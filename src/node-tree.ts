export enum NodeType {
    Root = "PRN",
    MethodCall = "MEC",
    StringLiteral = "STL",
    NumberLiteral = "NBL"
}

export type NodeValue = string | number | any | undefined;

export type TreeNode = {
    readonly type: NodeType;

    value: NodeValue;
}

export default class NodeTree {
    private readonly tree: TreeNode;
    private readonly path: TreeNode[];

    private currentNode: TreeNode;

    public constructor() {
        this.tree = NodeTree.createEmptyNode(NodeType.Root);
        this.currentNode = this.tree;
        this.path = [this.currentNode];
    }

    public onRoot(): boolean {
        return this.currentNode.type === NodeType.Root;
    }

    public getParent(): TreeNode {
        if (this.onRoot() || this.path.length - 2 < 0) {
            throw new RangeError("Canot get parent of root node");
        }

        return this.path[this.path.length - 2];
    }

    public hasChild(name: string): boolean {
        return typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).includes(name);
    }

    public hasValue(): boolean {
        return (typeof this.currentNode.value === "object" && Object.keys(this.currentNode.value).length > 0) || this.currentNode.value === undefined;
    }

    public setValue(value: NodeValue): this {
        if (typeof value !== "object" && typeof value !== "string" && typeof value !== "number") {
            throw new Error("An invalid value type was provided; Expecting either object, string, or number");
        }

        this.currentNode.value = value;

        return this;
    }

    public getChild(name: string): TreeNode {
        if (!this.hasChild(name)) {
            throw new Error(`Current node does not have '${name}' as a child`);
        }

        return this.currentNode.value[name];
    }

    public parent(): this {
        this.currentNode = this.getParent();
        this.removeLastPath();

        return this;
    }

    public child(name: string): this {
        this.currentNode = this.getChild(name);
        this.pushNewPath();

        return this;
    }

    public getChildren(): TreeNode[] {
        if (!this.isTree()) {
            throw new Error("Cannot get children when value is not a tree");
        }

        const children: TreeNode[] = [];
        const keys: string[] = Object.keys(this.currentNode.value);

        for (let i: number = 0; i < keys.length; i++) {
            children.push(this.currentNode.value[keys[i]]);
        }

        return children;
    }

    public setChild(name: string, node: TreeNode): this {
        if (this.hasChild(name)) {
            throw new Error(`Child with name '${name}' already exists`);
        }
        else if (!this.isTree()) {
            throw new Error(`Cannot set child '${name}' when value is not a tree`);
        }

        this.currentNode.value[name] = node;

        return this;
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

    public static createEmptyNode(type: NodeType): TreeNode {
        return {
            type,
            value: {}
        };
    }

    public static isTree(node: TreeNode): boolean {
        return typeof node.value === "object";
    }
}