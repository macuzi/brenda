import { text, group, select, confirm, isCancel } from "@clack/prompts";


const regex = /^[a-zA-Z0-9]*$/

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () => text({
      message: 'What is your foreground color?',
      // make sure 3 or 6
      // trim and to lowercase
      validate: (value) => {
        return checkColorInput(value)
      }
    }),

    background: ({ results }) => text({
      message: 'What is your background color?',
      validate: (value) => {
        if (!value) {
          return 
        }
      }
    })
  })

  console.log(colors)
}

function checkColorInput(value: any) {
   if (!value || value.length !== 3 && value.length !== 6) {
    return 'please enter a valid value'
  }
}

function normalizeHexColor(value: object): string {
  const hash = '#'
  
  const colorCode = regex.test(value) ? hash.concat(value).trim() : ''

  return colorCode
}

main()