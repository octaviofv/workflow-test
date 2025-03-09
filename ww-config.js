export default {
  editor: {
    label: {
      en: 'Flow Chart',
    },
    icon: 'workflow',
  },
  properties: {
    flowData: {
      label: { en: 'Flow Data' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: JSON.stringify({
        nodes: [
          {
            id: 'node-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: {
              label: 'Important Note',
              content: 'Write your notes here...',
              backgroundColor: '#fff9c4',
              headerColor: '#f57f17',
            },
          },
          {
            id: 'node-2',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: {
              label: 'Todo List',
              content: '- First task\n- Second task\n- Third task',
              backgroundColor: '#e3f2fd',
              headerColor: '#1976d2',
            },
          },
          {
            id: 'node-3',
            type: 'custom',
            position: { x: 100, y: 200 },
            data: {
              label: 'Reminder',
              content: 'Don\'t forget the meeting at 3 PM',
              backgroundColor: '#f3e5f5',
              headerColor: '#7b1fa2',
            },
          },          
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'smoothstep',
            animated: true,
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
            type: 'smoothstep',
            animated: true,
          },          
        ],
      }),
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'A JSON string containing nodes and edges data for the flow chart',
      },
      propertyHelp: {
        tooltip: 'The flow chart structure defined as a JSON string with nodes and their connections',
      },
      /* wwEditor:end */
    },
    height: {
      label: { en: 'Height' },
      type: 'Length',
      section: 'settings',
      bindable: true,
      defaultValue: '500px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'The height of the flow chart container (e.g., "500px", "100%")',
      },
      propertyHelp: {
        tooltip: 'Set the height of the flow chart container',
      },
      /* wwEditor:end */
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f5f5f5',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'The background color of the flow chart container',
      },
      propertyHelp: {
        tooltip: 'Set the background color of the flow chart container',
      },
      /* wwEditor:end */
    },
    defaultZoom: {
      label: { en: 'Default Zoom' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 1,
      options: {
        min: 0.1,
        max: 4,
        step: 0.1,
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'The default zoom level (between 0.1 and 4)',
      },
      propertyHelp: {
        tooltip: 'Set the initial zoom level of the flow chart',
      },
      /* wwEditor:end */
    },
    minZoom: {
      label: { en: 'Min Zoom' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 0.1,
      options: {
        min: 0.1,
        max: 1,
        step: 0.1,
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'The minimum allowed zoom level (between 0.1 and 1)',
      },
      propertyHelp: {
        tooltip: 'Set the minimum zoom level allowed',
      },
      /* wwEditor:end */
    },
    maxZoom: {
      label: { en: 'Max Zoom' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 4,
      options: {
        min: 1,
        max: 10,
        step: 0.1,
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'The maximum allowed zoom level (between 1 and 10)',
      },
      propertyHelp: {
        tooltip: 'Set the maximum zoom level allowed',
      },
      /* wwEditor:end */
    },
    backgroundGap: {
      label: { en: 'Background Grid Gap' },
      type: 'Number',
      section: 'style',
      bindable: true,
      defaultValue: 20,
      options: {
        min: 10,
        max: 100,
        step: 5,
      },
      /* test */
    width: {
      label: { en: 'Width' },
      type: 'Length',
      section: 'settings',
      bindable: true,
      defaultValue: '100%',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'The width of the flow chart container (e.g., "100%", "500px")',
      },
      propertyHelp: {
        tooltip: 'Set the width of the flow chart container',
      },
      /* wwEditor:end */
    },
      /* fintest * /
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'The gap between background grid lines (in pixels)',
      },
      propertyHelp: {
        tooltip: 'Set the spacing between background grid lines',
      },
      /* wwEditor:end */
    },
    showMinimap: {
      label: { en: 'Show Minimap' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Toggle the minimap visibility',
      },
      propertyHelp: {
        tooltip: 'Show or hide the minimap overview',
      },
      /* wwEditor:end */
    },
  },
  triggerEvents: [
    {
      name: 'nodeAdded',
      label: { en: 'On Node Added' },
      event: { node: null },
    },
    {
      name: 'nodeSelected',
      label: { en: 'On Node Selected' },
      event: { node: null },
    },
    {
      name: 'nodeDeleted',
      label: { en: 'On Node Deleted' },
      event: {},
    },
    {
      name: 'nodeUpdated',
      label: { en: 'On Node Updated' },
      event: { node: null },
    },
    {
      name: 'connectionCreated',
      label: { en: 'On Connection Created' },
      event: { connection: null },
    },
    {
      name: 'selectionCleared',
      label: { en: 'On Selection Cleared' },
      event: {},
    },
  ],
  actions: [
    {
      name: 'addNode',
      label: { en: 'Add Node' },
    },
    {
      name: 'deleteSelected',
      label: { en: 'Delete Selected' },
    },
    {
      name: 'updateNodeData',
      label: { en: 'Update Node Data' },
      args: [
        {
          name: 'nodeId',
          type: 'string',
          label: { en: 'Node ID' },
        },
        {
          name: 'data',
          type: 'object',
          label: { en: 'Node Data' },
        },
      ],
    },
  ],
};
