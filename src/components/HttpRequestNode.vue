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

        <!-- Request Body -->
        <div v-if="['POST', 'PUT', 'PATCH'].includes(data.method)" class="section-container">
          <div class="section-header">
            <span>Request Body</span>
          </div>
          <div class="body-content">
            <select v-model="data.bodyType" @change="updateData" class="body-type-select">
              <option value="json">JSON</option>
              <option value="form">Form Data</option>
              <option value="raw">Raw</option>
            </select>
            <textarea
              v-model="data.body"
              :placeholder="getBodyPlaceholder()"
              class="body-input"
              @change="updateData"
            ></textarea>
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

        <!-- Test Button and Response Preview -->
        <div class="test-section">
          <button 
            @click="testRequest" 
            class="test-button"
            :class="{ loading: isLoading }"
            :disabled="isLoading || !data.url"
          >
            <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
            </svg>
            <span>{{ isLoading ? 'Testing...' : 'Test Request' }}</span>
          </button>

          <div v-if="testResponse" class="response-preview">
            <div class="response-header" :class="getStatusClass(testResponse.status)">
              <div class="status-badge">
                {{ testResponse.status }} {{ testResponse.statusText }}
              </div>
              <div class="timing-info">
                {{ formatTiming(testResponse.timing) }}
              </div>
            </div>

            <div class="response-tabs">
              <button 
                v-for="tab in ['Response', 'Headers']" 
                :key="tab"
                @click="activeTab = tab"
                :class="{ active: activeTab === tab }"
                class="tab-button"
              >
                {{ tab }}
              </button>
            </div>

            <div v-if="activeTab === 'Response'" class="response-body">
              <pre v-if="testResponse.error" class="error-message">{{ testResponse.error }}</pre>
              <vue-json-pretty
                v-else
                :data="testResponse.data"
                :deep="2"
                :show-double-quotes="true"
                :show-length="true"
                class="response-json"
              />
            </div>

            <div v-if="activeTab === 'Headers'" class="response-headers">
              <div v-for="(value, key) in testResponse.headers" :key="key" class="header-item">
                <span class="header-key">{{ key }}:</span>
                <span class="header-value">{{ value }}</span>
              </div>
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
import VueJsonPretty from 'vue-json-pretty';
import prettyBytes from 'pretty-bytes';
import prettyMs from 'pretty-ms';
import axios from 'axios';

export default {
  name: 'HttpRequestNode',
  components: {
    Handle,
    VueJsonPretty
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
    const isLoading = ref(false);
    const testResponse = ref(null);
    const activeTab = ref('Response');
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // Initialize default data if not present
    if (!props.data.method) props.data.method = 'GET';
    if (!props.data.headers) props.data.headers = [];
    if (!props.data.auth) props.data.auth = { type: 'none' };
    if (!props.data.timeout) props.data.timeout = 5000;
    if (!props.data.retry) props.data.retry = { attempts: 3, delay: 1000 };
    if (!props.data.validateSSL) props.data.validateSSL = true;
    if (!props.data.cacheResponse) props.data.cacheResponse = false;
    if (!props.data.bodyType) props.data.bodyType = 'json';
    if (!props.data.body) props.data.body = '';

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

    const getBodyPlaceholder = () => {
      switch (props.data.bodyType) {
        case 'json':
          return '{\n  "key": "value"\n}';
        case 'form':
          return 'key1=value1&key2=value2';
        case 'raw':
          return 'Enter raw request body';
        default:
          return '';
      }
    };

    const getStatusClass = (status) => {
      if (!status) return '';
      if (status < 300) return 'success';
      if (status < 400) return 'redirect';
      if (status < 500) return 'client-error';
      return 'server-error';
    };

    const formatTiming = (timing) => {
      if (!timing) return '';
      return `${prettyMs(timing.total)} · ${prettyBytes(timing.size)}`;
    };

    const buildRequestConfig = () => {
      const config = {
        url: props.data.url,
        method: props.data.method,
        timeout: props.data.timeout,
        validateStatus: null,
        headers: {},
      };

      // Add headers
      props.data.headers.forEach(header => {
        if (header.key && header.value) {
          config.headers[header.key] = header.value;
        }
      });

      // Add authentication
      switch (props.data.auth.type) {
        case 'basic':
          config.auth = {
            username: props.data.auth.username,
            password: props.data.auth.password
          };
          break;
        case 'bearer':
          config.headers['Authorization'] = `Bearer ${props.data.auth.token}`;
          break;
        case 'apiKey':
          if (props.data.auth.in === 'header') {
            config.headers['X-API-Key'] = props.data.auth.key;
          } else {
            const url = new URL(props.data.url);
            url.searchParams.append('apiKey', props.data.auth.key);
            config.url = url.toString();
          }
          break;
      }

      // Add request body
      if (['POST', 'PUT', 'PATCH'].includes(props.data.method) && props.data.body) {
        if (props.data.bodyType === 'json') {
          try {
            config.data = JSON.parse(props.data.body);
            config.headers['Content-Type'] = 'application/json';
          } catch (e) {
            throw new Error('Invalid JSON in request body');
          }
        } else if (props.data.bodyType === 'form') {
          config.data = props.data.body;
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          config.data = props.data.body;
        }
      }

      return config;
    };

    const testRequest = async () => {
      if (!props.data.url) return;

      isLoading.value = true;
      testResponse.value = null;

      try {
        const config = buildRequestConfig();
        const startTime = performance.now();
        
        const response = await axios(config);
        
        const endTime = performance.now();
        const timing = {
          total: endTime - startTime,
          size: new Blob([JSON.stringify(response.data)]).size
        };

        testResponse.value = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          timing
        };
      } catch (error) {
        testResponse.value = {
          status: error.response?.status || 0,
          statusText: error.response?.statusText || 'Error',
          headers: error.response?.headers || {},
          error: error.message,
          timing: { total: 0, size: 0 }
        };
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isExpanded,
      showAdvanced,
      isLoading,
      testResponse,
      activeTab,
      httpMethods,
      updateData,
      addHeader,
      removeHeader,
      getBodyPlaceholder,
      getStatusClass,
      formatTiming,
      testRequest
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

.body-content {
  padding: 12px;

  .body-type-select {
    width: 100%;
    margin-bottom: 8px;
    padding: 6px 10px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    font-size: 13px;
  }

  .body-input {
    width: 100%;
    min-height: 120px;
    padding: 8px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    resize: vertical;

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

.test-section {
  margin-top: 16px;
}

.test-button {
  width: 100%;
  padding: 10px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #2563EB;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.response-preview {
  margin-top: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.response-header {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;

  &.success { background: #ECFDF5; }
  &.redirect { background: #FEF3C7; }
  &.client-error { background: #FEE2E2; }
  &.server-error { background: #FEE2E2; }
}

.status-badge {
  font-weight: 500;
  font-size: 14px;
}

.timing-info {
  font-size: 12px;
  color: #6B7280;
}

.response-tabs {
  display: flex;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.tab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 13px;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  &.active {
    color: #3B82F6;
    border-bottom-color: #3B82F6;
  }

  &:hover:not(.active) {
    color: #111827;
  }
}

.response-body {
  padding: 12px;
  max-height: 300px;
  overflow: auto;
}

.error-message {
  color: #DC2626;
  margin: 0;
  font-family: monospace;
  font-size: 13px;
}

.response-headers {
  padding: 12px;
  max-height: 300px;
  overflow: auto;
}

.header-item {
  display: flex;
  margin-bottom: 4px;
  font-size: 13px;
  font-family: monospace;
}

.header-key {
  color: #374151;
  font-weight: 500;
  margin-right: 8px;
}

.header-value {
  color: #6B7280;
  word-break: break-all;
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