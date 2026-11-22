// Packages whose code only runs in integrations or the event pipeline. Any use
// on Workers throws (see unavailable.ts).
import { UnavailableClass } from './unavailable';

export class App extends UnavailableClass {}
export class Storage extends UnavailableClass {}
export class Reader extends UnavailableClass {
  static open(): never {
    throw new Error('GeoIP files are not available on Workers; use request.cf');
  }
  static openBuffer(): never {
    throw new Error('GeoIP files are not available on Workers; use request.cf');
  }
}
export class WebServiceClient extends UnavailableClass {}
export const Open = {};
export const Parse = () => new UnavailableClass();
export default {};
