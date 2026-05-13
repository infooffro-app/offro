import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const BANNER_HEIGHT = 180;
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

const getImageUrl = (path) => {
  if (!path) return '';

  if (path.startsWith('http')) {
    return path;
  }

  return `${API_URL}${path}`;
};

const BannerSlider = ({ onBannerPress }) => {
  const flatListRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const autoScrollTimerRef = useRef(null);

  // ── Fetch banners from server ──
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${API_URL}/api/dashboard/getBanner`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await response.json();
      setBanners(data.data || []);
    } catch (error) {
      console.log('Banners fetch error:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-scroll handler ──
  const startAutoScroll = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    if (banners.length === 0) return;

    autoScrollTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5,
      });
      setCurrentIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);
  };

  // ── Scroll event handler ──
  const handleScroll = (event) => {
    if (banners.length === 0) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index % banners.length);
  };

  // ── Reset auto-scroll on user interaction ──
  const handleBeginDrag = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const handleEndDrag = () => {
    startAutoScroll();
  };

  // ── Setup on mount ──
  useEffect(() => {
    fetchBanners();
  }, []);

  // ── Setup auto-scroll when banners load ──
  useEffect(() => {
    if (banners.length > 0) {
      startAutoScroll();
    }
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [currentIndex, banners.length]);

  // ── Render individual banner ──
  const renderBanner = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onBannerPress?.(item)}
      style={styles.bannerWrapper}
    >
      <Image
        source={{
          uri: getImageUrl(item.image_url),
        }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      {/* Gradient overlay */}
      <View
        style={[
          styles.bannerOverlay,
          { backgroundColor: `${item.badge_color}40` },
        ]}
      />
      {/* Content */}
      <View style={styles.bannerContent}>
        <View style={[styles.titleBadge, { backgroundColor: item.badge_color }]}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        {item.description && (
          <Text style={styles.bannerDesc} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // ── If no banners, return empty ──
  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Loading state */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#003DA5" />
        </View>
      )}

      {/* FlatList Slider */}
      {!loading && (
        <>
          <FlatList
            ref={flatListRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onBeginDrag={handleBeginDrag}
            onEndDrag={handleEndDrag}
            showsHorizontalScrollIndicator={false}
            scrollEnabled
            decelerationRate="fast"
            nestedScrollEnabled={true}
          />

          {/* Pagination Dots */}
          {banners.length > 1 && (
            <View style={styles.paginationContainer}>
              {banners.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === currentIndex
                          ? '#003DA5'
                          : 'rgba(0, 61, 165, 0.25)',
                      width: index === currentIndex ? 28 : 8,
                    },
                  ]}
                  onPress={() => {
                    if (flatListRef.current) {
                      flatListRef.current.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.5,
                      });
                      setCurrentIndex(index);
                    }
                  }}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  loadingContainer: {
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  bannerWrapper: {
    width: width - 32, // 16px margin on each side
    height: BANNER_HEIGHT,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 14,
    zIndex: 2,
  },
  titleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  bannerDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default BannerSlider;
