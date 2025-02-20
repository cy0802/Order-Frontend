export default class Metadata {
  constructor(
    id = 0,
    name = "",
    hostname = "",
    tableNumber = 0
  ) {
    this.id = id;
    this.name = name;
    this.hostname = hostname;
    this.tableNumber = tableNumber;
  }
}