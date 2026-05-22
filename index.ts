import { text, group, select, confirm, isCancel } from "@clack/prompts";


const regex = /^[a-zA-Z0-9]*$/

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () => text({
      message: 'What is your foreground color?',
      // make sure 3 or 5 
      // trim and to lowercase
      validate: (value) => {
        if (!value) return 'Please enter a valid hex color'

        if (value.length !== 3 && value.length !== 6) {
          return 'Please include a valid foreground color'
        }
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
  const hash = '#'
}

main()