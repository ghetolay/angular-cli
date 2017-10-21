import { Logger } from '@ngtools/logger';
export default function build(packagesToBuild: string[], opts: {
    local: boolean;
    devkit: string;
}, logger: Logger): Promise<void>;
