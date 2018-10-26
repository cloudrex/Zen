import {TokenType} from "./token-types";

export type IToken = {
    readonly value?: string;
    readonly type: TokenType;
    readonly start: number;
    readonly end: number;
}

export type ISyntaxError = {
    readonly message: string;
    readonly line: number;
    readonly character: number;
    readonly position: number;
}

export type ITokenizeResult = {
    readonly tokens: IToken[];
    readonly errors: ISyntaxError[];
}

export enum TokenMatch {
    // Grammar
    StringLiteralQuote = "\"",
    NewLine = "\n",
    SemiColon = ";",
    Whitespace = " ",
    BraceStart = "{",
    BraceEnd = "}",
    ParenthesesStart = "(",
    ParenthesesEnd = ")",
    SingleLineComment = "//",
    Comma = ",",
    BracketStart = "[",
    BracketEnd = "]",
    Colon = ":",
    Dot = ".",

    // Operators
    AdditionOperator = "+",
    SubstractionOperator = "-",
    MultiplyOperator = "*",
    ExponentOperator = "**",
    DivisionOperator = "/",
    ModuloOperator = "%",
    GreaterThanOperator = ">",
    GreaterOrEqualToOperator = ">=",
    LessThanOperator = "<",
    LessOrEqualToOperator = "<=",
    AsignmentOperator = "=",
    EqualToOperator = "==",
    EqualValueAndTypeOperator = "===",
    NotEqualToOperator = "!=",
    NotValueNorTypeEqualOperator = "!==",
    LogicalAndOperator = "&&",
    LogicalOrOperator = "||",
    LogicalNotOperator = "!",

    // Keywords
    FunctionKeyword = "function",
    IfKeyword = "if",
    WhileKeyword = "while",
    ReturnKeyword = "return",
    BreakKeyword = "break",
    CaseKeyword = "case",
    CatchKeyword = "catch",
    ContinueKeyword = "continue",
    Debugger = "debugger",
    DefaultKeyword = "default",
    DeleteKeyword = "delete",
    DoKeyword = "do",
    ElseKeyword = "else",
    FinallyKeyword = "finally",
    ForKeyword = "for",
    InKeyword = "in",
    InstanceofKeyword = "instanceof",
    NewKeyword = "new",
    SwitchKeyword = "switch",
    ThisKeyword = "this",
    ThrowKeyword = "throw",
    TryKeyword = "try",
    TypeofKeyword = "typeof",
    VarKeyword = "var",
    VoidKeyword = "void",
    WithKeyword = "with"
}

// Patterns
const $quoteBody = /[^"]/i;
const $identifier = /[a-z]/i;

export default class Tokenizer {
    private readonly input: string;

    private pos: number;
    private line: number;
    private character: number;

    public constructor(input: string) {
        this.input = input;
        this.pos = 0;
        this.line = 0;
        this.character = 0;
    }

    public tokenize(): ITokenizeResult {
        const tokens: IToken[] = [];
        const errors: ISyntaxError[] = [];

        // Reset
        this.line = 0;
        this.character = 0;

        for (this.pos = 0; this.pos < this.input.length; this.pos++, this.character++) {
            switch (this.$) {
                case TokenMatch.BraceStart: {
                    tokens.push(this.createToken(TokenType.BlockStart));

                    break;
                }

                case TokenMatch.BraceEnd: {
                    tokens.push(this.createToken(TokenType.BlockEnd));

                    break;
                }

                case TokenMatch.ParenthesesStart: {
                    tokens.push(this.createToken(TokenType.ParenthesesStart));

                    break;
                }

                case TokenMatch.ParenthesesEnd: {
                    tokens.push(this.createToken(TokenType.ParenthesesEnd));

                    break;
                }

                case TokenMatch.StringLiteralQuote: {
                    const value: string | null = this.collectUntilExpression($quoteBody, false, this.pos + 1);

                    if (value === null) {
                        errors.push(this.expecting("End of quote body"));
                    }
                    else {
                        tokens.push(this.createToken(TokenType.Quote, value, this.pos + value.length + 1));
                        this.skip(value.length + 2);
                    }

                    break;
                }

                case TokenMatch.BracketStart: {
                    tokens.push(this.createToken(TokenType.BracketStart));

                    break;
                }

                case TokenMatch.BracketEnd: {
                    tokens.push(this.createToken(TokenType.BracketEnd));

                    break;
                }

                case TokenMatch.Comma: {
                    tokens.push(this.createToken(TokenType.Comma));

                    break;
                }

                case TokenMatch.Colon: {
                    tokens.push(this.createToken(TokenType.Colon));

                    break;
                }

                case TokenMatch.Dot: {
                    tokens.push(this.createToken(TokenType.Dot));

                    break;
                }

                case TokenMatch.NewLine: {
                    tokens.push(this.createToken(TokenType.NewLine));
                    this.line++;
                    this.character = 0;

                    break;
                }

                case TokenMatch.SemiColon: {
                    tokens.push(this.createToken(TokenType.SemiColon));

                    break;
                }

                case TokenMatch.Whitespace: {
                    continue;
                }

                // Operators
                case TokenMatch.AdditionOperator: {
                    tokens.push(this.createToken(TokenType.AdditionOperator));

                    break;
                }

                case TokenMatch.SubstractionOperator: {
                    tokens.push(this.createToken(TokenType.SubstractionOperator));

                    break;
                }

                case TokenMatch.ExponentOperator: {
                    tokens.push(this.createToken(TokenType.ExponentOperator, undefined, this.pos + 2));
                    this.skip();

                    break;
                }

                case TokenMatch.DivisionOperator: {
                    // Avoid single line comment
                    if (this.forward() !== "/") {
                        tokens.push(this.createToken(TokenType.DivisionOperator));

                        break;
                    }
                }

                case TokenMatch.ModuloOperator: {
                    tokens.push(this.createToken(TokenType.ModuloOperator));

                    break;
                }

                case TokenMatch.GreaterThanOperator: {
                    // Avoid greater or equal to operator
                    if (this.forward() !== "=") {
                        tokens.push(this.createToken(TokenType.GreaterThanOperator));

                        break;
                    }
                }

                case TokenMatch.LessThanOperator: {
                    // Avoid less or equal to operator
                    if (this.forward() !== "=") {
                        tokens.push(this.createToken(TokenType.LessThanOperator));

                        break;
                    }
                }

                case TokenMatch.LogicalNotOperator: {
                    tokens.push(this.createToken(TokenType.LogicalNotOperator));

                    break;
                }

                case TokenMatch.AsignmentOperator: {
                    tokens.push(this.createToken(TokenType.AssignmentOperator));

                    break;
                }

                default: {
                    // Keywords
                    if (this.matchToken(TokenMatch.FunctionKeyword)) {
                        tokens.push(this.createToken(TokenType.FunctionKeyword));
                        this.skip(TokenMatch.FunctionKeyword.length);
                    }
                    else if (this.matchToken(TokenMatch.IfKeyword)) {
                        tokens.push(this.createToken(TokenType.IfKeyword));
                        this.skip(TokenMatch.IfKeyword.length);
                    }
                    else if (this.matchToken(TokenMatch.ElseKeyword)) {
                        tokens.push(this.createToken(TokenType.ElseKeyword));
                        this.skip(TokenMatch.ElseKeyword.length);
                    }
                    // Other
                    else if ($identifier.test(this.$)) {
                        const value: string | null = this.collectUntilExpression($identifier, false, this.pos, true);

                        if (value === null) {
                            errors.push(this.createSyntaxError({
                                message: "Unexpected end of file (collecting entity)"
                            }));
                        }
                        else {
                            tokens.push(this.createToken(TokenType.Idenfitier, value, this.pos + value.length));
                            this.skip(value.length);
                        }
                    }
                    else {
                        errors.push(this.createSyntaxError({
                            message: `Unexpected character: ${this.$}`
                        }));
                    }
                }
            }
        }

        return {
            tokens,
            errors
        };
    }

    private matchToken(token: TokenMatch): boolean {
        if (token.length > 1) {
            return token + " " === this.forward(token.length + 1);
        }

        return token === this.$;
    }

    private forward(characters: number = 1, start: number = this.pos): string | null {
        const end: number = start + characters;

        let collection: string = "";
        let counter: number = start;

        while (counter < end) {
            if (counter + 1 >= this.input.length) {
                return null;
            }

            collection += this.input[counter];
            counter++;
        }

        return collection;
    }

    private createSyntaxError(options: Partial<ISyntaxError>): ISyntaxError {
        if (!options.message) {
            throw new Error("[Tokenizer.createSyntaxError] Options must contain message");
        }

        return {
            character: options.character || this.character,
            line: options.line || this.line,
            message: options.message,
            position: options.position || this.pos
        };
    }

    private expecting(message: string, position: number = this.pos, line: number = this.line, character: number = this.character): ISyntaxError {
        return {
            message: `Expecting ${message} | Position ${position}`,
            character,
            line,
            position
        };
    }

    private skip(characters: number = 1, offset: number = -1): this {
        // TODO: Prevent overflow (EOF)
        this.pos += characters + offset;

        return this;
    }

    // TODO: Should consider EOF as a false match, and return what was collected
    private collectUntilExpression(expression: RegExp, equals: boolean = true, start: number = this.pos, returnOnEnd: boolean = false): string | null {
        let counter: number = start;
        let collection: string = "";

        // TODO: Separate into 2 methods
        while (expression.test(this.input[counter]) !== equals) {
            collection += this.input[counter];

            if (counter + 1 >= this.input.length && returnOnEnd) {
                return collection;
            }
            else if (counter + 1 >= this.input.length && !returnOnEnd) {
                throw new Error("Expecting match before end of file");
            }

            counter++;
        }

        return collection;
    }

    private collectUntil(match: string, start: number = this.pos, returnOnEnd: boolean = false): string {
        let counter: number = start;
        let collection: string = "";

        while (this.input[counter] !== match) {
            collection += this.input[counter];

            if (counter + 1 >= this.input.length && returnOnEnd) {
                return collection;
            }
            // TODO:
            else if (counter + 1 >= this.input.length && !returnOnEnd) {
                throw new Error(`Expecting character '${match}' before end of file`);
            }

            counter++;
        }

        return collection;
    }

    private createToken(type: TokenType, value?: string, end: number = this.pos + 1): IToken {
        return {
            start: this.pos,
            end,
            type,
            value
        };
    }

    private get $(): string {
        return this.input[this.pos];
    }

    private next(): this {
        // TODO

        return this;
    }
}