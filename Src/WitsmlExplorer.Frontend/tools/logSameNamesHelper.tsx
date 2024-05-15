import LogObject from "models/logObject";

export const createArtificialRunNumbersForLogs = (logObjects: LogObject[]) => {
  const dictionary = Object.fromEntries(
    logObjects.map((item) => [
      item.name,
      logObjects.filter((x) => x.name === item.name)
    ])
  );

  Object.keys(dictionary).map((k) =>
    dictionary[k].length > 1
      ? dictionary[k]
          .filter((x) => x.runNumber === null)
          .sort((a, b) => a.uid.localeCompare(b.uid))
          .forEach(
            (x, sameNameIndex = 0) =>
              (x.sameNameIndex = x.name
                .concat(" [")
                .concat(
                  String.fromCharCode(++sameNameIndex + 64).toLocaleLowerCase()
                )
                .concat("]"))
          )
      : {}
  );
};
