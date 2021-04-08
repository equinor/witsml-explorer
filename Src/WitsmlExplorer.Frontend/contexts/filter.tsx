import Well from "../models/well";

interface Filter {
  wellName: string;
  isActive: boolean;
  objectGrowing: boolean;
  wellLimit: number;
}

export const EMPTY_FILTER: Filter = {
  wellName: "",
  isActive: false,
  objectGrowing: false,
  wellLimit: 30
};

const filterWellsOnWellName = (wells: Well[], wellNameFilter: string) => {
  if (!wellNameFilter || wellNameFilter === "") return wells;
  return wells.filter((well: Well) => well.name.toLowerCase().includes(wellNameFilter.toLowerCase()));
};

function filterOnIsActive(wells: Well[], filterOnIsActive: boolean) {
  if (!filterOnIsActive) return wells;

  wells = wells.filter((well: Well) => well.wellbores.some((wellbore) => wellbore.isActive));
  return wells.map((well) => {
    return { ...well, wellbores: [...well.wellbores.filter((wellbore) => wellbore.isActive)] };
  });
}

function filterOnObjectGrowing(wells: Well[], filterOnObjectGrowing: boolean) {
  if (!filterOnObjectGrowing) return wells;

  return wells.map((well) => {
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

function filterOnWellLimit(wells: Well[], wellLimit: number) {
  return wellLimit && wellLimit > 0 ? wells.slice(0, wellLimit) : wells;
}

export const filterWells = (wells: Well[], filter: Filter): Well[] => {
  let filteredWells: Well[] = wells;

  if (filter) {
    filteredWells = filterWellsOnWellName(filteredWells, filter.wellName);
    filteredWells = filterOnIsActive(filteredWells, filter.isActive);
    filteredWells = filterOnObjectGrowing(filteredWells, filter.objectGrowing);
    filteredWells = filterOnWellLimit(filteredWells, filter.wellLimit);
  }

  return filteredWells;
};

export default Filter;
