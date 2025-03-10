<template>
  <div class="flowchart-container" :style="containerStyle">
    <div class="flowchart-wrapper">
      <VueFlow
        v-if="initialized"
        v-model="elements"
        :default-zoom="defaultZoom"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :fit-view-on-init="true"
        :nodes-draggable="!isEditing"
        :nodes-connectable="!isEditing"
        :elements-selectable="!isEditing"
        class="flowchart"
        @nodeClick="onNodeClick"
        @connect="onConnect"
        @paneClick="onPaneClick"
        @dragover="onDragOver"
        @drop="onDrop"
        @nodeDragStop="onNodeDragStop"
        @nodesDelete="onNodesDelete"
        @edgesDelete="onEdgesDelete"
      >
        <template #node-custom="nodeProps">
          <CustomNode v-bind="nodeProps" @update:data="onNodeDataUpdate" />
        </template>
        <template #node-comment="nodeProps">
          <CommentNode v-bind="nodeProps" @update:data="onNodeDataUpdate" />
        </template>
        <template #node-conditional="nodeProps">
          <ConditionalNode v-bind="nodeProps" @update:data="onNodeDataUpdate" />
        </template>

        <Background :pattern-color="backgroundColor" :gap="backgroundGap" />
        <Controls />
        <MiniMap v-if="showMinimap" />
        <Panel position="top-right" class="controls">
          <button @click="fitView" class="control-button">
            <span>Ajustar Vista</span>
          </button>
        </Panel>
      </VueFlow>
      <Sidebar class="flowchart-sidebar" />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  VueFlow, 
  useVueFlow,
  Background, 
  Controls, 
  MiniMap, 
  Panel 
} from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import CustomNode from './components/CustomNode.vue';
import CommentNode from './components/CommentNode.vue';
import ConditionalNode from './components/ConditionalNode.vue';
import Sidebar from './components/Sidebar.vue';

export default {
  name: 'FlowChart',
  components: {
    VueFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    CustomNode,
    CommentNode,
    ConditionalNode,
    Sidebar,
  },
  props: {
    content: {
      type: Object,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event', 'update:content'],
  setup(props, { emit }) {
    const initialized = ref(false);
    const elements = ref([]);
    const selectedNode = ref(null);

    const isEditing = computed(() => {
      /* wwEditor:start */
      return props.wwEditorState?.isEditing;
      /* wwEditor:end */
      return false;
    });

    const { 
      findNode, 
      addNodes, 
      addEdges, 
      removeNodes, 
      project,
      fitView 
    } = useVueFlow({
      defaultEdgeOptions: {
        type: 'smoothstep',
        animated: true,
      },
    });

    const containerStyle = computed(() => ({
      height: props.content?.height || '600px',
      backgroundColor: props.content?.backgroundColor || '#f5f5f5',
    }));

    const defaultZoom = computed(() => props.content?.defaultZoom || 1);
    const minZoom = computed(() => props.content?.minZoom || 0.1);
    const maxZoom = computed(() => props.content?.maxZoom || 4);
    const backgroundGap = computed(() => props.content?.backgroundGap || 20);
    const showMinimap = computed(() => props.content?.showMinimap ?? true);
    const backgroundColor = computed(() => props.content?.backgroundColor || '#f5f5f5');

    const defaultFlowData = {
      nodes: [
        {
          id: 'process-1',
          type: 'custom',
          position: { x: 200, y: 150 },
          data: {
            label: 'Proceso Principal',
            content: 'Descripción del proceso principal',
            number: '1'
          }
        },
        {
          id: 'condition-1',
          type: 'conditional',
          position: { x: 200, y: 300 },
          data: {
            condition: 'value > 10',
            label: 'Condición'
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'process-1',
          target: 'condition-1',
          type: 'smoothstep',
          animated: true
        }
      ]
    };

    const updateFlowData = () => {
      const nodes = elements.value.filter(el => !el.source);
      const edges = elements.value.filter(el => el.source);

      const flowData = {
        nodes,
        edges
      };

      const updatedContent = {
        ...props.content,
        flowData: JSON.stringify(flowData, null, 2)
      };

      emit('update:content', updatedContent);
    };

    watch(elements, () => {
      updateFlowData();
    }, { deep: true });

    onMounted(() => {
      try {
        if (props.content?.flowData) {
          const parsedData = typeof props.content.flowData === 'string' 
            ? JSON.parse(props.content.flowData) 
            : props.content.flowData;
          
          elements.value = [
            ...parsedData.nodes,
            ...parsedData.edges
          ];
        } else {
          elements.value = [
            ...defaultFlowData.nodes,
            ...defaultFlowData.edges
          ];
        }
        initialized.value = true;
        
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);
      } catch (error) {
        console.error('Error initializing flow data:', error);
        elements.value = [];
        initialized.value = true;
      }
    });

    const generateId = () => `node_${Date.now()}`;

    const onDragOver = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
      const data = JSON.parse(event.dataTransfer.getData('application/vueflow'));
      const position = project({ x: event.clientX, y: event.clientY });

      const newNode = {
        id: generateId(),
        ...data,
        position,
      };

      addNodes([newNode]);
      emit('trigger-event', { name: 'nodeAdded', event: { node: newNode } });
    };

    const onNodeClick = (event, node) => {
      selectedNode.value = node;
      emit('trigger-event', { name: 'nodeSelected', event: { node } });
    };

    const onConnect = (connection) => {
      if (connection?.source && connection?.target) {
        const newEdge = {
          id: `edge-${connection.source}-${connection.target}`,
          ...connection,
          type: 'smoothstep',
          animated: true,
        };
        
        addEdges([newEdge]);
        emit('trigger-event', { name: 'connectionCreated', event: { connection: newEdge } });
      }
    };

    const onPaneClick = () => {
      selectedNode.value = null;
      emit('trigger-event', { name: 'selectionCleared' });
    };

    const onNodeDragStop = (event, node) => {
      const updatedNode = findNode(node.id);
      if (updatedNode) {
        emit('trigger-event', { name: 'nodeMoved', event: { node: updatedNode } });
      }
    };

    const onNodesDelete = (nodes) => {
      nodes.forEach(node => {
        emit('trigger-event', { name: 'nodeDeleted', event: { nodeId: node.id } });
      });
    };

    const onEdgesDelete = (edges) => {
      edges.forEach(edge => {
        emit('trigger-event', { name: 'edgeDeleted', event: { edgeId: edge.id } });
      });
    };

    const onNodeDataUpdate = (nodeId, newData) => {
      const node = findNode(nodeId);
      if (node) {
        node.data = { ...node.data, ...newData };
        emit('trigger-event', { name: 'nodeUpdated', event: { node } });
      }
    };

    const deleteSelected = () => {
      if (selectedNode.value) {
        removeNodes([selectedNode.value.id]);
        selectedNode.value = null;
        emit('trigger-event', { name: 'nodeDeleted' });
      }
    };

    const updateNodeData = (nodeId, data) => {
      const node = findNode(nodeId);
      if (node) {
        node.data = { ...node.data, ...data };
        emit('trigger-event', { name: 'nodeUpdated', event: { node } });
      }
    };

    return {
      elements,
      initialized,
      isEditing,
      containerStyle,
      defaultZoom,
      minZoom,
      maxZoom,
      backgroundGap,
      showMinimap,
      backgroundColor,
      onNodeClick,
      onConnect,
      onPaneClick,
      deleteSelected,
      updateNodeData,
      onDragOver,
      onDrop,
      onNodeDragStop,
      onNodesDelete,
      onEdgesDelete,
      onNodeDataUpdate,
      fitView,
    };
  },
};
</script>

<style lang="scss" scoped>
.flowchart-container {
  width: 100%;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.flowchart-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.flowchart {
  flex-grow: 1;
  height: 100%;

  :deep(.vue-flow__node) {
    width: auto;
    height: auto;
  }

  :deep(.vue-flow__handle) {
    width: 8px;
    height: 8px;
    background: #2196F3;
    border: 2px solid white;
  }

  :deep(.vue-flow__edge-path) {
    stroke: #2196F3;
    stroke-width: 2;
  }
}

.flowchart-sidebar {
  flex-shrink: 0;
  height: 100%;
  border-left: 1px solid #ddd;
}

.controls {
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-button {
  padding: 6px 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2563EB;
  }
}
</style>
