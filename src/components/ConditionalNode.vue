<template>
  <div 
    class="conditional-node" 
    :class="{ selected }"
    @dblclick="startEditing"
  >
    <div class="node-header">
      <div class="node-icon">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 5L12 12L19 19M5 19L12 12L5 5" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="node-title">{{ data.label || 'Condition' }}</div>
      <div class="node-type">Decision</div>
    </div>

    <div class="node-content">
      <div v-if="!isEditing" class="condition-display" @click="startEditing">
        <div class="condition-label">IF</div>
        <div class="condition-expression">
          {{ data.condition || 'Double click to edit condition...' }}
        </div>
      </div>
      <div v-else class="condition-editor">
        <textarea
          v-model="editedCondition"
          class="condition-input"
          placeholder="Enter your condition"
          @keyup.esc="cancelEdit"
          ref="conditionInput"
          rows="2"
        ></textarea>
        <div class="editor-actions">
          <button class="save-button" @click="saveChanges">Save</button>
          <button class="cancel-button" @click="cancelEdit">Cancel</button>
        </div>
      </div>

      <div class="paths-container">
        <div class="path true-path">
          <div class="path-header">
            <div class="path-icon">✓</div>
            <div class="path-label">TRUE</div>
          </div>
          <div class="path-description">Execute if condition is true</div>
        </div>
        <div class="path-divider"></div>
        <div class="path false-path">
          <div class="path-header">
            <div class="path-icon">✕</div>
            <div class="path-label">FALSE</div>
          </div>
          <div class="path-description">Execute if condition is false</div>
        </div>
      </div>
    </div>

    <div class="node-handles">
      <Handle
        type="target"
        position="left"
        id="input"
      />
      <Handle
        type="source"
        position="right"
        id="true"
        :style="{ top: '35%' }"
      />
      <Handle
        type="source"
        position="right"
        id="false"
        :style="{ top: '65%' }"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { Handle } from '@vue-flow/core';

export default {
  name: 'ConditionalNode',
  components: {
    Handle
  },
  props: {
    id: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:data'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editedCondition = ref('');
    const conditionInput = ref(null);

    const startEditing = () => {
      editedCondition.value = props.data.condition || '';
      isEditing.value = true;
      
      setTimeout(() => {
        conditionInput.value?.focus();
      }, 0);
    };

    const saveChanges = () => {
      const updatedData = {
        ...props.data,
        condition: editedCondition.value
      };
      
      emit('update:data', props.id, updatedData);
      isEditing.value = false;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    const handleClickOutside = (event) => {
      if (isEditing.value && !event.target.closest('.conditional-node')) {
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
      isEditing,
      editedCondition,
      conditionInput,
      startEditing,
      saveChanges,
      cancelEdit
    };
  }
};
</script>

<style lang="scss" scoped>
.conditional-node {
  min-width: 280px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  background: #F3F4F6;
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
  color: white;
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
  background: #F9FAFB;
  border-radius: 4px;
  border: 1px solid #E5E7EB;
}

.node-content {
  padding: 16px;
}

.condition-display {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  cursor: text;
  margin-bottom: 16px;
}

.condition-label {
  font-weight: 600;
  color: #3B82F6;
  font-size: 12px;
  padding: 2px 6px;
  background: #EFF6FF;
  border-radius: 4px;
}

.condition-expression {
  flex-grow: 1;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

.condition-editor {
  margin-bottom: 16px;
}

.condition-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
  background: #F9FAFB;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

.editor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  button {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
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

.paths-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  overflow: hidden;
}

.path {
  padding: 12px;

  &.true-path {
    background: #ECFDF5;
    border-bottom: 1px solid #D1FAE5;

    .path-icon {
      background: #059669;
    }

    .path-header {
      color: #059669;
    }
  }

  &.false-path {
    background: #FEF2F2;

    .path-icon {
      background: #DC2626;
    }

    .path-header {
      color: #DC2626;
    }
  }
}

.path-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.path-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.path-label {
  font-weight: 600;
  font-size: 12px;
}

.path-description {
  font-size: 12px;
  color: #6B7280;
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
```
