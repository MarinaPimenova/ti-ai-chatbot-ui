import {ConfigEnv, defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config';
import {UserConfig} from "vite";

export default defineConfig(async (configEnv) => {
    // If vite.config.ts exports a function, call it to get the actual UserConfig object
    const resolvedViteConfig = typeof viteConfig === 'function'
        ? await (viteConfig as (env: ConfigEnv) => UserConfig | Promise<UserConfig>)(configEnv)
        : viteConfig;

    return mergeConfig(
        resolvedViteConfig,
        defineConfig({
            test: {
                globals: true,
                environment: 'jsdom',
                setupFiles: ['./vitest.setup.ts'],
                coverage: {
                    reporter: ['html', 'lcovonly', 'text-summary'],
                },
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        silenceDeprecations: ['legacy-js-api'],
                    },
                },
                modules: {
                    scopeBehaviour: 'local',
                    generateScopedName: (name) => `${name}`,
                },
            },
        })
    );
});