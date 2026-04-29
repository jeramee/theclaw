declare module "tokenjuice/theclaw" {
  type TheClawPiRuntime = {
    on(event: string, handler: (event: unknown, ctx: { cwd: string }) => unknown): void;
  };

  export function createTokenjuiceTheClawEmbeddedExtension(): (pi: TheClawPiRuntime) => void;
}
