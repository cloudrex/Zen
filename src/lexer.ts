import {IDisposable} from "./structures";
import NodeTree, {ITreeNode, NodeType} from "./node-tree";

export enum ConsumeType {
    LiteralString
}

const $char: RegExp = /[a-z]/i;

export default class Lexer implements IDisposable {
    private readonly code: string;

    private pos: number;
    private nodes: NodeTree;
    private buffer: string;

    public constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.buffer = "";
        this.nodes = new NodeTree();
    }

    public lex(): ITreeNode {
        this.nodes = new NodeTree();
        this.buffer = "";

        for (this.pos = 0; this.pos < this.code.length; this.pos++) {
            if (this.$ === "\"" && !this.buffer) {
                this.append();
            }
            else if (this.$ === "\"" && this.buffer[0] === "\"" && this.buffer.length > 1) {
                this.consume(ConsumeType.LiteralString);
            }
            else if ($char.test(this.$)) {
                if (this.buffer[0] ===  "\"") {
                    this.append();
                }
            }
            else {
                this.unexpected();
            }
        }

        return this.nodes.getTree();
    }

    private consume(type: ConsumeType): this {
        switch (type) {
            case ConsumeType.LiteralString: {
                console.log("once");

                this.nodes.setChild(this.name(NodeType.StringLiteral), {
                    type: NodeType.StringLiteral,
                    value: this.buffer
                });

                break;
            }

            default: {
                throw new Error(`Unknown consume type: ${type}`);
            }
        }

        return this;
    }

    private name(base: string = this.buffer, pos: number = this.pos): string {
        return `${base}:${pos}`;
    }

    private unexpected(char: string = this.$, at: number = this.pos): void {
        throw new Error(`Unexpected character '${char}' at position ${at}`);
    }

    private expecting(char: string, at: number = this.pos): void {
        throw new Error(`Expecting character '${char}' at position ${at}`);
    }

    private append(): this {
        this.buffer += this.$;

        return this;
    }

    private get $(): string {
        return this.code[this.pos];
    }

    public dispose(): this {
        // TODO

        return this;
    }
}
