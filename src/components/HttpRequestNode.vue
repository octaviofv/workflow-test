<template>
  <div class="http-node" :class="{ selected }">
    <div class="node-header" :class="data.method?.toLowerCase()">
      <div class="method-badge">{{ data.method || 'GET' }}</div>
      <div class="node-title">{{ data.label || 'HTTP Request' }}</div>
      <button class="expand-button" @click="isExpanded = !isExpanded">
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
      </div>

      <div class="config-section">
        <!-- Method Selection -->
        <div class="method-section">
          <select v-model="data.method" @change="updateData" class="method-select">
            <option v-for="method in httpMethods" :key="method" :value="method">
              {{ method }}
            </option>
          </select>
        </div>

        <!-- Headers Section -->
        <div class="section-container">
          <div class="section-header">
            <span>Headers</span>
            <button @click="addHeader" class="add-button">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div class="headers-list">
            <div v-for="(header, index) in data.headers" :key="index" class="header-row">
              <input v-model="header.key" placeholder="Key" @change="updateData" />
              <input v-model="header.value" placeholder="Value" @change="updateData" />
              <button @click="removeHeader(index)" class="remove-button">×</button>
            </div>
          </div>
        </div>

        <!-- Authentication Section -->
        <div class="section-container">
          <div class="section-header">
            <span>Authentication</span>
          </div>
          <div class="auth-content">
            <select v-model="data.auth.type" @change="updateData" class="auth-select">
              <option value="none">No Auth</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
            </select>

            <div v-if="data.auth.type === 'basic'" class="auth-inputs">
              <input v-model="data.auth.username" placeholder="Username" @change="updateData" />
              <input v-model="data.auth.password" type="password" placeholder="Password" @change="updateData" />
            </div>

            <div v-if="data.auth.type === 'bearer'" class="auth-inputs">
              <input v-model="data.auth.token" placeholder="Bearer Token" @change="updateData" />
            </div>

            <div v-if="data.auth.type === 'apiKey'" class="auth-inputs">
              <input v-model="data.auth.key" placeholder="API Key" @change="updateData" />
              <select v-model="data.auth.in" @change="updateData">
                <option value="header">Header</option>
                <option value="query">Query</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="section-container">
          <button @click="showAdvanced = !showAdvanced" class="advanced-toggle">
            <span>Advanced Options</span>
            <svg viewBox="0 0 24 24" width="16" height="16" :class="{ expanded: showAdvanced }">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>
          
          <div v-if="showAdvanced" class="advanced-options">
            <div class="option-row">
              <label>Timeout (ms)</label>
              <input type="number" v-model="data.timeout" @change="updateData" />
            </div>

            <div class="option-row">
              <label>Retry Attempts</label>
              <input type="number" v-model="data.retry.attempts" @change="updateData" />
            </div>

            <div class="option-row">
              <label>Retry Delay (ms)</label>
              <input type="number" v-model="data.retry.delay" @change="updateData" />
            </div>

            <div class="checkbox-row">
              <label>
                <input type="checkbox" v-model="data.validateSSL" @change="updateData" />
                <span>Validate SSL Certificate</span>
              </label>
            </div>

            <div class="checkbox-row">
              <label>
                <input type="checkbox" v-model="data.cacheResponse" @change="updateData" />
                <span>Cache Response</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Node Handles -->
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
import { ref } from 'vue';
import { Handle } from '@vue-flow/core';
import { debounce } from 'lodash';

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
    const showAdvanced = ref(false);
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // Initialize default data if not present
    if (!props.data.method) props.data.method = 'GET';
    if (!props.data.headers) props.data.headers = [];
    if (!props.data.auth) props.data.auth = { type: 'none' };
    if (!props.data.timeout) props.data.timeout = 5000;
    if (!props.data.retry) props.data.retry = { attempts: 3, delay: 1000 };
    if (!props.data.validateSSL) props.data.validateSSL = true;
    if (!props.data.cacheResponse) props.data.cacheResponse = false;

    const updateData = debounce(() => {
      emit('update:data', props.data);
    }, 300);

    const addHeader = () => {
      props.data.headers.push({ key: '', value: '' });
      updateData();
    };

    const removeHeader = (index) => {
      props.data.headers.splice(index, 1);
      updateData();
    };

    return {
      isExpanded,
      showAdvanced,
      httpMethods,
      updateData,
      addHeader,
      removeHeader
    };
  }
};
</script>

<style lang="scss" scoped>
.http-node {
  background: white;
  border-radius: 12px;
  min-width: 320px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  border-radius: 12px 12px 0 0;

  &.get { background: #EFF6FF; }
  &.post { background: #ECFDF5; }
  &.put { background: #FFF7ED; }
  &.delete { background: #FEF2F2; }
  &.patch { background: #F5F3FF; }
}

.method-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.05);
}

.node-title {
  flex-grow: 1;
  font-weight: 500;
  color: #111827;
  font-size: 14px;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6B7280;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &:hover {
    color: #111827;
  }
}

.node-content {
  padding: 16px;
}

.url-section {
  margin-bottom: 16px;

  .url-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;

    &:focus {
      outline: none;
      border-color: #3B82F6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-container {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  font-weight: 500;
  color: #374151;
}

.add-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6B7280;

  &:hover {
    color: #111827;
  }
}

.headers-list {
  padding: 12px;
}

.header-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #3B82F6;
    }
  }
}

.remove-button {
  background: none;
  border: none;
  color: #EF4444;
  cursor: pointer;
  font-size: 18px;
  padding: 0 4px;

  &:hover {
    color: #DC2626;
  }
}

.auth-content {
  padding: 12px;
}

.auth-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
}

.auth-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;

  input, select {
    padding: 6px 10px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #3B82F6;
    }
  }
}

.advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #F9FAFB;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #374151;

  svg {
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &:hover {
    background: #F3F4F6;
  }
}

.advanced-options {
  padding: 12px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  label {
    font-size: 13px;
    color: #374151;
  }

  input {
    width: 120px;
    padding: 6px 10px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #3B82F6;
    }
  }
}

.checkbox-row {
  margin-bottom: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    cursor: pointer;

    &:checked {
      background-color: #3B82F6;
      border-color: #3B82F6;
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
