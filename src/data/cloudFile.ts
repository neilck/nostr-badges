export type CloudFile = {
  id: string;
  url: string;
};

// returns a CloudFile object if url matches app hosted image
export const urlToCloudFile = (url: string): CloudFile | undefined => {
  let uuid = "";
  let newURL: URL | undefined = undefined;
  try {
    newURL = new URL(url);
  } catch {
    return undefined;
  }

  let myHost = "";
  if (typeof window !== "undefined") {
    myHost = window.location.host;
  }
  if (newURL.host == myHost) {
    const pathname = newURL.pathname;
    const split = pathname.split("/");
    if (split.length > 0) {
      const filename = split[split.length - 1];
      uuid = filename.split("#")[0];
      return { id: uuid, url: url };
    }
  }
  return undefined;
};
