export type IAssemblyLine = {
    readonly content: string;
};

export default class Assembly {
    private readonly labels: Map<string, IAssemblyLine[]>;

    public constructor() {
        this.labels = new Map();
    }

    public setLabel(name: string, lines: IAssemblyLine[] = []): this {
        this.labels.set(name, lines);

        return this;
    }

    public hasLabel(name: string): boolean {
        return this.labels.has(name);
    }

    public countLines(labelName: string): number {
        if (this.labels.has(labelName)) {
            return (this.labels.get(labelName) as IAssemblyLine[]).length;
        }

        return -1;
    }

    public pushLine(label: string, line: IAssemblyLine): boolean {
        if (this.labels.has(label)) {
            (this.labels.get(label) as IAssemblyLine[]).push(line);

            return true;
        }

        return false;
    }

    public pushLines(label: string, lines: IAssemblyLine[]): boolean {
        if (this.labels.has(label)) {
            (this.labels.get(label) as IAssemblyLine[]).push(...lines);

            return true;
        }

        return false;
    }

    public getLines(name: string): IAssemblyLine[] | null {
        if (this.labels.has(name)) {
            return (this.labels.get(name) as IAssemblyLine[]);
        }

        return null;
    }
}