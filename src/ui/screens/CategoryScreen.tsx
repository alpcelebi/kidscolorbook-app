import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { colors, spacing, typography, getCategoryColor } from '../theme';
import { PageCard, BannerAd } from '../components';
import { CategoriesRepository } from '../../data/repositories/CategoriesRepository';
import { PagesRepository } from '../../data/repositories/PagesRepository';
import type { Category } from '../../domain/entities/Category';
import type { PageWithProgress } from '../../domain/entities/Page';
import type { RootStackParamList } from '../../navigation/types';

type CategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Category'>;
type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;

export function CategoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId } = route.params;

  const [category, setCategory] = useState<Category | null>(null);
  const [pages, setPages] = useState<PageWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [categoryData, pagesData] = await Promise.all([
        CategoriesRepository.getById(categoryId),
        PagesRepository.getByCategory(categoryId),
      ]);
      setCategory(categoryData);
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load category data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when returning from coloring page
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handlePagePress = (page: PageWithProgress) => {
    navigation.navigate('ColoringPage', { pageId: page.id });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderPage = ({ item }: { item: PageWithProgress }) => (
    <PageCard page={item} onPress={() => handlePagePress(item)} />
  );

  const categoryColor = category ? getCategoryColor(category.id) : colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: categoryColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{category ? t(category.nameKey) : ''}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Pages grid */}
      <FlatList
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('common.loading')}</Text>
            </View>
          ) : null
        }
      />

      {/* Banner Ad */}
      <BannerAd />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textOnPrimary,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.textOnPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
  },
});

