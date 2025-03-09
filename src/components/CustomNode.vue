<template>
  <div 
    class="custom-node" 
    :class="{ selected }"
    @dblclick="startEditing"
  >
    <div class="node-header">
      <div class="node-icon">
        <div class="node-number">{{ data.number || '1' }}</div>
      </div>
      <div class="node-title" v-if="!isEditing">{{ data.label || 'Action' }}</div>
      <input
        v-else
        v-model="editedLabel"
        class="edit-input"
        @keyup.enter="saveChanges"
        @keyup.esc="cancelEdit"
        ref="labelInput"
        placeholder="Enter title"
      />
      <div class="node-type">{{ data.type || 'Custom' }}</div>
    </div>
    
    <div class="node-content">
      <div class="content-text" v-if="!isEditing">{{ data.content || '' }}</div>
      <textarea
        v-else
        v-model="editedContent"
        class="edit-textarea"
        @keyup.esc="cancelEdit"
        ref="contentTextarea"
        placeholder="Enter content"
      ></textarea>
    </div>

    <div v-if="isEditing" class="edit-actions">
      <button class="save-button" @click="saveChanges">Save</button>
      <button class="cancel-button" @click="cancelEdit">Cancel</button>
    </div>

    <div class="node-handles">
      <Handle
        v-for="handle in handles"
        :key="handle.id"
        :id="handle.id"
        :type="handle.type"
        :position="handle.position"
      />
    </div>
  </div>
</template>

<script>
import { Handle } from '@vue-flow/core';
import { ref, watch } from 'vue';

export default {
  name: 'CustomNode',
  components: {
    Handle,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:data'],
  setup(props, { emit }) {
    const handles = [
      { id: 'top', type: 'target', position: 'top' },
      { id: 'right', type: 'source', position: 'right' },
      { id: 'bottom', type: 'source', position: 'bottom' },
      { id: 'left', type: 'target', position: 'left' },
    ];

    const isEditing = ref(false);
    const editedLabel = ref('');
    const editedContent = ref('');
    const labelInput = ref(null);
    const contentTextarea = ref(null);

    const startEditing = () => {
      editedLabel.value = props.data.label || '';
      editedContent.value = props.data.content || '';
      isEditing.value = true;
      
      // Focus the label input after the next DOM update
      setTimeout(() => {
        labelInput.value?.focus();
      }, 0);
    };

    const saveChanges = () => {
      emit('update:data', {
        ...props.data,
        label: editedLabel.value,
        content: editedContent.value,
      });
      isEditing.value = false;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    // Close edit mode when clicking outside
    const handleClickOutside = (event) => {
      if (isEditing.value && !event.target.closest('.custom-node')) {
        saveChanges();
      }
    };

    watch(isEditing, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    });

    return {
      handles,
      isEditing,
      editedLabel,
      editedContent,
      labelInput,
      contentTextarea,
      startEditing,
      saveChanges,
      cancelEdit,
    };
  },
};
</script>

<style lang="scss" scoped>
.custom-node {
  min-width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  overflow: hidden;
  transition: all 0.2s ease;

  &.selected {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  gap: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3B82F6;
  border-radius: 8px;
  flex-shrink: 0;
}

.node-number {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.node-title {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  flex-grow: 1;
}

.node-type {
  font-size: 12px;
  color: #6B7280;
  padding: 4px 8px;
  background: #F3F4F6;
  border-radius: 4px;
}

.node-content {
  padding: 12px 16px;
}

.content-text {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
  white-space: pre-wrap;
}

.edit-input {
  flex-grow: 1;
  padding: 6px 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background: white;
  margin-right: 8px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

.edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  resize: vertical;
  background: white;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding: 8px 16px 16px;
  justify-content: flex-end;

  button {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &.save-button {
      background: #3B82F6;
      color: white;
      border: none;

      &:hover {
        background: #2563EB;
      }
    }

    &.cancel-button {
      background: white;
      color: #4B5563;
      border: 1px solid #D1D5DB;

      &:hover {
        background: #F3F4F6;
      }
    }
  }
}

.node-handles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;

  :deep(.vue-flow__handle) {
    width: 12px;
    height: 12px;
    background: white;
    border: 2px solid #3B82F6;
    border-radius: 50%;
    pointer-events: all;
    transition: all 0.2s ease;

    &:hover {
      background: #DBEAFE;
      transform: scale(1.2);
    }

    &.vue-flow__handle-connecting {
      background: #3B82F6;
    }

    &.vue-flow__handle-valid {
      background: #10B981;
      border-color: #059669;
    }

    &.vue-flow__handle-invalid {
      background: #EF4444;
      border-color: #DC2626;
    }
  }
}
</style>
