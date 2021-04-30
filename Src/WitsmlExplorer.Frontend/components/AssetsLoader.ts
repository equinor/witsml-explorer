export class AssetsLoader {
  static getAssetsRoot() {
    const wePath = process.env.NEXT_PUBLIC_WE_URL;
    return wePath && wePath.length > 0 ? wePath : "";
  }
}
