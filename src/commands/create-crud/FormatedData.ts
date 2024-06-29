

class FormatedData {
  static propertiesDB(columns: { Field: any; Type: any; }[]){
    // * usadas
    const interfaceWithoutId = columns.slice(1)
      .map(property => `${property.Field}: ${
        property.Type.startsWith("varchar") ? "string" 
        : property.Type.startsWith("int") ? "number" 
        : property.Type.startsWith("date") ? "Date" 
        : "sin definir"}`)
      .join("\n  ");
    
    
    // ! sin usar
    const propertiesObj = columns.map((property) => property.Field).join(', ');
    const lengthItems = columns.map(() => '?').join(', ');
    const dataItems = columns.map((property) => `data.${property.Field}`).join(', ');
    const procedureParams = columns.map((property) => `IN _${property.Field} ${property.Type.toUpperCase()},`).join("\n    ");
    const insertInto = columns.map((property) => property.Field).join(', ');
    const values = columns.map((property) => `_${property.Field}`).join(', ');
    // properties without id
    const propertiesColWithoutId = columns.slice(1).map((property) =>`${property.Field}: ${property.Type.startsWith("varchar") ? "string" : property.Type === "int" ? "number" : "string"};`).join("\n  ");
    const propertiesObjWithoutId = columns.slice(1).map((property) => property.Field).join(', ');
    const lengthItemsWithoutId = columns.slice(1).map(() => '?').join(', ');
    const dataItemsWithoutId = columns.slice(1).map((property) => `data.${property.Field}`).join(', ');
    const procedureParamsWithoutId = columns.slice(1).map((property) => `IN _${property.Field} ${property.Type.toUpperCase()},`).join("\n    ");
    const insertIntoWithoutId = columns.slice(1).map((property) => property.Field).join(', ');
    const valuesWithoutId = columns.slice(1).map((property) => `_${property.Field}`).join(', ');
    const setValuesWithoutId = columns.slice(1).map((property, index, array) => {
      if (index === array.length - 1) {
        return `${property.Field} = _${property.Field}`;
      } else {
        return `${property.Field} = _${property.Field},`;
      }
    }).join('\n            ');
    return {
      // * usadas
      interfaceWithoutId,
      // ! sin usar
      propertiesObj,
      lengthItems,
      dataItems,
      procedureParams,
      insertInto,
      values,
      // sin id
      propertiesColWithoutId,
      propertiesObjWithoutId,
      lengthItemsWithoutId,
      dataItemsWithoutId,
      procedureParamsWithoutId,
      insertIntoWithoutId,
      valuesWithoutId,
      setValuesWithoutId,
    }
  }
}

export default FormatedData;
