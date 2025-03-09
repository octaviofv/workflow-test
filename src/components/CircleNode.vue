<template>
  <div
    class="circle-node"
    :class="[`node-type-${type}`, { selected }]"
    :style="computedNodeStyle"
  >
    <!-- Label & Icon -->
    <div class="node-content">
      <div class="node-icon">
        <svg v-if="type === 'start'" viewBox="0 0 24 24" class="start-icon">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="end-icon">
          <path d="M6 6h12v12H6z" />
        </svg>
      </div>
      <span class="node-label">{{ type === 'start' ? 'Start' : 'End' }}</span>
    </div>

    <!-- Connection Handles -->
    <div class="node-handles">
      <Handle 
        v-if="type === 'start'" 
        id="source-handle" 
        type="source" 
        position="right"
        :isValidConnection="validateStartConnection"
      />
      <Handle 
        v-if="type === 'end'" 
        id="target-handle" 
        type="target" 
        position="left"
        :isValidConnection="validateEndConnection"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { Handle } from '@vue-flow/core';

export default {
  name: 'CircleNode',
  components: {
    Handle,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['start', 'end'].includes(value),
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const computedNodeStyle = computed(() => ({
      backgroundColor: props.type === 'start' ? '#4CAF50' : '#F44336',
      borderColor: props.selected ? '#2196F3' : props.type === 'start' ? '#388E3C' : '#D32F2F',
    }));

    // Validate connections for start nodes
    const validateStartConnection = ({ source, target, sourceHandle, targetHandle }) => {
      // Start node can only have outgoing connections
      return sourceHandle && !targetHandle;
    };

    // Validate connections for end nodes
    const validateEndConnection = ({ source, target, sourceHandle, targetHandle }) => {
      // End node can only have incoming connections
      return targetHandle && !sourceHandle;
    };

    return {
      computedNodeStyle,
      validateStartConnection,
      validateEndConnection,
    };
  },
};
</script>

<style lang="scss" scoped>
.circle-node {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  color: white;

  &.selected {
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5);
  }

  &.node-type-start {
    .node-icon svg {
      fill: white;
      width: 24px;
      height: 24px;
    }
  }

  &.node-type-end {
    .node-icon svg {
      fill: white;
      width: 20px;
      height: 20px;
    }
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .node-label {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    position: absolute;
    bottom: -24px;
    left: 50%;
    transform: translateX(-50%);
    color: #333;
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
      background: white;
      border: 2px solid currentColor;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.2);
        background: #e3f2fd;
      }

      &.vue-flow__handle-connecting {
        background: #2196F3;
      }

      &.vue-flow__handle-valid {
        background: #4CAF50;
      }

      &.vue-flow__handle-invalid {
        background: #F44336;
      }
    }
  }
}
</style>