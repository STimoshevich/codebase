export const levelsMatrixWikiLinksMap = new Proxy<Record<string, string>>(_levelsMatrixWikiLinksMap, {
  get(target, prop: string) {
    const def = 'https://wiki.tcsbank.ru/pages/viewpage.action?pageId=759187309';

    return target[prop] ?? def;
  },
});
