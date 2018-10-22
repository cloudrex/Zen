import {IDisposable} from "./structures";
import NodeTree, {ITreeNode, NodeType} from "./node-tree";

export enum ConsumeType {
    LiteralString
}

const $char: RegExp = /[a-z]/i;
const $white: RegExp = /[\s]/;

export default class Lexer implements IDisposable {
    private readonly code: string;

    private pos: number;
    private char: number;
    private line: number;
    private nodes: NodeTree;
    private buffer: string;

    public constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.char = 0;
        this.line = 0;
        this.buffer = "";
        this.nodes = new NodeTree();
    }

    public lex(): ITreeNode {
        this.nodes = new NodeTree();
        this.buffer = "";

        for (this.pos = 0; this.pos < this.code.length; this.pos++) {
            // String Literal -> Start-
            if (this.$ === "\"" && !this.buffer) {
                this.append();
            }
            // String Literal -> -End
            else if (this.$ === "\"" && this.isStringLiteralBody()) {
                this.consume(ConsumeType.LiteralString);
            }
            // Character
            else if ($char.test(this.$)) {
                // String Literal Body
                if (this.isStringLiteralBody()) {
                    this.append();
                }
                else {
                    this.unexpected();
                }
            }
            // Whitespace
            else if ($white.test(this.$)) {
                if (this.isStringLiteralBody()) {
                    this.append();
                }
                else {
                    this.unexpected();
                }
            }
            // Newline
            else if (this.$ === "\n") {
                this.line++;
                this.char = 0;

                continue;
            }
            else {
                this.unexpected();
            }

            this.char++;
        }

        return this.nodes.getTree();
    }

    private consume(type: ConsumeType): this {
        switch (type) {
            case ConsumeType.LiteralString: {
                this.nodes.setChild(this.name(NodeType.StringLiteral), {
                    type: NodeType.StringLiteral,

                    // Remove the " at the start
                    value: this.buffer.substr(1)
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

    private unexpected(unexpected: string = this.$, line: number = this.line, char: number = this.char): void {
        throw new Error(`Unexpected character '${unexpected}' at line ${line}:${unexpected}`);
    }

    private expecting(expected: string, line: number = this.line, char: number = this.char): void {
        throw new Error(`Expecting character '${expected}' at line ${this.line}:${char}`);
    }

    private append(): this {
        this.buffer += this.$;

        return this;
    }

    private get $(): string {
        return this.code[this.pos];
    }

    // Helpers
    private isStringLiteralBody(): boolean {
        return this.buffer[0] === "\"" && this.buffer.length > 1;
    }

    public dispose(): this {
        // TODO

        return this;
    }
}
