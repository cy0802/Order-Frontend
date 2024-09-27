import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/lib/util/colors'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors:{
            primary: colors.teal.lighten1,
            secondary: colors.teal.lighten4,
            accent: colors.red.accent2,
            background: colors.grey.lighten5, // Add a background color if needed
            surface: "#FFFFFF", // Define a surface color for cards, tabs, etc.
            error: colors.red.darken2,
            info: colors.blue.lighten1,
            success: colors.green.lighten1,
            warning: colors.amber.darken1
        }
      },
    },
  },
})

export default vuetify
