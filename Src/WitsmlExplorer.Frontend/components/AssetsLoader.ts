export class AssetsLoader {
  static getAssetsRoot(): string {
    const wePath = process.env.NEXT_PUBLIC_WITSMLEXPLORER_FRONTEND_URL;
    return wePath && wePath.length > 0 ? new URL(wePath).pathname : "";
  }
}
