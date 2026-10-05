import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useRepositories } from '../viewModels/useRepositories';
import RepositoryRow from './RepositoryRow';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeView() {
  const { filteredRepos, searchText, setSearchText, loading, refreshing, refresh } =
    useRepositories();
  const navigation = useNavigation<NavProp>();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading repositories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search repos"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={filteredRepos}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyText}>
              {searchText.trim() !== ''
                ? `No repos match "${searchText}".`
                : 'No repositories to show. Pull down to refresh.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RepositoryRow
            repo={item}
            onPress={() =>
              navigation.navigate('RepoWebView', {
                url: item.html_url,
                name: item.name,
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#555' },
  search: {
    height: 40,
    margin: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyText: { marginTop: 6, color: '#555', textAlign: 'center' },
});