<template>
  <div 
    class="note-node" 
    :class="{ selected }"
    :style="{ backgroundColor: data.backgroundColor || '#ffffff' }"
  >
    <div class="note-content">
      <div class="node-number">{{ data.number || '1' }}</div>
      <div class="content-wrapper">
        <div class="note-title">{{ data.label || 'Question' }}</div>
        <div class="note-text">{{ data.content || '' }}</div>
      </div>
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
    isReadOnly: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['update:data'],
  setup(props, { emit }) {
    const localContent = ref(props.data.content || '');

    watch(() => props.data.content, (newContent) => {
      localContent.value = newContent || '';
    });

    const handles = [
      { id: 'top', type: 'target', position: 'top' },
      { id: 'right', type: 'source', position: 'right' },
      { id: 'bottom', type: 'source', position: 'bottom' },
      { id: 'left', type: 'target', position: 'left' },
    ];

    const updateContent = () => {
      emit('update:data', {
        ...props.data,
        content: localContent.value
      });
    };

    return {
      handles,
      localContent,
      updateContent
    };
  },
};
</script>

<style lang="scss" scoped>
.note-node {
  min-width: 280px;
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 2px solid #EAEAEA;
  overflow: hidden;
  
  &.selected {
    border-color: #0445AF;
    box-shadow: 0 4px 12px rgba(4, 69, 175, 0.1);
  }

  &:hover {
    border-color: #0445AF;
  }
}

.note-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
}

.node-number {
  width: 32px;
  height: 32px;
  background-color: #0445AF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.content-wrapper {
  flex-grow: 1;
}

.note-title {
  font-weight: 600;
  font-size: 16px;
  color: #262627;
  margin-bottom: 8px;
  line-height: 1.4;
}

.note-text {
  font-size: 14px;
  line-height: 1.5;
  color: #666666;
  white-space: pre-wrap;
  word-break: break-word;
}

.node-handles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;

  :deep(.vue-flow__handle) {
    pointer-events: all;
    width: 12px;
    height: 12px;
    background: #0445AF;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(4, 69, 175, 0.2);

    &:hover {
      transform: scale(1.2);
      background: #0056D6;
    }

    &.vue-flow__handle-top {
      top: -6px;
    }

    &.vue-flow__handle-right {
      right: -6px;
    }

    &.vue-flow__handle-bottom {
      bottom: -6px;
    }

    &.vue-flow__handle-left {
      left: -6px;
    }
  }
}
</style>
