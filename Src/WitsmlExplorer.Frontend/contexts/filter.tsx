import Well from "../models/well";

interface filter {
  wellName: string;
  isActive: boolean;
  objectGrowing: boolean;
}

export const EMPTY_FILTER: filter = {
  wellName: "",
  isActive: false,
  objectGrowing: false
};

export const filterWells = (wells: Well[], filter: filter): Well[] => {
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

    return filteredWells.slice(0, limit);
  }

  return wells.slice(0, limit);
};

export default filter;
