import { defineConfig } from "tsup";


export default defineConfig([
    {
        entry: ['./workers/grpc-worker/main.ts'],
        outDir: './dist/workers/grpc-worker',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    },
    {
        entry: ['./workers/replicator/main.ts'],
        outDir: './dist/workers/replicator',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    },
    {
        entry: ['./workers/replicator/ingress/index.ts'],
        outDir: './dist/workers/ingress',
        format: ['esm'],
        sourcemap: true,
        clean: true,
    },
])