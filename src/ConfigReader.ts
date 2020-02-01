import fs from 'fs';
import YAML from 'yaml';

export class ConfigReader {
    private readonly filename: string;
    public config: { [key: string]: string; };

    constructor(filename: string) {
        this.filename = filename;
    }

    init() {
        const file = fs.readFileSync(`./${this.filename}`, 'utf8');
        this.config = YAML.parse(file);
    }
}