import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';

interface ImageViewerProps {
  images: { uri: string }[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  description?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  imageIndex,
  visible,
  onRequestClose,
  description
}) => {
  if (!visible) return null;

  return (
    <ImageViewing
      images={images}
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onRequestClose}
      FooterComponent={() => (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
             {description || 'Task Image'}
          </Text>
        </View>
      )}
      HeaderComponent={() => (
        <View style={styles.header}>
            <TouchableOpacity 
                onPress={onRequestClose}
                style={styles.closeButton}
            >
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
