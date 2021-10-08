import { configure } from "enzyme";
import * as ReactSeventeenAdapter from "enzyme-adapter-react-17-updated";
const adapter = ReactSeventeenAdapter as any;
configure({ adapter: new adapter.default() });
