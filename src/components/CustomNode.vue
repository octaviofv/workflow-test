<template>
  <div 
    class="custom-node" 
    :class="{ selected }"
  >
    <div class="node-header">
      <div class="node-icon">
        <div class="node-number">{{ data.number || '1' }}</div>
      </div>
      <div class="node-title">{{ data.label || 'Action' }}</div>
      <div class="node-type">{{ data.type || 'Custom' }}</div>
    </div>
    
    <div class="node-content">
      <div class="content-text">{{ data.content || '' }}</div>
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
  setup(props) {
    const handles = [
      { id: 'top', type: 'target', position: 'top' },
      { id: 'right', type: 'source', position: 'right' },
      { id: 'bottom', type: 'source', position: 'bottom' },
      { id: 'left', type: 'target', position: 'left' },
    ];

    return {
      handles
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
