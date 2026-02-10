import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Subtask } from '../types/loop'; // Fixed path

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onAddSubtask: (description: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  editable?: boolean;
}

const SubtaskItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  editable 
}: { 
  item: Subtask; 
  onToggle: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
  editable: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderRightActions = () => (
    <RectButton
      style={styles.swipeDeleteAction}
      onPress={() => onDelete(item.id)}
    >
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </RectButton>
  );

  const content = (
    <View style={styles.subtaskItemContainer}>
      <View style={styles.subtaskRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onToggle(item.id, item.status !== 'done')}
        >
          <View
            style={[
              styles.checkboxInner,
              item.status === 'done' && styles.checkboxChecked,
            ]}
          >
            {item.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text
          style={[
            styles.subtaskText,
            item.status === 'done' && styles.subtaskTextCompleted,
          ]}
        >
          {item.description}
        </Text>
        
        {(item as any).notes && (
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.infoIcon, { color: isExpanded ? '#FFB800' : '#9CA3AF' }]}>
              ⓘ
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(item as any).notes && isExpanded && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{ (item as any).notes }</Text>
        </View>
      )}
    </View>
  );

  if (editable) {
    return (
      <Swipeable
        renderLeftActions={renderRightActions}
        overshootLeft={false}
        friction={2}
      >
        {content}
      </Swipeable>
    );
  }

  return content;
};

export default function SubtaskList({
  subtasks,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  editable = true,
}: SubtaskListProps) {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      onAddSubtask(newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  const completedCount = subtasks.filter((s) => s.status === 'done').length;
  const totalCount = subtasks.length;

  const renderSubtask = ({ item }: { item: Subtask }) => (
    <SubtaskItem
      item={item}
      onToggle={onToggleSubtask}
      onDelete={onDeleteSubtask}
      editable={editable}
    />
  );

  if (subtasks.length === 0 && !editable) {
    return null;
  }

  return (
    <View style={styles.container}>
      {subtasks.length > 0 && (
        <Text style={styles.progressText}>
          {completedCount}/{totalCount} sub-tasks
        </Text>
      )}
      <FlatList
        data={subtasks.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))}
        renderItem={renderSubtask}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
      {editable && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Add sub-task..."
            placeholderTextColor="#9CA3AF"
            value={newSubtaskText}
            onChangeText={setNewSubtaskText}
            onSubmitEditing={handleAddSubtask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newSubtaskText.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddSubtask}
            disabled={!newSubtaskText.trim()}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingLeft: 24,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  subtaskItemContainer: {
    marginBottom: 4,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoButton: {
    padding: 6,
    marginLeft: 4,
  },
  infoIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginLeft: 30,
    marginTop: 2,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#FFFBE6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notesText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  swipeDeleteAction: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeDeleteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
