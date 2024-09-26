import { createApp } from 'vue'
import App from './App.vue'

// Import the Vuetify plugin
import vuetify from './plugins/vuetify'  // Import the new plugin
import 'vuetify/styles'

// Mount the Vue app with Vuetify
createApp(App).use(vuetify).mount('#app')
