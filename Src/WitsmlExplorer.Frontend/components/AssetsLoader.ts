export class AssetsLoader {
  static getAssetsRoot(): string {
    const wePath = process.env.WITSMLEXPLORER_FRONTEND_URL;
    return wePath && wePath.length > 0 ? wePath : "";
  }
}
