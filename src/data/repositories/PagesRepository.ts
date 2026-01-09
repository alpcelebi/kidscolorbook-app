import { DatabaseService } from '../database/DatabaseService';
import { generateUUID } from '../../utils/uuid';
import type { Page, PageProgress, PageWithProgress } from '../../domain/entities/Page';

interface PageRow {
  id: string;
  category_id: string;
  name_key: string;
  svg_path: string;
  thumbnail_path: string | null;
  created_at: number;
  updated_at: number;
}

interface PageWithProgressRow extends PageRow {
  progress_id: string | null;
  drawing_data: string | null;
  last_modified: number | null;
  completed: number | null;
  is_favorite: number;
}

function mapRowToPage(row: PageRow): Page {
  return {
    id: row.id,
    categoryId: row.category_id,
    nameKey: row.name_key,
    svgPath: row.svg_path,
    thumbnailPath: row.thumbnail_path ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToPageWithProgress(row: PageWithProgressRow): PageWithProgress {
  const page = mapRowToPage(row);
  const progress: PageProgress | undefined = row.progress_id
    ? {
        id: row.progress_id,
        pageId: row.id,
        drawingData: row.drawing_data ?? '',
        lastModified: row.last_modified ?? 0,
        completed: row.completed === 1,
      }
    : undefined;

  return {
    ...page,
    progress,
    isFavorite: row.is_favorite === 1,
  };
}

class PagesRepositoryClass {
  async getAll(): Promise<Page[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<PageRow>('SELECT * FROM pages ORDER BY created_at ASC');
    return rows.map(mapRowToPage);
  }

  async getByCategory(categoryId: string): Promise<PageWithProgress[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<PageWithProgressRow>(
      `
      SELECT 
        p.*,
        pp.id as progress_id,
        pp.drawing_data,
        pp.last_modified,
        pp.completed,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM pages p
      LEFT JOIN page_progress pp ON pp.page_id = p.id
      LEFT JOIN favorites f ON f.page_id = p.id
      WHERE p.category_id = ?
      ORDER BY p.created_at ASC
    `,
      [categoryId]
    );
    return rows.map(mapRowToPageWithProgress);
  }

  async getById(id: string): Promise<Page | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<PageRow>('SELECT * FROM pages WHERE id = ?', [id]);
    return row ? mapRowToPage(row) : null;
  }

  async getByIdWithProgress(id: string): Promise<PageWithProgress | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<PageWithProgressRow>(
      `
      SELECT 
        p.*,
        pp.id as progress_id,
        pp.drawing_data,
        pp.last_modified,
        pp.completed,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM pages p
      LEFT JOIN page_progress pp ON pp.page_id = p.id
      LEFT JOIN favorites f ON f.page_id = p.id
      WHERE p.id = ?
    `,
      [id]
    );
    return row ? mapRowToPageWithProgress(row) : null;
  }

  async getFavorites(): Promise<PageWithProgress[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<PageWithProgressRow>(`
      SELECT 
        p.*,
        pp.id as progress_id,
        pp.drawing_data,
        pp.last_modified,
        pp.completed,
        1 as is_favorite
      FROM pages p
      INNER JOIN favorites f ON f.page_id = p.id
      LEFT JOIN page_progress pp ON pp.page_id = p.id
      ORDER BY f.created_at DESC
    `);
    return rows.map(mapRowToPageWithProgress);
  }

  async saveProgress(pageId: string, drawingData: string, completed: boolean): Promise<void> {
    const db = await DatabaseService.getDatabase();
    const now = Date.now();

    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM page_progress WHERE page_id = ?',
      [pageId]
    );

    if (existing) {
      await db.runAsync(
        `UPDATE page_progress 
         SET drawing_data = ?, last_modified = ?, completed = ?
         WHERE page_id = ?`,
        [drawingData, now, completed ? 1 : 0, pageId]
      );
    } else {
      const id = generateUUID();
      await db.runAsync(
        `INSERT INTO page_progress (id, page_id, drawing_data, last_modified, completed)
         VALUES (?, ?, ?, ?, ?)`,
        [id, pageId, drawingData, now, completed ? 1 : 0]
      );
    }
  }

  async getProgress(pageId: string): Promise<PageProgress | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      page_id: string;
      drawing_data: string;
      last_modified: number;
      completed: number;
    }>('SELECT * FROM page_progress WHERE page_id = ?', [pageId]);

    if (!row) return null;

    return {
      id: row.id,
      pageId: row.page_id,
      drawingData: row.drawing_data,
      lastModified: row.last_modified,
      completed: row.completed === 1,
    };
  }

  async clearProgress(pageId: string): Promise<void> {
    const db = await DatabaseService.getDatabase();
    await db.runAsync('DELETE FROM page_progress WHERE page_id = ?', [pageId]);
  }

  async toggleFavorite(pageId: string): Promise<boolean> {
    const db = await DatabaseService.getDatabase();

    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM favorites WHERE page_id = ?',
      [pageId]
    );

    if (existing) {
      await db.runAsync('DELETE FROM favorites WHERE page_id = ?', [pageId]);
      return false;
    } else {
      const id = generateUUID();
      await db.runAsync('INSERT INTO favorites (id, page_id, created_at) VALUES (?, ?, ?)', [
        id,
        pageId,
        Date.now(),
      ]);
      return true;
    }
  }

  async isFavorite(pageId: string): Promise<boolean> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM favorites WHERE page_id = ?',
      [pageId]
    );
    return !!row;
  }
}

export const PagesRepository = new PagesRepositoryClass();

