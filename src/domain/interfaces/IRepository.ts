export interface IRepository<T, CreateInput, UpdateInput> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IReadOnlyRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
}

