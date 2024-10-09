import { copyFileSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync, rmdir } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { rm } from 'fs/promises';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'postcss';
import cssnano from 'cssnano';

class Builder {
    constructor() {
        this.frames = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];
        this.loadingInterval = null;
        this.lastMessageLength = 0;
        this.alreadyBuilt = false;
        this.verbose = false;

        this.build();
    }

    async build() {
        if (!existsSync('chrome')) {
            mkdirSync('chrome');
        }
        if (!existsSync('chrome/popup')) {
            mkdirSync('chrome/popup');
        }

        await this.prepareChrome();
    }

    async buildTypeScript() {
        this.startLoading("Building the TypeScript files.");
        let cs = `./source/content/`
        let contentScriptFiles = readdirSync(cs, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
            .map(dirent => `${cs}${dirent.name}`);
        const configurations = [
            // service worker + all modules
            {
                input: ['./source/background/sw.ts'],
                preserveSymlinks: true,
                plugins: [
                    nodeResolve({
                        browser: true,
                    }),
                    commonjs(),
                    typescript({
                        tsconfig: './source/tsconfig.json'
                    }),
                    terser()
                ],
                output: {
                    dir: './source/dist/background',
                    format: 'es',
                    entryFileNames: '[name].js'
                }
            },
            {
                input: contentScriptFiles,
                plugins: [
                    typescript({
                        tsconfig: './source/tsconfig.json',
                    }),
                    terser({
                        keep_classnames: true,
                        keep_fnames: true,
                        mangle: {
                            keep_classnames: true,
                            keep_fnames: true,
                        },
                    }),
                ],
                output: {
                    dir: './source/dist/content',
                    format: 'es',
                    entryFileNames: '[name].js',
                },
            }
        ];

        try {
            for (const config of configurations) {
                const bundle = await rollup(config);
                await bundle.write(config.output);
            }

            const cssInputPath = './source/content/content.css';
            const cssOutputPath = './source/dist/content/content.css';

            const css = readFileSync(cssInputPath, 'utf8');

            const result = await postcss([
                cssnano({
                    preset: 'default',
                }),
            ]).process(css, {
                from: cssInputPath,
                to: cssOutputPath,
            });

            writeFileSync(cssOutputPath, result.css);
            this.stopLoading("TypeScript build complete.");
        } catch (error) {
            this.terminateLoading("TypeScript build errors occurred");
            console.error(error);
            process.exit(1);
        }
    }

    async prepareChrome() {
        await this.checkAndUpdateDependencies();
        await this.copyPopupFromWebApp();
        await this.buildTypeScript();
        await this.copySourceToDestination();
        await this.removeExtraFiles();
    }

    async copyPopupFromWebApp() {
        this.startLoading("Copying the popup from the web app.");
        await this.execAsync('npm run prepare-popup', { cwd: './' });
        this.stopLoading("Popup copied from the web app.");
    }

    async copySourceToDestination() {
        this.startLoading("Deleting existing /chrome folder.");

        let deleted = false;
        try {
            await rm('./chrome', { recursive: true, force: true });
            await rm('./edge', { recursive: true, force: true });
            await rm('./firefox', { recursive: true, force: true });
            await rm('./safari', { recursive: true, force: true });
            deleted = true
        } catch (error) {
            console.error(`Failed to remove directory: ${error}`);
        }

        if (!deleted) {
            this.stopLoading("No existing /chrome folder found.");
        } else {
            this.stopLoading("Deleted existing /chrome folder.");
        }

        this.startLoading("Copying source folder to /chrome.");
        const ignoreList = [
            "node_modules",
            "public",
            "src",
            ".gitignore",
            "package-lock.json",
            "package.json",
            "README.md",
            "background",
            "popupdeps",
            "content",
            "tsconfig.json",
            "popup",
            "dist",
            "global.d.ts",
            "popupbu",
            "index.html",
            ".eslintrc.cjs",
            "bun.lockb",
            "vite.config.js",
            "vite.config.ts",
            "tsconfig.node.json",
            "tsconfig.app.json",
            "tsconfig.app.tsbuildinfo",
            "tsconfig.node.tsbuildinfo",
            "eslint.config.js",
        ];
        this.copyFilesToDestination('./source', './chrome', ignoreList);
        this.stopLoading("Source folder copied to /chrome.");

        this.startLoading("Copying compiled popup ts files to /chrome/popup.");
        this.copyFilesToDestination('./source/popup/dist', './chrome/popup');
        this.stopLoading("Popup copied to /chrome/popup.");

        this.startLoading("Copying compiled background ts files to /chrome/background.");
        this.copyFilesToDestination('./source/dist', './chrome');
        this.stopLoading("Background and Content Scripts copied to /chrome/background and /chrome/content.");
    }

    async checkAndUpdateDependencies() {
        await this.execAsync('bun i', { cwd: './source' });
    }

    async removeExtraFiles() {
        try {
            if (existsSync('./source/dist')) {
                this.startLoading("Removing the source/dist directory.");
                await rm('./source/dist', { recursive: true });
                this.stopLoading("Removed the source/dist directory.");
            }
            // remove all files from ./source/popup
            if (existsSync('./source/popup')) {
                this.startLoading("Removing the source/popup directory.");
                await rm('./source/popup', { recursive: true });
                this.stopLoading("Removed the source/popup directory.");
            }
        } catch (err) {
            console.error(`An error occurred while removing the source/dist directory: ${err}`);
        }
    }

    copyFilesToDestination(src, dest, ignore = []) {
        try {
            if (!existsSync(dest)) {
                mkdirSync(dest, { recursive: true });
            }

            const files = readdirSync(src);
            files.forEach(file => {
                const fullPathSrc = path.join(src, file);
                const fullPathDest = path.join(dest, file);
                const stat = statSync(fullPathSrc);

                if (ignore.includes(file) && !fullPathSrc.includes('build/')) {
                    return;
                }

                if (stat.isDirectory()) {
                    mkdirSync(fullPathDest, { recursive: true });
                    this.copyFilesToDestination(fullPathSrc, fullPathDest, ignore);
                } else if (stat.isFile()) {
                    copyFileSync(fullPathSrc, fullPathDest);
                }
            });
        } catch (err) {
            console.error(`An error occurred: ${err}`);
        }
    }

    execAsync(command, options = {}) {
        return new Promise((resolve, reject) => {
            const child = exec(command, options);

            if (this.verbose) {
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
            }

            child.on('exit', (code, signal) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Exited with code ${code} and signal ${signal}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });

            process.on('SIGINT', () => {
                child.kill();
                this.terminateLoading();
                process.exit(1);
            });
        });
    }

    startLoading(message) {
        let i = 0;
        this.loadingInterval = setInterval(() => {
            let str = `${message} ${this.frames[i]}`;
            this.lastMessageLength = str.length;
            process.stdout.write('\x1b[90m');
            process.stdout.write(`\r${str}`);
            process.stdout.write('\x1b[0m');
            i = (i + 1) % this.frames.length;
        }, 200);
    }

    stopLoading(doneMessage) {
        clearInterval(this.loadingInterval);
        process.stdout.write('\r');
        process.stdout.write(' '.repeat(this.lastMessageLength) + '\r');
        if (doneMessage) {
            console.log('\x1b[32m', `✅ ${doneMessage}`);
        }
    }

    terminateLoading() {
        clearInterval(this.loadingInterval);
        process.stdout.write('\x1b[0m');
        process.stdout.write('\r');
        process.stdout.write(' '.repeat(this.lastMessageLength) + '\r');
        console.log('\x1b[31m', `❌ Build terminated by user.`);
    }
}

new Builder();