import Location from "./location.tsx";

export default interface ReferencePoint {
  uid: string;
  name: string;
  location: Location[];
}
