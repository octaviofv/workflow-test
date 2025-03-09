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
      <!-- Request Configuration -->
      <div class="config-section">
        <div class="input-group">
          <label>URL</label>
          <input 
            v-model="data.url" 
            placeholder="https://api.example.com/endpoint"
            @change="updateData"
          />
        </div>

        <div class="input-group">
          <label>Method</label>
          <select v-model="data.method" @change="updateData">
            <option v-for="method in httpMethods" :key="method" :value="method">
              {{ method }}
            </option>
          </select>
        </div>

        <!-- Authentication -->
        <div class="auth-section">
          <label>Authentication</label>
          <select v-model="data.auth.type" @change="updateData">
            <option value="none">None</option>
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
              <option value="query">Query Parameter</option>
            </select>
          </div>
        </div>

        <!-- Headers -->
        <div class="headers-section">
          <label>Headers</label>
          <div v-for="(header, index) in data.headers" :key="index" class="header-row">
            <input v-model="header.key" placeholder="Key" @change="updateData" />
            <input v-model="header.value" placeholder="Value" @change="updateData" />
            <button @click="removeHeader(index)" class="remove-btn">×</button>
          </div>
          <button @click="addHeader" class="add-btn">+ Add Header</button>
        </div>

        <!-- Request Body -->
        <div v-if="['POST', 'PUT', 'PATCH'].includes(data.method)" class="body-section">
          <label>Request Body</label>
          <select v-model="data.bodyType" @change="updateData">
            <option value="json">JSON</option>
            <option value="formData">Form Data</option>
            <option value="raw">Raw</option>
          </select>
          
          <div v-if="data.bodyType === 'json'" class="json-editor">
            <textarea
              v-model="data.body"
              placeholder="{ }"
              @change="updateData"
            ></textarea>
          </div>

          <div v-if="data.bodyType === 'formData'" class="form-data">
            <div v-for="(param, index) in data.formData" :key="index" class="param-row">
              <input v-model="param.key" placeholder="Key" @change="updateData" />
              <input v-model="param.value" placeholder="Value" @change="updateData" />
              <button @click="removeFormParam(index)" class="remove-btn">×</button>
            </div>
            <button @click="addFormParam" class="add-btn">+ Add Parameter</button>
          </div>

          <textarea
            v-if="data.bodyType === 'raw'"
            v-model="data.rawBody"
            placeholder="Raw request body"
            @change="updateData"
          ></textarea>
        </div>

        <!-- Advanced Options -->
        <div class="advanced-section">
          <button @click="showAdvanced = !showAdvanced" class="advanced-toggle">
            Advanced Options {{ showAdvanced ? '▼' : '▶' }}
          </button>
          
          <div v-if="showAdvanced" class="advanced-options">
            <div class="input-group">
              <label>Timeout (ms)</label>
              <input type="number" v-model="data.timeout" @change="updateData" />
            </div>

            <div class="input-group">
              <label>Retry Attempts</label>
              <input type="number" v-model="data.retry.attempts" @change="updateData" />
            </div>

            <div class="input-group">
              <label>Retry Delay (ms)</label>
              <input type="number" v-model="data.retry.delay" @change="updateData" />
            </div>

            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="data.validateSSL" @change="updateData" />
                Validate SSL Certificate
              </label>
            </div>

            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="data.cacheResponse" @change="updateData" />
                Cache Response
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
        :style="handleStyle"
      />
      <Handle
        type="source"
        position="right"
        id="output"
        :style="handleStyle"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { Handle } from '@vue-flow/core';
import axios from 'axios';
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

    const handleStyle = computed(() => ({
      background: '#4CAF50',
      border: '2px solid #388E3C'
    }));

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

    const addFormParam = () => {
      if (!props.data.formData) props.data.formData = [];
      props.data.formData.push({ key: '', value: '' });
      updateData();
    };

    const removeFormParam = (index) => {
      props.data.formData.splice(index, 1);
      updateData();
    };

    return {
      isExpanded,
      showAdvanced,
      httpMethods,
      handleStyle,
      updateData,
      addHeader,
      removeHeader,
      addFormParam,
      removeFormParam
    };
  }
};
</script>

<style lang="scss" scoped>
.http-node {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  min-width: 300px;
  transition: all 0.2s ease;

  &.selected {
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  gap: 12px;

  &.get { background-color: #E3F2FD; }
  &.post { background-color: #E8F5E9; }
  &.put { background-color: #FFF3E0; }
  &.delete { background-color: #FFEBEE; }
  &.patch { background-color: #F3E5F5; }
}

.method-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.1);
}

.node-title {
  flex-grow: 1;
  font-weight: 500;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
    fill: currentColor;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.node-content {
  padding: 16px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    color: #666;
  }

  input, select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      border-color: #2196F3;
      outline: none;
    }
  }
}

.headers-section, .body-section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header-row, .param-row {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }
}

.add-btn, .remove-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
}

.remove-btn {
  color: #f44336;
}

.advanced-toggle {
  width: 100%;
  text-align: left;
  padding: 8px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
}

.advanced-options {
  margin-top: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
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
    border-radius: 50%;
    pointer-events: all;
  }
}
</style>