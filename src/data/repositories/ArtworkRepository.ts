import { DatabaseService } from '../database/DatabaseService';
import { generateUUID } from '../../utils/uuid';
import type {
  Artwork,
  ArtworkCreateInput,
  ArtworkUpdateInput,
  ArtworkType,
} from '../../domain/entities/Artwork';

interface ArtworkRow {
  id: string;
  type: string;
  name: string;
  page_id: string | null;
  drawing_data: string;
  thumbnail_path: string | null;
  image_path: string | null;
  is_favorite: number;
  created_at: number;
  updated_at: number;
}

function mapRowToArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    type: row.type as ArtworkType,
    name: row.name,
    pageId: row.page_id ?? undefined,
    drawingData: row.drawing_data,
    thumbnailPath: row.thumbnail_path ?? undefined,
    imagePath: row.image_path ?? undefined,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class ArtworkRepositoryClass {
  async getAll(): Promise<Artwork[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<ArtworkRow>(
      'SELECT * FROM artworks ORDER BY updated_at DESC'
    );
    return rows.map(mapRowToArtwork);
  }

  async getByType(type: ArtworkType): Promise<Artwork[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<ArtworkRow>(
      'SELECT * FROM artworks WHERE type = ? ORDER BY updated_at DESC',
      [type]
    );
    return rows.map(mapRowToArtwork);
  }

  async getFavorites(): Promise<Artwork[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<ArtworkRow>(
      'SELECT * FROM artworks WHERE is_favorite = 1 ORDER BY updated_at DESC'
    );
    return rows.map(mapRowToArtwork);
  }

  async getById(id: string): Promise<Artwork | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<ArtworkRow>('SELECT * FROM artworks WHERE id = ?', [id]);
    return row ? mapRowToArtwork(row) : null;
  }

  async create(input: ArtworkCreateInput): Promise<Artwork> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();
    const id = generateUUID();

    await db.runAsync(
      `INSERT INTO artworks (id, type, name, page_id, drawing_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, input.type, input.name, input.pageId ?? null, input.drawingData, now, now]
    );

    const artwork = await this.getById(id);
    if (!artwork) {
      throw new Error('Failed to create artwork');
    }
    return artwork;
  }

  async update(id: string, input: ArtworkUpdateInput): Promise<Artwork | null> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = ['updated_at = ?'];
    const values: (string | number | null)[] = [now];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.drawingData !== undefined) {
      updates.push('drawing_data = ?');
      values.push(input.drawingData);
    }
    if (input.thumbnailPath !== undefined) {
      updates.push('thumbnail_path = ?');
      values.push(input.thumbnailPath);
    }
    if (input.imagePath !== undefined) {
      updates.push('image_path = ?');
      values.push(input.imagePath);
    }
    if (input.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(input.isFavorite ? 1 : 0);
    }

    values.push(id);

    await db.runAsync(`UPDATE artworks SET ${updates.join(', ')} WHERE id = ?`, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await DatabaseService.getDatabase();
    const result = await db.runAsync('DELETE FROM artworks WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async deleteAll(): Promise<void> {
    const db = await DatabaseService.getDatabase();
    await db.runAsync('DELETE FROM artworks');
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const db = await DatabaseService.getDatabase();
    const artwork = await this.getById(id);
    if (!artwork) {
      return false;
    }

    const newValue = artwork.isFavorite ? 0 : 1;
    await db.runAsync('UPDATE artworks SET is_favorite = ?, updated_at = ? WHERE id = ?', [
      newValue,
      Date.now(),
      id,
    ]);
    return newValue === 1;
  }

  async count(): Promise<number> {
    const db = await DatabaseService.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM artworks'
    );
    return result?.count ?? 0;
  }
}

export const ArtworkRepository = new ArtworkRepositoryClass();

