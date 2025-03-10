<template>
  <div class="comment-node" :class="{ selected }">
    <div class="node-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
        </svg>
      </div>
      <div class="node-title">{{ data.label || 'Comentario' }}</div>
      <div class="timestamp">{{ formatDate(data.timestamp) }}</div>
    </div>

    <div class="node-content">
      <textarea
        v-model="commentText"
        placeholder="Agregar comentario..."
        class="comment-textarea"
        @change="updateComment"
      ></textarea>
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
import { ref, onMounted } from 'vue';
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
    const commentText = ref('');

    onMounted(() => {
      commentText.value = props.data.content || '';
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const updateComment = () => {
      const updatedData = {
        ...props.data,
        content: commentText.value,
        timestamp: new Date().toISOString()
      };
      emit('update:data', props.id, updatedData);
    };

    return {
      commentText,
      formatDate,
      updateComment
    };
  }
};
</script>

<style lang="scss" scoped>
.comment-node {
  min-width: 300px;
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  &.selected {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #F3F4F6;
  border-bottom: 1px solid #E5E7EB;
  gap: 8px;

  .header-icon {
    color: #4B5563;
    display: flex;
    align-items: center;
  }

  .node-title {
    font-weight: 500;
    color: #374151;
    flex-grow: 1;
  }

  .timestamp {
    font-size: 12px;
    color: #6B7280;
  }
}

.node-content {
  padding: 12px;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9CA3AF;
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
