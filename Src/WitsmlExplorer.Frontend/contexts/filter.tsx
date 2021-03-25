import Well from "../models/well";

interface Filter {
  wellName: string;
  isActive: boolean;
  objectGrowing: boolean;
}

export const EMPTY_FILTER: Filter = {
  wellName: "",
  isActive: false,
  objectGrowing: false
};

export const filterWells = (wells: Well[], filter: Filter): Well[] => {
  const limit = 30;

  if (filter) {
    let filteredWells: Well[] = wells;

    if (filter.wellName) {
      filteredWells = filteredWells.filter((well: Well) => well.name.toLowerCase().includes(filter.wellName.toLowerCase()));
    }

    if (filter.isActive) {
      filteredWells = filteredWells.filter((well: Well) => well.wellbores.some((wellbore) => wellbore.isActive));
      filteredWells = filteredWells.map((well) => {
        return { ...well, wellbores: [...well.wellbores.filter((wellbore) => wellbore.isActive)] };
      });
    }

    if (filter.objectGrowing) {
      filteredWells = filteredWells.map((well) => {
        return {
          ...well,
          wellbores: [
            ...well.wellbores.map((wellbore) => {
              return {
                ...wellbore,
                logs: wellbore.logs ? [...wellbore.logs.filter((logObject) => logObject.objectGrowing)] : wellbore.logs
              };
            })
          ]
        };
      });
    }

    return filteredWells.slice(0, limit);
  }

  return wells.slice(0, limit);
};

export default Filter;
