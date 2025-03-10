<template>
  <div 
    class="comment-node" 
    :class="{ selected, editing: isEditing }"
    @dblclick="startEditing"
  >
    <div class="node-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
        </svg>
      </div>
      <div class="node-title" v-if="!isEditing">{{ data.label || 'Comentario' }}</div>
      <input
        v-else
        v-model="editedLabel"
        class="edit-input"
        @keyup.enter="saveChanges"
        @keyup.esc="cancelEdit"
        ref="labelInput"
        placeholder="Título del comentario"
      />
      <div class="timestamp">{{ formatDate(data.timestamp) }}</div>
    </div>

    <div class="node-content">
      <div v-if="!isEditing" class="content-text" @dblclick="startEditing">
        {{ data.content || 'Doble clic para editar...' }}
      </div>
      <textarea
        v-else
        v-model="editedContent"
        class="comment-textarea"
        @keyup.esc="cancelEdit"
        ref="contentTextarea"
        placeholder="Escribe tu comentario aquí..."
      ></textarea>
    </div>

    <div v-if="isEditing" class="edit-actions">
      <button class="save-button" @click="saveChanges">Guardar</button>
      <button class="cancel-button" @click="cancelEdit">Cancelar</button>
    </div>

    <div class="node-handles">
      <Handle
        type="target"
        position="left"
        id="target"
      />
      <Handle
        type="source"
        position="right"
        id="source"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { Handle } from '@vue-flow/core';

export default {
  name: 'CommentNode',
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
    const editedLabel = ref('');
    const editedContent = ref('');
    const labelInput = ref(null);
    const contentTextarea = ref(null);

    const startEditing = () => {
      editedLabel.value = props.data.label || '';
      editedContent.value = props.data.content || '';
      isEditing.value = true;
      
      setTimeout(() => {
        labelInput.value?.focus();
      }, 0);
    };

    const validateInput = () => {
      if (!editedLabel.value.trim()) {
        return { isValid: false, message: 'El título no puede estar vacío' };
      }
      if (!editedContent.value.trim()) {
        return { isValid: false, message: 'El comentario no puede estar vacío' };
      }
      return { isValid: true };
    };

    const saveChanges = () => {
      const validation = validateInput();
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      const updatedData = {
        ...props.data,
        label: editedLabel.value.trim(),
        content: editedContent.value.trim(),
        timestamp: new Date().toISOString()
      };
      
      emit('update:data', props.id, updatedData);
      isEditing.value = false;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const handleClickOutside = (event) => {
      if (isEditing.value && !event.target.closest('.comment-node')) {
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
      editedLabel,
      editedContent,
      labelInput,
      contentTextarea,
      startEditing,
      saveChanges,
      cancelEdit,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.comment-node {
  min-width: 300px;
  background: #FFFBE6;
  border-radius: 8px;
  border: 1px solid #FFE58F;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;

  &.selected {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &.editing {
    border-color: #3B82F6;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #FFF1B8;
  border-bottom: 1px solid #FFE58F;
  gap: 8px;

  .header-icon {
    color: #D48806;
    display: flex;
    align-items: center;
  }

  .node-title {
    font-weight: 500;
    color: #262626;
    flex-grow: 1;
  }

  .timestamp {
    font-size: 12px;
    color: #595959;
  }
}

.edit-input {
  flex-grow: 1;
  padding: 6px 8px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  margin-right: 8px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

.node-content {
  padding: 12px;
}

.content-text {
  font-size: 14px;
  line-height: 1.5;
  color: #262626;
  white-space: pre-wrap;
  cursor: text;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  background: white;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #8C8C8C;
  }
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  justify-content: flex-end;

  button {
    padding: 6px 12px;
    border-radius: 4px;
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
      color: #262626;
      border: 1px solid #D9D9D9;

      &:hover {
        background: #F5F5F5;
        border-color: #BFBFBF;
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
