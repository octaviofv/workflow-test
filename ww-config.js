export default {
  backgroundColor: {
    label: { en: 'Background Color' },
    type: 'Color',
    section: 'style',
    bindable: true,
    defaultValue: '#ffffff',
    /* wwEditor:start */
    bindingValidation: {
      type: 'string',
      tooltip: 'Set the background color of the flow chart',
    },
    propertyHelp: {
      tooltip: 'Define the background color of the flow chart container',
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

  height: {
    label: { en: 'Height' },
    type: 'Length',
    section: 'settings',
    bindable: true,
    defaultValue: '500px',
    /* wwEditor:start */
    bindingValidation: {
      type: 'string',
      tooltip: 'The height of the flow chart container (e.g., "500px", "80vh")',
    },
    propertyHelp: {
      tooltip: 'Set the height of the flow chart container',
    },
    /* wwEditor:end */
  }
};
