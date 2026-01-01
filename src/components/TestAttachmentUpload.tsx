import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { uploadAttachment } from '../lib/taskHelpers';

interface TestAttachmentUploadProps {
  taskId: string;
}

export const TestAttachmentUpload: React.FC<TestAttachmentUploadProps> = ({ taskId }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleTestUpload = () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    // Create a simple test file
    const testContent = 'This is a test file for attachment upload';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([blob], 'test-attachment.txt', { type: 'text/plain' });

    console.log('Starting test upload...', { taskId, userId: user.id, fileName: testFile.name });

    setUploading(true);
    const fileForUpload = {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size,
      uri: 'test-uri'
    };
    uploadAttachment(taskId, fileForUpload, user.id)
      .then((result) => {
        console.log('Test upload successful:', result);
        Alert.alert('Success', `Attachment uploaded: ${result?.name}`);
      })
      .catch((error) => {
        console.error('Test upload failed:', error);
        Alert.alert('Error', `Upload failed: ${error.message}`);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Attachment Upload</Text>
      <Text style={styles.info}>Task ID: {taskId}</Text>
      <Text style={styles.info}>User ID: {user?.id || 'Not logged in'}</Text>
      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleTestUpload}
        disabled={uploading || !user}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : 'Test Upload'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
