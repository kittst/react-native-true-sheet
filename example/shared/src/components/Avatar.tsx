import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { DARK_GRAY } from '../utils';

interface AvatarProps {
  uri: string;
  size?: number;
}

export const Avatar = ({ uri, size = 48 }: AvatarProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_GRAY,
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
