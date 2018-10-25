import {IAssemblyLine} from "./assembly";

export default abstract class AssemblyCreator {
    private readonly lines: IAssemblyLine[];

    public constructor() {
        this.lines = [];
    }

    public call(label: string): this {
        this.lines.push({
            content: `call ${label}`
        });

        return this;
    }

    public ret(): this {
        this.lines.push({
            content: "ret"
        });

        return this;
    }

    public getLines(): IAssemblyLine[] {
        return this.lines;
    }
}