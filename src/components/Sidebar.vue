<template>
  <div class="sidebar">
    <h3 class="sidebar-title">Elementos</h3>
    <div class="node-list">
      <div
        class="draggable-node"
        draggable="true"
        @dragstart="onDragStart($event, 'custom', 'statement')"
      >
        <div class="preview-node">
          <div class="preview-number">S</div>
          <div class="preview-content">
            <span>Simple</span>
          </div>
        </div>
      </div>

      <div
        class="draggable-node"
        draggable="true"
        @dragstart="onDragStart($event, 'http-request', 'request')"
      >
        <div class="preview-node">
          <div class="preview-number">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: white;">
              <path d="M17 16.44v3.25c0 .41-.34.75-.75.75h-8.5c-.41 0-.75-.34-.75-.75v-3.25c0-.41.34-.75.75-.75h8.5c.41 0 .75.34.75.75zm0-8.44v3.25c0 .41-.34.75-.75.75h-8.5c-.41 0-.75-.34-.75-.75V8c0-.41.34-.75.75-.75h8.5c.41 0 .75.34.75.75zm2-3.75H5c-.55 0-1 .45-1 1v13.5c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V5.25c0-.55-.45-1-1-1z"/>
            </svg>
          </div>
          <div class="preview-content">
            <span>HTTP Request</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  setup() {
    const onDragStart = (event, nodeType, variant) => {
      let nodeData = {
        type: nodeType,
        data: {}
      };

      if (nodeType === 'custom') {
        nodeData.data = {
          label: variant === 'question' ? 'Nueva Pregunta' : 'Nueva Declaración',
          content: '',
          number: variant === 'question' ? 'Q' : 'S',
          backgroundColor: variant === 'question' ? '#ffffff' : '#f8f9fa',
        };
      } else if (nodeType === 'http-request') {
        nodeData.data = {
          label: 'HTTP Request',
          method: 'GET',
          url: '',
          headers: [],
          auth: { type: 'none' },
          timeout: 5000,
          retry: { attempts: 3, delay: 1000 },
          validateSSL: true,
          cacheResponse: false
        };
      }

      event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeData));
      event.dataTransfer.effectAllowed = 'move';
    };

    return {
      onDragStart
    };
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  width: 280px;
  background: #ffffff;
  border-left: 1px solid #eaeaea;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #262627;
  margin-bottom: 20px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.draggable-node {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.preview-node {
  padding: 12px;
  background: #ffffff;
  border: 2px solid #eaeaea;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0445AF;
    background: #f8f9fa;
  }
}

.preview-number {
  width: 28px;
  height: 28px;
  background-color: #0445AF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.preview-content {
  font-size: 14px;
  color: #262627;
  font-weight: 500;
}
</style>
