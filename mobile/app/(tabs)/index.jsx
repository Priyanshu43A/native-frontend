import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import styles from "../../assets/styles/home.styles.js";
import { API_URL } from "../../constants/api.js";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../lib/utils.js";
import COLORS from "../../constants/colors.js";
import Loader from "../../components/Loader.jsx";

export default function HomePage() {
  const { token } = useAuthStore();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await fetch(
        `${API_URL}/api/books?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch books");

      // setBooks((prevBooks) => [...prevBooks, ...data.books]);
      const uniqueBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(
              new Set([...books, ...data.books].map((book) => book.book_id))
            ).map((id) =>
              [...books, ...data.books].find((book) => book.book_id === id)
            );

      setBooks(uniqueBooks);

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
      // console.log(books)
    } catch (error) {
      console.error(error.message);
    } finally {
      if (refresh) {
        
        setRefreshing(false)
      }
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleMore = async () => {
    if(hasMore && !loading && !refreshing){
      // setPage(page + 1);
      await fetchBooks(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.author.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.author.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image
          source={item.image}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.ratings)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

 if(loading) return <Loader size="large" />

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleMore}
        onEndReachedThreshold={0.1}

        refreshControl={
          <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBooks(1, true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
          />
      }

        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm🐛</Text>
            <Text style={styles.headerSubTitle}>
              Discover new books to read
            </Text>
            <Text style={styles.headerSubTitle}>
             Pull down to refresh
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
              <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
      }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>
              Share your thoughts and discover new books
            </Text>
          </View>
        }
      />
    </View>
  );
}
