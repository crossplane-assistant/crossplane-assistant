// Field filter is used to filter out fields from an object.
// This is useful when you want to hide some fields from the user.
// e.g. managed fields in kubernetes objects.
export class FieldsFilter {
  constructor() {}

  filterByName(item: any, name: string): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    let res = this.deepCopy(item);
    this._filterByName(res, name);
    return res;
  }

  _filterByName(obj: any, keyName: string) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // delete the key if it exists
    if (obj.hasOwnProperty(keyName)) {
      delete obj[keyName as keyof any];
    }

    for (let property in obj) {
      let value = obj[property];
      if (typeof value === 'object') {
        this._filterByName(value, keyName);
      } else if (Array.isArray(value)) {
        for (const element of value) {
          this._filterByName(element, keyName);
        }
      }
    }
  }

  // deep copy an object
  deepCopy(obj: any): any {
    let objJson = JSON.stringify(obj);
    return JSON.parse(objJson);
  }
}
