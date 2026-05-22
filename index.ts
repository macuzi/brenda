import { text, group, select, confirm, isCancel } from "@clack/prompts";


const regex = /^[a-zA-Z0-9]*$/

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () => text({
      message: 'What is your foreground color?',
      // trim and to lowercase
      validate: (value) => {
        return checkColorInput(value)
      }
    }),

    background: ({ results }) => text({
      message: 'What is your background color?',
      validate: (value) => {
        if (value !== undefined && results.foreground) {
          return checkColorInput(value)
        }
      }
    })
  })

  // for each color map and pass color to normalize
  for (const color of Object.values(colors)) {
    normalizeHexColor(color)
  }
}

function checkColorInput(value: string) {
   if (!value || value.length !== 3 && value.length !== 6) {
    return 'please enter a valid value'
  }
}

function normalizeHexColor(value: string): string {
  const hash = '#'
  
  const colorCode = regex.test(value) ? hash.concat(value).trim() : ''

   console.log(colorCode)
   return colorCode
}

main()