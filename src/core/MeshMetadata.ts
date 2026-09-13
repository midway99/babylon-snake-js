/** Минимальный объект в `mesh.metadata`: идентификатор, по которому меш можно выбрать. */
export interface MeshMetadata {
  readonly id: string;
}

export function isMeshMetadata(value: unknown): value is MeshMetadata {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "string";
}
