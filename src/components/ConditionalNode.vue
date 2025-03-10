<template>
  <div 
    class="conditional-node" 
    :class="{ selected }"
    @dblclick="startEditing"
  >
    <div class="node-content">
      <div class="condition-header">
        <div class="condition-icon">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 5L12 12L19 19M5 19L12 12L5 5" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="condition-label">Condition</span>
      </div>

      <div v-if="!isEditing" class="condition-expression" @click="startEditing">
        {{ data.condition || 'Double click to edit condition...' }}
      </div>
      <div v-else class="condition-editor">
        <textarea
          v-model="editedCondition"
          class="condition-input"
          placeholder="Enter condition (e.g., value > 10 && status === 'active')"
          @keyup.esc="cancelEdit"
          ref="conditionInput"
          rows="2"
        ></textarea>
        <div class="editor-actions">
          <button class="save-button" @click="saveChanges">Save</button>
          <button class="cancel-button" @click="cancelEdit">Cancel</button>
        </div>
      </div>

      <div class="path-indicators">
        <div class="path-indicator true-path">
          <span class="path-label">True</span>
          <div class="path-arrow">→</div>
        </div>
        <div class="path-indicator false-path">
          <span class="path-label">False</span>
          <div class="path-arrow">→</div>
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

    <div v-if="validationError" class="error-message">
      {{ validationError }}
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
    const validationError = ref('');

    const validateCondition = (condition) => {
      if (!condition.trim()) {
        return 'Condition cannot be empty';
      }

      try {
        // Basic syntax validation
        new Function('return ' + condition);
        return '';
      } catch (error) {
        return 'Invalid condition syntax';
      }
    };

    const startEditing = () => {
      editedCondition.value = props.data.condition || '';
      isEditing.value = true;
      validationError.value = '';
      
      setTimeout(() => {
        conditionInput.value?.focus();
      }, 0);
    };

    const saveChanges = () => {
      const error = validateCondition(editedCondition.value);
      if (error) {
        validationError.value = error;
        return;
      }

      const updatedData = {
        ...props.data,
        condition: editedCondition.value.trim()
      };
      
      emit('update:data', props.id, updatedData);
      isEditing.value = false;
      validationError.value = '';
    };

    const cancelEdit = () => {
      isEditing.value = false;
      validationError.value = '';
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
      validationError,
      startEditing,
      saveChanges,
      cancelEdit
    };
  }
};
</script>

<style lang="scss" scoped>
.conditional-node {
  background: white;
  border: 2px solid #3B82F6;
  width: 280px;
  transform: rotate(45deg);
  position: relative;
  transition: all 0.2s ease;

  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  &.selected {
    border-color: #2563EB;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }

  .node-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: rotate(-45deg);
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
  }
}

.condition-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3B82F6;
}

.condition-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-label {
  font-weight: 600;
  font-size: 14px;
}

.condition-expression {
  font-size: 13px;
  color: #374151;
  padding: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  cursor: text;
  min-height: 40px;
  word-break: break-word;
}

.condition-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;

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
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
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

.path-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.path-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4B5563;

  &.true-path {
    color: #059669;
  }

  &.false-path {
    color: #DC2626;
  }

  .path-label {
    font-weight: 500;
  }

  .path-arrow {
    font-size: 14px;
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

.error-message {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  background: #FEE2E2;
  color: #DC2626;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}
</style>
