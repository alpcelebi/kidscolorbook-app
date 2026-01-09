import { DatabaseService } from '../database/DatabaseService';
import type { Category, CategoryWithPages } from '../../domain/entities/Category';

interface CategoryRow {
  id: string;
  name_key: string;
  icon_name: string;
  display_order: number;
  created_at: number;
}

interface CategoryWithPagesRow extends CategoryRow {
  page_count: number;
  completed_count: number;
}

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    nameKey: row.name_key,
    iconName: row.icon_name,
    order: row.display_order,
    createdAt: row.created_at,
  };
}

function mapRowToCategoryWithPages(row: CategoryWithPagesRow): CategoryWithPages {
  return {
    ...mapRowToCategory(row),
    pageCount: row.page_count,
    completedCount: row.completed_count,
  };
}

class CategoriesRepositoryClass {
  async getAll(): Promise<Category[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<CategoryRow>(
      'SELECT * FROM categories ORDER BY display_order ASC'
    );
    return rows.map(mapRowToCategory);
  }

  async getAllWithPageCounts(): Promise<CategoryWithPages[]> {
    const db = await DatabaseService.getDatabase();
    const rows = await db.getAllAsync<CategoryWithPagesRow>(`
      SELECT 
        c.*,
        COUNT(p.id) as page_count,
        COUNT(pp.id) as completed_count
      FROM categories c
      LEFT JOIN pages p ON p.category_id = c.id
      LEFT JOIN page_progress pp ON pp.page_id = p.id AND pp.completed = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);
    return rows.map(mapRowToCategoryWithPages);
  }

  async getById(id: string): Promise<Category | null> {
    const db = await DatabaseService.getDatabase();
    const row = await db.getFirstAsync<CategoryRow>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return row ? mapRowToCategory(row) : null;
  }
}

export const CategoriesRepository = new CategoriesRepositoryClass();

