import { supabase } from './supabase';

export interface SavedItem {
  id: string;
  userId?: string;
  itemId: string;
  itemType: 'job' | 'internship' | 'company' | 'resource';
  itemData: any;
  createdAt?: string;
}

const LOCAL_STORAGE_KEY = 'interniq_saved_items';

const getLocalSavedItems = (): SavedItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalSavedItems = (items: SavedItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to update local saved items:', err);
  }
};

export class BookmarkService {
  /**
   * Fetch all saved items for a user (from Supabase + localStorage fallback)
   */
  public static async fetchSavedItems(userId?: string): Promise<SavedItem[]> {
    if (!userId) {
      return getLocalSavedItems();
    }

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Could not fetch saved items from DB, using localStorage:', error?.message);
        return getLocalSavedItems();
      }

      const dbItems: SavedItem[] = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        itemId: row.item_id,
        itemType: row.item_type,
        itemData: row.item_data || {},
        createdAt: row.created_at
      }));

      // Cache locally
      setLocalSavedItems(dbItems);
      return dbItems;
    } catch (err) {
      console.error('Error fetching saved items:', err);
      return getLocalSavedItems();
    }
  }

  /**
   * Fetch a Set of saved item IDs for quick lookup in listing pages
   */
  public static async fetchSavedItemIds(userId?: string): Promise<Set<string>> {
    const items = await this.fetchSavedItems(userId);
    return new Set(items.map(item => item.itemId));
  }

  /**
   * Toggle save/bookmark status for an item
   * Returns true if item is now saved, false if removed
   */
  public static async toggleSavedItem(
    userId: string | undefined,
    itemId: string,
    itemType: 'job' | 'internship' | 'company' | 'resource',
    itemData: any
  ): Promise<boolean> {
    const localItems = getLocalSavedItems();
    const existingIndex = localItems.findIndex(i => i.itemId === itemId && i.itemType === itemType);

    let isSavedNow = false;

    if (existingIndex >= 0) {
      // Remove locally
      localItems.splice(existingIndex, 1);
      isSavedNow = false;
    } else {
      // Add locally
      localItems.unshift({
        id: `local_${Date.now()}_${itemId}`,
        userId,
        itemId,
        itemType,
        itemData,
        createdAt: new Date().toISOString()
      });
      isSavedNow = true;
    }
    setLocalSavedItems(localItems);

    // Sync with Supabase if logged in
    if (userId) {
      try {
        if (isSavedNow) {
          const { error } = await supabase
            .from('saved_items')
            .upsert({
              user_id: userId,
              item_id: itemId,
              item_type: itemType,
              item_data: itemData
            }, { onConflict: 'user_id,item_id,item_type' });

          if (error) {
            console.error('Failed to insert saved item in Supabase:', error);
          }
        } else {
          const { error } = await supabase
            .from('saved_items')
            .delete()
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .eq('item_type', itemType);

          if (error) {
            console.error('Failed to delete saved item from Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Supabase bookmark error:', err);
      }
    }

    return isSavedNow;
  }

  /**
   * Remove a saved item explicitly
   */
  public static async removeSavedItem(
    userId: string | undefined,
    itemId: string,
    itemType: string
  ): Promise<void> {
    const localItems = getLocalSavedItems().filter(i => !(i.itemId === itemId && i.itemType === itemType));
    setLocalSavedItems(localItems);

    if (userId) {
      try {
        await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId)
          .eq('item_type', itemType);
      } catch (err) {
        console.error('Error deleting saved item from Supabase:', error);
      }
    }
  }
}
