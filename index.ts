import { text, group, isCancel } from "@clack/prompts";


const regex = /^[a-zA-Z0-9]*$/

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () => text({
      message: 'What is your foreground color?',
      validate: (value) => {
        return checkColorInput(value)
      }
    }),

    background: () => text({
      message: 'What is your background color?',
      validate: (value) => {
        return checkColorInput(value)
      }
    })
  })

  // for each color map and pass color to normalize
  for (const color of Object.values(colors)) {
    normalizeHexColor(color)
    //
  } 
}

function checkColorInput(value: string | undefined) {

   if (!value || value.length !== 3 && value.length !== 6) {
    return 'please enter a valid value'
  } 

  return undefined
}

function normalizeHexColor(value: string): string {
  const hash = '#'
  
  const colorCode = regex.test(value) ? hash.concat(value).trim() : ''

   console.log(colorCode)
   return colorCode
}

main()