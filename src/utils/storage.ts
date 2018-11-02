interface Storage {
    set: any;
    get: any;
}

const storage: Storage = {
  set: () => {},
  get: null,
};

const prefix: string = "MARKOV_CHAIN";

storage.set = (key: string, value: any): void => {
  let item: any;
  if (typeof value !== "string") {
    item = JSON.stringify(value);
    debugger;
  } else {
    item = value;
  }

  localStorage.setItem(`${prefix}_${key.toUpperCase()}`, item);
};

storage.get = (key: string): any => {
  try {
      const item = localStorage.getItem(`${prefix}_${key.toUpperCase()}`);
      if (item) {
          return JSON.parse(item);
      } else return undefined;
  } catch (e) {
    return null;
  }
};

export default storage;