<template>
  <div class="http-node" :class="{ selected, 'is-loading': isLoading }">
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
      <!-- URL and Execute Section -->
      <div class="url-section">
        <div class="url-input-wrapper">
          <input 
            v-model="data.url" 
            placeholder="https://api.example.com/endpoint"
            class="url-input"
            :class="{ 'is-invalid': validationErrors.url }"
            @change="validateUrl"
          />
          <div v-if="validationErrors.url" class="validation-error">
            {{ validationErrors.url }}
          </div>
        </div>
        <button 
          class="execute-button" 
          :class="{ loading: isLoading }"
          :disabled="isLoading || !isValidUrl"
          @click="executeRequest"
        >
          <span v-if="!isLoading">Execute</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </div>

      <!-- Configuration Tabs -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
          class="tab-button"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Request Config Tab -->
        <div v-if="currentTab === 'request'" class="request-config">
          <!-- Method Selection -->
          <div class="config-section">
            <label>Method</label>
            <select v-model="data.method" @change="updateData" class="method-select">
              <option v-for="method in httpMethods" :key="method" :value="method">
                {{ method }}
              </option>
            </select>
          </div>

          <!-- Query Parameters -->
          <div class="config-section">
            <div class="section-header">
              <span>Query Parameters</span>
              <button @click="addQueryParam" class="add-button">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="params-list">
              <div v-for="(param, index) in data.queryParams" :key="index" class="param-row">
                <input 
                  v-model="param.key" 
                  placeholder="Key" 
                  @change="updateQueryParams"
                />
                <input 
                  v-model="param.value" 
                  placeholder="Value" 
                  @change="updateQueryParams"
                />
                <button @click="removeQueryParam(index)" class="remove-button">×</button>
              </div>
            </div>
          </div>

          <!-- Request Body -->
          <div v-if="['POST', 'PUT', 'PATCH'].includes(data.method)" class="config-section">
            <div class="section-header">
              <span>Request Body</span>
              <select v-model="data.bodyType" class="body-type-select">
                <option value="json">JSON</option>
                <option value="form">Form Data</option>
                <option value="raw">Raw</option>
              </select>
            </div>
            <div class="body-content">
              <textarea
                v-if="data.bodyType === 'raw' || data.bodyType === 'json'"
                v-model="data.body"
                class="body-input"
                :placeholder="data.bodyType === 'json' ? '{\n  \"key\": \"value\"\n}' : 'Raw body content'"
                @change="validateBody"
              ></textarea>
              <div v-else-if="data.bodyType === 'form'" class="form-data">
                <div v-for="(field, index) in data.formData" :key="index" class="form-field">
                  <input v-model="field.key" placeholder="Field name" />
                  <input v-model="field.value" placeholder="Value" />
                  <button @click="removeFormField(index)" class="remove-button">×</button>
                </div>
                <button @click="addFormField" class="add-form-field">
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Headers Tab -->
        <div v-if="currentTab === 'headers'" class="headers-config">
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
              <input 
                v-model="header.key" 
                placeholder="Header name" 
                @change="updateData"
              />
              <input 
                v-model="header.value" 
                placeholder="Value" 
                @change="updateData"
              />
              <button @click="removeHeader(index)" class="remove-button">×</button>
            </div>
          </div>
        </div>

        <!-- Auth Tab -->
        <div v-if="currentTab === 'auth'" class="auth-config">
          <div class="auth-type-selector">
            <select v-model="data.auth.type" @change="updateData" class="auth-select">
              <option value="none">No Auth</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
            </select>
          </div>

          <div class="auth-content">
            <div v-if="data.auth.type === 'basic'" class="auth-inputs">
              <input 
                v-model="data.auth.username" 
                placeholder="Username" 
                @change="updateData"
              />
              <input 
                v-model="data.auth.password" 
                type="password" 
                placeholder="Password" 
                @change="updateData"
              />
            </div>

            <div v-if="data.auth.type === 'bearer'" class="auth-inputs">
              <input 
                v-model="data.auth.token" 
                placeholder="Bearer Token" 
                @change="updateData"
              />
            </div>

            <div v-if="data.auth.type === 'apiKey'" class="auth-inputs">
              <input 
                v-model="data.auth.key" 
                placeholder="API Key" 
                @change="updateData"
              />
              <select v-model="data.auth.in" @change="updateData">
                <option value="header">Header</option>
                <option value="query">Query</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="currentTab === 'settings'" class="settings-config">
          <div class="setting-row">
            <label>Timeout (ms)</label>
            <input 
              type="number" 
              v-model="data.timeout" 
              min="0" 
              @change="updateData"
            />
          </div>

          <div class="setting-row">
            <label>Retry Attempts</label>
            <input 
              type="number" 
              v-model="data.retry.attempts" 
              min="0" 
              @change="updateData"
            />
          </div>

          <div class="setting-row">
            <label>Retry Delay (ms)</label>
            <input 
              type="number" 
              v-model="data.retry.delay" 
              min="0" 
              @change="updateData"
            />
          </div>

          <div class="setting-row checkbox">
            <label>
              <input 
                type="checkbox" 
                v-model="data.validateSSL" 
                @change="updateData"
              />
              <span>Validate SSL Certificate</span>
            </label>
          </div>
        </div>

        <!-- Response Tab -->
        <div v-if="currentTab === 'response'" class="response-section">
          <div v-if="lastResponse" class="response-content">
            <div class="response-header" :class="responseStatusClass">
              <div class="status-code">
                {{ lastResponse.status }} {{ getStatusText(lastResponse.status) }}
              </div>
              <div class="response-time">
                {{ lastResponse.duration }}ms
              </div>
            </div>

            <div class="response-body">
              <div class="response-tabs">
                <button 
                  v-for="tab in responseTabs" 
                  :key="tab.id"
                  :class="{ active: currentResponseTab === tab.id }"
                  @click="currentResponseTab = tab.id"
                  class="response-tab-button"
                >
                  {{ tab.label }}
                </button>
              </div>

              <div class="response-tab-content">
                <pre v-if="currentResponseTab === 'body'" class="response-data">{{ formatResponse(lastResponse.data) }}</pre>
                <div v-if="currentResponseTab === 'headers'" class="response-headers">
                  <div v-for="(value, key) in lastResponse.headers" :key="key" class="header-item">
                    <span class="header-key">{{ key }}:</span>
                    <span class="header-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="lastError" class="error-content">
            <div class="error-header">
              <svg viewBox="0 0 24 24" class="error-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>Error</span>
            </div>
            <div class="error-message">
              {{ lastError.message }}
            </div>
            <div v-if="lastError.response" class="error-details">
              Status: {{ lastError.response.status }} {{ getStatusText(lastError.response.status) }}
            </div>
          </div>

          <div v-else class="no-response">
            <svg viewBox="0 0 24 24" class="info-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>No request executed yet</span>
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
  emits: ['update:data'],
  setup(props, { emit }) {
    const isExpanded = ref(false);
    const isLoading = ref(false);
    const lastResponse = ref(null);
    const lastError = ref(null);
    const currentTab = ref('request');
    const currentResponseTab = ref('body');
    const validationErrors = ref({});
    const isValidUrl = ref(true);

    // Initialize default data if not present
    if (!props.data.method) props.data.method = 'GET';
    if (!props.data.headers) props.data.headers = [];
    if (!props.data.queryParams) props.data.queryParams = [];
    if (!props.data.auth) props.data.auth = { type: 'none' };
    if (!props.data.timeout) props.data.timeout = 5000;
    if (!props.data.retry) props.data.retry = { attempts: 3, delay: 1000 };
    if (!props.data.validateSSL) props.data.validateSSL = true;
    if (!props.data.bodyType) props.data.bodyType = 'json';
    if (!props.data.formData) props.data.formData = [];

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

    const tabs = [
      { id: 'request', label: 'Request' },
      { id: 'headers', label: 'Headers' },
      { id: 'auth', label: 'Auth' },
      { id: 'settings', label: 'Settings' },
      { id: 'response', label: 'Response' }
    ];

    const responseTabs = [
      { id: 'body', label: 'Body' },
      { id: 'headers', label: 'Headers' }
    ];

    const responseStatusClass = computed(() => {
      if (!lastResponse.value) return '';
      const status = lastResponse.value.status;
      if (status < 300) return 'success';
      if (status < 400) return 'redirect';
      if (status < 500) return 'client-error';
      return 'server-error';
    });

    const updateData = debounce(() => {
      emit('update:data', props.id, props.data);
    }, 300);

    const validateUrl = () => {
      try {
        new URL(props.data.url);
        validationErrors.value.url = '';
        isValidUrl.value = true;
      } catch (e) {
        validationErrors.value.url = 'Invalid URL format';
        isValidUrl.value = false;
      }
    };

    const validateBody = () => {
      if (props.data.bodyType === 'json' && props.data.body) {
        try {
          JSON.parse(props.data.body);
          validationErrors.value.body = '';
        } catch (e) {
          validationErrors.value.body = 'Invalid JSON format';
        }
      }
    };

    const getStatusText = (status) => {
      const statusTexts = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
      };
      return statusTexts[status] || '';
    };

    const formatResponse = (data) => {
      try {
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      } catch (e) {
        return String(data);
      }
    };

    const buildRequestConfig = () => {
      const config = {
        method: props.data.method,
        url: props.data.url,
        timeout: props.data.timeout,
        validateStatus: null,
        headers: {}
      };

      // Add headers
      props.data.headers.forEach(header => {
        if (header.key && header.value) {
          config.headers[header.key] = header.value;
        }
      });

      // Add query parameters
      if (props.data.queryParams?.length) {
        const params = new URLSearchParams();
        props.data.queryParams.forEach(param => {
          if (param.key) {
            params.append(param.key, param.value || '');
          }
        });
        config.params = params;
      }

      // Add authentication
      if (props.data.auth.type === 'basic') {
        config.auth = {
          username: props.data.auth.username,
          password: props.data.auth.password
        };
      } else if (props.data.auth.type === 'bearer') {
        config.headers['Authorization'] = `Bearer ${props.data.auth.token}`;
      } else if (props.data.auth.type === 'apiKey') {
        if (props.data.auth.in === 'header') {
          config.headers[props.data.auth.key] = props.data.auth.value;
        } else {
          const params = new URLSearchParams(config.params || {});
          params.append(props.data.auth.key, props.data.auth.value);
          config.params = params;
        }
      }

      // Add request body
      if (['POST', 'PUT', 'PATCH'].includes(props.data.method)) {
        if (props.data.bodyType === 'json') {
          try {
            config.data = JSON.parse(props.data.body || '{}');
            config.headers['Content-Type'] = 'application/json';
          } catch (e) {
            throw new Error('Invalid JSON body');
          }
        } else if (props.data.bodyType === 'form') {
          const formData = new URLSearchParams();
          props.data.formData.forEach(field => {
            if (field.key) {
              formData.append(field.key, field.value || '');
            }
          });
          config.data = formData.toString();
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          config.data = props.data.body;
        }
      }

      return config;
    };

    const executeRequest = async () => {
      isLoading.value = true;
      lastError.value = null;
      lastResponse.value = null;

      try {
        validateUrl();
        if (!isValidUrl.value) {
          throw new Error('Invalid URL');
        }

        const config = buildRequestConfig();
        const startTime = Date.now();
        
        const response = await axios(config);
        
        lastResponse.value = {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
          duration: Date.now() - startTime
        };

        currentTab.value = 'response';
      } catch (error) {
        lastError.value = {
          message: error.message,
          response: error.response,
          request: error.request
        };
        currentTab.value = 'response';
      } finally {
        isLoading.value = false;
      }
    };

    const addHeader = () => {
      props.data.headers.push({ key: '', value: '' });
      updateData();
    };

    const removeHeader = (index) => {
      props.data.headers.splice(index, 1);
      updateData();
    };

    const addQueryParam = () => {
      if (!props.data.queryParams) props.data.queryParams = [];
      props.data.queryParams.push({ key: '', value: '' });
      updateData();
    };

    const removeQueryParam = (index) => {
      props.data.queryParams.splice(index, 1);
      updateData();
    };

    const addFormField = () => {
      if (!props.data.formData) props.data.formData = [];
      props.data.formData.push({ key: '', value: '' });
      updateData();
    };

    const removeFormField = (index) => {
      props.data.formData.splice(index, 1);
      updateData();
    };

    return {
      isExpanded,
      isLoading,
      lastResponse,
      lastError,
      currentTab,
      currentResponseTab,
      validationErrors,
      isValidUrl,
      httpMethods,
      tabs,
      responseTabs,
      responseStatusClass,
      updateData,
      validateUrl,
      validateBody,
      getStatusText,
      formatResponse,
      executeRequest,
      addHeader,
      removeHeader,
      addQueryParam,
      removeQueryParam,
      addFormField,
      removeFormField
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

  &.is-loading {
    opacity: 0.8;
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
  display: flex;
  gap: 8px;

  .url-input-wrapper {
    flex-grow: 1;
    position: relative;
  }

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

    &.is-invalid {
      border-color: #EF4444;
    }
  }

  .validation-error {
    position: absolute;
    bottom: -20px;
    left: 0;
    font-size: 12px;
    color: #EF4444;
  }
}

.execute-button {
  padding: 8px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #2563EB;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading {
    position: relative;
    color: transparent;
  }
}

.loading-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.tab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  font-size: 14px;
  position: relative;

  &.active {
    color: #3B82F6;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #3B82F6;
    }
  }

  &:hover:not(.active) {
    color: #111827;
  }
}

.tab-content {
  min-height: 200px;
}

.config-section {
  margin-bottom: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #F9FAFB;
    border-bottom: 1px solid #E5E7EB;
  }
}

.params-list,
.headers-list {
  padding: 12px;
}

.param-row,
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

.response-section {
  padding: 12px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;

  &.success { background: #ECFDF5; color: #065F46; }
  &.redirect { background: #FFF7ED; color: #9A3412; }
  &.client-error { background: #FEF2F2; color: #991B1B; }
  &.server-error { background: #EFF6FF; color: #1E40AF; }
}

.response-body {
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  overflow: hidden;
}

.response-data {
  padding: 12px;
  margin: 0;
  background: #F9FAFB;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  overflow-x: auto;
}

.error-content {
  padding: 16px;
  background: #FEF2F2;
  border-radius: 6px;
  color: #991B1B;

  .error-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .error-icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
}

.no-response {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #6B7280;
  background: #F9FAFB;
  border-radius: 6px;

  .info-icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
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

    &.vue-flow__handle-
