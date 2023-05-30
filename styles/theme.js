import { extendTheme } from "@chakra-ui/react";
import "@fontsource/roboto-mono"

const fonts = {
    heading: 'Roboto Mono',
    body: 'Roboto Mono',
    mono: 'Roboto Mono'
}

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false
}

const theme = extendTheme({
    config,
    fonts, 
    fontWeights: {
        normal: 300,
        bold: 500
    },
    styles: {
        global: (props) => ({
          body: {
            bg: props.colorMode === "dark" ? "black" : "black",
          },
        }),
    },
})

export default theme