import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  emptyText?: string;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  listHeaderComponent?: React.ReactElement;
  listFooterComponent?: React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType<any>;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  emptyTextStyle?: TextStyle;
}

// Memoize the component to prevent unnecessary re-renders
function OptimizedListInner<T>({
  data,
  renderItem,
  keyExtractor,
  emptyText = 'No items to display',
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  listHeaderComponent,
  listFooterComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
  style,
  emptyTextStyle,
}: OptimizedListProps<T>) {
  // Memoize renderItem to prevent unnecessary re-renders
  const renderItemMemoized = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  // Empty component
  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, emptyTextStyle]}>{emptyText}</Text>
        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, emptyText, onRefresh, emptyTextStyle]);

  return (
    <FlatList
      data={data}
      renderItem={renderItemMemoized}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={listHeaderComponent}
      ListFooterComponent={listFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      removeClippedSubviews={true}
      initialNumToRender={10}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
        data.length === 0 && styles.emptyContentContainer,
      ]}
      style={[styles.list, style]}
    />
  );
}

// Create a memoized version to prevent unnecessary re-renders
const OptimizedList = memo(OptimizedListInner) as typeof OptimizedListInner;

// Export the component
export default OptimizedList;

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});