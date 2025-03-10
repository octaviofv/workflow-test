<template>
  <div class="http-node" :class="{ selected }">
    <div class="node-header" :class="data.method?.toLowerCase()">
      <div class="method-badge">{{ data.method || 'GET' }}</div>
      <div class="node-title">{{ data.label || 'HTTP Request' }}</div>
      <button class="expand-button" @click="toggleExpand">
        <svg viewBox="0 0 24 24" :class="{ expanded: isExpanded }">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>

    <div v-if="isExpanded" class="node-content">
      <div class="url-section">
        <input 
          v-model="data.url" 
          placeholder="https://api.example.com/endpoint"
          class="url-input"
          @change="updateData"
        />
        <button 
          class="execute-button" 
          :class="{ loading: isLoading }"
          @click="executeRequest"
        >
          <span v-if="!isLoading">Execute</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </div>

      <div class="method-section">
        <select v-model="data.method" @change="updateData" class="method-select">
          <option v-for="method in httpMethods" :key="method" :value="method">
            {{ method }}
          </option>
        </select>
      </div>

      <div v-if="lastResponse" class="response-section">
        <div class="response-header" :class="responseStatusClass">
          <div class="status">{{ lastResponse.status }}</div>
          <div class="time">{{ lastResponse.duration }}ms</div>
        </div>
        <pre class="response-body">{{ formatResponse(lastResponse.data) }}</pre>
      </div>

      <div v-if="lastError" class="error-section">
        {{ lastError.message }}
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
        id="output"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { Handle } from '@vue-flow/core';
import axios from 'axios';

export default {
  name: 'HttpRequestNode',
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
  setup(props, { emit }) {
    const isExpanded = ref(false);
    const isLoading = ref(false);
    const lastResponse = ref(null);
    const lastError = ref(null);
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // Initialize default data
    if (!props.data.method) props.data.method = 'GET';
    if (!props.data.url) props.data.url = '';

    const responseStatusClass = computed(() => {
      if (!lastResponse.value) return '';
      const status = lastResponse.value.status;
      if (status < 300) return 'success';
      if (status < 400) return 'redirect';
      if (status < 500) return 'client-error';
      return 'server-error';
    });

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
    };

    const updateData = () => {
      emit('update:data', props.id, props.data);
    };

    const formatResponse = (data) => {
      try {
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      } catch (e) {
        return String(data);
      }
    };

    const executeRequest = async () => {
      if (!props.data.url) return;
      
      isLoading.value = true;
      lastError.value = null;
      lastResponse.value = null;

      try {
        const startTime = Date.now();
        const response = await axios({
          method: props.data.method.toLowerCase(),
          url: props.data.url,
          timeout: 5000
        });
        
        lastResponse.value = {
          status: response.status,
          data: response.data,
          duration: Date.now() - startTime
        };
      } catch (error) {
        lastError.value = {
          message: error.message
        };
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isExpanded,
      isLoading,
      lastResponse,
      lastError,
      httpMethods,
      responseStatusClass,
      toggleExpand,
      updateData,
      formatResponse,
      executeRequest
    };
  }
};
</script>

<style lang="scss" scoped>
.http-node {
  background: white;
  border-radius: 8px;
  min-width: 300px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &.selected {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  gap: 8px;

  &.get { background: #EFF6FF; }
  &.post { background: #ECFDF5; }
  &.put { background: #FFF7ED; }
  &.delete { background: #FEF2F2; }
  &.patch { background: #F5F3FF; }
}

.method-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.05);
}

.node-title {
  flex-grow: 1;
  font-weight: 500;
  font-size: 14px;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s;
    
    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.node-content {
  padding: 12px;
}

.url-section {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.url-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
}

.execute-button {
  padding: 8px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #2563EB;
  }

  &.loading {
    position: relative;
    color: transparent;
  }
}

.loading-spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.method-section {
  margin-bottom: 12px;
}

.method-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
}

.response-section {
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.response-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;

  &.success { background: #ECFDF5; color: #065F46; }
  &.redirect { background: #FFF7ED; color: #9A3412; }
  &.client-error { background: #FEF2F2; color: #991B1B; }
  &.server-error { background: #EFF6FF; color: #1E40AF; }
}

.response-body {
  margin: 0;
  padding: 12px;
  background: #F9FAFB;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 200px;
}

.error-section {
  padding: 12px;
  background: #FEF2F2;
  color: #991B1B;
  border-radius: 4px;
  font-size: 14px;
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
      transform: scale(1.1);
    }
  }
}
</style>
