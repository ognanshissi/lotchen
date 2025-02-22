export class TerritoriesErrors {
  public static territoryAlreadyExist(name: string): string {
    return `Territory already exists with name: ${name}`;
  }
}
