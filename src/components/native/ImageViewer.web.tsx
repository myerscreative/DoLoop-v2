import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  
  const img = images[imageIndex];
  if (!img) return null;

  return (
    <Modal 
        visible={visible} 
        transparent={true}
        onRequestClose={onRequestClose}
    >
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
             <TouchableOpacity 
                onPress={onRequestClose}
                style={{ position: 'absolute', top: 40, right: 40, zIndex: 100 }}
             >
                 <Ionicons name="close" size={30} color="white" />
             </TouchableOpacity>
             
             <Image 
                source={{ uri: img.uri }} 
                style={{ width: '90%', height: '80%', resizeMode: 'contain' }} 
             />

             <View style={{ position: 'absolute', bottom: 40 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{description}</Text>
             </View>
         </View>
    </Modal>
  );
};
