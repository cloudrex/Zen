import {IDisposable} from "./structures";
import NodeTree, {ITreeNode, NodeTreeEvent, NodeType} from "./node-tree";

export enum ConsumeType {
    StringLiteral,
    MemberCallStart,
    MemberCallEnd
}

const $char: RegExp = /[a-z]/i;
const $member: RegExp = /^[a-z]+$/i;
const $methodCall: RegExp = /^[a-z]+\($/i;
const $num: RegExp = /[0-9]/;
const $white: RegExp = /[\s\t]/;

export default class Lexer implements IDisposable {
    private readonly code: string;

    private pos: number;
    private char: number;
    private line: number;
    private nodes: NodeTree;
    private buffer: string;

    // Buffers
    private lineBuffer: string;

    // Switches
    private memberCallSwitch: boolean;

    public constructor(code: string) {
        this.code = code;
        this.pos = 0;
        this.char = 1;
        this.line = 1;
        this.buffer = "";
        this.nodes = new NodeTree();

        // Buffers
        this.lineBuffer = "";

        // Switches
        this.memberCallSwitch = false;
    }

    public lex(): NodeTree {
        // Events
        // TODO: Somehow not working
        this.nodes.on(NodeTreeEvent.NodeChange, (node: ITreeNode) => {
            console.log("\n");
        });

        this.char = 1;
        this.line = 1;
        this.nodes = new NodeTree();
        this.buffer = "";

        // Buffers
        this.lineBuffer = "";

        // Switches
        this.memberCallSwitch = false;

        for (this.pos = 0; this.pos < this.code.length; this.pos++) {
            // End but expecting string literal end
            if (this.isEnd() && this.isStringLiteralBody()) {
                this.expecting("\"");
            }
            // End but expecting method call start
            else if (this.isEnd() && this.isMethodCall()) {
                this.expecting("(");
            }
            // End but expecting method call end
            else if (this.isEnd() && this.memberCallSwitch) {
                this.expecting(")");
            }
            // Member Call -> Next argument
            else if (this.$ === "," && this.memberCallSwitch) {
                console.log("MEMBER CALL COMMA");
                this.reset();
            }
            // String Literal -> Start-
            else if (this.$ === "\"" && !this.buffer) {
                this.append();
            }
            // String Literal -> -End
            else if (this.$ === "\"" && this.isStringLiteralBody()) {
                this.consume(ConsumeType.StringLiteral);
            }
            // Member Call -> Open
            else if (this.$ === "(" || this.$ === ")" && this.isMethodCall(this.buffer + this.$)) {
                this.append();
                this.consume(ConsumeType.MemberCallStart);
            }
            // Member Call -> Close
            else if (this.$ === ")" && this.memberCallSwitch) {
                this.consume(ConsumeType.MemberCallEnd);
            }
            // Character
            else if ($char.test(this.$) || $num.test(this.$)) {
                // Character -> String Literal Body
                if (this.isStringLiteralBody()) {
                    this.append();
                }
                // Character -> Member start
                else if (this.isMember() || !this.buffer) {
                    this.append();
                }
                else {
                    this.unexpected();
                }
            }
            // Newline but expecting string literal end
            else if (this.isNewline() && this.isStringLiteralBody()) {
                this.expecting("\"");
            }
            // Newline
            else if (this.isNewline()) {
                this.line++;
                this.char = 0;

                // TODO: Inefficient (.split)
                this.lineBuffer = this.code.split("\n")[this.line - 1];

                continue;
            }
            // Whitespace
            else if ($white.test(this.$)) {
                if (this.isStringLiteralBody()) {
                    this.append();
                }
                else {
                    continue;
                }
            }
            else {
                this.unexpected();
            }

            this.char++;
        }

        return this.nodes;
    }

    private consume(type: ConsumeType): this {
        let reset: boolean = true;

        switch (type) {
            case ConsumeType.StringLiteral: {
                // Remove the " at the start
                const value: string = this.buffer.substr(1);

                const name: string = this.name(NodeType.StringLiteral);

                console.log("STRING LITERAL |", value);

                this.nodes.setChild(name, {
                    type: NodeType.StringLiteral,
                    name,
                    position: this.pos,
                    value
                });

                break;
            }

            case ConsumeType.MemberCallStart: {
                const methodName: string = this.buffer.replace("(", "");
                const name: string = this.name(methodName);

                console.log("MEMBER CALL START |", methodName);

                this.nodes.setChildAndNav(name, {
                    type: NodeType.MethodCall,
                    name,
                    position: this.pos,
                    value: {}
                });

                this.memberCallSwitch = true;

                break;
            }

            case ConsumeType.MemberCallEnd: {
                console.log("MEMBER CALL END");
                this.memberCallSwitch = false;
                this.nodes.parent();

                break;
            }

            default: {
                throw new Error(`Unknown consume type: ${type}`);
            }
        }

        if (reset) {
            this.reset();
        }

        return this;
    }

    private name(base: string = this.buffer, pos: number = this.pos): string {
        return `${base}:${pos}`;
    }

    private unexpected(unexpected: string = this.$, line: number = this.line, char: number = this.char): void {
        throw new Error(`Unexpected character '${unexpected}' at line ${line}:${char}`);
    }

    private expecting(expected: string, line: number = this.line, char: number = this.char): void {
        throw new Error(`Expecting character '${expected}' at line ${this.line}:${char}`);
    }

    private reset(): this {
        this.buffer = "";

        return this;
    }

    private isEnd(): boolean {
        return this.pos + 1 >= this.code.length;
    }

    private append(): this {
        this.buffer += this.$;

        return this;
    }

    private get $(): string {
        return this.code[this.pos];
    }

    // Helpers
    private isStringLiteralBody(buffer: string = this.buffer): boolean {
        return this.buffer[0] === "\"" && this.buffer.length >= 1;
    }

    private isNewline(buffer: string = this.buffer): boolean {
        return this.$ === "\n";
    }

    private isMember(buffer: string = this.buffer): boolean {
        return !this.isNewline(buffer) && !this.isStringLiteralBody(buffer) && $member.test(buffer);
    }

    private isMethodCall(buffer: string = this.buffer): boolean {
        return !this.isNewline(buffer) && !this.isStringLiteralBody(buffer) && $methodCall.test(buffer);
    }

    public dispose(): this {
        // TODO

        return this;
    }
}
