import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NestableDraggableFlatList, RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from '../../types/loop';
import { TaskRow } from './TaskRow';

interface TaskTreeProps {
  tasks: Task[];
  onUpdateTree: (newTree: Task[]) => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

export const TaskTree: React.FC<TaskTreeProps> = ({ tasks, onUpdateTree, onToggleTask, onEditTask }) => {
  
  const renderItem = (params: RenderItemParams<Task>) => {
    const { item } = params;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <View>
        <TaskRow 
          {...params} 
          onToggle={onToggleTask} 
          onPress={onEditTask} 
          isActive={params.isActive}
        />
        {hasChildren && (
          <View style={styles.childContainer}>
            <TaskTree 
              tasks={item.children!} 
              onUpdateTree={(newChildren) => {
                const newTree = tasks.map(t => 
                  t.id === item.id ? { ...t, children: newChildren } : t
                );
                onUpdateTree(newTree);
              }}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <NestableDraggableFlatList
      data={tasks}
      onDragEnd={({ data }) => {
        // Rebuild the tree structure with updated order_index values
        // NestableDraggableFlatList preserves children, so we just need to update order_index
        const reordered = data.map((task, index) => ({
          ...task,
          order_index: index,
          // Preserve children if they exist
          children: task.children || undefined,
        }));
        onUpdateTree(reordered);
      }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      activationDistance={8}
      dragItemOverflow={true}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  childContainer: {
    // Indentation is handled inside TaskRow via depth, 
    // but we could also do it here if we preferred.
  },
});
